# Buckets multiplicativos — Damage Vulnerability, facción, parte del cuerpo y Sonar

> Rol: tests in-game sobre **cómo componen entre sí** los multiplicadores del lado target.
> Fuente de verdad de: la composición `Damage Vulnerability ↔ facción ↔ body-part ↔ Sonar` (empírico),
> la **elegibilidad** de un DV filtrado, y el corte **single-dip / double-dip** en el tick de DoT.
> Última actualización: 2026-08-06

Fórmula bajo prueba (`wiki/mechanics/calculating-bonuses.wikitext §Order of Operations`):
`Resultant = [ Base × ∏(1 + Σ additive bonuses) ] + Σ flat`.

**Por qué hizo falta medir:** `wiki/mechanics/damage-calculation.wikitext` da el damage modifier canónico
con **dos términos** (`1 + Health-type Modifier` · `1 − 0.9·√(AR/2700)`) y **excluye Damage Vulnerability
por alcance declarado** — *"independent of enemy stats and external buffs during missions"*. La página de
la mecánica dice *"multiplicative with damage bonuses and buffs"* pero **no la ubica en la fórmula**.

**Enemigo (todos los tests):** Arid Butcher **lvl 215**, **no** Steel Path. Golpes blancos, torso salvo
donde se indique.

---

## Test 1 — ¿`Damage Vulnerability` suma o multiplica con el bucket de daño? → **MULTIPLICA** (2026-08-05)

**Arma:** Alternox Prime, disparo primario (mono-tipo: Electricity 75).
**DV:** Nova *Molecular Prime* — **+100% fijo**, no afectado por Ability Strength.

| # | Build | Medido |
|---|---|---|
| a | sin mods, sin MP | **57** |
| b | sin mods, **con MP** | **113** |
| c | **+ Serration r10** (+165%), sin MP | **150** |
| d | **+ Serration, con MP** | **300** |

| Hipótesis | `d` predicho | Medido |
|---|---|---|
| multiplicativo `×2.65 × 2.00` | **302** | **300** ✅ |
| aditivo `×(1 + 1.65 + 1.00)` | 208 | ❌ |

## Test 2 — ¿`Damage Vulnerability` y facción comparten bucket? → **NO, separados** (2026-08-05)

**Arma:** ídem. **Facción:** Bane of Grineer — la razón `88/57 = 1.544` corresponde a la variante
**Primed** (×1.55); la normal daría ×1.30.

| # | Build | Medido |
|---|---|---|
| a | sin mods | **57** |
| b | **+ Bane** | **88** |
| c | **+ MP** | **113** |
| d | **Bane + MP** | **176** |

| Hipótesis | `d` predicho | Medido |
|---|---|---|
| buckets separados `×1.55 × 2.00` | **177** | **176** ✅ |
| mismo bucket `×(1 + 0.55 + 1.00)` | 145 | ❌ |

## Test 3 — ¿Sonar reemplaza el weakpoint innato o multiplica? → **MULTIPLICA** (2026-08-05)

**Arma:** Tenora Prime **sin mods** (28 de daño total por disparo). **Warframe:** Banshee **sin mods**.

| # | Dónde | Medido |
|---|---|---|
| a | torso, sin Sonar | **25** |
| b | **cabeza**, sin Sonar | **75** |
| c | **cabeza con marca de Sonar** | **377** |
| — | cabeza **+ Bane** | **117** |
| — | cabeza **+ Sonar + Bane** | **584** |

`b/a = 3.00` (headshot Grineer) · `c/b = 5.03` · `c/a = 15.08`.
Cuatro factores: `25.1 × 3 × 5 × 1.55 = 583` vs **584** medido.

**El multiplicador base de Sonar es `5x`** — dato propio, `ability-stats.override.json`
(`"Damage Multiplier: |val1|x", base_value: 5`), Banshee sin mods. Eso desambigua:

