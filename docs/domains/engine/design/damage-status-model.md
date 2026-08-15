---
Estado: "referencia"
Rol: "Micro-arquitectura interna de C2 — modelo de daño elemental/status/DoT, verdictos de scope v1, primitivos reusables"
Impacto_ID: "E-C2-Damage"
Fidelidad_Fisica: "Project/src/core/engine/simulate/"
Fecha_de_creacion: "2026-07-02"
Fecha_de_actualizacion: "2026-08-08"
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
- **Cap K por tipo** en el caso general: 10 para la mayoría, 5 para Impact/Puncture.
- Sobre-cap: **reemplaza al stack más viejo** — el proc siempre entra; el cap decide si suma o reemplaza.
- El modificador resultante es `f(stacks_activos_en_este_instante)`.

Confirmado como el mismo mecanismo en Viral, Magnetic y Corrosive (detalle y citas en `status-effects.md` §Stacks e §Infection).

### El cap no siempre es "por tipo": tres receptores traen **su propia tabla**

No son desvíos de un parámetro — son **overrides parciales de la tabla entera de caps**, y cada uno
trae la suya:

| Receptor | Alcance | Excepción | Fuente | Estado |
|---|---|---|---|---|
| **Acolyte** | 4 para ***cualquier*** status | **Impact → 3** | *"can only receive up to 4 stacks of any Status Effect with the exception of Impact which can stack up to 3 times"* | ✅ `RECEIVER_MAX_STACKS.acolyte` |
| **Kuva Lich / boss** | 4 para ***cualquier*** status | **Impact → 6** | *"No Status Effect will exceed a maximum of 4 stacks, with the exception of Impact which can stack up to 6 times"* | **sin portador** — cero Liches en `enemies.json`; `Boss` vetado por `arch-decisions §22` |
| **Overguard** | **sólo Cold** | — | *"Cold — máximo 4 procs"* | **no es clase sino capa en `t`** — sin origen modelado (#11) |

**`Impact` es la prueba de que no alcanza un cap único desviable:** es el único que *no* se colapsa a 4,
y toma **tres valores para el mismo parámetro** — default `5`, Acolyte `3`, Lich `6`. Un `cap + desvío`
no puede expresar eso; una tabla por portador sí.

⚠️ **Y en el engine se llama `stagger`, no `impact`:** el tipo de daño y el efecto que produce no
comparten nombre en `shared/types/damage.ts`. La primera fila del receptor se escribió con el nombre de
la fuente y la atrapó el compilador — al traducir una tabla de la wiki, el nombre del efecto se traduce.

**Las dos primeras filas son el mismo tratamiento con distinto valor**, y la fuente lo declara: los
Acolytes recibieron *"the same Status Effect eligibility treatment that Liches received in Update
27.3"*. Comparten la forma; el número difiere.

⚠️ **Y el Lich trae un parámetro que ninguna otra fila tiene:** *"there is a **cooldown** to how quickly
you can stack up Impact Status Effects to avoid stunlocking the Kuva Lich"*. Es una **tasa**, no un
tope — no lo expresa ni un cap ni una tabla de caps. Sin modelar; se registra para que no se descubra
dos veces.

Quién resuelve estas tablas y con qué precedencia: `arch-decisions.md` §17.

**Excepción — Heat:** consolida sus procs en un **pool único compartido**, no instancias independientes. No usa este primitivo (ver §Heat).

**Orden de resolución:** el daño de un hit se calcula con el conteo de stacks que existía **antes** de que ese mismo hit aplique su propio proc — no con el conteo posterior. Secuencia para el engine: resolver daño con el estado actual → recién después sumar el stack nuevo para hits futuros.

**Multi-objetivo espacial** (cadena de Electricity, nube de Gas): es un filtro `distancia_al_origen ≤ radio`. No requiere infraestructura previa ni extender `Enemy` — cuando exista un entorno simulado es un tablero 2D (posición absoluta) y N enemigos son N instancias del mismo objeto. Con 1 enemigo el filtro no encuentra a nadie más. No bloquea el modelado de las fichas.

---

## Reglas de composición

1. **True Damage bypasa la reducción de armor, NO los multiplicadores de capa.** "Ignora armor" ≠ "inmune a todo lo demás": el tick True de Bleed sigue siendo daño de capa-salud a efectos de Viral, que lo amplifica. (Evidencia: `status-effects.md` §Bleed.)
2. **El faction bonus double-dipea en 5 DoTs**: Slash, Heat, Toxin, Gas, Electricity — `(1+faction)²` efectivo. La lista "afectados" de la página general de Faction Bonus estaba incompleta; no tratar ninguna lista de wiki como exhaustiva sin cruzarla. (Evidencia: `faction-damage.md`, `status-effects.md` §Electricity DoT.)
3. **El crit se apila limpio con los multiplicadores de stack** — factores independientes, sin interacción rara.
4. **"Vulnerable" nombra sólo a `Damage Vulnerability`.** Es la mecánica del **target** con página propia
   (Molecular Prime, Reap, Petrify, y los procs de Viral/Magnetic): aplicada por un emisor, temporal,
   filtrable por tipo/capa/clase de ataque. La matriz facción×elemento (③) se nombra **matriz** — es
   innata y fija por facción. Son dos slots distintos del receptor y componen distinto; la wiki advierte
   contra la confusión (`damage-vulnerability.md`: *"is not same as positive Damage Type Modifiers"*). Y
   `Status Vulnerability` (Tau, §abajo) es un tercer sentido: vulnerabilidad a **status chance**, no a daño.

> **Roar double-dipea — CONFIRMADO (2026-07-08, test in-game; ver §Evidencia).** `OQ-ENGINE-13` respondida:
> los buffs de daño-final tipo Roar caen en el **mismo bucket aditivo** que los mods de facción (Expel/Bane)
> y double-dipean igual. NO están "fuera de estas reglas" — son parte del bucket que se dobla.

### Evidencia empírica — el double-dip es del pool ②, no de "faction" ni de ③

Tests in-game (Akvasto Prime, Slash 169.4; hit **no-crit** al cuerpo; Roar +112.8%; Expel rank 5 +30%;
target **lvl 215 normal**, sin Steel Path). Formato de celda: `Slash directo → tick de DoT`.

| Condición | vs Arid Butcher (Grineer, Slash-neutral) | vs Charger (Infested, Slash ×1.5 por matriz) |
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
  `×5.90=(2.428)²`. → **double-dip = el pool ② elevado al cuadrado** para instancias damage-DoT. Cada
  fuente double-dipea sola (Expel sin Roar ya da ×1.69).
- **La matriz ③ del target NO toca el bleed de Slash:** los DoT son **idénticos** (39/66/175/228) entre el
  Grineer (neutral) y el Infested (Slash ×1.5), aunque los hits difieren — porque el bleed es **True** (bypasa
  resistencias y armor). El double-dip ocurre **con ③ totalmente bypasseado** → es fenómeno de **②, no de ③**
  (la matriz sí toca el **hit** directo: 287 vs 160).

**Refina la regla #2:** el double-dip pertenece al **pool ② de bonos de daño-final** (mods de facción +
buffs de habilidad, aditivos entre sí), no a "faction" a secas ni a la matriz ③. El `(1+faction)²` de §Detalle
es el caso particular "bucket = sólo faction"; la lectura general es **`(1 + Σ pool②)²`**.

