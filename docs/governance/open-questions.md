---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-07-31"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos **activos** (abierto / gated / condicional). Una pregunta que se cierra de verdad se mueve **entera** a `closed-decisions.md` y se **borra de acá** — cuerpo y fila del índice, sin lápida. La regla completa (y cómo verificar que un cierre es genuino) vive en `docs/CLAUDE.md §Frontera open-questions ↔ closed-decisions`.

## Índice

**Leé esta tabla, no el documento.** El detalle de cada OQ se consulta bajo demanda: buscar `## <ID>`.
Es lectura obligatoria de arranque (`docs/CLAUDE.md` §Jerarquía) y el cuerpo son ~15k palabras — el
presupuesto de atención se gasta acá, no leyendo las 35 en fila.

| OQ | Tema | Dominio | Estado |
|---|---|---|---|
| `OQ-W-5` | Semántica de los canales de costo: `ENERGY_COST` / `ENERGY_DRAIN`, la forma invertida como ganancia, y el costo en Health | data / ability-stats → engine | abierta — no bloquea |
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
| `OQ-DATA-9` | Overrides = vista-consumidor (no doble-merge); convergencia por salida diferida | data / integration | re-scopeada — gate: madurez de datos |
| `OQ-DATA-10` | Convergencia ruta catálogo ↔ proyector del engine | ui-ux / presentation | abierta — re-scopeada 2026-07-17 |
| `OQ-DATA-11` | Compatibilidad de mods por entidad | data / semantic | abierta — degrada usabilidad |
| `OQ-DATA-13` | Íconos de habilidad/shard: presentación duplicada/divergente | ui-ux / presentation | abierta — no bloquea |
| `OQ-DATA-14` | Armas modulares: ensamblaje de DNA desde piezas | data / hidratación | abierta — no bloquea |
| `OQ-DATA-15` | Campo `faction` contaminado del enemigo (scaling + FACTION_BONUS) | data / "0" → engine | abierta — síntoma resuelto en el consumidor (cascada); **causa raíz en el parser de upstream**, alcance fuera del enemigo sin medir |
| `OQ-DATA-16` | Fuente de datos propia (estructura a medida) vs el fork `@wfcd/items` | data / pipeline / fuente | abierta — el raw es propio y Project lo consume; las **imágenes** siguen saliendo del clon de upstream (605 MB) y los iconos de habilidades no existen en ninguna fuente resuelta; no bloquea |
| `OQ-UI-2` | Dónde vive el estado de sesión/UI | ui-ux / arquitectura de estado | abierta — no bloquea |
| `OQ-UI-3` | Footer: acciones contextuales + confirmación | ui-ux / interacción | abierta — **bloquea flujo BUILD** |
| `OQ-UI-4` | Profile como "utility hub" | ui-ux / producto | abierta — no bloquea |
| `OQ-UI-5` | OptionsView + decisión de NO-i18n | ui-ux / configuración | abierta — no bloquea |
| `OQ-UI-6` | Revisión funcional del menú de navegación | ui-ux / interacción | abierta — no bloquea |
| `OQ-ENGINE-2` | Profile switching en runtime (Incarnon/Alt-fire) | engine / simulation-context | re-scopeada — path dinámico sin consumidor |
| `OQ-ENGINE-7` | Nodos de arma faltantes (Capa 4): resta el eje (c)/C2 | engine / hydration | abierta — no bloquea |
| `OQ-ENGINE-11` | Exaltadas: intención estructural en A1 | engine / Capa A | abierta — diferida |
| `OQ-ENGINE-12` | Crit condicional (Puncture/Cold): gancho hecho, fidelidad pendiente | engine / C2 | re-scopeada — ausencias vivas (cap-boss / 10º stack) |
| `OQ-ENGINE-14` | Alcance del modelado melee | engine / C1 + C2 | promovida a diseño |
| `OQ-ENGINE-15` | DR de armor enemigo: conflicto de 3 vías | engine / C2 | abierta — `√3a/100` provisional |
| `OQ-ENGINE-16` | N-declarado vs timers reales de stacks | engine / C1 + C2 | abierta — no bloquea |
| `OQ-ENGINE-18` | Status Duration en DoT: ¿más ticks o estirados? | engine / C1-timeline | abierta — gated por test in-game |
| `OQ-ENGINE-19` | Generador discreto de N proc-slots a SC >100% | engine / C1-población | abierta — gated por dato in-game |
| `OQ-ENGINE-20` | Snapshot vs live en el tick de DoT | engine / C2 | abierta — gated por test in-game |
| `OQ-ENGINE-21` | Fidelidad de la ley de scaling: la tabla no está validada por DE | engine / C2 | abierta — gated por medición; Anarchs cerrado |
| `OQ-ENGINE-22` | Generalizar EHP/DR de `enemy/` a `entity/` (player/companion) | engine / formulas | abierta — diferida, sin consumidor real hoy |
| `OQ-ENGINE-23` | Rank de ítem (warframe/arma) sin consumidor; `mod.rank` vestigial | engine / A1-C1 | abierta — diferida, no bloquea, sin necesidad real hoy |
| `OQ-ENGINE-24` | Derivación cross-stat (Iron Skin y su clase): fórmula dedicada ↔ grafo | engine / C1 | abierta — **diferida por decisión**: 1 de 1241 `upgrade_by` emite modifier; gap rojo-ejecutable |
| `OQ-ENGINE-25` | Orden de `total_flat` vs `multiplicative` contra la referencia canónica | engine / formulas — fidelidad | abierta — **latente**: intersección vacía medida, no bloquea |
| `OQ-ENGINE-26` | Composición entre fuentes de life steal: la fuente no lo declara | engine / C2 — sustain | abierta — hueco de la wiki, gated por medición |
| `OQ-ENGINE-27` | `co_base`: la regla padre→hijo del CO, declarada en el schema y sin validar del todo | engine / C1 — fidelidad CO | abierta — **gated por investigación**; el qué ya está decidido en `arch-decisions §9` |
| `OQ-ENGINE-28` | Resistencias por entidad: capa aparte de la matriz por facción | engine / C2 — modelo de enemigo | abierta — diferida, sin consumidor |
| `OQ-ENGINE-29` | ¿Los status sin ícono (`Lifted`/`Knockdown`/`Microwave`) cuentan para CO? | engine / C2 — población de status | abierta — gated por test propio, **diseño listo** |
| `OQ-ENGINE-31` | ¿Qué le falta a una entidad para ser modelable? — el compañero como forcing-case | engine / modelo de entidades | abierta — **gated por medición** (P-5) y por capacidad de propagación |
| `OQ-ENGINE-FUTURE` | Features de evolución del motor | engine / simulation-v2 | abierta — backlog |
| `OQ-DOC-1` | Docs commiteados citan `.working/` (gitignored) como autoridad | governance / higiene-docs | abierta — no bloquea |
| `OQ-DOC-2` | Fuente estancada: falta la señal inversa (no se mueve hace años) | governance / higiene de fuentes | abierta — (a) ejecutable ya, (b) worklist per-item |

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

**La misma forma aparece invertida, como ganancia.** Bloodletting (Garuda) restaura energía con
`÷ (2 − efficiency)` — mismo factor, división en vez de multiplicación, ganancia en vez de costo.
No es una fórmula nueva: es el mismo primitivo leído al revés. Si `ENERGY_COST` se implementa, el
caso de ganancia sale casi gratis. (Bloodletting **no** dispara mods de daño→energía tipo Rage /
Hunter Adrenaline — exclusión explícita, anotar al modelar para no duplicar la conversión.)

**Hay al menos un canal de costo que no es energía.** Scarab Shell (Inaros, 3ª) se paga en
**Health**: 25 HP por cada 1% de armor generado, ramp de 4.67 s, hasta 2.500 HP para carga completa,
y **se puede detener a medio cargar**. El vocabulario actual (`ENERGY_COST` / `ENERGY_DRAIN`) no
cubre ese eje.

> ⚠️ **No asumir que es el mismo mecanismo con otro recurso.** Que ambos sean "costo de activación"
> no dice que compartan forma: el de energía es un factor sobre un costo puntual, el de Inaros es un
> **drenaje progresivo con estado intermedio** (carga parcial) y tope. Colapsarlos en `HEALTH_COST`
> por analogía sería afirmar algo que no está medido. Se resuelve cuando aparezca un segundo caso de
> costo-no-energía con el que comparar la forma — criterio `D-20`, no antes.

**Estado:** deuda legítima. No bloquea el pipeline de datos ni el schema.
**Condición:** cuando el engine necesite resolver valores de energía para habilidades activas.
**Fuente:** `references/wiki/warframes/garuda/bloodletting.md` · `references/wiki/warframes/inaros/scarab-shell.md`

---

## OQ-DATA-1 — Materialización de slots por entidad — **ABIERTO (2026-05-25)**
**Dominio:** data / arsenal / engine
**Contexto:** Los slots por entidad (Warframe 8 mods + Aura + Exilus + 2 Arcanos, Melee + Stance, etc.) son información canónica del juego documentada en `docs/domains/ui-ux/slot-reference.md`. Casos especiales como Jade (2 Auras), Sevagoth Shadow, exaltadas y companions modulares requieren modelado explícito. `UpgradeView.tsx` ya está **activo** (consume el engine vía `useViewModel` + `toStatEntries`), pero sin diseño definido del **layout de slots por entidad** — que es lo que esta OQ gatea.
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
**Contexto:** backlog vivo de features sin prioridad asignada — las dos primeras vienen de pre-implementación (abril 2026); se suman las que aparecen después (fechadas en la tabla). Ninguna tiene consumidor que la exija hoy.

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | API serializable del motor para mover la simulación a un Worker | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer; aprovecha que el motor es determinista | UX de comparación de builds |
| **Overguard como capa de entidad** (2026-07-22) | Modelar overguard **para entidades en general**, no solo enemigos (hoy sólo aparece como "futuro" en `effect-behavior.ts` y como flag faltante en `OQ-ENGINE-12`). Dato disponible: coeficientes de scaling en `Module:Enemies/infobox` (`f1 0.0015/4.00, f2 260.00/0.90`) | Capa de mitigación propia + caps de status (Freeze 4 stacks en Overguard) |

**Estado:** la condición-gate original ("cuando la Capa D se materialice y haya un cliente real") **ya se cumplió** — `ViewModelContract` v0 existe, consumido por D1 (`use-view-model`) y D2 (`oracle`). Aun así ninguna de las dos features tiene demanda: se retoman si un consumidor las pide. Nada en código todavía (verificado 2026-07-17).

> El debate del **contrato de salida / `ViewModelContract`** que creció dentro de esta OQ se cerró o migró y **ya no vive acá**: el contrato es **estructurado neutral** (`StatViewModel { token, value, unit }` — decidido, no strings formateados); el rename D→nombre-neutro (residual `ViewModelContract`) es `DC-OQ-ENGINE-8`; la simetría de entrada (`ensemble.types`→`@shared`, store→`@core`) es `DC-OQ-ENGINE-9`; "dominios ↛ `@core`" (y `@providers → @core` permitido) está en `arch-decisions.md §7` + `decision-frontier.md §1`; el principio consumer-shaped / anti producer-laundered vive en `arch-decisions.md` + `view-model/index.ts`.

**No bloquea:** nada.
**Fuente:** notas de pre-implementación (abril 2026).

## OQ-W-6 — Vocabulary gap: upgrade_by para stats base del warframe — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → taxonomía
**Contexto:** El vocabulario `AbilityUpgradeBy` cubre los 4 stats de habilidad (`AVATAR_ABILITY_STRENGTH/RANGE/DURATION/EFFICIENCY`) y los dos ejes de energía (`ENERGY_COST/DRAIN`). Inaros Scarab Swarm tiene un stat (`Damage: 241`) que escala con Max Health del warframe — un eje de base stat sin token. El `//!` en `Inaros.md` lo registra: `"scale with health, literaly 'vitality' maxed (100% health) affected this number 483"`.
**Pregunta:** ¿Cómo se extiende `upgrade_by` para cubrir stats base del warframe (health, shield, armor)?
- La taxonomía D-6 ya define `AVATAR_ADD_HEALTH_MAX` como token de mod. El principio que se busca es **globalizar la semántica**: el mismo vocabulario `AVATAR_*` debería aplicar.
- Opciones: token completo idéntico al mod (`AVATAR_ADD_HEALTH_MAX`), o forma sin OPERATION (`AVATAR_HEALTH_MAX`) para separar el eje "con qué escala" del eje "qué modifica".
**Condición para resolver:** al resolver la taxonomía general de `upgrade_by` — cuando haya ≥2 casos distintos de base-stat scaling en abilities que justifiquen el patrón. ~~Hoy solo Inaros es caso confirmado.~~

**El umbral de ≥2 casos YA se superó** (barrido contra `references/wiki/`)**:** Iron Skin
(`× TotalArmor`), Snow Globe (idéntica), Icy Avalanche (`20% armor→OG`), Trinity pasiva
(`0.5 × Energy Max`), Bloodletting (`MaxEnergy` **y** `MaxHealth`) — **5 casos además de Inaros**, en
3 formas distintas. Que el umbral esté cubierto **no** dispara la extensión del vocabulario: el eje
**mecanismo** está diferido en `OQ-ENGINE-24` por falta de corpus de habilidades modeladas, y extender
`upgrade_by` sin mecanismo que lo consuma sería vocabulario muerto.

**Medición del dato:** el override tiene **1241 `upgrade_by` en 5 valores** —
`AVATAR_ABILITY_STRENGTH` (481), `_RANGE` (257), `ENERGY_COST` (245), `_DURATION` (223),
`ENERGY_DRAIN` (35). **Ningún capacity-stat, y ninguno va a aparecer por parsing:** la wiki expresa
esas dependencias en prosa ("Armor Multiplier × Total Armor"), no en formato de stat. Cualquiera sea
la forma que se elija, el dato hay que **escribirlo a mano** — lo que empuja la decisión hacia dónde
es verificable (código tipado y testeado) y no hacia el JSON.
**Bloquea:** Anotar correctamente Inaros Scarab Swarm. Extensión del vocabulario `AbilityUpgradeBy` en `shared/types/ability.ts`.

> ⚠️ **Al barrer, no capturar la habilidad equivocada.** Esta OQ habla de **Scarab Swarm**, la **1ª**
> de Inaros (daño que escala con Max Health). **Scarab Shell** es la **3ª** — armor a cambio de
> Health— y **no** es un caso de esta OQ: su bonus escala sólo con Strength, no lee ningún capacity
> stat como input. Lo que aporta es un **canal de costo**, y vive en `OQ-W-5`. Nombres parecidos,
> habilidades distintas.

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
El parser `apply-ability-md.ts` toma solo el primer token y emite `console.warn`. El schema **ya soporta** `upgrade_by` como `AbilityUpgradeBy | AbilityUpgradeBy[]` (resuelto 2026-05-26); el engine usa `[0]`. Límite activo: la **fórmula dedicada de double-scaling**, no el schema — `formulas/ability/` ya existe (`ability-crit`, `ability-status`) pero sin la fórmula de composición de dos modificadores.

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

