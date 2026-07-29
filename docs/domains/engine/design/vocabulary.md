---
Estado: "referencia"
Rol: "SSoT del vocabulario interno del engine — el idioma con el que @core se piensa"
Impacto_ID: "E-Vocabulary"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-07-17"
Fecha_de_actualizacion: "2026-07-29"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "references/wiki/mechanics/calculating-bonuses.md"
---

# Engine — vocabulario interno

**Qué es esto.** El **lenguaje propio de `@core`**: las palabras con las que la arquitectura del motor se
piensa a sí misma. No es vocabulario del juego.

**Qué NO es.** El vocabulario **del juego** (tipos de daño, facciones, condition/upgrade tokens) vive en
[`../../../semantic/`](../../../semantic/) y se **deriva de una taxonomía declarada** — un token se *compone*
desde un cuerpo (`{WEAPON,WARFRAME}_{ADD,MULT}_…`). Este doc es lo contrario: **no se deriva de nada**, *es*
el idioma. (Ruteo codificado en `docs/CLAUDE.md` §"Regla de enrutamiento".) Los **tags** de comunicación
(`engine:debt`) son otro eje: [`../../../governance/nomenclature-grammar.md`](../../../governance/nomenclature-grammar.md).

**Por qué existe.** Un vocabulario que crece sin SSoT **colisiona** — el mismo concepto termina nombrado dos
veces por ejes que crecieron por separado (`bucket②` fue el "pool de facción" hasta el LOCK L-2 — resuelto en §2), y la misma palabra cubriendo
conceptos sin relación (§6). En un flujo donde cada sesión arranca fría, eso no genera una duda: genera que
cada sesión lo **re-derive**.

---

## 1. La taxonomía canónica (LOCK — L-1 + L-2)

La fórmula que corre **cada nodo** (`formulas/weapon/stat-accumulator.ts::resolveStatValue`):

```
final = [ (base + base_flat) · (1 + mods_add_pct) + total_flat ] · multiplicative
```

Y su forma honesta, la de la SSoT del juego (`calculating-bonuses.md`: `Base × ∏_pools (1 + Σ) + ΣFlat`):

```
final = (base + Σflat_base) × ∏_pool(1 + Σ_pool) × ∏_indep(1 + x) + Σflat_post
```

| Término | Qué es | Criterio |
|---|---|---|
| **node** | Un **stat/atributo de una entidad** — donde corre la fórmula. `WEAPON_ADD_MULTISHOT`, `WEAPON_FIRE_RATE`, un daño-token. | Es la unidad que el grafo resuelve. |
| **base** | El **dato de entrada** del nodo. Viene de la **hidratación** (A→B, del profile/DNA del ítem). | **NO es bucket.** Nada lo acumula: no se escribe, se recibe. Los mods flat escriben `base_flat`, no `base`. |
| **bucket** | Una de las **4 ranuras acumuladoras** del nodo, cada una con **rol fijo** en la fórmula: `base_flat`, `mods_add_pct`, `total_flat`, `multiplicative`. | Un bucket es **lo único que se llena con contribuciones y lo único que se resetea**. **El código ya trazaba esta línea** (§1.1). |
| **pool** | Un **grupo de apilado ADITIVO**: sus miembros **suman entre sí** (`100% + 33%`) y el grupo entra como **`(1 + Σ)`**, multiplicando contra otros pools. | Serration y los demás base-damage = un pool. Roar + Bane = otro pool. Suman adentro, multiplican afuera. |
| **multiplicador independiente** | Multiplica **solo**: `× (1 + x)`. **NO suma con nadie.** | CO-`multiplying`, combo, crit. No entra a ningún pool. |
| **flat** | Suma **cruda**, sin `%`. | `base_flat` (pre-escala), `total_flat` (post-escala). No es pool: no lleva porcentaje. |
| **final** | La **salida** del nodo. | **NO es bucket.** Es el resultado, no un acumulador. |

### 1.1 Este LOCK no inventa nada: el código ya trazaba la línea

`contracts/primitives.ts::AttributeNode` **agrupa sus campos en exactamente estos 3 roles** — y llama
"Accumulators" a los buckets, sin que nadie lo hubiera escrito en un doc:

