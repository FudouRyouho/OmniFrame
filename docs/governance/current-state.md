---
Estado: "referencia"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-17"
---

# OmniFrame — Estado Actual

Este documento describe el **estado físico y funcional actual** de `Project/src/` — un snapshot, no un registro histórico. La narrativa de sesiones vive en git + las memorias del proyecto; aquí solo el pulso vigente.

**Modelo arquitectónico:** ver [`../domains/engine/design/simulation-architecture.md`](../domains/engine/design/simulation-architecture.md) para el modelo de 5 capas (A / B / C1 / C2 / D, acordado 2026-05-19) — estructura física, arquitectura conceptual y principios de comunicación entre capas.

**Trazado de daño (2026-07-08, cambio de visión — `simulation-architecture.md §2.0`):** el ciclo de vida de una instancia de daño se consolidó como visión de arquitectura — `① NACE → ② COMPONE-TRAYECTO → ③ RESUELVE-VS-TARGET`, **source-agnostic**, reconciliando facetas antes dispersas (§2.1/2.5/2.6/2.7). Principio: **desacople emergente, no capas preventivas**. (Actualización 2026-07-16: la resolución ③ se extrajo a `resolveDamageEvent` (2026-07-12/13) — `resolveHit` es hoy un fan-out por tipo, ya no el colapso ②③; el drift restante es `simulateAttack` god-function, ver `simulation-architecture §2.0`.)

**La Instancia como objeto (2026-07-15, `simulation-architecture.md §2.0.1`):** el trazado se cristaliza en **un objeto Instancia construido una vez en el seam C1→C2**, consumido por los proyectores de C2 (hoy re-derivado 3× desde `attributes` — el drift raíz; `HitContext` es ese objeto medio nacido). Principio **C1 COMPONE, C2 REALIZA** (C2 consume la salida de C1, no re-compone; D consume la **historia** del ciclo de vida). **Tres entradas:** Instancia (átomo per-evento) · Schedule (cadencia) · Target (③). Consecuencias: la Instancia target-agnóstica **ya habilitó** la separación ②③ (③ vive en `resolveDamageEvent`, extraído 2026-07-12/13 — el split ya estaba en el código; el drift restante es `simulateAttack` god-function + paradigma, gated, ver `decision-frontier §4`); aparece el **contrato C1→C2** (emitir rico para consumo de C2, simétrico a `OQ-ENGINE-8`); único hueco estructural abierto = el **`source-state` vivo** (próximo cimiento; propuesta 2026-07-15 = `NeutralState` base del que derivan los estados por nodo, consumidor-puente `warframe→weapon→enemy`/Rhino+Roar — `decision-frontier §4`). Relectura del catálogo: la mayoría de las deudas del motor son **una sola deuda conceptual** que el objeto disuelve; la "clase de re-composición" se consolidó en **una** (source-state) — `OQ-ENGINE-2` profile-switch salió de ella (re-scopeada: cómputo estático por perfil). Diseño en `decision-frontier §4`; bajada a SSoT hecha, código pendiente (Stage 1).

