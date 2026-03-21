# Preguntas — Arquitectura del motor de cálculo

> Estado: Q1-Q10 cerradas — revisión de coherencia aplicada 2026-03-21
> Creado: 2026-03-20
> Prerequisito de: GAP-DOC-4 (documento de arquitectura del motor)

Cada pregunta tiene primero los hechos verificados con referencias a fuentes reales,
luego la decisión tomada. Las inconsistencias identificadas se resuelven en la revisión
de coherencia posterior a este documento.

---

## Base empírica — datos verificados con fuentes

### Mods (`Project/public/data/mods.json` + `Docs/decisions/mods-builder-analysis.md`)

- `upgradeTypes[]` identifica qué stat modifica cada mod — cubre ~85% de mods de armas
- `levelStats[rank].stats[]` — array de strings por rango, única fuente de valores numéricos disponible
- Campos disponibles en el fork: `modClass` (`Galvanized`/`Primed`/`Archon`/`Amalgam`), `rank` (maxRank), `isExilus`, `isWeaponAugment`, `incompatible[]`, `incompatibilityTags[]`
- `baseDrain < 0` en `category: 'warframe'` identifica aura mods — 36 mods verificados, todos auras
- `categoryRaw: 'Stance Mod'` identifica stances — 79 mods en `category: 'melee'`
- `isExilus: true` disponible en el JSON — 73 mods de warframe con este flag
- Augmentos de habilidad activa: `upgradeTypes: []` — sin cobertura canónica de stat
- Augmentos de pasiva: `upgradeTypes: ["AVATAR_ABILITY_AUGMENT", ...]` — 3 mods verificados
- D2 cancelado: el Public Export de DE no expone `Value`, `OperationType`, `DamageType`, `ValidPostures` — no accesibles canónicamente. Ver `Docs/decisions/open-questions.md §D2`
- Arcanos: no están en `mods.json` — `arcanes.json` no existe (`Docs/decisions/open-questions.md §GAP-DOC-2`)

### Habilidades (`Project/public/data/ability-stats.json` + `Docs/canonical/ability-stat-schema.md`)

- `public/data/ability-stats.json` es la fuente activa en runtime — schema nuevo con `upgradeBy` y `groups[]`
- `upgradeBy` — con qué variable del engine escala el `baseValue` de cada stat
- `upgradeType` — qué modifica externamente la habilidad (solo buff abilities: Roar, Warcry, Volt Speed)
- Vocabulario canónico compartido con mods: `AVATAR_ABILITY_STRENGTH` en `upgradeBy` = `AVATAR_ABILITY_STRENGTH` en `upgradeTypes[]` de mods — cruce directo sin mapeo
- `baseValue` numérico por stat, a nivel 30 (sin mods)
- Caps: `cap` (máximo), `capMin` (mínimo) — vienen del módulo `Module:Ability/data/stats`
- `helminthBase`/`helminthCap` — valores alternativos vía Helminth
- `inverse: true` — el modificador actúa como divisor (`baseValue / STR`)
- Cobertura parcial: Ash completo en formato nuevo, ~26 en formato antiguo, ~35 placeholders. Ver `Docs/analysis/ability-stats-gap.md`
- Patrones de energía documentados en `Docs/analysis/ability-formulas.md`: `ENERGY_COST` = `(2-EFF)*base`, `ENERGY_DRAIN` = `(2-EFF)*base/DUR`
- Casos especiales de energía (TARGET, COMBO, Hildryn shields, Equinox) → `misc` hasta que el motor los necesite

### Warframes (`Project/public/data/warframes.json`)

- Stats a nivel 30 en top-level: `health`, `shield`, `armor`, `power`, `sprintSpeed`
- `polarities[]` — slots con polaridad preinstalada (ej. Ash: `["madurai","madurai"]`)
- `aura` — polaridad del slot de aura
- Campos `healthRank30`, `shieldRank30`, etc. — redundantes/legacy, los valores top-level ya son nivel 30
- `abilities[]` — hidratadas en runtime con `ability-stats.json` vía `warframeData.ts`
- `references/Semantic/*.md` — stats de habilidades a nivel 30 por warframe con más detalle

