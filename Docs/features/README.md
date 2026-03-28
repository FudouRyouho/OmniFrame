# Features

> Estado: activo
> Rol: indice de tracks activos del proyecto
> Fuente de verdad de: ubicacion de status, preguntas y dependencias por track
> No usar para: conocimiento estable por dominio
> Ultima actualizacion: 2026-03-28

## Tracks activos

- `data-foundation/`
- `semantic-pipeline/`
- `builder-engine/`
- `navigation-shell/`

## Placeholders y areas incompletas

- `../overview/placeholder-minimums.md` — contrato S4 por track (builder, shell, vistas stub, HUD)

## Regla minima por track

Cada track debe tener, como minimo:
- `status.md`

El resto de documentos depende del tipo de track y de su estado real. Ejemplos validos:
- `dependencies.md` cuando el track necesita mapa de relaciones fuerte
- `questions.md` si hay dudas locales abiertas
- `debt.md` si el track concentra deuda tecnica local
- `workflow.md`, `coverage.md` o documentos equivalentes cuando el track tiene flujo operativo propio

No forzar una misma plantilla a todos los tracks si el contenido real ya quedo distribuido
de otra manera.
