# Arquitectura del Motor de Cálculo — Builder v1

> Estado: activo
> Creado: 2026-03-21
> Fuente de decisiones: `Docs/decisions/builder-engine-questions.md` (Q1-Q10)
> Referencia de datos: `Docs/decisions/mods-builder-analysis.md`, `Docs/analysis/weapon-data-analysis.md`, `Docs/canonical/ability-engine-variables.md`

---

## 1. Principios

- El motor es una **función pura**: `calculate(layout, context) → EngineOutput`
- No tiene estado propio. No conoce React. No hace fetch.
- La memoización y el re-render son responsabilidad del provider que lo consume.
- El único consumidor en v1 es `ArsenalView` — el motor vive en `features/arsenal/engine/`.
- El layout puede ser parcial — el motor calcula lo que tiene disponible.

---

## 2. Scope v1

El motor se construye por capas horizontales según la completitud de los datos disponibles.

| Capa | Fuente de datos | Estado |
|---|---|---|
| Stats de armas | `weapons.json` — completo | ✅ datos listos |
| Mods de arma | `mods.json` + `mod-stats.json` (override) | ✅ datos listos / override pendiente |
| Stats base de warframe | `warframes.json` — nivel 30 | ✅ datos listos |
| Mods de warframe | misma fuente que mods de arma | ✅ datos listos |
| Habilidades | `ability-stats.json` — cobertura parcial | ⏳ cobertura parcial |
| Layout completo | cuando cada apartado tenga soporte parcial | ⏳ objetivo final v1 |

Fuera de scope v1: compañeros, armas de compañero, Necramech, Archwing, K-Drive.
Arcanos: se añaden cuando exista `arcanes.json` (GAP-DOC-2 pendiente).

---

## 3. Estructura de archivos

```
features/arsenal/
├── ArsenalView.tsx              ← único consumidor del motor
└── engine/
    ├── index.ts                 ← export calculate(layout, context) → EngineOutput
    ├── weapon.ts                ← cálculo de stats de armas
    ├── warframe.ts              ← cálculo de stats de warframe
    └── abilities.ts             ← cálculo de stats de habilidades
```

El motor importa datos desde `src/lib/` (`weaponData.ts`, `warframeData.ts`, `modData.ts`)
para resolver entidades por `uniqueName`. No vive en `src/lib/` porque es feature-specific.

---

## 4. Datos de entrada — `Layout`

```ts
interface EquippedMod {
  uniqueName: string   // referencia al mod en mods.json
  rank: number         // rango actual equipado (0 = rango mínimo)
}

interface Layout {
  warframe?:  { uniqueName: string; mods: EquippedMod[] }
  primary?:   { uniqueName: string; mods: EquippedMod[] }
  secondary?: { uniqueName: string; mods: EquippedMod[] }
  melee?:     { uniqueName: string; mods: EquippedMod[] }
  // companion: v2 — GAP-DOC-3 pendiente
}
```

El motor resuelve el objeto `Mod` completo internamente a partir del `uniqueName`.
El rango del mod vive en `EquippedMod.rank` — no se duplica en ningún otro campo.

### Slots por entidad

| Entidad | Slots normales | Slot especial | Exilus | Arcanos |
|---|---|---|---|---|
| Warframe | 8 | 1 aura (`baseDrain < 0`) | 1 (`isExilus: true`) | 2 |
| Primaria | 8 | — | 1 (`isExilus: true`) | 1 |
| Secundaria | 8 | — | 1 (`isExilus: true`) | 1 |
| Melee | 8 | 1 stance (`categoryRaw: 'Stance Mod'`) | 1 (`isExilus: true`) | 1 |

Excepción conocida: Jade tiene 2 auras en lugar de aura + exilus.

### Extensibilidad (no bloquea v1)

- Sevagoth (doble forma): `warframe` se extiende con `shadow?: { mods: EquippedMod[] }`
- Armas exaltadas: entidad adicional del tipo correspondiente dentro del mismo layout
- Arcanos: `arcanes?: { uniqueName: string; rank: number }[]` por entidad cuando exista la fuente

---

## 5. Contexto de cálculo — `CalculationContext`

```ts
interface CalculationContext {
  activeConditions: string[]
  // Ejemplos: ["AIMING", "ON_KILL", "AIRBORNE"]
  // v1: ignorado — el motor asume max stacks para todos los mods condicionales
  // v2: el provider mantiene activeConditions[] y recalcula al cambiar
}
```

En v1 el motor asume siempre el caso de máximo rendimiento (max stacks, condiciones activas).
Las condiciones se exponen como metadata en el output para que la UI las muestre informativamente.

