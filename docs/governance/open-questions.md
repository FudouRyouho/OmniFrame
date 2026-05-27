---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.4.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-05-27"
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

## OQ-ENGINE-1 — Patrón WEAPON_DAMAGE como multiplicador global — **CERRADO (2026-05-27)**
**Dominio:** engine / architecture
**Decisión:** El patrón es la arquitectura definitiva. `StaticHydrator` inyecta `WEAPON_DAMAGE` (base 100) en toda entidad arma. Mods como Serration hacen `ADD` al pool aditivo de `WEAPON_DAMAGE`. `calculateCurrentValue()` aplica `WEAPON_DAMAGE.final / 100` como multiplicador global a todos los nodos `WEAPON_ADD_*_DAMAGE`. Esto implementa correctamente el stacking aditivo de Warframe: `Base × (1 + ΣSerration + ΣHeavyCal + ...)`, validado en `references/wiki/mechanics/calculating-bonuses.md §Stacking ADITIVO`. No es un hack — es el modelo canónico del juego.
**Validación:** 31 tests gold standard contra valores reales del juego passing (2026-05-27): Aklex Prime + Cedo Prime, incluyendo Hornet Strike (+220%), multishot y crít.
**Fuente:** `docs/domains/engine/engine-audit.md §4.1`, `references/wiki/mechanics/calculating-bonuses.md`

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **ABIERTO (2026-05-18)**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.
**Fuente:** `docs/domains/engine/engine-audit.md §2.4`

## OQ-ENGINE-3 — Label parsing para tipo elemental en ModRepository — **CERRADO (2026-05-27)**
**Dominio:** engine / data-pipeline
**Decisión:** No aplica. La implementación v2 de `ModRepository.getModifiers()` no hace label parsing. Consume `val.upgrade_type` directamente vía `isUpgrade()` + `UPGRADE_MAP` / `resolveToken()`. El tipo elemental ya está declarado en el token D-6 (ej. `WEAPON_ADD_TOXIN_DAMAGE`). El campo `stat.label` existe en el override como texto descriptivo pero no se parsea ni se procesa. El problema documentado en `engine-audit.md §4.3` nunca llegó a producción en la implementación v2.
**Fuente:** `Project/src/core/engine/hydration/ModRepository.ts` línea 43

## OQ-ENGINE-4 — DNA Mutation (Archon Shards, Helminth) — **CERRADO (2026-05-27)**
**Dominio:** engine / layer-B
**Decisión:** Archon Shards implementados en `StaticHydrator.hydrate()` (2026-05-27). El consumer loop lee `ensemble.warframe.shards`, resuelve cada shard vía `ShardRepository.resolve(type, stat, isTau)`, y emite `Modifier` objects con `target_entity` correcta (warframe ID o weapon ID según `resolved.target_channel`). Los Archon Shards siguen el mismo flujo que los mods — son `Modifier` objects, no mutaciones de ADN. Helminth permanece sin implementar (no hay datos de overrides para habilidades de Helminth).
**Arquitectura decidida:** Shards = mods en slots especiales. No requieren schema separado — se procesan en el mismo paso de hidratación que los mods de arma/warframe.
**Refs:** `Project/src/core/engine/hydration/StaticHydrator.ts` líneas 103-127, `Project/src/core/engine/hydration/ShardRepository.ts`

---

## OQ-2 - Rol del LoadoutProvider y Agnosticismo Real — **CERRADO (2026-04-21) / DRIFT DETECTADO (2026-05-18)**
**Solución declarada:** Se abandona el `LoadoutProvider` como gestor de cálculo. La arquitectura **Sim-v2** introduce el **Mutator Bridge** y el **Engine Agnóstico**. El estado es ahora una **Ensemble Store** serializable.
**Referencia:** `docs/domains/engine/design/simulation-architecture.md`
**⚠️ Drift (2026-05-18):** La decisión fue documentada pero no implementada. `LoadoutProvider` existe físicamente con referencias activas. Ver OQ-STATE-3.

## OQ-5 - Punto de migracion de hidratacion a build time — **CERRADO (2026-05-27)**
**Dominio:** integración / data
**Decisión:** No aplica a la arquitectura actual. El engine v2 no tiene "hidratación de habilidades en runtime" como problema. `StaticHydrator` opera con `override JSON` (cargados una sola vez al inicio) + `*Repository` classes — el patrón ya es funcionalmente equivalente a build-time. Los overrides son SSoT estático. No hay nada que migrar. Si en el futuro las habilidades requieren cálculo dinámico de stats (ej. formulas que dependen del nivel del jugador en tiempo real), se abre un nuevo OQ con ese scope concreto.
**Refs:** `Project/src/core/engine/hydration/StaticHydrator.ts`, `Project/src/core/engine/hydration/ItemRepository.ts`

