# Eclipse — Mirage (habilidad 3)

> Estado: activo
> Rol: habilidad 3 de Mirage — **dos casteos** sobre una misma tecla: tap da reducción de daño, hold da daño de arma
> Fuente de verdad de: que el modo lo elige el casteo (tap/hold), no el entorno · los valores por rank de ambos modos y el cap del 90% · que el bonus de daño es un **multiplicador único** y su fórmula · que **no** lo multiplica el CO aditivo · que se aplica **una sola vez** al daño de status (a diferencia del faction damage) · que compañeros y hologramas **no** lo reciben sin el augment · los valores al subsumirla
> No usar para: los stats base de Mirage · *Hall of Mirrors* ni el resto de sus habilidades · la ley de Damage Reduction (ver [`../../mechanics/damage-reduction.md`](../../mechanics/damage-reduction.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Eclipse
> Fuente actualizada: 2026-02-25
> Raw: eclipse.wikitext

## Qué es

Mirage gasta **25 de energía** por **10 / 15 / 20 / 25 s**. Cuál de los dos efectos recibe lo decide
**cómo se pulsa la tecla**:

| Casteo | Modo | Qué da (rank 0 → 3) |
|---|---|---|
| **Tap** | *Lunar Eclipse* | **Damage Reduction** 25 / 40 / 60 / **75%** · además reduce la precisión enemiga |
| **Hold** | *Solar Eclipse* | **Daño de arma** 50 / 100 / 150 / **200%** |

Ambos escalan con Ability Strength. La reducción de daño **topa en 90%**.

Tiene **1 segundo de casting delay** (afectado por Casting Speed) y se puede recastear para refrescar
la duración.

## Cómo compone el bonus de daño

Es un **multiplicador único** — no entra al pool aditivo de los mods de daño:

```
250 × (1 + Serration 1.65) × (1 + 2 × (1 + Intensify 0.30))
```

**Pero no lo multiplica el Condition Overload aditivo.** En las armas cuyo CO es aditivo, el daño base
se multiplica por separado y después se suman.

**Se aplica una sola vez al daño de status.** El buff alcanza tanto al daño inicial como al de los
status effects, y ahí está la diferencia con el **faction damage**, que en los status hace *double
dip*: el de Eclipse no.

Como se aplica universalmente, también alcanza a [ciertas habilidades](../../mechanics/) que escalan
con bonus de arma.

## A quién alcanza — y a quién no

**Los compañeros y los hologramas de *Hall of Mirrors* NO reciben el bonus de daño.** Sólo lo hacen
con el augment *Total Eclipse*.

Se aplica **dos veces** con *Exodia Contagion* y con las explosiones de glaive.

## Sinergia con *Prism*

- **Lunar** (tap) **reduce a la mitad** el costo por segundo de *Prism*, aplicado *después* de Ability
  Efficiency y Ability Duration.
- **Solar** (hold) aumenta el daño de *Prism* en **100%**.

## Helminth

Eclipse es **subsumible**. Al usarla desde el Helminth, la reducción de daño topa en **75%** y el bonus
de daño baja a **2% / 9% / 15% / 30%**.
