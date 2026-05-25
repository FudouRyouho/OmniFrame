---
Estado: "referencia"
Rol: "Registro consolidado de la sesión de auditoría: reducción de sobre-contexto + reorganización estructural + limpieza"
Version: "v0.2.0"
Impacto_ID: "AUDIT-CTX-001"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-05-25"
Fecha_de_actualizacion: "2026-05-25"
---

# Auditoría — Sesión completa de reorganización documental (2026-05-25)

## Resumen ejecutivo

Tres fases consecutivas en una misma sesión:

1. **R1 — Reducción de sobre-contexto** (32 demociones operativo→referencia, 8 purgas, 2 extracciones)
2. **R2 — Reorganización estructural** (45 movimientos, separación SSoT transversal vs dominios funcionales)
3. **R3 — Limpieza post-reorganización** (6 bloques: archon-shards, pipeline, abilities, slot-reference, audits engine, polarity drift)

El régimen documental ahora **refleja la arquitectura real**: `data/` y `semantic/` son SSoT consumidos por dominios funcionales (`engine`, `ui-ux`, `integration`), no peers. El convenio "≤3 operativos por dominio funcional" se cumple en todos los subdominios; SSoT transversal sigue su propia regla (status global + schemas por tipo).

## Métricas before/after

| Métrica | Inicial | Final | Δ |
|---|---|---|---|
| Subdominios violantes (>3 operativos) | 3 | **0** | ✅ |
| Operativos totales | ~40 | **20** | −50% |
| Referencias totales | ~8 | **39** | +388% |
| Archivos sin frontmatter | 13 | **0** | ✅ |
| `data/status.md` (entry point principal) | 190L | **128L** | −33% |
| Peor caso lectura inicial (status + open-questions) | 297L | **236L** | −21% |
| Archivos .md activos (excluyendo audit/README/CLAUDE) | ~70 | **63** | −7 |
| Líneas totales en docs/ | ~5500 | **5034** | ~−9% |

## Fases

### R1 — Reducción de sobre-contexto

Convención `Estado: activo/operativo/referencia` aplicada sistemáticamente. Resultado: 32 archivos demovidos de "activo" a "referencia" porque su rol era consulta bajo demanda, no entry point.

**Purgas (5):** docs autodeclarados obsoletos, sin referencias entrantes vivas o con fidelidad física rota.

**Extracciones (2):** `data/status.md` particionado — secciones detalladas movidas a `archon-shards/upgrade-mapping.md` y `abilities/annotation-status.md`.

### R2 — Reorganización estructural

Reconocimiento de que `data/` y `semantic/` **no son dominios funcionales** sino **fundación SSoT transversal** consumida por todos los dominios funcionales. La estructura antes mezclaba ambos.

**Movimientos (45):**
- `docs/domains/data/*` → `docs/data/*` (con subcategorización interna en `rules/`, `schemas/`, `pipeline/`, `references/`)
- `docs/domains/semantic/*` → `docs/semantic/*`
- `docs/design/simulation/*` → `docs/domains/engine/design/*` (porque el diseño del motor es parte del dominio engine, no peer)
- `docs/domains/data/slot-reference.md` → `docs/domains/ui-ux/slot-reference.md` (cross-dominio)

**Régimen actualizado:** `docs/CLAUDE.md` reescrito para distinguir el convenio "≤3 operativos" (dominios funcionales) del convenio "status global + schemas por tipo" (SSoT transversal).

### R3 — Limpieza post-reorganización

**6 bloques de limpieza** aplicados:

1. **Archon Shards** — triple solapamiento resuelto: `warframes/archon-shards.md` (199L, mal ubicado) fusionado en `archon-shards/concept.md` (140L) preservando contenido único (tabla wiki, categorización engine). Subdir `data/schemas/warframes/` eliminado.

2. **Pipeline** — 4 docs sobre flujo general fusionados en `architecture.md` (89L) tras verificar contra código que la "Arquitectura Propuesta" (omni_tags, ItemRegistry, useOmniFilter) nunca se implementó. Modelo de 4 Pilares (vigente) preservado.

3. **Abilities huérfanos** — 3 docs purgados (`abilities-engine-variables`, `group-model`, `pilot-criteria`); casos canónicos absorbidos en `schema.md`; pilot-criteria generalizado como template reusable (`data/rules/schema-pilot-criteria.md`) para schemas futuros (passives, arcanes).

4. **slot-reference** — mantenido huérfano explícito + **OQ-DATA-1** registrada para no pre-cerrar decisión arquitectónica abierta sobre modelado de slots.

5. **Auditorías engine** — extracción de decisiones críticas a `arch-decisions.md` (118L), purga de `simulation-pre-implementation.md` (242L de contexto abril obsoleto), fixes de drift (`EnsembleAdapter` → `MutatorBridge` en engine-audit; "DNA mutation parcial" → "no implementada" en integration-status). 3 features futuras preservadas como **OQ-ENGINE-FUTURE**.

