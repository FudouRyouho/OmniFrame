# Reglas de documentación — docs/

Aplica a todo trabajo en `docs/`. Estas reglas son bloqueantes.

## Pre-flight: antes de editar cualquier documento

1. **Frontmatter YAML obligatorio**, con excepciones:
   - `CLAUDE.md` (cualquier ubicación) — contrato meta-agente, no entra al régimen operativo/referencia.
   - `README.md` (cualquier ubicación) — índice de navegación, rol implícito.

   Todo otro `.md` en `docs/` debe comenzar con `---` y contener los campos:
   `Estado`, `Rol`, `Impacto_ID`, `Fidelidad_Fisica`, `Fecha_de_creacion`, `Fecha_de_actualizacion`
   Si falta → inyectarlo antes de continuar.

   **No hay campo `Version`** (retirado 2026-07-17). Un semver a mano no se gana el lugar: driftea en
   silencio (nada obliga a bumpearlo) y empuja a leer el doc como artefacto publicado — de ahí a
   escribirle un changelog hay un paso, y ya pasó. El indicio de cuánto se iteró un doc lo da git,
   exacto y gratis: `npm run validate:docs -- --iteraciones`. La señal de staleness es
   `Fecha_de_actualizacion`.

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
  - `docs/domains/source/` — las fuentes de datos **ajenas** (Public Export, `warframe-items`,
    cosecha wiki). Único dominio cuya capa física está fuera de `Project/`. Discriminador: si la
    oración describe la fuente ajena → `source/`; si describe nuestro JSON → `data/schemas/`; si
    describe la transformación → `data/pipeline/`.
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

4. **Hashes de commit: nunca en un doc vivo.** Un hash es procedencia pura, y la procedencia vive en git. No tiene la excepción de la fecha: un hash **no puede** ser tripwire de drift, porque nombra un punto muerto de la historia, no un estado a reconciliar. La afirmación se escribe en presente y sin él ("el modelo unificado de proc resuelve X", no "modelo unificado `6947eb1`"). Aplica a `Estado: activo` y `referencia`; `histórico` queda exento. Ejecutable: `npm run validate:docs` (check `hash-en-doc-vivo`).

5. **El delta se reescribe, no se agrega.** Si un doc afirma X y ahora vale Y, la oración se **reescribe** para decir Y. Está prohibido el paréntesis acumulativo ("`X (Actualización 2026-07-16: en realidad Y)`"): eso es un changelog plegado a nivel-oración — sobrevive a cualquier límite de tamaño y obliga al lector a reconstruir el estado actual leyendo el diario. Lo que se pierde al reescribir ya está en git, que es su hogar. Un doc es un **snapshot del presente + el horizonte futuro marcado**, nunca el camino recorrido.

   **Test de presente (aplicar ANTES de escribir cualquier oración de estado).** ¿La oración describe qué **ES** el sistema ahora, o qué **PASÓ** para llegar? Si nombra una **fase pasada** ("Fase 1b hizo…"), una **fecha-evento** ("cerrado el DD-MM"), o un **verbo en pasado ligado a un evento** (ejecutó / cerró / validó / eliminó / reemplazó / se agregó **el** DD-MM) → es camino recorrido → **git**. Se reescribe a presente (resuelve / consume / vive en X / no modela Y). La fecha solo sobrevive si es **tripwire de drift** (#3, con contraparte a reconciliar) o **auditoría fechada**; la fase solo sobrevive como **plan** (horizonte futuro), nunca como sello de "esto se hizo".

   **Violación heredada ≠ estilo de la casa.** Si el párrafo que vas a editar **ya** está escrito como changelog (fechas-log, sellos de fase, verbos de evento), eso es **drift a corregir en el mismo paso**, no un patrón a espejar. El corpus arrastra ~530 fechas-log acumuladas (deuda real, medida por el ratchet): son *la razón* por la que este error se auto-propaga sesión tras sesión — un doc escrito así te enseña el patrón equivocado y no salta alarma. **Nunca continúes el diario porque ya existe.** Ejecutable: `npm run validate:docs` — check `changelog-agudo` (ERROR sobre las formas nombradas: paréntesis-acumulativo + sello-de-fase-con-fecha) y `fecha-cuerpo-ratchet` (el conteo de fechas-log de un archivo **no puede subir** sobre su baseline; bajar es progreso, `--update-baseline` lo lockea).
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

## Frontera `open-questions.md` ↔ `closed-decisions.md`

`open-questions.md` contiene **solo lo vivo** — abierto / gated / condicional a algo pendiente.
`closed-decisions.md` es el **registro de lo cerrado** (con su condición de reapertura y su residual
angosto). Son dos archivos, no dos copias.

- **Cierre genuino → mover entero a DC + borrar de OQ** (cuerpo *y* fila del índice). **No dejar
  lápidas** (`"cerrada → closed-decisions.md"`) en OQ: inflan el archivo con registro que ya es
  competencia de DC. Git tiene la historia; DC tiene la sentencia. Al mover, **re-apuntar las citas
  entrantes** de `OQ-X` a `DC-OQ-X`. Ejecutable: `npm run validate:docs` — check `cita-oq-cerrada`
  (WARN sobre `docs/` **y** `Project/src/`). Una cita a `OQ-X` presenta la pregunta como **viva**, y
  quien la busca en OQ no la encuentra — o hereda un pendiente que ya se decidió. **Seis exenciones**,
  todas por casos donde citar `OQ-X` es correcto: `closed-decisions.md` (cita su propio origen),
  `Estado: histórico`, la oración que ya declara el cierre, metadata/plantillas, marca de resuelto
  (`✅`/`[x]`), y bloques de código. ⚠️ **Que la cita apunte bien no valida lo que afirma:** el check
  ve el puntero, no si el acta sostiene lo que se le atribuye.
- **Antes de cerrar, verificar que no haya consumidor vivo:** un test rojo (`it.fails`/`it.todo` que
  cita la OQ), una cita `SIGUE ABIERTO` en otro doc, o un gate-por-consumidor con residuo real. Si lo
  hay, **no es cierre genuino** → la OQ se queda. Un re-scope que descarta *un* camino no cierra la OQ
  si otro eje sigue vivo.

## Frontera `open-questions.md` ↔ GitHub Issues

`open-questions.md` se angosta a **exclusivamente** debate de arquitectura/diseño — algo que todavía
no se decidió cómo debe funcionar. Un ítem que ya sabe **qué** hacer y sólo falta ejecutarlo no es
una OQ, es un Issue.

La destilación **no es un barrido programado** — se aplica cada vez que se toca una OQ por otro
motivo (ej. auditando `it.todo`/JSDoc que la citan). El test: *¿esta OQ es una decisión de diseño
pendiente, o ya se sabe qué construir?* Si es lo segundo, se destila.

- **No es cierre genuino** (no va a `closed-decisions.md` — nada se decidió). Es reclasificación:
  mover entero a un Issue de GitHub + borrar de OQ (cuerpo y fila del índice) — mismo criterio de
  "no dejar lápidas" que rige para DC.
- **Re-apuntar las citas entrantes.** Código que cita `OQ-X` (en `it.todo`, comentarios) se actualiza
  o se limpia — no queda apuntando a una entrada que ya no existe en OQ.
- **Antes de destilar, verificar que no haya consumidor vivo** que dependa de la OQ como debate
  abierto (mismo chequeo que ya rige para cierre genuino).

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
