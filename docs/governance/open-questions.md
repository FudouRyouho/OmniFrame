---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.7.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-05-29"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

---

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **ABIERTO (2026-05-18)**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.
**Fuente:** `docs/domains/engine/engine-audit.md §2.4`

---

## OQ-W-5 — Semántica derivada de ENERGY_COST / ENERGY_DRAIN — **ABIERTO (2026-05-22)**
**Dominio:** data / ability-stats → engine
**Contexto:** `ENERGY_COST` y `ENERGY_DRAIN` son tokens válidos en `upgrade_by` de ability-stats. El pipeline los captura correctamente. La semántica derivada (cómo interactúan con Ability Efficiency, caps, etc.) no está implementada en el engine.
**Fórmulas conocidas:**
- `ENERGY_COST` → `(2 − efficiency) × base_cost`
- `ENERGY_DRAIN` → `((2 − efficiency) × base_drain) / duration_multiplier`
**Estado:** deuda legítima. No bloquea el pipeline de datos ni el schema.
**Condición:** cuando el engine necesite resolver valores de energía para habilidades activas.

---

## OQ-DATA-1 — Materialización de slots por entidad — **ABIERTO (2026-05-25)**
**Dominio:** data / arsenal / engine
**Contexto:** Los slots por entidad (Warframe 8 mods + Aura + Exilus + 2 Arcanos, Melee + Stance, etc.) son información canónica del juego documentada en `docs/domains/ui-ux/slot-reference.md`. Casos especiales como Jade (2 Auras), Sevagoth Shadow, exaltadas y companions modulares requieren modelado explícito. `UpgradeView.tsx` existe como stub (`@status stub`) sin diseño definido del layout de slots.
**Pregunta:** ¿Cómo se materializan estas capacidades en el sistema? Opciones:
- (a) **JSON por entidad** (similar a `archon-shards.json`) — `slot-capabilities.json` indexado por `uniqueName`
- (b) **Constantes/mapeos en código** — en `Project/src/shared/types/` o `Project/src/lib/`
- (c) **Derivado del dataset** de `@wfcd/items` cuando lo expone
- (d) **Híbrido** — baseline en código + overrides por excepción en JSON
**Implicación:** La elección determina si `slot-reference.md` pertenece a `data/rules/`, `data/schemas/`, o vive como referencia canónica sin dominio fijo. **Hoy se mantiene en `docs/domains/ui-ux/` como huérfano explícito** para no pre-cerrar esta decisión.
**Bloquea:** Diseño definitivo de `UpgradeView`; modelado de Jade Aura×2, Sevagoth Shadow, exaltadas, companions modulares.
**Fuente:** `docs/domains/ui-ux/slot-reference.md`

---

## OQ-ENGINE-FUTURE — Features de evolución del motor en backlog — **ABIERTO (2026-05-25)**
**Dominio:** engine / simulation-v2
**Contexto:** Features consideradas en pre-implementación (abril 2026) que no entraron al motor inicial. Sin prioridad asignada.

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | API serializable del motor para mover carga de simulación a un Worker | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer; aprovecha que el motor es determinista | UX de comparación de builds |

**Condición:** cuando la Capa D (Proyección) se materialice y haya un cliente real consumiendo el motor (Arsenal UpgradeView definido).

---

## OQ-DATA-2 — Ubicación de vocabularios que son simultáneamente semantic + data — **ABIERTO (2026-05-25)**
**Dominio:** data / semantic
**Contexto:** Vocabularios como **polaridad** (`semantic/polarity.md`) son simultáneamente:
- **Vocabulario canónico semántico** — 8 tokens (`madurai`, `vazarin`, ..., `omni`) definidos en `Project/src/shared/types/polarity.ts`
- **Estructura de datos** — campos `polarities[]` en `warframes.json`, `polarity` y `polarities[]` en `mods.json`
- **Normalización de pipeline** — `Project/scripts/normalization/polarity.ts` traduce tokens raw del fork (`AP_ATTACK`, `AP_ANY`, etc.) a los canónicos

El doc actualmente vive solo en `docs/semantic/` y **aparece como huérfano** (0 referencias entrantes desde otros .md), aunque el código lo consume vía `shared/types/polarity.ts` + `scripts/normalization/polarity.ts`. Esto es **drift de cobertura documental**: el grafo docs no refleja el grafo de consumo del código.

