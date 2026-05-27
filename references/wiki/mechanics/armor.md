# Armor

> Estado: activo
> Rol: fórmula de armor y fuentes de valor plano para el engine v1
> Fuente de verdad de: cálculo de Total Armor y clasificación de fuentes ADD vs ADD_FLAT
> No usar para: tablas completas de armor por warframe o cálculo de Effective Health detallado
> Última actualización: 2026-05-26

## Fórmula base

```text
Total Armor = Base Armor × (1 + Mod Multiplier) + Flat Bonus
```

Fuente: https://wiki.warframe.com/w/Armor

- `Base Armor` — valor base del warframe (no cambia con el rank, excepto Nidus, Lavos y Kullervo)
- `Mod Multiplier` — suma de todos los mods porcentuales (Steel Fiber, Gladiator Aegis, etc.)
- `Flat Bonus` — valor plano añadido **después** del pool de mods — no se amplifica

## Fórmula de reducción de daño (DR)

```text
DR = Armor / (Armor + 300)
```

Coeficiente de escala para Tenno: **300**. Enemigos Grineer usan 300 a nivel base; otros factores (habilidades de reducción de daño independiente) se apilan multiplicativamente encima.

```text
EHP = Health × (Armor + 300) / 300
```

Esta fórmula ignora fuentes de DR adicionales (habilidades, Adaptation, etc.) — ver `damage-reduction.md`.

## Fuentes de Flat Bonus (ADD_FLAT)

Verificado en juego (2026-05-26): el flat bonus se suma post-escala.

Ejemplo con Oberon (base 450):
```text
450 × (1 + 100% Umbral Fiber) = 900
900 + 225 (Tauforged Azure Shard) = 1125
```

Si fuera pre-escala (BASE_FLAT): `(450 + 225) × 2 = 1350` — resultado incorrecto.

### Pasivas y mods planos

| Fuente | Valor | Token D-6 |
|---|---|---|
| Azure Archon Shard | +150 / +225 (Tauforged) | `AVATAR_FLAT_ARMOUR` |
| Stone Skin (Focus — Unairu) | +50 / +100 / +150 / +200 | `AVATAR_FLAT_ARMOUR` |
| Arcanos de armor | variable | `AVATAR_FLAT_ARMOUR` |

> "Armor bonus from Stone Skin is added at the end, making it not increase in value with neither armor Mod multiplier nor Warframe abilities armor multiplier." — wiki.warframe.com/w/Armor

### Habilidades con bonus plano de armor

Estas fuentes son **temporales** (duran mientras la habilidad está activa) y se suman en el mismo bucket ADD_FLAT. El engine las gestiona como trigger — fuera del scope de mods estáticos.

| Fuente | Warframe | Notas |
|---|---|---|
| Rubble (pasiva de Atlas) | Atlas | Apila hasta +1500, se pierde si no se alimenta |
| Feast (pasiva de Grendel) | Grendel | Armor por enemigo engullido |
| Parasitic Armor (augment de Nidus) | Nidus | Convierte Stacks en armor temporalmente |
| Plunder (habilidad de Yareli) | Yareli | Roba armor de enemigos — plano |

## Fuentes de Mod Multiplier (ADD)

| Fuente | Ejemplo | Token D-6 |
|---|---|---|
| Mods % de armor | Steel Fiber (+110%), Umbral Fiber (+110%) | `AVATAR_ADD_ARMOUR` |
| Habilidades % de armor | Warcry (Valkyr), Roar multiplicativo | `AVATAR_ADD_ARMOUR` |

## Nota: BASE_FLAT no existe para armor

No hay ninguna mecánica conocida que añada armor plano pre-escala (amplificado por mods). El token `AVATAR_BASE_ARMOUR` fue eliminado del vocabulario activo (2026-05-26) por modelado incorrecto.

## Interacciones relevantes

| Mecánica | Comportamiento |
|---|---|
| **Corrosive** | Strips armor en stacks — hasta 80% reducción; `GameLaws.corrosive_max_stacks` |
| **Viral** | No afecta armor — afecta salud directamente |
| **Magnetic** | No afecta armor — reduce shields |
| **Adaptation** | DR adicional hasta 90% — aplica **multiplicativamente** sobre DR de armor |
| **Warcry** | Habilidad de Valkyr — +% armor temporal → `AVATAR_ADD_ARMOUR` |

## Fuentes

- https://wiki.warframe.com/w/Armor
- https://wiki.warframe.com/w/Damage_Reduction
- `references/wiki/mechanics/damage-reduction.md`
- `references/wiki/systems/archon-shards/archon-shards-table.md`
