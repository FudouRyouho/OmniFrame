# Archon Shard

> Estado: activo
> Rol: los 6 tipos de Archon Shard, sus buffs por slot y cómo se derivan unos de otros
> Fuente de verdad de: los 27 buffs con su valor normal y Tauforged, sus notas de stacking, y las reglas de fusión (Coalescent / Ascent)
> No usar para: adquisición y drops (está en el raw) · el modelado de estos buffs hacia el motor
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Archon_Shard
> Fuente actualizada: 2026-08-13
> Raw: archon-shard.wikitext

Los valores **entre paréntesis** son los de la variante **Tauforged**.

## Cómo se derivan los shards

Hay **tres colores primarios** y **tres derivados**. La derivación no es cosmética: explica por qué
un shard derivado bonifica lo que bonifica, y por qué alguno de sus buffs escala contando otros
shards equipados.

| Derivado | Se fusiona de |
|---|---|
| **Violet** | Crimson + Azure |
| **Topaz** | Crimson + Amber |
| **Emerald** | Amber + Azure |

**Coalescent Fusion** — combina dos colores primarios. Sólo normal con normal, y sólo Tauforged con
Tauforged (produce el derivado Tauforged). Cuesta 50 Stela.

**Ascent Fusion** — combina **tres shards del mismo color** para convertirlos en su Tauforged.
Funciona con los seis colores, no sólo con los primarios. Cuesta 100 Stela.

Ambas fusiones son **permanentes e irreversibles**; el juego pide escribir `CONFIRM`.

---

## Crimson

| Buff | Notas |
|---|---|
| +25% (+37.5%) Melee **Critical Damage** | Aditivo con buffs similares como Organ Shatter. Afecta Exalted Weapons de la clase correspondiente. |
| +25% (+37.5%) Primary **Status Chance** | Aditivo con buffs similares como Rifle Aptitude. Afecta Exalted Weapons de la clase correspondiente. |
| +25% (+37.5%) Secondary **Critical Chance** | Aditivo con buffs similares como Pistol Gambit. Afecta Exalted Weapons de la clase correspondiente. |
| +10% (+15%) **Ability Strength** | Aditivo con buffs similares. |
| +10% (+15%) **Ability Duration** | Aditivo con buffs similares. |

## Amber

| Buff | Notas |
|---|---|
| +30% (+45%) de la **Energy máxima** se llena al aparecer | Aditivo con buffs similares como Preparation. |
| +100% (+150%) de efectividad en **Health Orbs** | Impacta la salud ganada de Universal Orbs. Aditivo con Mending Shot y Restorative Bond. **No** afecta la conversión de Equilibrium. **No** interactúa con los buffs de Violet. |
| +50% (+75%) de efectividad en **Energy Orbs** | Impacta la energía ganada de Universal Orbs. Aditivo con Energizing Shot. **No** interactúa con los buffs de Violet. |
| +25% (+37.5%) **Casting Speed** | Aditivo con buffs similares como Natural Talent. |
| +15% (+22.5%) **Parkour Velocity** | Aditivo con buffs similares como Mobilize. |

## Azure

Los cinco son **valores planos aplicados después de todos los bonus**.

| Buff | Notas |
|---|---|
| +150 (+225) **Health** | — |
| +150 (+225) **Shield Capacity** | No elegible para Inaros, Kullervo ni Nidus. |
| +50 (+75) **Energy Max** | No elegible para Hildryn ni Lavos. |
| +150 (+225) **Armor** | — |
| +5 (+7.5) **Health/s** regenerados | — |

## Emerald *(Amber + Azure)*

| Buff | Notas |
|---|---|
| Los status de **Toxin** hacen +30% (+45%) más daño | Afecta procs de Toxin de armas **y** de habilidades. Aditivo con otras fuentes de Status Damage. |
| Recupera +2 (+3) **Health** cada vez que un enemigo recibe daño de un status de Toxin | — |
| +10% (+15%) **Ability Damage** contra enemigos afectados por **Corrosion** | Ability Damage es un modificador **único**: **multiplicativo** con Ability Strength. Entre shards distintos, aditivo. |
| +2 (+3) al máximo de stacks de **Corrosion** | Sólo la Corrosion aplicada por habilidades de warframe o armas puede pasar de 10 stacks. |

## Topaz *(Crimson + Amber)*

| Buff | Notas |
|---|---|
| +1 (2) **Max Health** por enemigo muerto con daño **Blast**. Máximo 300 (450) | Valor plano después de todos los bonus. Se **reinicia** al consumir un revive. |
| +5 (+7.5) **Shields** regenerados al matar un enemigo con daño Blast | No genera Overshields. No aplica cuando ocurre Shield Gating. |
| +1% (1.5%) **Secondary Critical Chance** por enemigo muerto afectado por **Heat**. Máximo 50% (75%) | Aditivo con buffs similares. Se **reinicia** al consumir un revive. |
| +10% (+15%) **Ability Damage** contra enemigos afectados por **Radiation** | Modificador único: multiplicativo con Ability Strength, aditivo entre shards. |

## Violet *(Crimson + Azure)*

| Buff | Notas |
|---|---|
| +10% (+15%) **Ability Damage** contra enemigos afectados por **Electricity** | Modificador único: multiplicativo con Ability Strength, aditivo entre shards. |
| +30% (+45%) **Primary Electricity Damage**, y +10% (+15%) adicional **por cada shard Crimson, Azure o Violet equipado** | Aditivo con buffs similares como Stormbringer. |
| +25% (+37.5%) **Melee Critical Damage**; el bonus se **duplica** con Energy máxima superior a 500 | **No** se activa con exactamente 500 de Energy máxima: hacen falta 501 o más. Aditivo con buffs similares. |
| Los pickups de Health dan +20% (+30%) **Energy**; los de Energy dan +20% (+30%) **Health** | Aditivo con buffs similares como Equilibrium. **No** interactúa con los buffs de Amber. |

## Fuentes

- https://wiki.warframe.com/w/Archon_Shard
