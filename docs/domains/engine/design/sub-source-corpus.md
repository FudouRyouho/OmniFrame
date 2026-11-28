---
Estado: "referencia"
Rol: "Corpus de materializaciones del juego, clasificado por verbo — tabla de investigación anclada a un Issue, no forma cerrada"
Impacto_ID: "E-SubSource"
Fidelidad_Fisica: "references/wiki/warframes/"
Fecha_de_creacion: "2026-08-27"
Fecha_de_actualizacion: "2026-08-27"
Dependencias:
  - "docs/domains/engine/design/arch-decisions.md"
  - "references/wiki/arcanes/arcane-sculptor.wikitext"
  - "references/wiki/mods/summoners-wrath.wikitext"
---

# Corpus de sub-source — qué materializa cada fuente, y qué verbo hace lo materializado

> ⚓ **Anclado a `Refs #74`. Prototipo, no SSoT.** Este documento **no** tiene la autoridad del resto de
> `docs/`: es una tabla de investigación en curso, y su forma puede cambiar entera. Vive acá porque una
> tabla de referencia no se consulta desde un hilo de comentarios, no porque esté cerrada. El
> razonamiento que la produjo vive en el Issue; acá está el resultado consultable.
>
> Se promueve a documento propio —o a un Issue nuevo— sólo cuando tenga superficie para divergir del
> Issue que la originó. Hasta entonces, **toda decisión de diseño que salga de acá se discute allá**.

## Qué contesta y qué no

[`arch-decisions.md`](arch-decisions.md) §15 define **nodo-source**: toda fuente —arma, habilidad,
minion, objeto— hace **emite-instancia · muta-state · (nulo)**. El primer verbo contempla que una
instancia **materialice una sub-source**: *"nuevo nodo-source con su propio state que emite sus propias
instancias (recursión)"*. `G-c` figura ahí como **nombrado, no construido**.

Esta tabla puebla esa casilla. **No decide** cómo se modela: eso vive en `OQ-ENGINE-31` (propagación),
`OQ-ENGINE-35` (escenario) y `OQ-ENGINE-11` (exaltadas).

⚠️ **La clave es el verbo, nunca la identidad ni el grupo** (§15). Las columnas de abajo no clasifican
*qué clase de cosa es* lo materializado — registran **qué hace** y **qué trato le da el juego**.

## El criterio de inclusión no es nuestro

Dos fuentes del juego traen listas explícitas, con exclusiones enumeradas:

| Fuente | Qué declara | Alcance |
|---|---|---|
| [`arcane-sculptor.wikitext`](../../../../references/wiki/arcanes/arcane-sculptor.wikitext) | *"locks Ability Efficiency **when creating an object**"* | 32 objetos válidos · 37 líneas de inválidos |
| [`summoners-wrath.wikitext`](../../../../references/wiki/mods/summoners-wrath.wikitext) | *"increases **Companion and Summon** damage"* | 17 afectados · 23 no afectados |

**Son casi disjuntas, y sólo `Loki's Decoy` aparece en ambas.** La lectura que se sostiene: no son dos
nombres del mismo eje sino dos ejes distintos — Sculptor opera sobre el **acto de crear**, Wrath sobre
el **daño de lo creado**. Eso explica que *Molt* entre en Sculptor y no en Wrath (su decoy no hace
daño), y que `Decoy` esté en las dos.

Las columnas `SC` y `SW` de la tabla registran ese trato: `✓` presente en la lista, `✗` enumerado como
excluido, `–` no mencionado.

## La tabla

Verbos: **E** = emite-instancia · **M** = muta-state · **∅** = nulo (display / fuera-de-sim).
Evidencia = stat declarado en `ability-stats.override.json`.

