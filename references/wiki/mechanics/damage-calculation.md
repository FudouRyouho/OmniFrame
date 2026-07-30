# Damage Calculation

> Estado: activo
> Rol: la matemática de resolución de daño — cuantización a 1/32, la aplicación contra defensas, y las fórmulas derivadas del arsenal (total, disparo promedio, DPS burst y sostenido, DoT, lifetime)
> Fuente de verdad de: la **cuantización a 1/32** y qué la sufre y qué no · `Arsenal Total Damage` · `Normal/Critical/Average Shot` y su tratamiento de crit chance >100% · **effective fire rate por trigger type** · DPS burst y sostenido · la matemática del DoT, incluido el **`+1` fijo del seed** · lifetime damage
> No usar para: los multiplicadores por facción y parte del cuerpo (→ [`faction-damage.md`](faction-damage.md), [`enemy-body-parts.md`](enemy-body-parts.md)) · la DR por armadura en detalle (→ [`enemy-resistances.md`](enemy-resistances.md), [`armor.md`](armor.md))
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage/Calculation
> Raw: damage-calculation.wikitext

> ⚠️ La página lleva `{{UpdateMe}}` general y **otro `{{UpdateMe}}` que declara información
> contradictoria dentro de la propia sección de cuantización** (ver §La contradicción declarada).
>
> Armadura, damage reduction, bonus de facción, partes del cuerpo, crítico, sigilo y debuffs de
> warframe **quedan fuera del artículo a propósito**: son independientes del tipo de daño.

## Cuantización — el daño se redondea a 1/32

> *"**Dealing damage is quantized.** […] physical and elemental damages round to the nearest multiple
> of **1/32nd of their attack's base damage**, before being multiplied further."*

```text
Scale = Modded Base Damage / 32

x = Total Damage Type Value / Modded Base Damage

Quantized(x) = sign(x) × ⌊ |x| × 32 + 0.5 ⌋ / 32

Quantized Damage Type Value = Quantized(x) × Modded Base Damage
```

Ejemplo de la wiki — arma de **30 Impact / 30 Puncture / 40 Slash** (total 100, `Scale = 3.125`):

| Tipo | Base | ÷ Scale | Redondeado | Valor cuantizado |
|---|---|---|---|---|
| Impact | 30 | 9.6 | 10 | **31.25** |
| Puncture | 30 | 9.6 | 10 | **31.25** |
| Slash | 40 | 12.8 | 13 | **40.625** |
| | 100 | | | **103.125** |

> **El total cambió: 100 → 103.125.** No es un artefacto del ejemplo — *"mixed-type weapon damage is
> frequently **gained** or **lost** by the conversion"*.

Contra un Charger (+50% a Slash sobre salud Infested): `31.25 + 31.25 + 40.625 × 1.5 = 123.4375`, que
el juego muestra como **123**.

### Con mods físicos y elementales

- **Los bonus elementales y físicos no cambian la Scale.** Se calcula con la base sin modificar.
- El bonus **también se cuantiza**: con Maim, el Slash del ejemplo pasa a
  `round(40 × 2.2 / 3.125) × 3.125 = 87.5`.
- Los bonus elementales se calculan sobre la base **completa**, se redondean al 1/32 más cercano y se
  **suman** al total.
- **Los elementos que nacen de sumar varios mods cuantizan su suma, no cada sumando.** 90% Cold + 90%
  Toxin, o 90% de Radiation modeada + 90% de Smite Infusion, entran como **un** 180% del elemento
  final, redondeado una vez.

### La contradicción declarada

La página advierte que tiene dos afirmaciones incompatibles sobre qué hacen los multiplicadores
generales:

> *"Damage mods such as Hornet Strike, Faction Damage Bonus such as Bane of Grineer, and any other
> multipliers **only multiply final quantized values and do not affect the scale** or damage
> composition."*
>
> *"Applying +Damage, +Faction or any other non-elemental bonus **multiplies both the base value of
> rounding numerator and Scale of rounding denominator**, and therefore is a simple multiplier to any
> quantized total."*

