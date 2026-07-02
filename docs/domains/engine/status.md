---
Estado: "activo"
Rol: "Estado operativo del motor de simulación"
Version: "v0.3.4"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-11"
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

### Capa C1 — Resolución

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

Suite de **consumidores derivados** vía el "clic" (`output/consume.ts`, salida de C). Índice de qué resuelve cada uno:
[`test/catalog-current.md`](test/catalog-current.md). Workflow + gramática ✓/fails/todo:
[`test/test-workflow.md`](test/test-workflow.md). Territorio de gaps por construir: [`test/gap-map.md`](test/gap-map.md).

Las **intenciones** (builds) viven en `engine/fixtures/builds.ts` (catálogo compartido) + el bootstrap
`loadEngineData()` (`fixtures/engine-data.ts`). Las consume tanto la suite (asertar) como el **oráculo CLI**
(`scripts/oracle/`, `npm run oracle -- <build>` | `all`), que inspecciona el snapshot crudo (`output/consume.ts` →
`snapshot()`) en vez de asertar. Ver [`test/test-workflow.md`](test/test-workflow.md) §Entrada compartida.

| Suite | Rol |
|---|---|
| `boltor` / `cedo` / `felarx` / `laetum` `.test.ts` | consumidores migrados al clic (estabilidad `.final` + lógica por buckets + `it.todo` de borde C1↔C2) |
| `lanka.test.ts` | consumidor del primer nodo Capa 4 (`WEAPON_FLAT_PUNCH_THROUGH`): innato per-ataque vía `weapon-stats.override.json` + `ADD_FLAT` (OQ-ENGINE-7 ejes a+b) |
| `weapon-multishot-resolution.test.ts` | test de datos/regla (integridad override + resolución DNA) |
| ~~`aklex-prime.test.ts`~~ | **ELIMINADO (2026-06-09)** — baseline sin acople; OQ-ENGINE-6 cerrado |
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

## Deudas de implementación

### `faction_damage_bonus` — wiring incompleto

`ModRepository` ya mapea `GAMEPLAY_FACTION_DAMAGE` → `faction_damage_bonus` con `op: "ADD"`. Faltan dos pasos:

1. **`StaticHydrator`** — inyectar nodo sintético `{ base: 100 }` para entidades `domain: weapon`, análogo al nodo `WEAPON_DAMAGE`.
2. **`CombatCalculator`** — consumir `faction_damage_bonus.final / 100` como multiplicador cuando `target.faction` coincide.

Nota: `target.faction` requiere que el campo `faction` esté estructurado en los mods (hoy solo en el `label`). Mismo patrón que OQ-DATA-5; vocabulario destino: `semantic/factions.md`.

### Procedencia de perks de Incarnon — `source_id` ausente

`IncarnonRepository` emite los `Modifier` de los perks **sin** `source_id`, mientras `ModRepository` los emite con `Mod:<id>`. En el trace de procedencia (`SimulationEngine.getTrace`, renombrado de `getAuditResponse` en Fase 3 — ver `current-state.md`) el aporte de un perk aparece como `source=unknown` — el paso es inatribuible. La mecánica es correcta (el valor aterriza en el bucket correcto); el gap es de **observabilidad**, no de cálculo.

- `engine:debt` — emitir `source_id` en `IncarnonRepository` (p. ej. `Perk:<nombre>`), espejando `ModRepository`. [empirical: `__tests__/boltor-consume.test.ts` — paso `[debug ii]` del audit trace]

Bloquea: aserción de procedencia en la suite de consumo (el trace no puede atribuir perks a su evolución de origen).

---

## Preguntas abiertas del dominio

Ver `docs/governance/open-questions.md`:
- **OQ-ENGINE-2** — Profile switching en runtime (Incarnon/Alt-fire): re-hidratar vs. conmutar durante `resolve()`
- **OQ-ENGINE-FUTURE** — Web Worker, Rewind, y estado del Gold Standard testing

Las OQs cerradas (STATE-1..4, ENGINE-1/3/4/5/6) están en `docs/governance/closed-decisions.md`.

## Contratos del motor

- [`attribute-node-contract.md`](attribute-node-contract.md) — Qué modela cada campo de `AttributeNode`, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta.
