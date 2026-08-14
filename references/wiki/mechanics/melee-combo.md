# Melee Combo

> Estado: activo
> Rol: el sistema de combo melee — cómo se gana el contador, qué escala con el multiplicador y qué no, duración y decay, Heavy Attack Efficiency, Initial Combo y el Ability Combo Counter
> Fuente de verdad de: que el multiplicador **no** multiplica el ataque normal · la tabla 2x–12x y sus dos excepciones por arma · ganancia de combo ∝ multiplicador de stance · duración base 5 s y su piso de 0.1 s · HAE aditivo con cap 90% · Initial Combo y su regeneración de 40/s · qué es y qué no es el Ability Combo Counter
> No usar para: catálogo de mods por build (la wiki los agrupa por dimensión mecánica) · el multiplicador fijo por clase y la velocidad de wind-up del heavy — ver [`heavy-attack.md`](heavy-attack.md)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Melee_Combo
> Fuente actualizada: 2026-08-06
> Raw: melee-combo.wikitext

## Qué es

> *"Melee Combo is a gauge that tracks how many melee attacks you've performed in the last **5**
> seconds."*

Del contador sale un **Melee Combo Multiplier** de **2x a 12x**.

## La regla central: el multiplicador NO toca el ataque normal

> *"**Melee Combo Multiplier does not multiply the damage of your normal attacks.**"*

El contador es un recurso que **se gasta**, no un buff pasivo. Tres consumidores distintos, con tres
tratos distintos:

| Consumidor | Trato |
|---|---|
| **Heavy Attack** | gasta por defecto el **100%** del contador y pega **2x–12x**. Con mods de **Tennokai** se puede hacer **sin costo**, si se ejecuta en el momento correcto |
| **Habilidades de *Multiplier Ability Damage*** | ratio **1 : 0.25** ⇒ rinden **1.5x a 4x**, y **no consumen** el contador |
| **Habilidades con Ability Combo Counter propio** | reciben el multiplicador **completo** (2x–12x) |

Los mods que escalan con combo (Blood Rush, Weeping Wounds, sets Gladiator y Jugulus) son la vía
**indirecta** por la que el ataque normal se beneficia: suben crítico o status, nunca el daño como
multiplicador directo.

## Ganancia de combo

| Fuente | Puntos |
|---|---|
| **Ataques de stance** | proporcional al **multiplicador de daño de la stance**: **100% = 1 punto**. Un ataque de 300% da **3 puntos por impacto**. Sólo cuentan los golpes que **aciertan a un enemigo** |
| **Bloqueo** | **1 punto** por ataque enemigo bloqueado, **incluido cada proyectil individual** |
| Sigilo y finishers | cantidades variables |
| **Rauta** | **2 puntos por pellet**, hasta **28** repartidos en 14 pellets |

> **Los golpes contra objetos destructibles —contenedores y demás— NO suman combo.**

Excepciones de stance que la wiki señala: el último ataque de *Dancing Hunter* (Swirling Tiger) y el
primer hit de *Cutting Arches* (Homing Fang).

### Additional Combo Count Chance

Chance de un punto **extra** al golpear, al bloquear o bajo otra condición. Parte de **+0%** y es
**aditiva**: Enduring Strike, Guardian Derision, Quickening, Relentless Combination, True Punishment,
y los arcanos Exodia Triumph y Exodia Valor (sólo Zaws).

Otras fuentes de puntos: Tandem Bond, Recompense, Storm of Ukko, y los nodos Focus Opening Slam y
Vexoric Tauron Strike.

## El multiplicador

Arranca en **2.0x a los 20 hits** consecutivos y sube **+1.0x cada 20 hits**, hasta **12.0x a los
220**.

| Hits | 20 | 40 | 60 | 80 | 100 | 120 | 140 | 160 | 180 | 200 | 220 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Mult. | 2x | 3x | 4x | 5x | 6x | 7x | 8x | 9x | 10x | 11x | **12x** |

> ℹ️ Ilustración propia. La wiki publica **la tabla**, no una fórmula; `mult = 1 + ⌊hits / 20⌋`
> acotado a 12 la reproduce exactamente.

**Dos excepciones por arma:**

- **Venka Prime** — pasiva que le permite llegar a **240 hits para 13.0x**.
- **Dex Nikana** — pasiva que baja los hits requeridos a **110**, a costa de un cap de **11.0x**.

## Duración y decay

- **Base 5 s.** Los mods de Combo Duration la extienden; el contador se **vacía por completo** al
  vencer.
