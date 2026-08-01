# Buff & Debuff

> Estado: activo
> Rol: índice de efectos temporales — qué ejes de buff y debuff existen, a quién alcanzan, y qué los concede
> Fuente de verdad de: el catálogo de ejes de buff/debuff y sus fuentes · a quién alcanza cada eje según la fuente · la agrupación por forma de composición (aditivo / multiplicativo / flat) donde la wiki la declara · qué efectos tienen ícono en pantalla
> No usar para: los valores numéricos de cada fuente (viven en la página del mod, arcano o habilidad) · las leyes de cada mecánica ([`armor.md`](armor.md), [`damage-reduction.md`](damage-reduction.md), [`movement-speed.md`](movement-speed.md), [`status-effects.md`](status-effects.md), [`maneuvers.md`](maneuvers.md)) · listas de enemigos por facción
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Buff_%26_Debuff · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Offense · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Defense · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Healing · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Utility · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Mobility · https://wiki.warframe.com/w/Buff_%26_Debuff/Buffs/Misc · https://wiki.warframe.com/w/Buff_%26_Debuff/Debuffs · https://wiki.warframe.com/w/Buff_%26_Debuff/Debuffs/CC · https://wiki.warframe.com/w/Buff_%26_Debuff/Debuffs/Curse · https://wiki.warframe.com/w/Buff_%26_Debuff/Debuffs/Misc · https://wiki.warframe.com/w/Buff_%26_Debuff/Icons
> Fuente actualizada: 2026-06-18
> Raw: buff-debuff.wikitext · buff-debuff-buffs.wikitext · buff-debuff-buffs-offense.wikitext · buff-debuff-buffs-defense.wikitext · buff-debuff-buffs-healing.wikitext · buff-debuff-buffs-utility.wikitext · buff-debuff-buffs-mobility.wikitext · buff-debuff-buffs-misc.wikitext · buff-debuff-debuffs.wikitext · buff-debuff-debuffs-cc.wikitext · buff-debuff-debuffs-curse.wikitext · buff-debuff-debuffs-misc.wikitext · buff-debuff-icons.wikitext

## Cómo está organizado

**Las secciones espejan las páginas de la wiki**, una por raw, para que un cambio en la fuente caiga
en una sola sección de este documento. La agrupación en *Offense / Defense / Healing / Utility /
Mobility / Misc* es de la wiki, no nuestra.

Cada eje se lista como **Nombre · `Target` · fuentes**. Donde la fuente subdivide las fuentes —por
forma de composición, por tipo de arma o por a quién alcanzan— esa subdivisión se conserva, porque es
la parte que no se puede reconstruir después.

**Lo que este documento no trae:** los números. Cuánto da *Warcry* o cuánto reduce *Shatter Shield*
vive en la página de cada uno.

> ⚠️ La página padre lleva `{{UpdateMe}}` y `{{Community}}`: es material mantenido por la comunidad y
> declarado desactualizado por la propia wiki.

**Cuándo tocó la wiki cada página.** El `{{UpdateMe}}` se queda corto, y la antigüedad **no es
uniforme**: conviene mirarla antes de apoyarse en una sección, porque no todas envejecieron igual.

| Fresca (< 1 año) | Media (1-3 años) | Estancada (> 3 años) |
|---|---|---|
| Buffs/Healing `2026-06` · Icons `2026-05` · Buffs/Misc `2026-02` · Buffs/Defense `2026-01` · Buffs/Offense `2025-10` | Buffs (índice) `2025-08` · padre `2025-08` · Debuffs/CC `2025-06` · Debuffs/Curse `2024-01` | Buffs/Mobility `2023-07` · Debuffs/Misc `2022-05` · Buffs/Utility `2022-09` · **Debuffs (índice) `2020-10`** |

Las tres columnas de debuffs son las más viejas del conjunto, y son justamente las que menos
contraste tienen contra el resto del corpus.

**El vocabulario de `Target` no es uniforme en la fuente.** Conviven `Player` y `User`, `User/Ally` y
`Self/Ally`, más `All`, `Enemy`, `Squad`, `Any Warframe` y `Target`; en *Debuffs/Misc* la columna ni
siquiera se llama `Target` sino `Type`, con los mismos valores. Se transcribe tal cual aparece.

---

# Buffs

## Offense

> Raw: `buff-debuff-buffs-offense.wikitext` — *"buffs que aumentan daño, DPS, Ability Strength o los stats de un arma"*

**Ability Duration Bonus** · `User` — *aditivo*
*Vengeful Rush* · arcano *Molt Efficiency*

**Ability Strength Bonus** · `User/Ally`
- *Aditivo:* pasiva de Ember · Equinox *Pacify & Provoke* (forma día) y su augment *Peaceful Provocation* · pasiva de Protea · Khora *Accumulating Whipclaw* (sólo a su 1ª habilidad) · *Growing Power* · *Power Donation* usado por un compañero de equipo · arcanos *Molt Vigor* y *Pax Bolt* · Madurai *Sling Strength* · Zenurik *Hardened Wellspring* · Arbitrations cuando se elige el warframe sugerido
- *Multiplicativo:* Nidus *Parasitic Link* · Corruption de warframe

**Attack Speed Bonus** · `User/Ally`
Gauss *Redline* · Harrow *Penance* · Octavia *Metronome* · Titania *Razorwing Blitz* · Valkyr *Warcry* · Volt *Speed* · Wisp *Reservoirs* (Haste mote)

> ⚠️ Conflicto ↔ [`../warframes/octavia/metronome.md`](../warframes/octavia/metronome.md)

Harrow *Penance* aparece acá y también en *Fire Rate Bonus*: su página da los dos, pero **el valor
del attack speed lo consigna como `??%`** y la descripción oficial de la habilidad no lo menciona —
ver [`../warframes/harrow/penance.md`](../warframes/harrow/penance.md).

**Critical Chance Bonus** · `Player`
- *Todas las armas:* Harrow *Covenant* · Adarza Kavat *Cat's Eye* · Smeeta Kavat *Charm* · arcano *Arcane Avenger*
- *Primarias no-escopeta:* *Argon Scope* · *Galvanized Scope* · *Hata-Satya* (Soma Prime) · *Proton Jet* · set Vigilante
- *Escopetas primarias:* *Laser Sight* · *Motus Setup*
- *Secundarias:* *Hydraulic Crosshairs* · *Galvanized Crosshairs* · arcanos *Cascadia Accuracy* y *Cascadia Overcharge*
- *Melee:* set Gladiator · *Blood Rush* · *Maiming Strike* · Naramon *Killer's Rush*
- *Misc:* Ivara *Piercing Navigator* (un solo proyectil) y *Concentrated Arrow* (Artemis Bow) · Nidus *Teeming Virulence* (primarias) · Wukong *Primal Rage* (Iron Staff) · Wisp *Critical Surge* (primarias) · pasiva de Zephyr (en el aire) · *Critical Focus* (arch-guns) · *Exposing Harpoon* (Harpak) · *Hunter Synergy* (compañeros bestia) · pasiva de Arca Scisco (bonus plano) · pasiva de Silva & Aegis (Prime) · arcano *Virtuos Shadow* (amps)