**Abierto — composición de `condition` (OR/AND):** el shape `condition: string | {any:[…]} | {all:[…]}` está **implementado y el engine lo evalúa** (`evalCondition`, `SimulationEngine`); los OR planos y el primer AND (`on_hit_while_target_affected_by_electricity`) ya migraron; `on_hit_incarnon_form` queda **stub** por el eje `charged` — el eje headshot/weakpoint está **resuelto**: no colapsan, están en **subsunción** (`semantic/condition-nature.md §Tabla semilla de subsunción`, fuente `references/wiki/mechanics/enemy-body-parts.md`). El shape es **hipótesis abierta, no cerrada** (gateada por D-16 cobertura + resto de la migración). Claves del diseño:
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
**Contexto:** `conditions.md` clasifica los tokens con `engine:class:c2/*` (binary / derived / event / stack / —). Ese eje describe qué debería computar el C2. Cuando la OQ se abrió (2026-06-03) ese engine no existía y el eje era puramente especulativo; hoy el C2 se materializó parcialmente (`SimulationContext`, `EnemyState`, `behaviors`, stacks) — el eje ya **se puede contrastar** contra el engine real en vez de contra uno hipotético. Aun así el criterio organizador sigue anclado al modelo de evaluación, no a la mecánica del juego.

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
**Contexto:** el bonus de conjunto —el efecto emergente que escala con el nº de piezas equipadas (ej. *"Gladiator Set: +X% melee crit per combo stack"*)— no llega a `public/data/mods.json`, y hace falta para simular un loadout. **Es un gap de pipeline, no de datos** (ver `docs/data/references/set-mods.md` y `docs/domains/source/gaps.md` §G-4):

- **La fuente lo trae completo.** `warframe-items/data/json/Mods.json` expone `modSet` (puntero al portador) en los 72 mods miembro, y los 19 portadores `type: "Mod Set Mod"` con `numUpgradesInSet` + `stats[]`: un escalón de texto por cantidad de piezas. `generate-data.ts` no lee ninguno de esos campos, así que los portadores llegan vacíos a nuestro dataset.
- **Gap A — pertenencia al set:** resuelto en la fuente (`modSet` explícito, no hay que derivar del `unique_name`). Queda `pipeline:debt` trivial: propagar el campo.
- **Gap B — el modelado, no la captura:** los valores vienen como **texto libre** → hay que tokenizarlos (mismo parseo que `levelStats`). Y el bonus sigue sin caber en `mod-stats.override.json` (shape per-mod): es un efecto del *set*, parametrizado por piece-count + condition propia. Es una **entidad nueva** (`set → {bonus, escala por piezas, miembros, condition}`). Tabla del wiki en `references/set-mods.md`, ahora como contraste del tokenizado.

**Preguntas abiertas:**
- ¿Schema/entidad `sets` propia, o extensión del modelo de mods (override colgado del portador `Mod Set Mod`)? El bonus es un efecto **stacking por piece-count** → instancia de `OQ-DATA-4` (stacking + composición de condition); la escala 1→max es literalmente un array indexado por nº de piezas.
- **Eje de condition nuevo:** los bonus introducen `requires_<equipo>` (companion type, umbral mods, both pieces) ausente del vocabulario actual → cruzar con `OQ-SEM-2` (naturaleza de condition) antes de acuñar.
- La noción "nº de piezas equipadas" requiere conocer el loadout completo → cercano al patrón de materialización de `OQ-DATA-1`.
- ¿Gap A se resuelve como campo derivado en pipeline o como tag?
- ¿El tokenizado del `stats[]` del portador reusa el parseo de `levelStats`, o el eje piece-count pide el suyo?

**Procedencia — RESUELTA:** era la duda de si el bonus es gap de datos o de pipeline. Se inspeccionó `Mods.json` de upstream: el dato está entero, `generate-data.ts` lo descarta. Es **gap de pipeline** → la solución es propagarlo, no capturarlo a mano.

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

**Qué hay:** 4 nodos materializados, que fijan los **cuatro moldes de base reusables** para el resto de la capa — `punch_through` (override), `projectile_speed` (raw, gate `flight != null` = ausencia ≠ 0), `recoil` (sintético 100, nodo inerte), `accuracy` (cascada par-de-ataque → escalar-de-arma → sin nodo). Detalle vivo de cada molde: [`gap-map.md §Capa 4`](../domains/engine/test/gap-map.md).
**Qué falta:** el resto de los nodos (`zoom`, `ammo_max`/`ammo_efficiency`, `headshot_mult`, `combo_*`/`heavy_*`/`slam_*`) por su molde; `ammo` pausado (`ammo_max` = deuda de fuente, `@wfcd/items` no lo expone; `ammo_efficiency` = no encaja en los moldes, efecto `1/(1−eff)` es C2, espera caso Laetum); y sobre todo el **eje (c)/C2** — falloff, penetración, geometría balística — que decide si estos nodos son display-only o computan.

**`WEAPON_ADD_ACCURACY` — MATERIALIZADO, y con un molde (b) propio.** Las **32 fuentes** del stat
rinden: 15 perks/arcanos que ya usaban el token, y 17 mods que hablaban `WEAPON_SPREAD` — misnomer
DE-legacy que no estaba en `UPGRADES`, así que gritaban en hidratación y morían ahí. El rename fue
puro: sus labels ya decían `% Accuracy` con el signo correcto (Heavy Caliber `−55`), o sea el token
nombraba el mecanismo interno de DE, no un stat distinto. El caso obligó a un
cuarto molde de base, distinto de los tres anteriores: **cascada de dos fuentes del mismo stat**, de
la más fiel a la más pobre. La base sale del par `min_spread`/`max_spread` **por ataque** —
`100 / ((min + max) / 2)`, cosechado de `Module:Weapons/data`— y sólo cae al escalar `accuracy` del
arma cuando el par falta; sin ninguno, no hay nodo (ausencia ≠ 0).

Por qué no alcanzaba el escalar: los dos consumidores son perks de **forma Incarnon**, y la forma
tiene precisión propia que el promedio colapsado del export no puede expresar — Boltor Prime vale 50
en su ataque normal y **10** en Incarnon. Con el escalar, `hunters_mantra` habría mejorado una base
cinco veces equivocada: un número plausible y falso, peor que el silencio anterior. Contrato del dato
en `data/schemas/weapons/weapons-attack-structure.md`; test en `__tests__/weapon-accuracy.test.ts`.

Sigue abierto el **efecto**: cono → probabilidad de impacto es C2 y no tiene modelo. El nodo computa
un valor honesto en C1 y ahí se detiene.

**No bloquea:** captura de datos ni el vocabulario (tokens correctos y aplicados).
**Gate:** el resto se materializa cuando el foco *weapons* retome Capa 4; el eje (c) se resuelve con consumidor C2, no antes.
**Vínculo:** el mapa de gaps y el detalle de moldes viven en `gap-map.md §Capa 4` (SSoT vivo). Spec de falloff: [`damage-falloff.md`](../../references/wiki/mechanics/damage-falloff.md).
**Fuente:** `gap-map.md §Capa 4`; `references/wiki/mechanics/{punch-through,projectile-speed,recoil,damage-falloff}.md`; `docs/semantic/upgrade-tokens.md`.

## OQ-DATA-9 — Borde de entrada: los overrides son vista-consumidor legítima (no doble-merge); convergencia diferida por madurez de datos — **RE-SCOPEADA (2026-07-20 contra código)**
**Dominio:** data / integration / arquitectura de acceso

**Modelo acordado (2026-06-12, vigente):** la carga **no es una capa del flujo A→B→C→D** — es un **plano de memoria** ortogonal, direccionado por referencia. A guarda *punteros* (ids); B y la UI los *dereferencian* contra esa memoria. Regla `datos vs información`: 0 entrega *datos canónicos*; los consumidores derivan *información*.
- **Frontera β (anti-god-object):** 0 normaliza *datos* — un override es *el valor verdadero*, no un cómputo — y NO construye *información* (ni el grafo DNA del engine ni el shape display). Test de pertenencia: si X *corrige* el valor → 0; si X *deriva* del valor → consumidor.
- **Puerto y proyecciones:** `DataSource` es el puerto (ports-and-adapters: `BrowserAdapter` / `NodeAdapter`); sobre él proyectan el engine (→ DNA/grafo) y `DataRegistry` (→ display), compartiendo `browserSource`.

**Corrección de premisa (análisis 2026-07-20, con datos):** NO hay "doble-merge". Los overrides son **disjuntos por consumidor** — el engine aplica los suyos (`mod`/`weapon`/`arcane`/`incarnon`/`enemy-stats.override`, en `ModRepository`/`ItemRepository`/…), `DataRegistry` aplica `ability-stats.override` + `passives`. **Ningún override se aplica dos veces.** Y los `*-stats.override` NO son "dato-crudo que 0 deba normalizar": son **vista-CONSUMIDOR** (forma-engine). Verificado sobre Serration — `mods.json.stats` = objeto con strings pre-formateados (`"+10% Damage"`) + token @wfcd (`WEAPON_DAMAGE_AMOUNT`); `mod-stats.override.stats` = array con números por rango (`[15,30,…]`) + token D-6 (`WEAPON_ADD_DAMAGE`). **Schemas distintos a propósito**: engine-computable vs display-legible.

**Consecuencia — el corte "normalizar overrides en 0" se DESCARTA:** 0 normaliza *dato-crudo*; la vista-engine no lo es. Que cada consumidor aplique su vista **es** ports-and-adapters correcto (no el síntoma de un god-object). La frontera β sigue vigente, solo que el test *"corrige→0 / deriva→consumidor"* clasifica los `*-stats.override` como **deriva** (forma-engine), no corrige.

**Lo que queda vivo (diferido) — y su gate real:** *"un dato, ambos consumen"* **sí** es alcanzable, pero por **SALIDA**: la UI deriva sus stats de la vista-engine vía `lib/format` (el mismo proyector que `oracle view`), en vez de leer `mods.json.stats` como fuente-display paralela → eso vive en **`OQ-DATA-10`** (no acá; los dos JSON de entrada son legítimos). El gate NO es "consumidor" ni "contrato de entrada de @core" — es **madurez de datos**: overrides incompletos, contrapartes del pipeline desactualizadas, y **cero tracking de sincronización override↔pipeline**. Converger dos vistas sobre datos que no se sabe si están sincronizados = construir sobre arena. Diferido hasta que exista ese seguimiento (idea del usuario: campo `version`/patchnotes por schema — ver conversación 2026-07-20).

**Residual menor:** `lib/image-url.ts` mezcla los dos bordes — `hydrateImageFromImageName` (entrada) y `resolveLocalImageUrl` (salida/display → OQ-DATA-10).

**No bloquea:** nada. El engine ya no corre contra repos vacíos (`main.tsx` llama `loadEngineData(browserSource)` antes de `createRoot`); el oracle usa `NodeAdapter`.
**Vínculo:** **OQ-DATA-10** (borde de salida — donde vive la convergencia real por proyección) · `DC-OQ-ENGINE-9` (simetría de entrada respecto a `@core`, resuelta).
**Fuente:** debate 2026-06-12; re-scope 2026-07-17 (puerto+adapters, bootstrap, `fetch` lazy `DC-OQ-DATA-12`, colapso de islas `lib/*-data` — ejecutados); análisis 2026-07-20 (premisa del doble-merge corregida con datos; corte de entrada descartado; gate = madurez de datos).

## OQ-DATA-10 — Borde de salida: convergencia de la ruta catálogo con el proyector del engine — **ABIERTA (2026-06-12; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / presentation (owner) — par espejo de OQ-DATA-9 (data).

**Contexto:** el borde de salida (información → píxeles) tiene **dos rutas que no convergen**, cada una con su vocabulario de label y su formateo:
- **Ruta engine (C→D):** `lib/format/stat-presentation` (token D-6 → `{label, category, unit}`) + `toStatEntries` / `formatStatValue` (tabla `unit→regla`, locale-free). Proyector único, consumido por D1 (`UpgradeView`) y D2 (oráculo).
- **Ruta catálogo:** `lib/item-details` (`getAttackStats` / `getModStats`) + `lib/i18n/stat-labels`, con formateo `Intl es-ES` / `toFixed` inline en `WeaponDetailView`, `WarframeDetailView` y popovers.

**Pregunta:** ¿convergen a un proyector único, o son dos espacios de id legítimamente distintos (`@wfcd/items` humano vs tokens `WEAPON_ADD_*` del engine) que solo comparten el sumidero `StatPanel`?

**No bloquea:** nada — la UI renderiza y ambas rutas funcionan.
**Gated por:** un consumidor que necesite el mismo stat por las dos rutas con el mismo formato. Sin eso, unificar es especulativo.
**Vínculo:** OQ-DATA-9 (borde de entrada, par espejo) · `DC-OQ-ENGINE-10` (Capa E, descartada) · `DC-OQ-ENGINE-8` (sobrecarga de "Proyección", resuelta).
**Fuente:** diagnóstico 2026-06-12. Re-scope 2026-07-17 al cruzar contra código: los stages A–D y D-7 Fase 4 ya están ejecutados — proyector único, `StatEntry` único, registro token-keyed en `lib/format`, formateo locale-free centralizado y leak β muerto. Todo eso dejó de ser pregunta; la OQ describía como abierto lo que ya estaba hecho.

## OQ-DATA-11 — Compatibilidad de mods por entidad: no materializada — **ABIERTA (2026-06-12)**
**Dominio:** data / semantic / compatibilidad (hermana de OQ-DATA-1, que cubre slots)

**Contexto:** al cablear el filtro de compat del picker de mods en `UpgradeView` se destapó que la relación mod↔entidad **no está en la data**:
- **`tags:[]` vacíos.** La única señal es `compat_name` (string: `Rifle`/`Shotgun`/`Sniper`/`Pistol`/`Melee`/`WARFRAME`/nombre-de-arma/`null`). La Restricción 3 ("filtros dependen de `tags`") no puede aplicarse tal como está — el fix correcto es enriquecer los mods con compat en `tags`.
- **Matriz muchos-a-muchos ausente:** en el juego los mods `Rifle` caben en rifle+sniper+bow; `compat_name` da una sola clase y el cruce (qué clases acepta cada `family`) no vive en ningún lado. Conocimiento de dominio sin materializar.
- **Duplicados en `mods.json`** (Serration ×3, Adaptation ×2) — fuente sucia, bug de pipeline.
- **`useItemsFilters` (`domains/equipment`) no es reutilizable desde `domains/arsenal`** (Restricción 1) → mover a `@shared` si se quiere una lógica única.

**Estado del filtro (stopgap PROVISIONAL, marcado en `UpgradeView.tsx`):** compara campo-a-campo `mod.compat_name ↔ entity.family` (arma) / `entity.domain` (warframe) + dedup. Data-driven (no matriz hardcodeada), pero **incompleto** — oculta augments/universales y el cruce de tipos. Roto donde `family` no coincide literal con la clase de mod: `Afuris.family="dual pistols"` vs `compat_name="Pistol"` → picker vacío; igual `throwing`(Kunai), `sniper`/`bow`→`Rifle`. Melee/rifle/shotgun/pistol andan solo porque `family == compat_name`. Secondary queda **gated por esta OQ** (decisión del usuario: sin stopgap). **Arcanos = caso limpio** (resuelto v1): su `compat_name` ya es a granularidad de **canal** (`warframe`/`primary`/`secondary`/`melee`), match directo sin cruce M2M; solo los sub-tipos (`zaw`→melee, `kitgun`→primary/secondary, `bow`/`shotgun`→primary, ~19 arcanos) quedan ocultos. Confirma que el fix correcto es **por-fuente**.

**Pregunta:** ¿dónde/cómo se materializa la compat mod↔entidad? (espejo de OQ-DATA-1) — (a) enriquecer cada mod con `tags` en pipeline (Restricción 3 limpia); (b) matriz `family → clases aceptadas` como dato; (c) híbrido (`compat_name` base + matriz de cruce).
**Vínculo:** **OQ-DATA-1** (slots = otra cara de "qué equipa una entidad"), **Restricción 3** (`Project/CLAUDE.md`), capa "0" (compat = dato canónico que 0 normaliza). Dedup de `mods.json` toca el pipeline (OQ-DATA-9).
**No bloquea:** el loop equip→stat funciona; degrada la usabilidad del picker para tipos no-rifle.
**Fuente:** implementación del filtro de compat 2026-06-12 (`UpgradeView.tsx`).

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

