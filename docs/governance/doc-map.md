---
Estado: "activo"
Rol: "Mapa de durabilidad del corpus docs/ + criterio de archivado + registro de la campaña de saneamiento"
Impacto_ID: "G-DocMap"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-06-06"
Fecha_de_actualizacion: "2026-07-24"
---

# Doc Map — durabilidad del corpus y saneamiento

Este doc fija **cómo se clasifica y se reduce** el corpus de `docs/`, y registra la campaña de
saneamiento. Nace de un problema real: el corpus mezclaba SSoT durable con artefacto histórico,
sin un criterio explícito de qué es reducible. Precedente del patrón: la consolidación de
`punch_through` (un concepto → un hogar; lo derivado se purga, procedencia en git).

---

## 1. Tiers de durabilidad

| Tier | Qué es | Acción por defecto |
|---|---|---|
| **SSoT-vivo** | Contrato/estado que el proyecto consume hoy: `schemas/*/schema.md`, `semantic/` (vocab), `data/status.md`, `data/decisions.md` (VIGENTE), `governance/open-questions.md`, `rules/`, contratos de `engine/` | No se archiva. Evoluciona. |
| **SSoT-referencia** | Vocabulario/captura consultable bajo demanda (`Estado: referencia`) | Se mantiene; lectura no obligatoria |
| **Histórico-archivable** | Sin base operativa **y sin citas activas** | → `docs-archive/` (ver §2) |
| **Índice/navegación** | `README.md`, `governance/current-state.md` | Refrescar contra la realidad; nunca archivar |

---

## 2. Criterio de archivado (regla dura)

**Un doc es archivable ⟺ ningún documento activo lo cita.**

Si un doc supuestamente histórico **necesita ser citado** por documentación activa, entonces **no es
histórico** — y esa cita es **drift de conceptos** a resolver, no una excusa para archivar con links.
La cita-entrante es la señal mecánica y objetiva de *base operativa*; es más fiable que el label o la
fecha del doc.

- **Verificación previa:** `grep -rln "<basename>" docs --include=*.md`. Solo 0 citas → archivable.
- **Destino:** `docs-archive/` (raíz del repo, **gitignored**, no trackeado). Archivar = sacar del
  repo trackeado + copia física ahí. Procedencia en git history.
- **No archivar a ciegas por directorio/fecha.** Verificar el *contenido*: en la campaña, 5 de 6
  candidatos "históricos" resultaron vivos al leerlos.

---

## 2.1. Disciplina de cierre de campaña (regla dura)

Una campaña **EN CURSO** puede escribir su propia sección narrativa acá (progreso, decisiones,
pendientes) — es el registro vivo mientras dura. Pero **al cerrarla, en la misma
sesión de cierre**, esa sección se comprime: reglas durables migran a su doc natural (schema, status,
rules, README del dominio), y lo que queda es un párrafo-resumen + punteros a los commits. Ninguna
sección de campaña queda en formato "log detallado por tanda" una vez marcada COMPLETA — eso es lo que
generó la necesidad de esta misma limpieza (§3–§5, §7 comprimidas; ver
`references/wiki/README.md` como ejemplo de destino para una regla rescatada).

**Why:** sin este paso, el doc vuelve a acumular indefinidamente y nadie lo revisa fuera de una sesión
dedicada a "sanear docs" (evidencia: 5 commits/14 docs tocados en una semana de trabajo real, 0 tocaron
`doc-map.md`). Comprimir en el momento del cierre es barato; comprimir después es una campaña aparte.

---

## 3. Registro de la campaña — reducción de caos (COMPLETA)

Foco en reducir caos del corpus. A — `Project/data` eliminado (1.9 MB huérfano/regenerable). Históricos
lote 1 — `multishot-profiles.md` → `docs-archive/historical/`. B — dispersión: `naming-conventions.md` ↔
`nomenclature-grammar.md` no eran duplicados, desambiguados con cross-link (la dispersión cross-doc
literal casi no existe; el bloat reducible es cualitativo intra-doc, atendido en §7). C — contraste
docs↔código engine: colisión `OQ-ENGINE-3` → renumerada `OQ-ENGINE-7`.

---

## 4. Contraste docs↔código — dominio engine (COMPLETA)

