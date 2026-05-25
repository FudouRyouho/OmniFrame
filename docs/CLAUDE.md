# Reglas de documentación — docs/

Aplica a todo trabajo en `docs/`. Estas reglas son bloqueantes.

## Pre-flight: antes de editar cualquier documento

1. **Frontmatter YAML obligatorio**, con excepciones:
   - `CLAUDE.md` (cualquier ubicación) — contrato meta-agente, no entra al régimen operativo/referencia.
   - `README.md` (cualquier ubicación) — índice de navegación, rol implícito.

   Todo otro `.md` en `docs/` debe comenzar con `---` y contener los campos:
   `Estado`, `Rol`, `Version`, `Impacto_ID`, `Fidelidad_Fisica`, `Fecha_de_creacion`, `Fecha_de_actualizacion`
   Si falta → inyectarlo antes de continuar.

2. **Fidelidad física.** El campo `Fidelidad_Fisica` debe apuntar a una ruta que exista en el repo.
   Si la ruta no existe → marcar el documento como `[OBSOLETO]` y no editarlo sin autorización.

3. **Links relativos.** Todos los links internos deben ser rutas relativas.
   Si hay links absolutos → convertirlos antes de continuar.

## Estructura del corpus

`docs/` separa dos categorías:

- **Fundación SSoT transversal** — consumida por todos los dominios funcionales:
  - `docs/data/` — SSoT de datos (status, decisions, rules/, schemas/, pipeline/, references/)
  - `docs/semantic/` — vocabulario canónico (damage-types, factions, polarity)
- **Dominios funcionales** — comportamiento por capa:
  - `docs/domains/engine/` (incluye `engine/design/` con el blueprint del motor)
  - `docs/domains/integration/`
  - `docs/domains/ui-ux/`
- **Meta** — reglas, estado, decisiones, debates:
  - `docs/governance/`, `docs/decisions/`, `docs/overview/`

## Jerarquía de lectura antes de formular preguntas o abrir debate

**Inicio obligatorio (≤ 2 lecturas):**

```
1. docs/governance/open-questions.md       ← preguntas transversales abiertas
2. Una de:
   - docs/data/status.md                    ← si se va a tocar datos/schemas/pipeline
   - docs/domains/<dominio>/status.md       ← si se va a tocar un dominio funcional
```

Si el `status.md` no responde la pregunta, continuar con:

```
3. docs/data/schemas/<tipo>/schema.md       ← contrato del tipo de dato afectado
4. docs/data/decisions.md                   ← decisiones D-series del dominio data
5. docs/governance/decision-frontier.md     ← fronteras arquitectónicas vigentes
```

Si el tema ya está documentado en algún archivo del dominio → la respuesta sale de ahí.
Abrir debate sobre algo ya documentado es ruido, no análisis.

## Convenio de tamaño

### Dominios funcionales (`docs/domains/<X>/`)

Máximo **3 archivos operativos** por dominio. Convención: `status.md` + `schema.md` + `workflow.md`.
El resto son **archivos de referencia** (`Estado: "referencia"`) — se consultan bajo demanda,
no son lectura obligatoria al inicio de sesión.

Al añadir un nuevo archivo a un dominio funcional: si ya existen 3 operativos, el nuevo es referencia
por defecto, o uno de los existentes baja a referencia.

### SSoT transversal (`docs/data/`, `docs/semantic/`)

`data/` y `semantic/` NO son dominios funcionales. Sus subdirectorios (`schemas/`, `rules/`, etc.)
NO son sub-dominios: son **contratos bajo un mismo flujo**, organización por tipo de dato.

Convenio:
- `data/status.md` — único status global del flujo de datos
- `data/<categoría>/<archivo>.md` — schemas, rules, references por tipo (sin replicar `status` por subdir)
- `semantic/<archivo>.md` — vocabulario canónico, todos `referencia` por naturaleza

## Regla de evolución de decisiones de dominio (D-series)

Las decisiones D-N en `docs/data/decisions.md` tienen dos estados:

- **VIGENTE** — puede evolucionar con nueva evidencia. No requiere halt ni debate formal.
  Acción: actualizar la entrada en `decisions.md`, documentar el motivo.
  Impacto base: GREEN. Escala si el cambio llega más arriba:
  - Afecta un contrato TypeScript → YELLOW (confirmar antes de editar el tipo)
  - Afecta arquitectura de capas → RED (halt + debate)

- **DEFINITIVA** — invariante del sistema. Mismo protocolo que RED: halt + debate + autorización.
  Se declara DEFINITIVA explícitamente en `decisions.md`. Por defecto, las D-series son VIGENTES.

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
| Decisión cerrada en governance que resurge | Citar la decisión, no re-debatir |
| Decisión D-series VIGENTE que necesita evolucionar | Actualizar `docs/data/decisions.md` con la nueva evidencia. Impacto GREEN si solo afecta schema/data. |
| Tema genuinamente nuevo sin precedente | Abrir debate con opciones numeradas |

## Si el usuario dice "eso ya lo discutimos"

1. Buscar en `docs/governance/closed-decisions.md` y `docs/governance/decision-frontier.md`
2. Si existe → citar la decisión y continuar desde ahí
3. Si no existe → pedir al usuario que indique dónde está documentado

No repetir la pregunta. No defender la posición anterior.
