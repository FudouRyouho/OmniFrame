# Pillage — Hildryn (habilidad 2)

> **Fuente:** `https://wiki.warframe.com/w/Pillage?action=raw` — capturado 2026-07-24 vía
> `?action=raw` (raw íntegro en `Pillage.wikitext`, mismo directorio). Hechos del juego, no
> decisiones de OmniFrame.

## Clasificación: dependiente de estado del enemigo — C2, NO C1

Pillage produce Overshields **"basado en la cantidad de shields y/o armor robada de todos los
enemigos pillados"** durante una aura que se expande por 2s. El resultado depende de: cuántos
enemigos hay en rango, cuánto shield/armor tenía cada uno, y si están en línea de vista. **No es una
fórmula de build** — es un cómputo que solo existe en el momento de la simulación de combate contra
un roster de enemigos concreto.

## Datos relevantes (para cuando exista simulación de encounter)

- Costo: 150 **shields propios** (no energía) — `costType: SHIELD`. Puede consumir Overshields si
  Hildryn los tiene, antes de tocar shields normales.
  Drena `10%/15%/20%/25%` (`× Strength`) del shield/armor actual de cada enemigo en rango.
- Full-strip de enemigo a partir de 400% Strength (328% con un Corrosive Projection aliado).
- **No roba Overguard de enemigos** — explícito en la wiki: *"Enemy Overguard will not be stolen,
  converted, or damaged in any way."* Confirma que Overguard y Shield/Armor-robado son ejes separados
  incluso en esta ability.
- El override actual (`ability-stats.override.json`) etiqueta el augment Blazing Pillage como
  `"Shield: <SHIELD> 50"` genérico — no distingue Shield de Overshield porque la wiki tampoco lo
  separa numéricamente (el retorno depende del enemigo, no hay "base Overshield" fijo que capturar).

## Fuentes

- https://wiki.warframe.com/w/Pillage
- [`../../../mechanics/shield.md`](../../../mechanics/shield.md)
