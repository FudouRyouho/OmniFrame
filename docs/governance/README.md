# Governance — Mapa de documentos

Contratos, convenciones, estado del proyecto y registro de decisiones.

## Documentos y su rol

| Archivo | Rol | Cuándo leerlo |
|---|---|---|
| [`current-state.md`](current-state.md) | Estado físico real del repositorio (código, no intención) | Antes de cualquier sesión de trabajo |
| [`impact-matrix.md`](../overview/impact-matrix.md) | Backlog técnico y dependencias físicas | Para saber qué se puede trabajar hoy |
| [`open-questions.md`](open-questions.md) | Preguntas abiertas sin respuesta — NO actuar sobre estas áreas | Antes de tocar integration/, state, arsenal |
| [`closed-decisions.md`](closed-decisions.md) | Decisiones cerradas — no reabrir sin evidencia nueva | Si surge un debate que parece ya resuelto |
| [`architecture-decisions-index.md`](architecture-decisions-index.md) | Índice de todas las decisiones promovidas | Para buscar el ID de una decisión |
| [`decision-frontier.md`](decision-frontier.md) | Frontera entre lo decidido y lo que sigue en debate | Para orientar debates nuevos |
| [`naming-conventions.md`](naming-conventions.md) | Convenciones de nombres por boundary arquitectónico | Antes de nombrar archivos, funciones o tipos |
| [`jsdoc-standard.md`](jsdoc-standard.md) | Vocabulario canónico de `@status`, `@domain`, `@SSoT` en `Project/src/` | Antes de limpiar o agregar JSDoc en cualquier archivo de código |
| [`semantic-layers.md`](semantic-layers.md) | Frontera de transformación e interpretación de datos | Al trabajar con tipos, display o engine |
| [`type-system-boundaries.md`](type-system-boundaries.md) | Rol de `src/shared/types/` y sus límites | Al agregar o modificar tipos |
| [`known-risks.md`](known-risks.md) | Riesgos técnicos conocidos con decisión de "no actuar ahora" | Al evaluar dependencias externas |
| [`migration-status.md`](migration-status.md) | Estado de consolidación del árbol documental | Al auditar documentación |
| [`semantic-layers.md`](semantic-layers.md) | Capas semánticas obligatorias | Al trabajar en transformación de datos |