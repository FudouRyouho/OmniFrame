# Builder Engine Questions

> Estado: activo
> Rol: registrar preguntas abiertas locales del track builder engine
> Fuente de verdad de: dudas pendientes del motor
> Ultima actualizacion: 2026-03-22

## Base ya decidida

Estas preguntas ya no reabren los fundamentos del motor. La base actual vive en:

- `../../domains/engine/builder-v1.md`
- `../../domains/engine/layout-contract.md`
- `../../domains/engine/context-contract.md`
- `../../domains/engine/output-contract.md`
- `../../domains/engine/formula-overview.md`
- `../../domains/data/mods/upgrade-taxonomy.md`
- `../../domains/data/weapons/source-model.md`
- `../../domains/data/abilities/schema.md`

## BE-Q1 - Valores numericos de mods

Pregunta:
- el builder debe depender de un override explicito tipo `mod-stats.json`, de parseo
  controlado de `levelStats`, o de una combinacion de ambos

## BE-Q2 - Condiciones y stacks

Pregunta:
- que parte de las condiciones activas vive en `CalculationContext` y que parte se fija
  como supuesto por defecto del motor

## BE-Q3 - Granularidad del output

Pregunta:
- `EngineOutput` debe exponer solo resultados finales, o tambien pools intermedios,
  condiciones, breakdowns y metadatos para UI

## BE-Q4 - Mecanicas avanzadas

Pregunta:
- cuando entra cada mecanica del juego a la referencia wiki y luego al engine:
  status effects, armor scaling, Condition Overload, dots, conversion de dano, etc.

## BE-Q5 - Augmentos y efectos `UNIQUE`

Pregunta:
- cuando conviene modelar augmentos de habilidad o efectos sin `upgradeTypes[]`
  como parte real del engine, y cuando quedan como metadata o referencia
