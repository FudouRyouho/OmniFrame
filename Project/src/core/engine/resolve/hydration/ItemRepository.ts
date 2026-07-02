/**
 * @domain Simulation-v2 / Logic / Data
 * @status en-desarrollo
 */

import type { MutatedDNA } from "../../contracts";

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

    // Warframe: stats base de avatar (no tiene ataques). El raw expone health/shield/armor/
    // energy reales (mismo molde que `flight` de projectile_speed — dato en fuente, sin override).
    // Cada nodo usa el attr del token ADD como id, para que mods (%) y shards (flat) compongan
    // sobre la misma base — fórmula `Total = Base × (1 + Mods%) + Flat` (ver armor.md, UPGRADE_MAP).
    // Los 4 stats de habilidad nacen con base 100 (100% = sin mods); no conozco excepción.
    if (raw.kind === 'warframe') {
      const s = raw.stats ?? {};
      profiles['base'] = {
        AVATAR_ADD_HEALTH_MAX:        s.health ?? 0,
        AVATAR_ADD_SHIELD_MAX:        s.shield ?? 0,
        AVATAR_ADD_ARMOUR:            s.armor  ?? 0,
        AVATAR_ADD_ENERGY_MAX:        s.energy ?? 0,
        AVATAR_ADD_ABILITY_STRENGTH:   100,
        AVATAR_ADD_ABILITY_RANGE:      100,
        AVATAR_ADD_ABILITY_DURATION:   100,
        AVATAR_ADD_ABILITY_EFFICIENCY: 100,
      };
      return {
        entity_id: raw.unique_name,
        domain: raw.domain,
        kind: raw.kind,
        family: raw.family,
        tags: [raw.domain, raw.kind, raw.family, ...(raw.tags || [])].filter(Boolean),
        profiles,
        behaviors: [],
      };
    }

    // Mapear ataques a perfiles
    if (raw.stats?.attacks && raw.stats.attacks.length > 0) {
      raw.stats.attacks.forEach((attack: any, index: number) => {
        const profile_name = (attack.name || 'default').toLowerCase().replace(/ /g, '_');
        const damage_map = this.mapDamage(attack.damage);
        const damage_sum = Object.values(damage_map).reduce((s, v) => s + v, 0);

        profiles[profile_name] = {
          WEAPON_ADD_CRIT_CHANCE:  (attack.crit_chance ?? raw.stats.crit_chance ?? 0) * 100,
          WEAPON_ADD_CRIT_MULT:    attack.crit_mult ?? raw.stats.crit_mult ?? 0,
          WEAPON_ADD_STATUS_CHANCE:(attack.status_chance ?? raw.stats.status_chance ?? 0) * 100,
          WEAPON_ADD_FIRE_RATE:    attack.speed ?? raw.stats.fire_rate ?? 0,
          WEAPON_ADD_MULTISHOT:    this.resolveMultishot(raw, attack.name ?? '', index),
          WEAPON_FLAT_PUNCH_THROUGH: this.resolvePunchThrough(raw, attack.name ?? '', attack.punch_through),
          WEAPON_ADD_MAGAZINE_MAX: raw.stats.magazine_size ?? 0,
          reload_time:             raw.stats.reload_time ?? 0,
          WEAPON_ADD_RELOAD_SPEED: 100,
          // Recoil: base sintética 100 (recoil relativo, % sobre el nato). No hay dato absoluto
          // público (interno de DE); incondicional, todas las armas tienen recoil. Nodo inerte
          // hasta definir modelado/UI — OQ-ENGINE-7. Ver references/wiki/mechanics/recoil.md.
          WEAPON_ADD_RECOIL:       100,
          WEAPON_ADD_DAMAGE:       damage_sum || 100,
          ...damage_map
        };

        // Projectile speed (m/s): gate por ausencia ≠ 0. El raw expone `flight` solo en armas
        // no-hitscan; hitscan = null (instantáneo, sin proyectil que acelerar). Solo se materializa
        // el nodo cuando hay valor real — un base 0 + mod % daría velocidad espuria en hitscan.
        // Ver references/wiki/mechanics/projectile-speed.md §Gate hitscan.
        if (attack.flight != null) {
          profiles[profile_name].WEAPON_ADD_PROJECTILE_SPEED = attack.flight;
        }
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
        WEAPON_FLAT_PUNCH_THROUGH: 0,
        WEAPON_ADD_MAGAZINE_MAX: raw.stats.magazine_size ?? 0,
        reload_time:             raw.stats.reload_time ?? 0,
        WEAPON_ADD_RELOAD_SPEED: 100,
        WEAPON_ADD_RECOIL:       100,  // base sintética — ver branch principal y recoil.md
        WEAPON_ADD_DAMAGE:       damage_sum_fallback || 100,
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
        // Mapeo de tipos de daño al token D-6 (ej: "impact" -> "WEAPON_ADD_IMPACT_DAMAGE")
        result[`WEAPON_ADD_${key.toUpperCase()}_DAMAGE`] = val;
      }
    });
    return result;
  }

  private static weaponAttackOverrides: Map<string, any> = new Map();

  // Claves que empiezan con "_" son entradas pendientes/comentario — se ignoran.
  public static loadWeaponAttackOverrides(data: Record<string, any>) {
    Object.entries(data).forEach(([key, val]) => {
      if (!key.startsWith('_')) this.weaponAttackOverrides.set(key, val);
    });
  }

  private static resolveMultishot(raw: any, attackName: string, index: number): number {
    const override = this.weaponAttackOverrides.get(raw.unique_name);
    if (override?.attacks?.[attackName]?.multishot !== undefined) {
      return override.attacks[attackName].multishot;
    }
    return index === 0 ? (raw.stats.multishot ?? 1) : 1;
  }

  // El raw expone punch_through por ataque pero vale 0 en TODO el dataset (verificado 2026-06-10),
  // incluso para innatos (Lanka 5.0m charged, Zenith ~infinito). Los innatos viven en
  // weapon-stats.override.json per-ataque; el raw queda de fallback por si aguas arriba se puebla.
  private static resolvePunchThrough(raw: any, attackName: string, rawValue?: number): number {
    const override = this.weaponAttackOverrides.get(raw.unique_name);
    if (override?.attacks?.[attackName]?.punch_through !== undefined) {
      return override.attacks[attackName].punch_through;
    }
    return rawValue ?? 0;
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
