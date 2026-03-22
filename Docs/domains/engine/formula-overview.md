# Builder Formula Overview

> Estado: activo
> Rol: resumir los patrones de fórmula que el builder engine v1 necesita soportar
> Fuente de verdad de: panorama de fórmulas del motor
> No usar para: catálogo exhaustivo de mecánicas avanzadas del juego
> Depende de: `builder-v1.md`
> Última actualización: 2026-03-21

## Regla de lectura

Este documento cubre fórmulas de cálculo estático para v1.

No cubre:

- dots
- simulación por tiempo
- resistencias por facción
- rotacion real de estados sobre el enemigo
- condicionales complejas dependientes de kills, aim o ticks

## Mods de arma

Fórmula dominante:

```text
stat_final = base * (1 + suma de mods del mismo upgradeType)
```

Excepciones conocidas:
- segundos
- metros
- combo inicial

## Mods de warframe

Misma fórmula general, distinto pool:
- health
- shield
- armor
- energy

Variables de habilidad derivadas:
- STR
- DUR
- RNG
- EFF con clamp

## Habilidades

Patrones principales:
- lineal
- cap máximo
- cap mínimo
- clamp entre mínimo y máximo
- inverse modifier
- valor fijo
- `ENERGY_COST`
- `ENERGY_DRAIN`

Base documental:
- `../data/abilities/engine-variables.md`
- `../data/abilities/formula-patterns.md`

## Casos fuera de v1 inicial

- TARGET
- COMBO
- Hildryn shields
- Equinox por enemigo
- mecanicas avanzadas documentadas luego en `reference/wiki/`
- dots y ticks
- ramp temporal de Heat
- corrosive, viral o magnetic como simulación real sobre enemigo
