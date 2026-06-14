/**
 * @domain Simulation-v2 / Logic / Hydration
 * @status en-desarrollo
 */

import type { Ensemble, MutatedDNA, SimulationEntity, AttributeNode, Modifier } from "../../contracts";
import { ModRepository } from "./ModRepository";
import { ShardRepository } from "./ShardRepository";
import { IncarnonRepository } from "./IncarnonRepository";
import { ArcaneRepository } from "./ArcaneRepository";
import { isUpgrade } from "@shared/types/modifier";

import { DamageCombiner, type ElementalMod } from "./DamageCombiner";
import { isWeaponDamageToken } from "../../contracts/damage-logic";
import { getAttributeMetadata } from "../../../../lib/presentation/attribute-registry";

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
            combination_mods.push({
               type: m.target_attribute,
               percentage: m.value,
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

      // 4. Actualizar atributos de la entidad con el daño combinado
      // Limpiar daños previos que podrían haber sido combinados
      Object.keys(entity.attributes).forEach(attr => {
         if (isWeaponDamageToken(attr)) delete entity.attributes[attr];
      });

      // Injectar nuevos nodos de daño
      Object.entries(combined_damage).forEach(([type, value]) => {
         // Ley: Cada tipo de daño se inicializa con su valor base combinado
         const meta = getAttributeMetadata(type);
         entity.attributes[type] = {
           base: value,
           base_flat: 0,
           base_add_pct: 0,
           mods_add_pct: 0,
           total_flat: 0,
           multiplicative: 1.0,
           final: value,
           ...meta
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

      modifiers.push({
        id: `shard:${shard.type}:${shard.stat}`,
        source_id: `Shard:${shard.type}`,
        target_entity: targetId,
        target_attribute: resolved.attr,
        operation: resolved.op,
        value: resolved.value,
      });
    });

    return { entities, modifiers };
  }


  private static createBaseEntity(dna: MutatedDNA, profile_id: string = "base"): SimulationEntity {
    const attributes: Record<string, AttributeNode> = {};
    const base_attributes = dna.profiles ? (dna.profiles[profile_id] || dna.profiles["base"] || {}) : {};
    
    Object.entries(base_attributes).forEach(([id, value]) => {
      // Solo crean AttributeNode los tokens D-6 válidos y los attrs de daño (Fase 2 pendiente).
      // Datos puros como reload_time quedan en innate_dna.profiles — no acumulan modificadores.
      if (!isUpgrade(id) && id !== 'WEAPON_ADD_DAMAGE') return;
      const meta = getAttributeMetadata(id);
      attributes[id] = {
        base: value,
        base_flat: 0,
        base_add_pct: 0,
        mods_add_pct: 0,
        total_flat: 0,
        multiplicative: 1.0,
        final: value,
        ...meta
      };
    });

    // Inyectar el multiplicador global de daño solo para armas (hack de composición conocido,
    // gap del engine — no es ley universal). Un warframe no tiene nodo de daño de arma.
    const isWarframe = dna.kind === 'warframe';
    if (!isWarframe && !attributes["WEAPON_ADD_DAMAGE"]) {
       const meta = getAttributeMetadata("WEAPON_ADD_DAMAGE");
       attributes["WEAPON_ADD_DAMAGE"] = {
          base: 100, // 100% baseline
          base_flat: 0, base_add_pct: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 100,
          ...meta
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
      behaviors: dna.behaviors,
      innate_dna: dna
    };
  }
}
