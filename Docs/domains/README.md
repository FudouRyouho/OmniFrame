# Domains

> Estado: activo
> Rol: indice de conocimiento estable por responsabilidad
> Fuente de verdad de: separacion de responsabilidades del sistema
> No usar para: estado operativo de features
> Ultima actualizacion: 2026-03-28

## Dominios activos

- `data/`: fuentes, schemas, pipelines y SSoT
- `engine/`: contratos y comportamiento del motor de calculo
- `ui/`: shell, navegacion y reglas de presentacion
- `integration/`: providers, hooks, fetch/cache e hidratacion runtime

## Lecturas iniciales por dominio

- data: `data/system-flow.md`, `data/canonical-sources.md`, `data/build-pipeline.md`
  segun el area: `data/abilities/`, `data/mods/`, `data/weapons/`
- engine: `engine/architecture.md`, `engine/formula-overview.md`
- ui: `ui/shell-and-navigation.md`, `ui/presentation-layer.md`
- integration: `integration/runtime-composition.md`, `integration/type-system-boundaries.md`, `../decisions/open-questions.md`

## Regla

Si el contenido cambia porque una tarea esta en progreso, probablemente va en
`features/` y no en `domains/`.

## Regla de etiquetado de dominio

En `status.md`, `questions.md`, `debt.md` u otro documento local equivalente, y en `open-questions.md` cuando aplique,
cada pendiente o bloqueante
debe indicar su dominio propietario de forma explicita.

Formato recomendado:

- `[data]` para fuentes, schema, pipelines y overrides
- `[engine]` para contratos y calculo
- `[ui]` para shell, rutas y presentacion
- `[integration]` para providers, hooks, fetch/cache e hidratacion
- `[externo/<dominio>]` cuando el bloqueo pertenece a otro track

Ejemplos:

- `[integration] conectar search/order del contexto a filtros por kind`
- `[externo/engine] cerrar B4 del Resolver antes del wiring final de UI`
- `[data] definir fuente numerica de mods`
