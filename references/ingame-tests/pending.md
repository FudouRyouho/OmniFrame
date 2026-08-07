# Mediciones pendientes

> Rol: preguntas que **sólo se cierran midiendo** — ni la wiki las responde ni el razonamiento las
> decide. Cada una con el diseño del test que la cerraría.
> Fuente de verdad de: nada todavía. Este archivo registra **huecos**, no resultados.
> Editable: ✅ — el usuario agrega, mide y mueve a su propio `.md` al cerrar.

Una entrada sale de acá cuando se mide: pasa a ser un test con su archivo propio en este directorio, y
lo que corrija de la wiki lleva su `⚠️ Discrepancia →` del lado del doc corregido.

**Que algo esté acá no es un pendiente urgente.** Es un hueco que ya no hay que volver a descubrir: la
pregunta está formulada y el método pensado, así que el día que haya ganas de medir no hay que
reconstruir nada.

---

## P-1 · Overguard del jugador frente a Magnetic y Heat

**Estado:** sin apuro. Duda del usuario; la wiki **ni lo afirma ni lo desmiente**.

La tensión sale de dos afirmaciones de la wiki que no hablan entre sí:

1. *"Magnetic amplifies **all** damage dealt to Overguard […] 100% on the first stack…"* — sin
   distinguir jugador de enemigo.
2. Del lado del jugador, el Overguard *"will **negate all** Status Effects, including Stagger and
   Knockdown"*.

Si el Overguard del jugador niega todos los status, nunca acumula stacks de Magnetic — y entonces el
amplificador del punto 1 no tendría cómo aplicarse. Mismo razonamiento para Heat: sin proc, no hay
strip de armor.

**Eso es deducción, no dato.** Podría existir un orden de resolución —el daño amplificado se calcula
antes de que el status se niegue— que la vuelva falsa. Por eso no se escribe en ningún doc como ley.

| # | Pregunta | Cómo se mide |
|---|---|---|
| 1 | ¿Magnetic amplifica el daño contra el Overguard **del jugador**? | Overguard conocido, hit conocido, con y sin Magnetic |
| 2 | ¿Un proc de Heat sobre un jugador con Overguard **reduce su armor**? | armor visible antes/después |
| 3 | ¿El daño de Electricity al romperse (3%/stack) aplica también al jugador? | derivada de la 1 |

**Ya resuelto por la wiki, no hace falta medirlo:** el caso "Inaros con Arcane Persistence recibe
Overguard de un aliado" está cubierto —`arcane-persistence.md` registra que funciona con Overguard de
cualquier fuente (con el bug de capear sólo el primer hit de cada segundo), `overguard.wikitext`
confirma que un aliado puede dar Overguard a alguien sin shields, y `arcane-aegis.wikitext` lo cierra
desde el otro lado. Lo que **no** está cubierto es cómo se comporta ese Overguard frente a Magnetic y
Heat.

---

## P-2 · ¿Los status sin ícono cuentan para Condition Overload?

**Estado:** diseño del test cerrado, falta ejecutarlo.

`condition-overload.md` lista `Lifted`, `Knockdown` y `Microwave` entre los que cuentan. Son estados
sin ícono en la UI del enemigo. La sospecha del usuario es que se parcheó hace años sin anunciarlo.

**El diseño completo, con su justificación, vive en `OQ-ENGINE-29`.** Lo esencial:

- **métrica en ratio** — dos disparos contra el **mismo** enemigo, con y sin el status. Los stats del
  enemigo se cancelan en la división, así que el test no depende de que el data-set lo modele bien.
- **sujeto que aísle** — el arma no puede aplicar otro status a la vez. La Nukor **no sirve** para
  `Microwave` (Radiation innato). `Lifted` (heavy slam) y `Knockdown` (jump kick) se inducen sin
  aplicar ningún status elemental.
- **enemigo sin armor** — para no arrastrar la fórmula de DR, todavía en conflicto de 3 vías.

**Predicción falsable:** con CO activo y cero status normales, aplicar sólo un `Lifted` o un
`Knockdown` debe mover el daño si la wiki tiene razón.

---

## P-3 · ¿Cuánto absorbe realmente un punto de shield?

**Estado:** el conflicto ya está marcado en los dos documentos; la medición elige ganador.

Tres cifras distintas para la misma cosa, y ninguna es descartable de escritorio:

| Fuente | Dice |
|---|---|
| `Hit_Points` §Effective Shield | `(Net Shield + Net Overshield) × 0.5` |
| `Health` §Effective Health | `Nominal Shield × 2`, con la nota *"Shield has a general 50% damage reduction"* |
| `Damage` §patch history, **v27.2** | *"Player Shields now reduce **25%** of incoming damage"* |

