# Overguard

> Estado: activo
> Rol: mecánica de Overguard — capa por delante de Shield y Health, con reglas propias y **distintas** entre jugador y enemigo
> Fuente de verdad de: vulnerabilidades y fuentes que amplifican daño al Overguard, qué DR le aplica y cuál no, la diferencia jugador↔enemigo en CC y en el gate, el CC que lo bypasea
> No usar para: la tabla de enemigos con Overguard ni el catálogo completo de fuentes de player Overguard (están en el raw) · el escalado por nivel (→ `enemy-level-scaling.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Overguard
> Fuente actualizada: 2026-07-28
> Raw: overguard.wikitext

## Qué es

Una capa de defensa **adicional** que protege Health y/o Shields.

```text
Orden de daño: Overguard → Shield → Health
```

**Sólo pueden recibirlo warframes, companions, specters y Eidolon Lures.** No se le puede dar a
Defense Objects.

## Vulnerabilidad y amplificadores

Overguard es **neutral a todos los tipos de daño**, con una sola excepción de tipo:

| Fuente | Efecto sobre el daño al Overguard |
|---|---|
| **Void** | **+50%** de vulnerabilidad |
| **Magnetic** (status) | **100%** en el primer stack, **+25%** por cada uno siguiente, hasta **325%** con 10 stacks |
| Damage Vulnerability | aplica normalmente |
| Assassin Posture (companions bestia) | +300% |
| Unleashed (Sunika Kubrow) | +300% |
| Photon Strike (Vauban) | +200% |
| Smite (Oberon) | **remueve el Overguard al instante** |
| Null Audit (Hound) | remueve el **50%** del Overguard de un Eximus |
| Secondary Fortifier | hasta **8×** para secundarias y arch-guns |

> **Magnetic tiene un segundo efecto al romperse el Overguard:** el objetivo recibe daño de
> **Electricity** igual al **3% de su Overguard total por stack** de Magnetic, hasta **30%** con 10
> stacks.

## Qué reducción de daño le aplica — y cuál no

| No le aplica | Sí le aplica |
|---|---|
| DR del **armor** | **Damage Redirection**: Link, Warding Halo, Shield of Shadows |
| DR de habilidades (Splinter Storm) | La DR del **roll** |
| Resistencias por tipo (Adaptation, pasiva de Caliban) | |

Los enemigos **sí** pueden sufrir strip de shields y de armor mientras su Overguard está activo.

## Jugador y enemigo se comportan distinto

Esta es la diferencia que más fácil se pierde: no es la misma mecánica de los dos lados.

| | Jugador | Enemigo |
|---|---|---|
| **Status effects** | los **niega todos**, incluidos Stagger y Knockdown | **los recibe** normalmente |
| **Crowd control** | negado con los status | ignora el CC de Stagger, Knockdown, Stun, Mind Control, Confusion (incluida Radiation), Slow, Ragdoll, Blind y Lifted |
| **Gate al agotarse** | **0.5 s** de invulnerabilidad | **ninguno** |
| **Cold** | — | máximo **4 procs** |

Del lado del jugador, el Overguard ignora incluso el CC que atraviesa a Primed Sure Footed (las
oleadas de fuego de un Arson Eximus). **Pero los ganchos** de enemigos como el Scorpion **sí**
interrumpen y arrastran.

### CC que bypasea el Overguard enemigo

> ⚠️ La wiki marca esta sección con `{{UpdateMe}}`.

- Procs de **Cold** (hasta 4 stacks) y el efecto de bala de los procs de **Void**.
- **Taunt / Threat Level** — la presencia de Overguard no altera el comportamiento del enemigo:
  Decoy (Loki), Chaos (Nyx), Mallet (Octavia), Razorflies (Titania).
- **Switch Teleport** (Loki): el enemigo no queda desorientado al teleportarse.
- **Discharge** (Volt): detiene el movimiento, pero no sus acciones.
- **Shadowgraph** (Follie): la cápsula de defensa distrae a parte de los enemigos.
- Los **Dax** sufren un knockdown forzado si sus ataques especiales son interrumpidos por disparos —
  el Overguard no lo evita.
- **Radiation** no los afecta directamente, pero un enemigo irradiado *sin* Overguard que les dispare
  hace que respondan contra él en lugar del jugador — sólo mientras dure el fuego.

### Habilidades que sí los ralentizan

Vortex de Bastille (Vauban), Tornados (Zephyr) y el Vortex de Coil Horizon (Gyre) **ralentizan** a
enemigos con Overguard; una vez removido, la habilidad los afecta con normalidad.

## Escalado en enemigos

El Overguard es **independiente** del escalado de health y shields del enemigo. Escala por nivel,
pero **es la misma cantidad en todos los tipos de Eximus**. La fórmula vive en
[`enemy-level-scaling.md`](enemy-level-scaling.md).

Caso particular: dispararle el casco a un **Nox** le remueve el Overguard de inmediato.

## Conversión de daño a energía

Si el usuario no tiene shields (Inaros y Nidus por defecto), los efectos que convierten daño a la
salud en energía —Rage, Hunter Adrenaline, Necramech Rage, Kinetic Diversion— **sí** convierten el
daño recibido sobre un Overguard **otorgado por un aliado**.

Kullervo no puede aprovecharlo de forma confiable, porque Recompense le da Overguard propio.

## Fuentes

- https://wiki.warframe.com/w/Overguard
- [`shield.md`](shield.md) · [`hit-points.md`](hit-points.md) · [`enemy-level-scaling.md`](enemy-level-scaling.md) · [`../arcanes/secondary-fortifier.md`](../arcanes/secondary-fortifier.md)
