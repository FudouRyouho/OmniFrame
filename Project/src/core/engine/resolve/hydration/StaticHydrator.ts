/**
 * @domain Simulation-v2 / Logic / Hydration
 * @status en-desarrollo
 */

import { makeModifier, type MutatedDNA, type SimulationEntity, type AttributeNode, type Modifier } from "../../contracts";
import { ModRepository } from "./ModRepository";
import { ShardRepository } from "./ShardRepository";
import { IncarnonRepository } from "./IncarnonRepository";
import { ArcaneRepository } from "./ArcaneRepository";
import { AbilityRepository } from "./AbilityRepository";
import { resolveChannelEntities, resolveFamilyEntities, familyRoute } from "./channel-routing";
import type { MoldedIntent } from "./space";
import { isUpgrade } from "@shared/types/modifier";

import { DamageCombiner, PHYSICAL_TYPES, type ElementalMod } from "./DamageCombiner";
import { isWeaponDamageToken, damageTypeFromToken, GLOBAL_DAMAGE_POOLS } from "../../contracts/damage-logic";
import type { DamageType } from "@shared/types";

export class StaticHydrator {
  /**
   * Convierte los participantes del espacio —ya con su molde— en entidades listas para el motor.
   *
   * **NO recorre el espacio.** Quién participa lo decide `space.ts` y el molde lo cuelga B
   * (`MutatorBridge.attachMolds`); acá llegan los `MoldedIntent` ya poblados. Antes esta función
   * llamaba al poblador por su cuenta —segunda pasada sobre el mismo escenario— y leía los moldes de
   * un `Record<string, MutatedDNA>` que el bridge había llenado en la primera. El mapa existía sólo
   * para cruzar de una pasada a la otra, y su clave era colisionable (`OQ-ENGINE-36`).
   *
   * **Y ya no recibe un `Ensemble`.** Lo necesitaba por dos campos —los shards y las habilidades del
   * warframe— que eran lo único que no viajaba en el intent. Ahora viajan, y con eso la forma
   * intermedia se quedó sin su último consumidor y dejó de existir: acá se leen los nombres de la
   * `Scene` (`uniqueName`, `mods`, `effectId`…) porque son los únicos que hay.
   */
  public static hydrate(intents: MoldedIntent[]): {
    entities: SimulationEntity[],
    modifiers: Modifier[]
  } {
    const entities: SimulationEntity[] = [];
    const modifiers: Modifier[] = [];

    // 2. Hydrate Entities and Modifiers
    intents.forEach(intent => {
      // El molde viene con el participante. El `if (!dna) return` que había acá era un descarte
      // silencioso YA INALCANZABLE: `attachMolds` tira sobre el mismo recorrido antes de llegar.
      const dna = intent.dna;

      const entity = this.createBaseEntity(dna, intent.profile_id);
      entity.channel = intent.channel;
      // Las marcas las declara el ESPACIO (`space.ts`), no el ítem: quién recibe qué es una
      // propiedad de participar, no de la taxonomía del arsenal.
      entity.routes = [...intent.routes];
      if (intent.owner) entity.owner = intent.owner;
      const combination_mods: ElementalMod[] = [];
      
      // La clave del slot ordena la combinación elemental (ver `index` abajo). Que sea un índice
      // entero lo garantiza `assertSlotKeys` en el poblador; acá se lee, no se valida.
      Object.entries(intent.mods).forEach(([index_str, slot]) => {
        if (!slot.uniqueName) return;
        const index = parseInt(index_str);
        const mod_modifiers = ModRepository.getModifiers(slot.uniqueName, dna.entity_id, slot.level || 0);

        mod_modifiers.forEach(m => {
          // Add source info for Audit Trace
          const enriched_mod = { ...m, source_id: `Mod:${slot.uniqueName}` };

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
      
      // Incarnon evolution perks. La clave del map ES el tier (`entry.evolutions[tierStr]`) —
      // `assertSlotKeys` la valida en el poblador, porque una clave rota no matchea y el perk
      // desaparecería sin decir nada.
      if (intent.evolutionPerks) {
        const perk_mods = IncarnonRepository.getModifiers(intent.entity_id, intent.evolutionPerks, dna.entity_id);
        modifiers.push(...perk_mods);
      }

      // Arcanos: directo a modifiers[], SIN pasar por DamageCombiner (su daño no se
      // combina con el del arma — naturaleza distinta, como los shards). Ver ArcaneRepository.
      // Se leen por `Object.values`: la clave no participa de nada, por eso el poblador no la valida.
      if (intent.arcanes) {
        Object.values(intent.arcanes).forEach(arc => {
          modifiers.push(...ArcaneRepository.getModifiers(arc.uniqueName, arc.rank, dna.entity_id));
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

    // ── Lo que sale del PORTADOR y no de su slot ────────────────────────────────────────
    //
    // Shards y habilidades corren POST-loop porque necesitan todas las entidades construidas, y
    // salen del intent como todo lo demás. Antes se leían de `ensemble.warframe` — eran los dos
    // únicos campos que no viajaban en el intent, y por eso esta función recibía un `Ensemble`.
    //
    // Se recorren los intents en vez de asumir el warframe: hoy sólo él los declara (`WarframeIntent`
    // es el único que tiene esos campos), así que el resultado es idéntico — pero quién los porta lo
    // dice la escena, no una constante escrita acá.

    // OQ-ENGINE-4: Consumer loop de Archon Shards. El shard nace en su portador; si su token trae
    // sub-familia, el `target_channel` lo redirige en la pasada de ruteo de abajo — igual que un
    // arcano o un mod. Acá ya no se resuelve el canal: hacerlo era la razón de que el ruteo
    // existiera una sola vez y solo para shards.
    for (const intent of intents) {
      for (const shard of intent.shards ?? []) {
        const resolved = ShardRepository.resolve(shard.uniqueName, shard.effectId, shard.isTauforged);
        if (!resolved) continue;

        modifiers.push(makeModifier(
          {
            id: `shard:${shard.uniqueName}:${shard.effectId}`,
            source_id: `Shard:${shard.uniqueName}`,
            target_entity: intent.entity_id,
            target_channel: resolved.target_channel,
            target_attribute: resolved.attr,
          },
          resolved.op,
          resolved.value,
        ));
      }
    }

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
    for (const intent of intents) {
      for (const ability of intent.abilities ?? []) {
        modifiers.push(...AbilityRepository.getModifiers(ability.uniqueName, intent.entity_id, entities));
      }
    }

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
    // Alcances que existían y estaban vacíos. §18 exige descartar **y reportar**, y hasta acá el
    // reporte era de uno solo de los cuatro caminos: el cruce de bando gritaba y los otros tres se
    // llevaban el modifier sin dejar rastro. El tripwire de `reportUnlandedModifiers` no los puede
    // ver porque recorre los modifiers YA ruteados, y éstos desaparecen antes de llegar ahí.
    //
    // El motivo se guarda con el modifier porque el mensaje **no es el mismo**: nombra el alcance que
    // faltó, no el nodo — el nodo nunca llegó a estar en juego.
    const discarded: { m: Modifier; motivo: string }[] = [];
    for (const m of modifiers) {
      if (!m.target_channel) {
        // ── Cruce de bando ──────────────────────────────────────────────────────────────
        // Lo declara la FAMILIA DEL TOKEN, no el portador — y esa es la diferencia con la
        // excepción de abajo. Acuñar `ENEMY_*` sobre el `AVATAR_ARMOUR` del raw de DE **fue**
        // declarar el destino (`arch-decisions §18` §La familia del token resuelve el cruce de
        // bando): para el juego el enemigo también es un avatar; para nosotros no, y el token lo
        // dice. Por eso esto es la regla ejecutándose, no un `if` que parchea un caso.
        //
        // Vale porque en este modelo **emite un solo bando**: ningún participante hostil porta fuentes
        // propias, así que el portador siempre es del Squad y no hay bando de emisor contra el cual
        // cruzar. No es que el hostil declare menos —declara tanto, con otra forma— sino que no
        // modelamos el daño hacia el jugador (`simulation-architecture.md` §Los dos pobladores no son
        // espejos, que lleva el alcance y su fecha de caducidad).
        //
        // Sólo cruza `ENEMY_*`. Rutear por familia SIEMPRE rompería la contención: `Vitality`
        // (`AVATAR_ADD_HEALTH_MAX`, montado en el warframe) aterrizaría también en el compañero,
        // que porta la misma marca `avatar`.
        if (m.target_attribute.startsWith('ENEMY_')) {
          const targets = resolveFamilyEntities('ENEMY', entities);
          if (targets.length === 0) {
            discarded.push({ m, motivo: 'no hay participante hostil declarado' });
            continue;
          }
          for (const id of targets) {
            routed.push({ ...m, id: targets.length > 1 ? `${m.id}@${id}` : m.id, target_entity: id });
          }
          continue;
        }
        // Sin canal, el modifier se quedó donde NACIÓ — que para un mod es la entidad en cuyo slot
        // está montado. Eso alcanza mientras el token pertenezca a esa entidad, y **no siempre
        // pertenece**: un puñado de mods de arma emiten stats del warframe que los porta (Amalgam
        // Serration da Sprint Speed desde un rifle; Dispatch Overdrive, Movement Speed desde una
        // melee). Un arma no tiene —ni puede tener— nodos `AVATAR_*`, así que sin este salto el
        // buff muere en el arma: con el nodo YA materializado, Dispatch Overdrive no hacía nada.
        //
        // El salto se limita a **portador-arma**: un compañero también emite `AVATAR_*` (los 14
        // mods de Sentinel: `Enhanced Vitality` → `AVATAR_ADD_HEALTH_MAX`) y ahí el avatar es ÉL,
        // no el warframe — rutearlo sería un bug peor que el que esto arregla.
        //
        // ⚠️ El compañero YA es una entidad del espacio, así que el caso se da. Hoy sale bien pero
        // **por la guarda, no por decisión**: `domain === 'companion'` no matchea `'weapon'`, cae a
        // contención y se queda donde debe. Es el mismo `if` que `arch-decisions §18` señala como
        // *"el `if` que convierte un error detectable en uno invisible"*, y sobrevive a propósito:
        // resuelve el destino DENTRO del bando, y ese eje no tiene forcing-case todavía
        // (`OQ-ENGINE-31`). El cruce de bando, que sí lo tenía, ya salió de acá: lo declara la
        // familia del token, arriba.
        const holder = entityById.get(m.target_entity);
        if (holder?.domain === 'weapon' && m.target_attribute.startsWith('AVATAR_')) {
          const targets = resolveFamilyEntities('AVATAR', entities);
          if (targets.length === 0) {
            discarded.push({ m, motivo: 'no hay avatar al que subir' });
            continue;
          }
          for (const id of targets) routed.push({ ...m, target_entity: id });
          continue;
        }

        // ── La baja: del warframe a SUS armas ───────────────────────────────────────────
        // El espejo del salto de arriba, y el que `arch-decisions §18` prescribía sin que el código
        // lo hiciera. Mismo principio: el portador no materializa el token, así que el destino lo
        // declara la familia. Lo ejercen 5 fuentes vivas cuyo efecto es de TODAS las armas
        // (`Arcane Avenger`, `Crepuscular`, `Hot Shot`, `Theorem Demulcent`, `Provoked`) — las que
        // apuntan a una sola clase ya bajan por sub-familia, que es dato y no regla.
        //
        // ⚠️ ACOTADO A LA PROPIEDAD, y no por prudencia: sin el filtro por `owner`, `Provoked`
        // —alcance propio— aterriza en el arma del compañero, que porta la misma marca `weapon`.
        //
        // ⚠️ Y ACOTADO AL WARFRAME COMO PORTADOR, que es lo que lo separa de "rutear por familia
        // siempre". Los 7 mods de garras de Kavat/Kubrow (`Bite`, `Maul`, `Frost Jaw`…) emiten
        // `WEAPON_*` montados en el compañero: su destino son las garras, que **no son una entidad
        // del motor**. Con ruteo por familia sin esta guarda irían al rifle del jugador — §18 lo
        // llama la cláusula de descarte y la declara regla, no parche, porque la fuerzan dos
        // familias independientes (garras y amp/arcanos de operador). Acá se cumple por omisión:
        // caen a contención y el tripwire los reporta montados donde están.
        //
        // Que sean dos `if` y no una regla sola es deliberado: unificarlos es elegir **dentro** del
        // bando por familia, y eso rompería la contención de `Vitality` (el compañero porta la misma
        // marca `avatar` que el warframe). Ese eje sigue sin forcing-case — `OQ-ENGINE-31`.
        const family = m.target_attribute.split('_')[0];
        const route  = familyRoute(family);
        // La condición es la de §18 al pie de la letra: **el portador no materializa el token**. Se
        // pregunta por la MARCA, no por si el nodo existe — un warframe porta `avatar`, así que
        // `Vitality` (`AVATAR_*`) cae a contención acá mismo y no se va al compañero, que porta la
        // misma marca. Familia sin ruta declarada ⇒ tampoco baja: se queda donde nació.
        if (holder?.domain === 'warframe' && route && !holder.routes?.includes(route)) {
          const targets = resolveFamilyEntities(family, entities)
            .filter(id => entityById.get(id)?.owner === holder.owner);
          if (targets.length === 0) {
            discarded.push({ m, motivo: `el portador no tiene armas propias que reciban \`${family}\`` });
            continue;
          }
          for (const id of targets) {
            routed.push({ ...m, id: targets.length > 1 ? `${m.id}@${id}` : m.id, target_entity: id });
          }
          continue;
        }
        routed.push(m);
        continue;
      }
      const targetIds = resolveChannelEntities(m.target_channel, entities);
      if (targetIds.length === 0) {
        discarded.push({ m, motivo: `el canal \`${m.target_channel}\` no tiene participante` });
        continue;
      }
      for (const id of targetIds) {
        routed.push({
          ...m,
          id: targetIds.length > 1 ? `${m.id}@${id}` : m.id,
          target_entity: id,
          target_channel: undefined,
        });
      }
    }

    // El alcance existía y estaba vacío — distinto de "el token no tiene nodo". Se reporta acá y no
    // en `reportUnlandedModifiers` porque estos modifiers no llegan a `routed`: se descartan al
    // rutear. El mensaje nombra el alcance que faltó, no el nodo, porque el nodo nunca estuvo en
    // juego. Agrupado por motivo: cuatro caminos distintos terminan acá y confundirlos al leer sería
    // volver al estado que esto arregla.
    for (const motivo of new Set(discarded.map(d => d.motivo))) {
      const sources = new Set(discarded.filter(d => d.motivo === motivo).map(d => d.m.source_id ?? d.m.id));
      console.warn(
        `[Hydration] Alcance sin destino: ${motivo} — ` +
        `${sources.size} modifier(s) descartado(s): ${[...sources].join(', ')}`,
      );
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
      faction: dna.faction,
      // PE = entidad poseída/equipada (arma o warframe); TE = transitoria (proc, proyectil).
      persistence: (dna.tags.includes('weapon') || isWarframe) ? 'PE' : 'TE',
      tags: dna.tags,
      attributes,
      co_behavior: dna.co_behavior?.[effective_profile],
      innate_dna: dna
    };
  }
}
