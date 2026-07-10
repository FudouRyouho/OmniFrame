---
Estado: "referencia"
Rol: "Micro-arquitectura interna de C2 — modelo de daño elemental/status/DoT, verdictos de scope v1, primitivos reusables"
Version: "v0.3.3"
Impacto_ID: "E-C2-Damage"
Fidelidad_Fisica: "Project/src/core/engine/simulate/"
Fecha_de_creacion: "2026-07-02"
Fecha_de_actualizacion: "2026-07-09"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "references/wiki/mechanics/status-effects.md"
  - "references/wiki/mechanics/damage-types.md"
  - "references/wiki/mechanics/faction-damage.md"
---

# Modelo de Daño y Status — C2

## Rol y alcance

C2 (simulación de combate) existía como nombre en el modelo de capas (`simulation-architecture.md`) pero nunca tuvo diseño interno. Este documento es esa micro-arquitectura: el modelo de daño elemental/status/DoT, los verdictos de scope para v1, y el primitivo reusable. Es un **prototipo de primera pasada** — no un contrato cerrado.

La **evidencia empírica** (verificaciones in-game, fórmulas por tipo, caps, duraciones) vive en `references/wiki/mechanics/`. Este documento **cita** esa evidencia, no la reproduce.

Dos principios de modelado gobiernan los verdictos de abajo:
- La unidad de decisión es la **faceta**, no el proc entero — un proc puede tener partes que entran a v1 y partes que no.
- La precisión es un **presupuesto**, no una meta — la granularidad la decide la mecánica, no una regla global.

---

## El primitivo reusable: stack tracker

**Comportamiento:**
- N stacks activos, cada uno con **timer independiente** (duración propia por tipo — tabla en `status-effects.md` §Duración).
- Cap K por tipo (10 para la mayoría; 5 para Impact/Puncture; 4 en bosses/Overguard para Cold).
- Sobre-cap: **reemplaza al stack más viejo**.
- El modificador resultante es `f(stacks_activos_en_este_instante)`.

Confirmado como el mismo mecanismo en Viral, Magnetic y Corrosive (detalle y citas en `status-effects.md` §Stacks e §Infection).

**Excepción — Heat:** consolida sus procs en un **pool único compartido**, no instancias independientes. No usa este primitivo (ver §Heat).

**Orden de resolución:** el daño de un hit se calcula con el conteo de stacks que existía **antes** de que ese mismo hit aplique su propio proc — no con el conteo posterior. Secuencia para el engine: resolver daño con el estado actual → recién después sumar el stack nuevo para hits futuros.

**Multi-objetivo espacial** (cadena de Electricity, nube de Gas): es un filtro `distancia_al_origen ≤ radio`. No requiere infraestructura previa ni extender `Enemy` — cuando exista un entorno simulado es un tablero 2D (posición absoluta) y N enemigos son N instancias del mismo objeto. Con 1 enemigo el filtro no encuentra a nadie más. No bloquea el modelado de las fichas.

---

## Reglas de composición

1. **True Damage bypasa la reducción de armor, NO los multiplicadores de capa.** "Ignora armor" ≠ "inmune a todo lo demás": el tick True de Bleed sigue siendo daño de capa-salud a efectos de Viral, que lo amplifica. (Evidencia: `status-effects.md` §Bleed.)
2. **El faction bonus double-dipea en 5 DoTs**: Slash, Heat, Toxin, Gas, Electricity — `(1+faction)²` efectivo. La lista "afectados" de la página general de Faction Bonus estaba incompleta; no tratar ninguna lista de wiki como exhaustiva sin cruzarla. (Evidencia: `faction-damage.md`, `status-effects.md` §Electricity DoT.)
3. **El crit se apila limpio con los multiplicadores de stack** — factores independientes, sin interacción rara.

