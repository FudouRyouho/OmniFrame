---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.34.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-07-03"
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

**Capa D / `ViewModelContract` — diseño activado (2026-06-10):** El **CLI oráculo** (ver [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §5) se vuelve el primer cliente real (no-UI), lo que **activa** el diseño de la Capa D. `consume()` (salida de C, en `@core`) es el puerto; el CLI lo consume como script. Su output crudo es **material** del que se deriva el contrato, no el contrato.

Principio decidido: `ViewModelContract` debe ser **consumer-shaped** (ViewModel de MVVM, `lib/*` como ingredientes), **no** producer-laundered (snapshot crudo re-exportado por `@shared` solo para legalizar el import). Sub-preguntas abiertas:
- **Forma del contrato:** ¿invariantes estructurados (`token + value + unit`, neutral a presentación, formateados por `lib/*` en el borde) o strings ya formateados? Inclinación: **estructurado**, para que CLI y UI compartan el mismo contrato. Se decide con material del CLI en mano, no en abstracto (derivar un consumidor a la vez).
- **Tensión "consumer-shaped" vs "compartido" (re-encuadrada 2026-06-13):** ser *consumer-shaped (ViewModel)* y a la vez *compartido CLI+UI* se contradice — conflaba **dos capas**. **OQ-ENGINE-10** lo desambigua: **D = contrato neutro** (token·value·unit, compartido por CLI y UI) y **E = el ViewModel real** (solo-UI, merge de chrome + iconos). El nombre `ViewModelContract` migra de D a **E**.
- **Simetría de entrada — RESUELTA (2026-06-12):** el contrato de intención (`ensemble.types`) cruza por `@shared/types/ensemble.ts`; el store (A1) vive en `@core/intention`; `EnsembleProvider` (`@providers`, composición) los conecta vía el ruling `@providers→@core`. Consolidó la deuda "ubicación de Capa A respecto a `@core`/`providers/`". Ver `closed-decisions.md` DC-OQ-ENGINE-9. (El gemelo de salida `ViewModelContract` sigue abierto.)

**No es OQ:** "¿pueden los dominios importar `@core`?" → **decidido NO** (reafirma Restricción 1; ver `arch-decisions.md` §7 y `decision-frontier.md` §1). `UpgradeView → @core` era drift — **corregido 2026-06-12** (consume `ViewModelContract` vía `useViewModel` en `@providers`). **Distinto de `@providers → @core`, que SÍ está permitido** (2026-06-12): `@providers` es capa de composición/adapter, no dominio de feature. Ver `closed-decisions.md` DC-OQ-ENGINE-9.

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
El parser `apply-ability-md.ts` toma solo el primer token y emite `console.warn`. El schema **ya soporta** `upgrade_by` como `AbilityUpgradeBy | AbilityUpgradeBy[]` (resuelto 2026-05-26); el engine usa `[0]` hasta que exista `formulas/ability/`. Límite activo: engine + fórmula, no schema.

**B — Tokens válidos en contexto no-estándar:**
- `Lavos`: `$EFFICIENCY` → `ENERGY_COST` pero Lavos no tiene pool de energía — `EFFICIENCY` reduce cooldown, no energy cost.
- `Grendel Feast`: `$EFFICIENCY` → `ENERGY_COST` pero el drain es de salud (`<HEAL>`), no de energía.
- `Nidus Virulence`: `$EFFICIENCY` → `ENERGY_COST` con efecto *negativo* — Efficiency reduce el Energy Refund, no el coste. El campo `inverse: true` existe en el schema pero no está anotado.

**Condición para resolver:** cuando se empiece a trabajar con `upgrade_type` (que abre más edge-cases) o al generar tests masivos del engine con datos reales. Estos casos dependen de fórmulas dedicadas por habilidad.
**No bloquea** el pipeline de datos ni el schema actual.
**Fuente:** `references/game-ui/Gara.md`, `references/game-ui/Harrow.md`, `references/game-ui/Lavos.md`, `references/game-ui/Grendel.md`, `references/game-ui/Nidus.md`

---

## OQ-DATA-4 — Patrones estructurales transversales (stacking / duration / composición de condition) — **ABIERTO (2026-06-02)**
**Dominio:** data / schema (mods + arcanes + incarnon + archon)
**Contexto:** stacking, duration y la composición OR/AND de `condition` son conceptos **análogos** en los 4 schemas, hoy resueltos de forma divergente (mods: stacking=total, D-15 §2; arcanes familia Merciless: `base_value: null` + nota). La divergencia nació de resolver cada schema por separado — aislar produce drift. El criterio de **cuándo** acuñar estructura está fijado en `decisions.md#D-20` (≥2 casos misma forma + gate de consumidor + escape hatch como hipótesis con contador). Passives queda **fuera**: no existe como schema y su heterogeneidad (ley de juego / daño / mod-like / casi-habilidad) indica que no es un schema único — sus casos se reparten en las puertas de D-20.

**Preguntas abiertas:**
- **Ubicación del puente** (definición canónica cross-schema de stacking/duration): **resuelta en `DC-OQ-DATA-2` (2026-06-05)** — el puente es estructura de schema, no vocabulario de significado → vive en `data/` (`rules/` o `schemas/`), no en `semantic/`. Su **creación** sigue gateada por D-20 (≥2 casos) + D-16 (cobertura ≥70%); captura provisional en `audit-*.md` + `status.md` hasta entonces.
- **Composición de `condition` (OR/AND):** **~9 composiciones reales** detectadas (2026-06-05) — 5 OR (`on_parkour_maneuver`, `on_shield_or_overguard_break`, `on_bullet_jump_or_double_jump`, + los 2 de movimiento ya migrados) + 2 AND evento∧estado (`on_hit_incarnon_form`, `on_hit_while_target_affected_by_electricity`) + Melee Afflictions (anidado). **El shape obj-key `{any|all}` ya está implementado y el engine lo evalúa** (`evalCondition`, Fase 3a); los 2 OR de movimiento (Fase 3b, `{any:[…]}`) y el primer AND `on_hit_while_target_affected_by_electricity` (Fase 4, `{all:[…]}`) ya migrados; `on_hit_incarnon_form` catalogado como **stub** (flag-paraguas, no descompuesto — granularidad de hit incierta: headshot/weakpoint/charged-blast, deuda `weak-points.md`). Todos los OR planos migrados (movimiento Fase 3b; break + maniobra Fase 4). Supera D-20 en masa para las formas planas; el prototipo sigue **no cerrado** (gateado por D-16 cobertura + el resto de la migración).
  - **Prototipo de shape (2026-06-05, HIPÓTESIS ABIERTA, no cerrado):** `condition: string | {any:[…]} | {all:[…]}` — `any`=OR, `all`=AND como **intención explícita del autor** (no derivable de la sintaxis: `["while_aim","while_airborne"]` puede ser AND co-ocurrente u OR de alternativas). Un nivel, sin anidar. Frontera (→ fórmula dedicada): anidado, secuencial/acumulativo (eje `duration`, **separado** de condition), relacional (variable ligada, p.ej. Primary Debilitate); multi-efecto se disuelve antes por split D-18. Documentado a nivel flujo en [`docs/data/rules/overrides.md` §Prototipo de condition](../data/rules/overrides.md); la **granularidad** que el shape necesita se formaliza en [`docs/semantic/condition-nature.md`](../semantic/condition-nature.md) (naturaleza facetada + reglas de composición + exclusión mutua). **Próximo paso:** leer casos mapeados de composición y razonar su comportamiento bajo obj-key antes de acuñar. Un array plano *sin* operador explícito quedó descartado (no distingue AND de OR; derivar el operador del prefijo colapsa casos).
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

**Avance (2026-06-05):** [`docs/semantic/condition-nature.md`](../semantic/condition-nature.md) formaliza la taxonomía de naturaleza **a título de análisis** (4 naturalezas: evento/estado/umbral/escala × scope ortogonal; 145 tokens, 0 huérfanos). Adopta la naturaleza como eje primario y proyecta `engine:class:c2/*` como derivada — **contraste vivo, no cierre**. Si el eje se torna ambiguo al madurar, se debate aquí su destino.
**No bloquea:** captura de datos ni el vocabulario actual — los tokens entran literal (D-19) independientemente del eje de clasificación.
**Fuente:** debate 2026-06-03 sobre cobertura y prototipado de taxonomía; `docs/semantic/conditions.md §Modelo de evaluación (engine:class:c2/*)`; `docs/semantic/condition-nature.md`.

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

---

## OQ-ENGINE-7 — Materialización de nodos de atributo de arma faltantes (Capa 4) — **ABIERTO (2026-06-06) — avance 2026-06-10**
**Dominio:** engine / hydration
**Contexto:** ~18 tokens `WEAPON_*` catalogados y mapeados producen un `Modifier` correcto, pero **ningún nodo lo recibe**: `ItemRepository.getDNA()` / `createBaseEntity()` solo materializa ~8 nodos de arma (crit chance/mult, status chance, fire rate, multishot, magazine, reload, daño). El resto (`punch_through`, `recoil`, `zoom`, `projectile_speed`, `ammo_max`, `headshot_mult`, familia `combo_*`/`heavy_*`, etc.) se evapora silenciosamente. **Caso disparador:** `WEAPON_FLAT_PUNCH_THROUGH` (rename cerrado 2026-06-06; op `ADD_FLAT` correcta vía `resolveToken`; 10 mods + 7 stats incarnon) — el token está bien resuelto pero no hay nodo `PUNCH_THROUGH`.
**Pregunta:** ¿cómo y cuándo el engine materializa estos nodos? Separar los **tres ejes** (no conflacionar):
- **(a) Operación del upgrade** — ya resuelta para punch through (`ADD_FLAT`, flat post-escala).
- **(b) Dato base faltante** — ¿de dónde sale el valor nato del arma? (la mayoría = 0m; innatos como Lanka 5.0m / charged-shot only / forma incarnon — ver `references/wiki/mechanics/punch-through.md`). ¿Lo expone `@wfcd/items` en el raw, o requiere override por-arma?
- **(c) Resolución del ataque** — ¿el stat computa o es display-only? Punch through no modifica daño directo; cambia geometría de penetración (cuántos blancos atraviesa) — depende de un modelo de impacto que aún no existe.
**Condición para resolver:** cuando el foco *weapons* llegue a Capa 4 (prioridad 2 del inventario, tras Capa 3 ya cerrada). Probable que se resuelva por familias de nodo, no token a token.
**No bloquea:** captura de datos ni el vocabulario (token ya correcto y aplicado).
**Progreso Capa 4 (2026-06-10) — 3 nodos materializados; frente PAUSADO en ammo. Los "moldes" de base son el patrón reusable para el resto de la capa:**
- **`punch_through`** ✅ (ejes a+b) — molde **override**: `override per-ataque ?? raw ?? 0` (el raw expone el campo pero vale 0 en 100% del dataset; innatos vía `weapon-stats.override.json`). Op `ADD_FLAT`. Consumidor `lanka.test.ts`.
- **`projectile_speed`** ✅ — molde **raw**: base = `flight` (m/s reales), op `ADD` (%). Gate durable **`flight != null` (ausencia ≠ 0)**: hitscan (274/274 null) → nodo *ausente*, no `base:0` (tratarlo como 0 daría velocidad espuria). Consumidor `cedo-prime.test.ts`.
- **`recoil`** ✅ (solo valor) — molde **sintético**: base `100` incondicional (no hay dato absoluto público; DE lo tiene interno/oculto, solo semántica relativa "% sobre el nato"), op `ADD` bidireccional. Consumidor `lanka.test.ts`.
- **Patrón validado:** una clave en `getDNA()` por stat + override per-ataque para innatos; `createBaseEntity` ya acepta todo `isUpgrade()`.

**Sigue abierto:**
- **(c) resolución del ataque** — el eje abierto de fondo: los nodos computan valor en C1 (metros, m/s) pero su *efecto* es **C2** (geometría de penetración, falloff) — `it.todo` en los consumidores. Sub-caso `projectile_speed`: hitscan-con-falloff es una mecánica C2 entera (`daño(distancia)`, spec `damage-falloff.md`); dónde aterriza el % de speed con gate `flight=null` se decide con consumidor C2, no antes.
- **`recoil` = nodo inerte hasta modelar** (sub-OQ) — es *camera feel*, ni C1 ni C2 lo computan; el número es correcto pero "muerto" hasta decidir cómo se modela/usa y cómo se representa en UI. Satélites: clamp de sobre-reducción (`final<0` → ¿ley C1 o presentación D?), aim vs hip recoil (sin dato público), fire-rate↑recoil. Deuda de datos: Stabilizer/Steady Hands no curados en `mod-stats.override.json`.
- **ammo — frente pausado:** `ammo_max` = **deuda de FUENTE** (`@wfcd/items` no expone ammo max, 0/340; el real solo en wiki → no se materializa con base sintética para no descartar el dato real; pariente eje b). `ammo_efficiency` = **no encaja en los moldes** (acumulador base 0, op `ADD` no compone sobre 0; efecto `1/(1−eff)` es C2; 2 mods condicionales) → modelado pendiente de un caso real (Laetum).
- **Próximos candidatos sin tocar:** `zoom`, `headshot_mult`, familias `combo_*`/`heavy_*`, `slam_*`. Retomar tras la campaña de saneamiento de `references/wiki/` (`doc-map.md §5`).
**Fuente:** `.working/engine-ignorance-inventory.md §Capa 4`; `references/wiki/mechanics/{punch-through,projectile-speed,accuracy}.md`; `docs/semantic/upgrade-tokens.md` (filas `WEAPON_FLAT_PUNCH_THROUGH`, `WEAPON_ADD_PROJECTILE_SPEED`).

---

## OQ-ENGINE-8 — "Proyección" sobrecargado: nombre de Capa D vs payload de salida de C — **ABIERTO (2026-06-10)**
**Dominio:** engine / vocabulario de capas
**Contexto:** Al nombrar el módulo de salida de C (PASO 1 del oráculo CLI), surgió que la palabra **`Proyección`/`projection` se usa en dos sentidos en conflicto**:
- **Nombre de la Capa D** — `### Capa D: Proyección (Reactive View Bridge)` (`simulation-architecture.md §Capa D`). El consumo derivado/reactivo (`ViewModelContract` + mapping), fuera de `@core`.
- **Nombre del payload que emite C2** — `ProjectionSnapshot` (`contracts/index.ts:107`, comentado `// UI Projection Layers`), que **C2 emite** y D **recibe** (`simulation-architecture.md §C2/§D`).

O sea: la palabra que titula la Capa D también bautiza el payload del lado-productor (C). La conflación está cristalizada en el comentario `// UI Projection Layers` sobre un tipo que es salida de C, no de la UI. Esto debilita la cuña **"salida de C ≠ Capa D"** que `arch-decisions.md §6-7` acaba de clavar: por eso `projection/` quedó **vetado** como nombre del módulo de salida de C (se eligió `output/`), aunque por el *nombre del payload* (`ProjectionSnapshot`) habría sido herencia directa.

**Pregunta:** ¿se renombra el payload de C para sacarle la palabra de D (p. ej. `EngineSnapshot` / `ResolvedSnapshot` / `CSnapshot`), reservando `Proyección/projection` exclusivamente para la Capa D? ¿O se acepta la sobrecarga y se desambigua por contexto?
**Inclinación:** rename del *tipo* (no del directorio, ya resuelto `output/`) cuando se materialice la Capa D y haya que tocar el contrato de todas formas — evita un rename especulativo hoy. El comentario `// UI Projection Layers` es el primer candidato a corregir (el payload no es de la UI).
**No bloquea:** PASO 1 (extracción de `consume()` a `output/`), ni el engine actual. Es deuda de vocabulario.
**Vínculo:** `OQ-ENGINE-FUTURE` (diseño de `ViewModelContract` / materialización de Capa D — momento natural para el rename); **OQ-ENGINE-10** propone la dirección del rename (D → nombre neutro; "ViewModel"/"View" → Capa E).
**Fuente:** debate 2026-06-10 sobre el nombre del módulo de salida de C; `arch-decisions.md §6-7`; `simulation-architecture.md §Capa C2/§Capa D`; `contracts/index.ts:106-115`.

---

## OQ-ENGINE-9 — Estructura interna de `@core/engine` y ubicación del harness de consumidores — **PARCIALMENTE RESUELTO (2026-06-12)**
**Dominio:** engine / arquitectura de `@core`
**Contexto:** Al extraer el harness compartido tests↔CLI (bootstrap de data + intenciones-fixture) no había ubicación clara en `@core/engine/` para scaffolding de **consumidores no-dominio**. Se resolvió pragmáticamente en `@core/engine/fixtures/` (provisional), que además **mezcla** dos cosas distintas: el bootstrap (carga de data real del juego — lado A) y las intenciones-fixture (builds predefinidas — input de prueba). Se suma al olor ya acumulado: nombres solapados (OQ-ENGINE-8), Capa A co-ubicada en `providers/`, `useSimulation` (D parcial) dentro de `@core`, `output/` (salida de C). `@core` creció sin una estructura interna deliberada.
**Pregunta:** ¿Cómo se reestructura internamente `@core/engine`? Ejes: (a) separar bootstrap de fixtures; (b) dónde vive el harness de consumidores (lado-entrada) respecto al puerto de salida (`output/`); (c) Capa A fuera de `providers/`; (d) extraer la D-parcial (`useSimulation`).
**Gate:** la organización correcta se **deriva** de cómo consume la Capa D real — reestructurar antes es especulativo. Hasta entonces: ubicaciones pragmáticas + esta OQ como registro vivo del olor.
**No bloquea:** el harness compartido ni el CLI; las ubicaciones son provisionales y mecánicas.
**Vínculo:** OQ-ENGINE-8 (sobrecarga de naming), OQ-ENGINE-FUTURE (simetría de entrada / Capa A respecto a `@core`/`providers`).
**Fuente:** debate 2026-06-11 sobre extracción del harness tests↔CLI; `arch-decisions.md §6-7`.
**Ejes resueltos (rama `refactor/core-stage0-restructure`):** **(c)** Capa A fuera de `providers/` ✓ (Stage 0+1, 2026-06-12: `ensemble-store`→`@core/intention`, `ensemble.types`→`@shared`, reorg `engine/{resolve,simulate}`, `bridge`→`@core/bridge`; ruling `@providers→@core` PERMITIDO — detalle `closed-decisions.md#DC-OQ-ENGINE-9`). **(d)** por purga, no extracción (2026-06-16): `@core/engine/hooks/` era cluster muerto → purgado completo. **(a)** `loadEngineData` sacado de `fixtures/` → `@core/engine/bootstrap/` (2026-07-02); `fixtures/` ya solo aloja `builds.ts`.
**Sigue abierto — eje (b):** dónde vive el harness de consumidores (lado-entrada) respecto al puerto de salida (`output/`). Gated por la Capa D real.
**Backlog abierto — shape de la Capa A (usuario, 2026-06-16):** la estructura de las **intenciones** huele incoherente — `Ensemble` mezcla `slots`+`arcanes` y la forma de las intents en general pide una estructura más coherente → revisión de la Capa A. Pariente de "A2 nunca construido"; encaja con una fase futura de la campaña de saneamiento `@core`. No bloquea.

---

## OQ-DATA-9 — Origen de datos: `DataRegistry` como puerto normalizador (plano de memoria, "0") — **ABIERTO (2026-06-12)**
**Dominio:** data / integration / arquitectura de acceso

**Contexto:** El modelo de capas (`simulation-architecture.md`) define el "Flujo de Verdad" A→B→C→D pero **presupone el dataset ya materializado en memoria**: ninguna capa posee la *carga*. B lee "el dataset", C1 hidrata "desde dataset + DNA", pero *quién lo carga* quedó huérfano. Resultado: la carga proliferó en **islas paralelas** que leen los mismos JSON sin coordinarse (audit 2026-06-12):

- **`lib/*-data.ts`** (7 fetchers) — `fetch` + hidratación a shape display. Consumidos **1:1** por los 7 DetailViews de `/equipment/<x>/<id>` (warframe, weapon, mod, arcane, companion, vehicle, archwing).
- **`shared/data/DataRegistry.ts`** (`Registry`) — auto-rotulado "Single Source of Truth", `fetch` + hidratación + `getByDomain/Kind/Id`. Consumido por la grilla (`OmniView`/`use-items`) y el arsenal (`ArsenalView`, `ModSlot`, `HudHeader`). **SSoT a medio adoptar.**
- **`core/engine/bootstrap/engine-data.ts`** → `DataLoader` — `import` estático de 7 JSON → repositorios DNA. Solo tests/CLI; **no cableado en runtime** (`DataLoader.init` nunca se llama en el bootstrap de la app).
- **Mini-fetchers** en `domains/arsenal/`: `use-archon-shard-catalog`, `use-incarnon-catalog`.

Síntoma concreto: `UpgradeView` (vía `useViewModel→consume`) corre el engine contra un `DataLoader` **vacío** en runtime. Tell de duplicación: `DataRegistry.hydrateAbility` es copia literal de `warframe-data.ts:hydrateAbility`.

**Modelo acordado (debate 2026-06-12):** La carga **no es una capa del flujo vertical** — es un **plano de memoria** ortogonal, direccionado por referencia. A guarda *punteros* (ids); B y la UI los *dereferencian* contra esa memoria (`A → B → obtiene 0 → C`; la UI de catálogo lee 0 directo). A **no** consume 0 (confirmado: `ensemble-store` no importa datos). Regla `datos vs información`: 0 entrega *datos canónicos*; los consumidores derivan *información*.

- **0 = `DataRegistry`** (nombre conservado: "registra los datos en memoria"; `Catalog` descartado por sonar a UI). Responsabilidad: **puerto normalizador** = `load (adapter) + merge de overrides + resolución de refs` → registro canónico. Es *puerto* (ports-and-adapters): JSON-hoy / DB-mañana son adapters intercambiables detrás de la misma interfaz.
- **Frontera anti-god-object (β):** 0 normaliza *datos* (corrige/completa el valor — un override es *el valor verdadero*, no un cómputo), NO construye *información* (ni el grafo DNA del engine ni el shape display de la UI). Test de pertenencia: ¿X *corrige* el valor → 0; ¿X *deriva* del valor → consumidor.
- **Dos proyecciones sobre el puerto:** hidratación del engine (→ DNA/grafo, B/C1) y `DataRegistry`-proyección-catálogo (→ display). Una sola *carga* + normalización única; cada consumidor proyecta su forma. Beneficio neto: hoy el catálogo mergea unos overrides y el engine otros — **ninguno tiene el registro completo**; 0 mergea todo una vez.
- **Fidelidad forzada por el swap:** `/arsenal/` compara "equipado (base)" vs "a equipar (C1)" lado a lado → el número base **no puede tener dos fuentes**: debe estar fidelity-locked al bucket `Base` de C1. Chrome (nombre/imagen/desc, que C1 no modela) sale de 0 por read fino. El proyector compone ambos.

**Sub-decisiones abiertas (la arquitectura está acordada; la ejecución no):**
- **Contrato de entrada del engine:** hoy `StaticHydrator`/repositorios aplican overrides ellos mismos. Bajo β pasan a consumir dato pre-normalizado → cambio al input de `@core` (RED-adjacent: le saca trabajo, no le agrega). ¿Cómo se corta?
- **Split puerto vs proyección-catálogo:** ¿`DataRegistry` es a la vez puerto + proyección-display, o se separa `load+normalize` (puerto) de `→ shape display` (proyección)?
- **Mecanismo de carga:** runtime debe usar `fetch` (lazy, fuera del bundle); el `import` estático del engine es un test-ism. Los tests inyectan por el mismo puerto (seam de adapter).
  - **Avance 2026-06-12 (rebanada vertical, provisional):** cableado el bootstrap de runtime que faltaba — `main.tsx` ahora llama `loadEngineData()` antes de `createRoot` (el engine ya no corre contra repos vacíos). Reúsa el loader **por import estático** de `fixtures/` (no β, no toca el contrato de `@core` — invoca lo que ya existe). **Evidencia empírica del costo del estático:** `vite build` pasa pero el chunk principal salta a ~2.3 MB (gzip 431 KB, warning de tamaño) — los 7 JSON quedan en el bundle. Confirma que el mecanismo final debe ser `fetch` lazy. **Confirmado visual end-to-end (2026-06-12):** varios warframes muestran números reales del motor en `StatPanel`. Deuda registrada: sacar `loadEngineData` de `fixtures/` + migrar a fetch.
  - **Avance 2026-06-13 (Fase 1 completa) + 2026-07-02 (Fase 2 Slice E):** el `fetch` lazy ya está resuelto — `BrowserAdapter` (Fase 1) reemplazó el `import` estático, bundle 2.3 MB→565 kB. `loadEngineData` ya salió de `fixtures/` → vive en `@core/engine/bootstrap/engine-data.ts`. De la deuda registrada acá, ambos puntos quedan cerrados; ver `OQ-DATA-12` para el detalle.
  - **Bug colateral encontrado y cerrado durante la verificación (instancia fractal del defecto SSoT-duplicado):** el canal de armas (`primary`/`secondary`/`melee`) mostraba los stats del warframe. Causa: `UpgradeView` se había hecho un `channelMap` local divergente (claves `primary`) en vez de usar el SSoT `SLOT_TO_ENSEMBLE_CHANNEL` de ArsenalView (claves reales `primary_weapon`), y un fallback `|| "warframe"` enmascaraba el desajuste mostrando el warframe en silencio. Fix: extraído `SLOT_TO_ENSEMBLE_CHANNEL` a `domains/arsenal/slot-channel.ts` (SSoT único, consumido por ambos), borrado el mapa local y el fallback (ahora panel vacío honesto). Mismo patrón que OQ-DATA-10: un SSoT que existe + un consumidor que reinventa su copia divergente.
- **Backlog de migración — HECHO (2026-06-13):** colapsadas las 7 islas `lib/*-data.ts` + 2 mini-fetchers (→ `Registry.getCatalog` + hook `useCatalog`); el lado **display** de "0" quedó consolidado en DataRegistry. El lado **engine** (carga runtime, `import`→`fetch`) se cerró en `DC-OQ-DATA-12`.
  - **Avance 2026-06-13 (colapso de las 7 islas `lib/*-data`):** los 7 DetailViews migrados a `Registry.getItemById`; los 7 `lib/*-data.ts` borrados. **Registry absorbió la hidratación de passives** (era exclusiva de `warframe-data` → ya no se pierde) y unificó el match en `matchesRouteIdentifier`. Ahora Registry es el merge display completo (abilities + passives + imágenes). tsc limpio. **Pendiente:** los 2 mini-fetchers son catalog-shaped (`Record<key,entry>`, no `BaseItem[]`) → requieren que Registry sirva forma-catálogo (un `getCatalog`) antes de colapsarlos; y el `import` estático del engine → `fetch`.

**Drift detectado (registrado; cerrar en la fase de construcción, no antes):**
- `DataRegistry` se declara SSoT en código y **ya es el SSoT display de facto** (2026-06-13): colapsada la isla `lib/*-data` + los 2 mini-fetchers catalog-shaped (archon/incarnon). El `DataLoader` del engine ya carga vía `fetch` lazy (Fase 1, `BrowserAdapter`) compartiendo instancia con `DataRegistry` — el import estático quedó atrás (`DC-OQ-DATA-12`). El tell de duplicación `hydrateAbility` se resolvió al borrar esa isla.
- `lib/image-url.ts:hydrateImageFromImageName` lo consume `DataRegistry` (lado **entrada/0**: la imagen es chrome, ver L296) pero el archivo mezcla ese hydrate con `resolveLocalImageUrl` (salida/display → DATA-10). Mismo archivo, dos bordes — separar al consolidar 0. (TODO inline del usuario 2026-06-13.)

**No bloquea:** captura de datos ni el schema. **Bloquea** el flujo C→D→UI en runtime (engine sin datos).
**Vínculo:** **corrige el encuadre de OQ-ENGINE-9 eje (c)** ("Capa A fuera de `providers/`"): lo que ahí se llamó "Capa A" conflaciona A (intención/punteros) con un concepto distinto y *upstream* — el puerto de datos (0), que **no es A**. También OQ-ENGINE-FUTURE (simetría de entrada respecto a `@core`).
**Fuente:** debate 2026-06-12 (raíz: quilombo de carga de datos detectado al desplegar la UI); audit de islas + consumidores en la misma sesión.
**Vínculo (par espejo):** **OQ-DATA-10** mapea el *borde de salida* (información → píxeles), simétrico a este borde de entrada. Entrada y salida son los dos bordes del mismo flujo de datos.

---

## OQ-DATA-10 — Borde de salida: capa de proyección como SSoT display (espejo de "0") — **stages A–D EJECUTADOS + Pre-E (análisis) CERRADO (2026-06-14); construcción de E DIFERIDA**
**Dominio:** **ui-ux / presentation** (owner) — par espejo de OQ-DATA-9 (data). *Reclasificada 2026-06-12: el formateo es responsabilidad de UI/UX, no de DATA.*

**⚠️ Cierre parcial (D-7 Fase 4, 2026-06-14):** se cerró el **lado SSoT de vocabulario** — el dict de presentación (`attribute-registry`) ya se cuelga del vocabulario canónico `Upgrade` (key-typed) y el **leak β murió** (`StaticHydrator` ya no importa `lib/presentation`; el nodo es puro; `project()` adjunta `unit`+`category` en el borde). El bug visible (crit sin `%`) está resuelto. **Sigue ABIERTO/DIFERIDO:** las 4 convenciones de formateo numérico (tell #2), la convergencia de los 3 vocabularios de **label** para la ruta catálogo (`stat-labels` vs engine), el dead-code `hydrateAttributeRegistry()` (tell #3), y el proyector unificado `StatEntry[]`. Ver §D-7 en [`../data/decisions.md`](../data/decisions.md).

**Prioridad (decisión 2026-06-12 — function-first):** DIFERIDA tras el hito funcional. El formateo (labels, unidades, locale, los 3 vocabularios, las 4 convenciones numéricas) es "que se vea bonito" — **no bloquea "que funcione"**. Primero hay que destapar y hacer funcional la UI (equip → engine → display correcto en todos los canales/entidades) para *poder definir si todo funciona*; recién con eso estable se ataca esta OQ. Los labels feos (`AVATAR ADD HEALTH MAX`) y headers crudos (`primary_weapon Upgrade`) son síntomas conocidos y aceptados mientras tanto.

**Contexto:** Mapeado el *borde de salida* (información → píxeles) como espejo de "0" (borde de entrada). [`presentation-layer.md`](../domains/ui-ux/presentation-layer.md) documenta un pipeline `i18n (labels) → item-details (mapeo a StatEntry[]) → componente (render)`. Verificado contra código (audit 2026-06-12): el mismo defecto raíz de la carga —**SSoT diseñado pero a medio adoptar + formateo ad-hoc en islas**— se repite, y *más fragmentado* que la entrada.

Mapa del borde:
- **`StatPanel` (`StatEntry[]`)** — **sumidero de render unificado**: todo converge aquí. El fork está *aguas arriba*, en cómo se proyecta a `StatEntry`.
- **`lib/item-details.ts`** (`getAttackStats`/`getModStats`) — proyector → `StatEntry[]` de la ruta **catálogo** (weapons+mods). **Vivo**, ~13 consumidores (panels + popovers de equipment).
- **`domains/arsenal/view/UpgradeView.tsx:38-44`** — proyector inline → `StatEntry[]` de la ruta **engine/D** (ViewModelContract). **Ad-hoc**, reinventa label (`.replace(/_/g," ").toUpperCase()`) y formato (`toFixed(1)+unit`) ignorando la suite. Es el frente activo (recién cableado D1) construyéndose a medio adoptar *desde cero*.
- **`FormattedText`** (tag `DT_*` → icono) — genuinamente compartido, **vivo**.
- **`lib/presentation/attribute-registry.ts`** — registro keyed por **id de engine** con `label+unit+category`. Semilla natural del proyector engine→display, pero **mal cableado** (ver leak abajo).

Tres tells de duplicación (espejo de OQ-DATA-9):
1. **Tres vocabularios de label** para el mismo concepto (stat → label+unit): `i18n/stat-labels` (ruta catálogo), `presentation/attribute-registry` (ids de engine), e inline en `UpgradeView`. Ninguno es el SSoT. **Afilado 2026-06-14 (trazo de `crit chance`, ver OQ-ENGINE-10):** el eje real no es "3 tablas sin SSoT" sino que **el SSoT semántico SÍ existe** (`upgrade-tokens.md`/D-6, consumido por C\*) y el plano `lib/*` **no lo consume** — nació antes del SSoT y mantiene vocabularios humanos pre-canónicos (`critical_chance`/`crit_chance`). Corolario verificado: `attribute-registry` está keyed por nombres humanos, no por los tokens `WEAPON_ADD_*` que el motor emite → el leak β `StaticHydrator→lib/presentation` **cae al fallback en silencio** (crit chance sale sin `%`, category `utility`). El fix de fondo es **re-keyar el registro por los tokens D-6 + derivar label/unit del SSoT semántico**, no acuñar una cuarta tabla.
2. **Cuatro convenciones de formateo numérico** simultáneas → *drift visible en el número*, no solo en el código: `item-details` (`Intl es-ES`, 2 frac) vs `WeaponDetailView` (`toFixed(0/1/2)` inline, mismos stats) vs `WarframeDetailView` (`Intl es-ES` inline; los warframes no existen en item-details) vs `UpgradeView` (`toFixed(1)`). Incoherencia extra: labels en inglés + números en locale `es-ES`.
3. **`hydrateAttributeRegistry()`** (rotulado "Pipeline SSoT futuro", cargaría `/data/engine/attribute-registry.json`) **nunca se invoca** — gemelo literal de `DataLoader.init` nunca llamado en el bootstrap (OQ-DATA-9).
4. **Dependencia invertida (leak β-análogo) — ✅ RESUELTO (D-7 Fase 4, 2026-06-14):** `StaticHydrator` (¡el engine, C1!) importaba `getAttributeMetadata` de `lib/presentation` y horneaba `label/category/unit` en el `AttributeNode`. Ahora el nodo es puro (sin meta) y la proyección la adjunta `project()` en el borde C→D (`@shared/view-model → @lib/presentation`, dirección correcta). `getAttributeMetadata` eliminado; reemplazado por `getPresentationMeta(id)` keyed por token.

**Juicio (acordado):** La suite de presentación **debe ser el SSoT del borde de salida, simétrica a `DataRegistry` en la entrada**. Simetría limpia con OQ-DATA-9: entrada = *puerto normalizador* (datos canónicos) con dos proyecciones (DNA-engine / display-catálogo); salida = *capa de proyección* (datos/información → forma display) alimentando el sumidero único `StatPanel`. Hoy el sumidero ya está unificado; lo que falta unificar es la **proyección**. El gap crítico/urgente es el proyector de la salida del engine (C→D), porque es el frente activo y se está construyendo ad-hoc.

**Sub-decisiones — DIRECCIÓN ACORDADA 2026-06-14 (debate de presentación; ejecución por stages, ver abajo):**
- **Proyector engine→display — DECIDIDO:** el proyector único `StatViewModel[] → StatEntry[]` vive en **`lib/format/`** (estrato React-free, consumido por **D1 (`UpgradeView`) y D2 (oráculo) por igual** — hoy ambos reinventan la proyección inline: `UpgradeView.tsx:68-75` y `oracle.ts:34-38` son **gemelos**). Razón dura del estrato: el oráculo corre en Node sin React → no puede importar `lib/presentation` (que tiene componentes). Mata las dos islas de una.
- **Convención única de formateo numérico — DECIDIDO:** NO es un `toFixed` global — es **data-driven `unit → regla`** (`%`→1 dec, `x`→2 dec, `s`→1 dec+"s", entero para multishot/magazine/daño), off la `unit` que ya lleva el registro. **Locale-free** (sin `Intl es-ES`, coherente con English-only OQ-UI-5; resuelve la incoherencia labels-inglés/números-locale). Vive en el proyector, no en el componente. **Se ataca AHORA** (no diferir — "para después" es exactamente lo que pasó con D-7).
- **SSoT de label+unit por stat — DECIDIDO (revierte conscientemente una sub-decisión de Fase 4):** UN solo mapa declarativo token-keyed. La **`label` vuelve al registro** (`{ label, category, unit }`), porque el split label↔(category/unit) **no tiene caso real**: i18n-por-token no existe e i18n está diferido (English-only) → dos mapas token-keyed = isla a sincronizar = la puerta falsa que veníamos matando. El registro se **muda `lib/presentation` → `lib/format`** (es dato puro, hoy mal ubicado en la carpeta de React) y se **renombra `stat-presentation`** (token→{label,category,unit}). Invariantes que NO cambian: `StatViewModel` sigue neutro (token·value·unit·category, sin label) y el nodo del engine sigue puro — la label entra solo en el borde (`StatEntry`), por lookup. Cuando multi-locale sea real, la label gradúa a i18n. **Sigue abierto:** la convergencia con la ruta **catálogo** (`stat-labels`, espacio de id `@wfcd/items`) — dos espacios de id, fuera de este corte.
- **Tipo `StatEntry` único — DECIDIDO:** hoy duplicado (`StatPanel.tsx:4` ≠ `item-details.ts:21`); converge a uno solo (el del sumidero), producido por el proyector.

**Plan de ejecución por stages (acordado 2026-06-14 — recon-per-stage, sin asumir el resultado del anterior; cada stage cierra con `tsc`+tests+confirmación). Backlog vivo: `.working/presentation-stages.md`:**
- **Stage A — mapa declarativo (data):** mudar `attribute-registry` (`lib/presentation` → `lib/format`) + renombrar `stat-presentation` + re-agregar `label`. Recon previo: capturar qué labels existen y dónde (`stat-labels`, inline en `UpgradeView`, ¿otros?) antes de poblar.
- **Stage B — proyector + formateo (lógica):** `toStatEntries(StatViewModel[]) → StatEntry[]` en `lib/format` (label por lookup + regla `unit→formato`). Unificar el tipo `StatEntry` duplicado. Recon: las 2 declaraciones + consumidores.
- **Stage C — cablear D1:** `UpgradeView` consume `toStatEntries`, borra su map inline. Checkpoint visual.
- **Stage D — cablear D2:** `oracle.formatStat` consume el mismo proyector (mata la isla gemela).
- **Stage E — pasada "Pre-E":** análisis (no construcción) de dónde/cómo ubicar la **Capa E** y su arquitectura interna, alimentado por lo aprendido en A–D. Alimenta **OQ-ENGINE-10** (E = confluencia info+chrome). No asume resultado: es captura→derivación para decidir si/cómo se construye E. **✅ HECHO 2026-06-14:** E NO es necesidad emergente (estrato 2 = `lib/format` ≠ E; retira el concern de islas). E **estacionado**, gated por consumidor UI real. Hallazgo cross-cutting: la UI nunca tuvo su corpus → **campaña de docs de UI** (próxima sesión, antes de leer código). Bajado a OQ-ENGINE-10 (Resultado Pre-E).
- **Fuera de corte (sigue OQ-DATA-10/ENGINE-10):** convergencia ruta-catálogo↔engine, construcción de Capa E real, las piezas straddle (`image-url`).

**Drift detectado (registrado; cerrar en la fase de construcción):**
- `hydrateAttributeRegistry()` muerto (nunca llamado).
- `presentation-layer.md` (v0.0.2, abr-2026, nunca formalizada) describe el pipeline como si estuviera adoptado; no menciona la ruta engine/D ni las islas ad-hoc.
- `lib/image-url.ts` se auto-rotula `@SSoT` pero **straddlea los dos bordes**: `resolveLocalImageUrl` (img-name → URL display, 3 consumidores UI) es proyección de **salida**; `hydrateImageFromImageName` es chrome de **entrada** (lo usa `DataRegistry`/0 → ver DATA-9 L296). El SSoT declarado es falso; la pieza display debería vivir en la suite de proyección, no en `lib/` suelto. (TODO inline del usuario 2026-06-13.)
- `PreviewPanel` (aside name/desc/stub-flag) — TODO inline del usuario: el "panel de stats" se repite en varios lugares sin SSoT; candidato a converger en la proyección (parte de la responsabilidad pasa por Capa D).

**No bloquea:** nada hoy (la UI renderiza). **Gated por:** la misma fase de construcción que OQ-DATA-9 (cablear 0 / engine en runtime); construir el proyector unificado sin esa base sería prematuro.
**Vínculo (par espejo):** **OQ-DATA-9** (borde de entrada). También OQ-ENGINE-8 (sobrecarga "Proyección": ojo, "proyección de salida de C" vs "proyección display" son ejes distintos) y `DC-OQ-UI-1` (unificación de infra UI @shared). **OQ-ENGINE-10** nombra este borde como capa (E/Presentación) y ubica esta suite de formateo como su **estrato compartido** (el que consumen tanto el CLI como E).
**Fuente:** diagnóstico 2026-06-12 (arco entrada↔salida; audit de la suite vs formateo ad-hoc, sin tocar código).

---

## OQ-DATA-11 — Compatibilidad de mods por entidad: no materializada — **ABIERTO (2026-06-12)**
**Dominio:** data / semantic / compatibilidad (hermana de OQ-DATA-1, que cubre slots)

**Contexto:** Al cablear el filtro de compatibilidad del picker de mods en `UpgradeView` (que un arma muestre solo sus mods) se destapó que **la relación de compatibilidad mod↔entidad no está modelada en la data**:

- **`tags: []` vacíos en los mods.** La única señal de compat es `compat_name` (string: `"Rifle"`, `"Shotgun"`, `"Sniper"`, `"Pistol"`, `"Melee"`, `"WARFRAME"`, nombre de arma para augments, o `null`). → **Restricción 3 ("filtros de UI dependen de `tags`") no puede aplicarse a mods tal como está la data.** El fix correcto es enriquecer los mods con compat en `tags`.
- **Matriz muchos-a-muchos ausente:** en el juego, mods `Rifle` caben en rifle + sniper + bow; `compat_name` da una sola clase, y el cruce (qué clases acepta cada `family` de arma) no vive en ningún lado (ni tags, ni tabla). Es conocimiento de dominio sin materializar.
- **Duplicados en `mods.json`** (p.ej. Serration ×3, Adaptation ×2) — bug del pipeline de datos; la fuente está sucia.
- **`useItemsFilters` (`domains/equipment`) no es reutilizable desde `domains/arsenal`** (Restricción 1). Si se quiere una sola lógica de filtrado de ítems, debe moverse a `@shared`.

**Stopgap vigente (no es la solución):** `UpgradeView` filtra inline por comparación campo-a-campo `mod.compat_name ↔ entity.family` (arma) / `entity.domain` (warframe) + dedup. Data-driven (no matriz hardcodeada, respeta el espíritu de Restricción 3), pero **incompleto**: oculta augments, universales y el cruce de tipos (sniper/bow no ven mods `Rifle`). Marcado PROVISIONAL en el código.

**Confirmado en runtime (2026-06-12), gated por esta OQ (no se arregla hasta materializar):**
- **Secondary roto:** `Afuris.family = "dual pistols"` (con espacio) vs `compat_name = "Pistol"` (139 mods) → exact-match da **cero → picker vacío**. Igual con `family = "throwing"` (Kunai). Las familias granulares que NO coinciden con su clase de mod: `dual pistols`/`throwing` → `Pistol`; `sniper`/`bow` → `Rifle`. (Melee/rifle/shotgun/pistol funcionan solo porque `family` == `compat_name` literal.)
- Decisión del usuario: dejar secondary gated por esta OQ (no stopgap por ahora).
- **Arcanos = caso más limpio (resuelto en v1):** `arcanes.json.compat_name` está a granularidad de **canal** (`warframe`:67, `primary`:13, `secondary`:17, `melee`:11, + `operator`/`amp`) — sin el cruce muchos-a-muchos de las armas. `UpgradeView` ya filtra arcanos por `compat_name === channel` (match directo, limpio). **Gated solo los sub-tipos:** `zaw`→melee, `kitgun`→primary/secondary, `bow`/`shotgun`→primary (~19 arcanos) quedan ocultos hasta materializar el alias sub-tipo→canal. Confirma que el fix correcto es por-fuente: la compat de arcanos ya es usable, la de mods no.

**Pregunta:** ¿Dónde y cómo se materializa la compatibilidad mod↔entidad? Opciones (espejo de OQ-DATA-1):
- (a) Enriquecer cada mod con `tags`/clases de compat en la data (pipeline) → filtro por tags, Restricción 3 limpia.
- (b) Una matriz `family de arma → clases de mod aceptadas` como dato (no hardcode en componente).
- (c) Híbrido: `compat_name` se queda como clase base + matriz de cruce como dato.

**Vínculo:** **OQ-DATA-1** (par: slots = otra cara de "qué puede equipar/portar una entidad"); **Restricción 3** (`Project/CLAUDE.md`); capa "0" (la compat es dato canónico que 0 debería normalizar/entregar). Bonus: dedup de `mods.json` toca el pipeline de datos (OQ-DATA-9 / status de datos).
**No bloquea:** el loop equip→stat (funciona); sí degrada la usabilidad del picker para tipos no-rifle.
**Fuente:** implementación del filtro de compat 2026-06-12 (rebanada UI mínima funcional; ver `UpgradeView.tsx`).

---

## OQ-DATA-12 — Carga de runtime del engine: import estático → fetch — **CERRADA (2026-07-02) → migrada a `closed-decisions.md` (`DC-OQ-DATA-12`)**
Cerrada por Fase 1 (`fetch` lazy vía `BrowserAdapter`, bundle 2.3 MB→565 kB) + Fase 2 Slice E (`loadEngineData` → `@core/engine/bootstrap/`) de la campaña de saneamiento `@core`. El eje RED-adjacent "contrato de entrada del engine" (β) sigue abierto en **OQ-DATA-9**. Detalle completo: `closed-decisions.md#DC-OQ-DATA-12`.

---

## OQ-DATA-13 — Render de íconos/nodos de habilidad: lógica duplicada sin SSoT de presentación — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / presentation (hermana de OQ-DATA-10)

**Contexto:** Mostrar los íconos/nodos de habilidades de un warframe está **duplicado y disperso**, sin un solo lugar:
- `WarframeDetailView` (`AbilityCard`) lo implementa una vez.
- `ArsenalPreviewPanel` (`slot.showAbilityNodes`, ~L383) repite una variante.
- Los popovers de detalle (`WarframeDetailsPopover` y hermanos) **deberían** mostrar al menos los íconos de habilidad y hoy **no lo hacen**.
- Relacionado (mismo molde, shards): `ArchonShardSelectionView` (selector de tipo, L102) y `ArsenalView` (slots de shard, L332) renderizan **dos veces** la misma lógica "estado→ícono por imagen" del shard. Dos TODO inline del usuario (2026-06-13) piden extraer la util compartida a `lib/*`.

**Pregunta:** ¿Dónde vive el componente/derivación único de "render de habilidad (ícono + nombre + desc)" para que los 3+ consumidores lo compartan? Es el mismo patrón SSoT-duplicado de presentación que OQ-DATA-10 (formateo) y el id-mismatch UI↔engine — un concepto de display sin fuente única.
**No bloquea:** función; es consistencia/DRY de presentación. Diferido con el resto del borde de salida (function-first).
**Vínculo:** **OQ-DATA-10** (borde de salida / suite de presentación como SSoT). Flags inline del usuario en `WarframeDetailView.tsx` y `ArchonShardSelectionView.tsx`.
**Fuente:** anotación del usuario 2026-06-13 durante la consolidación de "0".

---

## OQ-UI-2 — Estado de sesión/UI del usuario: ¿dónde vive en A→B→C→D→UI + 0? — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / arquitectura de estado (cruza 0, A, B, D)

**Contexto:** Existe un estado que el modelo de capas (`simulation-architecture.md`) **no nombra**: el *estado de sesión de la UI / del usuario* — qué slot está seleccionado, metadata visual de incarnon/focus/companion/vehicles, selección de shard en curso. Hoy vive en dos piezas con responsabilidades mezcladas:
- **`domains/arsenal/state/use-arsenal-stub-state.ts`** — store `useSyncExternalStore` module-level, marcado por el usuario como *"stub con pretensiones de intención de Capa A y mezcla de responsabilidades con B"*.
- **`domains/arsenal/arsenal-state.ts`** (`@status stub`) — tipos + defaults. `ArsenalMetadataSource = "core"|"dataset"|"mock"|"manual"|"unavailable"`: el propio shape **conflaciona** intención (A), dato canónico (0) y display/mock (B).

El principio *"la UI tiene la responsabilidad del estado del usuario"* se invoca entre líneas pero **no está documentado ni ubicado** en el flujo. Distinto de la intención de build (`EnsembleIntention`/`ensemble-store`, ya en `@core/intention`, A1 — *qué está equipado*); esto es *en qué está el usuario ahora mismo en la UI* (selección, navegación, metadata visual transitoria, build "sucia").

**Pregunta:** ¿Dónde vive el estado de sesión/UI y cómo se separa de las capas existentes?
- ¿Es un plano ortogonal (como 0 lo es para datos) — "estado de UI" que ni A ni B poseen?
- ¿Qué parte de `arsenal-state` es **intención** (→ A/`@core/intention`), qué parte es **dato** (→ 0/DataRegistry), qué parte es **display derivado** (→ proyección/D), y qué queda como **estado puro de UI** (selección/foco, propiedad legítima de la UI)?
- El shard ya vive bien en `EnsembleStore` (intención); el resto del metadata (incarnon/focus/companion) debe re-mapearse a su capa real.

**No bloquea:** la UI funciona (el stub anda). Es deuda de arquitectura de estado + documentación inexistente.

**Dirección de refactor (2026-06-13, ver `DC-OQ-ENGINE-10-C`):** la sombra `arsenal-state` se parte por **dos ejes ortogonales** que hoy funde:
- **Eje 1 — honestidad de intención (E-independiente, es el P0):** purgar fake-`A`+`B`+`D` y cablear a `useEnsemble` (el espejo de A ya existe y está sano). Los slots sin channel en A pasan a *"estado UI sin channel disponible"* (honesto, `DC-OQ-STUB-1`), no a wiring simulado.
- **Eje 2 — centralización de chrome (diferido):** los componentes siguen leyendo `0` directo (patrón existente de los detail views, **no** isla nueva); la centralización en `E` se retoma **después** de estabilizar `A→D→UI` + `A=UI`. `E` no es block stage.
- **Estado UI puro** (slot seleccionado, filtros, hover, nav) = React-state legítimo, **hogar local por vista**; NO es `E`, NO es plano global, NO pasa por nada. (Ojo colisión de nombres: esto es estado-UI-local, distinto de la **Capa E**.)
- **Backlog durable:** mapear los saltos `0→E` como candidatos ("esto debería vivir en E") a medida que se tocan, no en memoria de trabajo.
- **Checkpoint abierto:** ¿los componentes de arsenal ya tienen acceso a `DataRegistry`/`0`, o reciben chrome solo vía la sombra? Verificar antes de ejecutar (afecta el costo de la purga). Plan de stages en `.working/`.

**Progreso (2026-06-13):**
- **Stage 0 (reconocimiento) CERRADO.** Mapa: solo 2 consumidores vivos de la sombra (`ArsenalView`, `ArchonShardSelectionView`), ambos vía `useArsenalUiState`; `incarnon/IncarnorEvolutionSelector` es el exemplar ya-honesto (A vía `useEnsemble` + `0` vía `useCatalog`, **no** toca la sombra). **Checkpoint C0 → purga barata** (ambos consumidores ya leen `0` directo; el chrome no fluye por la sombra). Hallazgo clave: la mitad `arsenalMetadata` estaba **muerta** (0 consumidores) y para incarnon era mock duplicado de una feature viva.
- **Stage 1 (Eje 1, purga) CERRADO.** Resultó un **borrado de dead-code**, no una migración: eliminada toda la mitad `arsenalMetadata` (tipos `Arsenal*Metadata*`/`Incarnon*`, enum `ArsenalMetadataSource` `"mock"|"manual"`, factories, `replace*`, 4 acciones del store). Sobrevive estado UI-local: `ArsenalUiState`/`selectArchonShardSlot`/`selectedArchonShardSlotIndex`. `tsc -b --noEmit` → exit 0. **C1** pasa trivial (sin gap de A; el único dato vivo es UI-local). `DC-OQ-STUB-1` aplicado.
- **Stage 2 (nombrar/dar hogar al estado UI-local) CERRADO.** Decisión del usuario: **store UI renombrado** (mínimo cambio). `arsenal-state.ts`→`arsenal-ui-session.ts`, `state/use-arsenal-stub-state.ts`→`state/use-arsenal-ui-session.ts`, hook `useArsenalUiState`→`useArsenalUiSession`; se conserva el store module-level por la **vida cross-route** del slot (lo escribe `ArsenalView`, lo lee `ArchonShardSelectionView` tras `navigate`). Colisión de nombres con Capa E resuelta (es "sesión UI-local", no presentación). `tsc -b --noEmit` → exit 0. El `//user TODO` se reescribe: nombre/hogar resueltos, queda el eje de fondo (encaje en el modelo de capas).
- **Sigue abierto:** Eje 2 (chrome → `E`, diferido) + el eje arquitectónico de OQ-UI-2 (dónde encaja el estado de sesión UI en A→B→C→D→UI + 0).
- **Backlog `0→E` (gate "E real" vs "E nunca", `DC-OQ-ENGINE-10-C`) — plegado desde el scratchpad antes de purgarlo:**
  - *Ya capturados en OQ hermanas:* dup de íconos de shard (`ArsenalView` `ArchonShardsPreviewSection` + `ArchonShardSelectionView`) y de habilidad → **OQ-DATA-13**; formateo `resolveStatLabel` (`|val1|`), `effectSummary` (token+`base_value`→string en `IncarnonEvolutionSelector`), de-slug `perkId.replace(/_/g,' ')` → **estrato 2 `lib/format`, OQ-DATA-10**.
  - *Netos de eje-2 (sin otra OQ):* chrome de slot del arsenal — nombre+imagen por slot hidratados a mano en `ArsenalView` (`ArsenalSlotCard`/`ArsenalPreviewPanel`, hoy `Registry.getItemById` en `useEffect`) y `SLOT_DEFINITIONS` (labels/desc/iconos hardcodeados inline). Candidatos a `f(snapshot)` de `E` cuando se retome eje-2.

**Vínculo:** **OQ-DATA-9** (0 / borde de entrada — qué es dato canónico), **OQ-ENGINE-9** eje (c) + **OQ-ENGINE-FUTURE** (Capa A / intención respecto a `@core`/`providers`), **OQ-DATA-10/-13** (lo display deriva de la proyección), **OQ-UI-3** (la confirmación de pérdida consulta el estado "sucio" de esta capa), **OQ-ENGINE-10** + `DC-OQ-ENGINE-10-C` (modelo de 2 canales, separación de ejes, secuencia). El mismatch UI↔engine id es síntoma vecino.
**Fuente:** TODO inline del usuario en `use-arsenal-stub-state.ts`; debate 2026-06-13 (triage de user-TODOs) + iteración de secuencia 2026-06-13.

---

## OQ-UI-3 — Footer: acciones contextuales de navegación + patrón de confirmación (gated por sistema de guardado) — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / interacción + navegación

**Contexto:** El `HubFooter` (`domains/hud/footer/`) cumple función de navegación **parcial** (back a la zona anterior), no completa. Su composición varía por zona; en `item-details` implementa acciones stub: **BUILD**, **SIMILAR**, **WIKI**. La doc de UI/UX casi no lo cubre (estructura "parcialmente" definida, decidida solo en términos de responsabilidad). Comportamiento esperado, no consolidado:
- **BUILD** — equipar el ítem actual y navegar a `upgrade` directo. Slot vacío → equipa y navega (o pregunta). Si **ya hay algo equipado con build en curso** → dispara un **patrón de confirmación** ("¿guardar build actual?") porque la acción puede **perder progreso**.
- **WIKI** — abrir el link oficial (EN) del ítem en otra pestaña.
- **SIMILAR** — diferible.

**Dependencia dura:** el flujo BUILD-con-confirmación **depende de un sistema de guardado de builds que aún no existe**. No se puede consolidar el flujo sin decidir ese sistema primero.

**Preguntas abiertas:**
- **Patrón de confirmación de pérdida de progreso** como primitiva de UI reutilizable (no solo footer): ¿dónde vive, cómo se dispara, qué estado consulta ("¿build guardada/sucia?" → OQ-UI-2)?
- **Sistema de guardado de builds** — inexistente, es el bloqueante real. ¿Persistencia local? ¿shape? ¿relación con `EnsembleIntention`/A?
- **Modelo de navegación del footer**: contrato de qué acciones expone por zona (item-details vs arsenal vs …) — hoy ad-hoc.

**Arranca la campaña de documentación UI/UX** (los 6 docs de `docs/domains/ui-ux/` suman ~258 líneas, sin tocar hace meses; footer y modelo de interacción sin consolidar). Principio: derivar de **D2 (oráculo/CLI)** + dominio, **no** anclar contratos al stub actual.

**No bloquea:** la UI navega (footer stub anda). **Bloquea:** flujo BUILD real (gated por guardado).
**Vínculo:** **OQ-UI-2** (estado de sesión/UI), **OQ-DATA-1** (materialización de slots para upgrade), **OQ-DATA-10/-13** (presentación). Sistema de guardado = nueva área sin OQ previa.
**Fuente:** TODO inline del usuario en `HubFooter.tsx`; debate 2026-06-13.

---

## OQ-UI-4 — Profile como "utility hub" (no mapeo de Equipment) + dimensión social diferida — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / producto

**Contexto:** `ProfileView` (`@todo` pendiente, gated por materialización del Builder/Arsenal) no está definido como "se va a implementar". El concepto del usuario: una **réplica del profile de Warframe pero enfocada a utilidades** —"qué incarnon tengo", "qué armas kuva tengo", etc.—, una especie de **companion-hub de cosas específicas**, **no** un mapeo de Equipment ni de builds guardadas. Va a existir, pero sin forma cerrada; "debo desarrollarlo muchísimo".

**Pregunta:** ¿Cuál es el shape de Profile como vista de utilidad (qué consulta, sobre qué estado/inventario), distinta de Equipment (browsing) y del Arsenal (build activa)?
- **Sub-eje social (diferido fuerte):** una dimensión tipo overframe.gg (compartir/social) requeriría **usuario + base de datos + despliegue no-local**, muy lejos del scope actual (function-first; aún no existe ni 1/3 de capa A→D). Interesante, no prioridad.

**No bloquea:** nada (Profile es stub `@todo`).
**Vínculo:** OQ-UI-2 (estado de sesión/UI), OQ-DATA-1 (materialización de slots). Persistencia/usuario = área nueva sin OQ previa.
**Fuente:** TODO inline del usuario en `ProfileView.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-UI-5 — OptionsView: tabs de configuración + decisión de NO-i18n (incompatibilidad con overrides de "0") — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / configuración (cruza data/0)

**Contexto:** `OptionsView` debería organizarse en **tabs de paneles** (display / graphics / audio / accessibility); hoy solo existe `display` con el theme-selector. El resto es a futuro (animaciones/efectos BLUR/CANVAS, audio).

**Sub-punto con peso real — NO-i18n (de momento):** se **descarta** implementar i18n ahora. `@wfcd/items` **sí provee** i18n, pero **no es compatible** con el sistema de **overrides manuales** de piso 0: por su naturaleza de mantenimiento manual, mantener traducciones sincronizadas es inviable hoy. Deseado a futuro, no prioridad. Esto **cruza OQ-DATA-9/0** (qué es dato canónico) y el estrato `lib/format` de OQ-ENGINE-10/DATA-10 (labels/locale).

**Pregunta:** ¿Contrato de paneles de configuración (qué persiste, dónde) y condición para reabrir i18n (¿requiere resolver la compat overrides↔traducciones primero?)?

**No bloquea:** nada (theme-selector funciona).
**Vínculo:** OQ-DATA-9 (0 / dato canónico), OQ-DATA-10 + OQ-ENGINE-10 (`lib/format`/locale), OQ-UI-2 (persistencia de preferencias).
**Fuente:** TODO inline del usuario en `OptionsView.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-UI-6 — Revisión funcional del menú de navegación + gestión de inputs/jerarquías — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / interacción + navegación

**Contexto:** `DialogMenu` funciona y replica en buena medida el menú de Warframe, pero merece una **revisión funcional** (no estética) como componente principal de navegación. Síntomas: la navegación puede ser tosca para una web-app; el control por `esc` **choca** con otras funcionalidades (cerrar otro diálogo / salir de un input) → posible necesidad de un **sistema dedicado de jerarquía de inputs** que evite saltos del menú.

**Sub-eje arquitectónico:** ¿usar **headless UI** aquí es contraproducente? No expone una API como tal; gestionarlo vía React con estados globales puede ser over-engineering. Contrastar con una **capa de captura propia — desacoplada, genérica y react-free** que React consuma (eco del guardrail react-free de `DC-OQ-ENGINE-10-B`, pero aplicado a **inputs/navegación**, no a presentación). Ojo: evaluar el impacto real antes de reescribir (anti-reescritura).

**Pregunta:** ¿El proyecto necesita un gestor de inputs/jerarquías dedicado (react-free, consumido por React), o basta endurecer el manejo de `esc`/foco sobre lo actual? ¿headless UI suma o estorba en el menú?

**No bloquea:** nada (el menú navega correctamente).
**Vínculo:** `DC-OQ-ENGINE-10-B` (núcleo react-free, análogo conceptual), OQ-UI-3 (footer / modelo de navegación), OQ-UI-2 (estado de sesión/UI).
**Fuente:** TODO inline del usuario en `DialogMenu.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-ENGINE-10 — Capa E (Presentación / ViewModel) + renombre de D a contrato neutro — **ABIERTO — PROPUESTA PREMATURA (2026-06-13)**
**Dominio:** engine / arquitectura de capas + ui-ux / presentación (amplía el modelo A→B→C→D)

**Contexto:** `simulation-architecture.md` define A→B→C→D→UI pero solo modeló el **flujo de información** (salida de C, ya computada, vía D). Nunca nombró el **flujo de datos hacia la UI** (lo canónico que C *no* calcula — chrome: nombre/imagen/desc). Al estresar los user-TODOs de UI (sesión 2026-06-13) se concluyó que (a) falta una capa de confluencia entre D y la UI y (b) la definición de D quedó corta (`Capa D` "recibe `ProjectionSnapshot` de C2" — su única entrada es C; ver `simulation-architecture.md:130`). Modelo **en estrés, NO adoptado**:

**Topología — confluencia, no cadena** (corrige el `D→E→UI` lineal a un merge de dos entradas):
```
                            ┌──────────────────────► D2 (CLI)
                            │   + lib/format (labels, unidades, números)
C ─► D (contrato NEUTRO) ───┤
     token · value · unit   │
                            └─► E ─► vistas UI (D1, DetailViews, …)
                                 + lib/format (el mismo)
                                 + iconos / imágenes / chrome (solo-UI)
       0 ──(chrome)──────────────► E
```
**E es un nodo de confluencia** (dos entradas: info reactiva de D + chrome estático de 0), no un eslabón lineal. **Espejo del borde de entrada:** así como **0** tiene un puerto y dos consumidores (B/C1→DNA, catálogo→display), **E** tiene un sumidero y dos fuentes (0/chrome, C/info). OQ-DATA-9 L315 ya los llamaba "par espejo, los dos bordes del mismo flujo"; esto nombra el de salida.

**Tres estratos (el corte NO es "texto vs iconos"):**
1. **D = contrato neutro** — `token · value · unit`, sin formatear, sin iconos, sin locale. Compartido.
2. **`lib/format` = estrato compartido** — labels + unidades + número→string. Lo invocan **D2 (CLI) y E por igual** (el CLI necesita labels/unidades, no consume D crudo). Es el SSoT de presentación de **OQ-DATA-10** (los 3 vocabularios / 4 convenciones numéricas) — ahora con ubicación en el flujo.
3. **E = enriquecimiento solo-UI** — tokens→iconos (`FormattedText`), imágenes, merge de chrome de 0. El CLI no lo usa.

Resultado: **D2 = D + lib/format**; **D1/UI = D + lib/format + E**. D y E **no se solapan**.

**Renombres (en propuesta):**
- **`ViewModelContract` pasa a nombrar E, no D.** Llamar "ViewModel" (modelo *con forma de vista*) a un contrato **neutro y compartido con el CLI** (que no es vista) es **error de categoría**. El ViewModel real (consumer-shaped, MVVM) es **E**. Resuelve la tensión interna de OQ-ENGINE-FUTURE L63 ("consumer-shaped" **y** "compartido CLI+UI" se contradicen — conflaba D y E).
- **D (payload/contrato) se renombra a algo neutro** (`EngineSnapshot`/`ResolvedSnapshot`/…) → ejecuta **OQ-ENGINE-8**.
- Candidato del usuario "**Embed**" → calza en la **sub-pieza visual de E** (incrustar iconos/imágenes), si E se parte en "formateo compartido" + "incrustación visual". Nombre final → OQ-ENGINE-8, sin bikeshed.

**Restricciones de implementación de E (eje distinto al topológico — son sobre *cómo*, no *dónde*):**
- **Pureza (guardrail, ya se cumple):** la composición de E es **TS puro, fuera del render**; React **solo se suscribe** (`useSyncExternalStore`) al snapshot. No re-procesar el objeto puro A→D dentro de React ("no puede ser React" = el cómputo afuera, solo la suscripción cruza).
- **Composición destructurada por referencia (decisión de shape, barata ahora / cara de retrofitear):** `E.snapshot = { chrome: <ref estable>, stats: <ref nueva solo al recomputar> }`. **No** deep-merge (`{...chrome,...stats}`): además de re-render espurio, **rompe `useSyncExternalStore`** (exige `getSnapshot` referencialmente estable). Granularidad guiada por **dónde duele el render** (imagen/bloque estable; un `StatEntry {label,value,unit}` se puede recrear barato). El memo per-nodo fino ya lo hace el diff de D; E **preserva** esas refs, no las aplana.

**Ruido abierto del usuario (concern legítimo):** partir el consumo de `lib/format` entre D2 y E, ¿no recrea **islas de formateo** (lo que `lib/*` busca evitar)? **Antídoto:** el estrato 2 debe ser **suite única (SSoT), llamada por ambas ramas**, no reimplementada — exactamente el trabajo inconcluso de OQ-DATA-10. El split D/E **no agrega** isla *si y solo si* lib/format es single-source. No rompe contratos (lib/* ya es shared legal por Restricción 1).

**Estrés de los 3 estratos — HECHO 2026-06-14** (`crit chance` de arma + nodo de habilidad; mapa completo persistido en [`../domains/ui-ux/presentation-layer.md`](../domains/ui-ux/presentation-layer.md) v0.1.0). Hallazgos que se llevan adelante: la **ruta info** ya entrega contrato neutro limpio (`StatViewModel` = `token·value·unit`; el cuello es el estrato de formateo, no D); **el plano `lib/*` no consume el SSoT semántico** (`upgrade-tokens.md`/D-6) — 3 tablas keyed por nombres humanos pre-SSoT, ninguna es fuente (*el eje real de OQ-DATA-10*); la **ruta chrome** (`0→UI` directo) confirma la confluencia de 2 entradas de E. El leak β roto (crit sin `%`) quedó resuelto en D-7 Fase 4. Contraste con la realidad del proyecto → ver **Resultado Pre-E** abajo.

**Sigue abierto:**
- Ubicar el **estado efímero de UI** (OQ-UI-2: slot seleccionado, hover, nav) en el diagrama — *no* pasa por E (es React-state legítimo); ¿dónde entra?

**Resultado Pre-E (2026-06-14, pasada de análisis — NO construcción):** **E NO es necesidad emergente.** A–D materializaron el **estrato 2** (`lib/format`: proyector único `toStatEntries` + `stat-presentation`, consumido por D1 y D2) — *lo que se confundía con E, no E*. Eso **retira el concern "islas de formateo" de L577** (lib/format probó ser single-source: dos consumidores de una utilidad = biblioteca, no isla). Evidencia dura: D1 (`UpgradeView`) opera hoy como `D + lib/format` **sin E** y rinde; el chrome (2ª entrada de E) sigue ad-hoc inline `0→UI` (`nameById` + `SLOT_DEFS`) = el eje-2 diferido de OQ-UI-2. **E queda ESTACIONADO** (no muerto): el modelo de confluencia es buen pensamiento y espera; su próximo forcing-function es un **consumidor UI real** (la vista avanzada, inexistente) que exija la confluencia chrome+info, no más trabajo de formateo. **Hallazgo cross-cutting (excede esta OQ):** la pasada destapó que *la UI nunca tuvo su corpus de docs/auditoría* como sí lo tuvo `data/`/engine → eje del próximo trabajo (**campaña de documentación de UI**, separada de E). Ver trazabilidad de sesión 2026-06-14.

**No bloquea:** nada (la UI renderiza; D/E hoy conflados ad-hoc en los componentes). **Gated por:** function-first — *modelar* ahora, *construir* E difiere con OQ-DATA-10.
**Vínculo:** **OQ-DATA-10** (borde de salida / suite = estrato 2 + sumidero de E), **OQ-ENGINE-8** (renombre del payload de D), **OQ-ENGINE-FUTURE** (resuelve "consumer-shaped vs compartido"), **OQ-DATA-9** (par espejo: 0 = borde de entrada), **OQ-UI-2** (estado efímero, sin ubicar), **OQ-ENGINE-9** (estructura de `@core` donde aterrizarían D/E). **D-7** ([`../data/decisions.md`](../data/decisions.md) §D-7) = **mecanismo del estrato `lib/format`**: el dict de presentación se cuelga del vocabulario canónico `Upgrade`; **✅ ejecutado por la Fase 4 de D-7 (2026-06-14, camino A completo).** El estrato `lib/format` ahora tiene un solo espacio de id (token == nodo) de C a la UI — desbloquea la unificación, pero **construir E + renombrar D siguen siendo esta OQ** (prematura: la UI clásica/avanzada aún se está re-enfocando, function-first). Lo que la Fase 4 aterrizó es solo la **meta estructural** (category/unit); la label/locale y la suite numérica siguen en OQ-DATA-10. **Materialización en curso (2026-06-14):** OQ-DATA-10 stages A–D construyen el estrato `lib/format` real (mapa `stat-presentation` + proyector `toStatEntries`, consumido por D1+D2); su **Stage E ("Pre-E")** es la pasada de análisis que alimenta directamente esta OQ — dónde/cómo ubicar la Capa E y su arquitectura interna. Backlog: `.working/presentation-stages.md`.
**Cierres parciales (2026-06-13, debate de iteración):**
- **`lib/*` = suite de utilidad, no estrato del flujo** → `DC-OQ-ENGINE-10-A`. Corrige el diagrama (el estrato 2 no es eslabón; es plano de utilidad ortogonal, espejo de `0`). Disuelve el "ruido abierto" de las islas.
- **Stub honesto** (`DC-OQ-STUB-1`) y **UI no es spec del flujo** (`DC-OQ-UI-SPEC-1`) — principios ratificados que enmarcan la purga de `metadata` y el re-enfoque de la UI.
- **Topología de E = mini-framework** → `DC-OQ-ENGINE-10-B` (DIRECCIÓN ELEGIDA, no cierre definitivo). Núcleo puro (snapshot, React-free, lo consume el CLI) + sub-núcleo React desacoplado (embed JSX, render-time, `f(snapshot)`). Revisa "E solo-UI" (el CLI consume el snapshot, no lo bypassea). Guardrail re-escopado a "el núcleo/snapshot es React-free". **Micro-arquitectura del núcleo diferida** — se reabre al componer E (el ancla real es la UI, function-first).
- **Modelo de 2 canales + ejes ortogonales + `E` no es block stage** → `DC-OQ-ENGINE-10-C`. Corrige el drift transitorio del "canal 3 directo `0→UI`": el chrome de `0` es **entrada de E**, no canal aparte (canal 1 = espejo `useEnsemble`/puntero que NO pasa por E; canal 2 = presentación E). Separa el refactor en eje-1 (honestidad de intención, E-independiente, **es el P0**) vs eje-2 (centralización de chrome, diferido). **`E` se construye después de estabilizar `A→D→UI` + `A=UI`**, no antes — ver OQ-UI-2 para la dirección de refactor del estado y el plan de stages en `.working/`.

**Fuente:** debate 2026-06-13 (estrés del modelo de capas desde los user-TODOs de UI) + iteración de secuencia 2026-06-13. **Estado: propuesta prematura para la Capa E en sí; la secuencia de refactor de estado (eje 1) está lista para plan — ver `.working/`.**

---

## OQ-ENGINE-11 — Exaltadas: derivación de intención estructural en A1 — **ABIERTO (2026-06-16)**
**Dominio:** engine / Capa A (intención) — downstream del eje *estructura* de `U-3` ([`../domains/ui-ux/decisions.md`](../domains/ui-ux/decisions.md))

**Contexto:** el barrido de UI (campaña ui-ux) trazó `SLOT_DEFINITIONS` (chrome hardcodeado) hasta un hueco de la Capa A: las **exaltadas** (Reguladoras de Mesa, Exalted Blade, Venari, etc.) **no están modeladas, no hay datos**. Vestigio del `loadout` de V1. `U-3` aisló esto como la materialización *dinámica* del eje *estructura/contexto de aplicación* (lo que `SLOT_DEFINITIONS` hoy hardcodea estático).

**Hipótesis establecida (puntos clave del debate — NO re-litigar):**
1. Exaltada = **intención estructural derivada** → vive en **A1** (no A2 = condicionales de combate; no B).
2. La derivación corre en la **acción de equipar** del ensemble (dispatch): `equipWarframe` lee "0" (el hecho "otorga exaltada" del dato de habilidad) → escribe **ambos** punteros (warframe + exaltada derivada) en A1 al mutar. **Sin círculo B→A1** (el puntero nace en A1, no se descubre en B).
3. A1 = punteros puros (la lógica vive en la acción). Nodo derivado: flag `origen:derivado` + **acciones recortadas** (p. ej. solo `Upgrade`, sin `Swap`) = la entry `secondary_weapon` clonada y recortada.
4. B = hidratación agnóstica pura (deref de A1, sin inyección estructural).
5. Exaltada = arma de **canal real** (p. ej. `secondary`) → el ruteo agnóstico de buffs de C la alcanza **gratis** (un arcano de secundaria buffea también Reguladoras). Confirma que va en A1, no como conditional.
6. Re-derivación **continua**: cambiar warframe re-corre la acción; la **política de mods huérfanos** vive ahí.

**Preguntas abiertas (requieren datos):** schema del dato de exaltada (¿`weapons` + marcador granted-by / canal / fixed? *lean:* nuevo JSON, no muy distinto de `weapons`) · shape de la declaración en el modelo de habilidad · política de mods huérfanos al re-derivar · **escalado cruzado** (exaltada ← power strength) = ability-like, **RED**, sub-concern separado.

**Método (data-first):** 1 exaltada real → nuevo JSON → inyectar vía **oracle (CLI/D2)** → testear `A1→B→C` → recién generalizar. No resolver sobre supuestos.

**No bloquea:** nada (diferido). **Estado:** no se modelará de inmediato; el usuario arranca el **prototipo** apenas cierre tareas en pausa.
**Vínculo:** **`U-3`** (su upstream estructural), **OQ-UI-2** (que ya lista exaltadas como caso de slot-modeling junto a Jade Aura×2 / Sevagoth Shadow / companions modulares — UI-2 = layout de slots; ésta = mecanismo de derivación en A1), **OQ-ENGINE-7** (materialización de nodos de atributo).
**Fuente:** debate de la campaña ui-ux (2026-06-15) + promoción a ID real en el cruce de consolidación (2026-06-16).

---

## OQ-ENGINE-12 — Timing del pipeline de crit condicional (Puncture/Cold) — **ABIERTO (2026-07-02)**
**Dominio:** engine / C2 (micro-arquitectura de daño y status)

**Contexto:** la campaña de modelado de daño/status de C2 ([`../domains/engine/design/damage-status-model.md`](../domains/engine/design/damage-status-model.md)) diseñó y verificó empíricamente el núcleo (Slash/Toxin/Viral/Corrosive) y el primitivo reusable de stack tracker (N timers independientes, cap K, reemplaza-al-más-viejo — confirmado en Viral/Magnetic/Corrosive). Dos facetas reales de DPS quedan pendientes de un punto de enganche distinto: **Puncture** (+5%/stack de crit chance del jugador contra el target, hasta +25% a 5 stacks) y **Cold** (+0.1×/+0.05× por stack de crit damage recibido, hasta +0.5× a 9, cap 4 stacks en bosses/Overguard).

**Corrección de encuadre (debate 2026-07-02, no re-litigar):** esto NO es "falta arquitectura nueva" — el primitivo de stack ya está modelado y validado. Lo que falta es **dónde** se lee ese primitivo: Viral/Magnetic/Corrosive lo consumen en la resolución de daño por capa (`CombatSimulator.resolveHit`); Puncture/Cold necesitan consumirlo en el **cálculo de crit** (`AtomicSimulator`/`CombatSimulator.simulateAttack`), un punto distinto del pipeline que hoy no tiene ese gancho.

**Pregunta:** ¿cuándo se construye ese punto de enganche? No bloquea el núcleo (Tier 1 del modelo), pero es la pieza que falta para que Puncture/Cold entren a v1 junto con Magnetic (mismo tier de prioridad, distinto tier de trabajo de cableado).

**No bloquea:** el núcleo del modelo de daño (Slash/Toxin/Viral/Corrosive) ni el plan de slices que lo implemente primero.
**Vínculo:** `damage-status-model.md` (el modelo completo, incluye la brecha ya encontrada entre `EnemyState.processDots()` — decaimiento lineal continuo, código de abril — y el primitivo de N-timers-independientes validado empíricamente esta sesión; el bug de `getDamageMultiplier` y el rename de vocabulario legacy ya se resolvieron en Fase 3 pieza 3, commit `98ef01b`, previo a esta campaña).
**Fuente:** debate de modelado C2, verificación empírica in-game 2026-07-02.

## OQ-ENGINE-13 — ¿Los buffs de habilidad tipo Roar/Xata double-dipean en DoTs? — **ABIERTO (2026-07-03)**
**Dominio:** engine / C2 (composición de daño) + Capa 5 (scaling de habilidades)

**Contexto:** durante el modelado de C2 se observó que un buff de habilidad (Roar) produce sobre un DoT un multiplicador final mayor que su valor nominal: ×3.4 observado contra ×1.85 nominal (test con Alternox sobre el DoT de Electricity). `1.85² = 3.42` — la aritmética es la **firma de un double-dip**, el mismo primitivo `(1+b)²` que el modelo ya valida para el faction bonus sobre los 5 DoTs (`damage-status-model.md` §Reglas de composición #2). El test fue justamente sobre un DoT, que es donde vive el double-dip.

**Hipótesis:** Roar (y buffs de la misma clase, ej. Xata) double-dipean en DoTs igual que el faction bonus. Esto parte en **dos ejes**:
- La **composición** (el buff se aplica dos veces en la vida del DoT) es **C2** — mismo mecanismo ya modelado para faction, NO Capa 5.
- El **origen/sourcing del valor** del buff (de dónde sale el +85%, cómo escala con strength) sí es **Capa 5** (scaling de habilidades, `gap-map.md`).

**Pregunta:** ¿se confirma el double-dip de composición y cómo se separa del sourcing? No se persigue ahora — no hay trade-off en re-testear una mecánica que ya se comporta así; queda registrada para cuando se modele el eje de habilidades.

**No bloquea:** nada del modelo de daño v1 (Roar/Xata no entran a v1). Es una regla de composición que el modelo excluye explícitamente hasta confirmar.
**Pendiente de captura:** re-test con capturas, Roar aislado sobre un DoT (sin faction); verificar si Xata (Void como posible instancia aparte) se comporta idéntico a Roar.
**Vínculo:** `damage-status-model.md` §Reglas de composición.
**Fuente:** observación in-game durante modelado C2 (Alternox + DoT Electricity), 2026-07-02.

---

## OQ-ENGINE-14 — Alcance del modelado melee: ¿qué estrato entra primero? — **PROMOVIDA A DISEÑO (2026-07-05)**
**Dominio:** engine / C1 (base estadística) + C2 (combo simulado)

**Resuelta y promovida.** La OQ creció hasta ser una mecánica completa (melee combo engloba casi todo lo melee), así que se **promovió a un doc de diseño propio**: [`../domains/engine/design/melee-combo.md`](../domains/engine/design/melee-combo.md) — **SSoT vivo** de la mecánica, incluido su worklist (lo resuelto sentenciado, lo diferido como estado abierto *dentro* del doc).

**Respuestas (cerradas):** el primer ladrillo fue el **hit-base determinista** (estrato 1, ejecutado sin cambios al motor); el combo multiplier **reusa el patrón §8/§9 como mecánica hermana de CO** (factor declarado→emergente), **no** una vía nueva; heavy/slam entran como **perfiles `attacks[]`**. Diferidos (viven en el doc): C2 dinámico del counter, Blood Rush/Weeping Wounds, slam-por-distancia (falta dato), HAE/wind-up, passives que desvían la tabla, y la capa genérica de combo (§10, ≥2 casos reales).

**Vínculo:** [`../domains/engine/design/melee-combo.md`](../domains/engine/design/melee-combo.md), `../domains/engine/design/arch-decisions.md` §8/§9/§10, `references/wiki/mechanics/melee-combo.md`.
**Fuente:** pausa teórica 2026-07-04 + estrés/promoción 2026-07-05.

## OQ-ENGINE-15 — Fórmula de DR de armor enemigo: conflicto de 3 vías — **ABIERTO (2026-07-06)**
**Dominio:** engine / C2 (mitigación del target)

**Contexto.** Al modelar el escalado de enemigo (contraste #0, Arid Butcher), la fuente que trae los stats escalados —el **gadget del calculador del wiki** (`references/temp/ext.gadget.enemyinfoboxslider-script-0.js`)— computa la DR de armor como `DR = √(3·AR)/100`. Eso **contradice** dos capturas previas de `references/*`, que a su vez se contradicen entre sí:

| Fórmula | Fuente | DR @AR 200 | @2700 |
|---|---|---|---|
| `√(3·AR)/100` | gadget del calculador (adoptada) | 24,49% | 90% |
| `0.9·AR/2700` (lineal U36) | `enemy-resistances.md` (SSoT declarada) + decisión provisional 2026-07-02 | 6,67% | 90% |
| `AR/(AR+300)` (era vieja) | pre-U36 | 40% | 90% |

Las tres coinciden en el cap (90% @2700) pero divergen fuerte abajo. La propia wiki está **auto-desincronizada** entre sus páginas y su gadget — no es un problema nuestro de resolver, sino de **normalizar** cuál adoptar.

**Decisión provisional (usuario, 2026-07-06):** el engine adopta **`√(3·AR)/100`** (`damageReductionFromArmor`, `EnemyRepository.ts`) — es la fuente más honesta HOY: la que usa el calculador del wiki y la comunidad como referencia. **NO se deprecan** las otras capturas ni se toca `references/*` por ahora (la reconciliación queda para este OQ). El #0 valida contra el calculador (health exacto; DR/EHP reproducen el calculador, cuya DR es esta fórmula provisional).

**Condición para resolver:** contraste **#1** (un popup de daño real contra Arid Butcher) — el primer número de mitigación que el juego SÍ muestra. Ahí se confirma o se tira `√(3·AR)/100` contra el juego, y recién entonces se normaliza `references/*` (reconciliar `enemy-resistances.md` ↔ `enemy-level-scaling.md`) y se cierra este OQ.

**Vínculo:** `references/wiki/mechanics/enemy-level-scaling.md` §Armor, `references/wiki/mechanics/enemy-resistances.md` §DR, `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`, `Project/src/core/engine/simulate/enemies/EnemyRepository.ts`.
**Fuente:** eje enemigo / contraste #0 (2026-07-06).
