---
Estado: "activo"
Rol: "Definir la gobernanza de los datos mantenidos manualmente"
Version: "v0.0.2"
Impacto_ID: "D-Overrides"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
Dependencias:
  - "docs/domains/data/ssot.md"
---

# Override Pattern (Manual Intel)

## El Modelo de Inteligencia Manual

En OmniFrame, los "overrides" no son parches temporales; son el repositorio de la inteligencia del proyecto. Debido a la baja fidelidad de las fuentes externas, el conocimiento auditado vive en estos archivos.

```text
Project/data/ (Editable) 
  -> Commit Git (SSoT)
  -> Publicación (Opcional/Build time)
  -> Runtime (Carga)
```

## Reglas de Oro

1.  **Prohibida la edición en Runtime**: Se depreca y elimina cualquier funcionalidad de edición desde la UI o en la carpeta `public/data/`.
2.  **Ruta de Trabajo Única**: Por ahora, todo cambio debe realizarse físicamente en `Project/public/data/`. El objetivo a medio plazo es habilitar `Project/data/` para separar la inteligencia del despliegue público.
3.  **Fidelidad sobre Automatismo**: Preferimos un dato manual verificado que un dato automático desactualizado.

## Flujo de Absorción de Legado (Mecánica de Cierre)

Para los archivos que hoy solo existen en `public/data/` (o tienen datos diferentes):

1.  **Comparar**: Contrastar `public/data/X` contra `Project/data/X`.
2.  **Absorber**: Mover los deltas relevantes a la versión de `Project/data/`.
3.  **Eliminar**: Borrar el archivo en `public/data/`.
4.  **Actualizar SSoT**: Registrar la nueva fuente manual en `ssot.md`.

## Catálogo de Inteligencia

- `ability-stats.override.json`: Escalado, grupos y semántica de habilidades.
- `mod-stats.override.json`: Valores base por rango para todos los mods del juego.
- `passives.json`: Definiciones manuales de pasivas (no existen en la API).

Ver:
- `ssot.md`
- `data-layer-roles.md`
