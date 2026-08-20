# Enemy Level Scaling

> Estado: activo
> Rol: fórmulas de escalado de stats de enemigos por nivel
> Fuente de verdad de: la interpolación de dos curvas (siempre evaluadas, nunca seleccionadas), los
> bounds de transición **por stat**, el input de nivel (único, `Nivel Actual − Nivel Base` salvo
> Affinity), los coeficientes (por facción en health/shields, universales en armor/overguard), el
> régimen de precisión binary32 y el EHP derivado
> No usar para: drops, afinidad de jugador o mecánicas de spawn
> Última actualización: 2026-08-20 (corregidas cuatro afirmaciones sobre Overguard —
> `q`, bounds sobre Δnivel, default de Eximus base, universalidad de coeficientes —
> verificadas línea por línea contra el gadget y `Module:Enemies/infobox`)
> Fuente: https://wiki.warframe.com/w/Enemy_Level_Scaling
> Fuente actualizada: 2026-07-29
> Raw: enemy-level-scaling.wikitext

## Fórmula base — una curva

Cada **curva de extremo** (*endpoint curve*) tiene la misma forma:

```
f_i(q) = 1 + C_i × q^(E_i)
```

`C_i` y `E_i` son el coeficiente y el exponente de esa curva. **`q` no es el mismo para todos los
stats:**

| Stat | `q` |
|---|---|
| health · shields · armor · overguard · damage | `Nivel Actual − Nivel Base` |
| **Affinity** | **`Nivel Actual`** — directo, sin restar nada |

El valor final es `Valor Base × Multiplicador`.

## Los stats con dos curvas **no eligen** — interpolan siempre

Health, shields, armor, Overguard y el daño modificado de Corpus/Grineer/Techrot usan **dos** curvas.
Y acá está el cambio de forma respecto de la lectura anterior:

> *"**Both endpoint curves are evaluated at every level**, including when s=0 or s=1."*

No hay región donde "manda `f1`" y otra donde "manda `f2`". **Siempre se evalúan las dos** y un peso
smoothstep transporta el multiplicador de una a la otra. La wiki además **retiró** la afirmación de
que las curvas se cruzan en x=80: *"the two curves do not necessarily intersect"*.

```
t    = clamp((q − L) / (U − L), 0, 1)
s    = t² × (3 − 2t)
mult = f1 + (f2 − f1) × s
```

**Los bounds `L`/`U` son por stat**, no universales:

| Stat | `L` | `U` |
|---|---|---|
| health · shields · armor | 70 | 80 |
| **Overguard** | **45** | **50** |
| **damage modificado** (Corpus/Grineer/Techrot) | **1** | **25** |

Health y shields tienen coeficientes por facción/grupo (tablas abajo). **Armor y Overguard no**: una
sola entrada `Default` en `Module:Enemies/infobox`, sin variación real — la tabla está indexada por
facción por simetría con health/shield, pero cae al mismo valor siempre
([`../sources/enemies-infobox.md`](../sources/enemies-infobox.md) §Las cuatro tablas).

## Precisión: binary32 es normativa, y el orden también

> *"The coefficients, exponents, power results, and intermediate arithmetic results **must be
> evaluated in binary32 in the displayed order** when reproducing in-game values."*

Cada paso —`f32(Base) × f32(Multiplicador)`, el `t`, el `s`, la resta `f2 − f1`— se evalúa y **se
almacena** como IEEE 754 binary32 (precisión simple). Y la forma escrita es la única válida:

> *"the expression **must not be rearranged** as `f1(x)(1−s) + f2(x)s`, and `f1` or `f2` **must not be
> substituted directly** at either endpoint."*

Las dos formas son algebraicamente idénticas y **numéricamente distintas** en precisión simple. Que
la fuente lo prohíba explícitamente indica que la diferencia se observó al reproducir valores.

## Health por facción

Los tab-headers del wiki agrupan facciones que comparten coeficientes (`Corrupted` = tipo Void, facción
**Orokin**; no es una facción propia).