Las dos primeras están marcadas `⚠️ Conflicto ↔` una contra la otra: dicen lo contrario con el mismo
50% de DR de fondo. **La aritmética favorece al `× 2`, y eso no es fundamento** — la regla es marcar
los dos lados, no votar.

La tercera **no es una cuarta marca**: un patch note de 2020 no está en conflicto con la página
vigente, la precede. Se registra acá porque si la medición da un valor distinto de los tres, ya hay
tres fechas donde mirar para saber cuándo cambió.

**Cómo se mide:** shield conocido, hit de daño conocido sin bonus de tipo, contar cuánto shield
consume. Cierra el conflicto y lo convierte en `⚠️ Discrepancia →` contra este directorio.

---

## P-4 · Composición entre fuentes de life steal

**Estado:** hueco de la fuente, no de nuestra captura.

`Life_Steal` define la mecánica y lista fuentes, y **no dice una palabra** sobre cómo componen entre
sí. La afirmación de que se suman aditivamente es experiencia de juego del usuario, sin medición.

**Cómo se mide:** dos fuentes conocidas de life steal, enemigo de health conocida. Medir el HP
recuperado con cada una por separado y con las dos activas. Si `AB = A + B`, es aditivo; si
`AB < A + B`, compone en cadena.

Detalle: es un hueco de la wiki, así que el resultado **no** genera marca de discrepancia contra
ningún doc — no hay nada que contradecir. Va a `OQ-ENGINE-26`.

---

## P-5 · ¿Qué determina que un buff propague al compañero y no se detenga en el portador?

**Estado:** hueco de la fuente — la regla no está publicada en ningún lado.

Que los buffs de warframe alcancen al compañero **no está en duda**: los compañeros son *allies*, y
las habilidades que afectan *"all allies in range"* los incluyen. Lo que no se sabe es **el borde**:
la mayoría le llega, pero no todos, y ninguna página dice qué los separa — `Companion` no trata el
tema y las páginas de habilidad describen el caso jugador.

**Cómo se mide:** Volt con un sentinel armado, midiendo la cadencia del arma del sentinel con *Speed*
inactiva y activa. Conviene separar las dos facetas que el mismo test expone: el buff de **arma**
(reload / attack speed), que tiene lectura directa, y el de **movement**, que a un sentinel puede no
aplicarle por no caminar. Esa diferencia —si existe— es la primera pista del criterio.

**Qué se busca, más allá del sí/no:** un buff que **no** propague, para contrastarlo con los que sí.
Un solo contraejemplo bien elegido vale más que confirmar diez casos positivos: es lo que convierte
"la mayoría propaga" en una regla que el motor pueda aplicar sin enumerar excepciones.

Va a `OQ-ENGINE-31`: define si el modelo puede tener una regla de propagación o necesita una tabla.

### ⭐ El contraejemplo apareció — y el corte no es "aliado", es **quién emite**

Observación del usuario (juego, no wiki). Los **fragmentos de arconte** dan el par que P-5 pedía:

| Fragmento | Alcanza a | ¿Propaga? |
|---|---|---|
| **toxina** (daño de status Toxin) | el **arma del compañero** | ❌ **no** |
| **violeta** (daño eléctrico de habilidades) | los **minions de Caliban** | ✅ **sí** |

Ambos son "del jugador" y ambos apuntan a algo que dispara — y el juego los separa. La regla que
emerge: **el desvío alcanza lo que la entidad *emite*, no lo que la entidad *tiene***. La invocación de
Caliban es la habilidad continuando (sub-source); el compañero es una entidad con **intención propia**.

⚠️ **No cierra P-5**, la reencuadra: la pregunta deja de ser *"¿qué buffs propagan?"* y pasa a ser
*"¿dónde termina lo que una entidad emite?"*. El test de Volt+sentinel sigue en pie y ahora tiene una
predicción que falsar: **si el corte es "intención propia", *Speed* tampoco debería alcanzar al arma del
sentinel** — y eso contradice la expectativa común, así que el test vale doble.

❓ **Sin caso posible:** un minion que emita el mismo tipo de daño que el fragmento del portador
(¿el fragmento de toxina alcanzaría a un minion que hace daño Toxin?). No existe la combinación.

---

## ~~P-6 · El cap de stacks con dos jugadores~~ — **MEDIDO** → [`status-stack-caps.md`](status-stack-caps.md)

Se midió con dos jugadores (cap 19 vs cap 10, cinco escenarios). **El cap decide entre sumar y
reemplazar; el proc siempre entra.** Y corrigió la formulación que esta entrada usaba —*"el cap gatea
la escritura"*—: el proc sobre-cap **sí escribe**, refresca el stack más viejo.

---

## P-7 · ¿`Damage Vulnerability` aplica al DoT de Slash (daño True)?

