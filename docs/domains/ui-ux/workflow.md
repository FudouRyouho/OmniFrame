---
Estado: "activo"
Rol: "Flujo de documentación/auditoría del dominio UI — espina, stages, checkpoints y lente de 2 ejes"
Impacto_ID: "UI-UX-Workflow"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-06-14"
Fecha_de_actualizacion: "2026-06-14"
Dependencias:
  - "docs/governance/open-questions.md"
  - "docs/governance/doc-map.md"
  - "./decisions.md"
---

# UI Documentation Workflow — flujo de auditoría del dominio

Por qué existe: la UI nunca tuvo su corpus de docs/auditoría como sí lo tuvieron `data/` y
`engine/` (asimetría concreta: `docs/semantic/` pesa más que **todo** `docs/domains/ui-ux/`).
La UI se construyó en gran parte aislada / heredada de otro proyecto y quedó en pausa de docs
durante meses mientras C abría taxonomía/tipado/SSoT → eso **generó drift** (islas de datos,
providers anclados entre sí, toolbars con state desacoplado, dead-code, tareas "parciales" que
estaban completas). Esta campaña corre la UI por el **mismo loop de auditoría** que recibió la
data (auditar→decidir→documentar→construir). Registro de la campaña: `doc-map.md` §6.

Este doc es el equivalente-`schema` del dominio ui-ux: **el flujo es el contrato**. Principio
duro: lo que fundamenta decisiones/OQ es la recomendación del agente + el criterio del usuario,
**NO "lo que la UI diga"** (la UI no es biblia — distinguir ESTABLE de STUB, ver §3 C0).

---

## 1. Espina: DOMINIO + 2 ejes como lente (`U-1`)

La auditoría de datos tuvo espina natural (el token/schema: atómico, enumerable, con SSoT por
unidad). La UI no tiene unidad atómica dada. **Espina elegida = DOMINIO** (`decisions.md` U-1):

- **Espina** = los *code-domains* de `Project/src/domains/` (arsenal, hud, options, profile) +
  shell/shared. Acotado y enumerable → **termina** (hay estado "done" por dominio). Deriva de la
  estructura de carpetas y del cluster OQ-UI, que ya está particionado así.
- **Todos documentan en `docs/domains/ui-ux/` como secciones**, no como doc-domains nuevos (el
  convenio de tamaño permite máx 3 operativos por dominio — ver §4).
- **NO por provider** (auditaría solo el eje-1 estado; la presentación no es provider-shaped y
  quedaría huérfana, re-fragmentando el trabajo de Pre-E). **NO por view** (nivel de hojas → loop
  dentro de una vista compleja + riesgo de consagrar el stub function-first como spec).

**Lente de 2 ejes** (de `DC-OQ-ENGINE-10-C`, "2 canales / 2 ejes ortogonales") aplicado *dentro*
de cada dominio — es el checklist, no la espina:

- **Eje-1 — estado/intención** (canal reactivo `A→D`): qué providers/estado consume el dominio,
  cómo se ancla. Aquí vive la maraña de anclaje (providers-por-view, toolbar desacoplado).
- **Eje-2 — chrome/presentación** (canal estático `0→UI`): cómo proyecta a píxeles
  (`lib/format`, detail views, íconos). Aquí vive el trabajo de borde de salida de Pre-E.

La maraña de providers (que cruza dominios) se documenta como **hallazgo cross-cutting** donde
toca + una nota transversal — como ya hace `current-state.md` §"Providers — Estado de transición".

---

## 2. El loop por dominio (Recon → Triage → Document)

Espejo de auditar→decidir→documentar→construir, y de cómo OQ-UI-2 corrió Stage 0/1/2.
**Construir queda FUERA del mandato** de la campaña: esto es docs/auditoría (80% del valor =
capturar + cuestionar); el refactor function-first es trabajo separado y gateado (`U-2`).

| Stage | Qué hace | Output |
| :--- | :--- | :--- |
| **S0 Recon** | Leer el código del dominio, mapear los 2 ejes (eje-1: qué estado/providers consume; eje-2: cómo proyecta a píxeles). **Sin decisiones.** | Mapa del dominio |
| **S1 Triage** | Por hallazgo, clasificar: *decisión-cerrada-real* (capturar) · *accidente-sin-documentar* (cuestionar — el valor central) · *⚠️ deuda* (marcar) · *genuinamente-nuevo* (OQ solo si lo amerita). Autocrítico, no optimista. | Veredictos |
| **S2 Document** | Bajar a `status.md` (estado real, secciones por dominio) + `decisions.md` (las decisiones-cerradas, serie U-N) + refrescar referencia stale si se tocó. | Docs |

---

## 3. Checkpoints (gates)

- **C0 (post-S0) — ESTABLE vs STUB.** ¿La pieza es el clásico 1:1 Warframe (estable → spec real,
  documentar como contrato) o function-first (stub → **NO consagrar**, documentar *como* stub)?
  Guardrail duro: "UI no es biblia" prohíbe anclar contratos al stub.
- **C1 (post-S1) — RED gate.** ¿Algún hallazgo toca contrato/arquitectura → halt + autorización?
  ¿Algún "accidente" se está vendiendo como "decisión" → exponerlo? Distinguir
  decisión-cerrada-real de accidente-racionalizado-post-hoc **es el valor central**.
- **Cierre — traceability** (toda sesión).

---

## 4. Output: el trío operativo de ui-ux

El convenio (`docs/CLAUDE.md` §"Convenio de tamaño") pide máx 3 operativos por dominio
(`status.md` + `schema.md` + `workflow.md`). ui-ux **no tenía ninguno** (solo `shell-status.md`
mal nombrado + 5 referencia). La campaña le da el esqueleto que le falta:

- **`status.md`** (operativo) — status de dominio, secciones por code-domain. **Creado 2026-06-16**
  (output de los 6 barridos + cruce de consolidación, no de Stage 0). `shell-status.md` plegado aquí.
- **`workflow.md`** (operativo) — **este doc**. El flujo es el contrato (sustituye al `schema`).
- **`decisions.md`** (operativo) — ledger de decisiones de UI, serie U-N (espejo de
  `data/decisions.md`, mismo régimen VIGENTE/DEFINITIVA).
- **Referencia** (consulta bajo demanda, se refrescan cuando un dominio los toca, no ahora):
  `presentation-layer.md` (fresco, borde de salida), `shell-principles.md`, `views-architecture.md`,
  `slot-reference.md`, `virtualization.md`.

---

## 5. Orden de barrido

Por madurez del cluster OQ-UI — empezar por la espina **probada** (ladrillo sobre lo que ya
funciona, no rediseño):

1. **arsenal** — OQ-UI-2 ya corrió Stage 0/1/2; es la espina probada.
2. **hud / footer** — OQ-UI-3 (gated por sistema de guardado).
3. **options** — OQ-UI-5 (incluye la decisión NO-i18n).
4. **profile** — OQ-UI-4 (utility hub).
5. **menu / shell** — OQ-UI-6 (jerarquía de inputs).
6. **shared / presentación** — eje-2 transversal (`lib/format`, detail views; OQ-DATA-10/-13).

---

## Vínculos

- Cluster **OQ-UI** (OQ-UI-2…6) — el corte por dominio del que deriva el orden de barrido.
- **OQ-DATA-10 / OQ-DATA-13 / OQ-ENGINE-10** — el eje-2 (presentación / borde de salida).
- **`doc-map.md` §6** — registro de progreso de la campaña.
- **`./decisions.md`** — serie U-N (U-1 = espina, U-2 = mandato del trío).
