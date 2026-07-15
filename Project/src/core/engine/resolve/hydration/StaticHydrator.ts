/**
 * @domain Simulation-v2 / Logic / Hydration
 * @status en-desarrollo
 */

import { makeModifier, type Ensemble, type MutatedDNA, type SimulationEntity, type AttributeNode, type Modifier } from "../../contracts";
import { ModRepository } from "./ModRepository";
import { ShardRepository } from "./ShardRepository";
import { IncarnonRepository } from "./IncarnonRepository";
import { ArcaneRepository } from "./ArcaneRepository";
import { isUpgrade } from "@shared/types/modifier";

import { DamageCombiner, PHYSICAL_TYPES, type ElementalMod } from "./DamageCombiner";
import { isWeaponDamageToken, damageTypeFromToken } from "../../contracts/damage-logic";
import type { DamageType } from "@shared/types";

export class StaticHydrator {
  /**
   * Convierte un Ensemble y sus ADN Mutados en entidades listas para el motor.
   */
  public static hydrate(ensemble: Ensemble, dnas: Record<string, MutatedDNA>): { 
    entities: SimulationEntity[], 
    modifiers: Modifier[] 
  } {
    const entities: SimulationEntity[] = [];
    const modifiers: Modifier[] = [];

    const intents: { entity_id: string, slots: Record<number, { mod_id?: string; level?: number }>, profile_id: string, evolution_perks?: Record<number, string>, arcanes?: Record<number, { arcane_id: string; rank: number }> }[] = [];

    intents.push({
      entity_id: ensemble.warframe.id,
      slots: ensemble.warframe.slots,
      profile_id: "base",
      arcanes: ensemble.warframe.arcanes
    });
    if (ensemble.weapons.primary) intents.push({ entity_id: ensemble.weapons.primary.id, slots: ensemble.weapons.primary.slots, profile_id: ensemble.weapons.primary.active_profile_id, evolution_perks: ensemble.weapons.primary.evolution_perks, arcanes: ensemble.weapons.primary.arcanes });
    if (ensemble.weapons.secondary) intents.push({ entity_id: ensemble.weapons.secondary.id, slots: ensemble.weapons.secondary.slots, profile_id: ensemble.weapons.secondary.active_profile_id, evolution_perks: ensemble.weapons.secondary.evolution_perks, arcanes: ensemble.weapons.secondary.arcanes });
    if (ensemble.weapons.melee) intents.push({ entity_id: ensemble.weapons.melee.id, slots: ensemble.weapons.melee.slots, profile_id: ensemble.weapons.melee.active_profile_id, evolution_perks: ensemble.weapons.melee.evolution_perks, arcanes: ensemble.weapons.melee.arcanes });

    // 2. Hydrate Entities and Modifiers
    intents.forEach(intent => {
      const dna = dnas[intent.entity_id];
      if (!dna) return;

      const entity = this.createBaseEntity(dna, intent.profile_id);
      const combination_mods: ElementalMod[] = [];
      
      Object.entries(intent.slots).forEach(([index_str, slot]) => {
        if (!slot.mod_id) return;
        const index = parseInt(index_str);
        const mod_modifiers = ModRepository.getModifiers(slot.mod_id, dna.entity_id, slot.level || 0);
        
        mod_modifiers.forEach(m => {
          // Add source info for Audit Trace
          const enriched_mod = { ...m, source_id: `Mod:${slot.mod_id}` };

          const isCombat = isWeaponDamageToken(m.target_attribute);

          if (isCombat) {
            // Los mods de tipo de daño son SIEMPRE acumulador (ADD) — nunca familia; el
            // `'value' in m` es la guarda de la union (los combos no tienen value).
            combination_mods.push({
               type: m.target_attribute,
               percentage: 'value' in m ? m.value : 0,
               index: index
            });
          } else {
            modifiers.push(enriched_mod);
          }
        });
      });

      // 3. Integrar DamageCombiner
      const base_attributes = dna.profiles ? (dna.profiles[intent.profile_id] || dna.profiles["base"] || {}) : {};
      const innate_damage: Record<string, number> = {};
      Object.entries(base_attributes).forEach(([attr, val]) => {
         if (isWeaponDamageToken(attr)) innate_damage[attr] = val;
      });

      const combined_damage = DamageCombiner.combine(innate_damage, combination_mods);

      // 3.b Enriquecimiento C1→C2 para el DoT (contracts §dot_scaling): el combiner descarta el base
      // innato y el % de mods de elemento. El DoT escala con el **base innato** (NO el compuesto — el
      // hit sí, el DoT no; ver `ingame-tests/dot-scaling.md`), y su `own_element` sale de los mods del
      // propio elemento (los físicos NO cuentan → Slash queda en 0).
      const innateBaseTotal = Object.values(innate_damage).reduce((a, b) => a + b, 0);
      const ownElementBonusPct: Partial<Record<DamageType, number>> = {};
      for (const mod of combination_mods) {
        if (PHYSICAL_TYPES.includes(mod.type)) continue;
        const dtype = damageTypeFromToken(mod.type);
        if (dtype) ownElementBonusPct[dtype] = (ownElementBonusPct[dtype] ?? 0) + mod.percentage;
      }
      entity.dot_scaling = { innateBaseTotal, ownElementBonusPct };

      // 4. Actualizar atributos de la entidad con el daño combinado
      // Limpiar daños previos que podrían haber sido combinados
      Object.keys(entity.attributes).forEach(attr => {
         if (isWeaponDamageToken(attr)) delete entity.attributes[attr];
      });

      // Injectar nuevos nodos de daño
      Object.entries(combined_damage).forEach(([type, value]) => {
         // Ley: Cada tipo de daño se inicializa con su valor base combinado
         entity.attributes[type] = {
           base: value,
           base_flat: 0,
           base_add_pct: 0,
           mods_add_pct: 0,
           total_flat: 0,
           multiplicative: 1.0,
           final: value,
         };
      });
      
      // Incarnon evolution perks
      if (intent.evolution_perks) {
        const perk_mods = IncarnonRepository.getModifiers(intent.entity_id, intent.evolution_perks, dna.entity_id);
        modifiers.push(...perk_mods);
      }

      // Arcanos: directo a modifiers[], SIN pasar por DamageCombiner (su daño no se
      // combina con el del arma — naturaleza distinta, como los shards). Ver ArcaneRepository.
      if (intent.arcanes) {
        Object.values(intent.arcanes).forEach(arc => {
          modifiers.push(...ArcaneRepository.getModifiers(arc.arcane_id, arc.rank, dna.entity_id));
        });
      }

      // Melee Combo — heavy attack como consumidor de daño (§4.1). El multiplicador es
      // INTRÍNSECO (todo melee lo tiene en su perfil heavy), no un mod equipado: no hay
      // repositorio del que sacarlo → se SINTETIZA acá (primer modifier-de-mecánica nacido
      // en hidratación; bendecido por arch-decisions §10, Cedo pasiva). Gate doble: kind=melee
      // (solo el melee tiene combo) + perfil heavy (solo el heavy lo consume como daño; el
      // light/normal-slam NO, §4.2). Gate por prefijo 'heavy' del perfil — ⚠️ deuda si un día
      // hay que distinguir heavy-ground de heavy-slam por dato. El valor NO se bakea: viaja el
      // nombre de la variable (melee_combo_factors), el motor computa `meleeComboMult(melee_combo_count)`.
      const isHeavyProfile = intent.profile_id.startsWith('heavy') && !!dna.profiles?.[intent.profile_id];
      if (dna.kind === 'melee' && isHeavyProfile) {
        modifiers.push({
          id: `melee-combo:${dna.entity_id}`,
          source_id: 'Intrinsic:MeleeCombo',
          target_entity: dna.entity_id,
          target_attribute: 'WEAPON_ADD_DAMAGE',
          operation: 'MELEE_COMBO_MULT',
          melee_combo_factors: { count_var: 'melee_combo_count' },
        });
      }

      // Sniper Shot Combo — hermano del melee combo pero PASIVO (todo shot scoped, sin gate de
      // perfil) y por-arma (`min_combo`, dato del override inyectado en los perfiles). Gate:
      // family='sniper'. Sin `min_combo` en el dato ⇒ gap (no se sintetiza, no se asume). El
      // parámetro por-arma viaja bakeado en los factores; el producto lo computa `sniperComboMult`.
      if (dna.family === 'sniper') {
        const prof = dna.profiles?.[intent.profile_id] ?? dna.profiles?.['base'];
        const minCombo = prof?.min_combo;
        if (minCombo !== undefined) {
          modifiers.push({
            id: `sniper-combo:${dna.entity_id}`,
            source_id: 'Intrinsic:SniperCombo',
            target_entity: dna.entity_id,
            target_attribute: 'WEAPON_ADD_DAMAGE',
            operation: 'SNIPER_COMBO_MULT',
            sniper_combo_factors: { count_var: 'sniper_combo_count', min_combo: minCombo },
          });
        }
      }

      entities.push(entity);
    });

    // OQ-ENGINE-4: Consumer loop de Archon Shards
    const channelToEntityId: Record<string, string | undefined> = {
      primary:   ensemble.weapons.primary?.id,
      secondary: ensemble.weapons.secondary?.id,
      melee:     ensemble.weapons.melee?.id,
    };

    ensemble.warframe.shards.forEach(shard => {
      const resolved = ShardRepository.resolve(shard.type, shard.stat, shard.is_tau ?? false);
      if (!resolved) return;

      const targetId = resolved.target_channel
        ? channelToEntityId[resolved.target_channel]
        : ensemble.warframe.id;

      if (!targetId) return;

      modifiers.push(makeModifier(
        {
          id: `shard:${shard.type}:${shard.stat}`,
          source_id: `Shard:${shard.type}`,
          target_entity: targetId,
          target_attribute: resolved.attr,
        },
        resolved.op,
        resolved.value,
      ));
    });

    return { entities, modifiers };
  }


