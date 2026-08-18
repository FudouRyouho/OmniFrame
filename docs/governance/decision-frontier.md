---
Estado: "referencia"
Rol: "Separar lo ya decidido de lo que sigue en debate o solo sugerido"
Impacto_ID: "G-ADL-Frontier"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-08-18"
---

# Decision Frontier

Este documento marca la frontera de lo que ya no se debate porque ya tiene una solución arquitectónica cerrada o una decisión de compromiso aceptada.

## Fronteras de la Fase Actual

### 1. Motor de Simulación (Sim-v2)
**Decidido**:
- **Cierre del Modelo Lineal (B1-B4)**: Se abandona el modelo manual de 3 capas en favor de un **Motor de Simulación Sistémica** (Sim-v2).
- **Agnosticismo Total**: El motor es una pieza funcional, determinista y serializable (apto para Web Workers), completamente desacoplada de React.
- **Flujo A->B->C**: La jerarquía es **Intención (`Scene`) → Espacio + moldes (MutatorBridge) → Simulación (Engine)**. B no re-shapea la intención: puebla los participantes y les cuelga su `MutatedDNA`. La forma intermedia que hubo (`Ensemble`) no computaba nada y ya no existe.
- **Salida Única**: El motor emite un snapshot inmutable vía `consume().snapshot(): SimulationEntity[]` (salida de C).
- **Eliminación de `LoadoutProvider`**: `EnsembleStore` es el único SSoT de estado del usuario. Ver DC-OQ-STATE-1..4 en `closed-decisions.md`.
- **Frontera de dominios**: los dominios (`domains/*`) **no importan `@core`** (reafirma Restricción 1 de `Project/CLAUDE.md`). `@core` = dominio de lógica A/B/C; la UI y la Capa D (consumo derivado, `ViewModelContract`) cruzan por `@shared`. `consume()` = **salida de C** en `@core`, consumida por scripts/tests (no-dominios); **no es Capa D**. Oráculo de verificación = **CLI, no MCP** (MCP diferido). Ver [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §5-7.
- **`@providers → @core` PERMITIDO**: la capa de composición (`@providers`, adapter) **sí** importa `@core` — `EnsembleProvider` → `@core/intention/ensemble-store`. Adapter→core = dirección correcta de Ports&Adapters; la Restricción 1 protege a los dominios de feature, **no** a la capa de composición. **No contradice** la frontera anterior (`@providers` no es un dominio de feature). Ver `closed-decisions.md` (DC-OQ-ENGINE-9).
- **Estructura interna de `@core`**: `@core/{bridge (B), intention (A1), engine/{resolve (C1), simulate (C2), formulas, output, contracts, bootstrap, fixtures}}`; gemelo-de-entrada en `@shared/types/ensemble.ts`. Residual gated por D: eje (b) armonía harness/`output` (split de `fixtures/` hecho en Slice E). Ver `closed-decisions.md` (DC-OQ-ENGINE-9).
- **El motor NO simula el comportamiento del enemigo** — su movimiento, su puntería, su ciclo de ataque, su reacción al control de masas. El target es una **entidad que recibe daño y porta estado**, no un agente. La exclusión es de diseño: el costo no es la regla de comportamiento sino toda la infraestructura para ejecutarla con fidelidad, y **ninguna mecánica modelada hoy depende de lo que el enemigo hace** — los estados físicos que sí tienen consecuencia numérica (`Lifted`, `Knockdown`, `Microwave`) la tienen por **presencia de marca**, que Condition Overload cuenta sin mirar comportamiento. Consecuencia registrada en `open-questions.md` (`OQ-ENGINE-32`).

**Abierto**:
- Umbrales de conmutación para el **Modo Probabilístico** (Energy Threshold).
- Versión **reactiva completa** de la Capa D. (Materializada como `ViewModelContract` v0 display-only/C1; falta `metrics`/A2 reactivo — C2.)
- Renombre de D a contrato neutro: `ViewModelContract` v0 ya existe en `@shared/view-model`; su rename (display) queda como residual editorial en `DC-OQ-ENGINE-8` (el contrato de salida de métricas ya cristalizó como `CombatMetrics`). La **Capa E** (ViewModel intermedio) se **descartó** (`DC-OQ-ENGINE-10`): D se lee por dos lentes (D1 UI / D2 CLI), la hidratación de chrome viene del piso "0", no de una capa entre D y la UI. (La **simetría de entrada** — intención vía `@shared` ↔ store en `@core` — está **resuelta**; ver DC-OQ-ENGINE-9.)
- Estándar de esquemas JSON para **Behaviors Declarativos**.

### 2. Capas de Datos y SSoT
**Decidido**:
- La jerarquía de capas es `Raw -> Derived -> Canonical -> Presentation`.
- El SSoT de Overrides es **100% manual** y reside en `Project/public/data/`.
- El idioma del proyecto es **inglés exclusivo** (`DC-1`).

**Abierto**:
- Taxonomía inferior compartida (`family`, `variant`).
- Reglas de derivación determinista para tipos específicos (Arcane, Companion).

### 3. Capa de Presentación
**Decidido**:
- La frontera de traducción y formateo reside en el `Presentation Layer` (Formatter).
- Se prohíbe la invención de taxonomías desde la UI.
- **Unificación de componentes visuales en `@shared`**: `shared/components/` activo (cards, specs/detail views, views por entidad, filters/toolbars, navigation, popovers, slots). Ver `docs/governance/closed-decisions.md` (DC-OQ-UI-1).

**Abierto**:
- Arquitectura final de CSS y design tokens.

### 4. Flujo del daño y status (E-DamageFlow)
**Decidido** (RATIFICADO + extracción de Familia A ejecutada — ver [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §14):
- **El daño viaja** (`instancia → daño → tipo → estado`); source/target agnósticos hasta la resolución. La **LEY** de un status es ley del juego (agnóstica a source/target), NO "fórmula de enemigo".
- **Tres capas separadas:** LEY (`formulas/status/`, pura) · ESTADO (`EntityState.stacks`, portado-por-entidad) · RESOLUCIÓN (el pairing, `resolveHit`).
- **Familia A extraída** a `formulas/status/stack-debuff.ts` (Infection/Corrosion instanciadas; Disruption provisional=Infection). **LEY + ESTADO keyeados por EFECTO** (snake_case: corrosion/infection/ignite/disruption), no por tipo de daño.
- **Arista 1** (identidad tipo→proc, 1:1) resuelta = vocabulario en `semantic/damage-types.md` + runtime en `formulas/status/`.
- **Modelo unificado de proc — arquitectura RESUELTA ([`../domains/engine/design/damage-status-model.md §Modelo unificado de proc`](../domains/engine/design/damage-status-model.md)):** un contenedor de instancias de proc en el target + `EffectBehavior` por efecto (acumulación + emisión + modificador de resolución), reemplazando los 3 contenedores (`stacks`/`dot_pools`/`active_pulses`) + `StatusEngine` + `dot_key` + `DotType`. Ontología LOCKED (instancia/resolución/proc/tick), composición `base(la fija el proc) × contexto(lo evalúa el tick al emitir)`, resolución vía `as: DamageType` (deriva del canónico). **Cierra el "cómo estructurar C2"** de los bullets de abajo — lo que sigue gated son las FACETAS específicas (data/caso forzante), no la arquitectura. Residual `DotType`/`DOT_COEF` sin disolver (deuda G2).
- **La Instancia como objeto — el seam C1→C2 ([`../domains/engine/design/simulation-architecture.md §2.0.1`](../domains/engine/design/simulation-architecture.md)):** el trazado ①②③ se materializa en **un objeto Instancia construido una vez en el seam**, consumido por todos los proyectores de C2 (no re-derivado 3×). Principio **C1 COMPONE, C2 REALIZA**: C2 consume la salida de C1, no re-compone; **D consume la historia** del ciclo de vida (frame-0 = composición C1, deltas = realización C2). **Tres entradas:** Instancia (átomo per-evento ①②, target-agnóstica, congela valores+stamp) · Schedule (cadencia/fire-mode) · Target (③). El **contrato C1→C2** (emitir rico para C2) es el cimiento **simétrico al contrato de salida C2→D** (`DC-OQ-ENGINE-8`, ya cristalizado). Regla verificada por relectura del catálogo de deudas: la mayoría de las deudas del motor (re-implementación inline, 3× `chance×weight`, `elementBonusPct`, `resolveHit` ②③, contrato de salida) son **una sola deuda conceptual** que este objeto disuelve; lo que resta es dato (OQ-20/18/16) o ajeno a C (UI/vocabulario/intención).

**Abierto (gated — NO construir sin el caso real que lo fuerza):**
- **`DamageInstance` de primera clase + split ②③ — HECHO (verificado contra código).** El gate O5 original ("esperá al 1er daño-de-habilidad") se cerró: (a) la **Instancia-objeto** = `deriveInstance` (seam C1→C2, target-agnóstica, consumida por los 3 proyectores sin re-extraer); (b) la **resolución ③** (facción/DR/capa/stacks) ya vive limpia en `resolveDamageEvent`; `resolveHit` quedó como fan-out por tipo, no como colapso ②③.
  - **Drift restante (NO es `resolveHit`): `simulateAttack` god-function.** Fusiona ejecución del Hit (rolls multishot/crit) + ② + invocación de ③ + elección de paradigma (atómico vs bulk por `HYBRID_THRESHOLD` escondido). Es el eje 4 + eje 2 del cruce de `@core`.
  - **Dar a ② identidad-de-objeto (etapa COMPONE-TRAYECTO reutilizable) = GATED, no especulativo hoy.** Verificado contra código: NO hay abstracción nueva que aporte — el crit ya está centralizado en `crit-base` (una ley, dos llamadores, sin duplicación), el falloff tiene un solo hogar (`CombatCalculator`, gated por `OQ-ENGINE-7`), y la sinergia externa (Roar/Bane) que forzaría la etapa **no existe aún**. Construir `composeTrajectory` sin consumidor = la abstracción especulativa que [[feedback-reconciliar-no-gated-por-consumidor]] difiere. **Forcing-case natural:** la 1ª sinergia externa (Roar = ② source-side, llega con el source-state/Rhino+Roar) o falloff-en-timeline. Las habilidades (Toxic Lash, Xata's Whisper) = consumidor downstream, no gate.
  - **Opción C — separar el paradigma consecuencia/predictivo del Hit (`HYBRID_THRESHOLD` → decisión de proyección explícita) = MARCADA "tener en cuenta".** El eje 2 completo; el más invasivo y sin consumidor real hoy. NO se ejecuta; se re-abre si el source-state/timeline lo fuerza.
- **`neutral-state` como objeto derivado + `source-state` vivo — PROPUESTA SÓLIDA (horizonte validado, marcada hipótesis; NO frontera cerrada). Gate de construcción: primer buff/estado con duración del lado source.** El estado **no es propio de una entidad**: se modela un **`NeutralState` base (objeto-de-estado)** del que **derivan** los estados por naturaleza del nodo — source / target (`EntityState`) / minion / object. Hoy hay asimetría real: el target tiene su columna (`EntityState`), el source **no** — la Instancia se deriva CONTRA un source-state que hoy es `= la entity estática de C1` (funciona para arma sin buffs live). El concepto que enmarca esto —qué HACE una fuente (emite-instancia / muta-state / sub-source), la simetría ②/③ = derivar-contra-un-state, y la regla key-por-verbo del corpus— es la **hipótesis nodo-source** en [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §15 (prototipo, se refuerza/cae con el test de Rhino+Roar; el verbo emite-instancia de esa hipótesis ya se construyó — ver el banner 🟢 de §15). **Ya construido, verificado contra código (Fases 0/0.5/1a/1b):** el attach de Roar no es un `ALL_MULT` genérico ni entra en `WEAPON_ADD_DAMAGE` — es el **pool de FACCIÓN** (`GLOBAL_DAMAGE_POOLS` en `damage-logic.ts`, segundo elemento junto a `WEAPON_ADD_DAMAGE`; `calculating-bonuses.md §Step 3` + `faction-damage.md`: aditivo dentro, `×(1+Σfaction)` sobre el total). El derive cross-entity (`source_entity` en `ModifierBase`), el fixture sintético y la **hidratación real** (`AbilityRepository` lee `ability-stats.override`, `rhino.test.ts` Fase 1b: `+127% = 50 × strength(254%)`, con dato real, no sintético) están construidos y verificados. **Lo que sigue siendo G-a** no es el pool ni el derive — es que Roar se trata como **asumido-activo** (proyección estática): no existe el timeline/duración que lo prenda y apague. Ver `rhino.test.ts` Fase 1b, comentario: *"Roar asumido-activo (proyección estática del source-state; source-state vivo/duración = gate G-a diferido)"*.
  - **Consumidor-puente del refactor (no requiere modelar un minion):** la cadena `warframe → weapon → enemy` = **dos acumuladores vivos con un derive en el medio** (warframe-state: Roar/combo/energía · weapon: combo/spool/ammo + **punto de derive** de la Instancia · enemy-state: procs). Caso concreto **Rhino + Roar** (Roar = buff con duración = *este mismo gate*). Es el enunciado limpio de *"C1 compone contra el source-state, C2 realiza contra el target-state"*. El **derive cross-entity** (campo `source_entity` en `ModifierBase`, arista del grafo) y su **adaptador de dato** (`AbilityRepository` hidrata Roar desde `ability-stats.override`; `rhino.test.ts` `rhino_roar`, +127% al decimal) están **construidos** — pero son la **proyección ESTÁTICA** del source-state (Roar asumido-activo, sin duración). El **gate G-a sigue ABIERTO**: el source-state VIVO (duración/timeline, `NeutralState` base) no existe; el derive y su adaptador sí, el estado-con-vida no.
  - **Otras manifestaciones catalogadas del mismo gate, sin resolver — documentadas para no perder el catálogo, ninguna construida:** (1) *grupos alternativos de habilidad* (`groups[].id`/`exclusive` — Chroma/Equinox/Metronome/etc.; `AbilityRepository.getModifiers`/`getEmissions` iteran todos los grupos sin condición) — no es duración, es "cuál de N estados alternativos rige ahora", mismo vacío de source-state vivo aplicado a una elección en vez de un reloj ([Issue #29](https://github.com/FudouRyouho/OmniFrame/issues/29)); (2) *Nourish (Grendel), "Explosion Damage"* — la fuente dispara al **recibir** daño, no al castear (`nourish.wikitext:17`), y `getEmissions()` ni recibe `flags` ni tiene el punto de re-evaluación diferida que `SimulationEngine.resolveNode` sí le da a `Modifier.condition` (`SimulationEngine.ts:326`) — falta la misma maquinaria, aplicada a la familia `AbilityEmission`/`DamageInstance` en vez del grafo de `Modifier`.
  - **¿un state derivado es agnóstico a su nodo-madre? (`source→minion→instancia`) — RESUELTO POR FORMA.** Agnóstico al **nodo** (sin ref viva hacia arriba del árbol), **NO** a la **lineage**: el **stamp** aplana la lineage a un valor `{ecosistema-id,…}` matcheado por id, nunca desreferenciado a objeto vivo. El caso que lo fuerza es el **buff de área con dos emisores a distinta posición** (dos Rhinos en un escuadrón; Roar 10 s / 10 m): el aliado que cae en el alcance de los dos refresca **su** ventana sin tocar la del primer emisor, que quedó fuera del segundo cast. Con referencia viva hacia arriba eso es inexpresable — un cast tendría que alcanzar a quien no alcanzó. **Lo que se sigue:** el portador de un estado es el **receptor**, no el emisor; un cast produce **N instancias independientes**, una por sujeto, cada una con su propio reloj. El emisor es momentáneo — aporta la magnitud y el stamp, y sale.
    - **Magnitud ⊥ ventana: cada campo tiene su regla de refresco.** Una re-aplicación más débil refresca el reloj y **no** baja la magnitud, así que la instancia mínima es `{magnitud, ventana, stamp}` y no un objeto que se reemplaza entero. ⚠️ La regla exacta de refresco (¿`max`? ¿última gana?) **no está medida** — lo que la forma exige es que sean dos campos, no uno.
    - **El alcance se evalúa en la emisión, no en el muestreo** — si se re-evaluara al muestrear, alejarse cancelaría el buff. Eso parte los efectos en dos clases que caen sobre los tramos de [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §19: **aura continua** (Corrosive Projection → tramo 2, nodo, frame-0, sin reloj — construido) vs **buff on-cast con duración** (Roar, `Lohk Canticle`, `Combo Fury` → tramo 3, instancia por receptor con ventana — no construido).
  - **La clase de re-composición = {CO dinámico, combo, buff vivo}** = *"un input de la composición de C1 cambió → C1 re-compone; full-vs-incremental es optimización"*. **`OQ-ENGINE-2` (profile switch) NO es de esta clase:** es cómputo **estático por perfil** (dos hidrataciones), sin necesidad de runtime-switch — ver `OQ-ENGINE-2` re-scopeada.
- **Contenedor de ESTADO entidad-neutral** (jugador self-status, companion) — **CAÍDO POR CONSECUENCIA, no por refactor.** El estado nace del escenario consolidado (`simulation-architecture.md` §*El escenario consolidado*): `EntityState` recibe la **entidad resuelta de C1** y lee de ella sus tres vitales + su facción, así que la clase no sabe de qué lado está su portador. El gate que lo motivaba —primera entidad no-enemigo que porte status— ya no es el camino.
  - **La neutralidad es de forma Y de vocabulario, y la segunda mitad costó una medición.** La lectura de vitales nombraba la familia `ENEMY_*` fija: un warframe —que declara los mismos tres vitales como `AVATAR_*`— devolvía `0/0/0` y nacía `isDead()`, **en silencio**. `vitalsOf` resuelve la familia por la **marca de ruteo** del participante — el mecanismo de `familyRoute` (§18) en la dirección inversa: allá el token declara a quién alcanza, acá el participante declara con qué nombres se lo lee. Una familia sin entrada **tira**, porque un cero creíble no es diagnosticable. Tripwire: `__tests__/state-neutrality.test.ts`. El **rename de la clase** sigue pendiente, pero **ya no por falta de caso**: ese mismo tripwire construye `EntityState` sobre un warframe del catálogo, sobre un compañero y sobre un hostil —11 de sus 15 construcciones no son hostiles— y lo que contrasta es que el mismo contenedor recibe leyes distintas según quién lo porta. Queda pendiente por ser contrato de `@core` (RED), y ya se ejecutó: la clase es **`EntityState`** — el estado base de una entidad, extensible por portador (`../domains/engine/design/vocabulary.md` §2). No es el `NeutralState` de esta misma sección: aquél deriva por **naturaleza del nodo** y tendría a ésta como uno de sus derivados.
  - **Lo que sigue abierto es el otro lado:** el `neutral-state` como objeto derivado y el `source-state` vivo (arriba).
- **Arista 2 (aplicación del proc):** spec `{forced_procs, status_chance}` (2a, C1-declarable) + el ROLL (2b, C2). El disparo desde la resolución YA existe (`TimelineSimulator` → `applyProc` vía `expectedProcEvents`, modelo unificado); lo gated es el ROLL exacto (2b) y `forced_procs` como spec.
- **Familia C (DoT-tick dependiente del daño del arma)** — **wired** en el modelo unificado: `formulas/status/dot-tick.ts` (`coef × modded_base × (1+own_element) × (1+status_damage)`) alimenta los DoT behaviors (bleed/poison/ignite); el `advance` emite y `resolveDamageEvent` resuelve (verificado en `__tests__/status/{dot-tick-law,slash,proc-model}`). **Sigue gated:** el `×(1+faction)²` (pool②/faction² — **contexto que el tick evalúa al emitir**; build-debt gated por poblar el pool②, `DC-OQ-ENGINE-13`) — `StatusEngine` ya no existe.
- **Modelo de timeline (superposición de pulsos)** — el DoT-en-el-tiempo se parte en **agregación cerrada de pulsos declarados** (suelo C1, `total = Σ ticks×valor` + curva `DPS(t)`) vs **substrato steppeado / dedicado** (C2). El lado C1 (3a) está **CONSTRUIDO**: `formulas/status/dot-timeline.ts` (`pulseTotal`/`timelineByTick`), sin tocar el substrato. Las **5 fronteras** que fuerzan el substrato (Heat consolidado, coupling Viral-en-vivo/snapshot, pulsos-que-generan-pulsos, terminación por muerte/detonación, densidad→EV) + el hueco de Status Duration (A vs B, `OQ-ENGINE-18`) están estresadas y documentadas en `damage-status-model.md §Modelo de timeline` + `todo` en `__tests__/status/`. El substrato (3b) sigue gated por consumidor real.
- **Eje Población/RNG del DoT — generador wired al modelo unificado.** `esperado =
  forzado × chance × peso` con generador de eventos (2 niveles colapsados en una sola llamada vía
  identidad de Wald, agnóstico a DoT vs stack-debuff) — `damage-status-model.md §Población/RNG`.
  `formulas/status/proc-population.ts::expectedProcEvents` **cableado** vía `TimelineSimulator` →
  `effectOfDamageType` → `applyProc` (rutea al behavior de cada uno de los 6 efectos con LEY). Cada tick
  resuelve vía `CombatSimulator.resolveDamageEvent` (matriz③+DR; `as: DamageType` deriva las reglas del
  canónico — Slash emite `as:'true'`, bypasa matriz③+DR pero no el layer-mult de Viral). `dot-population.ts`
  quedó **huérfano** (el pulso se arma inline en `behaviors`; doble camino — deuda G3). **Sigue gated:**
  frontera 3 (Electricity/Gas, emisión multi-target de daño — cadena/nube; **NO recursión de procs**,
  descartada in-game 2026-07-14 — es cross-entity en la Resolución, no un ciclo), pool②/faction² del tick
  (build-debt, `DC-OQ-ENGINE-13`), generador discreto exacto de N proc-slots (`OQ-ENGINE-19`), cronograma
  real de disparos más allá del reloj steppeado de `TimelineSimulator`, extender el oráculo CLI a C2.
- **Facetas-LEY de Heat/Ignite** (DoT-tick Familia C + armor-strip por tiempo): **implementadas** como el `ignite` behavior (pool + rampa de armor por tiempo transcurrido); pendiente **la forma de la rampa**: el motor la aproxima con una curva lineal `0.5s→0…2s→50%` donde la fuente da cuatro escalones, no la revierte, y no la termina nunca — las tres, medidas y fijadas con `it.fails` en `__tests__/status/heat-armor-ramp.test.ts` (`domains/engine/status.md §Deudas`).
- **Magnetic ×3.25 vs ×4.25 (O4):** Disruption hereda Infection (×4.25) hasta verificar contra `/w/Magnetic_Damage` (hipótesis: 100% a Overguard cruza el dato). Tripwire en `__tests__/status/{stack-debuff-law,disruption}.test.ts`.

---

## Decisiones de Dominio (D-series)

Las secciones anteriores definen fronteras **arquitectónicas** — son invariantes que requieren
debate y autorización explícita para cambiar (equivalente a RED).

Las decisiones D-series que viven en `docs/domains/<dominio>/decisions.md` son un nivel distinto:
decisiones correctas hoy que pueden evolucionar con nueva evidencia sin fricción formal.

| Estado | Descripción | Protocolo de cambio |
|---|---|---|
| **VIGENTE** | Correcta hoy, evolucionable bajo nueva evidencia | Actualizar `decisions.md` + documentar motivo. Impacto GREEN (sube si toca TypeScript o arquitectura). |
| **DEFINITIVA** | Invariante del sistema, declarada explícitamente | Halt + debate + autorización. Mismo protocolo que las fronteras arquitectónicas de arriba. |

Por defecto, las D-series son **VIGENTES**. Solo se declara DEFINITIVA cuando la decisión
es un invariante real del sistema (ej: "los overrides viven en `Project/public/data/`").

Ref: `docs/CLAUDE.md` § "Regla de evolución de decisiones de dominio (D-series)"

---

## Decisiones Históricas (B1-B5)
> [!NOTE]
> Los debates pertenecientes a las fases de auditoría y cimentación inicial (B1 a B5) se consideran **CERRADOS**. Cualquier duda operativa sobre estas fases debe consultarse en `docs/governance/closed-decisions.md`.

## Uso de este documento
1. Identificar el área de trabajo.
2. Separar lo que ya no es negociable de lo que requiere diseño activo.
3. Si un punto Decidido genera bloqueo, registrar el gap técnico como nueva OQ en `open-questions.md` o como deuda en el `status.md` del dominio correspondiente.
