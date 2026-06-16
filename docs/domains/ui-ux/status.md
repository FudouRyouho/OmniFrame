---
Estado: "activo"
Rol: "Status operativo del dominio ui-ux — pulso por code-domain + mapas cross-cutting (output de los 6 barridos + cruce de consolidación)"
Version: "v0.1.0"
Impacto_ID: "UI-UX-Status"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-06-16"
Fecha_de_actualizacion: "2026-06-16"
Dependencias:
  - "./workflow.md"
  - "./decisions.md"
  - "../../governance/open-questions.md"
---

# UI/UX — Status del dominio

El **pulso por code-domain** de la UI, output de los **6 barridos + el cruce de consolidación** de la
campaña (ver [`./workflow.md`](./workflow.md)). El *por qué* de cada decisión vive en
[`./decisions.md`](./decisions.md) (serie U-N) y en el cluster **OQ-UI**; este doc captura el **estado
real** (qué es cada dominio, **ESTABLE vs STUB**, sus deudas, su OQ). Guardrail (C0): **no consagrar el
stub como spec** — distinguir el clásico 1:1 Warframe (estable) del function-first (stub).

> Pliega y reemplaza al antiguo `shell-status.md`. Las referencias `@SSoT` que apuntaban a `shell-status.md`
> / `shell-principles.md` se re-apuntan **aquí** (resuelve la deuda de mispointers H4/H8/E5/HD7).

---

## 1. Status por dominio

### 1.1 Arsenal — **STUB** · `OQ-UI-2`
- **C0:** STUB (`@status stub`); `UpgradeView` sin diseño definido. Mirror function-first, no spec.
- **Eje-1 (estado):** **view-local**, 3 mecanismos (`context`/`swap` per-mount + `use-arsenal-ui-session` store cross-route para el slot de archon shard). No hay "estado de dominio global". `configSlot` (multi-config) **purgado** (false-affordance, Stage 1+2; `DC-OQ-STUB-1`). Intención vía `useEnsemble`.
- **Eje-2 (presentación):** `SLOT_DEFINITIONS` = chrome **3-ejes-fusionado de V1** (→ **U-3**); hidratación a mano (`Registry.getItemById` en `useEffect`, patrón **M3**); render de íconos de shard duplicado + lookup por nombre (→ `OQ-DATA-13`).

### 1.2 Equipment — **ESTABLE** (delegado a `@shared`)
- Controlador de composición que delega a `@shared` (`OmniToolbar` + `FilterProvider` + `Outlet`). Chrome **data-driven** (recibe `tabs`/`toolbarMap` por props) — asimetría **positiva** vs el chrome inline de arsenal.
- **Deudas (capturadas, no ejecutadas — `U-2`):** `EquipmentContext` ≡ `ArsenalSwapContext` byte-a-byte → dedup a `useFilterState()` en `@shared` (**E1**); `equipment/hooks/{use-items-filters,use-item-details}` consumidos por `@shared` = **inversión Restricción 1** → mover a `@shared` (**E4**, ver nota R1 en `current-state` [2026-06-16]).
- **Filtros** = concern-bucket cross-cutting (consumido por equipment Y arsenal-swap), ya carve-out a `@shared`.

### 1.3 HUD / Footer — **STUB** · `OQ-UI-3`
- **1er consumidor real del canal A→D** (`useEnsemble` en `HudHeader` lee el loadout activo). Donde Ensemble se hace visible.
- `HudHeader` STUB; footers (`Hub`/`Arsenal`/`ItemsDetails`) = delegación shell-driven por `footerKind` (discriminador limpio).
- **False-affordance (→ U-4):** `active_channel_count = 0 //stub` (finge contador, **HD3**); `ItemsDetailsFooter` 3 botones `Build`/`Similar`/`Wiki` sin handler (fingen cliqueables, **HD5**).
- Hidratación a mano (**HD2** = M3, n cross-domain). `OQ-UI-3` gated por **sistema de guardado de builds** (inexistente).