El cuerpo del artículo usa la **primera**.

### Consecuencias observables

- **Los hitscan NO cuantizan** contra salud de tipo `Object` (burbujas de Nullifier, Tornado de
  Zephyr) — **los proyectiles sí**. La wiki usó esa asimetría para deducir composiciones de daño que
  el juego no publica.
- Un melee con Impact muy bajo respecto de sus otros tipos **no dispara Shattering Impact**, porque su
  Impact **cuantiza a 0**. La Galatine, con 2.5% de Impact, es el ejemplo.

### Por qué existe

Ahorro de ancho de banda: transmitir un total en 64 bits más un múltiplo de 1/32 en 16 bits por tipo,
en vez de un flotante de 64 por tipo. Para tres tipos son **112 bits contra 192** — ~42% menos, a
cambio de que el cliente recompute y de perder precisión.

### Resumen del procedimiento

1. obtener la `Scale`
2. cuantizar el daño físico y elemental
3. sumar los valores cuantizados
4. aplicar **todos los demás multiplicadores** (modificadores por tipo de daño, etc.)

## Aplicación contra el objetivo

**Sin armadura** (o con daño `True`):

```text
Damage Modifier  = 1 + Health-type Modifier
Inflicted Damage = Starting Damage × Damage Modifier
```

**Con armadura:**

```text
DM = 1 − 0.9 · √(AR / 2700)
```

donde `AR` es la armadura **después** de todas las reducciones (Corrosive Projection, procs de
Corrosive, Terrify). Ver [`enemy-resistances.md`](enemy-resistances.md).

Dos reglas de interacción:

- **La armadura no mitiga el daño a escudos**, aunque el enemigo tenga las dos capas.
- **El daño Toxin sobre un objetivo con escudo va directo a la salud** — pero **Treasurer y los Hound
  no se dejan saltear el escudo con Toxin**.

## Stats modeados

```text
Modded Stat      = Base Stat × (1 + Stat Bonuses)
Modded Stat Time = Base Stat Time / (1 + Stat Speed Bonuses)
```

La segunda forma es la de **reload time** y **charge time**. **Accuracy** también es excepción a la
primera.

## Daño total del arsenal

```text
Arsenal Total Damage = Base Damage
                     × [ 1 + Elemental Bonuses
                         + Unmodded Impact Distribution   × Impact Bonuses
                         + Unmodded Puncture Distribution × Puncture Bonuses
                         + Unmodded Slash Distribution    × Slash Bonuses ]
                     × ( 1 + Damage Bonuses )
                     × [ Base Weapon Multishot × ( 1 + Multishot Bonuses ) ]
```

> Es el **daño promedio no-crítico por disparo, sin bonus de facción**. En melee se quita el multishot,
> y **no incluye los multiplicadores de daño de la stance**.

El daño realmente infligido se arma por tipo:

```text
Total Inflicted Damage = SD₁ × DM₁ + … + SD_N × DM_N
```

`SD` = valor modeado de un tipo de daño · `DM` = su modificador contra ese objetivo.

## Disparo promedio

```text
Normal Shot   = Total Damage × [ 1 + ⌊Crit Chance⌋ × (Crit Multiplier − 1) ]
Critical Shot = Total Damage × [ 1 + ⌈Crit Chance⌉ × (Crit Multiplier − 1) ]
Average Shot  = Total Damage × ( 1 + Crit Chance × (Crit Multiplier − 1) )
```

> **Así se modela la crit chance por encima del 100%:** con 250%, el tier del 100% (crítico naranja)
> pasa a ser el *"disparo normal"*, y el 50% restante decide si sube al siguiente tier (rojo). El piso
> y el techo del mismo número son los dos tiers entre los que se rifa.
> Ver [`critical-hits.md`](critical-hits.md).

**Con componente AoE**, un impacto directo son **dos instancias**:

```text
Average Shot(directo + AoE) = Average Shot(directo) + Average Shot(AoE)
```