## OQ-12 - Definicion del contrato de Proyección (B4) — **CERRADO (2026-04-21)**
**Solución:** El contrato de salida es un **Projection Snapshot** inmutable y serializable. La reactividad se maneja mediante un **Selective UI Reactive Bridge** externo al motor.
**Referencia:** `docs/domains/engine/design/simulation-contracts.md`

## OQ-13 - Frontera de calculo entre Arsenal y Builder — **CERRADO (2026-04-21)**
**Solución:** No hay frontera de cálculo. Ambos consumen el mismo **Engine Sim-v2**. La diferencia radica únicamente en el **Simulation Context** inyectado (Target vs Baseline).

---

## OQ-W-4 — Sub-familia en la taxonomía D-6 — **RESUELTO (2026-05-26)**
**Dominio:** data / upgrade-taxonomy
**Resolución:** La convención se extiende a `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`. Condición cumplida: 3 casos en Crimson Archon Shards → `WEAPON_MELEE_ADD_CRIT_MULT`, `WEAPON_PRIMARY_ADD_STATUS_CHANCE`, `WEAPON_SECONDARY_ADD_CRIT_CHANCE`. Sub-familias `WEAPON` activas: `PRIMARY`, `SECONDARY`, `MELEE`. `UPGRADE_MAP` no se extiende con lógica de filtrado — eso es territorio D-7.
**Refs:** `docs/data/decisions.md` §D-6, `shared/types/modifier.ts`, `docs/data/schemas/mods/upgrade-taxonomy.md`

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

## OQ-ENGINE-5 — Fórmulas legacy desconectadas del path canónico — **CERRADO (2026-05-27)**
**Dominio:** engine / formulas
**Resolución:** `weapon-core.ts` y `warframe-core.ts` purgados físicamente (2026-05-27). Verificado que ningún archivo fuera del directorio los importaba. Fase 1 del plan `formulas-integration.md` completada. Adicionalmente, Fase 2 conectó `formulas/common/crit-base.ts` a `AtomicSimulator` y `formulas/common/scaling-base.ts` a `SimulationEngine`, convirtiendo `formulas/` de código muerto a SSoT activo.
**Refs:** `docs/domains/engine/design/formulas-integration.md §Fase 1, Fase 2`

## OQ-ENGINE-6 — WEAPON_FIRE_ITERATIONS no mapeado en UPGRADE_MAP — **CERRADO (2026-05-27)**
**Dominio:** engine / data-pipeline
**Contexto:** 11+ mods de multishot usaban el token `WEAPON_FIRE_ITERATIONS` en `mod-stats.override.json`. Ese token no existía en `UPGRADES` ni en `UPGRADE_MAP`.
**Resolución (Opción A):** Token añadido a `UPGRADES[]` y como alias en `UPGRADE_MAP` → `{ attr: 'WEAPON_ADD_MULTISHOT', op: 'ADD' }` en `shared/types/modifier.ts`. Mods Galvanized Hell, Chamber y Diffusion añadidos manualmente al override (estaban ausentes por bug del pipeline — ver deuda D-PIPELINE-1 abajo).
**Tests que lo cierran:** `__tests__/aklex-prime.test.ts` (Barrel Diffusion 2.2, Lethal Torrent 1.6) y `__tests__/cedo-prime.test.ts` (Galvanized Hell 14.7) — 23/23 passing (2026-05-27).
**Deuda residual D-PIPELINE-1:** El pipeline `generate-mod-overrides.mjs` genera tokens raw de `@wfcd/items` (ej. `WEAPON_CRIT_CHANCE`) en lugar de tokens D-6 (ej. `WEAPON_ADD_CRIT_CHANCE`). El override actual es el backup pre-pipeline más los 3 parches manuales Galvanized. Al regenerar el override con el pipeline se pierden los tokens D-6. Fix pendiente: añadir tabla de traducción `WFCD_TOKEN → D6_TOKEN` en el pipeline antes de escribir el JSON. No es bloqueante mientras no se necesite regenerar el override.
**Refs:** `Project/src/shared/types/modifier.ts`, `Project/public/data/mod-stats.override.json`, `Project/public/data/bk/mod-stats.override.20260527.json`

---

## OQ-ENGINE-FUTURE — Features de evolución del motor consideradas pero NO implementadas — **ABIERTO (2026-05-25)**
**Dominio:** engine / simulation-v2
**Contexto:** Durante la fase pre-implementación (abril 2026) se consideraron varias features de evolución que **no entraron al motor inicial** y siguen sin implementarse. Originalmente documentadas en `simulation-pre-implementation.md` §6 (purgado 2026-05-25). Se consolidan aquí para que la pregunta arquitectónica quede visible.

