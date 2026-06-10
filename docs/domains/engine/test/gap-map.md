---
Estado: "referencia"
Rol: "Mapa sistemático de lo que el engine ignora o procesa a medias — el territorio que el testing derivado convierte en cobertura, capa por capa"
Version: "v0.4.0"
Impacto_ID: "E-GapMap"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-06-10"
Fecha_de_actualizacion: "2026-06-10"
---

# Mapa de gaps del engine

Inventario de **lo que el engine NO construye todavía** — a propósito: no se modela a ciegas. Es el complemento de [`catalog-current.md`](catalog-current.md) (lo que ya se resuelve y testea): aquí está el territorio que los consumidores derivados —vía el clic, ver [`test-workflow.md`](test-workflow.md)— van convirtiendo en cobertura, caso por caso. **Cada gap es un objetivo de construcción**; los `it.todo` de los tests apuntan a estas capas, y el roadmap de fixtures que las ataca vive en [`catalog-future.md`](catalog-future.md).

> Origen: barrido datos↔código del 2026-06-06 (snapshot `.working/` purgado tras promover). Conteos **indicativos** (remapeos `UPGRADE_MAP`/`resolveToken` no siempre 1:1); el patrón es sólido, los números se mueven ±pocos por caso.

---

## Núcleo que el engine SÍ resuelve

Grafo genérico de atributos (`SimulationEngine`): orden topológico + fixed-point para ciclos, 7 operaciones (`BASE_FLAT`, `BASE_ADD_PCT`, `ADD_FLAT`, `ADD`, `MULTIPLICATIVE`, `SET`, `CONTEXT_SCALE`). `evalCondition` cableado. Resuelve **~8 stats de arma** (crit chance/mult, status chance, fire rate, multishot, magazine, reload, daño + tipos vía `DamageCombiner`) sobre dos fuentes (`mod-stats` e `incarnon-evolutions`). Estado físico de componentes: [`status.md`](../status.md).

---

## Las capas de gap (grave → leve)

### Capa 1 — Fuentes que `DataLoader` ni carga
`DataLoader.init()` carga `weapons`, `mod-stats`, `weapon-stats` (solo multishot), `incarnon`.

| Fuente | Volumen en el dato | Estado |
|---|---|---|
| `arcane-stats.override` | 102 `upgrade_type` + 145 condition | No cargado |
| `ability-stats.override` | 1236 `upgrade_by` (scaling) | No cargado → ver Capa 5 |
| `passives-stats`, `companions`, `vehicles`, `archwing-weapons` | varios | No cargados |

> **`archon-shards` ya NO es gap:** `ShardRepository` está activo (resuelve shards, emite `Modifier` con `target_entity`; ver `status.md` y el Tier 1 de Rhino en `catalog-future.md`).

### Capa 2 — Warframes sin nodos
`ItemRepository.getDNA()` solo mapea stats de arma. Un warframe no genera ningún nodo `AVATAR_*` → todo mod de warframe se evapora (target sin nodo). El vocabulario `AVATAR_*` está mapeado en `UPGRADE_MAP`, pero no hay entidad receptora. **En construcción:** el linaje Rhino (`catalog-future.md`) es el primer fixture de warframe net-new; `WarframeRepository` no existe aún (`formulas/warframe/` purgado, vacío intencionalmente).

### Capa 3 — `condition` en perks de Incarnon — ✅ CERRADA (2026-06-06)
`IncarnonRepository` ahora propaga el campo `condition` al `Modifier`, espejando a `ModRepository`. Antes los 175 perks de incarnon se aplicaban incondicionalmente. Fue el primer objetivo de la fase engine; cerró el drift.

### Capa 4 — Modifiers de weapon que se evaporan por falta de nodo — 🚧 EN CONSTRUCCIÓN (2 nodos 2026-06-10)
~18 tokens catalogados y mapeados que igual no aplican, porque el arma solo tiene los ~8 nodos que `ItemRepository` mapea. Se pierden: ~~`projectile_speed`~~, ~~`recoil`~~, ~~`punch_through`~~, `zoom`, `ammo_max`, `ammo_efficiency`, `range`, `beam_range`, `headshot_mult`, `finisher_damage`, `slam_damage`, familias `combo_*` / `heavy_*`. El modifier se produce; ningún nodo lo recibe. Toca solo `ItemRepository.getDNA()` — `createBaseEntity` ya materializa todo token `isUpgrade()` presente en el profile. Disparador documentado: **OQ-ENGINE-7** (`punch_through`).

