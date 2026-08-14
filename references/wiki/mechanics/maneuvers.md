# Maneuvers / Parkour

> Estado: activo
> Rol: mecánica de movimiento — el catálogo de maniobras, sus constantes duras (duraciones, velocidades, umbrales) y qué eje de mejora gobierna a cada una
> Fuente de verdad de: la duración del Aim Glide (3 s) y del Wall Latch (6 s) y su timer compartido · el umbral de Hard Landing (20 m/s) · la fórmula de daño del Jump Kick · la velocidad inicial del Bullet Jump · la velocidad sobre zipline · qué maniobras resetea cada superficie · qué gobierna cada eje de mejora (Parkour Velocity, Dodge Speed, Mobility, Slide/Friction)
> No usar para: la lista completa de mods por eje (galerías del raw) · la **velocidad base de movimiento y su composición** (`movement-speed.md`, que la publica con tabla y fórmula) · la velocidad de sprint por warframe (`sprint-speed.wikitext`) · las leyes de Knockdown en sí (`knockdown.wikitext`) · movimiento de Necramech — la página lo declara pendiente con `{{UpdateMe}}`
> Última actualización: 2026-07-31
> Fuente: https://wiki.warframe.com/w/Maneuvers · https://wiki.warframe.com/w/Knockdown
> Fuente actualizada: 2026-08-13
> Raw: maneuvers.wikitext · knockdown.wikitext

## Definición

> *"Maneuvers o Parkour son un conjunto de acciones que el jugador puede realizar con el Warframe y
> el arma cuerpo a cuerpo. Incluye rolls, wallruns, esgrima y acrobacias."*

El sistema actual es **Parkour 2.0** (Update 17), que reemplazó al de stamina — la stamina fue
eliminada del juego en esa misma actualización.

## Las constantes

Todo lo que la página publica como número duro, junto:

| Maniobra | Constante |
|---|---|
| Aim Glide | **3 s** de duración |
| Aim Glide con Archgun desplegado | −~70% → **0.9 s** sin aumentos |
| Wall Latch | **6 s** de duración |
| Bullet Jump | **14.5 m/s** de velocidad inicial |
| Bullet Jump — daño | **100 Blast** + proc garantizado, radio **3 m**, con falloff |
| Jump Kick — daño | **20 Impact + 100%** del daño base del melee equipado |
| Hard Landing | umbral de **20 m/s** de velocidad de caída |
| Zipline | **6 m/s** base a pie → **7.5 m/s** montado (base y composición: [`movement-speed.md`](movement-speed.md)) |
| Wall Dash horizontal | ángulo de entrada **< 70°** respecto a la pared |
| Knockdown Recovery | ventana de **433 ms** |
| Slam Jump | ~**50 m/s** (técnica de comunidad) |

## Movimiento básico

**Sprint.** Cada warframe tiene su propia velocidad base — el catálogo está en
[`sprint-speed.wikitext`](sprint-speed.wikitext) y en [`movement-speed.md`](movement-speed.md).
Disparar cancela el sprint, pero ciertos melee se pueden blandir sprintando. Formas alternas como
*Razorwing* (Titania) o *Pulverize* (Grendel) también reciben los mods de Sprint Speed.

**Roll (Dodge).** Maniobra evasiva básica:

- **reduce todo el daño recibido en 75%** durante la animación (con *Rolling Guard*, invulnerabilidad);
- otorga **inmunidad a Knockdown** mientras dura;
- **se sacude** enemigos y proyectiles adheridos (Latchers, Maggots, Leeches) y **dispela** algunos
  estados —esporas de Swarm Mutalist MOA, *Banish* no deseado— y niega algunas habilidades enemigas,
  como las olas de fuego de los Arson Eximus;
- rodar justo antes de tocar el suelo **evita el Hard Landing**;
- permite recoger objetos transportables (datamasses, células de excavación) sin la animación de
  recogida, presionando interactuar durante el roll.

Un roll ejecutado **en el aire** exige tocar el suelo antes de repetirlo — salvo que un Wall Dash o
un Wall Latch lo reseteen. La distancia la aumentan los mods de Parkour Velocity; la **velocidad** de
la maniobra es un eje distinto (Dodge Speed).

