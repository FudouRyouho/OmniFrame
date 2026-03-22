# Ability Formula Patterns

> Estado: activo
> Rol: resumir los patrones de formula que el proyecto reconoce hoy para habilidades
> Fuente de verdad de: catalogo operativo de formulas para el builder v1
> No usar para: mecanicas avanzadas aun fuera de alcance
> Depende de: `engine-variables.md`, `schema.md`
> Ultima actualizacion: 2026-03-22

## Patrones cubiertos

| Patron | Formula | Soporte esperado |
|---|---|---|
| lineal | `variable * baseValue` | si |
| cap maximo | `min(variable * baseValue, cap)` | si |
| cap minimo | `max(variable * baseValue, capMin)` | si |
| ambos caps | `clamp(variable * baseValue, capMin, cap)` | si |
| inverse | `baseValue / variable` | si |
| fijo | `baseValue` | si |
| energia por uso | `(2 - EFF) * baseValue` | si |
| energia por segundo | `(2 - EFF) * baseValue / DUR` | si |
| helminth alternativo | mismo patron con base/cap alternativos | parcial |

## Patrones documentados pero fuera del primer soporte

- multiplicadores por `TARGET`
- costes o escalados por `COMBO`
- formulas que usan armor base o bonus de armor del warframe
- drains por enemigo o por estado de combate

## Regla

El schema de datos declara `baseValue`, `upgradeBy`, caps y flags. La interpretacion
exacta de la formula vive en el engine.

## Relacion con la referencia wiki

Cuando aparezcan mecanicas mas complejas:

1. se documentan en `reference/wiki/`
2. se baja su impacto al track `features/builder-engine/`
3. solo entonces se amplian las formulas soportadas

