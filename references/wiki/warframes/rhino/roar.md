# Roar — Rhino (habilidad 3)

> **Fuente:** `https://wiki.warframe.com/w/Roar#Info` — capturado 2026-07-16 vía `?action=raw`
> (raw íntegro en `roar.wikitext`, mismo directorio). El `action=raw` no trae la fecha de última
> edición de la wiki; cotejar contra la página si se sospecha staleness (ver
> `references/CLAUDE.md`). Estos son **hechos del juego**, no decisiones de OmniFrame (el modelado
> vive en `.working/rhino-roar-prototype.md`).
> Raw: roar.wikitext

## Identidad del buff (el bucket)

> "The damage buff is considered **Faction Damage Bonus**, **additive with other sources of Faction
> Damage**, and **multiplicative with other types of bonus of damage**."

Roar cae en el bucket **Faction Damage Bonus** — el MISMO bucket que los mods Bane/Expel. Es
**aditivo** con otras fuentes de faction damage (Bane, Expel) y **multiplicativo** con todo lo demás
(Serration base, Intensify, etc.).

## Valores base

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Damage bonus (`× Strength`) | 10% | 15% | 25% | **50%** |
| Subsumido (Helminth) | 2% | 9% | 15% | 30% |

- **Duración:** 30 s (`× Duration`). **Rango:** 15 / 20 / 22 / 25 m (`× Range`). **Energía:** 75 (`× Efficiency`).
- Escala con **Ability Strength**: `bonus = 0.50 × strength_mult`. Ej. con Intensify (+30% str): `0.5 × (1 + 0.3) = 0.65`.

## La matemática exacta (verbatim de la wiki)

Arma de 100 daño/disparo, Roar max (50%):

| Caso | Fórmula |
|---|---|
| Solo Roar | `100 × (1 + 0.5)` |
| Serration + Roar | `100 × (1 + 1.65) × (1 + 0.5)` — Roar es su **propio bucket multiplicativo**, después de Serration |
| Serration + **Bane** + Roar (vs facción) | `100 × (1 + 1.65) × (1 + 0.5 + 0.3)` — **Roar y Bane SE SUMAN** en el mismo bucket |

**Double-dip en status** (verbatim: *"As faction bonus damage, the bonus is used **twice** in the calculation of status damage"*):

| Caso | Fórmula |
|---|---|
| Slash proc (Roar solo) | `0.35 × 100 × (1 + 0.5) × (1 + 0.5)` — el bucket de facción aparece **al cuadrado** |
| Serration + Bane + Intensify, slash vs Orokin | `0.35 × 100 × (1 + 1.65) × (1 + 0.5×(1+0.3) + 0.3) × (1 + 0.5×(1+0.3) + 0.3)` |

(`0.35` = multiplicador de daño del tick de slash.) El double-dip es **propiedad del bucket de facción**,
no de Roar — Bane también double-dipea en DoTs, "in the same way as faction-specific modifiers".

## Scope — a qué aplica (ALL, cross-entity)

> "applied to Rhino, allied **Warframes**, **Companions**, **Hostages**, **Shadows**, **Specters**, and hacked **MOAs**."
> "Increases the damage any ally deals from **any source, so weapon damage as well as ability damage**."
> "All Sources also include the **tick damage of status procs** (slash, heat, toxin, gas clouds)."

- Aplica a: el propio Rhino + aliados (warframes, compañeros/sentinelas, specters, shadows, MOAs hackeados).
- Afecta: **daño de arma + daño de habilidad + ticks de DoT**. Es un multiplicador final ALL-scope.
- **No gatea por facción propia** ("increased damage to any faction") — a diferencia de Bane, que sí
  requiere el faction tag del target. Roar aplica a todo target por igual.

## Reglas de aplicación

- Los aliados solo necesitan estar **en rango al momento del cast** para recibirlo; no necesitan
  quedarse en rango para mantenerlo la duración completa. El caster siempre lo recibe.
- Múltiples Roars **no stackean** — el más fuerte sobrescribe al más débil (salvo que uno más débil
  dure más allá del fuerte, entonces retoma cuando el fuerte expira).
- No se puede recastear mientras está activo (salvo con el augment Piercing Roar).
