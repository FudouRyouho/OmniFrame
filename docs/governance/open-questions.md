---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.4.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-05-24"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

---

## OQ-STATE-1 — Contrato de estado del usuario — **CERRADO (2026-05-19, actualizado 2026-05-21)**
**Dominio:** integration / state
**Decisión:** `EnsembleIntention` (EnsembleStore) es el SSoT canónico de estado del usuario en la UI. `LoadoutContext` (React context + `useReducer`) eliminado físicamente (2026-05-19). `LoadoutState` y `loadout.ts` eliminados físicamente (2026-05-21) — la vía legacy de `simulate(LoadoutState)` fue removida junto con `SimulationLab`.
**Justificación:** `LoadoutProvider` no estaba montado en ningún árbol React. La vía legacy se retuvo inicialmente para dev/test; eliminada al constatar que `SimulationLab` estaba roto y era reemplazable por tests de Vitest. Multi-config (A/B/C) se difiere a una fase posterior. `environment` (targetLevel, targetFaction, isSteelPath) permanece en `EnsembleIntention`.
**Desbloquea:** OQ-STATE-2, OQ-STATE-3, OQ-STATE-4

## OQ-STATE-2 — Conexión Arsenal → Motor — **CERRADO (2026-05-19)**
**Dominio:** integration / arsenal
**Decisión:**
- Flujo de escritura: `ArsenalSwapView` → `EnsembleStore.setItem()` (equip item). `UpgradeView` → `EnsembleStore.setMod()` (equip mod). `ArchonShardSelectionView` → `EnsembleStore.setShard()` (archon shards — ahora en `EnsembleIntention`).
- Flujo de lectura: `UpgradeView` consume `useSimulation()` → `SimulationResult.entities` con lookup estable por `entity.channel`.
- Arsenal metadata visual (incarnon, focus, parazon, companion, vehicles) permanece en `use-arsenal-stub-state` hasta que se resuelvan OQ-ENGINE-2/4.
- Config A/B/C existe en `ArsenalContext` como UI-only hasta que multi-config sea implementado.
**Depende de:** OQ-STATE-1 ✅

## OQ-STATE-3 — Ciclo de vida de LoadoutContext — **CERRADO (2026-05-19, actualizado 2026-05-21)**
**Dominio:** integration / providers
**Decisión:** `LoadoutContext` (React context + `useReducer` + `LoadoutProvider`) eliminado físicamente (2026-05-19). `LoadoutState` (tipo + funciones en `loadout.ts`) eliminado físicamente (2026-05-21) — ya no existe ningún remanente de la vía legacy.
**Depende de:** OQ-STATE-1 ✅

## OQ-STATE-4 — Rol de EnsembleAdapter en la arquitectura final — **CERRADO (2026-05-19, actualizado 2026-05-21)**
**Dominio:** integration / engine
**Decisión:** `EnsembleAdapter` eliminado como clase pública (2026-05-19). Su lógica fue absorbida por `MutatorBridge`. La vía legacy (`simulate(LoadoutState)` + `ensembleFromLoadout`) eliminada físicamente (2026-05-21). `MutatorBridge` tiene una única ruta canónica: `simulateFromIntention(EnsembleIntention)`.
**Depende de:** OQ-STATE-1 ✅ OQ-STATE-2 ✅

---

## OQ-ENGINE-1 — Patrón WEAPON_DAMAGE como multiplicador global — **ABIERTO (2026-05-18)**
**Dominio:** engine / architecture
**Contexto:** `StaticHydrator` inyecta un nodo `WEAPON_DAMAGE` (base 100) en toda entidad. `calculateCurrentValue()` aplica `WEAPON_DAMAGE.final / 100` como multiplicador implícito a todos los `damage_*` nodos. Mods como Serration hacen `ADD` a `WEAPON_DAMAGE`, no a cada tipo de daño individualmente. Este patrón no está documentado en `simulation-architecture.md`.
**Pregunta:** ¿Es la arquitectura definitiva o un hack temporal? Si es definitiva, documentar. Si no, ¿cuál es el modelo correcto (Serration aplica como `MULTIPLICATIVE` en cada `damage_*`)?
**Fuente:** `docs/domains/engine/engine-audit.md §4.1`

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **ABIERTO (2026-05-18)**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.
**Fuente:** `docs/domains/engine/engine-audit.md §2.4`

## OQ-ENGINE-3 — Label parsing para tipo elemental en ModRepository — **ABIERTO (2026-05-18)**
**Dominio:** engine / data-pipeline
**Contexto:** `ModRepository.getModifiers()` detecta el tipo elemental de un mod buscando el nombre del elemento en `stat.label` (campo de texto libre). Un cambio en el texto del override JSON rompería la resolución silenciosamente.
**Pregunta:** ¿Se agrega un campo explícito `element_type` al schema `ModStat` en el override JSON? Ver `docs/data/schemas/mods/mods-schema.md`.
**Fuente:** `docs/domains/engine/engine-audit.md §4.3`