- **Piso: no baja de 0.1 s.** Los Rivens pueden dar duración negativa, y **con duración cero o
  negativa el contador no puede subir**.
- Visualmente es la barra gris horizontal bajo el contador.

**Mods:** Body Count, Amalgam Furax Body Count, Combo Killer, Drifting Contact, Gladiator Rush, Melee
Guidance, Rising Storm, Swift Momentum · arcanos Primary y Secondary Dexterity · el nodo Focus Power
Spike · y la Rauta, **sólo en manos de Kullervo**.

### Decay — Power Spike

Con la pasiva **Power Spike** (Naramon) el contador **decae** en vez de vaciarse: **20 / 15 / 10 / 5**
puntos por reset según el rango. Al cruzar un umbral, el multiplicador baja al escalón nuevo. A rango
máximo y sin mods de duración, vaciarlo del todo lleva **220 segundos** (44 ticks de reset) — y los
mods de duración lo alargan mucho, porque aplican **a cada tick**.

### Excepciones por arma

| Arma | Comportamiento |
|---|---|
| **Xoris** | duración **infinita** |
| **Guandao Prime** | base **6 s** |
| **Pulmonars** | base **9 s** |
| **Vitrica** | base **10 s** |
| **Tenet Livia**, **Tenet Grigori** | **pausan** el timer enfundadas |
| **Anku**, **Ack & Brunt**, **Furax** (las tres), **Okina** (y Prime) | pausan enfundadas **con su Incarnon Genesis**, vía un perk de Evolution III |
| **Glaive** con Combo Killer | matar con la **secundaria** resetea su timer |

> **Truco de la wiki:** sin enemigos cerca, un heavy attack refresca la duración — **el timer se
> resetea al hacer heavy sin importar si golpeó algo**. Con Heavy Attack Efficiency el costo es
> parcial.

## Heavy Attack Efficiency

Antes llamada *Combo Efficiency*. **Reduce el costo** del heavy por debajo del 100% del contador: con
**40% de HAE** el heavy gasta **60%**.

> **Stackea aditivamente y está capeado en 90%.** Con Focus Energy **y** Reflex Coil juntos, el heavy
> sigue consumiendo el **10%**.

**Kullervo** da **75% de HAE** por pasiva a cualquier melee que empuñe.

Fuentes: Focus Energy · Focus Radon · Galvanized Reflex · Reflex Coil · Lycath's Hunt (mantenido) ·
Rivens.

## Initial Combo

Garantiza un **mínimo de puntos** en reposo o después de un reset. **Los heavy attacks lo gastan**, y
se regenera a **40 puntos por segundo**.

Los Rivens pueden dar Initial Combo **positivo, nunca negativo**. Innato por arma: **Synoid Heliocor
20**, **Furax Wraith 20**, **Fragor Prime 30**.

Mods: Corrupt Charge · Covert Lethality · Galvanized Reflex · Ready Steel · arcano Melee Crescendo.

## Qué escala con el combo

> La wiki marca esta lista con **`{{CleanUp}}`**: *"This list is missing examples of Warframe
> Abilities that scale with Melee Combo."*

Blood Rush · Weeping Wounds · los bonus de set **Gladiator** (Aegis, Rush, Might, Resolve, Finesse,
Vice) y **Jugulus** (Barbs, Carapace, Spines) · la duración de la pasiva de la **Pennant** · la
velocidad de sprint de la evolución *Gathering Momentum* de la **Ruvox** · el daño Heat extra de la
**Tonkkatt** · el arcano Secondary Outburst · **la duración del status `Lifted`** · Slash Dash.

## Ability Combo Counter

Cuatro habilidades tienen **su propio contador**, funcionalmente idéntico pero **separado** del melee:
**Blade Storm** (Ash), **Landslide** (Atlas), **Shattered Lash** (Gara) y **Whipclaw** (Khora).

- Reciben efectos de **ganancia**, **duración** y **escalado**… pero **no de Initial Combo**.
- Su duración base es **5 s** y **la afecta la Ability Duration** *(la wiki pide verificación: no
  parece afectar la duración de Blade Storm en la vista de stats del arsenal)*.
- **Sólo los mods de combo instalados en la configuración de mods de la habilidad** afectan sus stats.

Existen aparte porque **rastrean acciones distintas** y necesitan temporizadores independientes.

## Fuentes

- https://wiki.warframe.com/w/Melee_Combo
- [`sniper-combo.md`](sniper-combo.md) · [`critical-hits.md`](critical-hits.md) · [`status-effects.md`](status-effects.md)