> **Roar double-dipea — CONFIRMADO (2026-07-08, test in-game; ver §Evidencia).** `OQ-ENGINE-13` respondida:
> los buffs de daño-final tipo Roar caen en el **mismo bucket aditivo** que los mods de facción (Expel/Bane)
> y double-dipean igual. NO están "fuera de estas reglas" — son parte del bucket que se dobla.

### Evidencia empírica — el double-dip es del bucket ②, no de "faction" ni de ③ (2026-07-08)

Tests in-game (Akvasto Prime, Slash 169.4; hit **no-crit** al cuerpo; Roar +112.8%; Expel rank 5 +30%;
target **lvl 215 normal**, sin Steel Path). Formato de celda: `Slash directo → tick de DoT`.

| Condición | vs Arid Butcher (Grineer, Slash-neutral) | vs Charger (Infested, Slash-vulnerable ×1.5) |
|---|---|---|
| base (sin buffs) | 160 → **39**  | 287 → **39**  |
| + Expel          | 208 → **66**  | 373 → **66**  |
| + Roar           | 340 → **175** | 611 → **175** |
| + Expel + Roar   | 388 → **228** | 697 → **228** |

**Ratios sobre el base — qué muestran:**
- **Hit directo:** Expel `×1.30`, Roar `×2.128`, **ambos `×2.428`** = `1 + 0.30 + 1.128` → **ADITIVO** (no
  multiplicativo, que daría ×2.766). Expel (mod de facción) y Roar (buff de habilidad) comparten un **bucket
  aditivo "final-damage bonus"** (bucket **②** del trazado, `simulation-architecture.md §2.0`).
- **Tick de DoT:** el MISMO bucket **al cuadrado** — Expel `×1.69=(1.30)²`, Roar `×4.53=(2.128)²`, ambos
  `×5.90=(2.428)²`. → **double-dip = el bucket ② elevado al cuadrado** para instancias damage-DoT. Cada
  fuente double-dipea sola (Expel sin Roar ya da ×1.69).
- **La matriz ③ del target NO toca el bleed de Slash:** los DoT son **idénticos** (39/66/175/228) entre el
  Grineer (neutral) y el Infested (Slash ×1.5), aunque los hits difieren — porque el bleed es **True** (bypasa
  resistencias y armor). El double-dip ocurre **con ③ totalmente bypasseado** → es fenómeno de **②, no de ③**
  (la matriz sí toca el **hit** directo: 287 vs 160).

**Refina la regla #2:** el double-dip pertenece al **bucket ② de bonos de daño-final** (mods de facción +
buffs de habilidad, aditivos entre sí), no a "faction" a secas ni a la matriz ③. El `(1+faction)²` de §Detalle
es el caso particular "bucket = sólo faction"; la lectura general es **`(1 + Σ bucket②)²`**.

**Eje ③ CERRADO (2026-07-08, DoT no-True).** Tests con Akvasto Prime (mods 60/60 → elemento 66, Slash 77,
total 176) vs **Charger (Infested)**: Toxin es **neutral ×1.0**, Heat **vulnerable ×1.5** — misma base y
coeficiente (0.5), así que el ratio Heat/Toxin **aísla la matriz**. Charger sin armadura → sin confound de DR.

| Buffs | Toxin DoT (neutral) | Heat DoT (vuln ×1.5) | Heat / Toxin |
|---|---|---|---|
| base   | 89  | 133 | ×1.49 |
| +Expel | 150 | 225 | ×1.50 |
| +Roar  | 400 | 600 | ×1.50 |
| +ambos | 521 | 781 | ×1.50 |

- **La matriz ③ SINGLE-dipea:** Heat/Toxin = **×1.5 constante** (no ×2.25) en todo nivel de buff → la matriz
  se aplica **una** vez al DoT no-True (igual que al hit), NO se dobla.
- **El bucket ② sigue doblando** en ambos (Toxin y Heat: ×1.69 / ×4.53 / ×5.90 sobre su base).

