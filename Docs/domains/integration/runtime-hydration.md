# Runtime Hydration

> Estado: activo
> Rol: documentar la hidratacion runtime actual y su migracion futura a build time
> Fuente de verdad de: estado y direccion de la hidratacion en runtime
> No usar para: backlog visual o formulas del engine
> Depende de: `runtime-composition.md`
> Ultima actualizacion: 2026-03-21

## Estado actual

La hidratacion de abilities sigue ocurriendo en runtime porque `ability-stats.override.json`
sigue siendo editable sin pasar por todo el pipeline de build.

## Punto principal

`warframeData.ts` resuelve:
- fetch
- cache
- hidratacion de abilities

## Direccion futura

Cuando el pipeline absorba por completo el estado editable de abilities:
- la hidratacion debe migrar a build time
- el runtime debe consumir payload ya resuelto

## Relacion con semantic pipeline

Esta migracion depende de:
- estabilidad del schema de `ability-stats.override.json`
- flujo confiable del semantic pipeline
