---
Estado: "activo"
Rol: "Definir los roles lógicos de la arquitectura de datos"
Version: "v0.0.2"
Impacto_ID: "D-Roles"
Fidelidad_Fisica: "Project/src/lib/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
Dependencias:
  - "docs/domains/data/ssot.md"
  - "docs/domains/data/overrides.md"
---

# Data Layer Roles

## La Nueva Jerarquía

OmniFrame separa los datos por su origen de confianza, no por su formato:

1.  **Capa de Inteligencia (Manual/Override)**: Vive en `Project/data/`. Es la fuente única de verdad editable. Contiene el conocimiento auditado que el código no puede deducir.
2.  **Capa de Soporte (Generated)**: Procesos que normalizan datos masivos de fuentes externas. Sirven como base para la Capa de Inteligencia pero nunca la sobrescriben.
3.  **Capa de Despliegue (Runtime)**: Vive en `Project/public/data/`. Es un artefacto derivado. **No debe editarse nunca**.

## Definición de Roles

### `manual-intel` (Antiguo `override`)
- **Definición**: Conocimiento humano auditado.
- **Ubicación**: Siempre en `Project/data/`.
- **Ejemplos**: `ability-stats.override.json`, `mod-stats.override.json`.

### `base-generated`
- **Definición**: Datos masivos normalizados (nombres, categorías raw).
- **Ubicación**: `Project/public/data/` (como resultado de pipeline).
- **Regla**: Si un dato de esta capa falla, se promociona a `manual-intel`.

### `deprecated` / `legacy`
- **Definición**: Archivos en `public/data/` que han sido superados por la Capa de Inteligencia.
- **Acción**: Comparar, absorber y eliminar.

## Clasificación de Archivos (Estado Objetivo)

| Archivo | Rol Lógico | Ubicación SSoT |
|---|---|---|
| `warframes.json` | `base-generated` | `Project/public/data/` |
| `ability-stats.override.json` | `manual-intel` | `Project/data/overrides/` |
| `mod-stats.override.json` | `manual-intel` | `Project/data/overrides/` |
| `passives.json` | `manual-intel` | `Project/data/overrides/` |
| `arcanes.json` | `base-generated` | `Project/public/data/` |

## Consolidación de SSoT

Se elimina la ambigüedad histórica:
- **`Project/public/data/ability-stats.override.json`**: Es una copia muerta. No se reconoce como SSoT.
- **`Project/data/overrides/ability-stats.override.json`**: Es la ÚNICA fuente de verdad.

Todo el flujo de trabajo (scripts, validadores y edición manual) debe apuntar exclusivamente a la Capa de Inteligencia en `Project/data/`.

Ver:
- `ssot.md`
- `overrides.md`