## OQ-ENGINE-4 — DNA Mutation (Archon Shards, Helminth) — ¿Cuándo? — **ABIERTO (2026-05-18)**
**Dominio:** engine / layer-B
**Contexto:** El diseño pone la mutación de ADN en la Capa B (MutatorBridge): antes de emitir el ensemble hidratado, se aplican Archon Shards y Helminth directamente sobre los valores base. La implementación tiene `shards: []` y `helminth: undefined` hardcodeados en `EnsembleAdapter`. No está cubierto en las fases del roadmap (Fase 6 tampoco lo menciona explícitamente).
**Pregunta:** ¿En qué Fase del roadmap se implementa? ¿Bloquea algo antes de Fase 8?
**Fuente:** `docs/domains/engine/engine-audit.md §3`

---

## OQ-2 - Rol del LoadoutProvider y Agnosticismo Real — **CERRADO (2026-04-21) / DRIFT DETECTADO (2026-05-18)**
**Solución declarada:** Se abandona el `LoadoutProvider` como gestor de cálculo. La arquitectura **Sim-v2** introduce el **Mutator Bridge** y el **Engine Agnóstico**. El estado es ahora una **Ensemble Store** serializable.
**Referencia:** `docs/domains/engine/design/simulation-architecture.md`
**⚠️ Drift (2026-05-18):** La decisión fue documentada pero no implementada. `LoadoutProvider` existe físicamente con referencias activas. Ver OQ-STATE-3.

## OQ-5 - Punto de migracion de hidratacion a build time
**Estado:** **ABIERTO**
**Dominio:** integración / data
**Pregunta:** ¿Cuándo deja de vivir la hidratación de habilidades en runtime y pasa al pipeline de build?
**Impacto:** Afecta performance del engine y fidelidad de los datos.

## OQ-12 - Definicion del contrato de Proyección (B4) — **CERRADO (2026-04-21)**
**Solución:** El contrato de salida es un **Projection Snapshot** inmutable y serializable. La reactividad se maneja mediante un **Selective UI Reactive Bridge** externo al motor.
**Referencia:** `docs/domains/engine/design/simulation-contracts.md`

## OQ-13 - Frontera de calculo entre Arsenal y Builder — **CERRADO (2026-04-21)**
**Solución:** No hay frontera de cálculo. Ambos consumen el mismo **Engine Sim-v2**. La diferencia radica únicamente en el **Simulation Context** inyectado (Target vs Baseline).

---

## OQ-W-4 — Sub-familia en la taxonomía D-6 — **ABIERTO (2026-05-21)**
**Dominio:** data / upgrade-taxonomy
**Contexto:** La convención `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` no codifica sub-familias. Los archon shards expusieron el primer caso: stats slot-específicos (Primary Status Chance, Secondary Crit Chance, Melee Crit Damage) no tienen `upgrade_type` válido porque `WEAPON_*` no distingue el slot de arma.
**Propuesta en discusión:** extender a `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`.
**Ejes de sub-familia identificados:** `WEAPON` → `PRIMARY`, `SECONDARY`, `MELEE`; `AVATAR` → `WARFRAME` (y posiblemente `NECRAMECH`).
**Condición para resolver:** al menos 3 casos distintos en overrides (arcanos, passives, helminth) que justifiquen la extensión. No definir antes.
**Casos bloqueados:** `docs/data/status.md` → sección Archon Shards.
**Refs:** `docs/data/schemas/mods/upgrade-taxonomy.md`, `shared/types/modifier.ts`

## OQ-W-5 — Semántica derivada de ENERGY_COST / ENERGY_DRAIN — **ABIERTO (2026-05-22)**
**Dominio:** data / ability-stats → engine
**Contexto:** `ENERGY_COST` y `ENERGY_DRAIN` son tokens válidos en `upgrade_by` de ability-stats. El pipeline los captura correctamente. La semántica derivada (cómo interactúan con Ability Efficiency, caps, etc.) no está implementada en el engine.
**Fórmulas conocidas:**
- `ENERGY_COST` → `(2 − efficiency) × base_cost`
- `ENERGY_DRAIN` → `((2 − efficiency) × base_drain) / duration_multiplier`
**Estado:** deuda legítima. No bloquea el pipeline de datos ni el schema.
**Condición:** cuando el engine necesite resolver valores de energía para habilidades activas.

---

