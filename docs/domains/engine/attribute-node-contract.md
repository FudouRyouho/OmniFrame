---
Estado: "activo"
Rol: "Definir el contrato de AttributeNode: qué modela cada campo, su capa en la fórmula de Warframe y la operación de modificador que lo alimenta"
Impacto_ID: "E-AttributeNode"
Fidelidad_Fisica: "Project/src/core/engine/contracts/primitives.ts"
Fecha_de_creacion: "2026-05-19"
Fecha_de_actualizacion: "2026-07-29"
Dependencias:
  - "docs/domains/engine/design/vocabulary.md"
  - "docs/domains/engine/design/arch-decisions.md"
  - "references/wiki/mechanics/calculating-bonuses.md"
  - "references/wiki/mechanics/critical-hits.md"
---

# Contrato de AttributeNode

## Por qué existe este documento

`AttributeNode` no fue diseñado de forma explícita — emergió orgánicamente de la estructura multiplicativa de las fórmulas de Warframe. Sus campos mapean directamente a las capas de acumulación del juego. Este documento formaliza esa correspondencia: **campo por campo, qué modela y qué operación lo alimenta**.

**Alcance — qué NO es.** Este doc es el **contrato del tipo**. El **idioma** (qué significan *node*, *bucket*, *pool*, *flat*, *multiplicador independiente*) es SSoT de [`design/vocabulary.md`](design/vocabulary.md) — no se redefine acá. Este doc **usa** ese vocabulario.

**Base empírica:** `references/wiki/mechanics/` contiene las fórmulas verificadas del juego. Este documento define cómo el engine las modela, sin reemplazar esa fuente.

---

## La fórmula maestra del engine

```
withMods = (base + base_flat) × (1 + mods_add_pct / 100)
final    = (withMods + total_flat) × multiplicative
```

(Implementación: `formulas/weapon/stat-accumulator.ts::resolveStatValue`.)

Para los **daño-tokens** (`WEAPON_ADD_<TYPE>_DAMAGE`) de una entidad arma se aplican además los factores de los **pools globales** (`arch-decisions §16`):

```
final = final × poolFactor(WEAPON_ADD_DAMAGE) × poolFactor(GAMEPLAY_MULT_FACTION_DAMAGE)
```

donde `poolFactor(n) = n.final / n.base` (= `1 + Σ` del pool). Ver §5.

---

## Tabla de campos

`base` y `final` **no son buckets** — son el **input** y el **output** del nodo (criterio y reductio en [`design/vocabulary.md §1`](design/vocabulary.md)). Los **4 buckets** son los acumuladores: lo único que se llena con contribuciones y lo único que resetea `resetAccumulators()`.

| Campo | Rol | Capa de la fórmula de Warframe | `Modifier.operation` | Ejemplo de fuente |
|---|---|---|---|---|
| `base` | **input** | Valor base del item (del dataset) | — inyectado en hidratación | Stat del arma, armor del warframe |
| `base_flat` | bucket (flat) | Adición plana al base, antes de mods porcentuales | `BASE_FLAT` | Arcane con bonus flat a stat base |
| `mods_add_pct` | bucket (pool) | Pool aditivo principal — sus miembros suman entre sí | `ADD` | Serration, Heavy Caliber, Hornet Strike, Pressure Point |
| `total_flat` | bucket (flat) | Adición plana post-mods, antes del multiplicativo | `ADD_FLAT` | Arcane Dexterity (daño flat absoluto) |
| `multiplicative` | bucket (independientes) | Multiplicadores **independientes** — cada fuente multiplica por separado, no suman entre sí | `MULTIPLICATIVE` | CO "Multiplying", melee/sniper combo, Eclipse (Mirage)¹ |
| `final` | **output** | Resultado resuelto — solo lectura | — calculado | Lo que lee la UI |

¹ Eclipse: ver §4.

