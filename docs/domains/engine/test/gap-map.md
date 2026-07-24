---
Estado: "referencia"
Rol: "Mapa sistemático de lo que el engine ignora o procesa a medias — el territorio que el testing derivado convierte en cobertura, capa por capa"
Impacto_ID: "E-GapMap"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-06-10"
Fecha_de_actualizacion: "2026-07-24"
---

# Mapa de gaps del engine

Inventario de **lo que el engine NO construye todavía** — a propósito: no se modela a ciegas. Es el complemento de [`catalog-current.md`](catalog-current.md) (lo que ya se resuelve y testea): aquí está el territorio que los consumidores derivados —vía el clic, ver [`test-workflow.md`](test-workflow.md)— van convirtiendo en cobertura, caso por caso. **Cada gap es un objetivo de construcción**; los `it.todo` de los tests apuntan a estas capas, y el roadmap de fixtures que las ataca vive en [`catalog-future.md`](catalog-future.md).

> Origen: barrido datos↔código (snapshot `.working/` purgado tras promover). Conteos **indicativos** (remapeos `UPGRADE_MAP`/`resolveToken` no siempre 1:1); el patrón es sólido, los números se mueven ±pocos por caso.

---

## Núcleo que el engine SÍ resuelve

Grafo genérico de atributos (`SimulationEngine`): un pass topológico (Kahn) — DAG en la práctica, un pass alcanza el punto fijo; ciclo real → fail-loud (no soportado, convergencia iterativa diferida = Opción B, `arch-decisions §4.2`). 6 operaciones (`BASE_FLAT`, `BASE_ADD_PCT`, `ADD_FLAT`, `ADD`, `MULTIPLICATIVE`, `CONDITION_OVERLOAD`). `evalCondition` cableado. Resuelve **~8 stats de arma** (crit chance/mult, status chance, fire rate, multishot, magazine, reload, daño + tipos vía `DamageCombiner`) sobre dos fuentes (`mod-stats` e `incarnon-evolutions`). Estado físico de componentes: [`status.md`](../status.md).

---

## Las capas de gap (grave → leve)

### Capa 1 — Fuentes que `DataLoader` ni carga
`DataLoader.init()` carga `weapons`, `mod-stats`, `weapon-stats` (solo multishot), `incarnon`.

| Fuente | Volumen en el dato | Estado |
|---|---|---|
| `arcane-stats.override` | 102 `upgrade_type` + 145 condition | 🚧 **v0 cargado** — subset mapeado (ver abajo) |
| `ability-stats.override` | 1236 `upgrade_by` (scaling) | No cargado → ver Capa 5 |
| `passives-stats`, `companions`, `vehicles`, `archwing-weapons` | varios | No cargados |

> **`arcane-stats` v0:** `ArcaneRepository` activo (`DataLoader` lo carga; clave = uniqueName). Slot dedicado `arcanes` en la intención (hermano de `mods`, top-level por canal — heterogéneo: warframe=2, armas=1, Zaw/archgun varios). Resuelve a `Modifier` directo, **sin `DamageCombiner`** (el daño de arcano no se combina con el del arma — naturaleza distinta, como shards). Fluye solo el subset con `base_value` + `upgrade_type` poblados (siempre-activos + condicionales con token); se omiten `base_value:null` (stacking, OQ-DATA-4) y `upgrade_type:null` (status resists, fórmulas per-stat, operador/amp). Clamp de rank (no todos 0-5). Consumidor: `__tests__/arcane.test.ts`. Fuera de v0: stacking, weapon-type gate (OQ-DATA-5), cross-entity warframe→arma (OQ-DATA-1).

> **`archon-shards` ya NO es gap:** `ShardRepository` está activo (resuelve shards, emite `Modifier` con `target_entity`; ver `status.md` y el Tier 1 de Rhino en `catalog-future.md`).

### Capa 2 — Warframes: base + mods + ability cross-entity — 🚧 Tier 1 resuelto, cross-stat pendiente
`ItemRepository.normalizeWarframe()` emite los nodos `AVATAR_*` (health/shield/armor/energy + ability strength/range/duration/efficiency) desde el raw de `warframes.json` — un warframe **es** una entidad receptora, no hay evaporación. Mods (%) y shards (flat) componen (`Total = Base × (1 + Mods%) + Flat`), y el derive cross-entity source→target (Roar, vía `AbilityRepository`) hidrata un buff real de habilidad al pool de facción del arma. Validado end-to-end en `rhino.test.ts` (fixture_01 base+mods, fixture_03/04 Roar cross-entity).

**Sigue abierto:** composición cross-stat con fórmula dedicada (Iron Skin `overguard = (1200 + armor×2.5) × strength`, fixture_02, `it.todo`) y el double-dip de Condition Overload en C2 (fixture_05). No hace falta una clase repositorio separada — el mismo molde de `ItemRepository` alcanza; `formulas/warframe/` sigue vacío porque todavía no hay una fórmula dedicada escrita (Iron Skin la ocupará primero). Roadmap: [`catalog-future.md §Rhino`](catalog-future.md).

### Capa 3 — `condition` en perks de Incarnon — ✅ CERRADA
`IncarnonRepository` ahora propaga el campo `condition` al `Modifier`, espejando a `ModRepository`. Antes los 175 perks de incarnon se aplicaban incondicionalmente. Fue el primer objetivo de la fase engine; cerró el drift.

