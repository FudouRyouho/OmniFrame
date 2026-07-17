---
Estado: "referencia"
Rol: "SSoT del vocabulario interno del engine — el idioma con el que @core se piensa"
Version: "v1.0.0"
Impacto_ID: "E-Vocabulary"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-07-17"
Fecha_de_actualizacion: "2026-07-17"
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

**Por qué existe.** Auditoría `Engine fidelity+hygiene` (2026-07-17): se encontró el mismo concepto nombrado
de dos formas distintas en ejes que crecieron por separado (`bucket②` ≡ "pool de facción"), y palabras
cubriendo conceptos sin relación. Un vocabulario que crece sin SSoT **colisiona**; en un flujo donde cada
sesión arranca fría, eso no genera una duda: genera que cada sesión lo re-derive.

---

## 1. La taxonomía canónica (LOCK — L-1 + L-2)

La fórmula que corre **cada nodo** (`formulas/weapon/stat-accumulator.ts::resolveStatValue`):

```
final = [ (base + base_flat) · (1 + base_add_pct) · (1 + mods_add_pct) + total_flat ] · multiplicative
```

Y su forma honesta, la de la SSoT del juego (`calculating-bonuses.md`: `Base × ∏_pools (1 + Σ) + ΣFlat`):

```
final = (base + Σflat_base) × ∏_pool(1 + Σ_pool) × ∏_indep(1 + x) + Σflat_post
```

| Término | Qué es | Criterio |
|---|---|---|
| **node** | Un **stat/atributo de una entidad** — donde corre la fórmula. `WEAPON_ADD_MULTISHOT`, `WEAPON_FIRE_RATE`, un daño-token. | Es la unidad que el grafo resuelve. |
| **base** | El **dato de entrada** del nodo. Viene de la **hidratación** (A→B, del profile/DNA del ítem). | **NO es bucket.** Nada lo acumula: no se escribe, se recibe. Los mods flat escriben `base_flat`, no `base`. |
| **bucket** | Una de las **5 ranuras acumuladoras** del nodo, cada una con **rol fijo** en la fórmula: `base_flat`, `base_add_pct`, `mods_add_pct`, `total_flat`, `multiplicative`. | Un bucket es **lo único que se llena con contribuciones y lo único que se resetea** (`SimulationEngine.resetAccumulators()` resetea exactamente esos 5 — el código ya traza la línea). |
| **pool** | Un **grupo de apilado ADITIVO**: sus miembros **suman entre sí** (`100% + 33%`) y el grupo entra como **`(1 + Σ)`**, multiplicando contra otros pools. | Serration y los demás base-damage = un pool. Roar + Bane = otro pool. Suman adentro, multiplican afuera. |
| **multiplicador independiente** | Multiplica **solo**: `× (1 + x)`. **NO suma con nadie.** | CO-`multiplying`, combo, crit. No entra a ningún pool. |
| **flat** | Suma **cruda**, sin `%`. | `base_flat` (pre-escala), `total_flat` (post-escala). No es pool: no lleva porcentaje. |
| **final** | La **salida** del nodo. | **NO es bucket.** Es el resultado, no un acumulador. |

### Las reglas duras que se derivan

1. **`base` y `final` NO son buckets.** El criterio no es *dónde vive* un campo (los 7 viven en
   `AttributeNode`) sino **qué rol cumple**. Por pertenencia, `final` también sería bucket — reductio.
   ⇒ **1 input (`base`) + 5 buckets + 1 output (`final`)**.
2. **`bucket` ≠ `pool`.** Están en **niveles distintos**: un bucket es una **ranura DENTRO** de un nodo; un
   pool es un **grupo de apilado**. Comparten la connotación "lugar donde algo se suma" — por eso colisionan
   si no se los define. No son sinónimos ni jerarquía trivial.
3. **El concepto es `pool`; `②`/`③` son calificadores de ETAPA, no clases.** (Etapas del trazado
   `① NACE → ② COMPONE-TRAYECTO → ③ RESUELVE-VS-TARGET`, `simulation-architecture §2.0`.) ⇒ **`pool②`**, no
   `bucket②`.

