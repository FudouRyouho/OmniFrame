# Damage Types

> Estado: activo
> Rol: el sistema Damage 3.0 — las familias de daño con sus nombres internos, las reglas de combinación elemental y su jerarquía de orden, y qué es un tipo de daño frente a un status
> Fuente de verdad de: que las resistencias dependen **de la facción**, no del tipo de salud (Damage 3.0, v36) · tabla de tipos con `DT_*` / `PT_*` · la jerarquía de combinación elemental y la regla HCET · qué se puede y no se puede añadir por mod · la ortogonalidad daño↔status
> No usar para: fórmulas de proc y stacking detallado — ver [`status-effects.md`](status-effects.md) · la matriz de multiplicadores por facción — ver [`faction-damage.md`](faction-damage.md) y [`enemy-resistances.md`](enemy-resistances.md)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage
> Fuente actualizada: 2026-07-13
> Raw: damage-types.wikitext

## Damage 3.0 — qué cambió respecto de 2.0

Desde la versión **36**, el sistema es **Damage 3.0**, y el cambio es estructural:

> *"all different Health, Armor, and Shield types have been simplified into one type for each […]
> Vulnerabilities and resistances have also been **decoupled from health types and are now solely
> based on the enemy Faction**"*

Ya no existen Cloned Flesh, Machinery, Ferrite Armor, Alloy Armor, Proto Shield. Las notas de la v36
lo dicen con precisión: **de 13 health types se pasó a 4 — Health, Armor, Shields y Overguard**, que
ahora *"sólo sirven para diferenciar qué status effects y habilidades los afectan"* (Magnetic estorba
escudos, Corrosive pela armadura, Viral amplifica salud).

Y un Grineer es vulnerable a Impact y Corrosive **siempre**, tenga o no armadura o escudos — sin
resistencias de ningún tipo.

> Cualquier razonamiento del tipo *"este tipo de daño es bueno contra esta armadura"* es del sistema
> **anterior**.

## Tipo de daño ≠ status effect

> *"It is a common misconception that status effects determine the damage type dealt to the enemy
> when in fact **a weapon will always (with every shot) deal any elemental and physical damage
> installed, regardless of the corresponding status triggering or not**."*

Son ejes **ortogonales**. Cuando un ataque lleva varios tipos, **todos aplican su cantidad de forma
independiente**, aunque en pantalla se muestre **un solo número** con el valor combinado.

Qué tipo de status sale cuando sale, depende de la **distribución porcentual de los tipos de daño**
del arma (regla exacta en [`status-effects.md`](status-effects.md)).

## Físico (IPS)

`Weapon Damage = (Impact + Puncture + Slash) + (elementales)`

| Tipo | Interno | Status | Interno |
|---|---|---|---|
| **Impact** | `DT_IMPACT` | **Knockback** / **Stagger** — status de **6 s**, hasta 5 stacks; el tambaleo en sí dura **1 s**. Sube el umbral de salud para finisher de Parazon **+8% por stack**, hasta **80%** (**100%** en Corpus/Eximus sin escudos). Cada stack con su duración. | `PT_KNOCKBACK` |
| **Puncture** | `DT_PUNCTURE` | **Weakened** — el objetivo hace **−40%** de daño y recibe **+5%** de crit chance por **10 s**. Cada proc siguiente suma **+10%**, hasta **−80%** de daño y **+25%** de crit a 5 stacks. | `PT_FRAILTY` |
| **Slash** | `DT_SLASH` | **Bleed** — **35%** del daño base como daño **Cinematic** por segundo durante **6 s**, tras **1 s** de retardo. Stacks **ilimitados**. | `PT_BLEEDING` |

> **Dos nombres para el proc de Impact, y dos magnitudes distintas de duración.** `Status_Effect` lo
> llama **Knockback** y dice que *"staggers movement for 1 second"*; `Damage/Impact_Damage` lo llama
> **Stagger** y dice que *"it lasts 6 seconds"*. No se contradicen —son cosas distintas: la
> animación de tambaleo y la vida del status/stack— pero **ninguna de las dos páginas lo declara
> así**; la separación es lectura nuestra. El desacuerdo de *nombre* sí es real y la propia
> subpágina lo marca con un `{{UpdateMe}}`; la partición en tres códigos está en
> [`status-effects.md`](status-effects.md).

