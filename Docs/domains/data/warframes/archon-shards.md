# Archon Shards

> Estado: activo
> Rol: resumir la tabla canónica de Archon Shards con foco en datos y futura serialización
> Fuente de verdad de: tipos, bonuses y categorías de shard que el proyecto podría pasar a JSON
> No usar para: acquisition, lore o flujo de Helminth
> Última actualización: 2026-03-28

## Que es

`Archon Shards` son sockets permanentes sobre un Warframe que aplican un bonus elegido
entre varias opciones.

Para OmniFrame importan por dos motivos:

- son parte del layout final del Warframe
- mezclan bonuses directos, thresholds y condiciones de combate

## Reglas base

- un Warframe puede tener `5` shard slots
- cada shard ofrece `1` bonus elegido entre su tabla
- `Tauforged` vale `1.5x` el bonus normal
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

## Tabla mínima para JSON futuro

La serialización futura debería poder expresar:

- tipo de shard
- variante normal o tauforged
- opción elegida
- valor base
- valor tauforged
- categoría del bonus
- condición si existe
- notas de stacking o exclusiones

## Tabla resumida de bonuses

### Crimson

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Melee Critical Damage | `+25%` | `+37.5%` | weapon direct |
| Primary Status Chance | `+25%` | `+37.5%` | weapon direct |
| Secondary Critical Chance | `+25%` | `+37.5%` | weapon direct |
| Ability Strength | `+10%` | `+15%` | warframe direct |
| Ability Duration | `+10%` | `+15%` | warframe direct |

### Amber

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Energy filled on spawn | `+30%` | `+45%` | utility runtime |
| Health Orb effectiveness | `+100%` | `+150%` | pickups |
| Energy Orb effectiveness | `+50%` | `+75%` | pickups |
| Casting Speed | `+25%` | `+37.5%` | warframe direct |
| Parkour Velocity | `+15%` | `+22.5%` | movement utility |

### Azure

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Health | `+150` | `+225` | warframe direct |
| Shield Capacity | `+150` | `+225` | warframe direct |
| Energy Max | `+50` | `+75` | warframe direct |
| Armor | `+150` | `+225` | warframe direct |
| Health Regenerated | `+5/s` | `+7.5/s` | regen runtime |

### Emerald

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Toxin Status deals more damage | `+30%` | `+45%` | DoT conditional |
| Recover health on Toxin status damage | `+2` | `+3` | DoT conditional |
| Ability Damage on Corrosion target | `+10%` | `+15%` | enemy-state conditional |
| Increase max Corrosive stacks | `+2` | `+3` | status-cap modifier |

### Topaz

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Health per enemy killed with Blast | `+1` | `+2` | on-kill conditional |
| Shields on Blast kill | `+5` | `+7.5` | on-kill conditional |
| Secondary Crit on Heat-status kill | `+1%` | `+1.5%` | on-kill stacking |
| Ability Damage on Radiation target | `+10%` | `+15%` | enemy-state conditional |

### Violet

| Bonus | Normal | Tauforged | Categoria |
|---|---|---|---|
| Ability Damage on Electricity target | `+10%` | `+15%` | enemy-state conditional |
| Primary Electricity Damage | `+30%` | `+45%` | weapon direct conditional-scale |
| Melee Critical Damage, double si `maxEnergy > 500` | `+25%` | `+37.5%` | weapon threshold |
| Health pickups give energy / energy pickups give health | `+20%` | `+30%` | pickups conversion |

## Categorías útiles para engine

El builder no debería leer shards como una lista plana de nombres. Conviene separarlos
por comportamiento:

| Categoria | Ejemplos |
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

## Shape del schema

> Decisiones de respaldo: `../../../decisions/stage-0-architecture-decisions.md` (C29, C30, C31)

### Definición del efecto (en el schema)

```ts
interface ArchonShardEffect {
  shardType: "crimson" | "amber" | "azure" | "topaz" | "violet" | "emerald"
  effectId: string           // identificador único del efecto dentro del tipo de shard
  category:                  // comportamiento para el engine
    | "warframe_direct_flat"
    | "warframe_direct_percent"
    | "weapon_direct_percent"
    | "weapon_threshold"
    | "weapon_elemental"
    | "pickup_effect"
    | "enemy_state_conditional"
    | "on_kill_conditional"
    | "dot_conditional"
    | "status_cap_modifier"
  upgradeType: string        // vocabulario de upgrade-taxonomy.md
  baseValue: number          // valor normal; tauforged = baseValue * 1.5 (engine, via slot)
  condition: string | null   // vocabulario compartido (C31). null = siempre activo
}
```

### Slot en el layout (en el Builder)

```ts
interface EquippedShard {
  shardType: "crimson" | "amber" | "azure" | "topaz" | "violet" | "emerald"
  effectId: string
  isTauforged: boolean       // engine calcula baseValue * 1.5 cuando true
}
```

### Casos complejos como condicionales (C30)

Los tres efectos con mecánica especial se expresan con el mismo patrón:

| Efecto | Expresión en schema |
|---|---|
| Violet electricity +30% base | `baseValue: 30, condition: null` |
| Violet electricity +10% por shard crimson/azure/violet | entrada separada: `baseValue: 10, condition: "per_shard_crimson_azure_violet"` |
| Violet melee crit, doble si `maxEnergy > 500` | `baseValue: 25, condition: "max_energy_over_500"` — engine aplica x2 cuando condición activa |
| Topaz secondary crit +1% por kill con Heat status | `baseValue: 1, condition: "on_kill_heat_status"` — acumulación y cap son lógica del engine |

> Las entradas del vocabulario (`per_shard_crimson_azure_violet`, `max_energy_over_500`,
> `on_kill_heat_status`) se añaden al catálogo incremental compartido cuando este se formalice.

## Relevancia para v1

El punto de esta tabla no es soportar todas las variantes ya. Es dejar claro cuáles
son:

- bonuses directos
- bonuses con threshold simple
- bonuses que dependen de enemy-state
- bonuses que dependen de DoT o timeline

## Fuentes

- `https://wiki.warframe.com/w/Archon_Shard`
