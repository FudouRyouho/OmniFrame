# Green Checkpoint Plan

> Estado: activo
> Rol: ordenar el cierre necesario para habilitar un commit global limpio post-Paso 18
> Fuente de verdad de: criterio de "verde" y secuencia de trabajo para el cierre global
> No usar para: detalle interno de formulas, schema o implementacion puntual de un track
> Depende de: `current-state.md`, `stabilization-backlog.md`, `migration-status.md`
> Ultima actualizacion: 2026-03-28

## Objetivo

Dejar un camino canonico y auditable para llegar a un commit global del repositorio sin
mezclar:

- deuda tecnica no clasificada
- archivos temporales o de sesion
- documentacion activa con drift
- artefactos generados sin fuente o sin validacion

Este documento gobierna el cierre global posterior al checkpoint documental separado.

## Definicion operativa de "verde"

El repositorio solo se considera listo para commit global cuando se cumplen estas 5
condiciones a la vez:

1. `Project` compila en limpio (`npm run build`).
2. la suite relevante de tests pasa en limpio (`npx vitest run` en `Project`).
3. `Docs/` describe el estado real del repo activo y ya no depende de `temp/` para lectura operativa normal.
4. los cambios generados (`public/data`, overrides, reportes) tienen trazabilidad clara hacia sus scripts o fuentes.
5. el worktree no arrastra archivos scratch, capturas sueltas, borradores o nested repos sin clasificar.

## Estado de partida del cierre

Checkpoint al 2026-03-28:

- `npm run build` ya esta en verde.
- el vertical slice minimo post-Paso 18 ya existe en codigo (`Engine`, `Resolver` forward, `Loadout`, `LoadoutProvider`).
- la documentacion activa ya recibio una resincronizacion amplia y puede cerrarse en un commit separado.
- `npx vitest run --reporter=verbose` ya pasa en limpio (4 archivos, 93 tests).
- las decisiones C1-C41 ya quedaron indexadas en `../decisions/stage-0-architecture-decisions.md`; el temporal deja de ser lectura operativa normal.
- el worktree sigue mezclando cambios de codigo, datos generados, capturas y documentacion.

## Secuencia canonica de cierre

### 1. Checkpoint documental aislado

Objetivo:
- cerrar la resincronizacion de `Docs/` y reglas de gobernanza en un commit propio.

Regla:
- excluir `Docs/temp/` del commit documental.

Resultado esperado:
- el arbol activo queda trazable aunque el repo todavia no este listo para el commit global.

### 2. Promocion de decisiones desde `temp/` a canonico

Objetivo:
- absorber en `overview/`, `domains/`, `features/` y `decisions/` toda lectura operativa real heredada del antiguo registro pre-v1.

Incluye:
- decisiones C1-C41 que aun solo viven o se explican mejor en `temp/`
- criterios de cierre del stage 0
- contratos B1-B4 que ya sean estables en el arbol activo

No incluye:
- debate historico que deba quedar en `reference/historical/`
- walkthroughs, scratchpads o artefactos de validacion ad hoc

Resultado esperado:
- `temp/` deja de ser dependencia normal para interpretar el estado del proyecto.

Estado 2026-03-28:
- cierre documental completado a nivel operativo; lo pendiente posterior ya es historizacion final o eliminacion de residuos, no promocion de decisiones activas.

### 3. Cierre tecnico minimo del repo

Objetivo:
- recuperar un estado de ejecucion y verificacion coherente para el cierre global.

Pendientes minimos:
- confirmar que build y tests sigan alineados con el corte real que se quiere commitear
- confirmar que los nuevos cambios de engine/integration no rompan el slice minimo documentado
- verificar que datos generados y overrides formen parte del estado deseado y no de una corrida parcial

Resultado esperado:
- build + tests alineados con el estado que se quiere commitear.

### 4. Higiene del worktree

Objetivo:
- clasificar todo cambio que no sea claramente codigo/producto/documentacion canonica.

Checklist minimo:
- clasificar capturas en `references/`
- clasificar artefactos scratch o backups ad hoc
- revisar cambios en nested repos o dependencias vendorizadas (`warframe-items`)
- decidir que artefactos generados se versionan y cuales no

Resultado esperado:
- no quedan archivos ambiguos en el cierre final.

### 5. Barrido documental final

Objetivo:
- validar que el arbol canonico ya refleja el estado posterior al cierre tecnico.

Incluye:
- actualizar `status.md` de tracks afectados
- actualizar `current-state.md` si cambia el estado operativo
- registrar el lote final en `migration-status.md`
- tocar `open-questions.md` solo si alguna duda transversal cambia realmente de estado

Resultado esperado:
- la documentacion queda verde junto con el repo, no una iteracion atras.

### 6. Commit global

Objetivo:
- cerrar el lote post-Paso 18 con un worktree ya clasificado, testeado y documentado.

Precondicion:
- los pasos 1 a 5 ya estan cerrados.

## Criterio de exclusiones

No deben entrar al commit global por inercia:

- archivos de `Docs/temp/` no promovidos
- walkthroughs o notas de sesion
- capturas sin valor de referencia claro
- archivos generados si su fuente no forma parte del mismo corte o si solo reflejan una corrida intermedia

## Definicion de terminado

El plan se considera cumplido cuando:

- el antiguo registro pre-v1 ya no sea lectura necesaria para el estado operativo normal
- `Project` tenga build y tests en verde
- el worktree este clasificado sin residuos temporales
- exista un commit global posterior al checkpoint documental que represente un estado coherente del repo