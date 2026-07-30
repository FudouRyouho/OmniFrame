# Sniper Rifle — Shot Combo Counter y Zoom Buffs

> Estado: activo
> Rol: las dos mecánicas propias de los sniper rifles — el Shot Combo Counter (logarítmico base 3, con `Minimum Combo` por arma) y los buffs por nivel de zoom
> Fuente de verdad de: fórmula del multiplier y su inversa, qué cuenta como hit, decay 1-a-1 y duración 2 s (Lanka 6 s), gate de scope, la tabla de `Minimum Combo` **y** de zoom buffs por arma, que los zoom buffs **stackean aditivamente** con los mods
> No usar para: catálogo de sniper mods (transclusión aparte) · falloff de snipers (→ [`damage-falloff.md`](damage-falloff.md))
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Sniper_Rifle
> Fuente actualizada: 2026-06-06
> Raw: sniper-combo.wikitext

## Shot Combo Counter

Da un bonus **al daño total** por encadenar impactos. Cada sniper exige un **`Minimum Combo`** de
disparos antes de que el contador se active, arrancando en **1.5x**. Después, **cada +0.5x pide el
triple de hits** que el escalón anterior.

```text
Damage Multiplier = 1.5 + 0.5·⌊log₃(Combo Count / Minimum Combo)⌋
Combo Required    = Minimum Combo × 3^[2·(Damage Multiplier) − 3]      (inversa)
```

> La wiki etiqueta la primera como *"approximate formula"* y la segunda como exacta.

Con `Minimum Combo = 4` — el ejemplo de la propia wiki:

| Hits | 4 | 12 | 36 | 108 | 324 |
|---|---|---|---|---|---|
| Multiplier | 1.5x | 2.0x | 2.5x | 3.0x | 3.5x |

**Sin cap explícito**: el tope es **4 294 967 295**, el máximo de un entero sin signo de 32 bits.

Mientras hay combo activo, el contador y el multiplicador se muestran bajo el retículo **con la mira
puesta**.

### Qué cuenta como hit

- Impactos directos, **punch through** y **ricochet**.
- **Cada bala de multishot cuenta por separado**: dos balas del mismo disparo en el mismo objetivo son
  **dos** hits (y dos fallos, si fallan).
- **NO** cuentan: **área de efecto** ni **daño por tiempo**.

### Decay y duración

- Duración **2 s** en todos los snipers, **salvo la Lanka: 6 s**. Sólo **Harkonar Scope** la extiende.
- Al vencer la duración se resta **1** — no se vacía. **Fallar también resta 1**, no resetea.
- **Gate:** construir el combo y beneficiarse del multiplicador exige estar **con la mira puesta**. La
  única excepción es **Collective Curse**, que trata el daño enlazado como disparos de sniper scoped.

## Zoom Buffs

Cada nivel de zoom trae un bonus a un stat, **según el modelo de arma**: critical chance, critical
multiplier o daño a weak point. A mayor magnificación, mayor bonus — y menor campo de visión.

> **Son intrínsecos al arma y no se pueden modificar**, pero **stackean aditivamente** con bonus
> similares de mods. *(La Lanka y la Komorex son la excepción a esta regla.)*

| Arma | Zoom → buff | `Minimum Combo` |
|---|---|---|
| **Komorex** | 2.0x → −50% recoil, +2 m punch through · 3.5x → **+100% daño**, +3 m de radio de explosión, **−75% cadencia** | **5** |
| **Lanka** | 3x → +20% CC · 5x → +30% CC · 8x → +50% CC | **2** |
| **Perigale** / Perigale Prime | 2x → +20% CM · 4x → +40% CM | **1** |
| **Rubico** | 3.5x → +35% CM · 6x → +50% CM | **1** |
| **Rubico Prime** | 2.5x → +35% CM · 5.0x → +50% CM | **1** |
| **Snipetron** / Vandal | 2.5x → +30% headshot · 6x → +50% headshot | **3** |
| **Sporothrix** / Coda Sporothrix | 2.7x → +50% headshot | **1** |
| **Vadarya Prime** | 2.5x → N/A · 8x → +50% CM | **3** |
| **Vectis** | 3x → +30% headshot · 4.5x → +50% headshot | **1** |
| **Vectis Prime** | 3.5x → +40% headshot · 6x → +60% headshot | **5** |
| **Vulkar** / Wraith | 2.5x → +35% headshot · 4x → +55% headshot · 8x → +70% headshot | **2** |

El nivel de zoom se cicla con el alt-fire; en pantalla aparece la magnificación actual a la derecha y
un telémetro a la izquierda.

Los bonus de **headshot damage** entran en la composición aditiva de la parte del cuerpo
(→ [`enemy-body-parts.md`](enemy-body-parts.md)).

## Lo que fijó la versión 22

- **Sway del retículo eliminado** en todos los niveles de zoom.
- **+1 m de punch through** a todos los snipers que no tenían (los que ya traían, sin cambios).
- El decay pasó de vaciar el contador a **restar 1 por vez**, tanto al vencer como al fallar.
- Las balas extra del multishot **cuentan cada una** como hit y como fallo.
- Duración de combo a **2 s**, y la Lanka a **6 s**.
- Falloff **400 → 600 m**, mínimo **50%** (→ [`damage-falloff.md`](damage-falloff.md)).
- Alcance de trazado de todas las armas a **300 m**, **salvo los snipers, que quedan en 1000 m**.

## Fuentes

- https://wiki.warframe.com/w/Sniper_Rifle
- [`melee-combo.md`](melee-combo.md) · [`damage-falloff.md`](damage-falloff.md) · [`enemy-body-parts.md`](enemy-body-parts.md) · [`critical-hits.md`](critical-hits.md)
