# Accuracy / Spread

> Estado: activo
> Rol: mecánica de precisión — accuracy como inverso del spread, mods, contexto shotgun
> Fuente de verdad de: definición (deviation en grados), relación accuracy↔spread, fórmula de modding
> No usar para: catálogo de deviation por arma
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Accuracy

## Definición

**Accuracy** = qué tan cerca caen los disparos del retículo. Post-Update 35.5 (2024) se muestra en
**grados** (`Deviation With Aim` / `Max Deviation`): menor desviación = mayor precisión. Antes era
una escala 0-100.

**Spread** = el **cono de dispersión** (en grados). `Accuracy` es el stat mostrado, derivado del spread.

## Accuracy y Spread son el mismo stat (inversos)

> *"Bonuses that increase accuracy decrease the deviation (spread) of a shot."*

Son la misma mecánica subyacente con signo invertido: `+40% Accuracy` = `−40% Spread`.

```text
Base Accuracy   = 100 / Average Spread
Average Spread  = (Min Spread + Max Spread) / 2

Modificado:     Modified Spread = [Base Spread × (1 + %mod)] + Flat mod
```

> Algunos mods que reducen accuracy lo hacen aumentando el spread por una cantidad **flat**, pese a
> mostrarse como porcentaje en el juego.

## Shotgun vs hitscan — diferencia de contexto, no de stat

Shotguns (y armas con multishot) disparan al menos un pellet centrado en el retículo; los demás
toman trayectorias aleatorias dentro del cono de spread. La distribución de pellets es propiedad
**del arma** (contexto), no un stat distinto — el stat subyacente (spread/accuracy) es el mismo.

Para proyectiles, la trayectoria del proyectil principal puede descentrarse con multishot, más
pronunciado cuanto más lenta es la velocidad del proyectil (ver [`projectile-speed.md`](projectile-speed.md)).

## Mods

Los mods de spread se muestran como "Accuracy" en el juego:

| Mod | Efecto en juego |
|---|---|
| Narrow Barrel | "On Hit: +X% Accuracy when Aiming" |
| Tainted Shell | "+X% Accuracy / −Y% Fire Rate" |
| Heavy Caliber, Magnum Force, Vicious Spread | empeoran accuracy / aumentan spread |

## Nota sobre fire rate

> *"A weapon's accuracy value generally becomes more important the higher its Fire Rate is, as the
> weapon's successive shot grouping worsens the faster it fires."*