### Armas (`Project/public/data/weapons.json` + `Docs/analysis/weapon-data-analysis.md`)

- Las armas no escalan por rank — stats completos en el JSON
- Stats top-level del arma: `criticalChance`, `criticalMultiplier`, `procChance`, `fireRate`, `magazineSize`, `reloadTime`, `multishot`, `accuracy`, `noise`, `trigger`
- Stats melee top-level: `range`, `attackSpeed`, `comboDuration`, `followThrough`, `blockingAngle`, `slamAttack`, `slamRadialDamage`, `slamRadius`, `heavyAttackDamage`, `heavySlamAttack`, `heavySlamRadialDamage`, `heavySlamRadius`, `slideAttack`, `windUp`, `stancePolarity`
- `attacks[]` — estructura abierta, campo `name` es la clave semántica. Campos por ataque: `damage{}`, `crit_chance`, `crit_mult`, `status_chance`, `speed`, `shot_type`, `flight`, `falloff`, `slide`, `charge_time`
- `damage` y `totalDamage` top-level no son confiables para cálculo en armas con múltiples attacks — usar `attacks[].damage` directamente. Ver `Docs/analysis/weapon-data-analysis.md §11.3`
- Gap verificado: `heavyAttackDamage` top-level es la única fuente para Heavy Attack en melee estándar — no está en `attacks[]`. Ver `Docs/analysis/weapon-data-analysis.md §5.3`
- Gap verificado: `punchThrough` no existe en `attacks[]` de `@wfcd/items`. Ver `Docs/analysis/weapon-data-analysis.md §5.5`
- Gap verificado: `slideAttack` top-level inconsistente con `attacks[].slide` en 5 armas. Ver `Docs/analysis/weapon-data-analysis.md §5.2`
- Incarnon: attacks adicionales en `attacks[]` con nombres semánticos propios — no hay campo `isIncarnon` en el ataque

### Arquitectura actual (`Docs/architecture/architecture-audit.md`)

- `features/arsenal/engine/index.ts` — placeholder vacío
- `features/arsenal/ArsenalView.tsx` — placeholder vacío
- `features/hud/layout-context.tsx` — placeholder vacío
- `src/lib/types.ts` — tipos canónicos: `Weapon`, `Warframe`, `Mod`, `Ability`, `AbilityStatsData`, `AbilityGroup`, `AbilityStatValue`
- `src/lib/warframeData.ts` — fetch + cache + hidratación de abilities en runtime
- D3 decidido: lógica pura primero, UI después. Ver `Docs/decisions/open-questions.md §D3`

---

## Preguntas

---

### Q1 — ¿Cuál es el scope real del motor en v1?

**Hechos verificados:**
- `weapons.json` — stats completos, armas no escalan por rank. Fuente más estructurada y trabajable del proyecto
- `mods.json` — `upgradeTypes[]` cubre ~85% de mods de armas y warframes. Sistema más completo disponible
- `warframes.json` — stats a nivel 30 en top-level. `abilities[]` hidratadas en runtime
- `ability-stats.json` — schema nuevo operativo, cobertura parcial (~1 warframe completo en formato nuevo, ~26 en formato antiguo, ~35 placeholders). Ver `Docs/analysis/ability-stats-gap.md`
- `features/arsenal/engine/index.ts` y `ArsenalView.tsx` — placeholders vacíos
- Arcanos: sin datos estructurados (`GAP-DOC-2` pendiente)
- Compañeros: sin análisis de datos (`GAP-DOC-3` pendiente)
- Necramech, Archwing, K-Drive: sin datos ni análisis

**Decisión (2026-03-20):**
El motor v1 se construye por capas horizontales según la completitud de los datos disponibles.
El concepto de "layout completo" es el objetivo final cuando cada apartado tenga soporte parcial.

