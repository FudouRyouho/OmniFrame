---
Estado: "referencia"
Rol: "Micro-arquitectura interna de C2 — modelo de daño elemental/status/DoT, verdictos de scope v1, primitivos reusables"
Version: "v0.1.0"
Impacto_ID: "E-C2-Damage"
Fidelidad_Fisica: "Project/src/core/engine/simulate/"
Fecha_de_creacion: "2026-07-02"
Fecha_de_actualizacion: "2026-07-02"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "references/wiki/mechanics/status-effects.md"
  - "references/wiki/mechanics/damage-types.md"
  - "references/wiki/mechanics/enemy-resistances.md"
  - "references/wiki/mechanics/faction-damage.md"
---

# Modelo de Daño y Status — C2

## Rol y alcance

C2 (simulación de combate) existía como nombre en el modelo de capas (`simulation-architecture.md`) pero nunca tuvo diseño interno — el código de abril 2026 (`CombatSimulator`/`TimelineSimulator`/`EnemyState`) fue escrito sin corpus, sin consumidor, y sin verificación (confirmado: cero tests hasta esta campaña). Este documento es el resultado de diseñarlo desde cero: **micro-arquitectura interna de una capa**, no una decisión de arquitectura de `@core` (eso sigue viviendo en `arch-decisions.md`) y no un schema de dato nuevo — es más pesado que ambos, tiene bordes de dependencia reales hacia "0" (datos de enemigo), hacia C1 (el grafo de atributos, en el punto donde el crit condicional necesita engancharse) y hacia una brecha real ya encontrada en `EnemyState` (ver más abajo).

**Proceso seguido** (campaña 2026-07-02, sesión post-saneamiento de `@core`): recabar (capturar mecánica real → `references/wiki/mechanics/`) → modelar la base (este documento) → estresar (verificación empírica in-game, ver citas inline) → bajar a docs (acá) → plan de slices (siguiente sesión, no ejecutado todavía).

**Principios de modelado acordados** (no re-litigar sin motivo nuevo):
- La unidad de decisión es la **faceta**, no el proc entero — un proc puede tener partes que entran a v1 y partes que no.
- La precisión es un **presupuesto**, no una meta — granularidad decidida por mecánica, no una regla global.
- No se audita el código de abril como baseline — es hipótesis a verificar, igual que cualquier otra fuente.

---

## El primitivo reusable: stack tracker

Confirmado como el mismo mecanismo subyacente en **Viral** (verificado empíricamente con precisión <0.2% en múltiples stacks), **Magnetic** (mismo lenguaje de stacking + confirmado por observación directa en vivo, Kuva Nukor: decaimiento 6→5→4→...→0 stack por stack) y **Corrosive** (cerrado por analogía estructural — mismo texto "replace the oldest stack" que Viral/Magnetic).

**Comportamiento del primitivo:**
- N stacks activos, cada uno con **timer independiente** (duración propia por tipo — tabla completa en `references/wiki/mechanics/status-effects.md` §Duración).
- Cap K por tipo (10 para la mayoría; 5 para Impact/Puncture).
- Sobre-cap: **reemplaza al stack más viejo**.
- El modificador resultante es `f(stacks_activos_en_este_instante)`.
- **Excepción**: Heat consolida sus procs en un **pool único compartido** (no instancias independientes) — no usa este primitivo, necesita uno propio (ver §Heat).

**Orden de resolución confirmado empíricamente (precisión 0.004%, ver detalle en `status-effects.md` §Infection):** el daño de un hit se calcula con el conteo de stacks que existía **antes** de que ese mismo hit aplique su propio proc nuevo — no con el conteo posterior. Relevante para cómo el engine debe secuenciar: resolver daño con el estado actual → recién después sumar el stack nuevo para hits futuros.

