# Ammo — Mecánica de munición

> Estado: activo
> Rol: los tres ejes del sistema de munición (cargador, reserva, pickup), ammo efficiency, ammo economy y el caso batería
> Fuente de verdad de: independencia cargador↔reserva, fórmula de ammo efficiency y su stacking, fórmula de ammo economy, cantidades por pickup y su drop chance por tamaño de escuadra, los **ammo regen rates** de las armas de batería, qué no recibe cada bonus
> No usar para: el catálogo completo de ammo pickup overrides por arma (~150 entradas en el patch history del raw) · los bonus por mod (viven en la página de cada mod)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Ammo
> Fuente actualizada: 2026-07-24
> Raw: ammo.wikitext

## Tres ejes independientes

| Eje | Qué es | Stat de arsenal |
|---|---|---|
| **Magazine Capacity** | lo que el arma carga antes de recargar | *(clip size)* |
| **Ammo Maximum** | la reserva total que se puede llevar | `Ammo Maximum` |
| **Ammo Pickup** | cuánto repone **un** pickup — propiedad **por arma** desde la v32 | `Ammo from Pickups` |

**Melee son las únicas armas que no usan munición.** En la UI la munición aparece abajo a la derecha
como `cargador / reserva`.

### Qué NO recibe cada bonus

- **Ammo Maximum no aumenta Magazine Capacity**, y viceversa.
- Los bonus de **Magazine Capacity** no afectan a las armas que tiran **directo de la reserva**: arcos
  y Epitaph.
- **Ammo Maximum** no hace nada en armas **sin pool de munición**: armas de batería, y archguns en
  Archwing o en manos de un Necramech.

> El valor de `Ammo Maximum` por arma se ve en la UI y en la wiki (`Weapon Comparison`), pero **no lo
> expone la API de datos** (sólo magazine). Por eso no hay catálogo de reservas en el dataset.

Los enemigos **no llevan cuenta de munición y nunca se quedan sin ella** — pero sus armas sí tienen
cargador y sí recargan.

### Fuentes

| Eje | Mods |
|---|---|
| **+ Magazine** | Ammo Stock (Primed) · Magazine Warp (Primed) · Slip Magazine (Primed) · Magazine Extension · Atomic Fallout · Magnetic Capacity · Shotgun Elementalist · Wildfire · Ice Storm · Stockpiled Blight · Combo Fury · Tainted Mag · Tainted Clip · Burdened Magazine |
| **− Magazine** | Depleted Reload |
| **+ Ammo Maximum** | Ammo Case · Ammo Chain (Primed) · Ammo Drum · Trick Mag · Shell Compression |
| Conclave | Maximum / Loaded / Full Capacity · Hydraulic Gauge / Chamber / Barrel |

Un cargador chico baja mucho el **DPS sostenido** respecto del burst, porque recargar lleva tiempo
(→ [`reload.md`](reload.md) §DPS sostenido).

## Pickups

| Tipo (color) | Repone |
|---|---|
| **Primary** (morado) | **80** rifles de asalto, armas continuas, ballestas · **60** spearguns · **40** escopetas automáticas · **15** escopetas semi-auto, snipers y arcos · **varía** en lanzadores |
| **Secondary** (naranja) | **40** la mayoría · **20** shotgun sidearms |
| **Heavy** (amarillo) | **1000** de archgun atmosférico, o **resetea el cooldown** del Archweapon Deployer si no está equipada |
| **Universal** (azul) | **1×** el Ammo Pickup de **todos** los tipos, y **no** resetea el Deployer |

**Las AoE tienden a tener un Ammo Pickup base más bajo.** La v32 introdujo *overrides* por arma que
llegan a **1 munición por pickup** (Kuva Bramma, Kuva Ogris, Kuva Zarr, Lenz, Proboscis Cernos) — el
catálogo completo está en el patch history del raw.

El pack **Universal** no aparece en juego normal: sólo en Arena, Conclave y Simulacrum. Las excepciones
—más chicas y con acentos rojos— son Transmutation Probe (Lavos), Dispensary (Protea) y el Universal
Ammo de Shadowgraph (Follie).

### Drop chance — escala con el tamaño de la escuadra

| Escuadra | Normal | Landscape |
|---|---|---|
| 1 jugador | 45% | 60% |
| 2 jugadores | 37.5% | 52.5% |
| 3 jugadores | 30% | 45% |
| 4 jugadores | 22.5% | 37.5% |

En la mayoría de enemigos, **cada tirada de la drop table da como máximo un pickup**. Los **Eximus**
tienen drop **garantizado** de Primary o Secondary (misma chance cada uno), y eso **no reemplaza** su
chance normal.

### Scavenger y mutación

