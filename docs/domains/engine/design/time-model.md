---
Estado: "referencia"
Rol: "Modelo de tiempo del engine — el vocabulario (reloj · línea · ventana · anclaje), qué congela un suceso, y el corpus de estrés que lo produjo. SSoT de la forma; la implementación vive en formulas/status/ y simulate/"
Impacto_ID: "E-TimeModel"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-08-12"
Fecha_de_actualizacion: "2026-08-12"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "docs/domains/engine/design/damage-status-model.md"
  - "docs/domains/engine/status.md"
  - "references/wiki/mechanics/melee-combo.md"
  - "references/wiki/mechanics/adaptation.wikitext"
  - "references/wiki/mechanics/channeled-abilities.wikitext"
---

# El modelo de tiempo

Este documento **no diseña un sistema de tiempo**. Destila la forma que **ya está** en el motor y en
las siete mecánicas que la estresaron, y le da nombre a lo que hoy se llama de cuatro maneras
distintas. El orden fue `efecto → tiempo → efecto sobre el tiempo`: el corpus vino primero.

**Efecto**, acá, es *algo que se resuelve* — un proc, un buff, una habilidad, un gate. No es sinónimo
de status effect; el corpus de §5 tiene tres casos que no son status y son los que más movieron la
forma.

## Cómo leer — procedencia por claim

| Marca | Qué significa |
|---|---|
| **medido** | sonda propia sobre el motor, reproducible; el número está en el doc |
| **fuente** | declarado por la wiki, con el archivo citado |
| **in-game** | medición del usuario en `references/ingame-tests/` — autoridad **sobre** la wiki |
| ⚠️ **derivado** | consecuencia razonada, no observada. Falsable, sin caso todavía |

Nada acá se afirma sin una de las cuatro. Una sección que no pueda citar cuál de los siete casos la
produjo es invención, y se saca.

---

## 1 — El vocabulario: tres cosas que se llamaban "tiempo"

La confusión no era de implementación. Era que **una palabra nombraba tres niveles**, y cada
mecanismo del motor eligió uno sin declararlo.

| | Qué es | De quién es |
|---|---|---|
| **reloj** | la coordenada monotónica. Origen en la foto de `t=0` | **de nadie.** El escenario declara el origen; nadie lo posee |
| **línea** | el reloj de **una entidad** = reloj − sus pausas | de la **entidad** |
| **ventana** | el `{at, until}` de un hecho | **del que la declara** — y son cinco dueños distintos (§3) |

Y un cuarto término, que **no** es de tiempo y por eso está acá — para que no se lo confunda:

> **anclaje** — *dónde* engancha un efecto: a qué capa, a qué nodo, a qué entidad.
> **La primitiva calcula, el anclaje ubica, la ventana dice cuándo.**

⚠️ **`primitiva` NO es sinónimo de `anclaje`.** En este proyecto *primitiva* ya nombra las funciones
puras de [`formulas/`](../../../../Project/src/core/engine/formulas/) (`stackDebuffValue`,
`dotTickValue`, `damageReductionFromArmor`). Son casi opuestos: la primitiva es la que **computa**, el
anclaje es lo que **no debe computar**. Dos referentes para una palabra ya nos costó una vez —
*"portador"* significaba emisor en `arch-decisions §17` y receptor en el resto del corpus.

### Por qué la ventana necesita decir contra qué se mide

Seis armas **pausan el timer de combo mientras están enfundadas** (fuente:
[`melee-combo.md`](../../../../references/wiki/mechanics/melee-combo.wikitext) §Exceptions — Tenet
Livia, Tenet Grigori, Anku, Ack & Brunt, Furax, Okina). Su ventana no avanza con el reloj: avanza con
la **línea** del arma.

Un DoT sobre un enemigo, en el mismo escenario, avanza con el reloj.

⇒ **Dos hechos simultáneos midiendo con relojes distintos.** Un modelo con un solo reloj no puede
expresar la pausa; uno con reloj por entidad pierde el origen común que el escenario declara. Por eso
la ventana **nombra su eje**, y hoy todas menos el combo nombran el reloj.

