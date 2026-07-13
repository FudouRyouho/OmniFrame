---
Estado: "activo"
Rol: "Estado e integración de formulas/ como SSoT matemático del engine"
Version: "v0.6.0"
Impacto_ID: "E-OQ-FORMULAS"
Fidelidad_Fisica: "Project/src/core/engine/formulas/"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-07-13"
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/engine-audit.md"
  - "docs/domains/engine/formula-overview.md"
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

**Precisión (2026-07-11, checkpoint 2 de la auditoría retrospectiva Slice 3):** "Ninguna" es cierto
solo para el pipeline de producción (C1). Dentro de `formulas/` + `combat/` (C2, sin consumidor de
producción — ver §1) existen **3 implementaciones paralelas** de `chance × peso` (Población/RNG):
`CombatCalculator.project` (inline, `status_map[id] = status_chance * weight`), `weapon-status.ts::
calculateWeaponStatus` (huérfana), y `status/proc-population.ts::expectedProcEvents` (huérfana,
2026-07-11). Las tres usan `procWeightByType` correctamente o reimplementan su misma matemática —
sin conflicto porque ninguna corre en producción, pero pendiente de reconciliar cuando se ataque
Checkpoint 3 (bucket② en DoT, ver `damage-status-model.md §Reconciliación de resolveHit`).

---

## 3. Inventario (19 archivos)

| Archivo | Contenido | Vocabulario | Estado / acción |
|---|---|---|---|
| `common/crit-base.ts` | crit chance, tier, avg multiplier | agnóstico | ✅ consumido por `AtomicSimulator` |
| `common/scaling-base.ts` | `applyAdditiveBonus`, `round2`, `clamp` | agnóstico | ✅ consumido por `SimulationEngine` |
| `common/status-base.ts` | `PRIMARY_ELEMENTS`, `ELEMENT_COMBINATIONS`, `procWeightByType` | `DamageType` (pre-D-6: "heat", "cold") | migrar vocab a D-6 (§5) |
| `weapon/weapon-crit.ts` | `calculateWeaponCrit` (delega a crit-base) | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-status.ts` | `calculateWeaponStatus` | `DamageType` (pre-D-6) | conectar + migrar vocab; overlap con `status/proc-population.ts` (ver §2) |
| `weapon/weapon-multishot.ts` | `calculateMultishot`, `beamTickScaleFactor` | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-condition-overload.ts` | `applyConditionOverload`, `coBonusPct` | agnóstico | ✅ `coBonusPct` consumido por `SimulationEngine` (§4); `applyConditionOverload` reservado para C2 |
| `weapon/melee-combo.ts` | `meleeComboMult` (combo melee heavy) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `weapon/sniper-combo.ts` | `sniperComboMult` (combo sniper) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `status/stack-debuff.ts` | Familia A (`stackDebuffValue`, `infectionLaw`/`disruptionLaw`/`corrosionLaw`) | efecto (snake_case: corrosion/infection/ignite/disruption) | ✅ consumido por `EnemyState.getDamageMultiplier`/`getEffectiveArmor` (2026-07-10, `arch-decisions §14`) |
| `status/proc-selection.ts` | `procWeightByType` (LEY de selección, migrada de `common/status-base.ts`) | `DamageType` (D-6) | ✅ **wired para Toxin+Slash** (2026-07-12, vía `proc-population.ts` ← `TimelineSimulator`); huérfano aún para el resto (`weapon-status.ts` sigue muerto) |
| `status/dot-tick.ts` | `dotTickValue`, valor de un tick DoT (Familia C, parte no-faction/no-timeline) | `DotType` | ✅ **wired para Toxin+Slash** (`TimelineSimulator` construye `tickValue` por tipo); `StatusEngine.projectHeatTick` sigue reimplementando esto inline, roto (`§Deudas` de `status.md`) — Heat pendiente (frontera 1) |
| `status/dot-timeline.ts` | `tickTimes` — usado por el tick de pulsos activos; `pulseTotal`/`damageInWindow` aún sin consumidor de producción | `DotPulse` | 🟡 **parcial** — `EnemyState.active_pulses` (Toxin+Slash) usa `tickTimes` vía `EnemyState.tickActivePulses`; Heat sigue en `dot_pools` (pool-decay); Electricity/Gas fuera a propósito (frontera 3) |
| `status/proc-population.ts` | `expectedProcEvents` — generador de eventos esperados (Población/RNG) | `ProcEvent`/`DamageType` | ✅ **wired para Toxin+Slash** (2026-07-12) ← `TimelineSimulator`; overlap con `weapon-status.ts` sigue sin reconciliar (ver §2) |
| `status/dot-population.ts` | `dotPulseFromProcEvent` — glue `ProcEvent → DotPulse` pre-escalado | `DotPulse` | ✅ **wired para Toxin+Slash** (2026-07-12) ← `TimelineSimulator` |
| `enemy/enemy-scaling.ts` | `scaleHealth`, `scaleArmor`, `scaleMult` + coefs curva-S | agnóstico (`faction: string`) | ✅ consumido por `EnemyRepository.scale` (orquestador); **movido de `EnemyRepository` (P1, 2026-07-09)** |
| `enemy/armor-mitigation.ts` | `damageReductionFromArmor` (√3a/100) | agnóstico | ✅ consumido por `resolveHit` (`8b014f6`, 2026-07-09, checkpoint 2 de la reconciliación) además de `EnemyRepository.scale`; ⚠️ **migrar a scope `entity/`** con 2º consumidor DR (player/companion) — ver §7 |
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
  por `weapon-status`/`ability-status` (muertas).
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

