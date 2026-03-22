# Estado Actual

> Estado: activo
> Rol: snapshot ejecutivo del proyecto y de los tracks principales
> Fuente de verdad de: estado operativo general
> No usar para: detalle de schema, formulas o decisiones historicas
> Depende de: `../features/`
> Ultima actualizacion: 2026-03-21

## Resumen

OmniFrame esta en una fase temprana de consolidacion.
La base de datos y la estructura general existen, pero el proyecto todavia no tiene
un motor de builder implementado ni una taxonomia documental lo bastante clara.

El objetivo inmediato de `Docs/` es separar:
- conocimiento estable
- trabajo activo
- decisiones cross-cutting
- referencias de mecanicas del juego

## Lo que ya funciona

- pipeline de datos principal via `generate-data.mjs`
- `weapons.json`, `warframes.json`, `mods.json`
- `ability-stats.json` como override activo en runtime
- vista de equipment y shell basico de UI
- parser semantico inicial `utilities/parse-semantic.mjs`
- split de tipos en `Project/src/lib/types/`

## Lo que esta en progreso

### 1. Semantic Pipeline

- hay parser funcional
- la cobertura de los `.md` semanticos sigue siendo parcial
- el merge hacia `ability-stats.json` aun no es reproducible de punta a punta
- `upgradeBy` sigue requiriendo asignacion manual

Documento principal:
- `../features/semantic-pipeline/status.md`

### 2. Data Foundation

- las fuentes de verdad ya estan bastante claras
- siguen abiertos gaps de rank bonuses, scaling y valores numericos de mods
- `compatName` ya esta preservado, pero su explotacion aun no esta cerrada

Documento principal:
- `../features/data-foundation/status.md`

### 3. Builder Engine

- existe arquitectura documental base
- no existe implementacion real del motor
- los datos de mods siguen necesitando una fuente numerica clara para el builder

Documento principal:
- `../features/builder-engine/status.md`

### 4. Navigation Shell

- hay shell y menu basico
- falta contexto de layout activo
- faltan rutas y wiring definitivo entre UI y builder

Documento principal:
- `../features/navigation-shell/status.md`

## Bloqueos estructurales actuales

- `ability-stats.json` y el pipeline semantico aun no tienen flujo estable de migracion
- el builder engine no tiene contrato implementado ni provider asociado
- la documentacion vieja mezcla estado, arquitectura, auditoria y backlog

## Siguiente lectura recomendada

1. `goals-roadmap.md`
2. `reading-guides.md`
3. `migration-status.md`
4. `docs-cutover-plan.md`
5. `../features/semantic-pipeline/status.md`
6. `../features/builder-engine/status.md`
