# Stage 0 Architecture Decisions

> Estado: activo
> Rol: indice canonico de decisiones cerradas promovidas desde el antiguo registro `pre-v1`
> Fuente de verdad de: ubicacion canonica de las decisiones C1-C41 todavia relevantes para el repo activo
> No usar para: historial completo del debate, backlog local de track o detalle de implementacion puntual
> Depende de: `../domains/engine/architecture.md`, `../domains/data/mods/schema.md`, `../domains/data/conditions-baseline.md`, `../domains/data/warframes/archon-shards.md`
> Ultima actualizacion: 2026-03-28

## Proposito

Este documento reemplaza al antiguo registro `Docs/temp/pre-v1-architecture-2026-03-26.md`
como indice operativo de decisiones stage 0.

Si hace falta entender una decision cerrada, la lectura normal empieza aqui y sigue en el
documento canonico correspondiente.

El debate historico detallado deja de ser dependencia normal del arbol activo.

## Mapa de decisiones absorbidas

| IDs | Documento canonico | Que fijan |
|---|---|---|
| C1, C7, C8, C20-C22, C32-C40 | `../domains/engine/architecture.md` | modelo 3+1 capas, direccion bottom-up, `CalculationContext`, Observer, auditoria tripartita, boundaries B1-B4, `deliveryType`, politica de fire modes y whitelist fuera del Loadout |
| C41 | `../domains/integration/runtime-composition.md`, `open-questions.md` | frontera React con `LoadoutProvider` como integracion dominante |
| C2-C6, C12-C14, C24-C28 | `../domains/data/mods/schema.md` | placeholders, `stats[]`, `values[]`, `condition`, indexado por `uniqueName` y ranks completos |
| C9-C10 | `../features/data-foundation/pilot-criteria.md` | schemas en aislamiento y piloto selectivo antes de escalar migracion |
| C11, C23 | `../overview/documentation-policy.md` | no usar placeholders vacios como sustituto de decision y tratar `Docs/` como fuente de verdad primaria |
| C15-C18, C31 | `../domains/data/conditions-baseline.md` | baseline canonico de condiciones, familias, sources y vocabulario compartido |
| C19 | `../domains/data/warframes/slot-reference.md` | retiro de la interface pre-C1 y conservacion de la tabla empirica de slots |
| C29-C30 | `../domains/data/warframes/archon-shards.md` | `isTauforged` en slot/layout y modelado de casos complejos como condicionales normales |

## Preguntas promovidas fuera del temporal

Los pendientes que seguian vivos en el registro temporal ya quedaron reubicados en documentos
canonicos de trabajo:

- `DF-Q5` en `../features/data-foundation/questions.md` — schema para augmentos y efectos `UNIQUE`
- `DF-Q6` en `../features/data-foundation/questions.md` — edge cases de `deliveryType` y `shot_type`

## Estado de las preguntas transversales relacionadas

- `OQ-2` permanece cerrada con provider dominante en `open-questions.md`
- `OQ-3` deja de depender del temporal: el schema de mods ya es canonico y la decision del track queda cerrada en `open-questions.md`

## Estado del registro temporal original

`Docs/temp/pre-v1-architecture-2026-03-26.md` deja de ser lectura operativa normal.
Mientras siga existiendo en `temp/`, debe tratarse solo como respaldo de sesion o insumo
historico pendiente de reclasificacion final.