con **stats distintos** en cada una — y hay bonus que sólo tocan el directo, como Condition Overload
(→ [`condition-overload.md`](condition-overload.md)).

**Contra weak point:**

```text
Average Shot(weak point) = Average Shot × (Weak Point Multiplier + Weak Point Damage Bonus)
```

Los bonus incluyen Target Acquired, Primary Acuity y Pistol Acuity. En armas **sin** bonus por headshot
(Arca Plasmor) el multiplicador no aplica, y **el daño de AoE nunca puede ser headshot**
(→ [`enemy-body-parts.md`](enemy-body-parts.md)).

## DPS de armas

```text
Average Burst DPS     = Average Shot × Effective Fire Rate
Average Sustained DPS = Average Burst DPS × Proporción de tiempo disparando
```

```text
Proporción = Shots Per Mag / ( Effective Fire Rate × Modded Reload Time + Shots Per Mag )
```

> **La cadencia efectiva no es el stat del arsenal.** Depende del **trigger type**:

| Trigger | Effective Fire Rate |
|---|---|
| Auto, Auto-Spool, Semi, Duplex, Held | `Modded Fire Rate` |
| **Charge** | `1 / ( Modded Charge Time + 1 / Modded Fire Rate )` |
| **Burst** | `Burst Count / [ 1/Modded Fire Rate + (Burst Count − 1) × Burst Delay ]` |

En Semi y Duplex se **asume** que el jugador alcanza la cadencia modeada a mano; en Auto-Spool, que el
arma ya está a pleno spool. Para Mag Burst se usa el cargador entero como `Burst Count`; con
`Burst Count = 1` la fórmula colapsa a `Modded Fire Rate`.

```text
Shots Per Magazine           = Modded Mag Size / Ammo Cost Per Shot
Shots Per Magazine (Incarnon) = Max Incarnon Charge          (costo 1 por disparo)
```

Excepciones del sostenido: en **Vectis** y **Vectis Prime** se resta 1 al denominador (no tienen
retardo de recarga); en **Epitaph** se ignora el reload, porque tira directo del pool como los arcos
pero sin recargar entre disparos. El reload **incluye el retardo de recarga**, que pesa sobre todo en
armas de batería (→ [`reload.md`](reload.md)).

**Ambas fórmulas asumen el ramp-up de las continuas al máximo** — en juego real la recarga lo
resetea o lo hace decaer, así que el burst real es menor.

## DPS de melee

```text
Normal Hit   = Total Damage × [ 1 + ⌊Crit Chance⌋ × (Crit Multiplier − 1) ]
Critical Hit = Total Damage × [ 1 + ⌈Crit Chance⌉ × (Crit Multiplier − 1) ]

Average Hit  = Average Combo Damage Multiplier
             × Total Damage × ( 1 + Crit Chance × (Crit Multiplier − 1) )

Average DPS  = Average Hit × Modded Attack Speed / Base Combo Length
```

`Average Combo Damage Multiplier` y `Base Combo Length` **son de la stance**, no del arma. El
`Average Hit` es sobre el **primer** enemigo golpeado: no contempla Follow Through.

## Damage over Time

> **El DoT NO sufre la cuantización a 1/32.** El proc se calcula desde el **daño base modeado**, no
> desde la suma de los valores cuantizados por tipo. Las operaciones intermedias usan aritmética
> **binary32**.

### El `+1` del seed

Para los status de **Heat, Electricity, Toxin, Gas y Slash** generados por armas:

```text
Unrounded Tick Damage = ( Σ Sᵢ + 1 ) × C × M
```

- `Sᵢ` — cada **seed** de daño guardado para el proc
- `C` — **0.5** para Heat, Electricity, Toxin y Gas · **0.35** para Slash
- `M` — el producto de los demás modificadores aplicables (elemental, facción, status damage)

> **El `+1` se suma una sola vez a la suma de seeds.** No es un +1 de daño final ni un +1 por stack:
> si varios seeds se consolidan en un tick, **se suman primero y el 1 se agrega una vez**.