| Hipótesis | `c` predicho | Medido |
|---|---|---|
| Sonar **multiplica** con el weakpoint: `25.1 × 3 × 5` | **377** | **377** ✅ |
| Sonar **reemplaza** el weakpoint: `25.1 × 5` | 125 | ❌ |

**Sonar no ocupa el slot del weakpoint: es un bucket aparte que multiplica con él.**

**Confirmado por los dos lados** (2026-08-05): la marca de Sonar cae en una parte **aleatoria**, así
que se midió en ambas.

| Dónde cae la marca | Predicho | Medido |
|---|---|---|
| **torso** (sin multiplicador de parte) | `25.1 × 5` = 125 | **126** |
| **cabeza** (×3 innato) | `25.1 × 5 × 3` = 375 | **377** |

`377/126 = 2.99` (el weakpoint sobre Sonar) · `377/75 = 5.03` (Sonar sobre el weakpoint). **Los dos
factores conviven; ninguno reemplaza al otro.**

## Test 4 — ¿Damage Vulnerability multiplica con el multiplicador de parte? → **SÍ** (2026-08-05)

**Arma:** Tenora Prime sin mods. **DV:** Nova *Molecular Prime* (+100% fijo).

| # | Dónde | Medido |
|---|---|---|
| a | torso + MP | **50** |
| b | **cabeza + MP** | **151** |

`a/25 = 2.00` · `b/75 = 2.01` · `b/50 = 3.02`. Producto puro `25.1 × 3 × 2 = 151`.

> **Corolario:** como todos los factores son multiplicadores puros, **el "orden" de aplicación no
> existe como pregunta** — el producto conmuta. Sólo produciría números distintos si algún factor no
> fuera puro.

## Test 5 — Emisor vs receptor, y el bucket de Roar/Bane (2026-08-05)

**Arma:** Tenora Prime sin mods. **Warframe:** Sevagoth a **200% Ability Strength** (fragmentos de
arconte + mod) → *Reap* **+100%** · *Roar* **+60%**. **Facción:** Primed Bane of Grineer (×1.55).

| # | Setup | Medido | Razón vs base |
|---|---|---|---|
| a | torso | **25** | — |
| b | **+ Roar** (emisor) | **40** | ×1.60 |
| c | **+ Reap** (receptor) | **50** | ×2.00 |
| d | **+ Roar + Reap** | **80** | **×3.20** |
| e | **+ Roar + Reap + Bane** | **108** | ×4.32 |

### ⭐ Emisor y receptor **no comparten bucket** — el §5 medido

| Hipótesis para `d` | Predicho | Medido |
|---|---|---|
| buckets separados `×1.60 × 2.00` | **80** | **80** ✅ exacto |
| mismo bucket `×(1 + 0.60 + 1.00)` | 65 | ❌ |

Roar (buff del **emisor**) y Reap (vulnerabilidad del **receptor**) tienen la misma forma `+X% daño` y
**aun así no componen igual**. Es la distinción emisor/receptor con número, no con prosa.

### ⭐ Roar y las mods de facción **sí** comparten bucket aditivo

| Hipótesis para `e` | Predicho | Medido |
|---|---|---|
| Bane **suma** con Roar: `×(1 + 0.60 + 0.55) × 2.00` | **107.5** | **108** ✅ |
| Bane **multiplica** con Roar: `×1.60 × 2.00 × 1.55` | 124 | ❌ |

Confirma literalmente lo que ya decía `wiki/mechanics/calculating-bonuses.wikitext §Order of
Operations`: *"Serration and Heavy Caliber will additively stack **separately from Bane of Orokin and
Rhino's Roar**"* — la wiki nombra **esos dos** como un bucket propio.

## Test 6 — Un DV **filtrado**: ¿participa siempre, y compone cómo? (2026-08-06)

**Dos jugadores.** Valkyr **sin mods** (*Paralysis* rank 3 → **50% Melee Damage Vulnerability**) +
Nova (*Molecular Prime* **+100%** fijo, **sin** filtro). Arma: **Heat Dagger sin mods**
(208 de daño total), *light attack*.

