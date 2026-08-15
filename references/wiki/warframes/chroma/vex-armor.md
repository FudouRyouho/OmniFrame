# Vex Armor — Chroma (habilidad 3)

> Estado: activo
> Rol: habilidad 3 de Chroma — aura de escuadrón con **dos medidores independientes**: *Scorn* (armadura) y *Fury* (daño de arma), que se llenan por lo que le pasa a Chroma
> Fuente de verdad de: qué llena cada medidor y a qué tasa · los topes de ambos · cuánto shield/health hay que perder o cuántas kills hacen falta para maximizarlos · **que ambos son multiplicadores aditivos** que se suman con *Steel Fiber* y *Serration*, con sus dos fórmulas · el comportamiento del recast con más strength
> No usar para: los stats base de Chroma · *Elemental Ward*, *Effigy* ni el resto de sus habilidades · la ley de armadura (ver [`../../mechanics/armor.md`](../../mechanics/armor.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Vex_Armor
> Fuente actualizada: 2026-06-02
> Raw: vex-armor.wikitext

## Qué es

Chroma gasta **75 de energía** y sostiene un aura de **8 / 10 / 15 / 18 m** durante
**10 / 15 / 20 / 25 s**. Él y sus aliados dentro del aura ganan **dos buffs que se llenan por
separado**, y ninguno arranca lleno: empiezan en **0%**.

| Buff | Qué mejora | Qué lo llena |
|---|---|---|
| **Scorn** | **Armadura** del warframe | que a Chroma le peguen en los **escudos**, o que mate con **melee** |
| **Fury** | **Daño base** de armas y de las habilidades de Chroma | que a Chroma le peguen en la **salud**, o que mate con **arma a distancia** |

## Las tasas y los topes

| | Por punto perdido | Por kill | Tope |
|---|---|---|---|
| **Scorn** | 0.5 / 0.625 / 0.75 / **0.875%** por punto de escudo | 7 / 10 / 12 / **15%** por kill melee | 200 / 250 / 300 / **350%** |
| **Fury** | 2 / 2.25 / 2.5 / **2.75%** por punto de salud | 7 / 10 / 12 / **15%** por kill a distancia (**doble** en punto débil) | 200 / 225 / 250 / **275%** |

Los tres números —tasa, kill y tope— escalan **linealmente** con Ability Strength.

**Cuánto hace falta para llenarlos:** perder **400** de escudo o hacer **24** kills melee para maximizar
Scorn; perder **100** de salud o **19** kills a distancia para maximizar Fury. Los golpes a
**overshields** cuentan para Scorn, igual que el drenaje de escudo de un payload de Hijack.

## Cómo compone cada uno

**Ambos son multiplicadores aditivos**: se suman con los mods del mismo eje *antes* de cualquier
cálculo posterior (elementales, crítico, multishot).

```
Armadura = Base × (1 + Armor Mods + Scorn × (1 + Strength Mods))
         = 370 × (1 + 1 + 3.5 × (1 + 0.3))

Daño     = Base × (1 + Damage Mods + Fury × (1 + Strength Mods))
         = 100 × (1 + 1.65 + 2.75 × (1 + 0.3))
```

Es la **misma forma** que la armadura de *Warcry* ([`../valkyr/warcry.md`](../valkyr/warcry.md)): sobre
la base, en el mismo pool que los mods.

Los buffs de **varios Chromas stackean entre sí**.

## Casteo y recast

Castear es una **acción de una mano**: no interrumpe maniobras.

Se puede recastear estando activa **conservando los buffs acumulados**. Si el recast trae más Ability
Strength, el tope sube **sólo para el medidor que todavía no lo alcanzó** — si Scorn ya está al máximo
y Fury no, sólo Fury se beneficia.

## Sinergias

- *Spectral Scream* y otras habilidades llenan **Scorn** con sus kills.
- **Fury** aumenta el daño de *Spectral Scream*, *Effigy* y de cualquier habilidad que escale con
  bonus de daño de arma.
- *Effigy* conserva el aumento de Fury **sólo mientras esté dentro del rango** de Vex Armor.
- El aumento de armadura **se aplica a los objetivos de defensa**.