> ⚠️ No hay op de override terminal. `SET` fue **purgado** (F1-C) por muerto: escribía `final` y el recompute de cierre de `resolveNode` lo pisaba, sin productores. Si un mecanismo futuro necesita override terminal, su forma correcta depende del modelo de resolución — re-proponer entonces (ver [`design/vocabulary.md`](design/vocabulary.md) L-7).
>
> ⚠️ **Tampoco hay un segundo pool porcentual.** `base_add_pct` (op `BASE_ADD_PCT`) fue **purgado** por el mismo criterio que `SET`, y su caso es más nítido: nació en este contrato —no en código— motivado por el crit chance relativo de Point Strike, y ese caso lo resuelve `mods_add_pct`. Nunca tuvo emisor y **no podía tenerlo**: `OPERATION_MAP` deriva la op del segmento D-6 del token (`ADD`/`FLAT`/`BASE`/`MULT`) y ninguno produce `BASE_ADD_PCT`. **Condición de reapertura:** un mecanismo real que necesite un pool porcentual que componga **multiplicativamente** con `mods_add_pct` — `(1+a)×(1+b)`, no `(1+a+b)`. El aditivo ya existe; lo que se purgó es el multiplicativo-entre-pools, y ése es el único que justifica traerlo de vuelta.

---

## Semántica por capa

### `mods_add_pct` — el pool aditivo principal

Todos los mods de daño global (+X% de daño) se acumulan en este bucket:

```
WEAPON_ADD_DAMAGE.mods_add_pct = Serration(165) + HeavyCaliber(165) = 330
→ factor del pool: 1 + 330/100 = 4.30×
```

Los mods de Condition Overload con comportamiento **"Adding"** también apilan aquí. Ver `references/wiki/mechanics/condition-overload.md §Behavior types`.

### `multiplicative` — multiplicadores independientes

Cada fuente multiplica por separado (no apila aditivamente con nadie):

```
final = … × (1 + co_mult%) × comboMult × …
```

Los mods de Condition Overload con comportamiento **"Multiplying"** van acá, igual que el multiplicador de combo (melee/sniper). Ver `arch-decisions §9/§10`.
> **Faction damage y Roar NO van en `multiplicative`.** Son un **pool** (`GAMEPLAY_MULT_FACTION_DAMAGE`): sus miembros usan op **`ADD`** y **suman entre sí** (`×(1 + roar + bane)`, no `×(1+roar)×(1+bane)` — verificado in-game, `references/ingame-tests/double-dip.md`). ⚠️ El `_MULT_` del token es un **error de nombre** (por D-6 la op sería `MULTIPLICATIVE`; la real es `ADD`) — **no** una señal de que el pool se aplique multiplicativamente: eso vale para todo pool global, y el de Serration se llama `_ADD_`. Ver §5, `arch-decisions §16` y `design/vocabulary.md` L-8.


### El crit chance y sus dos términos

La fórmula de critical hits (`references/wiki/mechanics/critical-hits.md`) tiene **un** término relativo y **uno** absoluto:

```
totalCritChance = baseCritChance × (1 + relativeCritBonus) + absoluteCritBonus
```

- `baseCritChance` → **`base` + `base_flat`**. Lo que llena `base_flat` es `WEAPON_BASE_CRIT_CHANCE`, cuyos 66 emisores son perks incarnon cuyo texto de juego dice literal *"Increase **Base** Critical Chance"*. Se amplifica con los mods relativos, que es exactamente lo que `(base + base_flat) × (1 + mods_add_pct)` modela. **Correcto.**
- `relativeCritBonus` → **`mods_add_pct`**. `WEAPON_ADD_CRIT_CHANCE` con op `ADD`. Point Strike entra por acá.
- `absoluteCritBonus` → **sin token**. Es el término post-escala, así que su bucket sería `total_flat` y su segmento D-6 sería `FLAT` — pero **`WEAPON_FLAT_CRIT_CHANCE` no existe**, mientras su hermano `WEAPON_FLAT_STATUS_CHANCE` sí. La asimetría es real y verificable en `UPGRADES`.

> El `⚠️ sin verificar` que este párrafo arrastraba planteaba mal el problema: no había un mapeo equivocado de `absoluteCritBonus`, había **dos términos distintos leídos como uno**. `base_flat` nunca modeló el término absoluto — modela el aditivo-al-base, y lo hace bien. Lo que queda abierto es más chico y más preciso: **el término absoluto no tiene puerta de vocabulario**, y clasificar qué fuentes reales le pertenecen (candidato: Arcane Avenger, hoy en `WEAPON_ADD_CRIT_CHANCE`/relativo) **no se puede resolver con el corpus local** — `references/wiki/mechanics/critical-hits.md` da la fórmula pero no enumera qué fuente cae en cada término. Requiere test in-game. Registrado como inexpresable en [`../../semantic/upgrade-tokens.md`](../../semantic/upgrade-tokens.md).

