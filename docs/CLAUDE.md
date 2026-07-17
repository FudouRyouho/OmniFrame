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
  - `docs/semantic/` — vocabulario canónico (damage-types, factions, polarity, conditions, upgrade-tokens)
- **Dominios funcionales** — comportamiento por capa:
  - `docs/domains/engine/` (incluye `engine/design/` con el blueprint del motor)
  - `docs/domains/integration/`
  - `docs/domains/ui-ux/`
- **Meta** — reglas, estado, decisiones, debates:
  - `docs/governance/`, `docs/decisions/`

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

Al promover un worklist/sweep de clasificación (ej. `.working/*-sweep.md`, tabla ítem-por-ítem): las
decisiones destilan a `arch-decisions.md`, los problemas a `open-questions.md`. El **residuo-tabla
crudo** (consulta bajo demanda, no lectura obligatoria) baja a tier `referencia` — precedente:
`docs/data/reports/audit-*.md`.

### SSoT transversal (`docs/data/`, `docs/semantic/`)

`data/` y `semantic/` NO son dominios funcionales. Sus subdirectorios (`schemas/`, `rules/`, etc.)
NO son sub-dominios: son **contratos bajo un mismo flujo**, organización por tipo de dato.

**Regla de enrutamiento semantic vs data vs lenguaje de dominio:**
- `docs/semantic/` — vocabulario y taxonomía: qué SIGNIFICA un token o concepto del juego. Consumido por todos los dominios por igual. Ejemplos: tipos de daño, facciones, condition tokens, upgrade tokens.
- `docs/data/schemas/` — contratos de formato JSON: cómo se ESTRUCTURA el dato en los overrides. El schema describe el shape del archivo; la semántica de sus valores vive en `semantic/`.
- `docs/domains/<dominio>/design/` — el **lenguaje interno del dominio**: el vocabulario de su arquitectura, NO del juego. No se **deriva** de una taxonomía declarada (a diferencia de un token `{WEAPON,WARFRAME}_{ADD,MULT}_…`, que se compone desde un cuerpo) — *es* el idioma con el que el dominio se piensa. Ejemplo: `domains/engine/design/vocabulary.md` (node / bucket / pool / instancia).

Si un documento define qué significa algo **del juego** → `docs/semantic/`.
Si un documento define cómo escribirlo en un JSON → `docs/data/schemas/`.
Si un documento define **cómo habla un dominio de sí mismo** → `docs/domains/<dominio>/design/`.

Convenio:
- `data/status.md` — único status global del flujo de datos
- `data/<categoría>/<archivo>.md` — schemas, rules, references por tipo (sin replicar `status` por subdir)
- `semantic/<archivo>.md` — vocabulario canónico, todos `referencia` por naturaleza

## Ruteo de contenido — dónde vive cada cosa

`docs/` contiene el **estado verdadero actual + preguntas abiertas**, no el diario de cómo llegamos. Antes de escribir una oración en un doc, rutearla. Discriminador **a nivel-oración**: ¿afirma una verdad presente del sistema, narra historia superada, o es racional personal "por qué NO se hace así"?

| Naturaleza de la oración | Ejemplo | Hogar |
|---|---|---|
| **Verdad de dominio viva** | "warframe-items trae `armor_type`; no es mecánica real, `enemy.json` no lo modela" | **`docs/`** |
| **Historia superada, sin valor de razonamiento** | engine v1, impl purgada por delegar a un primitivo/genérico | **git** (no se escribe en docs) |
| **Racional personal "por qué NO"** | arquitecturas muertas, decisiones de diseño ya no legítimas | **`docs-archive/`** (local, gitignored, curado por el usuario) |

**Reglas duras:**

1. **Warrant pegado a la nota viva.** Un doc activo **nunca** es la única copia de un warrant del que depende una nota viva. Si "no modelamos X" necesita su "por qué" para no confundir a un agente, el por-qué **comprimido y en presente** se queda con la nota. La historia larga puede ir a `docs-archive/`.
2. **El agente no decide solo sobre `docs-archive/`.** No escribe ahí por inferencia. **Puede proponer** (preguntar sin inferir, esperando confirmación) guardar algo en `docs-archive/` **o descartarlo por completo**; la elección es del usuario. (Comportamiento del agente: `.claude/CLAUDE.md`.)
3. **Fechas inline: tripwire de drift, no log.** Una fecha se gana el lugar **solo si tiene contraparte a reconciliar** (decisión-`fecha-A` ↔ código/decisión-`fecha-B` que debería reflejarla). Timestamp solitario ("`2026-07-09: actualicé §3`") = log → git. Convive con la excepción ya vigente de **auditorías fechadas** (warrant legítimo).
4. **Gap del data-set = propuesta con cierre.** Cuando un dato existe upstream (`references/*`, fuente) que el proyecto **deliberadamente no modela**, el agente **puede proponer** dejar una nota de gap en `docs/` ("esto es un gap; no lo modelamos porque…") — evita que un agente futuro asuma que es conectable. La propuesta se **resuelve por confirmación y se cierra en la misma sesión**: se escribe, o se descarta explícito. **Un punto debatido sin cierre es deuda, no decisión.**

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
