# Metamorphosis — Equinox (habilidad 1)

> Estado: activo
> Rol: habilidad 1 de Equinox — cambia de forma (día/noche) y da bonos **que decaen linealmente hasta cero** durante su duración
> Fuente de verdad de: los bonos de cada forma y sus valores por rank · **que decaen linealmente cada segundo hasta valer cero al expirar** · que los de Night Form son **flat post-mods** y los de Day Form **aditivos al pool de mods**, con sus cuatro fórmulas · que el bonus de daño **no aplica a melee** · que cambiar de forma borra los bonos de la anterior
> No usar para: los stats base de Equinox · el resto de sus habilidades · la ley de movement speed (ver [`../../mechanics/movement-speed.md`](../../mechanics/movement-speed.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Metamorphosis
> Fuente actualizada: 2026-05-31
> Raw: metamorphosis.wikitext

## Qué es

Equinox gasta **25 de energía** para transformarse entre sus formas de noche y de día. Cada forma le
habilita una mitad distinta de sus otras habilidades y le da bonos por
**10 / 15 / 20 / 25 s**.

**Los bonos no son constantes: decaen linealmente cada segundo hasta llegar a cero cuando la habilidad
expira.** Los valores de la tabla son los del **primer segundo** tras completarse la transformación —
que es como la propia fuente redacta todos sus ejemplos.

| Forma | Qué da (rank 0 → 3) |
|---|---|
| **Night** | **Armadura** +100 / 150 / 200 / **250** · **Escudo** +50 / 75 / 100 / **150** |
| **Day** | **Daño de arma** +10% / 15% / 20% / **25%** · **Movement Speed** +5% / 10% / 12% / **15%** |

Todos escalan con Ability Strength.

## Cómo compone cada forma — son dos moldes distintos

**Night Form: bono plano, después de los mods.** Se suma a la capacidad ya modificada, no al pool:

```
Escudo   = 370 × (1 + Redirection 100%) + 150 × (1 + Intensify 30%)
Armadura = 135 × (1 + Steel Fiber 100%) + 250 × (1 + Intensify 30%)
```

**Day Form: aditivo al pool de mods.** Se suma con *Serration* y con *Rush* antes de multiplicar:

```
Daño     = 100  × (1 + Serration 165% + 25% × (1 + Intensify 30%))
Velocidad= 1.15 × (1 + Rush 30%      + 25% × (1 + Intensify 30%))
```

**El bonus de daño no funciona sobre armas melee.**

> El ejemplo de escudos de la fuente parte de **370** para Equinox; el dataset del proyecto trae
> **270**. El de armadura (**135**) sí coincide.

## Cambio de forma

Tarda cerca de **1 segundo**. Cambiar de forma **quita los bonos de la forma anterior**: sólo puede
haber un set de buffs de Metamorphosis activo a la vez. Castear es una **acción de una mano**.

*Pacify & Provoke* y *Mend & Maim* se desactivan al castear Metamorphosis — pero castearla en Day Form
con *Provoke* activo **aumenta** los bonos de armadura y escudo de la Night Form resultante.

## Detalles de la Night Form

En misiones con peligros de hielo, la tasa de decaimiento del escudo **se reduce a la mitad**. Al
terminar la habilidad, Equinox queda con **overshields equivalentes al 50%** del bonus máximo de
escudo.
