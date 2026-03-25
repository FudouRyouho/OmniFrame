# Documentation Policy

> Estado: activo
> Rol: definir el patron editorial y el ciclo de mantenimiento de la documentacion
> Fuente de verdad de: reglas de escritura, ubicacion y actualizacion
> No usar para: contenido tecnico de una feature concreta
> Ultima actualizacion: 2026-03-25

## Principio rector

Cada documento debe responder una sola pregunta.

Si un archivo mezcla:
- arquitectura
- analisis de fuente
- estado operativo
- backlog
- decisiones abiertas

entonces hay que dividirlo antes de seguir ampliandolo.

## Taxonomia

| Carpeta | Uso correcto |
|---|---|
| `overview/` | mapa del proyecto, goals, orden de lectura |
| `domains/` | conocimiento estable por responsabilidad |
| `features/` | trabajo vivo por track |
| `decisions/` | decisiones y preguntas cross-cutting |
| `reference/` | auditorias, evidencia, mecanicas del juego |

## Encabezado obligatorio

Todo documento activo debe incluir:

```md
> Estado: activo | referencia | temporal
> Rol: ...
> Fuente de verdad de: ...
> No usar para: ...
> Depende de: ...
> Ultima actualizacion: YYYY-MM-DD
```

## Workflow obligatorio

El ciclo de trabajo del proyecto es:

```text
Analisis -> Pre-documentacion -> Debate -> Implementacion/Decision -> Documentacion Real
```

Reglas:
- no cerrar una tarea de arquitectura o schema sin actualizar `Docs/`
- no crear markdown improvisados fuera de esta taxonomia
- si una pregunta cambia el rumbo de varias areas, moverla a `decisions/`
- no saltar fases: cada fase es checkpoint explicito antes de avanzar

## Reglas posteriores al corte documental

- `Docs/` es la unica ruta activa de documentacion del proyecto
- mantener documentos pequenos, trazables y con una sola pregunta por archivo
- registrar cambios de estado por track en su `status.md` al cerrar implementaciones
- registrar decisiones transversales en `decisions/open-questions.md` o `decisions/`

## Regla para referencias de la wiki

Las mecanicas del juego que el engine necesite modelar van en:
- `reference/wiki/mechanics/`

No deben mezclarse con:
- backlog del proyecto
- arquitectura de React
- decisiones de UI