---

## 2. Renombres que este LOCK ordena (decidido; ejecución pendiente)

| Hoy | Canónico | Dónde |
|---|---|---|
| `bucket②` | **`pool②`** (hoy su único miembro es el pool de facción) | `dot-tick.ts`, `damage-multipliers.ts`, `effect-behavior.ts`, `engine/status.md`, `damage-flow-model.md`, `formulas-integration.md` |
| "6 buckets" | **"5 buckets"** (`base` no cuenta; era un conteo de *presentación*, no conceptual) | `output/consume.ts` (×3), `engine/test/test-workflow.md` |

**Decidir ≠ ejecutar:** el renombre es una pasada aparte. Hasta que corra, el código dice `bucket②`.

---

## 3. Drift conocido — el código NO habla este idioma todavía

Declarado para que el mapa no mienta:

- **Pools realizados como nodos falsos.** `WEAPON_ADD_DAMAGE` y `GAMEPLAY_MULT_FACTION_DAMAGE` **no son
  stats** (no son "un nodo" como multishot): son **pools disfrazados de nodo**. Causa: el acumulador tiene
  un **set cerrado de 2 ranuras aditivas** (`base_add_pct`, `mods_add_pct`), sin colección abierta de pools
  nombrados → un 3er pool (facción) no tuvo dónde vivir salvo inventando un nodo. Ver `arch-decisions §16`.
- **La estructura honesta (pools de 1ª clase, abiertos, con `scope` como propiedad) está EN DEBATE, NO
  decidida.** Este doc lockea **el vocabulario**, no la estructura. No implementar sobre la base de que ya
  esté resuelto.
- **`arch-decisions §16`** usa "pools" de forma consistente con este doc, pero describe la realización
  actual (pool = nodo). No hay contradicción de vocabulario; sí de estructura (arriba).

---

## 4. Colisiones abiertas (NO resueltas — no asumir)

Alcance de este LOCK = **L-1 + L-2**. Lo demás está inventariado y **pendiente**:

| ID | Colisión | Estado |
|---|---|---|
| **L-3** | **`pool` sobrecargado**: además del grupo aditivo, significa **contenedor de instancias de proc** (`dot_pools` en `EnemyState`; `HeatState.pool` con decay, `behaviors.ts`). | abierta |
| **L-4** | **`bucket` sobrecargado**: además de la ranura, existe **"Distance Bucket"** (banda de rango del falloff, `engine-audit.md`). | abierta |
| **L-5** | **"facción" sobrecargado**: (a) el **pool de bonus** de facción (Roar/Bane, etapa ②) vs (b) la **`matriz③`** facción×elemento del target (etapa ③). Dos mecánicas, una palabra. | abierta |
| **L-7** | **`base`/`final` sin nombre propio.** "Input"/"output" son demasiado genéricos, y **`final` ya se malinterpreta**: es el target de la *inicialización* (`resolve()` paso 1: `final = base`), se recomputa por pass (no es terminal), significa cosas distintas por rol (valor del stat vs numerador del factor `final/base` en un nodo-pool), y **el op `SET` roto es su víctima** (escribe `final`, el recompute lo pisa). Bautizarlos si vuelve a morder. | diferida |

## Ligado a
- [`arch-decisions.md`](arch-decisions.md) §4.1 (Stat Accumulator v3 — los 5 buckets), §16 (modelo de pools), §9/§10 (CO/combo = independientes).
- [`simulation-architecture.md`](simulation-architecture.md) §2.0 (las etapas ①②③ que califican `pool②`).
- `references/wiki/mechanics/calculating-bonuses.md` (la fórmula honesta, SSoT del juego).
- `docs/CLAUDE.md` §"Regla de enrutamiento" (por qué este doc vive acá y no en `semantic/`).
- Campaña de origen: `.working/engine-fidelity-hygiene.md` (gitignored).