La campaña de documentación UI/UX ya se **completó** (2026-06-16; `docs/domains/ui-ux/` tiene status/decisions/workflow activos) — pero el **footer y el modelo de interacción siguen sin consolidar**, que es lo que esta OQ cubre. Principio: derivar de **D2 (oráculo/CLI)** + dominio, **no** anclar contratos al stub actual.

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

**Sub-punto con peso real — NO-i18n (de momento):** se **descarta** implementar i18n ahora. `@wfcd/items` **sí provee** i18n, pero **no es compatible** con el sistema de **overrides manuales** de piso 0: por su naturaleza de mantenimiento manual, mantener traducciones sincronizadas es inviable hoy. Deseado a futuro, no prioridad. Esto **cruza OQ-DATA-9/0** (qué es dato canónico) y el estrato `lib/format` (`DC-OQ-ENGINE-10-A` / OQ-DATA-10, labels/locale).

**Pregunta:** ¿Contrato de paneles de configuración (qué persiste, dónde) y condición para reabrir i18n (¿requiere resolver la compat overrides↔traducciones primero?)?

**No bloquea:** nada (theme-selector funciona).
**Vínculo:** OQ-DATA-9 (0 / dato canónico), OQ-DATA-10 + `DC-OQ-ENGINE-10-A` (`lib/format`/locale), OQ-UI-2 (persistencia de preferencias).
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

## OQ-ENGINE-11 — Exaltadas: derivación de intención estructural en A1 — **ABIERTO (2026-06-16)**
**Dominio:** engine / Capa A (intención) — downstream del eje *estructura* de `U-3` ([`../domains/ui-ux/decisions.md`](../domains/ui-ux/decisions.md))

**Contexto:** el barrido de UI (campaña ui-ux) trazó `SLOT_DEFINITIONS` (chrome hardcodeado) hasta un hueco de la Capa A: las **exaltadas** (Reguladoras de Mesa, Exalted Blade, Venari, etc.) **no están modeladas, no hay datos**. Vestigio del `loadout` de V1. `U-3` aisló esto como la materialización *dinámica* del eje *estructura/contexto de aplicación* (lo que `SLOT_DEFINITIONS` hoy hardcodea estático).

**Hipótesis establecida (puntos clave del debate — NO re-litigar):**
1. Exaltada = **intención estructural derivada** → vive en **A1** (no A2 = condicionales de combate; no B).
2. La derivación corre en la **acción de equipar** del ensemble (dispatch): `equipWarframe` lee "0" (el hecho "otorga exaltada" del dato de habilidad) → escribe **ambos** punteros (warframe + exaltada derivada) en A1 al mutar. **Sin círculo B→A1** (el puntero nace en A1, no se descubre en B).
3. A1 = punteros puros (la lógica vive en la acción). Nodo derivado: flag `origen:derivado` + **acciones recortadas** (p. ej. solo `Upgrade`, sin `Swap`) = la entry `secondary_weapon` clonada y recortada.
4. B = hidratación agnóstica pura (deref de A1, sin inyección estructural).
5. Exaltada = arma de **canal real** (p. ej. `secondary`) → el ruteo agnóstico de buffs de C la alcanza **gratis** (un arcano de secundaria buffea también Reguladoras). Confirma que va en A1, no como conditional. **El "gratis" ya está construido:** `resolve/hydration/channel-routing.ts` resuelve canal → **`EntityId[]`** filtrando entidades por su `channel` (que `StaticHydrator` estampa al construirlas). Una exaltada que nazca como entidad con `channel: 'secondary'` la alcanza sin tocar el ruteo. La firma-lista es deliberada por esto: con firma escalar la exaltada le pisaría el slot al arma equipada. Verdad del juego que lo exige: `references/wiki/archon-shards/archon-shard.md` — *"Affects Exalted Weapons of the appropriate class"*.
6. Re-derivación **continua**: cambiar warframe re-corre la acción; la **política de mods huérfanos** vive ahí.

**Preguntas abiertas (requieren datos):** schema del dato de exaltada (¿`weapons` + marcador granted-by / canal / fixed? *lean:* nuevo JSON, no muy distinto de `weapons`) · shape de la declaración en el modelo de habilidad · política de mods huérfanos al re-derivar · **escalado cruzado** (exaltada ← power strength) = ability-like, **RED**, sub-concern separado.

**Método (data-first):** 1 exaltada real → nuevo JSON → inyectar vía **oracle (CLI/D2)** → testear `A1→B→C` → recién generalizar. No resolver sobre supuestos.

**No bloquea:** nada (diferido). **Estado:** no se modelará de inmediato; el usuario arranca el **prototipo** apenas cierre tareas en pausa.
**Vínculo:** **`U-3`** (su upstream estructural), **OQ-UI-2** (que ya lista exaltadas como caso de slot-modeling junto a Jade Aura×2 / Sevagoth Shadow / companions modulares — UI-2 = layout de slots; ésta = mecanismo de derivación en A1), **OQ-ENGINE-7** (materialización de nodos de atributo).
**Fuente:** debate de la campaña ui-ux (2026-06-15) + promoción a ID real en el cruce de consolidación (2026-06-16).

---

## OQ-ENGINE-12 — Crit condicional (Puncture/Cold): gancho RESUELTO, fidelidad pendiente por ausencia de dato — **RE-SCOPEADA (2026-07-20)**
**Dominio:** engine / C2 (micro-arquitectura de daño y status)

**Resuelto — el gancho (la pregunta original "¿dónde/cuándo se construye el punto de enganche?"):** construido 2026-07-20. Puncture (efecto `weakened`) y Cold (efecto `freeze`) buffean el crit del **atacante** según sus stacks en el target, por un canal separado del de mitigación:
- Contrato `CritModifier { critChanceAdd?, critMultAdd? }` + `EffectBehavior.critModifier?` (`effect-behavior.ts`) — stage del **hit**, no de la mitigación (canal aparte de `resolutionModifier` a propósito).
- `EnemyState.getCritBonuses(t)` suma los aportes (espejo de `getEffectiveArmor`); `CombatSimulator.simulateAttack` lo lee **LIVE** y lo suma a critChance/critMult antes de resolver el crit (ambos modos, atómico y bulk).
- Behaviors `weakened`/`freeze` (molde de `corrosion` + `critModifier`); leyes `WEAKENED_CRIT_LAW {first:5,perAdd:5,cap:25}` (chance) / `COLD_CRIT_LAW {0.1,0.05,cap:0.5}` (mult) vía `stackDebuffValue`. Test: `crit-stack-buff.test.ts`.

**Sigue vivo — AUSENCIAS de fidelidad (no simplificaciones: es dato/mecánica que hoy NO existe):**
- **Cold cap 4 stacks en bosses/Overguard** — falta el flag `boss`/`overguard` en el DNA del enemigo; v1 usa el cap normal (9). El behavior lo consumirá cuando el DNA lo tenga.
- **Cold 10º stack** (congelación 3 s, crit recibido +1.0×, 3 stacks residuales) — mecánica compleja sin modelar.
- **Puncture no aplica a AoE / habilidades de warframe** — gate ausente pero irrelevante hoy (el modelo de combate son hits de arma, no hay AoE); se gatea cuando exista AoE.

**No es de esta OQ (SIMPLIFICACIÓN, no ausencia):** el decay de los stacks es **fluido** (`count` fraccional, compartido con Corrosion/Viral), no los N-timers discretos reales — su fidelidad es `OQ-ENGINE-16` (gated por medición).

**Por qué NO cierra a DC:** el gancho cerró, pero las ausencias son deuda viva real — la aproximación es un **suelo aceptable, no completo**. Se queda como OQ hasta que el dato (flag boss) y la mecánica (10º stack) existan.
**No bloquea:** el núcleo; Puncture/Cold ya entran a v1 con fidelidad de suelo.
**Vínculo:** `damage-status-model.md` (modelo + primitivo), `OQ-ENGINE-16` (decay N-timers), `references/wiki/mechanics/status-effects.md §Weakened/§Cold`.
**Fuente:** debate de modelado C2 (2026-07-02); implementación del gancho + re-scope 2026-07-20.

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

**Manifestación en código:** `formulas/enemy/ehp.ts` (`EHP = Health×(Armor+300)/300`, huérfana) computa exactamente la DR "era vieja"/Tenno de esta tabla, mal ubicada bajo `enemy/`. El CLI oráculo (lente `enemy`) usa la DR adoptada vía la primitiva correcta `formulas/enemy/effective-health.ts`. `ehp.ts` queda disponible (sin consumidor) para cuando exista EHP de jugador, con docstring corregido para no confundir.

**Vínculo:** `references/wiki/mechanics/{enemy-level-scaling.md §Armor, enemy-resistances.md §DR, armor.md, damage-reduction.md}`, `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`, `Project/src/core/engine/formulas/enemy/{armor-mitigation.ts (movido de EnemyRepository.ts en P1, 2026-07-09), effective-health.ts, ehp.ts}`.
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

**Contexto.** La data de double-dip (`references/ingame-tests/double-dip.md`) prueba que el tick de un DoT
compone **dos mitades**: `tick = snapshot(daño del hit resuelto, con buffs source YA horneados al
aplicar) × live(re-aplicación del contexto source en el tick)`. La huella dura es el double-dip:
Roar (×2.128, pool②) aparece **al cuadrado** en el DoT (`DoT÷base = 4.53 ≈ 2.128²`) pero ×1 en el
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

**Alcance (de-conflación).** El double-dip **steady-state** `(1+Σpool②)²` (toda la data medida) NO es parte
de este OQ: es **(A)**, decidido (`DC-OQ-ENGINE-13`) y **build-debt** gated por poblar el pool②
(`../domains/engine/status.md §Deudas`). ESTE OQ es solo el **transitorio** — qué mitad responde al drop del buff.

**Test que lo cierra:** dropear un buff (Roar) a mitad de un DoT largo y medir ticks post-drop vs.
pre-drop. Un solo experimento discrimina (i)/(ii).

**Vínculo:** `references/ingame-tests/double-dip.md` (data steady-state), `../domains/engine/design/damage-status-model.md §Modelo unificado de proc`, `../domains/engine/design/damage-status-model.md §Evidencia`, frontera
"coupling Viral-en-vivo/snapshot" (5 fronteras del timeline, `decision-frontier.md §4`), `OQ-ENGINE-16`
(mismo eje de fidelidad temporal: N-declarado vs. timers reales), pool② gating.
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

---

## OQ-DATA-15 — Campo `faction` contaminado del enemigo: quiebra scaling + FACTION_BONUS — **ABIERTA — síntoma resuelto, causa raíz upstream sin acotar**
**Dominio:** data / "0" (DataRegistry) → engine (scaling + matriz③)

**Contexto:** el campo `faction` de `enemies.json` **no es la taxonomía real de facciones**. De 638 entries
con `faction`, muchas traen valores que no son facción: categorías de arma (`Shotgun`, `Rifle`, `Melee`),
rol de IA/allegiance (`Neutral`, `Predator`, `Prey`), u otros (`Orbiter`, `Warframe`). La lista real (wiki
`Factions`) son 14 y no incluye ninguno de esos. Es el mismo patrón "tipo de carne/escudo" de Damage 2.0:
un campo de la fuente (`@wfcd/items`) que el engine trata como input vivo pero que mezcla ejes.

**Dos consumidores lo keyean — ambos degradados en silencio:**
- **Scaling** (`enemy-scaling.ts` vía `EnemyRepository.scale`): `HEALTH_COEF[faction]` / `SHIELDS_COEF[faction]`
  → facción no reconocida cae al **default** (health: grupo Unaffiliated tras el fix F5; shields: Grineer,
  elección de código). El enemigo escala con una curva que no es la de su facción real.
- **FACTION_BONUS** (`targetFactionMult(token, dna.faction)`, matriz③ de `resolveHit`): `FACTION_BONUS[token]?.[faction] ?? 0`
  → facción-basura ⇒ **bonus 0** (no se aplica el bonus anti-facción). *(`resolveHit` está fuera del pipeline
  de producción hoy, pero el defecto es real.)*

**Resolución (2026-07-22) — opción (b), y salió barata.** La cosecha de `Module:Enemies/data/<facción>`
(fase-2 de `OQ-DATA-16`) la resolvió sin pipeline pesado: **el submódulo de origen ES la facción** (la tabla
Lua no tiene campo de facción), y sus 12 valores son exactamente el dominio de `HEALTH_COEF`. El módulo Lua
*es* el grupo de scaling — no hizo falta un `scaling_group` separado (opción (d)): el eje contaminado no
tenía consumidor, sólo estorbaba.

El generador resuelve `faction` en **cascada**: `faction` del export (lo trae justo para los 33 con `type`
contaminado) → facción del submódulo wiki → `type` si es facción válida → `Unaffiliated` explícito.
Resultado: 638/638 con facción canónica, ningún valor que no sea facción. Contrato y tabla de procedencia en
[`../data/schemas/enemy/schema.md`](../data/schemas/enemy/schema.md).

**Causa raíz: el parser de upstream, no la normalización propia.** `warframe-items/build/parser.ts`
asigna `type` matcheando **substrings del `uniqueName`** contra su tabla de tipos de arma
(`/…/Avatars/RifleLancerAvatar` contiene `"Rifle"` → `type = 'Rifle'`), y sólo si no matcheó nada hace
`item.type = item.faction; item.faction = undefined`. De ahí el patrón exacto: 605 enemigos con `type`
= facción real (movida por la segunda regla) y 33 con `type` = arma **que conservan `faction`**, porque
la primera los capturó antes. La cascada del generador resuelve el síntoma **en un consumidor**; la
regla sigue viva aguas arriba.

**Lo que queda abierto — el alcance.** Si la causa es un matcher por substring de `uniqueName`,
puede estar mal-tipando **cualquier** ítem cuyo path contenga `Rifle`/`Shotgun`/`Melee`, no sólo
enemigos. Nadie midió eso. Censo pendiente: ítems no-`Enemy` cuyo `type` no cuadra con su categoría.

**Residual (no es contaminación, es ausencia de dato):**
- **Subfacciones:** `FACTION_BONUS` distingue Kuva Grineer, Corpus Amalgam, Infested Deimos, Zariman…;
  `enemies.json` sólo trae la base. Esos bonus siguen latentes (gap ya anotado en `damage-multipliers.ts`).
- **Facciones modernas sin enemigos:** el export no contiene **ninguna** unidad de Narmer/Anarchs/Murmur/
  Techrot/Scaldra (115 en el wiki, 0 match). Hay ley (coefs + bonus) sin dato contra el cual ejercerla;
  cerrarlo implica cosechar los stats base del wiki y emitir entradas wiki-only — decisión abierta.

### Addendum — la wiki no trata "la facción" como un campo, sino como tres

`Module:Enemies/infobox` (capturado en `references/wiki/sources/enemies-infobox.md`) lee **tres campos
independientes** del enemigo, cada uno con su propio fallback a la etiqueta nominal:

| Campo | Determina | Usos en 912 enemigos |
|---|---|---|
| `Faction` | la etiqueta mostrada, la categoría de la página | — |
| `FactionScaling` | **qué coeficientes de scaling** aplican | **3** |
| `FactionDamageOverride` | **qué fila de la matriz de resistencias** aplica | **152** |

Eso valida el diagnóstico de esta OQ desde afuera —la facción **es** un eje partido— y a la vez acota
dos huecos de la resolución adoptada:

**1. "El submódulo de origen ES la facción" es cierto salvo para 3 enemigos, que lo declaran al revés.**
`Jordas Golem` vive en la partición `infestation` y declara `FactionScaling = "Default"`; `H-09 Apex` y
`H-09 Efervon Tank` viven en `techrot` y declaran `FactionScaling = "Corpus"`. Para esos tres, la
cascada del generador asigna el grupo de scaling **equivocado** — son 3 de 912 y ninguno está en el
data-set hoy, pero la regla que los produce sí está viva.

**2. El eje de resistencias no está cubierto por la cascada.** `FactionDamageOverride` decide la fila de
la matriz③, y **125 de sus 152 usos son la cadena vacía**: no redirigen a otra facción, **anulan** la
matriz para ese enemigo. Un modelo que derive la fila de resistencias desde `faction` va a aplicar
modificadores a enemigos que no los reciben. Los 27 restantes: 12 `Zariman` —una facción de
resistencias que **no es** una de las 12 particiones de enemigos—, 5 `Grineer`, 2 `The Murmur`, 1
`Corpus`, y **6 con paths de asset del juego** en el campo, que son datos rotos de la wiki.

**Consecuencia para el residual "subfacciones":** `Zariman` aparecía como subfacción sin dato; ahora se
sabe que es un valor legítimo de `FactionDamageOverride` con 12 usos, no una etiqueta huérfana.

**No bloquea:** el engine corre. **Ya no degrada** el scaling por facción-basura.
**Vínculo:** **OQ-ENGINE-21** (fidelidad de la LEY de scaling, hermana — ésta es el INPUT, aquélla la ley),
**OQ-DATA-9** (borde de entrada "0" / normalización de datos), **OQ-ENGINE-15** (DR provisional, scaling
vecino). Realización: `enemy-scaling.ts` (fallback + comentarios), `contracts/damage-multipliers.ts`.
**Fuente:** censo de `enemies.json` (638 entries) + wiki `Factions`. Auditoría: F5-P2 (2026-07-19).

---

## OQ-DATA-16 — Fuente de datos propia (estructura a medida) vs. el fork `@wfcd/items` — **ABIERTA — el raw es propio y Project lo consume; falta que las imágenes también lo sean**

**Dominio:** data / pipeline / fuente

**Contexto:** hoy el pipeline consume `@wfcd/items` como un **fork local** (`file:../warframe-items`, submódulo). El fork impone su estructura; `generate-data.ts` la **re-mapea** entera a los contratos del engine (`normalization/*`). Fricciones acumuladas: mantener el submódulo sincronizado, re-mapear todo en cada campo nuevo, y una estructura upstream que **no es la que el proyecto necesita** (de ahí el volumen de normalización). Nota de sesión 2026-07-20 (semilla de esta OQ): *"empezando a pensar en hacer mi propio warframe-items con la estructura que necesito, en vez del fork — qué paja"*.

**Pregunta (a INVESTIGAR, no a resolver):**
- ¿Qué aporta hoy el fork que habría que **replicar** para no perderlo? Al menos: la data cruda del juego, `patchlogs` (→ `versionTag`, base del audit `OQ-DATA-9`), categorías/kinds, `compatName`. Inventario real en [`../domains/source/warframe-items.md`](../domains/source/warframe-items.md).
- ¿De dónde saldría la data sin el fork? (misma fuente que `@wfcd`: export/worldstate de Warframe) — ¿costo de mantener ese ingest propio vs. el re-mapeo actual?
- ¿La "estructura a medida" elimina normalización, o solo **mueve** el trabajo aguas arriba? (mismo patrón que el debate de `OQ-DATA-9`: cuidado con mover-no-eliminar).

**Investigación (2026-07-22) — hallazgos (medidos contra git, no inspección visual):**
1. **El fork es liviano.** Su delta genuino sobre el merge-base de `WFCD/warframe-items` es ~117 líneas,
   casi todo aditivo sobre el patrón de plugin propio de upstream (`build/wikia/scrapers/*`): un
   `AbilityScraper` (cosecha `Module:Ability/data`) + `transformAbility` + ~19 líneas de hook en
   `parser.mjs`/`scraper.mjs`. No es un fork pesado de sincronizar; la capa-1 (ingest/scraper de upstream)
   está intacta. Detalle en `../domains/source/warframe-items.md` §2.
2. **La maquinaria Lua es genérica y reusable.** `getLuaData(url)` baja cualquier `Module:X/data?action=edit`;
   `convertLuaDataToJson` lo pasa a JSON. Cosechar módulos que upstream ignora (enemigos + otros) = un scraper
   con la receta de `AbilityScraper`, sin reconstruir capa-1. El módulo Lua de enemigos hoy no lo toca nadie:
   `generate-enemies.mjs` lee `Enemy.json` del export del juego, no de la wiki.
3. **Drift corregido:** `../domains/source/warframe-items.md` §Lo que la promoción a pristino nos costó sobreatribuía al fork (`weaponClass`, `upgradeTypes[]`,
   `modClass`, taxonomía = son upstream). Corregido en la misma sesión.

**Dirección (investigada, NO decidida — sigue en debate):** no es "fuente propia vs fork" como binario, sino
un **repo-superset de cosecha**: mismo ingest de upstream (capa-1 intacta, dependencia dura), exprimiendo N
módulos Lua de la wiki que `@wfcd` deja sobre la mesa (opt-in — cada módulo es superficie de mantenimiento
propia, mini-treadmill dimensionado a conciencia), emitiendo solo lo que OmniFrame necesita.
**Dos motivaciones a NO amalgamar:** (a) cosecha-superset = lo que carga la decisión del repo; (b) reducir peso
del output (`mods.json` 2.9MB, `weapons.json` 1.6MB) se resuelve HOY project-side en los builders de
`generate-data`, NO justifica repo nuevo por sí solo. La frontera "raw sellado vs. normalizado" queda diferida
(el usuario no la ve necesaria hoy) — cae bajo `OQ-DATA-9`.

**Forma acordada — tres hermanos** (organización interna de `omniframe-items` diferida a propósito):
```
OmniFrame/  Project/  ←  omniframe-items/  ←  warframe-items/ (upstream PRISTINO)
flujo:   warframe-items (upstream puro) ─► omniframe-items (cosecha) ─► Project (consume)
```
- `warframe-items` **no se sube** al repo → se trae en build (`git clone --depth=1`, **pin diferido**: HEAD por
  ahora, endurecer a tag/SHA cuando muerda o cuando aparezca el futuro-biblioteca del punto 3). Precedente de
  fetch shallow: el propio fork ya usa `--depth=1` para evitar `data/img` (~913 MB).

**Superficies que Project apoya en `warframe-items` hoy:** ninguna en el dato — `generate-data.ts` importa
`omniframe-items`, que lee su propio `data/json`. Quedan dos apoyos indirectos: `get-img.mjs` lee
`warframe-items/data/img` (605 MB, asimetría aceptada mientras el raw propio use el `parser` de upstream y
por tanto el mismo `imageName`), y el passthrough del fósil `Enemy.json`. El `package.json` de Project aún
declara `@wfcd/items`, pero sólo lo usa un script archivado (ver residual de limpieza).

---

### Ejecución 2026-07-22 — fase-1 HECHA + el swap a pristino resultó un major bump

**Fase-1 ejecutada y verificada** (golden-master `git diff public/data` vacío en cada paso):
- `omniframe-items/` creado como tercer hermano, consumido por Project (`generate-data.ts` importa
  `omniframe-items`, no `@wfcd/items`). Resolución de symlink: omniframe-items tiene su propio
  `node_modules/@wfcd/items`.
- `AbilityScraper` + `transformAbility` + `getLuaData`/`convertLuaDataToJson` propios + `JSON.lua`
  **relocalizados** a `omniframe-items/build/wikia/`, con un mini-build (`omniframe-items build` → cache
  `data/abilities.json`, gitignored) y merge por `uniqueName` en `index.mjs`. Verificado: 327 habilidades
  cosechadas, merge OK. **El pipeline de datos corre en HOST, no en Docker** (el Dockerfile stubbea
  `@wfcd/items`); `lua` en `/usr/bin`, wiki/github/game-export alcanzables.
- **Hallazgo:** el enriquecimiento de habilidades del fork **no llega a `public/data`** (generate-data toma
  sólo `ability.uniqueName`; las ability-stats reales salen de `references/game-ui/*.md`). Se relocó igual
  (decisión del usuario) como plantilla viva del patrón scraper para fase-2. Invariante: no filtra a `public/data`.

**El paso 3 (swap a pristino) NO es un refresh limpio — es un major bump breaking.** El fork salió de un
upstream viejo; el `master` actual (`WFCD/warframe-items`) migró a TS y **re-scopeó el enriquecimiento wiki**.
Diagnóstico (grep en `build/` de pristino): los campos faltan porque **pristino dejó de cosecharlos del wiki**
(0 referencias en su código), NO porque su `data/json` sea "lean". Todos venían de wiki-scrapers del fork
(`parser.mjs` + `transformMod`/`transformWarframe`/WeaponScraper) → **re-cosechables vía `omniframe-items`**,
mismo patrón que el AbilityScraper. Inventario ratificado (barrido sobre 17k+ ítems):
- **Perdidos que Project consume:** `weaponClass` (todas las armas → **Restricción 3**), `upgradeTypes` +
  `maxRank` + `incompatibilityTags` (mods), `energy`/`initialEnergy`/`maxRank`/`playstyle`/`progenitor`/
  `subsumed`/`tactical`/`themes`/`wikiaThumbnail` (warframes), ídem Archwing. Railjack pierde mucho
  (`attacks`/`tags`/`weaponClass`) — verificar si Project consume armamento Railjack.
- **Perdidos NO consumidos (ruido):** `modClass`, `isWeaponAugment`, `isFlawed`, `incompatible`,
  `wikiaCategory`, `*Rank30`, `itemCount`, `parents`, `releaseDate`, `wikiAvailable`.
- **NUEVOS relevantes:** arcanos GANARON `wikiaThumbnail`/`wikiaUrl`/`introduced` (consumidos); Pets ganó
  `isPrime`; nuevos no-consumidos: `exilusPolarity` (armas/warframes), `excludeFromCodex`, `exaltedSlot`.
- **Caveat:** `energy`/`initialEnergy` de warframes — verificar si eran wiki o core (si core, es otro fix).

**Scope de la migración a pristino-master (MAJOR_RED, gated a autorización explícita):** relocar los
wiki-scrapers que Project consume a `omniframe-items` (patrón AbilityScraper ×4: Weapon, Mod, Warframe,
Arcane) + resolver el nuevo esquema de `image_name` (internal-name vs slug-hash, afecta assets/`get-img`) +
auditar campos core-vs-wiki + adaptar `normalization/*`. **Esto valida la tesis de la OQ:** upstream adelgazó,
`omniframe-items` re-cosecha — es el caso de uso que motivó el repo. Estado sano: todo revertido al fork,
`public/data` intacto; `warframe-items.pristine/` clonado local (~605 MB, untracked) para el trabajo.

**Snapshot retrospectivo del fork (qué relocar, cómo).** Matcheo wiki↔game = por **`uniqueName`**
(determinístico, no fuzzy; armas suman check de `slot`). Dispatch por categoría (`Upgrades→mods`,
`Archwing→archwings`, `Sentinels→companions`).

| Scraper | Módulo wiki | Campos LOST que Project consume |
|---|---|---|
| Weapon | `Module:Weapons/data` | `weaponClass` (el hook además *pisa* attacks/tags/polarities con wiki) |
| Mod | `Module:Mods/data` | `upgradeTypes`, `maxRank`, `incompatibilityTags` |
| Warframe | `Module:Warframes/data` (+Blueprints) | `energy`, `initialEnergy`, `maxRank`, `playstyle`, `progenitor`, `subsumed`, `themes`, `tactical` |
| Arcane | `Module:Arcane/data` | `upgradeTypes` (pristino ya agregó wikia*/introduced para arcanos) |

Auxiliar: **VersionScraper** (`introduced`/`releaseDate`).

**Dos decisiones que el snapshot destapa (resolver con el diff aislado real):**
1. **Quirúrgico vs replicar** — los hooks del fork *sobrescriben* campos que pristino ya trae de su core
   (weapon `attacks`/`tags`/`polarities`). ¿Recuperar solo lo perdido (quirúrgico) o dejar que el wiki pise
   todo (replicar-fork)?
2. **💣 Fidelidad de stats base de warframe** — el hook toma `health`/`shield`/`armor`/`energy` del **WIKI**
   (parser.mjs:984-988), pisando el game-export. Pristino usa **core**. Migrar sin re-cosechar = las stats base
   de warframe cambian de fuente (valores pueden diferir). Decisión: ¿wiki o core como verdad?

**Bonus de frescura (a auditar en la promoción).** La cosecha vía omniframe-items es del wiki **fresco**
(julio), más completa que el fork **stale** (abril). Detectado al probar: el fork trae `incompatibilityTags ==
null` en **1660/1801 mods**; la cosecha fresca los llena (152 mods con tags reales). Hoy Project emite `[]`
para esos mods vía `incompatibility_tags: raw.incompatibilityTags ?? []`
([runtime-data-artifacts.ts:510](../../Project/scripts/pipeline/runtime-data-artifacts.ts)) — **no es un
override, es un default defensivo que emite vacío donde el wiki tiene verdad**. Al promover a pristino
(`fields:true`) esos huecos se llenan solos. **A auditar en la promoción:** qué defaults `?? []`/normalizaciones
compensaban la incompletitud del fork y quedan redundantes al entrar el dato fresco (aplica a
`incompatibilityTags` y potencialmente a otros campos re-cosechados). No es override que remover — es normalización
a revisar.

**Estado del árbitro (regresiones a cerrar antes de promover; el refresh de datos lo audita el
source-change-report, no se enumera acá):**
- **mods / warframes / arcanes / companions: sin regresión.** `ModScraper` ampliado al set completo
  (`incompatible`, `modClass`, isExilus/isFlawed/isWeaponAugment). 💣 **Fidelidad de stats de warframe
  DEFUSADA:** wiki-vs-core difieren en solo 2 warframes → **decisión: core de pristino**.
- **weapons — 2 regresiones, ambas ACEPTADAS:**
  1. `tags` — 1 pérdida total real: **Dark Split-Sword** (melé modular sword+dagger). Aceptado.
  2. weapon **wikia-meta** (`wikia_thumbnail`/`wikia_url`) — **campos muertos** (solo en types, cero uso en
     UI). Aceptado, no se recuperan.
- **`image_name` (todos los ítems): NO-ISSUE.** Verificado: el `imageName` de pristino matchea su
  `data/img` al **100%** en todas las categorías (esquema auto-consistente). Tras el swap +
  `get-img --clean`, las imágenes resuelven solas. Costo = diff cosmético de rutas + re-copia de assets.

**→ PROMOCIÓN EJECUTADA (2026-07-22).** Swap de nombres hecho (`warframe-items` = upstream pristino,
`warframe-items.backup` = fork viejo, gitignored). `omniframe-items` con `fields:true`. `public/data`
regenerado (refresh abril→julio + campos re-cosechados), `source-change-report` re-baselineado, `enemies.json`
sin cambios (pristino trae `Enemy.json`). Árbitro final verde salvo las regresiones aceptadas. Commit del
refresh hecho.

**Fase-2 (enemigos) — cerrada.** `EnemyScraper` cosecha los 12 submódulos de `Module:Enemies/data` (1000
enemigos: facción + `BaseLevel`/`EximusHealth`/`Multis`); `enrich.mjs` los mergea **por nombre** (no por
`uniqueName`: el wiki indexa el *Agent*, el export el *Avatar* — 2.4% vs 86.5% de match) sobre los ítems
`category: 'Enemy'`; `generate-enemies.mjs` consume `omniframe-items`. Contrato y gaps:
[`../data/schemas/enemy/schema.md`](../data/schemas/enemy/schema.md).