🔴 **La línea se declara, no se construye.** Tiene **un solo caso probado** (el combo). Construir el
fold sobre pausas hoy sería abstracción especulativa; lo que el modelo debe hacer es admitirla — que
la ventana lleve contra qué se mide — y dejar que el segundo caso la fuerce.

---

## 2 — El principio que separa lo que funciona de lo que no

> **El suceso declara cuándo; la muestra sólo pregunta.**

`arch-decisions §20` decidió que una entidad se lee por **muestreo**, no por eventos. Esa decisión
sólo se sostiene si lo muestreado declara su ventana en términos **absolutos**. El corolario es
falsable y ya tiene tripwire ejecutable
([`dt-invariance.test.ts`](../../../../Project/src/core/engine/__tests__/status/dt-invariance.test.ts)):

> **`dt` es una perilla de costo, nunca de resultado.** Si el número se mueve con el paso de muestreo,
> el muestreo está actuando de fuente de verdad — y el muestreo es la lente, no el suceso.

**Medido** — el reparto actual del motor:

| Forma | Efectos | invariante |
|---|---|---|
| `DotPulse {firstTick, ticks, interval}` — ventana con inicio absoluto | bleed, poison | ✅ |
| rampa de `ignite` — `f(t − firstProcTime)` | ignite | ✅ |
| `StackState {count}` + `decayCount(count, dt)` — escalar que sangra | corrosion, infection, disruption, weakened, freeze | ❌ |
| `context.variables[x]` — el lado emisor entero | — | n/a: **no hay reloj que preguntar** |

**5 de 8 efectos usan la forma que falla.** Y las dos que pasan comparten la propiedad, que no es
casualidad: guardan **cuándo empezó**, no *cuánto llevan*. Las que fallan guardan progreso acumulado
— otra forma de decir que el reloj es del observador.

**Medido** — la fuga, 10 stacks de corrosión leídos a `t=3`:

| `dt` | 3.0 | 1.0 | 0.5 | 0.25 | 1/15 | límite |
|---|---|---|---|---|---|---|
| count | 5.0000 | 5.7870 | 5.9329 | 6.0007 | 6.0484 | 6.0653 |

**Ningún paso da la respuesta correcta** — la da el límite. Y no es una decisión de modelado: la
fórmula **declara una cosa e implementa otra**.

```
lo declarado   count₀ · (1 − t/6)   → llega a 0 en t=6,  invariante a dt
lo escrito     count₀ · e^(−t/6)    → nunca llega a 0,   depende de dt
```

Que nunca llegue a cero es la misma raíz de que **el strip de Heat no termine nunca** (§7).

---

## 3 — La ventana y su dueño

Una ventana es `{at, until}` sobre un eje (§1). Lo que el corpus muestra es que **`until` tiene tres
formas distintas**, y que **el dueño de la ventana no es siempre el mismo**.

### Las tres formas de `until` — y **coexisten**

| Forma | Caso | Fuente |
|---|---|---|
| **número** — `at + duración` | DoT, combo, Adaptation | el default |
| **∞** — no cierra | Xoris (*"infinite combo duration"*) | `melee-combo.wikitext` §Exceptions |
| **predicado** — cierra cuando una condición deja de valer | canalizadas: *"remain active **until energy is completely depleted** or until manually deactivated"* | `channeled-abilities.wikitext` |

⇒ **`until` no es un número; es un número *en el caso común*.** Un modelo que lo tipe como `number`
excluye por construcción a las canalizadas y a Xoris.

🔴 **Y no son alternativas excluyentes: un hecho puede llevar varias, y cierra la primera que ocurra.**
No es un borde — pasa en la mecánica de supervivencia más usada del juego:

```
shield gate    until = at + 0.33…2.5 s                              ← número
                 Y   "recuperar shields durante la invulnerabilidad
                      la termina de inmediato — cualquier cantidad,
                      de cualquier fuente, incluida la regeneración"  ← predicado
```

