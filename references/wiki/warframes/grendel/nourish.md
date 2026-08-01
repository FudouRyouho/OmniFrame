# Nourish — Grendel (habilidad 2)

> Estado: activo
> Rol: habilidad 2 de Grendel — buff de escuadrón con tres efectos separados, entre ellos daño Viral a todas las armas
> Fuente de verdad de: los tres efectos y sus valores por rank · **que el daño Viral es aditivo con los mods elementales e IPS**, no un multiplicador aparte · el prerrequisito de un enemigo tragado · los valores y la fórmula al subsumirla
> No usar para: los stats base de Grendel · *Feast* ni el resto de sus habilidades · la ley del status Viral (ver [`../../mechanics/status-effects.md`](../../mechanics/status-effects.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Nourish
> Fuente actualizada: 2026-07-10
> Raw: nourish.wikitext

## Qué es

Grendel gasta **50 de energía** y daña al primer enemigo que tiene digerido —**20%** de su escudo y
salud totales—, se cura **600 / 700 / 800 / 1000** de salud, y genera un buff que alcanza a **todos los
aliados en 10 / 15 / 20 / 25 m** durante **10 / 15 / 20 / 25 s**.

**Requiere al menos un enemigo tragado con *Feast*** y vivo en su estómago para castearse.

## Los tres efectos

| Efecto | Valor (rank 0 → 3) |
|---|---|
| **Toda fuente de energía rinde más** | **1.5x / 1.65x / 1.8x / 2.0x** |
| **Explosión al recibir daño** de salud o escudo (no overguard) | **100 / 150 / 200 / 250** de daño Viral en 12 m, con **10 stacks** de Viral y Stagger, a enemigos en línea de vista · cooldown de **2 s** |
| **Daño Viral a todas las armas** y ciertas habilidades | **+40% / +50% / +60% / +75%** |

Los tres escalan con Ability Strength.

## Cómo compone el daño Viral

**Es aditivo con los mods elementales y de IPS ya presentes.** La fuente lo dice sin rodeos: equivale a
*"agregarle a tus armas un mod de +75% Viral"*, sólo que escalado por Ability Strength.

No es un multiplicador aparte ni una capa nueva sobre el arma.

## Recast

Se puede recastear estando activa: vuelve a dañar al enemigo tragado, cura a Grendel, alcanza a los
aliados que hayan entrado al rango y refresca la duración.

## Helminth

Nourish es **subsumible**, y al hacerlo pierde bastante:

- **No cura.**
- La explosión aplica **1** stack de Viral en vez de 10.
- El multiplicador de energía baja a **1.3 / 1.39 / 1.48 / 1.6x**, con fórmula
  `1 + ((0.3 / 0.39 / 0.48 / 0.6) × Ability Strength)`.
- El daño Viral baja a **+24% / +30% / +36% / +45%**.

Los otros warframes quedan exentos del requisito del enemigo tragado, porque no pueden castear *Feast*.
