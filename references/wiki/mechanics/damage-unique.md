# Damage — tipos únicos

> Estado: activo
> Rol: los seis tipos de daño que no son ni físicos ni elementales — qué ignoran, qué status tienen (casi ninguno) y de dónde salen
> Fuente de verdad de: **Cinematic es el daño de los ticks de Slash**, y qué ignora exactamente · la diferencia Cinematic ↔ True · la vulnerabilidad de Status Chance de Tau · el Bullet Attractor de Void y su lista de usos no-daño · que Energy Drain es el daño que consume energía del jugador · quién resiste Tau
> No usar para: la taxonomía general y los códigos `DT_*` — ver [`damage-types.md`](damage-types.md)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage/Cinematic_Damage · https://wiki.warframe.com/w/Damage/True_Damage · https://wiki.warframe.com/w/Damage/Void_Damage · https://wiki.warframe.com/w/Damage/Tau_Damage · https://wiki.warframe.com/w/Damage/Shield_Drain_Damage · https://wiki.warframe.com/w/Damage/Energy_Drain_Damage
> Fuente actualizada: 2026-07-22
> Raw: damage-cinematic-damage.wikitext · damage-true-damage.wikitext · damage-void-damage.wikitext · damage-tau-damage.wikitext · damage-shield-drain-damage.wikitext · damage-energy-drain-damage.wikitext

## Resumen

| Tipo | `DT_*` | Status | Modificador de facción | Ignora |
|---|---|---|---|---|
| **Cinematic** | `DT_CINEMATIC_DAMAGE` | ninguno | ninguno | **la DR de armadura** |
| **True** | — *(término de jugadores)* | ninguno | ninguno | **la DR de armadura** |
| **Void** | — | **Bullet Attractor** | ×1.5 a Zariman y Overguard | resistencias adaptativas Sentient |
| **Tau** | — | **Status Chance Vulnerability** | neutro | — |
| **Shield Drain** | `DT_SHIELD_DRAIN` | ninguno | neutro | — |
| **Energy Drain** | `DT_ENERGY_DRAIN` | ninguno | neutro | — |

Cuatro de los seis son **hidden damage types**: no se pueden agregar por mod y no aparecen en la
ficha del arma.

---

## Cinematic

**Es el tipo de daño de los ticks de Slash.** La página lo dice textualmente: *"It is applied as the
status effect of Slash Damage"*. Todo lo que se sabe del Bleed —que ignora armadura, que no lo tocan
los mods físicos ni elementales— es en realidad una propiedad **de Cinematic**, no de Slash.

- **Se aplica a salud, escudos y Overguard.**
- **Bypasea la damage reduction de la armadura** — pero **no** la DR de fuentes que no sean armadura.
- **No lo aumentan los buffs de daño físico ni elemental.**
- **Los Sentients no se adaptan a Cinematic.**
- No tiene procs propios.

> El nombre viene del tipo interno `DT_CINEMATIC_DAMAGE`. Antes de descubrirlo se le decía
> *"Finishing Damage"*, lo que se confundía con los ataques Finisher — que son otra cosa. Los mods de
> Finisher (Finishing Touch, Savage Silence) **no tocan el daño Cinematic**.