**Multi-objetivo espacial no es una decisión de infraestructura.** La cadena de Electricity y la nube de Gas son un filtro `distancia_al_origen ≤ radio` — no dependen de si el escenario simulado tiene 1 o N enemigos: con 1 enemigo el filtro simplemente no encuentra a nadie más. No hace falta "decidir si v1 soporta multi-enemigo" antes de construirlo (corrección de debate 2026-07-02 — el encuadre inicial de "gate" era un error). Confirmado además que el mecanismo es real, no hipotético: capturas de pantalla muestran el mismo tick de Electricity apareciendo simultáneo en múltiples enemigos (ver `status-effects.md` §Electricity DoT, con caveat de pasiva de arma específica en la prueba).

---

## Reglas de composición confirmadas

1. **True Damage bypasa la reducción de armor, NO los multiplicadores de capa.** Confirmado empíricamente (Dorrclave, Slash puro, vs Arid Butcher nivel 210: tick de Bleed amplificado por Viral con <0.2% de error en 3 stacks distintos). "Ignora armor" ≠ "inmune a todo lo demás" — es el boundary case que valida el resto del pipeline de composición.
2. **El faction bonus double-dipea en 5 DoTs**: Slash, Heat, Toxin, Gas (confirmado por cita textual de wiki), Electricity (confirmado empíricamente: ×2.3889 observado vs ×2.4025 predicho por `(1+faction)²`, descartando single-dip). La lista "afectados" de la página general de Faction Bonus estaba incompleta — no tratar ninguna lista de la wiki como exhaustiva sin cruzarla.
3. **El crit se apila limpio con los multiplicadores de stack** (confirmado dos veces, Dual Toxocyst y Dorrclave) — son factores independientes, sin interacción rara.
4. **Roar/buffs de habilidad NO se modelan en esta campaña** — evidencia (×3.4 observado contra ×1.85 nominal) sugiere un mecanismo de composición distinto ("instancia separada" vs "multiplicador limpio", término de comunidad: "cálculo cuadrático"). Pertenece a Capa 5 (scaling de habilidades, ya fichada como diferida en `test/gap-map.md`) — no bloquea nada de este modelo.

---

## Veredictos por tipo — v1 (resumen)

| Tier | Tipos | Qué entra |
|---|---|---|
| **Núcleo, completo** | Slash, Toxin, Viral, Corrosive | Todas sus facetas, sin recortes — verificadas empíricamente |
| **Multiplicador/bonus, mismo primitivo** | Magnetic (multiplicador shields/Overguard), Puncture (crit chance +5%/stack), Cold (crit damage +0.1×/+0.05× por stack) | El primitivo de stack ya existe (§ arriba); estos solo lo consumen desde un punto distinto del pipeline (crit calc en vez de resolución de daño por capa) |
| **Tick sí, faceta cross-cutting deferida** | Heat (DoT sí; rampa de armor strip diferida — necesita timeline real, pool consolidado no independiente), Electricity (tick+cadena, **sin gate**, ver primitivo arriba), Gas (tick+nube, **sin gate**) | |
| **Diferido completo, necesita timeline real** | Blast (10 fusas independientes con timing propio + AoE) | Complejidad genuina, no espacial — candidato de revisión cuando exista simulación temporal real |
| **Diferido, cross-cutting de baja prioridad** | Tau (modifica el status chance efectivo de TODOS los demás procs contra ese target — misma clase de complejidad que el strip de armor, pero con fuente muy restringida: Sentients/Archons) | Revisar si se modela contenido de Archon específico |
| **Scope-out — dato/entidad ausente** | Radiation (`Enemy.json` no tiene daño/ataque propio del enemigo en ningún campo — bloqueo de dato, no de prioridad), Void (además del dato de adaptación de Sentients ausente, Operador/Amp ni siquiera son un tipo de entidad en el DNA/ItemRepository actual) | No es un scope-choice, es un piso ausente |
| **Fuera del scope del calculador** | Impact (todas sus facetas: CC sin número, o atadas a Mercy/finisher — acción de combate distinta a resolver daño), y las facetas de survivability/CC de Puncture (reducción de daño enemigo saliente), Cold (slow), Magnetic (negación de regen, bonus Overguard, Nullifiers), Heat (Panic), Blast (stagger propio) | Miden "daño recibido por el jugador" o CC puro — eje que OmniFrame no calcula hoy, no es prioridad baja, es otra pregunta |