---

### Fase-3 — `omniframe-items` genera su propio raw (PLANIFICADA, no arrancada)

**Tesis: enriquecer no alcanza, el gap se traslada.** `omniframe-items` hoy **no genera** nada propio —
enriquece en memoria el output de upstream (`enrichItems` muta objetos dentro del constructor; no hay
artefacto en disco que mirar). Sirve para lo **ausente**, pero no para lo **mal derivado**: cuando el
defecto nace en la construcción del raw, sólo se puede parchear el síntoma aguas abajo, en cada
consumidor. Caso testigo: el `type` contaminado del enemigo (`OQ-DATA-15`) — la cascada de `faction`
vive en un consumidor y cualquier otro que lea enemigos hereda el defecto de nuevo.

**Forma:**
```
warframe-items ──► omniframe-items ──► generate-data.ts ──► dataset final
  capa raw           build propio        normalización
  (caja negra)       (scrapers propios,  (sin cambio de rol,
                      categorías          toma el source de
                      elegidas, gaps      omniframe-items)
                      de derivación
                      corregidos)
```

Cada capa mantiene su objetivo: `warframe-items` aporta ingest/tipado/estructura y **no se modifica**;
`omniframe-items` **recompone** con ese tipado (no inventa uno nuevo) y emite el raw a disco;
`generate-data.ts` normaliza como siempre. Materializar el raw hace **diffeable cada frontera**:
upstream → omniframe → normalizado, y un breakage se bisecta en un paso en vez de ejecutar código.

**Build propio, NO wrapper sobre el `data/json` de upstream.** El wrapper es lo que ya tenemos y es lo
que **no** protegió: el incidente que costó la migración fue un cambio de **contenido** (upstream dejó de
cosechar campos del wiki), no de forma — un wrapper lo recibe idéntico, un build propio con scrapers
propios lo absorbe. El riesgo de mantenimiento existe en ambas variantes (upstream puede cambiar
estructura, código o tipado en cualquier momento), así que no es el discriminador; el discriminador es
el **control de acción**: elegir qué se genera (no emitir `Gear`/`Fish`/`Node`), corregir derivaciones,
aligerar el raw. Eso el wrapper no lo da por construcción.

**Sin pin de versión, a propósito.** Un pin sin política de bump es deuda que driftea en silencio — el
mismo patrón por el que se retiró el campo `Version` de los docs. El criterio sano es **por versión del
juego**, y exige maquinaria (¿qué build del juego? ¿qué commit de upstream le corresponde?) que hoy
sería over-engineering. El **sello de versión nativo** que habilita el ingest propio (`OQ-DATA-9`) es
justamente su insumo: **el pin es consecuencia de esta fase, no requisito.** Mientras tanto el árbitro
es el golden-master (`git diff public/data` vacío), que ya existe: detección, no prevención.

**Secuencia y árbitro por fase:**

| # | Paso | Árbitro |
|---|---|---|
| 0 | **Fusión del pipeline.** `generate-enemies.mjs` → `buildEnemiesArtifacts` en `runtime-data-artifacts.ts` (tipado contra `RawEnemyEntry`); `enemies.json` se emite desde `generate-data`; los enemigos entran a `generatedEntries` del `source-change-audit`. Independiente del source: **se puede hacer ya** | `git diff public/data/enemies.json` vacío; un solo `new Items()` |
| 1 | **Build propio passthrough.** Orquestador en `omniframe-items` que emite `data/json/*` reutilizando la capa-1 de upstream; Project consume ese raw | `git diff public/data` vacío. Si no da vacío, no se avanza |
| 2 | **Control de acción.** Elegir categorías **y locales**: el fetch baja los **15** (`en de fr it ko es zh ja pl pt ru th tc tr uk`, 225 chunks) y Project instancia `new Items()` sin opciones — default `i18n: false`, así que **14 no los consume nadie**. Dejar de emitir lo que nadie usa | diff vacío en lo consumido + peso del output |
| 3 | **Las correcciones suben de capa.** Censo del matcher por substring (`OQ-DATA-15`) → corregir `type` en el raw → **borrar la cascada de `faction`** del builder | diff **no** vacío: esperado y explicado ítem por ítem |

**Por qué la fase 0 va primero:** hoy hay **dos** consumidores independientes del source (`generate-data.ts`
y `generate-enemies.mjs`, cada uno con su `new Items()`), y `enemies.json` **está fuera del ciclo de
regeneración** — no lo dispara ningún script de `package.json`, así que queda stale en silencio cuando el
resto de `public/data` se actualiza. Fusionar deja **un** punto de contacto y hace la fase 1 más barata.

**Forma de la fase 1 (resuelta — medida sobre el `build/` de upstream y validada ejecutándolo):**

*Cuánto se reutiliza:* `build/build.ts` son 447 líneas pero la **orquestación son ~30**; el músculo vive
en módulos importables — `scraper` (fetch del export + manifest/drops/patchlogs/wikia) y `parser`
(1435 líneas). **El parser no se copia, se importa.** El build propio = importar esos dos + escribir
nuestro `saveJson` (~20 líneas, donde vive el control de acción: qué categorías se emiten). **`saveImages`
se salta** — es lo caro del build (`imagemin`/`sharp`, descarga por ítem) y las imágenes ya vienen del
`data/img` del clon de upstream (605 MB), que es lo que `get-img.mjs` lee. Verificado: los tres módulos
(`scraper`/`parser`/`hashManager`) cargan e exponen su API importados por ruta desde fuera del paquete.

*⚠️ El clon deja de ser solo-datos: hay que instalarlo.* Hoy `warframe-items/node_modules` está **vacío**
— nunca corrió `npm install`, porque sólo consumimos su `data/json` commiteado. El build propio lo exige,
y las dependencias **van dentro del clon, no en `omniframe-items`**: Node resuelve por la ubicación del
*importador*, y los archivos importados viven en `warframe-items/build/`. Traer el clon pasa a ser
`git clone --depth=1` **+** install. De sus **54 deps declaradas la cadena `scraper`+`parser` necesita 11**
(`chalk`, `cheerio`, `https-proxy-agent`, `lodash.clonedeep`, `lzma`, `node-fetch`, `progress`,
`sanitize-filename`, `socks5-http-client`, `@wfcd/patchlogs`, `@wfcd/relics`) — `sharp`/`imagemin*`, las
pesadas, **no** están entre ellas: son de `saveImages`, que se salta.

*⚠️ El estado del build vive en el directorio de upstream.* No es sólo lectura de `config/`: el parser
mantiene un **caché incremental** anclado por `import.meta.url` a su propio directorio —
`previousBuild ← ../data/json/All.json` (reusa drops y patchlogs del build anterior cuando el hash no
cambió, "takes a lot of cpu time"), y `hashManager` **lee y escribe** `../data/cache/.export.json`. O sea:
el build propio reutiliza el `All.json` *de upstream* como caché y sus escrituras de cache caen *allí*.
Funciona —el clon es descartable y regenerable— pero la formulación precisa no es "omniframe-items genera
su raw de punta a punta" sino: **orquesta el build con la maquinaria de upstream in-situ y materializa la
salida en su propio layout.**

*Precondición validada:* `origin.warframe.com` es alcanzable (451 ms) y `scraper.fetchResources()`
completa en **~27 s trayendo ~158 MB**. Los endpoints traen el **hash embebido**
(`ExportCustoms_en.json!00_ZJIc6+…`) — es el insumo directo de `.export.json` y, con él, del sello de
versión. Sin correr aún: `parser.parse()`, que exige además manifest/drops/patchlogs/wikia/relics — eso
ya *es* la fase 1 y tiene su árbitro de diff vacío.

*Cómo expone el raw:* **`omniframe-items` replica el layout de upstream** — `data/json/` propio + loader
propio. No es elección estética: la clase `Items` resuelve su `data/json` **relativo a su propio archivo**
(`dirname(fileURLToPath(import.meta.url))`, sin parámetro), así que no se la puede re-apuntar — hoy
`omniframe-items` la extiende y por eso lee el `data/json` de *upstream*. Con layout propio, **Project no
cambia una línea**: `generate-data.ts` sigue haciendo `new Items()` y el swap es transparente, que es lo
que hace viable el árbitro de diff vacío.

*Satélites del layout (no alcanza con `data/json/<Category>.json`):* el loader **exige**
`data/cache/.export.json` (hashes por archivo del export ⇒ `Items.versions`) y lee `data/json/i18n.json`;
el build lee `data/warnings.json`. Replicar el layout es replicar esos también. **`.export.json` es además
el insumo del sello de versión** que habilita el pin futuro (`OQ-DATA-9`).

*Consecuencia estructural:* el enriquecimiento pasa de **dos tiempos a uno**. Hoy hay build → cache
(`data/*.json`) y luego runtime → `enrichItems` mutando en memoria dentro del constructor; con raw propio
los scrapers corren dentro del build y el resultado queda en el `data/json` emitido. `enrich.mjs` y el
`index.mjs` actual (que extiende la clase de upstream) mueren ahí. Elimina de raíz la clase de bug "la
cache existe pero no está wired".

*Costos aceptados, explícitos:*
- `parser`/`scraper` **no están en los `exports`** del `package.json` de upstream (sólo `"."` y
  `"./utilities"`) → se importan **por ruta relativa** al clon. Es el acoplamiento a internos que (a)
  asume a conciencia, no un accidente. La anatomía del build que lo hace viable vive en
  [`../domains/source/warframe-items.md`](../domains/source/warframe-items.md); acá queda la decisión.
- **El build propio corre en HOST, no en Docker** — como el resto del pipeline de datos: necesita salida a
  `origin.warframe.com`, a la wiki y a GitHub.
- El build de upstream es TS (`tsx ./build/build.ts`); `omniframe-items` es `.mjs` plano → suma `tsx`.
- **Asimetría a sostener:** el raw JSON viene de `omniframe-items`, las **imágenes** siguen viniendo de
  `warframe-items/data/img` vía `get-img.mjs`. Coherente mientras el build propio use el `parser` de
  upstream (mismo `imageName`); si esa derivación se toca, `get-img` es el primer damnificado.
- El **stub de `@wfcd/items` del Dockerfile** asume la forma actual del paquete → revisar al cambiarla.

**Diferido con gate explícito:** normalización dentro de `omniframe-items` (gated por sacar el tipado de
`@shared` a un paquete reusable) · frontera source/normalizado en dos carpetas, con `generate-data`
reducido a comprobar/copiar/auditar (`OQ-DATA-9`) · pin + maquinaria de versión (habilitado por el sello
nativo de esta fase).

---

**Residuales abiertos:**
- **Locales.** El fetch baja los 15 idiomas (~5 min de build) aunque el proyecto consuma `en`.
  `locales` se lee del `config/locales.json` del clon **a nivel de módulo**: recortarlo exige tocar
  upstream pristino o reimplementar `fetchResources`. **Diferido con criterio de reapertura:** no es
  rentable por ahorro —el raw propio son 29 MB contra 1,7 GB del clon— pero sí lo será por **control**
  el día que haga falta pin de versión del export.
- **Imágenes: dos fuentes, ninguna resuelta en `omniframe-items`.** El raw es propio pero las imágenes
  salen de `warframe-items/data/img` (605 MB) vía `get-img.mjs` — la asimetría que sostiene el clon.
  El manifest de DE (19.690 entradas) cubre los ítems y haría innecesaria esa dependencia.
- **Los iconos de habilidades no son el mismo problema.** Las 507 referencias de
  `ability-stats.override.json` (`Catalyze130xWhite.png`, `AmpIcon.png`) **no están en el manifest de
  DE** (cero entradas con `130xWhite`): son títulos de la **wiki**, no nombres de archivo. La
  distinción importa — los ítems guardan nombre de archivo, las habilidades guardan título de wiki, y
  tratarlos igual es lo que mantuvo el gap invisible. Nunca tuvieron icono.

  **No se resuelve por ahora (decisión 2026-07-23):** ningún consumidor lo reclama y el arreglo toca
  tres piezas, no una. Lo investigado, para no volver a pagarlo:
  - El mecanismo **existe y funciona**: el fork resolvía nombre→URL con la API MediaWiki
    (`api.php?action=query&titles=File:X&prop=imageinfo&iiprop=url`, lotes de 50) en `getImageUrls`.
    Verificado hoy contra la wiki: responde 50/50.
  - `omniframe-items/build/wikia/AbilityScraper.mjs` lo perdió al relocalizarse — llama
    `transformAbility(raw, {})` con el mapa vacío, así que `icon` cae al fallback del nombre crudo.
    El consumidor del mapa sigue intacto.
  - **El scraper no es el consumidor real:** `DataRegistry.hydrateAbility` lee el icono de
    `ability-stats.override.json`, no de la cosecha. Arreglarlo exige scraper + override + resolver.
  - Los nombres **no son nombres de archivo**: el título real lleva paréntesis
    (`AntimatterDrop130(xWhite).png`) que la normalización del wiki oculta. Contra un directorio local
    no matchean ni bajando los archivos.
- **`wikia_thumbnail` se mantiene sin consumidor.** Ningún componente lo lee y ensucia el árbitro del
  dataset (~13 armas por regeneración, es scrape del wiki en vivo). Se conserva como único puntero a
  la imagen remota. Cobertura: 73% de armas, 49% de companions, 0% de warframes/mods/arcanes.
- **El stub del Dockerfile no es removible todavía.** `omniframe-items` declara
  `file:../warframe-items` para los tipos de `index.d.ts`, así que el `prepare` con husky se dispara
  igual. Muere cuando el tipado salga de `@wfcd/items`.
- **Entradas wiki-only:** el export no trae ninguna unidad de Narmer/Anarchs/Murmur/Techrot/Scaldra (115 en
  el wiki). Emitirlas exige cosechar también sus stats base del wiki → cambia la procedencia del stat base
  (hoy siempre export). No ejecutado; ver `OQ-DATA-15` (residual) y el §6 del schema.
- **Dependencias estáticas de upstream sin auditar:** su `warnings.json` (de donde sale `failedImage`, que
  alimenta `dedupImageNames`) y su `data/img` (605 MB). Si upstream deja de publicarlas, envejecen en
  silencio igual que `Enemy.json`. Ver [`../domains/source/warframe-items.md`](../domains/source/warframe-items.md).
- **Auditar normalizaciones `?? []` redundantes** que compensaban la incompletitud del fork (ej.
  `incompatibility_tags`) — ahora el dato fresco las puede volver innecesarias.
- **`warframe-items.backup`** (el fork viejo) movido fuera del repo a `/HDD/Development/Warframe/Lib/`
  pendiente de lectura del usuario; borrado definitivo a su criterio.
- **Investigar "cositas"** que el usuario vio en `warframe-items` pristino (fuera del modelado actual, sin
  urgencia).

**No bloquea:** nada.
**Vínculo:** `OQ-DATA-9` (madurez de datos / tracking de sincronización — un ingest propio podría llevar el sello de versión nativo, cerrando la mitad-override que hoy falta; y aloja la frontera raw-vs-normalizado diferida) · deuda de formato de `writeJson` (§Audit reports del pipeline) · `../domains/source/warframe-items.md` (qué aporta el fork actual).
**Fuente:** reflexión del usuario, cierre de sesión 2026-07-20; investigación 2026-07-22.

---

## OQ-ENGINE-21 — Fidelidad de la ley de enemy-scaling: la tabla no está validada por DE — **ABIERTO (2026-07-19), GATED POR MEDICIÓN**
**Dominio:** engine / C2 (enemy scaling) — hermana de `OQ-ENGINE-15` (DR)