Detalle completo y evidencia en `damage-status-model.md §Reconciliación de resolveHit`. El bucket② en DoT
(checkpoint 3) queda re-escopeado a documentación — requiere cambiar firma de `StatusEngine.*` +
`CombatCalculator`/`TimelineSimulator`, unidad de trabajo separada.

## 9. Reconciliación de Familia C — Toxin + Slash (2026-07-12) — nota cruzada

> ⚠️ **SUPERSEDED por el rediseño de proc (2026-07-13).** La reconciliación Toxin/Slash (`active_pulses`,
> `resolveDamageInstance`) fue el *camino*; el *target* es el modelo unificado (`damage-status-model.md
> §Modelo unificado de proc`): un contenedor único + `EffectBehavior` por efecto, que absorbe `dot-tick`/
> `dot-timeline`/`stack-debuff` y mata `StatusEngine`/`dot_pools`/`dot_key`. Lo de abajo describe el
> estado intermedio (código actual, pre-rediseño).

Auditoría retrospectiva Slice 3 (`.working/c2-engine-coupling-audit.md`).
`resolveHit` se partió en `resolveDamageInstance` (resuelve UN tipo de daño) + `resolveHit` (itera
tipos, agrega) — el hit directo sigue igual, pero ahora `EnemyState.active_pulses` reusa
`resolveDamageInstance` por tick en vez de reimplementar matriz③/DR una tercera vez.
`dot_pools['damage_toxin_dot'\|'damage_slash_dot']` se retira; `formulas/status/{dot-tick,
dot-timeline,proc-population,dot-population,proc-selection}` quedan **wired** para ambos tipos (ver
§3). Slash agrega `resolveDamageInstance(..., { bypassArmorAndMatrix: true })` — regla de
composición #1 (True), bypasea matriz③+DR pero NO el multiplicador de stack de capa (Viral sigue
amplificando el bleed, confirmado empírico). Heat sigue en `dot_pools` (pool-decay, espera frontera
1); **Electricity/Gas quedan fuera a propósito** — requieren frontera 3 (pulsos que generan pulsos,
`damage-status-model.md §Modelo de timeline`), reconciliar solo el tick sin cadena/nube los dejaría
incompletos. Detalle en `damage-status-model.md §Estado real de EnemyState.ts`. El adapter de
vocabulario D-6↔`DamageType` que esta reconciliación usó (`WEAPON_DAMAGE_TOKEN_TO_TYPE`) fue
**retirado** (2026-07-12): ahora es el transform derivado `damageTypeFromToken` — ver §5.
