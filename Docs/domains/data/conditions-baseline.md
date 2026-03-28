# Condiciones — Baseline canónico

> Estado: activo — cerrado para baseline, crece incrementalmente
> Rol: contrato conceptual del vocabulario de condiciones para el sistema de cálculo
> Fuente de verdad de: familias, shape de `ConditionDefinition`/`ConditionState`, seed catalog (PA-1b)
> No usar para: implementación directa — este es el vocabulario canónico, sin código de producción aún
> Decisiones de respaldo: C15–C18, C31 en `Docs/temp/pre-v1-architecture-2026-03-26.md`
> Actualizado: 2026-03-27

## Shape

```ts
type ConditionFamily =
  | "enemy_status"
  | "player_action"
  | "combat_context"
  | "attack_behavior";

type ConditionValueType = "boolean" | "number" | "enum" | "matrix";

type ConditionSource =
  | "wiki-module"
  | "wiki-mechanic"
  | "game-observed"
  | "user-confirmed"
  | "project-defined";

interface ConditionDefinition {
  id: string;
  family: ConditionFamily;
  valueType: ConditionValueType;
  source: ConditionSource;
  description: string;
}

interface ConditionState {
  id: string;
  value: boolean | number | string | Record<string, number>;
}
```

## Familias

| Familia | Descripción |
|---|---|
| `enemy_status` | Estado del enemigo (procs activos, efectos de daño, etc.) |
| `player_action` | Acción activa del jugador (apuntar, deslizarse, etc.) |
| `combat_context` | Contexto de combate (stacks, multiplicadores, conteos) |
| `attack_behavior` | Comportamiento del ataque (directo, radial, combo, global) |

## Seed catalog — PA-1b v1

> Alcance: solo condiciones/variables respaldadas por docs en `Docs/reference/wiki/*`
> Estado: cerrado para v1 baseline. El catálogo crece incrementalmente por barrido wiki + confirmación de usuario.

| id | family | valueType | source | Evidencia documental | Estado |
|---|---|---|---|---|---|
| `enemy_has_bleed` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_BLEEDING`) | Confirmado |
| `enemy_has_heat_proc` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_IMMOLATION`) | Confirmado |
| `enemy_has_electric_proc` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_ELECTROCUTION`) | Confirmado |
| `enemy_has_corrosive_proc` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_CAUSTIC_BURN`) | Confirmado |
| `enemy_has_viral_proc` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_INFECTED`) | Confirmado |
| `enemy_has_toxin_proc` | `enemy_status` | `boolean` | `wiki-module` | `modules/damage-types-data.md` (`PT_POISONED`) | Confirmado |
| `enemy_proc_matrix` | `combat_context` | `matrix` | `user-confirmed` | regla acordada: matriz por tipo de proc (ej. `heat:22`, `electricity:1`, `toxin:5`) | Confirmado |
| `galvanized_stacks` | `combat_context` | `number` | `wiki-mechanic` | `mechanics/condition-overload.md` (Aptitude/Shot stacks) | Confirmado |
| `attack_behavior_type` | `attack_behavior` | `enum` | `user-confirmed` | regla acordada: comportamiento global, declarado por override/schema adicional | Confirmado |
| `is_direct_hit` | `attack_behavior` | `boolean` | `wiki-mechanic` | `mechanics/condition-overload.md` (direct vs radial) | Confirmado |
| `has_radial_component` | `attack_behavior` | `boolean` | `wiki-mechanic` | `mechanics/condition-overload.md` (radial exclusion) | Confirmado |
| `combo_multiplier` | `combat_context` | `number` | `wiki-module` | `modules/maximization-data.md` (`COMBO`) | Confirmado |
| `target_count` | `combat_context` | `number` | `wiki-module` | `modules/maximization-data.md` (`TARGET`) | Confirmado |
| `ability_strength_multiplier` | `combat_context` | `number` | `wiki-module` | `modules/maximization-data.md` (`STR`) | Confirmado |
| `ability_duration_multiplier` | `combat_context` | `number` | `wiki-module` | `modules/maximization-data.md` (`DUR`) | Confirmado |
| `aiming` | `player_action` | `boolean` | `user-confirmed` | validado por usuario para baseline PA-1b | Confirmado |
| `sliding` | `player_action` | `boolean` | `user-confirmed` | validado por usuario para baseline PA-1b | Confirmado |
| `aim_gliding` | `player_action` | `boolean` | `user-confirmed` | validado por usuario para baseline PA-1b | Confirmado |
| `wall_latching` | `player_action` | `boolean` | `user-confirmed` | validado por usuario para baseline PA-1b | Confirmado |

### Resoluciones de baseline (2026-03-27)

- `aiming`, `sliding`, `aim_gliding`, `wall_latching` → `user-confirmed`
- Procs: matriz por tipo (`enemy_proc_matrix`) en lugar de conteo unico simple
- `attack_behavior_type` es global; entidades/objetos lo declaran por override o schema adicional

## Naming (C31)

El vocabulario es compartido entre todos los schemas (mods, arcanes, shards, habilidades, pasivas).
Prefijos de familia actúan como control para refactors batch vía regex:

- `enemy_*` / `on_kill_*` — estado del enemigo / triggers post-kill
- `is_*` / `has_*` — booleans de comportamiento de ataque o presencia de componente
- `per_shard_*` — escala por tipo/cantidad de shard
- `ability_*` — contexto de habilidades

No requiere formalización completa previa. Cada condición nueva se añade al catálogo por discovery.