6. **Polarity drift** — **OQ-DATA-2** registrada sobre el patrón sistémico: vocabularios que son simultáneamente semantic + data + pipeline normalization (`polarity`, `damage-types`, `factions`). Aclara que su huérfanía documental refleja decisión arquitectónica abierta.

## Trabajo aplicado por categoría

### Purgas (~15 docs + 1 script + 1 subdir)

```
# R1 (5)
docs/decisions/implementaciones-temporales.md
docs/overview/iteration-closure-2026-04-13.md
docs/domains/data/pipeline/semantic-format.md
docs/domains/data/pipeline/taxonomic-stabilization-audit.md
docs/domains/data/pipeline/parser-behavior.md

# R1 - governance (2)
docs/governance/architecture-decisions-index.md
docs/governance/migration-status.md

# R3 - limpieza
docs/data/schemas/warframes/archon-shards.md  (+ subdir warframes/ eliminado)
docs/data/pipeline/data-flow-architecture.md
docs/data/pipeline/system-flow.md
docs/data/pipeline/build-pipeline.md
docs/data/schemas/abilities/abilities-engine-variables.md
docs/data/schemas/abilities/group-model.md
docs/data/schemas/abilities/pilot-criteria.md
docs/domains/engine/design/simulation-pre-implementation.md

# Script huérfano
utilities/parse-semantic.mjs
```

### Demociones operativo → referencia (32)

Grupos B + C de R1 (engine-audit, transition-residues, simulation-pre-implementation antes de purga, source-gaps, weapons-known-gaps, integration-status, los 9 archivos top-level de `data/`, los 4 de `ui-ux/`, los 8 de `governance/`).

### Inyecciones de frontmatter (6)

`oq-iterative-closure-template.md`, `mods-schema.md` (operativo), `companion-compatibility.md`, `mods-triage.md`, `system-flow.md` (purgado luego), `warframe-items-source.md`.

### Archivos creados (10)

```
docs/data/README.md
docs/semantic/README.md
docs/data/schemas/archon-shards/upgrade-mapping.md     (R1, extracción)
docs/data/schemas/abilities/annotation-status.md       (R1, extracción)
docs/data/schemas/archon-shards/concept.md             (R3, fusión Archon)
docs/data/pipeline/architecture.md                     (R3, fusión Pipeline)
docs/data/rules/schema-pilot-criteria.md               (R3, generalización)
docs/domains/engine/design/arch-decisions.md           (R3, extracción)
docs/overview/audit-context-reduction-2026-05-25.md    (este doc)
docs/audit/{contexto-inventario, ruido-mapeo, auditoria-limpieza-2026-05-25}.md (temporales)
```

### Movimientos cross-dominio (R2)

| Origen | Destino |
|---|---|
| `domains/data/` (35 archivos) | `data/` con subcategorías nuevas (`rules/`, `schemas/`, `pipeline/`, `references/`) |
| `domains/semantic/` (3 archivos) | `semantic/` |
| `design/simulation/` (6 archivos) | `domains/engine/design/` |
| `domains/data/slot-reference.md` | `domains/ui-ux/slot-reference.md` |

### Fixes de drift / contradicciones

- `engine-audit.md` §3: `EnsembleAdapter` → `MutatorBridge.ensembleFromIntention()` (2 ocurrencias)
- `integration-status.md` §1: "DNA mutation parcialmente implementada" → "**NO implementada**" + link a engine-audit autoritativa
- `dependencies.md`, `canonical-sources.md`, `overrides.md`, `ssot.md`: paths relativos rotos por movimientos R2 corregidos

### Documentos meta reescritos (R2.4)

- `docs/CLAUDE.md` — régimen actualizado: estructura SSoT vs dominios funcionales, jerarquía de lectura matizada
- `docs/README.md` — mapa global v0.2.0 con nueva estructura
- `docs/domains/README.md` — solo dominios funcionales, con nota sobre data/ y semantic/ en root

### Régimen actualizado

`docs/CLAUDE.md` ahora exime explícitamente a `CLAUDE.md` y `README.md` del frontmatter obligatorio (rol implícito como meta-agente / índice).

## OQ nuevas registradas (3)

| ID | Tema | Razón |
|---|---|---|
| **OQ-DATA-1** | Materialización de slots por entidad | No pre-cerrar decisión sobre JSON/constantes/derivado/híbrido. `slot-reference.md` queda huérfano explícito. |
| **OQ-ENGINE-FUTURE** | Features futuras del motor (Web Worker, Rewind/Time Travel, Gold Standard testing) | Preservar features consideradas en abril 2026 que no entraron al motor inicial. |
| **OQ-DATA-2** | Ubicación de vocabularios simultáneamente semantic + data | Patrón sistémico aplicable a polarity, damage-types, factions. La huérfanía documental refleja decisión arquitectónica abierta. |

