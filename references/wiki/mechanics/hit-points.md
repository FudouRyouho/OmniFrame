# Hit Points

> Estado: activo
> Rol: modelo unificado de las tres capas de HP y el cálculo de EHP total
> Fuente de verdad de: qué es cada barra y qué mitigación tiene, orden de aplicación del daño, las cuatro fórmulas de Effective Hit Points
> No usar para: escalado de HP de enemigos (→ `enemy-level-scaling.md`) · el detalle de cada capa (→ `health.md` · `shield.md` · `overguard.md`) · bleedout y revivir
> Última actualización: 2026-08-20 (desambiguado el 325% de Magnetic — es el bono, no el
> multiplicador; barrido de #44)
> Fuente: https://wiki.warframe.com/w/Hit_Points
> Fuente actualizada: 2026-05-22
> Raw: hit-points.wikitext · shield.wikitext · overguard.wikitext

**Hit Points** es un concepto meta: el daño máximo que un jugador o NPC puede recibir antes de
entrar en bleedout o morir.

## Las tres barras

| Barra | Mitigación propia | Al agotarse |
|---|---|---|
| **Health** | recibe DR del **armor** | el jugador entra en **bleedout** |
| **Shield** | **50% de DR plana**; ninguna del armor | invulnerabilidad temporal (Shield Gating) |
| **Overguard** | **ninguna** — pero da inmunidad a **Crowd Control** mientras sea > 0 | invulnerabilidad temporal |

## Orden de aplicación del daño

```text
Overguard  →  Shield  →  Health
              (Toxin lo bypasea)
```

Cada capa se agota antes de pasar a la siguiente.

**Si hay cualquier efecto de invulnerabilidad activo cuando llegan los hits, no se aplica daño a
ninguna de las tres.**

## Cálculo de Effective Hit Points

En su forma más simple, el EHP total es la suma de las tres barras después de aplicar upgrades,
damage reduction, modificadores de tipo de daño y demás efectos.

```text
Total EHP (contra un tipo de daño) = Effective Health + Effective Shield + Effective Overguard
```

```text
                        Net Armor + 300         1                    1
Effective Health = NH × ───────────────  ×  ──────────  ×  ──────────────────────
                              300            1 − Net DR      1 + Damage Type Mod
```

```text
Effective Shield = (Net Shield + Net Overshield) × 0.5 × ──────────────────────
                                                          1 + Damage Type Mod
```

> ⚠️ Conflicto ↔ [`health.md`](health.md) §Effective Health

```text
Effective Overguard = Net Overguard × ──────────────────────
                                       1 + Damage Type Mod
```

Notas de lectura:

- El `(Armor + 300)/300` es la forma del **jugador**. Para enemigos la DR de armor es otra —
  ver [`armor.md`](armor.md) §Reducción de daño.
- El `1/(1 + Damage Type Mod)` aparece en las tres: es el único término que hace que el EHP dependa
  del **tipo de daño** con el que se lo mida.
- El armor sólo entra en la capa de Health. Shield y Overguard no reciben nada de él.

> ℹ️ Ilustración propia. Oberon R30 con 740 de health y 900 de armor, sin DR extra ni modificador de
> tipo: `740 × (900 + 300)/300 = 740 × 4.0 = 2960`.

## Interacciones entre capas

Datos de las páginas de cada capa, no de `Hit Points`.

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasea shields → daña la salud directamente. No afecta Overguard |
| **Magnetic** | Amplifica el daño contra Overguard, hasta **+325%** (×4.25 total) tras 10 stacks |
| **Shield Gate** | Invulnerabilidad al romper shields: **0.33 s** como mínimo, hasta **2.5 s** con 1.150 de shields — escala con el shield máximo |
| **Overguard gate** | **0.5 s** de invulnerabilidad al agotarse |
| **Overshield** | Cap de **1.200** para warframes y **600** para companions, independiente del shield máximo |

## Fuentes

- https://wiki.warframe.com/w/Hit_Points
- https://wiki.warframe.com/w/Shield · https://wiki.warframe.com/w/Overguard (interacciones)
- [`health.md`](health.md) · [`shield.md`](shield.md) · [`overguard.md`](overguard.md) · [`armor.md`](armor.md) · [`damage-reduction.md`](damage-reduction.md)