| Fuente | Materializa | Verbo | SC | SW | Evidencia |
|---|---|---|---|---|---|
| Atlas *Rumblers* | 2 golems | **E·M** | ✗ | ✓ | `Damage <DT_IMPACT>` · `Explosion Damage <DT_BLAST>` · `Health` · `Armor` |
| Atlas *Tectonics* | Bulwark | **E·M** | ✓ | – | `Health` · `Damage <DT_IMPACT>` · `Damage Multiplier <DT_SLASH>` |
| Ash *Blade Storm* | 2 Shadow Clones | **E** | ✗ | ✗ | `Damage <DT_SLASH>` · fuente: *"moddable **Pseudo-Exalted Weapon**"* |
| Baruuk *Desolate Hands* | 3–8 daggers | **E·M** | ✗ | – | `Area Damage <DT_BLAST>` · `Damage Reduction` |
| Caliban *Lethal Progeny* | 3 Sentients | **E·M** | ✗ | ✓ | `Damage Multiplier` · `Health Multiplier` · `Rank` · `Shields/Second` |
| Chroma *Effigy* | sentry | **E·M** | ✗ | ✓ | `Damage <DT_*>` · `Health` · `Credit Multiplier` · `Speed Increase` |
| Citrine *Prismatic Gem* | gem | **?** | ✓ | – | 🔴 sólo `Drain` — el override no declara qué hace |
| Cyte-09 *Seek* | antena | **M** | ✓ | – | `Weak Point Damage: N%` · `Max Antennas` |
| Cyte-09 *Resupply* | 2 ammo packs | **M** | ✓ | – | `Extra Damage: N%` · `Max Packs` |
| Frost *Snow Globe* | globo | **E·M** | ✓ | – | `Cold Status/Second <DT_COLD>` · `Area Damage` · `Health` |
| Gara *Mass Vitrify* | anillo | **E·M** | ✓ | – | `Explosion Damage` · `Health` · `Damage Multiplier` |
| Garuda *Blood Altar* | altar | **E·M** | ✗ | – | `Health/Second: N%` · `Damage/Second: N%` |
| Gyre *Arcsphere* | esfera | **E** | ✓ | – | `Damage/Second <DT_ELECTRICITY>` |
| Gyre *Coil Horizon* | esfera | **E** | ✓ | – | `Explosion Damage <DT_ELECTRICITY>` |
| Hydroid *Tentacle Swarm* | 8–20 tentáculos | **E** | ✗ | ✗ | `Damage <DT_CORROSIVE>` · `Number Of Tentacles` |
| Ivara *Quiver* → Cloak | bubble | **M** | ✓ | – | `Bubble Radius` · `Bubble Duration` — **se parte**: las otras flechas emiten |
| Khora *Venari* | kavat | **E·M** | – | ✓ | `Snare Damage <DT_SLASH>` · `Speed Multiplier` (a Khora) · `Health/Second` |
| Khora *Strangledome* | domo | **E** | ✓ | – | `Damage/Second <DT_IMPACT> <DT_PUNCTURE> <DT_SLASH>` |
| Loki *Decoy* | decoy | **M** | ✓ | ✓ | `Health Absorb` · `Damage Reflected` · `Status Reflected` — **único en ambas listas** |
| Mirage *Prism* | prism | **E** | ✓ | – | `Damage <DT_RADIATION>` · `Number Of Lasers` |
| Mirage *Hall of Mirrors* | 1–4 doppelgangers | **E** | ✗ | ✗ | `Damage: N%` del arma · `Doppelgangers` |
| Nekros *Shadows of the Dead* | 4–7 copias | **E·M** | ✗ | ✓ | `Damage/Health/Shield Multiplier` · `Health Decay/Second` |
| Nidus *Larva* | masa de tentáculos | **E** | ✗ | – | `Area Damage <DT_TOXIN>` |
| Nidus *Ravenous* | zona + 9 Maggots | **E·M** | ✗ | ✓ | `Maggot Rupture Damage <DT_BLAST>` · `Regen Rate/Second` |
| Nokko *Stinkbrain* | hongo | **E** | ✓ | – | `Damage/Pulse <DT_VIRAL>` · `Pulse Rate` |
| Nokko *Brightbonnet* | hongo | **M** | ✓ | – | `Strength: N%` · `Energy Restore` |
| Nova *Null Star* | 12 partículas | **E·M** | ✗ | – | `Damage <DT_BLAST>` · `Damage Reduction/Particle` (al portador) |
| Nova *Wormhole* | portales | **∅** | ✓ | – | `Number Of Portals` · `Number Of Uses` · `Speed: N%` — **sólo movilidad** |
| Octavia *Mallet* | orbe | **E** | ✓ | ✗ | `Damage Multiplier <DT_BLAST>` (refleja lo recibido) |
| Octavia *Resonator* | rollerball | **E·M** | ✓ | – | `Damage/Charm <DT_BLAST>` · charm |
| Oraxia *Widow's Brood* | scuttlers | **?** | ✗ | ✓ | 🔴 `TEMPLATE STAT` — placeholder, sin datos |
| Protea *Grenade Fan* | vortex · satellites | **E·M** | ✓ | – | `Damage <DT_SLASH>` · `Shield` · `Shields/Second` — **se parte** |
| Protea *Blaze Artillery* | turret | **E** | – | ✗ | `Damage <DT_HEAT>` · `+ Damage Per Hit` · `Artillery Multiplier Cap` |
| Protea *Dispensary* | supply cache | **M** | ✓ | – | `Extra Pickup Chance` — genera pickups |
| Protea *Temporal Anchor* | anchor | **E·M** | – | – | `Implosion Damage <DT_BLAST>` · `Armor Reduction` |
| Qorvex *Chyrinka Pillar* | pilar | **E·M** | ✓ | – | `Damage <DT_RADIATION>` · `Slow: N%` · `Max Pillars` |
| Qorvex *Containment Wall* | 2 muros | **E·M** | ✗ | – | `Damage <DT_IMPACT>` · `Damage/Second <DT_RADIATION>` · `Damage Vulnerability` |
| Saryn *Molt* | decoy | **E·M** | ✓ | – | `Damage <DT_TOXIN>` · `Health` · `Speed Multiplier` · `Health/Second` |
| Titania *Razorwing* | 6 Razorfly drones | **E** | – | ✓ | `Damage <DT_SLASH> <DT_IMPACT> <DT_PUNCTURE>` · crítico propio (2.0x / 25%) |
| Titania *Lantern* | faro + swarm | **E·M** | – | – | `Damage/Second <DT_HEAT>` · `Explosion Damage` · atracción |
| Vauban *Tesla Nervos* | roller drone | **E** | ✓ | ✗ | `Damage <DT_ELECTRICITY>` · `Number Of Charges` |
| Vauban *Minelayer* | orb · pad | **E·M** | ✗ | ✗ | Tether `Damage` · Vector `Speed/Damage Multiplier` — **se parte** |
| Vauban *Bastille* | campo | **E·M** | – | – | `Debuff Amount: N%/s` · Vortex `Damage/Second <DT_MAGNETIC>` |
| Volt *Electric Shield* | barrera | **M** | ✓ | – | `Extra Damage <DT_ELECTRICITY>: N%` · `Damage Absorption` — **no emite** |
| Wisp *Reservoirs* | 3 motes | **E·M** | ✓ | – | Vitality/Haste **mutan** · Shock **emite** (`Status <DT_ELECTRICITY>`) — **se parte** |
| Wukong *Celestial Twin* | specter | **E·M** | ✗ | ✓ | `Damage Multiplier` · `Health Multiplier` |
| Yareli *Aquablades* | 3 blades | **E** | ✓ | – | `Slash Damage` · `Number of Blades` |
| Yareli *Merulina* | vehículo | **M** | – | ✗ | `Health Pool` · `Damage Redirection: N%` · `Movement Speed` |
| Zephyr *Tornado* | 2–3 tornados | **E** | ✗ | – | `Damage/Second <DT_SLASH> <DT_IMPACT> <DT_PUNCTURE>` |