**Modelo completo — lo ÚNICO que double-dipea es el bucket ②.** La matriz ③ single-dipea cuando aplica; True
la bypasea (Slash bleed); la DR single-aplica (no-True) o se bypasea (True). Fórmula general del tick:

```
DoT no-True (Toxin/Heat/Gas/Elec):  0.5  × modded_base × (1+status_damage) × matriz(elem,facción) × (1+Σbucket②)²
DoT True (Slash bleed):             0.35 × modded_base × (1+status_damage) ×          [bypass ③]     × (1+Σbucket②)²
```

Los `(1+faction)²` de §Detalle se leen bajo esto: `faction` = el **bucket ②** (mods de facción + buffs), que
sí se dobla; la **matriz del target es aparte** y single-dipea. Datos crudos de todos los tests: `.working/double-dipping-test.md`.

### Reconciliación de `resolveHit` — Checkpoint 1 COMPLETO (2026-07-09)

La matriz ③ ya vive en `resolveHit` (`CombatSimulator.ts`), vía `targetFactionMult(token, faction)`
(`contracts/damage-multipliers.ts` — accessor co-locado con el dato `FACTION_BONUS`, NO en `formulas/`:
es lookup, no cómputo). Reemplaza el lookup muerto `DAMAGE_EFFICIENCY[type]?.[healthType/armorType/
shieldType]` — inerte desde siempre porque `EnemyRepository.load()` rellena esos `*_type` con defaults
que no matchean ninguna clave. Estresado con test real: `__tests__/target-faction-matrix.test.ts`,
Charger (Infested, armor=0, shields=0, aísla la matriz) — Heat/Toxin ratio = **1.5 exacto**, contra el
1.0 (inerte) previo al fix. `EnemyDNA.*_type` queda **candidato a sunset** — pendiente autorización RED
separada (son campos de contrato), no se tocan en este checkpoint.

### Reconciliación de `resolveHit` — Checkpoint 2 COMPLETO (2026-07-09)

DR de `resolveHit` reconciliada a `formulas/enemy/armor-mitigation.ts::damageReductionFromArmor`
(`√3a/100`, la misma fórmula que P1 ya validó contra el calculador wiki) — reemplaza la vieja
`netArmor/(netArmor+300)`. **Sunset del `armorBypass`-por-elemento:** sin evidencia post-U36 de que un
elemento "ignore" parte de la armor (`enemy-resistances.md` documenta bypasses fijos y mecánicos —
Toxin/Slash-bleed/Magnetic/Viral — no "por fuerza del elemento contra armor"); era artefacto del modelo
per-clase muerto, se elimina en vez de migrar. **No cierra `OQ-ENGINE-15`** (conflicto de 3 fórmulas de
DR en la wiki) — sólo fuerza consistencia con la fórmula que el proyecto ya eligió en P1.

Estresado con test real: `__tests__/resolvehit-dr.test.ts`, Arid Butcher @215 (armor=200, Toxin bypasa
shields para aislar la capa salud+armor) — 100 dmg → **75.51** de daño a salud (DR 24.49%), contra 60
(DR 40%, vieja fórmula) previo al fix.

Ambos checkpoints (matriz③ + DR) verificados sin regresiones: suite 175 passed / 1 expected fail / 25
todo, `tsc` limpio; `enemy-state-status-multiplier.test.ts` y `enemy-scaling.test.ts` corridos aparte y
confirmados verdes.

**Checkpoint 3 (bucket② double-dip en DoT) — re-escopeado a exploración/documentación, sin código esta
vuelta.** El tick de DoT se computa en `StatusEngine.{projectSlashTick,projectHeatTick,projectToxinTick}`
(vía `CombatCalculator.project` ← `TimelineSimulator`), funciones que **no reciben el target** — cero
matriz③ modelada ahí. Ya existe un `faction_mult` (de un attr `FACTION_DAMAGE` del lado del arma) aplicado
**sin elevar al cuadrado**, pese a que el comentario del código dice `"Faction^2"` (`StatusEngine.ts`
líneas 45/62) — bug de comentario-vs-implementación ya presente, independiente de este trabajo. Conectar
bucket②+matriz③ ahí exige cambiar firma de 3 funciones + 2 llamadores — unidad de trabajo separada, con
su propio debate/plan.

