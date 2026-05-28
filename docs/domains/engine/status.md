---
Estado: "activo"
Rol: "Estado operativo del motor de simulación"
Version: "v0.2.0"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-27"
---

# Engine Status

> **Última actualización:** 2026-05-27 — Sincronizado con estado físico real post-refactor.

---

## Componentes activos

### Capa B — Bridge

| Componente | Ruta | Estado |
|---|---|---|
| `MutatorBridge` | `engine/bridge/MutatorBridge.ts` | **Activo** — orquesta la simulación completa desde `EnsembleIntention`; única ruta: `simulateFromIntention`. Absorbió la lógica del eliminado `EnsembleAdapter`. |

### Capa C1 — Hidratación

| Componente | Ruta | Estado |
|---|---|---|
| `StaticHydrator` | `engine/hydration/StaticHydrator.ts` | **Activo** — construye `SimulationContext` desde `EnsembleIntention`; consume todos los repositories |
| `ItemRepository` | `engine/hydration/ItemRepository.ts` | **Activo** — calcula `damage_sum` del perfil activo; base de `WEAPON_DAMAGE` |
| `ModRepository` | `engine/hydration/ModRepository.ts` | **Activo** — resuelve mods vía `isUpgrade()` + `UPGRADE_MAP` / `resolveToken()` |
| `ShardRepository` | `engine/hydration/ShardRepository.ts` | **Activo** — resuelve Archon Shards; emite `Modifier` objects con `target_entity` |
| `IncarnonRepository` | `engine/hydration/IncarnonRepository.ts` | **Activo (2026-05-27)** — resuelve perks Incarnon Genesis vía `incarnon-evolutions.override.json` |
| `DnaRepository` | `engine/hydration/DnaRepository.ts` | **Activo** |
| `DamageCombiner` | `engine/hydration/DamageCombiner.ts` | **Activo** — movido de `combat/` (2026-05-27, layer boundary) |

### Capa C2 — Resolución

| Componente | Ruta | Estado |
|---|---|---|
| `SimulationEngine` | `engine/resolution/SimulationEngine.ts` | **Activo** — grafo de atributos con topological sort + fixed-point fallback |

### Capa C2 — Combat

| Componente | Ruta | Estado |
|---|---|---|
| `CombatCalculator` | `engine/combat/CombatCalculator.ts` | **Activo** |
| `CombatSimulator` | `engine/combat/CombatSimulator.ts` | **Activo** |
| `AtomicSimulator` | `engine/combat/AtomicSimulator.ts` | **Activo** — conectado a `formulas/common/crit-base` |
| `StatusEngine` | `engine/combat/StatusEngine.ts` | **Activo** |
| `TimelineSimulator` | `engine/combat/TimelineSimulator.ts` | **Activo** |
| `RngProvider` | `engine/combat/RngProvider.ts` | **Activo** |

### Enemies

| Componente | Ruta | Estado |
|---|---|---|
| `EnemyRepository` | `engine/enemies/EnemyRepository.ts` | **Activo** |
| `EnemyState` | `engine/enemies/EnemyState.ts` | **Activo** |

### Contratos (`engine/contracts/`)

| Archivo | Estado |
|---|---|
| `damage-logic.ts` | **Activo** |
| `damage-multipliers.ts` | **Activo** |
| `mod-overrides.ts` | **Activo** |
| `index.ts` | **Activo** |
| ~~`attributes.ts`~~ | **ELIMINADO (2026-05-21)** |

### Hooks

| Hook | Ruta | Estado |
|---|---|---|
| `useSimulation` | `engine/hooks/useSimulation.ts` | **Activo** — conecta `EnsembleStore` → `MutatorBridge` → UI |
| `useSimulationMetrics` | `engine/hooks/useSimulationMetrics.ts` | **Activo** |
| `useTimeline` | `engine/hooks/useTimeline.ts` | **Activo** |

### Tests (`engine/__tests__/`)

| Suite | Descripción |
|---|---|
| `aklex-prime.test.ts` | Aklex Prime — 23 tests gold standard |
| `cedo-prime.test.ts` | Cedo Prime Normal Attack — 10 tests gold standard |
| `boltor-prime-incarnon.test.ts` | Boltor Prime — Incarnon Genesis perks |
| ~~`__tests__-legacy/`~~ | **ELIMINADO (2026-05-21)** — 12 suites purgadas |

---

## Fórmulas matemáticas (`core/engine/formulas/`)

| Carpeta | Archivos activos |
|---|---|
| `formulas/common/` | `scaling-base`, `crit-base` (→ `AtomicSimulator`), `status-base` |
| `formulas/weapon/` | `weapon-crit`, `weapon-status`, `weapon-multishot`, `weapon-condition-overload` |
| `formulas/ability/` | `ability-crit`, `ability-status` |
| `formulas/arcane/` | `arcane-core` |
| ~~`formulas/weapon/weapon-core`~~ | **ELIMINADO (2026-05-27)** — código muerto, OQ-ENGINE-5 |
| ~~`formulas/warframe/`~~ | **ELIMINADO (2026-05-27)** — `warframe-core` purgado, directorio vacío |

Ver [`formula-overview.md`](formula-overview.md) para la especificación matemática.

---

## Lo que NO existe (eliminado)

| Artefacto | Fecha | Motivo |
|---|---|---|
| `resolver.ts` | anterior | Absorbido por `MutatorBridge` + `SimulationEngine` |
| `EnsembleAdapter` | 2026-05-19 | Eliminado como clase pública; lógica en `MutatorBridge` |
| `loadout.ts` / `LoadoutState` | 2026-05-21 | Vía legacy eliminada con `SimulationLab` |
| `attributes.ts` (contracts) | 2026-05-21 | Refactor — contratos reestructurados |
| `__tests__-legacy/` | 2026-05-21 | 12 suites purgadas; reemplazadas por gold standard tests |
| `weapon-core.ts` | 2026-05-27 | Código muerto — OQ-ENGINE-5 |
| `warframe-core.ts` | 2026-05-27 | Código muerto — OQ-ENGINE-5 |
| `DamageCombiner` en `combat/` | 2026-05-27 | Movido a `hydration/` (layer boundary fix) |

---

## Preguntas abiertas del dominio

Ver `docs/governance/open-questions.md`:
- **OQ-ENGINE-2** — Profile switching en runtime (Incarnon/Alt-fire): re-hidratar vs. conmutar durante `resolve()`
- **OQ-ENGINE-FUTURE** — Web Worker, Rewind, y estado del Gold Standard testing

Las OQs cerradas (STATE-1..4, ENGINE-1/3/4/5/6) están en `docs/governance/closed-decisions.md`.

## Contratos del motor

- [`attribute-node-contract.md`](attribute-node-contract.md) — Qué modela cada campo de `AttributeNode`, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta.