**Critical Damage Multiplier Bonus** · `Player`
Ivara *Empowered Quiver* · Volt *Electric Shield* (no-melee) · *Bladed Rounds* (primarias no-escopeta) · *Critical Focus* (arch-guns) · *Shrapnel Shot* (escopetas) · *Sharpened Bullets* (secundarias) · *Strain Infection* (melee) · *Tek Collateral* · pasiva de Knell · arcanos *Virtuos Strike* y *Virtuos Shadow* (amps) · Madurai *Power Transfer* (amps)

**Total Damage Bonus** · `User/Ally`
- *Aditivo* (se suma antes de otros cálculos y stackea con mods de daño como *Serration*): Chroma *Vex Armor* · Equinox *Metamorphosis* (forma noche) · Gauss *Kinetic Plating* con *Redline* activo (melee) · Limbo *Rift Torrent* · Mesa *Shooting Gallery* · Nyx *Absorb* · Octavia *Metronome* (buff Forte, melee) y *Amp* · Titania *Tribute* (Full Moon, compañeros) · *Ambush* · *Condition Overload* (melee) · *Dead Eye* (snipers) · *Deadly Efficiency* (arch-guns) · *Galvanized Aptitude* / *Savvy* / *Shot* (sólo daño directo) · *Hunter's Bonesaw* (Ripkas) · *Pistol Amp* · *Provoked* (secundarias en bleedout) · *Rifle Amp* · *Seismic Wave* (melee) · *Shotgun Amp* · *Strain Fever* (Helminth Charger) · *Vigorous Swap* · arcanos *Arachne*, *Awakening*, *Blade Charger*, *Fury*, *Precision*, *Primary Charger*, *Rage*, *Eternal Eradicate*, *Primary/Secondary Deadhead*, *Dexterity* y *Merciless* · Madurai *Phoenix Talons* y *Void Strike* · Naramon *Amp Spike* y *Lethal Levitation* · Unairu *Unairu Wisp* y *Vengeance*
- *Multiplicativo* (después de los mods de daño): Banshee *Savage Silence* (finishers) · Excalibur *Radiant Finish* (finishers) y *Furious Javelin* · Ivara *Prowl* (headshots) · Mirage *Eclipse* y *Hall of Malevolence* · Rhino *Roar* · Vauban *Minelayer* (Overdriver) · Sahasa Kubrow *Ferocity* y Sunika Kubrow *Savagery* (finishers) · *Charged Chamber* y *Primed Chamber* (snipers) · *Mecha Empowered* · *Meticulous Aim* (Vulkar, headshots) · *Synth Charge* · pasiva de Arca Titron · Naramon *Sling Stun* (finishers)
- *Daño plano:* Mesa *Ballistic Battery* · *Energy Channel* (melee)

**Damage Reflection** · `Player`
Chroma *Elemental Ward* (Electricity o Cold) · Mesa *Shatter Shield* · Nidus *Parasitic Link* · Revenant *Mesmer Skin* · Titania *Tribute* (Thorns) · Trinity *Link* · Adarza Kavat *Reflect* · *Reflection*

**Elemental Damage Bonus** · `Self/Ally`
Multiplicativo después de los mods de daño pero **antes** de los elementales — o sea, stackea aditivo con ellos. **No se combina con los elementos ya presentes en el arma**: *Fireball Frenzy* sobre un arma Cold deja Cold **y** Heat por separado, sin fusionar en Blast. Puede aplicarse a compañeros, specters, enemigos bajo *Mind Control*, *Shadows*, Saryn *Molt*, Loki *Decoy*, aliados de Invasion y clones de *Blade Storm*; **no** a aliados con proc de Radiation.
- *Caster y aliados:* Grendel *Nourish* (Viral) · *Energy Field* (Heat, si los aliados disparan a través del escudo) · *Fireball Frenzy* (Heat) · *Freeze Force* (Cold) · *Shock Trooper* (Electricity) · *Smite Infusion* (Radiation) · *Venom Dose* (Corrosive) · *Thermal Transfer* (Heat, Cold o Blast)
- *Sólo caster:* pasiva de Wukong (Primal Forces) · pasiva de Ack & Brunt (añade el tipo bloqueado) · pasivas de Dual Toxocyst y Lesion (Toxin) · arcano *Magus Melt* (Heat, amps)

**Extra Hit** · `Player`
Golpe extra por instancia de daño, como **instancia separada**: no altera la distribución de daño inicial ni el cálculo de chance de proc.
Saryn *Toxic Lash* (Toxin) · Xaku *Xata's Whisper* (Void) · Cyte-09 *Resupply* (tipo elegido)

**Faction Damage Bonus** · `Player`
Bonus **multiplicativo** contra una facción, encima del daño base y de los mods elementales.
Rhino *Roar* (todas) · Grineer / Corpus / Infested / Orokin: *Bane*, *Cleanse*, *Expel* y *Smite* (y sus Primed) · Sentient: *Sacrificial Pressure* y *Steel* (melee) · Paracesis a rango máximo

**Fire Rate Bonus** · `Player`
Gauss *Redline* · Harrow *Penance* · pasiva de Mesa (secundarias dobles) · Wisp *Reservoirs* (Haste mote) · *Pressurized Magazine* (secundarias) · *Repeater Clip* (escopetas) · *Spring-Loaded Chamber* (primarias no-escopeta)

**Status Chance Bonus** · `Player`
*Catalyzer Link* (primarias no-escopeta) · *Chromatic Blade* (Exalted Blade) · *Embedded Catalyzer* (secundarias) · *Hunter's Bonesaw* (Ripkas) · *Marked Target* (arch-guns) · *Mecha Overdrive* (compañeros bestia) · *Motus Setup* y *Nano-Applicator* (escopetas) · Citrine *Prismatic Gem* · *Proton Jet* (primarias no-escopeta) · *Proton Snap* (melee) · *Reactive Storm* (Desert Wind) · *Weeping Wounds* (melee) · pasivas de Arca Scisco (plano), Knell, Sibear y Silva & Aegis (Prime) · arcano *Virtuos Ghost* (amps)

**Status Duration Bonus** · `User/Ally`
Citrine *Prismatic Gem* · pasiva de Lavos

## Defense

> Raw: `buff-debuff-buffs-defense.wikitext` — *"buffs que reducen o niegan daño entrante, o dan inmunidad a status"*

