---
Estado: "referencia"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Version: "v0.1.8"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-11 (actualización #8)"
---

# OmniFrame — Estado Actual

> **Audit fecha:** 2026-05-18 | **Actualización parcial:** 2026-05-19 (correcciones EnsembleAdapter, modelo de capas) | **Actualización #4:** 2026-06-01 (gramática de nomenclaturas)
> **Metodología:** Lectura directa del código físico. Este documento reemplaza la versión anterior (v0.0.3) que tenía drift significativo con el estado real.

> **[2026-06-01] Gobernanza:** Nueva SSoT de nomenclaturas establecida. Ver [`docs/governance/nomenclature-grammar.md`](nomenclature-grammar.md). Todos los tags inline en JSONs y docs han sido migrados a la gramática `DOMINIO:ROL[:ESQUEMA/ID]`. La colisión `[engine]`/`[ENGINE]` queda resuelta.

> **[2026-06-01] Gobernanza (D-19):** Redefinida la naturaleza de `condition`. Es vocabulario **endógeno** (no proviene de `@wfcd/items`, a diferencia de `upgrade_*`): el SSoT del token es el override JSON; `docs/semantic/conditions.md` es **consolidador posterior**, no portero previo. Un token capturado y aún no consolidado en el doc = cola de consolidación, no drift. `notes[]` queda definido como capa de anotación/auditoría, nunca SSoT. Ver [`docs/data/decisions.md`](../data/decisions.md) D-19.

> **[2026-06-08] Engine — metodología de validación (prototipo VIGENTE):** Graduada a [`attribute-node-contract.md`](../domains/engine/attribute-node-contract.md) la metodología de test progresivo + derivación: los buckets del `AttributeNode` (`base_add_pct`, `mods_add_pct`, `multiplicative`, …) son la **superficie de aserción** del test (test de lógica vs. test de estabilidad), el fixture es una `EnsembleIntention` + cadena de derivación esperada por nodo, y la base del linaje debe ser incondicional. Es prototipo con base documentada. La build de referencia (Rhino), su estratificación y el lineaje de decisión (D12–D16) están en [`engine/test/`](../domains/engine/test/) (ver entrada 2026-06-09); la validación con ≥2 warframes adicionales sigue abierta.

> **[2026-06-09] Engine — testing derivado ejercido + sub-área `engine/test/`:** La metodología pasó de prototipo a ejercida sobre **4 consumidores de arma** (Boltor, Cedo, Felarx, Laetum) vía el "clic" (`__tests__/helpers/consume.ts`): un `consume()` por intención, estabilidad (`.final`) + lógica (buckets) en la misma fuente. Se acuñó la **gramática ✓/fails/todo** (el `it.todo` mapea el borde C1↔C2). `validation-builds.md` se eliminó y su contenido se repartió en **`docs/domains/engine/test/`**: `test-workflow.md` (CÓMO + registro de decisión), `catalog-current.md` (índice de consumidores), `catalog-future.md` (Rhino, standard-set, frontera C2). **Decisión durable** en `test-workflow.md`: la observabilidad por buckets es intención de diseño original (orientada a D, diferida); la sonda de construcción es la función emergente; el agnosticismo de capas es el invariante a proteger. Disparadores de graduación: abilities → dominio docs (Futuro 2); D existe → capa observabilidad ≈ `observer/` (Futuro 3). C2 no gradúa (crece dentro de engine).

> **[2026-06-10] Engine — frontera C→D + oráculo CLI (decisiones + prototipo):** Sesión de diseño materializada. Decisiones (ver [`engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §5-7): (1) oráculo del motor = **CLI, no MCP** (MCP diferido); (2) `consume()` = **salida de C**, promovido a módulo en `@core/engine/output/` (fuera de `__tests__/`, 2026-06-10) — superficie del dominio engine, consumida por scripts/tests (no-dominios); **no es Capa D**; (3) **frontera de dominios**: los dominios no importan `@core` (reafirma Restricción 1) — la UI y la Capa D (consumo derivado, `ViewModelContract`) cruzan por `@shared`. `C→D→UI` = **prototipo en revisión**. Diseño activo de `ViewModelContract` (consumer-shaped) + simetría de entrada en `OQ-ENGINE-FUTURE` ([`open-questions.md`](open-questions.md)).
> **Deuda registrada (sesión 2026-06-10):**
> - `domains/arsenal/view/UpgradeView.tsx` importa `@core/engine/hooks/useSimulation` directo → **violación de la frontera de dominios** (stub conectado antes de existir D); corregir vía `@shared` al materializar D.
> - `useSimulation` en `@core/engine/hooks` = D reactiva parcial co-ubicada en `@core` → drift a reubicar fuera de `@core` cuando D se materialice.

> **[2026-06-11] Engine — oráculo CLI v0 + derivación de tests (contrato + módulos):** `consume()` extendido con `snapshot(): SimulationEntity[]` (salida cruda de C, forma-de-productor; **cambio de contrato del puerto**), promovido a `@core/engine/output/consume.ts`. **Harness de entrada** en `@core/engine/fixtures/`: `loadEngineData()` (bootstrap, ex-`__tests__/helpers/engine-data-setup`) + `builds.ts` (catálogo de las 5 builds verificadas + registro `BUILDS`). **Oráculo CLI** (`scripts/oracle/`, `npm run oracle -- <build>` | `all`): adaptador no-reactivo que inspecciona el snapshot crudo — primer cliente real consumiendo el motor (no-UI). Test (asertar) y oráculo (inspeccionar) = adaptadores hermanos sobre el mismo input; el oráculo NO reinventa el runner. `ViewModelContract`/Capa D siguen **diferidos** (sin UI). Nuevas OQ: **OQ-ENGINE-8** (sobrecarga "Proyección"/`ProjectionSnapshot`), **OQ-ENGINE-9** (estructura interna de `@core` + `fixtures/` mixto). Ver [`engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §5-7 y [`open-questions.md`](open-questions.md).
> - La doc de capas atribuye el "DNA Mutation Step" (shards/helminth) a la Capa B, pero el código lo ejecuta en C1 (`StaticHydrator`); B solo mapea shards en `ensembleFromIntention` → drift de clasificación menor.
> - Puntero archivado a `docs/design/sim-v2/OMNIFRAME_SIMULATION_ARCHITECTURE.md` (en `docs-archive/legacy/engine/architecture.md` y pre-v1) está **colgado** — la verdad viva es `docs/domains/engine/design/simulation-architecture.md`.

> **Modelo arquitectónico:** Ver `docs/domains/engine/design/simulation-architecture.md` para el modelo de 5 capas (A / B / C1 / C2 / D) acordado en 2026-05-19. Este documento describe la estructura física; la arquitectura conceptual y los principios de comunicación entre capas están allí.

---

## 1. Estructura física (`Project/src/`)

### Núcleo del motor

| Ruta | Estado | Descripción |
|---|---|---|
| `core/engine/loadout.ts` | **ELIMINADO (2026-05-21)** | `LoadoutState` y `LoadoutIntent` eliminados junto con la vía legacy de `MutatorBridge`. |
| `core/engine/formulas/` | **Casi vacío (reservado)** | Subdirs por categoría (ability, arcane, weapon, warframe, common) en su mayoría vacíos a propósito — reservados para fórmulas dedicadas futuras (ability-like / composición no derivable del snapshot). `arcane/arcane-core.ts` purgado (2026-06-11, shape stale). `crit-base.ts` / `scaling-base.ts` siguen activos. |
| `core/engine/contracts/` | **Activo** | Contratos del motor: `damage-logic.ts`, `damage-multipliers.ts`, `mod-overrides.ts`. (`attributes.ts` eliminado en refactor 2026-05-21.) |
| `core/engine/bridge/` + `combat/` + `hydration/` + `resolution/` | **Activo** | Implementación del motor: `SimulationEngine`, `MutatorBridge`, `CombatCalculator`, `StatusEngine`, `TimelineSimulator`, `StaticHydrator`, `ModRepository`, `IncarnonRepository` (2026-05-27), `ArcaneRepository` (2026-06-11 — arcanos v0, modifier directo sin `DamageCombiner`), y más. `EnsembleAdapter` eliminado (2026-05-19). `DamageCombiner` movido de `combat/` a `hydration/` (2026-05-27 — layer boundary). Contrato de intención: `EnsembleIntention.arcanes` + `Ensemble.{warframe,WeaponIntent}.arcanes` (slot dedicado, hermano de `mods`). |
| `core/engine/hooks/useSimulation.ts` | **Activo** | Hook React que conecta `EnsembleStore` al motor vía `MutatorBridge`. |
| `core/engine/__tests__-legacy/` | **ELIMINADO** | 12 suites de test purgadas en sesión anterior. |
| `core/engine/__tests__/` | **Activo** | Suites gold standard (Vitest), consumidores derivados del clic. Cobertura: 6 archivos (Boltor/Cedo/Felarx/Laetum/Lanka + arcano v0), ~63 tests. La deuda `IncarnonRepository` (lectura `upgrades[]` vs `stats[]` D-18) **resuelta** (Capa 3 cerrada 2026-06-06; el repo lee `stats[]`). Índice vivo: [`engine/test/catalog-current.md`](../domains/engine/test/catalog-current.md). |

### Providers — Estado de transición

> ⚠️ Esta capa está en transición. Existen DOS sistemas de estado paralelos sin sincronizar.

| Provider | Estado | Descripción |
|---|---|---|
| `providers/Ensemble/` | **Activo — sistema nuevo** | `EnsembleStore`: observable agnóstico al framework. Gestiona `EnsembleIntention` (items por canal + mods + environment). Es el SSoT de intención del usuario en la arquitectura nueva. |
| `providers/Loadout/` | **ELIMINADO (2026-05-19)** | `LoadoutContext` y `LoadoutProvider` purgados. `LoadoutState` y `loadout.ts` también eliminados (2026-05-21). Sin remanentes del sistema legacy. Decisión: OQ-STATE-1/3/4. |
| `providers/DataState/` | **Activo** | Context headless de estado de UI (concepto `data-*` HTML). No relacionado con el engine. |
| `providers/Shell/` | **Activo** | Navegación, zona, título y footer del shell. |
| `providers/Menu/` | **Activo** | Estado del menú de navegación. |
| `providers/Theme/` | **Activo** | Paleta, colores y selector de tema. |

### La capa de integración — `MutatorBridge` (Capa B)

> ⚠️ **Histórico corregido:** `EnsembleAdapter` fue eliminado en 2026-05-19 (OQ-STATE-4). La descripción anterior era drift.

`MutatorBridge` (`engine/bridge/`) es la capa B del modelo de 5 capas — orquesta la simulación completa desde `EnsembleIntention`:

- Absorbe la lógica que `EnsembleAdapter` tenía como stub (`fromIntention`)
- Traduce intención → contratos del engine (C1) sin conocer la UI
- Comunicación unidireccional: A → B → C1/C2 → D

`useSimulation` es la implementación parcial de la Capa D (Proyección) — conecta `EnsembleStore` → `MutatorBridge` → UI. El contrato formal `ViewModelContract` está pendiente.

### Dominios de UI

| Ruta | Estado | Descripción |
|---|---|---|
| `domains/arsenal/` | **Stub** | `use-arsenal-stub-state.ts` (`@status stub`). Arsenal no consume `EnsembleStore` ni `LoadoutContext` de forma definitiva. `UpgradeView` sin diseño definido. |
| `domains/equipment/` | **Activo** | Controlador de composición delegado a `@shared`. |
| `domains/hud/` | **Activo** | `Hud`, `HudHeader`, footer por zona (Arsenal, Equipment, Items). |
| `domains/options/` | **Activo** | Vista de opciones. |
| `domains/profile/` | **Activo** | Vista de perfil. |

### Shared

| Ruta | Estado | Descripción |
|---|---|---|
| `shared/data/DataRegistry.ts` | **Activo (UI)** | SSoT de acceso a datos en runtime para la UI. Carga y cachea datasets por tipo con hidratación de imágenes. Candidato a evolucionar hacia el DataLoader singleton (ver `OQ-DATA-3`). |
| `shared/types/` | **Activo** | 12 módulos de contrato TypeScript: `ability`, `arcane`, `archwing-weapon`, `base`, `companion`, `damage`, `mod`, `polarity`, `stats`, `vehicle`, `warframe`, `weapon`. |
| `shared/components/` | **Activo** | Sistema de vistas unificado: cards, specs/detail views, views por entidad, filters/toolbars, navigation, popovers, slots. |
| `shared/hooks/` | **Activo** | `use-items.ts` (data), `use-performance-debug.ts` (debug). |

---

## 2. Gaps pendientes de resolución

| Gap | Estado |
|---|---|
| Arsenal es cliente real del engine | ⚠️ Pendiente — `use-arsenal-stub-state.ts` activo, UpgradeView sin diseño definido |
| Capa D materializada (`C→D→UI`) | ⚠️ Prototipo en revisión — `consume()` promovible a `@core`; `ViewModelContract` (consumer-shaped) por definir. Ver `OQ-ENGINE-FUTURE` |
| `UpgradeView` importa `@core` directo | ⚠️ Violación de frontera de dominios — drift del stub; corregir vía `@shared` al materializar D |

---

## 3. Preguntas abiertas críticas

**OQ-ENGINE-2: Profile switching (Incarnon/Alt-fire) — ABIERTO**
Re-hidratar todo el ensemble vs. conmutar `active_profile_id` en `resolve()` en runtime. Ver `docs/governance/open-questions.md`.

OQs cerradas: ver `docs/governance/closed-decisions.md`.

---

## 4. Lo que está estable y no debe tocarse

- `core/engine/formulas/` — fórmulas matemáticas probadas
- `core/engine/contracts/` — contratos del motor ratificados
- `shared/types/` — contratos TypeScript del dominio
- `shared/components/` — sistema de vistas unificado
- `shared/data/DataRegistry.ts` — carga de datos en runtime
- `providers/Shell/`, `Menu/`, `Theme/`, `DataState/` — providers de UI estables