**Sidespring / Backspring.** Variantes laterales y hacia atrás (apuntar + dirección + tap de sprint).
El sidespring tiene alcance corto comparado con los demás; el backspring conserva la orientación.
Ambos sirven en el aire para ajustar trayectoria o aterrizaje, y **en el aire el backspring no
requiere apuntar**, porque el personaje no gira automáticamente al pulsar atrás.

**Crouch.** Baja al warframe a aproximadamente media altura, **reduce el tamaño del hitbox** y ayuda
al sigilo. Se puede rodar agachado.

**Slide.** Crouch en movimiento. Frena gradualmente por *fricción*, salvo en pendientes. Permite
armas a distancia, y con melee ejecuta un **Slide Attack**.

## Saltos

**Double Jump.** Conserva el momentum. **Cualquier** superficie —pared o suelo— recarga la
posibilidad de volver a hacerlo.

**Bullet Jump.** Desde crouch, lanza al warframe hacia la retícula a **14.5 m/s** iniciales.
Deposita **100 de Blast con proc garantizado en un radio de 3 m** desde el punto de partida, con
falloff por distancia; ese daño es modificable por mods exilus (*Piercing Step*).

Reglas de encadenado: no se repite hasta volver a tocar el suelo; **no** se puede hacer después de un
double jump, pero sí un double jump después de él; Wall Dash y Wall Latch también lo resetean.

**Jump Kick.** Crouch iniciado en el aire. Mantiene el momentum y extiende el alcance del salto; al
aterrizar continúa como slide. Con melee equipado ejecuta un Slide Attack aéreo.

Derriba a la mayoría de los enemigos que golpea, y aplica **20 de Impact + 100% del daño base del
melee equipado** (incluidos los mods de daño base). Ese daño **no aumenta por headshot**, y sube a
**20 + 200%** con *Gale Kick* equipado.

**Aim Glide.** Apuntar en el aire frena el descenso a un planeo controlado, durante **3 segundos**;
al agotarse, el warframe cae rápido. Pese al nombre, también se activa **bloqueando con melee o
casteando habilidades**. Hace al jugador más difícil de acertar — reduce efectivamente la precisión
enemiga (ver [`accuracy.md`](accuracy.md) §*Accuracy del enemigo*).

Con un **Archgun desplegado** la duración baja **~70%: 0.9 segundos** sin aumentos. **Comparte su
temporizador con el Wall Latch**, aunque las duraciones base son distintas (3 s contra 6 s).

**Mantling.** Al saltar, el warframe intenta agarrarse de cualquier borde y treparlo, haya o no
espacio para quedar de pie. Un double jump durante el mantle acelera la subida. **No ocurre durante
el casteo de habilidades**, y se cancela con crouch o slide.

## Paredes

**Wall Dash.** Correr hacia una pared y pulsar salto.

- **Vertical** — dirección perpendicular a la pared. Se encadena indefinidamente manteniendo salto.
- **Horizontal** — entrada con **menos de 70°** respecto a la pared. También encadenable, y se puede
  alternar con la vertical orientando la cámara.

En ambos casos, **cuanto mayor la velocidad de sprint del warframe, más rápido escala**. Desde el
Update 36 los mods de Parkour Velocity también aceleran el desplazamiento paralelo a la pared y el
impulso al saltar lejos de ella.

**Wall Latch.** Apuntar durante un Wall Dash fija al warframe a la pared, inmóvil, durante **6
segundos**; al expirar se suelta involuntariamente. Permite castear algunas habilidades que
normalmente no se pueden usar en el aire, y **evita la caída dura** si se ejecuta mientras se cae.
Con un Archgun desplegado **no se puede** hacer.

**Wall Dash y Wall Latch cuentan como reset de suelo**: devuelven Roll, Double Jump y Bullet Jump sin
necesidad de aterrizar.

## Hard Landing

Ocurre al caer al suelo a **20 metros por segundo** desde una altura considerable. El warframe queda
**momentáneamente inmóvil** mientras se recupera del impacto, pero **no recibe daño de caída**.

Se previene con double jump, jump kick, roll o aim glide justo antes de tocar el suelo.
Alternativamente, *Kavat's Grace* mitiga sus efectos.

## Zipline

Líneas colgantes entre dos objetos. Se montan con la tecla de uso, incluso desde el aire y en
cualquier punto de su longitud; se desmontan con la misma tecla o con una maniobra como el Bullet
Jump. Se puede caminar, sprintar, deslizarse y disparar sobre ellas, pero **no castear habilidades ni
atacar con melee**.

