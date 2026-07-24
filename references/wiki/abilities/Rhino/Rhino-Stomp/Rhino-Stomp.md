# Rhino Stomp — Rhino (habilidad 4)

> **Fuente:** `https://wiki.warframe.com/w/Rhino_Stomp?action=raw` — capturado 2026-07-24 vía
> `?action=raw` (raw íntegro en `Rhino-Stomp.wikitext`, mismo directorio). Estos son **hechos del
> juego**, no decisiones de OmniFrame.

## Qué es

Rhino aturde y ragdollea enemigos en dos ondas de daño Blast (una corta que no atraviesa obstáculos
y decae con distancia, otra larga que sí atraviesa obstáculos y no decae), y los deja en stasis con
un slow fuerte.

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Blast damage | 150 | 300 | 500 | **800** |
| Radius (onda larga) | 15m | 18m | 22m | **25m** |
| Duration (stasis) | 3s | 4s | 5s | **8s** |
| Slow | 80% | 90% | 95% | **97.5%** |

- **Energía:** 100 (`× Efficiency`). El radio de la onda **corta** (inicial) está sin documentar
  para rank 0-2 en la wiki (`?/?/?/5m`) — solo rank 3 = 5m es dato firme.
- **`Slow` no lleva token `$` en la wiki** (no escala con Ability Strength) — consistente con
  `Rhino.md` (línea `Speed Decrease: 97,5%` sin modificador). El engine ya lo modela bien como valor
  fijo por rank, no escalable.

## No afecta objetivos con Overguard

*"Does not affect enemies with Overguard."* — el stasis/slow de Stomp es inefectivo mientras el
target tenga Overguard activo (Eximus, o el propio Iron Skin de otro Rhino aliado). Relevante para
cualquier modelo futuro de C2 que compute Stomp contra un target con Overguard: el efecto debe
gatearse a `overguard == 0`, no aplicar incondicional.

## Sinergia con Rhino Charge (no modelada)

Rhino Charge hace +100% daño contra enemigos afectados por Stomp — mismo par de cross-ability que ya
se anota en `../Rhino-Charge/Rhino-Charge.md`.

## Fuentes

- https://wiki.warframe.com/w/Rhino_Stomp
- [`overguard.md`](../../../mechanics/overguard.md)