**Refinado (verificación de estabilidad, 2026-07-09) — falta un tercer término, no sólo dos.** Cruzando
`StatusEngine.ts` contra la fórmula formal de `references/wiki/mechanics/status-effects.md` (patrón
general de los 5 DoTs: `tick = coef × modded_base × (1+propio_elemento) × (1+faction) × (1+status_damage)
× extras`), el código no sólo tiene matriz③ ausente y bucket② sin cuadrado — **le falta por completo el
término `(1+status_damage)`** (ej. Viral amplificando un tick de Slash/Toxin). Los tres términos están
**cross-validados** (wiki formal + `damage-status-model.md §Evidencia` propio) — esto es nivel de
**implementación pura**, no de investigación: no hay ambigüedad que estresar, sólo falta escribir los
tres factores. Fórmula objetivo completa:

```
DoT no-True (Toxin/Heat/Gas/Elec):  0.5  × modded_base × (1+status_damage) × matriz(elem,facción) × (1+Σbucket②)²
DoT True (Slash bleed):             0.35 × modded_base × (1+status_damage) ×          [bypass ③]     × (1+Σbucket②)²
```

(mismas fórmulas de §Evidencia arriba — la referencia formal de la wiki las confirma independientemente).
Anclado en `status.md §Deudas` (`GAMEPLAY_MULT_FACTION_DAMAGE`). Al implementar: **seguir el patrón de
`resolveHit`** (accessor dedicado por naturaleza), no agregar los términos inline en `StatusEngine`.

---

## Veredictos por tipo — v1 (resumen)

| Tier | Tipos | Qué entra |
|---|---|---|
| **Núcleo, completo** | Slash, Toxin, Viral, Corrosive | Todas sus facetas, sin recortes |
| **Multiplicador/bonus, mismo primitivo** | Magnetic (multiplicador shields/Overguard), Puncture (crit chance +5%/stack), Cold (crit damage +0.1×/+0.05× por stack) | El primitivo de stack ya existe; estos lo consumen desde un punto distinto del pipeline (crit calc en vez de resolución por capa) |
| **Tick sí, faceta cross-cutting deferida** | Heat (DoT sí; rampa de armor strip diferida — necesita timeline real, pool consolidado) | |
| **Completo, sin gate** | Electricity (tick + cadena), Gas (tick + nube) | Multi-objetivo = filtro espacial trivial (ver primitivo) |
| **Diferido completo, necesita timeline real** | Blast (10 fusas independientes con timing propio + AoE) | Complejidad genuina, no espacial |
| **Diferido, cross-cutting de baja prioridad** | Tau (modifica el status chance efectivo de todos los demás procs contra el target) | Fuente muy restringida (Sentients/Archons) |
| **Scope-out — dato/entidad ausente** | Radiation (`Enemy.json` no tiene daño de ataque propio del enemigo), Void (falta adaptación de Sentients + Operador/Amp no son entidad en el DNA/ItemRepository) | Piso ausente, no scope-choice |
| **Fuera del scope del calculador** | Impact (CC/Mercy), y las facetas de survivability/CC de Puncture, Cold, Magnetic, Heat, Blast | Miden "daño recibido por el jugador" o CC puro — eje que OmniFrame no calcula hoy |

**Evidencia por tipo** (no todos tienen el mismo tipo de respaldo):
- **Test propio in-game:** Slash, Viral, Electricity (double-dip).
- **Subpágina wiki** (test superficial coincidente con el pool inicial): Toxin, Heat, Gas.
- **Analogía estructural** (mismo "replace the oldest stack" que Viral/Magnetic): Corrosive.

