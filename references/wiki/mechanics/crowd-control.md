# Crowd control — los estados físicos del enemigo

> Estado: activo
> Rol: los cuatro estados físicos que el juego aplica a un enemigo (o al jugador) — stagger, knockdown, lifted y ragdoll: qué los separa, qué habilita cada uno y cuáles se rompen entre sí
> Fuente de verdad de: que los cuatro son **status effects** (los cubre Status Immunity) · **cuál habilita Ground Finisher y cuál no** · la duración de Lifted escalada por combo · la escalada stagger→knockdown del self-stagger · la ventana de recuperación de 433 ms · resistencia ≠ velocidad de recuperación · el auto-kill del ragdoll prolongado
> No usar para: el **umbral de Mercy del Parazon**, que es otra ejecución — ver [`damage-physical.md`](damage-physical.md) §Impact · el catálogo de habilidades que causa cada estado (son galerías completas en los raws) · los valores de resistencia por mod (están en la página de cada mod)
> Última actualización: 2026-07-31
> Fuente: https://wiki.warframe.com/w/Knockdown · https://wiki.warframe.com/w/Stagger · https://wiki.warframe.com/w/Lifted · https://wiki.warframe.com/w/Ragdoll
> Fuente actualizada: 2026-06-22
> Raw: knockdown.wikitext · stagger.wikitext · lifted.wikitext · ragdoll.wikitext

> ⚠️ La wiki marca `Stagger`, `Lifted` y `Ragdoll` con **`{{UpdateMe}}`**. Sólo `Knockdown` no lleva marca.

## Los cuatro de un vistazo

**Se parecen mucho en pantalla y no hay ícono que los distinga** — de ahí que se confundan. Lo que
realmente los separa es **qué habilitan** y **cuánto duran**:

| Estado | Qué le pasa al enemigo | ¿Ground Finisher? | Duración |
|---|---|---|---|
| **Stagger** *(«Interrupt»)* | se tambalea y retrocede, **no cae** | ❌ | breve, fija |
| **Knockdown** | queda **tumbado** en el piso | ✅ | recuperación de 433 ms |
| **Lifted** | **suspendido en el aire**, ragdolleado, "juggleable" | *(su página no lo declara)* | **1 s + 1 s por tier de combo → 12 s a 12x** |
| **Ragdoll** | física pura: no se mueve, no ataca, no actúa | ✅ | variable · **auto-kill si dura demasiado** |

**No forman una escala.** Son cuatro estados con fuentes propias. La única escalada declarada es
**stagger → knockdown**, y sólo en el self-stagger de las AoE.

> ⚠️ **Ground Finisher no es Mercy.** El Ground Finisher es el remate de melee sobre un enemigo
> tumbado o ragdolleado. **Mercy** es la ejecución con el **Parazon**, que exige al enemigo por
> debajo de un umbral de vida — y ese umbral lo sube el proc de **Impact**, +8% por stack. Dos
> mecánicas distintas que el juego presenta casi igual.

### Estados que se rompen entre sí

- **Lifted y Knockdown no pueden coexistir** en el mismo objetivo (→ [`condition-overload.md`](condition-overload.md)).
- Un proc de **Lifted sobre un enemigo ya Lifted** termina el estado antes de tiempo y lo
  **ragdollea**. Cualquier ataque **que no sea de melee** sobre un enemigo Lifted también lo corta.
- Y hay efectos que **parecen** Lifted sin serlo: el *stasis* de **Rhino Stomp** —enemigos dando
  tumbos en el aire— es propio de la habilidad, y la wiki declara que **`Ragdoll` y `Lifted` rompen
  el efecto al instante**. Visualmente idéntico, mecánicamente antagónico.

## Ambos son Status Effects

> *"**Knockdown** is a **Status Effect** that causes enemies to be knocked prone to the ground,
> leaving them vulnerable."*
>
> *"**Stagger**, also known as **Interrupt**, is a **Status Effect** that causes enemies to flinch
> and recoil."*
>
> *"**Ragdoll** is a **Status Effect**/physics state that causes enemies to be ragdolled."*
>
> *"**Lifted** is a **Status Effect** caused by certain melee attacks that knocks enemies airborne."*