**Estado:** el motor toma una posición hoy y **nadie la verificó**.

El Test 7 (`damage-buckets.md`) midió DV sobre el tick de **Ignite** —no-True— y dio `×2.000` exacto,
single-dip. El caso True quedó fuera: el bleed de Slash **bypasea la matriz de facción y la DR**, y la
pregunta es si `Damage Vulnerability` viaja con ese bypass o es un slot aparte que se paga igual.

**Qué asume el motor:** que es un slot aparte. `CombatSimulator.ts:98` computa el `stateMultiplier`
**antes** del branch de `bypassArmorMatrix`, así que el bleed lo paga completo. Es coherente con que
DV sea una fila distinta del lado receptor, pero **es coherencia, no medición**.

**Cómo se mide:** arma de Slash puro contra el enemigo de siempre, dos tiradas — sin DV y con una DV
sin filtro y de magnitud conocida (Molecular Prime +100%, o Reap). Se compara el **último tick** del
bleed, no el primero.

```
ratio esperado si DV aplica:      tick_con_DV / tick_sin_DV = 2.00
ratio esperado si viaja al bypass: 1.00
```

El contraste es binario y grande — no hace falta precisión fina para distinguirlos.

**Qué decide:** si da `1.00`, la fórmula del tick True de `damage-status-model.md` pierde el término
`DV(target,t)` y `resolveDamageEvent` necesita mover el `stateMultiplier` adentro del branch. Si da
`2.00`, confirma la posición vigente y cierra el único hueco que quedó abierto al cerrar C.

---

## P-8 · ¿Un Acolyte toma `Lifted` de un heavy slam?

**Estado:** hueco de la fuente — la página de Acolytes no lo declara, y el salto que lo cerraría es
**inferencia nuestra**.

`Acolytes` declara sólo el cap de 4 status y lo de Radiation: **no enumera inmunidades físicas**.
`ragdoll` sí los lista entre los inmunes a *"(complete) crowd control"*, y `Lifted` está declarado
*"a more specific type of ragdolling effect"* — pero **`Lifted ⊂ ragdoll` es un salto que ninguna
fuente hace**, y `crowd-control.md` sostiene lo contrario: *"no forman una escala; son cuatro estados
con fuentes propias"*.

**Datos del usuario** (juego, no wiki): Rhino *Stomp* casi no les hace efecto · Mag *Pull* no les
afecta. Consistente con inmunidad a CC; **no cierra `Lifted`**, que llega por una vía distinta (melee).

**Cómo se mide:** heavy slam sobre un Acolyte, mirando si aparece el estado suspendido. El slam es la
vía natural porque *"todos los heavy slams"* aplican Lifted.

**Qué decide, y por qué importa más de lo que parece:** `Lifted` **cuenta para Condition Overload**. Si
el Acolyte no lo toma, **el slam pierde un stack de CO contra él** — y contra un enemigo que ya topea
en 4 status, perder uno es 25% del multiplicador. Si lo toma, el ejemplo de *"inmunidad física con
consecuencia numérica"* se reduce a Microwave (exclusivo de Nukor).

> Se mide junto con `P-7`: los dos son sobre el mismo enemigo de referencia.

---

## P-9 · ¿La lectura de una entidad la decide su **clase** o su **bando**?

**Estado:** dos observaciones propias apuntan a *clase*, y ninguna está confirmada con un número.

El corpus escribe las reglas de Overguard como *"on players / on enemies"*, pero esos dos conjuntos son
disjuntos en la práctica, así que **el fraseo no distingue** entre "manda el bando" y "manda la clase".
`arch-decisions.md` §22 adopta *clase* — y estos dos casos son los que lo falsarían.

| Observación del usuario | Qué predice §22 |
|---|---|
| **Un compañero con Overguard se comporta como un warframe** (mismas reglas; el shield gating funciona casi igual) | ✅ consistente: compañero está en la lista de clases que reciben Overguard |
| **Un Eximus bajo *Mind Control* sigue siendo Eximus** al pasar al bando aliado | ✅ consistente: la clase es intrínseca |

**Cómo se mide el segundo, que es el discriminante:** aplicar *Mind Control* a un Eximus y verificar si
conserva su Overguard y su cap de status. **Si al cambiar de bando pasara a leer con las reglas de
"player"** —negar *todos* los status en vez de sólo el CC— entonces manda el bando y §22 está mal.

**Cómo se mide el primero:** un compañero con Overguard recibiendo un proc de CC. Si lo niega entero
lee como warframe; si sólo filtra el CC, lee como enemigo.

**Qué decide:** si manda el bando, la clase deja de ser el argumento de la lectura y §17/§20/§22
pierden su prerequisito común. Es el test más barato que puede tirar abajo tres secciones a la vez.
