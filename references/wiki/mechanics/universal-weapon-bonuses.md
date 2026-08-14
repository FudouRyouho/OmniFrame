# Universal Weapon Bonuses

> Estado: activo
> Rol: qué buffs alcanzan a "casi toda arma" y a qué habilidades, la clase **Weapon Damage Ability**, y la tabla de habilidades afectadas con sus stats de emisión
> Fuente de verdad de: la partición arma ↔ habilidad-tratada-como-arma ↔ habilidad normal ↔ exalted; qué bonus universal existe por categoría; base damage / tipos / status chance / crit de las habilidades elegibles
> No usar para: fórmulas de daño (→ `damage-calculation.md`) · combinación elemental (→ `damage-types.md` en `docs/semantic/`) · Ability Strength, que es un stat separado
> Última actualización: 2026-08-14
> Fuente: https://wiki.warframe.com/w/Universal_Weapon_Bonuses
> Fuente actualizada: 2026-08-11
> Raw: universal-weapon-bonuses.wikitext · ability-damage.wikitext

## Qué son

Bonus que aplican a una **variedad amplia** de armas en vez de a una categoría: casi todas las
ranged (primary + secondary), algunos proyectiles de melee, **y una pequeña selección de habilidades
de Warframe** — normalmente las basadas en proyectiles.

> *"These affected abilities are often referred to as **"Weapon Damage Abilities"**, as the game
> treats them like weapons for the purposes of which buffs they are eligible for."*

`Ability_Damage` lo dice sin metáfora: *"a related mechanic that applies to some Warframe Abilities
**coded as "weapons"**"*.

⚠️ Discrepancia → la fuente se contradice consigo misma sobre el criterio: el texto dice *"usually
ones that are **projectile-based**"*, pero su propia tabla lista campos persistentes (Warding Halo,
el círculo de fuego de Uriel, Sun Portal). La elegibilidad está **enumerada, no derivada** — la
naturaleza de proyectil no alcanza para decidirla.

## Ability Damage ⊥ Ability Strength

Son dos stats distintos, y la fuente lo aclara de entrada: *"Not to be confused with Ability Strength
which is a separate stat."* Ability Damage es un **upgrade** que incrementa el daño ya computado.

### Fuentes de Ability Damage

| Fuente | Valor | Condición |
|---|---|---|
| Emerald Archon Shard | +10% | enemigo con status `Corrosive` |
| Tauforged Emerald | +15% | ídem |
| Topaz Archon Shard | +10% | enemigo con status `Radiation` |
| Tauforged Topaz | +15% | ídem |
| Violet Archon Shard | +10% | enemigo con status `Electricity` |
| Tauforged Violet | +15% | ídem |
| Shattering Frost (Decree) | +80/160/240% | enemigo con status `Cold` |
| Roar | 10/15/25/50% | *"bonus damage to all weapons and abilities"* |

- **Ningún shard tipa el daño emitido.** Todos condicionan por el **status del receptor**.
- Shattering Frost es **aditivo** a los bonus estilo Condition Overload.
- Los shards **no funcionan sobre Exalted Weapons**.

### Resistencia

Ancient Disruptor — 90% de resistencia a daño de habilidad, y −75% de duración a las habilidades
que lo afectan.

## Fuentes de bonus universal, por categoría

**Damage** (base) — Arcane Arachne 150% (no con melee "normal"), Holster Amp 60%/escuadra,
Provoked 110%, Vigorous Swap 165%, Lethal Levitation hasta 200%, Toxin Elemental Ward 35%,
Vex Armor 275%, Metamorphosis Day 25% (decae), Deathbringer 100%, Rift Torrent 30%/enemigo,
Shooting Gallery 25%, Absorb hasta 400%, Amp 25–200%.

**Punch Through** — Seek 10m, pasiva de Qorvex 3m.

**Critical Chance** — las habilidades afectadas suelen tener **0% de crit base**, así que sólo las
alcanzan las fuentes *absolutas*.

| Sub-eje | Fuentes |
|---|---|
| Absoluta | Arcane Avenger 45% · Charm (Smeeta) 200% · Covenant hasta 50% (200% en headshot) |
| Modded | Arcane Hot Shot hasta 300% · Biting Frost 200% |
| Weakpoint | Worthy Comradery 75%/escuadra · pasiva de Cyte-09 hasta 300% |