**Nodo-source — hipótesis de trabajo (2026-07-16, `arch-decisions.md §15`):** el `source-state` vivo se enmarca en un concepto más amplio, aún **prototipo (concepto general sin construir; primer eslabón validado con dato en 1a)**: toda fuente (arma/habilidad/minion/objeto) es un **nodo-source** que hace {emite-instancia · muta-state · sub-source}; ② y ③ serían la misma operación (derivar-contra-un-state) en source vs target. **"¿Qué es una habilidad?"** = un nodo-source, no un modelo aparte. Plan de implementación por fases con checkpoints (`.working/ability-model-debate.md §9`): Fase 1a = derive cross-entity source-state (test Rhino+Roar, sintético) → 1b = `AbilityRepository` de un verbo (dato real) → 2 = corpus keyed-por-verbo → 3 = emite-instancia (generaliza `deriveInstance`). Gates `NeutralState` base (G-b) / recursión (G-c) = nombrados, no construidos.
**Derive cross-entity source→target — Fase 1a:** campo nuevo **`source_entity?: EntityId` en `ModifierBase`** (`contracts/primitives.ts`) — un modifier puede escalar leyendo un atributo de **OTRA entidad** (arista del grafo, extiende `source_attribute` de intra- a cross-entidad; `SimulationEngine.rebuildGraph`/`resolveNode`). Primer consumidor: **Roar sintético** (warframe strength → pool de facción del arma, `rhino.test.ts` fixture_03/04, HIT vs `Roar.md` al decimal). Colateral: la arista `pool-global→daño-token` (§16) pasó a **estructural** (antes gateada por-modifier, dependía del orden de inserción — se rompía cuando facción entra por la arista cross-entity; bug latente que 1b habría heredado). ⚠️ **Nombre provisional:** este concepto (source-state, entidad-de-estado, el derive entre entidades) se agrupa tentativamente como **`*-state` / `state-entity`** — la denominación definitiva **se resolverá puntualmente más adelante**.
**Composición de daño → primitivas (Fase 0.5):** la composición reimplementaba fórmulas inline en vez de orquestar `formulas/*` (deuda `formulas-integration`). Campaña close_drift: combinación elemental **deduplicada** (1 SSoT, la de `formulas/common/status-base`); acumulador + `globalDamageBucketFactor` extraídos (`formulas/weapon/stat-accumulator`, renombra el engañoso `globalDmgMult`); DoT base (`formulas/status/dot-base-scaling::scaleDotBase`, reusa el mismo factor); DPS Arsenal (`formulas/weapon/dps`) + EHP (`formulas/enemy/ehp`). **Modelo de pools de daño = `arch-decisions §16`** (aditivo + facción, suman-dentro·multiplican-afuera; reusan `globalDamageBucketFactor`). **Facción resultó `C2·F`** (gate depende de la facción del target, que vive en `EnemyState`/③, NO en el grafo C1) → **shim FLAGGED** (`ModRepository.C2F_FACTION_TOKENS_DEFERRED`, borrar al normalizar la semántica del token); pool C1 de facción queda para bonos **incondicionales** (Roar, §15/1a).



---

## 1. Estructura física (`Project/src/`)

### Núcleo del motor

