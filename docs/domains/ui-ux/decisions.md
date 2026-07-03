---
Estado: "activo"
Rol: "Ledger de decisiones de arquitectura de UI (serie U-N) — espejo de data/decisions.md"
Version: "v0.2.0"
Impacto_ID: "UI-UX-Decisions"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-06-14"
Fecha_de_actualizacion: "2026-06-16"
Dependencias:
  - "./workflow.md"
  - "docs/governance/open-questions.md"
---

# Decisiones de UI — serie U-N

Espejo de [`../../data/decisions.md`](../../data/decisions.md) (serie D) para el dominio ui-ux.
Mismo **régimen de evolución** que las D-series (`docs/CLAUDE.md` §"Regla de evolución de
decisiones de dominio"): por defecto **VIGENTE** (evoluciona con evidencia; GREEN si solo afecta
docs, escala a YELLOW/RED si toca contrato/arquitectura). Una decisión se marca **DEFINITIVA**
solo explícitamente (mismo protocolo que RED).

**Antecedente (no re-numerado):** las decisiones de UI previas a esta serie viven como anchors
`DC-OQ-*` en `governance/closed-decisions.md` y en las OQ — p.ej. `DC-OQ-ENGINE-10-A/B/C`
(topología de E, `lib/*` como utilidad), `DC-OQ-STUB-1` (purga honesta del stub de arsenal).
**No se re-numeran** (regla dura: nunca eliminar anchors). La serie U-N arranca aquí, hacia
adelante, y los referencia como historia.

---

## U-1 — Espina de auditoría de UI = DOMINIO + 2 ejes como lente — **VIGENTE (2026-06-14)**

**Decisión:** la campaña de documentación/auditoría de UI se enumera por **DOMINIO**
(code-domains de `Project/src/domains/` + shell/shared), con los **2 ejes ortogonales**
(estado/intención `A→D` vs chrome/presentación `0→UI`, de `DC-OQ-ENGINE-10-C`) como **lente de
auditoría por dominio**, no como espina.

**Por qué:** el dominio es acotado, enumerable y termina (estado "done" por dominio); deriva de
las carpetas y del cluster OQ-UI ya particionado así → reusa el corte existente (`reduce_chaos`).

**Alternativas rechazadas:**
- **PROVIDER** (seguir la maraña de anclaje): audita solo el eje-1; la presentación no es
  provider-shaped → quedaría huérfana, re-fragmentando el trabajo de Pre-E (`lib/format`).
- **VIEW** (vista por vista): nivel de hojas → loop dentro de una vista compleja
  (`ArsenalView`/`UpgradeView`) + riesgo de consagrar el stub function-first como spec.

**Detalle del flujo:** ver [`./workflow.md`](./workflow.md). **Fuente:** debate Stage 0 de la
campaña de docs de UI, 2026-06-14 (`doc-map.md` §6).

---

## U-2 — ui-ux adopta el trío operativo; "construir" queda fuera del mandato de la campaña — **VIGENTE (2026-06-14)**

**Decisión:** la campaña dota a ui-ux del esqueleto operativo que le faltaba —`status.md` +
`workflow.md` + `decisions.md`— igual que todo dominio funcional. El mandato de la campaña es
**docs/auditoría** (80% del valor = capturar + cuestionar): correr cada dominio por
Recon→Triage→Document. **El refactor function-first (construir) es trabajo separado y gateado**,
no parte de esta campaña.

**Por qué:** la causa del drift fue la pausa de docs, no la falta de código. La campaña cierra
esa asimetría sin entrar a reescribir UI (anti-reescritura); construir sin consumidor real
repetiría el ciclo motor-reescrito-3x.

**Implicación:** `status.md` se construye a medida que cada dominio pasa por el loop (requiere
leer código); no se crea en Stage 0. **Fuente:** debate Stage 0, 2026-06-14.

---