> **`punch_through` materializado (2026-06-10):** una clave en `getDNA()` (`override per-ataque ?? raw ?? 0`) + innatos en `weapon-stats.override.json` (mismo shape que multishot). El raw expone `punch_through` per-ataque pero vale 0 en todo el dataset — los innatos (Lanka 5.0m charged, Zenith, bows) van por override. Op `ADD_FLAT` (metros). Consumidor: `lanka.test.ts`.
>
> **`projectile_speed` materializado (2026-06-10) — dos diferencias respecto a punch:** (1) base = `flight` del raw **sin override** (el raw trae el valor real, m/s); (2) op `ADD` (% aditivo), no flat. **Patrón nuevo: gate `flight != null` → ausencia ≠ 0.** Hitscan = `flight` null en 274/274 (instantáneo, sin proyectil) → nodo **ausente**, no `base: 0` (un base 0 + mod % daría velocidad espuria). Primera stat Capa 4 donde la ausencia del dato es semánticamente significativa. Aserción negativa en `cedo-prime.test.ts`. Ref: `references/wiki/mechanics/projectile-speed.md`.
>
> **`recoil` materializado (2026-06-10) — tercer molde de base: SINTÉTICA.** Ni override (punch) ni raw (projectile): **no hay dato absoluto público** de recoil (interno de DE, oculto). Base sintética `100` incondicional en `getDNA()` (sin gate — todas las armas tienen recoil), op `ADD` (% bidireccional, −90% a +100%). El `final` es el **recoil relativo** (100 = nato, 10 = 10% del nato), mismo patrón que `WEAPON_ADD_RELOAD_SPEED: 100`. **Nodo inerte:** camera feel, no input de daño → computa pero queda "muerto" hasta definir modelado/UI (OQ-ENGINE-7). Clamp de sobre-reducción (`final < 0`) abierto. Consumidor `lanka.test.ts` (Vile Precision). Ref: `references/wiki/mechanics/recoil.md`.
>
> ⚠️ **Gap nuevo destapado — es C2, NO Capa 4 (reencuadrado 2026-06-10):** hitscan-**con**-falloff (67 ataques, ej. Cedo, Baza) — los mods de projectile speed deberían escalar su rango de falloff. No es un "nodo faltante": **falloff es una mecánica C2 entera** (`daño(distancia)`, ver abajo), con projectile_speed como uno de sus inputs. El `%` de projectile speed no tiene dónde aterrizar en esas armas (gate `flight=null` → sin nodo de velocidad) — de dónde lo lee C2 es diseño abierto. Spec: [`damage-falloff.md`](../../../../references/wiki/mechanics/damage-falloff.md). `it.todo` en `cedo-prime.test.ts`.

### Capa 5 — `upgrade_by` (scaling entre stats) = 0% consumido
El engine tiene `source_attribute` / `CONTEXT_SCALE`, pero ningún hidratador lo emite. Los 1236 `upgrade_by` de habilidades viven en `lib/abilityCalc.ts`, un cálculo paralelo desconectado del grafo del `SimulationEngine`. Diferido (RED).

---

## Ability-like (predicción confirmada por el dato)

35 tokens WEAPON + 48 AVATAR fuera del catálogo en `mod-stats`. Los weapon revelan su naturaleza: `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE`, `parry_counter_chance`, `corpse_explode_damage`, `proc_damage`, `life_steal`, `slash_proc_on_crit_chance`, `damage_over_distance`, etc. → categoría **"ability-like → fórmula dedicada"**: el dato ya marca cuáles no entran al mecanismo genérico. Diferido (RED): requiere contrato de **dónde viven las fórmulas dedicadas y cómo el engine rutea genérico vs dedicado**.

---

## Priorización (foco *weapons*)

| Prioridad | Capa | Costo | Naturaleza |
|---|---|---|---|
| ✅ hecho | Capa 3 (condition incarnon) | bajo | cerró drift |
| 1 — 🚧 | Capa 4 (nodos faltantes) | bajo por stat (patrón validado con `punch_through`) | toca solo `ItemRepository.getDNA()` |
| 2 | Capa 2 (warframes, vía linaje Rhino) | medio | `WarframeRepository` net-new |
| 3 | Capa 1 parcial (arcanes) | medio | mods con más condition |
| diferido (RED) | Capa 5 (scaling) + ability-like | alto | requiere contrato de ruteo genérico vs dedicado |
