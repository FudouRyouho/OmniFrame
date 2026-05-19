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
        
        profiles[profile_name] = {
          critical_chance: (attack.crit_chance ?? raw.stats.crit_chance ?? 0) * 100,
          critical_multiplier: attack.crit_mult ?? raw.stats.crit_mult ?? 0,
          status_chance: (attack.status_chance ?? raw.stats.status_chance ?? 0) * 100,
          fire_rate: raw.stats.fire_rate ?? 0,
          multishot: raw.stats.multishot ?? 1,
          magazine_size: raw.stats.magazine_size ?? 0,
          reload_time: raw.stats.reload_time ?? 0,
          reload_speed: 100,
          WEAPON_DAMAGE: 100,
          ...this.mapDamage(attack.damage)
        };
      });
      
      if (!profiles['base'] && Object.keys(profiles).length > 0) {
        profiles['base'] = Object.values(profiles)[0];
      }
    } else if (raw.stats) {
      // Fallback a nivel superior si no hay ataques detallados
      profiles['base'] = {
        critical_chance: (raw.stats.crit_chance ?? 0) * 100,
        critical_multiplier: raw.stats.crit_mult ?? 0,
        status_chance: (raw.stats.status_chance ?? 0) * 100,
        fire_rate: raw.stats.fire_rate ?? 0,
        multishot: raw.stats.multishot ?? 1,
        magazine_size: raw.stats.magazine_size ?? 0,
        reload_time: raw.stats.reload_time ?? 0,
        reload_speed: 100,
        WEAPON_DAMAGE: 100,
        ...this.mapDamage(raw.stats.damage)
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
        result[`damage_${key.toLowerCase()}`] = val;
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