Detalle por tipo, con las fórmulas de tick: [`damage-physical.md`](damage-physical.md).

> **El daño físico no se puede añadir.** Un arma sin componente de Impact, Puncture o Slash **no se
> ve afectada** por los mods de ese tipo. Es la asimetría con los elementales, que sí se agregan.
> Hay armas sin nada de físico (Glaxion, Phage).

Los mods de daño general (Serration) afectan **todos** los tipos base del arma; los de facción
(Expel Grineer) son un multiplicador sobre el **total** contra esa facción.

## Elementales primarios

| Tipo | Interno | Status | Interno |
|---|---|---|---|
| **Heat** | `DT_FIRE` | **Ignite** — *enemigo:* **50%** del daño base como Heat por segundo durante **6 s** tras **1 s** de retardo (refrescable), pánico **4 s**, y **strip de hasta 50% de armadura en 2 s**. Stacks ilimitados. *Jugador:* 50% base en 6 s + el mismo strip de armadura. | `PT_IMMOLATION` |
| **Cold** | `DT_FREEZE` | **Freeze** — *enemigo:* **−50%** a movimiento, cadencia y velocidad de ataque, y **+0.1** al multiplicador crítico recibido, por **6 s**. Hasta **10 stacks**: +5% de slow por stack hasta **90%**, y +0.05 de crit multiplier hasta **+0.5**. **En el stack 10** queda **congelado 3 s** —inmóvil, sin recarga de escudo, **+1.0** al crit multiplier—; al descongelarse quedan **3 stacks**. *Jugador:* −25% por 6 s. | `PT_CHILLED` |
| **Electricity** | `DT_ELECTRICITY` | **Tesla Chain** — *enemigo:* **50%** del daño base por segundo durante **6 s** a los enemigos a **3 m** del objetivo, y **stun de 3 s** al afectado. *Jugador:* 50% base a los aliados a 3 m. | `PT_ELECTROCUTION` |
| **Toxin** | `DT_POISON` | **Poison** — **50%** del daño base como Toxin en **6 s** tras **1 s** de retardo, **atravesando los escudos**. Stacks ilimitados. | `PT_POISONED` |

## Elementales combinados

| Tipo | Receta | Interno | Status | Interno |
|---|---|---|---|---|
| **Blast** | Cold + Heat | `DT_EXPLOSION` | **Detonate** — explosión de **30%** del daño base a los **1.5 s**. Si termina antes —por llegar a **10 stacks** o porque el objetivo muere— **todos los stacks detonan a la vez** y los enemigos a **5 m** reciben **300%** del daño base. El radio **no** lo cambian Firestorm ni Fulmination. | `PT_FLASHBANG` |
| **Radiation** | Electricity + Heat | `DT_RADIATION` | **Confusion** — *enemigo:* ataca al enemigo más cercano con **+100%** de daño contra aliados y es atacado a cambio, **12 s**. Hasta 10 stacks = **+550%** contra unidades aliadas. *Jefes:* sólo reciben más daño, hasta 4 stacks = **+250%**; no atacan a los suyos. *Jugador:* pierde accuracy y puede dañar/ser dañado por aliados, 4 s. | `PT_RAD_TOX` |
| **Gas** | Heat + Toxin | `DT_GAS` | **Gas Cloud** — nube de **3 m** que hace **50%** del daño base por segundo durante **6 s**. Hasta 10 stacks y **6 m** de radio. **La nube persiste aunque el enemigo muera.** | `PT_ASPHYXIATION` |
| **Magnetic** | Cold + Electricity | `DT_MAGNETIC` | **Disrupt** — *enemigo:* **+100%** de daño a **escudos y Overguard** por **6 s**, hasta 10 stacks = **+325%**; **no regenera escudos**. Al romperse escudo/Overguard, recibe daño y status de **Electricity** igual al **3% del máximo por stack**, hasta **30%**. *Jugador:* +100% a escudos, sin regeneración, **20 de Energy Drain por segundo** y HUD alterado, 4 s. | `PT_MAGNETIZED` |
| **Viral** | Cold + Toxin | `DT_VIRAL` | **Virus** — **+100%** de daño a la **salud** por **6 s**, hasta 10 stacks = **+325%**. | `PT_INFECTED` |
| **Corrosive** | Electricity + Toxin | `DT_CORROSIVE` | **Corrosion** — **−26%** de la armadura **actual** por **8 s**, hasta 10 stacks = **−80%**. | `PT_CAUSTIC_BURN` |

