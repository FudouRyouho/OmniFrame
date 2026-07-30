# Movement Speed / Sprint Speed / Parkour Velocity

> Estado: activo
> Rol: separar los stats de movimiento del warframe — cuál es cuál, qué afecta cada uno, cómo componen
> Fuente de verdad de: relación entre el stat base del arsenal y los upgrade types de movimiento
> No usar para: catálogo completo de mods/arcanos por stat (la wiki los lista, acá solo los representativos)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Movement_Speed · https://wiki.warframe.com/w/Sprint_Speed · https://wiki.warframe.com/w/Maneuvers
> Fuente actualizada: 2026-07-30
> Raw íntegro: `raw/movement-speed.wikitext`, `raw/sprint-speed.wikitext`, `raw/maneuvers.wikitext` (capturados vía `?action=raw`)
> Raw: movement-speed.wikitext · sprint-speed.wikitext · maneuvers.wikitext

Hechos del juego, no decisiones de OmniFrame.

## El punto que se presta a confusión

El stat que el arsenal muestra como **"Sprint Speed"** (y que el export trae como `sprint_speed`)
**no es** un modificador de la velocidad de sprint. Verbatim:

> *"A Warframe's base Sprint Speed Stat is **not** a direct modifier to its sprint speed, but is
> actually the Warframes base **Movement Speed modifier**."*

Y su recíproco, también verbatim:

> *"Sprint Speed bonuses **do not** affect a Warframe's Movement Speed, even though they increase the
> listed Sprint Speed stat in the arsenal."*

O sea: **el dato base y los bonos que llevan el mismo nombre operan sobre cosas distintas.** El stat
base es la escala del *walk speed*; los bonos de Sprint Speed solo aceleran la animación de correr.

Ejemplo de la wiki: un Gauss sin mods (base 1.4) **camina más rápido** que una Mesa con Rush
(1.43 de Sprint Speed listado); pero ambos **corren** parecido. Y Gauss con Rush camina **igual** que
Gauss sin Rush.

## Los números (verbatim)

Base de walk speed a stat 1.0 = **6 m/s**. El stat escala linealmente. Sprintar suma un **+25%**.

| Base Sprint Speed | Walk | Sprint |
|---|---|---|
| 1.0 | 6 m/s | 7.5 m/s |
| 1.2 | 7.2 m/s | — |
| 1.4 | 8.4 m/s | 10.5 m/s |
| 1.4 + Rush (+30%) | **8.4 m/s** (sin cambio) | 13.65 m/s |

**Composición derivada de esos números** (no verbatim, pero reproduce los tres casos):

```
walk   = 6 m/s × base_sprint_speed_stat × (1 + Σ movement_speed_bonuses)
sprint = walk × 1.25 × (1 + Σ sprint_speed_bonuses)
```

Verificación: `8.4 × 1.25 × 1.30 = 13.65` ✓ (Gauss 1.4 + Rush).

Sobre el bucket: *"All Movement Speed bonuses are multiplicative to this modifier"* — es la relación
**base ↔ bonos**, no entre bonos. Entre sí, *"most sources of Movement Speed stack **additively**"*,
con estas excepciones multiplicativas nombradas: Absorb, Fused Crucible, Mesa's Waltz, Prowl,
Rotorswell.

## Qué afecta Movement Speed

**Directamente:** walking · walking while aiming · crouch · crouch walking.

**Indirectamente** (heredan el momentum de caminar/correr): sprint speed · rolling distance ·
sliding distance · aim glide speed · jump kicking distance.

**NO afecta:** jumping/double jumping height · bullet jump speed · wall-dashing speed ·
**attack speed (ni melee attack speed)**.

**Aceleración:** fija en **12 m/s²** para todos los warframes (Gauss/Gauss Prime: 20 m/s²). **No** la
afectan ni los bonos de movimiento ni el stat base.

## Los stats de movimiento son cinco, no dos

`Maneuvers` los enumera como upgrade types distintos:

| Upgrade type | Qué acelera | Fuentes representativas |
|---|---|---|
| **Movement Speed** | maniobras no-sprint (walk, aim-walk, crouch) | Volt Speed, Dispatch Overdrive, Wisp Reservoirs, Nezha Fire Walker |
| **Sprint Speed** | solo la animación de sprint | Rush, Sprint Boost, Armored Agility, Amalgam Serration |
| **Parkour Velocity** (localizado *"Bullet Jump"*) | bullet jump, double jump, rolling, sidespring, backspring | Mobilize, Lightning Dash, Amber Archon Shard (+15% / +22.5% tauforged) |
| **Dodge Speed** | rolling, sidespring, backspring | Amalgam Barrel Diffusion |
| **Slide & Friction** | velocidad de deslizamiento / resistencia a frenar | Maglev, Cunning Drift, Streamlined Form |

(*Mobility* es un sexto, **exclusivo de Conclave** — multiplicador de bullet jump, sliding y fricción.
Fuera de scope PvE.)

## Volt Speed en este marco

Los tres buffs de Speed caen en tres carriles distintos y **ninguno** se deriva del otro:
Movement Speed +75%, Melee Attack Speed +75%, Reload Speed +25%. La wiki de Movement Speed lista
explícitamente que **no** afecta melee attack speed — por eso son dos buffs y no uno, aunque la UI
del juego los muestre colapsados en un solo renglón (`Speed Multiplier: 1,75x`).

Detalle de la habilidad: `../abilities/Volt/Speed.md`.
