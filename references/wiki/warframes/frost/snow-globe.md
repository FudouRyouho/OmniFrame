# Snow Globe — Frost (habilidad 3)

> Estado: activo
> Rol: la mecánica de Snow Globe — su fórmula de Health, los valores por rank y que el Health es de una entidad desplegada
> Fuente de verdad de: que la fórmula es **idéntica** a la de Iron Skin · el cap de 1.000.000 recasteable · la sinergia con la pasiva de Frost
> No usar para: el modelado hacia el motor
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Snow_Globe
> Fuente actualizada: 2025-12-09
> Raw: snow-globe.wikitext

## La misma fórmula que Iron Skin

```
Modified Health = { Base Health + Armor Multiplier × [Frost's Base Armor × (1 + Base Armor Bonus) + Additional Armor] } × (1 + Ability Strength) + Absorbed Damage
```

Compará con Iron Skin (`../rhino/iron-skin.md`):
```
Overguard = ([Base Overguard + (Armor Multiplier × Total Armor)] × Ability Strength) + Absorbed Damage
```

**Estructuralmente idéntica** — mismo bracket `(Base + Mult×TotalArmor) × Strength + Absorbed`. Solo
cambian los números y el recurso de salida (Health de un objeto desplegado, no Overguard del
warframe). La misma forma exacta aparece también en Icy Avalanche (parcial).

## El Health no es de Frost — es del globo

Aunque la fórmula sea idéntica a la de Iron Skin, **el recurso de salida no vive en la misma
entidad**. Iron Skin da Overguard a Rhino, que es quien castea. **Snow Globe crea un objeto
desplegado** —el globo— y el Health es de ese objeto, no de Frost. Es una entidad efímera y separada
del warframe.

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Base Health | 1500 | 2500 | 3000 | **3500** |
| Armor Multiplier | — | — | — | **5x** (no varía por rank en la wiki, fijo) |
| Break damage | 50 | 100 | 125 | **150** |
| Invulnerability duration | 1s | 2s | 3s | **4s** |

- Cap: **1.000.000** de health combinado, recasteable dentro del propio globo — mismo patrón de
  acumulación con tope que Light Verse, pero sobre Health y sobre el objeto, no sobre el warframe.
- Sinergia: la pasiva de Frost da **+50 armor por enemigo con Cold status en rango** — y como la
  fórmula lee el armor total, ese bonus entra al mismo bracket.

## Fuentes

- https://wiki.warframe.com/w/Snow_Globe
- [`../../Rhino/Iron-Skin/Iron-Skin.md`](../rhino/iron-skin.md) — misma fórmula, otro recurso/entidad
