# Ability Engine Variables

> Estado: activo
> Rol: fijar el vocabulario canonico de scaling de habilidades
> Fuente de verdad de: variables del engine usadas por `upgradeBy`
> No usar para: cobertura del dataset o backlog del builder
> Depende de: `source-model.md`, `schema.md`
> Ultima actualizacion: 2026-03-22

## Variables de build

| Variable del modulo | Identificador canonico | Descripcion | Formula base |
|---|---|---|---|
| `STR` | `AVATAR_ABILITY_STRENGTH` | fuerza de habilidades | `STR * baseValue` |
| `DUR` | `AVATAR_ABILITY_DURATION` | duracion de habilidades | `DUR * baseValue` |
| `RNG` | `AVATAR_ABILITY_RANGE` | rango de habilidades | `RNG * baseValue` |
| `EFF` | `AVATAR_ABILITY_EFFICIENCY` | eficiencia de habilidades | ver energia |
| - | `NONE` | valor fijo sin scaling | `baseValue` |

## Tipos especiales de energia

| Identificador | Formula esperada | Descripcion |
|---|---|---|
| `ENERGY_COST` | `(2 - EFF) * baseValue` | coste de activacion |
| `ENERGY_DRAIN` | `(2 - EFF) * baseValue / DUR` | drain por segundo |

## Caps relevantes

- `EFF` se interpreta con clamp entre `0.25` y `1.75`
- `STR`, `DUR` y `RNG` no tienen cap canonico global
- los caps reales por stat viven en `cap` y `capMin` del schema

## Regla de coherencia

Los identificadores de `upgradeBy` deben coincidir con el vocabulario que ya usa
`upgradeTypes[]` en mods de warframe. Eso evita tablas de traduccion intermedias
entre mods y habilidades.

## Patrones de energia menos comunes

| Patron | Formula | Tratamiento actual |
|---|---|---|
| drain con `TARGET` | `(2 - EFF) * base / DUR * TARGET` | `misc` o futuro parametro |
| coste por accion con `COMBO` | `(2 - EFF) * base / COMBO` | `misc` hasta necesitarlo |
| shields de Hildryn | `base * STR` | caso especial del engine |
| drain por enemigo | `(2 - EFF) * base * TARGET_COUNT` | fuera de v1 |

## Casos especiales fuera del vocabulario base

- `TARGET`
- `COMBO`
- formulas que dependen de armor o shields del warframe
- casos especiales de Hildryn y Equinox

Estos casos informan al engine, pero no amplian por si solos el vocabulario base.

## Fuentes

- `Module:Maximization/data`
- `Module:Ability/data/stats`
- `formula-patterns.md`
