# Pasiva — Gauss (la batería)

> Estado: activo
> Rol: pasiva de Gauss — la batería electrocinética, un medidor de 0 a 100% que carga y drena por lo que Gauss hace, y cuyo nivel parametriza cuatro de sus habilidades
> Fuente de verdad de: qué carga y qué drena la batería, con su tasa · el techo de 80% por defecto y su liberación a 100% · el bonus de recarga de shields y su linealidad · qué habilidades leen el nivel de batería
> No usar para: los stats base de Gauss · los valores de sus habilidades (ver el `.md` de cada una) · la aceleración base de un warframe cualquiera (ver [`../../mechanics/movement-speed.md`](../../mechanics/movement-speed.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Gauss/Abilities/Passive
> Fuente actualizada: 2026-05-17
> Raw: passive.wikitext

## Qué es

Además de energía, Gauss gasta una **batería electrocinética** propia: un medidor mostrado sobre sus
iconos de habilidad, que se llena o se vacía según lo que él haga.

**Su techo normal es 80%.** Sólo [*Redline*](redline.md) le da acceso al **100%**.

## Qué la carga y qué la drena

| Origen | Efecto sobre la batería |
|---|---|
| *(pasivo)* moverse | **+0.66%** por metro recorrido |
| *(pasivo)* revivir a un aliado en bleedout | **+`?%`** por segundo — la fuente no publica el valor |
| *(pasivo)* caer fuera de los límites del mapa | **−3%** |
| *(pasivo)* estar dentro de una burbuja de Nullifier Crewman | **−15%** por segundo |
| **Mach Rush** al castear | **+10%** |
| **Mach Rush** por enemigo golpeado | **+1%** |
| **Kinetic Plating** mientras está activa | **−1%** por segundo |
| **Kinetic Plating** por golpe recibido | **−0.1%** |
| **Kinetic Plating** por golpe melee a enemigos | **+0.25%** |
| **Thermal Sunder** al castear Cold | **+10%** |
| **Thermal Sunder** al castear Heat | **−10%** |
| **Redline** mientras el contador esté bajo 100% | **−2%** por segundo |

Al expirar *Redline*, la batería **cae hasta el valor que marque el contador de Redline** (si el
contador quedó en 20%, la batería baja a 20%).

## Qué hace el nivel de batería

**Recarga de shields — el efecto directo de la pasiva.** Gauss gana recarga de shields más rápida y
menos retardo de recarga **por cada punto de batería almacenado**, hasta un máximo de **+120% de
recharge rate** y **−80% de recharge delay** con la batería llena.

El escalado es **lineal sobre todo el medidor**: con la batería al **80%** (su techo por defecto), el
bonus es **+96% de recharge rate** y **−64% de delay**. Funciona también en misiones de Archwing.

**Y parametriza cuatro habilidades** — el nivel de batería es lo que decide dónde cae cada una dentro
de su rango publicado:

| Habilidad | Qué determina la batería |
|---|---|
| **Kinetic Plating** | su Damage Reduction |
| **Thermal Sunder** | su daño y la duración de sus status |
| [**Redline**](redline.md) | Fire Rate, Attack Speed, Reload Speed y Casting Speed · el contador de Redline · cuántos proyectiles salen por encima del 80% |
| **Thermal Sunder** por encima del límite de Redline | efectos adicionales sobre sus procs |

## Aceleración

Gauss acelera a **20 m/s²** en lugar de los 12 m/s² habituales. El dato de contraste vive en
[`../../mechanics/movement-speed.md`](../../mechanics/movement-speed.md) § *Aceleración*.
