# Damage — elementales primarios

> Estado: activo
> Rol: los cuatro elementales primarios en detalle — su status, sus stacks y la fórmula de tick de los que hacen DoT
> Fuente de verdad de: la **fórmula del tick** de Heat, Electricity y Toxin con su coeficiente 0.5 · **Heat Inherit** y la captura de bonus en el primer proc · la **rampa del armor strip de Heat** y su interacción con Status Duration · la escala de stacks de Cold y su bonus de crit damage **previo al tier** · el radio y el stun de Tesla Chain · los contrapartes Railjack
> No usar para: la ley general de DoT y qué lo escala — ver [`damage-over-time.md`](damage-over-time.md) · la taxonomía y las combinaciones — ver [`damage-types.md`](damage-types.md) · el catálogo de fuentes y de resistencias por tipo (son cientos de líneas en cada raw)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage/Heat_Damage · https://wiki.warframe.com/w/Damage/Cold_Damage · https://wiki.warframe.com/w/Damage/Electricity_Damage · https://wiki.warframe.com/w/Damage/Toxin_Damage
> Fuente actualizada: 2026-07-24
> Raw: damage-heat-damage.wikitext · damage-cold-damage.wikitext · damage-electricity-damage.wikitext · damage-toxin-damage.wikitext

## Resumen

| Tipo | Status | Duración | Stacks | Qué hace |
|---|---|---|---|---|
| **Heat** | **Ignite** | 6 s (+1 s retardo) | consolidados | DoT · pánico · **−50% armadura** |
| **Cold** | **Freeze** | 6 s | 10 | ralentiza · **+crit damage recibido** · congela al 10º |
| **Electricity** | **Tesla Chain** | 6 s | ∞ (consolidados) | DoT **en radio de 3 m** · stun |
| **Toxin** | **Poison** | 6 s (+1 s retardo) | ∞ | DoT que **ignora escudos** |

| Tipo | Favorable ×1.5 | Desfavorable ×0.5 |
|---|---|---|
| Heat | Infested | Kuva Grineer |
| Cold | Sentient | Techrot |
| Electricity | Corpus Amalgam · The Murmur · Anarchs | — |
| Toxin | Narmer | — |

---

## La fórmula común de tick