**Armor Bonus** · `User/Ally` — ver [`armor.md`](armor.md)
- *Multiplicativo de la base* (stackea aditivo con *Steel Fiber* y *Link Fiber*): Valkyr *Warcry* · Chroma *Elemental Ward* (Cold) y *Vex Armor* · Octavia *Metronome* · *Mecha Pulse* · *Stand United* · *Synth Fiber* (sentinels) · Vazarin *Enduring Tides* · efecto Justice de Steel Meridian
- *Aditivo después de la multiplicación* (bonus plano tras los mods): pasiva de Atlas (Rubble) · pasiva de Grendel · Hydroid *Plunder* · Inaros *Scarab Shell* · Oberon *Renewal* (Iron) y *Hallowed Reckoning* · Wukong *Defy* · *Health Conversion* · arcanos *Guardian*, *Reaper*, *Tanker*, *Ultimatum*, *Melee Fortification* y *Magus Husk* · Unairu *Stone Skin*
- *Multiplicativo del resultado* (multiplica todo lo anterior): Rhino *Ironclad Charge*

**Damage Reduction** · `Player` — ver [`damage-reduction.md`](damage-reduction.md)
Stackea **multiplicativo** con armor (si el daño va a health) y **multiplicativo** con otras fuentes de DR.
pasiva de Baruuk, *Desolate Hands* y *Serene Storm* · pasiva de Caliban · Ember *Immolation* y *Immolated Radiance* · Gara *Splinter Storm* · Harrow *Warding Thurible* · Jade *Glory on High* · Loki *Deceptive Bond* · Mesa *Shatter Shield* · Mirage *Eclipse* (Lunar) · Nekros *Shield of Shadows* · Nezha *Warding Halo* · Nidus *Parasitic Link* · Nova *Null Star* · Titania *Tribute* (Thorns) · Trinity *Link* y *Blessing* · pasiva de Xaku y *The Vast Untime* (sólo AoE) · Yareli *Merulina* · set Proton · *Electromagnetic Shielding* · arcano *Magus Firewall* (operador) · specter Ancient Healer · **rodar** (ver [`maneuvers.md`](maneuvers.md))

**Damage Type Modifier** · `Player`
Stackea **multiplicativo** con otras fuentes de DR pero **aditivo** entre modificadores de tipo.
Gauss *Kinetic Plating* (Impact, Puncture, Slash, Cold, Heat, Blast) · *Adaptation* · *Aerodynamic* · *Agility Drift* · *Antitoxin* (Toxin) · *Aviator* · *Diamond Skin* (Radiation) · *Flame Repellent* (Heat) · *Insulation* (Cold) · *Lightning Rod* (Electricity) · *Shock Absorbers* · *Toxin Resistance* · *Umbral Fiber / Intensify / Vitality* (Tau) · **los shields** (−25% innato a todo tipo)

**Dodge** · `User`
Chance de que proyectiles y ataques melee atraviesen al jugador sin daño.
Baruuk *Elude* · pasiva de Xaku y *The Vast Untime* · Koumei *Omamori*

**Energy as Health** · `Player`
Con daño letal, el daño va al pool de energía en vez de a health.
*Gladiator Finesse* · *Quick Thinking*

**Evasion** · `Player`
Los enemigos que disparan a un objetivo con evasion positiva sufren fuerte imprecisión.
Titania *Razorwing* · set Carnis · *Agility Drift* · *Sly Devolution* · *Elusive Posture* · estar en el aire, en aim glide o en wall latch

**Invincibility** · `Player`
Amesha *Watchful Swarm* · Ash al entrar en *Blade Storm* · Atlas *Landslide* y *Rumbled* · Baruuk *Elude* · Dagath *Grave Spirit* y *Rakhali's Cavalry* · Excalibur *Slash Dash* · Gara *Mass Vitrify* · Garuda *Dread Ward* · Harrow *Covenant* · pasiva de Hildryn y *Haven* (shield gating) · Hydroid *Tidal Surge* · Inaros *Sandstorm* y *Negation Armor* · Jade *Symphony of Mercy* · Khora *Venari Bodyguard* · Koumei *Omamori* con Shadow's Trinity · cualquiera en el Rift de Limbo frente a enemigos fuera de él · Loki *Safeguard Switch* y *Savior Decoy* · Nezha *Warding Halo* · pasiva de Nidus · Nyx *Absorb* y *Assimilate* · Oberon *Phoenix Renewal* · Qorvex *Crucible Blast* · Revenant *Mesmer Skin* y *Reave* · Rhino *Rhino Charge* e *Iron Skin* · Temple *Ripper's Wail* · pasiva Rage de Valkyr · Wisp *Wil-O-Wisp* · pasiva de Wukong (Cosmic Armour), *Cloud Walker* y *Defy* · Yareli *Merulina* · *Quick Escape* · *Rolling Guard* · *Tek Assault* (kavats) · Vazarin *Protective Sling*

**Status Immunity** · `Player`
Incluye efectos físicos: staggers, stuns y knockdowns.
- *Inmunidad real:* Ember *Purifying Flames* · Frost *Icy Avalanche* · Grendel *Hearty Nourishment* y con Masseter · pasiva de Hildryn (sólo Slash y Toxin) · Hydroid *Tidal Impunity* · Inaros *Scarab Shell* · Ivara *Empowered Quiver* · el Rift de Limbo · Nidus *Parasitic Link* · Nezha *Fire Walker* y *Warding Halo* (y quien esté parado en el Fire Walker) · quien esté en Oberon *Hallowed Ground* · Qorvex *Disometric Guard* · pasiva de Revenant (Magnetic de las aguas nocturnas de Plains) · Rhino *Iron Skin* · Titania *Spellbind* · Trinity *Link* · cualquier habilidad que dé invencibilidad · Amesha *Warding Grace* · sets Carnis y Motus (knockdowns en el aire) · *Fortitude*, *Power Drift* y *Sure Footed* (knockdowns) · *Perfect Balance* (caídas de K-Drive) · *Resolute Focus* (staggers y knockdowns) · *Rolling Guard* · arcanos *Deflection* (Slash), *Healing* (Radiation), *Ice* (Heat), *Nullifier* (Magnetic), *Resistance* (Toxin), *Warmth* (Cold) y *Magus Glitch* (Transference Static)
- *Sólo limpia (no inmuniza):* Excalibur *Purging Slash* · Hildryn *Pillage* · Revenant *Reave* · Saryn *Molt* · Wyrm *Negate*

## Healing

> Raw: `buff-debuff-buffs-healing.wikitext` — *"restauración de health, shields y energy"*

