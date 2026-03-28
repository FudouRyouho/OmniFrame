# Engine Formula Overview

> Estado: activo
> Rol: resumir los patrones de fórmula que el Engine v1 necesita soportar
> Fuente de verdad de: panorama de fórmulas del motor
> No usar para: catálogo exhaustivo de mecánicas avanzadas del juego
> Depende de: C1→C32/C33 (capas Loadout/Resolver/Engine)
> Última actualización: 2026-03-27 (recontextualizado: supuesto v1 declarado)

> **[GAP-6 — CERRADO 2026-03-27]** La fórmula dominante
> `stat_final = base * (1 + suma de mods del mismo upgradeType)` trata todos los mods
> como equivalentes. Los mods con condición deberían sumarse solo si la condición está
> activa. **El supuesto v1 está ahora declarado explícitamente en la sección siguiente.**

## Supuesto fundamental de v1

**v1 asume máximo rendimiento**: todas las condiciones aplicables están activas. Por lo tanto:
- Todos los mods actúan. Los mods con condición se asumen cumplida (ej: hit garantizado).
- No hay simulación de tiempo ni rotación de estados; se calcula como estático.
- Esto es una simplificación intencional para permitir cálculo puro sin estado runtime.

En futuras versiones, el Resolver agregará `ConditionState` para modelar variabilidad.

## Regla de lectura

Este documento cubre fórmulas de cálculo estático para v1, aplicables por el Engine tras recibir el `CalculationContext` del Resolver.

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