Detalle en `references/wiki/mechanics/status-effects.md`.

**True Damage** no es una ficha para implementar — es la regla de composición #1, ya encodeada en cómo debe resolver el pipeline.

---

## Detalle por ficha

### Slash — Bleed
`tick = 0.35 × modded_base_damage × (1+faction)² × (1+status_damage)`, tipo True, 6 ticks/6s, timer independiente sin cap. Sin dependencias cruzadas propias.

### Toxin — Poison
`tick = 0.5 × modded_base_damage × (1+toxin) × (1+faction)² × (1+status_damage)`, bypasa shields no Overguard (rama `isBypassingShields` ya en `CombatSimulator`), timer independiente sin cap.

### Viral — Infection
`multiplier = 2+0.25×(n-1)` sobre daño de capa-salud, incluye True. Seam ya funcionando: `getDamageMultiplier(hitsShields=false)`. Orden de resolución: ver primitivo.

### Corrosive — Corrosion
`strip(n) = min(0.26+0.06×(n-1), 0.80)`, timer de 8s por stack, sin rampa de reversión (discreto: un stack expira, se recalcula con `n-1`). `EnemyState.getEffectiveArmor()` ya combina parcialmente Corrosive+Heat.

### Magnetic — Disruption
Entra: `multiplier = 2+0.25×(n-1)` sobre daño a shields/Overguard, mismo seam que Viral (`getDamageMultiplier(hitsShields=true)`). Diferido: negación de recarga de shields (no simulamos regen), bonus Electricity al romper Overguard (evento puntual), extra-efectividad vs Nullifiers (nicho).

### Puncture — Weakened
Entra: +5%/stack de crit chance del jugador contra el target (hasta +25% a 5 stacks), no aplica a AoE/habilidades. Consume el primitivo de stack, se engancha en el cálculo de crit chance (punto distinto al de resolución por capa — ver OQ-ENGINE-12). Diferido: reducción de daño saliente del enemigo (eje fuera de scope).

### Cold — Freeze
Entra: bonus de crit damage recibido, +0.1× (1er stack) +0.05×/stack (hasta +0.5× a 9), mismo mecanismo que Puncture — construir juntos. Cap especial: bosses/Overguard solo aceptan 4 stacks. Diferido: slow (survivability), freeze sólido al 10º (CC).

### Heat — Ignite
Entra: tick DoT, `0.5 × modded_base × (1+heat) × (1+faction)² × (1+status_damage)`, **pool consolidado compartido** (única excepción al primitivo). Diferido: rampa de armor strip (0.5s→15%…2s→50%, reversión gradual) — única mecánica de las 16 que necesita timeline real genuino. Fuera de scope: Panic (CC).

### Electricity — Tesla Chain
Entra completo: tick DoT (double-dip) + cadena a enemigos en radio 3m (filtro espacial, ver primitivo). El tick propagado a los encadenados usa el daño base del hit, no hereda la instancia crítica. Fuera de scope: stun (CC fijo, sin número).

### Gas — Gas Cloud
Entra completo: tick DoT + nube en radio creciente con stacks (3m base, +0.3m/stack hasta 6m a 10) — mismo filtro espacial que Electricity.

### Blast — Detonation
Diferido completo. 10 fusas independientes de 1.5s cada una, detonación en masa (300%/stack, cap 3000%, radio 5m) al 10º stack o al morir el target. El radio es trivial; lo caro es el timing concurrente de 10 fusas — necesita timeline real, igual que Heat.

### Tau — Status Vulnerability
Diferido. Cross-cutting (+10%/stack de status chance recibida por el target, hasta +100%, modifica el roll de todos los demás procs) — misma clase de complejidad que el strip de armor, con fuente muy restringida (Sentients/Archons/pocos ítems).

