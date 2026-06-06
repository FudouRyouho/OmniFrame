---
Estado: "activo"
Rol: "Entry point operativo del dominio data/ — estado de overrides, pipeline y deuda activa"
Version: "v0.2.0"
Impacto_ID: "D-Data-Status"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-22"
Fecha_de_actualizacion: "2026-06-06"
---

# Data Domain — Estado Operativo

> Entry point del dominio `data/`. Actualizar cuando se revisen o completen entradas.
> El engine no hardcodea datos — si un override no existe, el slot no aplica modificadores.

---

## Cobertura por sector — target ≥70% (D-16)

Decisión activa: condiciones son tracking-only en Fase 0 (D-15). La integración de una fuente al engine requiere ≥70% en su sector antes de proceder.

| Sector | Estado actual | Target | Prioridad |
|---|---|---|---|
| `arcanes/condition` | ~80% (140/175) | ⚠️ | normalizar tokens inconsistentes |
| `arcanes/upgrade_type` | ~43% (83/193) | ❌ | Gate 2a auditado: 1 token corregido (Melee Exposure), 9 stacking/formula con `note`, 2 condiciones faltantes corregidas; data:class:cat/d fuera del modelo actual |
| `mods/condition` | ~5% (43/669 con token real) | ❌ | exilus ✅ → galvanizados ✅ → resto |
| `mods/upgrade_type` | ~18% (119/669 verificadas usuario) | ❌ | Gate 2c.i+ii auditados: 14 correcciones D-6 + 6 renames non-D6 + notas Condition Overload family (cross-schema con incarnon); ~255 non-D6 restantes clasificados como out-of-model/deuda-documentada |
| `incarnon/condition` | ~24.5% (175 tokens / 714 stats) | ⚠️ | 4 conditions pendientes (G3/tokens nuevos) |
| `incarnon/upgrade_type` | ~49.8% (348/699 engine-ready) | ⚠️ | G3 debate + trabajo manual usuario |
| `archon/upgrade_type` | ~74% (20/27) | ⚠️ | Gate 2b auditado: sin issues nuevos; 4 entradas ⚠ heredadas de Gate 1 (AVATAR_ADD_ABILITY_DAMAGE / GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE); 7 nulos (3 out-of-model, 1 token deuda, 3 recovery events) |

> **L\* no es un sector de cobertura.** El eje estado/umbral/evento (`while_*`/`with_*`/`on_*` ≈ `engine:class:c2/*`) fue planteado como escalera de % pero quedó **consolidado como duda real** — es un eje de *clasificación* no consolidado, bajo revisión en [OQ-SEM-2](../governance/open-questions.md). No se reporta como % a cerrar ni habilita ningún gate D-16 por sí mismo. La cobertura real de `condition` se mide **por fuente** (filas `*/condition` arriba), no por nivel L\*. Ver `conditions.md §Altitud de los debates`.

**Próximo trabajo de datos:** normalizar tokens de arcanes + vaciar las colas de clasificación de `condition` (G2 `while_target_*`, G3 `while_enemy_*`, G4 `per_*`) como insumo de OQ-SEM-2 / OQ-DATA-4 — no como cobertura.

---

## Mods (`mod-stats.override.json`)

**Schema:** `docs/data/schemas/mods/mods-schema.md` ✅
**Vocabulario:** D-6 aplicado — `shared/types/modifier.ts` → `UPGRADES` + `UPGRADE_MAP`
**Condition vocab:** `docs/semantic/conditions.md` ✅ (agrupado por prefijo `while_`/`with_`/`on_`)

| Estado | Cantidad |
|---|---|
| Entradas totales en override | 669 |
| Revisadas y verificadas (usuario) | 119 |
| Pendientes de revisión (upgrade_type) | ~550 |
| Tokens en UPGRADES[] | 78 |
| Con entrada en UPGRADE_MAP (explícito) | 35 |
| Weapon exilus cubiertos | 80/80 (100%) |
| Galvanizados cubiertos | 12/12 (100%) |
| Con condition token asignado | ~43 (exilus + galvanizados) |

Ver `docs/semantic/upgrade-tokens.md` para el breakdown completo.

