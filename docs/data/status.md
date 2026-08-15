---
Estado: "activo"
Rol: "Entry point operativo del dominio data/ — estado de overrides, pipeline y deuda activa"
Impacto_ID: "D-Data-Status"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-22"
Fecha_de_actualizacion: "2026-08-06"
---

# Data Domain — Estado Operativo

> Entry point del dominio `data/`. Actualizar cuando se revisen o completen entradas.
> El engine no hardcodea datos — si un override no existe, el slot no aplica modificadores.

> **Deuda de infra de carga** (rescatada de `transition-residues.md` al archivarlo):
> `shared/data/DataRegistry.ts` usa ~17 `as unknown as T[]` para cargar `ability-stats.override.json`
> — casts inseguros que ocultan divergencias JSON↔tipos. No urgente (funciona); es la deuda de tipos
> más alta del área de datos. Ligada a "0" (`OQ-DATA-9`).

---

## Cobertura por sector — target ≥70% (D-16)

Decisión activa: condiciones son tracking-only en Fase 0 (D-15). La integración de una fuente al engine requiere ≥70% en su sector antes de proceder.

| Sector | Estado actual | Target | Prioridad |
|---|---|---|---|
| `arcanes/condition` | ~80% (140/175) | ⚠️ | normalizar tokens inconsistentes |
| `arcanes/upgrade_type` | ~43% (83/193) | ❌ | Gate 2a auditado: 1 token corregido (Melee Exposure), 9 stacking/formula con `note`, 2 condiciones faltantes corregidas; data:class:cat/d fuera del modelo actual |
| `mods/condition` | ~5% (43/669 con token real) | ❌ | exilus ✅ → galvanizados ✅ → resto |
| `mods/upgrade_type` | ~18% (119/669 verificadas usuario) | ❌ | Gate 2c.i+ii auditados: 14 correcciones D-6 + 6 renames non-D6 + notas Condition Overload family (cross-schema con incarnon); 201 non-D6 restantes clasificados como out-of-model / deuda-documentada / acuñables-sin-nodo |
| `incarnon/condition` | ~24.5% (175 tokens / 714 stats) | ⚠️ | 4 conditions pendientes (G3/tokens nuevos) |
| `incarnon/upgrade_type` | ~49.8% (348/699 engine-ready) | ⚠️ | G3 debate + trabajo manual usuario |
| `archon/upgrade_type` | ~74% (20/27) | ⚠️ | Gate 2b auditado: sin issues nuevos; 4 entradas ⚠ heredadas de Gate 1 (AVATAR_ADD_ABILITY_DAMAGE / GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE); 7 nulos (3 out-of-model, 1 token deuda, 3 recovery events) |

> **L\* no es un sector de cobertura.** El eje estado/umbral/evento (`while_*`/`with_*`/`on_*` ≈ `engine:class:c2/*`) fue planteado como escalera de % pero quedó **consolidado como duda real** — es un eje de *clasificación* no consolidado, bajo revisión en [OQ-SEM-2](../governance/open-questions.md). No se reporta como % a cerrar ni habilita ningún gate D-16 por sí mismo. La cobertura real de `condition` se mide **por fuente** (filas `*/condition` arriba), no por nivel L\*. Ver `conditions.md §Altitud de los debates`.

**Próximo trabajo de datos:** normalizar tokens de arcanes + vaciar las colas de clasificación de `condition` (G2 `while_target_*`, G3 `while_enemy_*`, G4 `per_*`) como insumo de OQ-SEM-2 / OQ-DATA-4 — no como cobertura.

---

## Mods (`mod-stats.override.json`)

**Schema:** `docs/data/schemas/mods/mods-schema.md` ✅
**Categorización:** `docs/data/schemas/mods/mod-category-normalization.md` ✅ (`mod.type → ModCategory`, 14 categorías)
**Vocabulario:** D-6 aplicado — `shared/types/modifier.ts` → `UPGRADES` + `UPGRADE_MAP`
**Condition vocab:** `docs/semantic/conditions.md` ✅ (agrupado por prefijo `while_`/`with_`/`on_`)

| Estado | Cantidad |
|---|---|
| Entradas totales en override | 669 |
| Revisadas y verificadas (usuario) | 119 |
| Pendientes de revisión (upgrade_type) | ~550 |
| Tokens en UPGRADES[] | 104 |
| Con entrada en UPGRADE_MAP (explícito) | 35 |
| Weapon exilus cubiertos | 80/80 (100%) |
| Galvanizados cubiertos | 12/12 (100%) |
| Con condition token asignado | ~43 (exilus + galvanizados) |

