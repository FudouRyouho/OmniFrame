---
Estado: "referencia"
Rol: "Contrato de consumo de la mecánica de melee combo — quién consume el combo y qué le exige al engine (SSoT de la mecánica; promoción de OQ-ENGINE-14)"
Impacto_ID: "E-MeleeCombo"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-07-05"
Fecha_de_actualizacion: "2026-07-10"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "docs/domains/engine/design/formulas-integration.md"
  - "references/wiki/mechanics/melee-combo.md"
---

# Melee Combo — contrato de consumo

Este documento **no re-explica** la mecánica de combo (para eso está el source:
[`references/wiki/mechanics/melee-combo.md`](../../../../references/wiki/mechanics/melee-combo.md)).
Es el **contrato de consumo**: normaliza esa información —incompleta o sin confirmar en partida—
en el **dato que el engine necesita** para prototipar. La columna vertebral son los **consumidores**
(quién usa el combo y con qué función de transferencia); el productor (counter/tabla) cae solo como
el input compartido.

**Promovido de `OQ-ENGINE-14`** (que abrió el prototipo melee). Fue de las pocas veces que la wiki
no respondió todo lo necesario, así que la mecánica se aborda como diseño propio. Este doc es el
**SSoT vivo** de la fórmula: el [worklist §6](#6--estado--worklist-ssot) reemplaza al de la OQ, que
queda como puntero.

## Cómo leer — procedencia por claim

El source es incompleto/sucio; el doc marca de dónde viene cada afirmación (honestidad *techo ≠ mentira*,
arch-decisions §9). No confundir "adoptado" con "confirmado":

- **(b)** — wiki adoptada, **sin confirmar en partida** por nosotros (input de trabajo).
- **(c)** — **confirmado por prueba** propia (fixture/test o captura reproducible).
- **⚖** — **sentenciado contra la wiki** (el proyecto probó lo contrario; hoy ninguno acá).

> Aviso honesto: hoy el doc nace **mayormente (b)**. Eso es correcto, no un defecto — es el estado
> real de conocimiento del prototipo.

## Encuadre — el combo es el tejido conectivo de melee

Casi todo lo melee vive en la **órbita del combo**, por consumo **directo** (heavy) o **indirecto**
(mods de crit/status, HAE, wind-up, slam). El doc modela los **consumidores directos** (§4) e
**inventaría** los vecinos en órbita (§5), sin conflacionarlos. Cuatro buckets clasifican todo:

| # | Bucket | Rol |
|---|---|---|
| 1 | Productor / estado | `combo_count` y su ciclo — la variable de contexto que todos leen |
| 2 | Derivación / tabla | `combo_mult = tabla(combo_count)` — el único valor derivado |
| 3 | **Consumidores** | el corazón del contrato: cada uno + su transferencia + qué exige del engine |
| 4 | En órbita (no consumidores directos) | HAE, wind-up, slam-distancia — inventariados, diferidos |

---

## 2 — Bucket 1 · Productor / estado (`combo_count`)

Estado a **nivel arma** (arch-decisions §1: el arma es el nodo canónico; los perfiles son
subestructuras que lo consumen). En el engine es una **variable de contexto**
(`context.variables['melee_combo_count']` — nombre **melee-específico**: el combo hit de snipers y
el de semi-exaltadas son mecánicas distintas, no colisionar), leída por el modifier `MELEE_COMBO_MULT`
sintetizado en hidratación (gate `kind=melee` + perfil heavy) — **no** viene de `ModRepository` (único
punto nuevo respecto a CO). Declarado→emergente (§8):

- **Modo estático (C1-asumido):** el consumidor declara `melee_combo_count` (o directamente el tier) como input.
- **Modo dinámico (C2):** emerge del **timeline del jugador**. **Diferido.**

Ciclo (todo **(b)**, salvo lo indicado):

| Sub-mecánica | Dato | Notas |
|---|---|---|
| Acumulación | puntos ∝ stance damage mult (100% = 1 punto); blocking = 1/ataque; especiales (Rauta 2/pellet, cap 28) | |
| Decay | vacía total tras **5 s** de inactividad; Naramon Power Spike = decae por ticks (20/15/10/5) | C2 |
| Duration | base **5 s**, mín 0.1 s; excepciones por arma (Guandao 6s, Xoris ∞, …); fuentes aditivas (planas `s` / porcentuales `%`) | |
| Initial combo | innato en algunas armas (Synoid Heliocor 20, Fragor Prime 30); regen 40 pts/s | |

> **C2 del combo ≠ C2 de CO.** El counter es **estado del lado jugador que se escribe** (el heavy lo
> consume, §5 HAE); el C2 de CO (`EnemyState.processDots`) es lado enemigo y read-only. Son dos máquinas
> de estado distintas — **no colapsar** en "el sistema temporal".

## 3 — Bucket 2 · Derivación / tabla (`combo_mult`)

Un **único valor derivado** vía fórmula dedicada `melee-combo`
(`formulas/weapon/melee-combo.ts`, `meleeComboMult(count)`). **Melee-específica
por nombre** — NO `weapon-combo`: el combo de sniper/incarnon es otra familia (Abstracción A diferida,
§10) y un nombre genérico se malinterpreta.

```text
combo_mult = min(12, 1 + floor(combo_count / 20))     cap 12x     (b tabla / c mecánica)
```

La **tabla** sigue siendo (b) (wiki); que el heavy **la consuma ×** está confirmado in-game (c) por el
tooltip *"Damage is increased by Combo Multiplier, but consumes Combo Count"*.

Es la **"tabla siempre igual"** del catálogo estándar. La misma tabla para las ~150 armas melee base.

> **Excepciones = passive, no combo.** Venka Prime (13x @240) y Dex Nikana (11x @110) desvían la tabla,
> pero eso es propiedad de su **unique trait (pasiva)** — mecánica aparte, **diferida** (demasiadas armas,
> dato no consolidado en ningún lado). **No se modela acá**; se atribuye a su dueño y sigue. Modelar el
> catálogo estándar primero, los aislados después.

## 4 — Bucket 3 · Consumidores (el corazón)

Cada consumidor es un **mini-contrato**: qué transferencia aplica sobre `combo_mult`, a qué nodo, con qué
operación/bucket, en qué perfil/gate, de qué fuente, su estado y su procedencia. Esta es la unidad de
"dato de consumo" (granularidad alta a propósito, hasta que el código hable por sí mismo).

| Consumidor | Transferencia | Nodo destino | Operación / bucket | Perfil / gate | Fuente | Estado | Proc. |
|---|---|---|---|---|---|---|---|
| **Heavy slam** | identidad (× `combo_mult`) | `WEAPON_ADD_DAMAGE` | `multiplicative` | perfil `heavy_slam_attack` | intrínseco (hidratación) | **✅ ejecutado** | (c) |
| **Heavy ground** | identidad (× `combo_mult`) | `WEAPON_ADD_DAMAGE` | `multiplicative` | perfil sintético — **no en `attacks[]`, pero sí en el export**: `heavyAttackDamage` está en las 223 melee y **no es derivable** (de `1×` a `18×` el `totalDamage`, per-arma). El pipeline lo descarta | intrínseco | **difiere** (comparte perfil `base` con el light + capa stance) | (b) |
| **Blood Rush** | escalar (`val × combo_mult`) | `WEAPON_ADD_CRIT_CHANCE` | `ADD` (mods_add_pct) | mod, sin gate (combo 0 → mult 1, siempre activo) | ModRepository | **✅ ejecutado (2026-07-10)** | (c) |
| **Weeping Wounds** | escalar (`val × combo_mult`) | `WEAPON_ADD_STATUS_CHANCE` | `ADD` (mods_add_pct) | mod, sin gate (combo 0 → mult 1, siempre activo) | ModRepository | **✅ ejecutado (2026-07-10)** (mismo op, sin test propio — Blood Rush lo valida) | (c) |
| **Habilidades** | ratio 1:0.25 (o completo si Ability Combo Counter) | (fuera del grafo de arma) | fórmula dedicada | ability (§2/§3) | ability domain | diferido | (b) |
| **Light attack** | **∅ (no consume daño)** | — | — | perfil `normal` | — | **sentenciado como dato** | (b) |

### 4.1 Heavy attack — consumidor primario (✅ ejecutado 2026-07-05)

> **Términos: "heavy" y "slam" son dos ejes ORTOGONALES, no un espectro** (corrección del estrés
> 2026-07-05, confirmada en partida). Un golpe melee se clasifica por tres ejes independientes:
>
> | Eje | Pregunta | Qué decide | Dato Nikana Prime |
> |---|---|---|---|
> | **combo** (light/heavy) | ¿qué tecla? (E vs rueda) | si **consume combo** y multiplica ×`combo_mult` | light no; heavy sí |
> | **slam** (suelo/aire) | ¿de dónde viene? | radial AoE 6m + falloff + factor altura (§5) | slam = salto→suelo |
> | **stance** (¡3er eje!) | ¿qué stance? | `n%` del Attack **por golpe** + procs forzados + la secuencia | Savage Tiger = 250%/golpe |
>
> Cruzando combo × slam, el dato de arsenal da: Normal **198** · Slam(light) **396** · **Heavy Slam 594** ·
> Heavy(suelo) **990**. El `combo_mult` como daño vive en la **fila heavy** (celdas 3 y 4); el light nunca (§4.2).

**El heavy slam es la única celda heavy que esquiva el eje stance** (el slam lo define el ARMA, 594; el
heavy de suelo lo define la STANCE, 250%×hits). Por eso es el primer vehículo honesto: aísla el `combo_mult`
sin arrastrar el sistema de stances (no capturado en `references/*`, diferido).

**No es zero-code** como el hit-base (que salió gratis por ser accumulator puro): el heavy necesita **leer
un factor de contexto en tiempo de resolución** — igual que `resolveConditionOverload`. Es **una
unidad-mecánica hermana de `CONDITION_OVERLOAD`**:

- Operación de **familia propia** `MELEE_COMBO_MULT` (NO `COMBO_MULT` genérico — el combo sniper/incarnon
  es otra familia; §10, "no genericizar el disparador"), **no** reusar `CONDITION_OVERLOAD`.
- Fórmula `melee-combo` (§3, `meleeComboMult`) en vez de `coBonusPct`.
- Ruteo fijo `multiplicative` sobre el perfil `heavy_slam_attack`. A diferencia de CO no hay `co_behavior`
  que elija bucket — el ruteo del heavy es único.
- Factor `melee_combo_count` como **variable de contexto nombrada** (`Modifier.melee_combo_factors {count_var}`,
  hermana de `co_factors`; nombre melee-específico), declarada en estático / emergente en dinámico. **No se bakea el producto.**
- El modifier se **sintetiza en hidratación** (`StaticHydrator`, gate `kind=melee` + perfil `heavy*`):
  es intrínseco, no viene de `ModRepository`. **Primer modifier-de-mecánica nacido en hidratación**
  (bendecido §10, Cedo pasiva). `melee_combo_count` ausente ⇒ ×1 identidad (pega base, no dropea).

Esto **es** la promesa de §8 (mecanismo por mecanismo), no una reapertura de arquitectura. **Trampa
evitada:** bakear `combo_mult` en hidratación (mata el reuso estático→dinámico); un `value_from` genérico
(resucita el `CONTEXT_SCALE` que §9 mató). Con **dos** mecánicas encapsuladas ahora (CO + melee-combo), la
capa genérica (Abstracción A) sigue **diferida** (§10) hasta que su forma común emerja — heavy se
construyó como **hermano** de CO, no unificado.

Cierre: `nikana-melee.test.ts` §3 — `594 × combo_mult` sobre `heavy_slam_attack`, propaga al nodo blast,
cap 12x, gate de perfil (el `base` no recibe combo). Base 594 = arsenal (combo 0 → ×1) = `@wfcd`.

### 4.2 Light attack — no consumidor (dato, mata un fantasma)

Verbatim wiki: *"Melee Combo Multiplier does not multiply the damage of your normal attacks."* **No existe
"tabla light"** (era confusión con Damage 2.0 antiguo). El light se beneficia del combo **solo indirecto**
vía Blood Rush / Weeping Wounds (crit/status), nunca como multiplicador de daño. Se registra como **dato**
para que nadie lo re-abra.

### 4.3 Blood Rush / Weeping Wounds — familia `COMBO_SCALED_ADD` (✅ ejecutado 2026-07-10)

Consumidor **indirecto** del light (§4.2): escala crit/status chance por `combo_mult`, no daño. **5ª
mecánica de familia** (hermana de `CONDITION_OVERLOAD`/`MELEE_COMBO_MULT`/`SNIPER_COMBO_MULT`,
`arch-decisions §10`), con una diferencia real respecto a Heavy Slam:

- **Trae `value` propio.** Heavy Slam es intrínseco (identidad ×`combo_mult`, sin dato propio); Blood
  Rush/WW son **mods reales** (`ModRepository`, rank-based) — el efecto es `value × meleeComboMult(count)`,
  no una identidad.
- **Ruteo FIJO `ADD`** (mods_add_pct), no `multiplicative` — el escalar de combo amplifica el valor del
  mod, no reemplaza el nodo.
- **`condition: 'per_melee_combo_multiplier'` en el dato NO es un gate booleano** — es escala disfrazada
  de condición, misma trampa que `per_status_type_on_target` tuvo para CO (`conditions.md`). La nota de
  fórmula del propio override lo confirma: `actual crit chance = val × combo_mult`. `ModRepository`
  reconoce el token y descarta el `condition` (no pasa por `evalCondition`), construye `COMBO_SCALED_ADD`
  directo — mismo patrón que `StaticHydrator` sintetiza `MELEE_COMBO_MULT` a mano, pero disparado por
  dato (no intrínseco por perfil).
- **Sin gate real:** a combo 0, `meleeComboMult(0) = 1` (tier base, no 0) → el mod siempre contribuye
  al menos su valor pleno. La entrada previa de la tabla §4 ("gate combo>1") era imprecisa — corregida.

Cierre: `nikana-melee.test.ts` §5 — Blood Rush rank 10 (+40%), combo 0/20/240(cap 12x) sobre
`WEAPON_ADD_CRIT_CHANCE`, perfil `base` (light — Blood Rush no exige heavy). Weeping Wounds comparte
el mismo `op` y trigger; sin test propio (la mecánica ya está validada por Blood Rush, mismo camino de
código, solo cambia el nodo destino).

## 5 — Bucket 4 · En la órbita del combo (no consumidores directos)

Vecinos inventariados, **no modelados** — cada uno diferido a su propio caso+dato:

| Vecino | Relación con el combo | Por qué NO es consumidor directo | Nodo | Estado |
|---|---|---|---|---|
| **HAE** (Heavy Attack Efficiency) | define **cuánto counter consume** el heavy | toca el *productor* (consumo del `combo_count`), no el `combo_mult` | `WEAPON_BASE_HEAVY_EFFICIENCY` | diferido; pool plano base 0%, suma directa, **cap 90% = primer clamp** del engine (§4.5, no toca daño → bajo riesgo) (b) |
| **Wind-up speed** | timing del heavy (que consume combo) | velocidad de carga, ortogonal al multiplier | `WEAPON_ADD_HEAVY_CHARGE_SPEED` | diferido; `Tiempo = base / (1 + Σbonus%)`, aditivo (b) |
| **Slam — falloff radial** | posición dentro del radio: centro 100% → borde N% | falloff por distancia al impacto, ≠ combo | `WEAPON_ADD_SLAM_RADIUS` | **está en el dato** (`@wfcd falloff`): Nikana `start 0, end 6m, reduction 0.5` → 50% en el borde (tooltip confirma). El heavy modelado es el **centro 100%** (c) |
| **Slam — bonus por altura** | factor que se apila **sobre** el heavy slam por altura de caída | usa `flight_distance`, factor propio ≠ combo | `WEAPON_ADD_SLAM_DAMAGE` | **`difiere` por dato — la curva altura→daño NO está en wiki ni `@wfcd`; capturar en partida. No asumir** (b) |

> El heavy slam base ya servido (Nikana 594, blast) es **stat puro**, sin el multiplicador de combo ni el
> factor de distancia. Es la base del perfil, no el slam completo.

> ⚠️ **El slam tiene dos mitades y modelamos una: la radial.** El export trae el par —impacto directo
> al enemigo golpeado y daño radial en área— para las 223 melee. El wiki **no**: su módulo modela el
> slam como AoE puro con `falloff`, y publica sólo el radial. No es el parser descartando un campo; el
> dato no está en esa fuente.
>
> Nikana Prime: export `slamAttack 594` / `slamRadialDamage 396`, `heavySlamAttack 792` /
> `heavySlamRadialDamage 594`. Wiki (nuestro `attacks[]`): *Slam Attack* 396 con `falloff end 6`,
> *Heavy Slam Attack* 594 con `falloff end 7`. Las dos fuentes **coinciden en el radial** —los radios
> también (`slamRadius 6`/`heavySlamRadius 7` = los `falloff.end`)—. El 594 de este ladrillo está bien;
> es el heavy slam **radial**, y "el centro 100%" significa el centro del área, no el impacto directo.
>
> **Lo que servimos es derivable y por eso no perdimos nada ahí:** el radial es exactamente `2×` el
> `totalDamage` en el slam y `3×` en el heavy slam, **constante en las 223 armas, sin excepción**.
>
> **Lo que sí se pierde es información real:** `slamAttack` (el impacto directo) vale `3×` en 170 armas
> pero `2×` en 53 — no es derivable. Falta saber si se **suma** al radial sobre el enemigo golpeado o
> si es exclusivo; eso sí necesita partida. Ver `../../source/gaps.md` §G-3.

## 6 — Estado / worklist (SSoT)

Reemplaza el worklist de OQ-ENGINE-14. Patrón §8/§9/§10 (cada mecánica con su caso+dato real, no scaffolding).

**✅ Ejecutado:**
- **Estrato 1 — hit-base melee** (2026-07-04, `nikana-melee.test.ts` §1): grafo genérico resuelve los 3
  perfiles a stat-base **sin cambios al motor** (`kind=melee` solo evita `isWarframe`; `attack_speed=fire_rate`).
  Confirma §1. **(c)**
- **CO melee** (2026-07-04, `nikana-melee.test.ts` §2): reusó `CONDITION_OVERLOAD`; default `co_behavior`
  `kind=melee → adding`. Cierra la familia CO. **(c)**
- **Heavy Slam multiplier** (2026-07-05, `nikana-melee.test.ts` §3, §4.1) — modifier `MELEE_COMBO_MULT`
  sintetizado en hidratación (lee `melee_combo_count`) + fórmula `melee-combo` (`meleeComboMult`) + operación
  de familia (hermana de CO) + `melee_combo_factors {count_var}` + bucket `multiplicative` fijo en perfil `heavy_slam_attack`. Valida
  factor→fórmula→bucket→perfil sobre dato real (594 = arsenal = `@wfcd`). **Primer consumidor de daño.** **(c)**
- **Bug co_behavior melee corregido** (2026-07-05) — el heavy slam es `shot_type=AoE` → caía en el default
  gun `AoE→none` y CO no aplicaba. Confirmado en partida que **CO melee es aditivo siempre** → `ItemRepository`
  ahora resuelve `kind=melee → adding` ANTES del switch por shot_type (arch-decisions §9). **(c)**
- **CO × Heavy Slam** (2026-07-05, `nikana-melee.test.ts` §4) — las dos mecánicas de familia componen en
  buckets separados: `594 × (1 + CO%) × combo_mult` (adding × multiplicative). **(c)**
- **Sniper Shot Combo** (2026-07-05, `lanka.test.ts`) — **3ra mecánica de familia**, hermana del melee combo
  pero fórmula LOGARÍTMICA (`sniperComboMult`, `1.5 + 0.5·⌊log₃(count/minCombo)⌋`) y con `min_combo` por-arma
  (dato del override, ausente en `@wfcd`). Pasivo (todo shot scoped). Lanka minCombo=2: `525 × 1.5/2.0/2.5`.
  Ref: `references/wiki/mechanics/sniper-combo.md`. **(c)**
- **Abstracción B — tabla de dispatch** (2026-07-05) — la cascada `if (op === 'X')` de `resolveNode` → registro
  `FAMILY_RESOLVERS`. Prueba: la 3ra mecánica (sniper) entró como 1 entrada + 1 resolver, **cero cambios a
  `resolveNode`**. Ver arch-decisions §10.
- **Abstracción A — cierre en el TIPO** (2026-07-05) — la 3ra mecánica disparó el trigger: `Modifier` pasó a
  **discriminated union por `operation`** (`AccumulatorModifier | CoModifier | MeleeComboModifier | SniperComboModifier`).
  El compilador exige los factores por variante y mató el `value` muerto de los combos; productores dinámicos vía
  factory `makeModifier`. Ver arch-decisions §10.
- **Blood Rush / Weeping Wounds — familia `COMBO_SCALED_ADD`** (2026-07-10, §4.3) — **5ª mecánica de
  familia**, primer caso donde un mod DINÁMICO (no intrínseco) necesita `melee_combo_factors`: nuevo op
  `COMBO_SCALED_ADD` + variante `ComboScaledAddModifier {value, melee_combo_factors}` + resolver
  `resolveComboScaledAdd` (ruteo fijo `ADD`) + `ModRepository` reconoce `condition:
  'per_melee_combo_multiplier'` como escala-no-gate y sintetiza el modifier directo (bypassa
  `makeModifier`, que ahora rechaza explícitamente `COMBO_SCALED_ADD` igual que los otros combos).
  **(c)** `nikana-melee.test.ts` §5.

**⏸ Diferido (con motivo):**
- **Heavy ground (§4.1 celda 3)** — comparte perfil `base` con el light (no se le puede colgar `MELEE_COMBO_MULT`
  sin contaminar el light) + su daño lo define la **stance** (990 sin stance = 5× normal). Necesita perfil
  sintético `heavy_attack` + la capa stance. **No es "normal + slam"** — es su propia celda sin perfil de dato.
- **Capa stance (§4.1, 3er eje)** — `n%` del Attack por golpe + procs forzados + la secuencia del combo
  (ej. Savage Tiger 250%/golpe). Mecánica propia, órbita del heavy de suelo y del light. **Gap de `references/*`**:
  no está capturada (mucha info). Puntero, no captura.
- **C2 dinámico del `combo_count`** — timeline del jugador (hits + decay 5s + Naramon). Suelo aún no existe (§8).
- **Validación con enemigo aplicado** — un combat capture (ej. 4275 = heavy slam crit vs Arid Butcher lvl 215)
  valida la **tubería completa** (crit aplicado + armadura), no el C1 de este ladrillo. El fork soporta modelar
  un enemigo de prueba (dato en `references/*`); camino de validación **futuro**, fuera del `combo_mult` (§8).
- **Slam falloff radial (§5)** — ya en el dato (`@wfcd falloff`); el ladrillo modela el centro 100%. El
  **bonus por altura** de caída sí difiere (falta la curva altura→daño).
- **Forced status en slam** — Nikana aplica Impact forzado en slam (tooltip). Entra como **duda** (no universal),
  del modelo de status (`damage-status-model.md`), no del `combo_mult`.
- **HAE / wind-up (§5)** — stats planos; HAE = primer clamp cuando entre.
- **Passives que desvían la tabla (§3)** — Venka/Dex Nikana; dato no consolidado, demasiadas armas.
- **Abstracción A (capa genérica de combo: sniper/incarnon/melee)** — arquetipo real, pero §10 la difiere
  hasta que la forma común emerja de las mecánicas encapsuladas (hoy CO + melee-combo), no en analogía.

## 7 — Vínculos

- [`arch-decisions.md`](./arch-decisions.md) §8 (input→simulado) · §9 (patrón CO) · §10 (partición condition-scaled)
- [`formulas-integration.md`](./formulas-integration.md) — frontera grafo↔fórmula dedicada
- [`../test/gap-map.md`](../test/gap-map.md) — mecánico-genérico vs ability-like
- [`references/wiki/mechanics/melee-combo.md`](../../../../references/wiki/mechanics/melee-combo.md) — **source** (captura de wiki)
- [`OQ-ENGINE-14`](../../../governance/open-questions.md) — puntero (promovido a este doc)