### 6a — Melee: ¿`DV-melee + DV` colapsa en un bucket? → **NO, multiplican**

| # | Setup | Medido |
|---|---|---|
| a | light attack | **334** |
| b | **+ Paralysis** | **501** |
| c | **+ Paralysis + MP** | **1001** |

`b/a = 1.500` exacto · `c/b = 1.998` · `c/a = 2.997`.

| Hipótesis para `c` | Predicho | Medido |
|---|---|---|
| **Paralysis × MP** `×1.5 × 2.0` | **1002** | **1001** ✅ |
| mismo bucket `×(1 + 0.5 + 1.0)` | 835 | ❌ −17% |

**La pregunta se responde con `c/b`, que no depende de `a`:** MP es +100% fijo, así que `c/b` debe dar
exactamente **2.00** si multiplica, y `(2+p)/(1+p) = 1.67` si comparte bucket. Midió **1.998**.

### 6b — Rifle: ¿el filtro *melee* excluye de verdad? → **SÍ, a cero**

**Tenora Prime sin mods**, torso, mismo enemigo.

| Setup | Medido |
|---|---|
| hit | **25** |
| **hit con Paralysis activo** | **25** |

**Cero movimiento.** El filtro no es prosa: decide participación. Un DV filtrado por clase de ataque
**no existe** para una instancia de otra clase — no es que aporte poco, es que no entra al producto.

### 6c — ⭐ El DV vive en el **target**, no en el emisor

El número fue **idéntico** portara la Valkyr el propio medidor o su compañero de escuadra. No hay
"mi Paralysis" y "tu Paralysis": hay **una marca en el enemigo**. Es la confirmación directa de que
`Damage Vulnerability` compone **por una sola vía** — la entidad que la porta.

## Test 7 — DoT: **DV single-dipea, el bucket del emisor double-dipea** (2026-08-06)

**Warframe:** Sevagoth a **200% Ability Strength** → *Reap* **+100%** (DV, receptor) · *Roar*
**+60%** (bucket del emisor). **Arma:** Heat Dagger, **520** de Heat total (Volcanic Edge, Molten
Impact, Melee Prowess, Lasting Sting). Torso.

**`dot` = último/anteúltimo tick de Ignite** — ver la nota de método abajo.

| # | Setup | hit | DoT |
|---|---|---|---|
| a | normal | **805** | **431** |
| b | **+ Reap** | **1610** | **862** |
| c | **+ Roar** | **1288** | **1102** |
| d | **+ Reap + Roar** | **2576** | **2205** |

### Hit — los cinco ratios son exactos al dígito

`1610/805 = 2.000` · `1288/805 = 1.600` · `2576/805 = 3.200` = `2.0 × 1.6`.
`805 × 3.2 = 2576` — **cero error**. Reconfirma el Test 5d con otra arma, otro tipo de daño y otra magnitud.

### ⭐ DoT — los dos comportamientos, en la misma medición

| Ratio | Medido | Es | Lectura |
|---|---|---|---|
| `862 / 431` | **2.0000** | `2.0` | **Reap NO se dobla** → single-dip |
| `1102 / 431` | **2.5568** | `1.6² = 2.56` | **Roar SÍ se dobla** → double-dip |
| `2205 / 431` | **5.1160** | `2.0 × 1.6² = 5.12` | componen sin interacción |

Error máximo **0.13%**. Las razones cruzadas también cierran: `2205/1102 = 2.001` (Reap sobre Roar) y
`2205/862 = 2.558` (Roar sobre Reap). **Seis razones independientes, todas consistentes.**

| Hipótesis para `d` (DoT) | Predicho | Medido |
|---|---|---|
| **DV single-dip × pool② double-dip** | **2207** | **2205** ✅ |
| Reap también se dobla | 4414 | ❌ +100% |
| Roar single-dipea (como DV) | 1379 | ❌ −37% |
| comparten bucket `(1+1.0+0.6)²` | 2914 | ❌ +32% |