Detalle de la fórmula del tick en [`damage-physical.md`](damage-physical.md#slash--bleed).

---

## True

**Casi lo mismo que Cinematic, y por eso conviven mal.** Misma propiedad central —ignora la DR de
armadura, sin modificador de facción, los Sentients no se adaptan— y también arrastra el nombre
histórico *"Finishing Damage"*.

Las diferencias declaradas:

| | Cinematic | True |
|---|---|---|
| Nombre | interno del juego (`DT_CINEMATIC_DAMAGE`) | **creado por jugadores**, no se usa en el juego |
| Se aplica a | salud, escudos y Overguard | *(no declarado)* |
| De dónde viene | el status de **Slash** | habilidades de warframe, y un arma |

- **No se puede agregar a un arma por mods.**
- **Basmu** es el único arma que lo tiene innato: vaciar el cargador produce tres pulsos de 10 m que
  hacen hasta **10 de daño True**, staggean, y curan al usuario por **10×** el daño hecho a cada
  enemigo por pulso.
- **No lo aumentan los buffs físicos ni elementales**, y **no bypasea DR que no venga de armadura**.
- No tiene procs propios.

---

## Void

Casi exclusivo de **Operators, sus Amps y Xaku**. Neutro contra todo salvo **×1.5 contra Zariman y
Overguard**.

### Bullet Attractor

**Campo de 2.5 m de radio, 3 segundos**, centrado **en el punto donde impactó el disparo** — proccear
en la cabeza centra el campo en la cabeza; en los pies, en los pies. Los hitscan y proyectiles que
entren se redirigen hacia el objetivo.

- Con **Punch Through**, el proyectil **orbita** dentro del campo tras atravesar al objetivo
  principal, así que es **poco probable que lo golpee más de una vez**. Por eso el Bullet Attractor
  **no sinergiza con Punch Through** como sí lo hace Magnetize. Contra enemigos apiñados, los
  proyectiles en órbita sí pegan a otros.
- Si el status expira con proyectiles todavía adentro, **salen disparados en direcciones
  esencialmente aleatorias**.
- Los **proyectiles del propio enemigo también se redirigen**, lo que le impide dispararle bien al
  jugador.

### Los usos que no son daño

Void es el tipo con más funciones fuera del cálculo de daño. Contra Sentients:

- **stun garantizado** contra los tipo dron (Battalyst, Conculyst);
- **anula la resistencia adaptativa** de los drones y del Shadow Stalker;
- **bypasea invulnerabilidades** de los Eidolon (Vomvalyst, Teralyst, Ropalolyst).

Y fuera de combate: destruye nubes de Kuva en Kuva Siphon · fuerza a los escudos del Profit-Taker Orb
a adoptar otra debilidad · abre los Secret Laboratory de Corpus Gas City · activa Requiem Obelisks ·
abre Isolation Vaults y restaura la salud de Loid y Otak · sella Void Rifts en Void Cascade · mata
las formas espectrales de Thrax Centurion y Thrax Legatus, y la forma etérea del Void Angel.

> **Void no es ni físico ni elemental.** No lo suben las Phoenix Talons de Madurai, y tampoco lo
> castigan las resistencias de las condiciones de Sortie (Physical/Elemental Enhancement).

> El Void de **Xaku** es una versión recortada: sólo proccea Bullet Attractor y resetea resistencias
> Sentient —y sólo con Xata's Whisper y el Deny de The Lost—. No bypasea invulnerabilidades de
> Eidolon ni cambia la debilidad del Profit-Taker. El bonus contra Overguard y Zariman sí lo
> conserva en todas sus habilidades.

---

## Tau

**También llamado Sentient Damage** — `Damage/Sentient Damage` es un **redirect** a esta página.
Exclusivo de unos pocos equipos relacionados con los Sentient. Neutro contra todo; los warframes
pueden ganar resistencia a Tau con el set Umbral.

### Status Chance Vulnerability

**+10% de Status Chance recibido por stack, hasta 10 stacks, 8 segundos**, cada stack con su
duración. El 11º reemplaza al más viejo.

| Stacks | 5 | 10 |
|---|---|---|
| Procs recibidos | ×1.5 | **×2** |

> **Los procs forzados no se benefician.** Un arma con proc garantizado —el Hystrix— no genera procs
> extra por esta vulnerabilidad. Es una multiplicación de la *chance*, no del recuento.

**Resisten Tau:** el set **Umbral** (Intensify · Fiber · Vitality) · **Adaptation** · la pasiva de
**Caliban** (y Caliban Prime).

---

## Shield Drain

Neutro contra todos los tipos de escudo. **Se aplica a escudos y Overguard**, y **no** bypasea la
damage reduction. Sin procs propios.

**Sólo lo aplican habilidades de warframe:** Pillage (Hildryn), Collective Curse (Kullervo),
Polarize (Mag).

---

## Energy Drain

**Se aplica directo a la barra de energía del jugador.** Modificadores neutros contra todos los tipos
de salud. Sin procs propios.

> ⚠️ La página es un `{{Stub}}` con `{{UpdateMe}}`: sus secciones *Mechanics* y *Status Effects*
> están **vacías**. El único caso concreto documentado en la wiki vive en otra página — el proc de
> Magnetic sobre un Tenno, que drena **30 de energía por segundo durante 3 s** (4 ticks, 120 de
> energía). Ver [`damage-elemental-combined.md`](damage-elemental-combined.md#sobre-tenno).

## Fuentes

- https://wiki.warframe.com/w/Damage/Cinematic_Damage · https://wiki.warframe.com/w/Damage/True_Damage · https://wiki.warframe.com/w/Damage/Void_Damage · https://wiki.warframe.com/w/Damage/Tau_Damage · https://wiki.warframe.com/w/Damage/Shield_Drain_Damage · https://wiki.warframe.com/w/Damage/Energy_Drain_Damage
- [`damage-types.md`](damage-types.md) · [`damage-physical.md`](damage-physical.md) · [`damage-elemental-combined.md`](damage-elemental-combined.md) · [`armor.md`](armor.md) · [`punch-through.md`](punch-through.md) · [`status-effects.md`](status-effects.md)
