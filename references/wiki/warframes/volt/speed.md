# Speed — Volt (habilidad 2)

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Speed
> Fuente actualizada: 2026-04-06
> Raw: speed.wikitext

## Qué es

Volt energiza el área: él y sus aliados en rango ganan **tres buffs distintos** por una duración.
No hay fórmula compuesta — cada buff es `base × Ability Strength`, y **cada uno stackea ADITIVAMENTE**
con los mods del mismo stat.

## Valores por rank (verbatim)

| Stat | 0 | 1 | 2 | 3 (max) | Escala con |
|---|---|---|---|---|---|
| **Movement Speed** | 75% | 75% | 75% | **75%** | Strength |
| **Melee Attack Speed** | 75% | 75% | 75% | **75%** | Strength |
| **Reload Speed** | 10% | 15% | 20% | **25%** | Strength |
| **Duration** | 9s | 10s | 11s | **12s** | Duration |
| **Range** | 25m | 25m | 25m | **25m** | Range |

- **Energía:** 25 (`× Efficiency`).
- **Augment:** Shocking Speed.

## La composición (verbatim, el punto clave para el engine)

La wiki declara explícitamente el bucket de los tres buffs — **aditivo con los mods del mismo stat**,
con ejemplos numéricos:

```
movement:  Speed(75%) × Intensify(1.3) + Dispatch Overdrive(60%)
attack:    Speed(75%) × Intensify(1.3) + Fury(30%)
reload:    Speed(25%) × Intensify(1.3) + Quickdraw(48%)
```

*"The movement speed buff stacks **additively** with other movement speed modifiers."* (ídem attack
y reload.) Es la misma forma que Roar: el valor de la habilidad escala por Strength y **aterriza en
el pool aditivo** del stat destino. No hay bracket, no hay lectura cross-stat, no hay fórmula propia.

## Propiedades relevantes (anotadas para no asumir)

- **Cap asimétrico:** el aumento de movement speed está **capado en 150% para jugadores aliados**;
  **no hay cap para el Volt que castea**, ni para entidades no-jugador. El cap depende de *quién
  recibe*, no de la fuente — eje distinto a los caps por-fuente (Icy Avalanche, Recompense).
- Los aliados pueden hacer backflip para **quitarse** el buff (opt-out) — no modelable en C1 estático.
- Recasteable mientras está activo; no interrumpe otras acciones (incluida la recarga).
- Afecta la distancia de maniobras (slide, front flip, wall run) como consecuencia de la velocidad.

## Cómo lo muestra la UI del juego

La pantalla de habilidad **no** lista los tres buffs por separado: colapsa Movement Speed y Melee
Attack Speed en un solo renglón, `Speed Multiplier: 1,75x`, y lista Reload Speed aparte en
porcentaje. Los `75%` de la tabla de arriba y ese `1,75x` son el mismo hecho en dos unidades.

Detalle de los stats de movimiento: `../../../mechanics/movement-speed.md`.

## Fuentes

- https://wiki.warframe.com/w/Speed