Ver `docs/semantic/upgrade-tokens.md` para el breakdown completo.

**Deuda conocida:** (gramática de tags: `docs/governance/nomenclature-grammar.md` · evidencia: `docs/governance/deuda-taxonomy.md`)
- `engine:debt` `condition` — vocabulario consolidado en `conditions.md`; integración en SimContext pendiente. Bloqueada antes que por cobertura por el eje de clasificación (OQ-SEM-2) y el shape OR/AND (OQ-DATA-4), no por un % L\*. `[ref: docs/semantic/conditions.md]`
- `data:debt` `WEAPON_ADD_AMMO_MAX` — token definido; Guardian Derision pendiente de mapeo en override `[empirical]`
- `data:debt` `WEAPON_ADD_COMBO_COUNT_CHANCE` — token definido; Guardian Derision pendiente de mapeo en override `[empirical]`
- `[SEM data:debt` `AVATAR_DAMAGE_TAKEN` — DR **multiplicativa** (op MULT). Bucket sobrecargado, 3 sub-formas: (a) resistencia estática por tipo, (b) DR genérica condicional (`while_airborne`), (c) DR adaptativa/stacking (**Adaptation** → OQ-DATA-4). Taxonomía sin cerrar (per-elemento, precedente `AVATAR_CHANCE_RESIST_*`, vs genérico+condition); coinage diferido hasta consumidor de engine. Drift cerrado: `references/wiki/mechanics/damage-reduction.md` creado. `[ref: references/wiki/mechanics/damage-reduction.md]`
- ✅ `AVATAR_PARKOUR_GLIDE` → **`AVATAR_ADD_AIM_GLIDE_DURATION`**, acuñado y con nodo (base 3s). Los 12 usos del override migrados. El ruido de mods de conclave sigue sin filtrar — es el `pipeline:debt` de `conclave?: boolean`, no un problema de este token `[ref: references/wiki/mechanics/maneuvers.md]`
- `[SEM data:debt` `AVATAR_HEAL_RATE` — mezcla de companion scope y warframe scope (Rejuvenation, Recuperate). Requiere revisión de auras y separación de contextos antes de definir token `[empirical]`
- `pipeline:debt` `conclave?: boolean` — campo no preservado en `GeneratedMod`. Sin este campo no es posible filtrar mods PVP desde la data base. Fix: `GeneratedMod` + `generate-data.ts` `[ref: @wfcd/items API]`
- `data:debt` **201 entradas / 90 tokens** con token fuera de `UPGRADES` (medido sobre `mod-stats.override.json`): deuda documentada (`WEAPON_SYNDICATE_POWER` 24, `AVATAR_DAMAGE_TAKEN` 13, `WEAPON_DAMAGE_TYPE_BIAS` 12, `WEAPON_CONVERT_AMMO` 10, …) u out-of-model (sindicatos, vehículos, compañero, stamina removida). Detalle por token en `upgrade-tokens.md` + git history. **El destino no es siempre un nodo:** un token puede acuñarse *sin* modelarse (`upgrade-tokens.md §Acuñado sin nodo`) — eso lo saca del warn de "no sé qué es" sin comprometer un modelo.
- `[ENGINE data:debt` Condition Overload family (`WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`) — fórmula `damage × (1 + n_status_types × val%)`. Notas añadidas en 4 mods. Cross-schema con incarnon evolutions: verificar si la fórmula es idéntica antes de implementar `[empirical]`
- `[SEM data:debt` Faction damage target (`GAMEPLAY_MULT_FACTION_DAMAGE`, 42 mods Bane/Expel/Cleanse/Smite × facción) — la facción objetivo vive solo en el `label`, sin estructura. Dirección registrada: expresar como token de `condition` (`damage_<faccion>`, spelling diferido), sin campo nuevo. Latente, gateado por madurez de taxonomía condition (`conditions.md §Altitud`). Engine: el modelo "un nodo aditivo `faction_damage_bonus`" (`attribute-node-contract.md §5`) es lossy en multi-facción → anotado para debate de engine. Ver `audit-mods.md §F.5` `[empirical]`
- `pipeline:debt` Set Mods Gap A — pertenencia al set no materializada. **No hay que derivarla:** upstream trae `modSet` explícito en los 72 miembros, y los 19 portadores (`type: "Mod Set Mod"`, discriminador limpio) traen `numUpgradesInSet`. Fix: propagar el campo. Análogo a `conclave?: boolean` `[empirical]`
- `pipeline:debt` **Campos disponibles en upstream que `generate-data.ts` descarta.** Censados con `omniframe-items/build/census-fields.mjs` (detecta candidatos; el renombrado semántico y la reestructuración plano→`attacks[]` producen falsos positivos, verificar antes de tratar como deuda). Lo confirmado, por interés decreciente:
  - **`heavyAttackDamage` en las 223 melee** — el multiplicador del heavy de tierra, per-arma, **de `1×` a `18×`** el `totalDamage`: no derivable, no está en `attacks[]` (el wiki no lo trae) y el pipeline lo descarta. El perfil *heavy ground* del engine está diferido citando "no en el dato" — el dato existe. Ver `../domains/engine/design/melee-combo.md` §4.1.
  - **`slamAttack` (impacto directo del slam)** — `3×` en 170 armas, `2×` en 53: tampoco derivable. Lo que servimos hoy es el **radial** (`2×`/`3×`, constante en las 223 — ese sí derivable, no se perdía nada). Falta saber si el directo se suma al radial: necesita partida.
  - **`minEnemyLevel`/`maxEnemyLevel`/`factionIndex`** — los 269 nodos del Star Chart, sin huecos. Único dato de enemigos fresco que sobrevive al fósil de 2019; permitiría anclar el nivel de simulación a misiones reales. **Oportunidad, no gap** — no abrir sin decisión de producto.
  - **`resistances`** en los 638 enemigos (⚠️ datos de 2019) — el eje daño-vs-facción se modeló con la matriz `FACTION_BONUS` sin haber mirado si el fósil traía resistencias per-unidad.
  - `fusionLimit` (1.784 mods) · `isAugment` (454) · `isUtility` (194) · `transmutable` — clasificación de mods que no tenemos.
  - `exilusPolarity` (330 armas) · `stancePolarity` (223) — polaridades de slot especial; tenemos `polarities`, no estas.
  - `excludeFromCodex` (2.890 ítems) — DE diciendo qué no es contenido real; mejor filtro de entidades que el `ExcludedFromSimulacrum` del wiki.
  - **Descartado a propósito, no es deuda:** economía y progresión (`buildPrice`, `components`, `marketCost`, `vaulted`, `drops`, `patchlogs`, `releaseDate`). OmniFrame no modela farmeo ni mercado. `[empirical]`