**Eje ③ CERRADO (2026-07-08, DoT no-True).** Tests con Akvasto Prime (mods 60/60 → elemento 66, Slash 77,
total 176) vs **Charger (Infested)**: Toxin es **neutral ×1.0**, Heat **×1.5 por matriz** — misma base y
coeficiente (0.5), así que el ratio Heat/Toxin **aísla la matriz**. Charger sin armadura → sin confound de DR.

| Buffs | Toxin DoT (neutral) | Heat DoT (matriz ×1.5) | Heat / Toxin |
|---|---|---|---|
| base   | 89  | 133 | ×1.49 |
| +Expel | 150 | 225 | ×1.50 |
| +Roar  | 400 | 600 | ×1.50 |
| +ambos | 521 | 781 | ×1.50 |

- **La matriz ③ SINGLE-dipea:** Heat/Toxin = **×1.5 constante** (no ×2.25) en todo nivel de buff → la matriz
  se aplica **una** vez al DoT no-True (igual que al hit), NO se dobla.
- **El pool ② sigue doblando** en ambos (Toxin y Heat: ×1.69 / ×4.53 / ×5.90 sobre su base).

**Modelo completo — lo ÚNICO que double-dipea es el pool ②.** La matriz ③ single-dipea cuando aplica; True
la bypasea (Slash bleed); la DR single-aplica (no-True) o se bypasea (True); **`Damage Vulnerability`
single-dipea y no se bypasea nunca**. Fórmula general del tick:

```
DoT no-True (Toxin/Heat/Gas/Elec):  0.5  × modded_base × (1+status_damage) × matriz(elem,facción) × DV(target,t) × (1+Σpool②)²
DoT True (Slash bleed):             0.35 × modded_base × (1+status_damage) ×          [bypass ③]     × DV(target,t) × (1+Σpool②)²
```

Los `(1+faction)²` de §Detalle se leen bajo esto: `faction` = el **pool ②** (mods de facción + buffs), que
sí se dobla; la **matriz del target es aparte** y single-dipea. Datos crudos de todos los tests: `references/ingame-tests/double-dip.md`.

> **`DV(target,t)` no es un término a implementar — es un término que faltaba escribir.**
> `CombatSimulator.ts:98` computa `stateMultiplier = targetState.getDamageMultiplier(...)` y lo aplica
> **siempre**, fuera del branch de `bypassArmorMatrix`, así que el tick ya lo paga. Se enumera acá
> porque una fórmula que omite un factor que el código sí aplica es drift silencioso: invita a
> "implementarlo" dos veces.
>
> **Es el mismo slot del receptor de `arch-decisions.md` §21**, y su comportamiento en el tick está
> **medido**: `×2.000` exacto — single-dip —, contra el pool② que en la misma tirada dio `1.6² = 2.56`
> (`references/ingame-tests/damage-buckets.md`, Test 7, error máximo 0.13%). **Ese contraste es el
> criterio operativo de la frontera ②/③:** si se dobla en el DoT es del emisor; si no, del target.
>
> ⚠️ **Sin medir: `DV` sobre un DoT True (Slash bleed).** El Test 7 midió sobre Ignite (no-True). El
> código lo aplica —`stateMultiplier` va antes del bypass— y esa es la posición vigente, coherente con
> que DV sea un slot **independiente** de la matriz. **No está verificado contra el juego.**

### Reconciliación de `resolveHit` — Checkpoint 1

La matriz ③ ya vive en `resolveHit` (`CombatSimulator.ts`), vía `targetFactionMult(token, faction)`
(`contracts/damage-multipliers.ts` — accessor co-locado con el dato `FACTION_BONUS`, NO en `formulas/`:
es lookup, no cómputo). Reemplaza el lookup muerto `DAMAGE_EFFICIENCY[type]?.[healthType/armorType/
shieldType]` — inerte desde siempre porque `EnemyRepository.load()` rellena esos `*_type` con defaults
que no matchean ninguna clave. Estresado con test real: `__tests__/target-faction-matrix.test.ts`,
Charger (Infested, armor=0, shields=0, aísla la matriz) — Heat/Toxin ratio = **1.5 exacto**, contra el
1.0 (inerte) previo al fix. `EnemyDNA.*_type` queda **candidato a sunset** — pendiente autorización RED
separada (son campos de contrato), no se tocan en este checkpoint.

### Reconciliación de `resolveHit` — Checkpoint 2

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

**Checkpoint 3 (pool② double-dip en DoT) — el único término que falta hoy.** El modelo unificado de proc
reemplazó al viejo `StatusEngine`: el tick se computa en `dot-tick.ts` (`dotTickValue`) y **resuelve contra
el target vía `resolveDamageEvent`** (el mismo átomo agnóstico-al-origen que comparte con el hit directo).
Contra la fórmula objetivo, el código de hoy **ya aplica**: `coef`, `modded_base` (innato × Serration, vía
`dotModdedBase`), `(1+own_element)` y `(1+status_damage)` — los cuatro en `dotTickValue` — más la **matriz③
(elem×facción) + DR + bypass de True + `DV(target,t)`** en `resolveDamageEvent`. **Lo único ausente es el `(1+Σpool②)²`**: el
double-dip del bucket de facción/buffs del source, elevado al cuadrado. Y hoy es no-op incluso
estructuralmente — `dotModdedBase` lee solo `WEAPON_ADD_DAMAGE`, y el pool② (`GAMEPLAY_MULT_FACTION_DAMAGE`)
está **sin miembros**: facción diferida (shim C2·F, `arch-decisions §16`), Roar sin wired.

Es un término **decidido y cross-validado** (`DC-OQ-ENGINE-13` cerrada; wiki formal + `§Evidencia` propio),
no una incógnita — pero su implementación está **gated aguas arriba** por poblar el pool②: Roar es
incondicional (wireable hoy), los mods de facción son C2·F (RED). Fórmula objetivo:

```
DoT no-True (Toxin/Heat/Gas/Elec):  0.5  × modded_base × (1+status_damage) × matriz(elem,facción) × DV(target,t) × (1+Σpool②)²
DoT True (Slash bleed):             0.35 × modded_base × (1+status_damage) ×          [bypass ③]     × DV(target,t) × (1+Σpool②)²
```

Datos crudos: `references/ingame-tests/double-dip.md` (**PROVISIONAL** — pendiente re-medición). Al
implementar: **seguir el patrón de `resolveHit`** (accessor dedicado por naturaleza), no inline.

---

## Veredictos por tipo — v1 (resumen)