(`shield.md` §Shield Gating.) Las canalizadas llevan **dos predicados** en la misma conjunción —
energía agotada **o** desactivación manual. En los dos casos gana el primero que se cumpla.

⇒ La unidad no es *"un `until`"* sino **un conjunto de condiciones de cierre**; el caso común tiene
cardinalidad 1 y por eso se veía como un número.

> **Descartado por medición, no por omisión:** *el escenario como dueño de una ventana*. Se barrió
> `references/` entero buscando duraciones fijadas por la misión y aparece **un solo caso**
> —`Corruption` de Void Fissure, `30 s × tier`— que está fuera de alcance (§*Lo deliberadamente fuera
> de alcance*). La cadena de §17 sigue en cuatro eslabones: el escenario actúa **antes**, no dentro.

### Los cinco dueños, medidos

| Ventana | Dueño | Evidencia |
|---|---|---|
| DoT de bleed/poison | **emisor** — congela la duración al aplicar | `damage-status-model.md`, in-game `dot-scaling.md` |
| Adaptation (10 s r0 → 20 s r10) | **receptor** — el rango del mod que la lleva | `adaptation.wikitext` §Stats |
| shield gate (0.33 → 2.5 s) · overguard gate (0.5 s) | **la capa**, y sólo del lado jugador | `shield.md`, `overguard.md` §57-61 |
| combo (base 5 s; Guandao Prime 6 · Pulmonars 9 · Vitrica 10) | **el arma** | `melee-combo.wikitext` §Exceptions |
| canalizada | **predicado sobre el estado del portador** (energía) | `channeled-abilities.wikitext` |

🔴 **Esto es exactamente por qué `GameLaws` no sobrevivió** (`arch-decisions §17`): *un valor plano no
tiene dónde poner su procedencia*. Una tabla de duraciones tiene el mismo defecto estructural. **La
ventana lleva de quién es, o el modelo repite el error que ya desarmamos.**

### El par que lo prueba: dos gates hermanos, procedencias opuestas

| | Duración | De dónde sale |
|---|---|---|
| **Overguard gate** | **0.5 s** | constante de la capa |
| **Shield gate** | **0.33 → 2.5 s** | `f(shields repuestos desde el último gate)` |
| *Catalyzing Shields* | **1.33 s** | fija **por cualquier cantidad** — cambia la naturaleza, no el valor |

Dos capas contiguas, misma clase de evento, y una ventana es constante mientras la otra es función de
estado. **Ninguna tabla plana expresa eso.**

---

## 4 — Qué congela el suceso, y qué se lee live

El emisor es **momentáneo**: aporta lo suyo al aplicar y sale. Lo que aporta:

```
magnitud  ·  duración  ·  cap
```

**Los tres son snapshot de lo que C1 compuso**, y son independientes entre sí — *magnitud ⊥ ventana*
está confirmado en cuatro casos (Adaptation suma y refresca por separado · el combo se vacía o decae
según Power Spike · Roar · Heat).

**El cap también es snapshot del emisor** (in-game, `status-stack-caps.md`): dos jugadores con caps 19
y 10 contra el mismo enemigo, y cada proc usa el cap **del que aplica**. Eso ya tiene su test rojo en
[`stack-cap-ownership.test.ts`](../../../../Project/src/core/engine/__tests__/status/stack-cap-ownership.test.ts).

**Lo que NO se congela: la identidad del emisor.** Refutado por medición — *"Nada en el estado
recuerda quién puso cada stack — no hace falta"*.

### Pero snapshot no es la regla: es un régimen, y hay un caso con los dos

**Fuente** (`channeled-abilities.wikitext`):

> *"Energy drain calculation **does not snapshot** temporary duration or efficiency buffs, and instead
> **updates dynamically**."*
> *"**Hildryn's own abilities do snapshot** Ability Efficiency and Ability Duration for their drains,
> while infused abilities through the Helminth system behave normally."*

