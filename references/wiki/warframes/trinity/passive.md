# Trinity — Pasiva

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Trinity/Abilities/Passive
> Fuente actualizada: 2025-11-02
> Raw: passive.wikitext

## Cómo funciona

*"Trinity and allies in her Affinity Range gain 'Lifegiver', which increases their Health equal to
50% (25% en Conclave) of Trinity's total Energy pool."*

```
ally_health_bonus = 0.5 × trinity_energy_max
```

- **Un solo input** (`AVATAR_ADD_ENERGY_MAX`, ya moddeado por Flow/Primed Flow/Archon Shard) → un solo
  output (bonus flat de Health en OTRAS entidades — aliados en rango).
- **No escala con Ability Strength** — es pasiva, valor fijo (50%/25% Conclave), a diferencia de Iron
  Skin/Snow Globe que sí escalan por rank+strength. Sin bracket compuesto, sin absorbed-damage, sin cap.
- **Lee un stat de Trinity y escribe en otras entidades**: la Energy máxima de ella determina el
  bonus de Health de sus aliados.

## Fuentes

- https://wiki.warframe.com/w/Trinity/Abilities/Passive
