---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-07-16"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos activos. Las preguntas cerradas han sido migradas a `closed-decisions.md`.

## Índice

**Leé esta tabla, no el documento.** El detalle de cada OQ se consulta bajo demanda: buscar `## <ID>`.
Es lectura obligatoria de arranque (`docs/CLAUDE.md` §Jerarquía) y el cuerpo son ~15k palabras — el
presupuesto de atención se gasta acá, no leyendo las 36 en fila.

| OQ | Tema | Dominio | Estado |
|---|---|---|---|
| `OQ-W-5` | Semántica de `ENERGY_COST` / `ENERGY_DRAIN` | data / ability-stats → engine | abierta — no bloquea |
| `OQ-W-6` | Vocabulary gap: `upgrade_by` para stats base de warframe | data / ability-stats | abierta |
| `OQ-W-7` | Double-scaling y semántica especial de `upgrade_by` | data / ability-stats → formulas | abierta — no bloquea |
| `OQ-SEM-1` | Conditions de abilities y augments | data / semantic / ability-stats | abierta — no bloquea |
| `OQ-SEM-2` | Eje organizador del mapa de `condition` | semantic / conditions → engine | abierta — no bloquea |
| `OQ-DATA-1` | Materialización de slots por entidad | data / arsenal / engine | abierta |
| `OQ-DATA-4` | Patrones transversales (stacking / duration / condition) | data / schema | abierta — no bloquea |
| `OQ-DATA-5` | Weapon-type gate en arcanes: campo ausente | data / schema (arcane) → UI | abierta — no bloquea |
| `OQ-DATA-6` | Set Mods: bonus de conjunto como entidad | data / schema → engine / UI | abierta — no bloquea |
| `OQ-DATA-7` | Archgun range vs melee reach en `WEAPON_ADD_RANGE` | data / semantic → engine | abierta — no bloquea |
| `OQ-DATA-8` | Unidad flat (`+Xm`) vs `%` bajo un mismo token de range | data / semantic / schema | abierta — no bloquea |
| `OQ-DATA-9` | Merge de overrides duplicado engine ↔ display (frontera β) | data / integration | abierta — no bloquea |
| `OQ-DATA-10` | Convergencia ruta catálogo ↔ proyector del engine | ui-ux / presentation | abierta — re-scopeada 2026-07-17 |
| `OQ-DATA-11` | Compatibilidad de mods por entidad | data / semantic | abierta — degrada usabilidad |
| `OQ-DATA-12` | Carga de runtime: import estático → fetch | data / integration | **cerrada** → `closed-decisions.md` |
| `OQ-DATA-13` | Íconos de habilidad/shard: presentación duplicada/divergente | ui-ux / presentation | abierta — no bloquea |
| `OQ-DATA-14` | Armas modulares: ensamblaje de DNA desde piezas | data / hidratación | abierta — no bloquea |
| `OQ-UI-2` | Dónde vive el estado de sesión/UI | ui-ux / arquitectura de estado | abierta — no bloquea |
| `OQ-UI-3` | Footer: acciones contextuales + confirmación | ui-ux / interacción | abierta — **bloquea flujo BUILD** |
| `OQ-UI-4` | Profile como "utility hub" | ui-ux / producto | abierta — no bloquea |
| `OQ-UI-5` | OptionsView + decisión de NO-i18n | ui-ux / configuración | abierta — no bloquea |
| `OQ-UI-6` | Revisión funcional del menú de navegación | ui-ux / interacción | abierta — no bloquea |
| `OQ-ENGINE-2` | Profile switching en runtime (Incarnon/Alt-fire) | engine / simulation-context | re-scopeada — path dinámico sin consumidor |
| `OQ-ENGINE-7` | Nodos de arma faltantes (Capa 4): resta el eje (c)/C2 | engine / hydration | abierta — no bloquea |
| `OQ-ENGINE-8` | Contrato de salida de C: métricas (2 forks) + vocabulario neutro | engine / contrato de salida | abierta |
| `OQ-ENGINE-9` | Estructura interna de `@core/engine` + harness | engine / arquitectura `@core` | **cerrada** → `closed-decisions.md` |
| `OQ-ENGINE-10` | Capa E (Presentación / ViewModel) | engine / capas + ui-ux | **descartada** → `closed-decisions.md` |
| `OQ-ENGINE-11` | Exaltadas: intención estructural en A1 | engine / Capa A | abierta — diferida |
| `OQ-ENGINE-12` | Timing del crit condicional (Puncture/Cold) | engine / C2 | abierta — no bloquea el núcleo |
| `OQ-ENGINE-14` | Alcance del modelado melee | engine / C1 + C2 | promovida a diseño |
| `OQ-ENGINE-15` | DR de armor enemigo: conflicto de 3 vías | engine / C2 | abierta — `√3a/100` provisional |
| `OQ-ENGINE-16` | N-declarado vs timers reales de stacks | engine / C1 + C2 | abierta — no bloquea |
| `OQ-ENGINE-18` | Status Duration en DoT: ¿más ticks o estirados? | engine / C1-timeline | abierta — gated por test in-game |
| `OQ-ENGINE-19` | Generador discreto de N proc-slots a SC >100% | engine / C1-población | abierta — gated por dato in-game |
| `OQ-ENGINE-20` | Snapshot vs live en el tick de DoT | engine / C2 | abierta — gated por test in-game |
| `OQ-ENGINE-FUTURE` | Features de evolución del motor | engine / simulation-v2 | abierta — backlog |

---

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **RE-SCOPEADA (2026-07-15): sin consumidor para el path dinámico**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta original:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.

**Re-scope (2026-07-15, debate source-state → `decision-frontier §4`):** para lo que OmniFrame **es** (un calculador de builds) **no hay consumidor del switch en runtime** — se **computa cada perfil por separado** (dos hidrataciones estáticas: `consume(build_base)` vs `consume(build_incarnon)`). El "switch" es preocupación de **intención/UI** (cuál perfil se muestra), no del runtime del engine. Verificado (2026-07-15): los **perks incarnon son literalmente `Modifier[]`** (`IncarnonRepository.getModifiers`, tests `co-incarnon-perk`/`boltor-prime-incarnon`) — *"mods con pasos extra"*, resueltos por el mismo grafo; la **selección estática de perfil ya funciona**. Un runtime-switch solo tendría sentido dentro de una **timeline-sim completa donde la transformación es un evento simulado** (llenás el medidor Incarnon → transforma en el segundo N) — fuera de scope, probablemente para siempre.
**Consecuencia:** el profile-switch **NO** pertenece a la clase de re-composición de C1 (esa clase = `source-state` vivo: CO dinámico / combo / buff vivo — modificadores con reloj, no swaps de raíz). No se cierra del todo (queda la puerta por si algún día hay timeline-sim consumidora), pero el **path dinámico no se construye**: no tiene consumidor. No confundir con **combo / medidor Incarnon**, que son modificadores vivos (`source-state`), no switches de perfil.
**Fuente:** `docs/domains/engine/engine-audit.md §2.4`; debate source-state 2026-07-15 (`decision-frontier §4`).

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