**Energy Restoration** · `Player`
- *Instantáneo:* Caliban *Razor Gyre* · Chroma *Guided Effigy* · pasivas de Dagath y Equinox · Garuda *Bloodletting* · Gauss *Kinetic Plating* · Harrow *Thurible* · Nidus *Virulence* · Nokko *Brightbonnet* · Titania *Spellbound Harvest* · Trinity *Energy Vampire* · Smeeta Kavat *Charm* · Amesha *Vengeful Rush* · *Equilibrium* · *Hunter Adrenaline* · *Kinetic Diversion* (archwing) · *Rage* · *Sharpshooter* · arcanos *Energize* y *Emergence Dissipate* · efectos Blight (Red Veil) y Entropy (Cephalon Suda) · Squad Energy Restore
- *Over-time:* cualquier warframe en el Rift de Limbo · Gyre *Cathode Grace* · pasiva de Octavia (Inspiration) · Styanax *Rally Point* · *Voracious Metastasis* · *Energy Siphon* · arcanos *Exodia Brave* y *Emergence Renewed* · Anspatha Brace (operador) · Zenurik *Energy Pulse*, *No Quarter*, *Wellspring* y *Void Siphon*
- *Indirecto (spawnea orbes):* Atlas *Ore Gaze* · Citrine *Fractured Blast* · Ember *Exothermic* · Gara *Spectrosiphon* · Hildryn *Aegis Storm* · Hydroid *Pilfering Swarm* · Ivara *Prowl* · Khora *Pilfering Strangledome* · Mag *Pull* · Nekros *Desecrate* · Nezha *Blazing Chakram* · pasiva de Nova · Oraxia *Mercy's Kiss* · Protea *Dispensary* · Trinity *Pool of Life* · pasiva de Uriel (Gulphagor) · Voruna *Lycath's Hunt* · pasiva de Wukong (Monkey Luck) · Chesa Kubrow *Retrieve* · Sahasa Kubrow *Dig* · *Blood For Energy* · *Energy Generator* · pasiva de Broken Scepter

**Health Restoration** · `Player`
- *Instantáneo:* pasiva de Atlas (Rubble) · Caliban *Razor Gyre* · Chroma *Elemental Ward* (Heat) · Cyte-09 *Evade* · Dante *Light Verse* · Ember *Healing Flame* · pasiva de Equinox y *Mend & Maim* (noche) · Grendel *Nourish* · Harrow *Penance* · pasiva de Inaros y *Desiccation* · Jade *Light's Judgment* · Koumei *Omamori* · Kullervo *Recompense* · Lavos *Ophidian Bite* · Limbo *Rift Haven* · pasiva de Nekros · Nokko *Reroot* · Oberon *Renewal* · Oraxia *Silken Stride* · Sevagoth *Gloom* · Styanax *Tharros Strike* · Temple *Ripper's Wail* · Trinity *Well of Life* y *Blessing* · Uriel *Remedium* · Valkyr *Hysteria* · Voruna *Ulfrun's Descent* · Xaku *Vampiric Grasp* · *Master's Summons* (compañeros) · Amesha *Benevolent Decoy* · *Amalgam Daikyu Target Acquired* · *Bhisaj-Bal* · *Combat Discipline* · *Equilibrium* · *Healing Return* · *Hunter Recovery* · *Life Strike* · *Pack Leader* (bestias) · *Strain Consume* · *Winds of Purity* (Furis) · pasivas de Hema e Hirudo · arcanos *Bodyguard* (compañeros), *Pulse*, *Emergence Savior*, *Exodia Might*, *Magus Elevate*, *Magus Replenish*, *Magus Revert* y *Molt Reconstruct* · Sancti Magistar (ataques cargados) · Vazarin *Void Snare* · Health Restores · efectos Justice, Purity y Truth de sindicatos · cores Sentient
- *Over-time:* pasiva de Citrine · Gara *Mending Splinters* · Garuda *Blood Altar* · Khora *Venari* (Heal) · pasiva de Nidus y *Ravenous* · Nokko *Reroot* · Oberon *Renewal* · Saryn *Regenerative Molt* · Sirius *Light's Sanctuary* · pasiva de Titania · Wisp *Reservoirs* (Vitality mote) · Wukong *Cloud Walker* (por distancia) · *Voracious Metastasis* · *Iatric Mycelium* · *Medi-Pet Kit* (bestias) · *Medi-Ray* · *Odomedic* · *Rejuvenation* · *Repair Kit* (robóticos) · arcanos *Grace*, *Victory*, *Magus Nourish* y *Magus Repair* · Vazarin *Protective Sling*, *Rejuvenating Tides*, *Void Regen* y *Squad Regen*
- *Indirecto (spawnea orbes):* Atlas *Ore Gaze* · Citrine *Fractured Blast* · Dagath *Grave Spirit* · Hydroid *Pilfering Swarm* · Ivara *Prowl* · Khora *Pilfering Strangledome* · Nekros *Desecrate* · Nezha *Blazing Chakram* · Oberon *Reckoning* · Oraxia *Mercy's Kiss* · Protea *Dispensary* · Trinity *Pool of Life* · pasiva de Uriel · Voruna *Lycath's Hunt* · pasiva de Wukong · Chesa Kubrow *Retrieve* · Sahasa Kubrow *Dig* · *Blood For Life* · *Synth Deconstruct* · pasiva de Broken Scepter

**Shield Restoration** · `Player` — ver [`shield.md`](shield.md)
- *Instantáneo:* Caliban *Razor Gyre* · Chroma *Elemental Ward* (Electricity) · Equinox *Mend & Maim* (noche) · Excalibur *Purging Slash* · Harrow *Condemn* · Hildryn *Balefire Surge*, *Pillage*, *Blazing Pillage* y *Haven* · Koumei *Omamori* (con health llena) · Mag *Polarize* y *Crush* · Nokko *Reroot* · Nyx *Psychic Bolts* · Revenant *Reave* y *Danse Macabre* · Styanax *Rally Point* · Temple *Ripper's Wail* · Trinity *Vampire Leech* y *Blessing* · Uriel *Remedium* · Valkyr *Hysterical Fixation* · Volt *Recharge Barrier* y *Capacitance* · Voruna *Ulfrun's Descent* · *Master's Summons* · *Rebuild Shields* · Smeeta Kavat *Charm* · set Augur · *Brief Respite* · *Guardian* · *Molecular Conversion* · *Protect* · pasiva de Rakta Dark Dagger · arcano *Barrier* · efecto Sequence (Perrin) · Squad Shield Restore · cores Sentient
- *Over-time:* Caliban *Lethal Progeny* · Jade *Symphony of Mercy* · Nokko *Reroot* · Protea *Grenade Fan* · *Shield Charger* · arcano *Aegis* · Vazarin *Guardian Break* · Shield Ospreys aliados

## Utility

> Raw: `buff-debuff-buffs-utility.wikitext` — *"calidad de vida y botín"*

**Ability Efficiency** · `User` — arcano *Pax Bolt*

**Affinity Bonus** · `User` — Smeeta Kavat *Charm* · Naramon *Affinity Spike* (melee equipado) · Affinity Booster · misiones Dark Sector (por clase de arma) · bonus de kill sigiloso · Void Fissure endless

**Ammo Efficiency** · `User` — arcano *Pistoleer* · Madurai *Void Fuel* · *Brain Storm* (Grakata) · *Skull Shots* (Viper) · *Zazvat-Kar* (Akstiletto Prime). Ver [`ammo.md`](ammo.md)

