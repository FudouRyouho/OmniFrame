# Damage — elementales combinados

> Estado: activo
> Rol: los seis elementales combinados en detalle — su status, sus stacks y las fórmulas de los tres que hacen daño
> Fuente de verdad de: la **doble fórmula de Blast** (single-target vs radial) y su triple-dip con Xata's Whisper · el escalón de armor strip de Corrosive y el cap ampliado por Emerald Shard · el radio creciente de Gas · la fórmula de vulnerabilidad de Viral y Magnetic · el **proc forzado de Electricity al romper escudos** y qué mods lo escalan · los caps de Confusion en unidades especiales
> No usar para: la ley general de DoT — ver [`damage-over-time.md`](damage-over-time.md) · la taxonomía y jerarquía de combinación — ver [`damage-types.md`](damage-types.md) · el catálogo de fuentes por tipo (son cientos de líneas en cada raw)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Damage/Blast_Damage · https://wiki.warframe.com/w/Damage/Corrosive_Damage · https://wiki.warframe.com/w/Damage/Gas_Damage · https://wiki.warframe.com/w/Damage/Magnetic_Damage · https://wiki.warframe.com/w/Damage/Radiation_Damage · https://wiki.warframe.com/w/Damage/Viral_Damage
> Fuente actualizada: 2026-07-17
> Raw: damage-blast-damage.wikitext · damage-corrosive-damage.wikitext · damage-gas-damage.wikitext · damage-magnetic-damage.wikitext · damage-radiation-damage.wikitext · damage-viral-damage.wikitext

## Resumen

| Tipo | = | Status | Duración | Stacks | Qué hace |
|---|---|---|---|---|---|
| **Blast** | Heat + Cold | **Detonate** | 1.5 s de mecha | 10 | explota: 30% single-target, **300% por stack en 5 m** |
| **Corrosive** | Toxin + Electricity | **Corrosion** | 8 s | 10 (14) | **−80% armadura** |
| **Gas** | Heat + Toxin | **Gas Cloud** | 6 s | 10 | DoT en radio **creciente** |
| **Magnetic** | Cold + Electricity | **Disrupt** | 6 s | 10 | **+325% daño a escudos/Overguard** |
| **Radiation** | Heat + Electricity | **Confusion** | 12 s | 10 | fuego amigo, **+550% daño entre enemigos** |
| **Viral** | Cold + Toxin | **Virus** | 6 s | 10 | **+325% daño a salud** |

| Tipo | Favorable ×1.5 | Desfavorable ×0.5 |
|---|---|---|
| Blast | Infested Deimos | Corpus Amalgam |
| Corrosive | Grineer · Kuva Grineer · Scaldra | Sentient |
| Gas | Infested Deimos · Techrot | Scaldra |
| Magnetic | Corpus · Corpus Amalgam · Techrot | Narmer |
| Radiation | Sentient · The Murmur | Anarchs · Orokin |
| Viral | Orokin | Infested Deimos · The Murmur |

> **Ninguno de los seis tiene contraparte en Railjack.** No proccean nada en combate espacial y **ni
> siquiera entran en el cálculo de pesos de status** ahí.

---

## Blast — Detonate

El único status con **dos daños distintos y dos disparadores distintos**.

### Single-target — la mecha de 1.5 s

Cada stack tiene su **propia mecha de 1.5 segundos**; al vencer, detona sobre el objetivo por **30%
del daño base del arma**. Llegar a **10 stacks** detona todos de golpe: 10 hits de 30% = **300%**.

### AoE — sólo por 10 stacks o por muerte

Al llegar a 10 stacks **o al morir el objetivo**, todos los stacks vigentes detonan temprano y
producen **una sola explosión de 5 m** por **300% del daño base por stack** (máx. **3000%**).

> **El objetivo inicial no recibe el AoE**, sólo su parte single-target. Y el daño radial de todos
> los procs **se combina en una única instancia de daño**.

### Las fórmulas

```text
Modded Base Damage = Base Damage × (1 + Base Damage Bonuses) × (1 + Faction Damage Bonuses)

Blast Proc Damage = 0.3 × Modded Base Damage × (1 + Faction) × (1 + Status Damage) × Additional
Radial Damage     = 3   × Modded Base Damage × (1 + Faction) × (1 + Status Damage) × Additional
```

### Lo que hace a Blast distinto de todos los demás

