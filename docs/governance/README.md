# Governance — Mapa de documentos

Contratos, convenciones, estado del proyecto y registro de decisiones.

## Documentos y su rol

| Archivo | Rol | Cuándo leerlo |
|---|---|---|
| [`current-state.md`](current-state.md) | Estado físico real del repositorio (código, no intención) | Antes de cualquier sesión de trabajo |
| [`open-questions.md`](open-questions.md) | Preguntas abiertas sin respuesta — NO actuar sobre estas áreas | Antes de tocar integration/, state, arsenal |
| [`closed-decisions.md`](closed-decisions.md) | Decisiones cerradas — no reabrir sin evidencia nueva | Si surge un debate que parece ya resuelto |
| [`decision-frontier.md`](decision-frontier.md) | Frontera entre lo decidido y lo que sigue en debate | Para orientar debates nuevos |
| [`naming-conventions.md`](naming-conventions.md) | Convenciones de nombres por boundary arquitectónico | Antes de nombrar archivos, funciones o tipos |
| [`jsdoc-standard.md`](jsdoc-standard.md) | Vocabulario canónico de `@status`, `@domain`, `@SSoT` en `Project/src/` | Antes de limpiar o agregar JSDoc en cualquier archivo de código |
| [`semantic-layers.md`](semantic-layers.md) | Frontera de transformación e interpretación de datos | Al trabajar con tipos, display o engine |
| [`type-system-boundaries.md`](type-system-boundaries.md) | Rol de `src/shared/types/` y sus límites | Al agregar o modificar tipos |
| [`known-risks.md`](known-risks.md) | Riesgos técnicos conocidos con decisión de "no actuar ahora" | Al evaluar dependencias externas |
| [`nomenclature-grammar.md`](nomenclature-grammar.md) | Gramática canónica `DOMINIO:ROL[:ESQUEMA/ID]` — SSoT de todas las nomenclaturas internas | Antes de escribir cualquier tag inline en JSON, doc o código |
| [`deuda-taxonomy.md`](deuda-taxonomy.md) | Eje de evidencia `[EVD]` (`[ref]`, `[empirical]`, `[inferred]`, `[needs-verification]`) + cadena de dependencia de deuda | Antes de anotar cualquier ítem de deuda en cualquier doc |