### Features pendientes

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | Mantener API serializable del motor para mover carga pesada de simulación a un Web Worker sin afectar fluidez de la UI | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer acciones del usuario; aprovecha que el motor es puramente funcional y determinista | UX de comparación de builds, debugging |
| **Testing con Gold Standard** | Snapshots de simulación comparados contra resultados esperados de la wiki oficial como tests de integración | Validación de fidelidad matemática — **ACTIVO (2026-05-27)**: `__tests__/aklex-prime.test.ts` (Aklex Prime, 23 tests) y `__tests__/cedo-prime.test.ts` (Cedo Prime Normal Attack, 8 tests). 31 tests passing contra valores reales del juego, incluyendo multishot (OQ-ENGINE-6 cerrado). |

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

---

## OQ-W-6 — Vocabulary gap: upgrade_by para stats base del warframe — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → taxonomía
**Contexto:** El vocabulario `AbilityUpgradeBy` cubre los 4 stats de habilidad (`AVATAR_ABILITY_STRENGTH/RANGE/DURATION/EFFICIENCY`) y los dos ejes de energía (`ENERGY_COST/DRAIN`). Inaros Scarab Swarm tiene un stat (`Damage: 241`) que escala con Max Health del warframe — un eje de base stat sin token. El `//!` en `Inaros.md` lo registra: `"scale with health, literaly 'vitality' maxed (100% health) affected this number 483"`.
**Pregunta:** ¿Cómo se extiende `upgrade_by` para cubrir stats base del warframe (health, shield, armor)?
- La taxonomía D-6 ya define `AVATAR_ADD_HEALTH_MAX` como token de mod. El principio que se busca es **globalizar la semántica**: el mismo vocabulario `AVATAR_*` debería aplicar.
- Opciones: token completo idéntico al mod (`AVATAR_ADD_HEALTH_MAX`), o forma sin OPERATION (`AVATAR_HEALTH_MAX`) para separar el eje "con qué escala" del eje "qué modifica".
**Condición para resolver:** al resolver la taxonomía general de `upgrade_by` — cuando haya ≥2 casos distintos de base-stat scaling en abilities que justifiquen el patrón. Hoy solo Inaros es caso confirmado.
**Bloquea:** Anotar correctamente Inaros Scarab Swarm. Extensión del vocabulario `AbilityUpgradeBy` en `shared/types/ability.ts`.
**Fuente:** `references/game-ui/Inaros.md` línea `//!`

---

## OQ-W-7 — Double-scaling y semántica especial de upgrade_by — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → engine / formulas
**Contexto:** Dos categorías de edge-cases detectadas en la auditoría del diccionario (2026-05-26):

**A — Double-scaling:** dos abilities tienen un stat que escala simultáneamente con dos modificadores distintos:
- `Gara Mass Vitrify` → `Max Radius: 11m $DURATION $RANGE`
- `Harrow Covenant` → `Energy Conversion: 15% $EFFICIENCY $STRENGTH`
El parser `apply-ability-md.ts` toma solo el primer token y emite `console.warn`. ~~El schema no soporta `upgrade_by[]` (array)~~ — **resuelto 2026-05-26**: `AbilityStatEntry.upgrade_by` ahora acepta `AbilityUpgradeBy | AbilityUpgradeBy[]`; el engine usa `[0]` hasta que exista `formulas/ability/`. Límite activo: engine + fórmula, no schema.

**B — Tokens válidos en contexto no-estándar:**
- `Lavos`: `$EFFICIENCY` → `ENERGY_COST` pero Lavos no tiene pool de energía — `EFFICIENCY` reduce cooldown, no energy cost.
- `Grendel Feast`: `$EFFICIENCY` → `ENERGY_COST` pero el drain es de salud (`<HEAL>`), no de energía.
- `Nidus Virulence`: `$EFFICIENCY` → `ENERGY_COST` con efecto *negativo* — Efficiency reduce el Energy Refund, no el coste. El campo `inverse: true` existe en el schema pero no está anotado.

**Condición para resolver:** cuando se empiece a trabajar con `upgrade_type` (que abre más edge-cases) o al generar tests masivos del engine con datos reales. Estos casos dependen de fórmulas dedicadas por habilidad.
**No bloquea** el pipeline de datos ni el schema actual.
**Fuente:** `references/game-ui/Gara.md`, `references/game-ui/Harrow.md`, `references/game-ui/Lavos.md`, `references/game-ui/Grendel.md`, `references/game-ui/Nidus.md`