⇒ **La misma mecánica, dos regímenes según el portador.** Es el fork PULL/PUSH de `OQ-ENGINE-20` con
un caso concreto enfrente: no se decide por doctrina, lo declara la mecánica.

---

## 5 — El corpus de estrés

Siete mecánicas. Cada fila dice qué **probó** y qué **rompió** de la forma.

| # | Caso | Qué probó | Qué rompió |
|---|---|---|---|
| 1 | **DoT** (bleed/poison) | `at` absoluto ⇒ invariante a `dt` (**medido**: 210 en los 5 pasos) | — |
| 2 | **Stack-debuff** (corrosión et al.) | — | el escalar que sangra: `dt` se filtra al resultado |
| 3 | **Heat / ignite** | la rampa `f(t − at)` es invariante (**medido**) | el cierre: no termina, no vuelve, sube por rampa donde la fuente da escalones |
| 4 | **Adaptation** | *magnitud ⊥ ventana* otra vez; partición por tipo de daño | **la ventana es del receptor**, no del emisor. Y un tercer modo de combinar: `max` (no stackea con Caliban, *"only the higher value"*) |
| 5 | **Combo** | la ventana puede ser del **arma** | la **línea**: 6 armas pausan al enfundar. Y `until = ∞` (Xoris) |
| 6 | **Gates** (shield/overguard) | el cierre **emite otra ventana** | que la ventana sea de la **capa**, y sólo de una clase de portador |
| 7 | **Canalizadas** | — | `until` como **predicado**; y snapshot⊥live con excepción por portador (Hildryn) |

**Saldo:** la forma quedó **más chica** de lo propuesto originalmente —se cayeron el `stamp` (id del
emisor), la condición-de-cierre genérica y el eje agrega/refresca/funde— y **más ramificada** de lo
esperado: `until` tiene tres formas, la ventana cinco dueños, y hay dos ejes de tiempo.

### Lo deliberadamente fuera de alcance

**No es un hueco: es que el engine no apunta ahí.** Sin esto escrito, cada barrido del corpus vuelve a
traer los mismos casos como si fueran agujeros del modelo — ya pasó una vez, con `Convergence`.

| Eje | Qué queda afuera | Qué **sí** puede entrar |
|---|---|---|
| **Afinidad / Focus** | la conversión Affinity→Focus y sus multiplicadores (`Convergence`, orbes, Sanctuary Onslaught) | el **rango de afinidad** (50 m · 75 m con Vazarin): hay habilidades y pasivas que se gatillan por él |
| **Buffs de misión** | Void Fissure (`Corruption`), Nightmare, boosters, Arbitrations, The Index | — |
| **Sinergias de animación** | Sol Gate, Razor Gyre — *"menos tiempo de animación, menos daño"*: acoplan velocidad de animación a daño | el dato importa; modelarlo al milímetro no es el objetivo. **Se separa, no se aproxima** |

⚠️ **Fuera de alcance ≠ el hallazgo cae.** Que el caso salga no retira lo que ese caso mostró, si otro
caso *en* alcance lo sostiene: `Convergence` destapó el `until` conjuntivo y quedó afuera, pero el
shield gate y las canalizadas lo prueban igual (§3). Al descartar un caso, la pregunta no es *"¿lo
modelamos?"* sino *"¿queda algún otro sosteniendo la forma?"*.

### Lo que vive SOBRE el tiempo, y por eso es de otro documento

Tres ejes salieron del corpus, son reales, y **no son tiempo** — usan una ventana sin ser una:

| Eje | Qué es | Su dueño — **la OQ, no la fuente** |
|---|---|---|
| **El payload cualitativo del CC** | *habilita Ground Finisher* · *se corta con un ataque no-melee* · la sub-ventana de **433 ms** para levantarse antes | **`OQ-ENGINE-29`** (*"diseño listo"*), que ya debate la taxonomía de los cuatro estados. El dato: [`crowd-control.md`](../../../../references/wiki/mechanics/crowd-control.md) |
| **`absorber`** | Iron Skin, Snow Globe y Covenant declaran *un tiempo durante el cual absorben*. El verbo es del **efecto**; el tiempo sólo dice "durante" | **`OQ-ENGINE-24`** + `cross-stat-derivation.test.ts`. ⚠️ **Dueño parcial** — ver abajo |
| **Resistir / evitar** | *Primed Sure Footed* impide que el hecho **nazca** — no lo cierra antes | **`OQ-ENGINE-37`** |