Orden de capas por completitud de datos:
1. Stats de armas — datos completos en `weapons.json`
2. Mods de arma aplicados — `upgradeTypes[]` + `levelStats`, sistema más estructurado
3. Stats base de warframe — `warframes.json` a nivel 30
4. Mods de warframe (`AVATAR_HEALTH_MAX`, `AVATAR_SHIELD_MAX`, etc.) — misma fuente que mods de arma
5. Habilidades — `ability-stats.json` con `upgradeBy` canónico; cobertura parcial
6. Layout completo — cuando cada apartado tenga soporte parcial

Necramech, Archwing, K-Drive, compañeros y armas de compañero: v2 — sin análisis de datos disponible.

---

### Q2 — ¿Cómo obtiene el motor los valores numéricos de los mods?

**Hechos verificados:**
- `levelStats[rank].stats[]` — array de strings por rango, todos los rangos explícitos en el JSON. Única fuente de valores numéricos disponible. Ver `Docs/decisions/mods-builder-analysis.md §1`
- `Module:Mods/data` (descargado 2026-03-20, en `Docs/wiki-modules/mods-data.lua`) — NO tiene valores por rango, solo `Description` del rango máximo, `MaxRank`, `UpgradeTypes` y metadatos
- D2 cancelado: el Public Export de DE no expone `Value` por rango. Ver `Docs/decisions/open-questions.md §D2`
- Patrones de string identificados en `levelStats` (los más simples del dataset):
  - Simple: `"+165% Damage"`
  - Con tag de color: `"+165% <DT_FREEZE_COLOR>Cold"` — tag a ignorar
  - Dos efectos por rango (Galvanized): `["+80% Multishot", "On Kill:\n+30% Multishot..."]`
  - Condición en el string: `"On Headshot:\n+135% Critical Chance when Aiming for 9s"`
- Mods con progresión no lineal verificados: Primed (10 rangos), Galvanized (10 rangos), Archon. Ver `Docs/decisions/mods-builder-analysis.md §Gap D`
- Mods elementales: `WEAPON_PERCENT_BASE_DAMAGE_ADDED` cubre todos, pero el tipo de daño específico (`DT_FIRE`, `DT_FREEZE`...) no está en `upgradeTypes` — está en `DamageType` del Public Export (no accesible). Ver `Docs/decisions/mods-builder-analysis.md §Gap A`

**Decisión (2026-03-20):**
Override `values[]` explícitos por rango en `mod-stats.json` para todos los mods que el
builder necesite. El parseo de `levelStats` se hace de forma controlada — mod por mod,
no como extracción masiva automática.

Schema del override pendiente de definir — ver `Docs/architecture/mod-stats-gap.md`.
Depende de Q3 (OperationType) y Q5 (Galvanized) para modelar correctamente los casos con múltiples efectos.

---

### Q3 — ¿Cómo se modela `OperationType`?

**Hechos verificados:**
- `OperationType` no está en el JSON — D2 cancelado. Ver `Docs/decisions/open-questions.md §D2`
- Cada `upgradeType` tiene siempre el mismo `OperationType` — se puede inferir por tipo
- Fórmula dominante confirmada por la wiki: `stat_final = base × (1 + Σ valores_mods_del_mismo_upgradeType)`. Ejemplo real: `12% × (1 + 150% + 135%) = 46.2%` (wiki.warframe.com/w/Critical_Hit)
- Excepciones documentadas en `Docs/decisions/mods-builder-analysis.md §2`:
  - Valores absolutos: `WEAPON_MELEE_COMBO_DURATION_BONUS` (segundos), `WEAPON_PUNCTURE_DEPTH` (metros), `WEAPON_MELEE_COMBO_INITIAL_BONUS` (combo inicial)
  - Redistribución: `WEAPON_DAMAGE_TYPE_BIAS` (convierte % del daño total a un tipo físico)
  - Escala con N stacks: `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` (Condition Overload, Galvanized Aptitude)