## Estado final por subdominio

| Subdominio | Total | Op | Ref | Other | Líneas | Cumple convenio |
|---|---|---|---|---|---|---|
| `data/` (top) | 2 | 1 | 1 | 0 | 264 | N/A (SSoT) |
| `data/pipeline/` | 4 | 2 | 2 | 0 | 217 | N/A (SSoT) |
| `data/references/` | 2 | 0 | 2 | 0 | 85 | N/A (SSoT) |
| `data/rules/` | 7 | 0 | 7 | 0 | 326 | N/A (SSoT) |
| `data/schemas/abilities/` | 6 | 2 | 4 | 0 | 305 | N/A (SSoT) |
| `data/schemas/archon-shards/` | 3 | 1 | 2 | 0 | 289 | N/A (SSoT) |
| `data/schemas/mods/` | 3 | 3 | 0 | 0 | 290 | N/A (SSoT) |
| `data/schemas/weapons/` | 3 | 1 | 2 | 0 | 114 | N/A (SSoT) |
| `decisions/` | 2 | 1 | 1 | 0 | 125 | ✅ |
| `domains/engine/` | 5 | 3 | 2 | 0 | 659 | ✅ |
| `domains/engine/design/` | 6 | 1 | 2 | 3 | 730 | ✅ |
| `domains/ui-ux/` | 6 | 1 | 5 | 0 | 264 | ✅ |
| `governance/` | 9 | 1 | 8 | 0 | 841 | ✅ |
| `overview/` | 2 | 1 | 1 | 0 | 411 | ✅ |
| `semantic/` | 3 | 2 | 0 | 1 | 114 | N/A (SSoT) |
| **TOTAL** | **63** | **20** | **39** | **4** | **5034** | ✅ |

## Drift residual / deuda detectada (NO actuada)

Catalogada para sesiones futuras tras re-lectura del usuario:

1. **Triple solapamiento parcial en `data/schemas/mods/`** — 3 operativos (`mods-schema`, `mod-category-normalization`, `upgrade-taxonomy`). Posible revisión si algún rol se solapa.

2. **`data/schemas/abilities/`** — `abilities-engine-variables.md` y `pilot-criteria.md` fueron purgados; el subdir tiene 6 archivos con 2 operativos (`schema`, `workflow`). Verificar que `formula-patterns.md`, `preflight-checklist.md`, `source-gaps.md`, `annotation-status.md` sigan vigentes.

3. **`domains/governance/closed-decisions.md`** — la tabla "Historial DC-OQ-3..11" puede tener IDs desalineados con `open-questions.md` actual (que usa OQ-STATE, OQ-ENGINE, OQ-W, OQ-DATA).

4. **`domains/engine/design/simulation-architecture.md` (239L), `simulation-contracts.md` (197L), `simulation-roadmap.md` (74L)** — no auditados contra código en esta sesión. Posible drift acumulado desde abril.

5. **`engine-audit.md`** dice "fecha 2026-05-18" pero su `Fecha_de_actualizacion` es 2026-05-21. Verificar coherencia.

6. **Documentos huérfanos restantes (post-limpieza):**
   - `domains/ui-ux/slot-reference.md` (OQ-DATA-1 abierta)
   - `semantic/polarity.md` (OQ-DATA-2 abierta)
   - `overview/audit-context-reduction-2026-05-25.md` (esperado huérfano)

## Próximos pasos sugeridos

1. **Re-lectura del usuario** del árbol actual antes de tocar más
2. **Limpieza de `docs/audit/`** — los 3 temporales ya cumplieron su función
3. **Commit del trabajo** — el árbol está consistente, reversible vía git
4. **Auditar simulation-architecture/contracts/roadmap** contra código (sesión separada)
5. **Resolver OQ-DATA-1 y OQ-DATA-2** cuando haya bandwidth — son decisiones arquitectónicas, no urgentes

## Trazabilidad

- Régimen actualizado: [`docs/CLAUDE.md`](../CLAUDE.md)
- Decisiones arquitectónicas del motor: [`domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md)
- OQ nuevas: [`governance/open-questions.md`](../governance/open-questions.md) (OQ-DATA-1, OQ-ENGINE-FUTURE, OQ-DATA-2)
- Memoria interna: `feedback-ubicacion-doc-prejuzga-decision.md` (principio "no pre-cerrar decisiones moviendo docs")
- Convenio adoptado para slots: **por subdominio**, cada subdir con identidad propia cuenta como dominio del convenio "≤3 operativos"
