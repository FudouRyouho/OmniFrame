# Semantic Reference Format — game-ui/

Fuente de datos de habilidades por warframe. Cada `.md` captura exactamente lo que muestra el juego en la UI más anotaciones semánticas para el pipeline.

**Rol en el pipeline:** estos archivos son la fuente primaria de `groups`/`stats`/`upgrade_by`/`upgrade_type` para `ability-stats.override.json`. El parser los consume; `generate-data.ts` los integra al merge con los datos DE (`name`, `description`, `image_name` vienen de `@wfcd/items`, no de aquí).

---

## Jerarquía de headers

```
# NOMBRE — /Lotus/Powersuits/...     warframe, ignorado por el parser
## /Lotus/Powersuits/PowersuitAbilities/NombreAbility   → clave del output (uniqueName)
// comentario humano, ignorado por el parser
Label: valor $UPGRADE_BY $$UPGRADE_TYPE
### Subgrupo                         grupo exclusivo (forma, elemento, modo)
#### AUGMENT                         grupo no-exclusivo, UPPER CASE
##! /Lotus/...                       skip: habilidad ya procesada
```

---

## Anotaciones semánticas

Las anotaciones van inline al final de cada línea de stat, después del valor.

| Símbolo | Campo | Ejemplo |
|---|---|---|
| `$TOKEN` | `upgrade_by` | `Damage: 750 $AVATAR_ABILITY_STRENGTH` |
| `$$TOKEN` | `upgrade_type` | `Reload Speed: 35% $$WEAPON_RELOAD_SPEED` |

**Reglas:**
- Si una línea no tiene `$` → valor fijo (`upgrade_by` ausente en el output, no `NONE`).
- `$$` solo cuando la habilidad modifica un atributo externo (arma, otro warframe, etc.).
- `$` y `$$` pueden coexistir en la misma línea: `Label: val $UPGRADE_BY $$UPGRADE_TYPE`.
- **Varios `$$` en una misma línea**: cuando el juego muestra en UN renglón un buff que
  mecánicamente son stats distintos. Se anotan todos; **no se parte el renglón** — el `.md` refleja
  la pantalla, y partirlo rompería eso. El parser emite un array.
- `//` al final de una línea o en línea propia → comentario, ignorado. Usar para incertidumbre.

```
Drain: <ENERGY> 50 $ENERGY_COST
Radius: 12m $AVATAR_ABILITY_RANGE
Duration: 23s $AVATAR_ABILITY_DURATION
Reload Speed: 35% $AVATAR_ABILITY_DURATION $$WEAPON_RELOAD_SPEED
Status Chance: 10%                          // sin $ → valor fijo, no escala
```

**Capturar la unidad como se ve, no como la consume el motor.** Si la pantalla dice `1,75x`, se
escribe `1,75x` — aunque el motor necesite `+75%`. La conversión la hace el consumidor leyendo el
sufijo del label (`|val1|x` vs `|val1|%`); normalizarla acá falsearía la única fuente. Ver
`docs/data/schemas/abilities/schema.md`.

```
Speed Multiplier: 1,75x $STRENGTH $$AVATAR_ADD_MOVEMENT_SPEED $$MELEE_ADD_ATTACK_SPEED
```

↑ Volt Speed: un renglón, dos stats. La wiki los declara separados (Movement Speed **no** afecta
melee attack speed) — `references/wiki/mechanics/movement-speed.md`.

**Vocabulario `upgrade_by` activo** (extensible — agregar con `//` si hay duda):
`AVATAR_ABILITY_STRENGTH` · `AVATAR_ABILITY_RANGE` · `AVATAR_ABILITY_DURATION` · `AVATAR_ABILITY_EFFICIENCY` · `ENERGY_COST` · `ENERGY_DRAIN`

---

## Formato de valores

| Caso | Formato | Ejemplo |
|---|---|---|
| Miles | `.` como separador | `1.500`, `8.000` |
| Decimales | `,` como separador | `1,5s`, `67,5%` |
| Rango min-max | `val1 - val2` con espacios | `40 - 85%` |
| Unidades | pegadas al número | `10m`, `12s`, `50%`, `1,25x` |

