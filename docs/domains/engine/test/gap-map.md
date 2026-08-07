---
Estado: "referencia"
Rol: "Mapa sistemático de lo que el engine ignora o procesa a medias — el territorio que el testing derivado convierte en cobertura, capa por capa"
Impacto_ID: "E-GapMap"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-06-10"
Fecha_de_actualizacion: "2026-08-06"
---

# Mapa de gaps del engine

Inventario de **lo que el engine NO construye todavía** — a propósito: no se modela a ciegas. Es el complemento de [`catalog-current.md`](catalog-current.md) (lo que ya se resuelve y testea): aquí está el territorio que los consumidores derivados —vía el clic, ver [`test-workflow.md`](test-workflow.md)— van convirtiendo en cobertura, caso por caso. **Cada gap es un objetivo de construcción**, y los `it.todo` de los tests apuntan a estas capas.

> **Gap ≠ fuera de scope.** Un gap es algo que el engine debería resolver por su propio contrato y no
> resuelve. Lo que queda *deliberadamente afuera* —C2 cuando el consumidor es C1, la entidad que
> genera un buff cuando lo modelable es el buff— no entra acá: se difiere y se marca como `it.todo`
> en el test que lo toca, que es donde el motor lo grita al correr.

> Origen: barrido datos↔código. Conteos **indicativos** (remapeos `UPGRADE_MAP`/`resolveToken` no siempre 1:1); el patrón es sólido, los números se mueven ±pocos por caso.

---

## Núcleo que el engine SÍ resuelve

Grafo genérico de atributos (`SimulationEngine`): un pass topológico (Kahn) — DAG en la práctica, un pass alcanza el punto fijo; ciclo real → fail-loud (no soportado, convergencia iterativa diferida = Opción B, `arch-decisions §4.2`). 9 operaciones: **4 de acumulador** (`ADD`, `ADD_FLAT`, `BASE_FLAT`, `MULTIPLICATIVE` — 1:1 con los 4 buckets) + **5 de familia** (`CONDITION_OVERLOAD`, `MELEE_COMBO_MULT`, `SNIPER_COMBO_MULT`, `COMBO_SCALED_ADD`, `STACK_DECAY_BUFF` — el valor lo computa una fórmula, no el `value`). `evalCondition` cableado. Resuelve **~8 stats de arma** (crit chance/mult, status chance, fire rate, multishot, magazine, reload, daño + tipos vía `DamageCombiner`) sobre dos fuentes (`mod-stats` e `incarnon-evolutions`). Estado físico de componentes: [`status.md`](../status.md).

---

## Las capas de gap (grave → leve)

### Capa 1 — Fuentes que `DataLoader` ni carga
`DataLoader.init()` carga `weapons`, `mod-stats`, `weapon-stats` (solo multishot), `incarnon`.

| Fuente | Volumen en el dato | Estado |
|---|---|---|
| `arcane-stats.override` | 102 `upgrade_type` + 145 condition | 🚧 **v0 cargado** — subset mapeado (ver abajo) |
| `ability-stats.override` | 1236 `upgrade_by` (scaling) | No cargado → ver Capa 5 |
| `passives-stats`, `vehicles`, `archwing-weapons` | varios | No cargados |
| `companions`, `enemies` | varios | ✅ **cargados como participantes** — ver nota |

> **`arcane-stats` v0:** `ArcaneRepository` activo (`DataLoader` lo carga; clave = uniqueName). Slot dedicado `arcanes` en la intención (hermano de `mods`, top-level por canal — heterogéneo: warframe=2, armas=1, Zaw/archgun varios). Resuelve a `Modifier` directo, **sin `DamageCombiner`** (el daño de arcano no se combina con el del arma — naturaleza distinta, como shards). Fluye solo el subset con `base_value` + `upgrade_type` poblados (siempre-activos + condicionales con token); se omiten `base_value:null` (stacking, OQ-DATA-4) y `upgrade_type:null` (status resists, fórmulas per-stat, operador/amp). Clamp de rank (no todos 0-5). Consumidor: `__tests__/arcane.test.ts`. Fuera de v0: stacking, weapon-type gate (OQ-DATA-5), cross-entity warframe→arma (OQ-DATA-1).