## OQ-ENGINE-FUTURE — Features de evolución del motor en backlog — **ABIERTA (2026-05-25)**
**Dominio:** engine / simulation-v2
**Contexto:** features consideradas en pre-implementación (abril 2026) que no entraron al motor inicial, sin prioridad asignada. Backlog puro — ninguna tiene consumidor que la exija hoy.

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | API serializable del motor para mover la simulación a un Worker | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer; aprovecha que el motor es determinista | UX de comparación de builds |

**Estado:** la condición-gate original ("cuando la Capa D se materialice y haya un cliente real") **ya se cumplió** — `ViewModelContract` v0 existe, consumido por D1 (`use-view-model`) y D2 (`oracle`). Aun así ninguna de las dos features tiene demanda: se retoman si un consumidor las pide. Nada en código todavía (verificado 2026-07-17).

> El debate del **contrato de salida / `ViewModelContract`** que creció dentro de esta OQ se cerró o migró y **ya no vive acá**: el contrato es **estructurado neutral** (`StatViewModel { token, value, unit }` — decidido, no strings formateados); el rename D→nombre-neutro es `OQ-ENGINE-8`; la simetría de entrada (`ensemble.types`→`@shared`, store→`@core`) es `DC-OQ-ENGINE-9`; "dominios ↛ `@core`" (y `@providers → @core` permitido) está en `arch-decisions.md §7` + `decision-frontier.md §1`; el principio consumer-shaped / anti producer-laundered vive en `arch-decisions.md` + `view-model/index.ts`.

**No bloquea:** nada.
**Fuente:** notas de pre-implementación (abril 2026).

## OQ-W-6 — Vocabulary gap: upgrade_by para stats base del warframe — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → taxonomía
**Contexto:** El vocabulario `AbilityUpgradeBy` cubre los 4 stats de habilidad (`AVATAR_ABILITY_STRENGTH/RANGE/DURATION/EFFICIENCY`) y los dos ejes de energía (`ENERGY_COST/DRAIN`). Inaros Scarab Swarm tiene un stat (`Damage: 241`) que escala con Max Health del warframe — un eje de base stat sin token. El `//!` en `Inaros.md` lo registra: `"scale with health, literaly 'vitality' maxed (100% health) affected this number 483"`.
**Pregunta:** ¿Cómo se extiende `upgrade_by` para cubrir stats base del warframe (health, shield, armor)?
- La taxonomía D-6 ya define `AVATAR_ADD_HEALTH_MAX` como token de mod. El principio que se busca es **globalizar la semántica**: el mismo vocabulario `AVATAR_*` debería aplicar.
- Opciones: token completo idéntico al mod (`AVATAR_ADD_HEALTH_MAX`), o forma sin OPERATION (`AVATAR_HEALTH_MAX`) para separar el eje "con qué escala" del eje "qué modifica".
**Condición para resolver:** al resolver la taxonomía general de `upgrade_by` — cuando haya ≥2 casos distintos de base-stat scaling en abilities que justifiquen el patrón. Hoy solo Inaros es caso confirmado.
**Bloquea:** Anotar correctamente Inaros Scarab Swarm. Extensión del vocabulario `AbilityUpgradeBy` en `shared/types/ability.ts`.