---

## 6. Valores numéricos de mods — fuente y override

### Fuente primaria: `upgradeTypes[]`

`upgradeTypes[]` en `mods.json` identifica qué stat modifica cada mod — cubre ~85% de mods.
Es el vocabulario canónico compartido con habilidades (`upgradeBy` en `ability-stats.json`).

```
Serration       → upgradeTypes: ["WEAPON_DAMAGE_AMOUNT"]
Intensify       → upgradeTypes: ["AVATAR_ABILITY_STRENGTH"]
Barrel Diffusion → upgradeTypes: ["WEAPON_FIRE_ITERATIONS"]
```

### Fuente de valores: `mod-stats.json` (override)

`levelStats[rank].stats[]` en `mods.json` contiene los valores como strings por rango.
El motor no parsea estos strings directamente — usa `mod-stats.json` como override con
`values[]` explícitos por rango.

El override es necesario para:

| Caso | Qué aporta |
|---|---|
| Todos los mods que el builder necesite | `values[]` por rango — evita parseo de strings |
| Primed, Galvanized, Archon | progresión no lineal — `values[]` explícitos obligatorios |
| Mods elementales | `damageType` — no está en `upgradeTypes` (Gap A) |
| Augmentos UNIQUE (`upgradeTypes: []`) | `misc` con descripción del efecto |

Schema del override: pendiente de definir en `Docs/architecture/mod-stats-gap.md`.

### Mods Galvanized — modelo de doble efecto

Los Galvanized tienen dos efectos sobre el mismo `upgradeType`:

```
// Override en mod-stats.json
{
  "values1": [...],   // efecto base por rango (siempre activo bajo su condición)
  "values2": [...],   // efecto stackeable por rango (valor de 1 stack)
  "maxStacks": 5      // Galvanized Scope = 5 stacks
}

// Cálculo v1 (max stacks asumido)
total = values1[rank] + values2[rank] × maxStacks
```

---

## 7. Fórmulas de cálculo

### 7.1 Mods de arma — `STACKING_MULTIPLY` (default)

La fórmula dominante, confirmada por la wiki:

```
stat_final = base × (1 + Σ values[rank] para mods del mismo upgradeType)
```

Ejemplo real (Dread + Serration rank 10):
```
slash_base = 302.4
Serration values[10] = 1.65  (165%)
slash_final = 302.4 × (1 + 1.65) = 302.4 × 2.65 = 801.36
```

Excepciones — valores absolutos (suma directa):
- `WEAPON_MELEE_COMBO_DURATION_BONUS` — segundos
- `WEAPON_PUNCTURE_DEPTH` — metros de punch through
- `WEAPON_MELEE_COMBO_INITIAL_BONUS` — combo inicial

La tabla de excepciones se construye de forma incremental — solo cuando el motor necesite ese caso.

### 7.2 Mods de warframe — misma fórmula, distinto pool

Los mods de warframe usan el mismo vocabulario canónico y la misma fórmula:

```
health_final  = base × (1 + Σ AVATAR_HEALTH_MAX mods)
shield_final  = base × (1 + Σ AVATAR_SHIELD_MAX mods)
armor_final   = base × (1 + Σ AVATAR_ARMOUR mods)
energy_final  = base × (1 + Σ AVATAR_POWER_MAX mods)
```

Variables de habilidad (calculadas antes de aplicar a los stats de habilidad):
```
STR = 1 + Σ AVATAR_ABILITY_STRENGTH mods
DUR = 1 + Σ AVATAR_ABILITY_DURATION mods
RNG = 1 + Σ AVATAR_ABILITY_RANGE mods
EFF = clamp(1 + Σ AVATAR_ABILITY_EFFICIENCY mods, 0.25, 1.75)
```

### 7.3 Stats de habilidades — fórmulas por patrón

El motor implementa cada patrón con su lógica exacta. Los caps vienen del campo
`cap`/`capMin` en `ability-stats.json` por stat.

| Patrón | Fórmula | Campo en schema |
|---|---|---|
| Lineal | `baseValue × STR` | `upgradeBy: "AVATAR_ABILITY_STRENGTH"` |
| Cap máximo | `min(baseValue × STR, cap)` | `cap: 95` |
| Cap mínimo | `max(baseValue × STR, capMin)` | `capMin: 0.25` |
| Ambos caps | `clamp(baseValue × STR, capMin, cap)` | `capMin: 10, cap: 75` |
| InverseModifier | `baseValue / STR` | `inverse: true` |
| Fijo | `baseValue` | `upgradeBy: "NONE"` |
| Coste activación | `(2 - EFF) × base` | `upgradeBy: "ENERGY_COST"` |
| Drain por segundo | `(2 - EFF) × base / DUR` | `upgradeBy: "ENERGY_DRAIN"` |

