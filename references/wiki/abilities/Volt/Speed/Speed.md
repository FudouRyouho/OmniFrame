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

## Relación con el override (reconciliado)

`ability-stats.override.json` (`/Lotus/Powersuits/PowersuitAbilities/SpeedAbility`) se deriva de
`references/game-ui/Volt.md` y coincide con la wiki en los tres buffs, la duración (12s) y el
augment.

La única divergencia de **forma** que queda es deliberada: el juego colapsa Movement Speed y Melee
Attack Speed en un solo renglón (`Speed Multiplier: 1,75x`), y el `.md` captura la pantalla. Los dos
destinos se anotan sobre esa misma línea (`$$AVATAR_ADD_MOVEMENT_SPEED $$MELEE_ADD_ATTACK_SPEED`) y
el `1,75x` se convierte a `+75%` al consumirlo, no al capturarlo. Ver
`../../../mechanics/movement-speed.md` y `docs/data/schemas/abilities/schema.md`.

## Fuentes

- https://wiki.warframe.com/w/Speed