Otros candidatos al mismo patrón: `semantic/damage-types.md`, `semantic/factions.md`.

**Pregunta:** ¿Cómo se modelan los vocabularios que son a la vez semántica canónica + estructura de datos materializada? Opciones:
- (a) **Solo en `semantic/`** con docs de `data/` linkeando explícitamente cuando lo consumen — convención de link entrante obligatorio
- (b) **Movido a `data/rules/`** porque su contrato de aparición en datasets es la propiedad dominante; `semantic/` queda solo para vocabulario que NO se materializa (si existe tal caso)
- (c) **Duplicación intencional** — entrada corta en `data/rules/` + entrada extensa en `semantic/` con links recíprocos
- (d) **Reescribir `semantic/`** como **índice cruzado** de vocabularios materializados en datos, con cada doc apuntando a su consumidor real en `data/`

**Implicación:** La decisión afecta a los 3 docs actuales de `semantic/` (`damage-types`, `factions`, `polarity`) y la convención para vocabularios futuros (status conditions, faction damage types, etc.).

**Bloquea:** Coherencia del grafo documental con el grafo de código real. Comprensión por agentes IA de que `semantic/` no es info aislada sino consumida masivamente.

**Fuente:** `docs/semantic/polarity.md` (huérfano detectado en auditoría 2026-05-25).

---

## OQ-W-6 — Vocabulary gap: upgrade_by para stats base del warframe — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → taxonomía
**Contexto:** El vocabulario `AbilityUpgradeBy` cubre los 4 stats de habilidad (`AVATAR_ABILITY_STRENGTH/RANGE/DURATION/EFFICIENCY`) y los dos ejes de energía (`ENERGY_COST/DRAIN`). Inaros Scarab Swarm tiene un stat (`Damage: 241`) que escala con Max Health del warframe — un eje de base stat sin token. El `//!` en `Inaros.md` lo registra: `"scale with health, literaly 'vitality' maxed (100% health) affected this number 483"`.
**Pregunta:** ¿Cómo se extiende `upgrade_by` para cubrir stats base del warframe (health, shield, armor)?
- La taxonomía D-6 ya define `AVATAR_ADD_HEALTH_MAX` como token de mod. El principio que se busca es **globalizar la semántica**: el mismo vocabulario `AVATAR_*` debería aplicar.
- Opciones: token completo idéntico al mod (`AVATAR_ADD_HEALTH_MAX`), o forma sin OPERATION (`AVATAR_HEALTH_MAX`) para separar el eje "con qué escala" del eje "qué modifica".
**Condición para resolver:** al resolver la taxonomía general de `upgrade_by` — cuando haya ≥2 casos distintos de base-stat scaling en abilities que justifiquen el patrón. Hoy solo Inaros es caso confirmado.
**Bloquea:** Anotar correctamente Inaros Scarab Swarm. Extensión del vocabulario `AbilityUpgradeBy` en `shared/types/ability.ts`.
**Fuente:** `references/game-ui/Inaros.md` línea `//!`

---

## OQ-SEM-1 — Conditions de abilities y augments — **ABIERTO (2026-05-28)**
**Dominio:** data / semantic / ability-stats
**Contexto:** El vocabulario canónico de `conditions.md` cubre weapons, arcanes, incarnon y mods. Las abilities de Warframe tienen condiciones situacionales (e.g., "target tiene X stacks", "cristal del 4 de Citrine golpeado") que en su mayoría mapean a tokens existentes. Los augments son el caso complejo real — pueden tener condiciones propias no cubiertas por el vocabulario actual.
El field `condition` estuvo en el schema de `ability-stats.override.json` y fue removido por desuso; la infraestructura conceptual existe.
**Pregunta:** ¿Cuándo y cómo se reintroduce `condition` en ability-stats? ¿Los augments requieren tokens nuevos o extienden el vocabulario existente?
**Pendiente de:** revisar los `.md` de referencia de Warframes para identificar casos reales de conditions en abilities y augments. Hoy no hay evidencia sistematizada.
**No bloquea** el vocabulario de weapons/mods/arcanes ni el engine actual.