**Heat, Electricity, Toxin y [Gas](damage-elemental-combined.md#gas--gas-cloud) comparten la misma
forma**, con coeficiente **0.5** (contra el 0.35 del [Bleed](damage-physical.md#slash--bleed)):

```text
Modded Base Damage = Base Damage × (1 + Base Damage Bonuses) × (1 + Faction Damage Bonuses)

Tick = 0.5 × Modded Base Damage
           × (1 + <Elemento> Damage Bonuses)
           × (1 + Faction Damage Bonuses)
           × (1 + Status Damage Bonuses)
           × Additional Multipliers
```

Las tres propiedades que definen esta fórmula:

1. **`Modded Base Damage` ignora los bonus físicos y elementales.** El daño base moddeado del DoT
   **no** es el daño moddeado del arma.
2. **El elemento propio entra una sola vez, fuera de la base.** Hellfire escala el DoT de Heat, pero
   entra en el segundo factor, no en el primero. Un mod de otro elemento —Magnetic Capacity sobre un
   DoT de Toxin— **no hace absolutamente nada**.
3. **El bonus de facción entra dos veces** → `(1 + F)²` = **+69%** con mods del 30%, **+140.25%**
   con Primed del 55%. Ver [`faction-damage.md`](faction-damage.md).

`Additional Multipliers` = multiplicador de crítico moddeado y multiplicadores de
[parte del cuerpo](enemy-body-parts.md), multiplicativos entre sí.

> La página de Toxin lista además **Damage Type Modifiers** y **Damage Vulnerability** dentro de
> `Additional Multipliers`, y los ubica dentro de `Modded Base Damage` en vez de al final. Como el
> producto es asociativo el resultado no cambia; es la única de las cuatro que los enumera.

Ejemplo textual de la wiki para Heat — 100 de daño innato con Serration, Hellfire, Bane of Grineer y
Rifle Elementalist:

```text
Modded Base Damage = 100 × (1 + 1.65) × (1 + 0.3) = 344.5
Heat Mod Multiplier = (1 + 0.9) × (1 + 0.3) = 2.47
Tick               = 0.5 × 344.5 × 2.47 × (1 + 0.9)
```

---

## Heat — Ignite

Un solo status hace **tres cosas a la vez**: DoT, control de masas y armor strip.

### DoT

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s | 7s |
|---|---|---|---|---|---|---|---|---|
| ¿Tick? | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |

### Heat Inherit — por qué Heat no stackea como los demás

> `{{Community}}` — el término es de la comunidad, y la página lleva un `{{UpdateMe}}` pidiendo
> aclarar la mecánica.

**Heat no acumula instancias independientes.** Un proc nuevo hace dos cosas a la vez: **agrega un
stack** y **refresca la duración de todos los stacks activos**. Y todos se consolidan en **un solo
tick por segundo**.

La consecuencia es que el tick **escala linealmente sin techo** mientras se mantenga refrescado
dentro de la ventana de 6 s (modificada por Status Duration).

> ⚠️ **Los bonus se capturan en el primer proc.** Si el primer Heat sobre ese enemigo viene de una
> fuente **sin** modificadores de Heat —una habilidad de warframe, Manifold Bond— los bonus de
> Hellfire y de facción **se pierden para toda la cadena**. Para evitarlo, el primer proc tiene que
> venir del arma que sí los tiene.
>
> Los **Status Damage mods** (Rifle Elementalist) son la excepción: cuentan siempre, sin importar de
> dónde vino el primer proc.
>
> Un Ember en el escuadrón, que aplica Heat por todos lados, vuelve esto difícil de controlar.

### Control de masas

El enemigo entra en pánico y no puede hacer nada más. La duración depende del tipo:

| Humanoides | Infested | MOAs y Chargers |
|---|---|---|
| ~4 s | ~3 s | ~2 s |

**Inmunes:** Ospreys, Bosses, Tenno y enemigos con Overguard. Aplicar Heat de nuevo reaplica el
pánico, y el efecto **se dispara solo en cuanto se rompe el Overguard**, aunque no lleguen procs
nuevos.

### Armor strip — tiene rampa de subida y de bajada

No es instantáneo. **Cada 0.5 s después del proc inicial:**

| t | 0.5 s | 1.0 s | 1.5 s | 2.0 s |
|---|---|---|---|---|
| Armadura removida | 15% | 30% | 40% | **50%** |

Tarda **2 segundos** en llegar al máximo, y **proccear más Heat no lo acelera**.

Al terminar el proc, la armadura vuelve **cada 1.5 s durante 6 s**: 50% → 40% → 30% → 15% → 0%.

> **Status Duration ralentiza la rampa** en vez de acelerarla. Con +100% de Status Duration el paso
> pasa a ser cada 1 s y el strip completo tarda **4 s**; con −50% de un Riven, cada 0.25 s y el strip
> completo tarda **1 s**. Un Riven con duración negativa es, para esta faceta, un buff.

Contra un enemigo con armadura capada (90% de DR, tipo Heavy Gunner nivel 57) cada escalón vale
aproximadamente ×1.7, ×2.5, ×3 y ×3.6 de daño efectivo.

### El armor strip es multiplicativo entre fuentes

```text
Armor after reduction = (1 − 50%)                                    ← Heat, al máximo
                      × [1 − (20% + 6% × nº stacks de Corrosive)]    ← Corrosive
                      × (1 − 18% × nº de Corrosive Projection)       ← el aura
```

Heat + Corrosive a 10 stacks + 4 Corrosive Projection:
`(1 − 50%) × [1 − (20% + 6%×10)] × (1 − 18%×4)`.

La única vía **no-habilidad** para remover armadura **por completo** es Shattering Impact, Sharpened
Claws, o una Dagger con Amalgam Argonak Metal Auger.

### Railjack — Sear

6 ticks en 5 segundos, **sin retardo inicial**:

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s |
|---|---|---|---|---|---|---|---|
| ¿Tick? | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |

```text
Sear tick = 100% × Modded Damage × (1 + Heat Damage bonuses)
```

**A diferencia del Heat normal, cada proc tiene duración independiente y no se refresca.** Contra el
Railjack propio produce un **Fire Hazard**: los armamentos se recalientan más rápido y enfrían más
lento.

---

## Cold — Freeze

**6 segundos, hasta 10 stacks, cada uno con su propia duración.** Dos efectos que escalan por
separado hasta el 9º stack, y un tercero que se dispara en el 10º.

| Stacks | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | **10** |
|---|---|---|---|---|---|---|---|---|---|---|
| Movement / Fire Rate / Attack Speed | −50% | −55% | −60% | −65% | −70% | −75% | −80% | −85% | **−90%** | **Frozen** |
| Crit Damage recibido | +0.1x | +0.15x | +0.2x | +0.25x | +0.3x | +0.35x | +0.4x | +0.45x | **+0.50x** | **+1.0x** |

### El bonus de crit damage

- Es **aditivo con los mods de crit damage**.
- **Se aplica antes de calcular el tier crítico** — no después. Eso lo mete dentro del escalón, no
  encima.
- **No aplica a daño en área.**

Ejemplos textuales de la wiki:

```text
Kunai + Primed Target Cracker, 9 stacks:
    1.6x × (1 + 110%) + 0.50x = 3.86x

Paris Prime + Point Strike (112.5% crit chance), 9 stacks:
    Tier 1 (87.5% del tiempo):  1x + 1 × (2x + 0.5x − 1) = 2.5x
    Tier 2 (12.5% del tiempo):  1x + 2 × (2x + 0.5x − 1) = 4x
```

### Frozen — el 10º stack

**3 segundos** en los que el enemigo no puede hacer nada, **no regenera escudos**, y el bonus de crit
damage sube a **+1.0x**.

- Al terminar, **quedan 3 stacks de Cold**.
- **Un enemigo Frozen no puede recibir stacks nuevos de Cold** — cosas como Primary Frostbite no
  stackean ni refrescan mientras dura.

### Los caps que no son 10

- **Bosses y enemigos con Overguard: máximo 4 stacks.**
- **Sobre jugadores**: −10% de velocidad por stack, **máximo 4 stacks** → −40%. La única excepción
  actual es el Optimism Peely Pix de Temporal Archimedea, que llega a 10 stacks con ralentización
  progresiva y el propio Frozen.

### Railjack — Immobilize

Desactiva las armas de la nave y la frena por completo, 6 s, refrescando con cada proc. Contra el
Railjack propio crea un **Ice Hazard** que inhabilita asiento de piloto, torretas, Archwing
Slingshot, puertas y Resource Forge.

---

## Electricity — Tesla Chain

**Un tick por segundo durante 6 s, a todos los enemigos en un radio de 3 metros.** Sin retardo:

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s | 7s |
|---|---|---|---|---|---|---|---|---|
| ¿Tick? | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |

### Stacking — un híbrido entre Slash y Heat

> Desde `{{ver|33.6}}`: varios procs ya **no** aplican su daño por separado como Slash, sino **una
> vez por segundo**, como Heat. Pero **mantienen cada uno su timer y no se refrescan** — que es lo
> que Heat sí hace.

### La cadena golpea partes del cuerpo, pero sin bonus

La Tesla Chain **puede impactar cabezas y otras partes por sí sola**. Sin embargo tiene un bonus de
headshot de **1x** — es decir, ninguno. Sólo sube con Target Acquired, los bonus de zoom de algunos
sniper rifles, o Primary/Secondary Deadhead.

### Stun

**~3 segundos** de pie sin poder actuar. **Sólo el objetivo original se stunea**; los que están
alrededor sólo reciben el daño. **Los mods de Status Duration no extienden este stun.**
Inmunes: Ospreys, Bosses, Tenno.

> Un proc de Electricity **sobre el jugador** es peligroso para el Sentinel: está siempre dentro del
> radio del arco. En Steel Path, un solo proc a veces alcanza para incapacitarlo.

### Railjack — Scramble

La nave gira sin control hacia adelante y no puede disparar, 6 s, refrescando con cada proc. Contra
el Railjack propio, **Electricity Hazard**: desordena el minimapa y bloquea el Tactical Menu.

---

## Toxin — Poison

**Retardo de 1 s, después 1 tick por segundo durante 6 s** — mismo perfil que Bleed:

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s | 7s |
|---|---|---|---|---|---|---|---|---|
| ¿Tick? | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |

**Ignora los escudos —de enemigos y de jugadores— y pega directo a la salud. No ignora el Overguard.**

Instancias ilimitadas, cada una con su timer. Igual que Slash, **sólo se muestran 10 números de tick
a la vez** por rendimiento.

### Railjack — Intoxicate

**Cambia la facción del objetivo durante 12 s**, habilitando fuego amigo con sus propios aliados.
Los procs refrescan la duración.

---

## Combinaciones

| | + Heat | + Cold | + Electricity | + Toxin |
|---|---|---|---|---|
| **Heat** | — | Blast | Radiation | Gas |
| **Cold** | Blast | — | Magnetic | Viral |
| **Electricity** | Radiation | Magnetic | — | Corrosive |
| **Toxin** | Gas | Viral | Corrosive | — |

La jerarquía de orden y qué combinaciones son simultáneamente posibles están en
[`damage-types.md`](damage-types.md) §Jerarquía de combinación.

## Fuentes

- https://wiki.warframe.com/w/Damage/Heat_Damage · https://wiki.warframe.com/w/Damage/Cold_Damage · https://wiki.warframe.com/w/Damage/Electricity_Damage · https://wiki.warframe.com/w/Damage/Toxin_Damage
- [`damage-types.md`](damage-types.md) · [`damage-over-time.md`](damage-over-time.md) · [`status-effects.md`](status-effects.md) · [`damage-elemental-combined.md`](damage-elemental-combined.md) · [`faction-damage.md`](faction-damage.md) · [`armor.md`](armor.md) · [`critical-hits.md`](critical-hits.md)
