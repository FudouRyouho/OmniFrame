# Migration Status

> Estado: activo
> Rol: registrar el reemplazo progresivo desde `Docs-legacy/` hacia `Docs/`
> Fuente de verdad de: trazabilidad de migracion documental
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-22

## Estados

- `sin iniciar`: no existe reemplazo real en `Docs/`
- `parcial`: existe reemplazo, pero aun no cubre todo el contenido legacy
- `listo para revision legacy`: existe reemplazo suficientemente claro para revisar el legacy
- `retirado de legacy`: el archivo legacy fue eliminado porque `Docs/` ya cubre su funcion
- `conservado como referencia canonica`: el archivo legacy sigue existiendo solo como material fuente o referencia canonica

## Ledger inicial

| Legacy | Reemplazo en `Docs/` | Estado |
|---|---|---|
| `Docs-legacy/analysis/ability-stats-gap.md` | `features/semantic-pipeline/status.md`, `features/semantic-pipeline/coverage.md`, `features/semantic-pipeline/workflow.md` | retirado de legacy |
| `Docs-legacy/analysis/ability-stats-audit.md` | `domains/data/abilities/source-model.md`, `domains/data/abilities/source-gaps.md`, `domains/data/abilities/schema.md`, `reference/audits/ability-stats-source-audit.md` | retirado de legacy |
| `Docs-legacy/temp/pre-semantic-pipeline-audit.md` | `features/semantic-pipeline/parser-behavior.md`, `features/semantic-pipeline/preflight-checklist.md`, `features/semantic-pipeline/questions.md`, `reference/audits/semantic-pipeline-pre-audit.md` | retirado de legacy |
| `Docs-legacy/architecture/builder-engine-architecture.md` | `domains/engine/builder-v1.md`, `domains/engine/layout-contract.md`, `domains/engine/context-contract.md`, `domains/engine/output-contract.md`, `domains/engine/formula-overview.md`, `domains/integration/engine-consumption.md`, `features/builder-engine/file-structure.md`, `features/builder-engine/mod-value-source.md`, `features/builder-engine/gaps.md`, `features/builder-engine/status.md` | retirado de legacy |
| `Docs-legacy/architecture/architecture.md` | `domains/README.md`, `domains/data/system-flow.md`, `domains/data/canonical-sources.md`, `domains/data/build-pipeline.md`, `domains/data/override-pattern.md`, `domains/data/mod-category-normalization.md`, `domains/data/abilities/*`, `domains/ui/shell-and-navigation.md`, `domains/ui/presentation-layer.md`, `domains/integration/runtime-composition.md`, `domains/integration/type-system-boundaries.md` | retirado de legacy |
| `Docs-legacy/architecture/architecture-audit.md` | `features/navigation-shell/status.md`, `features/navigation-shell/debt.md`, `domains/integration/runtime-hydration.md`, `reference/audits/runtime-layer-map.md`, `reference/audits/component-usage-audit.md`, `reference/audits/repo-structure-snapshot.md`, `features/builder-engine/gaps.md` | retirado de legacy |
| `Docs-legacy/architecture/data-audit.md` | `domains/data/ssot.md`, `domains/data/companion-compatibility.md`, `features/data-foundation/status.md` | retirado de legacy |
| `Docs-legacy/architecture/mods-analysis.md` | `domains/data/mods/source-model.md`, `domains/data/mods/override-strategy.md`, `features/builder-engine/mod-value-source.md`, `features/builder-engine/gaps.md` | retirado de legacy |
| `Docs-legacy/architecture/mod-stats-gap.md` | `domains/data/mods/override-strategy.md`, `features/builder-engine/mod-value-source.md`, `features/builder-engine/gaps.md` | retirado de legacy |
| `Docs-legacy/architecture/warframe-items-changes.md` | `domains/data/warframe-items-fork.md` | retirado de legacy |
| `Docs-legacy/analysis/wiki-modules-reference.md` | `reference/wiki/modules/README.md`, `reference/wiki/modules/downloaded-modules.md` | retirado de legacy |
| `Docs-legacy/wiki-modules/README.md` | `reference/wiki/modules/README.md`, `reference/wiki/modules/downloaded-modules.md`, `reference/wiki/modules/raw/*` | retirado de legacy |
| `Docs-legacy/analysis/ability-formulas.md` | `domains/data/abilities/formula-patterns.md`, `domains/data/abilities/engine-variables.md`, `domains/engine/formula-overview.md` | retirado de legacy |
| `Docs-legacy/canonical/ability-engine-variables.md` | `domains/data/abilities/engine-variables.md`, `domains/data/abilities/formula-patterns.md` | retirado de legacy |
| `Docs-legacy/analysis/ability-schema-examples.md` | `domains/data/abilities/schema.md`, `domains/data/abilities/group-model.md`, `domains/data/abilities/engine-variables.md`, `domains/data/abilities/formula-patterns.md` | retirado de legacy |
| `Docs-legacy/canonical/ability-stat-schema.md` | `domains/data/abilities/schema.md`, `domains/data/abilities/group-model.md`, `domains/data/abilities/engine-variables.md` | retirado de legacy |
| `Docs-legacy/canonical/semantic-md-format.md` | `features/semantic-pipeline/semantic-markdown-format.md`, `features/semantic-pipeline/workflow.md`, `features/semantic-pipeline/parser-behavior.md` | retirado de legacy |
| `Docs-legacy/analysis/weapon-data-analysis.md` | `domains/data/weapons/source-model.md`, `domains/data/weapons/attack-structure.md`, `domains/data/weapons/known-gaps.md` | retirado de legacy |
| `Docs-legacy/architecture/modifier-taxonomy.md` | `domains/data/mods/upgrade-taxonomy.md`, `domains/data/mods/override-strategy.md`, `domains/data/abilities/engine-variables.md` | retirado de legacy |
| `Docs-legacy/architecture/warframe-items-pipeline.md` | `domains/data/warframe-items-build.md` | retirado de legacy |
| `Docs-legacy/decisions/mods-builder-analysis.md` | `domains/data/mods/upgrade-taxonomy.md`, `domains/data/mods/source-model.md`, `domains/data/mods/override-strategy.md`, `features/builder-engine/mod-value-source.md`, `features/builder-engine/questions.md`, `features/builder-engine/gaps.md` | retirado de legacy |
| `Docs-legacy/decisions/builder-engine-questions.md` | `domains/engine/builder-v1.md`, `domains/engine/layout-contract.md`, `domains/engine/context-contract.md`, `domains/engine/output-contract.md`, `domains/engine/formula-overview.md`, `features/builder-engine/status.md`, `features/builder-engine/questions.md` | retirado de legacy |
| `Docs-legacy/decisions/open-questions.md` | `decisions/open-questions.md`, `features/builder-engine/questions.md`, `features/navigation-shell/debt.md`, `features/semantic-pipeline/questions.md` | retirado de legacy |

## Regla de vaciado de legacy

Un archivo legacy solo debe considerarse candidato a archivo historico o eliminacion
cuando:

1. exista reemplazo claro en `Docs/`
2. el reemplazo ya sea el punto de lectura recomendado
3. el contenido restante del legacy sea historico o redundante

## Proximo uso recomendado

Cada vez que una migracion cierre un documento legacy:
- actualizar esta tabla
- marcar si el archivo esta listo para revision manual
- no borrar el legacy sin validacion del usuario