**Ammo Mutation** · `User` — *Ammo Case* · *Arrow / Pistol / Rifle / Shotgun / Sniper Ammo Mutation* · *Vigilante Supplies*

**Ammo Pickup Bonus** · `User` — *Amalgam Daikyu Target Acquired* · *Pistol / Rifle / Shotgun / Sniper Scavenger*

**Credits Bonus** · `User/Ally` — Chroma *Effigy* · Secura Lecta · Credit Booster · Void Fissure endless

**Holster Speed Bonus** · `Player` — Chroma *Elemental Ward* (Toxin) · Gauss *Redline*

> ⚠️ Conflicto ↔ [`../warframes/gauss/redline.md`](../warframes/gauss/redline.md)

**Mod Drop Rate Bonus** · `Player` — cualquier fuente de *Rerolling Loot Drop* · Mod Drop Chance Booster · The Steel Path

**Reload Speed Bonus** · `Player` — ver [`reload.md`](reload.md)
- *Reduce el tiempo:* Chroma *Elemental Ward* (Toxin) · Gauss *Redline* · Harrow *Penance* · pasiva de Mesa (secundarias) · Volt *Speed* · *Aero Agility* · arcanos *Momentum* (snipers), *Fractalized Reset*, *Primary Merciless* y *Secondary Merciless* (rango máximo)
- *Recarga instantánea:* Garuda *Blood Forge* · Smeeta Kavat *Charm* · *Blood For Ammo*

**Rerolling Loot Drop** · `Player`
No se pueden apilar dos habilidades de la misma clase para producir más de un drop.
- *Enemigos vivos:* Ivara *Prowl* — *Petrificados:* Atlas *Ore Gaze* — *Al morir:* Hydroid *Pilfering Swarm* · Khora *Pilfering Strangledome* · pasiva de Wukong — *Sobre cadáveres:* Nekros *Desecrate* · Chesa Kubrow *Retrieve*

**Resource Bonus** · `Player` — Dark Sectors · Resource Booster · Smeeta Kavat *Charm* · Void Fissure endless

**Resource Drop Rate Bonus** · `Player` — cualquier fuente de *Rerolling Loot Drop* · Resource Drop Chance Booster · Void Fissure endless · The Steel Path

## Mobility

> Raw: `buff-debuff-buffs-mobility.wikitext` — ver [`maneuvers.md`](maneuvers.md) y [`movement-speed.md`](movement-speed.md)

**Maneuver Bonus** · `User/Ally`
- *Aim Glide y Wall Latch:* *Patagium* · *Stealth Drift* · arcano *Pax Soar*
- *Bullet Jump, Aim Glide y Wall Latch:* *Battering Maneuver* · *Firewalker* · *Hit And Run* · *Ice Spring* · *Lightning Dash* · *Mobilize* · *Piercing Step* · *Rending Turn* · *Toxic Flight* · portar Telos Boltace
- *Slide:* *Cunning Drift* · *Maglev* · *Streamlined Form*
- *Misc:* pasiva de Loki (wall latch dura 10× — 60 s) · pasiva de Mirage (+25% velocidad de bullet jump, +50% velocidad de maniobra) · pasiva Dust Bloom de Titania (+25% distancia de bullet jump y roll, más un trampolín de 5 s que concede Upsurge con el mismo +25%) · *Aerodynamic* y *Tractor Beam* (duración de aim glide) · *Amalgam Barrel Diffusion* (velocidad de roll) · *Endurance Drift* y *Hit And Run* (parkour velocity) · *Motus Signal* (fuerza de double jump) · *Proton Pulse* (velocidad de bullet jump) · arcanos *Agility* y *Consequence* (parkour velocity) · Praedos (perks Drifting Grace, Evolved Ascension o Vaulting Leap)

**Movement Speed Bonus** · `All`
- *Sólo el usuario:* Chroma *Effigy* · Equinox *Metamorphosis* (noche) · Gauss *Mach Rush* · Ivara *Infiltrate* · Khora *Venari* · Nezha *Fire Walker* · Saryn *Molt* · Titania *Razorwing Blitz* · Xaku *The Vast Untime* · Helminth *Infested Mobility* · *Amalgam Serration* · *Dispatch Overdrive* · *Runtime* · *Sprint Boost* · arcanos *Phantasm* y *Magus Cadence* · pasiva de Kogake Prime · Praedos (Drifting Grace) · Naramon *Mind Step* (operador)
- *Usuario y aliados:* Nova *Escape Velocity* · Octavia *Metronome* · **Volt *Speed*** · Zephyr *Jet Stream* · Wisp *Reservoirs* (Haste mote)
- *Enemigo:* Nova *Molecular Prime* si Ability Strength < 70% · Equinox *Rest & Rage* (forma día)

## Misc

> Raw: `buff-debuff-buffs-misc.wikitext`

**Ancient Disruptor Aura** · `Enemy` — reduce en 90% el daño recibido de habilidades de warframe · drena energía de los warframes en proporción al daño que hacen los enemigos bajo el aura · reduce el CC de ciertas habilidades (varía por habilidad; **varias auras stackean**). Bajo *Mind Control* beneficia a los aliados, aunque no todos los bonus aplican a jugadores.

**Ancient Healer Aura** · `Enemy` — da [Overguard](overguard.md) a los enemigos cercanos equivalente a **9×** la health del Ancient Healer, con inmunidad a status y knockdown derivada de ese overguard · el daño hecho a los protegidos cura al Healer hasta un 150% de su health

**Arcane Enhancements** · `User` — ver la página de Arcane Enhancement

**Convergence** · `Player` — multiplica la conversión de Affinity a Focus durante **45 s**, hasta morir o hasta el cap diario. Orbes de Convergence (8×) · entrar a una zona nueva en Sanctuary Onslaught (8-16× según zonas completadas)

**Corruption** · `All` — se obtiene en Void Fissures. **Enemigos:** quedan aturdidos temporalmente, con invulnerabilidad durante ese lapso. **Tenno:** tras juntar 10 Reactant, un buff aleatorio al warframe o a un arma, con duración `30 s × tier de misión` — warframe: **×2 al total** de Ability Range y Strength; primaria y secundaria: no consumen munición; melee: channeling a 1 de energía por enemigo golpeado.

**Invisibility** · `Player` — Ash *Smoke Screen* y *Smoke Shadow* · Cyte-09 *Evade* · Ivara *Quiver* (Cloak) y *Prowl* · Loki *Invisibility* · Nokko *Reroot* · Octavia *Metronome* (Nocturne) · pasiva de Oraxia · Voruna *Shroud of Dynar* · pasiva de Wisp y *Wil-O-Wisp* · pasiva de Wukong (Heavenly Cloak), *Cloud Walker* y *Enveloping Cloud* · Shade *Ghost* · Huras Kubrow *Stalk* · Itzal *Penumbra* · *Untraceable* · pasiva de Skiajati · arcano *Trickery* · Void Mode