**Decisión (2026-03-20):**
Inferir `OperationType` por `upgradeType` en el motor. Default `STACKING_MULTIPLY`:

```
stat_final = base × (1 + Σ values[rank] para mods del mismo upgradeType)
```

Para valores absolutos (metros, segundos): `stat_final = base + Σ values[rank]`.
La tabla de excepciones se construye de forma incremental — solo cuando el motor necesite ese caso.

---

### Q4 — ¿Cómo se modelan las condiciones de activación?

**Hechos verificados:**
- `ValidPostures` y `ValidProcTypes` no están en el JSON — D2 cancelado. Ver `Docs/decisions/open-questions.md §D2`
- La condición solo existe en el texto de `levelStats` — no hay campo estructurado
- `modClass: "Galvanized"` identifica el grupo con stacks pero no la condición específica
- Condiciones de postura documentadas en `Docs/decisions/mods-builder-analysis.md §Gap B`: `AIMING`, `AIRBORNE`, `CROUCHING`, `INVISIBLE`, `SLIDING`
- Triggers de evento documentados en `Docs/decisions/mods-builder-analysis.md §Gap C`: `On Kill`, `On Headshot`, `On Headshot Kill`, `On Hit`, `On Reload`, `On Ability Cast`
- Mods afectados por condición (~15% de mods de armas): Argon Scope, Galvanized Chamber/Scope, Spectral Serration, Soaring Strike, Spring-Loaded Chamber, etc.
- El layout del builder es contexto unificado — warframe + armas + arma exaltada en el mismo build, no builds separados por entidad

**Decisión (2026-03-20):**
El motor es función pura que recibe `(layout, context)`:

```
calculate(layout, context) → EngineOutput

context = {
  activeConditions: ["AIMING", "ON_KILL"],  // toggles activos — v1 asume max stacks
}
```

v1 — panel básico: el motor asume max stacks para todos los mods condicionales.
La condición se expone como metadata en el output para que la UI la muestre informativamente.

Panel avanzado (futuro): el provider mantiene `activeConditions[]` y recalcula al cambiar.

El rango de cada mod vive en `EquippedMod.rank` dentro del `Layout` (Q8) — no hay campo `modRanks` en `context`. El motor lee el rango directamente desde el `Layout`.

---

### Q5 — ¿Cómo se modelan los Galvanized?

**Hechos verificados:**
- Galvanized Scope verificado en wiki.warframe.com/w/Galvanized_Scope:

| Rank | Efecto 1 (On Headshot, siempre activo) | Efecto 2 (On Headshot Kill, stackeable ×5) | Max (rank 10, 5 stacks) |
|---|---|---|---|
| 10 | +120% Crit Chance while Aiming | +40% Crit Chance while Aiming | +320% |

`Max = efecto1 + (efecto2 × 5) = 120 + (40 × 5) = 320%`

- Ambos efectos son `WEAPON_CRIT_CHANCE` — van al mismo pool de cálculo
- `modClass: "Galvanized"` disponible en el JSON para identificar este grupo
- Progresión no lineal confirmada — requiere `values[]` explícitos en el override. Ver `Docs/decisions/mods-builder-analysis.md §Gap D`
- `levelStats` tiene los dos efectos como strings separados en el mismo array por rango

**Decisión (2026-03-20):**
El override modela los dos efectos como arrays separados:
- `values1[]` — efecto base por rango (siempre activo bajo su condición)
- `values2[]` — efecto stackeable por rango (valor de un stack)
- `maxStacks` — campo del override (Galvanized Scope = 5)

```
// v1 (panel básico, max stacks asumido)
total = values1[rank] + values2[rank] × maxStacks

// Panel avanzado (futuro)
total = values1[rank] + values2[rank] × activeStacks
```

La condición de activación (On Headshot, On Headshot Kill) se modela según Q4.

---

### Q6 — ¿Cómo se modelan los mods de habilidades (AVATAR_ABILITY_*)?