La clasificación importa: al ser status effects, **cualquier fuente de Status Immunity los previene**
—incluidas Invulnerability y Overguard— sin necesidad de una resistencia específica
(→ [`status-effects.md`](status-effects.md), [`overguard.md`](overguard.md)).

## Knockdown se comporta distinto según a quién le pase

| Objetivo | Qué ocurre |
|---|---|
| **Enemigo** | queda prono en el suelo y **habilita Ground Finisher** |
| **Jugador** | no queda prono: entra en una **animación de rodada hacia atrás** |

Al jugador además se le **cierra abruptamente el menú `Esc`** si estaba abierto.

### La ventana de recuperación — 433 ms

> *"Right after being knocked down, the Warframe will flash in their energy colors briefly. Jumping
> or rolling during the flash will allow the Warframe to stand up or roll more quickly, allowing
> players to act earlier."*

Desde la versión 43 esa ventana pasó de **70 ms a 433 ms**, y los knockdowns enemigos usan las mismas
animaciones que el sistema de self-stagger — ya no se cae de espaldas por el slam de una Heavy Gunner.

> El mismo changelog de la v43 describe el destello al revés que el cuerpo del artículo: *"Warframes
> will now flash briefly if they have **successfully recovered** from a knockdown."* La página
> sostiene las dos lecturas —destello como *señal de ventana abierta* y como *acuse de recuperación*—
> sin reconciliarlas.

**Cuando la resistencia funciona, no hay animación:** ni de knockdown ni de stagger.

## Stagger

### Por proc de Impact

Un proc de Impact hace que el enemigo se tambalee y retroceda. **Ospreys, Bosses y Tenno son inmunes
al stagger causado por Impact** (→ [`status-effects.md`](status-effects.md)).

### Self-stagger — lo que reemplazó al self-damage

Desde la **versión 27.2**, toda arma con área de efecto radial puede hacer tambalear al propio
usuario si queda dentro de la explosión. **No hace daño**, pero deja vulnerable mientras dura la
animación. La severidad **escala con la distancia al centro**: de un flinch breve a salir despedido.

> **Escalada a knockdown.** Si el Tenno recibe **más de un blast a distancia de flinch dentro del
> lapso de un mismo flinch**, el stagger **se convierte en Knockdown completo**. Las AoE de cadencia
> muy alta son las peores en esto — la Akarius es el ejemplo que la wiki destaca.

El destello de energía del self-stagger aparece **hacia el final** de la animación de backflip;
saltar durante el destello **cancela** el stagger.

### Otras fuentes de self-stagger

Quick Thinking y Gladiator Finesse tambalean al usuario al drenar energía; Grendel queda mareado si
se queda sin energía durante Pulverize.

## Resistencia ≠ velocidad de recuperación

Son dos ejes distintos, y la wiki los lista en secciones separadas.

| Eje | Mods |
|---|---|
| **Resistencia** (evita el efecto) | Primed Sure Footed · Sure Footed · Power Drift · Fortitude · Motus Impact / Setup / Signal · Cautious Shot · Negate · Resolute Focus |
| **Velocidad de recuperación** (lo acorta) | Pain Threshold · Constitution · Handspring |

> Constitution y Handspring aparecen en **ambas** listas de la wiki: bajo resistencia en `Knockdown`
> y bajo velocidad de recuperación en `Stagger`.

**Desde la versión 27.2 la resistencia a knockdown funciona también contra staggers** (cambio no
documentado en su momento).

Otras fuentes: pasivas de Atlas, Valkyr y Lavos · Kinetic Plating (Gauss), Merulina (Yareli),
Warding Halo (Nezha), Mesmer Skin (Revenant), Iron Skin (Rhino), Hysteria (Valkyr), entre otras ·
prevención **condicional** parada sobre Hallowed Ground o disparando detrás de un Electric Shield ·
el nodo Focus **Poise** y el Decree **Stable Stance**.

## Quién causa knockdown

Habilidades de una docena de warframes (Sonic Boom, Pull, Crush, Reckoning, Tidal Surge…), el nodo
Void Snare de Vazarin, el **Jump Kick** de maniobras, armas como Sonicor, Talons y el slam de la Jat
Kittag, y el arcano Arcane Eruption.