- `[SEM data:debt:schema data:debt` Set Mods — el bonus de conjunto no llega al dataset porque `generate-data.ts` descarta `modSet` y el `stats[]` del portador `Mod Set Mod`, que **upstream sí trae completos** (gap de pipeline, no de datos). Propagarlos es trivial; modelarlos no: el `stats[]` es texto libre a tokenizar, y el bonus es una entidad nueva (`set → {bonus, piece-count, condition}`) que no cabe en override per-mod. Gateado por `OQ-DATA-6` (vínculo OQ-DATA-4/1, eje condition `requires_*` ↔ OQ-SEM-2). Detalle en `references/set-mods.md` y `../domains/source/gaps.md` §G-4 `[ref: docs/governance/open-questions.md#OQ-DATA-6]`
- `data:debt` Captura incompleta del set Kahl/Archon (mods de warframe) — el override tiene 3/5: `Archon Flow`, `Archon Intensify`, `Archon Stretch`; **faltan `Archon Continuity` (`/Lotus/Upgrades/Mods/Warframe/Kahl/KahlAvatarAbilityDurationMod`, +30% duración) y `Archon Vitality` (`KahlAvatarHealthMaxMod`, +health)**. Sin entrada → `ModRepository` devuelve `[]` → el engine no aplica nada (no es que "ignore" el stat: no hay dato). El bonus Archon (ej. toxin status de Continuity) es aparte/condicional. Detectado al equipar Archon Continuity en la UI (duración no se aplicaba). Fix: agregar las 2 entradas espejando `Continuity`/`Vitality` (curva rank 0-5). `[empirical]`

---

## Ability Stats (`ability-stats.override.json`)

**Schema JSON:** `Project/public/data/ability-stats.schema.json` ✅ — draft-07, VS Code validation activa
**Schema de dominio:** `docs/data/schemas/abilities/schema.md` ✅ — actualizado
**Estado:** 286 entradas con datos reales, 704 stats aplicados vía pipeline

### Pipeline de datos (activo)