| Grupo (tab del wiki) | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Grineer / Scaldra | `1 + 0.015(Δx)^2.12` | `1 + 10.7332(Δx)^0.72` |
| Corpus | `1 + 0.015(Δx)^2.12` | `1 + 13.4165(Δx)^0.55` |
| Infested | `1 + 0.0225(Δx)^2.12` | `1 + 16.0998(Δx)^0.72`‡ |
| Anarchs / Corrupted (=Orokin) | `1 + 0.015(Δx)^2.1` | `1 + 10.7332(Δx)^0.685` |
| Murmur / Sentient / **Unaffiliated (default)** | `1 + 0.015(Δx)^2` | `1 + 10.7332(Δx)^0.5` |
| Techrot | `1 + 0.02(Δx)^2.12` | `1 + 15.0998(Δx)^0.7` |

> **La contradicción de Anarchs desapareció de la fuente.** Hasta la captura anterior, Anarchs
> figuraba **a la vez** en el tab "Anarchs, Corrupted" (`^2.1/^0.685`) y en el grupo "Murmur, Sentient,
> Anarchs, Unaffiliated" (`^2/^0.5`). El tab de la reescritura del 2026-07-28 se llama **"Murmur,
> Sentient, and Unaffiliated"** — sin Anarchs. Queda un solo grupo para Anarchs, el de Corrupted, en
> health y en shields.
>
> **Default para facción no reconocida = "Unaffiliated" → grupo `^2/^0.5` (el de Sentient), NO Grineer.**

> ‡ **Infested, curva alta: la página dice `16.0998` y el módulo dice `16.100`.** La diferencia es
> despreciable en el resultado, pero no en el método: los números del calculador salen del módulo, así
> que validar un cálculo propio "exacto contra el calculador" usando `16.0998` es validar contra otro
> número del que produce la referencia.
>
> ⚠️ Conflicto ↔ [`../sources/enemies-infobox.md`](../sources/enemies-infobox.md) §Dos desacuerdos con la página

## Shields por facción

| Grupo (tab del wiki) | Fórmula < 70 | Fórmula > 80 |
|---|---|---|
| Corpus | `1 + 0.02(Δx)^1.76` | `1 + 2(Δx)^0.76` |
| Anarchs / Corrupted (=Orokin) | `1 + 0.02(Δx)^1.75` | `1 + 2(Δx)^0.75` |
| Grineer / Sentient | `1 + 0.02(Δx)^1.75` | `1 + 1.6(Δx)^0.75` |
| Techrot | `1 + 0.02(Δx)^1.76`† | `1 + 3.5(Δx)^0.76` |

Infested no lleva escudo (sin fila). El wiki no documenta grupo Unaffiliated para shields.

> † **Techrot shields — la página y el módulo de la propia wiki no coinciden.** La página dice
> exponente **1.76** en la curva baja; `Module:Enemies/infobox` —el que la wiki **ejecuta** para
> poblar los infobox— dice **1.75**. Los otros tres valores de la fila coinciden, y el resto de la
> tabla de shields de la página usa `1.75` salvo Corpus.
>
> ⚠️ Conflicto ↔ [`../sources/enemies-infobox.md`](../sources/enemies-infobox.md) §Dos desacuerdos con la página

## Armor — fórmula única para todas las facciones

```
< 70:  1 + 0.005(Δx)^1.75
> 80:  1 + 0.4(Δx)^0.75
```

**Aplicación (orden exacto, del gadget `ext.gadget.enemyinfoboxslider`, RESUELTO 2026-07-06):**
```
armor = floor(base_armor × armor_multi)
if (armor > 0) { armor = min(armor, 2700); armor = max(armor, 200); }   // clamp SOLO si tiene armor
```
El **floor de 200 aplica siempre** que `armor>0` — incluso a nivel base (Arid Butcher base 5 → 200; el 5 es
nominal). Un enemigo con base armor 0 (sin armadura) NO recibe el floor (queda 0).