**Mutalist Quanta's Orbs** · `User/Ally` — los disparos que atraviesan los orbes infestados ganan Electricity, crit chance y crit damage; el bonus escala con los stacks del orbe

**Swarm Mutalist MOA's Swarm Clouds** · `Enemy` — las nubes dan a los infestados aliados un buff de Ferrite Armor que escala con el nivel del enemigo

**Toxic Ancient Aura** · `Enemy` — da Toxin a los infestados cercanos · 100% de reducción a Toxin y 80% a Gas

**Volt's Electric Shield** · `User/Ally` — los disparos que lo atraviesan ganan **+50% Electricity aditivo** y su daño crítico **×200%**. El bonus de Electricity stackea con la cantidad de escudos; el de crítico **no**.

---

# Debuffs

## Crowd Control

> Raw: `buff-debuff-debuffs-cc.wikitext` — ver [`crowd-control.md`](crowd-control.md)

**Blinded** · `Enemy` — aturdido con humo saliendo de los ojos; **habilita finishers**.
Excalibur *Radial Blind* · pasiva de Gara · Inaros *Desiccation* · Mesa *Muzzle Flash* · Mirage *Sleight of Hand* y *Prism* · Oberon *Reckoning* · Revenant *Blinding Reave* · Wisp *Breach Surge* (no habilita finishers) · *Out Of Sight* · slide attack de Exalted Blade · pasiva de Vaykor Sydon · portar el Narmer Veil del Narmer Deacon en Archon Hunt

**Blinded** · `Player` — el HUD se blanquea. Denial Bursa (flash beams)

**Confusion** · `Enemy` — ataca indiscriminadamente a aliados y enemigos. Nyx *Chaos* · proc de Radiation

**Converted** · `Enemy` — cambia de bando; **no** garantiza inmunidad al fuego amigo. Nyx *Mind Control* · Revenant *Enthrall* · Xaku *The Lost* (Accuse)

**Disarmed** · `Enemy` — pierde **permanentemente** el arma equipada. Baruuk *Desolate Hands* y *Serene Storm* · Khora *Venari* (Protect) · Loki *Radial Disarm* · Mag *Magnetized Discharge* · Titania *Spellbind* · Xaku *Grasp of Lohk* · Halikar (Wraith) lanzado · *Disarming Purity* (Panthera) · Chesa Kubrow *Neutralize* · *Repo Audit* (hounds) · Zenurik *Disarming Sling*

**Disarmed** · `Player` — el arma cae al suelo con waypoint amarillo y se puede recuperar; **no se pierde** al terminar la misión. Drahk Masters grineer

**Jammed** · `Enemy` — sus armas se traban. Mag *Counter Pulse* · Mesa *Shooting Gallery*

**Knockdown** · `Enemy` — cae de espaldas; **habilita finishers de suelo**. Atlas *Titanic Rumbler* · Banshee *Sonic Boom* · Excalibur *Slash Dash* · Gauss *Mach Rush* · Garuda *Dread Mirror* · Gyre *Coil Horizon* (rodando) · Hydroid *Tempest Barrage* · Khora *Venari* (Protect) · Limbo *Banish* · Mag *Magnetize* · Nezha *Divine Spears* · pasiva de Nova, *Neutron Star* y *Molecular Prime* · Oberon *Smite* y *Reckoning* · pasivas de Revenant y Rhino · Zephyr *Tail Wind* (dive bomb) · *Heavy Impact* · Sunika Kubrow *Savagery* · Lambeo Moa *Shockwave Actuators* · arcano *Eruption* · saltar y deslizarse contra un enemigo · **hard landings** (ver [`maneuvers.md`](maneuvers.md)) · ataques aéreos de Cobra & Crane · Archgun Deployer

**Knockdown** · `Player` — por unidad enemiga; el raw trae la lista por facción (Grineer, Corpus, Infested y Conculyst)

**Paralyzed, Disabled, Stuck** · `Enemy` — Atlas *Path of Statues*, *Petrify* y el cast inicial de *Rumblers* · pasiva de Frost, *Freeze* directo, *Snow Globe* al activarse, *Chilling Globe* y *Avalanche* · Gara *Mass Vitrify* (expansión) · Garuda *Blood Altar* · Harrow *Condemn* · Hildryn *Aegis Storm* · Inaros *Scarab Swarm* · Khora *Ensnare* · Limbo *Stasis* · Mag *Fracturing Crush* · Nidus *Parasitic Link* · Rhino *Rhino Stomp* · Vauban *Bastille* · Volt *Discharge* · Wukong *Celestial Stomp* · Xaku *The Lost* (Gaze) · Sahasa Kubrow *Ferocity* · Sunika Kubrow *Savagery* y *Unleashed* · arcano *Exodia Epidemic* · Vitrica (glassing)

**Paralyzed, Disabled** · `Player` — Manic · Nauseous Crawler · el slam del Void Angel (además expulsa al operador del warframe)

**Ragdolled** · `Enemy` — ver [`ragdoll.wikitext`](ragdoll.wikitext). Atlas *Landslide* (cada tercer golpe) y *Tectonics* · Banshee *Sonic Boom* · Gauss *Mach Rush* y *Redline* · Gyre *Coil Horizon* detonado · Hydroid *Tidal Surge* · Khora *Whipclaw* · Mag *Pull* · Nekros *Soul Punch* · Rhino *Rhino Charge* · Valkyr *Rip Line* · Vauban *Minelayer* (Tether) · Yareli *Riptide* · Zephyr *Airburst* · Wyrm *Crowd Dispersion* · alt fire de Harpak y Paracyst · Sonicor · ataque cargado de Kestrel · **cualquier ground slam de melee** · Void Sling · Vazarin *Void Snare*

**Sleep** · `Enemy` — de pie y sin actuar. Baruuk *Lull* · Equinox *Rest & Rage* (Rest) · Ivara *Quiver* (Sleep) · set Aero · golpes normales de Cobra & Crane si la porta Baruuk · arcano *Magus Lockdown*

**Slowed** · `Enemy` — Chroma *Spectral Scream*, *Elemental Ward* y *Effigy* (Cold) · Equinox *Peaceful Provocation* · Frost *Freeze*, *Ice Wave*, *Ice Wave Impedance* y *Snow Globe* · Nekros *Creeping Terrify* · Nova *Molecular Prime* · Sevagoth *Gloom* · Titania *Tribute* (Entangle) · Valkyr *Warcry* · Xaku *The Vast Untime* · proc de Cold · *Coolant Leak* · *Endoparasitic Vector* · Artax.
**Cuentan como *time disruption*, que el Overguard no previene:** Rhino *Rhino Stomp* · Zenurik *Temporal Drag*

