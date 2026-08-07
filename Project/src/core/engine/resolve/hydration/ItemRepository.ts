/**
 * @domain Simulation-v2 / Logic / Data
 * @status en-desarrollo
 */

import type { MutatedDNA, CoBehavior } from "../../contracts";
import { normalizeDamageType } from "@shared/types";
import { damageTokenFromType } from "../../contracts/damage-logic";
import { scaleHealth, scaleArmor, scaleShields } from "../../formulas/enemy/enemy-scaling";

/**
 * Precisión de un ataque sin dispersión (`min_spread == max_spread == 0`). No es un default
 * inventado: es el valor que publica la propia fuente para ese caso, donde la identidad
 * `100 / ((min+max)/2)` daría infinito.
 */
const PERFECT_ACCURACY = 100;

export class ItemRepository {
  private static weaponItems: Map<string, any> = new Map();
  private static warframeItems: Map<string, any> = new Map();
  private static companionItems: Map<string, any> = new Map();
  private static enemyItems: Map<string, any> = new Map();

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

  /** Carga un bloque de enemigos en el repositorio (sólo para participar del espacio). */
  public static loadEnemies(data: any[]) {
    this.loadInto(this.enemyItems, data);
  }

  /** Carga un bloque de compañeros en el repositorio. */
  public static loadCompanions(data: any[]) {
    this.loadInto(this.companionItems, data);
  }

  /**
   * Obtiene el ADN de un item mapeado desde el dataset. No conoce el kind de
   * antemano (mismo vocabulario de ids para arma/warframe) — prueba ambos Maps.
   *
   * `level` es la parte de la intención que compone el frame-0 y que el raw no puede saber. Sólo la
   * declara el grupo Hostil; para el resto de los moldes no significa nada y no se pasa. No hay caché
   * que colisione: cada llamada normaliza desde el raw, así que el mismo enemigo a dos niveles son
   * dos composiciones y no dos entradas peleando por una clave.
   */
  public static getDNA(uniqueName: string, level?: number): MutatedDNA | null {
    const weapon = this.weaponItems.get(uniqueName);
    if (weapon) return this.normalizeWeapon(weapon);

    const warframe = this.warframeItems.get(uniqueName);
    if (warframe) return this.normalizeWarframe(warframe);

    const companion = this.companionItems.get(uniqueName);
    if (companion) return this.normalizeCompanion(companion);

    const enemy = this.enemyItems.get(uniqueName);
    if (enemy) return this.normalizeEnemy(enemy, level);

    return null;
  }

  /**
   * IDENTIDAD DE UNA ENTIDAD — la parte del DNA que no depende de qué clase de cosa sea.
   *
   * POR QUÉ EXISTE. `normalizeWarframe` y `normalizeWeapon` terminaban con el MISMO epílogo copiado,
   * y `normalizeEnemy` con una tercera variante escrita a mano que ya divergía (armaba `tags` con
   * otro criterio). Eran tres respuestas distintas a una pregunta que no depende de la entidad:
   * *cómo se llama, qué taxonomía porta, qué la etiqueta*. Lo que SÍ depende de la entidad es qué
   * nodos materializa — y eso es el `profiles` que cada molde le pasa.
   *
   * `domain`/`kind`/`family` quedan ausentes si el raw no los trae: un enemigo no es un ítem del
   * arsenal y no se le inventa una taxonomía que el pipeline no le dio.
   */
  private static normalizeEntity(
    raw: any,
    profiles: Record<string, Record<string, number>>,
    extra: Partial<MutatedDNA> = {},
  ): MutatedDNA {
    return {
      entity_id: raw.unique_name,
      ...(raw.domain ? { domain: raw.domain } : {}),
      ...(raw.kind   ? { kind:   raw.kind   } : {}),
      ...(raw.family ? { family: raw.family } : {}),
      tags: [raw.domain, raw.kind, raw.family, ...(raw.tags || [])].filter(Boolean),
      profiles,
      ...extra,
    };
  }

