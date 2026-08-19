/**
 * @domain Engine / Hydration
 * @SSoT docs/data/schemas/abilities/schema.md
 *
 * El motor de habilidades — dos verbos, `getModifiers` (MUTA-STATE) y `getEmissions`
 * (EMITE-INSTANCIA, `arch-decisions §15`). Lee `ability-stats.override.json` (clave =
 * `uniqueName` de la ability); `getModifiers` toma cada stat con `upgrade_type`
 * poblado (**proyección estática del source-state**: un buff sin duración →
 * source-state = la entity estática de C1 → el modifier bakeado); `getEmissions` toma
 * los que declaran daño sin `upgrade_type` — ver su propio docblock.
 *
 * Cross-entity (Fase 1a, `getModifiers`): el modifier escala leyendo un atributo del
 * WARFRAME (`source_entity`/`source_attribute`, arista del grafo) y aterriza en un
 * pool del ARMA (`target_entity`/`target_attribute`). Roar = 50% × Ability Strength →
 * pool de facción del arma (`GAMEPLAY_MULT_FACTION_DAMAGE`, bono INCONDICIONAL
 * §15/§16). NO pasa por `ModRepository` → esquiva el shim `C2F_FACTION_TOKENS_DEFERRED`
 * (Roar no gatea por facción del target — `references/wiki/warframes/rhino/roar.md`).
 *
 * ⚠️ El valor de habilidad es porcentaje CRUDO (50 = +50%), no un multiplicador
 * (1.50) → NO se aplica `toPercent` (a diferencia de ArcaneRepository).
 *
 * Los dos verbos comparten firma (`abilityId, sourceId, entities`) y el mismo mecanismo
 * de lectura cross-entidad del grafo — F3 (`.working/refactor-engine-2-recomposicion.md`)
 * cerró la asimetría que tenían: sub-source (exaltadas, `OQ-ENGINE-11`) sigue sin construir.
 */
import { makeModifier, type Modifier, type EntityId, type SimulationEntity } from "../../contracts";
import { resolveUpgradeEntry } from "@shared/types/modifier";
import { resolveChannelEntities, resolveFamilyEntities } from "./channel-routing";
import { makeInstance, type DamageInstance } from "../../simulate/combat/damage-instance";
import { resolveDamageTypeTag } from "@shared/types";
import { hasAbilityCritException, calculateGyreCrit } from "../../formulas/ability/ability-crit";
import { emitterLawDeviations } from "../../contracts/law-params";
import { ABILITY_ELIGIBLE_POOLS, isCombinedDamageToken } from "../../contracts/damage-logic";
import { globalDamageBucketFactor } from "../../formulas/weapon/stat-accumulator";

// Puente vocabulario-de-carta → nodo del grafo para el eje de scaling (`upgrade_by`).
// La carta de habilidad expresa "escala con Ability Strength" como el token D-3
// `AVATAR_ABILITY_STRENGTH`; el nodo del grafo es el D-6 `AVATAR_ADD_ABILITY_STRENGTH`.
// `resolveToken()` NO deriva este hop (el token de carta no tiene segmento OP) → mapa
// explícito del set cerrado de ejes. Vive acá (no en `resolveToken`) porque es
// vocabulario del consumidor de habilidad, no del engine — hermano de `UPGRADE_BY_ALIASES`
// en el parser. `semantic/upgrade-tokens.md` lo documenta como alias de entrada.
const ABILITY_SCALE_NODE: Record<string, string> = {
  AVATAR_ABILITY_STRENGTH: 'AVATAR_ADD_ABILITY_STRENGTH',
  AVATAR_ABILITY_RANGE:    'AVATAR_ADD_ABILITY_RANGE',
  AVATAR_ABILITY_DURATION: 'AVATAR_ADD_ABILITY_DURATION',
};

