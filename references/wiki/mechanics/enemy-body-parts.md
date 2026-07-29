# Enemy Body Parts

> Estado: activo
> Rol: ley de daño — multiplicadores por parte del cuerpo del enemigo, y la distinción entre "headshot" y "weak spot"
> Fuente de verdad de: multiplicador base de headshot, cómo componen los bonus de headshot entre sí, qué armas quedan fuera, qué distingue un headshot de un weak spot
> No usar para: el catálogo por unidad (está en el raw, ~175 filas) · si las partes de la columna *Other* cuentan como weak spot para los efectos que dicen "weak point" — la wiki no lo declara
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Enemy_Body_Parts
> Raw: enemy-body-parts.wikitext

> ℹ️ Esta página **absorbió tres términos**: `Headshot`, `Weak Point` y `Weak Spot` son hoy
> redirects a `Enemy Body Parts`. La consolidación es **de páginas de la wiki, no de mecánica** —
> ver [Headshot no es sinónimo de weak spot](#headshot-no-es-sinónimo-de-weak-spot).

> ⚠️ La sección de multiplicadores lleva `{{UpdateMe}}`: faltan **Vehicles, Archwing, Murmur,
> Scaldra y Techrot**.

## Qué es

Ciertas partes del cuerpo aplican un **multiplicador al daño entrante**. Son específicas de cada tipo
de enemigo y se aplican a **todo el daño, sin importar el tipo elemental**.

Golpear una de estas partes además **saltea completamente el Shield Gating** del enemigo
(ver [shield.md](shield.md)).

## Headshot no es sinónimo de weak spot

Esta es la distinción que la consolidación de páginas puede ocultar. La wiki la declara explícita:

> *"Effects that specify headshots only take effect when striking the target's head and do **not**
> apply against any other weak spot."*

O sea: **la cabeza es un weak spot, pero no todo weak spot es la cabeza**. Un efecto redactado como
"headshot" es estrictamente **más restrictivo** que uno redactado como "weak point".

Que ambas semánticas siguen vivas y son distintas se ve en un arma que lleva **las dos a la vez**,
con textos deliberadamente distintos:

| Arma | Efecto | Alcance |
|---|---|---|
| Daikyu Prime | +250% Critical Chance on **weak point** hits | cualquier weak spot |
| Daikyu Prime | +75% **headshot** damage (con Amalgam Daikyu Target Acquired) | sólo la cabeza |
| Athodai | **Weak point** kills → buff Overdrive | cualquier weak spot |
| Cernos Prime | +50% **headshot** damage | sólo la cabeza |

Lo único que la wiki registra como unificación es **ortográfico**: la versión 39 anota *"Fixed
instances of 'Weak Points' being written as 'weakpoints'"*. No hay ningún parche que colapse las
dos mecánicas en una.

### Cuánto pesa la distinción en la práctica

De las ~107 unidades tabuladas, la columna **Weak Point** contiene:

| Parte | Unidades |
|---|---|
| Head | 96 |
| Face | 5 |
| Mouth | 3 |
| Orange Pustules · Helmet · Glue Sac | 1 c/u |

La columna **Other** lista ~27 partes adicionales con multiplicador propio — Fanny Pack (7), Gun
(6), Upper Back (4), Synovia (2), y sueltas como Vents, Shield, Exposed Chest/Heart, Back Console.

Es decir: en la abrumadora mayoría de los casos, weak point **es** la cabeza. La distinción importa
en el margen — pero es un margen que existe y que la wiki mantiene por escrito.

## El multiplicador base

**3x** desde la versión 32, que lo subió desde 2x. Casi todos los Corpus humanoides y aéreos, todos
los Grineer humanoides y casi todos los Infested lo tienen.

No es universal: hay unidades con **Head (1x)** (varios Amalgam) y hasta con **Head (0.5x)** —
Amalgam Machinist — donde apuntar a la cabeza es *peor* que al cuerpo.

## Cómo componen los bonus

> *"Most Headshot bonuses stack their effects additively."*

El ejemplo textual de la wiki, con Daikyu, Primary Deadhead (+30%) y Amalgam Daikyu Target Acquired
(+75%) contra un enemigo de 3x:

```
3 × (1 + 0.30 + 0.75) = 6.15x
```

El multiplicador de la parte del cuerpo es el **valor base**; los bonus de las fuentes se **suman
entre sí** antes de multiplicar. Los bonus no se multiplican entre sí.

La wiki dice *"most"*, no *"all"* — no enumera cuáles serían la excepción.

## Qué queda fuera

### Armas siempre a 1x

Un grupo de armas **nunca** obtiene daño extra por headshot, siempre 1x. La wiki las separa por
cómo responden a los bonus: **no** las afectan los bonus tipo *acuity*, **sí** los tipo *deadhead*.

Arca Plasmor (y Tenet) · Alternox primary (y Prime) · Argo & Vel heavy glaive · Athodai alt-fire ·
Catchmoon (primaria y secundaria) · Corufell shots · Cyanex primary · Dread Incarnon Genesis ·
Fulmin semi-auto · Ignis (y Wraith) · Lex Incarnon Genesis · Lizzie primary y waves · Nataruk
charged/perfect · Nepheri fireballs · Paris Incarnon Genesis · Steflos · Stropha shots · Tenet
Agendus energy disks · **procs de Electricity y Gas** · Resupply.

### Daño radial

Desde la versión 32, la parte **radial** de toda arma de área tiene multiplicador 1x y **tampoco
dispara condiciones de headshot**. La justificación que DE dejó escrita apuntaba al Ignis Wraith:
*"es difícil imaginar una manta de elementos lo bastante precisa como para apuntar a puntos débiles"*.

Esto **no** aplica al proyectil en sí: las flechas de la Kuva Bramma o los disparos de precisión de
la Kuva Chakkhurr sí pueden dar headshot.

## Fuentes de bonus

El raw las lista por categoría. En resumen:

- **Armas (~20 entradas):** la mayoría es daño de headshot plano (Cernos Prime +50%, Kuva Chakkhurr
  +50%, Synapse +20%). Los francotiradores escalan el bonus **con el nivel de zoom** — Vulkar:
  +35% a 2.5x, +55% a 4.0x, +70% a 8.0x. Otras convierten el headshot en un **trigger de buff**:
  Knell (Death Knell), Dual Toxocyst (Frenzy), Perigale (Gale Force), Tenet Spirex (Bullseye
  Reload), Athodai (Overdrive). Las Incarnon usan headshots para **cargar el medidor de
  transmutación**.
- **Habilidades:** Cyte-09 (Seek, Neutralize), Harrow (Thurible, Covenant), Ivara (Prowl), Voruna
  (Lycath's Hunt).
- **Mods (14):** Argon Scope, Eximus Advantage, Galvanized Scope, Hydraulic Crosshairs, Galvanized
  Crosshairs, Laser Sight, Primary/Pistol Acuity, Skull Shots, Target Acquired, Meticulous Aim,
  Leaded Gas, Biotic Rounds, Pain Points.
- **Arcanos (13):** Arcane Consequence, Pistoleer, Precision, Rage, Victory, Longbow Sharpshot, Pax
  Bolt, Pax Seeker, Primary Crux, Primary/Secondary Deadhead, Virtuos Shadow, Virtuos Ghost.
- **Focus:** Temporal Shot.

## Detección de weak points

Efectos que los resaltan visualmente: **Seek** de Cyte-09 (resalta algunos — la propia wiki remite a
sus bugs), y el alt-fire de **Zenith**, **Scourge** y la mira de **Vesper 77**, los tres sólo para
cabezas.

## Fuentes

- https://wiki.warframe.com/w/Enemy_Body_Parts
- Redirects a esa misma página: `Headshot`, `Weak_Point`, `Weak_Spot`
