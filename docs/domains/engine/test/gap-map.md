---
Estado: "referencia"
Rol: "Mapa sistemático de lo que el engine ignora o procesa a medias — el territorio que el testing derivado convierte en cobertura, capa por capa"
Version: "v0.1.0"
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

### Capa 4 — Modifiers de weapon que se evaporan por falta de nodo
~18 tokens catalogados y mapeados que igual no aplican, porque el arma solo tiene los ~8 nodos que `ItemRepository` mapea. Se pierden: `projectile_speed`, `recoil`, `punch_through`, `zoom`, `ammo_max`, `ammo_efficiency`, `range`, `beam_range`, `headshot_mult`, `finisher_damage`, `slam_damage`, familias `combo_*` / `heavy_*`. El modifier se produce; ningún nodo lo recibe. Toca `ItemRepository` / `createBaseEntity`. Disparador documentado: **OQ-ENGINE-7** (`punch_through`).

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
| 1 | Capa 4 (nodos faltantes) | medio | toca `ItemRepository` / `createBaseEntity` |
| 2 | Capa 2 (warframes, vía linaje Rhino) | medio | `WarframeRepository` net-new |
| 3 | Capa 1 parcial (arcanes) | medio | mods con más condition |
| diferido (RED) | Capa 5 (scaling) + ability-like | alto | requiere contrato de ruteo genérico vs dedicado |