### Radiation — Confusion
**Scope-out, bloqueo de dato.** La faceta de daño redirigido necesita "cuánto daño hace el ataque del enemigo" — campo que no existe en `Enemy.json` ni en el pipeline. Sin ese dato no hay número que mover.

### Void — Bullet Attraction
**Scope-out, doble bloqueo.** El reset de damage adaptation de Sentients depende de un sistema (adaptación) inexistente en el corpus. Y las fuentes de daño Void (Operador/Amp/Xaku) no son un tipo de entidad modelado en el DNA/`ItemRepository`.

### Impact — Stagger
**Fuera del scope del calculador.** CC puro (sin número, salvo simular interrupción de fuego enemigo) o atado a Mercy/finisher (acción de combate distinta a resolver daño).

### True Damage
Ver regla de composición #1. No es una ficha de implementación — es la regla que valida el resto.

---

## Estado real de `EnemyState.ts` vs. este modelo — brecha encontrada

**Ya resuelto** (Fase 3 pieza 3 del saneamiento de `@core`, commit `98ef01b`, previo a esta campaña): el rename de vocabulario legacy `damage_*_proc`→`damage_*_dot` y el bug de `getDamageMultiplier` (comparaba un token D-6 contra strings legacy, nunca matcheaba — el multiplicador de Viral/Magnetic quedaba inerte). Ya corregido a `getDamageMultiplier(hitsShields: boolean)`, la forma que la regla de composición #1 confirma.

**No resuelto — brecha real entre código y modelo:** `EnemyState.processDots()` decae `stacks` y `dot_pools` con **decaimiento lineal continuo** sobre una `duration = 6.0` fija (`stacks[k] -= (stacks[k]/duration)×dt`, `dot_pools[type] -= (dps/duration)×dt`) — un **pool único que se consume gradualmente**, no el primitivo de **N timers independientes por stack** que este documento valida. Es el mismo error de fondo que el bug ya corregido: código de abril escrito sin corpus. Afecta a `stacks` (Corrosive/Viral/Magnetic — deberían ser N timers independientes) y a `dot_pools` (Slash/Toxin deberían tickear como instancias independientes; solo Heat debería consolidarse en pool compartido, y hoy los tres comparten el modelo de pool). **No se toca en esta sesión** (esto es modelado, no implementación) — queda para el plan de slices, con la brecha documentada.

---

## Preguntas abiertas

- **OQ-ENGINE-12** — cuándo se cablea el consumo del primitivo de stack en el pipeline de crit (Puncture/Cold). El primitivo ya está modelado; falta decidir el timing del punto de enganche.
- **OQ-ENGINE-13** — si los buffs de habilidad tipo Roar/Xata double-dipean en DoTs como el faction bonus. Señal observada, pendiente de confirmar con test aislado. No se persigue ahora.

Ambas en `docs/governance/open-questions.md`.

## Fuentes

- `references/wiki/mechanics/status-effects.md` — fórmulas, duración, caps, verificación empírica completa
- `references/wiki/mechanics/damage-types.md` — familias, combinación elemental, regla de elección de proc
- `references/wiki/mechanics/enemy-resistances.md` — matriz facción×elemento y DR de armor enemigo (**fuera del scope de esta campaña**; el escalado del enemigo SÍ existe desde 2026-07-06 — `EnemyRepository.scale()` produce `ScaledEnemy` real, validado contra el calculador del wiki, ver `enemy-scaling.test.ts` — pero el **consumo en el pipeline de daño** (facción × DR × capa) sigue pendiente del contraste #1; la DR adoptada es provisional, `OQ-ENGINE-15`)
- `references/wiki/mechanics/faction-damage.md` — faction bonus, double-dip
- `docs/domains/engine/test/gap-map.md` — Capa 5 (scaling de habilidades), contexto de por qué el sourcing de buffs como Roar queda fuera