### Fuentes que no son habilidades

El eje no distingue por origen — la lista de Summoner's Wrath mezcla armas, precepts y habilidades.

| Fuente | Materializa | Verbo | Nota de la fuente |
|---|---|---|---|
| **Ballistica Prime** | ghost del enemigo (7 s) | **E** | *"fight alongside the player **similar to Specters**"* · los nietos *"expire along with the ghost that spawned them"* |
| **Synoid Heliocor** | Specter del enemigo (30 s) | **E** | requiere *"Codex entry completed"* · *"**Only one specter at a time**"* |
| **Pyrana Prime** | *"second **ethereal Pyrana**"* | **E** | la sub-source es **un arma** |
| **Mischief** (Smeeta) | decoy Kavat | **M** | *"**50% of the Smeeta's Health**"* · el padre es invisible **mientras el hijo viva** |
| **Diversified Denial** (Hound) | 3 specters | **E** | *"si los tres mueren, el Hound reaparece con 50% Health"* |
| **Duplex Bond** | pet clones | **E** | revivibles · *"no cuentan para el **límite de 3 clones**"* |
| **Strain Set** | — (modifica Maggots) | — | mods de **compañero** que alteran una sub-source del **warframe** |
| **Tauron Strike** (Focus) | el **warframe** | **E** | *"el **Operator summons the Warframe**"* — relación invertida |