---

## Notas de ejemplos

### ¹ Eclipse (Mirage)

Eclipse provee hasta `STR × 200%` de bonus de daño (fuente: `references/wiki/sources/maximization-data.lua`). Está expresado como porcentaje y se aplica **fuera** del pool aditivo de Serration — lo que lo ubicaría en `multiplicative`.

⚠️ **Pendiente de verificación**: confirmar contra la wiki si Eclipse es `(1 + bonus%)` multiplicativo puro, o si comparte pool con facción (como Roar), o si tiene interacción especial con luz/sombra. **Sin consumidor real hoy** — no modelado.

---

## Mods elementales — caso especial

Los mods elementales (Heat, Cold, Electricity, etc.) **no** modifican un daño-token existente vía bucket. En su lugar, `DamageCombiner` los procesa en hidratación para crear o combinar tipos de daño en la entidad.

El ordenamiento de slots de mods determina qué elementos se combinan primero (Heat + Cold = Blast, etc.). La ley de combinación es SSoT única en `formulas/common/status-base.ts` (deduplicada). Ver `references/wiki/mechanics/damage-types.md §Reglas de combinación`.

Una vez que `DamageCombiner` produce el breakdown final de daño, cada tipo resultante se inyecta como un `AttributeNode` nuevo (`base` = el valor combinado). Desde ese punto participan en el sistema de buckets como cualquier otro atributo.

---

## 5. Los pools globales — `WEAPON_ADD_DAMAGE` y `GAMEPLAY_MULT_FACTION_DAMAGE`

Ambos son `AttributeNode` **sintéticos** inyectados por `StaticHydrator` en toda entidad **no-warframe**, con `base: 100`, alimentados por mods op `ADD`, y consumidos por `calculateCurrentValue()` como **factor** (`final / base`) sobre cada daño-token.

| Nodo | Base | Alimentado por | Consumido por |
|---|---|---|---|
| `WEAPON_ADD_DAMAGE` | 100 | Serration/Heavy Caliber… (op `ADD`) | `calculateCurrentValue()` — multiplica todos los daño-tokens de la entidad |
| `GAMEPLAY_MULT_FACTION_DAMAGE` | 100 | Roar (op `ADD`, cross-entity vía `source_entity`) | `calculateCurrentValue()` — ídem. **NO** alimenta el DoT (double-dip = `OQ-ENGINE-20`) |

**Flujo (Serration):**
1. `StaticHydrator` inyecta `WEAPON_ADD_DAMAGE { base: 100 }`
2. Serration genera `Modifier { target_attribute: "WEAPON_ADD_DAMAGE", operation: "ADD", value: 165 }`
3. El grafo resuelve los pools **antes** que los daño-tokens (arista estructural en `rebuildGraph`)
4. `calculateCurrentValue()` aplica `poolFactor` de cada pool a cada daño-token

**Restricción de dominio:** ninguno de los dos se inyecta en entidades `kind: warframe` — Serration no afecta daño de habilidades en el juego.

**Estado de facción (`arch-decisions §16`):** los mods de facción (Bane/Expel/Cleanse) son **`C2·F`** — su gate depende de la facción del target, que vive en `EnemyState`/③, **no** en el `SimulationContext` de C1 → no se pueden gatear en el grafo. Por eso hay un **shim FLAGGED** (`ModRepository.C2F_FACTION_TOKENS_DEFERRED`): **no se emiten como modifier C1**. El pool C1 de facción queda para bonos **incondicionales** (Roar, que no gatea por facción). Borrar el shim al normalizar la semántica del token y migrar el bonus a resolución.
> **Token ≠ attr.** `WEAPON_ADD_DAMAGE` es a la vez el **token** ("% aditivo al daño global" — lo llevan Serration/Hornet Strike) y el nombre del **attr** (el **daño global**, raíz de la familia). Su `base` es un **dato real** (`damage_sum` innato, vía `ItemRepository`); el `100` de `StaticHydrator` es solo **fallback**. `GAMEPLAY_MULT_FACTION_DAMAGE`, en cambio, sí tiene base sintética `100` (no hay dato). Ver [`design/vocabulary.md §3`](design/vocabulary.md).
>
> **Estructura (DECIDIDO):** que un pool global se aplique leyendo el **ratio `final/base` de un nodo designado** es **`DC-OQ-ENGINE-1`** — decisión **cerrada**, no un hack: expresa el pool **aditivo** (Step 1 de `calculating-bonuses.md`) como factor. Realizada en §16, ratificada in-game por la Fase 1a (facción con la misma primitiva). **No re-debatir** — ver [`design/vocabulary.md §5`](design/vocabulary.md) y `governance/closed-decisions.md`.