**El criterio que los separa:** si sacarlo del modelo deja el *cuándo* intacto, no era tiempo.

⚠️ **El dueño de `absorber` cubre la mitad de abajo, no la de arriba.**
[`.working/defensive-layers-model.md §4.6`](../../../../.working/defensive-layers-model.md) ya resolvió
**dónde aterriza** el término: *"`+ Absorbed` → `total_flat`, **fuera** del `× Strength`"*, con la
precedencia verificada contra la wiki al número. Lo que **nadie** tiene es **de dónde sale ese número**
— que es integrar los eventos que entran durante la ventana, y eso sí lo aporta este modelo.

> **La regla que estos tres ruteos dejan escrita, y que costó descubrir:** el dueño de un eje es la
> **OQ o el doc de diseño** que lo va a resolver, nunca el archivo de `references/wiki/` donde vive el
> dato. `references/CLAUDE.md` es explícito — *"`wiki/` guarda datos, no opiniones"*. Al rutear un eje
> afuera, la pregunta es *"¿qué OQ lo resuelve?"*; si ninguna, **se abre**. Dos de estos tres ya
> tenían dueño y se los buscó tarde.

---

## 6 — Las cuatro formas del estado, y cuál sirve

> **La ventana no tiene semántica propia.** Guarda *cuándo*, y nada más. Qué se hace durante ese
> "cuándo" —emitir daño, absorberlo, habilitar un finisher, no hacer nada— es del **efecto**, no del
> tiempo. Un efecto *"declara un tiempo en el que absorbe"*; el tiempo no absorbe.
>
> Por eso esta sección clasifica **cómo se guarda el tiempo**, no qué hace el efecto con él. Los dos
> ejes son ortogonales y mezclarlos hincha el modelo con casos que no le corresponden.

El corpus no produjo **una** forma. Produjo cuatro, y son irreducibles entre sí:

| Forma | Qué guarda | Casos | En el motor |
|---|---|---|---|
| **población de hechos** | N ventanas independientes | DoT | `DotState { pulses: DotPulse[] }` ✅ |
| **nivel con regímenes** | un valor + hacia dónde se mueve + desde cuándo | Heat | `HeatState` ⚠️ parcial |
| **nivel con una ventana refrescable** | un valor + **una** ventana que se renueva | Adaptation, combo | ❌ no existe |
| **vigencia por predicado** | ninguna ventana: una condición | canalizadas | ❌ no existe |

Y la que el motor usa para 5 de 8 efectos —`StackState { count }` **con decay**— **no es ninguna de
las cuatro**: es un agregado escalar que sangra, y por eso no puede contestar *"cuál es el más
viejo"* ni sobrevivir un cambio de `dt`.

⇒ **La cura de la fuga de `dt` y la de la regla del cap son la misma**, y llegaron por vías
independientes: que el estado lleve **instancias con ventana propia** en vez de un número que
decrece. Dos razones sin relación para el mismo cambio.

---

## 7 — El agujero: el cierre emite otra ventana

**Es una clase, no una rareza.** Cinco casos independientes, de mecánicas sin relación entre sí:

| Caso | Qué pasa al cerrar | Fuente |
|---|---|---|
| **Power Spike** | el combo no se vacía: **resta 20/15/10/5 y abre otra ventana**. 44 veces, 220 s | `melee-combo.wikitext` §Combo Decay |
| **Reversión de Heat** | al expirar, el strip **vuelve** — `50→40→30→15→0` cada 1.5 s | `damage-heat-damage.wikitext` §Armor Stripping |
| **Gates** | la capa se agota → **emite ventana de invulnerabilidad** | `shield.md`, `overguard.md` |
| **Snow Globe recasteado** | el valor acumulado **pasa a la ventana siguiente**: *"absorbs the enemy fire into its health and **adds this health to the next Globe**"* | `snow-globe.wikitext:44` |
| **Lifted → Ragdoll** | el cierre **transiciona a otro estado**, no libera: *"otro proc de Lifted termina el estado antes de tiempo **y lo ragdollea**"*. Y en Ragdoll el cierre por duración **mata** (*"auto-kill si dura demasiado"*) | `crowd-control.md` |

