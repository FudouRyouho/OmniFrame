---
Estado: "activo"
Rol: "Estado operativo del motor de simulación"
Version: "v0.4.0"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-03"
---

# Engine Status

Estado físico real del motor tras la reestructura de `@core` (2026-06-12, `DC-OQ-ENGINE-9`) y la
campaña de saneamiento A+B+C (Fases 0–3, 2026-06-16 → 2026-07-02). Modelo de 5 capas
(A / B / C1 / C2 / D): ver [`design/simulation-architecture.md`](design/simulation-architecture.md).

---

## Componentes activos

### Capa A1 — Intención (`core/intention/`)

| Componente | Ruta | Estado |
|---|---|---|
| `ensembleStore` | `core/intention/ensemble-store.ts` | **Activo** — SSoT de intención del usuario; observable agnóstico a React. Movido desde `providers/Ensemble/` (2026-06-12). |

### Capa B — Bridge (`core/bridge/`)

| Componente | Ruta | Estado |
|---|---|---|
| `MutatorBridge` | `core/bridge/MutatorBridge.ts` | **Activo** — orquesta la simulación desde `EnsembleIntention`; única ruta `simulateFromIntention`. Vive **fuera** de `engine/` (es B, no C). Absorbió el eliminado `EnsembleAdapter`. |

### Capa C1 — Hidratación (`engine/resolve/hydration/`)

| Componente | Estado |
|---|---|
| `StaticHydrator` | **Activo** — construye `SimulationContext` desde `EnsembleIntention`; consume todos los repositories. |
| `ItemRepository` | **Activo** — **segmentado** (Slice C, 2026-07-02): Maps `weaponItems`/`warframeItems`, `loadWeapons`/`loadWarframes`, `normalizeWeapon`/`normalizeWarframe`. Emite los nodos de daño como token canónico `WEAPON_ADD_*_DAMAGE`. |
| `ModRepository` | **Activo** — resuelve mods vía `resolveUpgradeEntry()` (helper compartido, Slice A = `isUpgrade` + `UPGRADE_MAP`/`resolveToken`). Dueño de `modOverrides` (Slice D). |
| `ArcaneRepository` | **Activo** — resuelve `arcane-stats.override.json` con rank clamping (2026-06-12). |
| `IncarnonRepository` | **Activo** — resuelve perks Incarnon Genesis leyendo `stats[]` (D-18). |
| `ShardRepository` | **Activo** — Archon Shards; emite `Modifier` con `target_entity`/`target_channel`. |
| `DnaRepository` | **Activo** — passthrough de DNA. |
| `DamageCombiner` | **Activo** — combinación elemental (movido de `combat/`, 2026-05-27). |
| `DataLoader` | **Activo** — bootstrap central (`isReady()`); carga vía `DataSource` (adapter fetch/import). |

### Capa C1 — Resolución (`engine/resolve/`)

| Componente | Estado |
|---|---|
| `SimulationEngine` | **Activo** — grafo de atributos con topological sort + fixed-point fallback. Trace de procedencia **opt-in** (`enableTrace()`/`getTrace()`, Fase 3). |

### Capa C2 — Combate (`engine/simulate/combat/` + `engine/simulate/enemies/`)

| Componente | Estado |
|---|---|
| `CombatCalculator` · `CombatSimulator` | **Activo** |
| `AtomicSimulator` | **Activo** — conectado a `formulas/common/crit-base` |
| `StatusEngine` · `TimelineSimulator` · `RngProvider` | **Activo** |
| `EnemyRepository` · `EnemyState` | **Activo** (`simulate/enemies/`) |

> **Nota C2:** cobertura de test históricamente 0; primer diseño interno + primeros tests en la campaña
> de modelado de daño C2 (2026-07-02, ver [`design/damage-status-model.md`](design/damage-status-model.md)).
> Brecha conocida: `EnemyState.processDots()` decae con un pool lineal continuo, no el primitivo de
> N-timers independientes que el modelo valida.

### Salida de C — el "clic" (`engine/output/`)

| Componente | Estado |
|---|---|
| `consume.ts` | **Activo** — superficie de salida de C: `consume(intention).weapon(id).node(...)` (buckets+final) · `.trace(...)` (procedencia) · `snapshot()` (crudo). Consumido por la suite (asertar) y el oráculo CLI (inspeccionar). **No es Capa D.** |

### Entrada compartida (`engine/bootstrap/` + `engine/fixtures/`)

| Componente | Estado |
|---|---|
| `bootstrap/engine-data.ts` | **Activo** — `loadEngineData(source)` async/agnóstico (Slice E, salió de `fixtures/`). |
| `fixtures/builds.ts` | **Activo** — catálogo de intenciones-fixture (`BUILDS`: lanka/cedo/felarx/laetum/boltor…). |

### Contratos (`engine/contracts/`)

| Archivo | Estado |
|---|---|
| `contracts.ts` | **Activo** — cortes/DTOs (split 2026-06-12). |
| `primitives.ts` | **Activo** — `AttributeNode`, `Modifier`, `GameLaws`, ids. |
| `damage-logic.ts` · `damage-multipliers.ts` · `mod-overrides.ts` · `index.ts` (barrel) | **Activo** |

(`attributes.ts` eliminado 2026-05-21; `ProjectionSnapshot` purgado 2026-06-16, Fase 0.)

