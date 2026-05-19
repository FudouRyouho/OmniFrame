---
Estado: "activo"
Rol: "Enforcement de estilo por boundary arquitectónico"
Version: "v0.0.2"
Impacto_ID: "G-Naming"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
---

# Convenciones de Nomenclatura (Naming)

| Boundary | Estilo | Contoh / Ejemplo |
|---|---|---|
| Tipos, Interfaces, Componentes React | `PascalCase` | `LoadoutProvider`, `BaseItem` |
| Funciones, Hooks (símbolo), Variables | `camelCase` | `fetchWarframes()`, `useViewFilter()` |
| Archivos, Carpetas, Módulos, Docs | `kebab-case` | `mod-core.ts`, `semantic-layers.md` |
| Campos Raw / JSON / Overrides | `snake_case` | `unique_name`, `shot_type` |
| IDs del Juego / Constantes | `UPPER_SNAKE` | `WEAPON_CRIT_CHANCE`, `DT_SLASH` |

## Reglas de Oro
1.  **Filiación por Archivo:** Los componentes React nominales (ej. `ArsenalView.tsx`) son los únicos que pueden usar `PascalCase` en el nombre de archivo.
2.  **No Labels en Código:** Un token técnico (ej. `hitscan-single`) nunca debe usarse como texto visible sin pasar por una capa de traducción o i18n.
