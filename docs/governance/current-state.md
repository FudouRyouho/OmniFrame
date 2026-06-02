---
Estado: "referencia"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Version: "v0.1.5"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01 (actualización #5)"
---

# OmniFrame — Estado Actual

> **Audit fecha:** 2026-05-18 | **Actualización parcial:** 2026-05-19 (correcciones EnsembleAdapter, modelo de capas) | **Actualización #4:** 2026-06-01 (gramática de nomenclaturas)
> **Metodología:** Lectura directa del código físico. Este documento reemplaza la versión anterior (v0.0.3) que tenía drift significativo con el estado real.

> **[2026-06-01] Gobernanza:** Nueva SSoT de nomenclaturas establecida. Ver [`docs/governance/nomenclature-grammar.md`](nomenclature-grammar.md). Todos los tags inline en JSONs y docs han sido migrados a la gramática `DOMINIO:ROL[:ESQUEMA/ID]`. La colisión `[engine]`/`[ENGINE]` queda resuelta.

> **[2026-06-01] Gobernanza (D-19):** Redefinida la naturaleza de `condition`. Es vocabulario **endógeno** (no proviene de `@wfcd/items`, a diferencia de `upgrade_*`): el SSoT del token es el override JSON; `docs/semantic/conditions.md` es **consolidador posterior**, no portero previo. Un token capturado y aún no consolidado en el doc = cola de consolidación, no drift. `notes[]` queda definido como capa de anotación/auditoría, nunca SSoT. Ver [`docs/data/decisions.md`](../data/decisions.md) D-19.

> **Modelo arquitectónico:** Ver `docs/domains/engine/design/simulation-architecture.md` para el modelo de 5 capas (A / B / C1 / C2 / D) acordado en 2026-05-19. Este documento describe la estructura física; la arquitectura conceptual y los principios de comunicación entre capas están allí.

---

## 1. Estructura física (`Project/src/`)

### Núcleo del motor

| Ruta | Estado | Descripción |
|---|---|---|
| `core/engine/loadout.ts` | **ELIMINADO (2026-05-21)** | `LoadoutState` y `LoadoutIntent` eliminados junto con la vía legacy de `MutatorBridge`. |
| `core/engine/formulas/` | **Activo — SSoT real** | Fórmulas matemáticas por categoría: ability, arcane, weapon, warframe, common. `crit-base.ts` ← `AtomicSimulator`; `scaling-base.ts` ← `SimulationEngine`. |
| `core/engine/contracts/` | **Activo** | Contratos del motor: `damage-logic.ts`, `damage-multipliers.ts`, `mod-overrides.ts`. (`attributes.ts` eliminado en refactor 2026-05-21.) |
| `core/engine/bridge/` + `combat/` + `hydration/` + `resolution/` | **Activo** | Implementación del motor: `SimulationEngine`, `MutatorBridge`, `CombatCalculator`, `StatusEngine`, `TimelineSimulator`, `StaticHydrator`, `ModRepository`, `IncarnonRepository` (2026-05-27), y más. `EnsembleAdapter` eliminado (2026-05-19). `DamageCombiner` movido de `combat/` a `hydration/` (2026-05-27 — layer boundary). |
| `core/engine/hooks/useSimulation.ts` | **Activo** | Hook React que conecta `EnsembleStore` al motor vía `MutatorBridge`. |
| `core/engine/__tests__-legacy/` | **ELIMINADO** | 12 suites de test purgadas en sesión anterior. |
| `core/engine/__tests__/` | **Activo — con deuda** | Suites gold standard (Vitest). Cobertura: weapon stats, multiplicador WEAPON_DAMAGE, evoluciones Incarnon. ⚠️ Las suites de Incarnon (laetum, felarx, boltor) **fallan** (5 tests): el override migró a `stats[]` (D-18) pero `IncarnonRepository` aún lee `upgrades[]` → modificadores de evolución devuelven `[]`. Deuda registrada en [D-18](../data/decisions.md); se resuelve al actualizar el repository en la fase engine↔UI. |

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