**True Damage** no es una ficha para implementar — es la regla de composición #1 de arriba, ya encodeada en cómo debe resolver el pipeline.

---

## Detalle por ficha

### Slash — Bleed
`tick = 0.35 × modded_base_damage × (1+faction)² × (1+status_damage)`, tipo True, 6 ticks/6s, timer independiente sin cap. Sin dependencias cruzadas propias. Confirmado empíricamente incluyendo su interacción con Viral (ver regla de composición #1).

### Toxin — Poison
`tick = 0.5 × modded_base_damage × (1+toxin) × (1+faction)² × (1+status_damage)`, bypasa shields no Overguard (el engine ya tiene la rama `isBypassingShields` en `CombatSimulator`), timer independiente sin cap.

### Viral — Infection
`multiplier = 2+0.25×(n-1)` sobre daño de capa-salud, incluye True (confirmado). Seam de código ya funcionando: `getDamageMultiplier(hitsShields=false)` (Fase 3 del saneamiento de `@core`, mismo bug fix que originó esta campaña). Orden de resolución confirmado (ver primitivo arriba).

### Corrosive — Corrosion
`strip(n) = min(0.26+0.06×(n-1), 0.80)`, timer de 8s por stack, sin rampa de reversión (discreto: un stack expira, se recalcula con `n-1`). `EnemyState.getEffectiveArmor()` ya combina parcialmente Corrosive+Heat.

### Magnetic — Disruption
Entra: `multiplier = 2+0.25×(n-1)` sobre daño a shields/Overguard, mismo seam que Viral (`getDamageMultiplier(hitsShields=true)`). Diferido: negación de recarga de shields (no simulamos regen), bonus Electricity al romper Overguard (evento puntual, complejidad moderada para caso de borde), extra-efectividad vs Nullifiers (nicho).

### Puncture — Weakened
Entra: +5%/stack de crit chance del jugador contra el target (hasta +25% a 5 stacks), no aplica a AoE/habilidades. Consume el primitivo de stack, se engancha en el cálculo de crit chance (`AtomicSimulator`/`CombatSimulator`, punto distinto al de resolución de daño por capa). Diferido: reducción de daño saliente del enemigo (mide daño recibido por el jugador, eje fuera de scope).

### Cold — Freeze
Entra: bonus de crit damage recibido, +0.1× (1er stack) +0.05×/stack adicional (hasta +0.5× a 9), mismo mecanismo que Puncture aplicado a otra stat — construir juntos. Cap especial: bosses/Overguard solo aceptan 4 stacks. Diferido: slow (survivability), freeze sólido al 10º (CC).

### Heat — Ignite
Entra: tick DoT, `0.5 × modded_base × (1+heat) × (1+faction)² × (1+status_damage)`, **pool consolidado compartido** (no timer independiente por stack — única excepción al primitivo). Diferido: rampa de armor strip (0.5s→15%...2s→50%, reversión gradual 1.5s/6s) — única mecánica de las 16 que necesita timeline real genuino, no un contador. Fuera de scope: Panic (CC).

### Electricity — Tesla Chain
Entra completo: tick DoT (double-dip confirmado empíricamente) + cadena a enemigos en radio 3m (sin gate, ver primitivo arriba; multi-objetivo confirmado por captura de pantalla). Fuera de scope: stun (CC fijo, sin número).

### Gas — Gas Cloud
Entra completo: tick DoT + nube en radio creciente con stacks (3m base, +0.3m/stack hasta 6m a 10) — mismo filtro espacial trivial que Electricity, sin gate.

### Blast — Detonation
Diferido completo. Complejidad real: 10 fusas independientes de 1.5s cada una, detonación en masa (300%/stack, cap 3000%, radio 5m) al 10º stack o al morir el target. El radio de la detonación es trivial (mismo primitivo espacial); lo caro es el timing concurrente de 10 fusas — necesita timeline real, igual que Heat.

### Tau — Status Vulnerability
Diferido. Cross-cutting (+10%/stack de status chance recibida por el target, hasta +100%, modifica el roll de TODOS los demás procs contra ese target) — misma clase de complejidad de pipeline que el strip de armor, con fuente muy restringida (Sentients/Archons/pocos ítems de jugador). Revisar si se modela contenido de Archon específico.

### Radiation — Confusion
**Scope-out, bloqueo de dato, no de prioridad.** La faceta de daño redirigido (confundido ataca a sus aliados con +100%→+550%) necesita "cuánto daño hace el ataque del enemigo" — campo que no existe en `Enemy.json` ni en ningún punto del pipeline. Sin ese dato, no hay número que mover, con o sin IA de targeting.

### Void — Bullet Attraction
**Scope-out, doble bloqueo.** El reset de damage adaptation de Sentients depende de un sistema (adaptación) inexistente en el corpus. Y más profundo: las fuentes de daño Void (Operador/Amp/Xaku) no son un tipo de entidad modelado en el DNA/`ItemRepository` actual — falta la entidad antes de discutir la mecánica.

### Impact — Stagger
**Fuera del scope del calculador.** CC puro (sin número, salvo simular interrupción de fuego enemigo — eje que el proyecto no toca) o atado a Mercy/finisher (acción de combate distinta a resolver daño, no "Impact de baja prioridad" sino "Impact sin faceta que compita por entrar").

### True Damage
Ver regla de composición #1. No es una ficha de implementación — es la regla que valida el resto.

---

## Estado real de `EnemyState.ts` vs. este modelo — brecha encontrada al verificar (2026-07-02)

**Lo que ya está resuelto** (Fase 3 pieza 3 del saneamiento de `@core`, commit `98ef01b`, previo a esta campaña): el rename de vocabulario legacy `damage_*_proc`→`damage_*_dot` (coincide con `dot_pools`) y el bug de `getDamageMultiplier` (comparaba un token D-6 contra strings legacy, nunca matcheaba — el multiplicador de Viral/Magnetic quedaba inerte en toda resolución real). Ya corregido a `getDamageMultiplier(hitsShields: boolean)`, exactamente la forma que la regla de composición #1 de este documento confirma.

**Lo que NO está resuelto — brecha real entre el código existente y el modelo validado esta sesión:** `EnemyState.processDots()` decae `stacks` y `dot_pools` con una fórmula de **decaimiento lineal continuo** sobre una constante `duration = 6.0` fija (`stacks[k] -= (stacks[k]/duration)×dt`, `dot_pools[type] -= (dps/duration)×dt`) — un **pool único que se consume gradualmente**, no el primitivo de **N timers independientes por stack** que este documento valida empíricamente (Viral: conteo entero de stacks, cada uno expirando por separado, "reemplaza al más viejo" sobre el cap). Es el mismo error de fondo que el bug ya corregido: código de abril escrito sin corpus, que hoy sabemos que no coincide con la mecánica real. Afecta a `stacks` (Corrosive/Viral/Magnetic — deberían ser N timers independientes, hoy son un valor que decae suave) y a `dot_pools` (Slash/Toxin deberían tickear como instancias independientes; solo Heat debería consolidarse en un pool compartido, y hoy los tres comparten el mismo modelo de pool). **No se toca en esta sesión** (esto es modelado, no implementación) — queda para el plan de slices, con esta brecha ya documentada para no volver a descubrirla de cero.

## Pregunta abierta

Ver **`OQ-ENGINE-12`** en `docs/governance/open-questions.md` — cuándo se cablea el consumo del primitivo de stack en el pipeline de crit (Puncture/Cold). El primitivo en sí ya está modelado (no es la pregunta); lo que falta decidir es el timing de construir ese punto de enganche específico.

## Fuentes

- `references/wiki/mechanics/status-effects.md` — fórmulas, duración, caps, verificación empírica completa
- `references/wiki/mechanics/damage-types.md` — familias, combinación elemental, regla de elección de proc
- `references/wiki/mechanics/enemy-resistances.md` — matriz facción×elemento (era U36), DR de armor enemigo
- `references/wiki/mechanics/faction-damage.md` — faction bonus, double-dip
- `docs/domains/engine/test/gap-map.md` — Capa 5 (scaling de habilidades), contexto de por qué Roar queda fuera
