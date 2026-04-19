---
Estado: "activo"
Rol: "Definir las fuentes de verdad por entidad y su sistema de origen"
Version: "v0.0.2"
Impacto_ID: "D-SSoT"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
Dependencias:
  - "docs/domains/data/roles.md"
  - "docs/domains/data/overrides.md"
---

# Data SSoT

## Fuentes por entidad (Manualidad 100%)

Debido a la desincronización y falta de fidelidad de las fuentes externas (Wiki, Scrapers), OmniFrame ha pasado a un modelo de **mantenimiento manual absoluto** para sus capas de inteligencia.

| Dato                 | Sistema           | Fuente primaria (**Reality**)                     |
| -------------------- | ----------------- | ------------------------------------------------- |
| metadata de warframe | scraper           | `Project/public/data/warframes.json`              |
| stats de habilidades | **Manual (100%)** | `Project/public/data/ability-stats.override.json` |
| stats de mods        | **Manual (100%)** | `Project/public/data/mod-stats.override.json`     |
| pasivas              | generated/manual  | `Project/public/data/passives.json`               |
| arcanos              | scraper/manual    | `Project/public/data/arcanes.json`                |

## ❗ Alerta de Desviación (Drift)

El plan original de migrar a `Project/data/` (fuera de `public/`) **no ha sido ejecutado aún**. La documentación previa mencionaba esta ruta como activa, pero físicamente no existe. La Matriz de Impacto tiene esta tarea pendiente como nivel 🔴 [D-13].

## Regla de Oro: El fin de `public/data`

1.  **Entorno de Trabajo**: Se trabaja temporalmente en `Project/public/data/` hasta completar la tarea [D-13].
2.  **Advertencia**: No intentar crear ni buscar archivos en `Project/data/` hasta que la tarea de migración sea oficialmente marcada como finalizada en la Matriz de Impacto.

## Verificación

Los tests del engine DEBEN importar sus dependencias desde `Project/data/` para garantizar que validan la fuente de verdad antes de cualquier proceso de publicación.

Ver:

- `data-layer-roles.md`
- `overrides.md`
