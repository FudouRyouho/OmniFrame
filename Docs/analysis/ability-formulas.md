# Catálogo de fórmulas de habilidades — Module:Maximization/data

> Estado: referencia — catálogo de patrones de fórmula
> Última actualización: 2026-03-20
> Fuente canónica: `Module:Maximization/data` (raw en `Docs/wiki-modules/maximization-data.lua`)
> Destilado en: `Docs/canonical/ability-engine-variables.md` (resumen de variables y patrones)
> Relacionado: `ability-schema-examples.md` §3 (variables del engine), §4 (D8 cerrado)

Este documento cataloga todos los patrones de fórmula observados en el módulo,
contrastados con la semántica del engine. El objetivo es tener una base sólida
antes de definir el schema final de `AbilityStatValue` (D8 pendiente).

---

## Variables del engine

| Variable | Identificador canónico | Descripción |
|---|---|---|
| `STR` | `AVATAR_ABILITY_STRENGTH` | `1 + Σ(mods de fuerza)` |
| `DUR` | `AVATAR_ABILITY_DURATION` | `1 + Σ(mods de duración)` |
| `RNG` | `AVATAR_ABILITY_RANGE` | `1 + Σ(mods de rango)` |
| `EFF` | `AVATAR_ABILITY_EFFICIENCY` | `1 + Σ(mods de eficiencia)` |

Nota: `EFF` tiene un cap mínimo de 0.25 (máximo coste = 175% del base).
`EFF` tiene un cap máximo de 1.75 (mínimo coste = 25% del base).

---

## Patrón 1 — Stat lineal simple

La fórmula más común. Un valor base escalado por una sola variable.

```
variable * baseValue
```

### Ejemplos

```lua
-- Excalibur / Slash Dash
{'STR * 250',        'Damage'}
{'RNG * 12',  'm',   'Range'}

-- Rhino / Roar
{'STR * 50',  '%',   'Bonus damage'}
{'RNG * 25',  'm',   'Range'}

-- Volt / Speed
{'STR * 50',  '%',   'Speed boost'}
{'RNG * 15',  'm',   'Radius'}
{'DUR * 15',  's',   'Duration'}

-- Saryn / Spores
{'STR * 100',        'Damage per stack'}
{'RNG * 10',  'm',   'Range'}
```

### Schema

```typescript
{
  baseValue: 250,
  upgradeBy: "AVATAR_ABILITY_STRENGTH"
}
```

---

## Patrón 2 — Stat con cap máximo

Valor escalado con un límite superior. Frecuente en reducciones de daño y
porcentajes que no pueden superar el 100%.

```
(variable * baseValue), MAX_CAP
```

### Ejemplos

```lua
-- Rhino / Iron Skin
{'(STR * 80), 95', '%', 'Damage reduction'}   -- máx 95%

-- Nezha / Warding Halo
{'(STR * 90), 95', '%', 'Damage reduction'}   -- máx 95%

-- Frost / Snow Globe
{'(STR * 50), 95', '%', 'Damage absorption'}  -- máx 95%

-- Ember / Immolation
{'(STR * 50), 100', '%', 'Heat gauge rate'}   -- máx 100%
```

### Schema

```typescript
{
  baseValue: 80,
  upgradeBy: "AVATAR_ABILITY_STRENGTH",
  cap: 95
}
```

---

## Patrón 3 — Stat con cap mínimo

Valor que no puede bajar de un umbral. Menos frecuente.

```
(variable * baseValue), MIN_CAP
```

### Ejemplos

```lua
-- Garuda / Blood Altar
{'(STR * 0.5), 0.25', '/s', 'Lifesteal'}  -- mín 0.25/s

-- Limbo / Banish
{'(DUR * 10), 5', 's', 'Duration'}        -- mín 5s
```

### Schema

```typescript
{
  baseValue: 0.5,
  upgradeBy: "AVATAR_ABILITY_STRENGTH",
  capMin: 0.25
}
```

---

## Patrón 4 — Stat con cap mínimo y máximo

```
MIN_CAP <= (variable * baseValue) <= MAX_CAP
```

### Ejemplos

```lua
-- Nidus / Parasitic Link
{'(STR * 25), 10-75', '%', 'Damage bonus'}  -- entre 10% y 75%
```

### Schema

```typescript
{
  baseValue: 25,
  upgradeBy: "AVATAR_ABILITY_STRENGTH",
  capMin: 10,
  cap: 75
}
```

---

## Patrón 5 — Stat con InverseModifier

El valor base se divide por la variable en lugar de multiplicarse.
Usado en stats donde "más es menos" (metros por energía, coste por distancia).

```
baseValue / variable
```

### Ejemplos

