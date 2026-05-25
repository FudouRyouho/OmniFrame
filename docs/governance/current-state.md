---
Estado: "referencia"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Version: "v0.1.2"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-24"
---

# OmniFrame — Estado Actual

> **Audit fecha:** 2026-05-18 | **Actualización parcial:** 2026-05-19 (correcciones EnsembleAdapter, modelo de capas)
> **Metodología:** Lectura directa del código físico. Este documento reemplaza la versión anterior (v0.0.3) que tenía drift significativo con el estado real.

> **Modelo arquitectónico:** Ver `docs/domains/engine/design/simulation-architecture.md` para el modelo de 5 capas (A / B / C1 / C2 / D) acordado en 2026-05-19. Este documento describe la estructura física; la arquitectura conceptual y los principios de comunicación entre capas están allí.

---

## 1. Estructura física (`Project/src/`)

### Núcleo del motor

| Ruta | Estado | Descripción |
|---|---|---|
| `core/engine/loadout.ts` | **ELIMINADO (2026-05-21)** | `LoadoutState` y `LoadoutIntent` eliminados junto con la vía legacy de `MutatorBridge`. |
| `core/engine/formulas/` | **Activo** | Fórmulas matemáticas por categoría: ability, arcane, weapon, warframe, common. |
| `core/engine/contracts/` | **Activo** | Contratos del motor: `damage-logic.ts`, `damage-multipliers.ts`, `mod-overrides.ts`. (`attributes.ts` eliminado en refactor 2026-05-21.) |
| `core/engine/bridge/` + `combat/` + `hydration/` + `resolution/` | **Activo** | Implementación del motor: `SimulationEngine`, `MutatorBridge`, `CombatCalculator`, `DamageCombiner`, `StatusEngine`, `TimelineSimulator`, `StaticHydrator`, `ModRepository`, y más. `EnsembleAdapter` eliminado (2026-05-19). |
| `core/engine/hooks/useSimulation.ts` | **Activo** | Hook React que conecta `EnsembleStore` al motor vía `MutatorBridge`. |
| `core/engine/__tests__-legacy/` | **ELIMINADO** | 12 suites de test purgadas en sesión anterior. |

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
| `shared/data/DataRegistry.ts` | **Activo** | SSoT de acceso a datos en runtime. Carga y cachea datasets por tipo (`warframes`, `weapons`, `mods`, etc.) con hidratación de imágenes. |
| `shared/types/` | **Activo** | 12 módulos de contrato TypeScript: `ability`, `arcane`, `archwing-weapon`, `base`, `companion`, `damage`, `mod`, `polarity`, `stats`, `vehicle`, `warframe`, `weapon`. |
| `shared/components/` | **Activo** | Sistema de vistas unificado: cards, specs/detail views, views por entidad, filters/toolbars, navigation, popovers, slots. |
| `shared/hooks/` | **Activo** | `use-items.ts` (data), `use-performance-debug.ts` (debug). |

---

## 2. Drift documentado — lo que los docs anteriores decían vs. realidad

| Docs decían | Realidad física | Estado |
|---|---|---|
| `LoadoutProvider` eliminado absolutamente | Existía. `EnsembleAdapter.toEnsemble()` lo consumía. | ✅ Resuelto — `LoadoutProvider` y `LoadoutContext` eliminados físicamente (OQ-STATE-1/3, 2026-05-19) |
| Arsenal es cliente real del engine | Arsenal es un stub. `use-arsenal-stub-state.ts`. | ⚠️ Pendiente — UpgradeView sin diseño definido |
| EnsembleStore es el único SSoT reactivo | Coexistía con `LoadoutContext` sin reemplazarlo. | ✅ Resuelto — `LoadoutContext` eliminado. `EnsembleStore` es el único SSoT. |
| `docs/domains/integration/` sin contenido | El concepto existía: `EnsembleAdapter` era la capa de integración. Los docs no se escribieron. | ✅ Resuelto — `integration/README.md` escrito; `MutatorBridge` documentado como Capa B. |
| `DataRegistry` sin mención | Es la capa de datos en runtime más importante de la UI. | ✅ Documentado en §1 Shared. |
| `upgrade_by: "NONE"` como sentinel de valor fijo | 468 instancias en el override. El campo debe ser opcional. | ✅ Resuelto — D-11 (2026-05-22): `"NONE"` purgado, campo opcional. |
| `AbilityStatEntry` con `values[]` anidado | Sobre-ingeniería — game UI nunca tiene multi-rank en pantalla. | ✅ Resuelto — D-12 (2026-05-22): `AbilityStatValue` eliminado, `base_value: number \| [number, number]` flat. |
| Ability stats editados a mano en el JSON | Pipeline maduro: `.md` semánticos + `apply-ability-md.ts`. | ✅ Resuelto — 28 warframes procesados vía pipeline. SSoT activo. |

---

## 3. Preguntas abiertas críticas — pendientes de redefinición

Estos puntos NO tienen respuesta en el código ni en los docs actuales. Requieren decisión antes de continuar desarrollo:

**OQ-STATE-1: ¿Cuál es el contrato de estado del usuario? — CERRADO (2026-05-19)**
`EnsembleIntention` es el SSoT canónico de la UI. `LoadoutState`, `loadout.ts` y `SimulationLab` eliminados (2026-05-21). `MutatorBridge` tiene una única ruta: `simulateFromIntention`. `LoadoutContext` eliminado (2026-05-19).

**OQ-STATE-2: ¿Cómo se conecta Arsenal al motor? — CERRADO (2026-05-19)**
Write: `setItem()` / `setMod()` / `setShard()` → EnsembleStore. Read: `useSimulation()` con `entity.channel` como clave estable.

**OQ-STATE-3: ¿Cuál es el ciclo de vida de `LoadoutContext`? — CERRADO (2026-05-19)**
Eliminado físicamente. Ver OQ-STATE-1.

**OQ-STATE-4: ¿Qué hace `EnsembleAdapter` en la arquitectura final? — CERRADO (2026-05-19)**
`EnsembleAdapter` eliminado. Lógica absorbida por `MutatorBridge` como métodos privados.

---

## 4. Lo que está estable y no debe tocarse

- `core/engine/formulas/` — fórmulas matemáticas probadas
- `core/engine/contracts/` — contratos del motor ratificados
- ~~`core/engine/__tests__-legacy/`~~ — **ELIMINADO** (12 suites purgadas, ver §1)
- `shared/types/` — contratos TypeScript del dominio
- `shared/components/` — sistema de vistas unificado
- `shared/data/DataRegistry.ts` — carga de datos en runtime
- `providers/Shell/`, `Menu/`, `Theme/`, `DataState/` — providers de UI estables
