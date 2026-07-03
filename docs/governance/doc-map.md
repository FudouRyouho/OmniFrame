---
Estado: "activo"
Rol: "Mapa de durabilidad del corpus docs/ + criterio de archivado + registro de la campaña de saneamiento"
Version: "v0.4.0"
Impacto_ID: "G-DocMap"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-06-06"
Fecha_de_actualizacion: "2026-07-03"
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

## 3. Registro de la campaña — 2026-06-06

Alcance acordado: foco en reducir caos del corpus; `docs/data/references/*` quedó **fuera de scope**
(se revisa aparte). Conducida de forma mecánica/contraste (sin auditoría semántica doc-completo).

| Foco | Resultado | Commit |
|---|---|---|
| A — `Project/data` | Eliminado (1.9 MB: `overrides/mods/` huérfano + `audits/` regenerable). Ya estaba gitignored+untracked → solo `rm` físico. | (sin commit: untracked) |
| Históricos — lote 1 | `data/reports/multishot-profiles.md` → `docs-archive/historical/` (0 citas, report generado). Verificación descartó los otros 5 (vivos). | `2117299` |
| B — dispersión | `naming-conventions.md` ↔ `nomenclature-grammar.md`: **no eran duplicados** (casing vs gramática de tags), solo nombre parecido → desambiguados con cross-link. La dispersión *literal* cross-doc casi no existe (el corpus cross-linkea bien); el bloat reducible es **cualitativo** intra-doc, no abordado esta sesión. | `bff5c9a` |
| C — contraste docs↔código (engine) | Ver §4. Colisión `OQ-ENGINE-3` (reusada vs decisión cerrada) → renumerada a **OQ-ENGINE-7**. | `413c9c3` |

---

## 4. Hallazgos de contraste (Foco C — dominio engine) y follow-ups

El dominio engine ya tiene su mecanismo de contraste designado: **`engine-audit.md`** (drift
doc↔código). El cluster `engine/design/` es un **blueprint pre-implementación auto-consciente**
(su README lo declara) — no es plan-muerto, no se archiva.

Drift registrado (gate: **registrar, no auto-fix**):

- **`engine-audit.md` desactualizado post-2026-05-27:**
  - §4.3 "all-operations siempre ADD" → **stale**: hoy `resolveToken()` deriva la op del segmento
    del token (`OPERATION_MAP`: ADD/FLAT/BASE/MULT). `punch_through` usa `ADD_FLAT`.
  - §4.2 IncarnonRepository → no refleja la propagación de `condition` (Capa 3 cerrada, commit `4c6b731`).
- **`engine/status.md` drift menor (GREEN):** no lista `hydration/DataLoader.ts`; la tabla de tests
  omite `felarx`, `laetum`, `weapon-multishot-resolution`; el cuerpo dice "última actualización
  2026-05-27" vs frontmatter `2026-06-04`.
- **`current-state.md`** quedó stale vs el trabajo de junio → **atendido por la campaña docs-review (§7, 2026-07-03):** changelog purgado a git, 4 drifts internos cerrados, snapshot restaurado.
- **`README.md` (docs raíz, 2026-05-25)** sigue stale vs el trabajo de junio → refrescar al retomar (pendiente).

Pendientes de la campaña (no ejecutados esta sesión):
- Refrescar `engine-audit.md` y `engine/status.md` contra el código actual.
- Bloat cualitativo intra-doc (sobre-responsabilidad/acreción histórica): requiere auditoría de
  contenido doc-completo, fuera del alcance mecánico de esta sesión.

---

## 5. Foco D — saneamiento de `references/wiki/` (2026-06-10, EN CURSO)

Es el "`docs/data/references/*` se revisa aparte" que la campaña de 2026-06-06 dejó fuera de scope.