### 1.4 Menu / Shell — **más ESTABLE que STUB** · `OQ-UI-6`
- Réplica del **orbitador clásico 1:1**: `DialogMenu` (nav ESC fullscreen), `MenuProvider` (`dialogCount` + `window keydown` = corazón de la **jerarquía de inputs** de `OQ-UI-6`), `ShellProvider`.
- **`ShellProvider` = SSoT de la taxonomía de rutas** (`zone`/`view`/`isDetail`/`footerKind`/`pageTitle`): función **pura** `resolveShell(pathname)`, testeable en aislamiento — buena arquitectura (**HD7/MS6**).
- **Purgado (MS1/2/3):** `MenuBar` (0 consumidores), abstracción muerta `routes`/`AppRoute` + submenú "Dev" fantasma, ciclo `@shared→App`. Nav viva = `mainLinks` inline en `DialogMenu`.

### 1.5 Profile — **STUB** · `OQ-UI-4`
- `ProfileView` = `return null`. Reencuadrado como **utility-hub / companion-hub** (qué incarnon tengo, qué armas kuva, etc.), **NO** mapeo de builds guardadas ni de Equipment. Far-future (producción real).
- **⚠️ deuda (M6):** el JSDoc dice "builds guardadas" — **stale** respecto al reencuadre de `OQ-UI-4`; barrer (Pasada D). El badge A/B/C de config vive en `/equipment/*`, no en Profile.

### 1.6 Shared / Presentación — eje-2 transversal (no es un 6º dominio, es el destino)
- ~33 componentes **paralelos por kind** (cards/views/detail-views/popovers, 7-8 c/u). **Corpus propio:** [`./presentation-layer.md`](./presentation-layer.md) + `OQ-DATA-10/-13` + `OQ-ENGINE-10`.
- **Sumidero sano:** `StatPanel` + el proyector único (`toStatEntries`/`getModStats`/`getAttackStats` → `StatEntry[]`). **Adopción inconsistente:** las route-detail-views son mayormente **stubs** que bypassean el proyector (hand-roll + formateo inline); los popovers repiten el shell ×7 + 5/7 hand-rollean stats.
- **`mod-visual` forkeado** (`ModCard` vs `ModFrameVisual`, 2 medio-implementaciones) → subsistema de diseño **diferido**, dirección = colapsar a UN genérico + composición-por-interacción (precedente `BaseItemCard`). Anclas read-only: `references/visual/{canvas,mod-cards}.md`.
- **`ability-popover` huérfano** (0 imports) pero **con uso planeado** (hover sobre el icono de habilidad en `/equipment/warframes/*`, `/arsenal/*`) → **KEEP + WIRE** (no purgar).
- **Primitivos sanos** (referencias "cómo debería verse"): `ItemsGrid` (grid + virtualización), `CustomPopover` (wrapper Tippy lazy), `Stage` (Transition wrapper).

---

## 2. Mapas cross-cutting (la estructura que la auditoría reveló)

> Estos mapas son **diagnóstico**, no orden de trabajo: **construir queda fuera del mandato** de docs (`U-2`).

### 2.1 Pipeline de presentación (Track 1) + filtros (Track 2)

**Track 1 — pipeline de presentación** (un solo flujo fragmentado, no dups sueltas):

```
A ─[cruce/deref: M3]→ entidad ─[proyección→StatEntry[]]→ [render: StatPanel] ─→ [shell popover]
```

Es un **monolito de refactor** con sub-estructura por gate:
- **(a) dedup chrome/render — UNGATED:** caso "value vacío → fila label-only" de `StatPanel` + un `DetailPopoverShell` skeleton (composable por interacción).
- **(b) adopta-el-sumidero — NO "builder-gated":** los stubs proyectan→`StatPanel` al construirse = **display doable con primitivas que ya existen, diferido por prioridad** + deuda de **stub-deshonesto (U-4)**; sólo la **interacción** (Tab→habilidades, preceptos) es modelado diferido.
- **Orden candidato:** des-fusionar `SLOT_DEFINITIONS` (U-3) → estructura (`slot-channel.ts` como fuente única del binding `canal↔slot`) → cruce (hook de hidratación compartido) → presentación.

