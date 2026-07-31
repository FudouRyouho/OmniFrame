# Module:Enemies/infobox — el scaling que la wiki ejecuta

> Fuente: `https://wiki.warframe.com/w/Module:Enemies/infobox?action=raw`
> Fuente actualizada: 2026-06-25
> Extraído: 2026-07-31
> Archivo raw: `enemies-infobox.lua`
> Raw: enemies-infobox.lua · enemies-data.lua

---

## Para qué está acá

Es la **forma ejecutable** de la ley que
[`../mechanics/enemy-level-scaling.md`](../mechanics/enemy-level-scaling.md) destila en prosa. La
página describe; este módulo es lo que la wiki **corre** para poblar cada infobox de enemigo.

Cuando la página y el módulo dicen cosas distintas, no hay empate automático — son dos afirmaciones de
la misma fuente y hay que decidir cuál gana. Lo que este archivo aporta es **poder ver la
divergencia**, que sin él no existía.

> ⚠️ El módulo trae las tablas, no la aritmética. El **cálculo** (smoothstep, clamps, orden de
> aplicación de Eximus/Steel Path) lo hace el gadget `ext.gadget.enemyinfoboxslider`, que vive en
> `references/temp/`. El módulo sólo emite los coeficientes a `<span>` ocultos que el gadget lee.

## Las cuatro tablas

Los coeficientes están hardcodeados en el módulo, con un `TODO` de sus propios editores
(*"Move these values to their respective /data pages"*).

**Health** — indexado por facción, con default para lo no listado:

| Clave | `f1` | `f2` |
|---|---|---|
| Default | `0.0150 · 2.00` | `10.7332 · 0.5` |
| Grineer · Scaldra | `0.0150 · 2.12` | `10.7332 · 0.72` |
| Corpus | `0.0150 · 2.12` | `13.4165 · 0.55` |
| Infestation | `0.0225 · 2.12` | **`16.100`** · 0.72 |
| Orokin · **Anarchs** | `0.0150 · 2.10` | `10.7332 · 0.685` |
| Techrot | `0.02 · 2.12` | `15.0998 · 0.7` |

**Shields:**

| Clave | `f1` | `f2` |
|---|---|---|
| Default | `0.0200 · 1.75` | `1.6000 · 0.75` |
| Corpus | `0.0200 · 1.76` | `2.0000 · 0.76` |
| Corrupted · **Anarchs** | `0.0200 · 1.75` | `2.0000 · 0.75` |
| Techrot | `0.0200 · **1.75**` | `3.5 · 0.76` |

**Armor** y **Overguard** — una sola entrada, sin variación por facción:

```lua
armor      f1 = 0.0050 · 1.75      f2 = 0.4000 · 0.75
overguard  f1 = 0.0015 · 4.00      f2 = 260.00 · 0.90
```

## Dos desacuerdos con la página

**1. Techrot shields, curva baja.** La página dice exponente **1.76**; el módulo dice **1.75**. Los
otros tres valores de esa fila coinciden. La página tampoco es coherente consigo misma: el resto de la
tabla de shields usa `1.75` salvo Corpus.

⚠️ Conflicto ↔ [`../mechanics/enemy-level-scaling.md`](../mechanics/enemy-level-scaling.md) §Shields por facción

**2. Infested health, coeficiente de la curva alta.** La página dice **16.0998**; el módulo dice
**16.100**. Los dos producen números casi idénticos, pero el módulo es el que la wiki *ejecuta*: los
valores del calculador salen de `16.100`, no de `16.0998`. Validar un cálculo propio "exacto contra el
calculador" usando `16.0998` es validar contra otro número.

⚠️ Conflicto ↔ [`../mechanics/enemy-level-scaling.md`](../mechanics/enemy-level-scaling.md) §Health por facción

**Lo que sí coincide, y vale registrarlo:** los coeficientes de **Overguard** del módulo son idénticos
a los que la página publica. Es la fórmula peor respaldada del artículo —su única referencia es un hilo
de Reddit marcado `[Confirmation needed]`— y al menos las dos caras de la wiki dicen lo mismo.

## La facción no es un campo: son tres

El módulo lee **tres campos distintos** del enemigo, y ninguno implica a los otros:

```lua
faction        = args['Faction'] ~= '' and args['Faction'] or enemy.General.Faction
factionScaling = (enemy.Stats.FactionScaling) or faction              -- línea 324
...healthMod(enemy.General.FactionDamageOverride or enemy.General.Faction or '')   -- línea 473
```

| Campo | Determina | Fallback |
|---|---|---|
| `Faction` | la etiqueta que se muestra y la categoría de la página | — |
| `FactionScaling` | **qué coeficientes de scaling** se usan | `Faction` |
| `FactionDamageOverride` | **qué fila de la matriz de resistencias** aplica | `Faction` |

