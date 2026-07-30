# Recompense — Kullervo (habilidad 2)

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Recompense
> Fuente actualizada: 2025-11-16
> Raw: recompense.wikitext

## Clasificación: evento de combate — C2, NO C1 (confirmado, no era solo un stub sin capturar)

Cada dagger que golpea a un enemigo cura a Kullervo; si ya está en Health máxima, el mismo golpe da
Overguard **en su lugar** — "Health and Overguard points are gained the moment each dagger strikes an
enemy." Es un acumulador **por evento de hit**, condicionado al estado de Health en el momento del
golpe. No hay forma de computar "cuánto Overguard da Recompense" sin simular la secuencia de golpes —
depende de cuántos enemigos hay, si Kullervo ya estaba a full Health, y el orden de los eventos.

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Slash damage / dagger | 200 | 300 | 400 | **500** |
| Heal / Overguard por dagger | 250 | 275 | 300 | **350** |
| Drenaje al fallar (Overguard u HP) | 20 | 25 | 30 | **35** |

- Cap: **10.000 Overguard** (fijo, no escala con rank/strength — a diferencia de Icy Avalanche/Light
  Verse/Final Verse, cuyo cap SÍ escala).
- 10 daggers, máx 3 por enemigo, 5s de vida en órbita — el "cuánto Overguard" depende de cuántos
  golpes conectan en esos 5s, información de C2/timeline, no de build.
- El Overguard ganado **no se puede dispellear** (a diferencia del Overguard "normal" de Iron Skin,
  que sí es removible por null — otra asimetría entre fuentes de Overguard, anotada para no asumir
  que todas se comportan igual).

## Fuentes

- https://wiki.warframe.com/w/Recompense
- [`../Wrathful-Advance/Wrathful-Advance.md`](../Wrathful-Advance/Wrathful-Advance.md)
