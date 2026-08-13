---
Estado: "activo"
Rol: "Estado operativo del motor de simulación"
Impacto_ID: "E-Status"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-08-08"
---

# Engine Status

Estado físico real del motor tras la reestructura de `@core` (`DC-OQ-ENGINE-9`) y la
campaña de saneamiento A+B+C. Modelo de 5 capas
(A / B / C1 / C2 / D): ver [`design/simulation-architecture.md`](design/simulation-architecture.md).

---

## Componentes activos

### Capa A1 — Intención (`core/intention/`)

| Componente | Ruta | Estado |
|---|---|---|
| `ensembleStore` | `core/intention/ensemble-store.ts` | **Activo** — SSoT de intención del usuario; observable agnóstico a React. |

### Capa B — Bridge (`core/bridge/`)

| Componente | Ruta | Estado |
|---|---|---|
| `MutatorBridge` | `core/bridge/MutatorBridge.ts` | **Activo** — orquesta la simulación desde la `Scene`; única ruta `simulateFromScene`. Vive **fuera** de `engine/` (es B, no C). |

### Capa C1 — Hidratación (`engine/resolve/hydration/`)

| Componente | Estado |
|---|---|
| `StaticHydrator` | **Activo** — construye entidades y modifiers desde los participantes **ya poblados** (`MoldedIntent[]`, con su molde puesto por B); consume todos los repositories. No recorre el espacio: eso es de `space.ts` y el molde lo cuelga `MutatorBridge.attachMolds`. |
| `ItemRepository` | **Activo** — **segmentado** (Slice C): Maps `weaponItems`/`warframeItems`, `loadWeapons`/`loadWarframes`, `normalizeWeapon`/`normalizeWarframe`. Emite los nodos de daño como token canónico `WEAPON_ADD_*_DAMAGE`. |
| `ModRepository` | **Activo** — resuelve mods vía `resolveUpgradeEntry()` (helper compartido, Slice A = `isUpgrade` + `UPGRADE_MAP`/`resolveToken`). Dueño de `modOverrides` (Slice D). |
| `ArcaneRepository` | **Activo** — resuelve `arcane-stats.override.json` con rank clamping. |
| `AbilityRepository` | **Activo** — resuelve el verbo **muta-state** de habilidades activas (`ability-stats.override`, `upgrade_type` poblado → `Modifier` cross-entity). Primer caso: Roar. NO pasa por `DamageCombiner` ni el shim C2·F. Ver `arch-decisions §15`. |
| `IncarnonRepository` | **Activo** — resuelve perks Incarnon Genesis leyendo `stats[]` (D-18). |
| `ShardRepository` | **Activo** — Archon Shards; emite `Modifier` con `target_entity`/`target_channel`. |
| `DnaRepository` | **Activo** — passthrough de DNA. |
| `DamageCombiner` | **Activo** — combinación elemental. |
| `DataLoader` | **Activo** — bootstrap central (`isReady()`); carga vía `DataSource` (adapter fetch/import). |

### Capa C1 — Resolución (`engine/resolve/`)

| Componente | Estado |
|---|---|
| `SimulationEngine` | **Activo** — grafo de atributos con topological sort (Kahn, un pass; DAG → punto fijo). Ciclo real → alerta fail-loud (convergencia iterativa = Opción B, diferida). Trace de procedencia **opt-in** (`enableTrace()`/`getTrace()`). |

### Capa C2 — Combate (`engine/simulate/combat/` + `engine/simulate/enemies/`)

