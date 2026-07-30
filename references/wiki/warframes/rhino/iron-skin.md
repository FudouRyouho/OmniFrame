# Iron Skin — Rhino (habilidad 2)

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Iron_Skin
> Fuente actualizada: 2026-07-10
> Raw: iron-skin.wikitext

## Qué es

Rhino recibe **Overguard** (no Health, no Shield — ver `references/wiki/mechanics/overguard.md` para
la mecánica genérica) y queda invulnerable durante el cast. Todo el daño recibido durante esa ventana
de invulnerabilidad se **absorbe y se suma** al Overguard inicial.

## La fórmula (verbatim de la wiki)

```
Overguard = ([Base Overguard + (Armor Multiplier × Total Armor)] × Ability Strength) + Absorbed Damage
Total Armor = (Base Armor × [1 + Armor Mods]) + Additive Armor
```

- **Cross-stat real:** el bracket `[Base Overguard + Armor Multiplier × Total Armor]` combina DOS
  fuentes (un valor fijo por rank + la armadura total del propio warframe, YA modificada por sus
  propios mods de armadura) — y el resultado completo se escala por Ability Strength.
- **Armadura por variante:** Rhino base = 240 armor; Rhino Prime = 290 armor — mismo Iron Skin,
  Overguard inicial distinto solo por este dato base.

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Base Overguard | 400 | 600 | 800 | **1200** |
| Armor Multiplier | `?` (no documentado en la wiki) | 1.25x | 1.75x | **2.5x** |
| Invulnerability Duration | 1.5s | 2s | 3s | **3s** |

- **Energía:** 50 (`× Efficiency`).
- El engine modela solo **rank máximo** (convención ya vigente para toda ability-stats — ver
  `docs/domains/engine/status.md`), por eso `Armor Multiplier` rank 0 (`?`) no bloquea nada.

## Ejemplo verificado (verbatim)

Rhino, Steel Fiber + Intensify maxeados, Rank 3:
```
(1200 + (2.5 × 240 × 2)) × 1.3
```
El `× 2` es `1 + Armor Mods` (Steel Fiber +100% armor → `1 + 1.0`). El `× 1.3` es Ability Strength
(Intensify +30%). Rhino Prime usa 290 en vez de 240 en el mismo lugar.

## Propiedades relevantes (no modeladas, anotadas para no asumir)

- **Overguard "de ability", no "real":** removible por efectos de null (Nullifier, Comba/Scrambus,
  Stalker dispel) — a diferencia de overguard de arcano/mod, que no se disipa así.
- **Sinergia con Rhino Charge:** con Iron Skin activo, el daño de Charge tiene 100% status chance de
  Blast — cruce entre dos abilities del mismo warframe, no modelado.
- **Ironclad Charge (augment de Charge)** aplica su bonus de armadura a Iron Skin si el cast de Iron
  Skin empieza dentro de la ventana del buff — orden temporal entre dos abilities, fuera de alcance
  de un modelo estático C1.
- Fuentes externas de Overguard "extra" durante la ventana de invulnerabilidad (Death Orb beam, Jade
  Eximus light) — eventos de nivel, no de build.

## Fuentes

- https://wiki.warframe.com/w/Iron_Skin
- [`shield.md`](../../mechanics/shield.md) · [`overguard.md`](../../mechanics/overguard.md)
