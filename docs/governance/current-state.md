---
Estado: "referencia"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Version: "v0.3.0"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-05"
---

# OmniFrame — Estado Actual

Este documento describe el **estado físico y funcional actual** de `Project/src/` — un snapshot, no un registro histórico. La narrativa de sesiones vive en git + las memorias del proyecto; aquí solo el pulso vigente.

**Modelo arquitectónico:** ver [`../domains/engine/design/simulation-architecture.md`](../domains/engine/design/simulation-architecture.md) para el modelo de 5 capas (A / B / C1 / C2 / D, acordado 2026-05-19) — estructura física, arquitectura conceptual y principios de comunicación entre capas.

---

## 1. Estructura física (`Project/src/`)

### Núcleo del motor

| Ruta | Estado | Descripción |
|---|---|---|
| `core/engine/loadout.ts` | **ELIMINADO (2026-05-21)** | `LoadoutState` y `LoadoutIntent` eliminados junto con la vía legacy de `MutatorBridge`. |
| `core/engine/formulas/` | **SSoT matemático pretendido — parcialmente integrado** | **NO está vacío:** 11 archivos con matemática real — `common/{crit-base,scaling-base,status-base}`, `weapon/{weapon-crit,weapon-status,weapon-multishot,weapon-condition-overload,melee-combo,sniper-combo}`, `ability/{ability-crit,ability-status}`. El principio (arch `simulation-architecture §C1`): `formulas/` = matemática pura que `resolution/`+`combat/` deben *orquestar*. **Deuda conocida:** durante v2 el motor reimplementó matemática inline en vez de consumir `formulas/` → dos sistemas paralelos. **Integrado:** `crit-base` ← `AtomicSimulator`, `scaling-base` + `weapon-condition-overload` (`coBonusPct`) + `weapon/melee-combo` (`meleeComboMult`) ← `SimulationEngine`. **Sin consumir (código muerto a reconciliar):** `weapon/{weapon-crit,weapon-status,weapon-multishot}`, `status-base`, `ability/*`. Plan y auditoría vivos: [`design/formulas-integration.md`](../domains/engine/design/formulas-integration.md). (`arcane/arcane-core.ts` purgado 2026-06-11, shape stale.) |
| `core/engine/contracts/` | **Activo** | Contratos del motor. Split 2026-06-12: `contracts.ts` (cortes/DTOs) + `primitives.ts` (`AttributeNode`, `Modifier`, `GameLaws`, ids) + barrel `index.ts`; más `damage-logic.ts`, `damage-multipliers.ts`, `mod-overrides.ts`. (`attributes.ts` eliminado en refactor 2026-05-21.) **`Modifier` = discriminated union por `operation`** (2026-07-05, §10): `AccumulatorModifier \| CoModifier \| MeleeComboModifier \| SniperComboModifier` sobre `ModifierBase`; factory `makeModifier` para productores dinámicos. |
| `core/bridge/` (B) + `core/engine/resolve/` (C1) + `core/engine/simulate/` (C2) | **Activo** | Implementación del motor, reorganizada 2026-06-12 (DC-OQ-ENGINE-9): `bridge/MutatorBridge` (B, fuera de engine); `resolve/SimulationEngine` + `resolve/hydration/{StaticHydrator,ModRepository,IncarnonRepository,ArcaneRepository,DnaRepository,DataLoader,DamageCombiner,…}` (C1); `simulate/combat/{CombatCalculator,StatusEngine,TimelineSimulator,AtomicSimulator,…}` + `simulate/enemies/` (C2). `EnsembleAdapter` eliminado (2026-05-19). Contrato de intención: `EnsembleIntention.arcanes` + `Ensemble.{warframe,WeaponIntent}.arcanes` (slot dedicado, hermano de `mods`). |
| `core/intention/ensemble-store.ts` (A1) | **Activo** | `ensembleStore` movido aquí desde `providers/Ensemble/` (2026-06-12). SSoT de intención del usuario; observable agnóstico a React. |
| `core/engine/hooks/` | **PURGADO (2026-06-16)** | El cluster `useSimulation`/`useSimulationMetrics`/`useTimeline` (D reactiva parcial co-ubicada en `@core`) era código muerto — purgado completo (Fase 0 saneamiento). D se cablea vía `useViewModel` (`@providers`), ver §Shared / OQ-ENGINE-9. |
| `core/engine/__tests__-legacy/` | **ELIMINADO** | 12 suites de test purgadas en sesión anterior. |
| `core/engine/__tests__/` | **Activo** | Suites gold standard (Vitest), consumidores derivados del clic. Cobertura: 8 archivos (Boltor/Cedo/Felarx/Laetum/Lanka + arcano v0 + `co-behavior-resolution` + `cedo-co-static`), 99 passed. La deuda `IncarnonRepository` (lectura `upgrades[]` vs `stats[]` D-18) **resuelta** (Capa 3 cerrada 2026-06-06; el repo lee `stats[]`). Índice vivo: [`engine/test/catalog-current.md`](../domains/engine/test/catalog-current.md). |

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
| Multi-config builds (A/B/C por entidad) | ⚪ Diferido por prioridad — **NO hay cimiento ausente**: el flujo A→B→C lo proyecta-permitir; se modeló **1-config por simplicidad**. Target *warframe-like* (extensión de A: anidar N config slots compartiendo polaridades + A maneja "cuál activa ahora"; badge A/B/C en `/equipment/*`; **≠** builds-separadas overframe.gg; Profile ≠ builds). Costoso/invasivo en B→C. Ver `OQ-UI-2` |

---

## 3. Preguntas abiertas críticas

El set completo de OQs activas (transversales) vive en [`open-questions.md`](open-questions.md); las cerradas en [`closed-decisions.md`](closed-decisions.md). Ejemplo de OQ crítica de motor todavía sin resolver:

**OQ-ENGINE-2: Profile switching (Incarnon/Alt-fire) — ABIERTO**
Re-hidratar todo el ensemble vs. conmutar `active_profile_id` en `resolve()` en runtime.

---

## 4. Lo que está estable y no debe tocarse

- `core/engine/formulas/` — fórmulas matemáticas probadas
- `core/engine/contracts/` — contratos del motor ratificados
- `shared/types/` — contratos TypeScript del dominio
- `shared/components/` — sistema de vistas unificado
- `shared/data/DataRegistry.ts` — carga de datos en runtime
- `providers/Shell/`, `Menu/`, `Theme/`, `DataState/` — providers de UI estables
