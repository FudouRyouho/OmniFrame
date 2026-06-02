---
Estado: "referencia"
Rol: "Concepto canónico de Archon Shards — tipos, valores de wiki y categorización semántica"
Version: "v0.2.0"
Impacto_ID: "data-archon-concept"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-04-02"
Fecha_de_actualizacion: "2026-06-01"
---

# Archon Shards — Concepto

## Qué son

`Archon Shards` son sockets permanentes sobre un Warframe que aplican un bonus elegido
entre varias opciones.

Para OmniFrame importan por dos motivos:

- son parte del layout final del Warframe
- mezclan bonuses directos, thresholds y condiciones de combate

## Reglas base

- un Warframe puede tener `5` shard slots
- cada shard ofrece `1` bonus elegido entre su tabla
- `Tauforged` vale `1.5x` el bonus normal (con excepciones — ver tabla)
- existen shards primarios y shards fusionados

## Tipos

| Tipo | Perfil |
|---|---|
| `Crimson` | ability stats y weapon stats |
| `Amber` | utility y pickups |
| `Azure` | survivability del Warframe |
| `Topaz` | Blast, Heat, Radiation |
| `Violet` | Electricity, melee crit, pickups, energía |
| `Emerald` | Toxin, Corrosive |

## Tabla literal de bonuses (wiki)

Fuente de referencia: `https://wiki.warframe.com/w/Archon_Shard`.

### Crimson

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Melee Critical Damage | `+25%` | `+37.5%` | Aditivo con buffs similares. Afecta Exalted del tipo correspondiente. |
| Primary Status Chance | `+25%` | `+37.5%` | Aditivo con buffs similares. Afecta Exalted del tipo correspondiente. |
| Secondary Critical Chance | `+25%` | `+37.5%` | Aditivo con buffs similares. Afecta Exalted del tipo correspondiente. |
| Ability Strength | `+10%` | `+15%` | Aditivo con buffs similares. |
| Ability Duration | `+10%` | `+15%` | Aditivo con buffs similares. |

### Amber

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Maximum Energy filled on Spawn | `+30%` | `+45%` | Aditivo con buffs similares (ej. Preparation). |
| Effectiveness on Health Orbs | `+100%` | `+150%` | Impacta Universal Orbs. No afecta conversión de Equilibrium. |
| Effectiveness on Energy Orbs | `+50%` | `+75%` | Impacta Universal Orbs. |
| Casting Speed | `+25%` | `+37.5%` | Aditivo con buffs similares. |
| Parkour Velocity | `+15%` | `+22.5%` | Aditivo con buffs similares. |

### Azure

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Health | `+150` | `+225` | Incremento flat post-bonuses. |
| Shield Capacity | `+150` | `+225` | No aplica a Inaros, Kullervo, Nidus. |
| Energy Max | `+50` | `+75` | No aplica a Hildryn, Lavos. |
| Armor | `+150` | `+225` | Incremento flat post-bonuses. |
| Health/s Regenerated | `+5` | `+7.5` | Regeneración flat por segundo. |

### Emerald

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Toxin Status Effects deal more damage | `+30%` | `+45%` | Aditivo con otras fuentes de Status Damage. |
| Recover Health each time enemies are damaged by Toxin Status | `+2` | `+3` | Trigger por tick de daño de estado Toxin. |
| Ability Damage on enemies affected by Corrosion Status | `+10%` | `+15%` | Modificador único; multiplica con Ability Strength. |
| Increase max stacks of Corrosion Status | `+2` | `+3` | Permite superar 10 stacks para corrosión aplicada por arma/habilidad. |

### Topaz

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Health per enemy killed with Blast Damage | `+1` | `+2` | Máx. `300` / `450`; se resetea al revivir. |
| Regenerate Shields on Blast kill | `+5` | `+7.5` | No genera overshields. |
| Secondary Critical Chance per kill on Heat-status enemy | `+1%` | `+1.5%` | Máx. `50%` / `75%`; se resetea al revivir. |
| Ability Damage on enemies affected by Radiation Status | `+10%` | `+15%` | Modificador único; multiplica con Ability Strength. |

### Violet

| Bonus | Normal | Tauforged | Notas |
|---|---|---|---|
| Ability Damage on enemies affected by Electricity Status | `+10%` | `+15%` | Modificador único; multiplica con Ability Strength. |
| Primary Electricity Damage | `+30%` | `+45%` | Bonus adicional de `+10%`/`+15%` por cada shard Crimson/Azure/Violet equipado. |
| Melee Critical Damage | `+25%` | `+37.5%` | Se duplica si `maxEnergy > 500` (no activa en 500 exacto). |
| Health pickups ↔ Energy pickups conversion | `+20%` | `+30%` | Aditivo con Equilibrium. |

## Categorización semántica para engine

El builder no debería leer shards como una lista plana de nombres. Conviene separarlos
por comportamiento:

| Categoría | Ejemplos |
|---|---|
| `warframe_direct_flat` | Azure health, shield, energy, armor |
| `warframe_direct_percent` | Crimson strength, duration; Amber cast speed |
| `weapon_direct_percent` | Crimson melee crit, primary status, secondary crit |
| `weapon_threshold` | Violet melee crit con `maxEnergy > 500` |
| `weapon_elemental` | Violet primary electricity |
| `pickup_effect` | Amber orb effectiveness, Violet pickup conversion |
| `enemy_state_conditional` | Emerald/Topaz/Violet ability damage sobre status |
| `on_kill_conditional` | Topaz health, shields, secondary crit |
| `dot_conditional` | Emerald toxin status damage, toxin heal |
| `status_cap_modifier` | Emerald corrosive max stacks |

## Pendiente: vocabulario incremental compartido

Algunos bonuses requieren tokens de condición que aún no están formalizados (`per_shard_crimson_azure_violet`, `max_energy_over_500`, `on_kill_heat_status`, etc.). Las entradas del vocabulario se añaden al catálogo incremental compartido cuando éste se formalice.

Estado actual de bloqueos por falta de vocabulario: ver [`upgrade-mapping.md`](upgrade-mapping.md).

## Relevancia para integración

El punto de esta tabla no es soportar todas las variantes ya. Es dejar claro cuáles son:

- bonuses directos
- bonuses con threshold simple
- bonuses que dependen de enemy-state
- bonuses que dependen de DoT o timeline

Cada categoría tiene implicaciones distintas para el engine.

## Documentos relacionados

- [`schema.md`](schema.md) — contrato técnico del JSON
- [`upgrade-mapping.md`](upgrade-mapping.md) — estado actual del mapeo a tokens D-6
