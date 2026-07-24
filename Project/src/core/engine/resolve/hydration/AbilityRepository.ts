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
 * gatea por facción del target — `references/wiki/abilities/Rhino/Roar/Roar.md`).
 *
 * ⚠️ El valor de habilidad es porcentaje CRUDO (50 = +50%), no un multiplicador
 * (1.50) → NO se aplica `toPercent` (a diferencia de ArcaneRepository).
 *
 * Scope 1b (un verbo = muta-state): emite-instancia y sub-source (§15) = Fase 2/3.
 */
import { makeModifier, type Modifier, type EntityId } from "../../contracts";
import { resolveUpgradeEntry } from "@shared/types/modifier";

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
  upgrade_type?: string;
};
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
  public static getModifiers(abilityId: string, sourceId: EntityId, targetIds: EntityId[]): Modifier[] {
    const entry = this.index.get(abilityId);
    if (!entry?.groups) return [];

    const modifiers: Modifier[] = [];

    entry.groups.forEach((group, gIdx) => {
      (group.stats ?? []).forEach((stat, sIdx) => {
        // Solo el verbo muta-state: sin `upgrade_type`, el stat es display (§15).
        if (!stat.upgrade_type) return;

        const target = resolveUpgradeEntry(stat.upgrade_type);
        if (!target) return; // token sin mapeo → gap, se omite en silencio (como Arcane).

        // Valor crudo (porcentaje, sin `toPercent`). Si viniera como serie min-max,
        // tomamos el máximo (1b: Roar asumido-max, CP1b).
        const raw = Array.isArray(stat.base_value)
          ? stat.base_value[stat.base_value.length - 1]
          : stat.base_value;
        if (raw === undefined) return;

        // El scaling cross-entity (× Ability Strength) lo hace el grafo vía source_attribute;
        // acá solo se resuelve el token de carta (`upgrade_by`) al nodo del warframe.
        const source_attribute = stat.upgrade_by ? ABILITY_SCALE_NODE[stat.upgrade_by] : undefined;

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
            raw,
          ));
        });
      });
    });

    return modifiers;
  }
}