| Ruta | Estado | Descripción |
|---|---|---|
| `core/engine/loadout.ts` | **ELIMINADO (2026-05-21)** | `LoadoutState` y `LoadoutIntent` eliminados junto con la vía legacy de `MutatorBridge`. |
| `core/engine/formulas/` | **SSoT matemático pretendido — parcialmente integrado** | **NO está vacío:** 20 archivos con matemática real — `common/{crit-base,scaling-base,status-base}`, `status/{stack-debuff,proc-selection,dot-tick,dot-timeline,proc-population,dot-population,behaviors,effect-behavior}` (2026-07-10/11, Familia A + selección de proc + valor de tick DoT/Familia C + superposición de pulsos declarados + eje Población/RNG, `arch-decisions §14` + `damage-status-model §Modelo de timeline`/`§Población/RNG`), `weapon/{weapon-crit,weapon-multishot,weapon-condition-overload,melee-combo,sniper-combo}`, `enemy/{enemy-scaling,armor-mitigation}`, `ability/{ability-crit,ability-status}`. El principio (arch `simulation-architecture §C1`): `formulas/` = matemática pura que `resolution/`+`combat/` deben *orquestar*. **Deuda conocida:** durante v2 el motor reimplementó matemática inline en vez de consumir `formulas/` → dos sistemas paralelos. **Integrado:** `crit-base` ← `AtomicSimulator`, `scaling-base` + `weapon-condition-overload` (`coBonusPct`) + `weapon/{melee-combo,sniper-combo}` ← `SimulationEngine`, `enemy/{enemy-scaling,armor-mitigation}` ← `EnemyRepository.scale` (orquestador; **P1 2026-07-09: matemática movida de `EnemyRepository`**), **`status/stack-debuff` (Familia A) ← `EnemyState` orquestador (2026-07-10: LEY extraída de `getDamageMultiplier`/`getEffectiveArmor`)**, **`status/{dot-tick,dot-timeline,proc-population,proc-selection}` ← `behaviors`/`EnemyState`/`TimelineSimulator` (modelo unificado de proc, 2026-07-13: los 6 efectos con LEY vía `EFFECT_BEHAVIORS`; cada tick resuelve por `CombatSimulator.resolveDamageEvent`, `as: DamageType` deriva bypass/DR/matriz del canónico — Slash emite `as:'true'`)**. **Sin consumir (código muerto a reconciliar):** `weapon/{weapon-crit,weapon-multishot}`, `status-base` (huérfano salvo vía `proc-selection`) — overlap `chance × peso` **reconciliado (2026-07-16)**: `CombatCalculator.project` ya no reinventa inline (consume `expectedProcEvents`, la ley única) + fix latente de falloff; `weapon-status` **eliminado (2026-07-16)**; ver `design/formulas-integration.md §2`, `status/dot-population` (**huérfano**: el pulso se arma inline en `behaviors`, doble camino — deuda G3), `ability/*`. **Electricity/Gas fuera del behavior-set a propósito** (frontera 3, cadena/nube). Plan y auditoría vivos: [`design/formulas-integration.md`](../domains/engine/design/formulas-integration.md). (`arcane/arcane-core.ts` purgado 2026-06-11, shape stale.) |
| `core/engine/contracts/` | **Activo** | Contratos del motor. Split 2026-06-12: `contracts.ts` (cortes/DTOs) + `primitives.ts` (`AttributeNode`, `Modifier`, `GameLaws`, ids) + barrel `index.ts`; más `damage-logic.ts`, `damage-multipliers.ts`, `mod-overrides.ts`. (`attributes.ts` eliminado en refactor 2026-05-21.) **`Modifier` = discriminated union por `operation`** (2026-07-05, §10): `AccumulatorModifier \| CoModifier \| MeleeComboModifier \| SniperComboModifier` sobre `ModifierBase`; factory `makeModifier` para productores dinámicos. |
| `core/bridge/` (B) + `core/engine/resolve/` (C1) + `core/engine/simulate/` (C2) | **Activo** | Implementación del motor, reorganizada 2026-06-12 (DC-OQ-ENGINE-9): `bridge/MutatorBridge` (B, fuera de engine); `resolve/SimulationEngine` + `resolve/hydration/{StaticHydrator,ModRepository,IncarnonRepository,ArcaneRepository,DnaRepository,DataLoader,DamageCombiner,…}` (C1); `simulate/combat/{CombatCalculator,TimelineSimulator,AtomicSimulator,…}` + `simulate/enemies/` (C2; `StatusEngine` eliminado). `EnsembleAdapter` eliminado (2026-05-19). Contrato de intención: `EnsembleIntention.arcanes` + `Ensemble.{warframe,WeaponIntent}.arcanes` (slot dedicado, hermano de `mods`). |
| `core/intention/ensemble-store.ts` (A1) | **Activo** | `ensembleStore` movido aquí desde `providers/Ensemble/` (2026-06-12). SSoT de intención del usuario; observable agnóstico a React. |
| `core/engine/hooks/` | **PURGADO (2026-06-16)** | El cluster `useSimulation`/`useSimulationMetrics`/`useTimeline` (D reactiva parcial co-ubicada en `@core`) era código muerto — purgado completo (Fase 0 saneamiento). D se cablea vía `useViewModel` (`@providers`), ver §Shared / OQ-ENGINE-9. |
| `core/engine/__tests__-legacy/` | **ELIMINADO** | 12 suites de test purgadas en sesión anterior. |
| `core/engine/__tests__/` | **Activo** | Suites gold standard (Vitest), consumidores derivados del clic. **Cobertura e inventario: [`engine/test/catalog-current.md`](../domains/engine/test/catalog-current.md)** (índice vivo — no duplicar el conteo acá: caduca solo). |

### Providers — Estado de transición

> ⚠️ Esta capa está en transición. Existen DOS sistemas de estado paralelos sin sincronizar.

