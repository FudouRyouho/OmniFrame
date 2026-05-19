---
Estado: "activo"
Rol: "Fijar el vocabulario canónico de escalado de habilidades"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Vars"
Fidelidad_Fisica: "Project/src/shared/types/ability.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Ability Engine Variables

## Vocabulario de Escalado (Build)

| Identificador | Variable del Engine | Descripción |
| :--- | :--- | :--- |
| `STR` | `AVATAR_ABILITY_STRENGTH` | Multiplicador de fuerza. |
| `DUR` | `AVATAR_ABILITY_DURATION` | Multiplicador de duración. |
| `RNG` | `AVATAR_ABILITY_RANGE` | Multiplicador de rango. |
| `EFF` | `AVATAR_ABILITY_EFFICIENCY` | Multiplicador de eficiencia (0.25 - 1.75). |
| `NONE` | - | Valor estático sin escalado. |

## Tipos de Energía

| Identificador | Fórmula | Descripción |
| :--- | :--- | :--- |
| `ENERGY_COST` | `(2 - EFF) * baseValue` | Coste de activación. |
| `ENERGY_DRAIN` | `(2 - EFF) * baseValue / DUR` | Consumo por segundo. |

## Regla de Coherencia Semántica

El campo `upgradeBy` no se acopla directamente a modificadores crudos del dataset. En su lugar, utiliza identificadores del **Diccionario Semántico Canónico** definido en el tipado del proyecto (`src/shared/types/`). 

Este diccionario actúa como la capa de mediación necesaria para:
1.  **Normalizar** la taxonomía dispar de la fuente externa.
2.  **Derivar** valores complejos que el motor requiere para el cálculo real.
3.  **Asegurar** que el motor trabaje con contratos estables, independientemente de los cambios en el formato de los mods o el dataset.

## Casos Especiales (Abiertos)

Valores como `TARGET_COUNT` o escalados por `ARMOR` se tratan como parámetros adicionales que el motor puede consumir, pero no forman parte del vocabulario base de escalado de mods estándar.

---

### Fuentes Operativas
- Lógica de maximización documentada en `references/`.
- `Project/src/shared/types/ability.ts` (Contrato de tipos).
- `docs/domains/data/abilities/formula-patterns.md`.