## Lo que el pase deja medido

**1 · El verbo único es la excepción.** De 49 filas de habilidad, **22 hacen dos verbos**. El corpus no
se parte en tres cajones: la mayoría emite **y** muta.

**2 · Los tres verbos tienen caso puro, y eso valida la partición de §15.**
`Nova Wormhole` es **∅ puro** —`Number Of Portals`, `Number Of Uses`, `Speed`: sólo movilidad— y sin
embargo Arcane Sculptor lo lista como objeto válido. `Volt Electric Shield` es **M puro**: no emite
nada, modifica los disparos que la cruzan. `Zephyr Tornado` es **E puro**.

⇒ **"es un objeto" y "qué verbo hace" son ejes independientes.** Un objeto declarado por el juego puede
no tocar el cómputo en absoluto.

**3 · Cuatro habilidades se parten por dentro.** *Reservoirs* (Vitality/Haste mutan, Shock emite),
*Minelayer* (Tether emite, Vector muta), *Grenade Fan* (vortex emite, satellites mutan), *Quiver*
(Cloak muta, las otras flechas emiten). **La unidad del corpus no es la habilidad** — contar
materializaciones no es contar nodos.

**4 · La recursión aparece tres veces, con reglas distintas.**

| Caso | Regla que declara |
|---|---|
| Caliban → Summulyst → Choralysts | `Max Choralysts: 6` — población con tope |
| Uriel → demonios → sus creaciones | cadenas de Catenach, orbes de Gulphagor, runas de Vythelas |
| Ballistica Prime → ghost → minions | **la ventana del hijo se ata a la del padre** |

**5 · La dependencia va en las dos direcciones.** Padre → hijo es lo esperable; *Mischief* y
*Diversified Denial* declaran **hijo → padre**: el estado del portador depende de que el hijo viva.

**6 · La herencia de stats está declarada, y no es de exaltadas.** `Health Multiplier 2x $STRENGTH`
(Caliban), `retain the level and stats of their original selves` (Nekros), `50% of the Smeeta's Health`
(Mischief). `OQ-ENGINE-11` marcó el escalado cruzado como sub-concern **de exaltadas**; el corpus
muestra que es la forma general de toda sub-source.

## Anomalías del criterio de DE

Pares casi idénticos que caen de lados distintos. Son forcing-cases para entender el criterio, no
errores del censo:

| Anomalía | Detalle |
|---|---|
| **Qorvex partido** | *Chyrinka Pillar* válido en Sculptor, *Containment Wall* inválido — mismo warframe, ambas construyen estructura de concreto |
| **Vauban partido** | *Tesla Nervos* válido, *Vector-Overdrive Pad* inválido — ambos son minas desplegables |
| **Orbitales partidos** | *Aquablades* válido, *Null Star* inválido — ambos giran alrededor del portador |
| **Proyectiles admitidos** | *Coil Horizon* (2 s de vida) es válido; *Antimatter Drop* es inválido |

⚠️ **La fuente se contradice en un punto:** la lista de *no afectados* de Summoner's Wrath termina con
*"Maggots now trigger Summoner's Wrath"*, y los Maggots ya figuran entre los afectados. Parece patch
history mezclado en la lista. Sin `.md` propio, la marca formal no aplica todavía.

## Huecos de dato

| Hueco | Estado |
|---|---|
| **Follie** — `InkField` · `InkSketch` · `InkClone` · `InkBalloon` | las cuatro **sin entrada** en el override y sin `.md`. Sculptor nombra dos: *Shadowgraph* y *Self Portrait* |
| **Uriel** — `DemonFrameCloneAbility` | `.md` stub (`// N - NAME`, sin stats). Sculptor nombra a sus demonios: Catenach · Gulphagor · Vythelas |
| **Sevagoth's Shadow** — 4 `Reaper*` | en el override sin `.md` |
| **Citrine *Prismatic Gem*** | el override declara sólo `Drain` |
| **Oraxia *Widow's Brood*** | `TEMPLATE STAT` — placeholder |
| **Escuelas de Focus** | *Spectral Blades*, *Unairu Wisp* y los cinco *Tauron Strike* son nodos de Focus — dato gated por `OQ-DATA-17` |
