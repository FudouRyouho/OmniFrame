# Mods Upgrade Taxonomy

> Estado: activo
> Rol: resumir la taxonomia operativa de `upgradeTypes[]` para el builder
> Fuente de verdad de: clasificacion funcional de upgrade types
> No usar para: tabla exhaustiva de todos los casos edge del juego
> Depende de: PA-2/3/4 (schema de mods cerrado 2026-03-27)
> Última actualización: 2026-03-27

## Grupos principales

| Grupo | Ejemplos |
|---|---|
| dano base | `WEAPON_DAMAGE_AMOUNT`, `WEAPON_MELEE_DAMAGE` |
| dano agregado o conversion | `WEAPON_PERCENT_BASE_DAMAGE_ADDED`, `WEAPON_DAMAGE_TYPE_BIAS` |
| criticos | `WEAPON_CRIT_CHANCE`, `WEAPON_CRIT_DAMAGE` |
| estado | `WEAPON_PROC_CHANCE`, `WEAPON_PROC_TIME` |
| cadencia y multishot | `WEAPON_FIRE_RATE`, `WEAPON_FIRE_ITERATIONS` |
| cargador y recarga | `WEAPON_CLIP_MAX`, `WEAPON_RELOAD_SPEED` |
| proyectil, radio y fisica | `WEAPON_PROJECTILE_SPEED`, `WEAPON_EXPLOSION_RADIUS`, `WEAPON_PUNCTURE_DEPTH` |
| melee especial | `WEAPON_MELEE_COMBO_DURATION_BONUS`, `WEAPON_RANGE` |
| warframe | `AVATAR_ABILITY_STRENGTH`, `AVATAR_HEALTH_MAX`, `AVATAR_ARMOUR` |

## Regla de uso

`upgradeTypes[]` define que modifica el mod. El valor numerico y los casos especiales
se resuelven con fuente adicional u override controlado.

## Donde aparecen los gaps

**Nota sobre evolución:** La taxonomía de `upgradeType` es parcialmente conocida y crece bajo la misma semántica del juego. Cada nuevo dominio (warframes, abilities, archon shards) puede introducir nuevos `upgradeType`. La lista no es cerrada.

**Gaps documentados:**

- tipo de dano elemental
- condiciones de activacion
- progresion por rango no lineal
- mods `UNIQUE` sin `upgradeTypes[]`

**Referencia:** Decisiones y resoluciones en:

- [Docs/decisions/stage-0-architecture-decisions.md](../../../decisions/stage-0-architecture-decisions.md) — mapa canonico de decisiones stage 0