**Deuda conocida:** (gramática de tags: `docs/governance/nomenclature-grammar.md` · evidencia: `docs/governance/deuda-taxonomy.md`)
- `engine:debt` `condition` — vocabulario consolidado en `conditions.md`; integración en SimContext pendiente. Bloqueada antes que por cobertura por el eje de clasificación (OQ-SEM-2) y el shape OR/AND (OQ-DATA-4), no por un % L\*. `[ref: docs/semantic/conditions.md]`
- `[SEM data:debt` D-17 — 2 tokens galvanizados con semántica pendiente (beam range ✅ resuelto 2026-06-03 → `WEAPON_ADD_BEAM_RANGE`): ver `docs/data/decisions.md#D-17` `[empirical]`
- `data:debt` `WEAPON_ADD_AMMO_MAX` — token definido (2026-05-31); Guardian Derision pendiente de mapeo en override `[empirical]`
- `data:debt` `WEAPON_ADD_COMBO_COUNT_CHANCE` — token definido (2026-05-31); Guardian Derision pendiente de mapeo en override `[empirical]`
- `[PIPE semantic:debt` `WEAPON_SPREAD` — confirmado **misma mecánica que `WEAPON_ADD_ACCURACY`** (spread = nombre interno DE, accuracy = stat visible, inversos; Narrow Barrel / Tainted Shell llevan token `WEAPON_SPREAD` pero label "+% Accuracy"). Dirección: unificar bajo `WEAPON_ADD_ACCURACY`; spread de shotgun = contexto de arma. Pendiente: mecanismo (alias en `UPGRADE_MAP` vs mapeo en pipeline); sin mods `WEAPON_SPREAD` en overrides curados aún. `[ref: references/wiki/mechanics/accuracy.md]`
- `[SEM data:debt` `AVATAR_DAMAGE_POWER_MULTIPLIER` ✅ resuelto 2026-06-04 → **renombrado `AVATAR_ADD_HEALTH_DAMAGE_TO_ENERGY`** (mod-stats.override, 4 mods). La premisa "(b) escudos→energía (Kinetic Diversion)" era **stale**: raw + override confirman que los 4 mods (Rage, Hunter Adrenaline, Kinetic Diversion, Necramech Rage) = salud→energía. Mecánica única, sin variante de escudos (Hildryn es mecánica distinta). **Registrado en `UPGRADES[]`** (data-first, 2026-06-04; op ADD vía resolveToken). `[empirical]`
- `[SEM data:debt` `AVATAR_DAMAGE_TAKEN` — DR **multiplicativa** (op MULT). Bucket sobrecargado, 3 sub-formas: (a) resistencia estática por tipo, (b) DR genérica condicional (`while_airborne`), (c) DR adaptativa/stacking (**Adaptation** → OQ-DATA-4). Taxonomía sin cerrar (per-elemento, precedente `AVATAR_CHANCE_RESIST_*`, vs genérico+condition); coinage diferido hasta consumidor de engine. Drift cerrado: `references/wiki/mechanics/damage-reduction.md` creado. `[ref: references/wiki/mechanics/damage-reduction.md]`
- `semantic:debt` `AVATAR_PARKOUR_GLIDE` — duración de aim glide/wall latch. Candidato: `AVATAR_ADD_AIM_GLIDE_DURATION`. Mix de mods legítimos (Patagium, Mobilize) y conclave `[empirical]`
- `[SEM data:debt` `AVATAR_HEAL_RATE` — mezcla de companion scope y warframe scope (Rejuvenation, Recuperate). Requiere revisión de auras y separación de contextos antes de definir token `[empirical]`
- `pipeline:debt` `conclave?: boolean` — campo no preservado en `GeneratedMod`. Sin este campo no es posible filtrar mods PVP desde la data base. Fix: `GeneratedMod` + `generate-data.ts` `[ref: @wfcd/items API]`
- `data:debt` ~255 entradas con token no-D-6 clasificadas: deuda documentada (WEAPON_SPREAD, AVATAR_DAMAGE_TAKEN, AVATAR_PARKOUR_GLIDE, AVATAR_HEAL_RATE, etc.) o out-of-model (sindicatos, vehículos, compañero, stamina removida). 8 renames aplicados (2026-06-04; detalle por token en `upgrade-tokens.md` + git history).
- `[ENGINE data:debt` Condition Overload family (`WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`) — fórmula `damage × (1 + n_status_types × val%)`. Notas añadidas en 4 mods. Cross-schema con incarnon evolutions: verificar si la fórmula es idéntica antes de implementar `[empirical]`
- `[SEM data:debt` Faction damage target (`GAMEPLAY_MULT_FACTION_DAMAGE`, 42 mods Bane/Expel/Cleanse/Smite × facción) — la facción objetivo vive solo en el `label`, sin estructura. Dirección registrada: expresar como token de `condition` (`damage_<faccion>`, spelling diferido), sin campo nuevo. Latente, gateado por madurez de taxonomía condition (`conditions.md §Altitud`). Engine: el modelo "un nodo aditivo `faction_damage_bonus`" (`attribute-node-contract.md §5`) es lossy en multi-facción → anotado para debate de engine. Ver `audit-mods.md §F.5` `[empirical]`
- `pipeline:debt` Set Mods Gap A — pertenencia al set no materializada como campo, **derivable** de `unique_name` (`/Mods/Sets/<Set>/`, 19 sets / 72 miembros + 19 portadores `type: "Mod Set Mod"`). Discriminador limpio: `type === "Mod Set Mod"`. Candidato: campo derivado o tag. Análogo a `conclave?: boolean` `[empirical]`
- `[SEM data:debt:schema data:debt` Set Mods Gap B — valores del bonus de conjunto ausentes del dataset (el portador `Mod Set Mod` existe pero vacío); entidad nueva (`set → {bonus, piece-count, condition}`), no cabe en override per-mod. Valores investigados (wiki) en `references/set-mods.md`. Modelado gateado por `OQ-DATA-6` (vínculo OQ-DATA-4/1, eje condition `requires_*` ↔ OQ-SEM-2) `[ref: docs/governance/open-questions.md#OQ-DATA-6]`

