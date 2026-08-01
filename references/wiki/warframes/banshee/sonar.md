# Sonar — Banshee (habilidad 2)

> Estado: activo
> Rol: habilidad 2 de Banshee — marca un punto débil aleatorio por enemigo; golpearlo multiplica el daño
> Fuente de verdad de: el multiplicador por rank · **que stackea multiplicativamente** con los multiplicadores de parte del cuerpo y consigo mismo · qué partes se pueden marcar y cuántas ubicaciones tiene cada una · **qué DoT se benefician y cuáles no** · que la onda se propaga a velocidad fija · que las marcas **no** cuentan como weakpoint para Incarnon ni *Pistol Acuity*
> No usar para: los stats base de Banshee · el resto de sus habilidades · los multiplicadores de parte del cuerpo en sí (ver [`../../mechanics/`](../../mechanics/))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Sonar
> Fuente actualizada: 2026-06-05
> Raw: sonar.wikitext

## Qué es

Banshee gasta **50 de energía** y emite una onda que viaja a **20 m/s** —atravesando obstáculos— y
revela a todo enemigo dentro de **20 / 25 / 30 / 35 m** durante **10 / 15 / 20 / 30 s**. A cada uno le
marca **una parte del cuerpo**, y **golpear esa parte multiplica el daño por 2x / 3x / 4x / 5x**
(× Ability Strength).

Los enemigos sólo quedan marcados **cuando la onda los alcanza** — la propagación es la misma mecánica
que la de *Pillage* de Hildryn o *Molecular Prime* de Nova.

Tiene ~**0.8 s** de cast delay y ~**2.4 s** de recast.

## Cómo compone el multiplicador

**Multiplicativamente**, en dos sentidos:

- **Con los multiplicadores de parte del cuerpo** (cabeza, partes desprotegidas): se multiplican entre
  sí, no se suman.
- **Consigo mismo**: dos ubicaciones marcadas en la *misma* parte del cuerpo multiplican sus bonos —
  torso superior + torso inferior = **5x × 5x = 25x** en todo el torso, con 100% de Strength.

Una marca en el **torso** aumenta el daño de muchas fuentes de área, **incluidas habilidades**, porque
suelen apuntar al centro del enemigo.

## Qué DoT alcanza y cuáles no

- **NO se benefician** los DoT de objetivo único: **Slash**, **Heat** y **Toxin** — ni siquiera si el
  golpe que los procó dio en la marca, ni si el torso está marcado.
- **SÍ se benefician** los DoT de área: **Electricity**, **Gas** y la porción de 10 stacks / al morir
  de **Blast**, porque sí pueden impactar partes del cuerpo. Vale tanto para el objetivo original como
  para los enemigos cercanos, mientras el área toque una parte marcada.

## Las marcas

- Se marca **una zona aleatoria por enemigo y por casteo**.
- Las marcas sólo caen en ubicaciones designadas, que varían por tipo de enemigo. Lo habitual son
  **6 partes** —cabeza, torso, brazos (izq./der.) y piernas (izq./der.)—, y **cada parte suele tener
  2 ubicaciones** posibles. La marca afecta a la **parte entera**, aunque visualmente no la cubra toda.
- **La misma ubicación** no puede llevar dos marcas a la vez; **ubicaciones distintas de la misma
  parte** sí, y ahí es donde se multiplican entre ellas.
- Algunos enemigos no humanoides (*The Anatomizer*, *Techrot Babau*) tienen **muchas más de 2
  ubicaciones por parte**, lo que permite apilar Sonar consigo mismo hasta valores enormes.
- Recastear sobre una zona ya marcada **no acumula daño**, pero **refresca la duración** — y el
  multiplicador **siempre** se actualiza al Strength del último casteo, incluso si es menor.

**Las marcas de Sonar no son weakpoints** para efectos como *Pistol Acuity* ni para cargar armas
Incarnon.