```
references/game-ui/<Warframe>.md   ← fuente de verdad (anotaciones $/$$ manuales)
         ↓  npm run apply:ability -- ../references/game-ui/<Warframe>.md
  apply-ability-md.ts              ← parser + merge en un paso
         ↓
ability-stats.override.json        ← groups/stats actualizados; name/desc/image_name intactos
```

El override **no se edita a mano** para groups/stats. Fuente de verdad: el `.md`.
`name`, `description`, `image_name` siguen viniendo de `@wfcd/items` vía `generate-data.ts`.

**Shorthands activos:** `$STRENGTH` · `$RANGE` · `$DURATION` · `$EFFICIENCY` · `$DRAIN` (mapeados en el parser a tokens completos).
**`//!`** en `.md` → `console.warn` en output del script. Registra edge-cases sin bloquear el pipeline.

### Schema — cambios relevantes

Schema estabilizado (D-11 `upgrade_by` opcional, D-12 `AbilityStatEntry` plano). Detalle e historial: `docs/data/decisions.md` (D-11, D-12).

### Estado de los .md

La cobertura **no se escribe acá**: es un conteo que driftea en silencio (D-16) y el filesystem ya la
tiene exacta. Se deriva:

```bash
# warframes con al menos una habilidad anotada
grep -lc "^## /Lotus/Powersuits/PowersuitAbilities/" references/game-ui/*.md | wc -l
# los que piden revisión en juego
grep -rl "UPDATE NEEDED" references/game-ui/
```

`Augment.md` no es un warframe: es el archivo de augments, sin bloques de habilidad por diseño.
**Formato de anotaciones:** `references/game-ui/README.md`.

### Herramienta de visualización

`AbilityStatsViewer.tsx` — ruta `/dev/ability-stats` ✅ operativa
- Verificación visual completada — schema y datos correctos
- Issues de renderización pendientes son presentación, no de schema

### Deuda conocida

- `[ENGINE semantic:debt` Double-scaling (`$DURATION $RANGE` en Gara, `$EFFICIENCY $STRENGTH` en Harrow) — schema resuelto (upgrade_by acepta array); engine usa [0] hasta que existan fórmulas dedicadas. `//!` registra los casos. `[empirical]`
- `semantic:debt` `AVATAR_HEALTH` scaling (Inaros 4) — scaling con Max Health, sin token canónico. `//!` registrado. Candidato: `AVATAR_ADD_HEALTH_MAX` como eje de upgrade_by `[empirical]`
- `semantic:debt` Lavos — `$EFFICIENCY` mapea a cooldown (no a energy cost). Datos con mejor token disponible + `//!`. `[empirical]`
- `engine:debt` OQ-W-5 — fórmulas de `ENERGY_COST`/`ENERGY_DRAIN` no implementadas en engine. Ver `docs/governance/open-questions.md#OQ-W-5` `[ref: docs/governance/open-questions.md]`
- `data:debt` **Anotaciones de escalado faltantes en la captura** — 42 stats sin `$STRENGTH`/`$RANGE`/`$DURATION` en `references/game-ui/`, con el grueso concentrado en cuatro archivos (`Sevagoth`, `Wisp`, `Zephyr`, `Excalibur Umbra`), donde hay habilidades enteras sin ninguna anotación. El override quedó en 1.199 entradas y la reparación nunca se hizo. `[empirical]`
- `data:debt` **59 huérfanos** — entradas con dato en el override y **sin `.md` de `game-ui/` que las respalde** (Xaku, Wukong, Voruna, Yareli, Dante, necramechs, Excalibur base). Sin fuente que las regenere, no son reproducibles. `[empirical]`
- `data:debt` **`references/game-ui/` está fuera del alcance de los dos validadores** por decisión declarada (`references/CLAUDE.md` §*Qué audita cada herramienta*: formato propio, alimenta el parser). Consecuencia medida: la regla dura de **LF estricto** no tiene ahí quién la haga cumplir — llegó a haber 63 de 64 `.md` en CRLF sin que nada lo señalara. **El parser es inmune** (`parse-ability-md.ts` hace `split('\n')` + `trimEnd()`), así que es higiene, no bug. **Ejecutable que falta:** `.gitattributes` con `eol=lf`, que cubre el repo entero sin extender el validador. `[empirical]`

---

## Passives

**Schema:** ❌ Sin definir (posiblemente similar a ability-stats — groups + upgrade_by/type)
**Override:** ❌ Sin override operativo; existe `passives-stats.override.json` (scaffold stale, schema pre-D-12, tokens raw sin normalizar). Purgar antes de crear override real.