- **Es el status de daño más débil contra un solo objetivo**, y con diferencia. Su valor está entero
  en el AoE — que sólo se cobra si el arma mata o llega a 10 stacks dentro de la mecha de 1.5 s.
- **El AoE de 5 m no tiene falloff**, y el radio **no lo mueven** Firestorm ni Fulmination.
- **Los mods elementales no lo escalan.** Heat y Cold no aumentan el daño del proc de Blast — sólo
  la probabilidad de que el proc *sea* de Blast. Valence Formation y Thermal Transfer **tampoco**.
- **El bonus de facción sí entra dos veces**, como en todo status de daño.
- **Críticos, weakpoints y "headcrits" sí aplican** — al single-target **y al AoE**. La detonación
  por 10 stacks o por muerte suma los multiplicadores de cada stack individual, lo que hace que un
  headshot crítico que mata sea desproporcionadamente bueno para limpiar grupos.
- **La mecha la mueve Status Duration**, pero a diferencia de los demás status de daño, **Detonate
  siempre hace daño aunque la Status Duration total sea negativa**.
- **Un golpe mortal que aplique al menos 1 proc de Blast dispara igual la explosión completa** de 5 m
  y 300%, aunque el enemigo no tuviera ningún stack antes. Y al revés: el golpe mortal no necesita
  proccear Blast si el enemigo ya tenía stacks.

### Triple-dip con Xata's Whisper

Xata's Whisper **se dispara sobre la detonación**, y en esa rama el bonus de facción se aplica **una
vez más** —efectivamente tres veces— y los bonus **elementales sí aplican**, pese a que Blast no
escala con ellos.

Ejemplo textual de la wiki — arma de 100 de daño con Thermite Rounds, Rime Rounds, Stormbringer,
Primed Bane of Grineer y Xata's Whisper a fuerza base:

```text
Hit inicial              = 100 × (1 + 0.6 + 0.6 + 0.9) × (1 + 0.55)          = 480.5 …
Xata sobre el hit        = 0.26 × 480.5 × (1 + 0.55)
Detonación de Blast      = 0.3 × 100 × (1 + 0.55)²                            = 72.075
Xata sobre la detonación = 0.26 × 72.075 × (1 + 0.55) × (1 + 0.6 + 0.6 + 0.9)
```

En el último renglón la facción aparece por tercera vez **y** el bonus elemental entra aunque la
detonación no lo tenga.

> Enemigos muertos bajo Blast se vaporizan: el cuerpo no sirve para Desecrate y corta el pull de
> Magnetize.

---

## Corrosive — Corrosion

**8 segundos, hasta 10 stacks**, cada uno con su duración. El 11º reemplaza al más viejo.

| Stacks | 1 | 2 | 3 | … | 10 | **14** |
|---|---|---|---|---|---|---|
| Armadura removida | 26% | 32% | 38% | +6% c/u | **80%** | **100%** |

El primer stack vale **26%** (20% innato + 6%) y cada uno después suma **6%**.

- **Emerald Archon Shard** sube el máximo de stacks **+2** (**+3** el Tauforged). Con **14 stacks se
  remueve toda la armadura** mientras dure el status.
- **La pasiva de Hydroid** hace que los enemigos que él dañó sean permanentemente más vulnerables:
  el primer proc degrada **50%**, lo que le da **100% de strip a 10 stacks**. Sirve con procs de
  **cualquier fuente**, no sólo suyos, mientras él haya dañado al enemigo.

### Cuánto vale en daño efectivo

Contra armadura capada (90% DR, Heavy Gunner nivel 57): el **primer** stack ya vale ~**×2.3**
(+130%); cada stack siguiente agrega entre **+32%** y **+56%**; **10 stacks ≈ ×6** (+500%). Pasar de
10 a 14 stacks vale otro **×1.67** relativo.

### Multiplicativo con las otras fuentes de armor strip

```text
Armor after reduction = (1 − 50%)                                    ← Heat, al máximo
                      × [1 − (20% + 6% × nº stacks de Corrosive)]    ← Corrosive
                      × (1 − 18% × nº de Corrosive Projection)       ← el aura
```

