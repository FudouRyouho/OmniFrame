# Projectile Speed

> Estado: activo
> Rol: mecánica de velocidad de proyectil — qué armas la tienen, cómo la afectan los mods, interacción con falloff y multishot
> Fuente de verdad de: definición m/s, regla hitscan (no afectado salvo con falloff), escalado de falloff range
> No usar para: catálogo de valores de flight speed por arma
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Projectile_Speed

## Definición

**Projectile Speed** define qué tan rápido viaja la munición de un arma **no-hitscan** hacia el
blanco tras dejar el cañón. Medido en **m/s (metros por segundo)**.

## Hitscan: no afectado (salvo con falloff)

Un disparo hitscan es instantáneo — no hay proyectil que tenga velocidad.

> *"Hitscan weapons that do **not** list Damage Falloff values in their UI are completely
> unaffected by Projectile Speed modifications."*

El `do not` es clave. La regla completa:

- **Hitscan sin falloff** → projectile speed totalmente irrelevante.
- **Hitscan con falloff** → los mods de projectile speed **sí los afectan**, porque escalan su
  rango de falloff: *"will affect a weapon's entire Damage Falloff range accordingly, making them
  more or less effective at longer ranges."* El efecto cae en el rango de falloff, no en una
  velocidad (no existe proyectil que acelerar).

## Mods — porcentaje aditivo

Los mods de projectile speed aplican **porcentaje aditivo**, en ambas direcciones:

| Mod | Rango | Nota |
|---|---|---|
| Terminal Velocity / Feathered Arrows | +15% → +60% | rifle / bow |
| Whirlwind | +30% → +180% | glaives (thrown) |
| Entropy Flight | +35% → +140% | |
| Fatal Acceleration | +10% → +40% | shotgun |
| Heavy Warhead | −12.5% → −50% | launchers (trade por AoE) |

## Interacciones

- **Damage Falloff:** los mods escalan `start` y `end` proporcionalmente (no la reducción). Ver
  [`damage-falloff.md`](damage-falloff.md).
- **Multishot off-centering:** *"the trajectory of the main projectile can be off-centered by using
  multishot, with the effect being more pronounced the slower the Projectile Speed value is."*
  Projectile speed lento + multishot → mayor dispersión. Cruza con [`accuracy.md`](accuracy.md).
- **Continuous / Beam:** no tienen falloff; usan límites de Beam Length propios. Projectile Speed
  afecta su falloff, no el Beam Range.
- **Thrown:** vuelan con su velocidad, sin mecánica especial.

## Edge-cases / bugs conocidos

- **Hitscan con falloff** (ver arriba): único caso donde projectile speed importa a un arma
  instantánea — vía el rango de falloff.
