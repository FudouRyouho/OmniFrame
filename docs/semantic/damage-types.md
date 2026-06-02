---
Estado: "activo"
Rol: "Contrato semántico de tipos de daño y sus mapeos"
Version: "v0.0.2"
Impacto_ID: "semantic-damage"
Fidelidad_Fisica: "Project/src/shared/types/damage.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
---

# DamageType — Semántica Canónica

## Catálogo de Daños

El sistema unifica los tipos de daño bajo una taxonomía canónica (lowercase), resolviendo las inconsistencias de los tokens raw del juego.

| Familia | Miembros |
| :--- | :--- |
| **Físico** | `impact`, `puncture`, `slash` |
| **Elemental Base** | `heat`, `cold`, `electricity`, `toxin` |
| **Combinado** | `blast`, `corrosive`, `gas`, `magnetic`, `radiation`, `viral` |
| **Especial** | `void`, `tau` (Sentient), `true` (Finisher) |

## Resolución de Tags Raw (`DT_*`)

El proyecto resuelve automáticamente los tags de la fuente (ej: en descripciones de habilidades o stats de armas) mediante `resolveDamageTypeTag()`.

- **Patrón**: `DT_<UPPER>` (con sufijos `_COLOR` u `_OUTLINE` opcionales) → `DamageType` canónico.
- **Ejemplo**: `DT_EXPLOSION` o `DT_BLAST_COLOR` se resuelven como `blast`.

## Implementación Técnica

- **Lógica**: `Project/src/shared/types/damage.ts` (Tipo, mapeos y resolución).
- **UI**: `Project/src/lib/presentation/icons/IconDamageType.tsx` provee el renderizado de iconos canónicos.
- **Dataset**: Los campos `damage: DamageMap` en los JSONs de items ya contienen las keys canónicas normalizadas.

---

### Notas Operativas
Este documento es la referencia para asegurar que cualquier nuevo dato inyectado al sistema respete la nomenclatura de daños unificada para el cálculo y la visualización.