```ts
export interface AttributeNode {
  base: number;                  // ← input (sin comentario: no pertenece a ningún grupo)
  // Accumulators (Per Pass)     // ← los 4 BUCKETS, nombrados así por el código
  base_flat; mods_add_pct; total_flat; multiplicative;
  // Result
  final: number;                 // ← output
}
```

Y `SimulationEngine.resetAccumulators()` resetea **exactamente esos 4** (`multiplicative` a `1.0`, el resto a
`0`) — ni `base` ni `final`. ⇒ El criterio **rol, no pertenencia** ya estaba implementado; este doc lo
**nombra**, no lo decide. (Los conteos mayores que circularon —"6", "5"— salen de dos errores distintos,
ambos disecados en §2.)

### Las reglas duras que se derivan

1. **`base` y `final` NO son buckets.** El criterio no es *dónde vive* un campo (los 6 viven en
   `AttributeNode`) sino **qué rol cumple**. Por pertenencia, `final` también sería bucket — reductio.
   ⇒ **1 input (`base`) + 4 buckets + 1 output (`final`)**.
2. **`bucket` ≠ `pool`.** Están en **niveles distintos**: un bucket es una **ranura DENTRO** de un nodo; un
   pool es un **grupo de apilado**. Comparten la connotación "lugar donde algo se suma" — por eso colisionan
   si no se los define. No son sinónimos ni jerarquía trivial.
3. **El concepto es `pool`; `②`/`③` son calificadores de ETAPA, no clases.** (Etapas del trazado
   `① NACE → ② COMPONE-TRAYECTO → ③ RESUELVE-VS-TARGET`, `simulation-architecture §2.0`.) ⇒ **`pool②`**, no
   `bucket②`.

---

## 2. Renombres que este LOCK ordena (✅ ejecutados)

| Hoy | Canónico | Dónde |
|---|---|---|
| `bucket②` | **`pool②`** (hoy su único miembro es el pool de facción) | ✅ ejecutado: comentarios de código (`dot-tick.ts`, `effect-behavior.ts`, `damage-multipliers.ts`, `__tests__/status/harness.ts`) + design docs (`arch-decisions`, `damage-flow-model`, `damage-status-model`, `formulas-integration`, `engine/status.md`) + governance viva (`closed-decisions`, `open-questions`, `decision-frontier`). **NO** `melee-combo.md` ("Bucket 2" ahí = paso 2 del combo, otro concepto). |
| "6 buckets" / "5 buckets" | **"4 buckets"** | ✅ ejecutado: `output/consume.ts` (×3), `shared/view-model/index.ts`, `view-model.test.ts`, `ui-ux/presentation-layer.md`, `engine/test/test-workflow.md`, `formulas/weapon/stat-accumulator.ts`, `attribute-node-contract.md` (×2), `oracle/design/architecture.md` (×2), este doc. **NO** `engine-audit.md` (histórico: dice el conteo de su época y es correcto *como registro*). |

**El conteo se equivocó dos veces por razones distintas** — vale distinguirlas, porque la segunda es la que arrastra checklist:

- **6 → 5** fue un error de **criterio**: contaba `base` como bucket. Nada que purgar; se corrigió el conteo (§1.1).
- **5 → 4** fue un error de **inventario**: `base_add_pct` existía en el tipo y en el `switch` de `resolveNode`, pero era inalcanzable —`OPERATION_MAP` no tiene segmento que derive `BASE_ADD_PCT`— y nunca tuvo emisor. Acá **sí se purgó el campo**, y por eso el radio incluye código además de prosa. Acta de reapertura en [`../attribute-node-contract.md`](../attribute-node-contract.md).

**Decidir ≠ ejecutar:** el LOCK decide el nombre canónico; el renombre corre en una pasada aparte. Ambas filas ya corrieron — el código y los docs vivos dicen `pool②` / "4 buckets".

---

## 3. Token ≠ attr — la distinción que más confusión causa

**Un token D-6 NO es un nodo.** El token (`docs/semantic/upgrade-tokens.md`) tiene forma
`{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` y declara **dos cosas**: a qué **attr** apunta y con qué **op**
contribuye un mod que lo lleve. El **nodo** es el attr. Que el nodo suela **llamarse igual que el token**
(regla `attr = token`, auto-referencial) hace fácil confundirlos — pero son ejes distintos.

