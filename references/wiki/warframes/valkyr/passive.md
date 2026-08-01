# Pasiva — Valkyr (Rage y Nimble)

> Estado: activo
> Rol: pasiva de Valkyr — dos efectos independientes: **Rage**, un medidor que acumula golpeando y da hasta +300% de daño melee (con death-gate incorporado), y **Nimble**, inmunidad a Hard Landings
> Fuente de verdad de: las tasas de generación de Rage y su techo · el umbral de 150% y qué hace el death-gate · la fórmula de decaimiento y sus dos regímenes · qué acciones **no** generan Rage · dónde compone el bonus de daño · el efecto y el costo de Nimble
> No usar para: los stats base de Valkyr · sus habilidades (*Warcry*, *Hysteria*) · el umbral de Hard Landing en sí (ver [`../../mechanics/maneuvers.md`](../../mechanics/maneuvers.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Valkyr/Abilities/Passive
> Fuente actualizada: 2026-05-10
> Raw: passive.wikitext

La página publica la pasiva en **dos pestañas independientes**. No se combinan ni se condicionan.

## Rage

Valkyr acumula **Rage** golpeando y matando con melee, y gana hasta **+300% de daño melee**.

**El bonus es aditivo** con mods de daño como *Pressure Point* y con *Condition Overload*.

### Cómo se genera

| Acción | Rage |
|---|---|
| Golpe melee | **+3%** |
| Muerte melee, propia o asistida | **+12%** |
| Finisher o Mercy Kill de Parazon | **+27%** |

**Qué no genera Rage:** golpes de *Melee Duplicate* · daño de status effects · *Melee Influence*. En
los tres casos, **matar** con esa fuente sí cuenta como muerte melee y otorga el 12% habitual.

Golpear enemigos invulnerables que aun así registran impactos (por ejemplo el Arbitration Shield
Drone) **sí** genera Rage.

### Death gate

Si Valkyr recibe un golpe mortal con **150% de Rage o más**, se consume **todo** el medidor para
impedir la muerte, le da **5 segundos de invulnerabilidad** y le regenera el **100% de la salud**.
**No tiene cooldown.**

### Decaimiento

Tras **5 segundos sin generar Rage**, el bonus empieza a caer, y **no lo hace de forma lineal**: la
tasa depende de cuánta Rage haya acumulada.

```
λ = 0.016
n = ln(1000 λ) / λ

           ⎧ e^(−λt)                        si 0 ≤ t ≤ n
d(t)   =   ⎨
           ⎩ e^(−λn) − 0.001 (t − n)        si t > n

Bonus(t) = ⌊ 300 · d(t) ⌋
```

En términos observables: **por encima del 18%**, el medidor cae **a la mitad en 43 segundos**; **por
debajo del 18%**, cae **0.3% por segundo**.

### Persistencia

El valor de Rage **se conserva** dentro de burbujas de Nullifier y al recuperarse de una caída fuera
de los límites del mapa. Funciona en misiones de Archwing.

## Nimble

Valkyr es **inmune a los Hard Landings**: aterriza sin retardo de toque, y **sin necesidad** de rodar,
deslizarse ni hacer aim glide antes.

El costo es que esa misma inmunidad **le impide activar *Heavy Impact***.
