---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.10.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-06-03"
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

**Vínculo (2026-06-02):** la ubicación del **puente de patrones estructurales** (stacking/duration, ver `OQ-DATA-4`) depende de esta decisión — mismo eje semantic-vs-data. No se crea ese puente hasta resolver esta OQ; captura provisional en `audit-*.md` + `status.md`.

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

---

## OQ-DATA-4 — Patrones estructurales transversales (stacking / duration / composición de condition) — **ABIERTO (2026-06-02)**
**Dominio:** data / schema (mods + arcanes + incarnon + archon)
**Contexto:** stacking, duration y la composición OR/AND de `condition` son conceptos **análogos** en los 4 schemas, hoy resueltos de forma divergente (mods: stacking=total, D-15 §2; arcanes familia Merciless: `base_value: null` + nota). La divergencia nació de resolver cada schema por separado — aislar produce drift. El criterio de **cuándo** acuñar estructura está fijado en `decisions.md#D-20` (≥2 casos misma forma + gate de consumidor + escape hatch como hipótesis con contador). Passives queda **fuera**: no existe como schema y su heterogeneidad (ley de juego / daño / mod-like / casi-habilidad) indica que no es un schema único — sus casos se reparten en las puertas de D-20.

**Preguntas abiertas:**
- **Ubicación del puente** (definición canónica cross-schema de stacking/duration): es una instancia de **OQ-DATA-2** (semantic vs data para conceptos que son ambos). **No se crea puente hasta resolver OQ-DATA-2** — captura provisional en `audit-*.md` + `status.md` (decisión del usuario, 2026-06-02).
- **Composición de `condition` (OR/AND):** `condition: string | null` no expresa `A AND B` ni `A OR B`. Evidencia actual en arcanes: **1 sola composición real** (Melee Afflictions, fuera de scope) sobre dataset incompleto. No se diseña lenguaje de expresiones hasta masa crítica (≥2, D-20) **Y** cobertura ≥70% (D-16) — antes sería adivinar la forma. Un array plano de tokens tampoco sirve (no distingue AND de OR). Contador vivo en `audit-*.md`.
  - **Afinado (2026-06-03):** el eje a decidir no es solo "string vs lenguaje de expresiones" sino **`string → array → objeto`**, con el criterio del usuario: que OR/AND sea **derivado de la estructura del dato** (validable mecánicamente por la *forma*), no lógica aplicada por encima — objetivo de schema *"legible y funcional, derivado de la estructura"*. Trade-off asumido: más denso y menos flexible estructuralmente, a cambio de precisión a nivel engine. **Orden:** se teoriza OR/AND **antes** de cualquier prototipo de gramática (separador `:` / reglas de derivación tipo `nomenclature-grammar.md`); la gramática es *posterior* a fijar el shape. Teorización abierta — exprimir/expandir/romper el modelo, **sin objetivo de cierre**; sigue gateada por D-16 (≥70%) + D-20 (≥2 casos). Cobertura actual (2026-06-03): 404 token / 8 null cross-source (`conditions.md §Resumen`).
- **Scope-grupo de `condition`** (varios stats, una condición): hoy se resuelve **repitiendo** el token (precedente: Pax Soar, dos stats `while_airborne`). Scope-grupo es optimización anti-repetición, no expresividad — salvo semántica compartida no-replicable (p. ej. pool de stacks común entre efectos). Latente.

**Nivel resuelto (2026-06-02):** stacking/duration/condition viven a nivel **stat**, no entry — confirmado empíricamente: entradas multi-efecto (Merciless, Deadhead, Pax Soar) mezclan stats con y sin condición bajo el mismo arcano. El split `1 label = 1 stat` hace del stat el nivel natural.

**Bloquea:** unificación del modelado de stacking/duration entre los 4 schemas; diseño de composición de condition.
**No bloquea:** captura de datos actual (escape hatch clasificado, D-20) ni el engine Fase 0 (D-15).
**Fuente:** debate 2026-06-02 sobre la familia stacking on-event de arcanes; `docs/data/schemas/arcane/schema.md §3`, `docs/data/reports/audit-arcane.md`.

---

## OQ-DATA-5 — Weapon-type gate en arcanes: campo ausente en schema — **ABIERTO (2026-06-02)**
**Dominio:** data / schema (arcane) → UI / filter
**Contexto:** Varios arcanos tienen restricciones de tipo de arma que el schema actual no captura como campo estructurado. Casos identificados en auditoría 2026-06-02:

| Arcano | Restricción |
|---|---|
| Arcane Pistoleer / Ammunition Case | Dual Pistols (ambas manos) |
| Arcane Shotgunner / Primary Shotgunner / ShotgunVendetta | Shotguns |
| Longbow Sharpshot | Bows |
| Arcane Merciless / Deadhead / Dexterity | Primaria / Secundaria / Melee respectivamente (familia tripartita) |
| Residual Arcanes (Boils, Malodor, Viremia, Shock) | Kitguns exclusivamente |

