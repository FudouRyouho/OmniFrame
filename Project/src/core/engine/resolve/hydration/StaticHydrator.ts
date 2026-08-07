/**
 * @domain Simulation-v2 / Logic / Hydration
 * @status en-desarrollo
 */

import { makeModifier, type Ensemble, type MutatedDNA, type SimulationEntity, type AttributeNode, type Modifier } from "../../contracts";
import { ModRepository } from "./ModRepository";
import { ShardRepository } from "./ShardRepository";
import { IncarnonRepository } from "./IncarnonRepository";
import { ArcaneRepository } from "./ArcaneRepository";
import { AbilityRepository } from "./AbilityRepository";
import { resolveChannelEntities, resolveFamilyEntities } from "./channel-routing";
import { populateFromLoadout } from "./space";
import { isUpgrade } from "@shared/types/modifier";

import { DamageCombiner, PHYSICAL_TYPES, type ElementalMod } from "./DamageCombiner";
import { isWeaponDamageToken, damageTypeFromToken, GLOBAL_DAMAGE_POOLS } from "../../contracts/damage-logic";
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

    // Quién participa lo decide el ESPACIO, no el hidratador (`space.ts`). Hoy el único poblador es
    // el loadout; el punto de la separación es que pueda no serlo.
    const intents = populateFromLoadout(ensemble);

    // 2. Hydrate Entities and Modifiers
    intents.forEach(intent => {
      const dna = dnas[intent.entity_id];
      if (!dna) return;

      const entity = this.createBaseEntity(dna, intent.profile_id);
      entity.channel = intent.channel;
      // Las marcas las declara el ESPACIO (`space.ts`), no el ítem: quién recibe qué es una
      // propiedad de participar, no de la taxonomía del arsenal.
      entity.routes = [...intent.routes];
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
      // Se computa en la hidratación (no en el seam/deriveInstance): es el último punto donde existen los
      // combination_mods; el seam lo consume como output de C1 (simulation-architecture §2.0.1).
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

    // OQ-ENGINE-4: Consumer loop de Archon Shards. El shard nace en el warframe; si su token trae
    // sub-familia, el `target_channel` lo redirige en la pasada de ruteo de abajo — igual que un
    // arcano o un mod. Acá ya no se resuelve el canal: hacerlo era la razón de que el ruteo
    // existiera una sola vez y solo para shards.
    ensemble.warframe.shards.forEach(shard => {
      const resolved = ShardRepository.resolve(shard.type, shard.stat, shard.is_tau ?? false);
      if (!resolved) return;

      modifiers.push(makeModifier(
        {
          id: `shard:${shard.type}:${shard.stat}`,
          source_id: `Shard:${shard.type}`,
          target_entity: ensemble.warframe.id,
          target_channel: resolved.target_channel,
          target_attribute: resolved.attr,
        },
        resolved.op,
        resolved.value,
      ));
    });

    // Habilidades activas del warframe (verbo muta-state, arch §15). Fan-out cross-entity:
    // el buff nace en el warframe (source, de donde se lee el scaling × Ability Strength) y
    // aterriza en las ARMAS equipadas (targets, donde vive el pool de facción — Roar es
    // ALL-scope). Corre acá, POST-loop, por la misma razón que los shards: necesita todas
    // las entidades construidas para conocer los ids de arma. El source-state vivo (duración)
    // = gate G-a diferido; hoy la ability es asumida-activa (proyección estática, §15).
    // El destino ya no se precomputa: cada token del `.md` declara su propio `{cuál}` y el repo
    // lo resuelve contra las entidades construidas (`channel-routing`). Un buff de habilidad puede
    // aterrizar en el warframe mismo (`AVATAR_ADD_MOVEMENT_SPEED`), en una sola arma
    // (`MELEE_ADD_ATTACK_SPEED`) o en todas (`WEAPON_ADD_RELOAD_SPEED` — el ALL-scope de Roar).
    (ensemble.warframe.abilities || []).forEach(ability => {
      modifiers.push(...AbilityRepository.getModifiers(ability.ability_id, ensemble.warframe.id, entities));
    });

    // ── Ruteo por canal — pasada ÚNICA sobre todos los modifiers ────────────────────────
    // El `{cuál}` se resuelve acá, en un solo lugar y agnóstico a la fuente (shard, arcano, mod).
    // Antes vivía dentro del loop de shards: por eso un arcano de warframe con canal apuntaba al
    // nodo del warframe —que no tiene `WEAPON_ADD_DAMAGE`— y se perdía en silencio.
    //
    // El motor NO rutea por canal: filtra por `target_entity`. Esta pasada es la que convierte el
    // canal en entidad, así que después de acá ningún modifier conserva `target_channel` sin
    // resolver. Un canal puede alcanzar N entidades (ver `channel-routing.ts`) ⇒ fan-out: un
    // modifier por entidad alcanzada, con id derivado para no colisionar en el trace.
    const routed: Modifier[] = [];
    const entityById = new Map(entities.map(e => [e.id, e]));
    for (const m of modifiers) {
      if (!m.target_channel) {
        // Sin canal, el modifier se quedó donde NACIÓ — que para un mod es la entidad en cuyo slot
        // está montado. Eso alcanza mientras el token pertenezca a esa entidad, y **no siempre
        // pertenece**: un puñado de mods de arma emiten stats del warframe que los porta (Amalgam
        // Serration da Sprint Speed desde un rifle; Dispatch Overdrive, Movement Speed desde una
        // melee). Un arma no tiene —ni puede tener— nodos `AVATAR_*`, así que sin este salto el
        // buff muere en el arma: con el nodo YA materializado, Dispatch Overdrive no hacía nada.
        //
        // El salto se limita a **portador-arma**: un compañero también emite `AVATAR_*` (los 14
        // mods de Sentinel: `Enhanced Vitality` → `AVATAR_ADD_HEALTH_MAX`) y ahí el avatar es ÉL,
        // no el warframe — rutearlo sería un bug peor que el que esto arregla. Hoy no se
        // construyen entidades de compañero, así que el caso no puede darse; cuando se construyan,
        // la regla se decide con ese dato en la mano y no por anticipación.
        const holder = entityById.get(m.target_entity);
        if (holder?.domain === 'weapon' && m.target_attribute.startsWith('AVATAR_')) {
          for (const id of resolveFamilyEntities('AVATAR', entities)) {
            routed.push({ ...m, target_entity: id });
          }
          continue;
        }
        routed.push(m);
        continue;
      }
      const targetIds = resolveChannelEntities(m.target_channel, entities);
      // Canal vacío (sin arma equipada en ese slot) ⇒ se descarta, como hacía el loop de shards.
      for (const id of targetIds) {
        routed.push({
          ...m,
          id: targetIds.length > 1 ? `${m.id}@${id}` : m.id,
          target_entity: id,
          target_channel: undefined,
        });
      }
    }

    this.reportUnlandedModifiers(entities, routed);
    return { entities, modifiers: routed };
  }

  /**
   * Tripwire del estado **"acuñado sin nodo"** (`semantic/upgrade-tokens.md`): un token puede vivir
   * en `UPGRADES` y no tener nodo en ninguna entidad. Sin este reporte ese estado es
   * **indistinguible de un bug**: `SimulationEngine.resolveNode` hace `if (!node) return`, así que un
   * modifier bien formado, con token válido y entidad correcta, se descarta sin dejar rastro.
   *
   * Es el complemento del warn de `ModRepository` y dice lo contrario: aquél reporta *"no sé qué es
   * este token"*, éste *"sé qué es y no lo modelo"*. Los dos son **feedback del token**, no
   * conocimiento del engine sobre la mecánica — el motor no infiere ni inventa el nodo faltante.
   *
   * Corre **después del ruteo por canal** a propósito: antes, todo buff cross-entity (Roar, arcanos
   * con canal) está transitoriamente apuntando a una entidad que no tiene su nodo, y el reporte
   * gritaría en falso sobre el caso legítimo.
   *
   * Agrupa por `entidad + nodo` para que N mods hacia el mismo hueco sean un renglón y no N.
   */
  private static reportUnlandedModifiers(entities: SimulationEntity[], modifiers: Modifier[]): void {
    const byEntity = new Map(entities.map(e => [e.id, e]));
    const unlanded = new Map<string, Set<string>>();
    // Un buff ALL-scope se abre en N modifiers, uno por arma alcanzada: el reload de Volt Speed
    // llega al rifle Y a la melee, y la melee **no tiene** nodo de recarga porque no recarga. Eso
    // no es un hueco — es el fan-out haciendo su trabajo. Se reporta sólo si NINGUNA instancia
    // encontró destino, que es cuando el buff realmente no rinde.
    //
    // La instancia se identifica por `source + atributo`, NO por el id: hay **dos** mecanismos de
    // fan-out y cada uno lo codifica distinto (`StaticHydrator` sufija `@entidad`,
    // `AbilityRepository` sufija `:targetId`). Parsear el id ataría este chequeo al formato de
    // quien lo emite; el par source+atributo vale para los dos y para el que venga.
    const landed = new Set(
      modifiers
        .filter(m => byEntity.get(m.target_entity)?.attributes[m.target_attribute])
        .map(m => `${m.source_id ?? m.id}::${m.target_attribute}`),
    );

    for (const m of modifiers) {
      const entity = byEntity.get(m.target_entity);
      // Entidad ausente = slot vacío, no es este caso: el ruteo ya descarta canales sin arma.
      if (!entity || entity.attributes[m.target_attribute]) continue;
      if (landed.has(`${m.source_id ?? m.id}::${m.target_attribute}`)) continue;
      const key = `${m.target_attribute} en ${entity.id}`;
      if (!unlanded.has(key)) unlanded.set(key, new Set());
      unlanded.get(key)!.add(m.source_id ?? m.id);
    }

    for (const [key, sources] of unlanded) {
      console.warn(`[Hydration] Token conocido sin nodo: ${key} — ${sources.size} modifier(s) sin aterrizar: ${[...sources].join(', ')}`);
    }
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
        mods_add_pct: 0,
        total_flat: 0,
        multiplicative: 1.0,
        final: value,
      };
    });

    // Sembrar el nodo baseline de cada pool de daño GLOBAL — derivado de la SSoT única
    // (GLOBAL_DAMAGE_POOLS en damage-logic), NO de literales sueltos: agregar un 3er pool = una línea
    // allá, y las aristas/reads del engine ya derivan del mismo array (F1-D). base 100 = 100% neutro
    // (vacío ⇒ factor 1.0). Solo armas: un warframe no tiene nodo de daño de arma (hack de composición
    // conocido, gap del engine — no es ley universal). El WHY de cada pool (Serration Step 1 · Roar/Bane
    // Step 3 · el subconjunto que lee el DoT, OQ-20) vive en la SSoT. El guard `!attributes[pool]`
    // respeta el nodo que ya vino del perfil (WEAPON_ADD_DAMAGE = damage_sum del arma).
    const isWarframe = dna.kind === 'warframe';
    if (!isWarframe) {
      for (const pool of GLOBAL_DAMAGE_POOLS) {
        if (attributes[pool]) continue;
        attributes[pool] = {
          base: 100, base_flat: 0, mods_add_pct: 0, total_flat: 0, multiplicative: 1.0, final: 100,
        };
      }
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
