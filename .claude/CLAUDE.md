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
Toda sesión debe cerrar con una fase de trazabilidad.

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
