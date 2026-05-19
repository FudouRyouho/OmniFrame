# Reglas de documentación — docs/

Aplica a todo trabajo en `docs/`. Estas reglas son bloqueantes.

## Pre-flight: antes de editar cualquier documento

1. **Frontmatter YAML obligatorio.** Todo archivo `.md` en `docs/` debe comenzar con `---` y contener los campos:
   `Estado`, `Rol`, `Version`, `Impacto_ID`, `Fidelidad_Fisica`, `Fecha_de_creacion`, `Fecha_de_actualizacion`
   Si falta → inyectarlo antes de continuar.

2. **Fidelidad física.** El campo `Fidelidad_Fisica` debe apuntar a una ruta que exista en el repo.
   Si la ruta no existe → marcar el documento como `[OBSOLETO]` y no editarlo sin autorización.

3. **Links relativos.** Todos los links internos deben ser rutas relativas.
   Si hay links absolutos → convertirlos antes de continuar.

## Jerarquía de lectura antes de formular preguntas o abrir debate

```
1. docs/decisions/stage-0-architecture-decisions.md  ← índice canónico de decisiones C1-Cn
2. docs/domains/<dominio>/schema.md                  ← contrato del dominio
3. docs/domains/<dominio>/source-model.md            ← modelo de fuentes
4. docs/domains/<dominio>/status.md                  ← estado del track afectado
5. docs/governance/open-questions.md                 ← puntos transversales abiertos
```

Si el tema ya está documentado en algún archivo del dominio → la respuesta sale de ahí.
Abrir debate sobre algo ya documentado es ruido, no análisis.

## Post-flight: después de cambios de arquitectura o contratos

Si el cambio afecta arquitectura o contratos, en la misma sesión:
- Actualizar `docs/overview/impact-matrix.md`
- Actualizar `docs/governance/current-state.md`

No postergarlo.

## Debate válido vs ruido

| Situación | Acción correcta |
|---|---|
| Tema documentado en el dominio | Citar el documento, no abrir debate |
| Tema con precedente en otro dominio | Aplicar el precedente, documentar la analogía |
| Decisión cerrada (C-N) que resurge | Citar la decisión, no re-debatir |
| Tema genuinamente nuevo sin precedente | Abrir debate con opciones numeradas |

## Si el usuario dice "eso ya lo discutimos"

1. Buscar en `docs/decisions/stage-0-architecture-decisions.md`
2. Si existe → citar la decisión y continuar desde ahí
3. Si no existe → pedir al usuario que indique dónde está documentado

No repetir la pregunta. No defender la posición anterior.