Hoy esta restricción vive únicamente en el campo `label` como texto libre y en `notes[]` como anotación de trazabilidad. No hay campo `weapon_type` ni equivalente en el schema.

**Preguntas abiertas:**
- ¿Se agrega un campo `weapon_type: string | null` al schema de arcano? ¿Array para casos multi-restricción?
- ¿El filtro de UI consume este campo o deduce la restricción del label?
- ¿Afecta solo arcanos o también mods, incarnon perks? (Mods ya tienen sistema de tags — revisar si aplica el mismo patrón antes de diseñar separado.)

**Condición para resolver:** cuando exista un consumidor real (UI de filtro de arcanos, o engine que valide compatibilidad de equipamiento). Hoy es información display-only.
**No bloquea:** captura de datos, engine Fase 0, ni el schema actual.
**Fuente:** auditoría `docs/data/reports/audit-arcane.md`; arcanos ShotgunVendetta, AmmoEfficiencyOnSliding, LongbowSharpshot, familia Residual.

---

## OQ-SEM-2 — Eje organizador del mapa de clasificación de condition: ¿mecánica de juego o modelo de engine? — **ABIERTO (2026-06-03)**
**Dominio:** semantic / conditions → engine
**Contexto:** `conditions.md` clasifica los tokens con `engine:class:c2/*` (binary / derived / event / stack / —). Ese eje describe **qué debería computar un `SimContext` que aún no existe** — está anclado al modelo de un engine hipotético, no a la mecánica real del juego. Resultado: un mapa que "medio existe y medio no", poco robusto, porque su criterio organizador es especulativo y se reordenaría solo cuando el engine se materialice.

**Pregunta:** ¿El mapa de clasificación de condition debe organizarse por **naturaleza/mecánica real del juego** —qué *es* la condición en el juego: estado del jugador, estado del target, evento de combate, maniobra de parkour, umbral de recurso, restricción de loadout— en vez de por el modelo de evaluación del engine? Bajo esta dirección, `engine:class:c2/*` pasa a ser una **proyección derivada** del mapa de naturaleza, no el eje primario.

**Relación:**
- El eje **scope** (weapon / avatar / companion / operator, derivado del prefijo de `upgrade_type`) es **ortogonal** a la naturaleza y debería vivir fuera de esta clasificación (constatado en sesión 2026-06-03 al triagear mods).
- Vínculo con **OQ-DATA-4** (gramática/shape de condition): la naturaleza real es candidata natural a ser el "sujeto/predicado" de esa gramática — por eso este eje conviene fijarse antes o junto con el shape OR/AND.
- Coherente con `conditions.md §Altitud de los debates` (taxonomía no consolidada; coherencia mínima, no rigor semántico hasta tener capas reales).

**No bloquea:** captura de datos ni el vocabulario actual — los tokens entran literal (D-19) independientemente del eje de clasificación.
**Fuente:** debate 2026-06-03 sobre cobertura y prototipado de taxonomía; `docs/semantic/conditions.md §Modelo de evaluación (engine:class:c2/*)`.

---

## OQ-DATA-6 — Set Mods: bonus de conjunto como entidad estructurada — **ABIERTO (2026-06-03)**
**Dominio:** data / schema (mods → sets) → engine / UI
**Contexto:** `@wfcd/items` expone los 91 mods miembro de los 19 sets (cada uno bajo `unique_name` `/Lotus/Upgrades/Mods/Sets/<Set>/...`) con su stat propio, pero **no expone el bonus de conjunto** — el efecto emergente que escala con el nº de piezas equipadas (ej. *"Gladiator Set: +X% melee crit per combo stack"*). Dos gaps separados (ver `docs/data/reports/audit-mods.md §Grupo D` y `docs/data/references/set-mods.md`):

- **Gap A — pertenencia al set:** sin campo agrupador, pero **derivable** del `unique_name`. Bajo riesgo → `pipeline:debt` (análogo a `conclave?: boolean`).
- **Portador existe, vacío:** cada set tiene una entrada `<Codename>setmod` con `type: "Mod Set Mod"` (discriminador limpio), pero con `description: ""` y `stats` sin tokens. Es la clave natural para colgar el bonus sin tocar los mods miembro.
- **Gap B — los valores del bonus:** ausentes. **No es un stat de ningún mod individual** sino un efecto del *set*, parametrizado por piece-count + condition propia. No cabe en `mod-stats.override.json` (shape per-mod). Es una **entidad nueva** (`set → {bonus, escala por piezas, miembros, condition}`). Valores ya investigados (wiki) en `references/set-mods.md`.