  /**
   * NÚCLEO VITAL — los stats que porta cualquier cosa del lado del jugador que puede morir.
   *
   * Warframe y compañero comparten los tres, y el token declara el dominio del STAT, no la
   * naturaleza de quien lo porta: la armadura de un Kavat se acumula igual que la de un warframe
   * (`references/wiki/warframes/valkyr/warcry.md`).
   *
   * **Gate por presencia, no `?? 0`.** Un stat ausente NO se materializa. La diferencia importa: un
   * nodo con base 0 acepta un buff porcentual y devuelve 0, que es un número falso presentado como
   * verdadero; sin nodo, el buff no aterriza y el tripwire de `StaticHydrator` lo grita. Es el mismo
   * criterio que el gate `flight != null` de projectile speed — ausencia ≠ 0.
   */
  private static vitalsProfile(s: any): Record<string, number> {
    const p: Record<string, number> = {};
    if (s.health != null) p.AVATAR_ADD_HEALTH_MAX = s.health;
    if (s.shield != null) p.AVATAR_ADD_SHIELD_MAX = s.shield;
    if (s.armor  != null) p.AVATAR_ADD_ARMOUR     = s.armor;
    return p;
  }

  /**
   * Merge raw→DNA de un compañero: núcleo vital y nada más.
   *
   * Antes reusaba `normalizeWarframe` entero, y eso le daba al Kavat cuatro nodos de habilidad con
   * base 100 y un `AVATAR_ADD_ENERGY_MAX` de 0. Ninguno es real —un compañero no tiene fuerza de
   * habilidad ni gasta energía— y los cuatro aceptaban modifiers en silencio. Derivar por molde en
   * vez de heredar el del warframe es lo que corrige eso.
   */
  private static normalizeCompanion(raw: any): MutatedDNA {
    return this.normalizeEntity(raw, { base: this.vitalsProfile(raw.stats ?? {}) });
  }

  /**
   * Merge raw→DNA de un enemigo. Mismos tres stats vitales, **otra familia de token**: esa
   * distinción es la que impide que un buff `AVATAR_*` de warframe aterrice sobre un enemigo por
   * parecido de nombre.
   *
   * El raw de `enemies.json` los expone planos (`raw.health`), no bajo `stats`. Mismo gate por
   * presencia que el núcleo vital.
   *
   * **NACER ES ESTAR COMPUESTO.** Con `level` declarado, los tres nacen ya escalados por la curva-S:
   * un enemigo no existe primero y se escala después, igual que un warframe no nace desnudo para que
   * le pongan los mods encima. El nivel es frame-0, no una capa posterior
   * (`simulation-architecture.md` §*Los dos pobladores no son espejos*).
   *
   * Es el paso **7** de la cadena del hostil (`references/wiki/mechanics/enemy-level-scaling.md`), y
   * el único modelado: Steel Path (2 y 5), Empowered (3 y 6) y Eximus (4) van ANTES de la curva y no
   * tienen dato en el corpus — el orden importa y por eso está nombrado acá, aunque hoy sólo se
   * ejecute un paso.
   */
  private static normalizeEnemy(raw: any, level?: number): MutatedDNA {
    const dx = level != null ? Math.max(0, level - (raw.base_level ?? 1)) : 0;
    const p: Record<string, number> = {};
    if (raw.health  != null) p.ENEMY_ADD_HEALTH_MAX = scaleHealth(raw.health, raw.faction, dx);
    if (raw.armor   != null) p.ENEMY_ADD_ARMOUR     = scaleArmor(raw.armor, dx);
    if (raw.shields != null) p.ENEMY_ADD_SHIELD_MAX = scaleShields(raw.shields, raw.faction, dx);
    return this.normalizeEntity(raw, { base: p }, {
      tags: ['enemy', raw.faction].filter(Boolean),
    });
  }