> **`companions` y `enemies` son participantes, no fuentes pendientes.** `DataLoader` los carga:
> `ItemRepository.loadCompanions()` guarda al compañero en su propio índice —el motivo declarado es que
> comparte los cuatro pilares y el molde de avatar, así que no necesita repositorio aparte—, y `enemies`
> se carga **dos veces a propósito**: `EnemyRepository` lo escala para C2 (`ScaledEnemy`),
> `ItemRepository` lo hidrata como participante de C1. Son dos usos del mismo raw, no una duplicación de
> la fuente. Consumidores: `__tests__/companion.test.ts`, `__tests__/enemy.test.ts`.

> **`archon-shards` ya NO es gap:** `ShardRepository` está activo (resuelve shards, emite `Modifier` con `target_entity`; ver `status.md` y `rhino.test.ts`).

### Capa 2 — Warframes: base + mods + ability cross-entity — 🚧 resuelto salvo cross-stat
`ItemRepository.normalizeWarframe()` emite los nodos `AVATAR_*` (health/shield/armor/energy + ability strength/range/duration/efficiency) desde el raw de `warframes.json` — un warframe **es** una entidad receptora, no hay evaporación. Mods (%) y shards (flat) componen (`Total = Base × (1 + Mods%) + Flat`), y el derive cross-entity source→target (Roar, vía `AbilityRepository`) hidrata un buff real de habilidad al pool de facción del arma. Validado end-to-end en `rhino.test.ts` (fixture_01 base+mods, fixture_03/04 Roar cross-entity).

**Sigue abierto:** composición cross-stat con fórmula dedicada (Iron Skin `overguard = (1200 + armor×2.5) × strength`, `it.todo` en `rhino.test.ts`) y el double-dip de Condition Overload en C2. No hace falta una clase repositorio separada — el mismo molde de `ItemRepository` alcanza; `formulas/warframe/` sigue vacío porque todavía no hay una fórmula dedicada escrita (Iron Skin la ocupará primero — antes de escribirla, leer [`formula-patterns.md`](../../../data/schemas/abilities/formula-patterns.md): Iron Skin es cross-stat).

> **Hilo testigo — un stat inerte puede ser load-bearing.** Los shards de armadura **no** tocan
> strength, y sin embargo sostienen a Iron Skin (`overguard` compone `armor × strength`). Un test que
> solo mira `final` no lo ve; uno sobre buckets sí. Es el argumento de `attribute-node-contract.md`
> §Validación aplicado a un caso donde la omisión sería silenciosa.

### Capa 3 — `condition` en perks de Incarnon — ✅ CERRADA
`IncarnonRepository` ahora propaga el campo `condition` al `Modifier`, espejando a `ModRepository`. Antes los 175 perks de incarnon se aplicaban incondicionalmente. Fue el primer objetivo de la fase engine; cerró el drift.

### Capa 4 — Modifiers de weapon que se evaporan por falta de nodo — 🚧 EN CONSTRUCCIÓN (4 nodos materializados)
~18 tokens catalogados y mapeados que igual no aplican, porque el arma solo tiene los ~8 nodos que `ItemRepository` mapea. **Ya materializados (OQ-ENGINE-7):** `punch_through`, `projectile_speed`, `recoil`, `accuracy`. **Siguen sin nodo:** `zoom`, `ammo_max`, `ammo_efficiency`, `range`, `beam_range`, `headshot_mult`, `finisher_damage`, `slam_damage`, familias `combo_*` / `heavy_*`. El modifier se produce; ningún nodo lo recibe. Toca solo `ItemRepository.getDNA()` — `createBaseEntity` ya materializa todo token `isUpgrade()` presente en el profile. Disparador documentado: **OQ-ENGINE-7**.

