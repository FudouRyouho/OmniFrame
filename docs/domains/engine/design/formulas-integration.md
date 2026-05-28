---
Estado: "activo"
Rol: "Auditoría y plan de integración de formulas/ como SSoT matemático del engine"
Version: "v0.2.0"
Impacto_ID: "E-OQ-FORMULAS"
Fidelidad_Fisica: "Project/src/core/engine/formulas/"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-05-27"  <!-- v0.3.0: Fase 3 redefinida — estabilización C1; DamageCombiner movido a hydration/ -->
Dependencias:
  - "docs/domains/engine/design/simulation-architecture.md"
  - "docs/domains/engine/engine-audit.md"
  - "docs/domains/engine/formula-overview.md"
Dependidos: []
---

# Auditoría: formulas/ como SSoT Matemático del Engine

**Sesión**: 2026-05-27  
**Alcance**: `Project/src/core/engine/formulas/` y su relación con el resto del engine  
**Hallazgo principal**: `formulas/` contiene lógica matemática correcta y bien estructurada que **nunca es consumida** por ningún módulo del engine de producción.

---

## 1. El principio que no se cumplió

La arquitectura en `simulation-architecture.md §C1` establece que el engine debe ser:

> "Motor matemático funcional y determinista. No tiene estado mutable."

El diseño pretendido era:

```
formulas/    → matemática pura, determinista, sin dependencias del engine
hydration/   → traducción de datos crudos → tipos engine
resolution/  → orquesta formulas/ para resolver el grafo
combat/      → orquesta formulas/ para simulación temporal
```

El código en `formulas/` materializa exactamente este principio. El problema: durante la construcción de v2, `resolution/` y `combat/` reimplementaron la matemática inline en lugar de consumir `formulas/`. El resultado es dos sistemas paralelos donde debería haber uno.

---

## 2. Hallazgos de la auditoría (2026-05-27)

### 2.1 formulas/ — Cero consumidores externos *(estado al momento de la auditoría)*

```
grep -rn "from.*engine/formulas" Project/src → (sin resultados)
```

Los 13 archivos de `formulas/` exportan funciones que nadie llama fuera del propio directorio. Son código muerto.

> **⚠️ Resuelto en Fase 2 (2026-05-27):** `crit-base.ts` ← `AtomicSimulator`; `scaling-base.ts` ← `SimulationEngine`. Dos archivos activamente consumidos.

### 2.2 combat/ — Desconectado del pipeline de producción *(estado al momento de la auditoría)*

```
grep -rn "import.*CombatCalculator|TimelineSimulator|CombatSimulator" Project/src
→ solo imports dentro de combat/ entre sí
```

Todo `combat/` era el motor de `SimulationLab.tsx` (eliminado). El pipeline de producción actual es:

```
useSimulation → MutatorBridge → StaticHydrator + SimulationEngine → { entities, engine }
```

`MutatorBridge` nunca llama a `CombatCalculator` ni a `TimelineSimulator`. El engine de producción solo resuelve atributos — no calcula DPS, TTK ni proyecciones de estado.

> **⚠️ Parcialmente resuelto (Fase 3):** `CombatCalculator.project()` ahora tiene consumidor: hook `useSimulationMetrics`. `TimelineSimulator` sigue bloqueado por falta de `ScaledEnemy` con datos escalados.

### 2.3 Duplicación matemática confirmada

| Fórmula | SSoT en formulas/ (sin consumidores) | Copia inline en combat/ |
|---|---|---|
| Multiplicador crit promedio | `crit-base::averageCritMultiplier()` | `AtomicSimulator.calculateAverageMultiplier()` |
| Resolución de tier de crit | `crit-base::resolveCritTier()` | `AtomicSimulator.calculateCritDistribution()` |
| Fórmula aditiva base×bonus | `scaling-base::applyAdditiveBonus()` | inline en `SimulationEngine.calculateCurrentValue()` |
| Pesos de proc por tipo de daño | `status-base::procWeightByType()` | inline en `CombatCalculator.project()` |

