# Bloodletting — Garuda (habilidad 3)

> **Fuente:** `https://wiki.warframe.com/w/Bloodletting?action=raw` — capturado 2026-07-24. Hechos
> del juego, no decisiones de OmniFrame.
> Raw: bloodletting.wikitext

## Cuarta forma: cross-stat de DOS capacity-stats (Health Y Energy), sin bracket de armor

```
Total Energy Gain = Base Energy Gain ÷ (2 − Ability Efficiency)
Base Energy Gain  = (18/22/30/40% por rank) × Max Energy × min(1, health_disponible / (50% × Max Health))
```

- Sacrifica hasta 50% del **Max Health** (con mods) para restaurar hasta 18-40% del **Max Energy** (con
  mods/Helminth/shards) — **lee dos capacity-stats distintos**, ninguno es Strength.
- Si Garuda tiene menos del 50% de vida disponible, la ganancia de energía se reduce proporcional
  (ejemplo verbatim: 25% HP restante → mitad de energía) — el input real es `min(50%, hp_actual/hp_max)`,
  no un flat.
- La fórmula de eficiencia (`÷ (2 − eficiencia)`) es la **misma forma exacta** que `OQ-W-5`
  (`ENERGY_COST = (2−eficiencia)×base`) — mismo patrón, invertido (división en vez de multiplicación,
  ganancia en vez de costo). Reutilizable si `OQ-W-5` alguna vez se implementa.
- No dispara mods de "daño→energía" (Rage/Hunter Adrenaline) — exclusión explícita, anotar si se
  modela para no duplicar la conversión.

## Relevancia para el debate §4

Ni bracket de armor ni Overguard/Overshield — pero es el **segundo caso confirmado de leer 2
capacity-stats distintos del propio warframe** (Health Y Energy), después de Trinity (que solo lee
Energy). Suma evidencia de que "leer capacity-stats propios" es un patrón real y no aislado a
Overguard — más argumento para no diseñar el mecanismo solo alrededor de Iron Skin/Overguard.

## Fuentes

- https://wiki.warframe.com/w/Bloodletting
- [`../../Trinity/Passive/Passive.md`](../../Trinity/Passive/Passive.md) — otro caso de 1 capacity-stat leído