**Hechos verificados:**
- Vocabulario compartido verificado: `upgradeTypes: ["AVATAR_ABILITY_STRENGTH"]` en mods (Intensify, Blind Rage) = `upgradeBy: "AVATAR_ABILITY_STRENGTH"` en `ability-stats.json`. Cruce directo sin mapeo
- Fórmulas documentadas en `Docs/canonical/ability-engine-variables.md` y `Docs/analysis/ability-formulas.md`:
  - Lineal: `stat_final = baseValue × STR`
  - Cap máximo: `stat_final = min(baseValue × STR, cap)` — ej. Iron Skin 95%
  - Cap mínimo: `stat_final = max(baseValue × STR, capMin)`
  - Ambos caps: `stat_final = clamp(baseValue × STR, capMin, cap)`
  - InverseModifier: `stat_final = baseValue / STR`
  - Fijo: `stat_final = baseValue` (upgradeBy: NONE)
- Caps vienen del campo `cap`/`capMin` en `ability-stats.json` por stat — fuente: `Module:Ability/data/stats`
- Patrón especial verificado: Rhino Iron Skin usa `armor` del warframe en la fórmula (`3750 + 5 * (450 * xARMOR * STR + aARMOR)`). Ver `Docs/analysis/ability-formulas.md §Patrón 10`
- `ENERGY_COST` = `(2-EFF)*base`, `ENERGY_DRAIN` = `(2-EFF)*base/DUR` — tipos especiales que el motor conoce. Ver `Docs/canonical/ability-engine-variables.md`
- EFF tiene caps: mínimo 0.25, máximo 1.75

**Decisión (2026-03-20):**
El motor implementa cada fórmula conocida con su lógica exacta. Los caps vienen del schema de `ability-stats.json` y se aplican después del cálculo.

`ENERGY_COST` y `ENERGY_DRAIN` pendientes de implementación completa hasta tener más claridad sobre D8. No bloquean el resto del motor.

Casos especiales con `TARGET`/`COMBO` (Oberon Renewal, Atlas Landslide) y Hildryn (shields en lugar de energía) → `misc` hasta que el motor los necesite.

---

### Q7 — ¿Qué hace el motor con los augmentos de habilidad?

**Contexto:**
Los augmentos de habilidad activa tienen `upgradeTypes: []` — sin cobertura canónica.
La conexión `mod → habilidad` no existe como campo explícito en ninguna fuente disponible.

**Verificado en datos reales (2026-03-20):**

Los mods con `AVATAR_ABILITY_AUGMENT` en `upgradeTypes` (solo 3 en el JSON) son
**augmentos de pasiva** (Anchored Glide/Zephyr, Controlled Slide/Nezha, Ironclad Flight/Titania),
no de habilidades activas. Tienen `upgradeTypes` porque modifican stats del avatar.

Los augmentos de habilidades activas (Seeking Shuriken, Smoke Shadow, Accumulating Whipclaw, etc.)
tienen `upgradeTypes: []` — el wikia no tiene datos estructurados para ellos porque sus
efectos son Lua scripts, no `UpgradeType` estándar.

**Campos disponibles en un augment de habilidad activa (verificado):**
```
id, name, kind, uniqueName, categoryRaw, type, category, compatName,
baseDrain, polarity, rarity, rank, masteryReq, polarities, tags,
description, imageName, upgradeTypes (vacío), levelStats
```

No existe ningún campo que referencie directamente la habilidad que augmenta.

**Conexión implícita — dos mecanismos verificados:**

1. **Por texto en `levelStats`** — patrón `"NombreHabilidad Augment: ..."`:
   - `"Shuriken Augment: Hits expose weaknesses..."` → habilidad: Shuriken
   - `"Whipclaw Augment: Hitting 3 enemies..."` → habilidad: Whipclaw
   - `"Smoke Screen Augment: Conceals allies..."` → habilidad: Smoke Screen
   - Funciona en todos los casos pero requiere parseo de texto libre

