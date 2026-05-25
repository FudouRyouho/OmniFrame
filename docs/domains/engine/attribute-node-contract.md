---
Estado: "activo"
Rol: "Definir el contrato de AttributeNode: qué modela cada campo, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta"
Version: "v0.1.0"
Impacto_ID: "E-AttributeNode"
Fidelidad_Fisica: "Project/src/core/engine/contracts/index.ts"
Fecha_de_creacion: "2026-05-19"
Fecha_de_actualizacion: "2026-05-19"
Dependencias:
  - "references/wiki/mechanics/damage-types.md"
  - "references/wiki/mechanics/critical-hits.md"
  - "references/wiki/mechanics/condition-overload.md"
---

# Contrato de AttributeNode

## Por qué existe este documento

`AttributeNode` no fue diseñado de forma explícita — emergió orgánicamente de la estructura multiplicativa de las fórmulas de Warframe. Sus campos mapean directamente a las capas de acumulación del juego. Este documento formaliza esa correspondencia.

**Base empírica:** `references/wiki/mechanics/` contiene las fórmulas verificadas del juego. Este documento define cómo el engine las modela, sin reemplazar esa fuente.

---

## La fórmula maestra del engine

```
scaledBase = (base + base_flat) × (1 + base_add_pct / 100)
withMods   = scaledBase × (1 + mods_add_pct / 100)
final      = (withMods + total_flat) × multiplicative
```

Para atributos `damage_*` en entidades `domain: weapon`, se aplica una capa adicional:

```
final      = final × (WEAPON_DAMAGE.final / 100)
```

Ver §5 para la explicación de `WEAPON_DAMAGE`.

---

## Tabla de campos

| Campo | Capa de la fórmula de Warframe | `Modifier.operation` | Ejemplo de fuente |
|---|---|---|---|
| `base` | Valor base del item (del dataset) | — inyectado en hidratación | Stat del arma, armor del warframe |
| `base_flat` | Adición plana al base, antes de mods porcentuales | `BASE_FLAT` | Arcane con bonus flat a stat base |
| `base_add_pct` | Bonus relativo al base (escala sobre el base, no apila con mods de daño) | `BASE_ADD_PCT` | Mods de crit chance relativo (Pointstrike) |
| `mods_add_pct` | Stack aditivo principal — todos los mods de este tipo se suman entre sí | `ADD` | Serration, Heavy Caliber, Hornet Strike, Pressure Point |
| `multiplicative` | Capa multiplicativa independiente — cada fuente multiplica por separado | `MULTIPLICATIVE` | Faction damage, Roar (Rhino), Eclipse (Mirage)¹ |
| `total_flat` | Adición plana post-mods, antes del multiplicativo | `ADD_FLAT` | Arcane Dexterity (daño flat absoluto) |
| `final` | Resultado resuelto — solo lectura | — calculado | Lo que lee la UI |

¹ Eclipse: ver nota en §4.

---

## Semántica por capa

### `mods_add_pct` — el stack aditivo

Todos los mods de daño global (+X% de daño) se acumulan en este bucket:

```
WEAPON_DAMAGE.mods_add_pct = Serration(165) + HeavyCaliber(165) = 330
→ multiplicador efectivo: 1 + 330/100 = 4.30×
```

Los mods de Condition Overload con comportamiento **"Adding"** también apilan aquí. Ver `references/wiki/mechanics/condition-overload.md §Behavior types`.

### `multiplicative` — capas independientes

Cada fuente multiplicativa se aplica por separado (no apilan aditivamente entre sí):

```
final = ... × (1 + roar%) × (1 + eclipse%) × ...
```

Esto es lo que en Warframe se llama informalmente "multiplicar fuera del grupo aditivo". Los mods de Condition Overload con comportamiento **"Multiplying"** van aquí.

**Nota sobre faction damage:** Expel Grineer / Bane of Grineer NO van en este bucket. Apilan aditivamente entre sí en un nodo sintético `faction_damage_bonus` (mismo patrón que `WEAPON_DAMAGE`). `CombatCalculator` aplica ese nodo como multiplier de combate cuando la facción del objetivo coincide. Ver §5.

### `base_add_pct` vs `mods_add_pct`

La distinción sigue la fórmula de critical hits documentada en `references/wiki/mechanics/critical-hits.md`:

```
totalCritChance = baseCritChance × (1 + relativeCritBonus) + absoluteCritBonus
```

- `relativeCritBonus` → `base_add_pct` (escala sobre el base, se multiplica con él)
- `absoluteCritBonus` → `base_flat` (se suma al resultado del base, no se multiplica)

Para daño de armas, `base_add_pct` es raro — casi todos los bonos de daño son aditivos entre sí (`mods_add_pct`) o multiplicativos independientes (`multiplicative`).

