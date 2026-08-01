# Redline — Gauss (habilidad 4)

> Estado: activo
> Rol: habilidad 4 de Gauss — libera el techo de la batería y convierte su nivel en cuatro buffs de velocidad, más un contador propio y proyectiles
> Fuente de verdad de: los cuatro buffs de velocidad como **rangos** por rank y que escalan con Ability **Duration** · el contador de Redline, su condición de crecimiento y su fórmula inversa a Duration · la liberación del techo de batería (+20%) · los proyectiles y su reparto de daño · las tres sinergias con las otras habilidades
> No usar para: los stats base de Gauss · cómo carga y drena la batería (ver [`passive.md`](passive.md)) · los valores propios de Mach Rush, Kinetic Plating y Thermal Sunder
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Redline
> Fuente actualizada: 2026-02-08
> Raw: redline.wikitext

## Qué es

Gauss gasta **100 de energía** para llevar su batería más allá del límite: gana acceso al **100%** del
medidor (en lugar del 80% habitual) durante **15 / 20 / 25 / 30 s**, y lanza por los aires a los
enemigos alrededor en un radio que **la fuente no publica** (`? m`).

Mientras está activa **drena 2% de batería por segundo**, hasta que el contador llegue a 100%. Se
desactiva al terminar la duración o volviendo a pulsar la tecla.

## Los cuatro buffs — son rangos, no valores

Cada buff se publica como un **par mínimo–máximo**, y **dónde cae dentro del rango lo decide el nivel
de batería** ([`passive.md`](passive.md)). Con la batería vacía vale el mínimo; llena, el máximo.

| Stat | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Fire Rate (armas) | 6 – 30% | 9 – 45% | 12 – 60% | **15 – 75%** |
| Attack Speed (melee) | 5 – 25% | 6 – 30% | 7 – 35% | **8 – 40%** |
| Reload Speed | 4 – 20% | 6 – 30% | 8 – 40% | **10 – 50%** |
| Casting Speed | 4 – 20% | 6 – 30% | 8 – 40% | **10 – 50%** |

**Los cuatro escalan con Ability Duration, no con Ability Strength.** La fuente los marca con el icono
de Duration en la tabla de stats y otra vez en la prosa; Ability Strength sólo aparece sobre el daño
de los proyectiles.

**El cuarto buff no tiene un nombre estable en las fuentes.** La tabla de stats de esta misma página y
la UI del juego (`game-ui/Gauss.md`) lo llaman **Casting Speed**; la descripción oficial de la
habilidad, transcrita dos párrafos más arriba en la misma página, dice **Holster Speed**. Es una
incoherencia interna de la fuente, no de la captura.

> ⚠️ Conflicto ↔ [`../../mechanics/buff-debuff.md`](../../mechanics/buff-debuff.md) §Holster Speed Bonus

## El contador de Redline

Redline agrega un **segundo indicador** sobre el medidor de batería, con valor entre **0% y 100%**.

- **Sube mientras el nivel de batería esté por encima del 80%**, y **baja** si la batería cae por
  debajo de ese límite. Cuánto sube depende del nivel de batería.
- Al llegar a **100%**, el drenaje de batería que provocan las habilidades **queda anulado** por lo
  que reste de Redline.
- Su tasa máxima de crecimiento escala **inversamente con Ability Duration**: `100% / (Duration × 1/3)`.
  Es decir, **el contador no puede llenarse antes de un tercio de la duración**, y más Duration lo hace
  crecer más lento.
- Al expirar Redline, **la batería cae hasta el valor del contador**.

## Los proyectiles

Mientras la batería esté **por encima del límite de Redline**, salen periódicamente de Gauss descargas
eléctricas que **persiguen** enemigos cercanos con **50% de precisión**:

- **100 / 200 / 300 / 400** de daño (× Ability Strength), repartido **81.25% Impact / 18.75% Puncture**.
- ~25% de status chance y **Stagger garantizado**.
- Les afectan los Universal Weapon Bonuses.
- **Cuántos salen** depende de cuánta batería haya por encima del límite (>80%); cuanto más alta, más
  frecuentes y más precisos.
- Al desactivar, se libera de golpe un número variable de proyectiles que explotan al impactar.

## Sinergias — todas condicionadas a superar el límite de la batería

Mientras el nivel de batería esté **por encima del límite de Redline**:

- **Mach Rush**: el costo inicial y el drenaje de energía por segundo se **reducen a la mitad**.
- **Kinetic Plating**: otorga además **+100% de daño melee** (*aditivo* con mods de daño como
  *Pressure Point*), fija el **Follow Through en 100%** y da **100% de probabilidad de Stagger** al
  golpear.
- **Thermal Sunder**: el proc de **Cold** congela sólido de inmediato · el de **Heat** aplica de una
  vez todo el daño que el DoT habría hecho en su duración completa · el de **Blast** **quita armadura
  de forma permanente** según el nivel de batería, hasta **100% de armor strip** con la batería llena,
  y lo hace *antes* de infligir su daño.
