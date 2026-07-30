# Trinity — Pasiva

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Trinity/Abilities/Passive
> Fuente actualizada: 2025-11-02
> Raw: passive.wikitext

## El caso cross-stat MÁS SIMPLE encontrado — sin strength, sin bracket, sin cap

*"Trinity and allies in her Affinity Range gain 'Lifegiver', which increases their Health equal to
50% (25% en Conclave) of Trinity's total Energy pool."*

```
ally_health_bonus = 0.5 × trinity_energy_max
```

- **Un solo input** (`AVATAR_ADD_ENERGY_MAX`, ya moddeado por Flow/Primed Flow/Archon Shard) → un solo
  output (bonus flat de Health en OTRAS entidades — aliados en rango).
- **No escala con Ability Strength** — es pasiva, valor fijo (50%/25% Conclave), a diferencia de Iron
  Skin/Snow Globe que sí escalan por rank+strength. Sin bracket compuesto, sin absorbed-damage, sin cap.
- Es **cross-stat Y cross-entity** a la vez: lee Energy de Trinity, escribe Health en aliados (mismo
  patrón cross-entity que Roar — `source_entity`/`source_attribute` — pero la fuente es un
  capacity-stat, no Ability Strength).

## Por qué importa para el debate del mecanismo

Si el motor necesita un primer caso de prueba para "leer un capacity-stat ya resuelto y escribir en
otro", este es más simple que Iron Skin: sin bracket, sin absorbed damage, sin cap, un solo término.
Buen candidato para prototipar el mecanismo ANTES de acometer Iron Skin/Snow Globe (que suman una
capa de complejidad encima del mismo problema base).

## Fuentes

- https://wiki.warframe.com/w/Trinity/Abilities/Passive