> El **paso por stack es +6%** (`26 + 9×6 = 80`), pero ese número sólo aparece en el patch history de
> la **v27.2**, no en la tabla vigente.

> **Un primario que se combinó deja de existir.** Un arma cuyo Blast salió de Cold + Heat **ya no
> hace** daño Cold ni Heat, ni aplica Freeze ni Ignite.

### Qué combinaciones son posibles a la vez

Con mods de elemento **primario** sólo se pueden tener **dos** elementales en un arma, así que cada
secundario admite un compañero limitado:

| Junto a… | pueden coexistir |
|---|---|
| **Cold** | Corrosive · Gas · Radiation |
| **Electricity** | Blast · Gas · Viral |
| **Heat** | Corrosive · Magnetic · Viral |
| **Toxin** | Blast · Magnetic · Radiation |
| **Blast** | Electricity · Toxin · Corrosive |
| **Corrosive** | Cold · Heat · Blast |
| **Gas** | Cold · Electricity · Magnetic |
| **Magnetic** | Heat · Toxin · Gas |
| **Radiation** | Cold · Toxin · Viral |
| **Viral** | Electricity · Heat · Radiation |

La excepción son las armas con secundario **innato** y los mods que dan un secundario directo
(Magnetic Might).

## Jerarquía de combinación

El orden lo fija la **posición del mod en la grilla**: de arriba-izquierda (primero) a abajo-derecha
(último).

1. **El elemental innato del arma va último** en la jerarquía.
2. **Excepción — Kuva y Tenet con dos elementales base** (uno del arma, otro del Progenitor): de los
   dos, el que venga primero en el orden **HCET** (`Heat > Cold > Electricity > Toxin`) va
   **anteúltimo**, y el otro **último**.
3. **Un mod del mismo elemento reubica al innato:** poner Stormbringer en el slot superior izquierdo de
   una Amprex mueve su Electricity innata de última a **primera**.
4. **Con varios mods del mismo elemento, manda la primera posición** en que aparece ese elemento.
5. **Rivens con dos stats elementales:** la prioridad va al **último** stat listado. Si no hay otros
   mods elementales, los dos elementos del Riven **se combinan entre sí**.
6. **Los secundarios innatos no combinan.** Ogris y Penta (Blast), Stug (Corrosive), Nukor y Detron
   (Radiation) **siempre** hacen ese daño; los elementales básicos que se les agreguen combinan
   **entre sí, en paralelo**. Un Tenet Detron (Radiation) con bonus de Electricity del Progenitor
   **no** suma esa Electricity a su Radiation.

## Tipos únicos

> La wiki marca esta sección con **`{{Speculation}}`** y **`{{UpdateMe}}`**.

No están disponibles como daño base de ningún arma normal ni se agregan por mod.

| Tipo | Interno | Qué es |
|---|---|---|
| **Finisher** | `DT_FINISHER` | el de los finishers. **Ignora la DR de armadura**, modificadores neutros |
| **Void** | `DT_RADIANT` | Operador (post *The War Within*) y Xaku. **+daño a Zariman**, neutro contra el resto, con propiedades especiales contra ciertos Sentients. Proc **Bullet Attract** (`PT_RADIANT`): campo de **2.5 m** por **3 s** que redirige todas las balas a su centro |
| **Tau** | `DT_SENTIENT` | ataques de energía de los Sentients, Caliban y la Haalvu. Proc: **+10% de probabilidad de recibir status**, hasta 10 stacks = **+100%** |
| **Cinematic** | `DT_CINEMATIC` | el que aplican los procs de **Slash**. Ignora la DR de armadura, modificadores neutros |
| **Shield Drain** | `DT_SHIELD_DRAIN` | ciertas habilidades de warframe |
| **True** | `DT_HEALTH_DRAIN` | ciertas habilidades y algunas armas. **Sólo aplica a salud y Overguard**, y saltea la DR de armadura |
| **Energy Drain** | `DT_ENERGY_DRAIN` | procs de **Magnetic** y el aura del Ancient Disruptor. Drena energía igual al daño hecho; **la mayoría de las fuentes de DR no lo afectan** |
| **Suicide** | `DT_SUICIDE` | `/suicide`, requiere privilegios de admin |
| wrappers | `DT_PHYSICAL` · `DT_BASE_ELEMENTAL` · `DT_COMPOUND_ELEMENTAL` · `DT_ANY` · `DT_INVALID` | la wiki los cataloga como *posibles* clases genéricas, sin confirmar |

