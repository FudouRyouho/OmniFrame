# Condition Overload

> Estado: activo
> Rol: resumen mínimo de CO y GunCO para el engine v1
> Fuente de verdad de: fórmulas base de CO-style bonuses y clasificación mínima de behavior types
> No usar para: catálogo exhaustivo de todas las armas y todos los edge cases de la wiki
> Última actualización: 2026-03-22

## Que es

`Condition Overload` es la familia de bonuses que aumenta daño contra objetivos que ya tienen estados activos.

Para el builder hay dos capas distintas:

- `CO` melee clásico
- `GunCO`, nombre de comunidad para el mismo patrón aplicado a armas de fuego

## Fuentes relevantes para v1

| Fuente | Clase | Bonus base |
|---|---|---|
| `Condition Overload` | melee | `+80%` por status unico |
| `Galvanized Aptitude` | rifle | `+40%` por status unico por stack, hasta `2` stacks |
| `Galvanized Savvy` | shotgun | `+40%` por status unico por stack, hasta `2` stacks |
| `Galvanized Shot` | secondary | `+40%` por status unico por stack, hasta `3` stacks |

## Fórmula mínima

### CO melee

```text
coBonus = coPerStatus * uniqueStatusCount
meleeTotalDamage = baseDamage * [1 + additiveDamageBonuses + coBonus] * otherSupportedMultipliers
```

Para el mod actual:

```text
coPerStatus = 0.8
```

### GunCO

```text
guncoBonus = perStatusBonus * activeStacks * uniqueStatusCount
```

Ejemplos de `perStatusBonus`:

- `Galvanized Aptitude = 0.4`
- `Galvanized Shot = 0.4`

Entonces:

- Aptitude a 2 stacks -> `0.8` por status
- Shot a 3 stacks -> `1.2` por status

## Secuencia importante dentro del mismo disparo

Los nuevos estados aplicados por el mismo hit no mejoran ese mismo impacto inicial.
Pero si el disparo genera varias instancias secuenciales, las siguientes sí pueden heredar el bonus.

Eso importa mucho en:

- shotguns
- innate multishot
- beam/multishot raro

Modelo simple:

```text
pellet1 aplica status A
pellet2 ya puede recibir bonus por status A
pellet3 puede recibir bonus por status A + status B
```

## Behavior types que el engine v1 debe distinguir

La wiki comunitaria de `Condition Overload (Mechanic)` separa 3 familias útiles para builder:

### 1. Adding

Se comporta como un bonus aditivo junto a `Serration`, `Hornet Strike`, etc.

Modelo útil:

```text
finalDamage ~= baseDamage * (1 + additiveDamageBonuses + guncoBonus) * otherSupportedMultipliers
```

Este es el caso más común en hitscan normales.

### 2. Multiplying

El bonus CO-like multiplica por fuera del grupo aditivo tradicional.

Modelo útil:

```text
finalDamage ~= baseDamage * (1 + additiveDamageBonuses) * (1 + guncoBonus) * otherSupportedMultipliers
```

Este caso suele ser el más fuerte y aparece mucho en projectiles.

### 3. Does not apply

No afecta ese componente del ataque.

Caso tipico:

- `radial explosion damage`

## Seed table para clasificación canónica futura

Esta tabla no pretende cubrir todo. Solo fija el shape de la referencia futura y deja ejemplos útiles ya verificados.

| Weapon | Attack Name | Projectile Type | Math/Behavior Type | Nota |
|---|---|---|---|---|
| `Braton` | `Normal Attack` | `Hitscan` | `Adding` | caso normal esperado |
| `Arca Plasmor` | `Normal Attack` | `Projectile/Wave` | `Multiplying` | proyectil con GunCO fuerte |
| `Latron Incarnon` | `Incarnon Mode` | `Projectile` | `Multiplying` | el AoE separado no toma CO |
| `Paris` | `Charged Shot` | `Projectile` | `Adding` | usa base del disparo no cargado |
| `Ogris` | `Explosion Radius` | `AoE` | `Does not apply` | ejemplo clásico de exclusión |

## Lo que sí conviene modelar ya

- conteo de `uniqueStatusCount`
- stacks activos de `Galvanized` mods
- flag de comportamiento por ataque: `adding`, `multiplying`, `none`
- separacion entre `direct hit` y `radial`

## Lo que puede esperar

Dejar para después:

- catálogo completo por arma/attack
- stance edge cases de melee
- interacciones raras con perks Incarnon o child projectiles exoticos

## Datos que el engine debería guardar

- `coStyleBonusPerStatus`
- `coStyleStacks`
- `uniqueStatusCount`
- `attackBehaviorType`
- `isDirectHit`
- `hasRadialComponent`
- `attackId`

## Fuentes

- `https://wiki.warframe.com/w/Condition_Overload_(Mechanic)`
- `https://wiki.warframe.com/w/Condition_Overload`
- `https://wiki.warframe.com/w/Galvanized_Aptitude`
- `https://wiki.warframe.com/w/Galvanized_Shot`
