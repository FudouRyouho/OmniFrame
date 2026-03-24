# OmniFrame - Docs

> Estado: activo
> Rol: puerta de entrada de la documentacion activa del proyecto
> Fuente de verdad de: taxonomia, orden de lectura y politica de migracion
> No usar para: detalles de schema o backlog operativo de una feature
> Ultima actualizacion: 2026-03-21

`Docs/` es el arbol activo de documentacion del proyecto.

Durante la migracion:
- `Docs/` es la ruta principal para documentacion nueva o reescrita
- `Docs-legacy/` queda como legado y referencia de apoyo hasta revision manual
- no mover ni borrar archivos de `Docs-legacy/` sin que exista reemplazo claro en `Docs/`

## Estructura

```text
Docs/
  README.md
  overview/
  domains/
  features/
  decisions/
  reference/
```

## Como leer esta documentacion

1. `overview/current-state.md`
2. `overview/goals-roadmap.md`
3. `overview/stabilization-backlog.md`
4. `overview/reading-guides.md`
5. `overview/migration-status.md`
6. `features/<track>/status.md`
7. `domains/<area>/...`
8. `decisions/open-questions.md`
9. `reference/...` solo si hace falta evidencia o contexto historico

## Que va en cada carpeta

| Carpeta | Pregunta que responde |
|---|---|
| `overview/` | Que estado tiene hoy el proyecto y hacia donde va |
| `domains/` | Como se divide el sistema por responsabilidad |
| `features/` | Que track esta activo, que falta y que lo bloquea |
| `decisions/` | Que decisiones cross-cutting siguen abiertas o ya fueron fijadas |
| `reference/` | Que evidencia, auditorias o mecanicas del juego sirven como apoyo |

## Tracks Activos

| Track | Estado | Documento principal |
|---|---|---|
| Data Foundation | activo | `features/data-foundation/status.md` |
| Semantic Pipeline | activo | `features/semantic-pipeline/status.md` |
| Builder Engine | activo | `features/builder-engine/status.md` |
| Navigation Shell | activo | `features/navigation-shell/status.md` |

## Referencias de juego

La referencia de mecanicas de la wiki vive en `reference/wiki/`.

Ese espacio existe para documentar mecanicas del juego que el engine necesita
modelar con precision matematica, por ejemplo:
- status effects
- damage types
- condition overload
- armor scaling
- crit/status formulas

Ver `reference/wiki/README.md`.

## Politica minima de migracion

- toda documentacion nueva va a `Docs/`
- un archivo de `Docs-legacy/` solo pasa a historico o eliminacion cuando su reemplazo en `Docs/` existe
- si un documento mezcla varias preguntas, se divide antes de migrarlo
- cada cambio de arquitectura, schema o workflow debe actualizar `Docs/`

Ver:
- `overview/documentation-policy.md`
- `overview/stabilization-backlog.md`
- `overview/reading-guides.md`
- `overview/migration-status.md`
- `overview/docs-cutover-plan.md`