| Tier | Tipos | Qué entra |
|---|---|---|
| **Núcleo, completo** | Slash, Toxin, Viral, Corrosive | Todas sus facetas, sin recortes |
| **Multiplicador/bonus, mismo primitivo** | Magnetic (multiplicador shields/Overguard), Puncture (crit chance +5%/stack), Cold (crit damage +0.1×/+0.05× por stack) | El primitivo de stack ya existe; estos lo consumen desde un punto distinto del pipeline (crit calc en vez de resolución por capa) |
| **Tick sí, faceta cross-cutting parcial** | Heat (DoT sí; rampa de armor strip **aproximada** — lineal donde la fuente da escalones, sin vuelta y sin terminación: `../status.md §Deudas`) | |
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
`multiplier = 2+0.25×(n-1)` sobre daño de capa-salud, incluye True. Seam ya funcionando: `getDamageMultiplier("health")`. Orden de resolución: ver primitivo.

### Corrosive — Corrosion
`strip(n) = min(0.26+0.06×(n-1), 1.00)`, timer de 8s por stack, sin rampa de reversión (discreto: un stack expira, se recalcula con `n-1`). El techo es **físico** —no se saca más armadura de la que hay—: el 80 % que la fuente cita es `f(10)`, o sea lo que da el **cap de stacks** por defecto, y la misma página declara que 14 stacks (alcanzables con Emerald Archon Shard) la quitan entera. `EntityState.getEffectiveArmor()` ya combina parcialmente Corrosive+Heat, y su `max(0, …)` es lo que sostiene el piso cuando varios `armorMult` se multiplican — ninguno de ellos ve el producto.

### Magnetic — Disruption
Entra: `multiplier = 2+0.25×(n-1)` sobre daño a shields/Overguard, mismo seam que Viral (`getDamageMultiplier("shield")`). Diferido: negación de recarga de shields (no simulamos regen), bonus Electricity al romper Overguard (evento puntual), extra-efectividad vs Nullifiers (nicho).

### Puncture — Weakened
Entra: +5%/stack de crit chance del jugador contra el target (hasta +25% a 5 stacks). Behavior `weakened`, enganchado en el cálculo de crit chance vía `critModifier` (canal aparte del de resolución por capa — `DC-OQ-ENGINE-12`). Diferido: gate no-AoE/habilidades (irrelevante hoy, sin AoE, `OQ-ENGINE-12`); reducción de daño saliente del enemigo (eje fuera de scope).