## OQ-DATA-1 — Materialización de slots por entidad — **ABIERTO (2026-05-25)**
**Dominio:** data / arsenal / engine
**Contexto:** Los slots por entidad (Warframe 8 mods + Aura + Exilus + 2 Arcanos, Melee + Stance, etc.) son información canónica del juego documentada en `docs/domains/ui-ux/slot-reference.md`. Casos especiales como Jade (2 Auras), Sevagoth Shadow, exaltadas y companions modulares requieren modelado explícito. `UpgradeView.tsx` existe como stub (`@status stub`) sin diseño definido del layout de slots.
**Pregunta:** ¿Cómo se materializan estas capacidades en el sistema? Opciones:
- (a) **JSON por entidad** (similar a `archon-shards.json`) — `slot-capabilities.json` indexado por `uniqueName`
- (b) **Constantes/mapeos en código** — en `Project/src/shared/types/` o `Project/src/lib/`
- (c) **Derivado del dataset** de `@wfcd/items` cuando lo expone
- (d) **Híbrido** — baseline en código + overrides por excepción en JSON
**Implicación:** La elección determina si `slot-reference.md` pertenece a `data/rules/`, `data/schemas/`, o vive como referencia canónica sin dominio fijo. **Hoy se mantiene en `docs/domains/ui-ux/` como huérfano explícito** para no pre-cerrar esta decisión.
**Bloquea:** Diseño definitivo de `UpgradeView`; modelado de Jade Aura×2, Sevagoth Shadow, exaltadas, companions modulares.
**Fuente:** `docs/domains/ui-ux/slot-reference.md`

---

## OQ-ENGINE-FUTURE — Features de evolución del motor consideradas pero NO implementadas — **ABIERTO (2026-05-25)**
**Dominio:** engine / simulation-v2
**Contexto:** Durante la fase pre-implementación (abril 2026) se consideraron varias features de evolución que **no entraron al motor inicial** y siguen sin implementarse. Originalmente documentadas en `simulation-pre-implementation.md` §6 (purgado 2026-05-25). Se consolidan aquí para que la pregunta arquitectónica quede visible.

### Features pendientes

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | Mantener API serializable del motor para mover carga pesada de simulación a un Web Worker sin afectar fluidez de la UI | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer acciones del usuario; aprovecha que el motor es puramente funcional y determinista | UX de comparación de builds, debugging |
| **Testing con Gold Standard** | Snapshots de simulación comparados contra resultados esperados de la wiki oficial como tests de integración | Validación de fidelidad matemática |

**Pregunta:** ¿En qué fase del roadmap se priorizan estas features? ¿O son backlog indefinido? Hoy ninguna está implementada ni en el código (`Project/src/core/engine/`) ni en `simulation-roadmap.md`.

**Condición:** cuando la Capa D (Proyección) se materialice y haya un cliente real consumiendo el motor (Arsenal UpgradeView definido).

---

## OQ-DATA-2 — Ubicación de vocabularios que son simultáneamente semantic + data — **ABIERTO (2026-05-25)**
**Dominio:** data / semantic
**Contexto:** Vocabularios como **polaridad** (`semantic/polarity.md`) son simultáneamente:
- **Vocabulario canónico semántico** — 8 tokens (`madurai`, `vazarin`, ..., `omni`) definidos en `Project/src/shared/types/polarity.ts`
- **Estructura de datos** — campos `polarities[]` en `warframes.json`, `polarity` y `polarities[]` en `mods.json`
- **Normalización de pipeline** — `Project/scripts/normalization/polarity.ts` traduce tokens raw del fork (`AP_ATTACK`, `AP_ANY`, etc.) a los canónicos

El doc actualmente vive solo en `docs/semantic/` y **aparece como huérfano** (0 referencias entrantes desde otros .md), aunque el código lo consume vía `shared/types/polarity.ts` + `scripts/normalization/polarity.ts`. Esto es **drift de cobertura documental**: el grafo docs no refleja el grafo de consumo del código.

Otros candidatos al mismo patrón: `semantic/damage-types.md`, `semantic/factions.md`.

**Pregunta:** ¿Cómo se modelan los vocabularios que son a la vez semántica canónica + estructura de datos materializada? Opciones:
- (a) **Solo en `semantic/`** con docs de `data/` linkeando explícitamente cuando lo consumen — convención de link entrante obligatorio
- (b) **Movido a `data/rules/`** porque su contrato de aparición en datasets es la propiedad dominante; `semantic/` queda solo para vocabulario que NO se materializa (si existe tal caso)
- (c) **Duplicación intencional** — entrada corta en `data/rules/` + entrada extensa en `semantic/` con links recíprocos
- (d) **Reescribir `semantic/`** como **índice cruzado** de vocabularios materializados en datos, con cada doc apuntando a su consumidor real en `data/`

**Implicación:** La decisión afecta a los 3 docs actuales de `semantic/` (`damage-types`, `factions`, `polarity`) y la convención para vocabularios futuros (status conditions, faction damage types, etc.).

**Bloquea:** Coherencia del grafo documental con el grafo de código real. Comprensión por agentes IA de que `semantic/` no es info aislada sino consumida masivamente.

**Fuente:** `docs/semantic/polarity.md` (huérfano detectado en auditoría 2026-05-25).