**Slowed** · `Player` — Ghouls al morir (nubes que procan Cold) · enemigos con Glaxion · orbes de energía del Denial Bursa · Scyto Raknoid · el alquitrán del Tar Mutalist MOA · Maggot · proc de Cold · Hobbled Dragon Key

**Stagger** · `Enemy` — ver [`stagger.wikitext`](stagger.wikitext). Ash *Smoke Screen* · Banshee *Sound Quake* · Chroma *Elemental Ward* (Electric) y *Effigy* · Equinox *Mend & Maim* (Maim) · Excalibur *Radial Javelin* · Garuda *Dread Mirror*, *Blood Altar* y *Seeking Talons* · Gauss *Kinetic Plating* con *Redline* · Hildryn *Haven* · Loki *Decoy* (al disparar), *Switch Teleport* y *Radial Disarm* · Mesa *Staggering Shield* · Nezha *Warding Halo* · Nidus *Virulence* · Nyx *Pacifying Bolts* y *Chaos* · Octavia *Resonator* · Revenant *Mesmer Skin* · Rhino *Piercing Roar* · Saryn *Miasma* · Trinity *Energy Vampire* · Vauban *Tesla Nervos* · Volt *Shock* y *Shocking Speed* · Wisp *Reservoirs* (Shock mote) · Xaku *The Lost* (Accuse) · Yareli *Aquablades* · *Acidic Spittle* · *Live Wire* · *Pounce* · Opticor (Vandal) · **procs de Electricity e Impact**

**Stagger** · `Player` — Commander · Roller · parries de Bailiff y Guardsman · Volatile Runner · Kyta Raknoid · romper Reinforced Glass en tilesets Corpus

**Stun** · `Enemy` — **habilita finishers frontales y traseros**. Ash *Teleport* · Banshee *Silence* · Valkyr *Paralysis* · Wukong *Cloud Walker* · *Paralytic Spores* · *Retribution* · ataque cargado de Caustacyst · ataque aéreo de Sigma & Octantis · proyectiles de Tatsu · explosión del dardo de Zakti · ataques cargados de cualquier Sparring · Naramon *Sling Stun* · efecto Justice de Steel Meridian

**Suspended, Incapacitated** · `Enemy` — ragdoll extendido en el aire o bajo el agua, sin poder moverse. Hydroid *Undertow* y *Tentacle Swarm* · Inaros *Sandstorm* · Khora *Strangledome* · Mag *Crush* · Nidus *Larva* · Titania *Spellbind* y *Lantern* · Trinity *Well of Life* · Vauban *Bastille* · Zephyr *Tornado* · slide attack de Desert Wind · ataque cargado de Orvius

**Taunt/Attracted** · `Enemy` — la atención se desvía hacia el objetivo con mayor Threat Level. Atlas *Titanic Rumbler* · Gara *Spectrorage* · Khora *Strangledome* · Loki *Decoy* · Mirage *Hall of Mirrors* · Nekros *Shadows of the Dead* · Nidus *Ravenous* · Nyx *Chaos* y *Absorb* · Octavia *Mallet* · Saryn *Molt* · Titania *Razorwing* · Wukong *Defy* · *Guardian Derision*.
**Detiene su acción y camina hacia un punto:** Ivara *Quiver* (Noise, con enemigos no alertados) · Titania *Lantern* · Djinn *Fatal Attraction*

**Terrified** · `Enemy` — huye del caster. Nekros *Terrify* · Raksa Kubrow *Howl*

## Curse

> Raw: `buff-debuff-debuffs-curse.wikitext` — *"efecto negativo temporal o permanente que merma capacidades ofensivas o defensivas"*

**Armor Reduction** · `Enemy` — ver [`armor.md`](armor.md). Ash *Seeking Shuriken* · Banshee *Sonic Fracture* · Ember *Fire Blast* · Frost *Avalanche* · Gauss *Thermal Sunder* con *Redline* · Hildryn *Pillage* · Hydroid *Corroding Barrage* (vía procs de Corrosive) · Mag *Polarize* y *Fracturing Crush* · Nekros *Terrify* · Nyx *Psychic Bolts* · Oberon *Reckoning* · Saryn *Spores* (indirecto) · Trinity *Abating Link* · Vauban *Bastille* · Wisp *Sol Gate* con Haste mote (vía Corrosive) · Xaku *The Lost* (Gaze) · *Amalgam Argonak Metal Auger* · *Sharpened Claws* · *Shattering Impact* · Unairu *Caustic Strike* · **procs de Corrosive y Heat**

**Armor Reduction** · `Player` — auras de Denial y Drover Bursa · procs de Corrosive y Heat

**Damage Vulnerability** · `Enemy` — Atlas *Petrify* · Banshee *Sonar* (sólo en las zonas marcadas) · Equinox *Rest & Rage* (Rage) · Gara *Splinter Storm* y *Mass Vitrify* · Khora *Strangledome* · Nezha *Blazing Chakram* · Nova *Molecular Prime* · Titania *Beguiling Lantern* (melee) · Wisp *Breach Surge* · Xaku *The Vast Untime* (sólo daño Void) · arcanos *Magus Accelerant* (Heat) y *Magus Destruct* (Puncture) · *Crescent Charge* (con Lifted) · *Detect Vulnerability*

**Deafened** · `Enemy` — no oye disparos, alarmas ni gritos de muerte. Banshee *Silence*

**Disrupted** · `Player` — el HUD se distorsiona. Sensor Bar · Scrambus · Comba · Ancient Disruptor · tocar agua de noche en Plains of Eidolon · Energy Leech Eximus · proc de Magnetic

**Energy Drain** · `Player` — Ancient Disruptor · Energy Leech Eximus · proc de Magnetic

**Financial Stress** · `User` — al recoger Index Points en The Index: reduce shields y health máximos y drena energía constantemente

**Inaccuracy** · `Enemy` — ver [`accuracy.md`](accuracy.md). Mirage *Eclipse* (en sombra) · pasiva de Nyx · Titania *Tribute* (Dust) y *Razorwing* (llamado evasion) · *Agility Drift* (llamado evasion) · *EMP Aura* · procs de Blast

**Nullified/Disabled** · `Player` — desactiva las habilidades activas e impide castear. Necramech · Nullifier Crewman · Nullifier Target · Comba · Scrambus · Terra Shield Osprey (Orb Vallis nivel 3+) · cruzar la puerta de Cetus o el ascensor de Fortuna · castear demasiado seguido en Elite Sanctuary Onslaught

**Resurgence Burden** · `User` — Resurgence Tokens en Arbitrations; funciona como los Index Points

**Shield Reduction** · `Enemy` — reduce los shields máximos. Xaku *The Lost* (Gaze)

**Transference Static** · `User` — al morir el operador: vacía los shields del warframe y reduce su health máxima durante **45 s**. Stackea hasta 4 veces: −20%, −50%, −80% y la cuarta causa bleedout directo

**Weakened** · `Player` — hace menos daño. Proc de Puncture · Extinguished Dragon Key