### Cold — Freeze
Entra: bonus de crit damage recibido, +0.1× (1er stack) +0.05×/stack (hasta +0.5× a 9). Behavior `freeze`, mismo canal `critModifier` que Puncture (`DC-OQ-ENGINE-12`). **Ausencias vivas:** cap especial de 4 stacks en bosses/Overguard (falta el flag boss en el DNA — v1 usa 9, #11); freeze sólido al 10º stack (+1.0×, 3 residuales, CC, #12). Diferido: slow (survivability).

### Heat — Ignite
Entra: tick DoT, `0.5 × modded_base × (1+heat) × (1+faction)² × (1+status_damage)`, **pool consolidado compartido** (única excepción al primitivo); y la **rampa de armor strip**, como aproximación lineal `f(t − primer proc)` (0.5 s → 0% … 2 s → 50%). Lo que la aproximación no reproduce son los **escalones** (15/30/40/50 cada 0.5 s) ni la **vuelta**, y el strip **no termina** — las tres facetas y su medición están en [`../status.md §Deudas`](../status.md). Es la única de las 16 que necesita timeline real genuino. Fuera de scope: Panic (CC).

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

## Modelo de timeline (superposición de pulsos declarados) y sus fronteras

El DoT en el tiempo **no exige un reloj steppeado** para el caso simple. Cada instancia de DoT es un
**pulso**: `{ inicio, ancho (duración), amplitud (valor de tick) }`. La línea de tiempo es la
**superposición** (suma) de los pulsos activos. Dos resultados, ambos de **forma cerrada** mientras los
pulsos estén **declarados** y de **amplitud constante**:

- **Total** = `Σ_i (ticks_i × valor_i)` — **independiente del fase**: cuándo empezó cada pulso no cambia
  el total, solo su distribución por segundo. Suficiente para daño-total / TTK.
- **Curva `DPS(t)`** = suma de los pulsos vivos en `t` — sí depende del fase (sube al pisarse ventanas,
  baja al expirar). Necesaria solo para preguntas de forma (¿supera la regen en cada instante?).

Es el suelo C1 del timeline (`arch-decisions §8.1`, peldaño 2→3): con pulsos declarados, "cuánto daño
hace un DoT aislado" se **evalúa**, no se simula. Tanto el valor del tick (`formulas/status/dot-tick.ts`)
como el fold de superposición (`formulas/status/dot-timeline.ts`: `pulseTotal` + `timelineByTick`)
**ya existen** (Slice 3a), sin tocar el substrato de `EntityState`. La curva canónica de test
es la tabla de dos pulsos fasados (`__tests__/status/timeline.test.ts`).

**Las cinco fronteras — dónde la superposición cerrada se rompe** y hay que steppear (substrato C2) o ir
a manejo dedicado. Cada una es candidata a `todo` falsable en `__tests__/status/`:

1. **Heat NO es pulsos independientes.** Sus stacks se **consolidan en un único tick/s compartido** que
   crece con cada proc y cuya duración **se refresca** (`status-effects.md §Ignite`). Un pulso mutante,
   no N — manejo dedicado, no la lista genérica.
2. **La amplitud constante depende del SNAPSHOT, y el acoplamiento en vivo lo rompe.** El pulso es
   rectangular porque Warframe **congela** el daño del DoT al nacer. Pero Viral (Infection) **amplifica
   los DoTs de capa-salud en vivo** (`status-effects.md §Infection`): si los stacks de Viral cambian
   mientras el bleed tickea, la amplitud del pulso cambia dentro de su ancho. Igual el strip de armor
   bajo un tick de Heat/Toxin. **Es el caso meta (Viral+Slash)** — el build más común viola el rectángulo.
   La frontera más traicionera: se disfraza de caso limpio en el laboratorio (donde Viral está quieto).
3. **Emisión multi-target (NO pulsos que generan pulsos).** El arco de Electricity emite ticks secundarios
   en enemigos a 3m **sin heredar el crítico y sin re-proquear**; Gas es un pulso por **área** (N targets),
   no por instancia. "Un pulso = un target" es falso — extensión espacial + multi-target. **Verificado
   in-game (2026-07-14): no hay recursión de procs** (los vecinos reciben daño, no un nuevo status) — el
   tick sigue siendo Resolución, la frontera es el hogar cross-entity del orquestador, no un ciclo. Ver
   §Frontera 3.
4. **Terminación temprana por evento.** Blast **detona** al 10º stack o al morir el target; los efectos
   capeados **reemplazan al más viejo** (un pulso muere antes por uno nuevo); la **muerte del target
   trunca todos los pulsos** — y el momento de muerte es a su vez salida del timeline (circularidad leve,
   resoluble integrando hasta `health=0`). "El pulso vive su ancho declarado" es condicional.
5. **Densidad.** A fire rate alto + multishot los pulsos se multiplican (cientos/s en builds reales, ej.
   los del test). Enumerarlos deja de ser viable → `arch-decisions §4.4` (Hybrid / Expected Value Mode):
   arriba de cierta densidad se abandona la enumeración por agregación estadística.

**Hueco de dato (no de modelo) — Status Duration.** Ensancha el pulso, pero está **sin verificar** si es
(A) más ticks a intervalo fijo → total **sube**, o (B) los mismos ticks a intervalo estirado → total
**igual**. `status-effects.md` solo especifica el escalado de duración para **Blast/Heat/Electricity**;
para el resto (Slash incluido) es hueco. **Test decisivo:** sumar el daño total con/sin Status Duration
(duplica → A; igual → B) — NO observar si "dura más" (ambas lo hacen). Hipótesis abierta, no se asume.

**Corte:** la agregación cerrada de pulsos declarados de amplitud constante es **viable hoy** (suelo C1,
sin substrato); las cinco fronteras + el generador de fases emergentes (RNG/rate) son el **substrato
steppeado / dedicado** (C2), gated por consumidor real. Este modelo es la profundización de la brecha
`processDots` de abajo (el pool-único-con-decay-lineal es justo lo que la superposición de pulsos NO es).

### El frame para construir C2 sin re-acoplar

El DoT **no es una mecánica especial** — es `resolveHit` en un **cronograma** con el valor de la fuente
**congelado**. Se descompone en **cuatro ejes ortogonales que se componen, no se fusionan** (fusionarlos
en "un grafo que hace todo" re-acopla lo que se separó):

| Eje | Qué es | Dónde vive |
|---|---|---|
| **Tiempo** (1D) | superposición de pulsos, `total`/curva | `formulas/status/dot-timeline.ts` ✓ |
| **Espacio** (grilla 2D) | filtro de posición (arco 3m, nube Gas, viaje del proyectil = otro delay declarado) | **diferido como código** — hoy los casos reales son un escalar `distancia ≤ R`, no una grilla (`status-effects.md`) |
| **Población** (RNG) | qué pulsos existen | multiplicador: **`esperado = forzado × chance × peso`** (todo lineal; el `peso` `1/N` es `procWeightByType`). El sampled (Monte Carlo) solo para la varianza |
| **Resolución** (por tick) | capa/armor/facción/coupling vs target | **`resolveHit`** (reusar, no reimplementar) |

**Compute-once / plano — la simplificación clave.** La fórmula pesada (source-side: `modded_base`,
`status_damage`, **double-dip bucket²**) corre **una sola vez, al nacer el proc**, y deja un **número plano
congelado** en el estado del target (`DotPulse.value` ya es eso). La vida del pulso es **plano + resolución
trivial por tick** — el mismo costo que un hit directo, no una re-corrida de fórmula. El double-dip "vive en
el target" como número, no como fórmula. Caro al nacer, barato el resto.

**Dos capas distintas (§14):** el hit directo es **RESOLUCIÓN** pura (resolvé → aplicá → olvidá, sin
estado). El DoT deposita **ESTADO** portado-por-el-target (los pulsos vivos + los debuffs), que resuelve en
el tiempo. El estado del target se parte en **emisores de daño** (ticks) y **modificadores de defensa**
(Corrosión/Heat strip, Viral amplifica) — y estos últimos acoplan cómo resuelven los primeros (fuga 2).

**Disciplina de código (no repetir el error `forcedFiringPulses`):** el andamiaje **sintético** (escenarios
forzados, supuestos 100%) vive en el **harness de test**, NO en `formulas/`. `formulas/` es matemática pura
sobre pulsos; fabricar la lista de pulsos desde un escenario es test-side. El DoT evoluciona **componiendo**
piezas existentes (cronograma × `resolveHit` × multiplicador de chance), no inflando un módulo.

> **Caveat de medida:** `timelineByTick` cuenta ticks en el MISMO instante — frágil a la alineación (a fire
> rate alto los ticks caen en tiempos fraccionarios que no colisionan). Para tasa/DPS usar `damageInWindow`
> (daño en `[from,to)`), que no depende de alineación. Hallazgo del tramo (a): reproducir el dato lo expuso.

### Población/RNG — modelo resuelto

El eje **Población** del frame (`esperado = forzado × chance × peso`) tiene modelo asentado, fuente
principal `references/wiki/mechanics/
status-effects.md §Aplicación` (mecanismo confirmado con cita literal + nota de parche `{{ver|27.2}}`).

**Generador de eventos, dos niveles:**
1. **Por pellet** (multishot) — cada pellet es un roll independiente al Status Chance nominal del arma,
   **sin dividirse** entre pellets. Confirmado con fundamento histórico: desde el parche `27.2` el SC de
   Arsenal ya es la probabilidad real por pellet (antes venía inflado por multishot en el display); las
   escopetas tienen su ajuste ×3+ horneado en el dato base — sin caso especial que modelar.
2. **Por hit, cuando el SC de ese pellet supera 100%** — un mismo hit puede disparar N>1 proc-slots.
   Cada slot dibuja su tipo de forma **independiente y ponderada** (`procWeightByType`,
   `Damage÷TotalDamage`), **incluida la porción garantizada** — el mismo tipo puede repetirse varias
   veces en un solo hit (confirmado in-game, captura del usuario). El generador discreto exacto de N no
   tiene fórmula confirmada en la wiki — `OQ-ENGINE-19`, no bloqueante: para el total y la curva
   esperados el valor exacto de N es irrelevante (identidad de Wald, `E[N]=chance` alcanza).

🔴 **El extremo bajo del eje no está gateado: con chance 0 el estado NACE, inerte.** `expectedProcEvents`
filtra por **peso de daño** (`if (!weight) continue`), no por chance, así que un emisor sin status chance
igual produce un evento por tipo con `expected: 0`, y `applyProc` lo aplica: el contenedor queda con
`{ ignite: {pool:0, …}, corrosion: {count:0} }`. **Ningún número se mueve** —el armor queda entero— así
que es latente, igual que lo fueron `min(cap, count + 1)` y la fuga de curación del override. Lo que sí
cambia: `activeBehaviors()` los itera en cada `advance` y en cada `getDamageMultiplier`, y
`effectStates.has(...)` contesta que sí a un efecto que nunca ocurrió — la primera pregunta de un
consumidor que sea *"¿qué estados tiene este target?"* recibe una respuesta falsa. ⚠️ **Dónde se arregla
no es obvio y por eso no se arregló:** gatear en `expectedProcEvents` (no emitir con chance 0) o en
`applyProc` (no crear estado con amount 0) son dos leyes con dos dueños, y la segunda recibe `amount`
fraccionales legítimos. Medido en rojo en `__tests__/ability-emission.test.ts`.

⚠️ **"Forced Procs"** (término de la fórmula del promedio de la wiki, `Multishot × (Forced Procs +
Status Chance por proyectil)`) **NO es la porción garantizada de un SC>100%** — es un mecanismo de
arma/mod aparte (Hunter Munitions, Kunai con Slash forzado innato), independiente del valor de SC. Para
la mayoría de las armas ese término es 0; el `Status Chance por proyectil` de la fórmula es el SC crudo,
usado directo como cantidad esperada.

**El generador es agnóstico al tipo de proc.** No hay nada DoT-específico en la selección de tipo ni en
el conteo de slots — la tabla tipo→proc trata Slash/Toxin/Heat (DoT) igual que Corrosive/Viral/Puncture
(stack-debuff). Lo acotado es el **consumidor**, no el generador: el output limpio es una lista de
eventos `(tipo, timestamp)`. En el modelo unificado el generador (`expectedProcEvents`)
alimenta por igual a los DoT behaviors (`dot-tick`/`dot-timeline`) y a los stack-debuff (Familia A):
`TimelineSimulator` rutea cada evento a su `EffectBehavior` vía `applyProc`, sin dos consumidores separados.

**Compute-once, sin superficie de código nueva.** No hace falta una función de "curva esperada"
separada de la de "total esperado": basta con producir `DotPulse[]` con `value` pre-escalado por
`chance × peso` al nacer el proc (mismo principio compute-once que ya rige el resto de la fórmula
pesada) — `pulseTotal`, `timelineByTick` y `damageInWindow` (Slice 3a) operan sobre esa
lista sin modificarse. Total y curva salen del mismo lugar, sin decisión de exposición separada.

**Prototipo.** `formulas/status/proc-population.ts` (`expectedProcEvents`):
agnóstico, un pellet/hit → `ProcEvent[]` (`{type, timestamp, expected}`), colapsando los 2 niveles en
una sola llamada con `statusChance` crudo. `formulas/status/dot-population.ts`
(`dotPulseFromProcEvent`): glue DoT-específico, `ProcEvent → DotPulse` con `value` pre-escalado, sin
tocar `dot-timeline.ts`. Tests en `__tests__/status/population.test.ts`. **Sigue gated:** el
cronograma real de disparos que alimenta `timestamp` (tramo c, integración de arma) y el cableado a
`EntityState`/`CombatSimulator` (resuelto por el modelo unificado, §Modelo unificado de proc).

---

## El proceso del status — un solo lenguaje (consecuencia)

> **Rol:** lenguaje-norte del status, **NO** descripción del código actual. El §Modelo unificado de proc
> (abajo) es el **piso actual** bajo este lenguaje — implementa casi todas las estaciones, con UNA brecha
> estructural nombrada (la Aplicación). Existe porque el status se venía segmentando por **grupo** (DoT,
> stack, Familia A/C) en vez de por **proceso**, y por eso cada pieza se fabricó su propio vocabulario (el
> DoT su propio SSoT). **Alcance:** va más allá del DoT — es el lenguaje de cómo un daño del *source* se
> vuelve *estado* en el target; toca varios puntos del proyecto (`elementBonusPct`, `CombatCalculator`, la
> instancia derivada). Estresado contra Slash/Ignite/Gas/Electricity/
> Corrosion. Se hizo mal antes; esto asienta el lenguaje al que reconciliar — no es una reescritura, es
> dejar de parchar.

### El proceso — cada estación es CONSECUENCIA de la anterior (verbos, no grupos, igual que A→B→C)

```
INSTANCIA ─ejecutar─► HIT ─┬─ consecuencia inmediata ──► ⟨RESOLUCIÓN⟩ daño directo → capas
                           └─ consecuencia depositante ─► APLICACIÓN ─depositar─► ESTADO(target)
                                                                                    │ muta sobre sí mismo
                                                                                    │ (decay/expira · guarda refs)
                                                                                    ▼
                                                                                  EFECTO ─lectura─►
                                                                                   ├ modificador (stack) → se lee al resolver un daño
                                                                                   └ emisión (DoT) ──► ⟨RESOLUCIÓN⟩ tick → capas
   ⟨RESOLUCIÓN⟩ = átomo transversal (mismo `resolveDamageEvent`), NO una estación — aparece en 2 momentos.
```

- **Instancia** — el arma *potencial* (daño por tipo, status_chance, multishot, crit, forced). Dato que C1 produce.
- **Hit** — la instancia *ejecutada*: acá se tiran los dados de multishot y crit. No es otra capa; es la instancia en pasado.
- **Aplicación** — la **consecuencia discreta** del hit: qué proc salió. Lleva una **traza** `{efecto, count, crit, origen: rolled|forced}`, no un promedio. **Es la estación que hoy falta como objeto.**
- **Estado** — la acumulación de aplicaciones por efecto, **portada por el target**. Muta sobre sí mismo.
- **Efecto** — la **consecuencia del estado**, leída cuando hace falta. Bifurca en **modificador** (stack: strip/mult) o **emisión** (DoT: tick).
- **Resolución** — el átomo "daño de tipo T vs las capas", **transversal**: lo comparten el hit directo y el tick emitido. No es una estación de la cadena; la cruza.

### Principios (el cimiento)

- **El peso se consume en la Aplicación.** El peso decide *qué* proc sale (probabilidad); no persiste como factor del daño. Salió Corrosive, no "0.667 de un proc". (Hoy `expectedProcEvents` lo deja multiplicando para siempre — el síntoma de tratar la selección como valor.)
- **"stack" y "DoT" NO son dos procesos** — divergen SOLO en el último eslabón (qué clase de Efecto es consecuencia del Estado). Segmentar arriba (`DotType`, generador propio, Familia A/C) fue el error.
- **El Estado muta sobre sí mismo** ("dentro, no fuera"): las consecuencias salen (daño, strip leído) pero **no re-depositan** estado — **sin excepción**: el tick es siempre Resolución, nunca re-genera una instancia (frontera 3 = emisión multi-target de daño, no recursión de procs — verificado in-game, §Frontera 3).
- **target-local vs cross-entity** decide dónde vive cada cosa: lo que opera sobre el *mismo* target (tick, strip, stack-mult) es del behavior/estado; lo que **cruza una entidad** (buffs del source re-leídos, targets vecinos en un radio) es del **orquestador**, no del behavior.
- **El Estado puede guardar REFERENCIAS, no solo números muertos** (capacidad). "¿Roar sigue activo?" se responde resolviendo una ref del source en la lectura, no leyendo un valor congelado. *Cuáles* términos son ref-viva vs snapshot-consumado = gated (abajo).

### Mapeo al código actual (honestidad — qué existe, qué falta)

| Estación | Código hoy | Estado |
|---|---|---|
| Resolución (átomo) | `CombatSimulator.resolveDamageEvent` | ✅ ya transversal (hit + tick) |
| Estado | `EntityState.effectStates: Map<StatusEffect,S>` | ✅ existe, muta dentro |
| Efecto — modificador | `EffectBehavior.resolutionModifier` (stacks) | ✅ ya es "consecuencia del estado" |
| Efecto — emisión | `dot-tick` / `behaviors` (DoT) | ⚠️ desviado (SSoT propio: `DotType`, `dot-population`) |
| **Aplicación** | diluida en `expectedProcEvents` (predictivo) | 🔴 **la brecha estructural** — no existe como objeto, no consume el peso |

Casi todo el lenguaje **ya está implementado**. La brecha real es **una**: la Aplicación como objeto de primera clase (hoy es un valor esperado; debe ser una consecuencia con traza).

### Las tres formas de definir la aplicación (marco)

La selección de proc es una de tres proyecciones, para tres preguntas distintas — **no** una jerarquía de calidad:
- **Selectiva** (C1) — "hace este daño" (declarativo, el arsenal).
- **Predictiva** (valor esperado) — "el daño *esperado*" (proyección cerrada; legítima para su pregunta, **mal usada como mecanismo**).
- **Consecuencia** (RNG) — "qué pasó en *esta* corrida" (fiel, estocástica).

Incoherencia raíz actual: en el mismo loop, el **hit directo** ya es consecuencia (`simulateAttack`, RNG atómico) pero los **procs** son predictivos (`expected × pellets`). La meta no es borrar el predictivo (`E[N]` es la media de las corridas) — es **dejar de usarlo como mecanismo**.

### Gated — nombrado, no cerrado (no predecir cómo el modelo lo aplica)

- **La frontera de congelación** (qué le pertenece a la base del proc y qué evalúa el tick al emitir) → `OQ-ENGINE-20`. El eje ya está repartido por medición; lo que falta es dónde cae la línea, y el caso testigo es el combo de melee.
- **Forced proc** (Hunter Munitions, Kunai) = **"extensión" de la instancia source**, no consecuencia de un roll — otra naturaleza de Aplicación (`origen: forced`). Existe, no modelada.
- **Frontera 3** (Gas/Electricity: emisión multi-target de daño a vecinos, sin re-proc — no recursión, verificado in-game) → cross-entity en la Resolución, ver §Frontera 3.

**Cruce con `@core`.** El barrido de este lenguaje contra la estructura real de `@core` (marcar qué se auto-percibe como sub-capa sin serlo, qué es sustrato de una consecuencia, qué queda fuera) cierra con **4 ejes-raíz**, todos descendientes de la **Instancia-sin-objeto**. Sus conclusiones viven en SSoT: la Instancia-objeto en [`simulation-architecture.md §2.0.1`](simulation-architecture.md) (el seam C1→C2 que disuelve la raíz) y la reconciliación planificada de `resolveHit` ②③ en `decision-frontier.md §4`.

---

## Modelo unificado de proc — arquitectura resuelta

> Un contenedor único `Map<StatusEffect, S>` + `EffectBehavior` por efecto reemplaza la maquinaria
> pre-rediseño (los 3 contenedores `stacks`/`dot_pools`/`active_pulses` + `StatusEngine`; su historia de
> reconciliación intermedia Toxin/Slash vive en git — Slice 3).
> Es el **piso actual** bajo el §El proceso del status (arriba) — implementa el
> lenguaje con la Aplicación aún predictiva. Consolida el §frame ("cómo construir C2") en una interfaz concreta.
> **Estado: ontología LOCKED, interfaz sustancialmente cerrada (target-side); dos huecos gated nombrados.**

### Ontología (LOCKED)

```
Emisor → INSTANCIA → ┬─ RESOLUCIÓN (hit)
                     └─ genera PROC → [estado target] → ┬─ emite RESOLUCIÓN (tick)
                                                        └─ modifica RESOLUCIÓN futura
```

- **Instancia** — evento de daño externo; resuelve su hit una vez; al generar un proc le **fija su
  base**. Esa base **no es el hit resuelto** (`dot-scaling.md` Test 1: el hit se mueve y el DoT no): sale
  del arma por una regla propia del tipo de DoT. El hit muere; la base que el proc fijó vive en él.
- **Resolución** (código: `resolveDamageEvent`, renombrado de `resolveDamageInstance`) — el
  átomo "daño de tipo T vs las capas del target". **Agnóstica al origen**: hit y tick la comparten (por
  eso se conflaba; el nombre lavaba la diferencia).
- **Proc** — efecto de estado aplicado al target, persistente, con ciclo de vida. **NO es una instancia.**
- **Tick** — una resolución que emite un proc DoT desde el estado del target.

Instancia y tick comparten la **resolución**, NO el **origen ni el ciclo de vida**.

### El proc determina la base; el tick evalúa al emitir

`tick = base(la que el proc fijó al nacer) × contexto(evaluado en el instante de la emisión)`.

El **double-dip** (§Evidencia: Roar ×2.128 → DoT ×4.53 = 2.128²) **no** prueba que el multiplicador viva
en dos mitades, una congelada y una viva: el mismo número sale de **una sola evaluación con exponente 2**,
que es lo que la fórmula declara (`× (1+faction)²`). Y la premisa contraria está medida falsa — el DoT
**no hereda el hit resuelto**: en `dot-scaling.md` Test 1 el hit sube `114 → 171` y el DoT no se mueve
de 45. **Heat Inherit** es la huella más nítida del lado base: el pool consolidado conserva la base que
fijó el **primer** proc aunque después lo refresquen otras armas
(`../../../references/wiki/mechanics/damage-heat-damage.wikitext` §Heat Inherit — de ahí que el efecto de
*Secondary Fortifier* se "herede" si el primer Heat vino de la secundaria).

Consecuencia: el aporte del emisor vive **entero** del lado evaluado, así que al caer el buff cae entero.
El `DotPulse.value` actual ya es la base (compute-once, §frame); falta —gated— la evaluación del contexto
source en el tick (faction², pool②), que **rompe la agnosticidad source a propósito** (fidelidad, no
accidente). Dónde cae exactamente esa frontera —el caso testigo es el combo de melee— = **`OQ-ENGINE-20`**.

### La interfaz

```ts
interface HitContext { moddedBase: number; statusDamageBonusPct: number;
                       elementBonusPct: Partial<Record<DamageType, number>>; }   // lo FROZEN de la instancia
interface Resolucion { value: number; as: DamageType; }                          // 'as' = tipo con el que RESUELVE

interface EffectBehavior<S> {
  effect: StatusEffect;                                                          // canónico (@shared)
  applyProc(state: S | undefined, hit: HitContext, amount: number, t): S;        // snapshot + ACUMULACIÓN (generaliza addStacks)
  advance(state: S, t, dt): { state: S; damage: Resolucion[] };                  // ciclo de vida + EMISIÓN (DoT). No-DoT: []
  resolutionModifier?(state: S, t): ResolutionModifier;                          // SOLO stage de resolución (armor + layer)
}
interface ResolutionModifier { armorMult?: number; layerMult?: Partial<Record<Layer, number>>; }
```

- Un canal de **emisión** + un **modificador de resolución** genérico (armor + layer). Armor NO es canal
  privilegiado; crit-vs-target (cold/puncture) es un 2º canal del stage atacante (hits-only) — **construido**
  (`EffectBehavior.critModifier` → `EntityState.getCritBonuses` → `simulateAttack`), con efecto real
  (behaviors `weakened`/`freeze`, `DC-OQ-ENGINE-12`). Fidelidad de suelo; las ausencias (cap-Overguard #11,
  10º stack #12) se destilaron a Issues; Puncture/AoE sigue gateado en `OQ-ENGINE-12`.
- La emisión declara `as: DamageType` (bleed→`'true'`, poison→`'toxin'`…); **core deriva las reglas del
  canónico** (bypass shields, bypass armor/matriz de True, DR, layer-mult). Único dato per-efecto = `as`
  (sucesor de `DOT_TYPE_IS_TRUE`, NO tabla-sombra). **Cierra el cabo:** hit Slash resuelve `as:'slash'`
  (paga DR), bleed emite `as:'true'` — sin ambigüedad, `true` lleva su perfil en el canónico y se retira
  el opt ad-hoc `bypassArmorAndMatrix`.
- Cruces (Viral amplifica un bleed) → viven en la resolución de core, no en las fórmulas (corte fórmula ≠
  resolución). `EntityState` colapsa a `Map<StatusEffect, S>` + registro `EFFECT_BEHAVIORS`; los 3 caminos
  de `advance` + `getDamageMultiplier` + `getEffectiveArmor` → una sola iteración.

### Frontera 3 = emisión multi-target (NO recursión)

slash/toxin/heat: tick → resolución → **fin** (un tick NO proquea). gas/electricity **tampoco**: el tick
llega a los targets vecinos como **daño, sin re-proquear**. **Ground-truth in-game (2026-07-14):** Gas (nube
AoE, mismo daño en el radio, sin re-proc) ni Electricity (cadena de daño, sin tesla-procs en los vecinos)
replican recursión de procs — la asunción previa ("pulsos que generan pulsos") quedó **empíricamente
descartada**. → **el borde Instancia↔Resolución es absoluto: el tick es SIEMPRE Resolución, nunca Instancia.**
Gas/Electricity = **emisión multi-target**: un Efecto → **N Resoluciones sobre vecinos** (solo daño),
cross-entity **en la Resolución** (el orquestador conoce los vecinos), NO recursión. Por eso siguen siendo
**frontera 3** (gated) — el hogar cross-entity del orquestador no existe todavía —, pero por el eje
**espacial/multi-target**, no por recursión.

### Disposición (muere con el diseño, no aislado)

`StatusEngine` entero · `dot_pools` · `dot_key`/`DAMAGE_ATTR_TO_DOT_KEY`/`EFFECT_BY_DOT_KEY` ·
`DOT_TYPE_IS_TRUE` · `EnemyStatusState`/`TrackedStatusEffect` · los 3 contenedores — **ejecutado**
(rediseño + saneamiento G1/G2). **`DotType` NO se dispone:** es una partición viva
(los tipos con coeficiente de tick escalado por daño, consumida por `dotTickValue`) — se **ató al canónico**
como `Extract<DamageType, …>` (G2), no se disolvió a `DamageType` pelado (eso perdía la exhaustividad de
`DOT_COEF` + la seguridad de tipo). ⚠️ **Deuda semántica abierta:** "DoT" es un comportamiento, no un grupo
invariante (`status_damage` afecta también a Blast, no-DoT) — el naming presume una categoría que no cierra;
la solución honesta (eje comportamiento vs. eje coeficiente) es trabajo aparte. El comportamiento pool-like
de **Heat sobrevive como su propia fórmula** (Heat ≠ Toxin), no como contenedor compartido. **Reusa** `stack-debuff` (modifiers Familia A),
`dot-tick` (snapshot DoT), `dot-timeline` (advance DoT) — reorganización, no rewrite. **Fuera a propósito:**
generación del proc (§Población/RNG; dedup chance×peso reconciliado en `formulas-integration.md §2`),
crit (OQ-12), split snapshot/live fino (OQ-20), duración del proc en `HitContext` (source-side,
`OQ-ENGINE-18`), efectos sin modelar, frontera 3.

---

## El proc y su primitiva — un nivel que la Ontología no nombra

> **No redefine el Proc.** La Ontología (LOCKED) sigue intacta: `Instancia → Resolución → Proc → Tick`,
> y el Proc sigue siendo *"efecto de estado aplicado al target, persistente, con ciclo de vida"*. Lo que
> esta sección nombra vive **debajo** del Proc: **qué hace**, que puede ser más de una cosa y filtrarse
> por separado.
>
> **Estado: no cerrado.** Se pliega a la Ontología —o se descarta— cuando un stage lo consuma.

### La prueba es de runtime, no de diseño

`references/wiki/mechanics/overguard.wikitext:37` —

> *"On enemies, **they can receive Status Effects but** while their Overguard is active they will
> completely ignore **the crowd control effects of** Stagger, Knockdown, Stun, Mind Control, Confusion
> (including Radiation procs), Slow, Ragdoll, Blind, and Lifted"*

Ese `but` es el corte operando en el juego: **el proc entra; una parte de lo que hace se apaga.** Y el
caso que lo prueba sin ambigüedad es un proc **con daño** — `damage-heat-damage.wikitext:73`:
*"Ospreys, Bosses, Tenno, and enemies with Overguard are immune to **this crowd controlling effect**"*.

**Heat contra Overguard: el DoT entra, la reducción de armadura entra, el panic no.** Un proc, tres
efectos, uno filtrado. El modelo actual —`EffectBehavior.effect: StatusEffect`, singular— no puede
expresarlo: sólo puede aceptar o rechazar el proc entero.

Y hay una **categoría transversal**: nueve efectos de familias distintas (postura, conciencia,
movilidad, percepción) filtrados **como grupo**. Eso no es una lista de procs — es un atributo que el
motor del juego consulta. Overguard está en **todos los Eximus**, así que no es un borde raro.

### La fuente ya lo separa: `Name` ⊥ `Status[]`

`references/wiki/sources/damage-types-data.md` §*`Name` es el proc · `Status` es la primitiva* — cada
entrada del módulo trae `Name` (el proc) y `Status` (**array**, qué hace), y **varios procs comparten
primitiva**: `Freeze` y `Slow` declaran los dos *slow*; `Knockback` y `Stagger`, los dos *stagger*. Es
la distinción *"Freeze **usa** slow, no **es** slow"* declarada por la fuente, no derivada acá.

⚠️ **Pero `Status[]` es prosa, no vocabulario.** DE no publica tokens de primitiva, así que la lista
cerrada de primitivas es **endógena** —nace del label auditado, como `condition` en
`../../../semantic/conditions.md`— mientras `DT_`/`PT_` son exógenos. No se miden con la misma vara.

Un caso ya inexpresable hoy: `PT_KNOCKBACK` trae `{ "Stagger", "Increased health threshold for Mercy
finisher" }` — el proc de Impact hace **dos cosas sin relación entre sí**, y `statusEffect: 'stagger'`
sólo nombra la primera.

### El criterio de pertenencia no lo elegimos nosotros

> **¿Lo cuenta Condition Overload?**

CO **no cuenta "procs": lee una lista cerrada y enumerada de 18** y la enumera **por tipo de daño**, no
por nombre de proc (`condition-overload.wikitext` §*What Counts As A Status Effect?*): los 3 físicos +
los 10 elementales + los 2 únicos (Void, Tau) + **3 "hidden" sin tipo de daño: Lifted · Knockdown ·
Microwave**. Corroborado por segunda vía independiente: en `status-effect.wikitext` §*Independent from
Damage* **sólo esas tres** dicen *"Counts as an individual status for Condition Overload, Galvanized…"*.

`Damage Vulnerability` **no** está en la lista.

### El corte: qué se modela y qué queda simbólico

| Entra al motor porque… | Quiénes |
|---|---|
| **hace daño** | los 15 con `DT_ → PT_` |
| **cuenta para CO sin hacer daño** | Lifted · Knockdown · Microwave |
| **altera el eje temporal** | la primitiva `slow` (Freeze, Gloom, Nova, Molecular Prime) |
| **nada de lo anterior → símbolo** | Stagger · Big Stagger · Stun · Ragdoll · Sleep · Silence · Impair *(PvP)* · Parried · Disarmed · `PT_VOID` · `PT_GLUE` |

**El corte separa procs, no primitivas.** Que `PT_STAGGERED` sea simbólico no hace simbólica a la
categoría CC: Overguard **la lee** para apagar el panic de Heat sin tocar su DoT. Es carga útil.

> **"Simbólico" es el efecto físico, no la presencia de la marca.** Entra al motor: **si la marca está
> o no**. Queda simbólico: **que el enemigo efectivamente vuele, caiga o se tambalee.** Son dos
> preguntas, no una — y colapsarlas lleva a *"CC es simbólico ⇒ la inmunidad a CC es simbólica"*, que es
> falso: CO **cuenta presencia**, y las tres que cuentan sin hacer daño dependen de inmunidad física.

| Proc | Quién lo aplica | Si el target es inmune |
|---|---|---|
| **Microwave** | **exclusivo** de Nukor / Kuva Nukor | esa arma pierde un stack de CO |
| **Lifted** | heavy attacks · **todos los heavy slams** · Void Levitation · Bonewidow · Sevagoth *Embrace* · Mausolon · Telos Boltace — **melee casi entero** | el slam pierde su aporte a CO |
| **Knockdown** | Sonicor · Mag *Pull* · Rhino · Zephyr · Vazarin… | ídem |

🔴 **Y un tercer mecanismo, más caro que los dos anteriores** — `status-effect.wikitext` §*Status
Immunity Interactions*: *"When an attack procs a status effect on an enemy which is immune to a
particular proc type, **the respective damage type is excluded from proc type chance calculations**"*.
**La inmunidad no resta una: redistribuye la chance a las demás.** Cambia la distribución entera de
procs, que es la entrada de todo §Población/RNG.

### Tres mecanismos eran uno

*proc type immunity* (en el sorteo) · *Status Immunity* (al nacer) · *CC suppression* (en cada lectura)
son **la misma forma muestreada en tres `t` distintos**. Como el motor muestrea estado igual en los tres
(`arch-decisions.md` §20), *"cuándo"* deja de ser una distinción estructural: son un filtro, no tres.

### Lo que cuantifica el corte — Acolyte vs Eximus a nivel cap

| | Reducción de armadura |
|---|---|
| 1 stack de Corrosion | 26% |
| **4 stacks** (tope de Acolyte/Lich) | 26 + 6×3 = **44%** |
| 10 stacks (normal) | **80%** |

Contra armadura al cap, `damage-corrosive-damage:25` pone 10 stacks en **×6 de daño efectivo**. El
Acolyte se queda a menos de la mitad de la reducción → **el build de daño directo le gana al build de
status con CO**. Eso **invierte qué arquetipo gana**, que es para lo que existe el proyecto — no es un
número más grande.

Lo que constituye un caso de prueba distinto no es la entidad sino su **juego de reglas**:
`{ cap_status, inmunidades_por_proc[], armadura, capas, facción, modificadores_por_tipo }`. **El valor
está en las reglas; la entidad es el envase** — bosses, Liches y Acolytes entran como preset, sin
modelar fases ni habilidades. *(Contra-presión registrada, no resuelta: queda abierto si un preset
alcanza siempre.)*

---

## Preguntas abiertas

- **OQ-ENGINE-12** — el gancho de crit (Puncture/Cold) se **construyó** (`DC-OQ-ENGINE-12`, canal `critModifier`); lo único que sigue vivo es Puncture/AoE-habilidades, gateado hasta que exista AoE. Cold cap-4-Overguard (#11) y freeze 10º stack (#12) se destilaron a Issues.
- **OQ-ENGINE-19** — generador discreto exacto de N proc-slots cuando el Status Chance de un pellet supera 100% (§Población/RNG arriba). No bloqueante — el total y la curva esperados no dependen de él.
- **OQ-ENGINE-20** — la frontera de congelación: qué le pertenece a la base que el proc fija y qué evalúa el tick al emitir (§Modelo unificado / El proc determina la base). El reparto grueso está medido; el caso que ubica la línea es el combo de melee (`references/ingame-tests/pending.md` P-10).
- **OQ-ENGINE-18** — Status Duration en DoT (§Modelo de timeline, hueco de dato): más ticks vs. ticks estirados — decide la duración que `HitContext` debe cargar.

(OQ-ENGINE-13, Roar/Xata double-dip en DoTs, quedó **RESUELTA** — ver §Evidencia empírica arriba — y migró a `closed-decisions.md`.)

Ambas en `docs/governance/open-questions.md`.

## Fuentes

- `references/wiki/mechanics/status-effects.md` — fórmulas, duración, caps, verificación empírica completa
- `references/wiki/mechanics/damage-types.md` — familias, combinación elemental, regla de elección de proc
- `references/wiki/mechanics/enemy-resistances.md` — matriz facción×elemento y DR de armor enemigo (**fuera del scope de esta campaña**; el escalado del enemigo existe — la curva-S corre en el molde (`ItemRepository.normalizeEnemy`) y compone el frame-0 del participante, validada contra el calculador del wiki, ver `enemy-scaling.test.ts` — pero el **consumo en el pipeline de daño** (facción × DR × capa) sigue pendiente del contraste #1; la DR adoptada es provisional, `OQ-ENGINE-15`)
- `references/wiki/mechanics/faction-damage.md` — faction bonus, double-dip
- `docs/domains/engine/test/gap-map.md` — Capa 5 (scaling de habilidades), contexto de por qué el sourcing de buffs como Roar queda fuera