Cada tipo de munición tiene su aura **Scavenger** (Rifle / Shotgun / Sniper / Pistol), que aumenta lo
que se recibe del pickup.

Los mods de **mutación** convierten los pickups de *otro* tipo al del arma activa, **siempre que el
otro pool esté lleno**. Desde la v32 convierten al **50%** del Ammo Pickup (Vigilante Supplies, al
**30%**).

> En esa misma revisión, **Primary y Secondary Merciless perdieron su bonus de +100% de Ammo
> Maximum**. Ya no son fuente de reserva.

## Armas de batería

Usan una batería **autorecargable** en vez de reserva: al dejar de disparar hay un retardo corto y
después regeneran solas, sin recarga manual.

> **Sí les afecta Magazine Capacity. Ammo Maximum y Ammo Pickup, no.**

El `Recharge Rate` —que la fórmula de recarga de batería usa y **ningún mod modifica**
(→ [`reload.md`](reload.md))— sólo está publicado en el patch history de la v32.0.2, donde DE revirtió
los recortes que había hecho en la v32:

| Arma | Ammo regen rate |
|---|---|
| Basmu | 42/s |
| Flux Rifle · Cycron · Tenet Cycron | 40/s |
| Fulmin | 30/s |
| Shedu | 28/s |
| Bubonico | 9/s |

## Ammo Efficiency

> *"Ammo Efficiency determines the number of shots that occur before consuming ammo."*

No es una chance de no consumir: reduce el costo efectivo por disparo.

```text
Disparos por munición consumida = 1 / (1 − Ammo Efficiency Bonus)
```

75% de efficiency ⇒ se gasta munición **cada cuatro disparos**. Las fuentes que otorgan *"no ammo
consumption"* mientras dura el buff **son 100% de ammo efficiency**.

> **Stacking: aditivo entre todas las fuentes, excepto Energized Munitions, que stackea
> multiplicativamente.**

### Fuentes, con su condición

| Fuente | Condición y valor |
|---|---|
| Velox / Velox Prime | **20%** pasivo (**40%** con Protea) |
| AX-52 | **60%** disparando desde la cadera |
| Athodai | 100% por **8 s** al matar con headshot (Prime: **12 s**) |
| Knell / Knell Prime | 100% por **2 s** al headshot |
| Dual Toxocyst | 100% por **3 s** al headshot |
| Perigale | 100% por **4 s** con 4 headshots consecutivos o kill por headshot |
| Magnus Prime · Akmagnus Prime | **4%** de chance al impactar → 100% por **4 s** |

Además: mods Brain Storm, Skull Shots, Zazvat-Kar, Vikla-Safor · arcanos Akimbo Slip Shot, Primary
Compression, Primary Crux, Arcane Pistoleer, Eternal Logistics, Zid-An Haras · el buff de Reactant de
Void Fissure · el nodo Focus Void Fuel · la habilidad Energized Munitions.

## Ammo Economy

Medida metagame de **cuánto daño rinde un arma por munición**.

```text
Time To Deplete Ammo = (Modded Ammo Capacity / Modded Magazine Size)
                       × ( Modded Reload Time + Modded Magazine Size / Modded Fire Rate )
```

```text
Average Shot = Modded Multishot
               × [ Normal Shot   × (1 − (Modded Crit Chance mod 1))
                 + Critical Shot ×      (Modded Crit Chance mod 1)  ]
```

> `mod` es la operación **módulo** — es como la wiki modela la crit chance por encima del 100%: la
> parte entera son multiplicadores de crit garantizados y el resto es la probabilidad del siguiente
> tier (→ [`critical-hits.md`](critical-hits.md)). El cálculo completo vive en `Damage#Gun Damage Per
> Second`.

> **Cuanto más tarda en agotarse la reserva y más alto el daño promedio por munición, mejor la ammo
> economy.**

Pesa sobre todo en armas de **cadencia alta**. Y hay una asimetría que la wiki señala explícitamente:

- un mod de **daño** (Serration) sube el DPS **y** el daño por munición;
- un mod de **cadencia** (Speed Trigger) sube **sólo** el DPS.

De ahí que contra enemigos que aguantan muchos disparos convenga resignar cadencia por daño.

## Bugs conocidos

Los Synovia de Eidolon, los contenedores de Landscape y los Aurax Atloc Raknoid siguen dropeando packs
de munición **pre-v32** (los tipos Rifle / Shotgun / Sniper / Secondary que fueron eliminados). Los
Primary viejos igual reponen todos los tipos de primaria.

## Fuentes

- https://wiki.warframe.com/w/Ammo
- [`reload.md`](reload.md) · [`critical-hits.md`](critical-hits.md)
