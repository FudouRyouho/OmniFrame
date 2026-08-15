# Toxic Lash — Saryn (habilidad 3)

> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Toxic_Lash
> Fuente actualizada: 2026-08-09
> Raw: toxic-lash.wikitext

## Identidad de la mecánica: NO es un buff de nodo

Toxic Lash **no modifica ningún atributo del arma**. Añade una **instancia de daño separada** por cada
golpe. La wiki lo nombra explícitamente y le da categoría propia:

> *"adding an **[[Extra Hit]]** for 20% / 24% / 26% / 30% of the damage of each hit as Toxin damage
> (**doubled** for melee weapons), which has a guaranteed Toxin proc on every strike."*

> *"This damage buff is applied as an **Extra Hit**."*

La página está en `[[Category:Extra-hit Buffs]]` — **es una clase de mecánica, no un caso aislado.**

## Valores base

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Added **gun** damage (`× Strength`) | 20% | 24% | 26% | **30%** |
| Added **melee** damage (`× Strength`) | 40% | 48% | 52% | **60%** |

- **Duración:** 20 / 25 / 35 / 45 s (`× Duration`). **Rango:** N/A. **Energía:** 50 (`× Efficiency`).
- **Toxin status chance del Extra Hit:** 100% (garantizado en cada golpe).
- Cast ~1 s (`× Casting Speed`), one-handed, recasteable para refrescar duración. Inmune a CC durante el cast.

## La matemática exacta (verbatim de la wiki)

Arma sin mods cuya hoja marca 200 de daño, Toxic Lash rank 3, Intensify rank 5:

```
Extra Hit directo:  200 × 0.3 × 1.3   = 78 Toxin
Tick del proc:      78 × 0.5          = 39 Toxin/s   (enemigo sin armor ni resistencia a toxina)
```

El multiplicador sale de **la hoja de daño del arma**, y el Extra Hit se aplica **antes de las
resistencias de health y armor**.

## Reglas de composición (lo que lo hace distinto)

| Regla | Verbatim |
|---|---|
| **No combina con elementos del arma** | *"The extra Toxin damage from Toxic Lash does **not** combine with weapon elements."* |
| **Escala con TODOS los mods elementales** | *"scales with **all** elemental mods (not just Toxin) and elemental buffs like Venom Dose and Nourish, even on damage instances normally unaffected by elemental mods"* |
| **Los mods de Toxin escalan sus ticks** | *"**All** Toxin mods in the weapon will apply their toxin multiplier to Toxic Lash's Toxin status ticks, **even if they are combined into other elements**."* |
| **Serration / Eclipse NO escalan así** | *"Base damage bonuses from mods (e.g. Serration) and abilities (e.g. Eclipse) do not scale Toxic Lash in this way."* |
| **Triple-dip de facción** | *"Faction Damage Mods, after first applying to the weapon's base damage, will multiply Toxic Lash's Extra Hit a second time, and then multiply its Toxin ticks a **third** time, providing multiplicative triple-dipping."* |
| **Por multishot** | *"If the weapon has multishot, Toxic Lash adds these Extra Hits … to **every individual multishot hit**"* → *"shotguns are guaranteed to stack potentially dozens of Toxin procs per shot."* |
| **Elementalist + Emerald Shard** | *"stack **additively** to affect the damage of the Toxin proc."* |
| **Status duration** | Los mods de status duration y la pasiva de Saryn afectan la duración del proc de Toxin. |
| **No carga Incarnon** | *"Toxic Lash's damage instance does **not** charge Incarnon transformations."* |
| **Es daño de habilidad** | *"Damage is affected by Ancient Disruptor auras and other enemies that reduce ability damage, **unlike other weapon buffing skills**."* |

**Disparadores:** la mayoría de los hits de arma disparan un Extra Hit, incluidos Acid Shells y
Concealed Explosives; **no** Bursting Mass ni los maggots de Pathocyst.

## Sinergia con Spores

- Toxic Lash hace estallar Spores con cada ataque, incluso sin golpear directamente la spore.
- Un enemigo con Spores recibe **DOS** Extra Hits, pero **una sola** stack de status de Toxin.

## Bug documentado en la wiki

Como cliente en escuadra (no host), Toxic Lash **reduce significativamente el crit chance**: con 400%
de CC solo aparecen crits amarillos ocasionales donde deberían ser rojos garantizados.

## Augment

`Contagion Cloud` — no capturado acá (la wiki lo transcluye desde su propia página).
