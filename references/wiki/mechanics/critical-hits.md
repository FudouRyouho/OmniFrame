# Critical Hits

> Estado: activo
> Rol: sistema de crit — chance, tiers, multiplicador y cuantización del crit damage base
> Fuente de verdad de: fórmulas de critical chance/damage, resolución de tiers, multiplicador por tier, headcrit, daño promedio, cuantización de 12 bits del base CDM
> No usar para: catálogo completo de fuentes de bonus (está en el raw) · qué habilidades pueden crit caso por caso
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Critical_Hit
> Raw: critical-hits.wikitext

## Qué es

El sistema de crit define:

- si un hit hace crit o no
- en qué tier cae ese crit
- qué multiplicador final aplica sobre el hit

## Fórmula base de critical chance

```text
Total Critical Chance = Base Critical Chance × (1 + Relative Bonus) + Absolute Bonus
Relative Bonus = Bonus₁ + Bonus₂ + Bonus₃ + …
Absolute Bonus = Bonus₁ + Bonus₂ + Bonus₃ + …
```

Los relativos **se suman entre sí** y multiplican el base; los absolutos se suman al final, ya fuera
del producto. Ejemplos textuales de la wiki:

```text
12% × (1 + 150% Point Strike + 135% Argon Scope)     ← dos relativos
12% × (1 + 150% Point Strike) + 45% Arcane Avenger    ← relativo + absoluto
```

### Blood Rush — el relativo que escala con combo

No es un bonus plano: entra al paréntesis relativo multiplicado por el combo menos uno.

```text
Base CC × [1 + True Steel + Blood Rush × (Combo Multiplier − 1)]
15%     × [1 + 120%       + 40%       × (7 − 1)]
```

## Fórmula base de critical damage

```text
Total Critical Damage Multiplier = Base CDM × (1 + Relative Bonus) + Absolute Bonus
```

```text
1.6 × (1 + 120% Vital Sense + 120% Bladed Rounds)    ← dos relativos
1.6 × (1 + 120% Vital Sense) + 1.2 Tenacious Bond    ← relativo + absoluto
```

## Cuantización del critical damage base

El **base** CDM del arma está cuantizado a un entero de **12 bits**. Se aplica **antes de los mods**,
pero **después** de los efectos que son aditivos al valor base (como el perk Incarnon Critical
Parallel).

```text
Code(x)             = ⌊ clamp(x, 0, 32) × 4095/32 + 0.5 ⌋
Quantized Base CDM  = Code(x) × 32/4095
```

- `x` se acota a `[0, 32]` antes de codificar.
- 4096 códigos posibles (0–4095) ⇒ valores adyacentes separados por `32/4095 ≈ 0.007814`.
- El cálculo usa aritmética **float de 32 bits**.

Ejemplo del raw, con Braton (base 1.6) + Critical Parallel (+0.4) + Vital Sense:

```text
Code(1.6 + 0.4) = ⌊ 2.0 × 4095/32 + 0.5 ⌋ = 256
CDM final       = 256 × (32/4095) × (1 + 120%)
```

Nótese que `256 × 32/4095 = 2.000244…`, **no** exactamente 2.0 — de ahí las diferencias de decimales
al comparar contra números del juego.

## Resolución de tiers

Conviene trabajar con crit chance en formato decimal:

```text
totalCritChanceDecimal = totalCritChancePercent / 100
tier                   = floor(totalCritChanceDecimal)
chanceToNextTier       = frac(totalCritChanceDecimal)

if roll < chanceToNextTier:
  tier = tier + 1
```

| Total Crit Chance | Resultado | Tier / color |
|---|---|---|
| `x ≤ 0%` | ningún hit puede critear | Tier 0 — hit normal |
| `0% < x < 100%` | **chance** de yellow crit | Tier 0 / 1 |
| `x = 100%` | todos los hits son yellow crit | Tier 1 — amarillo |
| `100% < x < 200%` | **chance** de orange (*Big*) crit | Tier 1 / 2 |
| `x = 200%` | todos orange | Tier 2 — naranja |
| `x > 200%` | chance de red crit y más allá | Tier 3+ — rojo |

Interpretación práctica:

- `0.75` = 75% de chance de yellow crit
- `1.75` = yellow garantizado y 75% de chance de orange crit
- `2.40` = orange garantizado y 40% de chance de red crit

## Multiplicador por tier

```text
Critical Tier Multiplier = 1 + Critical Tier × (Total Critical Damage Multiplier − 1)
```

Ejemplo de la wiki con Lenz en tier 2: `1 + 2 × (2.0 × (1 + 120%) − 1)`.

## Headcrit

```text
Headshot Crit Tier Multi = Headshot Multi × (1 + Critical Tier × (2 × Total CDM − 1))
```

El factor **`2 ×`** sobre el CDM es literal del raw, no un error de transcripción: el crit se
comporta distinto sobre un headshot que sobre el cuerpo. Ejemplo con Lanka en tier 2:
`3.0 × (1 + 2 × (2 × 2.0 × (1 + 120%) − 1))`.

`Headshot Multi` es típicamente **3.0** — es el multiplicador de la parte del cuerpo, y su alcance
estricto (sólo la cabeza) está en [`enemy-body-parts.md`](enemy-body-parts.md).

## Daño promedio esperado

Para comparar builds sin simular cada hit:

```text
Average Damage Multiplier = 1 + Total Critical Chance × (Total CDM − 1)
Average Damage on Hit     = Modded Damage × Average Damage Multiplier
```

Contempla crit chance >100% si el decimal vale, por ejemplo, `1.75`.

## Multishot y pellets

Cada pellet o instancia de multishot hace **su propia tirada** de crit. Importa sobre todo en
shotguns, armas con multishot innato y builds que combinan crit alto con multishot alto.

## Quién puede critear

- **La mayoría de las habilidades de warframe no pueden critear.** Excepciones: las armas exaltadas,
  Ulfrun's Descent (Voruna), las habilidades de Gyre vía su pasiva, y Sporespring (Nokko).
- Aun cuando una habilidad no puede critear normalmente, **sí puede hacerlo a través de weak points**
  si hay efectos que suben el Critical Tier. Esas habilidades tienen un CDM de **1x**, que se puede
  aumentar con Arcane Crepuscular.
- **Los enemigos no pueden infligir críticos** desde la versión 35.0.9.

## Bugs conocidos

- Si el critical tier multiplier pasa de **~255**, el número mostrado se vuelve ≈ −2.100.000.000 (en
  azul, como un hit a shields). El daño real infligido suele ser mucho menor que los 2.1 mil millones
  que harían falta para desbordar de verdad — es un defecto de la visualización.

## Fuentes

- https://wiki.warframe.com/w/Critical_Hit
- [`enemy-body-parts.md`](enemy-body-parts.md) (multiplicador de headshot) · [`melee-combo.md`](melee-combo.md) (Blood Rush)
