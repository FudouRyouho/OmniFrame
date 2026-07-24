# Snow Globe — Frost (habilidad 3)

> **Fuente:** `https://wiki.warframe.com/w/Snow_Globe?action=raw` — capturado 2026-07-24 vía
> `?action=raw`. Hechos del juego, no decisiones de OmniFrame.

## Tercer caso confirmado de la MISMA fórmula que Iron Skin

```
Modified Health = { Base Health + Armor Multiplier × [Frost's Base Armor × (1 + Base Armor Bonus) + Additional Armor] } × (1 + Ability Strength) + Absorbed Damage
```

Compará con Iron Skin (`../../Rhino/Iron-Skin/Iron-Skin.md`):
```
Overguard = ([Base Overguard + (Armor Multiplier × Total Armor)] × Ability Strength) + Absorbed Damage
```

**Estructuralmente idéntica** — mismo bracket `(Base + Mult×TotalArmor) × Strength + Absorbed`. Solo
cambian los números y el recurso de salida (Health de un objeto desplegado, no Overguard del
warframe). Sube el gate D-20 de 2 a **3 casos con la misma forma exacta** (Iron Skin, Icy Avalanche
—parcial—, Snow Globe).

## La diferencia arquitectónica real — no es el warframe, es OTRA entidad

El Health de Snow Globe **no es un stat de Frost** — es el health de un **objeto desplegado** (el
globo), una entidad que hoy no existe en el modelo del engine (no es weapon, no es warframe). Iron
Skin escribe en la MISMA entidad que castea (Rhino); Snow Globe escribe en una entidad **nueva y
efímera** que Frost crea. Mismo cross-stat armor×strength, pero el "dónde aterriza" es un problema
distinto y más grande — anotado, no resuelto acá.

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Base Health | 1500 | 2500 | 3000 | **3500** |
| Armor Multiplier | — | — | — | **5x** (no varía por rank en la wiki, fijo) |
| Break damage | 50 | 100 | 125 | **150** |
| Invulnerability duration | 1s | 2s | 3s | **4s** |

- Cap: **1.000.000** health combinado (recasteable dentro del propio globo — mismo patrón de
  acumulación con cap que Light Verse, pero para Health, no Overguard, y de OTRA entidad).
- Sinergia: la pasiva de Frost da +50 armor por enemigo con Cold status en rango — un input más
  (evento de combate) que alimenta el mismo bracket de armor. Multiplica la complejidad, no la
  cambia de forma.

## Fuentes

- https://wiki.warframe.com/w/Snow_Globe
- [`../../Rhino/Iron-Skin/Iron-Skin.md`](../../Rhino/Iron-Skin/Iron-Skin.md) — misma fórmula, otro recurso/entidad
