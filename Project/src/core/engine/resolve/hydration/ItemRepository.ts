/**
 * @domain Simulation-v2 / Logic / Data
 * @status en-desarrollo
 */

import type { MutatedDNA, CoBehavior } from "../../contracts";
import { normalizeDamageType } from "@shared/types";
import { damageTokenFromType } from "../../contracts/damage-logic";

export class ItemRepository {
  private static weaponItems: Map<string, any> = new Map();
  private static warframeItems: Map<string, any> = new Map();

  private static loadInto(target: Map<string, any>, data: any[]) {
    if (!Array.isArray(data)) return;
    data.forEach(item => {
      if (item.unique_name) {
        target.set(item.unique_name, item);
      }
    });
  }

  /** Carga un bloque de armas en el repositorio. */
  public static loadWeapons(data: any[]) {
    this.loadInto(this.weaponItems, data);
  }

  /** Carga un bloque de warframes en el repositorio. */
  public static loadWarframes(data: any[]) {
    this.loadInto(this.warframeItems, data);
  }

  /**
   * Obtiene el ADN de un item mapeado desde el dataset. No conoce el kind de
   * antemano (mismo vocabulario de ids para arma/warframe) — prueba ambos Maps.
   */
  public static getDNA(uniqueName: string): MutatedDNA | null {
    const weapon = this.weaponItems.get(uniqueName);
    if (weapon) return this.normalizeWeapon(weapon);

    const warframe = this.warframeItems.get(uniqueName);
    if (warframe) return this.normalizeWarframe(warframe);

    return null;
  }

  /**
   * Merge raw→DNA de un warframe: stats base de avatar (no tiene ataques). El raw
   * expone health/shield/armor/energy reales (mismo molde que `flight` de
   * projectile_speed — dato en fuente, sin override). Cada nodo usa el attr del
   * token ADD como id, para que mods (%) y shards (flat) compongan sobre la misma
   * base — fórmula `Total = Base × (1 + Mods%) + Flat` (ver armor.md, UPGRADE_MAP).
   * Los 4 stats de habilidad nacen con base 100 (100% = sin mods); no conozco excepción.
   */
  private static normalizeWarframe(raw: any): MutatedDNA {
    const s = raw.stats ?? {};
    const profiles: Record<string, Record<string, number>> = {
      base: {
        AVATAR_ADD_HEALTH_MAX:        s.health ?? 0,
        AVATAR_ADD_SHIELD_MAX:        s.shield ?? 0,
        AVATAR_ADD_ARMOUR:            s.armor  ?? 0,
        AVATAR_ADD_ENERGY_MAX:        s.energy ?? 0,
        AVATAR_ADD_ABILITY_STRENGTH:   100,
        AVATAR_ADD_ABILITY_RANGE:      100,
        AVATAR_ADD_ABILITY_DURATION:   100,
        AVATAR_ADD_ABILITY_EFFICIENCY: 100,
      },
    };

    return {
      entity_id: raw.unique_name,
      domain: raw.domain,
      kind: raw.kind,
      family: raw.family,
      tags: [raw.domain, raw.kind, raw.family, ...(raw.tags || [])].filter(Boolean),
      profiles,
    };
  }

