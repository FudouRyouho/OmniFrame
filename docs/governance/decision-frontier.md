---
Estado: "referencia"
Rol: "Separar lo ya decidido de lo que sigue en debate o solo sugerido"
Impacto_ID: "G-ADL-Frontier"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-24"
---

# Decision Frontier

Este documento marca la frontera de lo que ya no se debate porque ya tiene una solución arquitectónica cerrada o una decisión de compromiso aceptada.

## Fronteras de la Fase Actual

### 1. Motor de Simulación (Sim-v2)
**Decidido**:
- **Cierre del Modelo Lineal (B1-B4)**: Se abandona el modelo manual de 3 capas en favor de un **Motor de Simulación Sistémica** (Sim-v2).
- **Agnosticismo Total**: El motor es una pieza funcional, determinista y serializable (apto para Web Workers), completamente desacoplada de React.
- **Flujo A->B->C**: La jerarquía es **Intención (Ensemble) → Hidratación (Mutator Bridge) → Simulación (Engine)**.
- **Salida Única**: El motor emite un snapshot inmutable vía `consume().snapshot(): SimulationEntity[]` (salida de C).
- **Eliminación de `LoadoutProvider`**: `EnsembleStore` es el único SSoT de estado del usuario. Ver DC-OQ-STATE-1..4 en `closed-decisions.md`.
- **Frontera de dominios**: los dominios (`domains/*`) **no importan `@core`** (reafirma Restricción 1 de `Project/CLAUDE.md`). `@core` = dominio de lógica A/B/C; la UI y la Capa D (consumo derivado, `ViewModelContract`) cruzan por `@shared`. `consume()` = **salida de C** en `@core`, consumida por scripts/tests (no-dominios); **no es Capa D**. Oráculo de verificación = **CLI, no MCP** (MCP diferido). Ver [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §5-7.
- **`@providers → @core` PERMITIDO**: la capa de composición (`@providers`, adapter) **sí** importa `@core` — `EnsembleProvider` → `@core/intention/ensemble-store`. Adapter→core = dirección correcta de Ports&Adapters; la Restricción 1 protege a los dominios de feature, **no** a la capa de composición. **No contradice** la frontera anterior (`@providers` no es un dominio de feature). Ver `closed-decisions.md` (DC-OQ-ENGINE-9).
- **Estructura interna de `@core`**: `@core/{bridge (B), intention (A1), engine/{resolve (C1), simulate (C2), formulas, output, contracts, bootstrap, fixtures}}`; gemelo-de-entrada en `@shared/types/ensemble.ts`. Residual gated por D: eje (b) armonía harness/`output` (split de `fixtures/` hecho en Slice E). Ver `closed-decisions.md` (DC-OQ-ENGINE-9) y `open-questions.md` (OQ-ENGINE-9).

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
- **Tres capas separadas:** LEY (`formulas/status/`, pura) · ESTADO (`EnemyState.stacks`, portado-por-entidad) · RESOLUCIÓN (el pairing, `resolveHit`).
- **Familia A extraída** a `formulas/status/stack-debuff.ts` (Infection/Corrosion instanciadas; Disruption provisional=Infection). **LEY + ESTADO keyeados por EFECTO** (snake_case: corrosion/infection/ignite/disruption), no por tipo de daño.
- **Arista 1** (identidad tipo→proc, 1:1) resuelta = vocabulario en `semantic/damage-types.md` + runtime en `formulas/status/`.
- **Modelo unificado de proc — arquitectura RESUELTA ([`../domains/engine/design/damage-status-model.md §Modelo unificado de proc`](../domains/engine/design/damage-status-model.md)):** un contenedor de instancias de proc en el target + `EffectBehavior` por efecto (acumulación + emisión + modificador de resolución), reemplazando los 3 contenedores (`stacks`/`dot_pools`/`active_pulses`) + `StatusEngine` + `dot_key` + `DotType`. Ontología LOCKED (instancia/resolución/proc/tick), composición `snapshot × live` (el double-dip es su huella), resolución vía `as: DamageType` (deriva del canónico). **Cierra el "cómo estructurar C2"** de los bullets de abajo — lo que sigue gated son las FACETAS específicas (data/caso forzante), no la arquitectura. Residual `DotType`/`DOT_COEF` sin disolver (deuda G2).
- **La Instancia como objeto — el seam C1→C2 ([`../domains/engine/design/simulation-architecture.md §2.0.1`](../domains/engine/design/simulation-architecture.md)):** el trazado ①②③ se materializa en **un objeto Instancia construido una vez en el seam**, consumido por todos los proyectores de C2 (no re-derivado 3×). Principio **C1 COMPONE, C2 REALIZA**: C2 consume la salida de C1, no re-compone; **D consume la historia** del ciclo de vida (frame-0 = composición C1, deltas = realización C2). **Tres entradas:** Instancia (átomo per-evento ①②, target-agnóstica, congela valores+stamp) · Schedule (cadencia/fire-mode) · Target (③). El **contrato C1→C2** (emitir rico para C2) es el cimiento **simétrico al contrato de salida C2→D** (`DC-OQ-ENGINE-8`, ya cristalizado). Regla verificada por relectura del catálogo de deudas: la mayoría de las deudas del motor (re-implementación inline, 3× `chance×weight`, `elementBonusPct`, `resolveHit` ②③, contrato de salida) son **una sola deuda conceptual** que este objeto disuelve; lo que resta es dato (OQ-20/18/16) o ajeno a C (UI/vocabulario/intención).

**Abierto (gated — NO construir sin el caso real que lo fuerza):**
- **`DamageInstance` de primera clase + split ②③ — HECHO (verificado contra código).** El gate O5 original ("esperá al 1er daño-de-habilidad") se cerró: (a) la **Instancia-objeto** = `deriveInstance` (seam C1→C2, target-agnóstica, consumida por los 3 proyectores sin re-extraer); (b) la **resolución ③** (facción/DR/capa/stacks) ya vive limpia en `resolveDamageEvent`; `resolveHit` quedó como fan-out por tipo, no como colapso ②③.
  - **Drift restante (NO es `resolveHit`): `simulateAttack` god-function.** Fusiona ejecución del Hit (rolls multishot/crit) + ② + invocación de ③ + elección de paradigma (atómico vs bulk por `HYBRID_THRESHOLD` escondido). Es el eje 4 + eje 2 del cruce de `@core`.
  - **Dar a ② identidad-de-objeto (etapa COMPONE-TRAYECTO reutilizable) = GATED, no especulativo hoy.** Verificado contra código: NO hay abstracción nueva que aporte — el crit ya está centralizado en `crit-base` (una ley, dos llamadores, sin duplicación), el falloff tiene un solo hogar (`CombatCalculator`, gated por `OQ-ENGINE-7`), y la sinergia externa (Roar/Bane) que forzaría la etapa **no existe aún**. Construir `composeTrajectory` sin consumidor = la abstracción especulativa que [[feedback-reconciliar-no-gated-por-consumidor]] difiere. **Forcing-case natural:** la 1ª sinergia externa (Roar = ② source-side, llega con el source-state/Rhino+Roar) o falloff-en-timeline. Las habilidades (Toxic Lash, Xata's Whisper) = consumidor downstream, no gate.
  - **Opción C — separar el paradigma consecuencia/predictivo del Hit (`HYBRID_THRESHOLD` → decisión de proyección explícita) = MARCADA "tener en cuenta".** El eje 2 completo; el más invasivo y sin consumidor real hoy. NO se ejecuta; se re-abre si el source-state/timeline lo fuerza.
- **`neutral-state` como objeto derivado + `source-state` vivo — PROPUESTA SÓLIDA (horizonte validado, marcada hipótesis; NO frontera cerrada). Gate de construcción: primer buff/estado con duración del lado source.** El estado **no es propio de una entidad**: se modela un **`NeutralState` base (objeto-de-estado)** del que **derivan** los estados por naturaleza del nodo — source / target (`EnemyState`) / minion / object. Hoy hay asimetría real: el target tiene su columna (`EnemyState`), el source **no** — la Instancia se deriva CONTRA un source-state que hoy es `= la entity estática de C1` (funciona para arma sin buffs live). El concepto que enmarca esto —qué HACE una fuente (emite-instancia / muta-state / sub-source), la simetría ②/③ = derivar-contra-un-state, y la regla key-por-verbo del corpus— es la **hipótesis nodo-source** en [`../domains/engine/design/arch-decisions.md`](../domains/engine/design/arch-decisions.md) §15 (prototipo, se refuerza/cae con el test de Rhino+Roar). Plan de implementación: `.working/ability-model-debate.md §9` (gitignored).
  - **Consumidor-puente del refactor (no requiere modelar un minion):** la cadena `warframe → weapon → enemy` = **dos acumuladores vivos con un derive en el medio** (warframe-state: Roar/combo/energía · weapon: combo/spool/ammo + **punto de derive** de la Instancia · enemy-state: procs). Caso concreto **Rhino + Roar** (Roar = buff con duración = *este mismo gate*). Es el enunciado limpio de *"C1 compone contra el source-state, C2 realiza contra el target-state"*. El **derive cross-entity** (campo `source_entity` en `ModifierBase`, arista del grafo) y su **adaptador de dato** (`AbilityRepository` hidrata Roar desde `ability-stats.override`; `rhino.test.ts` `rhino_roar`, +127% al decimal) están **construidos** — pero son la **proyección ESTÁTICA** del source-state (Roar asumido-activo, sin duración). El **gate G-a sigue ABIERTO**: el source-state VIVO (duración/timeline, `NeutralState` base) no existe; el derive y su adaptador sí, el estado-con-vida no.
  - **Pregunta abierta (NO cerrada): ¿un state derivado es agnóstico a su nodo-madre? (`source→minion→instancia`).** Lean: agnóstico al **nodo** (sin ref viva hacia arriba del árbol), **NO** a la **lineage** — el **stamp** aplana la lineage a un valor `{ecosistema-id,…}` matcheado por id, nunca desreferenciado a objeto vivo. Hipótesis pendiente de un caso real que la estrese.
  - **La clase de re-composición = {CO dinámico, combo, buff vivo}** = *"un input de la composición de C1 cambió → C1 re-compone; full-vs-incremental es optimización"*. **`OQ-ENGINE-2` (profile switch) NO es de esta clase:** es cómputo **estático por perfil** (dos hidrataciones), sin necesidad de runtime-switch — ver `OQ-ENGINE-2` re-scopeada.
- **Contenedor de ESTADO entidad-neutral** (jugador self-status, companion) → **subsumido en el `neutral-state` derivado de arriba** (otra derivación del mismo objeto base). Gate propio: primera entidad no-enemigo que porte status. Deuda marcada en `EnemyState`.
- **Arista 2 (aplicación del proc):** spec `{forced_procs, status_chance}` (2a, C1-declarable) + el ROLL (2b, C2). El disparo desde la resolución YA existe (`TimelineSimulator` → `applyProc` vía `expectedProcEvents`, modelo unificado); lo gated es el ROLL exacto (2b) y `forced_procs` como spec.
- **Familia C (DoT-tick dependiente del daño del arma)** — **wired** en el modelo unificado: `formulas/status/dot-tick.ts` (`coef × modded_base × (1+own_element) × (1+status_damage)`) alimenta los DoT behaviors (bleed/poison/ignite); el `advance` emite y `resolveDamageEvent` resuelve (verificado en `__tests__/status/{dot-tick-law,slash,proc-model}`). **Sigue gated:** el `×(1+faction)²` (pool②/faction², mitad live, `OQ-ENGINE-20`) — `StatusEngine` ya no existe.
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
  (`OQ-ENGINE-20`, mitad live), generador discreto exacto de N proc-slots (`OQ-ENGINE-19`), cronograma
  real de disparos más allá del reloj steppeado de `TimelineSimulator`, extender el oráculo CLI a C2.
- **Facetas-LEY de Heat/Ignite** (DoT-tick Familia C + armor-strip por tiempo): **implementadas** como el `ignite` behavior (pool + rampa de armor por tiempo transcurrido); pendiente sólo **verificar la rampa** contra dato in-game (hoy es la curva 0.5s→0…2s→50% de la wiki, sin test que la fije).
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