El gap no es de corrección — la matemática en `combat/` es mayormente correcta. El gap es de trazabilidad: si una fórmula cambia, hay que actualizar N lugares. Con `formulas/` como SSoT, se actualiza 1.

### 2.4 ~~DamageCombiner — violación de layer boundary~~ — RESUELTO (Fase 3)

~~`DamageCombiner` vive en `combat/` pero es llamado exclusivamente desde `StaticHydrator` (hydration/). Pertenece a `hydration/` o al nivel de `contracts/`.~~

> **Resuelto en Fase 3 (2026-05-27):** `DamageCombiner` movido a `engine/hydration/`. Layer boundary cerrada.

---

## 3. Inventario de formulas/ — Estado y clasificación

| Archivo | Contenido | Estado | Vocabulario | Acción |
|---|---|---|---|---|
| `common/crit-base.ts` | Crit chance, tier, avg multiplier | ✅ Correcto, SSoT real | Agnóstico | ✅ **Conectado (Fase 2)** ← `AtomicSimulator` |
| `common/scaling-base.ts` | applyAdditiveBonus, round2, clamp | ✅ Correcto, SSoT real | Agnóstico | ✅ **Conectado (Fase 2)** ← `SimulationEngine` |
| `common/status-base.ts` | PRIMARY_ELEMENTS, ELEMENT_COMBINATIONS, procWeightByType | ✅ Correcto | DamageType (vocab antiguo: "heat", "cold") | Migrar a D-6 en Fase 4 |
| ~~`weapon/weapon-core.ts`~~ | ~~calculateWeaponStats~~ | ~~⚠️ D-3 legacy~~ | ~~D-3~~ | ✅ **PURGADO (Fase 1)** |
| ~~`warframe/warframe-core.ts`~~ | ~~calculateWarframeStats~~ | ~~⚠️ D-3 legacy~~ | ~~D-3~~ | ✅ **PURGADO (Fase 1)** — directorio eliminado |
| `weapon/weapon-crit.ts` | calculateWeaponCrit delegando a crit-base | ✅ Correcto | Agnóstico | Evaluar en Fase 3 |
| `weapon/weapon-status.ts` | calculateWeaponStatus | ✅ Correcto | DamageType (antiguo) | Migrar en Fase 4 |
| `weapon/weapon-multishot.ts` | calculateMultishot, beamTickScaleFactor | ✅ Correcto | Agnóstico | Conectar en Fase 3 |
| `weapon/weapon-condition-overload.ts` | applyConditionOverload (CO/Galvanized) | ✅ Correcto | Agnóstico | Integrar cuando CO sea feature |
| `arcane/arcane-core.ts` | collectArcaneBonuses | ⚠️ Bloqueado por override JSON | Agnóstico | Defer hasta Fase 5 |
| `ability/ability-crit.ts` | calculateGyreCrit, hasAbilityCritException | ✅ Bien documentado | Agnóstico | Integrar con Ability System |
| `ability/ability-status.ts` | describeAbilityStatus, formatAbilityStatusLabel | ✅ Bien documentado | DamageType | Integrar con Ability System |

---

## 4. Plan de integración iterativo

**Principio**: no reescribir, conectar. El código de `formulas/` es correcto — el trabajo es reemplazar las copias inline por llamadas a `formulas/`.

### Fase 1 — Purga D-3 (GREEN, cero riesgo) ✅ 2026-05-27

Eliminar los únicos dos archivos con tokens pre-D-6:

- [x] Purgar `formulas/weapon/weapon-core.ts`
- [x] Purgar `formulas/warframe/warframe-core.ts`

### Fase 2 — Conectar formulas/common a combat/ y resolution/ (GREEN) ✅ 2026-05-27

- [x] `AtomicSimulator.calculateAverageMultiplier()` → `crit-base::averageCritMultiplier()`
- [x] `AtomicSimulator.calculateCritDistribution()` → `crit-base::resolveCritTier()`
- [x] `AtomicSimulator.rollPellets()` → eliminada la duplicación inline de tier logic
- [x] `SimulationEngine.calculateCurrentValue()` → `scaling-base::applyAdditiveBonus()`
- [x] `tsc --noEmit` limpio en todos los pasos