2. **Por stem del `uniqueName`** — patrón `XxxAugmentCard` → `XxxAbility`:
   - `/Ninja/NinjaStormAugmentCard` → `/PowersuitAbilities/NinjaStormAbility` ✅
   - `/Ninja/GlaiveAugmentCard` → `/PowersuitAbilities/GlaiveAbility` ✅
   - `/Ninja/SmokeScreenAugmentCard` → `/PowersuitAbilities/SmokeScreenAbility` ✅
   - `/Ninja/SmokeScreenPvPAugmentCard` → sin match (variante PvP) ⚠️
   - Funciona en ~95% de casos, falla en variantes PvP y algunos edge cases

**Orden de dependencias correcto (verificado con base empírica):**

1. Warframe base — health, armor, escalados básicos (`warframes.json` a nivel 30)
2. Habilidades intermedias — dependen del warframe (STR/DUR/RNG/EFF vienen de los mods del warframe)
3. Conjunto completo — Warframe + Habilidades + Pasiva
4. Concepto avanzado — todo lo anterior + mods reales + arcanos
5. Augmentos — solo cuando todo lo anterior tenga soporte parcial

La habilidad necesita apuntar al augment y viceversa. La conexión bidireccional
requiere que el schema de habilidades esté más avanzado para definirla correctamente.

**Decisión (2026-03-20): override directo — dónde aplicarlo es discusión futura**

Los augmentos de habilidad activa se manejarán mediante override explícito,
aprovechando que `upgradeTypes: []` los identifica como candidatos al sistema de override.

La conexión bidireccional (ability → mod augment y mod → ability) se resolverá
por referencia directa de `uniqueName` en el override — sin depender de parseo de texto
ni de inferencia por stem (aunque ambos mecanismos están documentados como fallback).

La pregunta de **dónde vive ese override** (en el mod, en la habilidad, o en un archivo
separado) queda abierta hasta tener más información. Se retomará cuando Q8-Q10 estén
cerradas y se haga la revisión de coherencia del documento completo.

No implementar hasta completar los pasos 1-4 del orden de dependencias.

---

### Q8 — ¿Cuál es la estructura de datos de entrada del motor?

**Hechos verificados:**
- `Warframe.polarities[]` — slots con polaridad preinstalada. Ej. Ash: `["madurai","madurai"]`
- `Warframe.aura` — polaridad del slot de aura
- `Mod.isExilus: true` — 73 mods de warframe con este flag en el JSON
- Aura mods: `baseDrain < 0` en `category: 'warframe'` — 36 mods verificados, todos auras
- Stances: `categoryRaw: 'Stance Mod'` — 79 mods en `category: 'melee'`
- Arcanos: no están en `mods.json` — `arcanes.json` no existe (`GAP-DOC-2` pendiente)
- `layout-context.tsx` — placeholder vacío. Ver `Docs/architecture/architecture-audit.md §DT-8`
- Slots por entidad verificados contra reglas del juego:

| Entidad | Slots normales | Slot especial | Exilus | Arcanos |
|---|---|---|---|---|
| Warframe | 8 | 1 aura (`baseDrain < 0`) | 1 (`isExilus`) | 2 |
| Primaria | 8 | — | 1 (`isExilus`) | 1 |
| Secundaria | 8 | — | 1 (`isExilus`) | 1 |
| Melee | 8 | 1 stance (`categoryRaw: 'Stance Mod'`) | 1 (`isExilus`) | 1 |
| Compañero | 8 | — | — | — |
| Arma de compañero | 8 | — | — | — |
| Archgun | 8 | — | — | 2 (1 primaria + 1 secundaria) |
| Archmelee | 8 | — | — | — |

Excepción conocida: Jade tiene 2 auras en lugar de aura + exilus.
Necramech, Archwing, K-Drive: v2.

**Decisión (2026-03-20):**
La unidad de entrada del motor es un `Layout`. Los mods se referencian por `uniqueName` + `rank` — el motor resuelve el objeto `Mod` completo internamente.