---

## Implicaciones para `ModRepository`

| Tipo de mod | Operation correcta | Estado |
|---|---|---|
| Daño global (Serration) | `ADD` sobre `WEAPON_ADD_DAMAGE` | ✅ Correcto |
| Faction damage (Bane/Expel/Cleanse) | `ADD` sobre `GAMEPLAY_MULT_FACTION_DAMAGE` | ⚠️ **Diferido** — `C2·F`, no se emite en C1 (shim FLAGGED). Ver §5 |
| Roar (habilidad, no mod) | `ADD` sobre `GAMEPLAY_MULT_FACTION_DAMAGE`, cross-entity (`source_entity`) | ✅ Construido — `AbilityRepository` lo produce desde el dato real (`upgrade_type` poblado); incondicional, esquiva el shim C2·F |
| GunCO "Multiplying" | `MULTIPLICATIVE` | ✅ Ruteado por `co_behavior` (`arch-decisions §9`) |
| Crit chance relativo | `ADD` sobre el nodo de crit | ⚠️ Correcto por casualidad (solo hay un bucket de crit hoy) |

---

## Validación: el nodo como superficie de aserción (prototipo VIGENTE)

> **Estado de esta sección:** prototipo en desarrollo con base documentada. Evolvable (VIGENTE) — se ajusta
> con el primer uso real. El workflow de testing derivado y el lineaje de decisión (D12–D16) viven en
> [`test/test-workflow.md`](test/test-workflow.md); las builds de referencia (Rhino, standard-set) en
> [`test/catalog-future.md`](test/catalog-future.md). Ya ejercido sobre 4 consumidores de arma (ver
> [`test/catalog-current.md`](test/catalog-current.md)); la validación con warframes sigue abierta.

Los campos nombrados de `AttributeNode` (`base` + los **4 buckets** + `final`) **son la superficie de aserción de los tests**, no solo el insumo de `final`.

- **Test de estabilidad** — asierta solo `final`. Dice *que* un resultado cambió; no localiza la causa.
- **Test de lógica** — asierta los **buckets intermedios**. Dice *dónde*: si cambió el `n` de una
  dependencia (mismo bucket, otro valor) o si el grafo ganó/perdió una dependencia (bucket nuevo o vacío).
  Ejemplo directo de §Semántica: Serration entra en `mods_add_pct` del pool `WEAPON_ADD_DAMAGE`; Roar en
  `mods_add_pct` del pool `GAMEPLAY_MULT_FACTION_DAMAGE` — **pools distintos, por eso multiplican entre sí**;
  distinguibles a nivel nodo, no a nivel `final`.

**Forma del fixture:** una `EnsembleIntention` escrita a mano + la **cadena de derivación esperada por
nodo** (bucket → valor + fuente del juego: wiki / `references/`), nunca un valor terminal suelto.

**Progresión:** un solo consumidor cuyo fixture crece en intenciones en orden de dependencia
(base → +ability → cross-entity); cada peldaño es una aserción separada, para que el fallo se localice.
**La base del linaje debe ser incondicional** — lo condicional/stacking (auras condicionales, arcanos con
stacks) entra como peldaño posterior con su supuesto explícito, nunca en la base reproducible.

---

## Lo que este documento no cubre

- **El idioma** (node/bucket/pool/flat/independiente) — [`design/vocabulary.md`](design/vocabulary.md).
- El **modelo de pools** y su deuda de estructura — [`design/arch-decisions.md §16`](design/arch-decisions.md).
- Fórmulas de DoT (Slash, Heat, Toxin ticks) — `references/wiki/mechanics/status-effects.md §DoT` + `design/damage-status-model.md`
- Resolución de crit tiers — `references/wiki/mechanics/critical-hits.md`
- Lógica de combinación elemental — `formulas/common/status-base.ts` (SSoT) + `references/wiki/mechanics/damage-types.md`
- Profile switching (Incarnon/base) — pendiente `OQ-ENGINE-2`