**Confirma la predicción de la wiki al decimal** — `wiki/mechanics/damage-vulnerability.wikitext`:
*"Because Damage Vulnerability applies to the target and not the player, it **does not double dip** in
Damage over Time calculations."*

Y es la **primera medición que contiene las dos leyes a la vez**: emisor y receptor tienen la misma
forma `+X% daño` y se comportan **distinto en el mismo tick**. No hay modelo que explique 2205
poniéndolos juntos.

### 🔬 Nota de método — por qué el primer tick de Heat no sirve

El primer tick da un número anómalo. La causa es la **rampa de armor strip** de Heat
(`wiki/mechanics/damage-heat-damage.wikitext §Armor Stripping`): el strip sube `15% → 30% → 40% → 50%`
cada 0.5 s y tarda **2 s** en llegar a meseta, mientras el DoT empieza *"after a 1 second delay"*. El
primer tick cae con el enemigo todavía blindado; contra armor capado los escalones valen
`×1.7 / ×2.5 / ×3 / ×3.6`.

⚠️ **Los mods de Status Duration ralentizan la rampa** (misma página) — la build lleva *Lasting Sting*,
así que la meseta llega aún más tarde.

**Medir el último tick es lo correcto:** es el único punto en meseta, y por eso el armor se **cancela
en la división**. La consistencia de las seis razones al 0.1% es la prueba empírica de que se canceló.

> Es además la primera evidencia propia de la rampa, hoy declarada *"diferida"* en
> `docs/domains/engine/design/damage-status-model.md §Heat — Ignite`.

---

## Conclusión — cinco buckets, y **dos de ellos son sumatorias**

```
Daño = Base
     × (1 + Σ bucket A)    ← Serration, Heavy Caliber          [mods de daño base]
     × (1 + Σ bucket B)    ← Bane, Roar                        [finales del EMISOR]
     × Damage Vulnerability                                     [del RECEPTOR]
     × multiplicador de parte
     × Sonar
```

⚠️ **El bucket de facción no es sólo facción**: es el de **multiplicadores finales del emisor**, y
Roar vive ahí (medido, Test 5e). Modelarlo como "faction bucket" deja afuera a Roar y a su clase.

`∏(1 + Σ)` se sostiene exacto contra el juego. **`Damage Vulnerability` no necesita maquinaria propia:
es un factor más del producto.** Corolario para el modelado: las 8 excepciones aditivas enumeradas en
`wiki/mechanics/damage-vulnerability.wikitext §Notes` **no son una segunda ley** — son **un bucket**, y
la pertenencia a un bucket es un **parámetro**, no una forma distinta.

### Antes del producto hay un predicado: **elegibilidad ⊥ composición**

Un DV puede filtrar por **clase de ataque** (Paralysis → melee; Lull → Finisher), **tipo de daño**
(Magus Accelerant → Heat) o **capa** (Viral → health; Magnetic → shields/overguard). El Test 6b lo
mide: un rifle contra un enemigo con Paralysis da **el mismo número exacto** que sin ella.

**El filtro no reparte buckets** — la wiki lo demuestra en las dos direcciones: el bucket aditivo de
§Notes mezcla 5 fuentes sin filtro (Petrify, Jade's Judgments, Atomi-Barrage, Containment Wall, Prey
of Dynar) con 3 filtradas por tipo (Magus Accelerant, Magus Destruct, Theorem Contagion); y del lado
multiplicativo, Paralysis (melee) convive con Molecular Prime (sin filtro). Son **dos etapas**, y sólo
la segunda es aritmética:

```
DV(instancia, target, t) =  (1 + Σ   magnitud)  ×  ∏  (1 + magnitud)
                              m ∈ bucket_add       m ∉ bucket_add
                              elegible(m, inst)    elegible(m, inst)
```

