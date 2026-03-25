# Stabilization Backlog

> Estado: activo
> Rol: concentrar la direccion de trabajo y las tareas pendientes para reducir caos conceptual
> Fuente de verdad de: backlog de estabilizacion y criterios de prioridad del proyecto
> No usar para: detalle de implementacion de una feature especifica
> Depende de: `current-state.md`, `goals-roadmap.md`, `../reference/audits/project-state-reality-check-2026-03-22.md`
> Ultima actualizacion: 2026-03-22

## Estado de la iteracion actual

Resultado al cierre de esta iteracion:

- `S1` quedo cerrado a nivel de estructura fisica y semantica
- `S2` quedo cerrado como saneamiento minimo de build
- `S3` quedo cerrado a nivel de flujo documentado y merge mecanico reproducible
- `S4` quedo cerrado — contratos de placeholder por track en `placeholder-minimums.md`
- `S5` quedo cerrado — `status.md` operativos y `current-state.md` alineados con el repo
- `S6` en curso — vision del minimo horizontal fijada en `../features/builder-engine/s6-horizontal-minimum.md`

Cambios ya aplicados:

- se definio la taxonomia `generated / override / backup / deprecated / runtime`
- se documento el contrato de `generate-data` como capa de normalizacion, no de
  conocimiento manual
- se implemento virtualización configurable (`ItemsGrid` + `VirtualizedItemsGrid`) y threshold por vista
- se agrego cache de datasource en IndexedDB (`lib/db.ts`) con fallback JSON
- se reorganizo `Project/data/` en:
  - `overrides/`
  - `backups/`
  - `audits/`
- se renombro el runtime de abilities a:
  - `Project/public/data/ability-stats.override.json`
- se renombro la copia editable/transicional a:
  - `Project/data/overrides/ability-stats.override.json`
- se movio el backup historico a:
  - `Project/data/backups/ability-stats.backup.json`
- se movio el artefacto de auditoria a:
  - `Project/data/audits/upgradeby-audit.json`
- se implemento virtualización configurable de grids de equipment (`ItemsGrid` + `VirtualizedItemsGrid`)
- se implemento cache persistente en IndexedDB usando `lib/db.ts` y `fetchWithCache`

Documentos clave de este cierre:

- `../domains/data/data-layer-roles.md`
- `../domains/data/build-pipeline.md`
- `../domains/data/override-pattern.md`
- `../domains/data/abilities/pipeline.md`
- `../domains/integration/type-system-boundaries.md`

Cambios ya aplicados en `S2`:

- se corrigio el narrowing minimo de `BaseItem` para `Weapon`, `Warframe` y `Mod`
- se adapto `WarframeDetail.tsx` al schema actual de abilities basado en `groups`
- se corrigio `MenuBar.tsx` para eliminar ruido de build no funcional
- se ajusto `vite.config.ts` para tipar `test` correctamente con `vitest/config`
- `npm run build` vuelve a pasar

## Criterio para continuar

La siguiente iteracion no debe volver a discutir naming ni roles de datos salvo que
aparezca una contradiccion real.

La base conceptual de `S1` ya debe considerarse estable para seguir con `S2`.

## Objetivo de la fase actual

La prioridad del proyecto no es abrir mas frentes.

La prioridad actual es reducir caos, cerrar migraciones a medio hacer y dejar un
sistema de trabajo sostenible para:

- una sola persona
- asistencia IA guiada por documentacion
- cambios pequenos pero trazables

La pregunta rectora de esta fase es:

```text
que orden reduce caos y hace el proyecto sostenible para una sola persona
```

## Reglas de prioridad

### Regla 1

No priorizar una feature por importancia teorica si su contexto inmediato sigue
desordenado.

Ejemplo:
- el builder engine es central
- pero no debe empujarse primero si tipos, pipeline y fuentes todavia no estan
  suficientemente claros

### Regla 2

Los placeholders son validos si dejan claro:

- que problema cubren
- que datos necesitan
- que consumer futuro tendran
- que falta para que se vuelvan implementacion real

### Regla 3

La documentacion debe funcionar como sistema de control, no como archivo de notas.

Cada tarea pendiente debe poder responder:

- que es esto
- por que sigue pendiente
- que bloquea
- de que depende
- donde vive su contexto

### Regla 4

Antes de abrir trabajo profundo de engine o UI final, hay que cerrar las piezas
transicionales que hoy rompen coherencia:

- drift de tipos
- scripts viejos vs schema nuevo
- fuentes y overrides mal nombrados o mal separados

## Direccion activa por area

## 1. Semantic Pipeline

Estado interpretado para esta fase:

- cobertura editorial muy avanzada
- material semantico en condiciones de migrar a un JSON vivo
- el problema principal ya no es cobertura, sino cierre del flujo

Foco actual:

- mantener la ruta documentada desde semantic markdown hacia `ability-stats` vivo
- retirar supuestos viejos de scripts auxiliares cuando aparezcan
- avanzar cobertura y calidad editorial de los `.md` (el flujo base de merge ya esta cerrado en S3)

## 2. Data Foundation

Estado interpretado para esta fase:

- es el area con mas potencial de confusion operativa en datasets que aun no migraron
- para `ability-stats` el rol por capa ya esta fijado en documentacion (S1); otros
  artefactos pueden seguir en transicion

Foco actual:

- aplicar el mismo criterio de roles cuando se toquen mods u otros JSON editables
- reducir carga mental al editar datos
- formalizar un patron reutilizable para otros overrides donde falte

## 3. Builder Engine

Estado interpretado para esta fase:

- documentado, no implementado
- todavia no debe empujarse como feature aislada

Foco actual:

- mantener el contrato documental
- placeholders del engine descritos en `placeholder-minimums.md`
- preparar consumidor intermedio simple antes de motor real (S6)

## 4. Navigation Shell

Estado interpretado para esta fase:

- HUD y shell actuales son conceptuales
- UI final aun no esta definida
- `EquipmentView` es la referencia mas cercana a una UI real

Foco actual:

- rutas y wiring de vistas stub sobre la base de `placeholder-minimums.md`
- no confundir prueba visual con diseño cerrado

## Tareas pendientes de estabilizacion

## S1. Claridad de fuentes y overrides

Objetivo:
- dejar un patron claro para distinguir generado, override, backup y runtime

Estado:
- cerrado en esta iteracion a nivel documental y estructural

Resultado obtenido:
- se fijo el rol de `generate-data`
- se separaron roles logicos de datos
- se aplico la convencion fisica inicial al caso de `ability-stats`
- se dejo `Project/data/` orientado a override, backup y auditoria
- se dejo `Project/public/data/` como runtime consumido por la app

Lo que queda fuera de `S1`:
- ajustes internos de scripts al schema nuevo
- cierre del drift de tipos
- eliminacion o depresion final de artefactos auxiliares no usados

Tareas:
- definir convencion de nombres para datos editables y derivados
- proponer patron minimo:
  - `*-generated.json`
  - `*-override.json`
  - `*-backup.json`
- documentar que `Project/data/` representa pipeline o respaldo
- documentar que `Project/public/data/` representa runtime publicado
- decidir como se expresa "editable runtime" sin mezclarlo con fuente generada
- aplicar el patron primero al caso de `ability-stats`

Resultado esperado:
- cualquier agente o humano puede ver un archivo y entender por que existe

## S2. Cierre del drift de tipos

Objetivo:
- recuperar coherencia compilable despues de la migracion de `ability-stats`

Estado:
- cerrado como saneamiento minimo

Contexto ya confirmado:
- el fallo principal no venia del renombre de datos sino del drift previo entre
  tipos nuevos, consumidores viejos y configuracion
- ya existe una pre-documentacion del objetivo futuro del tipado en:
  - `../domains/integration/type-system-boundaries.md`

Resultado obtenido:

- `WarframeDetail.tsx` ya consume el schema actual basado en `groups`
- los guards de `BaseItem` ya estrechan a tipos concretos utiles para la UI
- `item-details-*` y hooks relacionados volvieron a compilar sin parches de shape
- `vite.config.ts` ya acepta `test` como parte del config tipado
- `npm run build` vuelve a estar en verde

Lo que queda fuera de `S2`:

- taxonomia profunda de tipado canonico / inferido / conceptual
- refactorizacion amplia del sistema de tipos
- saneamiento completo de scripts viejos del pipeline
- completado de placeholders o features

Resultado esperado:
- cumplido

## S3. Unificar pipeline real de abilities

Objetivo:
- dejar una sola lectura razonable del flujo de `ability-stats`

Estado:
- cerrado — flujo canonico en `domains/data/abilities/pipeline.md` y workflow actualizado

Avance obtenido:

- scripts clasificados:
  - `generate-data.mjs`: vigente — pipeline principal de generacion de datos
  - `migrate-ability-stats.mjs`: deprecado y movido a `scripts/backups/`
  - `extract-ability-stats.mjs`: deprecado y movido a `scripts/backups/`
  - `verify-ability-stats.mjs`: actualizado al schema `groups[]` — 299/299 entradas correctas