```lua
-- Volt / Electric Shield
{'25 / RNG', 'm/energy', 'Range per energy'}  -- más rango = menos metros por energía

-- Garuda / Blood Altar (InverseModifier = true en el módulo)
{'STR * 0.5', '/s', 'Lifesteal'}  -- InverseModifier indica que STR reduce el coste
```

### Schema

```typescript
{
  baseValue: 25,
  upgradeBy: "AVATAR_ABILITY_RANGE",
  inverse: true
}
```

---

## Patrón 6 — Energía: coste de activación

El patrón de energía más común. Escala solo con Efficiency.
La fórmula `(2 - EFF)` hace que más Efficiency = menos coste.

```
(2 - EFF) * baseCost
```

### Ejemplos

```lua
-- Excalibur / Slash Dash
{'(2-EFF)*25', 'Energy'}

-- Rhino / Roar
{'(2-EFF)*75', 'Energy'}

-- Ash / Blade Storm
{'(2-EFF)*100', 'Energy'}

-- Volt / Speed
{'(2-EFF)*50', 'Energy'}
```

### Semántica del engine

`EFF` tiene cap: `0.25 ≤ EFF ≤ 1.75`
- EFF = 1.75 → coste = `(2 - 1.75) * base = 0.25 * base` (mínimo 25%)
- EFF = 0.25 → coste = `(2 - 0.25) * base = 1.75 * base` (máximo 175%)

### Schema (pendiente D8)

Opciones abiertas — ver §Energía al final del documento.

---

## Patrón 7 — Energía: drain por segundo (habilidades toggle/canal)

Habilidades que consumen energía continuamente mientras están activas.
Escala con Efficiency Y Duration simultáneamente.

```
(2 - EFF) * baseDrain / DUR
```

### Ejemplos

```lua
-- Valkyr / Hysteria
{'(2-EFF)*2.5/DUR', '/s', 'Energy drain'}

-- Excalibur / Exalted Blade
{'(2-EFF)*2.5/DUR', '/s', 'Energy drain'}

-- Wukong / Primal Fury
{'(2-EFF)*2.5/DUR', '/s', 'Energy drain'}

-- Banshee / Sound Quake
{'(2-EFF)*12/DUR', '/s', 'Energy drain'}

-- Inaros / Sandstorm
{'(2-EFF)*5/DUR', '/s', 'Energy drain'}
```

### Semántica del engine

Dos variables independientes: EFF reduce el coste base, DUR reduce el drain/s.
Más Duration = menos drain por segundo (la habilidad dura más con la misma energía).

### Schema (pendiente D8)

Este patrón requiere dos `upgradeBy` simultáneos — es el caso que hace necesaria
la decisión D8. Ver §Energía al final del documento.

---

## Patrón 8 — Energía: drain por segundo con multiplicador TARGET

Drain que escala con el número de objetivos afectados.

```
(2 - EFF) * baseDrain / DUR * TARGET
```

### Ejemplos

```lua
-- Oberon / Renewal
{'(2-EFF)*3/DUR*TARGET', '/s', 'Energy drain per ally'}
```

### Notas

`TARGET` no es una variable del engine en el mismo sentido que STR/DUR/RNG/EFF.
Es un multiplicador dinámico (número de aliados en rango). El builder probablemente
lo trata como un parámetro configurable o asume un valor fijo (1 objetivo).

---

## Patrón 9 — Energía: coste por acción (no por tiempo)

Coste que se paga cada vez que se ejecuta una acción específica dentro de la habilidad.

```
(2 - EFF) * baseCost / COMBO
```

### Ejemplos

```lua
-- Atlas / Landslide
{'(2-EFF)*25/COMBO', 'Energy per hit'}  -- COMBO = multiplicador de combo

-- Valkyr / Rip Line
{'(2-EFF)*25', 'Energy per use'}
```

### Notas

`COMBO` es el multiplicador del combo counter. Más combo = menos coste por golpe.
Similar a `TARGET`, no es una variable de build sino un estado de combate.

---

## Patrón 10 — Fórmula con armor del warframe

Stats que dependen del armor base del warframe, no solo de los mods.

```
baseValue + armor_factor * STR * xARMOR
```

### Ejemplos

```lua
-- Rhino / Iron Skin (absorción base)
{'3750 + 5 * (450 * xARMOR * STR + aARMOR)', 'Damage absorbed'}
-- xARMOR = armor del warframe, aARMOR = armor adicional de mods
```

### Notas

Este patrón es el más complejo del módulo. `xARMOR` y `aARMOR` son valores
del warframe equipado, no variables de build estándar. El builder necesita
conocer el armor base del warframe para calcular este stat.

---

## Patrón 11 — Stat fijo (sin escala)

Valor que no escala con ninguna variable del engine.

```
baseValue  (constante)
```