O sea que la wiki ya trata "la facción de un enemigo" como **tres preguntas separadas** que casi
siempre tienen la misma respuesta. Cuánto es "casi": ver abajo.

## La base de datos por facción — medida, no capturada

`Module:Enemies/data` (capturado al lado, en `enemies-data.lua`) **no contiene enemigos**: es un router
que particiona la base en 12 subpáginas `Module:Enemies/data/<facción>` y expone el mapa de alias
canónicos. Las 12 particiones suman **836 KB y 912 enemigos** y **no** están en el corpus — no hay
consumidor y su volumen las volvería mantenimiento puro.

Medición sobre las 12, reproducible con
`curl -sL "https://wiki.warframe.com/w/Module:Enemies/data/<facción>?action=raw"`:

| Partición | Entradas | `FactionScaling` | `FactionDamageOverride` |
|---|---|---|---|
| corpus | 330 | — | 54 |
| grineer | 246 | — | 51 |
| unaffiliated | 101 | — | 17 |
| infestation | 71 | **1** | 10 |
| narmer | 41 | — | — |
| orokin | 32 | — | 17 |
| anarchs · themurmur | 26 c/u | — | — |
| sentient | 13 | — | 3 |
| techrot | 13 | **2** | — |
| scaldra | 11 | — | — |
| stalker | 2 | — | — |

**`FactionScaling` sólo se usa 3 veces en 912 enemigos**, y los tres casos dicen algo:

- `Jordas Golem` (Infestation) → **`"Default"`**: escala como un enemigo sin facción, no como Infested.
- `H-09 Apex` y `H-09 Efervon Tank` (Techrot) → **`"Corpus"`**: son Techrot y escalan como Corpus.

**`FactionDamageOverride` aparece 152 veces, pero 125 son la cadena vacía `""`** — no redirigen a otra
facción: **anulan** la matriz de resistencias para ese enemigo. Los 27 restantes:

| Valor | Casos |
|---|---|
| `"Zariman"` | 12 |
| `"Grineer"` | 5 |
| `"The Murmur"` | 2 |
| `"Corpus"` | 1 |
| **paths de asset** (`/Lotus/Types/Enemies/…`) | **6** |

Dos cosas de esa tabla:

- **`Zariman` es una facción de resistencias que no es una facción de enemigos.** No está entre las 12
  particiones, pero sí es una de las 15 columnas de la matriz
  (→ [`../mechanics/enemy-resistances.md`](../mechanics/enemy-resistances.md)).
- **Los 6 paths de asset son datos rotos.** `FactionDamageOverride =
  "/Lotus/Types/Enemies/TennoReplicants/RelayBoss/TennoReplicantYinYangAgent"` no es una facción: es el
  path interno de la entidad, pegado en el campo equivocado. Se dejan anotados, no corregidos.

## El mapa de alias canónicos

De `enemies-data.lua`. Es la respuesta a "¿qué facción es ésta, en realidad?":

```lua
kuva grineer                              → grineer
corpus amalgam                            → corpus
infested · infested deimos                → infestation
corrupted                                 → orokin
the murmur                                → themurmur
duviri · neutral · predator · prey ·
tenno · unknown                           → unaffiliated
```

Las 12 canónicas son `grineer · corpus · infestation · orokin · sentient · stalker · narmer ·
themurmur · techrot · scaldra · anarchs · unaffiliated`.

**`corrupted → orokin`** confirma lo que la tabla de scaling insinuaba: son la misma facción con dos
nombres, y el módulo usa uno en health (`Orokin`) y el otro en shields (`Corrupted`) — inconsistencia
interna del módulo, sin efecto porque ambos caen en la misma fila.

**Seis etiquetas colapsan a `unaffiliated`**, incluido `tenno`. Cualquier lectura que trate esas
etiquetas como facciones distintas está contando de más.

## Ojo con esto

- El módulo **no reconoce `Sentient`, `Murmur` ni `Unaffiliated` en health**: caen al `Default`, que da
  el mismo resultado que la fila que la página les asigna. Coinciden por construcción, no por
  redundancia.
- Las asignaciones `shield_vals["Kuva Grineer"] = shield_vals["Grineer"]` referencian claves que **no
  existen** en esa tabla: asignan `nil`. Funciona igual porque el `setmetatable` posterior devuelve el
  default. Es frágil, no incorrecto.
- Las tablas están hardcodeadas en el módulo de presentación, con `TODO` de moverlas a `/data`. Cuando
  eso pase, este archivo deja de ser la fuente y hay que volver a buscarla.