```ts
interface EquippedMod {
  uniqueName: string
  rank: number
}

interface Layout {
  warframe?:  { uniqueName: string; mods: EquippedMod[] }
  primary?:   { uniqueName: string; mods: EquippedMod[] }
  secondary?: { uniqueName: string; mods: EquippedMod[] }
  melee?:     { uniqueName: string; mods: EquippedMod[] }
  // companion: v2 — sin datos estructurados (GAP-DOC-3 pendiente)
}
```

El layout puede ser parcial — el motor calcula lo que tiene disponible.

Extensibilidad para casos especiales (no bloquean v1):
- Sevagoth (doble forma): `warframe` se extiende con `shadow?: { mods: EquippedMod[] }`
- Armas exaltadas: entidad adicional del tipo correspondiente dentro del mismo layout

Arcanos: cuando `arcanes.json` exista, se añaden como `arcanes?: { uniqueName: string; rank: number }[]` por entidad.

Compañeros y armas de compañero: v2 — sin análisis de datos disponible (GAP-DOC-3 pendiente). No se incluyen en el `Layout` de v1.

---

### Q9 — ¿Qué devuelve el motor?

**Hechos verificados:**
- Imagen de referencia (Dread + Serration): `168 ▶ 445.2` — valor base ▶ valor calculado con mods, por tipo de daño individual, por ataque
- Estructura real de `attacks[]` en `weapons.json` verificada para la Dread: `Uncharged Shot`, `Charged Shot`, `Incarnon Form Charged Shot` — cada uno con su propio `damage{}`, `crit_chance`, `crit_mult`, `status_chance`
- Stats top-level del arma que no pertenecen a ningún ataque específico: `magazineSize`, `reloadTime`, `accuracy`, `multishot`, `noise`, `trigger`. Ver `Docs/analysis/weapon-data-analysis.md §2.1`
- `multishot` es un stat top-level del arma (no está en `attacks[]`). El upgradeType canónico es `WEAPON_FIRE_ITERATIONS` — verificado en `mods.json` (Barrel Diffusion, Split Chamber, Galvanized Chamber, etc.). El daño efectivo por disparo = `attacks[].damage × (1 + multishot_calculado)` — `multishot` afecta el output de daño pero no es un campo de `AttackResult` sino un multiplicador aplicado en el cálculo
- `falloff` existe en `attacks[]` para shotguns, launchers y AoE melee (`Slam Attack`, `Heavy Slam Attack`). Estructura: `{ start, end, reduction }`. Afectado por `WEAPON_EXPLOSION_RADIUS` (radio de explosión). Ver `Docs/analysis/weapon-data-analysis.md §2.3`
- Stats melee top-level sin representación en `attacks[]`: `heavyAttackDamage` (única fuente para Heavy Attack estándar), `range`, `comboDuration`, `followThrough`. Ver `Docs/analysis/weapon-data-analysis.md §5.3`
- Melee: `"Slam Attack"` y `"Heavy Slam Attack"` están en `attacks[]` con `falloff`. `"slide"` está en `attacks[].Normal Attack` como string. `heavyAttackDamage` top-level es la única fuente para el Heavy Attack directo en armas estándar
- `WarframeResult` necesita incluir stats calculados de habilidades — `abilityStrength` es el multiplicador, pero los `baseValue × STR` de cada stat de cada habilidad son el output real que la UI necesita mostrar. No pueden ir en `WarframeResult` — necesitan campo separado en `EngineOutput` keyed por `uniqueName` de la habilidad
- `EngineOutput` no incluye `companion` — alineado con Q8 (compañeros son v2, no están en el `Layout`)

**Decisión (2026-03-20, coherencia aplicada 2026-03-21):**
El motor devuelve un objeto estructurado por entidad. Cada stat expone `base` + `calculated`.
La UI muestra `base ▶ calculated` solo cuando difieren.