**Contexto:** los coeficientes de `enemy-scaling.ts` se transcriben de `Enemy_Level_Scaling`
(`references/wiki/mechanics/enemy-level-scaling.wikitext`). El propio raw advierte que las fórmulas
"are derived from in-game testing and have **not** been confirmed or denied valid by Digital
Extremes… accuracy still under review".

**Lo que queda abierto:** toda la tabla (coefs health/shield/armor, smoothstep, DR `√3a/100`) es
community-derived; hoy solo Arid Butcher @215 está validado contra el **calculador** del wiki (no contra el
juego — no muestra HP numérico). La DR ya es `OQ-ENGINE-15`. El módulo Lua de abajo es *del wiki*, no de DE:
resuelve la **coherencia interna** de la fuente, no la fidelidad al juego.

**La transcripción está validada contra el módulo Lua propio del wiki.** `Module:Enemies/infobox` (el que la
propia wiki ejecuta para mostrar stats) contiene las tablas de scaling machine-readable, sin ambigüedad de
prosa. Ver: `curl -sS "https://wiki.warframe.com/w/Module:Enemies/infobox?action=raw" | sed -n '15,160p'`.
- **`Anarchs` = grupo Orokin/Corrupted en AMBAS capas** (health `f1 0.0150/2.10, f2 10.7332/0.685`; shields
  `f1 0.0200/1.75, f2 2.0000/0.75`) — el código lo declara así en las dos tablas. El tab "Anarchs, Corrupted"
  tenía razón contra la prosa que los agrupaba con Murmur/Sentient/Unaffiliated, y esa prosa ya no existe: la
  página vigente titula ese grupo "Murmur, Sentient, and Unaffiliated". Fuente y módulo coinciden.
- **El resto de la tabla del proyecto MATCHEA el módulo:** armor exacto (`0.005/1.75, 0.4/0.75`, fórmula única
  confirmada), health de Grineer/Scaldra/Corpus/Orokin/Techrot y el default para Sentient/Murmur/Unaffiliated,
  shields de Corpus/Orokin/Grineer. Techrot shields `f1_expo` = `1.75` e Infested health `16.1` siguen al
  módulo, no a la prosa: los números del calculador salen del módulo, así que validar "exacto contra el
  calculador" con otro decimal es validar contra otro número.
- **Ninguna de las dos facciones tiene enemigos en `enemies.json`** (las 9 vivas: Grineer, Corpus, Infested,
  Corpus Amalgam, Unaffiliated, Orokin, Kuva Grineer, Sentient, Stalker). La fila existe para cuando el dato
  llegue; hoy no cambia ningún número.

### Lo que trajo la reescritura de la fuente — tres frentes vivos

La versión vigente de la página es una reescritura completa de las secciones Armor, Overguard, Damage,
Shields y Health, ya reconciliada en `references/wiki/mechanics/enemy-level-scaling.md` (las fechas de
fuente y destilado viven ahí, que es su régimen). Tres consecuencias que el engine todavía no absorbe:

**1. La curva no se elige — se interpola siempre.** *"Both endpoint curves are evaluated at every level,
including when s=0 or s=1."* Nuestra lectura previa ("`Δx<70` → `f1`, `Δx>80` → `f2`, en el medio
smoothstep") describe una **selección de región**; la fuente describe un `clamp` + smoothstep aplicado
siempre. Da el mismo número en aritmética exacta y **no** necesariamente en binary32 (ver punto 4).
La wiki además retiró la afirmación de que las curvas se cruzan en x=80.

**2. Overguard es un punto de fidelidad propio, no un detalle.** Si el engine va a modelar Overguard
enemigo, hereda tres divergencias respecto de health, y **dos no estaban documentadas**:

| | Overguard | health / shields / armor |
|---|---|---|
| input de nivel | **`Nivel Actual − 1`** (ignora el base level de la unidad) | `Nivel Actual − Nivel Base` |
| bounds `L`/`U` | **45 / 50** | 70 / 80 |
| coeficientes | `f1 = 1 + 0.0015·q⁴` · `f2 = 1 + 260·q^0.9` | por facción |

Base de todo Eximus = **12**. ⚠️ Es además **la fórmula peor respaldada de la página**: su única
referencia es un hilo de Reddit de 2022 marcado `[Confirmation needed]`. Entra al engine con menos
crédito que el resto de la tabla, no con el mismo.

**3. Pregunta nueva — ¿reproducimos binary32?** La fuente ahora declara la precisión como **normativa**:
*"coefficients, exponents, power results, and intermediate arithmetic results must be evaluated in
**binary32** in the displayed order"*, y prohíbe explícitamente reescribir `f1 + (f2−f1)·s` como
`f1(1−s) + f2·s`. Que se moleste en prohibir una identidad algebraica sugiere que la diferencia se
observó. Tres caminos, ninguno obvio:

- **Ignorarlo** — calcular en `number` (float64) y aceptar el delta. Barato; el delta no está medido.
- **`Math.fround()` en cada paso** — reproduce binary32 en JS sin dependencias, al costo de que la
  fórmula deje de leerse como fórmula.
- **Medir primero** — cuantificar el delta contra el calculador del wiki en el rango jugable y decidir
  con el número en la mano. Es lo consistente con cómo se resolvió el resto de esta OQ.