⚠️ **El CC entra acá pese a que su payload es de otro documento** (§*Lo que vive SOBRE el tiempo*), y
el criterio lo explica: sacar la transición **cambia el *cuándo*** —nace una ventana nueva—, así que
esa mitad sí es tiempo. Lo que no entra es *qué* es estar ragdolleado.

**Y el cierre no siempre libera nada.** De los cinco: dos abren otra ventana del mismo hecho (Power
Spike, Heat), uno abre una ventana de otra naturaleza (gates), uno **transporta un valor** al siguiente
(Snow Globe) y uno **cambia de estado** (Lifted). No es un verbo, son cuatro comportamientos.

Y Power Spike trae, además, un dato que el modelo necesitaba:

> *"Combo duration mods greatly increase this time, as **they apply to every reset tick**."*

⇒ **La duración del portador alcanza a las ventanas encadenadas**, no sólo a la primera. Eso no
resuelve el caso de Heat —son mecánicas distintas— pero **quita el "obviamente no"**: la predicción de
que Status Duration no debería tocar la vuelta del strip (`status.md`) pasa de asunción a **medición
pendiente**.

### El gate obliga a un tercer verbo

Las capas se entienden como **extensión de la salud** —sin salud la entidad está muerta, y Toxin lo
prueba: *"ignores enemy and player Shields"*, te mata con el escudo lleno—. Eso valida que `isDead()`
mire sólo la salud. Pero el gate no entra:

```
absorber    la capa toma el daño y derrama el resto      ← receive() lo hace
atravesar   el daño ignora la capa y sigue               ← layers.ts lo declara
cerrar      la capa se agota y EMITE UNA VENTANA         ← no existe
```

**Un gate no extiende la salud: la protege absolutamente.** Es el verbo que conecta este documento con
la pila de capas, y el que hoy no tiene dónde vivir.

---

## 8 — El anclaje se resuelve local (y por eso no es una tabla)

*Dónde* engancha un efecto **no es una propiedad global**: es una pregunta que se hace en el punto de
contacto.

```
efecto → llega a la capa → la capa pregunta: ¿quién me porta? → resuelve
```

Es el **mismo mecanismo** que ya opera en dos lugares que no saben que son el mismo: `vitalsOf` (el
participante declara con qué nombres se leen sus vitales, `arch-decisions §18` invertido) y §17 (*el
receptor gana cuando habla; si calla, rige el default*).

**La regla, en una línea:**

> **Toda regla de anclaje se resuelve local; algunas no discriminan por clase.**

| Caso | ¿Discrimina? | Fuente |
|---|---|---|
| Toxin vs shields | **no** — *"ignores **enemy and player** Shields, but not Overguard"* | `damage-toxin-damage.wikitext:13` |
| Overguard vs status | **sí** — jugador: *"los niega todos"* · enemigo: *"los recibe normalmente"* | `overguard.md:57-59` |
| Gate al agotarse | **sí** — jugador 0.5 s · enemigo ninguno | `overguard.md:61` |

⚠️ **Consecuencia para [`contracts/layers.ts`](../../../../Project/src/core/engine/contracts/layers.ts):**
su tabla `BYPASSED_BY` tiene **un eje donde la realidad tiene una pregunta**. No está mal — es el caso
*"calla"*, que es el común. Pero no puede expresar `Overguard × jugador`, y el `⚠️ asunción` que ya
lleva sobre el overshield es el síntoma del mismo hueco.

**Lo que sí es estático y lo que no:**