## U-3 — `SLOT_DEFINITIONS` = 3 ejes de V1 fusionados (intención→A · estructura→contexto · presentación→E) — **VIGENTE (2026-06-16)**

**Decisión:** la tabla literal `SLOT_DEFINITIONS` (chrome de slots del arsenal, hardcodeada inline
en `ArsenalView`) es un **vestigio de V1 que funde 3 ejes ortogonales**, a separar hacia 3 destinos:

- **intención** (`actions`, `showAbilityNodes`) → **A** (Ensemble / acciones del dispatch).
- **estructura** (`id`, `surface` = qué slots existen y su contexto de aplicación) → **contexto de
  aplicación** (capa estructural de A; su forma *derivada/dinámica* es exaltadas, `OQ-ENGINE-11`).
- **presentación** (`slotLabel`, `defaultName`, `icon`, `description`) → **E** (chrome, `f(snapshot)`).

El `domain` (vocabulario de "0") **NO** vive en `SLOT_DEFINITIONS` — está en `slot-channel.ts`
(binding `canal↔slot`); su filtración a tablas divergentes (`CHANNELS` en `HudHeader`,
`index>=200` en `ModSlot`) es síntoma del eje *estructura* sin un hogar único.

**Por qué:** la fusión V1 es causa-raíz de varios hallazgos de la auditoría (M3 hidratación a mano,
los channel-maps divergentes, el chrome hardcodeado de `ArsenalView`); separarla por eje da a cada
faceta su dueño correcto y disuelve la falsa dicotomía "claridad-por-kind vs duplicación".

**Relación con U-1:** distinta del *lente de 2 ejes* de U-1 (estado/intención `A→D` vs
chrome/presentación `0→UI`, herramienta de auditoría). U-3 es la **descomposición estructural de una
tabla concreta** en 3 destinos; agrega el eje *estructura/contexto de aplicación* que el lente de 2
ejes no nombra.

**Downstream:** la materialización del eje *estructura* (slots derivados dinámicamente, p. ej. la
exaltada que otorga un warframe) = **`OQ-ENGINE-11`** (derivación de intención estructural en A1).

**Fuente:** debate de la campaña ui-ux; cruce de consolidación 2026-06-16 (`.working/consolidation-map.md`).

---

## U-4 — Honestidad de la UI: false-affordance vs placeholder inerte honesto — **VIGENTE (2026-06-16)**

**Decisión:** distinguir dos cosas que se ven parecidas en una UI function-first:

- **Placeholder inerte honesto** (declara intención futura, no finge funcionar) = **conservar**
  (costo de código ~0), siempre que sea **visiblemente inerte** (`disabled` / coming-soon) o esté
  **documentado como stub**.
- **False-affordance** = UI/lógica que **finge funcionar lo que no puede** (botón sin handler que
  parece cliqueable, contador hardcodeado a `0`, stats hand-rolleadas que aparentan ser reales),
  **sin documentación** = **el problema** → volver honesto (inerte visible) o cablear; nunca dejar
  fingiendo.

**Afinado por §E (cruce 2026-06-16):** el problema **no es el stub** — es el **stub que pretende
simular lo que no puede, sin doc**. Eso es, literalmente, gran parte de la UI hoy (HD3
`active_channel_count=0`, HD5 botones sin handler, los 5 popover-stubs hand-rolleando stats inline).
El default al tocar ese código = **stub honesto**, no "purgar" ni "dejar fingiendo".

**Por qué:** resuelve en general "scaffolding ¿se purga o queda?" y da el criterio para el barrido
de §E sin caso-por-caso. Alinea con `DC-OQ-UI-SPEC-1` (UI no es spec / no consagrar el stub).

**Antecedente:** principio H1 del micro-debate de arsenal (2026-06-14), aquí formalizado y afinado.
**Fuente:** cruce de consolidación 2026-06-16 (`.working/consolidation-map.md`).