**Min-max:** una sola anotación `$` cubre ambos valores (comparten `upgrade_by`). El parser produce dos `AbilityStatValue`.
```
Damage Reduction: 40 - 85% $AVATAR_ABILITY_STRENGTH
```

---

## Etiquetas de tipo de daño e icono

Cuando el juego muestra un icono de elemento, va pegado al valor en el label:
```
Damage: <DT_SLASH_COLOR> 750
Damage: <DT_SLASH_COLOR> <DT_IMPACT_COLOR> 1.500
Drain: <ENERGY> 25 $ENERGY_COST
```

Tags disponibles: `<DT_COLD_COLOR>` `<DT_HEAT_COLOR>` `<DT_ELECTRICITY_COLOR>` `<DT_TOXIN_COLOR>` `<DT_BLAST_COLOR>` `<DT_RADIATION_COLOR>` `<DT_SLASH_COLOR>` `<DT_IMPACT_COLOR>` `<DT_PUNCTURE_COLOR>` `<DT_VIRAL_COLOR>` `<DT_CORROSIVE_COLOR>` `<DT_GAS_COLOR>` `<DT_MAGNETIC_COLOR>` `<DT_VOID_COLOR>` `<ENERGY>` `<HEALTH>` `<SHIELD>`

---

## Casos especiales

**Subgrupos exclusivos (Chroma, Equinox):** los variantes van en `###`, son mutuamente excluyentes. El augment siempre en `####` después de todos los subgrupos.
```
## /Lotus/.../DragonLuckAbility
Drain: <ENERGY> 50 $ENERGY_COST
Duration: 23s $AVATAR_ABILITY_DURATION
### Heat
Health: 55% $AVATAR_ABILITY_STRENGTH
### Cold
Armor: 145% $AVATAR_ABILITY_STRENGTH
#### EVERLASTING WARD
Duration: 100%
```

**Augments múltiples mutuamente excluyentes:** documentar con `//`.
```
#### VEXING RETALIATION
// exclusivo con GUARDIAN ARMOR
Explosion Damage: 100 $AVATAR_ABILITY_STRENGTH
#### GUARDIAN ARMOR
// exclusivo con VEXING RETALIATION
Damage Reduction: 75%
```

---

## Anotaciones diseñadas — parser pendiente

Los siguientes campos tienen **sintaxis `<key:value/>` acordada** pero el parser aún no los procesa. Anotarlos en `.md` hoy produce `console.warn` y el campo se ignora. Se implementan cuando haya casos reales suficientes.

| Anotación | Campo output | Ejemplo |
|---|---|---|
| `<cap:N/>` | `cap: N` | `Damage: 750 $STRENGTH <cap:1500/>` |
| `<cap:N-M/>` | `cap: [N, M]` | `Range: 5 - 18m $RANGE <cap:12-30/>` |
| `<floor:N/>` | `floor: N` | `Energy Cost: 25 $ENERGY_COST <floor:6.25/>` |
| `<floor:N-M/>` | `floor: [N, M]` | `Range: 5 - 18m $RANGE <floor:2-5/>` |
| `<inv/>` | `inverse: true` | `Cooldown: 10s <inv/>` |

**Distinción de tags:** `<key:value/>` es parseable (minúsculas + colon + self-closing). `<DT_HEAT>` y similares son pass-through de la UI — el parser los ignora, van al label tal cual.

**Multi-scaling** (`upgrade_by` como array): cuando un stat escala con dos modificadores, el parser toma el primero; el segundo se ignora hasta que exista `formulas/ability/`. Para verificar la fórmula real, consultar `references/wiki/sources/maximization-data.lua`.

---

## Fuera de scope

`helminth_base`, `helminth_cap` — sin anotación por ahora. Sin suficientes casos.

La sintaxis de **passives** (`##P` u equivalente) está en diseño — se define después de las primeras pruebas de concepto con habilidades normales.

---

## Lo que NO va en estos archivos

- `name`, `description`, `image_name` de la habilidad → vienen de `@wfcd/items` vía pipeline
- Stats de armas exaltadas (crit, status) → pertenecen al arma, no a la habilidad
- Valores de rangos intermedios → solo rango máximo
