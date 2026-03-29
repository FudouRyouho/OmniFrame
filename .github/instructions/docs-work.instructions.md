---
description: "Use when working in Docs/ — reading, editing or creating documentation files, debating schema, architecture, decisions or data models. Covers pre-debate verification, domain reading order, and debate discipline."
applyTo: "Docs/**"
---

# Trabajo en Docs/ — Reglas de verificación previa

## Antes de formular cualquier pregunta o abrir debate

1. Leer el documento activo y los documentos del mismo dominio (`Docs/domains/<dominio>/`)
2. Leer `Docs/decisions/stage-0-architecture-decisions.md` — contiene el índice canónico de decisiones C1-C41 ya promovidas
3. Si el tema tiene un `status.md` de track → leerlo antes de cualquier análisis
4. Solo después de completar los pasos anteriores, formular preguntas si persiste ambigüedad real

**Regla clave**: si el tema ya está documentado en algún archivo del dominio, la respuesta sale de ahí.
Abrir debate sobre algo ya documentado es ruido, no análisis.

## Señales de que se debe leer más antes de preguntar

- La pregunta que se va a formular tiene precedente obvio en el mismo dominio
- El schema o convención que se va a debatir tiene un archivo `schema.md` o `source-model.md` cercano
- La decisión que se va a plantear tiene forma de C-N o depende del cierre stage 0

## Jerarquía de lectura para trabajo documental

```
1. Docs/decisions/stage-0-architecture-decisions.md ← índice canónico C1-C41
2. Docs/domains/<dominio>/schema.md              ← contrato del dominio si existe
3. Docs/domains/<dominio>/source-model.md        ← modelo de fuentes
4. Docs/features/<track>/status.md               ← estado del track afectado
5. Docs/decisions/open-questions.md              ← puntos transversales abiertos
```

## Debate válido vs ruido

| Situación | Acción correcta |
|---|---|
| Tema ya documentado en el dominio | Citar el documento, no abrir debate |
| Tema con precedente en otro dominio (ej. ability schema) | Aplicar el precedente, documentar la analogía |
| Tema genuinamente nuevo sin precedente | Abrir debate con opciones numeradas |
| Decisión cerrada (C-N) que resurge | Citar la decisión, no re-debatir |

## Cuando el usuario responde "eso ya lo discutimos"

Antes de reformular o defender la pregunta:
1. Buscar la decisión en `Docs/decisions/stage-0-architecture-decisions.md`
2. Si se encuentra → citar la decisión y continuar desde ahí
3. Si no se encuentra → reconocer la pérdida de contexto y pedir al usuario que indique dónde está documentado

No repetir la pregunta. No asumir que es debate genuino si el usuario indica lo contrario.
