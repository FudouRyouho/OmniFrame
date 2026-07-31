# Bloodletting — Garuda (habilidad 3)

> Estado: activo
> Rol: la mecánica de Bloodletting — cuánta energía devuelve, qué la limita y qué no la dispara
> Fuente de verdad de: la fórmula de ganancia con su clamp por vida disponible · que la eficiencia entra **dividiendo** · la exclusión de los mods de daño→energía
> No usar para: el modelado hacia el motor
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Bloodletting
> Fuente actualizada: 2024-05-19
> Raw: bloodletting.wikitext

## Cómo funciona

```
Total Energy Gain = Base Energy Gain ÷ (2 − Ability Efficiency)
Base Energy Gain  = (18/22/30/40% por rank) × Max Energy × min(1, health_disponible / (50% × Max Health))
```

- Sacrifica hasta 50% del **Max Health** (con mods) para restaurar hasta 18-40% del **Max Energy** (con
  mods/Helminth/shards). **Ninguno de los dos inputs es Ability Strength.**
- Si Garuda tiene menos del 50% de vida disponible, la ganancia de energía se reduce proporcional
  (ejemplo verbatim: 25% HP restante → mitad de energía) — el input real es `min(50%, hp_actual/hp_max)`,
  no un flat.
- La fórmula de eficiencia (`÷ (2 − eficiencia)`) es la **misma forma exacta** que la del costo de
  energía (`(2 − eficiencia) × base`), **invertida**: división en vez de multiplicación, ganancia en
  vez de costo.
- No dispara mods de "daño→energía" (Rage/Hunter Adrenaline) — exclusión explícita, anotar si se
  modela para no duplicar la conversión.

## Fuentes

- https://wiki.warframe.com/w/Bloodletting
- [`../trinity/passive.md`](../trinity/passive.md) — la pasiva de Trinity, que también lee un stat propio
