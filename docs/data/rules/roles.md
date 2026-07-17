---
Estado: "histórico"
Rol: "Roles lógicos de la arquitectura de datos — ABSORBIDO por overrides.md (v0.0.11, 2026-06-07)"
Impacto_ID: "D-Roles"
Fidelidad_Fisica: "Project/src/shared/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-06-07"
Dependencias:
  - "docs/data/rules/ssot.md"
  - "docs/data/rules/overrides.md"
---

# Data Layer Roles

## La Nueva Jerarquía

OmniFrame separa los datos por su origen de confianza, no por su formato:

1.  **Capa de Inteligencia (Manual/Override)**: Vive en `Project/public/data/`. Es la fuente única de verdad editable y auditada.
2.  **Capa de Soporte (Generated)**: Procesos que normalizan datos masivos. Sirven como base pero son superados por los archivos `.override.json`.
3.  **Capa de Despliegue (Runtime)**: Comparte ubicación con la Capa de Inteligencia en `Project/public/data/` para simplificar la hidratación.

## Definición de Roles

### `manual-intel` (Antiguo `override`)
- **Definición**: Conocimiento humano auditado.
- **Ubicación**: Siempre en `Project/public/data/`.
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
| `ability-stats.override.json` | `manual-intel` | `Project/public/data/` |
| `mod-stats.override.json` | `manual-intel` | `Project/public/data/` |
| `passives.json` | `manual-intel` | `Project/public/data/` |
| `arcanes.json` | `base-generated` | `Project/public/data/` |

## Consolidación de SSoT

Se elimina la ambigüedad histórica:
- **`Project/public/data/*.override.json`**: Es la única fuente de verdad (SSoT) manual.

Todo el flujo de trabajo (scripts, validadores y edición manual) debe apuntar exclusivamente a estos archivos.

Ver:
- `ssot.md`
- `overrides.md`