**Precisión (2026-07-09, debate de `source_attribute`):** Inaros Scarab Swarm es **composición
cross-stat con fórmula dedicada** (`rhino.test.ts:72`, "Iron Skin overguard = (1200×str) +
armor×(2.5×str) — fórmula dedicada [post-scope]"), **no** el shape simple de `linearThresholdScale`
(`arch-decisions.md §12`) que sí sirve a Roar y a la Familia D de arcanos. No confundir: esta OQ
sigue abierta y sin relación directa con §12 — es una fórmula propia, no un caso más del primitivo.
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

## OQ-DATA-4 — Patrones estructurales transversales (stacking / duration / composición de condition) — **ABIERTA (2026-06-02)**
**Dominio:** data / schema (mods + arcanes + incarnon + archon)
**Contexto:** stacking, duration y la composición OR/AND de `condition` son conceptos **análogos** en los 4 schemas, hoy resueltos de forma divergente (mods: stacking=total, D-15 §2; arcanes Merciless: `base_value:null` + nota). Aislar cada schema produce drift. El criterio de **cuándo** acuñar estructura está en `decisions.md#D-20` (≥2 casos misma forma + gate de consumidor + escape hatch como hipótesis con contador). Passives queda **fuera** (no es un schema único; su heterogeneidad se reparte en las puertas de D-20).

**Resuelto:**
- **Ubicación del puente** (definición canónica cross-schema de stacking/duration): `DC-OQ-DATA-2` — es estructura de schema, no vocabulario → vive en `data/` (`rules/` o `schemas/`), no en `semantic/`. Su **creación** sigue gateada por D-20 (≥2 casos) + D-16 (cobertura ≥70%).
- **Nivel:** stacking/duration/condition viven a nivel **stat**, no entry (confirmado: entradas multi-efecto como Merciless/Deadhead/Pax Soar mezclan stats con y sin condición; el split `1 label = 1 stat` hace del stat el nivel natural).

**Abierto — composición de `condition` (OR/AND):** el shape `condition: string | {any:[…]} | {all:[…]}` está **implementado y el engine lo evalúa** (`evalCondition`, `SimulationEngine`); los OR planos y el primer AND (`on_hit_while_target_affected_by_electricity`) ya migraron; `on_hit_incarnon_form` queda **stub** (granularidad de hit incierta — headshot/weakpoint/charged, deuda `weak-points.md`). El shape es **hipótesis abierta, no cerrada** (gateada por D-16 cobertura + resto de la migración). Claves del diseño:
- `any`=OR, `all`=AND como **intención explícita del autor** (no derivable de la sintaxis: `["while_aim","while_airborne"]` puede ser AND co-ocurrente u OR de alternativas). Un nivel, sin anidar. Un array plano *sin* operador se descartó (no distingue AND de OR).
- Criterio (2026-06-03): OR/AND **derivado de la estructura del dato** (validable por la forma), no lógica por encima — eje `string → array → objeto`. Trade-off: más denso/rígido a cambio de precisión a nivel engine. La gramática (separador `:`, reglas de derivación) es **posterior** a fijar el shape.
- Frontera (→ fórmula dedicada): anidado, secuencial/acumulativo (eje `duration`, separado de condition), relacional (variable ligada, p.ej. Primary Debilitate).
- Documentado a nivel flujo en [`../data/rules/overrides.md`](../data/rules/overrides.md); la granularidad en [`../semantic/condition-nature.md`](../semantic/condition-nature.md). Cobertura y conteo de composiciones: `conditions.md §Resumen` (no duplicar acá). **Próximo paso:** razonar los casos mapeados bajo obj-key antes de acuñar.

**Abierto — scope-grupo** (varios stats, una condición): hoy se **repite** el token (precedente Pax Soar). Optimización anti-repetición, no expresividad — salvo semántica compartida no-replicable (pool de stacks común). Latente.

**Estado del gate D-20:** tiene evidencia cross-schema concreta — Galvanized (mods, D-15 §2) + familia Merciless/Deadhead (arcanes), la misma forma "evento → +val por stack, cap Nx", **ambas resueltas a nivel engine** vía `STACK_DECAY_BUFF` (`arch-decisions.md §11`, `galvanized-stack-decay.test.ts`), consumiendo `stacks` como input C1-declarado sin tocar el schema. Lo que se cerró es el **motor**, no la **gramática**: el bridge de schema (`condition`/`duration` estructurados cross-schema) sigue sin resolver y los 8 arcanos de la familia siguen con `base_value:null`. El eje "quién" (sujeto de condition sobre el target) también tiene un caso concreto resuelto sin infraestructura nueva (`while_enemy_below_half_health` vía `EnemySnapshot`, `arch-decisions.md §13`); el operando literal (`_450`, `_3_stacks`) sigue sin forzar.

**Bloquea:** unificación del modelado de stacking/duration entre los 4 schemas; diseño de composición de condition.
**No bloquea:** captura de datos actual (escape hatch D-20) ni el engine Fase 0 (D-15).
**Vínculo:** `DC-OQ-ENGINE-17` (barrido de arcanes que aportó la evidencia cross-schema), `OQ-DATA-14` (armas modulares, par cercano).
**Fuente:** debate 2026-06-02; `docs/data/schemas/arcane/schema.md §3`, `docs/data/reports/audit-arcane.md`.

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

## OQ-ENGINE-7 — Materialización de nodos de atributo de arma faltantes (Capa 4) — **ABIERTA: ejes (a)+(b) resueltos por molde, eje (c)/C2 de fondo**
**Dominio:** engine / hydration
**Contexto:** ~18 tokens `WEAPON_*` catalogados producen un `Modifier` correcto, pero `ItemRepository.getDNA()` solo materializa ~8 nodos de arma — el resto (`punch_through`, `recoil`, `zoom`, `projectile_speed`, `ammo_*`, `headshot_mult`, familias `combo_*`/`heavy_*`/`slam_*`) se evapora sin nodo que lo reciba.
**Pregunta — separar los tres ejes (no conflacionar):**
- **(a) Operación del upgrade** — cómo compone el token. *Resuelta por molde.*
- **(b) Dato base faltante** — de dónde sale el valor nato del arma (raw de `@wfcd/items`, override por-arma, o sintético). *Resuelta por molde.*
- **(c) Resolución del ataque** — ¿el stat computa o es display-only? Es el **eje de fondo abierto**: los nodos computan valor en C1 (metros, m/s) pero su *efecto* es **C2** (geometría de penetración, falloff) — sin modelo todavía; `it.todo` en `lanka.test.ts`/`cedo-prime.test.ts`.

**Qué hay:** 3 nodos materializados (2026-06-10), que fijan los **tres moldes de base reusables** para el resto de la capa — `punch_through` (override), `projectile_speed` (raw, gate `flight != null` = ausencia ≠ 0), `recoil` (sintético 100, nodo inerte). Detalle vivo de cada molde: [`gap-map.md §Capa 4`](../domains/engine/test/gap-map.md).
**Qué falta:** el resto de los nodos (`zoom`, `ammo_max`/`ammo_efficiency`, `headshot_mult`, `combo_*`/`heavy_*`/`slam_*`) por su molde; `ammo` pausado (`ammo_max` = deuda de fuente, `@wfcd/items` no lo expone; `ammo_efficiency` = no encaja en los moldes, efecto `1/(1−eff)` es C2, espera caso Laetum); y sobre todo el **eje (c)/C2** — falloff, penetración, geometría balística — que decide si estos nodos son display-only o computan.

**No bloquea:** captura de datos ni el vocabulario (tokens correctos y aplicados).
**Gate:** el resto se materializa cuando el foco *weapons* retome Capa 4; el eje (c) se resuelve con consumidor C2, no antes.
**Vínculo:** el mapa de gaps y el detalle de moldes viven en `gap-map.md §Capa 4` (SSoT vivo). Spec de falloff: [`damage-falloff.md`](../../references/wiki/mechanics/damage-falloff.md).
**Fuente:** `gap-map.md §Capa 4`; `references/wiki/mechanics/{punch-through,projectile-speed,recoil,damage-falloff}.md`; `docs/semantic/upgrade-tokens.md`.

## OQ-ENGINE-8 — Contrato de salida de C: materialización de métricas + vocabulario neutro — **ABIERTA (2026-06-10; re-scopeada 2026-07-17 contra código)**
**Dominio:** engine / contrato de salida + vocabulario de capas

**Faceta 1 — vocabulario (parcialmente resuelta por la purga):** la palabra "Proyección" estaba sobrecargada entre el **título de la Capa D** (`simulation-architecture.md §Capa D` — sigue siendo "Proyección (Reactive View Bridge)") y el **payload que emitía C** (`ProjectionSnapshot`, comentado `// UI Projection Layers`). Ese tipo y ese comentario se **purgaron** (Fase 0, 2026-06-16) — la sobrecarga cristalizada ya no existe. Queda como **principio**: cuando el contrato de salida de C se cristalice (faceta 2), nombrarlo **neutro** — sin "Projection" (reservada al título de D) ni "ViewModel" (la Capa E que lo heredaría se descartó, `DC-OQ-ENGINE-10`). Nota menor: el actual `ViewModelContract` (cut C→D display) es un misnomer leve (no hay ViewModel) — rename opcional de bajo valor.

**Faceta 2 — contrato de salida de métricas (el corazón vivo):** las métricas de C2 no fluían a un payload único; el tipo que lo cumplía (`ProjectionSnapshot { entities, metrics:{ ttk?, effective_dps?, status_weights } }`) se purgó por falta de consumidor. Su intención queda como **ancla** (no contrato) en [`../domains/ui-ux/status.md §3`](../domains/ui-ux/status.md). **Spike ejecutado (2026-07-15):** el modo `oracle metrics <build> [enemy] [lvl] [dur]` corre los dos actos contra un `ScaledEnemy` — `CombatCalculator.project` (closed-form) + `TimelineSimulator.simulateBurst` (needs-a-run). La forma impresa `{closed_form:{burst/sustained/crit/status_weights}, run:{ttk, total_damage, effective_dps}}` es el **borrador**; el contrato **no se cristaliza** hasta decidir 2 forks de **intención** (no de arquitectura):
- **(a) `ttk=0` en one-shot kills** — `simulateBurst` marca ttk en `currentTime`, que es 0 si el target muere en `t=0` (`TimelineSimulator.ts:137`). ¿ttk=0 es correcto (muerte instantánea) o el contrato necesita el caso "muere al primer hit"?
- **(b) denominador de `effective_dps`** — hoy `total_damage / simDuration` (`oracle.ts:110`), que **sub-reporta** si el enemigo muere antes de agotar la ventana. ¿`/ttk` (DPS efectivo hasta matar) o `/simDuration` (DPS sostenido teórico)? Define qué mide la métrica.

Ambos forks son métricas de RUN (la Instancia los ubica en la capa run-result — `.working/c2-instancia-objeto-stage0.md §6`); se cierran al cristalizar el tipo.

**No bloquea:** el engine actual. Es deuda de contrato + vocabulario.
**Vínculo:** `DC-OQ-ENGINE-10` (E descartada → el nombre view-shaped no se reasigna). Esta OQ es hoy el hogar del contrato de salida; la condición-gate que `OQ-ENGINE-FUTURE` ponía ("materializar la Capa D") ya se cumplió.
**Fuente:** debate 2026-06-10 (nombre del módulo de salida de C); spike 2026-07-15; `arch-decisions.md §6-7`; `simulation-architecture.md §Capa C2/§Capa D`.

## OQ-ENGINE-9 — Estructura interna de `@core/engine` y ubicación del harness — **CERRADA (2026-07-17) → migrada a `closed-decisions.md` (`DC-OQ-ENGINE-9`)**
Los 4 ejes están resueltos: (a) bootstrap separado de `fixtures/`, (c) Capa A fuera de `providers/`,
(d) `engine/hooks/` purgado, (b) cerrado por solución mejor — el harness dejó de ser una cosa y
`fixtures/builds.ts` es hoy el catálogo compartido tests↔CLI que consume el oráculo D2.
Residual (A2 · shape de la Capa A · lift de `contracts/`) vive en el §Pendiente de `DC-OQ-ENGINE-9`.

## OQ-DATA-9 — Borde de entrada: el merge de overrides sigue duplicado entre el engine y el display — **ABIERTA (2026-06-12; re-scopeada 2026-07-17 contra código)**
**Dominio:** data / integration / arquitectura de acceso

**Modelo acordado (2026-06-12, vigente):** la carga **no es una capa del flujo A→B→C→D** — es un **plano de memoria** ortogonal, direccionado por referencia. A guarda *punteros* (ids); B y la UI los *dereferencian* contra esa memoria. Regla `datos vs información`: 0 entrega *datos canónicos*; los consumidores derivan *información*.
- **Frontera β (anti-god-object):** 0 normaliza *datos* — un override es *el valor verdadero*, no un cómputo — y NO construye *información* (ni el grafo DNA del engine ni el shape display). Test de pertenencia: si X *corrige* el valor → 0; si X *deriva* del valor → consumidor.
- **Puerto y proyecciones:** `DataSource` es el puerto (ports-and-adapters: `BrowserAdapter` / `NodeAdapter`); sobre él proyectan el engine (→ DNA/grafo) y `DataRegistry` (→ display), compartiendo `browserSource`.

**Lo que queda abierto — una sola cosa:** el puerto normaliza la **carga**, no el **valor**. Los overrides se mergean **dos veces**: el engine los aplica en su hidratación (`DataLoader`, `StaticHydrator`, `ItemRepository`, `ModRepository`, `ArcaneRepository`) y `DataRegistry` lee `ability-stats.override` por su lado. Ninguno tiene el registro completo — el síntoma que la frontera β predijo y que sigue sin cruzarse.
**Pregunta:** ¿cómo se corta el contrato de entrada de `@core` para que consuma dato pre-normalizado? (RED-adjacent: le saca trabajo al engine, no le agrega.)

**Residual menor:** `lib/image-url.ts` mezcla los dos bordes — `hydrateImageFromImageName` (entrada, lo consume `DataRegistry`) y `resolveLocalImageUrl` (salida/display → OQ-DATA-10). Separar al consolidar 0.

**No bloquea:** nada. El engine ya no corre contra repos vacíos (`main.tsx` llama `loadEngineData(browserSource)` antes de `createRoot`).
**Vínculo:** **OQ-DATA-10** (borde de salida, par espejo — los dos bordes del mismo flujo) · **corrige el encuadre de OQ-ENGINE-9 eje (c)** ("Capa A fuera de `providers/`": lo que ahí se llamó A es en realidad 0, upstream, que **no es A**) · `DC-OQ-ENGINE-9` (simetría de entrada respecto a `@core`, resuelta).
**Fuente:** debate 2026-06-12 (raíz: quilombo de carga detectado al desplegar la UI). Re-scope 2026-07-17 al cruzar contra código: puerto + adapters, bootstrap de runtime, `fetch` lazy (`DC-OQ-DATA-12`), colapso de las 7 islas `lib/*-data` + los 2 mini-fetchers (→ `Registry.getCatalog` / `useCatalog`) y dedup de `hydrateAbility` ya están ejecutados — dejaron de ser pregunta.

## OQ-DATA-10 — Borde de salida: convergencia de la ruta catálogo con el proyector del engine — **ABIERTA (2026-06-12; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / presentation (owner) — par espejo de OQ-DATA-9 (data).

**Contexto:** el borde de salida (información → píxeles) tiene **dos rutas que no convergen**, cada una con su vocabulario de label y su formateo:
- **Ruta engine (C→D):** `lib/format/stat-presentation` (token D-6 → `{label, category, unit}`) + `toStatEntries` / `formatStatValue` (tabla `unit→regla`, locale-free). Proyector único, consumido por D1 (`UpgradeView`) y D2 (oráculo).
- **Ruta catálogo:** `lib/item-details` (`getAttackStats` / `getModStats`) + `lib/i18n/stat-labels`, con formateo `Intl es-ES` / `toFixed` inline en `WeaponDetailView`, `WarframeDetailView` y popovers.

**Pregunta:** ¿convergen a un proyector único, o son dos espacios de id legítimamente distintos (`@wfcd/items` humano vs tokens `WEAPON_ADD_*` del engine) que solo comparten el sumidero `StatPanel`?

**No bloquea:** nada — la UI renderiza y ambas rutas funcionan.
**Gated por:** un consumidor que necesite el mismo stat por las dos rutas con el mismo formato. Sin eso, unificar es especulativo.
**Vínculo:** OQ-DATA-9 (borde de entrada, par espejo) · OQ-ENGINE-10 (Capa E, descartada) · OQ-ENGINE-8 (sobrecarga de "Proyección").
**Fuente:** diagnóstico 2026-06-12. Re-scope 2026-07-17 al cruzar contra código: los stages A–D y D-7 Fase 4 ya están ejecutados — proyector único, `StatEntry` único, registro token-keyed en `lib/format`, formateo locale-free centralizado y leak β muerto. Todo eso dejó de ser pregunta; la OQ describía como abierto lo que ya estaba hecho.

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

## OQ-DATA-13 — Render de íconos/nodos de habilidad y shards: presentación duplicada sin SSoT — **ABIERTA (2026-06-13; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / presentation (hermana de OQ-DATA-10)

**Contexto:** dos conceptos de display se renderizan dispersos, sin componente/derivación única:
- **Nodos de habilidad de warframe** — `WarframeDetailView` (`AbilityCard`) y `ArsenalView` (`showAbilityNodes`) lo implementan por separado; no hay util compartida en `lib/*`. Los popovers (`warframe-details-popover`) **no** muestran íconos de habilidad y deberían.
- **Ícono de shard** — no es duplicación literal sino **divergencia**: `ArchonShardSelectionView` arma la URL con `shardImageUrl()` (`/assets/archon-shard/` + prefijo `Tauforged`), mientras `ArsenalView` (`ArchonShardsPreviewSection`) usa `resolveLocalImageUrl(entry.image_name)` (`/images/`). Dos rutas de asset distintas para el mismo ícono — peor que copia: pueden resolver a archivos distintos.

**Pregunta:** ¿dónde vive el render único de "ícono de habilidad/shard (ícono + nombre + desc)" para que los 3+ consumidores lo compartan? Mismo patrón SSoT-duplicado que OQ-DATA-10 (formateo) — un concepto de display sin fuente única. El caso del shard además exige **unificar la vía de asset** antes de compartir el componente.

**No bloquea:** función; es consistencia/DRY de presentación. Diferido con el resto del borde de salida (function-first). *(La Capa E que iba a alojar el enriquecimiento de chrome se descartó — `DC-OQ-ENGINE-10`; el SSoT de presentación es `lib/format` + componentes compartidos, no una capa.)*
**Vínculo:** **OQ-DATA-10** (borde de salida / convergencia de rutas de presentación). El mismatch UI↔engine id es síntoma vecino.
**Fuente:** anotación del usuario 2026-06-13 durante la consolidación de "0" (los flags inline originales ya no están en el código).

## OQ-UI-2 — Estado de sesión/UI del usuario: ¿dónde encaja en A→B→C→D→UI + 0? — **ABIERTA (2026-06-13; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / arquitectura de estado (cruza 0, A, B, D)

**Contexto:** hay un estado que el modelo de capas (`simulation-architecture.md`) **no nombra**: el *estado de sesión de la UI* — qué slot está seleccionado, selección de shard en curso, foco/navegación transitoria. Es distinto de la intención de build (`EnsembleIntention`/`ensemble-store`, A1 = *qué está equipado*): esto es *en qué está el usuario ahora mismo en la UI*. Hoy vive en `domains/arsenal/arsenal-ui-session.ts` (store `useSyncExternalStore` module-level).

**Pregunta abierta (el eje de fondo):** ¿dónde encaja el estado de sesión UI en el flujo? ¿Es un plano ortogonal (como 0 lo es para datos) que ni A ni B poseen, o React-state local sin lugar en el modelo de capas? El *qué* (nombre, hogar físico) ya está resuelto; falta el *encaje conceptual*.

**Resuelto (refactor de honestidad, 2026-06-13):** la vieja sombra `arsenal-state` fundía intención (A) + dato (0) + display/mock (B) en un shape con `ArsenalMetadataSource`. Al cruzarla, la mitad `arsenalMetadata` estaba **muerta** (0 consumidores, mock duplicado de una feature viva) → **purgada como dead-code**, no migrada. Sobrevive el estado UI-local (`ArsenalUiState`/`selectArchonShardSlot`), renombrado a `arsenal-ui-session`. Decisión de shape: es **React-state local** (hogar por vista), NO plano global ni capa E; se conserva el store module-level por la **vida cross-route** del slot (lo escribe `ArsenalView`, lo lee `ArchonShardSelectionView` tras `navigate`). Ref `DC-OQ-STUB-1`. Exemplar ya-honesto: `IncarnonEvolutionSelector` (A vía `useEnsemble` + 0 vía `useCatalog`).

**Sigue abierto:**
- El **encaje conceptual** del estado de sesión UI en A→B→C→D→UI + 0 (la pregunta de fondo).
- **Chrome de slot disperso:** nombre+imagen por slot hidratados a mano en `ArsenalView` (`Registry.getItemById` en `useEffect`) y `SLOT_DEFINITIONS` (labels/desc/iconos inline). Es lectura de 0 inconsistente — deuda de consistencia menor (la Capa E que iba a centralizarlo se descartó, `DC-OQ-ENGINE-10`; el patrón vigente es leer 0 directo). Los candidatos de formateo/íconos ya están en OQ-DATA-10/-13.

**No bloquea:** la UI funciona.
**Vínculo:** **OQ-DATA-9** (0 / borde de entrada), **`DC-OQ-ENGINE-9`** (Capa A / intención respecto a `@core`, resuelta), **OQ-DATA-10/-13** (lo display deriva de la proyección), **OQ-UI-3** (la confirmación de pérdida consulta el estado "sucio" de esta capa), `DC-OQ-ENGINE-10-C` (modelo de 2 canales / separación de ejes). El mismatch UI↔engine id es síntoma vecino.
**Fuente:** TODO inline del usuario en la vieja sombra `arsenal-state`; debate 2026-06-13.

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

**Sub-eje arquitectónico:** ¿usar **headless UI** aquí es contraproducente? No expone una API como tal; gestionarlo vía React con estados globales puede ser over-engineering. Contrastar con una **capa de captura propia — desacoplada, genérica y react-free** que React consuma (el principio "núcleo react-free que React solo consume", aplicado a **inputs/navegación**, no a presentación). Ojo: evaluar el impacto real antes de reescribir (anti-reescritura).

**Pregunta:** ¿El proyecto necesita un gestor de inputs/jerarquías dedicado (react-free, consumido por React), o basta endurecer el manejo de `esc`/foco sobre lo actual? ¿headless UI suma o estorba en el menú?

**No bloquea:** nada (el menú navega correctamente).
**Vínculo:** OQ-UI-3 (footer / modelo de navegación), OQ-UI-2 (estado de sesión/UI).
**Fuente:** TODO inline del usuario en `DialogMenu.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-ENGINE-10 — Capa E (Presentación / ViewModel) — **DESCARTADA (2026-07-17) → `closed-decisions.md` (`DC-OQ-ENGINE-10`)**
E proponía una capa intermedia C→D→E→UI que enriquecía+hidrataba el snapshot, moviendo
`ViewModelContract` fuera de D. Se descartó: la hidratación de chrome la provee el piso "0"
(capa horizontal de datos, OQ-DATA-9) y el formateo lo provee `lib/format` — sin esos dos
trabajos, E no queda con nada propio. **D se lee por dos lentes de salida** — D1 (`use-view-model`,
UI, aún prematuro) y D2 (`oracle`, CLI) —, sin capa entre medio. No re-proponer E.
El rename D→contrato neutro que E arrastraba es decisión aparte y sigue viva: `OQ-ENGINE-8`.

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
**Vínculo:** `damage-status-model.md` (el modelo completo, incluye la brecha ya encontrada entre `EnemyState.processDots()` — decaimiento lineal continuo, código de abril — y el primitivo de N-timers-independientes validado empíricamente esta sesión; el bug de `getDamageMultiplier` y el rename de vocabulario legacy ya se resolvieron en Fase 3 pieza 3, previo a esta campaña).
**Fuente:** debate de modelado C2, verificación empírica in-game 2026-07-02.

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

**Precisión añadida (verificación de estabilidad, 2026-07-09):** la fila `AR/(AR+300)` de la tabla NO es
"era vieja" en abstracto — `references/wiki/mechanics/{armor.md,damage-reduction.md}` confirman que es
la fórmula **vigente y correcta para Tenno** (jugador), coeficiente 300 explícitamente descrito como
"escala estándar para Tenno". El conflicto de 3 vías es exclusivamente sobre DR de **enemigo**; no hay
conflicto en la fórmula de jugador. Esto re-diagnostica (no resuelve) el checkpoint 2 de la
reconciliación de `resolveHit` (`damage-status-model.md`): la fórmula vieja que tenía `resolveHit` no
era "una DR incorrecta" sin más — era la fórmula de Tenno aplicada a un target enemigo.

**Vínculo:** `references/wiki/mechanics/{enemy-level-scaling.md §Armor, enemy-resistances.md §DR, armor.md, damage-reduction.md}`, `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`, `Project/src/core/engine/formulas/enemy/armor-mitigation.ts` (movido de `EnemyRepository.ts` en P1, 2026-07-09).
**Fuente:** eje enemigo / contraste #0 (2026-07-06); verificación de estabilidad pre-C1 (2026-07-09).

---

## OQ-ENGINE-16 — Fidelidad de N-declarado vs. timers reales para stacks de status (C1) — **ABIERTA (2026-07-09)**
**Dominio:** engine / C1 (input declarado) + C2 (timers de status)

**Contexto.** Doctrina §8 (`arch-decisions.md`): toda mecánica C2 se modela primero en modo **input declarado** ("asumo N stacks") antes que simulado (el valor emerge de una timeline). Para el clúster de status-stacks (Viral/Magnetic/Corrosive — `c2/stack`=42 del roadmap, Galvanized-like) **las fórmulas del multiplicador ya están cross-validadas** contra `references/wiki/mechanics/status-effects.md` (verificado in-game): viven en `formulas/status/stack-debuff.ts` (Viral/Magnetic `first + perAdd×(n−1)`, Corrosive `min(0.26+0.06×(n−1),0.80)`). **No es la fórmula lo que falta.**

**Lo que falta:** el comportamiento real de cada stack es **timer independiente por instancia, con decay/reemplazo propio** (confirmado empíricamente, `damage-status-model.md`). Declarar N estáticamente asume un snapshot fijo, pero el juego tiene stacks entrando y venciendo escalonados. **¿Hasta qué punto un N declarado es fiel** antes de que el número mienta (infle/desinfle)? El clúster trae además **2 modelos de decay divergentes** ("expiran juntos" vs "incremental 1-stack") sin resolver cuál aplica a qué caso.

**Método (no re-litigar, aplicar):** mismo patrón que double-dipping (`DC-OQ-ENGINE-13`) — la fórmula "sonaba" simple y no lo era hasta estresarla in-game. **No se resuelve teorizando:** se elige un caso real (candidato: primer Galvanized real, o el `c2/stack` de mayor payoff) y se estresa con dato antes de generalizar.

**Estado del tracker (verificado 2026-07-17):** el motor **no tiene tracker real de acumulación para ninguna familia** — `stacks`/`activeStacks` se declaran a mano por variable de contexto (`SimulationEngine`, default 0/1). Confirma el diagnóstico: el resolver **no intenta** modelar decay, aun teniendo el dato (`notes[]` documenta `duration` por mod), a propósito.

**Caso hermano — NO fusionar:** el buff-on-event con cap (Merciless/Deadhead/Galvanized, `STACK_DECAY_BUFF`, `arch-decisions.md §11`) comparte la tensión (¿N declarado sin timer es fiel?) pero **es otro mecanismo** que el clúster `c2/stack`=42 de status: buff propio on-event vs. procs del target, fórmulas y fuentes de N distintas. Se ejecutó C1-declarado puro (sin timer) — dejó esta OQ **donde estaba a propósito**. Capturar por separado (precaución explícita del usuario).

**No bloquea:** el modo-input declarado es válido como techo donde el consumidor acepta "asumido, no simulado" (mismo espíritu que CO estático). Bloquea sólo la confianza en la FIDELIDAD del número para el clúster de 42 casos.
**Vínculo:** `damage-status-model.md` (timers independientes, brecha `processDots`), `arch-decisions.md §8` (doctrina) + `§11` (caso hermano), `OQ-DATA-4` (evidencia cruzada de schema).
**Fuente:** debate 2026-07-08 (`.working/c1-simulation-doctrine.md §4-T1`); cristalizada en la verificación de estabilidad pre-C1 (2026-07-09).

## OQ-ENGINE-18 — Status Duration en DoT: ¿más ticks o ticks estirados? (A vs B) — **ABIERTO (2026-07-10)**
**Dominio:** engine / C1-timeline (ancho del pulso de DoT) — depende de dato in-game

**Contexto.** El modelo de timeline de DoT (`../domains/engine/design/damage-status-model.md` §Modelo de
timeline) trata cada instancia como un **pulso** `{inicio, ancho, amplitud}`. Un mod de **Status Duration**
ensancha el pulso, pero NO está verificado CÓMO:
- **(A) más ticks a intervalo fijo** → +100% dur. = 12 ticks en vez de 6 → **daño total sube ×2**.
- **(B) los mismos ticks a intervalo estirado** → 6 ticks repartidos en 12s → **daño total igual**, solo más lento.

Ambas coinciden en "el proc dura más" — por eso la observación de duración **NO las distingue**.

**Test decisivo (in-game):** **sumar el daño total** del DoT con y sin Status Duration (duplica → A; igual
→ B), o contar los números de tick que aparecen. NO observar si "dura más" (ambas lo hacen).

**Lo que la wiki dice hoy:** `references/wiki/mechanics/status-effects.md` solo especifica el escalado de
duración para **Blast/Heat/Electricity**; para el resto (Slash/Toxin/etc.) es **hueco de dato**, no ley.
Lean del equipo = **(A)** (Status Duration es multiplicador de daño conocido en builds de DoT — nadie lo
correría si fuera B), pero **sin verificar cuantitativamente**.

**Ramificación a los stack-debuffs (no confundir):** para Viral/Corrosive (capeados) "más duración" NO
sube el techo (Corrosive tope 80% sigue igual) — sube el **uptime** (los stacks decaen más lento). Es una
consecuencia distinta del eje A/B del DoT; testear por separado (DoT → ¿sube el total? / debuff → ¿sube el
uptime?).

**No bloquea:** la agregación de pulsos **declarados** (`formulas/status/dot-timeline.ts`, Slice 3a) — ahí
el ancho se declara directo ("6 ticks"), no se deriva del mod. A/B solo importa cuando se derive el ancho
desde un valor de Status Duration.

**Vínculo:** `../domains/engine/design/damage-status-model.md` §Modelo de timeline (el pulso y sus 5
fronteras), `OQ-ENGINE-16` (fidelidad N-declarado vs timers — eje hermano de duración/decay),
`references/wiki/mechanics/status-effects.md` (escalado de duración documentado solo para Blast/Heat/Electric).
**Fuente:** debate 2026-07-10 (Slice 3, modelo de timeline); observación in-game del usuario, pendiente de comprobación cuantitativa.

---

## OQ-ENGINE-19 — Generador discreto de N proc-slots a Status Chance >100% — **ABIERTO (2026-07-11)**
**Dominio:** engine / C1-población (eje RNG del DoT) — depende de dato in-game / doc oficial

**Contexto.** El eje Población del frame de C2 (`../domains/engine/design/damage-status-model.md
§Población/RNG`) modela cuántos proc-slots dispara un pellet cuando su Status Chance supera 100%. La
wiki confirma el **mecanismo** (cada hit puede aplicar más de un status, cada slot dibuja su tipo
independiente — `references/wiki/mechanics/status-effects.md §Aplicación`, cita literal + nota de
parche `{{ver|27.2}}`) pero no da la fórmula exacta del **generador discreto**: cuántos slots produce,
ej., un SC=234%.

**Hipótesis de trabajo, no confirmada:** floor+remainder, por analogía con el generador YA confirmado
de Multishot (`references/wiki/mechanics/multishot.md`: `Guaranteed=floor(total)`, `Extra
Chance=frac(total)`). Plausible (misma familia de mecanismo), pero la wiki de Status Chance nunca lo
escribe letra por letra para status — a diferencia de multishot.

**Por qué no bloquea:** para el total esperado y la curva esperada, el valor exacto del generador es
irrelevante — por identidad de Wald, `E[N]=chance` alcanza sin importar la distribución completa de N.
Solo importaría para un futuro sampler de corrida individual (Monte Carlo, varianza) o para UI que
muestre "qué pasó en este hit exacto" — ninguno de los dos existe hoy.

**Ramificación — folding contra el cap del primitivo de stack (no confundir).** Si N≥2 slots del mismo
efecto stack-debuff (Corrosive, Viral, etc.) nacen del mismo hit simultáneamente, ¿el primitivo de
N-timers/cap-K (`damage-status-model.md §primitivo reusable`) los pliega secuencial (cada uno chequeando
el estado ya actualizado por los anteriores del mismo hit) o hay una regla especial para eventos
co-instantáneos? Sin evidencia in-game ni wiki que lo distinga. Gated por la brecha YA existente de
`EnemyState.processDots()` (pool lineal, no N-timers) — no es un gate nuevo, solo se vuelve relevante
cuando esa brecha se resuelva.

**Vínculo:** `../domains/engine/design/damage-status-model.md §Población/RNG` (debate destilado; scratch `.working/` purgado), `OQ-ENGINE-18` (mismo patrón de hueco —
fórmula de promedio conocida, generador discreto no).
**Fuente:** debate 2026-07-11 (eje Población/RNG, tramo b); captura in-game del usuario (Exalted Blade,
SC=200,6%, 3 stacks de Corrosive de 1 hit — confirma que el mecanismo existe y permite same-type
multi-stack, no confirma el conteo exacto).

---

## OQ-ENGINE-20 — Snapshot vs. live en el tick de DoT: frontera temporal bajo buffs dinámicos — **ABIERTO (2026-07-13)**
**Dominio:** engine / C2 (modelo de proc/DoT) — depende de test in-game

**Contexto.** La data de double-dip (`.working/double-dipping-test.md`) prueba que el tick de un DoT
compone **dos mitades**: `tick = snapshot(daño del hit resuelto, con buffs source YA horneados al
aplicar) × live(re-aplicación del contexto source en el tick)`. La huella dura es el double-dip:
Roar (×2.128, bucket②) aparece **al cuadrado** en el DoT (`DoT÷base = 4.53 ≈ 2.128²`) pero ×1 en el
hit — solo posible si el mismo multiplicador vive en las **dos mitades** a la vez. **Toda la data es
steady-state** (el buff está activo en TODAS las tiradas).

**Pregunta.** Bajo cambio del buff **a mitad** del DoT (ej. Roar cae en el tick 4 de 6), ¿qué mitad
responde? (i) solo cae la mitad **live** — el tick baja de Roar² a Roar¹, el snapshot persiste; (ii)
**muere todo** el aporte del buff; (iii) otra. Esto decide qué contexto del source es **snapshot**
(congelado en el proc) vs. **live-ref** (re-evaluado por tick) en el modelo de proc.

**Hipótesis del usuario, no confirmada:** "muere completo" — por experiencia de juego (usa mucho estas
sinergias), pero **explícitamente sin verificar** (no spamea la habilidad al terminar el DoT, así que
la sensación no distingue (i) de (ii)).

**Por qué importa.** Define la estructura del proc: `{ snapshot, refs-live }`. El proc **referencia
estado del emisor** (congelado y/o vivo) → **rompe la agnosticidad source** — aceptado deliberadamente
como *fidelidad*, no como accidente (decisión 2026-07-13). No bloquea construir el modelo con la
premisa conocida (snapshot × live); bloquea **cerrar el split exacto** por multiplicador.

**Test que lo cierra:** dropear un buff (Roar) a mitad de un DoT largo y medir ticks post-drop vs.
pre-drop. Un solo experimento discrimina (i)/(ii).

**Vínculo:** `.working/double-dipping-test.md` (data steady-state), `../domains/engine/design/damage-status-model.md §Modelo unificado de proc`, `../domains/engine/design/damage-status-model.md §Evidencia`, frontera
"coupling Viral-en-vivo/snapshot" (5 fronteras del timeline, `decision-frontier.md §4`), `OQ-ENGINE-16`
(mismo eje de fidelidad temporal: N-declarado vs. timers reales), bucket② gating.
**Fuente:** debate 2026-07-13 (ontología instancia/proc + composición snapshot×live); data double-dip
pre-existente (no cubre el transitorio).

---

## OQ-DATA-14 — Armas/entidades modulares: ensamblaje de DNA desde piezas — **ABIERTO (2026-07-09)**
**Dominio:** data / hidratación ("B", hipótesis tentativa — no confirmado)

**Contexto.** Durante el barrido de clasificación de arcanes (DC-OQ-ENGINE-17) se detectó que un subconjunto
del corpus `upgrade_type:null` cuelga de armas/entidades **modulares** — no una pieza única con stats
propios, sino **N piezas que se combinan** para producir el DNA final (stats base, tipo de daño, etc.):
**Zaw** (strike+link+grip, 5 arcanos), **Kitgun** (chamber+grip+loader, 7 arcanos), **Amp** (prism+scaffold+brace,
5 arcanos) ya confirmados con arcanos propios en el dataset; **MOA** y **Hound** son la misma "bolsa"
conceptual (compañeros modulares) aunque hoy no tienen arcanos propios capturados en `arcanes.json`. Lo que
cambia entre casos es únicamente **qué piezas** se combinan y **con qué regla** — el problema de fondo
("construir un DNA canónico a partir de N componentes") es el mismo.

**Hipótesis (tentativa, "entre comillas" — no se investiga todavía):** el ensamblaje es responsabilidad de
**B** (hidratación/materialización), no de C — mismo principio que `§1` (Weapon = nodo canónico principal:
C opera sobre el nodo ya hidratado, agnóstico a su origen) y el precedente de exaltadas (`OQ-ENGINE-11`,
la derivación vive en A1/B, no en C). Sin confirmar contra datos reales todavía.

**Condición para resolver:** cuando se decida atacar el modelado de armas/entidades modulares — primero
traer información real de la wiki por tipo (piezas, reglas de combinación) y construir la teoría desde
ahí, no antes (mismo método que CO/melee-combo: no diseñar la abstracción sin el corpus enfrente).

**No bloquea:** el resto del engine, ni el barrido de arcanes no-modulares (ya separado en DC-OQ-ENGINE-17).
**Bloquea:** modelar los arcanos Amp/Zaw/Kitgun-específicos (22 arcanos parkeados: 5 amp + 5 zaw + 7 kitgun,
más los 17 de Operator que quedan gated aparte por falta de foco en el Operador, no por este eje); build
completo de cualquier Zaw/Kitgun/Amp.
**Vínculo:** **DC-OQ-ENGINE-17** (el disparador — barrido de arcanes, 2026-07-09), **OQ-DATA-1** (par cercano
pero eje distinto: DATA-1 = *layout de slots* de companions modulares; ésta = *cómputo de stats* del DNA
ensamblado).
**Fuente:** debate 2026-07-09, barrido de corpus arcane (DC-OQ-ENGINE-17).
