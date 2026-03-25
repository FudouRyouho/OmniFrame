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
2. Si no hay decisión previa en `Docs/decisions/`, no implementar — iniciar Fase 3
3. Para trabajo nuevo, leer primero el `status.md` del track afectado

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

## Reglas duras

- No crear markdown fuera de `Docs/` salvo que el usuario lo pida explícitamente
- No agregar tests salvo que el usuario lo pida
- No cambiar schema, arquitectura o workflow sin pasar por Fase 5
- Prioridad: `reducir caos → cerrar drift → dejar trazabilidad → implementar`

## Documentación de resultados

- Decisión local → `Docs/features/<track>/questions.md`
- Decisión transversal → `Docs/decisions/open-questions.md`
- Blocked → `Docs/decisions/` con dependencia explícita
- Idea futura → `Docs/decisions/implementaciones-temporales.md`
- Siempre actualizar `status.md` del track afectado al cerrar trabajo