# OmniFrame — Copilot Instructions

Responder siempre en español.

## Estructura del proyecto

```
Project/          → app activa (OmniFrame)
warframe-items/   → fork del repo de datos
Docs/             → documentación canónica (única fuente de verdad)
App-legacy/       → referencia histórica, no tocar
references/       → capturas y semántica canónica del juego
```

## Antes de cualquier respuesta

1. Identificar en qué fase del workflow estamos (ver abajo)
2. Leer los documentos del dominio afectado antes de formular preguntas o abrir debate
   — si el tema ya está documentado, la respuesta surge de ahí, no del debate
3. Si no hay decisión previa en `Docs/decisions/`, no implementar — iniciar Fase 3
4. Para trabajo nuevo, leer primero el `status.md` del track afectado

## Workflow obligatorio (5 fases)

```
Análisis → Pre-documentación → Debate → Implementación/Decisión → Documentación Real
```

No saltar fases. Cada fase es un checkpoint explícito.

## Jerarquía documental (leer en este orden)

1. `Docs/overview/current-state.md`
2. `Docs/overview/goals-roadmap.md`
3. `Docs/overview/stabilization-backlog.md`
4. `Docs/features/<track>/status.md`
5. `Docs/decisions/open-questions.md`

## Registro de decisiones activas

El archivo `Docs/temp/pre-v1-architecture-2026-03-26.md` es el registro de sesión activo.
Contiene las decisiones C1-C28, los debates PA-N cerrados y el orden de trabajo de stage 0.
Cuando el contexto de sesión sea insuficiente o haya duda sobre una decisión anterior,
leer ese archivo antes de formular preguntas o abrir debate.

## Reglas duras

- No crear markdown fuera de `Docs/` salvo que el usuario lo pida explícitamente
- No agregar tests salvo que el usuario lo pida
- No cambiar schema, arquitectura o workflow sin pasar por Fase 5
- Prioridad: `reducir caos → cerrar drift → dejar trazabilidad → implementar`
- La documentacion es de uso principalmente para consumo de agentes, no para humanos, así que debe ser clara, concisa y estructurada para ese fin. No es necesario explicar cada detalle, solo lo relevante para la toma de decisiones y la implementación.

## Documentación de resultados

- Decisión local → `Docs/features/<track>/questions.md`
- Decisión transversal → `Docs/decisions/open-questions.md`
- Blocked → `Docs/decisions/` con dependencia explícita
- Idea futura → `Docs/decisions/implementaciones-temporales.md`
- Siempre actualizar `status.md` del track afectado al cerrar trabajo

## Señales de fin de turno

Cada fase tiene un entregable claro. Cuando el entregable está completo, el turno termina — aunque queden fases posteriores:

| Fase completada | Entregable = tarea completa |
|---|---|
| Fase 1 — Análisis | Diagnóstico presentado |
| Fase 2 — Pre-doc | Propuesta documentada |
| **Fase 3 — Debate** | **Opciones presentadas al usuario** |
| Fase 4 — Implementación | Cambios aplicados |
| Fase 5 — Documentación Real | Docs actualizados |

**Fase 3 en particular**: presentar opciones numeradas (punto → opción) ES el entregable. No implementar, no tomar decisiones, no continuar. Esperar respuesta del usuario en el siguiente turno. Las opciones pendientes de decisión del usuario NO son ambigüedades que el agente deba resolver por su cuenta.