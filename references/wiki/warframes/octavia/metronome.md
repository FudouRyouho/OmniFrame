# Metronome — Octavia (habilidad 3)

> Estado: activo
> Rol: habilidad 3 de Octavia — aura melódica con un buff pasivo de armadura y cuatro buffs que cada jugador gana sincronizando acciones
> Fuente de verdad de: los cinco buffs y sus valores por rank · qué acción activa cada uno · que los sync buffs son **per-player** y el de armadura es de aura · las reglas de sincronización (progreso, penalización por fallar, efecto del espaciado de la melodía) · dónde componen el multishot de Opera y el daño de Forte
> No usar para: los stats base de Octavia · el resto de sus habilidades · cómo componer melodías en el Mandachord
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Metronome
> Fuente actualizada: 2026-05-08
> Raw: metronome.wikitext

## Qué es

Un aura melódica alrededor de Octavia. Da **un buff pasivo a todos los que estén dentro**, y hasta
**cuatro buffs más que cada jugador se gana por separado** sincronizando acciones con la música.

El aura cuesta **75 de energía**, mide **6 / 8 / 10 / 12 m** de radio y dura **8 / 12 / 16 / 20 s**.
La melodía sale de la sección *Melody* del Mandachord: **sin melodía, la habilidad no hace nada**.
Los enemigos no la oyen.

## Los cinco buffs

| Buff | Qué da | Valor (rank 0 → 3) | Cómo se obtiene |
|---|---|---|---|
| *(aura)* | **Armor** | 10 / 15 / 20 / **35%** | pasivo, por estar dentro del aura |
| **Vivace** | **Movement Speed** | 10 / 15 / 20 / **30%** | saltar a tiempo (incluye double jump, wall climb y wall jump) |
| **Nocturne** | **Invisibilidad** (al jugador y a su compañero) | — | agacharse o deslizarse a tiempo |
| **Opera** | **Multishot** de armas a distancia | 12 / 20 / 25 / **30%** | disparar a tiempo |
| **Forte** | **Daño melee** | 20 / 25 / 25 / **30%** | golpear con melee a tiempo |

Todos escalan con Ability Strength. Los cuatro sincronizables duran **5 / 8 / 12 / 15 s** y **pueden
estar activos a la vez**.

**No hay buff de attack speed ni de fire rate.** La única mención de esos stats en la página es
incidental —advierte que un arma muy lenta o muy rápida complica sincronizar—, no un efecto de la
habilidad.

> ⚠️ Conflicto ↔ [`../../mechanics/buff-debuff.md`](../../mechanics/buff-debuff.md) §Offense

**Dónde componen los dos que lo declaran:** el multishot de Opera **stackea aditivamente** con mods
de multishot como *Split Chamber*; el daño de Forte **stackea aditivamente** con mods de daño base
como *Pressure Point*.

## Sincronizar

Cada línea de notas se ve como un **anillo de luz concéntrico** que nace en el borde del aura y se
encoge hacia los pies de Octavia; hay que ejecutar la acción **en el instante en que el anillo se
centra** en ella. Un acierto muestra un destello bajo el jugador.

- El progreso se acumula en un porcentaje de **0% a 100%**; al llegar a 100% se gana el buff.
- **Cada jugador sincroniza por su cuenta.** Los sync buffs **no se comparten** entre aliados en
  rango — a diferencia del bonus de armadura, que sí es de aura.
- **Fallar el tiempo no reinicia a cero**: descuenta el **80%** de lo que habría sumado un acierto
  (con melodías muy espaciadas, entre 75% y 85%). **No** actuar no descuenta nada.
- Cuánto suma un acierto depende de **cuántos beats de melodía haya dentro de los 8 beats** previos y
  posteriores, y de qué tan juntos estén: **cuanto más espaciada la melodía, más porcentaje por
  acción**. Varias notas en el mismo beat no cambian nada.

Rendimiento por acierto, según el buff: Vivace y Nocturne **18-76%** · Forte **12-51%** ·
Opera **8-34%**.

**Las armas de rayo no pueden sincronizar** disparando sostenido (excepción: Tenet Flux Rifle, por su
Auto Trigger) — hay que disparar por toques. El fuego alternativo de algunas armas (p. ej. Redeemer
Prime) sí puede ganar Opera.

## Recast y casteo

Recastear **refresca la duración del aura**, pero **reinicia a 0% todos los porcentajes de
sincronización** acumulados.

Castear **no** es una acción de una mano: interrumpe otras acciones, aunque permite moverse. La
animación la afecta Casting Speed.
