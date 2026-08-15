# Health

> Estado: activo
> Rol: fórmula de Health, bonus por rango, curación, bleedout y cálculo de EHP del jugador
> Fuente de verdad de: cálculo de Total Health, por qué el rank bonus entra antes del multiplicador, ausencia de regeneración natural, duración y límites del bleedout, fórmula de EHP
> No usar para: escalado de health de enemigos (→ `enemy-level-scaling.md`) · el detalle de las otras capas (→ `shield.md` · `overguard.md`)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Health
> Fuente actualizada: 2026-03-31
> Raw: health.wikitext

## Fórmula base

```text
Total Health = (Base Health + Warframe Rank Bonuses) × (1 + Modifier from Mods) + Other Bonuses
```

La salud ganada por nivel es **la excepción** a la regla general: apila **aditivamente con la salud
base, antes** del multiplicador — así que los mods la amplifican.

- **Base Health** — el valor del warframe a Rank 0.
- **Warframe Rank Bonuses** — normalmente **+100** al rango 30, con excepciones. **No dependen del
  mastery rank**: dos jugadores con frames recién construidos tienen el mismo bonus.
- **Modifier from Mods** — Vitality +100%, Vigor +50%, Physique (aura) +20% a rango máximo.
- **Other Bonuses** — planos, después del multiplicador.

> **Physique apila por escuadra:** cada miembro que la lleve suma otro +20%, hasta **+80%** en una
> misión de cuatro, y se puede subir más con Coaction Drift. Los cascos arcanos también aportan a
> este modificador.

> ℹ️ Ilustración propia. `(450 base + 100 rank) × (1 + 1.00 Vitality) = 1100` — Vitality amplifica
> tanto la base como el bonus de rango.

## Curación

**La salud no regenera sola.** Las únicas excepciones son las auras **Rejuvenation** y **Dreamer's
Bond**, y basta con que **un miembro de la escuadra** las lleve.

Fuera de eso hay que curarse activamente: Health Orbs, habilidades, mods, armas, consumibles o
arcanos.

## Reducción de salud máxima

| Fuente | Efecto |
|---|---|
| **Bleeding Dragon Key** | −75% de la salud total, **después de todos los demás cálculos** |
| **Permanent Injury** (Deep / Temporal Archimedea) | multiplica la salud máxima por **0.985×** cada vez que recibís daño a la salud; se recupera **3%** tras 12 s sin recibir daño |

En Permanent Injury, "salud máxima" es la del warframe **antes** de los bonus de rango y otros
buffs, y el valor se redondea hacia abajo tras cada reducción.

## Bleedout

Al llegar a 0 de salud, los warframes entran en **bleedout**:

- Apenas pueden moverse y quedan **restringidos a disparar su secundaria**.
- Si no reciben atención de un aliado en **20 segundos**, mueren.

## Effective Health

```text
Effective Health = Nominal Health × (Net Armor + 300) / 300
Effective Shield = Nominal Shield × 2

                Effective Health + Effective Shield
EHP  =  ──────────────────────────────────────────────────────
        (1 − Net Damage Reduction) × (1 + Damage Type Modifier)
```

- **Nominal health** es la salud que muestra el juego: la total **después** de mods y buffs.
- **Net Damage Reduction** es la DR **fuera del armor** — Blessing, Adaptation.

> ⚠️ Conflicto ↔ [`hit-points.md`](hit-points.md) §Cálculo de Effective Hit Points

El EHP puede aumentarse con armor, fuentes de damage reduction, modificadores de tipo de daño
negativos, mods de resistencia y clases de salud.

## Interacciones

| Mecánica | Comportamiento |
|---|---|
| **Armor** | la salud **sí** recibe su mitigación (a diferencia de shields y overguard) |
| **Toxin** | bypasea shields y golpea la salud directamente |
| **Viral** | aumenta el daño infligido a la salud |

## Fuentes

- https://wiki.warframe.com/w/Health
- [`armor.md`](armor.md) · [`shield.md`](shield.md) · [`hit-points.md`](hit-points.md) · [`damage-reduction.md`](damage-reduction.md)