> **`punch_through` materializado:** una clave en `getDNA()` (`override per-ataque ?? raw ?? 0`) + innatos en `weapon-stats.override.json` (mismo shape que multishot). El raw expone `punch_through` per-ataque pero vale 0 en todo el dataset — los innatos (Lanka 5.0m charged, Zenith, bows) van por override. Op `ADD_FLAT` (metros). Consumidor: `lanka.test.ts`.
>
> **`projectile_speed` materializado — dos diferencias respecto a punch:** (1) base = `flight` del raw **sin override** (el raw trae el valor real, m/s); (2) op `ADD` (% aditivo), no flat. **Patrón nuevo: gate `flight != null` → ausencia ≠ 0.** Hitscan = `flight` null en 274/274 (instantáneo, sin proyectil) → nodo **ausente**, no `base: 0` (un base 0 + mod % daría velocidad espuria). Primera stat Capa 4 donde la ausencia del dato es semánticamente significativa. Aserción negativa en `cedo-prime.test.ts`. Ref: `references/wiki/mechanics/projectile-speed.md`.
>
> **`recoil` materializado — tercer molde de base: SINTÉTICA.** Ni override (punch) ni raw (projectile): **no hay dato absoluto público** de recoil (interno de DE, oculto). Base sintética `100` incondicional en `getDNA()` (sin gate — todas las armas tienen recoil), op `ADD` (% bidireccional, −90% a +100%). El `final` es el **recoil relativo** (100 = nato, 10 = 10% del nato), mismo patrón que `WEAPON_ADD_RELOAD_SPEED: 100`. **Nodo inerte:** camera feel, no input de daño → computa pero queda "muerto" hasta definir modelado/UI (OQ-ENGINE-7). Clamp de sobre-reducción (`final < 0`) abierto. Consumidor `lanka.test.ts` (Vile Precision). Ref: `references/wiki/mechanics/recoil.md`.
>
> **`accuracy` materializado — cuarto molde: CASCADA de dos fuentes del mismo stat.** Los tres
> moldes anteriores eligen *una* fuente; éste ordena dos por fidelidad. La base sale del par
> `min_spread`/`max_spread` **del ataque** (`100 / ((min+max)/2)`, cosechado de `Module:Weapons/data`
> por `omniframe-items`) y cae al escalar `accuracy` del arma sólo si el par falta; sin ninguno de
> los dos, no hay nodo — gate `ausencia ≠ 0` heredado de projectile_speed, porque un base 0 sería
> precisión nula. **Con una salvedad que el molde anterior no tenía:** `0/0` es dato, no ausencia
> (cono nulo = puntería perfecta), y vale `100` —lo que publica la fuente— **sin caer al escalar**.
> Caer ahí le daría al Incarnon del Boar Prime el 5 de la escopeta hermana. **Por qué la cascada y no el escalar solo:** los dos consumidores vivos son perks
> de forma Incarnon, y la forma dispersa distinto que el ataque normal (Boltor Prime: 50 vs **10**).
> El escalar del export es ese mismo promedio ya colapsado y no distingue perfiles: habría dado un
> número plausible y falso. Op `ADD` (% aditivo). Consumidor: `__tests__/weapon-accuracy.test.ts`
> (Felarx `attuned_accuracy`, Boltor Prime `hunters_mantra`). **El efecto sigue sin modelo:** cono →
> probabilidad de impacto es C2; el nodo computa el valor en C1 y ahí se detiene.
>
> ⚠️ **Gap nuevo destapado — es C2, NO Capa 4:** hitscan-**con**-falloff (67 ataques, ej. Cedo, Baza) — los mods de projectile speed deberían escalar su rango de falloff. No es un "nodo faltante": **falloff es una mecánica C2 entera** (`daño(distancia)`, ver abajo), con projectile_speed como uno de sus inputs. El `%` de projectile speed no tiene dónde aterrizar en esas armas (gate `flight=null` → sin nodo de velocidad) — de dónde lo lee C2 es diseño abierto. Spec: [`damage-falloff.md`](../../../../references/wiki/mechanics/damage-falloff.md). `it.todo` en `cedo-prime.test.ts`.