---

## Ability Stats (`ability-stats.override.json`)

**Schema JSON:** `Project/public/data/ability-stats.schema.json` ✅ — draft-07, VS Code validation activa
**Schema de dominio:** `docs/data/schemas/abilities/schema.md` ✅ — actualizado (2026-05-24)
**Estado:** 286 entradas con datos reales, 704 stats aplicados vía pipeline

### Pipeline de datos (activo, 2026-05-22)

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

### Schema — cambios relevantes (2026-05-22)

| Decisión | Estado |
|---|---|
| D-11 — `upgrade_by` opcional, `"NONE"` eliminado | ✅ CERRADO |
| D-12 — `AbilityStatValue` eliminado, `AbilityStatEntry` plano (`base_value: number \| [number,number]`) | ✅ CERRADO — ver `shared/types/ability.ts` |

### Estado de los .md

Cobertura: ~25 warframes anotados, ~10 pendientes (Mag → ...), 5 marcados `//! UPDATE NEEDED`, Kullervo sin acceso.
Detalle por warframe: `docs/data/schemas/abilities/annotation-status.md` (referencia).
**Formato de anotaciones:** `references/game-ui/README.md`.

### Herramienta de visualización

`AbilityStatsViewer.tsx` — ruta `/dev/ability-stats` ✅ operativa
- Verificación visual completada (2026-05-22) — schema y datos correctos
- Issues de renderización pendientes son presentación, no de schema

### Deuda conocida

- `[ENGINE semantic:debt` Double-scaling (`$DURATION $RANGE` en Gara, `$EFFICIENCY $STRENGTH` en Harrow) — schema resuelto (upgrade_by acepta array); engine usa [0] hasta que existan fórmulas dedicadas. `//!` registra los casos. `[empirical]`
- `semantic:debt` `AVATAR_HEALTH` scaling (Inaros 4) — scaling con Max Health, sin token canónico. `//!` registrado. Candidato: `AVATAR_ADD_HEALTH_MAX` como eje de upgrade_by `[empirical]`
- `semantic:debt` Lavos — `$EFFICIENCY` mapea a cooldown (no a energy cost). Datos con mejor token disponible + `//!`. `[empirical]`
- `engine:debt` OQ-W-5 — fórmulas de `ENERGY_COST`/`ENERGY_DRAIN` no implementadas en engine. Ver `docs/governance/open-questions.md#OQ-W-5` `[ref: docs/governance/open-questions.md]`

---

## Passives

**Schema:** ❌ Sin definir (posiblemente similar a ability-stats — groups + upgrade_by/type)
**Override:** ❌ Sin archivo

**Casos de referencia para schema:**
- Ash (pasiva "mod global"): `upgrade_type` → daño de sigilo → mismo patrón que mod
- Hydroid (pasiva "cambia reglas"): lógica de ley, NO es un modificador de atributo

**Deuda:** `data:debt:schema data:debt` Definir schema y crear primer override con 2-3 casos (uno "mod global" como Ash, uno "ley" como Hydroid). Sin blocker de vocabulario — los tokens necesarios ya existen. `[empirical]`

---

## Arcanos (`arcane-stats.override.json`)

**Schema:** `docs/data/schemas/arcane/schema.md` ✅ (2026-05-28)
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

**Repository:** `ArcaneRepository` — pendiente (análogo a `IncarnonRepository`).

**Deuda:**
- `engine:debt` `ArcaneRepository` no implementado — análogo a `IncarnonRepository`. Blocker para conectar arcanes al engine. `[ref: docs/data/schemas/arcane/schema.md]`
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
- `[ENGINE data:debt` `IncarnonRepository` lee `upgrades[]` (formato viejo) → devuelve `[]` en runtime. Actualizar a `stats[]` al conectar engine↔UI. `[ref: docs/data/schemas/incarnon/schema.md]`
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
**UI:** ✅ `useArchonShardCatalog`, `ArchonShardSelectionView`, iconos en Arsenal (2026-05-21).

---

## Orden de trabajo sugerido

1. Completar `.md` restantes (~10 warframes) + revisar los 5 con `//! UPDATE NEEDED`
2. Incarnon — ampliar token coverage (P1 de `gaps.md §2`: ~9 tokens simples, +60 efectos adicionales)
3. Arcanos — schema a definir, posponer hasta tener ability stats más completos
4. Passives — schema pendiente de definir