/**
 * El factor `final/base` de `AVATAR_ADD_ABILITY_STRENGTH` en `sourceId` — 1 si la entidad no existe
 * o no lleva el nodo (sin buff de strength). Misma fórmula que `SimulationEngine.resolveNode` aplica
 * para todo `Modifier` con `source_attribute`; única implementación — la comparten `getEmissions`
 * (para escalar el daño) y el CLI oracle (para mostrarlo). Antes vivía duplicada en las dos puntas
 * (F3, `.working/refactor-engine-2-recomposicion.md`): esto es exactamente el bug que esa duplicación
 * arriesgaba — dos lugares que pueden divergir en silencio si la fórmula cambia en uno solo.
 */
export function resolveAbilityStrength(sourceId: EntityId, entities: SimulationEntity[]): number {
  const node = entities.find(e => e.id === sourceId)?.attributes['AVATAR_ADD_ABILITY_STRENGTH'];
  return node ? node.final / (node.base || 1) : 1;
}

type AbilityStatRaw = {
  label?: string;
  base_value?: number | number[];
  upgrade_by?: string;
  /** Uno o varios nodos destino: un renglón de la UI del juego puede cubrir N stats. */
  upgrade_type?: string | string[];
};

/**
 * Normaliza el valor de la carta a **porcentaje aditivo crudo** (el `50` de Roar = +50%).
 *
 * POR QUÉ EXISTE. La UI del juego expresa el MISMO tipo de bonus en dos unidades según la
 * habilidad, y el `.md` de `game-ui/` captura la pantalla literal — es su razón de ser, así que la
 * divergencia entra al dato y hay que resolverla acá, no falseando la captura:
 *
 *     "Reload Speed: |val1|%"      base_value 25    → +25%   (ya es porcentaje)
 *     "Speed Multiplier: |val1|x"  base_value 1.75  → +75%   (es multiplicador)
 *
 * Sin esta conversión, `1.75` entraría como **+1.75%** — un valor plausible, silencioso y
 * completamente falso. La unidad la declara el sufijo del placeholder en el label, que el parser
 * ya conserva estructurado; no hay otro campo que la lleve.
 *
 * ⚠️ Si algún día el label deja de ser fiel a la unidad del dato, esto se rompe en silencio. El
 * tripwire es `volt.test.ts` (Speed: 75% desde 1,75x). Contexto: `wiki/mechanics/movement-speed.md`.
 */
function toAdditivePercent(raw: number, label: string | undefined): number {
  return /\|val\d+\|\s*x/i.test(label ?? '') ? (raw - 1) * 100 : raw;
}
// Tipo más angosto que el contrato real (`@shared/types/ability.ts` declara además
// `id`/`label`/`default_active`/`exclusive`) — deliberado: ninguno de los dos verbos gatea por grupo
// hoy, así que leerlos acá sería aparentar un filtro que no existe. `getModifiers`/`getEmissions`
// iteran TODOS los grupos de una entrada sin condición — un stat dentro de un grupo augment/modo se
// resuelve igual que uno del grupo base. 19 casos confirmados de esto (Null Star + Neutron Star, uno
// de ellos) — `docs/data/schemas/abilities/schema.md` §Gap declarado,
// `.working/investigacion-source-state-groups-augments.md`.
type AbilityGroupRaw = { stats?: AbilityStatRaw[] };
type AbilityEntry = { name?: string; groups?: AbilityGroupRaw[] };

/**
 * Una emisión de daño de una habilidad — la instancia **y de qué renglón salió**.
 *
 * El `label` no es decoración: es la identidad de la emisión dentro de la habilidad, y lo único que
 * distingue el impacto directo del área cuando las dos son Heat. No se interpreta más allá del tipo
 * de daño — que `"Damage / Second"` sea un DoT y `"Explosion Damage"` un AoE es un eje aparte que
 * este módulo no decide (`arch-decisions §15`: la partición es por verbo, no por renglón de UI).
 */
export interface AbilityEmission {
  label: string;
  instance: DamageInstance;
}

export class AbilityRepository {
  private static index: Map<string, AbilityEntry> = new Map();

  public static load(data: Record<string, AbilityEntry>): void {
    this.index.clear();
    Object.entries(data).forEach(([uniqueName, entry]) => this.index.set(uniqueName, entry));
  }