  /**
   * Merge raw→DNA de un warframe: núcleo vital + lo que es exclusivo de un avatar de jugador
   * (energía, los cuatro stats de habilidad, movilidad). No tiene ataques.
   *
   * Cada nodo usa el attr del token ADD como id, para que mods (%) y shards (flat) compongan sobre
   * la misma base — fórmula `Total = Base × (1 + Mods%) + Flat` (ver armor.md, UPGRADE_MAP).
   * Los 4 stats de habilidad nacen con base 100 (100% = sin mods); no conozco excepción.
   */
  private static normalizeWarframe(raw: any): MutatedDNA {
    const s = raw.stats ?? {};
    const base: Record<string, number> = {
      ...this.vitalsProfile(s),
      AVATAR_ADD_ENERGY_MAX:        s.energy ?? 0,
      // Sprint Speed: stat DISTINTO de MOVEMENT pese al nombre del raw. Base sintética 100 —
      // el sprint no tiene valor nato propio, se DERIVA del walk (`sprint = walk × 1.25 ×
      // (1 + Σ bonos)`, movement-speed.md), así que lo que el nodo acumula es el `Σ bonos` y
      // los `m/s` son una derivación cross-stat que hoy nadie pide.
      // Sus 9 mods se equipan en cinco slots distintos y 3 no aplican al warframe: Sprint Boost
      // es de aura y dice "Squad receives" (aliados, no modelados), Runtime es de Parazon (slot
      // fuera de scope) e Hyperion Thrusters es de Archwing — ese último aterriza igual y es
      // ruido aceptado, porque el token crudo de DE es el mismo que el de Rush (ver sus notes).
      AVATAR_ADD_SPRINT_SPEED:      100,
      // Parkour Velocity (localizado *"Bullet Jump"*) gobierna bullet jump, double jump, rolling
      // y springs — ni movement ni sprint lo tocan. El raw NO trae dato base y no puede traerlo:
      // no hay parkour por-warframe, todos parten del mismo 100%. Base **sintética**, mismo molde
      // que `WEAPON_ADD_RELOAD_SPEED` y los 4 stats de habilidad: 100 = sin mods, y el `+15%` del
      // shard ámbar lee `115`. El discriminador contra `MOVEMENT_SPEED` (base 1.0, escala) es que
      // aquél SÍ tiene dato en el raw y varía por frame (Gauss 1.4 · Volt 1.0).
      AVATAR_ADD_PARKOUR_VELOCITY:  100,
      // Aim Glide: base **3 segundos**, y acá el 3 NO es sintético — sale de la fuente
      // (`maneuvers §Aim Glide`). El discriminador con el 100 de arriba es ése: cuando la
      // fuente da la base, se usa y el nodo lee en su unidad real (segundos); cuando no la hay
      // ni puede haberla, base 100 = "sin mods". El resultado se lee `3 → 3.6s` con un +20%,
      // no `100 → 120`.
      // El token gobierna **dos** duraciones ("Aim Glide/Wall Latch Duration") con bases
      // distintas: aim glide 3s, wall latch 6s, timer compartido. El nodo modela la primera.
      AVATAR_ADD_AIM_GLIDE_DURATION: 3,
      AVATAR_ADD_ABILITY_STRENGTH:   100,
      AVATAR_ADD_ABILITY_RANGE:      100,
      AVATAR_ADD_ABILITY_DURATION:   100,
      AVATAR_ADD_ABILITY_EFFICIENCY: 100,
    };

    // `sprint_speed` del raw NO es velocidad de sprint: es el modificador base de MOVEMENT
    // speed. La wiki lo dice literal — *"A Warframe's base Sprint Speed Stat is not a direct
    // modifier to its sprint speed, but is actually the Warframes base Movement Speed
    // modifier"* — y los bonos de Sprint Speed (Rush) no lo tocan aunque suban el número que
    // el arsenal muestra. Mismo patrón que `fire_rate` en melee: DE nombra una cosa y la
    // mecánica es otra, y el token declara la verdad, no el raw. Base 1.0 = 6 m/s de walk
    // speed; sprintar suma 25% aparte. Ver references/wiki/mechanics/movement-speed.md.
    // Gate por presencia (ausencia ≠ 0): sin dato, un buff de movimiento daría 0 en vez de gritar.
    if (s.sprint_speed != null) base.AVATAR_ADD_MOVEMENT_SPEED = s.sprint_speed;

    return this.normalizeEntity(raw, { base });
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
    // Cargador, recarga y recoil NO son atributos universales de "arma": son del dominio de las
    // armas de fuego. Mismo criterio que `speedNode` (D-6: el token declara dónde vive el nodo) y
    // que el gate `flight != null` de projectile speed. El discriminador difiere por naturaleza:
    //   - cargador/recarga vienen del raw → gate por PRESENCIA. Un `?? 0` inventa un cargador de 0
    //     balas en una espada (0/224 melee traen el dato) y, peor, tapa en silencio el hueco de las
    //     armas de fuego cuyo dato falta upstream (kitguns ensamblados, armas de compañero, Nataruk).
    //   - `WEAPON_ADD_RELOAD_SPEED` es base sintética (100% = sin mods, no hay dato que consultar):
    //     se ata a la presencia de aquello que modula, `reload_time`. El par lo declara UPGRADE_MAP.
    //   - `WEAPON_ADD_RECOIL` no tiene dato público (interno de DE) ni contraparte en el raw que lo
    //     gatee: el único discriminador posible es el dominio. Una espada no tiene retroceso. Base
    //     sintética 100 (recoil relativo, % sobre el nato); nodo inerte hasta definir modelado/UI —
    //     OQ-ENGINE-7. Ver references/wiki/mechanics/recoil.md.
    const firearmNodes: Record<string, number> = {};
    if (raw.stats?.magazine_size != null) firearmNodes.WEAPON_ADD_MAGAZINE_MAX = raw.stats.magazine_size;
    if (raw.stats?.reload_time != null) {
      firearmNodes.reload_time             = raw.stats.reload_time;
      firearmNodes.WEAPON_ADD_RELOAD_SPEED = 100;
    }
    if (!isMelee) firearmNodes.WEAPON_ADD_RECOIL = 100;
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
          ...firearmNodes,
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

        // Accuracy: mismo gate por ausencia ≠ 0 (un base 0 daría precisión nula), pero la base
        // sale del PAR de dispersión del ataque, no del escalar del arma. Los dos consumidores
        // vivos del token son perks de forma Incarnon, y en ambos la forma tiene precisión propia
        // que el escalar colapsado no puede expresar: Boltor Prime vale 50 en su ataque normal y
        // 10 en Incarnon. Con el escalar, `hunters_mantra` mejoraría una base cinco veces
        // equivocada. Ver data/schemas/weapons/weapons-attack-structure.md.
        const accuracy = this.resolveAccuracy(raw, attack);
        if (accuracy != null) {
          profiles[profile_name].WEAPON_ADD_ACCURACY = accuracy;
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
        ...firearmNodes,
        WEAPON_ADD_DAMAGE:       damage_sum_fallback || 100,
        ...damage_map_fallback
      };

      const accuracy = this.resolveAccuracy(raw, null);
      if (accuracy != null) profiles['base'].WEAPON_ADD_ACCURACY = accuracy;
    }

