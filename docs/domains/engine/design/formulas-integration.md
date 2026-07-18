---
Estado: "referencia"
Rol: "Estado e integración de formulas/ como SSoT matemático del engine"
Impacto_ID: "E-OQ-FORMULAS"
Fidelidad_Fisica: "Project/src/core/engine/formulas/"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-07-16"
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/engine-audit.md"
  - "docs/domains/engine/design/vocabulary.md"
Dependidos: []
---

# formulas/ — SSoT matemático del engine: estado e integración

`core/engine/formulas/` es la **matemática pura** del motor: funciones deterministas, sin estado
ni dependencias del engine. El diseño (`simulation-architecture.md §C1`) es que `resolve/` y
`simulate/combat/` la **orquesten**, no que reimplementen la matemática.

**Deuda estructural:** durante v2, `resolve/` y `combat/` reimplementaron parte de la matemática
inline en vez de consumir `formulas/`. La meta es **conectar, no reescribir** — el código de
`formulas/` es correcto; el trabajo es reemplazar cada copia inline por una llamada.

---

## 1. Consumo actual (estado real)

| Fórmula (`formulas/`) | Consumidor | Estado |
|---|---|---|
| `common/scaling-base::applyAdditiveBonus` | `resolve/SimulationEngine.calculateCurrentValue` | ✅ integrado — **pipeline de producción vivo (C1)** |
| `common/crit-base::{resolveCritTier, averageCritMultiplier}` | `simulate/combat/AtomicSimulator` | ✅ integrado — pero `combat/` está **fuera del pipeline de producción** (ver abajo) |
| resto de `formulas/` | — | sin consumir |

**`combat/` está desconectado del pipeline de producción.** El path vivo es display-only (C1):

```
useViewModel → consume(intention) → MutatorBridge → StaticHydrator + SimulationEngine → { entities }
```

`MutatorBridge` no llama a `CombatCalculator` ni a `TimelineSimulator`. C2 (DPS/TTK/procs) no tiene
consumidor de producción hoy; su modelado se retoma por otro eje (`damage-status-model.md`). Por eso
`AtomicSimulator` consume `crit-base` pero el propio `AtomicSimulator` no está en el path vivo.

---

## 2. Duplicación vigente

**Ninguna.** La única que hubo — CO inline vs. `weapon-condition-overload.ts` (introducida al
implementar el modo estático de CO sin revisar que la fórmula ya existía) — se **reconcilió
(2026-07-04)**: el motor consume `coBonusPct` (SSoT), el enum `CoBehavior` es único en
`@shared/types/modifier`, y `applyConditionOverload` (terminal) queda reservada para C2. Es el
patrón de referencia grafo↔fórmula (ver §4 y `arch-decisions.md §9`).

> Las duplicaciones históricas de crit (`AtomicSimulator`) y escala aditiva (`SimulationEngine`) ya
> se resolvieron al conectar `crit-base` y `scaling-base`.

**Reconciliación (2026-07-16) — `chance × peso` unificado sobre `expectedProcEvents`.** El "3×" era
1 canónica + 1 muerta + 1 inline:
- `status/proc-population.ts::expectedProcEvents` = la **ley única** (usa `procWeightByType`), ya wired
  vía `TimelineSimulator`.
- `CombatCalculator.project` **reconciliado**: el loop inline (`status_map[id] = chance × dmg/total`,
  keyed por token) se reemplazó por `expectedProcEvents(instance.damageByType, instance.statusChance, 0)`
  — ahora ambos proyectores consumen la misma ley, alimentada por la Instancia (seam C1→C2). **Fix de
  paso:** el inline dividía por `total_base_damage` (falloff-scaled) con numeradores crudos → los pesos
  sumaban >1 a `falloff<1`; la ley los deriva de `damageByType` crudo (falloff-independiente, correcto —
  el falloff escala daño, no la chance de proc). `status_map` pasa a keyed por `DamageType`; sin
  consumidor downstream ni test → seguro.
- `weapon-status.ts::calculateWeaponStatus` = **código muerto** (0 llamadores) → **ELIMINADO (2026-07-16)**.