---

## OQ-W-7 — Double-scaling y semántica especial de upgrade_by — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → engine / formulas
**Contexto:** Dos categorías de edge-cases detectadas en la auditoría del diccionario (2026-05-26):

**A — Double-scaling:** dos abilities tienen un stat que escala simultáneamente con dos modificadores distintos:
- `Gara Mass Vitrify` → `Max Radius: 11m $DURATION $RANGE`
- `Harrow Covenant` → `Energy Conversion: 15% $EFFICIENCY $STRENGTH`
El parser `apply-ability-md.ts` toma solo el primer token y emite `console.warn`. ~~El schema no soporta `upgrade_by[]` (array)~~ — **resuelto 2026-05-26**: `AbilityStatEntry.upgrade_by` ahora acepta `AbilityUpgradeBy | AbilityUpgradeBy[]`; el engine usa `[0]` hasta que exista `formulas/ability/`. Límite activo: engine + fórmula, no schema.

**B — Tokens válidos en contexto no-estándar:**
- `Lavos`: `$EFFICIENCY` → `ENERGY_COST` pero Lavos no tiene pool de energía — `EFFICIENCY` reduce cooldown, no energy cost.
- `Grendel Feast`: `$EFFICIENCY` → `ENERGY_COST` pero el drain es de salud (`<HEAL>`), no de energía.
- `Nidus Virulence`: `$EFFICIENCY` → `ENERGY_COST` con efecto *negativo* — Efficiency reduce el Energy Refund, no el coste. El campo `inverse: true` existe en el schema pero no está anotado.

**Condición para resolver:** cuando se empiece a trabajar con `upgrade_type` (que abre más edge-cases) o al generar tests masivos del engine con datos reales. Estos casos dependen de fórmulas dedicadas por habilidad.
**No bloquea** el pipeline de datos ni el schema actual.
**Fuente:** `references/game-ui/Gara.md`, `references/game-ui/Harrow.md`, `references/game-ui/Lavos.md`, `references/game-ui/Grendel.md`, `references/game-ui/Nidus.md`

---

## OQ-DATA-3 — Contrato de consumo de overrides: DataLoader singleton — **DIRECCIÓN ELEGIDA (2026-05-29)**
**Dominio:** data / pipeline / engine / UI
**Contexto original:** `ability-stats.override.json` era bidireccional (el pipeline lo leía Y lo escribía). Los demás overrides eran runtime-directos con loaders fragmentados por repositorio (ItemRepository, ModRepository, IncarnonRepository). No había capa unificada.

**Corrección aplicada (2026-05-29):**
- `generate-data.ts` ya no lee ni escribe `ability-stats.override.json`.
- El pipeline produce únicamente datos de fuente externa (`@wfcd/items`).
- La gestión de `ability-stats.override.json` es responsabilidad de `apply-ability-md.ts` (script de ejecución manual/agente).
- Todos los overrides son SSoT manuales, sin distinción de "tipo" por fuente de creación.

**Dirección elegida: Runtime-universal con DataLoader singleton**
Todos los overrides se cargan en runtime por un DataLoader singleton que expone cada par `JSON base + override` ya mergeado. El pipeline no toca los overrides. Cada repositorio (ItemRepository, ModRepository, etc.) pasa a delegar al DataLoader en vez de implementar su propio loader.

**Estado:** implementación de DataLoader pendiente. La corrección de `generate-data.ts` es el primer corte limpio.

**Patrón objetivo:**
```
generate-data.ts → JSONs base (warframes, weapons, mods, ...)
apply-ability-md.ts → ability-stats.override.json  (script manual)
[otros scripts]    → otros overrides                (manual/agente)

DataLoader.getWeapons()       → weapons.json + weapon-stats.override.json  (mergeado)
DataLoader.getMods()          → mods.json + mod-stats.override.json         (mergeado)
DataLoader.getWarframes()     → warframes.json + ability-stats.override.json (mergeado)
DataLoader.getIncarnonData()  → incarnon-evolutions.override.json           (directo)
```

**Bloquea:** diseño de la interfaz pública del DataLoader singleton.
**Ref:** `docs/data/rules/overrides.md` (D-1), `docs/data/decisions.md` (D-1)
