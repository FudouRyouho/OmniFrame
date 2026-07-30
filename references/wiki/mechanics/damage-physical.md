# Damage — tipos físicos (IPS)

> Estado: activo
> Rol: los tres tipos físicos en detalle — a qué facción pegan, qué status producen y cómo se computa ese status
> Fuente de verdad de: el proc de cada físico con sus stacks y duración · la **fórmula del tick de Bleed** y qué la escala · el umbral de Parazon por stack de Impact · el buff de crit recibido de Puncture · las condiciones de desmembramiento · los contrapartes Railjack · el índice de qué se engancha a cada status y qué entidad lo resiste
> No usar para: la taxonomía y los códigos `DT_*`/`PT_*` — ver [`damage-types.md`](damage-types.md) · la ley general de DoT — ver [`damage-over-time.md`](damage-over-time.md) · el comportamiento genérico de un proc — ver [`status-effects.md`](status-effects.md) · el catálogo de armas/mods/habilidades que aplican cada tipo (son cientos de líneas en cada raw)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage/Impact_Damage · https://wiki.warframe.com/w/Damage/Puncture_Damage · https://wiki.warframe.com/w/Damage/Slash_Damage
> Fuente actualizada: 2026-07-17
> Raw: damage-impact-damage.wikitext · damage-puncture-damage.wikitext · damage-slash-damage.wikitext

## Resumen

| Tipo | Status | Duración | Stacks | Qué hace |
|---|---|---|---|---|
| **Impact** | **Stagger** | 6 s | 5 | empuja hacia atrás · sube el umbral de Mercy del Parazon |
| **Puncture** | **Weakened** | 10 s | 5 | −daño del enemigo · +crit chance **recibido** |
| **Slash** | **Bleed** | 6 s (+1 s de retardo) | ilimitados | DoT que **ignora armadura** |

Eficacia por facción (×1.5 salvo donde diga otra cosa):

| Tipo | Facciones favorables |
|---|---|
| Impact | Grineer · Kuva Grineer · Scaldra · Anarchs |
| Puncture | Corpus · Orokin |
| Slash | Infested · Narmer |

Ninguno de los tres tiene facción desfavorable. La matriz completa está en
[`enemy-resistances.md`](enemy-resistances.md).

---

## Impact — Stagger

La página abre con un `{{UpdateMe}}` propio: *"Is Impact status name **Stagger** or **Knockback**?
Because Stagger is also used to describe staggering effects like Opticor hits or melee hits"*. La
wiki declara su propia ambigüedad de nombre; la partición en tres códigos distintos está en
[`status-effects.md`](status-effects.md) §Los status sin tipo de daño.

**6 segundos, hasta 5 stacks.** El stack número 6 **reemplaza al más viejo**.

- El enemigo se tambalea hacia atrás; cada proc adicional **alarga** el tambaleo.
- **Inmunes al tambaleo:** Ospreys, Bosses y Tenno.
- Enemigos muertos por un proc de Impact quedan ragdolleados y salen volando **sin importar la
  fuerza del arma**.

### Umbral de Parazon

Contra **unidades pesadas** —todos los Eximus humanoides, Heavy Gunner, Bombard, Scrambus, Comba,
Nullifier Crewman, Ancient Disruptor, Ancient Healer y Toxic Ancient— cada proc sube **+8%** el
porcentaje de vida al que se los puede rematar con el Parazon:

| Stacks | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Umbral de Mercy | 48% | 56% | 64% | 72% | **80%** |

Sube a **100%** en Corpus y Eximus a los que se les removieron todos los escudos. El texto in-game
sólo declara el techo ("*lowers the Parazon Mercy Kill threshold to 80%*"), no el paso por stack.

---

## Puncture — Weakened

**10 segundos, hasta 5 stacks**, con aura amarilla en el afectado. El stack 6 reemplaza al más
viejo **aunque a ese le quede más duración que a otros**.

Dos efectos que corren en paralelo:

| Stacks | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Daño que **inflige** el enemigo | −40% | −50% | −60% | −70% | **−80%** |
| Crit chance del daño que **recibe** | +5% | +10% | +15% | +20% | **+25%** |

> El buff de crit chance es **plano** —del mismo tipo que Arcane Avenger— y **no aplica a daño en
> área ni a habilidades de warframe**. Es un buff sobre el atacante concedido por el estado del
> objetivo: la vulnerabilidad vive en el enemigo, el efecto se computa en el hit entrante.

---

## Slash — Bleed

**Retardo de 1 segundo, después 1 tick por segundo durante 6 segundos.**

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s | 7s |
|---|---|---|---|---|---|---|---|---|
| ¿Tick? | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |

**Cada tick es daño [Cinematic](damage-unique.md#cinematic), no Slash** — y de ahí sale su
propiedad más conocida: **ignora la armadura**.

### La fórmula del tick

```text
Modded Base Damage = Base Damage × (1 + Base Damage Bonuses) × (1 + Faction Damage Bonuses)

Tick = 0.35 × Modded Base Damage
            × (1 + Faction Damage Bonuses)
            × (1 + Status Damage Bonuses)
            × Additional Multipliers
```

- **`Modded Base Damage` no es el daño normal del arma**: ignora los bonus físicos y elementales.
- `Additional Multipliers` = multiplicador de crítico moddeado en un [crítico](critical-hits.md) y
  multiplicadores de [parte del cuerpo](enemy-body-parts.md), multiplicativos entre sí.
- **El bonus de facción entra dos veces** → `(1 + F)²`. Concretamente: **+69%** con los mods de 30%
  y **+140.25%** con los Primed de 55%. Ver [`faction-damage.md`](faction-damage.md).

Ejemplo textual de la wiki — arma de 100 de daño innato con Serration, Bane of Grineer y Rifle
Elementalist:

```text
Modded Base Damage = 100 × (1 + 1.65) × (1 + 0.3) = 344.5
Tick               = 0.35 × 344.5 × (1 + 0.3) × (1 + 0.9)
```

### Qué escala el Bleed y qué no

| Sí | No |
|---|---|
| Base Damage mods (Serration) | mods **elementales** |
| Faction Damage mods (**dos veces**) | mods **físicos** — Buzz Kill, Sawtooth Clip, Contagious Spread |
| Status Damage mods (Pressure Point, Melee Elementalist) | weakspots de Sonar / Detect Vulnerability (sólo el hit inicial) |
| Críticos y multiplicadores de parte del cuerpo | mods de Finisher (Finishing Touch, Savage Silence) — no tocan daño Cinematic |
| | **la armadura del enemigo**, en ninguna dirección |

> **La armadura no interviene.** Un mismo Bleed pega igual contra el mismo enemigo a cualquier nivel,
> y los buffs/debuffs de armadura no lo mueven — aunque sí muevan el hit inicial.

### Stacking

Instancias ilimitadas, **cada una con su timer**. La única cota es de presentación: **sólo se
muestran 10 números de tick a la vez**, el resto se ocultan por rendimiento. No es un cap mecánico.

### Procs de enemigo

**Los procs de Slash de los enemigos usan 10%, no 35%**, del daño base del hit.

### Bleed forzado en ataque pesado

Fuerzan Bleed en **todo** el ataque pesado, sin importar la stance: Claws, Dual Daggers, Nikanas,
Two-Handed Nikanas, Rapiers, Scythes, Tonfas, Warfans, Whips.
Sólo en **partes** del ataque pesado: Daggers, Machetes.

### Desmembramiento

Un arma desmembra si **más del 50%** de su daño **físico (IPS)** es Slash. Exactamente 50% —el Soma—
**no** desmembra; sube con Sawtooth Clip y sí. Los mods elementales **no cuentan** en esa proporción,
así que se pueden montar libremente.

- **El daño de Bleed no desmembra**, sólo el daño Slash directo del arma. Por eso **Hunter Munitions
  no puede desmembrar por sí solo**.
- Un cadáver se puede mutilar como mucho **dos veces**; si dos golpes de melee ya le sacaron dos
  miembros, ya no se lo puede bisectar.
- La petrificación lo impide, y la versión japonesa del juego lo tiene restringido.
- El atributo *gore* de Amalgam Ripkas True Steel se aplica al resto del equipo del jugador
  ignorando la disposición IPS del arma.

Importa para Nekros: cada parte de un cuerpo bisectado puede tirar Health Orb y loot con Desecrate
—los miembros sueltos, no—.

---

## Qué se dispara con cada status, y quién lo resiste

Dos índices cortos que **no son el catálogo de fuentes**. El catálogo dice *qué arma aplica* el
tipo; estos dicen **qué se engancha al status ya aplicado** y **qué entidad concreta lo resiste**.

| Tipo | Se dispara con el status | Resisten |
|---|---|---|
| **Impact** | Internal Bleeding · Hemorrhage · Magnetic Welt · Shattering Impact · Primary Exhilarate | — |
| **Puncture** | Melee Doughty · Secondary Cryogenic | — |
| **Slash** | Hunter Command · Relentless Combination · **bonus del set Hunter** (los compañeros hacen daño extra a enemigos con status de Slash) | Arcane Deflection · Adaptation · Shock Absorbers · **Hyekka Master (80%)** |

> Las resistencias **por entidad** son otra capa que la matriz por facción de
> [`enemy-resistances.md`](enemy-resistances.md): el Hyekka Master resiste **80%** de Slash *y* de
> Heat con independencia de su facción.

---

## Railjack

Los tres físicos tienen otro status en combate espacial:

| Tipo | Status Railjack | Efecto |
|---|---|---|
| Impact | **Concuss** | −puntería y −daño de la tripulación, 6 s; los procs refrescan |
| Puncture | **Decompress** | −8.5% escudos y −9% armadura de la nave, 20 s; los procs stackean **multiplicativamente** |
| Slash | **Tear** | +7.5% daño recibido por la nave, 20 s; stackea **multiplicativamente** consigo mismo |

## Fuentes

- https://wiki.warframe.com/w/Damage/Impact_Damage · https://wiki.warframe.com/w/Damage/Puncture_Damage · https://wiki.warframe.com/w/Damage/Slash_Damage
- [`damage-types.md`](damage-types.md) · [`damage-over-time.md`](damage-over-time.md) · [`status-effects.md`](status-effects.md) · [`damage-unique.md`](damage-unique.md) · [`faction-damage.md`](faction-damage.md) · [`armor.md`](armor.md)
