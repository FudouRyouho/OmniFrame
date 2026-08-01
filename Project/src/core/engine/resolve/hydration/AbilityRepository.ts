/**
 * @domain Engine / Hydration
 * @SSoT docs/data/schemas/abilities/schema.md
 *
 * Primer consumidor del motor de habilidades — el verbo MUTA-STATE del nodo-source
 * (arch-decisions §15). Lee ability-stats.override.json (clave = uniqueName de la
 * ability) y, por cada stat con `upgrade_type` poblado, emite un Modifier. El
 * `upgrade_type` es la **proyección estática del source-state** (§15): un buff sin
 * duración → source-state = la entity estática de C1 → el modifier bakeado. Un stat
 * SIN `upgrade_type` es display puro (`upgrade_by` = solo cómo escala en la carta) →
 * se omite; el motor no lo consume.
 *
 * Cross-entity (Fase 1a): el modifier escala leyendo un atributo del WARFRAME
 * (`source_entity`/`source_attribute`, arista del grafo) y aterriza en un pool del
 * ARMA (`target_entity`/`target_attribute`). Roar = 50% × Ability Strength → pool de
 * facción del arma (`GAMEPLAY_MULT_FACTION_DAMAGE`, bono INCONDICIONAL §15/§16). NO
 * pasa por `ModRepository` → esquiva el shim `C2F_FACTION_TOKENS_DEFERRED` (Roar no
 * gatea por facción del target — `references/wiki/warframes/rhino/roar.md`).
 *
 * ⚠️ El valor de habilidad es porcentaje CRUDO (50 = +50%), no un multiplicador
 * (1.50) → NO se aplica `toPercent` (a diferencia de ArcaneRepository).
 *
 * Scope 1b (un verbo = muta-state): emite-instancia y sub-source (§15) = Fase 2/3.
 */
import { makeModifier, type Modifier, type EntityId, type SimulationEntity } from "../../contracts";
import { resolveUpgradeEntry } from "@shared/types/modifier";
import { resolveChannelEntities, resolveFamilyEntities } from "./channel-routing";

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
type AbilityGroupRaw = { stats?: AbilityStatRaw[] };
type AbilityEntry = { name?: string; groups?: AbilityGroupRaw[] };

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
}
