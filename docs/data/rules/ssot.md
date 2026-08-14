---
Estado: "referencia"
Rol: "Definir las fuentes de verdad por entidad y su sistema de origen"
Impacto_ID: "D-SSoT"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-05-22"
Dependencias:
  - "docs/data/rules/overrides.md"
---

# Data SSoT

## Fuentes por entidad

De dónde viene cada dato hoy. La procedencia de las fuentes externas y su estado de salud viven en
[`../../domains/source/`](../../domains/source/).

| Dato                 | Sistema           | Fuente primaria (**Reality**)                     |
| -------------------- | ----------------- | ------------------------------------------------- |
| metadata de warframe | scraper           | `Project/public/data/warframes.json`              |
| stats de habilidades | **Manual** (`references/game-ui/*.md` → `apply-ability-md.ts`, script de ejecución manual) | `Project/public/data/ability-stats.override.json` |
| stats de mods        | **Manual (100%)** | `Project/public/data/mod-stats.override.json`     |
| pasivas              | generated/manual  | `Project/public/data/passives.json`               |
| arcanos              | scraper/manual    | `Project/public/data/arcanes.json`                |

## Regla de Oro: SSoT en `public/data`

1.  **Entorno de Trabajo**: El mantenimiento manual se realiza directamente en `Project/public/data/`.
2.  **Advertencia**: No utilizar rutas teóricas fuera de `public/` para evitar desincronización con el sistema de carga (hydration).

## Verificación

Los tests del engine DEBEN importar sus dependencias desde `Project/public/data/` para garantizar que validan la fuente de verdad activa.

Ver:

- `overrides.md`
