# Grendel — Pasiva

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Grendel/Abilities/Passive
> Fuente actualizada: 2025-11-03
> Raw: passive.wikitext

## Descartada — no es cross-stat, es evento/count de combate (C2)

*"Each enemy still alive in Grendel's belly passively grants him 250 Armor, to a maximum of 1.250
bonus armor at the 5 enemy cap."*

- **Input:** cuántos enemigos hay tragados en el momento — estado de combate en vivo, no un capacity-
  stat resuelto. **Output:** Armor (capacity-stat existente, no uno nuevo).
- Es la dirección **opuesta** a lo que se estaba buscando (leer un capacity-stat como input) — acá el
  capacity-stat es el output, y el input es un conteo dinámico.
- El bucket de salida (`+250 flat, DESPUÉS de mods multiplicativos como Steel Fiber`) **no es nuevo** —
  mismo patrón que un shard de armadura (flat post-escala, ya resuelto en `ItemRepository`/Rhino).
- Confirma la sospecha del usuario: pasiva, pero no la forma buscada.

## Fuentes

- https://wiki.warframe.com/w/Grendel/Abilities/Passive