> **El clamp es del valor inicial, no un piso permanente.** La aclaración es del 2026-07-29 y es
> literal: *"This minimum cap is only for the **initial value** of their armor, i.e. their armor can
> still be decreased below 200 through all normal means of armor removal."* El 200 no protege contra
> el armor strip — es el punto de partida que el escalado produce, no un suelo de la unidad.

**DR desde armor (⚠️ NO es `armor/(armor+300)` — esa está obsoleta):**
```
DR = √(3 × armor) / 100          (cap: armor 2700 → 90%)
```
El gadget la redondea a 4 decimales para display/EHP. `EHP = health/(1 − DR) + shields + overguard`.

> ✅ Validado: Arid Butcher (Grineer, base 50 hp / 5 armor) @215 → health **25.612,14**, armor **200**,
> DR **24,49%**, EHP **33.918,87** — los 4 campos del calculador, exactos (`enemy-scaling.test.ts`). El
> script del gadget es el oráculo (el juego no muestra HP numérico). Confirmar la DR contra un popup en #1.

## Modificadores de base y ORDEN de aplicación (del gadget)

El health/shield BASE se modifica ANTES del escalado por nivel, en este orden exacto:

1. **Base** de la unidad (o `eximus_*` base si es Eximus — algunos enemigos tienen base distinta; el
   Codex NO refleja el incremento Eximus). Overguard base Eximus = **12** (default).
2. **Steel Path** (si aplica): `base_health += steel_path_health_bonus` (flat por-enemigo); idem shield.
3. **Empowered/Archimedea** (si aplica): `base_health += archimedea_health_bonus` (flat).
4. **Eximus** (si aplica): escalado piecewise de health/shield (ver §Escalado de Eximus).
5. **Steel Path ×2.5**: `base_health ×= 2.5`, `base_shield ×= 2.5`.
6. **Empowered ×N** por player_count: 1→**2.5**, 2→**3.0**, 3→**3.5**, 4→**4.0** (health y shield).
7. **Recién ahora** el escalado por nivel (curva-S `f1/f2/smoothstep`) sobre la base ya modificada.

**Affinity:** `floor(base_affinity × (coef + √(NivelActual) × 0.1425))`, `coef = 1` normal / **3** Eximus.
El redondeo hacia abajo lo confirma hoy la página, no sólo el gadget: *"62.7 affinity will be rounded
down to 62"*.

## Overguard — bounds y coeficientes propios, `q` compartido

```
f1(q) = 1 + 0.0015 × q^4          curva baja
f2(q) = 1 + 260    × q^0.9        curva alta
q     = Nivel Actual − Nivel Base   ← el mismo `q` que health/shields/armor
L, U  = 45, 50                      ← sobre ese mismo Δnivel, NO nivel absoluto
```

**Overguard base de Eximus = 12 es el default, no un valor fijo.** El gadget lo reemplaza por el
Overguard Eximus propio del enemigo cuando ese dato existe (`eximus_overguard_v !== 0`) — mismo patrón
de reemplazo que `eximus_health` (ver §Escalado de Eximus). Unidades normales pueden tener Overguard en
situaciones puntuales (ej. tras destruir un Overguard Exodamper en Void Armageddon).

El exponente **4** de la curva baja es el más alto de cualquier stat del juego: entre Δnivel 0 y 45 el
Overguard crece muchísimo más rápido que health, shields o armor.

**Aviso de la propia wiki:** la sección de Overguard es la única del artículo cuya referencia es un
hilo de Reddit de 2022 marcado *`[Confirmation needed]`*. Es la fórmula peor respaldada de la página.

> Curvas: [`../sources/enemies-infobox.md`](../sources/enemies-infobox.md) (`Module:Enemies/infobox`
> §Las cuatro tablas). Aritmética (`q`, `trans()`, el reemplazo de base y su orden):
> `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`. Diferido en el engine hasta abrir el
> frente Eximus/SP (gate de honestidad — Arid Butcher normal primero).

## Damage (daño de enemigos)

