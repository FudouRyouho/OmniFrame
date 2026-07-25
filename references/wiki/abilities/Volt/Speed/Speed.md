# Speed — Volt (habilidad 2)

> **Fuente:** `https://wiki.warframe.com/w/Speed?action=raw` — capturado 2026-07-24 vía `?action=raw`
> (raw íntegro en `Speed.wikitext`, mismo directorio). Hechos del juego, no decisiones de OmniFrame.

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

## Divergencia con el override (a reconciliar, NO usar el override como fuente)

`ability-stats.override.json` (`/Lotus/Powersuits/PowersuitAbilities/SpeedAbility`) está sin
reconciliar — mismo síntoma que Rhino antes de su pasada:

| Campo | Override | Wiki (rank 3) |
|---|---|---|
| Speed Buff | 50% | **75%** |
| Reload Speed Buff | 17% | **25%** |
| Duration | 10s | **12s** (10s es rank 1) |
| Melee Attack Speed | **ausente** | 75% |
| Augment Shocking Speed | **ausente** | existe |
| Label de Drain | `Drain: \|val1\|` | falta el token `<ENERGY>` |

## Fuentes

- https://wiki.warframe.com/w/Speed