Por eso **no hay orden de composición que decidir**: todo conmuta. Lo único que no conmuta es
`elegible()`, que es un predicado previo, no una operación.

### En el DoT los dos lados divergen — y es lo que los separa

| Qué | En el hit | En el tick de DoT |
|---|---|---|
| bucket del **emisor** (Roar, Bane) | `(1 + Σ)` | **`(1 + Σ)²`** — double-dip |
| **Damage Vulnerability** (receptor) | `× DV` | **`× DV`** — single-dip |

Medido en el Test 7 con las dos leyes en la misma tirada. **Es el criterio operativo más barato para
clasificar un multiplicador nuevo:** si se dobla en el DoT, es del emisor; si no, es del target.

🔴 **Restricción de implementación:** `Damage Vulnerability` **no puede** entrar al pool del emisor
(`GAMEPLAY_MULT_FACTION_DAMAGE`). Es la tentación obvia —Reap y Roar tienen la misma forma
`+X% daño`— y produciría `×4` donde el juego da `×2`: **100% de error en el tick**.

### La cuantización está en el display, no en la matemática

Cada arma converge a **un solo valor real** desde mediciones independientes:

| Arma | Mostrado | Real derivado |
|---|---|---|
| Alternox Prime | 57 | **56.5 – 56.8** |
| Tenora Prime | 25 | **25.00 – 25.16** |

Error < 0.5% en las nueve mediciones. Los desvíos aparentes (`b/a = 1.98` en vez de `2.00`) son
redondeo del número mostrado, no del cálculo.

---

## ✅ RESUELTA — el Alternox: **`ExtraHeadshotDmg` es un stat de arma que no ingerimos**

**Observado:** Alternox Prime → torso **57** · cabeza **57** (sin multiplicador) · marca de Sonar
**283** (`×4.97`, e igual caiga la marca en la cabeza o en el pie). Tenora Prime, misma clase, **sí**
registra el ×3.

**No es bug ni AoE.** Su página lo declara: *"All firing modes have a headshot multiplier of **1x**"*.
Y el módulo Lua trae el campo:

```
Alternox · Normal Attack →  ExtraHeadshotDmg = -2
Tenora                   →  (no lo declara)
```

**Es aditivo al multiplicador de parte del enemigo:** Grineer humanoide `3x` + `(−2)` = **1x**.
Coincide con la página y con la medición.

### Población — 13 armas, y el patrón no es aleatorio

| Valor | Armas |
|---|---|
| **−2** (anula el headshot) | Afentis Prime · **Alternox** · **Amprex** · Flux Rifle · Fulmin *(semi-auto)* · Nagantaka Prime *(Perfect Shot)* · Telos Boltor · Sirocco · Catchmoon |
| **+0.5** | Cernos *(ambos disparos)* · Kuva Bramma |
| **+0.2** | Coda Sporothrix · Sybaris Prime |

Los `−2` son beams (Amprex, Flux Rifle), orbes (Alternox) y proyectiles gordos (Catchmoon) — impactos
que no son un punto. Los `+` son armas de precisión.

### 🔴 Fisura de dataset

| Fuente | ¿Tiene el campo? |
|---|---|
| `wiki/sources/weapons-data*.lua` | ✅ `ExtraHeadshotDmg` |
| **`Project/public/data/weapons.json`** | ❌ **el campo no existe** |

Nuestro contrato de arma **no puede expresar esto**, y cambia el daño hasta **×3** en builds de
headshot. Caso concreto de lo que el fork no trae → `OQ-DATA-16`.

**Predicción falsable, sin medir:** el **Cernos** (`+0.5`) contra un Grineer debería dar **3.5x** en
la cabeza, no 3x.

> **Corolario para el modelo de buckets:** el multiplicador de parte no es sólo del enemigo — es
> `parte_del_enemigo + ExtraHeadshotDmg_del_arma`, y **recién ese resultado** entra como factor al
> producto. Sonar no participa de esa suma (el Alternox toma Sonar ×5 con headshot 1x).
