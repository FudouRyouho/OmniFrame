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

## P-5 · ¿Los buffs de warframe alcanzan al compañero?

**Estado:** hueco del corpus — no hay página de compañeros en `wiki/`, y la de la habilidad no lo dice.

`Speed` (Volt) describe su efecto sobre *"allies"* y *"affected players"*, **sin mencionar
compañeros ni sentinels**. Que el buff le caiga también al compañero es experiencia de juego del
usuario, sin medición y sin fuente que lo respalde.

**Cómo se mide:** Volt con un sentinel armado. Medir la cadencia o el tiempo de recarga del arma del
sentinel —el stat que Speed toca en las armas— con la habilidad inactiva y activa. Si cambia, el buff
propaga al compañero; si no, la propagación se detiene en el portador.

**Vale la pena separar dos preguntas** que el mismo test responde: si propaga **el buff de movement**
(el sentinel no camina, así que puede no aplicar) y si propaga **el de arma** (reload / attack speed),
que es el que tiene lectura directa.

Va a `OQ-ENGINE-31`: define si la entidad compañero nace necesitando recibir efectos de otra entidad,
que es lo que decide la forma del modelo.
