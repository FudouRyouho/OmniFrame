# Domains

> Estado: activo
> Rol: indice de conocimiento estable por responsabilidad
> Fuente de verdad de: separacion de responsabilidades del sistema
> No usar para: estado operativo de features
> Ultima actualizacion: 2026-03-21

## Dominios activos

- `data/`: fuentes, schemas, pipelines y SSoT
- `engine/`: contratos y comportamiento del motor de calculo
- `ui/`: shell, navegacion y reglas de presentacion
- `integration/`: providers, hooks, fetch/cache e hidratacion runtime

## Lecturas iniciales por dominio

- data: `data/system-flow.md`, `data/canonical-sources.md`, `data/build-pipeline.md`
  segun el area: `data/abilities/`, `data/mods/`, `data/weapons/`
- engine: `engine/builder-v1.md`
- ui: `ui/shell-and-navigation.md`, `ui/presentation-layer.md`
- integration: `integration/runtime-composition.md`, `integration/type-system-boundaries.md`

## Regla

Si el contenido cambia porque una tarea esta en progreso, probablemente va en
`features/` y no en `domains/`.
