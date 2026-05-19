---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.4.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-05-19"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

---

## OQ-STATE-1 — Contrato de estado del usuario — **CERRADO (2026-05-19)**
**Dominio:** integration / state
**Decisión:** `EnsembleIntention` (EnsembleStore) es el SSoT canónico de estado del usuario en la UI. `LoadoutState` sobrevive únicamente como formato interno del `EnsembleAdapter` (vía legacy para dev/test). `LoadoutContext` (React context + `useReducer`) ha sido eliminado físicamente.
**Justificación:** `LoadoutProvider` no estaba montado en ningún árbol React. La vía legacy de `EnsembleAdapter.toEnsemble(LoadoutState)` se retiene para herramientas de desarrollo y tests del motor. Multi-config (A/B/C) se difiere a una fase posterior. `environment` (targetLevel, targetFaction, isSteelPath) permanece en `EnsembleIntention`.
**Desbloquea:** OQ-STATE-2, OQ-STATE-3, OQ-STATE-4

## OQ-STATE-2 — Conexión Arsenal → Motor — **CERRADO (2026-05-19)**
**Dominio:** integration / arsenal
**Decisión:**
- Flujo de escritura: `ArsenalSwapView` → `EnsembleStore.setItem()` (equip item). `UpgradeView` → `EnsembleStore.setMod()` (equip mod). `ArchonShardSelectionView` → `EnsembleStore.setShard()` (archon shards — ahora en `EnsembleIntention`).
- Flujo de lectura: `UpgradeView` consume `useSimulation()` → `SimulationResult.entities` con lookup estable por `entity.channel`.
- Arsenal metadata visual (incarnon, focus, parazon, companion, vehicles) permanece en `use-arsenal-stub-state` hasta que se resuelvan OQ-ENGINE-2/4.
- Config A/B/C existe en `ArsenalContext` como UI-only hasta que multi-config sea implementado.
**Depende de:** OQ-STATE-1 ✅

## OQ-STATE-3 — Ciclo de vida de LoadoutContext — **CERRADO (2026-05-19)**
**Dominio:** integration / providers
**Decisión:** `LoadoutContext` (React context + `useReducer` + `LoadoutProvider`) eliminado físicamente. `LoadoutState` (tipo + funciones en `loadout.ts`) se conserva como formato interno del `EnsembleAdapter`. El drift documentado en OQ-2 queda resuelto en código.
**Depende de:** OQ-STATE-1 ✅

## OQ-STATE-4 — Rol de EnsembleAdapter en la arquitectura final — **CERRADO (2026-05-19)**
**Dominio:** integration / engine
**Decisión:** `EnsembleAdapter` eliminado como clase pública. Su lógica fue absorbida por `MutatorBridge` como métodos privados (`ensembleFromIntention`, `ensembleFromLoadout`). `MutatorBridge` es el único punto de entrada al motor. La vía legacy (`simulate(LoadoutState)`) se conserva como método interno para herramientas de desarrollo y tests headless.
**Depende de:** OQ-STATE-1 ✅ OQ-STATE-2 ✅

---

## OQ-ENGINE-1 — Patrón WEAPON_DAMAGE como multiplicador global — **ABIERTO (2026-05-18)**
**Dominio:** engine / architecture
**Contexto:** `StaticHydrator` inyecta un nodo `WEAPON_DAMAGE` (base 100) en toda entidad. `calculateCurrentValue()` aplica `WEAPON_DAMAGE.final / 100` como multiplicador implícito a todos los `damage_*` nodos. Mods como Serration hacen `ADD` a `WEAPON_DAMAGE`, no a cada tipo de daño individualmente. Este patrón no está documentado en `simulation-architecture.md`.
**Pregunta:** ¿Es la arquitectura definitiva o un hack temporal? Si es definitiva, documentar. Si no, ¿cuál es el modelo correcto (Serration aplica como `MULTIPLICATIVE` en cada `damage_*`)?
**Fuente:** `docs/domains/engine/sim-v2-audit.md §4.1`

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **ABIERTO (2026-05-18)**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.
**Fuente:** `docs/domains/engine/sim-v2-audit.md §2.4`

## OQ-ENGINE-3 — Label parsing para tipo elemental en ModRepository — **ABIERTO (2026-05-18)**
**Dominio:** engine / data-pipeline
**Contexto:** `ModRepository.getModifiers()` detecta el tipo elemental de un mod buscando el nombre del elemento en `stat.label` (campo de texto libre). Un cambio en el texto del override JSON rompería la resolución silenciosamente.
**Pregunta:** ¿Se agrega un campo explícito `element_type` al schema `ModStat` en el override JSON? Ver `docs/domains/data/mods/mods-schema.md`.
**Fuente:** `docs/domains/engine/sim-v2-audit.md §4.3`

## OQ-ENGINE-4 — DNA Mutation (Archon Shards, Helminth) — ¿Cuándo? — **ABIERTO (2026-05-18)**
**Dominio:** engine / layer-B
**Contexto:** El diseño pone la mutación de ADN en la Capa B (MutatorBridge): antes de emitir el ensemble hidratado, se aplican Archon Shards y Helminth directamente sobre los valores base. La implementación tiene `shards: []` y `helminth: undefined` hardcodeados en `EnsembleAdapter`. No está cubierto en las fases del roadmap (Fase 6 tampoco lo menciona explícitamente).
**Pregunta:** ¿En qué Fase del roadmap se implementa? ¿Bloquea algo antes de Fase 8?
**Fuente:** `docs/domains/engine/sim-v2-audit.md §3`

---

## OQ-2 - Rol del LoadoutProvider y Agnosticismo Real — **CERRADO (2026-04-21) / DRIFT DETECTADO (2026-05-18)**
**Solución declarada:** Se abandona el `LoadoutProvider` como gestor de cálculo. La arquitectura **Sim-v2** introduce el **Mutator Bridge** y el **Engine Agnóstico**. El estado es ahora una **Ensemble Store** serializable.
**Referencia:** `docs/design/sim-v2/OMNIFRAME_SIMULATION_ARCHITECTURE.md`
**⚠️ Drift (2026-05-18):** La decisión fue documentada pero no implementada. `LoadoutProvider` existe físicamente con referencias activas. Ver OQ-STATE-3.

## OQ-5 - Punto de migracion de hidratacion a build time
**Estado:** **ABIERTO**
**Dominio:** integración / data
**Pregunta:** ¿Cuándo deja de vivir la hidratación de habilidades en runtime y pasa al pipeline de build?
**Impacto:** Afecta performance del engine y fidelidad de los datos.

## OQ-12 - Definicion del contrato de Proyección (B4) — **CERRADO (2026-04-21)**
**Solución:** El contrato de salida es un **Projection Snapshot** inmutable y serializable. La reactividad se maneja mediante un **Selective UI Reactive Bridge** externo al motor.
**Referencia:** `docs/design/sim-v2/OMNIFRAME_SIMULATION_CONTRACTS.md`

## OQ-13 - Frontera de calculo entre Arsenal y Builder — **CERRADO (2026-04-21)**
**Solución:** No hay frontera de cálculo. Ambos consumen el mismo **Engine Sim-v2**. La diferencia radica únicamente en el **Simulation Context** inyectado (Target vs Baseline).
