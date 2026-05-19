---
Estado: "activo"
Rol: "Contrato conceptual del vocabulario de condiciones para el sistema de cálculo"
Version: "v0.0.2"
Impacto_ID: "E-Conditions"
Fidelidad_Fisica: "Project/src/core/engine/sim-v2/contracts/index.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Condiciones — Baseline canónico

## Taxonomía de Condiciones

El sistema de cálculo reconoce cuatro familias principales de condiciones:

- `enemy_status`: Estado del enemigo (ej: `enemy_has_bleed`, `enemy_has_heat_proc`).
- `player_action`: Acción activa del jugador (ej: `aiming`, `sliding`).
- `combat_context`: Contexto acumulativo (ej: `galvanized_stacks`, `combo_multiplier`).
- `attack_behavior`: Comportamiento intrínseco del ataque (ej: `is_direct_hit`, `has_radial_component`).

## Catálogo de Semillas (Baseline de Integración)

Estas variables están respaldadas por la lógica de la wiki (referencia en `references/wiki/`) y son las aceptadas por el Engine para la resolución de stats condicionados.

| ID | Familia | Tipo de Valor | Origen |
| :--- | :--- | :--- | :--- |
| `enemy_has_bleed` | `enemy_status` | `boolean` | Wiki |
| `enemy_has_heat_proc` | `enemy_status` | `boolean` | Wiki |
| `galvanized_stacks` | `combat_context` | `number` | Wiki |
| `aiming` | `player_action` | `boolean` | Confirmado |
| `sliding` | `player_action` | `boolean` | Confirmado |
| `combo_multiplier` | `combat_context` | `number` | Wiki |
| `target_count` | `combat_context` | `number` | Wiki |

## Reglas de Nomenclatura

Para mantener la coherencia en los refactors batch:
- `enemy_*` / `on_kill_*`: Estados o triggers relacionados con el enemigo.
- `is_*` / `has_*`: Booleans de comportamiento o presencia.
- `ability_*`: Contexto específico de poderes de Warframe.

---

### Notas de Implementación
- El Engine trata actualmente las condiciones como stubs activos.
- Las condiciones booleanas mapean a `SimulationContext.flags` y las numéricas a `SimulationContext.variables`. La expansión de este catálogo se realiza mediante el descubrimiento de nuevos modificadores en el pipeline de datos, tras validación contra la fuente de verdad en `references/wiki/`.
