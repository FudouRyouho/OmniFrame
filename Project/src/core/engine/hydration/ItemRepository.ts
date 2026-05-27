/**
 * @domain Simulation-v2 / Logic / Data
 * @status en-desarrollo
 */

import type { MutatedDNA } from "../contracts";

export class ItemRepository {
  private static items: Map<string, any> = new Map();

  /**
   * Carga un bloque de items en el repositorio.
   */
  public static load(data: any[]) {
    if (!Array.isArray(data)) return;
    data.forEach(item => {
      if (item.unique_name) {
        this.items.set(item.unique_name, item);
      }
    });
  }

  /**
   * Obtiene el ADN de un item mapeado desde el dataset.
   */
  public static getDNA(uniqueName: string): MutatedDNA | null {
    const raw = this.items.get(uniqueName);
    if (!raw) return null;

    const profiles: Record<string, Record<string, number>> = {};
    
    // Mapear ataques a perfiles
    if (raw.stats?.attacks && raw.stats.attacks.length > 0) {
      raw.stats.attacks.forEach((attack: any) => {
        const profile_name = (attack.name || 'default').toLowerCase().replace(/ /g, '_');
        const damage_map = this.mapDamage(attack.damage);
        const damage_sum = Object.values(damage_map).reduce((s, v) => s + v, 0);

        profiles[profile_name] = {
          WEAPON_ADD_CRIT_CHANCE:  (attack.crit_chance ?? raw.stats.crit_chance ?? 0) * 100,
          WEAPON_ADD_CRIT_MULT:    attack.crit_mult ?? raw.stats.crit_mult ?? 0,
          WEAPON_ADD_STATUS_CHANCE:(attack.status_chance ?? raw.stats.status_chance ?? 0) * 100,
          WEAPON_ADD_FIRE_RATE:    raw.stats.fire_rate ?? 0,
          WEAPON_ADD_MULTISHOT:    raw.stats.multishot ?? 1,
          WEAPON_ADD_MAGAZINE_MAX: raw.stats.magazine_size ?? 0,
          reload_time:             raw.stats.reload_time ?? 0,
          WEAPON_ADD_RELOAD_SPEED: 100,
          WEAPON_DAMAGE:           damage_sum || 100,
          ...damage_map
        };
      });
      
      if (!profiles['base'] && Object.keys(profiles).length > 0) {
        profiles['base'] = Object.values(profiles)[0];
      }
    } else if (raw.stats) {
      // Fallback a nivel superior si no hay ataques detallados
      const damage_map_fallback = this.mapDamage(raw.stats.damage);
      const damage_sum_fallback = Object.values(damage_map_fallback).reduce((s, v) => s + v, 0);
      profiles['base'] = {
        WEAPON_ADD_CRIT_CHANCE:  (raw.stats.crit_chance ?? 0) * 100,
        WEAPON_ADD_CRIT_MULT:    raw.stats.crit_mult ?? 0,
        WEAPON_ADD_STATUS_CHANCE:(raw.stats.status_chance ?? 0) * 100,
        WEAPON_ADD_FIRE_RATE:    raw.stats.fire_rate ?? 0,
        WEAPON_ADD_MULTISHOT:    raw.stats.multishot ?? 1,
        WEAPON_ADD_MAGAZINE_MAX: raw.stats.magazine_size ?? 0,
        reload_time:             raw.stats.reload_time ?? 0,
        WEAPON_ADD_RELOAD_SPEED: 100,
        WEAPON_DAMAGE:           damage_sum_fallback || 100,
        ...damage_map_fallback
      };
    }

    return {
      entity_id: raw.unique_name,
      domain: raw.domain,
      kind: raw.kind,
      family: raw.family,
      tags: [raw.domain, raw.kind, raw.family, ...(raw.tags || [])].filter(Boolean),
      profiles,
      behaviors: [raw.trigger?.toLowerCase()].filter(Boolean)
    };

  }

  private static mapDamage(damage: any): Record<string, number> {
    const result: Record<string, number> = {};
    if (!damage) return result;
    
    Object.entries(damage).forEach(([key, val]) => {
      if (typeof val === 'number' && val > 0 && key !== 'total') {
        // Mapeo de tipos de daño (ej: "impact" -> "damage_impact")
        result[`WEAPON_ADD_${key.toUpperCase()}_DAMAGE`] = val;
      }
    });
    return result;
  }

  private static overrides: Map<string, any> = new Map();

  /**
   * Carga un bloque de overrides en el repositorio.
   */
  public static loadOverrides(data: Record<string, any>) {
    Object.entries(data).forEach(([key, val]) => {
      this.overrides.set(key, val);
    });
  }

  /**
   * Obtiene el override para un mod específico.
   */
  public static getModOverride(uniqueName: string): any | null {
    return this.overrides.get(uniqueName) || null;
  }

  public static getRawItem(uniqueName: string): any | null {
    return this.items.get(uniqueName) || null;
  }

  public static findByName(name: string): any | null {
    for (const item of this.items.values()) {
      if (item.name === name) return item;
    }
    return null;
  }

  public static getAllNames(): string[] {
    return Array.from(this.items.values()).map(i => i.name);
  }
}
