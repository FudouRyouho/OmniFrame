# Archon Shards Integration

> Estado: activo
> Rol: categorizar qué necesita el engine para soportar Archon Shards de forma semi-completa
> Fuente de verdad de: requisitos de modelado y límites por fase del builder
> No usar para: tabla canónica de bonuses o acquisition
> Depende de: `../../domains/data/warframes/archon-shards.md`
> Última actualización: 2026-03-28

## Objetivo

Definir qué parte de `Archon Shards` puede entrar en el engine sin romper el alcance
real de v1.

## Regla de alcance

v1 no modela:

- DoT
- simulación temporal
- estado vivo del enemigo a lo largo de una ventana de combate
- contadores on-kill
- ramps de stacks dependientes del tiempo

Por lo tanto, `Archon Shards` no entra como un bloque único. Entra por categorías.

## Modelos mínimos requeridos

### 1. Modelo mínimo de Warframe

Necesario:

- `health`
- `shield`
- `armor`
- `energy`
- `abilityStrength`
- `abilityDuration`
- `abilityRange`
- `abilityEfficiency`

Necesario para shards concretos:

- `maxEnergy` calculado después de mods y bonuses planos
- `castingSpeed`
- `parkourVelocity`
- `healthRegen` si se quiere exponer Azure regen

Base documental:

- `../../domains/data/warframes/source-model.md`

### 2. Modelo mínimo de armas

Necesario:

- `primary.statusChance`
- `secondary.criticalChance`
- `melee.criticalDamage`
- `primary.damageBreakdownByType`

Necesario para Violet:

- soportar damage buckets por tipo para sumar `Electricity`

Base documental:

- `../../domains/data/weapons/source-model.md`
- `../../domains/data/weapons/attack-structure.md`

### 3. Modelo mínimo de tipos de daño

Necesario:

- damage families
- elemental combinations
- tags de damage type

No necesario en v1:

- daño total de proc
- timeline de ticks
- resistencias por facción

Base documental:

- `../../reference/wiki/mechanics/damage-types.md`

### 4. Contexto mínimo

Para shards semi-completos, el engine necesita al menos poder evaluar condiciones
simples:

- `maxEnergy > 500`
- bonus fijo activo o no activo

No necesita aún:

- enemigos afectados por status vivo
- kills por tipo de daño
- stacks por kill

## Matriz de soporte propuesta

### Soportable en v1

Estas opciones son directas o dependen solo del propio build:

- Crimson: `Melee Critical Damage`
- Crimson: `Primary Status Chance`
- Crimson: `Secondary Critical Chance`
- Crimson: `Ability Strength`
- Crimson: `Ability Duration`
- Amber: `Casting Speed`
- Amber: `Parkour Velocity`
- Azure: `Health`
- Azure: `Shield Capacity`
- Azure: `Energy Max`
- Azure: `Armor`
- Violet: `Primary Electricity Damage`
- Violet: `Melee Critical Damage` si el engine ya calcula `maxEnergy`

### Soportable parcialmente en v1

- Amber: `Energy filled on spawn`
  puede quedar como metadata de runtime, no como stat de combate
- Azure: `Health Regenerated`
  soportable si el output expone regen, pero no es prioridad
- Emerald: `Increase max Corrosive stacks`
  puede entrar como metadata o capability flag, sin simulación de corrosive real

### Dejar para v2/v3

- Emerald: `Toxin Status Effects deal more damage`
- Emerald: `Recover Health on Toxin status damage`
- Emerald: `Ability Damage on enemies affected by Corrosion`
- Topaz: `Health per enemy killed with Blast Damage`
- Topaz: `Shields cuando se mata un enemigo con Blast Damage`
- Topaz: `Secondary Critical Chance on Heat-status kill`
- Topaz: `Ability Damage on enemies affected by Radiation`
- Violet: `Ability Damage on enemies affected by Electricity`
- Violet: `pickup conversion`
- Amber: `orb effectiveness`

La razón común es siempre la misma:

- dependen de enemy-state
- dependen de on-kill
- dependen de DoT
- dependen de runtime/pickups fuera del cálculo estático

## Orden recomendado de integración

1. soportar shards directos de Warframe
2. soportar shards directos de arma
3. soportar threshold simple `maxEnergy > 500`
4. dejar metadata para shards condicionales
5. recién después pensar en shards dependientes de status o kill loops

## Salida esperada del engine

Aunque una opción no se calcule todavía, el motor puede devolver metadata clara:

```ts
interface UnsupportedModifierNote {
  source: "archon_shard"
  effectId: string
  reason:
    | "requires_dot"
    | "requires_enemy_state"
    | "requires_on_kill_tracking"
    | "requires_runtime_pickup_system"
}
```

Eso permite:

- mostrar el shard en UI
- no perder trazabilidad
- evitar falsos positivos de calculo

## Donde seguir

- `status.md`
- `dependencies.md`
- `../../domains/engine/architecture.md`
- `../../domains/data/warframes/archon-shards.md`