Del lado enemigo: los shockwaves (Shockwave MOA, Rippling Shockwave, Seismic Shockwave de Bombard /
Heavy Gunner / Napalm), el arpón del Scorpion, el escudo del Shield Lancer, el tackle del Leaper, los
misiles del Hellion, el slam del Juggernaut y los eximus Blitz y Arson.

## Quién causa stagger

**Enemigos:** Aerolyst, Choralyst, Amalgam Heqet y Amalgam Arca Heqet, Deimos Jugulus, Denial Bursa,
Kyta Raknoid, Scyto Raknoid, Leaping Thrasher y Roller.

**Armas con stagger garantizado:** Opticor y Opticor Vandal, más las que tienen proc de Impact
garantizado. **Mod:** Tek Gravity.

Del lado del jugador, la fuente más común es el **self-stagger** de sus propias AoE (ver arriba), y
los augments que lo previenen son Assimilate, Empowered Quiver, Icy Avalanche, Intrepid Stand,
Negation Swarm, Shield of Shadows y Rumbled.

## Bug conocido

El ataque especial de un enemigo (el slam de una Heavy Gunner, por ejemplo) **se ejecuta igual** si el
stagger ocurre en cualquier punto de su carga.

## Lifted

> *"Knocks enemies airborne and briefly suspends them in mid-air **in a ragdolled state**."*

Es el único de los cuatro cuya duración **escala con el juego**: **1 segundo de base, +1 segundo por
cada tier de Melee Combo, hasta 12 segundos a 12x**. Los enemigos Lifted se pueden **"juggle"** con
procs repetidos, y hay equipo y habilidades con bonus específico contra ellos.

### Cómo se corta

- **Otro proc de Lifted sobre un enemigo ya Lifted** termina el estado antes de tiempo y lo
  **ragdollea**.
- **Cualquier ataque que no sea de melee** sobre un enemigo Lifted también lo termina antes.

### Quién lo causa

**Algunos Heavy Attacks de melee** y **todos los Heavy Slam** (→ [`heavy-attack.md`](heavy-attack.md)),
la Void Levitation de Naramon, y unas pocas habilidades — Shield Maiden y Firing Line (Bonewidow),
Embrace (Sevagoth's Shadow).

> **La lista de habilidades es cortísima frente a la de Ragdoll.** Lifted es esencialmente una
> mecánica **de melee**; casi todo lo que "manda enemigos por el aire" desde una habilidad es
> ragdoll, no Lifted.

## Ragdoll

Estado de **física**: el enemigo no puede moverse, atacar ni ejecutar ninguna acción, y queda
expuesto a **Ground Finisher**.

- **Inmunes:** los mismos que son inmunes al CC completo — **bosses, Acolytes y unidades con
  Overguard**.
- **Un ragdoll que dura demasiado mata al enemigo.** Es una medida contra enemigos bugueados que
  ocuparían el spawn pool. **Se excluyen las fuentes de slow** que bajan la velocidad de animación,
  como Gloom o el propio Rhino Stomp.

Su lista de fuentes es larga y casi toda de habilidades: Landslide (Atlas), Serene Storm (Baruuk),
**Snow Globe** (Frost), Shattered Lash (Gara), Dread Mirror (Garuda), Mach Rush con Mach Crash
(Gauss), Regurgitate (Grendel), Coil Horizon (Gyre), Tidal Surge y Tentacle Swarm (Hydroid),
Strangledome (Khora), Pull (Mag), Soul Punch (Nekros), Divine Spears (Nezha), Larva (Nidus),
**Rhino Charge**, Embrace (Sevagoth's Shadow), Axios Javelin, Spellbind, Bastille, Rip Line,
Electric Shield, Riptide, Tornado, Arch Line, Meathook, Exalted Ironbride.

## Fuentes

- https://wiki.warframe.com/w/Knockdown · https://wiki.warframe.com/w/Stagger · https://wiki.warframe.com/w/Lifted · https://wiki.warframe.com/w/Ragdoll
- [`status-effects.md`](status-effects.md) · [`overguard.md`](overguard.md) · [`damage-types.md`](damage-types.md)
