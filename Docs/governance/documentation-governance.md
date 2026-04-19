# Documentation Governance Policy (DEPRECATED)

> [!WARNING]
> **ESTADO: DEPRECADO / EN TRÁNSITO**
> Este documento ha sido absorbido y dividido para garantizar una mayor claridad operativa y arquitectónica (Dominios Horizontales).
>
> **La autoridad actual reside en**:
>
> 1. [workflow.md](file:///d:/Development/Warframe/OmniFrame/.agents/workflows/workflow.md): Leyes de **Arquitectura y Operación Global**.
> 2. [docs-workflow.md](file:///d:/Development/Warframe/OmniFrame/.agents/workflows/docs-workflow.md): Gobenanza y **Gestión de la Biblioteca Documental**.
>
> No realice ediciones en este archivo; cualquier cambio debe ser aplicado en los workflows mencionados según corresponda.

---

> Estado: histórico/deprecado — **Mantenido para referencia hasta validación final**
> Rol: antiguo manual de reglas de documentación.
> Fuente de verdad original: como se documentaba en OmniFrame
> Ultima actualizacion: 2026-04-18

## Jerarquia del arbol (`docs/`)

- `governance/`: El "Cerebro". Estrategia, políticas, estado actual verificado y decisiones de arquitectura.
- `overview/`: El "Mapa". Matriz de impacto (Backlog real), roadmaps y guías de entrada.
- `domains/`: El "Cuerpo". Conocimiento técnico estable por responsabilidad (`data`, `engine`, `integration`, `semantic`, `ui-ux`). Cada dominio gestiona sus propias decisiones técnicas y status locales.

## Reglas de oro

1. **Fidelidad Fisica**: Los documentos deben usar los mismos nombres y rutas que el codigo real (`providers/Shell`, `core/engine`).
2. **Sin Inferencia**: Si un dato o comportamiento no esta verificado en el codigo o la fuente canonica, se registra como duda o gap, no como verdad.
3. **Impact-Matrix SSoT**: Toda deuda tecnica o dependencia detectada debe vivir en `impact-matrix.md` antes de ser asignada.
4. **Links Relativos**: Siempre preferir links relativos para mantener la portabilidad del sistema de documentacion.
5. **Estado Obligatorio**: Todo documento debe empezar con el bloque de metadata (Estado, Rol, Fuente de verdad).

## Mantenimiento del Archive

- `docs-archive/` es unicamente para material retirado de la linea operativa.
- No se debe usar el archive para debates abiertos; los debates viven en `domains/*/questions.md`.
- Un documento solo sale del archive tras una auditoria critica y purga tecnica de inconsistencias.