> **`True` no es "ignora todo".** Saltea la reducción por armadura, pero está acotado a **salud y
> Overguard** — no es un daño universal.

## Empyrean — otro sistema de status

Archguns y archmelees hacen **90.91% (10/11) menos daño** a enemigos espaciales; los armamentos del
Railjack y los mods tácticos del Plexus hacen su daño completo.

> **Los status de los seis elementos secundarios NO EXISTEN en combate espacial.** Esos elementos
> siguen aumentando el daño directo, pero **no entran en el reparto de peso de proc** — sólo los
> físicos y los primarios.

| Tipo | Status en Empyrean |
|---|---|
| Impact | **Concuss** — tripulación con −50% accuracy y −30% daño, 6 s (refresca) |
| Puncture | **Decompress** — −8.5% escudos y −9% de armadura **actual**, 20 s (**stack multiplicativo**) |
| Slash | **Tear** — +7.5% de daño recibido, 20 s (**stack multiplicativo**) |
| Cold | **Immobilize** — armas desactivadas y frenado del 80% hasta detenerse, 6 s |
| Electricity | **Scramble** — no puede atacar, gira errático en línea recta, 6 s |
| Heat | **Sear** — DoT 5 s (los procs siguientes aumentan el daño) |
| Toxin | **Intoxicate** — ataca al enemigo más cercano y es atacado, 12 s |

No aplica a enemigos a pie (abordajes de Ramsled, tripulación de Crewship y de puntos de interés):
esos reciben daño y status normales.

## Qué baja el daño base

| Fuente | Efecto |
|---|---|
| **Extinguished Dragon Key** | **−75%** de daño |
| estar bajo un proc de **Puncture** | el objetivo hace menos daño (ver la tabla de físico) |
| Frail Momentum · Hollow Point · Shrapnel Rounds · Vile Acceleration · Anemic Agility | mods corruptos |

> El Extinguished Dragon Key es además uno de los multiplicadores que la recalculación aditiva del
> Condition Overload **ignora** (→ [`condition-overload.md`](condition-overload.md)).

## Escalado de daño enemigo

```text
Damage Multiplier = 1 + 0.015 × (Current Level − Base Level)^1.55
```

Ver [`enemy-level-scaling.md`](enemy-level-scaling.md).

## Colores de los números de daño

| Color | Qué es |
|---|---|
| blanco | daño normal |
| morado | daño de habilidad |
| amarillo | crítico base (*Base Critical Hit*) y ataques de sigilo |
| naranja | *Big Critical Hit* |
| rojo | *Super Critical Hit* |
| azul | daño a escudos y overshields, **sin importar** si fue crítico |
| gris | intento de dañar a un enemigo invulnerable |

Cada proyectil o golpe muestra **una** instancia, redondeada al entero más cercano; las armas de
multishot muestran una por proyectil, y las continuas una a ritmo constante según su cadencia.
Ver [`critical-hits.md`](critical-hits.md).

### Damage Over Time Preview

Desde la versión **43**, la barra de vida muestra **el daño exacto que un DoT activo va a hacer
durante toda su duración**, repartido sobre salud, escudos y/o Overguard. Si ese daño es letal, la
barra queda con **contorno negro**.

> **Sólo cuenta el DoT de status effects, no el de habilidades.** El daño de Spores de Saryn no
> aparece; el de los status que aplica el Bunraku de Koumei, sí.

Que el juego pueda dibujarlo implica que **precomputa el total del DoT en el momento de aplicarlo** —
consistente con el modelo de *seed* guardado de [`damage-calculation.md`](damage-calculation.md).

## Fuentes

- https://wiki.warframe.com/w/Damage
- [`status-effects.md`](status-effects.md) · [`faction-damage.md`](faction-damage.md) · [`enemy-resistances.md`](enemy-resistances.md) · [`enemy-level-scaling.md`](enemy-level-scaling.md) · [`critical-hits.md`](critical-hits.md)
