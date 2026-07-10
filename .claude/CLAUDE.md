# Reglas de Agente — OmniFrame

## Clasificación previa (siempre)

Antes de actuar, declarar: `[FASE: X | IMPACTO: RED/YELLOW/GREEN | ACCIÓN: halt/debate/execute]`

- **RED** → DETENER. Presentar opciones. Esperar autorización explícita.
- **YELLOW** → Debatir primero. Confirmar antes de tocar código o contratos.
- **GREEN** → Ejecutar. Reportar qué cambió.

**RED** = contratos core, arquitectura, docs SSoT
**YELLOW** = lógica de dominio, features nuevas
**GREEN** = formato, metadata, linting

## Entorno

- Sistema operativo: Linux.
- Line endings: estrictamente LF.
- El proyecto se ejecuta vía Docker para no instalar dependencias directamente en el sistema host.

## Enrutamiento

| Contexto | Reglas adicionales a aplicar |
|---|---|
| Archivos en `docs/` o cualquier `.md` | Leer y aplicar `docs/CLAUDE.md` |
| Archivos en `Project/src/` o `Project/scripts/` | Leer y aplicar `Project/CLAUDE.md` |
| Dudoso | Preguntar antes de actuar |

**`README.md` (raíz)** es el README público de GitHub — changelog simple, una entrada por versión, sin detalle técnico profundo. `Project/README.md` es solo un orientador interno.

**SSoT de decisiones abiertas:** `docs/governance/open-questions.md` — consultar ante cualquier cambio de arquitectura.

## Cierre de sesión

El cierre de sesión es **colaborativo y deliberado** (el usuario lo inicia o lo confirma), no un paso automático de fin de turno. Cuando se cierra, desamalgamar en acciones distintas — no todas aplican siempre:

1. **Resumir en el chat** lo que cambió. Esto no toca ningún archivo.
2. **Actualizar docs vivos** — solo si hay drift real o una decisión nueva que afecte el estado actual. Rutear con `docs/CLAUDE.md` ("Ruteo de contenido"): verdad viva → `docs/`, historia superada → no se escribe (git ya la tiene).
3. **Purgar a git** lo publicado o por publicar — no acumular en docs lo que el commit/historial ya preserva.
4. **Re-proponer lo no cerrado.** Si en la sesión quedó una propuesta sin confirmar (nota de gap, candidato a `docs-archive/`), no se asume ni se descarta — se re-propone la próxima vez que ese punto vuelva a ser relevante (default acordado: sin memoria de sesión previa, sin OQ intermedia).
5. **`docs-archive/` nunca se escribe por inferencia.** Si algo del cierre parece racional-personal "por qué NO" (arquitectura muerta, decisión de diseño ya no legítima), **proponer** guardarlo ahí o descartarlo del todo — la elección es del usuario, no del agente.

## Cuando hay drift (doc vs código)

- ¿Afecta la tarea actual? → Comportamiento RED sin importar el scope.
- ¿No afecta? → Registrar `⚠️ deuda` y continuar.

## Debate válido requiere

1. Citar: ¿qué doc o contrato entra en conflicto?
2. Trade-off: costo vs beneficio, concreto.
3. Alternativa: al menos un camino distinto.

"Confía en mí" no es argumento válido.

## Si hay bloqueo

Identificar uno de: deuda técnica / over-engineering / scope creep → proponer corte.

## Reglas duras

- Nunca eliminar anchors: `[vX.X.X]`, corchetes de control, IDs únicos.
- Nunca commitear output de subagente sin revisión.
- Orden de prioridad: `reduce_chaos → close_drift → traceability → write_code`
