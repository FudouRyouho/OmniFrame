# Reglas de Agente — OmniFrame

Reglas globales del proyecto. Las específicas de cada carpeta viven en su propio `AGENTS.md`; el
índice de abajo dice cuándo leerlas.

## Índice de reglas por carpeta

**Antes de trabajar en una de estas carpetas, LEER su archivo de reglas.** El harness sólo carga el
`AGENTS.md` del directorio actual y de sus padres, no los de las subcarpetas: si no se lee a mano,
las reglas no se aplican.

| Contexto | Leer antes de actuar |
|---|---|
| Archivos en `docs/` o cualquier `.md` | `docs/AGENTS.md` |
| Archivos en `Project/src/` o `Project/scripts/` | `Project/AGENTS.md` |
| Archivos en `references/` | `references/AGENTS.md` |
| Dudoso | Preguntar antes de actuar |

## Convención de idioma

Documentación, commits, comentarios e issues van **en español**. Los commits siguen Conventional
Commits con el asunto en prosa española que cuenta el porqué, por ejemplo
`docs(engine): siete afirmaciones nombraban una brecha que el refactor cerró`.

## Flujo de trabajo

**GitHub Issues es el backlog: "qué hacer".** El cuerpo del issue es donde vive el razonamiento
completo. `open-questions.md` es debate de arquitectura — ver `docs/AGENTS.md` §Frontera
`open-questions.md` ↔ GitHub Issues.

**La ejecución de una feature se sigue en `odd/tasks/<feature>.md`**, que referencia su issue `#N`. `odd/` es local (gitignored) y se espeja en Engram: no se commitea.

**Flujo:** rama por feature desde `master` → commits por unidad de trabajo → PR con `Closes #N` en la
descripción → merge commit (nunca squash: los commits llevan razonamiento) → borrar rama.

**Labels:** `bug`, `enhancement`, `documentation` (default de GitHub) + `deuda-tecnica` (residuo,
decisión ya tomada sin documentar) + `data-gap` (hueco o inconsistencia de dato).

**`it.todo` no es tracker de "qué hacer" — Issues sí.** Para trabajo nuevo, el Issue nace primero,
con el razonamiento completo. El `it.todo` (si existe) es sólo el marcador técnico de que falta un
test: se recorta a lo mínimo + una cita `— #N`, sin duplicar la razón que vive en GitHub. Al cerrar el
issue, el `it.todo` se vuelve test real y el marcador desaparece con él.

## Qué exige detenerse y preguntar

Detenerse, presentar opciones y esperar autorización explícita antes de tocar:

- **Contratos core** (tipos y modelos compartidos).
- **Arquitectura** (capas, fronteras entre dominios, estructura de datos de ítem).
- **Docs SSoT** (`docs/` como fuente de verdad).

El resto (lógica de dominio, formato, metadata, lint) se ejecuta y se reporta qué cambió.

## Entorno

- **Workspace pnpm:** instalar desde la raíz con `pnpm install --frozen-lockfile` y la versión fijada en `package.json`. `Project/` y `omniframe-items/` comparten el lock; `warframe-items/` queda fuera del workspace y la cosecha usa el clon local en el host.
- Line endings: estrictamente LF.
- **Docker corre la app y los tests; el host corre el tooling.** La regla existe para no instalar
  *dependencias* en el host, no para prohibir ejecutar ahí. El compose monta sólo `./Project`, así que
  la imagen incluye ambos paquetes y sólo la referencia puntual de la suite. Los comandos que necesitan el corpus completo (`validate:docs`, `references-layout.mjs`) se corren en el host.

## Documentos de referencia

- **`README.md` (raíz)** es el README público de GitHub — changelog simple, una entrada por versión, sin detalle técnico profundo. `Project/README.md` es sólo un orientador interno.
- **SSoT de decisiones abiertas:** `docs/governance/open-questions.md` — consultar ante cualquier cambio de arquitectura.

## Memoria

El conocimiento del proyecto vive en Engram (proyecto `omniframe`) y cita los docs vivos; no se
guarda en archivos.

## Verificación — los comandos, y por qué estos

Se corren desde `Project/`, salvo el de layout. **Un comando que no se corre no verifica, y uno que
reporta verde sin mirar es peor que no correrlo**: por eso cada uno lleva acá su alcance real.

| Comando | Qué verifica | Gate |
|---|---|---|
| `pnpm test` | la suite. `expected fail` y `todo` son gates abiertos **a propósito** — no son fallas | ✅ binario |
| `pnpm exec tsc -b --noEmit` | tipos de los **tres** proyectos (app · node · scripts) | ✅ binario |
| `pnpm run validate:docs` | frontmatter, links, `@SSoT`, hashes, citas a OQ cerrada, tamaño de dominio | ✅ binario |
| `node Project/scripts/references-layout.mjs` | layout de `references/wiki/`, raw hermano, marcas, fechas | ✅ binario |
| `pnpm run audit:data` | integridad de los datasets — sólo si se tocó `public/data/` | ✅ binario |
| `pnpm exec eslint .` | lint | ⚠️ **no binario** — hay errores preexistentes en la UI (`no-explicit-any`). Se compara **contra baseline**, no contra cero |

🔴 **`pnpm exec tsc --noEmit` sin `-b` NO VERIFICA NADA.** `tsconfig.json` es solution-style (`"files": []`
\+ `references`), así que sin build-mode tsc no compila un solo archivo y **sale limpio siempre**.
Comprobado inyectando `const x: number = "no soy un número"` en `@core`: silencio total, y
`tsc -b --noEmit` lo reporta. Si un protocolo o un doc vuelve a nombrar la forma sin `-b`, es un
error, no una variante.

⚠️ **`pnpm run check` (`tsc -b --noEmit && eslint .`) sale `exit=1` siempre** por la deuda de lint de
arriba, así que **no sirve como gate binario** — usar los comandos por separado.

## Cuando hay drift (doc vs código)

- ¿Afecta la tarea actual? → Detenerse y preguntar, sin importar el scope.
- ¿No afecta? → Registrar `⚠️ deuda` y continuar.

Al debatir, citar el doc o contrato en conflicto.

## Reglas duras

- Nunca eliminar anchors: `[vX.X.X]`, corchetes de control, IDs únicos.
- Orden de prioridad: `reduce_chaos → close_drift → traceability → write_code`
