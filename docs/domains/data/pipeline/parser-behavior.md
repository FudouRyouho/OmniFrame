# Semantic Parser Behavior

> Estado: **UTILIDAD MANUAL** — Verificado 2026-04-18
> Rol: Herramienta de soporte para la extracción de semántica desde capturas Markdown
> Ruta física: `utilities/parse-semantic.mjs`

## Comportamiento de la Utilidad

Este script es una herramienta de auxilio para el desarrollador. No forma parte del pipeline de generación automática de datos (`generate-data`).

- **Entrada**: Archivos de captura en `references/semantic-ui-rips/*.md`.
- **Procesamiento**:
  - Parsea la jerarquía de `##` (Habilidad), `###` (Subgrupo/Modo) y `####` (Augment).
  - Extrae valores numéricos básicos y tags semánticos (`<DT_SLASH>`, etc.).
- **Salida**: Genera `references/semantic-ui-rips/parsed-output.json`.

## Flujo de Trabajo

1.  **Captura**: Se documenta la semántica cruda en un archivo `.md`.
2.  **Extracción**: Se ejecuta `node utilities/parse-semantic.mjs`.
3.  **Integración (Manual)**: El desarrollador toma los fragmentos de `parsed-output.json` y los integra manualmente en `Project/data/overrides/ability-stats.override.json`.
4.  **Enriquecimiento**: Se definen los `upgradeBy` reales (STR, DUR, etc.) en el override, ya que el parser los inicializa en `NONE`.

## Limitaciones

- El parser es agnóstico al motor de cálculo; solo captura la estructura y los números base.
- No valida la existencia de `uniqueNames` contra el dataset de `@wfcd/items`.
- Ignora líneas marcadas con `##!` (útil para marcar secciones ya integradas).

---

### Mantenimiento
Si la gramática del Markdown en `references/` cambia, el script en `utilities/` debe ser actualizado para evitar la pérdida de fidelidad en la captura.