  /** Merge raw→DNA de un arma: combina `attacks[]` + overrides + fallback en los perfiles finales. */
  private static normalizeWeapon(raw: any): MutatedDNA {
    const profiles: Record<string, Record<string, number>> = {};
    // Cadencia: DOS stats distintos que el raw ya trae separados (`attack.speed` en melee vs
    // `stats.fire_rate` en guns) y que DE colapsa en un único token upstream. El nodo se
    // materializa según el dominio del arma — una espada NO tiene `WEAPON_ADD_FIRE_RATE` y un
    // rifle NO tiene `MELEE_ADD_ATTACK_SPEED`. No es un gate de conveniencia: son atributos de
    // familias distintas (D-6), y el token declara dónde vive el nodo.
    const isMelee = raw.kind === 'melee';
    const speedNode = (speed: number): Record<string, number> => isMelee
      ? { MELEE_ADD_ATTACK_SPEED: speed }
      : { WEAPON_ADD_FIRE_RATE:   speed };
    // Metadata cualitativa por perfil (agnóstica al modo estático/dinámico): a qué bucket
    // compone un bonus CO/GunCO en este ataque. Ausencia de entrada = gap (no se asume).
    const co_behavior: Record<string, CoBehavior> = {};
    // Sniper Shot Combo: `min_combo` (hits para activar el multiplier) NO está en @wfcd — viene
    // del override como dato por-arma. Se inyecta como dato puro en cada perfil (como reload_time,
    // NO es un token D-6 → createBaseEntity no lo hace nodo). Ver references/wiki/mechanics/sniper-combo.md.
    const minCombo = this.weaponAttackOverrides.get(raw.unique_name)?.min_combo;

    // Mapear ataques a perfiles
    if (raw.stats?.attacks && raw.stats.attacks.length > 0) {
      raw.stats.attacks.forEach((attack: any, index: number) => {
        const profile_name = (attack.name || 'default').toLowerCase().replace(/ /g, '_');
        const damage_map = this.mapDamage(attack.damage);
        const damage_sum = Object.values(damage_map).reduce((s, v) => s + v, 0);

        const cob = this.resolveCoBehavior(raw, attack.name ?? '', attack.shot_type);
        if (cob !== undefined) co_behavior[profile_name] = cob;

        profiles[profile_name] = {
          WEAPON_ADD_CRIT_CHANCE:  (attack.crit_chance ?? raw.stats.crit_chance ?? 0) * 100,
          WEAPON_ADD_CRIT_MULT:    attack.crit_mult ?? raw.stats.crit_mult ?? 0,
          WEAPON_ADD_STATUS_CHANCE:(attack.status_chance ?? raw.stats.status_chance ?? 0) * 100,
          ...speedNode(attack.speed ?? raw.stats.fire_rate ?? 0),
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
        const firstKey = Object.keys(profiles)[0];
        profiles['base'] = profiles[firstKey];
        // Espejo del alias 'base' para co_behavior (el default active_profile_id es 'base').
        // Sin esto, el lookup co_behavior['base'] daría gap y dropearía el bonus CO en silencio.
        if (co_behavior[firstKey] !== undefined) co_behavior['base'] = co_behavior[firstKey];
      }
    } else if (raw.stats) {
      // Fallback a nivel superior si no hay ataques detallados
      const damage_map_fallback = this.mapDamage(raw.stats.damage);
      const damage_sum_fallback = Object.values(damage_map_fallback).reduce((s, v) => s + v, 0);
      profiles['base'] = {
        WEAPON_ADD_CRIT_CHANCE:  (raw.stats.crit_chance ?? 0) * 100,
        WEAPON_ADD_CRIT_MULT:    raw.stats.crit_mult ?? 0,
        WEAPON_ADD_STATUS_CHANCE:(raw.stats.status_chance ?? 0) * 100,
        ...speedNode(raw.stats.fire_rate ?? 0),
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

    if (minCombo !== undefined) {
      Object.values(profiles).forEach(p => { p.min_combo = minCombo; });
    }

    return {
      entity_id: raw.unique_name,
      domain: raw.domain,
      kind: raw.kind,
      family: raw.family,
      tags: [raw.domain, raw.kind, raw.family, ...(raw.tags || [])].filter(Boolean),
      profiles,
      ...(Object.keys(co_behavior).length > 0 ? { co_behavior } : {}),
    };
  }

  private static mapDamage(damage: any): Record<string, number> {
    const result: Record<string, number> = {};
    if (!damage) return result;

    Object.entries(damage).forEach(([key, val]) => {
      if (typeof val !== 'number' || val <= 0) return;
      // Consumir el vocabulario CANÓNICO (@shared): `normalizeDamageType` valida + resuelve alias
      // (fire→heat, poison→toxin), `damageTokenFromType` proyecta al token D-6. Una key que no sea un
      // DamageType real (`cinematic`/`shieldDrain`/`total`/… en el raw) se DROPEA — antes el transform
      // a ciegas `WEAPON_ADD_${key.toUpperCase()}_DAMAGE` generaba un token fantasma que inflaba
      // `damage_sum`. Verificado (2026-07-12): esas keys nunca son > 0 en el dataset → red de
      // seguridad, sin cambio de comportamiento sobre el dato actual.
      const type = normalizeDamageType(key);
      if (type) result[damageTokenFromType(type)] = val;
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

  // Clasifica CÓMO compone un bonus CO/GunCO sobre este ataque. Mismo patrón que
  // resolveMultishot: override explícito → heurística → gap. El override
  // (weapon-stats.override.json, campo co_behavior) es TERMINAL — cualquier valor,
  // incluido 'none', gana y no cae a la heurística. Solo la ausencia total de la clave
  // dispara el default. La tabla por shot_type es de GUNS: Adding (hitscan) / Multiplying
  // (projectile) / Does not apply (AoE radial, ej. Cedo glaive). Es señal, no ley — un override
  // corrige la excepción (ej. Paris Charged Shot: Projectile pero Adding). Ver references/wiki/mechanics/condition-overload.md.
  private static resolveCoBehavior(raw: any, attackName: string, shotType?: string): CoBehavior | undefined {
    const override = this.weaponAttackOverrides.get(raw.unique_name);
    const ov = override?.attacks?.[attackName]?.co_behavior;
    if (ov !== undefined) return ov;

    // Melee: CO es 'adding' SIEMPRE (comunidad: "con Condition Overload, Pressure Point está de
    // más" — se apilan aditivos). NO cae al switch por shot_type: el heavy slam es shot_type=AoE
    // pero el CO melee NO es gun-AoE-radial (que sí es 'none'). Va ANTES del switch a propósito —
    // el AoE→none es lógica de guns, no de melee. El 0.1% de excepción lo cubre el override terminal.
    // (Bug corregido 2026-07-05: el slam melee caía en AoE→none heredando la regla gun.)
    if (raw.kind === 'melee') return 'adding';

    switch (shotType) {
      case 'Hit-Scan':   return 'adding';
      case 'Projectile': return 'multiplying';
      case 'AoE':        return 'none';
    }
    return undefined; // gap: sin shot_type reconocido, no se asume
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
    return this.weaponItems.get(uniqueName) ?? this.warframeItems.get(uniqueName) ?? null;
  }

  public static findByName(name: string): any | null {
    for (const item of this.weaponItems.values()) {
      if (item.name === name) return item;
    }
    for (const item of this.warframeItems.values()) {
      if (item.name === name) return item;
    }
    return null;
  }

  public static getAllNames(): string[] {
    return [
      ...Array.from(this.weaponItems.values()).map(i => i.name),
      ...Array.from(this.warframeItems.values()).map(i => i.name),
    ];
  }
}
