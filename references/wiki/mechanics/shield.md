# Shield

> Estado: activo
> Rol: fórmula de shields, DR inherente, recarga con sus dos delays, shield gating (jugador y enemigo) y overshields
> Fuente de verdad de: cálculo de Total Shields, quién recibe el 50% de DR, delays y tasa de recarga, la **fórmula** de duración del shield gate, el gate del enemigo, caps de overshield
> No usar para: escalado de shields de enemigos por nivel (→ `enemy-level-scaling.md`) · el catálogo completo de fuentes de restauración (está en el raw)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Shield
> Fuente actualizada: 2026-07-05
> Raw: shield.wikitext · ../arcanes/arcane-aegis.wikitext

## Fórmula base

```text
Total Shields = Base Shields × (1 + Relative Mod Bonus + Relative Ability Bonus)
```

Mods y habilidades caen en el **mismo pool aditivo** — funciona igual que los mods de daño aditivos
de armas. Ejemplo textual de la wiki, con Hildryn + Redirection + Primed Vigor + Elemental Ward
(Electricity) sin moddear:

```text
1780 × (1 + 1 + 0.75 + 0.3) = 5429
```

El máximo de shields del warframe sube por rango hasta el 30; más allá sólo con mods.

## Reducción de daño inherente

**50% de DR**, pero **no para todos**:

| Recibe el 50% | No lo recibe |
|---|---|
| Warframes · Operators · Archwings · Railjacks · Necramechs | **Companions** |

Dos consecuencias que la wiki señala:

- Los shields **no reciben mitigación del armor**, así que son menos efectivos para cualquier
  warframe con más de 300 de armor total.
- A cambio, su regeneración los hace más útiles en frames con mucho shield potencial y poca salud,
  como Hildryn.

**Toxin ignora los shields por completo** y daña la salud directamente. **Magnetic** aumenta el daño
contra shields e impide su regeneración mientras dura.

## Recarga

### Los dos delays

No hay un único delay. Depende de si los shields quedaron **parciales** o **agotados**:

| Situación | Delay antes de empezar a recargar |
|---|---|
| Shields **parciales** | **1 segundo** sin recibir daño |
| Shields **totalmente agotados** | **4 segundos** desde el último hit tomado durante el Shield Gate |

Tres reglas que no son obvias:

- **Restaurar shields durante el delay no lo acorta.** Ni tras agotarlos, ni durante los 4 segundos
  (por ejemplo con el set bonus de los Augur).
- **El daño de status (Slash, Heat) no resetea el timer.**
- La reducción del delay está **capada al 80%**, y sólo la dan: Fast Deflection, Vigilante Vigor, la
  pasiva de Gauss, Symphony of Mercy (Jade), Guardian Break (Vazarin) y Quick Charge. La aumentan
  Vital Systems Bypass y el modificador *Lethargic Shields* de Deep/Temporal Archimedea.

### Tasa

```text
Shield Recharge Rate = (15 + 0.05 × Maximum Shields) × (1 + Shield Recharge Bonus)
Shield Recharge Time = Maximum Shields / Shield Recharge Rate
```

El costo de tener más shields **se aplana**: a ~900 de shield máximo la recarga completa tarda 15
segundos, y a partir de ahí crece muy poco — **ni con 10.000 de shields supera los 20 segundos**.

**Enemigos:** sus shields tardan **máximo 3 segundos** en empezar a regenerar, según cuánto se les
haya agotado.

### Arcane Aegis anula el delay

3% de chance, al recibir daño a los shields, de regenerarlos durante 12 segundos. Su efecto
declarado es +30% de tasa de recarga, pero lo importante está en las notas:

> *"Has a **hidden stat** that sets shield recharge delay to **0 seconds** while active. This causes
> the players shields to **constantly regenerate, even when being damaged**."*

Es decir: mientras dura, los dos delays de arriba dejan de existir. Consecuencias que la wiki
declara:

- **Magnetic sigue impidiendo la regeneración**, aun con el arcano activo.
- El bonus de recarga es **aditivo al 5% innato**, pero **multiplicativo** con Fast Deflection y
  Vigilante Vigor. Ejemplo textual con Hildryn + Redirection + Fast Deflection:
  `[15 + (5% + 30%) × 1780 × (1 + 100%)] × (1 + 90%)` shields/s.
- **No genera overshields.**
- **No sirve** en Inaros, Kullervo ni Nidus (no tienen shields que dañar), ni con **Arcane
  Persistence** equipado, ni bajo el modificador *No Shields*.