  private static createBaseEntity(dna: MutatedDNA, profile_id: string = "base"): SimulationEntity {
    const attributes: Record<string, AttributeNode> = {};
    // Perfil efectivo: el pedido si existe, si no cae a 'base' (mismo criterio para attributes
    // y co_behavior, para que no se desincronicen).
    const effective_profile = (dna.profiles && dna.profiles[profile_id]) ? profile_id : "base";
    const base_attributes = dna.profiles ? (dna.profiles[effective_profile] || {}) : {};
    
    Object.entries(base_attributes).forEach(([id, value]) => {
      // Solo crean AttributeNode los tokens D-6 válidos (WEAPON_ADD_DAMAGE incluido en
      // el vocabulario Upgrade). Datos puros como reload_time quedan en innate_dna.profiles
      // — no acumulan modificadores.
      if (!isUpgrade(id)) return;
      attributes[id] = {
        base: value,
        base_flat: 0,
        base_add_pct: 0,
        mods_add_pct: 0,
        total_flat: 0,
        multiplicative: 1.0,
        final: value,
      };
    });

    // Inyectar el multiplicador global de daño solo para armas (hack de composición conocido,
    // gap del engine — no es ley universal). Un warframe no tiene nodo de daño de arma.
    const isWarframe = dna.kind === 'warframe';
    if (!isWarframe && !attributes["WEAPON_ADD_DAMAGE"]) {
       attributes["WEAPON_ADD_DAMAGE"] = {
          base: 100, // 100% baseline
          base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 100,
       };
    }

    return {
      id: dna.entity_id,
      unique_name: dna.entity_id,
      domain: dna.domain,
      kind: dna.kind,
      family: dna.family,
      // PE = entidad poseída/equipada (arma o warframe); TE = transitoria (proc, proyectil).
      persistence: (dna.tags.includes('weapon') || isWarframe) ? 'PE' : 'TE',
      tags: dna.tags,
      attributes,
      co_behavior: dna.co_behavior?.[effective_profile],
      innate_dna: dna
    };
  }
}