> **SUGERENCIA (trazabilidad, NO ejecutada) — materializar el status-spec en la Instancia.** Hoy ambos
> proyectores derivan el `chance×peso` on-the-fly llamando a `expectedProcEvents(instance.damageByType,…)`.
> Un campo `procWeights`/`statusSpec` materializado **una vez en `deriveInstance`** haría el seam
> **observable/asertable** — un punto de inspección único donde vive el spec, en vez de recomputarse
> transitorio dentro de cada proyector. Motivo = **trazabilidad interna, no caching**: un fallo silencioso
> en la derivación (como el bug de falloff que vivió enterrado en el loop inline de `CombatCalculator`, sin
> artefacto contra el cual contrastar) tendría dónde saltar. **Condición para que valga:** el campo debe ser
> el **único camino** (los proyectores LEEN el campo, no recomputan al lado) — si no, es cache que puede
> driftar y da falsa confianza. Diferido: la derivación on-the-fly funciona; el campo es refinamiento de
> observabilidad del seam, no arquitectura.

---

## 3. Inventario (20 archivos)

| Archivo | Contenido | Vocabulario | Estado / acción |
|---|---|---|---|
| `common/crit-base.ts` | crit chance, tier, avg multiplier | agnóstico | ✅ consumido por `AtomicSimulator` |
| `common/scaling-base.ts` | `applyAdditiveBonus`, `round2`, `clamp` | agnóstico | ✅ consumido por `SimulationEngine` |
| `common/status-base.ts` | `PRIMARY_ELEMENTS`, `ELEMENT_COMBINATIONS`, `procWeightByType` | `DamageType` (pre-D-6: "heat", "cold") | migrar vocab a D-6 (§5) |
| `weapon/weapon-crit.ts` | `calculateWeaponCrit` (delega a crit-base) | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-multishot.ts` | `calculateMultishot`, `beamTickScaleFactor` | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-condition-overload.ts` | `applyConditionOverload`, `coBonusPct` | agnóstico | ✅ `coBonusPct` consumido por `SimulationEngine` (§4); `applyConditionOverload` reservado para C2 |
| `weapon/melee-combo.ts` | `meleeComboMult` (combo melee heavy) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `weapon/sniper-combo.ts` | `sniperComboMult` (combo sniper) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `status/stack-debuff.ts` | Familia A (`stackDebuffValue`, `infectionLaw`/`disruptionLaw`/`corrosionLaw`) | efecto (snake_case: corrosion/infection/ignite/disruption) | ✅ consumido por `EnemyState.getDamageMultiplier`/`getEffectiveArmor` (2026-07-10, `arch-decisions §14`) |
| `status/proc-selection.ts` | `procWeightByType` (LEY de selección, migrada de `common/status-base.ts`) | `DamageType` (D-6) | ✅ **wired** vía `proc-population.ts` ← `TimelineSimulator` + `CombatCalculator` (modelo unificado; overlap `weapon-status` reconciliado + eliminado, §2) |
| `status/dot-tick.ts` | `dotTickValue`, valor de un tick DoT (Familia C, parte no-faction/no-timeline) | `DotType` (⊂ `DamageType`, sin disolver — deuda G2) | ✅ **wired** vía `behaviors` (bleed/poison/ignite computan `tickValue`); `StatusEngine.projectHeatTick` **eliminado** con el rediseño |
| `status/dot-timeline.ts` | `tickTimes` — usado por el `advance` de los DoT behaviors; `pulseTotal`/`damageInWindow` aún sin consumidor de producción | `DotPulse` | ✅ **wired** — `behaviors.makeDotBehavior` (bleed/poison) usa `tickTimes` en su `advance`; Electricity/Gas fuera a propósito (frontera 3) |
| `status/proc-population.ts` | `expectedProcEvents` — generador de eventos esperados (Población/RNG) | `ProcEvent`/`DamageType` | ✅ **wired** ← `TimelineSimulator` + **`CombatCalculator.project`** (2026-07-16, la ley única de `chance×peso`); overlap con `weapon-status.ts` **reconciliado** (ver §2) |
| `status/dot-population.ts` | `dotPulseFromProcEvent` — glue `ProcEvent → DotPulse` pre-escalado | `DotPulse` | ⚠️ **huérfano** — `behaviors.makeDotBehavior` arma el pulso inline; solo test-consumido (doble camino, deuda G3) |
| `status/effect-behavior.ts` | `EffectBehavior<S>` (interfaz del modelo unificado) + `HitContext`/`Resolucion`/`ResolutionModifier`/`Layer` | `StatusEffect`/`DamageType` | ✅ **wired** — contrato consumido por `behaviors` + `EnemyState` (rediseño) |
| `status/behaviors.ts` | fórmulas-estrategia por efecto + registro `EFFECT_BEHAVIORS` (reusa `dot-tick`/`dot-timeline`/`stack-debuff`) | `StatusEffect`/`DamageType` | ✅ **wired** ← `EnemyState` itera (los 6 efectos con LEY) |
| `enemy/enemy-scaling.ts` | `scaleHealth`, `scaleArmor`, `scaleMult` + coefs curva-S | agnóstico (`faction: string`) | ✅ consumido por `EnemyRepository.scale` (orquestador); **movido de `EnemyRepository` (P1, 2026-07-09)** |
| `enemy/armor-mitigation.ts` | `damageReductionFromArmor` (√3a/100) | agnóstico | ✅ consumido por `resolveHit` (2026-07-09, checkpoint 2 de la reconciliación) además de `EnemyRepository.scale`; ⚠️ **migrar a scope `entity/`** con 2º consumidor DR (player/companion) — ver §7 |
| `ability/ability-crit.ts` | `calculateGyreCrit`, `hasAbilityCritException` | agnóstico | integrar con Ability System (inexistente) |
| `ability/ability-status.ts` | `describeAbilityStatus`, `formatAbilityStatusLabel` | `DamageType` | integrar con Ability System (inexistente) |