Resultado vigente: `engine/status.md` es el estado vivo (reescrito completo, drift severo
pre-reestructura). `engine-audit.md` es snapshot histórico congelado (banner propio, `Estado: histórico`).
El cluster `engine/design/` (blueprint pre-implementación) trae su propio estado de sincronización y
apunta los gaps de diseño no implementado — ver [`engine/design/README.md`](../domains/engine/design/README.md).
Detalle de la reconciliación en commits de la rama `refactor/core-stage0-restructure` (§7).

---

## 5. Saneamiento de `references/wiki/` (COMPLETA)

Hallazgo: `references/wiki/` tenía contaminación sistémica de vocablo del proyecto (18/18 docs raíz +
8 híbridos mal ubicados en `docs/data/references/wiki/`). Campaña completa: ~26 docs saneados a wiki
pura, `damage-reduction.md` fusionado, subárbol `docs/data/references/wiki/` eliminado, punteros
actualizados, suite verde. Commit range en la rama de la época.

**Regla durable** (contaminación de vocablo, wiki pura) migrada a
[`references/wiki/README.md`](../../references/wiki/README.md) — ya no vive acá.

**Pendiente menor — CERRADO:** la porción wiki-pura (roll per-pellet, fórmula de procs) ya
estaba capturada en `references/wiki/mechanics/status-effects.md` §Aplicación (barrido, no
en archivo separado). Al verificar se encontró drift real: `status-chance-mechanics.md` afirmaba un
mecanismo ">100% garantiza 1 + priorización por daño" que la wiki no confirma — corregido contra fuente.

---

## 6. Campaña de documentación de UI (grueso COMPLETO — residuo diferido)

La UI nunca tuvo corpus de docs/auditoría como sí lo tuvieron `data/`/engine, y esa pausa **generó
el drift** (islas de datos, providers anclados, dead-code, tareas "parciales" completas). La campaña
la corrió por el mismo loop que recibió la data —**audita código↔docs por dominio** (a diferencia de
§3–5, mecánicas sobre el corpus existente)— y **produjo el corpus que faltaba**: el trío operativo
[`ui-ux/status.md`](../domains/ui-ux/status.md) + [`workflow.md`](../domains/ui-ux/workflow.md) (loop
Recon→Triage→Document, checkpoints C0/C1/traceability) + [`decisions.md`](../domains/ui-ux/decisions.md)
(serie **U-N** propia: `U-1` espina DOMINIO+2-ejes, `U-2` construir=fuera del mandato, `U-3` 3-ejes
`SLOT_DEFINITIONS`, `U-4` honestidad UI), más `OQ-ENGINE-11` (exaltadas) y `current-state` §2 (M1
reencuadrado, multi-config). Detalle por barrido en git (rama de la época).

**Horizonte vivo (por qué no cierra del todo):** residuo at-touch = re-apuntar `@SSoT` mispointers a
`status.md` al tocar cada archivo. Aparte y **gateado** por `U-2` (construir = fuera del mandato): los
refactors capturados en el worklist del construer `.working/consolidation-map.md` (local, gitignored)
—E1 dedup de filtros, E4 hooks a `@shared`, hook de hidratación compartido, cablear ability-popover,
des-fusionar `SLOT_DEFINITIONS`— y el prototipo de exaltadas (`OQ-ENGINE-11`).

---

## 7. Campaña de revisión de `docs/` (COMPLETA)

Paso previo al merge de `refactor/core-stage0-restructure` a `master`: saneamiento (mecánico + honestidad)
del corpus completo, no re-evaluación de arquitectura (esa queda para sesión aparte post-merge). Atacó el
bloat cualitativo intra-doc identificado en §3 foco B. Hallazgo central: el bloat era **acreción-de-log**,
no edad — docs viejos bien formados estaban limpios, el ruido vivía en los acretados (`current-state.md`,
`open-questions.md`).

Corpus completo (90 docs) pasado por Tandas 0–3 + pasada de drift: pre-flight mecánico sano (1 fix CRLF),
núcleo de lectura obligatoria podado (`current-state.md` −31%, `open-questions.md` podado, `decisions.md`
D-7 comprimido), drift cerrado contra código real (`engine/status.md` reescrito completo, `decision-frontier.md`,
`integration/README.md`), contratos SSoT-vivo saneados (`engine-audit.md` congelado, `transition-residues.md`
archivado, cluster `engine/design/` 7 docs traído al presente), tier referencia/reports confirmado limpio
(nada archivable, todo con ≥1 cita).

El detalle por tanda (versiones bumpeadas, líneas exactas) vive en git. Tracker efímero
`.working/docs-review-pass.md` descartado al cerrar la campaña.
