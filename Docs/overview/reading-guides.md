# Reading Guides

> Estado: activo
> Rol: guiar a humanos y agentes segun el area que van a tocar
> Fuente de verdad de: orden de lectura por tarea
> No usar para: estado detallado de una feature
> Depende de: `current-state.md`
> Ultima actualizacion: 2026-03-22

## Si vas a tocar datos base o SSoT

Leer en este orden:
1. `../features/data-foundation/status.md`
2. `../domains/data/ssot.md`
3. `../domains/data/canonical-sources.md`
4. `../domains/data/build-pipeline.md`
5. `../domains/data/override-pattern.md`

## Si vas a tocar abilities o semantic pipeline

Leer en este orden:
1. `../features/semantic-pipeline/status.md`
2. `../features/semantic-pipeline/coverage.md`
3. `../features/semantic-pipeline/workflow.md`
4. `../features/semantic-pipeline/preflight-checklist.md`
5. `../domains/data/abilities/source-model.md`
6. `../domains/data/abilities/schema.md`
7. `../domains/data/abilities/pipeline.md`
8. `../features/semantic-pipeline/questions.md`
9. `../reference/audits/README.md`

## Si vas a tocar builder engine

Leer en este orden:
1. `../features/builder-engine/status.md`
2. `../features/builder-engine/s6-horizontal-minimum.md` si el trabajo es el corte S6 o rutas `/dev/*`
3. `../domains/engine/builder-v1.md`
4. `../features/builder-engine/dependencies.md`
5. `../features/builder-engine/questions.md`
6. `../reference/wiki/README.md` si la tarea requiere mecanicas del juego

## Si vas a tocar UI o navegacion

Leer en este orden:
1. `../features/navigation-shell/status.md`
2. `placeholder-minimums.md`
3. `../domains/ui/shell-and-navigation.md`
4. `../domains/integration/runtime-composition.md`
5. `../features/navigation-shell/dependencies.md`

## Si vas a tocar provider, hooks o hidratacion

Leer en este orden:
1. `../domains/integration/runtime-composition.md`
2. `../domains/data/abilities/pipeline.md`
3. `../domains/engine/builder-v1.md`
4. `../decisions/open-questions.md`

## Si no sabes donde empezar

Leer:
1. `current-state.md`
2. `goals-roadmap.md`
3. `stabilization-backlog.md`
4. `migration-status.md`
5. `docs-cutover-plan.md`
6. el `status.md` del track mas cercano a la tarea