| | Cuándo se resuelve |
|---|---|
| **anclaje** — *qué* atraviesa *qué*, y de quién es esa regla | **C1** — como `familyRoute` ya resuelve la familia de vitales |
| **la capa que recibe este golpe** | **runtime** — depende de cuánto queda, y eso cambia |

---

## 9 — Lo que queda abierto

| # | Qué | Estado |
|---|---|---|
| 1 | **La línea** (reloj por entidad) | declarada, **no construida**. Un solo caso (combo, 6 armas) |
| 2 | **`until` como predicado** | declarado. Sin implementación — las canalizadas no están modeladas |
| 3 | **El tercer verbo (`cerrar`)** | sin lugar. `it.fails` vivo en `state-neutrality.test.ts` |
| 4 | **`StackState` → instancias** | la cura de 2 bugs independientes. Sin ejecutar |
| 5 | **snapshot ⊥ live** | `OQ-ENGINE-20`. Ahora con caso (Hildryn) y con tirada definida |
| 6 | **¿Status Duration alarga la vuelta del strip?** | ⚠️ derivado. Power Spike da precedente **a favor**; **falta medición in-game** |
| 7 | **Los 4 tokens `*_DURATION`** | **medido**: 2 se componen con valor real; `WEAPON_ADD_STATUS_DURATION` no tiene portador en el catálogo (sí 9 en datasets). `DECAY_DURATION = 6.0` sigue constante |
| 8 | **Cierre conjuntivo** (`until` con varias condiciones) | declarado en §3, **sin implementación**. El shield gate lo necesita entero |
| 9 | **La duración de Ragdoll** | *"variable · auto-kill si dura demasiado"* — **ni la wiki la declara**. Hueco de fuente, no del modelo; su dueño es `crowd-control.md` |

### Evaluado y descartado — no re-abrir sin caso nuevo

| Qué se evaluó | Por qué cayó |
|---|---|
| **El escenario como dueño de una ventana** | barrido completo de `references/`: **un solo caso** (`Corruption`, `30 s × tier de misión`) y está fuera de alcance. La cadena de §17 queda en cuatro eslabones — el escenario actúa **antes**, no dentro |
| **`stamp`** — la identidad del emisor en la instancia | refutado in-game: *"Nada en el estado recuerda quién puso cada stack — no hace falta"* (`status-stack-caps.md`) |

🔴 **El gate del substrato sigue partido.** `decision-frontier §4` lo enumera con 5 fronteras. Este
documento contesta *"¿cómo modelamos el tiempo?"*; sigue gateada *"¿hace falta un substrato steppeado
dedicado?"* — pulsos-que-generan-pulsos, coupling Viral y densidad→EV siguen enteras. **La reducción
que NO activa el gate: log por portador, no timeline global** (un log global sólo hace falta para
ordenar hechos de portadores distintos en el mismo instante = `OQ-ENGINE-19`, ya gateada).

---

## 10 — Vínculos

- [`arch-decisions.md`](arch-decisions.md) — **§19** (frame-0 ⊥ tiempo) · **§20** (muestreo, no
  eventos — la decisión que §2 sostiene) · **§22** (capa ⊥ estado ⊥ clase) · **§17** (procedencia del
  parámetro; el argumento que §3 reusa para la ventana)
- [`damage-status-model.md`](damage-status-model.md) — el modelo unificado de proc; *"el proc
  determina la base, el tick evalúa al emitir"*
- [`../status.md`](../status.md) — las deudas medidas: la fuga de `dt`, el reloj del timeline, Heat
- [`melee-combo.md`](melee-combo.md) — el consumidor del combo; su ventana es el caso 5
- **Fuentes:** `melee-combo.wikitext` · `adaptation.wikitext` · `channeled-abilities.wikitext` ·
  `damage-heat-damage.wikitext` · `damage-toxin-damage.wikitext` · `shield.md` · `overguard.md`
- **In-game:** `status-stack-caps.md` (el cap es del que aplica) · `dot-scaling.md` (el DoT no hereda
  el hit resuelto)