**Hallazgo (regla establecida con el usuario):** `references/` es la **wiki local pura** — su propósito
es ser fuente de consulta estable para no re-fetchear la wiki. Por eso **no debe contener vocablo del
proyecto** (tokens `WEAPON_*`/`AVATAR_*`, ops `ADD`/`ADD_FLAT`, "engine vN", `D-N`, `OQ-*`, refs a
`Project/src/*.ts`): si lo tiene, queda stale cuando `docs/` cambia. Excepción única: `game-ui/` (por
composición del pipeline). `docs/` **sí** puede citar `references/` (no es regla excluyente). El subdir
`docs/data/references/wiki/` **no debe existir** (los híbridos de mecánica van limpios a `references/wiki/`;
el modelado vive en `docs/`: `upgrade-tokens.md`, `gap-map.md`, OQ).

**Alcance del problema (escaneo 2026-06-10):** contaminación **sistémica** —
- **18/18 docs de `references/wiki/mechanics/` (raíz)** tienen vocablo del proyecto (secciones "Mapeo a
  tokens D-6", "engine v1", refs a `.ts`). Solo `projectile-speed.md` ya saneado.
- **8 docs en `docs/data/references/wiki/mechanics/`** (híbridos mal ubicados): accuracy, damage-falloff,
  damage-reduction, knockdown, life-steal, projectile-speed, punch-through, recoil. 3 los creó esta serie
  de sesiones (projectile-speed, recoil, damage-falloff).
- **Conflicto:** `damage-reduction.md` en ambos árboles (fusionar). `status-chance-mechanics.md` (en
  `docs/data/references/`) es híbrido análogo.

**Decisión de alcance:** campaña completa (opción 2) — los ~26 docs a wiki pura, contrastando con la wiki
para no perder precisión. Las secciones "Mapeo a tokens D-6" se **borran** de `references/` (su hogar es
`upgrade-tokens.md`). Enfoque (A): el modelado no se preserva en derivados — ya vive en `docs/`.

**Progreso — COMPLETADO 2026-06-10:**
| Paso | Estado |
|---|---|
| 18 docs raíz `references/wiki/mechanics/` → wiki pura (0 vocablo proyecto) | ✅ |
| 8 híbridos de `docs/data/references/wiki/` → wiki pura en raíz | ✅ |
| Conflicto `damage-reduction` → fusionado en raíz (incorporó Adaptation, Type Modifiers, Energy-as-Health del de docs/data) | ✅ |
| Eliminado `docs/data/references/wiki/` (subárbol entero) | ✅ |
| Punteros actualizados (`ItemRepository.ts`, `cedo`/`lanka.test.ts`, OQ, gap-map) → `references/wiki/mechanics/` | ✅ |
| Suite engine verde tras los cambios (75 passed) | ✅ |

**Follow-up menor (no parte del mandato del subdir `wiki/`):** `docs/data/references/status-chance-mechanics.md` está en ubicación válida (derivado con vocablo, **no** bajo `wiki/`), pero su parte de mecánica per-pellet (status chance per-pellet, procs/disparo) es wiki pura que podría extraerse a `references/wiki/mechanics/status-chance.md`. No se tocó hoy. `docs/data/references/` queda con 4 derivados legítimos: `canonical-sources`, `set-mods`, `status-chance-mechanics`, `warframe-items-source`.

**Regla establecida (durable):** todo `.md` nuevo en `references/wiki/` debe ser wiki pura — si se escribe con vocablo del proyecto (tokens, ops, `engine vN`, `D-N`, `OQ-*`, refs `.ts`), es un **flag a notificar y corregir**.

---

## 6. Campaña de documentación de UI (2026-06-14 – 2026-06-16, PASO 4 EN CURSO)

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
| **Bajar a docs (paso 4)** | `decisions.md` `U-3` (3-ejes `SLOT_DEFINITIONS`) + `U-4` (honestidad UI) · `OQ-ENGINE-11` (exaltadas) · `current-state` §2 Gaps (multi-config, reencuadre M1) · **`ui-ux/status.md` creado** (trío completo) · `shell-status.md` plegado · barrido M6 (comentarios stale). | 🟡 En curso (Pasada D) |

**Pendiente próximo:** cerrar Pasada D (re-apuntar `@SSoT` mispointers a `status.md` *al tocar cada
archivo* + purgar `.working`). Aparte y **gateado** (construir = fuera del mandato, `U-2`): los refactors
capturados (E1 dedup de filtros, E4 mover hooks a `@shared`, hook de hidratación compartido, cablear
ability-popover) y el prototipo de exaltadas (`OQ-ENGINE-11`).

---

## 7. Campaña de revisión de `docs/` (2026-07-03, EN CURSO)

**Origen:** revisión completa del corpus pedida por el usuario ("tenemos muchísimo ruido"). A diferencia
de la campaña §3 (mecánica/contraste) y §6 (código↔docs por dominio), ésta ataca el **bloat cualitativo
intra-doc** que §3 foco B dejó identificado pero sin abordar. **Eje: rol + drift** (no fecha — el campo
`Fecha_de_actualizacion` desfasa hasta 5 semanas vs git); desempate secundario por git-date. **Criterio de
ruido (gate):** las reglas del workflow (proporcionalidad, convenio de 3 archivos, debate-vs-ruido). Tracker
efímero: `.working/docs-review-pass.md`. **Poda y drift se tratan por separado** (el drift se registra, se
cierra en una pasada aparte).

**Tanda 0 — pre-flight mecánico (✅):** corpus **estructuralmente sano** — frontmatter 90/90, `Fidelidad_Fisica`
90/90, LF 90/90. Único defecto real: `data/rules/kind-vs-category.md` estaba **entero en CRLF** (violaba la
regla dura LF; disparó un falso positivo de "path inexistente") → corregido a LF. **Confirma §3 foco B: no
hay pudrición estructural; el ruido es 100% cualitativo intra-doc.**

**Tanda 1 — núcleo de lectura obligatoria (✅ COMPLETA, 11/11):**
| Doc | Resultado |
|---|---|
| `current-state.md` | 154→107 líneas (−31%). Changelog de 16 sesiones purgado a git; 4 drifts internos cerrados (hooks purgado, Capa D, OQ-DATA-3→9, §3); 2 huérfanos rescatados (`engines`→memoria de entorno, shape-Capa-A→OQ-ENGINE-9). v0.3.0. |
| `open-questions.md` | 653→620. OQ-DATA-12 (cerrada) → `closed-decisions.md#DC-OQ-DATA-12`; log-en-OQ de OQ-ENGINE-7 comprimido (moldes preservados); 6 strikethrough purgados; ejes c/d/a de OQ-ENGINE-9 colapsados. v0.34.0. |
| `decision-frontier.md` | Limpio, sin poda. 3 drifts → pasada de drift. |
| `doc-map.md` | Este registro (§7) + §4 follow-up de `current-state` marcado atendido. |
| `data/status.md` | Status operativo sano. 2 strikethrough purgados (Arcane/Incarnon repo). v0.2.5. |
| `data/decisions.md` | Ledger durable. Solo **D-7** comprimido (log de ejecución + flip-flop label + N2 narrativo → puntero). v0.1.3. |
| `engine/status.md` | **Sin poda — drift severo** (rutas pre-reestructura 2026-06-12, tabla Hooks = código purgado). → rewrite completo en la pasada de drift. |
| `engine/test/test-workflow.md` | Limpio, durable. 1 drift menor (`fixtures/engine-data.ts`→`bootstrap/`). |
| `ui-ux/{status,workflow,decisions}.md` | Limpios — output reciente de la campaña de UI (§6), densos pero intencionales. Sin poda. `status.md`: 3 punteros a `current-state [2026-06-16]` (purgado aquí) repuntados a §2 Gaps (v0.1.1); 1 staleness en `workflow.md` → drift. |

**Hallazgo de la tanda:** el bloat es por **acreción-de-log**, no por edad. Docs viejos bien-formados y recientes-de-campaña están limpios; el bloat vivía en los acretados (`current-state`, `open-questions`). Poda aplicada solo donde había log; el drift va a su pasada aparte.

**Pendiente:** Tandas 2 (contratos SSoT-vivo, ~30 docs) y 3 (referencia, ~25). Luego la **pasada de drift consolidada** — el ítem más grave detectado es `engine/status.md` (pre-reestructura completo).