**Casos de referencia para schema:**
- Ash (pasiva "mod global"): `upgrade_type` → daño de sigilo → mismo patrón que mod
- Hydroid (pasiva "cambia reglas"): lógica de ley, NO es un modificador de atributo

**Deuda:** `data:debt:schema data:debt` Definir schema y crear primer override con 2-3 casos (uno "mod global" como Ash, uno "ley" como Hydroid). Sin blocker de vocabulario — los tokens necesarios ya existen. `[empirical]`

---

## Arcanos (`arcane-stats.override.json`)

**Schema:** `docs/data/schemas/arcane/schema.md` ✅
**Override:** `Project/public/data/arcane-stats.override.json` ✅
**Generador:** `Project/scripts/generate-arcane-override.py`

| Estado | Cantidad |
|---|---|
| Entradas totales | 164 |
| Stats con `upgrade_type` mapeado | 83 (43%) |
| Stats con `upgrade_type: null` | 110 (57%) |
| Stats con `condition` capturado | 122 / 175 total |
| Tokens activos cubiertos | 24 |

**Schema:** idéntico a `mod-stats.override.json` — `base_value` siempre array de 6 ranks, `condition` capturado de triggers "On X:" / "While X:".

**Breakdown de null:** ver `docs/data/schemas/arcane/schema.md §3`. Categorías principales: status resistances (~11), buffs on-event de HP/Armor/Shield (~10), economía de HP/Energía (~8), fórmulas per-stat (~7), arcanes de Operador/Kitgun (~18), Primary/Secondary mecánicas de stacking (~14).

**Repository:** `ArcaneRepository` ✅ implementado. Lee `arcane-stats.override.json`, resuelve `getModifiers` con rank clamping; `StaticHydrator.hydrate` procesa `intent.arcanes` y empuja los modifiers directo (sin DamageCombiner). El engine resuelve arcanos end-to-end. **Gap restante = conexión de escritura en UI** (store `setArcane` + ruteo de slots), no el engine.

**Deuda:**
- `data:debt` P1: ~15 arcanes con `condition: null` + `upgrade_type` mapeado (efectos siempre activos, los más simples de integrar). Sin blocker de vocabulario.
- `[SEM data:debt:schema` Patrones estructurales transversales (stacking / duration / composición de condition) — criterio de entrada fijado en `decisions.md#D-20`; **captura-only** en `audit-arcane.md`; puente cross-schema ubicado en `data/` (`DC-OQ-DATA-2`), creación gateada (`OQ-DATA-4`). Familia stacking on-event (Merciless/Deadhead/Dexterity, 6 entradas): drift con D-15 §2 (`base_value: null` vs total). Composición OR/AND de condition: contador = 1 (Afflictions), sub-umbral. `[empirical]`

---

## Incarnon Evolutions (`incarnon-evolutions.override.json`)

**Schema:** `docs/data/schemas/incarnon/schema.md` ✅

| Estado | Cantidad |
|---|---|
| Armas con datos | 48 |
| Stats totales | 699 |
| Engine-ready — data:class:cat/a (mapped, sin condición) | 333 (47.6%) |
| Engine-ready — data:class:cat/b (mapped, condición token) | 15 (2.1%) |
| **Engine-ready total** | **348 (49.8%)** |
| Display-only data:class:cat/d (sin upgrade_type, sin condition) | 240 (34.3%) |
| Display-only data:class:cat/e (sin upgrade_type, con condition) | 110 (15.7%) |
| data:class:cat/f (variante null en base_value) | 1 — gorgon/prisma confirmado correcto |
| Condition tokens activos | 125 |
| Condition null (condición real sin token) | 2 — paris/vicious_promise ×2 |

