# Damage Falloff

> Estado: activo
> Rol: reducción de daño por distancia — interpolación lineal, límites de alcance y escalado por projectile speed
> Fuente de verdad de: fórmula daño(distancia), semántica de los tres parámetros, el rango de mínimos por arma, los límites universales de alcance, AoE falloff
> No usar para: valores de falloff por arma (están en el arsenal) · beam range de armas continuas
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Damage_Falloff
> Fuente actualizada: 2026-05-24
> Raw: damage-falloff.wikitext

## Definición

> *"Damage varies depending on the distance to the target. Damage is highest if closer than the first
> distance, and minimal beyond the second distance."*

Daño pleno hasta la primera distancia, decrecimiento **lineal** hasta la segunda, y un piso constante
más allá.

| Parámetro | Significado |
|---|---|
| `start` | distancia (m) hasta la que se hace **100%** del daño |
| `end` | distancia (m) a partir de la cual se hace el **mínimo** |
| `reduction` | fracción reducida en el piso (0.8 ⇒ queda el 20%) |

```text
factor(d) = 1 − reduction × clamp( (d − start) / (end − start), 0, 1 )
daño(d)   = daño_base × factor(d)
```

Ejemplo de la wiki — 200 de daño base, falloff 10–30 m, máximo 80%:

| Distancia | 0–10 m | 15 m | 20 m | 25 m | 30 m+ |
|---|---|---|---|---|---|
| Daño | 200 | 160 | 120 | 80 | 40 |
| % del original | 100% | 80% | 60% | 40% | 20% |

## El piso varía mucho por arma

El porcentaje de daño mínimo **difiere de arma a arma**: puede ser tan alto como **75%** (Bronco) o
tan bajo como **6.25%** (Redeemer).

**Todos los sniper rifles** comparten el mismo perfil: mínimo **50%**, falloff de **400 a 600 m**.

## Límite de alcance — no es lo mismo que el falloff

Desde la versión 22, **toda arma hitscan** —tenga o no stat de falloff— está limitada a un alcance
universal de **300 metros**: más allá de esa distancia **no registra impactos**. Los sniper rifles
tienen su propio límite universal de **1000 metros**.

Se nota sobre todo en mapas grandes como los Landscapes.

## Escalado por Projectile Speed

> *"For weapons with damage falloff values, Warframe Abilities and Mods (including Rivens) that alter
> Projectile Speed will modify their falloff ranges accordingly."*

- **Hitscan sin falloff**: completamente inmune a modificadores de projectile speed, positivos o
  negativos — lo que los vuelve seguros para tomar projectile speed como stat negativo en un Riven.
- **Armas continuas**: tienen límites de rango propios de cada arma, y algunas tienen falloff. El
  projectile speed afecta **el falloff, no el beam range**.

Ver [`projectile-speed.md`](projectile-speed.md).

## El CO aditivo ignora el falloff por rango

Los bonus tipo Condition Overload que apilan **aditivamente** hacen una recalculación interna que
**omite el damage falloff por rango** — pero **no** el ramp-up de los beams. Dato de
`Condition Overload (Mechanic)`, no de esta página: ver
[`condition-overload.md`](condition-overload.md) §La matemática.

## AoE falloff

En armas de área, el falloff mide la distancia al **epicentro de la explosión**, y decrece cuanto más
lejos esté el enemigo de él.

> El falloff de estas armas **sólo puede aumentarse con mods que aumenten el radio de explosión.**

## Mods que extienden la distancia de falloff

Aumentando el rango del arma: Ballista Measure, Fatal Acceleration, Galvanized Acceleration, Jet
Stream, Lethal Momentum, entre otros del raw.

## Fuentes

- https://wiki.warframe.com/w/Damage_Falloff
- [`projectile-speed.md`](projectile-speed.md) · [`multishot.md`](multishot.md) · [`sniper-combo.md`](sniper-combo.md)