Cat's Eye (Adarza) **no** funciona. Arcane Hot Shot no aplica a Breach Surge, sí a Flechette Orb.

**Critical Damage** — Absoluta: Arcane Crepuscular +3.0x, Tenacious Bond +1.2x (no en Breach Surge).
Modded: Tek Collateral 100%, Grave Spirit 50%, Biting Frost 200%, Empowered Quiver 100%.
El crit damage absoluto universal **no aplica a ninguna habilidad de Gyre**.

**Elemental Damage** — la mayoría de los augments elementales (p. ej. Fireball Frenzy) **no** aplican
ni a exalted ni a las habilidades de esta página. Sí aplican:

| Elemento | Fuente | Valor |
|---|---|---|
| cualquiera | Valence Formation (Lavos) | 200% |
| Viral | Nourish (Grendel) | 75% (45% subsumido) |
| Corrosive | Plunder (Hydroid) | hasta 200% |

Valence Formation también sube el DoT 200% del elemento elegido, *"due to how elemental damage
increases DoT damage"* — y ese incremento aplica a cualquier fuente de aplicación de status.

**Status Chance** — sólo funciona sobre habilidades **con status chance real**; los procs
garantizados **no** se incrementan. Prismatic Gem 100%, Vazarin Initiative 25%/orden.

**Status Duration** — pasiva de Ash 50% (sólo Slash), Prismatic Gem 100%, pasiva de Lavos 100%,
pasiva de Saryn 25%, Harmonic Resonance 30%.

**Faction Damage Bonus** — multiplicador total que **aplica dos veces al daño de status** y stackea
aditivamente con los mods de facción. Roar 50% (30% subsumido) — *"applies to all ability damage,
even outside of ones that can receive Universal bonuses"*. True Master's Font 25%.

**Damage Multipliers** — multiplicativos entre sí y contra los bonus de daño base: pasiva de Garuda
hasta 100%, Eclipse 200% (30% subsumido), Parasitic Link 25%, pasiva de Vauban 25%, Overdriver 25%,
Navigator 5x.

**Extra Hits** — los decrees Cloak and Dagger y Critical Frost aplican extra hits **incluso a
habilidades normalmente no afectadas** por estos bonus.

## Habilidades afectadas

Base damage, tipos, status y crit tal como la fuente los publica.