| Componente | Estado |
|---|---|
| `CombatCalculator` · `CombatSimulator` | **Activo** |
| `AtomicSimulator` | **Activo** — conectado a `formulas/common/crit-base` |
| `advance.ts` | **Activo** — `advanceAndResolve`: la composición «avanzar → resolver → recibir». Vive fuera del estado a propósito: el contenedor no invoca al resolvedor de lo que él mismo emite. |
| `TimelineSimulator` · `RngProvider` | **Activo** — generación de procs unificada (`expectedProcEvents` → `effectOfDamageType` → `applyProc`); `StatusEngine` **eliminado** (ver Nota C2) |
| `EnemyRepository` · `EnemyState` | **Activo** (`simulate/enemies/`). `EnemyRepository` es catálogo: **carga y búsqueda**, no compone participantes — la curva-S la orquesta el frame-0 (`ItemRepository.normalizeEnemy`) y `damageReductionFromArmor` (`√3a/100`, provisional `OQ-ENGINE-15`) resuelve el hit. `EnemyState` nace de la **entidad resuelta de C1**, así que lo que el escenario compuso encima del enemigo llega al daño. Validado contra el calculador del wiki (`enemy-scaling.test.ts`, contraste #0 del eje enemigo). |

> **El status de C2 usa el modelo unificado de proc:** un contenedor único `Map<StatusEffect, S>` +
> `EffectBehavior` por efecto. `EnemyState` itera el registro `EFFECT_BEHAVIORS`; `resolveDamageEvent`
> deriva las reglas del canónico por `as: DamageType`. Diseño y SSoT en
> [`design/damage-status-model.md §Modelo unificado de proc`](design/damage-status-model.md). Residual:
> `DotType`/`DOT_COEF` sin disolver (deuda G2).
>
> **Nota C2:** los 6 efectos con LEY (bleed/poison/ignite/corrosion/infection/disruption) viven en
> `EFFECT_BEHAVIORS`; `EnemyState.advance` itera cada behavior (decae/expira) y **devuelve** las
> `Resolucion` emitidas — resolverlas es de `simulate/advance.ts`, no del contenedor. Cada emisión
> resuelve por `CombatSimulator.resolveDamageEvent` (mismo camino que un hit directo). Heat
> sobrevive como su propia fórmula (`ignite`: pool + rampa de armor por tiempo), no como contenedor
> compartido; Corrosion/Infection/Disruption son behaviors con estado `{count}` + decay (Familia A).
> **Fuera del behavior-set:** Electricity/Gas (frontera 3, emisión multi-target de daño — cadena/nube; NO recursión de procs, descartada in-game 2026-07-14)
> y los efectos sin LEY (puncture/impact/cold/… — no-op). Pool②/faction² del tick = **build-debt**
> (`DC-OQ-ENGINE-13`, gated por poblar el pool②): es contexto que el tick evalúa al emitir. `stacks` de N-timers reales = fidelidad diferida (`OQ-ENGINE-16`). El consumo del
> **objetivo resuelto** en el pipeline de daño (facción × DR × capa) está resuelto: `resolveDamageEvent`/`resolveHit`
> consumen `targetFactionMult` (matriz③) + `damageReductionFromArmor` (DR), ver
> `damage-status-model.md §Reconciliación de resolveHit`. **Ojo:** esto es acoplamiento *dentro* de C2
> (`TimelineSimulator`/`CombatSimulator`) — C2 en sí sigue **fuera** del pipeline de producción
> (`design/formulas-integration.md §1`: el camino vivo es solo C1, `MutatorBridge → SimulationEngine`).
> **Camino de resolución unificado:** `TimelineSimulator.simulateBurst` resuelve el hit directo vía
> `CombatSimulator.simulateAttack` (mismo híbrido atómico/bulk que un ataque suelto). Consecuencia: con
> multishot ≤ `HYBRID_THRESHOLD` (casi toda arma real) el modo es **atómico → timeline estocástico**,
> reproducible por el `RngProvider` inyectado (seed fijo). `simulateBurst` sigue **sin call-sites**
> (latente); quien lo cablee (oráculo CLI → C2) debe seedear el `rng` para salida determinista.

### Salida de C — el "clic" (`engine/output/`)

| Componente | Estado |
|---|---|
| `consume.ts` | **Activo** — superficie de salida de C: `consume(intention).weapon(id).node(...)` (buckets+final) · `.trace(...)` (procedencia) · `snapshot()` (crudo). Consumido por la suite (asertar) y el oráculo CLI (inspeccionar). **No es Capa D.** |

### Entrada compartida (`engine/bootstrap/` + `engine/fixtures/`)

| Componente | Estado |
|---|---|
| `bootstrap/engine-data.ts` | **Activo** — `loadEngineData(source)` async/agnóstico (Slice E). |
| `fixtures/builds.ts` | **Activo** — catálogo de intenciones-fixture (`BUILDS`: lanka/cedo/felarx/laetum/boltor…). |

### Contratos (`engine/contracts/`)

| Archivo | Estado |
|---|---|
| `contracts.ts` | **Activo** — cortes/DTOs. |
| `primitives.ts` | **Activo** — `AttributeNode`, `Modifier`, ids. **`GameLaws` retirado** (§17): los seis parámetros de status viven con su fórmula en `formulas/status/stack-debuff.ts`. |
| `damage-logic.ts` · `damage-multipliers.ts` · `mod-overrides.ts` · `index.ts` (barrel) | **Activo** |
| `layers.ts` | **Activo** — la pila defensiva (`overguard → overshield → shield → health`) y **la tabla de quién la atraviesa, que es de la capa y no del daño**. Declara la LEY; el origen de dos de las cuatro no existe todavía. |

> La Capa D se cablea vía `useViewModel` (`@providers`) + `ViewModelContract`
> (`@shared/view-model`), **fuera** de `@core`.

---

## Fórmulas matemáticas (`engine/formulas/`)

| Carpeta | Archivos activos |
|---|---|
| `common/` | `crit-base` (→ `AtomicSimulator`), `scaling-base`, `status-base` |
| `weapon/` | `weapon-crit`, `weapon-multishot`, `weapon-condition-overload`, `melee-combo`, `sniper-combo` |
| `status/` | `stack-debuff` (**wired** → `behaviors`/`EnemyState`, Familia A), `dot-tick`+`dot-timeline`+`proc-selection`+`proc-population` (**wired** vía `behaviors` → `EnemyState`/`TimelineSimulator`, modelo unificado; los 6 efectos con LEY). `dot-population` es el **único constructor genérico de `evento → ventana`** y no tiene llamador de producción: `behaviors.makeDotBehavior` arma el **mismo** `DotPulse` inline, con el par `(timestamp, expected)` desarmado en `(t, amount)`. La copia es el inline, no el archivo — deuda G3. Electricity/Gas esperan frontera 3 — ver `design/formulas-integration.md §3` |
| `ability/` | `ability-crit`, `ability-status` |
| `arcane/` | **vacío** (reservado) |
| `warframe/` | `armor-mitigation` (DR del Tenno, `a/(a+300)`) — la selección por clase vive en el borde de ③, no acá |

Cada primitiva cita su autoridad matemática en su propio `@SSoT`, apuntando a la fuente real (`references/wiki/mechanics/*`: `critical-hits`, `multishot`, `condition-overload`, `calculating-bonuses`, `armor`, `enemy-level-scaling`…). El **idioma** con el que se describen vive en [`design/vocabulary.md`](design/vocabulary.md); el **estado de integración**, en [`design/formulas-integration.md`](design/formulas-integration.md).

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
| `enemy-state-status-multiplier.test.ts` | C2 — fórmula de multiplicador de stacks Viral/Magnetic + wiring vía `CombatSimulator` |
| `weapon-multishot-resolution.test.ts` | test de datos/regla (integridad override + resolución DNA) |

---

## Deudas de implementación

### El paso de muestreo se filtra al resultado — la fórmula no implementa el criterio que declara

`decayCount(count, dt) = count − (count/6)·dt` (`formulas/status/behaviors.ts`) re-aplica el sangrado
sobre el resultado anterior, así que N pasos chicos ≠ un paso grande. Medido — 10 stacks de corrosión a
los 3 s:

| `dt` | 3.0 | 1.0 | 0.5 | 0.25 | 1/15 | límite `dt→0` |
|---|---|---|---|---|---|---|
| count | 5.0000 | 5.7870 | 5.9329 | 6.0007 | 6.0484 | 6.0653 (`10·e^(−½)`) |

**Ningún paso da la respuesta correcta** — la da el límite. Y no es una decisión de modelado: el propio
código declara el criterio en su constante —*"duración fija del decay **lineal**"*, `DECAY_DURATION = 6.0`—
y la fórmula no lo implementa. Lineal usaría el valor **inicial** como tasa; ésta usa el **actual**:

```
lo declarado   count₀ · (1 − t/6)   → llega a 0 en t=6,  invariante a dt
lo escrito     count₀ · e^(−t/6)    → nunca llega a 0,   depende de dt
```

**Un solo renglón, siete consumidores:** `decayCount` tiene 6 llamadores (corrosion · infection ·
disruption · weakened · freeze · el `ignite` de Heat) y el `pool` de Heat **repite la fórmula inline**
en vez de llamarla. Por eso el mismo error se lee como dos deudas distintas — ésta y la de Heat.

El DoT y la rampa de armor de `ignite`, en cambio, **sí** son invariantes: declaran su ventana en términos
absolutos (`firstTick`, `firstProcTime`) y la muestra sólo pregunta. Las cuatro nociones de "cuándo" que
conviven en el motor, y cuáles cumplen, están tabuladas en el tripwire.

**Tripwire ejecutable:** `__tests__/status/dt-invariance.test.ts` — 2 ✓ (DoT, ignite) + 1 `it.fails` con
los números de arriba + 1 `todo` (el lado source, que no tiene reloj que preguntar).

**Distinto de `OQ-ENGINE-16` y no lo subsume:** aquélla pregunta si un N declarado es *fiel* —cuestión de
dato, gated por medición in-game—; ésta mide que el modelo no es consistente **consigo mismo**, y se
cierra sin dato nuevo. La cura es la misma en los dos casos y por eso conviene no separarlas al ejecutar:
que el estado deje de ser un escalar que sangra y lleve instancias con ventana propia — lo único que
además puede contestar *"cuál es el más viejo"* (`references/ingame-tests/status-stack-caps.md`).

**Vínculo:** [`design/time-model.md`](design/time-model.md) — **el modelo que estas tres deudas
comparten**: el vocabulario (reloj · línea · ventana · anclaje), las cuatro formas del estado y el
corpus de siete mecánicas que las produjo. `design/arch-decisions.md §20` (muestreo, no eventos — la
decisión que esta invariante sostiene), `§19` (el nodo lleva el frame-0, la ley lleva el tiempo),
`OQ-ENGINE-16`.

### 🔴 El reloj del timeline no es el que el corpus decía, y reconstruye los disparos adivinando

`TimelineSimulator` **no** deriva su paso de la cadencia: `step = 0.1` **fijo** es lo que recibe
`processDots`. `timeStep = 1/fireRate` se usa sólo para decidir si hay disparo, y el piso del `ttk`.
Tres cosas se apartan de eso:

- **El disparo se detecta por módulo, con tolerancia.** `currentTime % timeStep < 0.01` sobre un reloj
  que avanza de a `0.1` sólo acierta cuando el período es múltiplo exacto del paso. Medido sobre la
  condición literal, ráfaga de 6 s: `fireRate` 1 · 2 · 2.5 · 5 · 10 → exacto; **3 → 6 de 16** (0.375);
  **7.5 → 13 de 38** (0.342); **12 → 11 de 61** (**0.18**). `total_damage`, `ttk` y `shots_to_kill`
  heredan el faltante.
- **Todo melee corre a `fireRate = 1`.** La lectura es `WEAPON_ADD_FIRE_RATE` fija, con fallback `|| 1`;
  un melee declara `MELEE_ADD_ATTACK_SPEED`. Es **la misma clase de bug que `vitalsOf` ya cerró para los
  vitales** —familia de token leída fija en vez de resuelta por la marca de ruteo del portador— y falla
  igual: a un valor creíble, en silencio. El build del catálogo resuelve `1.62` y se simula a `1.0`.
- **Los dos se tapan entre sí en el único banco que miramos:** como el melee cae a `fireRate = 1` y
  `1/1` sí es múltiplo de `0.1`, el error de módulo no aparece ahí. Ningún test de la suite ve ninguno.

La cura de fondo no es afinar la tolerancia: es que **el disparo declare su instante** en vez de que el
reloj lo adivine — el mismo principio que ya separa lo invariante de lo que no (`§20`, muestreo).

### El efecto de Heat no sabe terminar — y terminar incluye su consecuencia

El armor strip de Heat no es un efecto con ventana: es un **nivel que vive en el portador**, y el proc
sólo elige hacia dónde se mueve. La fuente lo declara como una escalera recorrida en los dos sentidos
(`../../../references/wiki/mechanics/damage-heat-damage.wikitext` §Armor Stripping):

```
sube   15 → 30 → 40 → 50    cada 0.5 s   (2 s de ida)
baja   50 → 40 → 30 → 15 → 0  cada 1.5 s (6 s de vuelta)
```

Mismos cuatro valores, 3× más lento al bajar. **La regla de cierre es leer el nivel, no componer
ventanas:** si un proc nuevo entra a mitad de la vuelta, no cancela nada ni abre nada — el nivel deja
de bajar y sube desde donde está (`… 40 → 30 → [proc] → 40 → 50`). Por eso no hace falta decidir
"quién gana": hay un solo valor. Tres facetas del motor se apartan de eso, medidas con un solo proc en
`t=0` sobre armor base 1000:

| | motor | fuente |
|---|---|---|
| `armor` a `t=60` | **500** (idéntico con `dt=1` y `dt=1/15`) | 1000 — el strip ya revirtió |
| `armor` a `t=1` | 833.33 (16.67% — rampa **lineal**) | 700 (30% — segundo **escalón**) |
| la vuelta | no existe | `50→40→30→15→0` cada 1.5 s |

- **No termina.** El gate es `state.ignite > 0` y `decayCount` es exponencial (`count − (count/6)·dt`):
  vale `1.78e-5` a los 60 s y nunca cruza cero. Los dos pasos dan el mismo armor → **no es la fuga de
  `dt`, es el mismo escalar por otra vía**. La misma raíz deja el `pool` de daño emitiendo `8.9e-4/s` a
  los 60 s sobre un DoT que dura 6 s. Radio hoy: sólo `getEffectiveArmor` (`CombatSimulator`,
  `TimelineSimulator`); Condition Overload no lee `effectStates`, así que la presencia eterna todavía no
  lo contamina.
- **No vuelve.** `igniteBehavior.resolutionModifier` es monótona creciente: sube y se queda.
- **Sube mal.** `rampProgress` es continuo donde la fuente da escalones. Converge sólo en meseta — y es
  justo el tramo que `../../../references/ingame-tests/damage-buckets.md` §Test 7 evita al medir el
  último tick.

**Fix gateado por el modelo de tiempo**, no por dato: las tres piden que el nivel guarde **el instante
del cambio de régimen** (`{nivel, at, dirección}` → `f(t − at)`) y no progreso acumulado — que es la
misma cura que la deuda de arriba. **Predicción que el modelo hace y nadie midió:** la cadencia de bajada
no puede venir del emisor, porque cuando la vuelta ocurre el emisor ya no existe; entonces Status
Duration —que sí alarga la ida— **no** debería tocar la vuelta. Si la tocara, la cadencia sería una
cuarta cosa que el suceso congela, junto a magnitud, duración y cap.

**Tripwire ejecutable:** `__tests__/status/heat-armor-ramp.test.ts` — 3 `it.fails` con los targets de la
fuente.

### `GAMEPLAY_MULT_FACTION_DAMAGE` — consumo C2 incompleto (pool② en DoT ticks)

El token está **mapeado** (`UPGRADE_MAP`: `op: ADD, toPercent: true`); 42 mods Bane/Expel/Cleanse/Smite lo
llevan. Falta: (1) `target.faction` **estructurado** en los mods (hoy solo en el `label` → `OQ-DATA-5`) y
(2) el consumo en C2 como multiplicador por facción. Vocabulario destino: [`../../semantic/factions.md`](../../semantic/factions.md).

El tick lo computan hoy los `EffectBehavior` resueltos vía `resolveDamageEvent` — todo **menos** el
`(1+Σpool②)²`. La fórmula objetivo sigue firme: `tick = coef × modded_base × (1+status_damage) ×
matriz(elem, facción) × (1+Σpool②)²` (no-True) / con `[bypass ③]` (True). El pendiente **steady-state**
(ambos buffs activos, que es toda la data medida) es un build **decidido** (`DC-OQ-ENGINE-13`), gated por
que **el DoT lea el pool②** — hoy `dotModdedBase` solo lee `WEAPON_ADD_DAMAGE`, no la facción. El pool②
ya tiene su primer miembro **para el HIT** (Roar, wired vía `AbilityRepository`), pero **no alimenta
el DoT**; la facción por mods sigue diferida (shim C2·F, RED). **NO** por
`OQ-ENGINE-20`, que hoy pregunta otra cosa (dónde cae la frontera de congelación). El transitorio —qué
pasa cuando el buff cae a mitad del DoT— no es pregunta: el pool② es **contexto que el tick evalúa al
emitir**, así que cae entero. Lo que falta construir es esa evaluación: el `HitContext` hoy sólo carga
`moddedBase` + status/element.

**Vínculo:** `design/damage-status-model.md §Evidencia` + `§Reconciliación de resolveHit`,
`governance/closed-decisions.md#DC-OQ-ENGINE-13` (confirma que el double-dip es del pool②, no de
"faction" a secas).

### `CombatCalculator.project` — god-function (falloff + crit + status + dps en una función)

Verificación de estabilidad pre-C1: `project()` (`simulate/combat/CombatCalculator.ts`)
absorbe 3-4 naturalezas distintas en ~90 líneas — falloff (física espacial), distribución de crit
(probabilístico), proyección de status (`status_map`: chance×peso inline — hoy computado pero **sin
consumidor** tras retirar `status_projections`/`StatusEngine`) y aritmética de DPS/reload/magazine. Mismo síndrome que ya resolvió `resolveHit`. **No es
deuda de investigación** — el patrón para resolverlo ya existe y está probado 4 veces (`FAMILY_RESOLVERS`
en `SimulationEngine`, y la reconciliación de `resolveHit` con accessors dedicados por naturaleza).
`combat/` sigue fuera del pipeline de producción (`design/formulas-integration.md §1`) — sin consumidor
C2 real, no se reconcilia todavía (gate = consumidor, no ausencia de plan).

- `engine:debt` — descomponer `project()` en piezas por naturaleza cuando `combat/` tenga un consumidor
  de producción. [verificación de estabilidad pre-C1]

### Campos `*_type` de `EnemyDNA` — muertos, candidatos a sunset (revisión pendiente)

`EnemyDNA` declara `health_type`/`armor_type`/`shield_type` (`EnemyRepository.ts`), pero son **inertes**: se
sintetizan como constantes (`'Health'/'None'/'None'`), `RawEnemyEntry` los **omite** del `enemies.json`, y
`resolveHit` no los lee (la ley de armadura es **única para todas las facciones** — no depende de `armor_type`,
ver `enemy-scaling.ts`). Son un artefacto del modelo per-clase muerto (mismo linaje que el `armorBypass`-por-elemento
ya sunseteado en `resolveHit`).

Sunset **candidato pero NO ejecutado**: el radio de impacto no está cerrado — además de los 3 campos toca las
uniones `HealthType`/`ArmorType`/`ShieldType` y hay que confirmar si algún override de `enemies.json` los carga
(el grep dice que no, pero es lo que la revisión debe verificar antes de borrar). RED — GO/NO-GO del usuario.

- `engine:debt` — decidir sunset de `*_type` tras auditar las uniones de tipo + la cobertura real en `enemies.json`.
  [empirical: `EnemyRepository.ts:30-32,78-80` synth constante; `RawEnemyEntry` Omit; `resolveHit` no los lee]

### Procedencia de perks de Incarnon — `source_id` ausente

`IncarnonRepository` emite los `Modifier` de perks **sin** `source_id`, mientras `ModRepository` los emite con
`Mod:<id>`. En el trace de procedencia (`SimulationEngine.getTrace`)
el aporte de un perk aparece como `source=unknown` — inatribuible. La mecánica es correcta (el valor aterriza en
el bucket correcto); el gap es de **observabilidad**, no de cálculo.

- `engine:debt` — emitir `source_id` en `IncarnonRepository` (p. ej. `Perk:<nombre>`), espejando `ModRepository`.
  [empirical: trace de `__tests__/boltor-prime-incarnon.test.ts`]

### 🔴 `DT_RADIANT` resuelve al tipo equivocado — Void queda sin puente

`DAMAGE_TYPE_DEFINITIONS` en `Project/src/shared/types/damage.ts` declara:

```ts
radiation: { rawTags: ['DT_RADIATION', 'DT_RADIANT'], … }   // ← DT_RADIANT es Void, no Radiation
void:      { rawTags: ['DT_VOID'],                    … }   // ← DT_VOID: 0 ocurrencias en el dataset
```

**La fuente y el vocabulario están bien; el mapeo del código está mal.**
`references/wiki/sources/damage-types-data.md` declara `Void | DT_RADIANT | PT_RADIANT`, y lo confirma
**nuestro propio dataset** con texto in-game de DE: *"enemies suffering from `<DT_RADIANT_COLOR>`
**Void** Status Effect"* — `mods.json` ×14 (Xaku *Vast Untime*), `arcanes.json` ×16,
`ability-stats.override.json` ×2: **32 ocurrencias vivas en `public/data/`, y `DT_VOID` no aparece
ninguna vez.**

Efecto: todo `DT_RADIANT` entrante resuelve como Radiación (`damage.ts:155`) → facción, proc
(`PT_RAD_TOX` en vez de `PT_RADIANT`) y resistencias equivocadas. Y `void` (`damage.ts:173`) queda con
un `rawTag` que **el dataset no usa nunca**, o sea sin puente válido de entrada.

⚠️ **Es la misma confusión Void↔Radiation en los dos niveles** (`DT_` y `PT_`): sistémico, no typo.

- `engine:debt` — mover `DT_RADIANT` de `radiation` a `void`, y verificar qué entra hoy por `DT_VOID`
  antes de retirarlo. Toca vocabulario, dataset y las tablas de facción/resistencia a la vez, así que
  **se ejecuta dentro del saneamiento de la campaña de recomposición**, no como fix aislado.
  [empirical: `grep DT_RADIANT` sobre `public/data/` + `references/wiki/sources/damage-types-data.lua:1275`]

---

## Preguntas abiertas del dominio

Ver [`../../governance/open-questions.md`](../../governance/open-questions.md):
- **OQ-ENGINE-2** — Profile switching en runtime (Incarnon/Alt-fire): re-hidratar vs. conmutar durante `resolve()`.
- **OQ-ENGINE-7** — Materialización de nodos de atributo de arma faltantes (Capa 4).
- **OQ-ENGINE-11** — Exaltadas: derivación de intención estructural en A1.
- **OQ-ENGINE-12** — Timing del pipeline de crit condicional para Puncture/Cold (C2).
- **OQ-ENGINE-15** — Fórmula de DR de armor enemigo: conflicto de 3 vías.
- **OQ-ENGINE-16** — Fidelidad de N-declarado vs. timers reales para stacks de status (C1).
- **OQ-ENGINE-17** — Fórmula de arcanos ability-like: ¿por-arcano o por-familia?
- **OQ-ENGINE-FUTURE** — Web Worker, Rewind, y estado del Gold Standard testing.

Las OQs cerradas (STATE-1..4, ENGINE-1/3/4/5/6/13, DATA-12) están en [`../../governance/closed-decisions.md`](../../governance/closed-decisions.md).

## Contratos del motor

- [`attribute-node-contract.md`](attribute-node-contract.md) — Qué modela cada campo de `AttributeNode`, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta.
- [`design/damage-status-model.md`](design/damage-status-model.md) — Micro-arquitectura interna de C2: modelo de daño elemental/status/DoT para los 16 tipos, primitivo de stack tracker, reglas de composición (True↔Viral, double-dip de faction, orden de resolución de stacks), verdictos de scope v1 por tipo — verificado empíricamente in-game (2026-07-02), no solo por wiki.