**Preguntas abiertas:**
- ¿Schema/entidad `sets` propia, o extensión del modelo de mods (override colgado del portador `Mod Set Mod`)? El bonus es un efecto **stacking por piece-count** → instancia de `OQ-DATA-4` (stacking + composición de condition); la escala 1→max es literalmente un array indexado por nº de piezas.
- **Eje de condition nuevo:** los bonus introducen `requires_<equipo>` (companion type, umbral mods, both pieces) ausente del vocabulario actual → cruzar con `OQ-SEM-2` (naturaleza de condition) antes de acuñar.
- La noción "nº de piezas equipadas" requiere conocer el loadout completo → cercano al patrón de materialización de `OQ-DATA-1`.
- ¿Gap A se resuelve como campo derivado en pipeline o como tag?
- **Hipótesis de procedencia (pendiente, 2026-06-03):** ¿el bonus es un **gap de datos** (warframe-items / `@wfcd/items` tampoco lo expone aguas arriba) o un **gap de pipeline** (el export raw sí lo trae y `generate-data.ts` lo descarta al construir `GeneratedMod`)? Verificable: inspeccionar el export raw del submódulo `warframe-items` para las entradas `type: "Mod Set Mod"`. Determina si la solución es arreglar el pipeline o capturar manual. Diferido hasta abordar el modelado.

**Condición para resolver:** cuando exista consumidor real (engine que compute bonus de set, o UI que lo muestre). Hoy es captura/investigación.
**No bloquea:** captura de datos, engine Fase 0, ni el override actual (los stats propios de los mods miembro ya viven bien en `mod-stats.override.json`).
**Vínculo:** `OQ-DATA-4` (stacking/condition), `OQ-DATA-1` (materialización de capacidades por loadout).
**Fuente:** auditoría `docs/data/reports/audit-mods.md §Grupo D`; captura `docs/data/references/set-mods.md`; debate 2026-06-03.

---

## OQ-DATA-7 — Archgun range vs melee reach bajo `WEAPON_ADD_RANGE` — **ABIERTO (2026-06-03)**
**Dominio:** data / semantic (mods) → engine
**Contexto:** tras acuñar `WEAPON_ADD_BEAM_RANGE` (D-17, 2026-06-03), `WEAPON_ADD_RANGE` queda con dos mecánicas: **melee reach** (canónico — Reach, Primed Reach, Extend, Necramech Reach) y **archgun range** (Ballista Measure, `+% Range` en contexto Archwing — afecta el alcance/fall-off en el espacio). No es la misma cantidad física que el reach de melee.
**Pregunta:** ¿el archgun range merece token propio (`WEAPON_ADD_ARCHGUN_RANGE` o similar), o se mantiene bajo `WEAPON_ADD_RANGE` con desambiguación por compat de arma? Requiere investigación concreta de la mecánica (wiki + datos) antes de decidir.
**Condición para resolver:** cuando se añadan más datos de Archwing/Archgun al repositorio o haya un consumidor de engine. Posible D-* propio o captura en D-17.
**No bloquea:** captura de datos ni el engine Fase 0 — Ballista Measure sigue mapeado a `WEAPON_ADD_RANGE` (modelo `—`, capture-only).
**Fuente:** investigación F.1, `docs/data/reports/audit-mods.md §F.1`; `docs/data/decisions.md#D-17`.

---

## OQ-DATA-8 — Unidad flat (`+Xm`) vs porcentaje (`+%`) bajo un mismo token de range — **ABIERTO (2026-06-03)**
**Dominio:** data / semantic / schema
**Contexto:** tanto `WEAPON_ADD_RANGE` como `WEAPON_ADD_BEAM_RANGE` mezclan unidades: flat en metros (`+Xm Beam Range` — Sinister Reach) y porcentaje (`+% Beam Range` — Galvanized Acceleration; `+% Range` — archgun). Hoy la unidad vive solo en el `label`; el token no la distingue. El mismo patrón existe en otros tokens del vocabulario.
**Pregunta:** ¿se diferencia la unidad estructuralmente (token o campo `unit`/operación distinta) o se mantiene en el label? Choca entre tipos de mod (flat-additive vs multiplicativo-%), con implicación en cómo el engine compone el valor.
**Condición para resolver:** etapa de conciliación muy temprana — diferir hasta tener más datos y un modelo de engine que consuma estos valores. No acuñar distinción de unidad prematuramente.
**No bloquea:** captura de datos ni el vocabulario actual.
**Fuente:** investigación F.1, `docs/data/reports/audit-mods.md §F.1`; `docs/semantic/upgrade-tokens.md` (filas range/beam).