---

## Notas de ejemplos

### ¹ Eclipse (Mirage)

Eclipse provee hasta `STR × 200%` de bonus de daño (fuente: `references/wiki/modules/raw/maximization-data.lua`). Está expresado como porcentaje y se aplica **fuera** del stack aditivo de Serration — lo que lo ubica en `multiplicative`, no en `mods_add_pct`.

⚠️ **Pendiente de verificación**: confirmar contra la wiki si Eclipse es `(1 + bonus%)` multiplicativo puro o si tiene interacción especial con el stack aditivo bajo ciertas condiciones de luz/sombra.

---

## Mods elementales — caso especial

Los mods elementales (Heat, Cold, Electricity, etc.) **no** modifican un `damage_*` existente vía bucket. En su lugar, `DamageCombiner` los procesa en hidratación para crear o combinar tipos de daño en la entidad.

El ordenamiento de slots de mods determina qué elementos se combinan primero (Heat + Cold = Blast, etc.). Ver `references/wiki/mechanics/damage-types.md §Reglas de combinación`.

Una vez que `DamageCombiner` produce el breakdown final de daño, cada tipo resultante se inyecta como un `AttributeNode` nuevo en la entidad. Desde ese punto, sí participan en el sistema de buckets como cualquier otro atributo.

---

## Nodos sintéticos — patrón compartido

`WEAPON_DAMAGE` y `faction_damage_bonus` siguen el mismo patrón: nodo inyectado por `StaticHydrator` con `base: 100`, modificado por mods aditivos, interpretado por capas superiores como `final / 100`.

| Nodo | Base | Alimentado por | Consumido por |
|---|---|---|---|
| `WEAPON_DAMAGE` | 100 | `WEAPON_DAMAGE_AMOUNT`, `WEAPON_MELEE_DAMAGE` | `calculateCurrentValue()` — multiplica todos los `damage_*` de la entidad |
| `faction_damage_bonus` | 100 | `GAMEPLAY_FACTION_DAMAGE` | `CombatCalculator` — aplica como multiplier cuando `target.faction` coincide |

`faction_damage_bonus` está mapeado en `ModRepository` pero pendiente de inicialización en `StaticHydrator` y wiring en `CombatCalculator`.

---

## `WEAPON_DAMAGE` — capa de multiplicador global

`WEAPON_DAMAGE` es un `AttributeNode` sintético inyectado por `StaticHydrator` en toda entidad `domain: weapon`. Modela los mods de "daño global" como Serration — que en Warframe aumentan todo el daño del arma proporcionalmente.

**Flujo:**
1. `StaticHydrator` inyecta `WEAPON_DAMAGE { base: 100 }` en la entidad
2. Serration genera `Modifier { target_attribute: "WEAPON_DAMAGE", operation: "ADD", value: 165 }`
3. El grafo resuelve `WEAPON_DAMAGE` primero (todos los `damage_*` dependen de él)
4. `calculateCurrentValue()` aplica `WEAPON_DAMAGE.final / 100` a cada `damage_*`

**Restricción de dominio:** `WEAPON_DAMAGE` solo se inyecta en entidades `domain: weapon`. Las habilidades de warframe que usen atributos `damage_*` no deben recibir este multiplicador — Serration no afecta daño de habilidades en el juego.

---

## Implicaciones para `ModRepository`

El contrato actual de `ModRepository` produce **todos** los modificadores con `operation: "ADD"`. Esto es incorrecto para:

| Tipo de mod | Operation correcta | Actualmente |
|---|---|---|
| Daño global (Serration) | `ADD` sobre `WEAPON_DAMAGE` | ✅ Correcto |
| Faction damage (Expel Grineer) | `ADD` sobre `faction_damage_bonus` (nodo sintético base 100, como `WEAPON_DAMAGE`) | ✅ Mapeado — pendiente inicialización en `StaticHydrator` y wiring en `CombatCalculator` |
| GunCO "Multiplying" | `MULTIPLICATIVE` | ❌ Requiere registro manual |
| Crit chance relativo | `ADD` sobre `critical_chance` | ⚠️ Correcto por casualidad (solo hay un bucket de crit hoy) |

La corrección de estas operaciones es el paso siguiente después de definir este contrato.

---

## Lo que este documento no cubre

- Fórmulas de DoT (Slash, Heat, Toxin ticks) — ver `references/wiki/mechanics/damage-types.md §Status relevantes`
- Resolución de crit tiers — ver `references/wiki/mechanics/critical-hits.md`
- Lógica de combinación elemental — ver `DamageCombiner.ts` + `references/wiki/mechanics/damage-types.md`
- Profile switching (Incarnon/base) — pendiente OQ-ENGINE-2