    if (minCombo !== undefined) {
      Object.values(profiles).forEach(p => { p.min_combo = minCombo; });
    }

    return this.normalizeEntity(raw, profiles,
      Object.keys(co_behavior).length > 0 ? { co_behavior } : {});
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

  /**
   * Precisión base del ataque. Cascada de dos fuentes del MISMO stat, de la más fiel a la más
   * pobre: el par de dispersión del ataque (`100 / ((min + max) / 2)`, la identidad que publica
   * la wiki) y, si no está, el escalar del arma — que es ese mismo promedio ya colapsado por el
   * export, y por eso no distingue entre ataques.
   *
   * Devuelve `null` cuando ninguna de las dos existe: ausencia ≠ 0, y 0 sería precisión nula.
   * Las melee no lo tienen (salvo gunblades) y los modulares tampoco, por eso el gate.
   *
   * **Un par de ceros NO cae al escalar.** `0/0` es dato, no ausencia: significa cono nulo, o sea
   * puntería perfecta, y la identidad daría infinito. La fuente resuelve ese caso publicando `100`
   * (64 de las 66 armas cuyo único spread es `0/0` lo declaran así), y eso es lo que se usa.
   * Caer al escalar del arma ahí sería un error silencioso y grave: en un arma multi-ataque el
   * escalar pertenece al ataque que SÍ dispersa, y el Incarnon del Boar Prime —perfecto— heredaría
   * el 5 de la escopeta base. Plausible y falso, que es peor que ausente.
   */
  private static resolveAccuracy(raw: any, attack: any | null): number | null {
    const min = attack?.min_spread;
    const max = attack?.max_spread;
    if (typeof min === 'number' && typeof max === 'number') {
      return min + max > 0 ? 100 / ((min + max) / 2) : PERFECT_ACCURACY;
    }
    return raw.stats?.accuracy ?? null;
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