`enemy/` es el primer scope de **entidad-target** (el resto son `common` agnóstico + fuentes del
atacante: `weapon`/`ability`). Las tablas de coeficientes de la curva-S se co-locan con su ley (son
parámetros intrínsecos, no datos de un dominio externo — mismo criterio que `status-base`).

---

## 4. Patrón de referencia: cómo el grafo consume una fórmula (CO, resuelto 2026-07-04)

CO es el ejemplo canónico de integración grafo↔fórmula, útil como molde para las pendientes. La
tensión: `applyConditionOverload` es una **fórmula terminal** (recibe daño base + aditivos +
behavior, devuelve daño final), mientras el grafo de `SimulationEngine` es **bucket-incremental**.
No encaja como `applyAdditiveBonus` (primitiva componible de un paso).

La resolución partió la fórmula en dos niveles y consumió solo el que sirve al grafo C1:

- **`coBonusPct(mod, N)` — primitiva** (`perStatusBonus × stacks × N`): el grafo la consume
  (reemplazó el `Π` inline). Componible.
- **`applyConditionOverload(...)` — fórmula terminal**: reservada para C2/combat (daño cerrado); el
  grafo de buckets **no** la llama.
- El **ruteo de bucket** (`adding`→`mods_add_pct` / `multiplying`→`multiplicative` / `none`→no
  aplica) es responsabilidad del grafo (`co_behavior` de la entidad), no de la fórmula.

Además se cerró el vocabulario duplicado: `CoBehavior` quedó **SSoT única** en
`@shared/types/modifier` (consumida por el contrato del engine y por la fórmula pura). La primera
versión usaba un `CONTEXT_SCALE` genérico + `context_variables: string[]` posicional; se reemplazó
por una operation de familia (`CONDITION_OVERLOAD`) con factores nombrados (`co_factors`). Detalle
en `arch-decisions.md §9`.

**Lección para las integraciones pendientes:** una fórmula terminal no se enchufa entera al grafo —
se extrae su primitiva componible; la composición final es del grafo, no de la fórmula.

---

## 5. Vocabulario: token D-6 ↔ `DamageType` canónico

**Dirección resuelta (2026-07-12, trazabilidad del dato):** el vocabulario CANÓNICO de tipos de daño
es `@shared/types/damage.ts` (`DAMAGE_TYPES`/`isDamageType`/`normalizeDamageType`; SSoT =
`docs/semantic/damage-types.md`). El espacio-token del engine (`WEAPON_ADD_*_DAMAGE`) pasa a ser una
**proyección derivada**, no una sombra mantenida a mano:

- `contracts/damage-logic.ts` deriva `WEAPON_DAMAGE_TOKENS` de `DAMAGE_TYPES` y expone el par puro
  invertible `damageTokenFromType`/`damageTypeFromToken`. La tabla `WEAPON_DAMAGE_TOKEN_TO_TYPE`
  (17 entradas) fue **retirada**; `DOT_TYPE_TOKEN` (EnemyState) también (se deriva, `DotType ⊂ DamageType`).
- `ItemRepository.mapDamage` (NACE) consume `normalizeDamageType` (valida + resuelve alias fire→heat) en
  vez del transform a ciegas — una key no-`DamageType` (`cinematic`/`shieldDrain`) ya no genera token
  fantasma que inflaba `damage_sum`.

**Todavía duplicado (Tier C, NO resuelto):** la LEY de combinación elemental y la membresía de familias
siguen codificadas DOS veces, una por espacio, y colapsarlas está entrelazado con la capa de fórmulas
muerta (§6):
- `ELEMENT_COMBINATIONS`/`PRIMARY_ELEMENTS` en `common/status-base.ts` (type-space) — consumidas SOLO
  por `ability-status` (muerta; `weapon-status` eliminado 2026-07-16 — `status-base` queda más huérfano aún).
- `ELEMENTAL_COMBINATIONS`/`PRIMARY_ELEMENTS`/`PHYSICAL_TYPES` en `contracts/damage-logic.ts` +
  `DamageCombiner` (token-space, camino VIVO).

Ambas familias son derivables del `family` del canónico (`DAMAGE_TYPE_DEFINITIONS`). Es debate propio
(qué se hace con la capa muerta), no de pasada.

---

## 6. Bloqueado por datos / sistemas ausentes

- `ability/*` — requiere el Ability System (no implementado).
- Conexión de `weapon-crit` / `weapon-multishot` — requiere un consumidor C2 de producción (hoy
  `combat/` está fuera del pipeline).

---

## 7. Migración pendiente: DR a scope `entity/` (gate = 2º consumidor)

`enemy/armor-mitigation.ts::damageReductionFromArmor` vive bajo `enemy/` sólo porque el único caso
ejercitado hoy es el enemigo (`√3a/100`). Conceptualmente **DR no es enemy-specific**: es una
primitiva del **ciclo de la entidad, indiferente a dónde aplica**. Cuando exista un 2º consumidor
de DR (player `armor/(armor+300)`, companion, …) se verifica si sube a un scope `entity/` derivando
por entidad (`entity → player | enemy | companion`), y si el primitivo debe componer una tabla de
datos intrínseca como los coeficientes de `enemy-scaling`. **Sin framework polimórfico hasta
entonces (YAGNI).** El nombre `damageReductionFromArmor` se conserva por ahora.

---

## 8. Reconciliación de `resolveHit` (Checkpoint 1, 2026-07-09) — nota cruzada

`resolveHit` (`simulate/combat/CombatSimulator.ts`, sigue **fuera** del pipeline de producción, ver §1)
recibió dos checkpoints de reconciliación (2026-07-09):

- **Checkpoint 1** — la matriz ③ (facción×elemento) pasó del lookup muerto `DAMAGE_EFFICIENCY` al
  accessor `targetFactionMult` sobre el dato `FACTION_BONUS` (`contracts/damage-multipliers.ts` — **no**
  `formulas/`, es lookup no cómputo).
- **Checkpoint 2** — la DR pasó de la vieja `netArmor/(netArmor+300)` a `formulas/enemy/
  armor-mitigation.ts::damageReductionFromArmor` (la misma `√3a/100` de P1); el `armorBypass`-por-elemento
  se **sunseteó** (sin evidencia post-U36, artefacto del modelo per-clase muerto).

Detalle completo y evidencia en `damage-status-model.md §Reconciliación de resolveHit`. El pool②/faction²
en DoT ya no cuelga de `StatusEngine` (eliminado): es la **mitad live** del tick del modelo
unificado, gated por `OQ-ENGINE-20` (ver `status.md §Deudas`).