**Track 2 — filtros/`@shared`** (independiente): E1 (dedup de los contexts → `useFilterState()`) + E4 (mover los 2 hooks a `@shared`). Arista `use-item-details` ↔ Track 1 (es la interacción Tab→ataques del weapon-popover).

**Patrón meta:** la UI **hand-rollea normalización que "0" debería poseer** — el binding `canal→domain` (M3) y la **semántica derivada** de los filtros (E4 `use-items-filters` hardcodea grupos `"beast"`/`"light blade"`…, candidato a subir a `types`/pipeline). Eco de la tesis de la campaña: la UI es síntoma downstream de huecos en 0/`@shared`.

### 2.2 Inventario de deshonestidad + higiene (§E)

La deuda **presente** real de la UI no es dead-code para purgar — es **deshonestidad** (lo que `U-4` nombra):
- **False-affordances** → volver honesto al tocar: HD3 (`count=0`), HD5 (botones sin handler), `ModCard` (`disabled // for test card`, `pointer-events-none`).
- **Dead-code / rama muerta en `mod-visual`** (`ModFrameVisual` fusion-stars `i<10?cyan:gray`, hardcodes `"Rifle"`/`"Warframe"`) → mueren con el rewrite del genérico (no fix separado).
- **Comentarios stale (M6)** que mienten ubicación/wiring (`ProfileView`, `BaseItemCard` "domains/equipment"→`@shared`, `vehicle-popover` "se integrará ability-popover") → barrer (Pasada D).
- **`ModSlot` `index>=200?"arcane":"mod"`** (número mágico) → familia **id-mismatch UI↔engine**.

### 2.3 Referencias positivas ("cómo debería verse")
`OmniToolbar` (chrome data-driven), footer config-by-discriminator (HD6), `ShellProvider` resolver puro (HD7), `ItemsGrid`/`CustomPopover`/`Stage` (primitivos compartidos sanos).

---

## 3. Deudas abiertas (no-decisión)
- **Deuda definicional:** "**classic vs advanced vs builder**" se usan sueltos sin definición canónica. *Classic* = mirror 1:1 Warframe; *advanced (vista avanzada)* = clásico + enriquecimientos armónicos (ej. fórmula de habilidad vía buckets de C); *builder* = construcción/edición. Asentar una definición firme cuando se materialice.
  - **Boceto de salida analítica (rescatado de código muerto, Fase 0 2026-06-16):** el tipo `ProjectionSnapshot` (purgado del engine — sin productor ni consumidor, ensuciaba `contracts.ts`) capturaba la forma tentativa de la salida que la *vista avanzada* consumiría: por entidad, `metrics: { ttk?, effective_dps?, status_weights }`. **Punto de partida, NO contrato** — cuando se materialice la vista avanzada, la forma real se deriva del oráculo/dominio (no de este stub pre-oracle). Aquí queda solo como ancla de intención.
- **Mispointers `@SSoT`** (varios archivos → `shell-status`/`shell-principles` inconsistente): re-apuntar a este `status.md` al tocar cada archivo.
- **Trayectorias de modelado-diferido** (multi-config warframe-like, filter-variety/A2, abilities n%/exaltadas): no bloqueadas, gated por prioridad — ver `current-state` [2026-06-16] + `OQ-ENGINE-11`.

---

## Vínculos
- [`./decisions.md`](./decisions.md) — serie U-N (**U-1** espina · **U-2** trío/mandato · **U-3** 3-ejes `SLOT_DEFINITIONS` · **U-4** honestidad UI).
- [`./workflow.md`](./workflow.md) — el flujo de la campaña (Recon→Triage→Document).
- Cluster **OQ-UI** (`OQ-UI-2`…`OQ-UI-6`) — el corte por dominio; cada sección §1 enlaza el suyo.
- `OQ-ENGINE-11` (exaltadas / eje estructura de U-3), `OQ-ENGINE-10` + `OQ-DATA-10/-13` (presentación / borde de salida).
- [`../../governance/current-state.md`](../../governance/current-state.md) — entrada [2026-06-16] (reencuadre M1, gaps).
- [`./presentation-layer.md`](./presentation-layer.md) — referencia del borde de salida (eje-2).