> **Purgado (2026-06-16, Fase 0):** `engine/hooks/` completo (`useSimulation`/`useSimulationMetrics`/`useTimeline`)
> — cluster muerto sin call-sites. La Capa D se cablea vía `useViewModel` (`@providers`) + `ViewModelContract`
> (`@shared/view-model`), **fuera** de `@core`.

---

## Fórmulas matemáticas (`engine/formulas/`)

| Carpeta | Archivos activos |
|---|---|
| `common/` | `crit-base` (→ `AtomicSimulator`), `scaling-base`, `status-base` |
| `weapon/` | `weapon-crit`, `weapon-status`, `weapon-multishot`, `weapon-condition-overload` |
| `ability/` | `ability-crit`, `ability-status` |
| `arcane/` · `warframe/` | **vacíos** (reservados; `arcane-core` purgado 2026-06-11, `warframe-core` 2026-05-27) |

Ver [`formula-overview.md`](formula-overview.md) para la especificación matemática.

---

## Tests (`engine/__tests__/`)

Suite de **consumidores derivados** vía el "clic" (`output/consume.ts`). Índice de qué resuelve cada uno:
[`test/catalog-current.md`](test/catalog-current.md). Workflow + gramática ✓/fails/todo:
[`test/test-workflow.md`](test/test-workflow.md). Territorio de gaps por construir: [`test/gap-map.md`](test/gap-map.md).

| Suite | Rol |
|---|---|
| `cedo-prime` / `felarx` / `laetum` `.test.ts` | consumidores de arma migrados al clic (estabilidad `.final` + buckets + `it.todo` de borde C1↔C2) |
| `boltor-prime-incarnon.test.ts` | consumidor con perks Incarnon + trace de procedencia (`.trace`) |
| `lanka.test.ts` | primer nodo Capa 4 (`WEAPON_FLAT_PUNCH_THROUGH`, OQ-ENGINE-7 ejes a+b) |
| `rhino.test.ts` | único fixture de warframe (verifica la segmentación Slice C) |
| `arcane.test.ts` | consumidor de arcanos v0 |
| `enemy-state-status-multiplier.test.ts` | C2 — fórmula de multiplicador de stacks Viral/Magnetic + wiring vía `CombatSimulator` (Fase 3 pieza 3) |
| `weapon-multishot-resolution.test.ts` | test de datos/regla (integridad override + resolución DNA) |

(`aklex-prime` eliminado 2026-06-09, OQ-ENGINE-6 cerrado; `__tests__-legacy/` 12 suites purgadas 2026-05-21.)

---

## Deudas de implementación

### `GAMEPLAY_MULT_FACTION_DAMAGE` — consumo C2 incompleto

El token está **mapeado** (`UPGRADE_MAP`: `op: ADD, toPercent: true`); 42 mods Bane/Expel/Cleanse/Smite lo
llevan. Falta: (1) `target.faction` **estructurado** en los mods (hoy solo en el `label` → `OQ-DATA-5`) y
(2) el consumo en C2 como multiplicador por facción. La composición (incl. el double-dip de faction sobre
DoTs) está diseñada en [`design/damage-status-model.md`](design/damage-status-model.md); modelar el bonus
como un nodo aditivo único es **lossy en multi-facción** ([`attribute-node-contract.md`](attribute-node-contract.md) §5).
Vocabulario destino: [`../../semantic/factions.md`](../../semantic/factions.md).

### Procedencia de perks de Incarnon — `source_id` ausente

`IncarnonRepository` emite los `Modifier` de perks **sin** `source_id`, mientras `ModRepository` los emite con
`Mod:<id>`. En el trace de procedencia (`SimulationEngine.getTrace`, renombrado de `getAuditResponse` en Fase 3)
el aporte de un perk aparece como `source=unknown` — inatribuible. La mecánica es correcta (el valor aterriza en
el bucket correcto); el gap es de **observabilidad**, no de cálculo.

- `engine:debt` — emitir `source_id` en `IncarnonRepository` (p. ej. `Perk:<nombre>`), espejando `ModRepository`.
  [empirical: trace de `__tests__/boltor-prime-incarnon.test.ts`]

---

## Preguntas abiertas del dominio

Ver [`../../governance/open-questions.md`](../../governance/open-questions.md):
- **OQ-ENGINE-2** — Profile switching en runtime (Incarnon/Alt-fire): re-hidratar vs. conmutar durante `resolve()`.
- **OQ-ENGINE-7** — Materialización de nodos de atributo de arma faltantes (Capa 4).
- **OQ-ENGINE-11** — Exaltadas: derivación de intención estructural en A1.
- **OQ-ENGINE-12** — Timing del pipeline de crit condicional para Puncture/Cold (C2).
- **OQ-ENGINE-13** — ¿Buffs de habilidad tipo Roar/Xata double-dipean en DoTs? (C2).
- **OQ-ENGINE-FUTURE** — Web Worker, Rewind, y estado del Gold Standard testing.

Las OQs cerradas (STATE-1..4, ENGINE-1/3/4/5/6, DATA-12) están en [`../../governance/closed-decisions.md`](../../governance/closed-decisions.md).

## Contratos del motor

- [`attribute-node-contract.md`](attribute-node-contract.md) — Qué modela cada campo de `AttributeNode`, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta.
- [`design/damage-status-model.md`](design/damage-status-model.md) — Micro-arquitectura interna de C2: modelo de daño elemental/status/DoT para los 16 tipos, primitivo de stack tracker, reglas de composición (True↔Viral, double-dip de faction, orden de resolución de stacks), verdictos de scope v1 por tipo — verificado empíricamente in-game (2026-07-02), no solo por wiki.