### Capa 5 — `upgrade_by` (scaling entre stats) = 0.1% consumido
`AbilityRepository` **sí** emite `source_attribute` desde `upgrade_by` (Roar end-to-end, `rhino.test.ts` Fase 1b) — el mecanismo existe y funciona. Lo que falta es **corpus**: de los **1241 `upgrade_by` del override, exactamente 1 trae `upgrade_type`** (el destino del efecto) y por lo tanto produce un modifier. Sin `upgrade_type` el stat es display-only: se muestra escalado, no compone.

El vocabulario del dato es cerrado y homogéneo — 5 valores, **ninguno un capacity-stat**: `AVATAR_ABILITY_STRENGTH` (481), `AVATAR_ABILITY_RANGE` (257), `ENERGY_COST` (245), `AVATAR_ABILITY_DURATION` (223), `ENERGY_DRAIN` (35). Los ejes de costo son `OQ-W-5`; leer un capacity-stat propio del frame (Iron Skin `× TotalArmor`) **no existe en el dato y no llega por parsing** (la wiki lo dice en prosa) — es `OQ-W-6` en el eje vocabulario y `OQ-ENGINE-24` en el eje mecanismo. Diferido (RED).

(Nota: el escalado-por-contexto ya no es una operación genérica — CO usa la operation de familia `CONDITION_OVERLOAD` + `co_factors`; ver `../design/arch-decisions.md §9`.)

---

## Arquetipo de disparo — por qué C1 no tiene un baseline por tipo

El engine **no lee `shot_type`**: C1 es value-driven, lo maneja el valor de multishot y no el tipo de
arma. "Hitscan puro" y "shotgun puro" recorren el mismo code-path con `multishot` distinto, así que un
baseline por arquetipo en C1 sería horizontal — la misma prueba N veces.

**El arquetipo deja de ser redundante en C2**, donde Projectile / AoE / Beam sí son code-paths
distintos (`rollPellets` vs detección por radio vs multiplicador continuo). Una cobertura por
arquetipo es, en rigor, validación de C2 — no una extensión de C1.

---

## Ability-like (predicción confirmada por el dato)

35 tokens WEAPON + 48 AVATAR fuera del catálogo en `mod-stats`. Los weapon revelan su naturaleza: `parry_counter_chance`, `corpse_explode_damage`, `proc_damage`, `life_steal`, `slash_proc_on_crit_chance`, `damage_over_distance`, etc. → categoría **"ability-like → fórmula dedicada"**: el dato ya marca cuáles no entran al mecanismo genérico.

> **⚠️ Matiz:** la frontera "genérico vs dedicado" no es limpia. `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` (Condition Overload) **sí** resultó modelable en el grafo genérico (modo estático, `co_behavior` routing — ver `../design/arch-decisions.md §9`), pese a tener una fórmula dedicada preexistente (`formulas/weapon/weapon-condition-overload.ts`). **Dónde viven las fórmulas dedicadas ya está respondido:** `core/engine/formulas/` existe y poblado (ver `../design/formulas-integration.md`). Lo que **sigue abierto (RED)** es *cómo el grafo de buckets consume una fórmula escalar-cerrada* — la reconciliación grafo↔fórmula que CO destapó.

---

## Priorización (foco *weapons*)

| Prioridad | Capa | Costo | Naturaleza |
|---|---|---|---|
| ✅ hecho | Capa 3 (condition incarnon) | bajo | cerró drift |
| 1 — 🚧 | Capa 4 (nodos faltantes) | bajo por stat (patrón validado con `punch_through`) | toca solo `ItemRepository.getDNA()` |
| 2 | Capa 2 (warframes) — resta cross-stat (Iron Skin) + CO double-dip C2 | medio (base + mods + shards + cross-entity ya resuelven) | fórmula dedicada `formulas/warframe/`, net-new |
| 3 — 🚧 | Capa 1 parcial (arcanes) | medio | v0 hecho (subset mapeado, `ArcaneRepository`); resto = stacking/null/operador, gateado |
| diferido (RED) | Capa 5 (scaling) + ability-like | alto | requiere contrato de ruteo genérico vs dedicado |
