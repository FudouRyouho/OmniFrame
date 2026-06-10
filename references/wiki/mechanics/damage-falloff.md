# Damage Falloff

> Estado: activo
> Rol: reducción de daño por distancia — fórmula lineal, escalado por projectile speed
> Fuente de verdad de: fórmula daño(distancia), semántica start/end/reduction, arquetipos con falloff
> No usar para: catálogo de valores de falloff por arma
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Damage_Falloff

## Definición

El daño de ciertas armas **varía con la distancia al blanco**. Daño pleno hasta una distancia
inicial, decae **linealmente** hasta una distancia final, y queda en un piso mínimo más allá.

> *"Damage is highest if closer than the first distance, and minimal beyond the second distance."*

Tres parámetros por ataque:

| Parámetro | Significado |
|---|---|
| `start` | distancia (m) hasta la que se hace **100%** del daño |
| `end` | distancia (m) a partir de la cual se hace el **mínimo** (piso) |
| `reduction` | **fracción reducida** en el piso (0.5 = queda 50%; 0.9667 = queda 3.33%) |

## Fórmula

```text
factor(d) = 1 − reduction × clamp( (d − start) / (end − start), 0, 1 )
daño(d)   = daño_base × factor(d)
```

Interpolación **lineal** entre `start` y `end`. Ejemplo (base 200, falloff 10–30m, reduction 0.8):

| Distancia | Factor | Daño |
|---|---|---|
| 0–10m | 1.00 | 200 |
| 15m | 0.80 | 160 |
| 20m | 0.60 | 120 |
| 25m | 0.40 | 80 |
| 30m+ | 0.20 | 40 |

## Escalado por Projectile Speed

> *"For weapons with damage falloff values, Warframe Abilities and Mods (including Rivens) that
> alter Projectile Speed will modify their falloff ranges accordingly, making them more or less
> effective at longer distances."*

Projectile Speed escala `start` y `end` **proporcionalmente** (no toca `reduction`). Por eso
projectile speed importa incluso en armas hitscan **con** falloff — ver
[`projectile-speed.md`](projectile-speed.md).

## Arquetipos con falloff

- **Shotguns:** falloff agregado a todas (Update 7.9).
- **Sniper rifles:** piso fijo 50%, falloff 400→600m (universal).
- **AoE / explosivos:** el falloff mide distancia al **epicentro** de la explosión, no al jugador.
- **Hitscan con falloff:** la mayoría de hitscan tienen falloff desde ~300m (límite universal).

## Caveats / bugs conocidos

- **Condition Overload (aditivo):** su bonus de daño **ignora** el falloff.
- **Incarnon Genesis (base damage):** los aumentos de daño base **ignoran** el falloff.
- **Continuous / Beam:** no tienen falloff; usan límites de Beam Length propios.
- **Per-pellet:** el falloff se evalúa por pellet.