| Provider | Estado | Descripción |
|---|---|---|
| `providers/Ensemble/` | **Activo — sistema nuevo** | `EnsembleProvider.tsx`: binding React (capa de composición). Importa `@core/intention/ensemble-store` (ruling `@providers→@core` permitido, 2026-06-12). El store en sí (`ensembleStore`, A1) vive ahora en `@core/intention/`; el contrato de intención (`ensemble.types`) en `@shared/types/ensemble.ts`. |
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

La Capa D (Proyección) se materializó como `ViewModelContract` v0 (display-only/C1) en `@shared/view-model` (`project()`), consumido por D1 (`UpgradeView` vía `useViewModel` en `@providers`) y D2 (oráculo `view`). El `useSimulation` que cumplía este rol de forma parcial fue purgado (2026-06-16). Pendiente: i18n/formatter, `metrics`/A2 (C2).

### Dominios de UI

| Ruta | Estado | Descripción |
|---|---|---|
| `domains/arsenal/` | **Stub** | Estado de sesión UI-local en `arsenal-ui-session.ts` + `use-arsenal-ui-session.ts` (`useArsenalUiSession`), tras purga de la mitad `arsenalMetadata` mock (Stage 1) + rename honesto del store (Stage 2) — `DC-OQ-STUB-1`/OQ-UI-2. Intención vía `useEnsemble`. `UpgradeView` sin diseño definido. |
| `domains/equipment/` | **Activo** | Controlador de composición delegado a `@shared`. |
| `domains/hud/` | **Activo** | `Hud`, `HudHeader`, footer por zona (Arsenal, Equipment, Items). |
| `domains/options/` | **Activo** | Vista de opciones. |
| `domains/profile/` | **Activo** | Vista de perfil. |

### Shared

| Ruta | Estado | Descripción |
|---|---|---|
| `shared/data/DataRegistry.ts` | **Activo (UI)** | SSoT de acceso a datos en runtime para la UI. Carga y cachea datasets por tipo con hidratación de imágenes. Comparte el `DataSource` (`BrowserAdapter`, fetch lazy) con el engine desde 2026-07-02; su evolución como *puerto normalizador* ("0") se rastrea en `OQ-DATA-9`. |
| `shared/types/` | **Activo** | 13 módulos de contrato TypeScript: `ability`, `arcane`, `archwing-weapon`, `base`, `companion`, `damage`, `ensemble` (gemelo-de-entrada / cut A, movido desde `providers/Ensemble` 2026-06-12), `mod`, `polarity`, `stats`, `vehicle`, `warframe`, `weapon`. |
| `shared/components/` | **Activo** | Sistema de vistas unificado: cards, specs/detail views, views por entidad, filters/toolbars, navigation, popovers, slots. |
| `shared/hooks/` | **Activo** | `use-items.ts` (data), `use-performance-debug.ts` (debug). |

---

## 2. Gaps pendientes de resolución