```ts
interface StatResult {
  base: number
  calculated: number
}

// Un ataque individual (ranged o melee)
interface AttackResult {
  name: string
  damage: Partial<Record<DamageType, StatResult>>
  totalDamage: StatResult
  critChance: StatResult
  critMultiplier: StatResult
  statusChance: StatResult
  fireRate?: StatResult        // speed del ataque — opcional (Lanka no tiene speed)
  falloff?: {                  // presente en shotguns, launchers, AoE melee
    start: number
    end: number
    reduction: number
    // start/end afectados por WEAPON_EXPLOSION_RADIUS cuando aplica
  }
}

// Stats del arma que no pertenecen a ningún ataque específico
interface WeaponStats {
  magazineSize: StatResult     // afectado por WEAPON_CLIP_MAX
  reloadTime: StatResult       // afectado por WEAPON_RELOAD_SPEED
  accuracy: StatResult         // afectado por WEAPON_SPREAD (invertido)
  multishot: StatResult        // afectado por WEAPON_FIRE_ITERATIONS
  // multishot no es un campo de AttackResult — es un multiplicador de daño
  // daño efectivo = attacks[].damage × (1 + multishot.calculated)
}

// Stats melee adicionales (solo armas melee)
interface MeleeStats {
  heavyAttackDamage: StatResult  // fuente: weapon.heavyAttackDamage top-level
  range: StatResult              // afectado por WEAPON_RANGE
  comboDuration: StatResult      // afectado por WEAPON_MELEE_COMBO_DURATION_BONUS
  followThrough: StatResult
}

interface WeaponResult {
  attacks: AttackResult[]
  weaponStats: WeaponStats       // stats top-level del arma
  meleeStats?: MeleeStats        // solo si el arma es melee
}

// Stats calculados de una habilidad individual
interface AbilityResult {
  uniqueName: string
  stats: Record<string, StatResult>  // keyed por label del stat
}

interface WarframeResult {
  health: StatResult
  shield: StatResult
  armor: StatResult
  energy: StatResult
  abilityStrength: StatResult
  abilityDuration: StatResult
  abilityRange: StatResult
  abilityEfficiency: StatResult
}

interface EngineOutput {
  warframe?:   WarframeResult
  primary?:    WeaponResult
  secondary?:  WeaponResult
  melee?:      WeaponResult
  abilities?:  AbilityResult[]   // stats calculados por habilidad, keyed por uniqueName
  // companion: v2 — alineado con Q8 y Q1
}
```

**Granularidad de re-render — responsabilidad del provider:**
El motor recalcula todo y devuelve el objeto completo. La memoización granular vive en el provider.
Para v1: `useMemo` por entidad. Hook granular por stat (`useBuilderStat`) como extensión futura.

---

### Q10 — ¿Dónde vive el motor en la arquitectura de archivos?

**Hechos verificados:**
- `features/arsenal/engine/index.ts` — placeholder vacío. Ver `Docs/architecture/architecture-audit.md §DT-11`
- `features/arsenal/ArsenalView.tsx` — placeholder vacío, único consumidor previsto del motor
- `features/hud/layout-context.tsx` — placeholder vacío, solo contexto visual (nombre + imagen de lo equipado), sin stats calculados. Referencia: imagen del perfil del juego (`Atlas Prime [30] / Dread [30] / Panzer Vulpaphyla [30]`)
- `src/lib/` — capa de datos compartida: `weaponData.ts`, `warframeData.ts`, `modData.ts`, `types.ts`
- D3 decidido: lógica pura primero, UI después. Ver `Docs/decisions/open-questions.md §D3`
- El motor importa desde `src/lib/` para resolver entidades por `uniqueName` — pero no vive ahí

**Decisión (2026-03-20):**
El motor vive en `features/arsenal/engine/` — feature-specific, no compartido.
Único consumidor: `ArsenalView`. El `HudHeader` no consume el motor.

```
features/arsenal/
├── ArsenalView.tsx
└── engine/
    ├── index.ts        ← export calculate(layout, context) → EngineOutput
    ├── weapon.ts       ← cálculo de stats de armas
    ├── warframe.ts     ← cálculo de stats de warframe
    └── abilities.ts    ← cálculo de stats de habilidades
```