La misma expresión vive en [`damage-elemental-primary.md`](damage-elemental-primary.md#el-armor-strip-es-multiplicativo-entre-fuentes)
— las dos páginas la declaran igual.

---

## Gas — Gas Cloud

**Una nube que tickea 1 vez por segundo durante 6 s a todos los enemigos en el radio.**

| Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s | 7s |
|---|---|---|---|---|---|---|---|---|
| ¿Tick? | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ | ❌ |

**6 ticks, en s0..s5** — sin retardo inicial, a diferencia de Slash y Toxin.

> ⚠️ Conflicto ↔ [`damage-over-time.md`](damage-over-time.md) §Cuántos ticks
>
> Mismo caso que Electricity: la página declara **6 s**, pero la ventana s0..s5 es la que Sear
> declara como **5 s**. Con 5 s la fórmula general acierta; con 6 s predice 7 ticks contra los 6
> de la tabla.

**El radio crece con los stacks:** 3 m de base, **+0.3 m por stack**, hasta **6 m a los 10 stacks**.
Máximo 10 instancias, cada una con su timer; la 11ª reemplaza a la más vieja.

Usa la [fórmula común de tick](damage-elemental-primary.md#la-fórmula-común-de-tick) con coeficiente
**0.5**, y con la particularidad de los combinados:

> **Los mods de Heat y Toxin no hacen nada sobre el DoT de Gas.** Sólo escala con daño **Gas
> literal**: Leaded Gas, Valence Formation.

Ejemplos textuales de la wiki (Vesper 77, 180 de daño innato, Hornet Strike + Expel Grineer + Pistol
Elementalist):

```text
Modded Base Damage = 180 × (1 + 2.2) × (1 + 0.3) = 748.8

con Scorch + Pathogen Rounds (Heat y Toxin):   Tick = 0.5 × 748.8 × (1 + 0.3) × (1 + 0.9)
con Leaded Gas (Gas literal):                  Tick = 0.5 × 748.8 × (1 + 3) × (1 + 0.3) × (1 + 0.9)
```

Los mods de Heat y Toxin **no aparecen** en la primera cuenta: no es que aporten poco, es que no
entran.

- La nube **puede impactar cabezas y partes del cuerpo por sí sola**, pero su bonus de headshot es
  **1x** —ninguno—. Sube con Target Acquired, zoom de sniper, o Primary/Secondary Deadhead. Mismo
  comportamiento que la Tesla Chain de Electricity.
- **Si el portador muere, la nube sigue tickeando** sobre todos los que quedan en su radio hasta que
  se agote la duración.

---

## Magnetic — Disrupt

**6 segundos, hasta 10 stacks.** Amplifica el daño a **escudos y Overguard** y frena la regeneración
natural de escudos.

```text
Daño resultante a escudos = Modded Damage × [ 2 + 0.25 × (nº stacks − 1) ]
```

| Stacks | 1 | 2 | … | 10 |
|---|---|---|---|---|
| Daño extra a escudos / Overguard | +100% | +125% | +25% c/u | **+325%** |

La vulnerabilidad es **multiplicativa** con los otros bonus de daño.

> Los efectos que **restauran** escudos —los links de Shield Osprey y Orokin Drone— **bypasean** la
> penalidad de regeneración de Magnetic.

### El proc forzado de Electricity al romper la defensa

Al romperse los escudos u Overguard, el objetivo recibe un **proc forzado de Electricity** por
**3% de sus escudos/Overguard máximos por stack de Magnetic** —hasta **30%** a 10 stacks— repartido
en **6 segundos**.

**Lo escala el arma o habilidad que aplicó el Magnetic**, con reglas propias que no se parecen a
ninguna otra:

| | |
|---|---|
| Base damage mods (Serration) | **ningún efecto** |
| Status damage mods (Pistol Elementalist) | **se aplican dos veces** → ×3.61 |
| Faction damage mods (Expel Corpus) | **se aplican dos veces** |
| Mods de Electricity (Convulsion) | normales, **aun estando combinados en otro elemento** |
| Status duration mods | normales, y actúan como **multiplicador final** del daño total |

Archon Stretch aplica sobre este proc forzado al romper Overguard, **pero sólo desde habilidades**
que puedan aplicar Magnetic.

### Sobre Tenno

El HUD se distorsiona y se reciben **30 de daño Energy Drain por segundo durante 3 s**. El primer
tick es instantáneo → **4 ticks**, **120 de energía** perdida en total. Un cleanse de status corta
el drenaje y la estática.

---

## Radiation — Confusion

**12 segundos, hasta 10 stacks.** El afectado no distingue amigo de enemigo: pelea contra todos y
todos lo atacan.

| Stacks | 1 | 2 | … | 10 |
|---|---|---|---|---|
| Daño que el confundido inflige a los enemigos del Tenno | +100% | +150% | +50% c/u | **+550%** |

- Los stacks también **elevan los slams contra sus ex-aliados de Knockdown a Ragdoll**.
- Las **auras de las unidades confundidas** (Eximus, Ancient Healer) **dejan de afectar a sus
  aliados**, y ellas tampoco se benefician de las auras enemigas.
- Al terminar, la unidad **vuelve a su facción**.

### Los caps distintos en unidades especiales

Para **Kuva Liches, Acolytes, Necramechs enemigos, Sisters of Parvos y Hounds** la Confusion es
**otra mecánica**:

- No los hace atacables por sus aliados **salvo que esos aliados también estén confundidos**.
- En cambio les sube el daño que **reciben** de unidades aliadas: **+100%**, con un cap de **4
  stacks** → **+250%**.

Enemigos con **Overguard** pueden recibir el status pero son **inmunes a su efecto** hasta que se
rompa el buffer.

### Sobre Tenno

Fuego amigo entre ese Tenno y los demás, y **−accuracy**, durante **4 segundos**. Un Tenno irradiado
**no puede revivir aliados** —ni Operatives de Rescue ni de Sortie Defense—, y recibir el proc
durante el intento lo **interrumpe**. Y sí puede proccear status sobre sus aliados, Radiation
incluida.

> ⚠️ La página declara un bug: bosses con etapa de invulnerabilidad —Lieutenant Lech Kril— pueden
> ser afectados; como dejan de atacar al Tenno, su invulnerabilidad nunca termina y la pelea queda
> imposible de ganar.

---

## Viral — Virus

**6 segundos, hasta 10 stacks.** Amplifica el daño a la **salud**.

```text
Daño resultante a la salud = Modded Damage × [ 2 + 0.25 × (nº stacks − 1) ]
```

| Stacks | 1 | 2 | … | 10 |
|---|---|---|---|---|
| Daño extra a la salud | +100% | +125% | +25% c/u | **+325%** |

Misma forma exacta que Magnetic, sobre otra barra. La vulnerabilidad es **multiplicativa** con los
otros bonus de daño.

**Funciona aunque la salud esté protegida por armadura** ("yellow health"). Sólo escudos y Overguard
quedan fuera.

### Viral y los DoT — se evalúa en el momento del tick

> **Ésta es la diferencia importante con el bonus de facción.**

El daño de un tick de DoT se calcula según si **hay un proc de Viral activo en el instante en que ese
tick pega** — no según lo que había cuando nació el proc.

Ejemplo textual de la wiki, arma de 100 de daño que aplica Slash:

- con 1 stack de Viral: el hit hace **200**, y el Bleed **70/s** hasta que Viral se cae, y ahí baja a
  **35/s**;
- sin Viral inicial: el Bleed hace **35/s** hasta que llegue un proc de Viral, y ahí sube a **70/s**.

> **El multiplicador NO se aplica dos veces a los DoT**, a diferencia de los multiplicadores de
> facción. Viral es una vulnerabilidad del objetivo que se lee en cada tick; el bonus de facción es
> una propiedad del atacante que quedó horneada en el proc.

### Inmunidades

**Inmunes al status de Viral:** Ambulas · Deimos Carnis (y Rex) · Deimos Genetrix · Deimos Jugulus ·
Deimos Leaping Thrasher · Deimos Therid · Deimos Saxum (y Rex) · Demolisher Boiler · Demolisher
Thrasher · Tusk Bolkor · Tusk Firbolg · Techrot Babau.

**Completamente inmunes a Viral:** Demolisher Charger · Demolisher Juggernaut.

## Fuentes

- https://wiki.warframe.com/w/Damage/Blast_Damage · https://wiki.warframe.com/w/Damage/Corrosive_Damage · https://wiki.warframe.com/w/Damage/Gas_Damage · https://wiki.warframe.com/w/Damage/Magnetic_Damage · https://wiki.warframe.com/w/Damage/Radiation_Damage · https://wiki.warframe.com/w/Damage/Viral_Damage
- [`damage-types.md`](damage-types.md) · [`damage-elemental-primary.md`](damage-elemental-primary.md) · [`damage-over-time.md`](damage-over-time.md) · [`status-effects.md`](status-effects.md) · [`armor.md`](armor.md) · [`shield.md`](shield.md) · [`overguard.md`](overguard.md) · [`faction-damage.md`](faction-damage.md)