**Deuda conocida (activa):**
- `[SEM data:debt` G3 abiertos: duration buffs mapeados como estáticos (7 stats) `[inferred]`, SET vs ADD (12 stats) `[needs-verification]`, multi-value labels (3 stats) `[needs-verification]`
- `data:debt` data:class:cat/d ~101 no-EVO1 restantes: ~82 genuinamente display-only + ~19 pendientes (G3 o tokens nuevos)
- `[SEM data:debt` 4 condition tokens pendientes: `while_blocking`, `while_enemy_below_half_health`, y otros — trabajo manual usuario `[empirical]`
- `data:debt:schema data:debt` Condición de grupo — perks con múltiples stats bajo una sola condición (ej: Stalwart Oak, Bo). Schema soporta un token de condition por stat. Patrón actual: cabecera display + repetir condition en cada stat hijo. Deuda: diseñar soporte nativo para bloques condicionales (análogo a stacking, duration). Cross-schema: posiblemente aplica en mods y arcanes `[empirical]`
- `data:debt:schema data:debt` Familia proc-on-proc (Flashing Bleed, Internal Bleeding, Hunter Munitions family) — sin upgrade_type ni token hasta definir la familia. Pendiente de debate transversal mods↔incarnon `[empirical]`
- `data:debt:schema data:debt` Regla 1 label = 1 stat — labels con 2+ efectos distintos deben hacer split en stats separados bajo la misma condition. Aplicado en Hunter's Mantra (Boltor). Audit en progreso: aplicar a casos similares encontrados `[empirical]`
- `[SEM data:debt` Ammo Efficiency stacking on-kill (Crimson Overture, Boltor) — multi-efecto + engine:class:c2/stack + duration 5s + stack cap variant-specific. Sin token WEAPON_ADD_AMMO_EFFICIENCY. data:class:cat/e hasta definir familia `[empirical]`

**Mantenimiento:** SSoT manual — verificación de labels contra juego/wiki a cargo del usuario.

---

## Archon Shards (`archon-shards.json`)

**Schema:** `docs/data/schemas/archon-shards/schema.md` ✅
**Mapeo upgrade_type detallado:** `docs/data/schemas/archon-shards/upgrade-mapping.md` (referencia)
**Estado:** ⚠️ Parcial — 6 entradas / 27 stats. Mapeado solo donde existe token D-6 sin ambigüedad. Bloqueos y deuda en mapping.
**UI:** ✅ `useArchonShardCatalog`, `ArchonShardSelectionView`, iconos en Arsenal.

---

## Weapons override (`weapon-stats.override.json`)

**Override:** `Project/public/data/weapon-stats.override.json` ✅
**Rationale / spec:** `docs/data/schemas/weapons/weapons-known-gaps.md` §Gap multishot

Corrige el **multishot por perfil de ataque**: `@wfcd/items` expone un único `stats.multishot` global por arma, pero varios perfiles de ataque tienen multishot innato distinto. Regla de resolución del engine: override `(unique_name, attack.name)` → si es `attacks[0]` hereda `stats.multishot` → resto = 1.

| Estado | Cantidad |
|---|---|
| Armas activas (primary/secondary) | 5 (Basmu, Efv-5 Jupiter, Kuva Zarr, Kuva Hek, Euphona Prime) |
| Pendiente | 1 (Fusilai — `unique_name` no verificado) |

Fuera de scope del override actual (gateado por modelado de dominio): Incarnon Form (Boltor/Soma/Kunai), melee con proyectil (Redeemer, gunblades, chakrams), archwing/companion/operador. Detalle en `weapons-known-gaps.md`.

---

## Enemigos (`enemies.json`)

**Schema:** `docs/data/schemas/enemy/schema.md` ✅
**Generador:** `buildEnemiesArtifacts` en el pipeline (`generate-data.ts`). El override
(`enemy-stats.override.json`) trae **6 filas**: la `unit_class` de los acólitos, que la cosecha no puede
dar —el wiki declara su regla de status en la página de mecánica, no en la fila del enemigo— y que el
engine consume como llave de los desvíos de ley del receptor.
**Estado:** ✅ 638 entradas, fuente **doble** (export del juego + cosecha wiki `Module:Enemies/data` vía
`omniframe-items`, merge por nombre). `faction` canónica en cascada (incluye subfacciones: Kuva Grineer 25, Corpus Amalgam 46); `base_level` > 1 en 61 entradas;
`eximus_health` (283) y `weakpoints[]` (407) emitidos por fidelidad, sin consumidor en el engine.
**Gap conocido:** el export no trae ninguna unidad de Narmer/Anarchs/Murmur/Techrot/Scaldra (115 en el wiki)
— hay ley de scaling y bonus de facción sin enemigos contra los cuales ejercerlos (schema §5).

---

## Orden de trabajo sugerido

1. Completar `.md` restantes (~10 warframes) + revisar los 5 con `//! UPDATE NEEDED`
2. Incarnon — ampliar token coverage (P1 de `gaps.md §2`: ~9 tokens simples, +60 efectos adicionales)
3. Arcanos — schema a definir, posponer hasta tener ability stats más completos
4. Passives — schema pendiente de definir
