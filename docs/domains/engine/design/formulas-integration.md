---
Estado: "activo"
Rol: "Estado e integración de formulas/ como SSoT matemático del engine"
Version: "v0.4.1"
Impacto_ID: "E-OQ-FORMULAS"
Fidelidad_Fisica: "Project/src/core/engine/formulas/"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-07-09"
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
> se resolvieron al conectar `crit-base` y `scaling-base`. `procWeightByType` no está duplicado: solo
> lo consume `weapon-status.ts` dentro de `formulas/`.

---

## 3. Inventario (13 archivos)

| Archivo | Contenido | Vocabulario | Estado / acción |
|---|---|---|---|
| `common/crit-base.ts` | crit chance, tier, avg multiplier | agnóstico | ✅ consumido por `AtomicSimulator` |
| `common/scaling-base.ts` | `applyAdditiveBonus`, `round2`, `clamp` | agnóstico | ✅ consumido por `SimulationEngine` |
| `common/status-base.ts` | `PRIMARY_ELEMENTS`, `ELEMENT_COMBINATIONS`, `procWeightByType` | `DamageType` (pre-D-6: "heat", "cold") | migrar vocab a D-6 (§5) |
| `weapon/weapon-crit.ts` | `calculateWeaponCrit` (delega a crit-base) | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-status.ts` | `calculateWeaponStatus` | `DamageType` (pre-D-6) | conectar + migrar vocab |
| `weapon/weapon-multishot.ts` | `calculateMultishot`, `beamTickScaleFactor` | agnóstico | conectar cuando C2 tenga consumidor |
| `weapon/weapon-condition-overload.ts` | `applyConditionOverload`, `coBonusPct` | agnóstico | ✅ `coBonusPct` consumido por `SimulationEngine` (§4); `applyConditionOverload` reservado para C2 |
| `weapon/melee-combo.ts` | `meleeComboMult` (combo melee heavy) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `weapon/sniper-combo.ts` | `sniperComboMult` (combo sniper) | agnóstico | ✅ consumido por `SimulationEngine`/`StaticHydrator` |
| `enemy/enemy-scaling.ts` | `scaleHealth`, `scaleArmor`, `scaleMult` + coefs curva-S | agnóstico (`faction: string`) | ✅ consumido por `EnemyRepository.scale` (orquestador); **movido de `EnemyRepository` (P1, 2026-07-09)** |
| `enemy/armor-mitigation.ts` | `damageReductionFromArmor` (√3a/100) | agnóstico | movido de `EnemyRepository` (P1); ⚠️ **migrar a scope `entity/`** con 2º consumidor DR (player/companion) — ver §7 |
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

## 5. Vocabulario D-6 en `status-base`

`status-base.ts` (y las fórmulas que lo usan) hablan `DamageType` pre-D-6 ("heat", "cold"). Hay dos
`PRIMARY_ELEMENTS` paralelos: `formulas/common/status-base.ts` (`Set<DamageType>`) y
`contracts/damage-logic.ts` (`string[]` con tokens D-6). A largo plazo hay una sola SSoT. Opciones:

- **A** — migrar `status-base.ts` a tokens D-6 (rompe las ability formulas que usan `DamageType`).
- **B** — adapter en la frontera `formulas/` ↔ consumidor.
- **C** — mantener `DamageType` para ability formulas y `damage-logic.ts` para el engine.

Bloquea la conexión de `weapon-status`. Decisión de vocabulario pendiente (relacionada con el proc
vocabulary de `EnemyState`, ya resuelto por otro eje — ver `../../../data/decisions.md`).

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
