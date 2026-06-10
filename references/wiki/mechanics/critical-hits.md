# Critical Hits

> Estado: activo
> Rol: sistema de crit — chance, tiers y damage multiplier promedio
> Fuente de verdad de: fórmulas de critical chance, tiers, multiplicador por tier y daño promedio
> No usar para: edge cases de quantization o parity perfecta de cada arma
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Critical_Hit

## Que es

El sistema de crit define:

- si un hit hace crit o no
- en que tier cae ese crit
- que multiplicador final aplica sobre el hit

## Fórmula base de critical chance

La regla general es:

```text
totalCritChance = baseCritChance * (1 + relativeCritBonus) + absoluteCritBonus
```

Donde:

- `relativeCritBonus` suma mods y buffs relativos al base crit
- `absoluteCritBonus` suma los bonuses flat aplicados después

## Fórmula base de critical damage

```text
totalCritDamage = baseCritDamage * (1 + relativeCritDamageBonus) + absoluteCritDamageBonus
```

## Resolución de tiers

Conviene trabajar con crit chance en formato decimal:

```text
totalCritChanceDecimal = totalCritChancePercent / 100
tier = floor(totalCritChanceDecimal)
chanceToNextTier = frac(totalCritChanceDecimal)

if roll < chanceToNextTier:
  tier = tier + 1
```

Interpretación:

- `0.75` = 75% de chance de yellow crit
- `1.75` = yellow garantizado y 75% de chance de orange crit
- `2.40` = orange garantizado y 40% de chance de red crit

## Multiplicador por tier

```text
criticalTierMultiplier = 1 + tier * (totalCritDamage - 1)
```

Ejemplos rápidos:

- `tier 1` usa el crit damage normal
- `tier 2` agrega otra vez el exceso sobre `1.0`
- `tier 3+` sigue escalando linealmente por tier

## Daño promedio esperado

Para comparar builds sin simular cada hit:

```text
averageDamageMultiplier = 1 + totalCritChanceDecimal * (totalCritDamage - 1)
averageDamageOnHit = moddedDamage * averageDamageMultiplier
```

Esto ya contempla crit chance >100% si `totalCritChanceDecimal` vale, por ejemplo, `1.75`.

## Headcrit

Para weak points / headshots, la fórmula es:

```text
headshotCritTierMultiplier = headshotMultiplier * (1 + tier * (2 * totalCritDamage - 1))
```

En la mayoría de casos:

- `headshotMultiplier = 3.0`

## Regla importante con pellets y multishot

Cada pellet o instancia de multishot hace su propia tirada de crit.

Esto importa mucho para:

- shotguns
- armas con innate multishot
- cualquier cosa que combine crit con multishot alto

## Edge cases conocidos

- quantization exacta del base critical damage
- buffs que alteran la base antes de la quantization
- multiplicadores de headshot por tipo de enemigo

## Fuentes

- https://wiki.warframe.com/w/Critical_Hit
- https://wiki.warframe.com/w/Damage