- `verify-ability-stats.mjs` puede correr como sanidad rapida del override
- `merge-semantic-groups.mjs`: aplica solo `groups` desde `references/Semantic/parsed-output.json`
  hacia `Project/data/overrides/ability-stats.override.json`; expuesto como `npm run merge:semantic-groups`
- decision explicita: merge mecanico por script; criterio de `upgradeBy` y revision editorial manual-asistido;
  publicacion formal con `npm run generate:data`

Resultado esperado:
- cumplido — el track ya no depende de una unica interpretacion oral del pipeline


## S4. Definir placeholders minimos por track

Objetivo:
- que cada area incompleta tenga un placeholder util y no solo vacio

Estado:
- cerrado — ver `placeholder-minimums.md`

Tareas:
- `builder-engine`: explicitar entrada minima, salida minima y consumer esperado
- `navigation-shell`: explicitar que necesita cada vista placeholder
- `arcanes`, `options`, `profile`, `arsenal`: dejar documentado que falta para que
  dejen de ser placeholders
- `hud`: aclarar que es conceptual y no diseño final

Resultado obtenido:
- tabla por vista stub y seccion HUD en `placeholder-minimums.md`
- builder: entrada/salida/consumer enlazados a `builder-v1.md` y status del track
- `navigation-shell/debt.md` alineado con rutas reales de Mods

Resultado esperado:
- cumplido — lectura unica sin adivinar por que algo aun no existe

## S5. Reajustar los status.md al estado real

Objetivo:
- evitar que `Docs/` quede bien estructurado pero desactualizado

Estado:
- cerrado — ver `semantic-pipeline/status.md`, `navigation-shell/status.md`,
  `data-foundation/status.md`, `builder-engine/status.md`, `current-state.md`

Tareas:
- corregir el estado de cobertura de `semantic-pipeline`
- reflejar que el shell ya existe, aunque siga incompleto
- reflejar que el build volvio a estado sano tras `S2 minimo`
- reflejar que `abilityCalc.ts` existe como pieza acotada de calculo, aunque no sea
  aun el engine

Resultado obtenido:
- semantic pipeline: cobertura desligada de cifras heredadas no auditadas; enlace claro a
  `coverage.md` y a `verify-ability-stats.mjs` como rol distinto
- navigation shell: mods enrutada, stubs y enrutamiento pendiente explicitos, build verde
- data foundation: DF-G5 actualizado tras roles documentados en S1
- builder engine: seccion explicita para `abilityCalc.ts` vs motor completo
- `current-state.md`: resumen coherente con lo anterior

Resultado esperado:
- cumplido — la documentacion operativa vuelve a ser confiable para lectura diaria

## S6. Preparar consumer intermedio del engine

Objetivo:
- no construir el engine totalmente en vacio
- establecer fundamento claro (sin arquitectura final) para logica < consumidor > UI

Tareas:
- trabajar inicialmente bajo `/dev/*` sin acoplar el shell de producto como consumidor principal
- engine minimo: calculos sencillos warframe/arma; instancias/clases permitidas para contexto reusable
- capa intermedia (provider/hooks evolutivos): orquesta engine hacia UI; flujo de estado
  bidireccional sin que la UI invoque formulas ni el motor directamente
- UI minima en texto; catalogo filtrado (no todo el JSON) para validar cuentas contra mecanica v1
- dejar documentado que layout completo, rutas de build y vistas de stats de producto quedan fuera de este corte

Documento de vision:
- `../features/builder-engine/s6-horizontal-minimum.md`

Resultado esperado:
- cuando el motor crezca, ya existe una ruta dev y un contrato de capas para inspeccionarlo
- cierre de S6 cuando esa ruta dev y el minimo codigo/documentado esten alineados con este documento

## Lo que no es prioridad inmediata

- dise�o final del HUD
- simulacion temporal
- DoT
- loops de enemy-state
- cierre de formulas avanzadas del builder
- schema profundo final de Incarnon

Nada de eso desaparece, pero no debe competir con la fase de estabilizacion.

## Regla de trabajo para asistencia IA

Cuando un agente vaya a trabajar en este proyecto durante esta fase, debe actuar
con esta prioridad:

1. reducir caos
2. cerrar drift o ambiguedad
3. dejar trazabilidad documental
4. solo despues abrir implementacion nueva

Si una tarea nueva no reduce caos ni avanza una dependencia inmediata, debe quedar
documentada primero antes de implementarse.

## Relacion con otros documentos

- `current-state.md` dice donde esta el proyecto hoy
- `goals-roadmap.md` dice hacia donde va
- este backlog dice que debe estabilizarse antes de empujar trabajo profundo
- `project-state-reality-check-2026-03-22.md` documenta la evidencia de esta fase