| Warframe | Habilidad | Base | Tipo(s) | SC | Status garantizado | CC | CM |
|---|---|---|---|---|---|---|---|
| Ash | Shuriken | 750 | Slash | 10% | 1 Slash | 0% | 1.0x |
| Baruuk | Desolate Hands | 250 | Blast | 0% | — | N/A | — |
| Chroma | Spectral Scream | 400/s | Heat, Cold, Electricity o Toxin | 0% | 1/s (elemento elegido) | N/A | — |
| Chroma | Afterburn | 0–500 | Heat, Cold, Electricity o Toxin | 0% | — | 0% | 1.0x |
| Ember | Fireball (directo) | 800–5200 | Heat | 0% | — | N/A | — |
| Ember | Fireball (AoE) | 300–1950 | Heat | 100% | — | N/A | — |
| Excalibur | Radial Javelin | 1000 | I/P/S en partes iguales | 10% | 1 Slash | 0% | 1.0x |
| Garuda | Dread Mirror (explosión) | 100% del daño guardado | Impact | 100% | — | 0% | 1.0x |
| Garuda | Seeking Talons (contacto) | 300 | Slash | 100% | — | 0% | 1.0x |
| Gauss | Redline (bolts) | 400 | 81.25% Impact + 18.75% Puncture | 25% | — | 0% | 1.0x |
| Koumei | Kumihimo (hilos) | 25 × tirada | I/P/S en partes iguales | 0% | 1 (elemento primario o secundario al azar) | N/A | — |
| Mag | Polarize (fragmentos) | 50 + 25% de shields/armor drenados | Puncture + Slash | 100% | — | 0% | 1.0x |
| Nekros | Soul Punch (directo) | 50 | Impact | ~10% | — | 0% | 1.0x |
| Nekros | Soul Punch (AoE) | 200 | Impact | ~10% | — | 0% | 1.0x |
| Nezha | Warding Halo | 125/s | Slash | 0% | — | N/A | — |
| Nokko | Sporespring | 2500 (3m AoE, exponencial por rebote) | Toxin | 0% | 1 Toxin | 75% | 2.0x |
| Nova | Null Star | 300 | Blast | 100% | — | 0% | 1.0x |
| Nova | Neutron Star | 240 | Heat | 0% | 1 Heat | 0% | 1.0x |
| Oraxia | Widow's Brood (dardos) | 750 | Toxin | 0% | 4 Toxin | 0% | 1.0x |
| Revenant | Enthrall (proyectiles) | 1000 | Impact | 50% | — | 5% | 1.5x |
| Sirius | Jade Stars | 500 | Heat | 100% | — | 0% | 1.0x |
| Styanax | Axios Javelin (directo) | 1250 | Puncture | 10% | — | 0% | 1.0x |
| Styanax | Final Stand (directo) | 1500 | Slash | 50% | — | N/A | — |
| Styanax | Final Stand (AoE) | 1500 | Blast | 0% | 1 Slash | N/A | — |
| Temple | Pyrotechnics | 1000 | I/P/S en partes iguales | 0% | 1 Heat | N/A | — |
| Uriel | Gulphagor (círculo de fuego) | 200/0.5s | Heat | 500% | — | N/A | — |
| Vauban | Orbe (directo, las 4 habilidades) | 15 | Blast | 10% | — | 0% | 1.0x |
| Vauban | Tether-Flechette Orb | 300 × escala de nivel | Puncture | 5% | 1 Puncture | 50% | 2.0x |
| Voruna | Ulfrun's Descent | 5000 | Slash | 0% | Slash + Knockdown | 20% | 1.5x |
| Wisp | Breach Surge (chispas) | 2.0x el daño del hit que lo dispara | Radiation | 20% | — | 100% | 1.5x |
| Wisp | Cataclysmic Gate (Sun Portal) | 500/0.5s | I/P/S en partes iguales | 0% | 1 Heat + 1 Radiation + 1 Corrosive (con Haste Mote) | N/A | — |
| Zephyr | Airburst (directo) | 500 (+35%/enemigo) | 18.75% Impact, 12.75% Puncture, 67.5% Slash | 50% | — | 0% | 1.0x |

Las que llevan el ícono de Ability Strength en la fuente escalan con ese stat; el `.wikitext` marca
cuáles con `{{Stat|Ability Strength}}`.

### Casos que rompen la regla general

- **Spectral Scream** — no recibe bonus elementales (Nourish), **sí** bonus de daño base
  (Arcane Arachne, Vex Armor) y multiplicadores (Eclipse). Afterburn, en la misma habilidad, **sí**
  recibe los elementales.
- **Jade Stars** — al revés: **sí** elementales y crit plano, **no** Arcane Arachne ni Eclipse.
- **Sporespring** y **Ulfrun's Descent** — sólo Arcane Crepuscular, ningún otro bonus.
- **Soul Punch** — no escala con Ability Strength, pero duplica su daño por cada enemigo atravesado.
- **Axios Javelin** — sólo el impacto directo recibe los bonus, no el AoE.
- **Cataclysmic Gate** — sólo el daño por medio segundo, no los 5000 iniciales. La carta declara
  Heat y la habilidad hace IPS (**bug** según la fuente).
- **Prismatic Gem** — la habilidad gana status chance como un arma pero **no** dispara los ataques
  de haz prismático que un arma sí dispararía.

### Notas de la fuente

- Crit `N/A` = **incapaz de critear**, ni siquiera con crit plano. Crit `0%` = necesita una fuente
  plana para poder critear.
- Con status chance > 0%, una habilidad afectada **puede aplicar elementos añadidos** por buffs
  elementales (Valence Formation, Nourish, Plunder), y el elemento añadido **compite** con el
  elemento base por cuál proquea.
- Los procs **garantizados** no se pueden cambiar con esos buffs elementales.
