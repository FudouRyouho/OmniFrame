# Penance — Harrow (habilidad 2)

> Estado: activo
> Rol: habilidad 2 de Harrow — sacrifica el shield entero a cambio de fire rate, reload y life steal en área
> Fuente de verdad de: los valores por rank de fire rate, reload y life steal · el costo en shields y la curación inicial · la fórmula de duración por shield drenado y su tope · a quién alcanza el life steal · que el valor del melee attack speed **no existe en la fuente**
> No usar para: los stats base de Harrow · el resto de sus habilidades · qué mods de shield convienen
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Penance
> Fuente actualizada: 2026-07-27
> Raw: penance.wikitext

## Qué es

Harrow sacrifica **el 100% de sus shields y overshields** al castear, y a cambio gana buffs de
velocidad de arma y convierte parte del daño que hace en curación para él y sus aliados.

El costo es el shield **entero**: la cantidad se determina en el momento de la activación, en dos
tandas del 50% cada una (Harrow se flagela dos veces). Los shields ganados por *Condemn* durante la
animación de casteo **no** se drenan.

## Los buffs

| Stat | Valor (rank 0 → 3) | Escala con |
|---|---|---|
| Fire Rate (arma) | 20 / 25 / 30 / **35%** | Ability Strength |
| Reload Speed | 40 / 50 / 60 / **70%** | Ability Strength |
| Melee Attack Speed | **`??%`** — ver abajo | Ability Strength |
| Curación inicial | **50%** de los shields sacrificados | Ability Strength |
| Life steal | **5%** del daño hecho **por Harrow** | Ability Strength |

**El valor del melee attack speed no existe en la fuente.** La página lo consigna literalmente como
`??% / ??% / ??% / ??%` en los cuatro rangos, y la **descripción oficial de la habilidad no lo
menciona**: dice sólo *"boost reload, and fire rate"*. La UI del juego tampoco lo publica
(`references/game-ui/Harrow.md` trae Fire Rate y Reload Speed, nada más). Es un hueco de la fuente,
no de la captura.

## Duración

**4 segundos de base**, más **1.25 / 1.33 / 1.43 / 1.54 s por cada 100 puntos** de shield y overshield
drenados, hasta un tope de **120 segundos**. Ambos tramos escalan con Ability Duration.

Se puede **recastear estando activa** para acumular duración sobre el tiempo restante — pero el
recast **siempre usa el valor de strength del cast inicial**.

## El life steal y a quién alcanza

Mientras está activa, el **5%** de cualquier daño que Harrow inflija se convierte en salud para él y
para sus aliados dentro del **Affinity Range (50 m)**.

**El Affinity Range no lo afecta Ability Range**; sí lo afectan [Fosfor](../../mechanics/) y el
*Mending Unity* de Vazarin.

Cuentan como aliados: warframes, [compañeros](../../mechanics/), Eidolon Lures, specters, unidades
aliadas de Invasion, rehenes, Kavor Defectors, operativos de Sortie y Arbitrations, y **Defense
Objects** — sobre estos últimos, la curación tope es de **50 de salud por segundo**.

## Detalles de casteo

- Castear **detiene todo movimiento y acción** de Harrow.
- En el aire **conserva el momentum**, y el aim glide sigue disponible durante el casteo.
- Reduce el *recharge delay* de armas como la Cycron o una Kitgun con *Pax Charge*, pero **no** su
  *recharge rate*.