**Consumidores activos de formulas/ tras Fase 2:**
- `crit-base.ts` ← `AtomicSimulator` (combat/)
- `scaling-base.ts` ← `AtomicSimulator` (vía weapon-crit imports), `SimulationEngine` (resolution/)

### Fase 3 — Estabilización C1 antes de avanzar a combat/ (DECISIÓN 2026-05-27)

**Decisión:** No avanzar a C2/C3/C4 hasta que C1 esté estable y con cobertura de datos suficiente. Razón: cada capa depende de los atributos resueltos por C1 — sin formulas, overrides y mods correctos, las capas superiores propagan errores silenciosamente.

**Estado actual de C2:**
- `CombatCalculator.project()` ya tiene consumidor: `useSimulationMetrics` hook (Opción B implementada)
- `TimelineSimulator` bloqueado: requiere `ScaledEnemy` con health/armor/faction escalados — datos no disponibles en pipeline
- No hay urgencia de wiring adicional

**Pre-condiciones para avanzar a C2/C3 activamente:**
- Arcanos modelados en override JSON (`arcane-stats.override.json` — Fase 5)
- ~~Evoluciones Incarnon mapeadas en `EnsembleIntention` + pipeline de hydration~~ → **Completado (2026-05-27):** `IncarnonRepository` + `incarnon-evolutions.override.json` (85 armas, tokens `WEAPON_BASE_*`)
- Cobertura de mods al ≥70-80% en override
- Tests C1 cubriendo los casos de la capa de formulas (status, multishot, elemental combine)

**Tareas completadas en esta fase:**
- [x] `DamageCombiner` movido de `combat/` a `hydration/` — layer boundary cerrada (2026-05-27)

### Fase 4 — Migrar vocabulario de status-base (YELLOW, medio riesgo)

`status-base.ts` usa `DamageType` ("heat", "cold") — vocabulario pre-D-6. Hay dos `PRIMARY_ELEMENTS` paralelos:
- `formulas/common/status-base.ts::PRIMARY_ELEMENTS` — `Set<DamageType>`
- `contracts/damage-logic.ts::PRIMARY_ELEMENTS` — `string[]` con tokens D-6

A largo plazo hay una sola SSoT. Opciones:
- **A**: Migrar `status-base.ts` a D-6 tokens (rompe las ability formulas que usan DamageType)
- **B**: Agregar un adapter en la frontera entre `formulas/` y `combat/`
- **C**: Mantener `status-base.ts` con DamageType para las ability formulas y usar `contracts/damage-logic.ts` para el engine

*Relacionado con D-7 Fase 3 (proc vocabulary de EnemyState). Debatir en conjunto.*

### Fase 5 — Integrar arcanes y abilities (PENDIENTE de datos)

Bloqueado por:
- `arcane-stats.override.json` no existe todavía
- Diseño del Ability System no está implementado
- Evoluciones Incarnon no mapeadas en EnsembleIntention

*Defer hasta que los datos estén disponibles. No tocar.*

---

## 5. Lo que NO se toca en este plan

- `EnemyState`, `EnemyRepository` — correctos, fuera de scope
- ~~`DamageCombiner` — correcto pero mal ubicado~~ → movido a `hydration/` (2026-05-27) ✅
- `SimulationEngine` — correcto; `calculateCurrentValue()` se refina en Fase 2 cuando haya SSoT estable
- Vocabulary de `EnemyState` proc identifiers (`damage_slash_proc`, etc.) — es D-7 Fase 3

---

## 6. Open Questions generadas

| ID | Pregunta | Bloquea | Estado |
|---|---|---|---|
| OQ-ENGINE-5 | Purgar `weapon-core.ts` y `warframe-core.ts` | Fase 1 | ✅ CERRADO |
| OQ-ENGINE-6 | WEAPON_FIRE_ITERATIONS no mapeado | Fase 1 | ✅ CERRADO |
| OQ-ENGINE-7 | `status-base.ts` migra a D-6 o mantiene DamageType | Fase 4 | ABIERTO |