Montado, la velocidad base de movimiento sube de **6 m/s a 7.5 m/s**, y **apuntar no aplica su
penalización** de velocidad. Qué es ese 6 m/s y cómo se compone con el stat del warframe:
[`movement-speed.md`](movement-speed.md).

## Knockdown Recovery

Pulsar salto o roll dentro de una ventana durante la animación de Knockdown ejecuta una animación de
recuperación, que acorta el tiempo en el suelo. La ventana es de **433 ms** desde el Update 43; el
cuerpo de *Maneuvers* todavía la da como 70 ms.

> ⚠️ Desactualizado → [`knockdown.wikitext`](knockdown.wikitext) §Patch History `{{ver|43}}`

El warframe **destella** al recuperarse con éxito. El destello que debía señalar la ventana *durante*
el knockdown está declarado **bugueado** y no aparece en ninguna instancia, aunque la ventana existe
igual.

**Contraintuitivamente, *Handspring* dificulta la recuperación**: acelera notablemente la animación de
knockdown, lo que **encoge** la ventana disponible.

## Maniobras de melee

**Slam Attack.** Cualquier melee puede ejecutarlo en el aire, provocando una caída en picada hacia el
objetivo. Sirve para bajar rápido o para cruzar distancias en diagonal. La retícula debe estar por
debajo de cierto ángulo; si no, sale un Aerial Attack.

**Heavy Slam Attack.** Igual de útil para desplazarse, pero funciona **con la retícula en cualquier
dirección**, lo que permite usarlo siempre en su ángulo máximo —máxima distancia horizontal por
slam— sin arriesgar un aerial attack accidental.

**Forward Blocking Combo.** El primer movimiento del combo de bloqueo hacia adelante de muchas
stances es un cierra-distancias. Aumentar la velocidad de ataque los completa más rápido y con más
velocidad, **aunque demasiada acorta su alcance**. A diferencia del parkour, **estos ataques se pueden
dirigir durante la ejecución**: su orientación horizontal se curva hacia la retícula. Por eso sirven
donde el parkour no está disponible (*Prowl* de Ivara, *Assimilate* de Nyx). El catálogo de stances
con cierra-distancias está en el raw.

## Técnicas avanzadas

> La página marca esta sección como **contenido de comunidad** (`{{Community}}`), no documentación
> oficial de la mecánica.

- **Bullet Roll** — Bullet Jump y Roll simultáneos. Se comporta como ambos: recibe los bonos de los
  dos y dispara efectos de roll (*Rolling Guard*, *Motus Setup*). La dirección queda entre la
  retícula y el eje horizontal, lo que permite ángulos más altos que un roll, pero no la vertical
  pura de un bullet jump. El passive de Chroma permite dos seguidos.
- **Slam Jump** — melee slam con un giro rápido de cámara hacia abajo, que proyecta al jugador hacia
  su orientación inicial a ~**50 m/s**. **No funciona con Glaives**; sí desde un Necramech.
- **Slam Cancel** — rodar para salir de la animación de slam.
- **Roll Slide** — deslizarse durante un roll para ajustar su dirección.
- **Roll Pickup** — recoger objetos durante un roll, sin bloqueo de animación.

## Los ejes de mejora

Qué gobierna cada eje. **La lista completa de mods por eje vive en las galerías del raw**, no acá.

| Eje | Qué afecta |
|---|---|
| **Aim Glide/Wall Latch Duration** | las duraciones de Aim Glide **y** Wall Latch |
| **Dodge Speed** | la *velocidad* del roll, sidespring y backspring |
| **Parkour Velocity** (localizado *"Bullet Jump"*) | velocidad de Bullet Jump, Double Jump, roll, sidespring y backspring; desde Update 36 también el desplazamiento paralelo a la pared, el impulso al saltar lejos de ella y el cambio instantáneo de velocidad del double jump |
| **Movement Speed** | la velocidad de animación de las maniobras **que no son sprint** ([`movement-speed.md`](movement-speed.md)) |
| **Sprint Speed** | la velocidad de animación del sprint |
| **Slide** / **Friction** | la velocidad de deslizamiento / la resistencia a frenar deslizándose |
| **Mobility** | **exclusivo de Conclave** — multiplicador de velocidad de Bullet Jump, de slide y de fricción de slide |