| Gap | Estado |
|---|---|
| Arsenal es cliente real del engine | ⚠️ Pendiente — store de arsenal purgado a estado de sesión UI-local honesto (`use-arsenal-ui-session.ts`, Stage 1+2); intención vía `useEnsemble`, pero UpgradeView sin diseño definido |
| Capa D materializada (`C→D→UI`) | 🟡 v0 display-only (C1): `ViewModelContract` + `project()` en `@shared/view-model`, consumido por D2 (oráculo `view`) y D1 (`UpgradeView` vía `useViewModel`). Falta i18n/formatter, `metrics`/A2 (C2) |
| `UpgradeView` importa `@core` directo | ✅ **RESUELTO (2026-06-12)** — consume `ViewModelContract` vía `useViewModel` (`@providers`); ningún dominio importa `@core` |
| Condition Overload / GunCO (daño per status type) | 🟢 **Modo estático COMPLETO (2026-07-04)** — `co_behavior` (resuelto al perfil en `SimulationEntity`) + `CONDITION_OVERLOAD` + `co_factors`; cálculo vía `coBonusPct` (formulas/weapon). **Toda la familia:** mods galvanizados (Savvy/Aptitude/Shot) + 8 perks incarnon + CO melee. 3 buckets (adding/multiplying/none) ejercitados. Contratos: `MutatedDNA.co_behavior` + `SimulationEntity.co_behavior` + `Modifier.co_factors` + `CoBehavior` SSoT `@shared/types/modifier`. **Fix 2026-07-05:** melee resuelve `adding` SIEMPRE (antes el heavy slam AoE caía en `none` gun); CO × heavy slam compone (test). **Diferido:** solo el modo dinámico (N/stacks reales vía `EnemyState`). **Encapsulado (2026-07-04):** ruteo CO extraído de `resolveNode` a `resolveConditionOverload` (unidad cohesiva, refactor puro cero-cambio, suite verde) — Abstracción B; el corpus `condition-scaled` se parte en 3 por composición (gate/escala/exponencial), ver `arch-decisions.md §10`. **Próximo:** generalizar la variable de escala (`status_count_var` → variable arbitraria) + fuente-pasiva (Cedo unique trait), cada uno con su caso/dato. Ver `arch-decisions.md §9`+§10 + `decisions.md` D-17 |
| Melee (estrato 1: hit-base) | 🟡 **Servido (2026-07-04, OQ-ENGINE-14)** — Nikana Prime, 3 perfiles (Normal/Slam/Heavy Slam) resueltos a stat-base por el grafo genérico, **cero cambios al motor** (`kind=melee` solo evita `isWarframe`). Diferido (estrato 2, cada uno con gate): combo, heavy multiplier, mods dedicados, slam-por-distancia (C2) |
| Melee combo (mecánica) | 🟢 **Heavy Slam multiplier COMPLETO (2026-07-05)** — primer consumidor combo→daño. Mecánica **hermana de `CONDITION_OVERLOAD`**: operación de familia `MELEE_COMBO_MULT` + fórmula `melee-combo` (`meleeComboMult`, cap 12x) + `Modifier.melee_combo_factors {count_var}` (variable `melee_combo_count`, nombre melee-específico) + bucket `multiplicative` fijo en perfil `heavy_slam_attack`. **Primer modifier-de-mecánica sintetizado en hidratación** (intrínseco, gate `kind=melee` + perfil `heavy*`; no viene de `ModRepository`). Dato real: 594 = arsenal (combo 0 → ×1) = `@wfcd`; mecánica (c) por tooltip in-game. **Segunda** mecánica encapsulada (con CO) — Abstracción A (capa genérica combo) sigue diferida. **Encapsulación (Abstracción B+A, 2026-07-05):** cascada `if (op)` de `resolveNode` → registro `FAMILY_RESOLVERS` (B); y con la **3ra mecánica (sniper combo, Lanka)** se cerró el TIPO — `Modifier` = **discriminated union por `operation`** (`Accumulator/Co/MeleeCombo/SniperCombo`), factory `makeModifier` para productores dinámicos, `value` muerto eliminado. Agregar mecánica = 1 op + 1 factors + 1 variante + 1 resolver + 1 entrada, compiler-enforced. **Diferido:** heavy-ground (perfil `base` + capa stance), C2 dinámico del counter, validación con enemigo aplicado. Ver `design/melee-combo.md §4.1/§6` + `arch-decisions.md §10` |
| Enemy / target model (C2) | 🟡 **Eje arrancado (2026-07-06) — contraste #0 (escalado) COMPLETO** — `EnemyRepository.scale()` **orquesta** `formulas/enemy/{enemy-scaling,armor-mitigation}` (P1 2026-07-09): curva-S real por facción (health validado exacto contra el calculador del wiki) + floor/cap de armor + `damageReductionFromArmor` (`√3a/100`, **provisional** `OQ-ENGINE-15` — conflicto de 3 vías en la wiki, se resuelve con #1). Arid Butcher (cargado desde `enemies.json`, no fixture), `enemy-scaling.test.ts` valida health/armor/DR/EHP @215. El juego NO muestra HP numérico → el oráculo es el calculador (gadget) hasta #1. **Diferido:** el **consumo** en el pipeline de daño (facción × DR × capa) = contraste **#1** (popup real); shields-scaling, Eximus, Steel Path, Empowered, overguard, affinity (fórmulas capturadas en `enemy-level-scaling.md`, no en el engine); `processDots` ahora itera `EFFECT_BEHAVIORS` (los 6 efectos con LEY); cada tick resuelve vía `CombatSimulator.resolveDamageEvent` (Slash emite `as:'true'` → bypasa matriz③+DR). Electricity/Gas fuera del behavior-set a propósito (frontera 3); N-timers reales de stacks = fidelidad diferida (`OQ-ENGINE-16`). **LEY de status (2026-07-10, `arch-decisions §14`):** Familia A (Infection/Corrosion/Disruption stacks) extraída inline→`formulas/status/stack-debuff.ts`; `EnemyState` = orquestador; **ESTADO keyeado por EFECTO** (contenedor único `Map<StatusEffect,S>`; `EnemyStatusState` retirado con el rediseño). Marco de flujo del daño en `design/damage-flow-model.md`; lo gated (DamageInstance/Arista 2/Familia C/O4-Magnetic) en `decision-frontier.md §4`. **Rediseño de proc (2026-07-13):** los 3 contenedores (`stacks`/`dot_pools`/`active_pulses`) + `StatusEngine` + `dot_key` se reemplazaron por un contenedor único `Map<StatusEffect,S>` + `EffectBehavior` por efecto — **implementado**, SSoT en `design/damage-status-model.md §Modelo unificado de proc`. Residual: `DotType`/`DOT_COEF` sin disolver (deuda G2). **Data (2026-07-08): `Enemy.json` cableado al pipeline** por el puerto "0" (`generate-enemies.mjs` → `enemies.json` 638 → `EnemyRepository.load`, `base_level=override??1`; `*_type` per-clase dropeados = deprecados). **`FACTION_BONUS`** (matriz U36 en `contracts/damage-multipliers.ts`) = modelo vigente de daño-vs-facción, reemplaza el per-clase `DAMAGE_EFFICIENCY` (deprecado); **consumida (2026-07-09)** — `resolveHit` usa `targetFactionMult` (matriz③) + `damageReductionFromArmor` (DR), commiteado (checkpoints 1-2 de la reconciliación, `damage-status-model.md §Reconciliación de resolveHit`). `DAMAGE_EFFICIENCY` queda candidato a sunset (cero consumidores reales) — RED, no ejecutado. **Ojo:** esto es acoplamiento *dentro* de C2; C2 (`combat/`) sigue **fuera** del pipeline de producción (`design/formulas-integration.md §1` — el camino vivo es solo C1) |
| Multi-config builds (A/B/C por entidad) | ⚪ Diferido por prioridad — **NO hay cimiento ausente**: el flujo A→B→C lo proyecta-permitir; se modeló **1-config por simplicidad**. Target *warframe-like* (extensión de A: anidar N config slots compartiendo polaridades + A maneja "cuál activa ahora"; badge A/B/C en `/equipment/*`; **≠** builds-separadas overframe.gg; Profile ≠ builds). Costoso/invasivo en B→C. Ver `OQ-UI-2` |

---

## 3. Preguntas abiertas críticas

El set completo de OQs activas (transversales) vive en [`open-questions.md`](open-questions.md); las cerradas en [`closed-decisions.md`](closed-decisions.md). Ejemplo de OQ crítica de motor todavía sin resolver:

**OQ-ENGINE-2: Profile switching (Incarnon/Alt-fire) — RE-SCOPEADA (2026-07-15)**
El path dinámico (switch en runtime) **no tiene consumidor** en un calculador de builds: se computa cada perfil por separado (dos hidrataciones estáticas). Perks = `Modifier[]` (resuelto, tests). El switch es intención/UI, no runtime del engine. Sale de la clase de re-composición de C1 (esa = `source-state` vivo). Ver `open-questions.md` / `decision-frontier §4`.

---

## 4. Lo que está estable y no debe tocarse

- `core/engine/formulas/` — fórmulas matemáticas probadas
- `core/engine/contracts/` — contratos del motor ratificados
- `shared/types/` — contratos TypeScript del dominio
- `shared/components/` — sistema de vistas unificado
- `shared/data/DataRegistry.ts` — carga de datos en runtime
- `providers/Shell/`, `Menu/`, `Theme/`, `DataState/` — providers de UI estables