## Shield Gating

Al agotarse los shields, el exceso de daño **no se filtra a la salud**: se gana invulnerabilidad.
Aplica a warframes, companions, archwings, necramechs y railjacks.

La duración **tiene fórmula**, y su argumento **no es el shield máximo del warframe**:

> *"Invulnerability duration will scale based on the maximum shields **replenished since the last
> shield gate occurred**."*

```text
              ⎧ S/180 + 1/3               si S < 53
t(S)       =  ⎨ (S/350)^0.65 + 1/3        si 53 ≤ S ≤ 1150
              ⎩ 2.5                       si S > 1150

donde S = shields REPUESTOS desde el último shield gate
```

De **0.33 s** como mínimo hasta **2.5 s** al reponer 1.150 o más.

**La consecuencia práctica:** en el modo por defecto, la duración del gate es **proporcional a
cuánto shield lograste rellenar**. Rellenar poco da una ventana corta.

Excepciones y modificadores:

| Fuente | Efecto |
|---|---|
| Hildryn, y aliados bajo su Haven | **3.5 s** |
| Grenade Fan (Protea) | **duplica** el mínimo — rango de 0.66 a 5 s |
| **Catalyzing Shields** | **rompe la proporcionalidad**: fija la ventana en **1.33 s** *"upon recovering **any amount** of shields"*, a costa de −80% de shield máximo |
| Decaying Dragon Key | **capa** la ventana a 0.33 s sin importar el shield máximo; anula por completo a Catalyzing Shields |

> **Catalyzing Shields cambia la naturaleza de la mecánica, no sólo su número.** Sin él, el gate es
> *consecuencia de rellenar shields* y escala con cuánto se rellenó. Con él, **cualquier cantidad**
> —1 punto de 50— da los mismos 1.33 s. Por eso el shield máximo bajo (−80%) no es una desventaja
> para este build: nada depende ya de la magnitud.

> ⚠️ **Recuperar shields durante la invulnerabilidad la termina de inmediato** — cualquier cantidad,
> de cualquier fuente, incluida la regeneración natural.

### El gate del enemigo es otra mecánica

| | Jugador | Enemigo |
|---|---|---|
| Duración | 0.33 – 2.5 s (fórmula) | **0.1 s** |
| Qué hace | invulnerabilidad total | sólo el **5%** del daño llega a la salud |

**Apuntar a un weak point bypasea por completo el shield gate enemigo**
(→ [`enemy-body-parts.md`](enemy-body-parts.md)).

Los ataques de área (como los slam) **no** se benefician de ese bypass: su instancia de daño se
bloquea entera. El daño asociado que no es la instancia principal —status effects, Xata's Whisper—
sí puede dañar al enemigo.

## Overshields

Puntos de shield **por encima** del máximo normal, que se obtienen cuando una restauración excede la
capacidad. Los NPC aliados (objetivos de Rescue, Defense Objects) **no** pueden ganarlos.

- **No regeneran.** Se apilan sobre el shield normal.
- Cap: **1.200** para warframes, **600** para companions.

El cap sólo lo suben tres fuentes:

| Fuente | Aumento |
|---|---|
| Pasiva de Harrow | +1.200 |
| Blast Shield (MOAs) | +3.000 |
| Reawaken (Djinn) | +900 |

Se obtienen de Squad Shield Restores, Lethal Progeny (Caliban), Mend & Maim (Equinox), Condemn
(Harrow), Omamori (Koumei), Crush (Mag) y Vampire Leech (Trinity), entre otros.

## Reducción y remoción de shields

| Fuente | Efecto |
|---|---|
| Decaying Dragon Key | −75% |
| Catalyzing Shields | hasta −80% |
| Cryogenic Leakage (hazard) | −50% del máximo |
| Arcane Persistence | **remueve todos** los shields |
| Desafío *No Shields* · *Exposure Curse* / *Exposed* | remueven todos los shields |

> **Sin shields se deshabilita el Shield Gating y no se puede ganar Overshield.**

Decaying Dragon Key **no** stackea con Catalyzing Shields: lo anula.

## Fuentes

- https://wiki.warframe.com/w/Shield
- [`health.md`](health.md) · [`overguard.md`](overguard.md) · [`hit-points.md`](hit-points.md) · [`enemy-body-parts.md`](enemy-body-parts.md) · [`../arcanes/arcane-persistence.md`](../arcanes/arcane-persistence.md)