  /**
   * Resuelve el verbo muta-state de una habilidad activa a Modifier[]. Fan-out
   * cross-entity: un modifier por target (el ALL-scope de un buff como Roar — aplica
   * a toda arma equipada; ver el precedente de shards en StaticHydrator).
   * @param abilityId uniqueName de la ability (clave del override).
   * @param sourceId  entidad que castea (el warframe) — de dónde se lee el scaling.
   * @param targetIds entidades que reciben el buff (armas equipadas).
   */
  public static getModifiers(abilityId: string, sourceId: EntityId, entities: SimulationEntity[]): Modifier[] {
    const entry = this.index.get(abilityId);
    if (!entry?.groups) return [];

    const modifiers: Modifier[] = [];

    entry.groups.forEach((group, gIdx) => {
      (group.stats ?? []).forEach((stat, sIdx) => {
        // Solo el verbo muta-state: sin `upgrade_type`, el stat es display (§15).
        if (!stat.upgrade_type) return;

        // Un `base_value` array es el RANGO min-max que publica la UI (`"Fire Rate: 15 - 75%"`),
        // NO una serie por rank como en mods y arcanos. Dónde cae el valor dentro del rango lo
        // decide un recurso de la entidad que castea —la batería de Gauss, el Immolation de Ember,
        // los enemigos tragados de Grendel—, y ese estado de la FUENTE el motor no lo modela.
        //
        // Elegir un extremo sería emitir un número plausible y falso en silencio, y el orden del
        // par ni siquiera es (min, max): hay rangos descendentes en el corpus (`Fire Blast` drain
        // `[75, 25]`, `Gyre Sphere` frequency `[4, 0.25]`). Así que no se emite: se avisa y se
        // omite, como un token sin mapeo. Hoy no lo ejerce nadie —28 rangos en el override,
        // ninguno con `upgrade_type`—; el primero que se anote va a hacer ruido en vez de mentir.
        //
        // ⚠️ No confundir con CP1b (`ensemble.ts`), que es "Roar entra por su valor de rank
        // máximo": eso es la serie por rank, y es un eje distinto de este.
        if (Array.isArray(stat.base_value)) {
          console.warn(`[Hydration] Rango sin estado que lo resuelva: ${abilityId} — "${stat.label}" = ${JSON.stringify(stat.base_value)}, stat omitido`);
          return;
        }
        const raw = stat.base_value;
        if (raw === undefined) return;
        const value = toAdditivePercent(raw, stat.label);

        // El scaling cross-entity (× Ability Strength) lo hace el grafo vía source_attribute;
        // acá solo se resuelve el token de carta (`upgrade_by`) al nodo del warframe.
        const source_attribute = stat.upgrade_by ? ABILITY_SCALE_NODE[stat.upgrade_by] : undefined;

        // N destinos por stat: la UI colapsa en un renglón buffs que son stats distintos
        // (Volt Speed → movement speed Y melee attack speed). Cada token rutea por su cuenta.
        const tokens = Array.isArray(stat.upgrade_type) ? stat.upgrade_type : [stat.upgrade_type];

        tokens.forEach(token => {
          const target = resolveUpgradeEntry(token);
          if (!target) return; // token sin mapeo → gap, se omite en silencio (como Arcane).

          // El `{cuál}` sale del token, no de la pertenencia: la sub-familia si la hay
          // (`WEAPON_MELEE_*`), la familia si no (`AVATAR_*` → el warframe). Ver channel-routing.
          const targetIds = target.target_channel
            ? resolveChannelEntities(target.target_channel, entities)
            : resolveFamilyEntities(token.split('_')[0], entities);

          targetIds.forEach(targetId => {
            // Daño combinado (#30): mismo motivo que ArcaneRepository — `target.op` (ADD, contra
            // `mods_add_pct`) asume un nodo ya poblado por el arma. Un pool paralelo (Nourish:
            // "+75% Viral") no lo tiene — `mods_add_pct` sobre `base:0` (nodo recién sembrado por
            // `isCombinedDamageToken` en StaticHydrator) daría siempre 0. `ADD_FLAT` = `%/100 ×
            // innateBaseTotal` DEL ARMA DESTINO (no del emisor) — `source_attribute` sigue
            // aplicando el escalado × Ability Strength encima, igual que cualquier otro modifier.
            if (isCombinedDamageToken(target.attr)) {
              const weapon = entities.find(e => e.id === targetId);
              const innateBaseTotal = weapon?.dot_scaling?.innateBaseTotal ?? 0;
              modifiers.push(makeModifier(
                {
                  id: `ability:${abilityId}:g${gIdx}:s${sIdx}:${target.attr}:${targetId}`,
                  source_id: `Ability:${abilityId}`,
                  target_entity: targetId,
                  target_attribute: target.attr,
                  source_entity: sourceId,
                  ...(source_attribute ? { source_attribute } : {}),
                },
                'ADD_FLAT',
                (value / 100) * innateBaseTotal,
              ));
              return;
            }

            modifiers.push(makeModifier(
              {
                id: `ability:${abilityId}:g${gIdx}:s${sIdx}:${target.attr}:${targetId}`,
                source_id: `Ability:${abilityId}`,
                target_entity: targetId,
                target_attribute: target.attr,
                source_entity: sourceId,
                ...(source_attribute ? { source_attribute } : {}),
              },
              target.op,
              value,
            ));
          });
        });
      });
    });

    return modifiers;
  }