**Weakened** · `Enemy` — Equinox *Pacify & Provoke* (Pacify) · Oberon *Smite* · Rhino *Piercing Roar* · Lambeo Moa *Stasis Field* · proc de Puncture

## Misc

> Raw: `buff-debuff-debuffs-misc.wikitext` — la columna de esta página se titula `Type`, no `Target`

**Dispel** · `Player` — desactiva las habilidades activas. Zanuka · Stalker (y Shadow Stalker)

**Disarmed** · `Enemy` — pierde las armas de fuego y pasa a melee. Baruuk *Desolate Hands* · Khora *Venari* (Protect) · Loki *Radial Disarm* · Mag *Magnetized Discharge* · Titania *Spellbind* · Xaku *Grasp of Lohk* · Chesa Kubrow *Neutralize* · Dorma Hound *Repo Audit* · ataques de Desert Wind · ataque cargado de Halikar · *Disarming Purity* · Zenurik *Disarming Sling* · hacer Void Sling a través de Kuva Guardians

**Disarmed** · `Player` — pierde el arma en mano y debe cambiar a otra. Drahk Master

**Eximus Aura** · `Enemy` — Arctic Eximus: aura de Cold que aplica el status a **15 m**, ralentizando movimiento y velocidad de ataque. Venomous Eximus: aura de Toxin en **3-4 m** que inflige un status de Toxin de **8 s** con daño en el tiempo. Bajo *Mind Control* o con specters de sindicato, el debuff cae sobre los enemigos del Tenno.

**Reset Sentient Resistances** · `Sentient Enemy` — Excalibur Umbra *Radial Howl* · Xaku *Xata's Whisper* y *The Lost* (Deny) · amps · Paracesis a rango 40 · Shedu · Void Beam

**Status Effects** · `Enemy` — ver [`status-effects.md`](status-effects.md)

---

# Icons

> Raw: `buff-debuff-icons.wikitext` — *"lista completa de los íconos de buff y debuff del juego"*, mantenida por la comunidad

Qué efectos se muestran con ícono junto a health y shields —azul para buffs, rojo para debuffs— y se
pueden revisar en el menú de pausa. **Varias fuentes comparten el mismo ícono.** Los tipos que usa esta
tabla son propios: `Buff`, `Debuff`, `Status Debuff / Buff`, `Ability Buff`, `Passive Buff`,
`External Buff`.

**Los diez tipos de daño con ícono compartido** —Blast, Cold, Corrosive, Electricity, Heat, Impact,
Magnetic, Puncture, Radiation, Slash, Toxin, Viral— aparecen como `Status Debuff / Buff` con target
`Target / User`: el mismo ícono sirve para el proc sobre el objetivo y para la resistencia que
*Adaptation* concede al usuario. Tau y Gas figuran sólo como buff de resistencia.

Ejes con ícono propio, más allá de los tipos de daño:

| Ícono | Tipo | Target | Fuentes |
|---|---|---|---|
| Ability Strength | Buff | `User` | *Growing Power* · *Power Drain* |
| Accuracy | Buff | `User` | *Guided Ordnance* · *Targeting Subsystem* |
| Affinity Range | Buff | `Squad` | gear Fosfor |
| Arcane | Buff | `User` | cualquier arcano equipado al cumplirse su condición |
| Armor | Buff | `User/Ally` | Oberon *Renewal* sobre *Hallowed Ground* · *Mecha Pulse* |
| Berserker | Buff | `User` | *Berserker Fury* |
| Bleeding / Decaying / Extinguished / Hobbled Key | Debuff | `User` | llevar la Dragon Key correspondiente |
| Bullet Jump | Buff | `User` | *Proton Pulse* · *Hit And Run* |
| Cooldown | Debuff | `User` | cooldown del pasivo Stormpath de Telos Boltace |
| Corruption | Buff | `User` | juntar 10 Reactant en Void Fissure |
| Critical Hit Chance | Buff | `User` | *Argon Scope* · *Blood Rush* · *Cat's Eye* · *Hydraulic Crosshairs* · set Gladiator · *Virtuos Shadow* |
| Critical Damage Multiplier | Buff | `User` | *Bladed Rounds* · *Sharpened Bullets* · *Tek Collateral* · *Virtuos Strike* · headshots con Knell · pasivo Soul Swarm de Tatsu |
| Damage | Buff | `User` | *Deadly Efficiency* · *Proton Snap* · *Vigorous Swap* · *Virtuos Fury* · Octavia *Metronome* (Forte) |
| Damage Reduction | Buff | `User` | set Proton |
| Elemental Ward | Ability Buff | `User/Ally` | Chroma *Elemental Ward* |
| Financial Stress | Debuff | `User` | Index Points |
| Fireball Frenzy | Ability Buff | `Ally` | augment de Ember |
| Furious Javelin | Ability Buff | `User` | augment de Excalibur |
| Fury / Scorn | Ability Buff | `User` | Chroma *Vex Armor* |
| Health Conversion | Buff | `User` | *Health Conversion* |
| Impair | Status Debuff | `Target` | proc de Impair (**sólo Conclave**) |
| Inspiration | Passive Buff | `User/Ally` | pasiva de Octavia |
| Invigorated | Buff | `User` | críticos con Hirudo |
| Ironclad Charge | Ability Buff | `User` | augment de Rhino |
| Metamorphosis | Ability Buff | `User` | Equinox *Metamorphosis* y *Duality* |
| Movement Speed | Buff | `User` | *Dispatch Overdrive* · *Magus Cadence* |
| Range | Buff | `User` | *Spring-Loaded Blade* · kills con Arca Titron |
| Ravenous | Buff | `User/Ally` | Nidus *Ravenous* |
| Roar | Ability Buff | `User/Ally` | Rhino *Roar* |
| Rolling Guard | Debuff | `User` | su cooldown |
| Shield of Shadows | Ability Buff | `User` | augment de Nekros |
| Shock Trooper | Ability Buff | `Ally` | augment de Volt |
| Smoke Shadow | Ability Buff | `Ally` | augment de Ash |
| **Speed** | Ability Buff | `User/Ally` | **Volt *Speed*** |
| Status Chance | Buff | `User` | *Catalyzer Link* · *Embedded Catalyzer* · *Nano-Applicator* · *Proton Jet* · *Weeping Wounds* · *Virtuos Ghost* · dañar enemigos con Arca Scisco |
| Tenno Affinity | External Buff | `Any Warframe` | compañeros de escuadra cercanos |
| Unairu Wisp | Buff | `User/Ally` | way activo de Unairu |
| Upsurge | External Buff | `User/Ally` | pasiva de Titania |

**Íconos sin nombre**, compartidos por buffs no relacionados: *Laser Sight* + *Odomedic* · *Energy
Conversion* + *Motus Setup* + *Narrow Barrel* · pasivas de Dual Toxocyst y Lesion.