### Capa 4 — Modifiers de weapon que se evaporan por falta de nodo — 🚧 EN CONSTRUCCIÓN (3 nodos materializados)
~18 tokens catalogados y mapeados que igual no aplican, porque el arma solo tiene los ~8 nodos que `ItemRepository` mapea. **Ya materializados (OQ-ENGINE-7):** `punch_through`, `projectile_speed`, `recoil`. **Siguen sin nodo:** `zoom`, `ammo_max`, `ammo_efficiency`, `range`, `beam_range`, `headshot_mult`, `finisher_damage`, `slam_damage`, familias `combo_*` / `heavy_*`. El modifier se produce; ningún nodo lo recibe. Toca solo `ItemRepository.getDNA()` — `createBaseEntity` ya materializa todo token `isUpgrade()` presente en el profile. Disparador documentado: **OQ-ENGINE-7**.

> **`punch_through` materializado:** una clave en `getDNA()` (`override per-ataque ?? raw ?? 0`) + innatos en `weapon-stats.override.json` (mismo shape que multishot). El raw expone `punch_through` per-ataque pero vale 0 en todo el dataset — los innatos (Lanka 5.0m charged, Zenith, bows) van por override. Op `ADD_FLAT` (metros). Consumidor: `lanka.test.ts`.
>
> **`projectile_speed` materializado — dos diferencias respecto a punch:** (1) base = `flight` del raw **sin override** (el raw trae el valor real, m/s); (2) op `ADD` (% aditivo), no flat. **Patrón nuevo: gate `flight != null` → ausencia ≠ 0.** Hitscan = `flight` null en 274/274 (instantáneo, sin proyectil) → nodo **ausente**, no `base: 0` (un base 0 + mod % daría velocidad espuria). Primera stat Capa 4 donde la ausencia del dato es semánticamente significativa. Aserción negativa en `cedo-prime.test.ts`. Ref: `references/wiki/mechanics/projectile-speed.md`.
>
> **`recoil` materializado — tercer molde de base: SINTÉTICA.** Ni override (punch) ni raw (projectile): **no hay dato absoluto público** de recoil (interno de DE, oculto). Base sintética `100` incondicional en `getDNA()` (sin gate — todas las armas tienen recoil), op `ADD` (% bidireccional, −90% a +100%). El `final` es el **recoil relativo** (100 = nato, 10 = 10% del nato), mismo patrón que `WEAPON_ADD_RELOAD_SPEED: 100`. **Nodo inerte:** camera feel, no input de daño → computa pero queda "muerto" hasta definir modelado/UI (OQ-ENGINE-7). Clamp de sobre-reducción (`final < 0`) abierto. Consumidor `lanka.test.ts` (Vile Precision). Ref: `references/wiki/mechanics/recoil.md`.
>
> ⚠️ **Gap nuevo destapado — es C2, NO Capa 4:** hitscan-**con**-falloff (67 ataques, ej. Cedo, Baza) — los mods de projectile speed deberían escalar su rango de falloff. No es un "nodo faltante": **falloff es una mecánica C2 entera** (`daño(distancia)`, ver abajo), con projectile_speed como uno de sus inputs. El `%` de projectile speed no tiene dónde aterrizar en esas armas (gate `flight=null` → sin nodo de velocidad) — de dónde lo lee C2 es diseño abierto. Spec: [`damage-falloff.md`](../../../../references/wiki/mechanics/damage-falloff.md). `it.todo` en `cedo-prime.test.ts`.

### Capa 5 — `upgrade_by` (scaling entre stats) = 0.1% consumido
`AbilityRepository` **sí** emite `source_attribute` desde `upgrade_by` (Roar end-to-end, `rhino.test.ts` Fase 1b) — el mecanismo existe y funciona. Lo que falta es **corpus**: de los **1241 `upgrade_by` del override, exactamente 1 trae `upgrade_type`** (el destino del efecto) y por lo tanto produce un modifier. Sin `upgrade_type` el stat es display-only: se muestra escalado, no compone.

El vocabulario del dato es cerrado y homogéneo — 5 valores, **ninguno un capacity-stat**: `AVATAR_ABILITY_STRENGTH` (481), `AVATAR_ABILITY_RANGE` (257), `ENERGY_COST` (245), `AVATAR_ABILITY_DURATION` (223), `ENERGY_DRAIN` (35). Los ejes de costo son `OQ-W-5`; leer un capacity-stat propio del frame (Iron Skin `× TotalArmor`) **no existe en el dato y no llega por parsing** (la wiki lo dice en prosa) — es `OQ-W-6` en el eje vocabulario y `OQ-ENGINE-24` en el eje mecanismo. Diferido (RED).

(Nota: el escalado-por-contexto ya no es una operación genérica — CO usa la operation de familia `CONDITION_OVERLOAD` + `co_factors`; ver `../design/arch-decisions.md §9`.)

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
| 2 | Capa 2 (warframes) — resta cross-stat (Iron Skin) + CO double-dip C2 | medio (lo que resta; Tier 1 ya resuelto) | fórmula dedicada `formulas/warframe/`, net-new |
| 3 — 🚧 | Capa 1 parcial (arcanes) | medio | v0 hecho (subset mapeado, `ArcaneRepository`); resto = stacking/null/operador, gateado |
| diferido (RED) | Capa 5 (scaling) + ability-like | alto | requiere contrato de ruteo genérico vs dedicado |
