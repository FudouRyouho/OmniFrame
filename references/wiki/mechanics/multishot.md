# Multishot

> Estado: activo
> Rol: resumen mínimo del sistema de multishot para el engine v1
> Fuente de verdad de: fórmula de projectile count y diferencias clave entre projectile, pellet y beam
> No usar para: catálogo completo de armas con innate multishot
> Última actualización: 2026-03-22

## Que es

`Multishot` aumenta la cantidad de instancias de daño disparadas por cada unidad de munición.

Para engine v1 importa porque:

- sube daño esperado
- sube cantidad de tiradas de crit
- sube cantidad de tiradas de status
- cambia bastante el comportamiento de beam/continuous weapons

## Fórmula base

```text
totalProjectiles = weaponProjectileCount * (1 + multishotModifier)
guaranteedProjectiles = floor(totalProjectiles)
chanceExtraProjectile = frac(totalProjectiles)
```

Ejemplos:

- `1.0` -> 1 proyectil
- `2.8` -> 2 proyectiles garantizados y 80% de chance de un tercero
- `7.0` -> 7 pellets siempre

## Regla de oro para armas normales

Cada proyectil o pellet:

- hace su propia tirada de crit
- hace su propia tirada de status
- puede pegar o fallar por separado

Por eso multishot mejora mucho el daño promedio aunque el daño por proyectil individual no cambie.

## Continuous / beam weapons

Este es el caso que más conviene documentar bien porque no se comporta como un rifle normal.

En beam/continuous weapons:

- multishot no crea más ticks físicos
- el tick existente puede recibir daño extra según el valor rodado de multishot
- la status chance efectiva por tick también escala con ese valor rodado

Modelo útil para v1:

```text
rolledMultishotInstances =
  floor(totalProjectiles) + (roll < frac(totalProjectiles) ? 1 : 0)

beamTickDamage = baseTickDamage * rolledMultishotInstances
beamEffectiveStatusChancePerTick = baseStatusChance * rolledMultishotInstances
```

Nota importante:

- esto hace que `Slash`, `Heat`, `Toxin`, `Electricity` y `Gas` escalen muy bien en beams, porque multishot mejora daño del tick y también la frecuencia de procs

## Implicacion para status

Para builder, `multishot` no cambia la fórmula de proc chance por tipo, pero sí cambia cuántas oportunidades hay por disparo.

Para proyectiles/pellets:

```text
expectedProcsPerTrigger ~= expectedHitInstances * statusChancePerHit
```

Para beams:

- la cantidad de ticks no cambia
- cambia la fuerza efectiva del tick y la status chance efectiva de ese tick

## Casos que el engine debe distinguir

Como mínimo, el engine debería separar:

- `hitscan-single`
- `projectile-single`
- `pellet-shot`
- `beam-continuous`
- `direct-hit + radial` mixto

Esta separación no es solo por multishot. También afecta `GunCO`, status y AoE.

## Que modelar ya en v1

- projectile count esperado
- pellet count esperado
- tirada independiente de crit/status por instancia
- comportamiento especial de beams

Dejar para después:

- accuracy y spread real por distancia
- casos raros como speargun throw
- UI exacta del Arsenal

## Datos que el engine debería guardar

- `attackDeliveryType`
- `baseProjectileCount`
- `multishotModifier`
- `expectedProjectileCount`
- `critRollPerInstance`
- `statusRollPerInstance`
- `isContinuous`

## Fuentes

- `https://wiki.warframe.com/w/Multishot`
- `https://wiki.warframe.com/w/Critical_Hit`
- `https://wiki.warframe.com/w/Status_Effect`
