---
Estado: "activo"
Rol: "Mapa de durabilidad del corpus docs/ + criterio de archivado + registro de la campaña de saneamiento"
Impacto_ID: "G-DocMap"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-06-06"
Fecha_de_actualizacion: "2026-07-09"
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
pendientes) — es el registro vivo mientras dura, igual que §6 hoy. Pero **al cerrarla, en la misma
sesión de cierre**, esa sección se comprime: reglas durables migran a su doc natural (schema, status,
rules, README del dominio), y lo que queda es un párrafo-resumen + punteros a los commits. Ninguna
sección de campaña queda en formato "log detallado por tanda" una vez marcada COMPLETA — eso es lo que
generó la necesidad de esta misma limpieza en 2026-07-09 (§3–§5, §7 comprimidas ese día; ver
`references/wiki/README.md` como ejemplo de destino para una regla rescatada).

**Why:** sin este paso, el doc vuelve a acumular indefinidamente y nadie lo revisa fuera de una sesión
dedicada a "sanear docs" (evidencia: 5 commits/14 docs tocados en una semana de trabajo real, 0 tocaron
`doc-map.md`). Comprimir en el momento del cierre es barato; comprimir después es una campaña aparte.

---

## 3. Registro de la campaña — 2026-06-06 (COMPLETA)

Foco en reducir caos del corpus. A — `Project/data` eliminado (1.9 MB huérfano/regenerable). Históricos
lote 1 — `multishot-profiles.md` → `docs-archive/historical/`. B — dispersión: `naming-conventions.md` ↔
`nomenclature-grammar.md` no eran duplicados, desambiguados con cross-link (la dispersión cross-doc
literal casi no existe; el bloat reducible es cualitativo intra-doc, atendido en §7). C — contraste
docs↔código engine: colisión `OQ-ENGINE-3` → renumerada `OQ-ENGINE-7`.

---

## 4. Contraste docs↔código — dominio engine (2026-07-03, COMPLETA)

Resultado vigente: `engine/status.md` es el estado vivo (reescrito completo, drift severo
pre-reestructura). `engine-audit.md` es snapshot histórico congelado (banner propio, `Estado: histórico`).
El cluster `engine/design/` (blueprint pre-implementación) trae su propio estado de sincronización y
apunta los gaps de diseño no implementado — ver [`engine/design/README.md`](../domains/engine/design/README.md).
Detalle de la reconciliación en commits de la rama `refactor/core-stage0-restructure` (§7).

---

## 5. Saneamiento de `references/wiki/` (2026-06-10, COMPLETA)

Hallazgo: `references/wiki/` tenía contaminación sistémica de vocablo del proyecto (18/18 docs raíz +
8 híbridos mal ubicados en `docs/data/references/wiki/`). Campaña completa: ~26 docs saneados a wiki
pura, `damage-reduction.md` fusionado, subárbol `docs/data/references/wiki/` eliminado, punteros
actualizados, suite verde. Commit range en la rama de la época.

**Regla durable** (contaminación de vocablo, wiki pura) migrada a
[`references/wiki/README.md`](../../references/wiki/README.md) — ya no vive acá.

**Pendiente menor — CERRADO 2026-07-09:** la porción wiki-pura (roll per-pellet, fórmula de procs) ya
estaba capturada en `references/wiki/mechanics/status-effects.md` §Aplicación (barrido 2026-07-02, no
en archivo separado). Al verificar se encontró drift real: `status-chance-mechanics.md` afirmaba un
mecanismo ">100% garantiza 1 + priorización por daño" que la wiki no confirma — corregido contra fuente.

---

## 6. Campaña de documentación de UI (2026-06-14 – 2026-06-16, grueso COMPLETO — residuo diferido)

**Origen:** la UI nunca tuvo su corpus de docs/auditoría como sí lo tuvieron `data/`/engine
(asimetría: `docs/semantic/` pesa más que **todo** `docs/domains/ui-ux/`; de los 6 docs ui-ux,
4 estaban stale 2 meses, sin `status.md`/`decisions.md`/`workflow.md` ni mecanismo de auditoría).
Esa pausa de docs **generó el drift** (islas de datos, providers anclados, toolbars con state
desacoplado, dead-code, tareas "parciales" completas). La campaña corre la UI por el mismo loop
de auditoría que recibió la data. Hallazgo de fondo destapado en Pre-E (2026-06-14).

**Espina (decidida en Stage 0):** **DOMINIO + 2 ejes ortogonales como lente** — ver
[`../domains/ui-ux/decisions.md`](../domains/ui-ux/decisions.md) `U-1`. Rechazadas PROVIDER
(un solo eje) y VIEW (loop + consagra stub).

**Flujo (durable):** [`../domains/ui-ux/workflow.md`](../domains/ui-ux/workflow.md) — loop por
dominio Recon→Triage→Document, checkpoints C0 (ESTABLE vs STUB) / C1 (RED gate) / traceability.
Construir = **fuera del mandato** (`U-2`). Ledger de decisiones = serie **U-N** propia, espejo
de la D-series.

**Diferencia con la campaña de saneamiento (§3–5):** aquélla fue mecánica/contraste sobre el
corpus existente; ésta **audita código↔docs por dominio** y produce el corpus que faltaba.

| Stage | Resultado | Estado |
|---|---|---|
| **Stage 0 — establecer el flujo (DEBATE, sin leer código)** | Espina fijada (`U-1`), trío operativo mandado (`U-2`), `workflow.md` + `decisions.md` creados, serie U-N nacida, hogar split (flujo→workflow.md, registro→aquí). | ✅ |
| **6 barridos por dominio** (arsenal/equipment/hud/menu-shell/profile/shared + concern-bucket *filtros*) | Inventario completo (`.working/ui-audit.md`); cleanups dead-code-0-consumidor ejecutados (`configSlot`, `MenuBar`, abstracción `routes`, `providers/Arsenal/`). | ✅ |
| **Cruce de consolidación (paso 3)** | Todo el volumen cruzado en escenarios (`.working/consolidation-map.md`): grafo Track1/Track2, M1 reencuadrado (no cimiento ausente), §E = inventario de deshonestidad; coherence pass map↔docs↔código **sin alarmas**. | ✅ |
| **Bajar a docs (paso 4)** | `decisions.md` `U-3` (3-ejes `SLOT_DEFINITIONS`) + `U-4` (honestidad UI) · `OQ-ENGINE-11` (exaltadas) · `current-state` §2 Gaps (multi-config, reencuadre M1) · **`ui-ux/status.md` creado** (trío completo) · `shell-status.md` plegado · barrido M6 (comentarios stale). | ✅ (residuo `@SSoT` mispointers = **at-touch**, no bloqueante) |

**Pendiente próximo:** cerrar Pasada D (re-apuntar `@SSoT` mispointers a `status.md` *al tocar cada
archivo* + purgar `.working`). Aparte y **gateado** (construir = fuera del mandato, `U-2`): los refactors
capturados (E1 dedup de filtros, E4 mover hooks a `@shared`, hook de hidratación compartido, cablear
ability-popover) y el prototipo de exaltadas (`OQ-ENGINE-11`).

---

## 7. Campaña de revisión de `docs/` (2026-07-03, COMPLETA)

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
