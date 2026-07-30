# Knockdown y Stagger

> Estado: activo
> Rol: las dos mecánicas de CC hermanas — knockdown (derribo) y stagger (interrupt), sus fuentes, la resistencia y la escalada de una a otra
> Fuente de verdad de: knockdown y stagger son **status effects** (los cubre Status Immunity), la partición jugador↔enemigo del knockdown, la ventana de recuperación de 433 ms, el self-stagger de las AoE y su escalada a knockdown, qué mods dan resistencia vs velocidad de recuperación
> No usar para: el catálogo de habilidades/enemigos que causan knockdown (son galerías completas en los raws) · los valores de resistencia por mod (están en la página de cada mod)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Knockdown · https://wiki.warframe.com/w/Stagger
> Raw: knockdown.wikitext · stagger.wikitext

> ⚠️ La wiki marca `Stagger` con **`{{UpdateMe}}`**. `Knockdown` no lleva marca.

## Ambos son Status Effects

> *"**Knockdown** is a **Status Effect** that causes enemies to be knocked prone to the ground,
> leaving them vulnerable."*
>
> *"**Stagger**, also known as **Interrupt**, is a **Status Effect** that causes enemies to flinch
> and recoil."*

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

## Bug conocido

El ataque especial de un enemigo (el slam de una Heavy Gunner, por ejemplo) **se ejecuta igual** si el
stagger ocurre en cualquier punto de su carga.

## Fuentes

- https://wiki.warframe.com/w/Knockdown · https://wiki.warframe.com/w/Stagger
- [`status-effects.md`](status-effects.md) · [`overguard.md`](overguard.md) · [`damage-types.md`](damage-types.md)
