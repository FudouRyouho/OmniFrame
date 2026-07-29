# Final Verse — Dante (habilidad 4, modo Triumph)

> **Fuente:** `https://wiki.warframe.com/w/Final_Verse?action=raw` — capturado 2026-07-24 vía
> `?action=raw` (raw íntegro en `final-verse.wikitext`, mismo directorio). Hechos del juego, no
> decisiones de OmniFrame. Esta nota cubre **solo el modo Triumph** (el único con Overguard); Tragedy/
> Wordwarden/Pageflight son mecánicas de daño/copia sin relación a Overguard, fuera de alcance acá.
> Raw: final-verse.wikitext

## Triumph tiene DOS componentes, de naturaleza distinta

1. **Grant estático** (mismo molde que Light Verse/Icy Avalanche/Iron Skin): `+2.250/2.500/2.750/3.000
   Overguard gain` + `7.500/10.000/12.500/15.000 Overguard cap`, ambos `× Strength`. **Modelable en C1.**
2. **Regen por evento de combate**: `+85/90/95/100 Overguard/s en kills y assists`, con un timer de 2s
   (probablemente un cooldown/ventana entre regens, no un tick continuo). **Evento de combate — C2,
   no C1.** No confundir los dos: el primero es "cuánto da el cast", el segundo es "cuánto regenera
   mientras la duración del buff sigue activa y matás cosas" — depende de la simulación, no del build.

## Valores por rank (Triumph)

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Overguard gain | 2.250 | 2.500 | 2.750 | **3.000** |
| Overguard cap | 7.500 | 10.000 | 12.500 | **15.000** |
| Regen on kill/assist (por segundo) | 85 | 90 | 95 | **100** |
| Duration | 30s | 35s | 40s | **45s** |
| Range | 15m | 20m | 25m | **30m** |

- Requiere 2 "Light pages" (2 Light Verse consecutivos) para poder castear — mecánica de combo entre
  abilities del mismo warframe, no modelada (igual que Rhino Charge combo window, otra familia).
- Comparte pool de Overguard con Light Verse (ver nota en `Light-Verse.md`) — mismo Overguard total,
  cada fuente con su propio cap.

## Fuentes

- https://wiki.warframe.com/w/Final_Verse
- [`../Light-Verse/Light-Verse.md`](../Light-Verse/Light-Verse.md)