**Estándar — una sola curva, sin interpolación:**
```
1 + 0.015(Δx)^1.55
```

**Corpus / Grineer / Techrot — dos curvas, y con los bounds más angostos del juego:**
```
f1(Δx) = 1 + 0.015 (Δx)^1.75
f2(Δx) = 1 + 0.0075(Δx)^1.55
L, U   = 1, 25
```

Que la transición termine en `Δx = 25` significa que **para casi todo el rango jugable estas tres
facciones ya están sobre `f2`** — al revés que health/shields/armor, donde el 70-80 deja la mayor
parte del juego en la curva baja.

Multiplicadores adicionales por facción:
- Corpus / Grineer / Techrot: ×2
- Infested: ×3

> El daño base de un enemigo es *"the damage dealt by this enemy to the player's Overguard when it is
> at level 1"* — o sea que el número base se define por una medición contra Overguard, no contra
> health o shields del jugador.

## Affinity (afinidad)

Fórmula especial — **no resta nivel base**:

```
Affinity = 1 + 0.1425 × Nivel^0.5
Eximus:    3 + 0.1425 × Nivel^0.5
```

## Estadísticas derivadas — EHP

```
Solo health:           EHP = Health
Health + shields:      EHP = Health + Shields × (Shields_Base / Health_Base)
Health + armor:        EHP = Health × (1 + Armor_Base × Armor_Mult / 300)
Los tres:              combinación de las dos fórmulas anteriores
```

> ⚠️ Conflicto ↔ [`enemy-resistances.md`](enemy-resistances.md) §DR de armor enemigo

## Escalado de Eximus

**El base de un Eximus es un reemplazo, no un componente sumado.** El gadget hace
`if (eximus_health_v !== 0) base_health = eximus_health_v` **antes** de correr cualquier escalado —
sustituye al `health` normal de la unidad, no se suma sobre él. Por eso puede ser **menor** que el
health normal (`Scrofa Drover Bursa`, Corpus: 1200 → 900 Eximus — verificado en
`Module:Enemies/data/corpus`, 31 casos con `EximusHealth ≠ Health`): imposible si fuera un total
agregado o un componente sumado. El mismo patrón de reemplazo aplica a
`eximus_shield`/`eximus_armor`/`eximus_affinity`/`eximus_overguard`. El health del Codex NO refleja este
reemplazo.

Sobre ese base ya reemplazado corre el escalado de health de la facción **más un incremento SEPARADO,
dependiente del nivel** (`x` = level difference). Piecewise (`Base Health` = health base ya reemplazado
si aplica):

**Con Shields o Armor** (coeficiente 0.25):
```
x ≤ 15:        max(BH×1.1, 0.25×(BH+900))
15 < x ≤ 25:   max(BH×1.1, 0.25×(BH+900)×[1 + 0.025×(x−15)])
25 < x ≤ 35:   max(BH×1.1, 0.25×(BH+900)×[1.25 + 0.125×(x−25)])
35 < x ≤ 50:   max(BH×1.1, 0.25×(BH+900)×[2.5 + (2/15)×(x−35)])
50 < x ≤ 100:  max(BH×1.1, 0.25×(BH+900)×[4.5 + 0.03×(x−50)])
x > 100:       max(BH×1.1, 0.25×(BH+900)×6)
```

**Sin Shields ni Armor**: idéntico pero con coeficiente **0.375** en vez de 0.25.

> Diferido en el engine (gate de honestidad): modelamos Arid Butcher **normal** primero; Eximus (+
> overguard) y Steel Path son capas aparte, se activan con su propio caso/dato. Ver Eximus + The Steel Path.

## Misiones sin fin

Durante Supervivencia y Defensa el nivel de spawn aumenta exponencialmente hasta nivel 5000 (≈4 horas), luego linealmente hasta el cap de 9999.

**Disrupción:**
```
Nivel = Nivel_Inicial + Σ 2.59 × e^(0.139 × Número_Ronda)
```

> Nota: las fórmulas documentadas provienen de testing in-game, no de fuentes oficiales de DE.