**No bloquea:** el engine corre — la transcripción es coherente con la fuente en toda la tabla.
**Bloquea:** confianza plena en la ley, que exige medición in-game; y validar "exacto" con precisión
defendible, que hoy se hace contra el gadget sin saber en qué precisión calcula él.
**Vínculo:** **OQ-DATA-15** (el INPUT `faction`, hermana), **OQ-ENGINE-15** (DR, mismo "provisional hasta
popup #1"), mirror `references/wiki/mechanics/enemy-level-scaling.md` (reconciliado 2026-07-19).
**Fuente:** re-captura raw (`references/wiki/mechanics/enemy-level-scaling.wikitext`). Auditoría: F5-P2 (2026-07-19).

---

## OQ-ENGINE-22 — Generalizar EHP/DR de `enemy/` a `entity/` (player/companion) — **ABIERTO, DIFERIDO**
**Dominio:** engine / formulas — hermana de `OQ-ENGINE-15` (DR de enemigo)

**Contexto:** `damageReductionFromArmor` y `effectiveHealthVsEnemy` (`formulas/enemy/{armor-mitigation,effective-health}.ts`)
son primitivas de enemigo. La mitigación por armadura no es conceptualmente enemy-specific — jugador
(Tenno) y compañero/minion tienen su propia versión (jugador: `DR = Armor/(Armor+300)`, distinta de la
de enemigo, confirmada vigente en el addendum "Precisión añadida" de `OQ-ENGINE-15`). `armor-mitigation.ts`
ya declara el gate de esta migración en su propio docstring.

**Pregunta (a evaluar cuando aparezca, no a resolver ahora):** ¿la generalización sube el *código* a
`formulas/entity/` con una fórmula por tipo (`entity → player | enemy | companion`), o alcanza con que
cada tipo tenga su propia primitiva en su propia carpeta, sin scope compartido? Cada entidad diverge en
fórmula y en caps propios — no está garantizado que unificar la ubicación ahorre algo más que
organización.

**Condición para abrir el trabajo:** un consumidor real de EHP/DR de jugador o compañero (hoy ninguno
existe — el CLI oráculo solo ejerce el eje enemigo). No se construye por consumidor hipotético.

**Vínculo:** `OQ-ENGINE-15` (DR de enemigo, la mitad ya resuelta de este eje), `Project/src/core/engine/formulas/enemy/armor-mitigation.ts` (declara el gate), `docs/domains/oracle/design/architecture.md` (lente `enemy`, el consumidor actual de la mitad enemigo).
**Fuente:** debate de organización del CLI oráculo (Trabajo 1/2, dominio `oracle`).

---

## OQ-ENGINE-23 — Rank de ítem sin consumidor; `mod.rank` vestigial — **ABIERTO, DIFERIDO**
**Dominio:** engine / A1→C1 (intención → hidratación)

**Contexto:** `mod.level`/`arcane.rank` ya se autodescriben (índice sobre el `base_value[]` propio del ítem,
clamp al último valor — `ModRepository`/`ArcaneRepository`). El resto de `rank` en `EnsembleIntention` no
tiene consumidor: `mod.rank` (heredado de `SlotIntention`) nunca se lee; `item.rank` de warframe/arma (el
0-30) no engancha a ningún nodo — `WeaponIntent` ni siquiera lo declara, `ensemble.warframe.rank` se pasa
y no se lee. Hoy un ítem rank-0 y uno rank-30 computan idéntico.

**Se va a usar, pero no hoy:** por simplicidad, hoy no hay consumidor real ni necesidad de modelarlo. Esta
OQ existe para no dejarlo acoplado a "código real" implícito — no para forzar diseño ahora.

**Condición para retomar:** un consumidor real (rank de ítem escala algo; o se purga `mod.rank` de
`EnsembleIntention` — toca contrato core, RED, radio ancho por UI de producción).

**Vínculo:** `Project/src/core/bridge/MutatorBridge.ts` (`intentionSlots`, `intentionWeapon`), `Project/src/core/engine/resolve/hydration/ModRepository.ts`, `Project/src/shared/types/ensemble.ts`.
**Fuente:** debate de organización del CLI oráculo (Trabajo 1/2, dominio `oracle`).

---

## OQ-ENGINE-24 — Derivación cross-stat: el mecanismo, DIFERIDO por falta de corpus de habilidades — **ABIERTO, DIFERIDO**
**Dominio:** engine / C1 — frontera grafo de buckets ↔ fórmula dedicada

**Contexto.** Una clase de habilidades computa su efecto **leyendo capacity-stats ya resueltos del propio
warframe**. Corpus relevado contra `references/wiki/` (no contra el override, que estaba sembrado
pre-pipeline):

| Caso | Fórmula | Forma |
|---|---|---|
| Iron Skin (Rhino) | `(1200 + 2.5 × TotalArmor) × Strength + Absorbed` | bracket armor × strength |
| Snow Globe (Frost) | idéntica letra por letra | ídem |
| Icy Avalanche (Frost augment) | `60 × str` + `20% armor→OG × str` + cap | ídem + cap |
| **Warding Halo (Nezha)** | `Damage Absorption 1662` + `Absorption Multiplier 2.5x`, ambos `$STRENGTH` | **ídem** — 4º caso, hallado en el propio override |
| Trinity (pasiva) | `ally_health += 0.5 × trinity_energy_max` | 1 input, sin bracket ni cap |
| Bloodletting (Garuda) | `% × MaxEnergy × min(1, hp/½MaxHealth) ÷ (2−efic)` | 2 inputs + clamp + no-lineal |

**3 casos de UNA forma + 2 formas de un caso cada una.**

**Casos mirados y DESCARTADOS del eje** — parte del "conteo real de formas" que la condición de
retomar pide, y el resultado más útil del barrido: el eje es **más angosto** de lo que parecía.

| Caso | Por qué no es de este eje |
|---|---|
| Grendel (pasiva) | el input es **cuántos enemigos tiene tragados** —estado de combate en vivo—, no un capacity-stat. El capacity-stat (Armor) es el **output**. Dirección opuesta. Su bucket (`+250 flat` después de los multiplicativos) ya está resuelto |
| Nourish (Trinity) | el input es una **elección de elemento** — vocabulario de `condition`, no un número leído. Mismo eje que Elemental Ward (Chroma) |
| Speed (Volt) | `base × Strength` y **aditivo al pool del stat destino**. Sin bracket, sin leer ningún nodo |
| Rhino Charge · Rhino Stomp | dash speed y speed decrease son **valores fijos que no escalan con nada**; el engine ya los trata bien |

**Candidato para prototipar el mecanismo: la pasiva de Trinity, no Iron Skin.** Es el mismo problema
base —leer un capacity-stat ya resuelto y escribir en otra entidad— pero **sin bracket compuesto, sin
absorbed damage, sin cap y sin Strength**: un solo término. Iron Skin agrega tres capas encima de eso.
Encaja con la condición de retomar, que pide recorrer las **simples** primero.

**Evidencia medida** (`Project/src/core/engine/__tests__/cross-stat-derivation.test.ts`, fixtures
sintéticos hand-built al molde de `rhino.test.ts` Fase 1a):
- **`× Strength` es estructuralmente inexpresable** por el acumulador actual: resolver
  `value × (str/100) = str − 100` da `value = 100(str−100)/str`, que depende de `str` ⇒ no existe
  `value` constante. El calibrado a `str=130` produce **3507.69** en `str=200` cuando la wiki dice **4800**.
- **La derivación post-resolve no sobrevive** (analogía con `effective-health.ts` descartada): escribir
  `node.final` fuera del grafo deja el nodo inconsistente con sus buckets y el aporte **se borra en el
  siguiente `resolve()`**; escribir el bucket exige reimplementar `calculateCurrentValue` afuera y
  `resetAccumulators()` lo zeroea igual. ⇒ la fórmula **no puede escribir `final`**: debe aportar a un bucket.
- **El bucket destino no es libre:** el `+ Absorbed` de Iron Skin va a `total_flat` (fuera del `× Strength`).
  Depositar el escalado en `multiplicative` amplifica el Absorbed (3770 vs 3620 real).
- **`value × (final/base)` ≡ `(value/100) × final` sólo si `base = 100`.** Los tres `source_attribute`
  que la hidratación puede emitir (`ABILITY_SCALE_NODE`) tienen base 100 ⇒ el mecanismo actual es una
  **particularización accidental**, no una decisión. Con un capacity-stat (energy 175, armor 240) divergen.

**Pregunta.** ¿Cómo lee una fórmula de familia los nodos **ya resueltos** del grafo?
Refina el enunciado de [`../domains/engine/test/gap-map.md`](../domains/engine/test/gap-map.md) —
"cómo el grafo consume una fórmula escalar-cerrada" ya está respondido por CO
(`resolveConditionOverload` consume `coBonusPct` y rutea a bucket). Lo que **no** existe es una familia
con **dependencia topológica**: las 5 actuales (CO, melee/sniper combo, combo-scaled-add, stack-decay)
leen `context.variables`, **ninguna lee otro nodo**. Implicaría arista declarada + `rebuildGraph`
iterando N sources + acceso a nodos source en `FamilyResolver`.

**Descartado en el análisis (no re-proponer sin argumento nuevo):**
- **Op genérica de derivación** con bucket elegido por dato — reintroduce el failure mode que
  `arch-decisions.md §9` mató en `CONTEXT_SCALE` ("generalizar el ruteo ⇒ un no-miembro se cuela").
  Regla vigente de §10: *generalizar la fuente del factor, NO el ruteo*.
- **Expresar la fórmula en los buckets del override** (descomponer Iron Skin en 3 stats sueltos): el
  schema `{label, base_value, upgrade_by, upgrade_type}` es **un stat = un modifier** y nada declara que
  pertenecen a la misma expresión; además exigiría meter `ARMOUR` en `upgrade_by`, que es el eje de
  *modding del jugador* (`OQ-W-6`). Mueve la fórmula de TypeScript a JSON: pierde tipos, tests y
  explicitud. La precedencia de buckets es fácil de errar en silencio (se erró durante el propio análisis).

**DIFERIDO — decisión de dirección.** No se paga el costo estructural hoy. Razón medida:
**de 1241 `upgrade_by` del override, exactamente 1 emite modifier** (Roar) — hay **una sola habilidad
funcional** en todo el sistema. Modelar la clase más compleja antes de estresar el pipeline con
habilidades simples (Volt Speed, Ember Fireball) invierte el orden de construcción.

**Condición para retomar:** haber recorrido warframes modelando habilidades **simples** primero, y que
de ese recorrido salga el conteo real de formas — con esa evidencia se decide si la familia se recorta
angosta (sólo "bracket de armadura × strength", 3 casos) o más ancha. **No antes.**

**Segundo eje, no cubierto por el enunciado de arriba: DÓNDE aterriza el resultado.** Iron Skin
escribe en la **misma entidad** que castea (Rhino). **Snow Globe escribe en otra**: el Health del
globo no es un stat de Frost, es el de un **objeto desplegado** —ni weapon ni warframe— que Frost
crea y que hoy no existe en el modelo. Misma fórmula letra por letra, destino estructuralmente
distinto. Resolver "cómo una fórmula lee otro nodo" **no** resuelve "a qué entidad escribe" — son dos
problemas, y el segundo es más grande. Anotado, no atacado.

**Bloquea:** Iron Skin, Snow Globe, Icy Avalanche, Trinity (pasiva), Bloodletting. `formulas/warframe/`
sigue vacío a propósito.
**Vínculo:** `Project/src/core/engine/contracts/primitives.ts` (`source_attribute` singular),
`Project/src/core/engine/resolve/SimulationEngine.ts` (`rebuildGraph`, `FAMILY_RESOLVERS`),
`Project/src/core/engine/__tests__/cross-stat-derivation.test.ts` (`it.fails` = el gap, ejecutable).
**Fuente:** `references/wiki/warframes/{rhino/iron-skin,frost/snow-globe,trinity/passive,garuda/bloodletting}.md`.

---

## OQ-ENGINE-25 — Orden de `total_flat` vs `multiplicative` contra la referencia canónica — **ABIERTO, LATENTE**
**Dominio:** engine / formulas — fidelidad del acumulador

**Contexto.** [`references/wiki/mechanics/calculating-bonuses.md`](../../references/wiki/mechanics/calculating-bonuses.md)
§*"Orden de operaciones — implementación canónica"* fija el orden:

```
1. Bonuses aditivos del primer pool
2. Multiplicativos independientes (MULTIPLICATIVE, uno a la vez)
3. Flat bonuses post-escala (ADD_FLAT)

Stat = [Base × (1 + ΣAdd_Pool1) × (1 + ΣAdd_Pool2) × (1 + Mult1) × (1 + Mult2) …] + ΣFlat
```

`formulas/weapon/stat-accumulator.ts::resolveStatValue` aplica:

```
final = ((base + base_flat) × (1 + mods_add_pct) + total_flat) × multiplicative
```

**Los pasos 2 y 3 están invertidos.** `references/wiki/mechanics/armor.md` no dirime: su ecuación
(`Base × (1 + Mod Multiplier) + Flat Bonus`) no contiene multiplicativos independientes, así que la
única fuente que fija el orden relativo es `calculating-bonuses.md`, y el motor la contradice.

**Por qué no se corrige de una: la intersección es VACÍA (medido).**

| bucket | nodos que lo reciben hoy |
|---|---|
| `total_flat` | `WEAPON_ADD_STATUS_CHANCE` (perk Felarx), `AVATAR_ADD_{HEALTH,SHIELD,ENERGY}_MAX`, `AVATAR_ADD_ARMOUR` (Azure Shards) + acumuladores propios (`AVATAR_FLAT_*_REGEN`, `WEAPON_FLAT_PUNCH_THROUGH`) |
| `multiplicative` | **sólo nodos de daño** — `resolveMeleeComboMult`, `resolveSniperComboMult`, CO con `co_behavior: multiplying`. La op `MULTIPLICATIVE` por vocabulario es inalcanzable (`design/vocabulary.md` L-9) |

Ningún nodo recibe ambos y **no existe token FLAT de daño** ⇒ ningún valor del motor cambia con el
orden actual. La discrepancia es de forma, no de resultado.

**Condición de activación:** el primer nodo que reciba `ADD_FLAT` **y** `multiplicative` a la vez.
Caminos concretos: un multiplicativo sobre armor/health (clase Vex Armor, no modelada) o la aparición
de un token FLAT de daño.

**Gate de resolución:** no se decide de escritorio. Invertir el orden **cambia resultados**, y la
referencia sola no alcanza para tocar el acumulador — precedente `OQ-ENGINE-15` (DR de armor: 3
fórmulas en conflicto, se adopta la más honesta como provisional y se deja gated por medición).
Método: `references/ingame-tests/`.

**No bloquea:** nada hoy. **Degrada:** la fidelidad se vuelve incierta en el momento exacto en que
alguien modele el primer caso que cruce los dos buckets — y ese caso no va a avisar.
**Vínculo:** `Project/src/core/engine/formulas/weapon/stat-accumulator.ts`,
[`../domains/engine/design/vocabulary.md`](../domains/engine/design/vocabulary.md) (`L-9`),
[`../domains/engine/attribute-node-contract.md`](../domains/engine/attribute-node-contract.md).

---

## OQ-ENGINE-26 — Composición entre fuentes de life steal: la fuente no lo declara — **ABIERTO**
**Dominio:** engine / C2 — sustain

**Contexto:** el corpus de wiki afirmaba *"las fuentes de life steal se acumulan aditivamente entre sí"*.
La afirmación **no está en `Life_Steal`** —2 KB que definen la mecánica y listan fuentes, sin una palabra
sobre composición— ni en `Exodia_Might`. Salió del corpus por eso.

**Lo que sustenta la afirmación hoy:** experiencia de juego del usuario, sin medición. No es un dato que
se nos escapó al destilar: **es un hueco de la fuente**. La wiki no dice que sea aditivo ni que no lo sea.

**La pregunta:** cuando dos fuentes de life steal están activas a la vez (arcano + arma innata + habilidad),
¿los porcentajes se suman antes de aplicarse al daño, se aplican en cadena, o se resuelven como instancias
de curación independientes? Las tres dan números distintos y sólo una es cierta.

**Por qué se registra sin consumidor:** `life_steal` no existe en `Project/src/` — el sustain no está en el
eje de stats del engine. Se registra porque el modelado está previsto, y porque el hueco es de la **fuente**:
volver a buscarlo en la wiki dentro de seis meses da el mismo resultado. Lo que falta es medición.

**Método de cierre (barato):** dos fuentes conocidas de life steal, enemigo de health conocida, contar HP
recuperado con cada una por separado y con las dos juntas. Si `AB = A + B` es aditivo; si `AB < A + B`,
compone en cadena. Resultado → `references/ingame-tests/`, y de ahí el doc de wiki lleva
`⚠️ Discrepancia →` sólo si contradice algo que la wiki sí afirme.

**No bloquea:** nada. **Vínculo:** `references/wiki/mechanics/life-steal.md` (el doc destilado, hoy sin la
afirmación), `references/ingame-tests/pending.md`.
**Fuente:** reconciliación del corpus de wiki (residuo R-3).

---

## OQ-ENGINE-27 — `co_base`: la regla padre→hijo del CO, declarada en el schema y sin validar del todo — **ABIERTO, GATED POR INVESTIGACIÓN**
**Dominio:** engine / C1 — fidelidad de la mecánica CO

**Estado:** el **qué** está decidido (`arch-decisions §9` pieza 3): la base de cálculo del CO entra como
**puntero al ataque padre** (`co_base`), declarado en el schema del override y **sin contrato TS ni
resolver**. Lo que queda abierto es el **warrant**: la regla no reproduce todavía el corpus completo, y
poblar punteros sobre una regla que falla afirmaría más de lo medido.

**La regla:** un ataque que **deriva** de otro computa el CO sobre la base del **padre**, no sobre la
propia — el radial sobre el impacto directo que lo genera, el disparo cargado sobre el sin cargar, el
proyectil hijo sobre el que lo escupe. El ratio se **deriva** de `innate_dna.profiles`; el override sólo
lleva el puntero.

**Validación contra el dataset** (`base_padre / base_propia` vs la columna `CO Damage Bonus Relative To
Base Damage` de la tabla ítem-por-ítem del wikitext):

| Arma · ataque | padre | propia | derivado | wiki | |
|---|---|---|---|---|---|
| Ferrox · `Radial Attack` | Charged Shot 350 | 100 | 350% | 350% | ✅ |
| Opticor Vandal · `Charged Shot AoE` | Charged Shot 400 | 200 | 200% | 200% | ✅ |
| Trumna · `Auto AoE` | Auto 82 | 50 | 164% | 164% | ✅ |
| Ambassador · `Charged AoE` | Charge 600 | 800 | 75% | 75% | ✅ |
| Paris Prime · `Charged Shot` | Uncharged 180 | 360 | 50% | 50% | ✅ |
| Lanka · `Charged Shot` | Partially Charged 200 | 525 | 38.1% | 38% | ✅ |
| Kulstar · `Cluster Bombs` | Rocket Impact 200 | 75 | **266.7%** | 257% | ⚠️ la wiki mide bonus 200 sobre base 75 y publica mal el cociente — el derivado la corrige |
| Braton Prime · `Incarnon Form AoE` | Incarnon Form 70 | 70 | 100% | 95% | ❌ la wiki usa base 74 para el radial; el dataset dice 70 |
| Zylok Prime · `Incarnon Form Radial` | Incarnon Form 500 | 700 | 71.4% | 90% | ❌ la wiki usa 776/700; ninguna de las dos bases coincide |

**Lo que la investigación tiene que cerrar:**

1. **Braton Prime y Zylok Prime** — ¿discrepa el dataset, la wiki, o la regla? Ambos son radiales de forma
   incarnon, así que el fallo puede ser sistemático de esa clase y no de dos armas sueltas.
2. **Qué ataque es el padre, cuando no es obvio.** Kuva Bramma tiene cuatro ataques (`Charged Shot`,
   `Radial Attack`, `Cluster Bomb Contact`, `Cluster Bomb Explosion`) y la wiki **no le da fila** en la
   tabla per-arma: el puntero de la bomba hija no está medido por nadie.
3. **Ataques que la fuente nunca midió.** La tabla lista *sólo discrepancias conocidas*: un ataque ausente
   no es un ataque exacto. Caso vivo: la Lex Incarnon — **ni la wiki ni el dataset le registran un radial**
   (sólo `Normal Attack` e `Incarnon Form`), aunque en el juego el radial exista como consecuencia del
   impacto. Si el dato upstream no trae el ataque, no hay padre al que apuntar ni base propia que corregir.

**Lo que `co_base` no puede expresar, y su complemento diferido** (además de la base congelada de arriba):
los **11 incarnon de secundarias** donde
el CO ignora el aumento de base damage de una Evolution (nota literal de la fuente: *"CO-bonus does not use
base damage increase Evolution"* — Atomos, Bronco Prime, Cestra, Despair, Dual Toxocyst, Furis, Lato
Vandal, Lex Prime, Vasto Prime, Zylok Prime). Ahí no hay ataque padre: hay un upgrade que el cálculo
saltea, y el ratio queda **condicional a la build** (`100% or 81%`, `100% or 53%`, …). Ese eje lo cubre
**`co_ratio`** —escalar medido por ataque—, **diferido con su propio gate**: se agrega, no hoy.

**Lo que la relectura ya corrigió** (vive en `arch-decisions §9`, no acá): los dos ejes de la wiki **no son
ortogonales entre sí**. El de *application* se concentra en `adding` —56 de 68 filas con ratio ≠ 100%,
contra **2 de 90** en `multiplying`— y `none` es su caso degenerado (16 filas en 0%). La partición por
composición de §10 sigue **correcta y fuera de discusión**: `co_base` refina la magnitud de un bucket que
`co_behavior` ya eligió, no abre una familia hermana.

**Corpus completo del eje, más allá de los guns.** La regla padre→hijo se validó sobre primarias, pero las
filas discrepantes cubren cinco secciones y **dos causas más** que ningún puntero expresa:

| Clase | Ejemplos | Encaja en `co_base` |
|---|---|---|
| Radial ← impacto directo | Ferrox, Opticor Vandal, Trumna, Ambassador, Mausolon (archgun) | sí, validado |
| Cargado ← sin cargar | Paris, Lanka, Cernos, Dread, Daikyu, Drakgoon | sí, validado |
| Proyectil hijo ← padre | Kulstar, Kuva Bramma | plausible, sin medición que lo confirme |
| **Melee derivado** | Innodem `Aerial Incarnon Wave 1/2` (360%/720%), Quassus Prime `Heavy Attack 1/2 Daggers` (40%/20%), Stropha `Heavy Attack Projectile` (25%), Tenet Agendus `Heavy Attack Wave 1/2` (20%, y son **`multiplying`**) | forma compatible, **sin validar** — §9 declara melee `adding` siempre y no dice nada de la base |
| **Base congelada** | Noctua ×3 (*"CO scaling value of 200 does not scale with Ability Strength"*), Artemis Bow (*"scales off 100 base damage per projectile instead of 240, unaffected by Power Strength"*) | **no** — no hay ataque padre: hay un número que no escala con el build |

La **base congelada de exaltadas** es una tercera causa junto a las Evolution: el ratio depende de la
Ability Strength del jugador, así que tampoco la cubre un `co_ratio` fijo por ataque. Ambas comparten la
forma *"el CO ignora una fuente de escalado que el ataque sí recibe"*, y si se modelan, se modelan juntas.

**Gap de la propia fuente:** la sección `Robotic` (armas de compañero) está **vacía y marcada
`{{UpdateMe}}`**. No es "sin discrepancias": es sin medir.

**Lo que NO es esta OQ — dos casos que ya tienen hogar:**

- **Secondary Shiver** (`+45% por stack de Cold`) está **contemplado en §10**: aparece en su tabla y la
  justificación generaliza *la fuente del factor* (`unique_status_count`, `freeze_stacks`, …) manteniendo
  fijo el CÓMO. No es una forma nueva.
- **Primary Frostbite** (`+3% CD por proc de Cold, 12 s, cap 40`) es la forma de **§11
  `STACK_DECAY_BUFF`** —*evento discreto → +val por stack, cap Nx*, sin leer el status del target— que
  ya está **ejecutada** con Galvanized Chamber.

**No bloquea:** nada hoy — el modo estático replica el techo declarado. **Degrada:** la fidelidad de todo
ataque derivado en cuanto el CO se calcule en vez de declararse. El error es conocido y acotado, no
silencioso: en los arcos cargados el bonus queda **al doble** del real, y Lanka ya está en el corpus de
tests. `co_behavior` **no** lo corrige — pone el bucket bien y deja la magnitud mal.
**Condición de cierre:** la investigación de los tres puntos de arriba. **No** es una campaña de tests
in-game: el ratio se deriva del dataset que el pipeline ya carga, y la wiki queda de oráculo de contraste.
**Vínculo:** `docs/domains/engine/design/arch-decisions.md` §9 (las tres piezas de CO) y §10 (la
partición), `docs/data/schemas/weapons/weapons-attack-structure.md` (el campo declarado),
`references/wiki/mechanics/condition-overload.md` + su `.wikitext` (la tabla ítem-por-ítem sólo vive en el
crudo), `Project/src/core/engine/formulas/weapon/weapon-condition-overload.ts`.
**Fuente:** reconciliación del corpus de CO (residuo R-6) — el eje perdido al destilar.

---

## OQ-ENGINE-28 — Resistencias por entidad: una capa aparte de la matriz por facción — **ABIERTO, DIFERIDO**
**Dominio:** engine / C2 — modelo de enemigo

**Contexto:** `enemy-resistances.md` sostiene la matriz de Damage 3.0, que es **por facción**. Las secciones
`==Sources of X Resistances==` de las subpáginas `Damage/<Tipo>` traen otra capa: **resistencia de una
unidad concreta, con número, independiente de su facción**.

| Unidad | Resistencia |
|---|---|
| Hyekka Master | **80% a Heat** y **80% a Slash** |
| Techrot Obsolyte | Electricity |
| Toxic Ancient | Toxin |
| The Fragmented | **inmune** a Cold y a Viral |
| Leaping Thrasher · Scaldra TI-92 | **inmunes** a Viral |

**La pregunta, cuando el modelo de enemigo llegue:** esta capa **se compone con** la matriz por facción —
no la reemplaza. Falta decidir cómo: ¿multiplicativa sobre el resultado de la matriz, o reemplazo del valor
de la matriz para ese tipo de daño en esa unidad? Una inmunidad (`The Fragmented` vs Viral) sugiere que
al menos algunos casos son **override**, no factor.

**Por qué se registra sin consumidor:** no hay modelo de resistencias por enemigo y no lo habrá pronto. Se
registra porque el dato **se descubre una sola vez**: está esparcido en 19 subpáginas, y quien modele
resistencias partiendo sólo de `enemy-resistances.md` va a construir una matriz por facción y descubrir la
capa por unidad después de haberla cerrado.

⚠️ El eje enemigo arrastra además el fósil de `Enemy.json` (`docs/domains/source/gaps.md` §G-2): las
unidades nombradas acá **no están en el data-set**.

**No bloquea:** nada. **Vínculo:** `references/wiki/mechanics/enemy-resistances.md`,
`docs/domains/source/gaps.md` §G-2, `OQ-ENGINE-21` (scaling del mismo eje).
**Fuente:** retrospectiva de las 19 subpáginas `Damage/<Tipo>` (residuo R-13).

---

## OQ-ENGINE-29 — ¿Los status sin ícono cuentan para Condition Overload? — **ABIERTO — gated por test propio**
**Dominio:** engine / C2 — población de status

**Contexto:** `condition-overload.md` §Qué cuenta como status effect lista `Lifted`, `Knockdown` y
`Microwave` entre los que cuentan para el multiplicador. Son estados **sin ícono en la UI del enemigo**.
La duda del usuario: eso se habría parcheado hace años, y Warframe arregla bugs sin anunciarlos.

**Lo que la wiki sostiene, y lo que no:** los tres están en la página desde al menos 2024-06, y sobrevivieron
25 ediciones recientes que afinaron listas vecinas sin tocarlos. Pero la página lleva `{{Community}}`,
`{{UpdateMe}}` y `{{CleanUp}}` a la vez, y **`Condition Overload (Mechanic)/Testing` no los menciona** — es
un checklist de armas, no de status. **Sobrevivir ediciones no es verificación:** nadie los miró.

**Por qué importa:** es un stack del multiplicador. Si no aplican, el CO sale **sobreestimado** — y el error
es silencioso, porque el número sigue pareciendo razonable.

### Diseño del test — tres restricciones que lo hacen honesto

**1. La métrica es un ratio, no un daño absoluto.** Dos disparos contra **el mismo enemigo**, con y sin el
status en cuestión. Los stats del enemigo —health, armor, resistencias— **se cancelan en la división**. Esto
es lo que vuelve el test inmune al fósil de `Enemy.json` (§G-2): no necesitamos que el data-set modele bien
al enemigo, sólo que el enemigo sea el mismo en las dos mediciones.

**2. El sujeto debe aislar el status.** Un arma que aplique el status escondido **junto con otro** no sirve:
si el multiplicador se mueve, no se sabe cuál lo movió. Descarta a la Nukor para `Microwave` (Radiation
innato → aplica los dos a la vez). `Lifted` (heavy slam) y `Knockdown` (jump kick) se inducen **sin aplicar
ningún status elemental**, que es la propiedad que se necesita.

**3. Enemigo sin armor.** Para no arrastrar la fórmula de DR, que sigue en conflicto de 3 vías
(`OQ-ENGINE-15`). Sin armor, la cadena entre daño moddeado y daño aplicado tiene un eslabón menos.

**Predicción falsable:** con CO activo y **cero** status normales sobre el enemigo, aplicar sólo un
`Lifted` o un `Knockdown` debe mover el daño si la wiki tiene razón, y no moverlo si el parche existió.

**Cierre:** si se mueve, el dato entra al engine como ley. Si no, es `⚠️ Discrepancia →` contra
`references/ingame-tests/`, y el conteo de status del engine excluye los sin-ícono.

**Mientras tanto:** el dato queda como la wiki lo dice —es lo que la fuente afirma— pero **no entra al
motor como ley** sin la medición.

**No bloquea:** nada hoy. **Bloquea:** fidelidad del conteo de status en cuanto el CO se modele.
**Vínculo:** `references/wiki/mechanics/condition-overload.md`,
`references/wiki/mechanics/crowd-control.md` (`Lifted` / `Knockdown`), `references/ingame-tests/pending.md`,
`OQ-ENGINE-15` (por qué el enemigo va sin armor).
**Fuente:** duda del usuario sobre el corpus de CO (residuo Q-3).

---

## OQ-ENGINE-31 — ¿Qué le falta a una entidad para ser modelable? — **ABIERTO — gated por medición y por capacidad**
**Dominio:** engine / modelo de entidades

**La pregunta no es en qué orden se modelan las entidades.** Un ranking no tiene forcing-case y se
discute sin cerrar. La pregunta es **qué le falta a una entidad para entrar**, y si ese faltante es el
mismo para todas — el orden cae después, como consecuencia.

**El eje es la propagación de efectos, no el origen de la entidad.** Warframe, compañero, objeto de
habilidad y minion son todos **portadores y receptores** de buffs, propios y de aliados. Que una nazca
del loadout y otra de una habilidad es **consecuencia de dónde nace, y se hereda** — no una frontera
que las separe "en el espacio". Tratarlas como cajones distintos es el error a evitar: lleva a
construir un mecanismo por cajón cuando el problema real —a quién le llega un efecto y cómo— es uno
solo.

**Los datos ya están, y eso descarta el criterio fácil.** `companions.json` trae **83** entidades con
stats de supervivencia (45 pet · 21 moa · 17 sentinel) y `shared/types/companion.ts` ya define
`Companion` + `CompanionWeapon`; `vehicles.json` trae **150** (148 archwing · 2 necramech). "Hay datos"
no discrimina: los hay para casi todas. Lo único sin dataset son los **minions**, que tampoco entran
por loadout.

**El forcing-case es el compañero, y tiene un gate ya declarado por escrito.**
`semantic/upgrade-tokens.md` §*`AVATAR_` = el portador* dice que un mod de compañero con token
`AVATAR_*` buffea **al compañero** (`Enhanced Vitality` → vida del sentinel, no del warframe), que
rutearlo al warframe sería un bug peor que el que el salto por familia arregla, y que **el caso
compañero se decide cuando existan esas entidades**. Ese es el consumidor: no es abstracción
especulativa, es un ruteo resuelto sólo para armas con el otro lado esperando.

**Hipótesis que ancla el eje, y hoy NO tiene warrant:** que los buffs de warframe alcanzan al
compañero — *Speed* de Volt cayéndole al sentinel es el caso concreto. `speed.wikitext` habla de
*"allies"* y *"affected players"*, **sin mencionar compañeros ni sentinels**, y no existe corpus de
compañeros en `references/wiki/`. Es experiencia de juego del usuario sin medición, mismo régimen que
`OQ-ENGINE-26` → se mide (**`ingame-tests/pending.md` P-5**). Si el buff no propaga, el forcing-case
cambia de forma; si propaga, la entidad compañero nace ya necesitando recibir efectos de otra.

**La progresión que esto sugiere no es de entidades sino de capacidades del motor** — una entidad se
gana el lugar cuando el motor ya sabe propagarle lo que le llega: warframe → habilidades de buff
simples → habilidades de daño simples → sentinel como entidad → reevaluar. Los escalones intermedios
**no son entidades**, y ése es justamente el punto.

**Residuo declarado, sin OQ propia:** el dataset clasifica **necramech dentro de `vehicles.json`**
mientras el vocabulario de DE lo pone del lado del avatar (`AVATAR_` = warframe · archwing · necramech;
`VEHICLE_` = lo que se monta). Dos cortes distintos sobre la misma entidad. Se resuelve cuando el
horizonte llegue ahí — está lejos y no gatea nada de lo de arriba.

**No bloquea:** nada hoy. **Bloquea:** el ruteo de mods `AVATAR_*` de compañero, que hoy no tiene
lado al que aterrizar, y cualquier decisión sobre entidades derivadas de habilidad.
**Vínculo:** `semantic/upgrade-tokens.md` §*`AVATAR_` = el portador* (el gate declarado),
`OQ-ENGINE-22` (EHP/DR de `enemy/` a `entity/` — la misma generalización desde otra cara),
`OQ-ENGINE-11` (exaltadas: entidad derivada de habilidad ya con OQ),
`data/reports/audit-arcane-ability-like.md` (minions como *entidad generada*, y por qué no abrir OQ
para eso), `__tests__/volt.test.ts` (los `it.todo` de cap-para-aliados y opt-out: el modelo no tiene
aliados como entidad), `references/ingame-tests/pending.md` P-5.
**Fuente:** criterio del usuario sobre qué entidades son modelables y en qué orden, reencuadrado.

---

## OQ-DOC-1 — Docs commiteados citan `.working/` (gitignored) como autoridad de razonamiento — **ABIERTO (2026-07-19)**
**Dominio:** governance / higiene de documentación

**Contexto:** ~2 docenas de líneas en docs commiteados referencian archivos de `.working/` (scratch de
campaña, gitignored). Para cualquier clon que no sea la máquina donde se escribió el scratch, el archivo **no
existe**. La mayoría es **procedencia honesta** (Clase-1, abajo): la oración se entiende sin el scratch, el
puntero solo nombra historia. El defecto real es el subconjunto donde el doc **depende** del scratch vivo para
entenderse (Clase-2) — ahí el warrant es inalcanzable. Choca con `docs/CLAUDE.md` regla 1 ("un doc activo nunca
es la única copia de un warrant del que depende una nota viva").

**Dos clases — solo una es defecto:**
- **Procedencia honesta (se quedan):** la cita nombra un scratch **ya purgado/graduado/extinto** como historia
  ("migrado desde `.working/X` al cerrar la campaña", "`.working/Y` descartado", "`.working/` *no SSoT*").
  Equivale a un puntero a git-history; no promete un archivo vivo, la oración se entiende sin él. Ej.:
  `data/reports/audit-arcane-ability-like.md`, `governance/doc-map.md`, `docs/CLAUDE.md` (usa `.working/*-sweep.md`
  como *ejemplo de patrón*); `data/decisions.md` (nombra su `.working/` como **extinto**);
  `governance/closed-decisions.md` DC-OQ-ENGINE-10 (`.working/` marcado **no SSoT**, plan de la E descartada).
- **Warrant roto (a remediar):** la cita apunta a un archivo `.working/` **vivo** como SSoT del razonamiento
  (plan de implementación con §-anchor, tabla de corpus). Inventario — **cada uno gateado por el horizonte de
  diseño que su `.working/` está debatiendo**, por eso su núcleo no puede graduar a doc todavía:
  - `governance/decision-frontier.md` + `current-state.md` + `domains/engine/design/arch-decisions.md` (×3)
    → `.working/ability-model-debate.md` / `c1-simulation-doctrine` — gate: horizontes **habilidades** +
    **source-state / peso-de-status (T1)**
  - `domains/ui-ux/decisions.md` (×2) → `.working/consolidation-map.md` — gate: refactors **UI U-2**

**El gate real (corrige el "circular" aparente):** estas citas parecen atascadas —el `.working/` no madura a
docs, y las decisiones que lo desbloquearían están diferidas— pero la regla dura pide solo que **el doc no
dependa del `.working/` para entenderse**, NO que el diseño esté cerrado. Por eso la remediación **no es (a)
graduar** (ésa sí la bloquea el horizonte), sino **(c/b): hacer la oración commiteada auto-suficiente sobre lo
YA decidido + degradar el puntero a "en diseño (local, en progreso)"**. Eso es ungated, editorial, por cita —
independiente de habilidades/source-state. **Pregunta operativa:** por cada cita, ¿la oración ya se sostiene
sin el `.working/` (→ degradar puntero) o hoy **depende** de él (→ comprimir lo decidido inline primero)?

**No bloquea:** cada doc afectado es legible; el puntero roto solo se nota en otra máquina. **Degrada:**
reproducibilidad del razonamiento fuera de esta máquina.
**Vínculo:** `docs/CLAUDE.md` regla 1 (warrant pegado a la nota viva) + regla 4 (procedencia vive en git).
**Fuente:** cierre de la campaña engine-fidelity F1–F5 (2026-07-19); inventario reproducible: `grep -rn '\.working/' docs/`.

---

## OQ-DOC-2 — Detección de fuente estancada: la señal que falta es la inversa de la que existe — **ABIERTO**
**Dominio:** governance / higiene de fuentes ajenas

**Contexto:** `references-layout.mjs` detecta **una** patología: *la fuente se movió después de que
destilamos*. La opuesta —*la fuente no se mueve hace años*— está **nombrada** en
`references/wiki/README.md` §Las tres fechas ("fuente estancada") y **no se mide en ningún lado**.

El costo ya se pagó: `Module:Maximization/data` está congelado desde **2021-05** y
`Module:Ability/data/stats` desde **2022-07**; cuando el primero dejó de tocarse el juego iba por Hotfix
30.2.2 y hoy va por 43.0.8. `references/wiki/sources/` está exento del régimen de fechas, así que nada
podía avisarlo — y se llegó a escribir un doc apoyado en un módulo de 2021 antes de mirar su historial.
Los `.md` de `sources/` ya declaran su fecha real; **lo que falta es que sea ejecutable**.

### Se parte en dos herramientas, no una

**(a) `sources/` al régimen de fechas — angosto y ejecutable ya.** Cinco módulos Lua. La señal es la
antigüedad de la última edición del módulo, y la unidad correcta **no es el calendario**: es **cuántas
versiones del juego se publicaron desde entonces**, expresable con `version-data.lua`, que ya está
capturado. *"302 parches después"* es un argumento; *"hace cuatro años"* es una anécdota.

**(b) Frescura per-item — el trabajo grande.** Un umbral global miente en las dos direcciones: pueden
pasar 70 versiones sin que una mecánica cambie en lo más mínimo. La pregunta correcta es **por ítem**:
*¿cuándo se modificó esto por última vez → se actualizó en nuestro proyecto?* Es el mismo criterio que
ya usa el audit de overrides, y el patch history está disponible por las dos vías (la API de la wiki y
el raw que `omniframe-items` destila).

### El límite que define el tier de salida

**El patch history da un evento, no un alcance.** Que un warframe se haya tocado sólo en su pasiva **no
descarta** que sus cuatro habilidades estén desactualizadas — el parche nombra lo que DE decidió nombrar.
Por eso (b) **no puede emitir veredictos**: su salida es una **worklist de revisión**, tier informativo y
ratcheteable. Un check de frescura que pretenda decir "esto está mal" se llena de falsos positivos y se
aprende a ignorar, que es cómo mueren estas herramientas.

**Nota de alcance:** (a) no puede usar el mecanismo de (b) — los módulos Lua **no tienen patch history del
juego**, sólo historial de edición de la wiki. Son dos señales distintas sobre dos clases de fuente.

**No bloquea:** nada. **Degrada:** una fuente muerta se detecta cuando alguien la recuerda, no cuando se
muere. **Vínculo:** `references/wiki/README.md` §Las tres fechas, `references/CLAUDE.md` §Qué audita cada
herramienta, `docs/domains/source/wiki-modules.md`, `Project/scripts/references-layout.mjs`.
**Fuente:** los dos módulos congelados, encontrados por memoria del usuario y verificados con
`prop=revisions` (residuo R-17).