Caso testigo, `WEAPON_ADD_DAMAGE`:
- Como **token** = "% aditivo al daño global" (`ADD` → `mods_add_pct`). Lo llevan Serration / Hornet Strike /
  Pressure Point.
- Como **attr/nodo** = el **daño global** del arma (raíz de la familia, sin PREFIX). Su `base` es un **dato
  real**: `damage_sum` innato (`ItemRepository`), NO un 100 sintético — el `100` es solo fallback.

Ambas cosas son ciertas y no se contradicen. El `%` describe **la contribución del mod**; el `base` describe
**el dato del stat**. Ver `upgrade-tokens.md §Convención D-6`.

## 4. Inconsistencias abiertas del vocabulario de operaciones (verificadas)

La taxonomía declara *"OPERATION — **mapeo 1:1** con `Modifier.operation` del engine"* (`OPERATION_MAP`:
`ADD`→`ADD` · `BASE`→`BASE_FLAT` · `FLAT`→`ADD_FLAT` · `MULT`→`MULTIPLICATIVE`). **El motor honra 3 de 4:**

- **`GAMEPLAY_MULT_FACTION_DAMAGE`: el segmento dice `MULT`, la op del miembro es `ADD`** (`UPGRADE_MAP`
  la pisa). El `ADD` es **correcto y está verificado in-game** (`references/ingame-tests/`: Roar+Expel suman,
  hit `×(1+0.30+1.128)=×2.428`, ratio confirmado en 2 targets). **El error es el NOMBRE, no la op.** Estado:
  **parkeado** — el token no se emite en C1 (shim `ModRepository.C2F_FACTION_TOKENS_DEFERRED`), cuya salida
  ya declarada es *"normalizar la semántica del token (que codifique facción + gate)"*. No renombrar hasta
  entonces.
- **`MULTIPLICATIVE` es inalcanzable desde el vocabulario**: su único token posible es el de facción, pisado
  a `ADD`; ninguna entrada de `UPGRADE_MAP` la produce. El bucket `multiplicative` **sí se escribe**, pero
  **por fuera del vocabulario** — los family resolvers (CO-`multiplying`, melee/sniper combo) lo mutan
  directo. ⇒ dos caminos al mismo bucket: uno declarado (muerto) y otro real (no declarado).
- **`SET` fue PURGADO** (union + `case`). No era "sin terminar" sino **muerto**: 0 tokens, sin productor, y
  su `case` escribía `final` para que el recompute lo pisara (inalcanzable **y** roto). Distinto de MULT
  —que es un bucket real con semántica pendiente—, `SET` era una puerta muerta que mentía. Si un mecanismo
  real "setear a valor absoluto" aparece, se re-agrega con semántica de override (que `resolveStatValue`
  respete) contra un test real — un rename es un regex.

⇒ **`MULT` queda PENDIENTE**: la semántica del vocabulario de operaciones no está terminada, y cerrarla
exige el corpus real (mods/arcanos/habilidades), no una decisión de escritorio.

## 5. Estructura — el patrón `final/base` está DECIDIDO

Que un pool **global** se aplique leyendo el **ratio `final/base` de un nodo designado** **NO es un hack ni
una deuda**: es **`DC-OQ-ENGINE-1`** (cerrada, `governance/closed-decisions.md`). El ratio expresa el **pool
aditivo** (Step 1 de `calculating-bonuses.md`, `Base × (1 + ΣSerration + …)`) como factor aplicable a los
nodos por-tipo — la forma canónica del juego. Realización: `arch-decisions §16`. Primitiva:
`formulas/weapon/stat-accumulator.ts::globalDamageBucketFactor`.

Este doc lockea **el vocabulario**, no la estructura. La *colección* de pools globales sigue siendo
**implícita** (hardcodeada en `rebuildGraph` + `calculateCurrentValue`); declararla es un refactor de
realización — **compatible** con `DC-OQ-ENGINE-1`, no una alternativa a ella.

---

## 6. Colisiones abiertas (NO resueltas — no asumir)

Alcance de este LOCK = **L-1 + L-2**. Lo demás está inventariado y **pendiente**:

| ID | Colisión | Estado |
|---|---|---|
| **L-3** | **`pool` sobrecargado**: además del grupo aditivo, significa **contenedor de instancias de proc** (`HeatState.pool` con decay en `behaviors.ts`, dentro del estado por-efecto de `EnemyState`). | abierta |
| **L-4** | **`bucket` sobrecargado**: además de la ranura, existe **"Distance Bucket"** (banda de rango del falloff, `engine-audit.md`). | abierta |
| **L-5** | **"facción" sobrecargado**: (a) el **pool de bonus** de facción (Roar/Bane, etapa ②) vs (b) la **`matriz③`** facción×elemento del target (etapa ③). Dos mecánicas, una palabra. | abierta |
| **L-7** | **`base`/`final` sin nombre propio.** "Input"/"output" son demasiado genéricos, y **`final` ya se malinterpreta**: es el target de la *inicialización* (`resolve()` paso 1: `final = base`), se recomputa por pass (no es terminal), significa cosas distintas por rol (valor del stat vs numerador del factor `final/base` de un pool global). (El op `SET` roto —que escribía `final` para que el recompute lo pisara— era su víctima; ya purgado.) Bautizarlos si vuelve a morder. | diferida |
| **L-8** | **El token de facción miente** (`MULT` vs op `ADD`) — ver §4. **Parkeado** tras el shim C2·F; su salida ya está declarada en el propio shim. | parkeada |
| **L-9** | **Semántica de operaciones: CERRADA salvo un residuo nombrado.** El enunciado viejo (*"sin terminar, cerrarla exige el corpus real"*) ya tiene su corpus: los 1446 `upgrade_type` medidos. Resultado: **4 ops de acumulador ↔ 4 buckets ↔ 4 segmentos `OPERATION`, 1:1 y sin huecos** (`BASE_ADD_PCT` purgado por inalcanzable, `SET` por muerto). El residuo no es una indefinición sino **un hecho del corpus**: ningún token usa legítimamente el segmento `MULT` — el único que lo lleva es el de facción, cuya op real es `ADD` y cuyo nombre está mal (§4). ⇒ el bucket `multiplicative` se escribe **sólo por ops de familia** (CO-`multiplying`, melee/sniper combo), nunca por un token. Eso es **la frontera acumulador↔familia funcionando**, no una puerta rota: lo multiplicativo-independiente es mecánica, no mod. Se reabre si aparece un mod real cuyo efecto sea un multiplicador independiente declarado. ⚠️ **Warrant:** normalizar `OPERATION→ADD` en `resolveToken()` **ya se descartó** — fusionaría `AVATAR_FLAT_HEALTH_REGEN` (HP/s plano) con `AVATAR_ADD_HEALTH_REGEN` (%), **stats distintos**. No re-proponerlo. | cerrada con residuo |
| **L-10** | **`WEAPON_DAMAGE` = nombre pre-rename del nodo global** (hoy `WEAPON_ADD_DAMAGE`, token D-6 — D-7 Fase 2b). **0 líneas de código, 19 en 8 docs.** **Corregir (5):** `upgrade-tokens.md`, `incarnon/schema.md`, `simulation-contracts.md`, `data/decisions.md`, y **`engine/test/test-workflow.md:27` — `consume(…).node('WEAPON_DAMAGE')` TIRA** (`consume.ts` lanza si el nodo está ausente). **NO tocar:** `engine-audit.md §4.1` — `Estado: histórico`, dice el nombre de su época y es correcto *como registro*. | fix mecánico |

## Ligado a
- [`../../../governance/closed-decisions.md`](../../../governance/closed-decisions.md) **`DC-OQ-ENGINE-1`** (el patrón `final/base` — §5: **cerrado**, no re-debatir).
- [`arch-decisions.md`](arch-decisions.md) §4.1 (Stat Accumulator v3 — los 4 buckets), §16 (modelo de pools), §9/§10 (CO/combo = independientes).
- [`simulation-architecture.md`](simulation-architecture.md) §2.0 (las etapas ①②③ que califican `pool②`).
- `references/wiki/mechanics/calculating-bonuses.md` (la fórmula honesta, SSoT del juego).
- `docs/CLAUDE.md` §"Regla de enrutamiento" (por qué este doc vive acá y no en `semantic/`).