  /**
   * EL SEGUNDO VERBO — **emite-instancia** (`arch-decisions §15`, Fase 3).
   *
   * ⚠️ **Devuelve una LISTA, y ése es el hallazgo del pase.** El primer diseño devolvía una instancia
   * por habilidad, acumulando los tipos en un solo `damageByType`. Medido: **6 de 21** habilidades
   * marcadas declaran más de un stat de daño —Fireball `Damage` + `Area Damage` + `Extra Damage`,
   * Axios Javelin `Damage` + `Explosion Damage`, Tesla Nervos `Damage` + `Damage / Second`— y
   * fusionarlas era falso, no impreciso: la fuente le da a cada una **status chance propio** (Fireball
   * directo `0%`, área `100%`) y Tesla Nervos mezcla un impacto con un DoT. Un emisor **emite N
   * instancias**; cuántas y de qué naturaleza lo dice su carta, no esta función.
   *
   * `getModifiers` cubre *muta-state*: los stats con `upgrade_type`, que aterrizan en un nodo ajeno.
   * Éste cubre el otro: los stats que **son daño**, y que no aterrizan en ningún nodo porque no
   * modifican nada — nacen como instancia. Se reconocen por el label, que es donde el dato declara el
   * tipo (`"Damage: <DT_HEAT> |val1|"`); `upgrade_type` está vacío en los 28, y **eso es correcto**:
   * un stat de daño de habilidad no tiene nodo destino.
   *
   * **El escalado se lee del grafo, igual que en `getModifiers`.** Firma mirror de su hermano
   * (`abilityId, sourceId, entities`), resuelto vía `resolveAbilityStrength` (arriba). Antes este
   * verbo recibía un `strength` ya pre-derivado por el caller (`{ strength?: number }`); el CLI oracle
   * lo calculaba a mano, duplicando la fórmula del grafo fuera del grafo. Ya no — F3 (`.working/
   * refactor-engine-2-recomposicion.md`).
   *
   * **`lawDeviations` y el pool de facción se leen del PEER**, no de un nodo propio de la habilidad.
   * Una habilidad no tiene nodo `GAMEPLAY_*` — el peer es la primera entidad que
   * `resolveFamilyEntities('GAMEPLAY', entities)` resuelve (mismo fan-out que ya alcanza a Roar). Ver
   * `contracts/law-params.ts` §DÓNDE NACE EL NODO. Sin peer (build sólo-warframe), ambos caen a su
   * default neutro (`{}` / factor `1.0`) — caso legítimo, no un gap.
   *
   * ─── LOS CUATRO GATES, MEDIDOS SOBRE LAS 28 MARCADAS — ninguno con decisión escrita fuera de acá (#5) ──
   *
   * De 28 stats con `<DT_*>`: **18 limpios** · 4 multi-tipo · 2 rango · 2 comodín · 2 porcentuales.
   * Los diez que no pasan **se omiten y avisan**, nunca se aproximan:
   *
   *   - **rango** `[400, 800]` — misma regla que `getModifiers`: dónde cae dentro del rango lo decide
   *     un recurso de quien castea (la batería de Gauss, el Immolation de Ember) que no modelamos, y
   *     el par ni siquiera es siempre (min, max). Elegir un extremo es un número plausible y falso.
   *   - **comodín** `<DT_*>` — Spectral Scream: el tipo es *el elemento elegido*, estado del source.
   *   - **multi-tipo** `<DT_SLASH> <DT_IMPACT> <DT_PUNCTURE>` — el override da UN total y **no la
   *     proporción**. La fuente muestra que asumir partes iguales sería falso: Redline es
   *     `81.25% Impact / 18.75% Puncture`, no mitad y mitad.
   *   - **porcentual** `|val1|%` — no es daño absoluto sino un multiplicador sobre otra cosa
   *     (Dread Mirror: *"100% del daño guardado"*).
   */
  public static getEmissions(abilityId: string, sourceId: EntityId, entities: SimulationEntity[]): AbilityEmission[] {
    const entry = this.index.get(abilityId);
    if (!entry?.groups) return [];

    const strength = resolveAbilityStrength(sourceId, entities);

    // El peer que porta los pools de daño globales (`GAMEPLAY_*`) y los parámetros de ley que la
    // habilidad no tiene dónde declarar por sí misma — mismo fan-out que ya alcanza a Roar.
    const peerId = resolveFamilyEntities('GAMEPLAY', entities)[0];
    const peer = peerId ? entities.find(e => e.id === peerId) : undefined;
    const lawDeviations = peer ? emitterLawDeviations(peer.attributes) : {};
    const poolFactor = ABILITY_ELIGIBLE_POOLS.reduce(
      (factor, pool) => factor * globalDamageBucketFactor(peer?.attributes[pool]),
      1,
    );

    // Excepción de crit de habilidad (#9, ability-crit.ts) — hoy sólo Gyre, aproximación v1 (+10%
    // flat, hardcodeado; el mecanismo real es condition-scaled, re-alcanzado en #33). Cathode Grace
    // no está cableado (el augment no existe en `mods.json`) — se declara el gap, no se aproxima.
    // Sin caster (sourceId no resuelve) → sin excepción, mismo default silencioso que
    // `resolveAbilityStrength` ya aplica acá arriba para el mismo caso (factor 1, sin warn) — no es
    // un gap nuevo, es agnóstico-a-caster por diseño (`emit()` de ability-emission.test.ts lo ejerce).
    const caster = entities.find(e => e.id === sourceId);
    const critResult = hasAbilityCritException(caster?.unique_name ?? '')
      ? calculateGyreCrit({ passiveBaseCritPct: 10, cathodeGraceCritPct: 0, hasCathodeGrace: false })
      : null;

    const emissions: AbilityEmission[] = [];

    for (const group of entry.groups) {
      for (const stat of group.stats ?? []) {
        const label = stat.label ?? '';
        const tags = label.match(/<DT_[A-Z*]+>/g);
        if (!tags) {
          // ⚠️ **El stat dice "Damage" y no declara de qué tipo.** No es lo mismo que "no es un stat
          // de daño": un stat con `upgrade_type` es un buff y lo cubre `getModifiers`; uno sin él que
          // se llame Damage es una **emisión muda**, y saltarla en silencio la volvería invisible — #5.
          // Medido: 3 de las 28 marcadas (Radial Javelin, Breach Surge, Minelayer) — Radial Javelin es
          // además el catálogo inconsistente de #6.
          if (!stat.upgrade_type && /damage/i.test(label)) {
            console.warn(`[Emisión] ${abilityId} — "${label}": declara daño sin tipo, stat omitido`);
          }
          continue;
        }

        const gate = emissionGate(stat, tags, label);
        if (gate) {
          console.warn(`[Emisión] ${abilityId} — "${label}": ${gate}, stat omitido`);
          continue;
        }

        const type = resolveDamageTypeTag(tags[0].slice(1, -1));
        if (!type) continue;                                   // tag fuera del canónico → gap, como token sin mapeo
        const base = stat.base_value as number;
        // El escalado sólo se aplica donde el dato dice que escala. Un stat sin `upgrade_by` es plano
        // por declaración de la carta, no por falta de información. El factor de pool (Roar) sí alcanza
        // a los dos casos por igual — es un bono incondicional sobre "cualquier daño que el portador
        // haga", no un escalado del propio dato de la habilidad.
        const value = (stat.upgrade_by ? base * strength : base) * poolFactor;

        // ─── STATUS: 100% SALVO QUE SE DIGA LO CONTRARIO ─────────────────────────────────────────
        //
        // **Regla de la casa, no inferencia de la wiki.** Si el dato del juego declara que la
        // habilidad hace `<DT_HEAT>`, hace daño de fuego — y proquea fuego. Una habilidad no tira los
        // dados como un arma: el estado es parte de lo que la habilidad ES. El default es garantizado
        // y lo contrario se declara; ninguna captura nueva hace falta para sostenerlo.
        //
        // Se expresa como `statusChance: 1` y **no** como un eje de "proc forzado" aparte. El corpus
        // distingue los dos (`damage-status-model.md`: *forced proc ≠ la porción garantizada de un
        // SC>100%*, `origen: forced`, existe y no está modelado) y la distinción es real — un proc
        // forzado no se buffea y no sale del peso de daño. Pero **hoy no hay caso que la fuerce**: los
        // stats que emiten son todos mono-tipo (el multi-tipo está gateado arriba), así que repartir
        // por peso sobre un solo tipo da exactamente un proc de ese tipo. Cuando aparezca una emisión
        // que fuerce un efecto **ausente de su propio daño**, ahí el eje separado se gana el lugar.
        //
        // Crit: la excepción conocida (Gyre) ya cablea su valor real (arriba); el resto de las
        // habilidades sigue en 0 — el override no publica crit de habilidad como dato para el caso
        // general, hueco re-alcanzado en #33 (antes #4).
        //
        // `moddedCritChance` de `calculateGyreCrit` viene en DECIMAL (0-1); `DamageInstance.critChance`
        // es PORCENTAJE — `deriveInstance` lee `.final` del nodo directo sin dividir (a diferencia de
        // `statusChance`, que sí divide /100). Conversión obligatoria acá o el crit de Gyre queda 100×
        // más chico que el real.
        emissions.push({
          label,
          instance: makeInstance({
            damageByType: { [type]: value },
            statusChance: 1,
            ...(critResult ? { critChance: critResult.moddedCritChance * 100, critMult: critResult.moddedCritDamage } : {}),
            ...(Object.keys(lawDeviations).length > 0 ? { lawDeviations } : {}),
          }),
        });
      }
    }

    return emissions;
  }
}

/** El motivo por el que un stat de daño no puede volverse instancia, o `null` si puede. */
function emissionGate(stat: AbilityStatRaw, tags: string[], label: string): string | null {
  if (tags.some(t => t === '<DT_*>')) return 'tipo comodín — lo elige un estado del source';
  if (Array.isArray(stat.base_value)) return `rango sin estado que lo resuelva ${JSON.stringify(stat.base_value)}`;
  if (tags.length > 1) return `${tags.length} tipos y una sola magnitud — el override no da la proporción`;
  if (/\|val\d+\|\s*%/.test(label)) return 'porcentual — multiplicador sobre otra cosa, no daño absoluto';
  if (typeof stat.base_value !== 'number') return 'sin `base_value` numérico';
  return null;
}
