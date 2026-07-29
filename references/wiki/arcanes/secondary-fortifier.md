# Secondary Fortifier — Arcano secundario

> **Fuente:** `https://wiki.warframe.com/w/Secondary_Fortifier?action=raw` — capturado 2026-07-24 vía
> `?action=raw` (raw íntegro en `secondary-fortifier.wikitext`, mismo directorio). Hechos del juego,
> no decisiones de OmniFrame. Primera captura de arcano bajo `wiki/arcanes/` — no existía precedente
> de carpeta para arcanos (solo `wiki/abilities/<Warframe>/`); mismo patrón, categoría nueva.
> Raw: secondary-fortifier.wikitext

## Clasificación: robo dependiente de daño infligido — C2, NO C1

*"Steals 1 point of Overguard per 100 damage [dealt to an enemy], and deals increased damage to
Overguard."* El Overguard ganado depende de **cuánto daño le pegás a un enemigo con Overguard** —
no hay "cantidad base" que capturar como stat de build. Misma familia que `OverguardSteal` (arcano ya
anotado en `arcane-stats.override.json:3756-3774` con `engine:note` de una sesión previa) y
`Recompense` — el steal-por-daño es un patrón recurrente, siempre C2.

## Tabla de rank (esto SÍ es dato de build — el multiplicador de daño, no el steal)

| Rank | 0 | 1 | 2 | 3 | 4 | 5 (max) |
|---|---|---|---|---|---|---|
| Overguard Damage Buff | x3 | x4 | x5 | x6 | x7 | **x8** |

- El multiplicador de daño **contra Overguard** (no el steal) es un valor fijo por rank, sin
  `upgrade_by` de ningún stat del jugador — sería modelable si el engine alguna vez calcula daño
  específicamente contra la capa Overguard de un enemigo (target de C2, ver
  `references/wiki/mechanics/overguard.md`).
- Cap propio: **15.000** (igual valor que el cap máximo de Icy Avalanche/Light Verse/Final Verse —
  probablemente el cap "estándar" de Overguard-de-jugador en el juego, no coincidencia).
- El steal-effect no es heredable por Heat Inherit; el multiplicador de daño sí, con matices (ver
  wikitext para el detalle completo, no relevante para C1).

## Fuentes

- https://wiki.warframe.com/w/Secondary_Fortifier
- [`../../mechanics/overguard.md`](../../mechanics/overguard.md)