| Caso | Cuenta | Pop-up |
|---|---|---|
| Heat, seed 40, +60% Heat | `(40+1) × 0.50 × 1.60 = 32.80` | **33** |
| Electricity, seed 40, +150% | `(40+1) × 0.50 × 2.50 = 51.25` | **51** |
| Toxin, seed 62, +225% Toxin, +55% facción | `(62+1) × 0.50 × 3.25 × 1.55 = 158.68` | **159** |
| Gas, seed 40, sin bonus | `(40+1) × 0.50 = 20.50` | **21** |
| Slash, seed 62, +55% facción | `(62+1) × 0.35 × 1.55 = 34.18` | **34** |
| Electricity, seeds 40 **y** 60 consolidados, +150% | `(40+60+1) × 0.50 × 2.50 = 126.25` | — |

El pop-up muestra `⌊Raw + 0.5⌋`. **Es una regla de formato de display**: no implica que el daño crudo
ni el cambio de salud del objetivo se redondeen a entero.

Los DoT críticos usan el multiplicador crítico **efectivo del impacto que los indujo**, con la
cuantización del multiplicador crítico descrita en [`critical-hits.md`](critical-hits.md).

### DoT promedio

```text
Modded Damage = Modded Base Damage × Modded Multishot × (1 + Faction Damage Bonuses)
```

> **El cálculo de DoT ignora los bonus elementales y físicos** en este paso.

```text
Base Avg DoT = Modded Damage
             × (1 + Faction Damage Bonuses)      ← el bonus de facción entra POR SEGUNDA VEZ
             × (1 + Status Damage Bonuses)
             × Total Ticks × (1 + Status Duration Bonuses)
```

```text
Avg Slash DoT       = 0.35 × Base Avg DoT
Avg Electricity DoT = 0.5 × (1 + Electricity Bonuses) × Base Avg DoT
Avg Heat DoT        = 0.5 × (1 + Heat Bonuses)        × Base Avg DoT
Avg Toxin DoT       = 0.5 × (1 + Toxin Bonuses)       × Base Avg DoT
Avg Gas DoT         = 0.5 × (1 + Gas Bonuses)         × Base Avg DoT
```

**Todos los status de DoT comparten la misma cantidad de ticks sin modificar.** El DoT de Slash hace
daño **Cinematic**, así que ignora la armadura. Los bonus de Gas incluyen Valence Formation y Leaded
Gas.

```text
Total Avg DoT = Σ ( Avg <tipo> DoT × distribución de ese tipo )
```

Y sobre eso, las tres variantes de crítico —`⌊CC⌋`, `⌈CC⌉` y el promedio— más:

```text
Avg Total Avg DoT = Modded Status Chance × Total Avg DoT
                  × ( 1 + Crit Chance × (Crit Multiplier − 1) )

Avg Total Avg DoT (weak point) = Avg Total Avg DoT
                               × [ Weak Point Multiplier × (1 + Weak Point Damage Bonus) ]
```

> Nótese que la forma del weak point acá es **`mult × (1 + bonus)`**, mientras que en §Disparo
> promedio la wiki escribe **`(mult + bonus)`**. Ver [`enemy-body-parts.md`](enemy-body-parts.md).

## Lifetime Damage

Daño total que un arma puede hacer antes de agotar su reserva.

```text
Average Lifetime Damage = Average Shot × Shots Per Magazine
                        × ( 1 + Modded Maximum Ammo / Modded Magazine )
```

**Melee, armas de batería y armas exaltadas tienen lifetime damage infinito**: no dependen de pickups
ni de restauradores de munición.

## Fuentes

- https://wiki.warframe.com/w/Damage/Calculation
- [`damage-types.md`](damage-types.md) · [`critical-hits.md`](critical-hits.md) · [`enemy-resistances.md`](enemy-resistances.md) · [`enemy-body-parts.md`](enemy-body-parts.md) · [`damage-over-time.md`](damage-over-time.md) · [`reload.md`](reload.md) · [`ammo.md`](ammo.md)