### Ejemplos

```lua
-- Varios / contadores, stacks máximos, valores de UI
{'10', 'Max stacks'}
{'5', 'Charges'}
```

### Schema

```typescript
{
  baseValue: 10,
  upgradeBy: "NONE"
}
```

---

## Patrón 12 — Helminth: valor base alternativo

Cuando una habilidad se infunde vía Helminth, puede tener valores base distintos.
El scaling sigue siendo el mismo (`upgradeBy` no cambia).

```
helminthBase * variable  [helminthCap]
```

### Ejemplos

```lua
-- Wisp / Motes (Haste Mote vía Helminth)
{ Val1 = 30, HelminthValues = { Val1 = 20 } }  -- base 30 normal, 20 vía Helminth

-- Garuda / Blood Altar (vía Helminth)
{ Val1 = 0.5, HelminthValues = { Val1 = 0.3 }, HelminthMax = 0.5 }
```

### Schema

```typescript
{
  baseValue: 30,
  upgradeBy: "AVATAR_ABILITY_STRENGTH",
  helminthBase: 20,
  helminthCap: 50  // si aplica
}
```

---

## §Energía — Decisión D8 pendiente

### Resumen de patrones de energía identificados

| Patrón | Fórmula | Variables | Frecuencia |
|---|---|---|---|
| Coste de activación | `(2-EFF)*base` | EFF | ~80% de habilidades |
| Drain por segundo | `(2-EFF)*base/DUR` | EFF + DUR | Habilidades toggle/canal |
| Drain con TARGET | `(2-EFF)*base/DUR*TARGET` | EFF + DUR + TARGET | Oberon Renewal |
| Coste por acción | `(2-EFF)*base/COMBO` | EFF + COMBO | Atlas, Valkyr |
| Shields (Hildryn) | `base * STR` (shields, no energía) | STR | Solo Hildryn |
| Equinox especial | drain por enemigo en rango | EFF + TARGET dinámico | Solo Equinox 3/4 |

### El problema de D8

El patrón de drain por segundo (`(2-EFF)*base/DUR`) requiere dos variables simultáneas.
El schema actual de `AbilityStatValue` tiene un solo `upgradeBy`.

### Opciones abiertas

**Opción A — Array de upgradeBy**
```typescript
{ upgradeBy: ["AVATAR_ABILITY_EFFICIENCY", "AVATAR_ABILITY_DURATION"] }
```
Genérico pero pierde la semántica de la fórmula `(2-EFF)*base/DUR`.

**Opción B — Tipos especiales de energía**
```typescript
{ upgradeBy: "ENERGY_COST" }    // el builder sabe que usa (2-EFF)*base
{ upgradeBy: "ENERGY_DRAIN" }   // el builder sabe que usa (2-EFF)*base/DUR
```
Más legible, menos genérico. Ya existe `ENERGY_DRAIN` en el modelo actual.

**Opción C — Campo `formula` explícito**
```typescript
{
  upgradeBy: "AVATAR_ABILITY_EFFICIENCY",
  formula: "(2-EFF)*base/DUR",  // string de fórmula para el builder
  secondaryUpgradeBy: "AVATAR_ABILITY_DURATION"
}
```
Máxima expresividad, mayor complejidad en el builder.

**Opción D — Tipo especial + campo auxiliar**
```typescript
{
  upgradeBy: "ENERGY_DRAIN",
  // El builder sabe que ENERGY_DRAIN usa (2-EFF)*base/DUR implícitamente
}
```
Compromiso entre B y C. El builder tiene lógica especial para `ENERGY_DRAIN`.

### Recomendación preliminar

La Opción B/D parece el mejor compromiso:
- `ENERGY_COST` para activación — el builder aplica `(2-EFF)*base`
- `ENERGY_DRAIN` para toggle/canal — el builder aplica `(2-EFF)*base/DUR`
- Casos con TARGET/COMBO se documentan como `misc` hasta que el builder los necesite

Hildryn y Equinox son casos genuinamente especiales que probablemente requieren
override manual (`misc`) independientemente del schema que se elija.

**Pendiente**: confirmar con el módulo completo si hay más patrones no catalogados
antes de cerrar D8.

---

## Referencias

- `Docs/wiki-modules/maximization-data.lua` — fuente raw de todas las fórmulas
- `Docs/wiki-modules/maximization-data.md` — documentación del módulo
- `Docs/wiki-modules/ability-data-stats.lua` — valores base y campos canónicos
- `Docs/canonical/ability-engine-variables.md` — resumen de variables y patrones (destilado de este doc)
- `Docs/analysis/ability-stats-audit.md` — auditoría del JSON actual
- `Docs/decisions/open-questions.md` §D8 — decisión de energía (cerrada)
