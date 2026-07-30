# Melee Influence

> Estado: activo
> Rol: arcano melee — un proc de Electricity concede un buff temporal que propaga los status elementales del melee a los enemigos alrededor del golpeado
> Fuente de verdad de: escalado por rank, status propagables, cálculo del daño propagado, armas con proc eléctrico forzado, bugs
> No usar para: catálogo de armas compatibles fuera de la lista de proc eléctrico forzado
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Melee_Influence
> Fuente actualizada: 2026-06-10
> Raw: melee-influence.wikitext

## Qué es

Un proc de **Electricity** de melee tiene un **20% de chance** de conceder un **buff temporal** que
hace que los status elementales del melee **se propaguen** a los enemigos alrededor del objetivo.
El buff **no puede refrescar su duración** mientras está activo.

La chance es fija en 20% en todos los ranks; lo que escala es radio y duración.

## Escalado por rank

| Rank | Chance | Radio | Duración |
|---|---|---|---|
| 0 | 20% | 10m | 3s |
| 1 | 20% | 12m | 6s |
| 2 | 20% | 14m | 9s |
| 3 | 20% | 16m | 12s |
| 4 | 20% | 18m | 15s |
| 5 | 20% | 20m | 18s |

**El radio se mide desde la posición del enemigo golpeado**, no desde el jugador. Por eso las armas
arrojadizas (Xoris) y las gunblades (Redeemer) se benefician especialmente.

## Status propagables

- **Elementales primarios:** Cold, Electricity, Heat, Toxin.
- **Elementales secundarios:** Blast, Corrosive, Gas, Magnetic, Radiation, Viral.

**No propaga:** los físicos (Impact, Puncture, Slash), Void, Tau, ni los de control —
Knockdown, Stagger, Ragdoll, Lifted, Microwave.

## Daño propagado

Además de transferir el status, **inflige daño** igual a la cantidad de **ese daño elemental
presente en la pantalla de stats del melee**, ya **cuantizado**.

Ejemplo base de la wiki: un melee de 100 de daño base con Shocking Touch; si Influence proccea,
inflige **90 de Electricity extra** al objetivo primario.

Procar **varios elementos a la vez** muestra la **suma** del daño propagado. Por eso conviene
concentrar un solo tipo elemental: agregar más reduce la probabilidad de que dispare el de mayor
daño del arma.

### Ejemplo desarrollado (Skana)

Skana con Pressure Point, Vicious Frost, Virulent Scourge y Voltaic Strike:

| Proc que ocurre | Daño a todos en rango | Proc aplicado |
|---|---|---|
| Electricity | `120 × (1 + 1.2) × 0.6` | Electricity, `120 × (1 + 1.2) × (1 + 0.6) ÷ 2` por tick |
| Viral | `120 × (1 + 1.2) × (0.6 + 0.6)` | Viral |
| Slash | **nada** | — |
| Electricity + Viral | ambos montos de arriba | Viral + Electricity (mismo tick de arriba) |

### Faction Damage Bonus se aplica más de una vez

Por la naturaleza del bonus de facción, se aplica **dos veces** sobre el daño de Melee Influence y
**tres veces** sobre los procs de daño que causa.

Ejemplo de la wiki: melee de 100 de base con Shocking Touch y **+55% de faction bonus** → **294** de
daño de hit, con **228** de daño de proc de Electricity. Si Influence proccea, los procs propagados
hacen **353** de daño.

> ⚠️ La versión anterior de este documento consignaba *"294 daño directo, procs 211.2
> Electricity/tick"*. El `211.2` **no aparece en el raw** y no se pudo respaldar; los valores de
> arriba son los que la página trae hoy.

## Restricciones de disparo

- Sólo dispara desde **golpes melee directos**. Los efectos secundarios no cuentan: la rotura de
  Magnetic, los campos de toxina del Dual Ichor Incarnon.
- Los **proyectiles** de melee que atraviesan Electric Shield, el disparo alternativo del Mutalist
  Quanta o Conductive Sphere **sí** lo activan — con ejemplos como Nepheri, Hate Incarnon Genesis,
  Ceramic Dagger Incarnon Genesis o los proyectiles del Syam. **No funciona con Glaives.**
- Un **finisher** con proc elemental forzado no propaga daño de finisher: 0% del daño infligido está
  compuesto por el status elemental que procó.
- El AoE **ignora el Rift Plane**: alcanza a todos los enemigos en rango sin importar el plano desde
  el que se atacó.

## Sinergias

- El daño está afectado por **Condition Overload** y por el **multiplicador de crítico**.
- El daño elemental ganado por habilidades (p. ej. Smite Infusion) **también se propaga**.

## Armas con proc eléctrico forzado

Armas con status de Electricity garantizado o probable **independiente de sus tipos de daño
elemental**, capaces de activar el arcano. Los slam attacks incluyen cualquier combo de stance que
termine en slam.

| Arma | Cómo |
|---|---|
| Prova / Prova Vandal | slam (100%) y Static Discharge (chance) |
| Xoris | detonación en vuelo (100%) |
| Falcor | detonación en vuelo y lanzamiento cargado (100%) |
| Arca Titron | slam (chance), slam con Slam Capacitor (100%), heavy slam (100%) |
| Obex / Prisma Obex | slam (chance) |
| Ohma / Prisma Ohma | slam (chance) |
| Lacera / Ceti Lacera | slam (chance) |
| Galvacord | slam (chance) |
| Rumblejack | slam (100%), heavy slam (chance) — su finisher único **no** puede procar el arcano |
| Lecta / Secura Lecta | slam (chance), heavy slam (chance) |
| Ninkondi | slam (chance), heavy slam (chance) |
| Korumm | combo de bloqueo único (100%) |

## Bugs conocidos

> Clasificados como **bugs** por la wiki, no como comportamiento diseñado.

- Disparan el arcano sin ser melee: **Electro Pulse** y **Synergized Prospectus** (este último sólo
  en clientes).
- Con el arcano activo, un **Elemental Ward de Cold** cuenta el daño de bala reflejado como daño
  melee, propagando procs de Cold a los enemigos que te disparan.
- Los golpes que matan de un solo hit **no** activan el arcano ni se benefician de él.
- Los **Decrees** pueden usar el efecto del arcano; en particular *Wyrmling's Aid*.

## Adquisición

Recompensa por matar a **The Fragmented** en Effervo (Deimos), a los **Whispers** en misiones de
Albrecht's Laboratories y a los **Gruzzlings** en misiones no-Disruption de esas mismas. Se compra a
**Bird 3** de Cavia por 7.500 de standing, con rango **Scholar (4)**.

## Fuentes

- https://wiki.warframe.com/w/Melee_Influence
