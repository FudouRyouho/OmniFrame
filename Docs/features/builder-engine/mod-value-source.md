# Builder Mod Value Source

> Estado: activo
> Rol: documentar la fuente prevista de valores numericos de mods para el builder
> Fuente de verdad de: estrategia actual del track para valores de mods
> No usar para: formulas completas del engine o schema de abilities
> Depende de: `status.md`
> Ultima actualizacion: 2026-03-22

## Fuente primaria de semantica

`upgradeTypes[]` identifica que stat modifica cada mod.

## Fuente prevista de valores

Estado actual documentado:
- `levelStats` existe pero es texto
- el builder no deberia depender de parseo libre de strings en runtime
- la estrategia preferida sigue siendo un override controlado

## Rol esperado de `mod-stats.json`

El override debe aportar:
- `values[]` por rango
- soporte para progresiones no lineales
- `damageType` cuando haga falta
- metadata para casos `UNIQUE` o condicionales

## Caso Galvanized

Los Galvanized requieren doble efecto:
- efecto base
- efecto stackeable
- `maxStacks`

## Semantica de supporte

La taxonomia del efecto vive en:
- `../../domains/data/mods/source-model.md`
- `../../domains/data/mods/upgrade-taxonomy.md`
- `../../domains/data/mods/override-strategy.md`

## Duda aun abierta

Sigue abierta la decision final entre:
- override explicito
- parseo controlado de `levelStats`
- enfoque mixto

Ver:
- `questions.md`
- `gaps.md`
- `../../domains/data/mods/source-model.md`
- `../../domains/data/mods/override-strategy.md`