Patrón especial — Iron Skin (Rhino): usa `armor` del warframe en la fórmula.
El motor necesita el `armor_final` calculado del warframe para este stat.

Casos `misc` (no implementar en v1): TARGET (Oberon Renewal), COMBO (Atlas Landslide),
Hildryn (shields en lugar de energía), Equinox (drain por enemigo).

---

## 8. Datos de salida — `EngineOutput`

```ts
interface StatResult {
  base: number        // valor sin mods
  calculated: number  // valor con mods aplicados
}

// Un ataque individual
interface AttackResult {
  name: string
  damage: Partial<Record<DamageType, StatResult>>
  totalDamage: StatResult
  critChance: StatResult
  critMultiplier: StatResult
  statusChance: StatResult
  fireRate?: StatResult       // opcional — Lanka y similares no tienen speed
  falloff?: {                 // shotguns, launchers, AoE melee
    start: number
    end: number
    reduction: number
    // start/end afectados por WEAPON_EXPLOSION_RADIUS cuando aplica
  }
}

// Stats del arma fuera de los ataques
interface WeaponStats {
  magazineSize: StatResult    // WEAPON_CLIP_MAX
  reloadTime: StatResult      // WEAPON_RELOAD_SPEED
  accuracy: StatResult        // WEAPON_SPREAD (invertido)
  multishot: StatResult       // WEAPON_FIRE_ITERATIONS
  // multishot es un multiplicador de daño, no un campo de AttackResult
  // daño efectivo por disparo = attacks[].damage × (1 + multishot.calculated)
}

// Stats melee adicionales
interface MeleeStats {
  heavyAttackDamage: StatResult  // fuente: weapon.heavyAttackDamage top-level
  range: StatResult              // WEAPON_RANGE
  comboDuration: StatResult      // WEAPON_MELEE_COMBO_DURATION_BONUS
  followThrough: StatResult
}

interface WeaponResult {
  attacks: AttackResult[]
  weaponStats: WeaponStats
  meleeStats?: MeleeStats        // solo armas melee
}

// Stats calculados de una habilidad
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
  warframe?:  WarframeResult
  primary?:   WeaponResult
  secondary?: WeaponResult
  melee?:     WeaponResult
  abilities?: AbilityResult[]   // stats calculados por habilidad
  // companion: v2
}
```

La UI muestra `base ▶ calculated` cuando difieren. Cuando son iguales (sin mods que afecten ese stat), solo muestra `base`.

---

## 9. Granularidad de re-render

El motor recalcula todo y devuelve el objeto completo. La memoización vive en el provider.

```ts
// v1 — memoización por entidad
const primary = useMemo(() => output?.primary, [output?.primary])
const warframe = useMemo(() => output?.warframe, [output?.warframe])

// Un cambio en primary no toca warframe.
// Un cambio en multishot no toca critChance.
```

Hook granular por stat (`useBuilderStat`) como extensión futura si el profiling lo justifica.

---

## 10. Gaps conocidos y pendientes

| Gap | Descripción | Bloqueante |
|---|---|---|
| `mod-stats.json` schema | Override de valores por rango — pendiente de definir | Sí — antes de implementar |
| `arcanes.json` | Arcanos sin datos estructurados | GAP-DOC-2 |
| `ability-stats.json` cobertura | ~1 warframe completo en formato nuevo | No bloquea — motor funciona con lo disponible |
| D8 — energía | `ENERGY_COST`/`ENERGY_DRAIN` pendientes de cierre formal | No bloquea el resto del motor |
| Augmentos de habilidad | Override bidireccional ability↔mod — no implementar hasta paso 4 | No bloquea v1 |
| Compañeros | GAP-DOC-3 pendiente | v2 |

---

## Referencias

- `Docs/decisions/builder-engine-questions.md` — proceso de decisión completo (Q1-Q10)
- `Docs/decisions/mods-builder-analysis.md` — taxonomía de upgradeTypes y gaps de mods
- `Docs/analysis/weapon-data-analysis.md` — estructura canónica de weapons.json
- `Docs/canonical/ability-engine-variables.md` — variables del engine y patrones de fórmula
- `Docs/analysis/ability-formulas.md` — catálogo completo de patrones de habilidades
- `Docs/decisions/open-questions.md` — decisiones D1-D8 y deuda técnica DT-11
