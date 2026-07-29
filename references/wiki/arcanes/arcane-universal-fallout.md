# Arcane Universal Fallout

> Estado: activo
> Rol: arcano warframe — chance permanente-por-stack de drop de Universal Orb al matar, por proc de Radiation infligido por habilidades
> Fuente de verdad de: fórmula de chance acumulada + cap + persistencia del stack tras vencer el status
> No usar para: comportamiento exacto con múltiples procs de Radiation en el mismo frame (sin confirmar)
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Arcane_Universal_Fallout
> Raw: arcane-universal-fallout.wikitext

## Qué es

**Fórmula (Rank 5):** "Each Radiation Status Effect inflicted on enemies by Abilities gives a 6%
chance to drop a Universal Orb on enemy death."

## Escalado por rank

| Rank | % por status |
|---|---|
| 0 | 1% |
| 1-5 | +1% por rank, hasta 6% en Rank 5 |

## Mecánica de stacking (clave para el modelado)

- El incremento de chance es **permanente**: "Applying a Radiation status effect on an enemy
  **permanently** increases the chance" — no depende de que el status siga activo.
- **Persistencia:** "Drop chance increase persists after Radiation status effect wears off; No
  Radiation status effect need be present when an affected enemy is killed."
- **Cap duro:** "Chance is capped at **60%** for all ranks of the arcane" — a Rank 5 esto equivale a
  10 procs de Radiation acumulados (6% × 10 = 60%).

## Qué cuenta como trigger

Solo **Radiation Status Effects infligidos por habilidades de Warframe/Companion** — no por armas.
La wiki lista 40+ habilidades compatibles, la mayoría requiriendo que la habilidad o el arma esté
moddeada para daño Radiation (ej. "Only when Exalted Blade is modded for Radiation damage").

## Propiedades del Universal Orb

"Universal orbs created from this Arcane give **50** health and **50** energy."

## Notas de modelado (de la wiki, ya orientadas a simulador)

1. Sin cooldown intrínseco entre procs — el stacking es puramente lineal por aplicación de status.
2. RNG independiente por proc: cada uno de los 10 stacks acumulados en un enemigo representa un
   chequeo de 60% de drop independiente al morir.
3. No depende del daño infligido ni del tipo de enemigo — solo del conteo de stacks acumulados.
4. Arcano tradeable, requiere Mastery Rank 11+.

## Ambigüedades para el simulador

- Comportamiento exacto si la misma habilidad aplica múltiples procs de Radiation en el mismo
  frame/tick.
- Si el status de Radiation infligido por un companion cuenta igual que el de un warframe.
- Interacción específica con habilidades que aplican Radiation en AoE vs. single-target.

## Fuentes

- https://wiki.warframe.com/w/Arcane_Universal_Fallout
