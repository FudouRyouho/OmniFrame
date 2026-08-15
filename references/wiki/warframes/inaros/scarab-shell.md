# Scarab Shell — Inaros (habilidad 3)

> Estado: activo
> Rol: la mecánica de Scarab Shell — cuánto armor da, con qué escala y cómo se paga
> Fuente de verdad de: que el bonus de armor escala **sólo** con Strength · el costo en Health (25 HP por 1% de carga) y su ramp · la carga parcial
> No usar para: el modelado hacia el motor
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Scarab_Shell
> Fuente actualizada: 2026-05-02
> Raw: scarab-shell.wikitext

> **No confundir con Scarab Swarm**, la 1ª habilidad de Inaros: nombre parecido, habilidad
> distinta. Ésta es **Scarab Shell**, la 3ª — armor a cambio de Health.

## Cómo funciona

> *"gaining up to 350 bonus Armor… as Inaros loses 25 Health for every 1% of generated bonus armor,
> for a total of 2.500 health lost to fully charge the armor."*

**El bonus de armor escala sólo con Ability Strength.** No lee el Health ni el Armor actual como
input de la fórmula.

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Bonus de armor | 175 | 250 | 300 | **350** |

## El costo se paga en Health, no en energía

- **25 HP por cada 1%** de armor generado → **2.500 HP** para la carga completa.
- **Ramp de 4.67 s** hasta el máximo.
- **Se puede detener a mitad de carga**, manualmente: el estado intermedio es válido, no es
  todo-o-nada.

## Fuentes

- https://wiki.warframe.com/w/Scarab_Shell
