# Module:DamageTypes/data — Documentación extraída

> Fuente: `https://wiki.warframe.com/w/Module:DamageTypes/data?action=raw`
> Extraído: 2026-03-20
> Archivo raw: `damage-types-data.lua`
> Raw: damage-types-data.lua

---

## Estructura del módulo

```
DamageTypes = {
  Health   = { [nombre] = { Type, Faction, Positives, Negatives, Bypass, InternalName, ... } }
  Types    = { [nombre] = { InternalName, Positives, Negatives, Bypass, Status, Types, ... } }
  Procs    = { [nombre] = { InternalName, Status, Icon, ... } }
  Notes    = { [n] = "texto" }
  dictionary = { FactionOrder, Factions, Health, Types }
  total    = { [nombre] = { [otro] = ±valor } }  -- calculado en runtime
}
```

---

## Types — Tipos de daño

Tipos de daño que pueden aplicar armas y habilidades. Campos relevantes:
- `InternalName` — nombre interno del juego (ej. `DT_FIRE`)
- `Positives` — health/shield types contra los que hace +daño
- `Negatives` — health/shield types contra los que hace -daño
- `Bypass` — health/shield types que ignora (pasa directo)
- `Status` — efecto del proc
- `Types` — combinación de elementos base que lo genera (para combinados)

| Nombre | InternalName | Proc | Combinación | Positivos | Negativos | Bypass |
|---|---|---|---|---|---|---|
| Impact | DT_IMPACT | PT_KNOCKBACK | — | Grineer, Kuva Grineer, Scaldra, Anarchs | Tenno Shield | — |
| Puncture | DT_PUNCTURE | PT_FRAILTY | — | Corpus, Orokin | Tenno Shield | — |
| Slash | DT_SLASH | PT_BLEEDING | — | Infested, Narmer | Tenno Shield | — |
| Cold | DT_FREEZE | PT_CHILLED | — | Sentient | Tenno Shield, Techrot | — |
| Electricity | DT_ELECTRICITY | PT_ELECTROCUTION | — | Corpus Amalgam, The Murmur, Anarchs | Tenno Shield | — |
| Heat | DT_FIRE | PT_IMMOLATION | — | Infested | Kuva Grineer, Tenno Shield | — |
| Toxin | DT_POISON | PT_POISONED | — | Narmer | Tenno Shield | Tenno Shield |
| Blast | DT_EXPLOSION | — | Heat + Cold | Infested Deimos | Corpus Amalgam, Tenno Shield | — |
| Corrosive | DT_CORROSIVE | PT_CAUSTIC_BURN | Electricity + Toxin | Grineer, Kuva Grineer, Scaldra | Sentient, Tenno Shield | — |
| Gas | DT_GAS | PT_ASPHYXIATION | Heat + Toxin | Infested Deimos, Techrot | Tenno Shield, Scaldra | — |
| Magnetic | DT_MAGNETIC | PT_MAGNETIZED | Cold + Electricity | Corpus, Corpus Amalgam, Techrot | Narmer, Tenno Shield | — |
| Radiation | DT_RADIATION | PT_RAD_TOX | Heat + Electricity | Sentient, The Murmur | Orokin, Tenno Shield, Anarchs | — |
| Viral | DT_VIRAL | PT_INFECTED | Cold + Toxin | Orokin | Infested Deimos, Tenno Shield, The Murmur | — |
| Void | DT_RADIANT | PT_RADIANT | — | Overguard, Zariman | Tenno Shield | — |
| Tau | PT_SENTIENT | — | — | — | Tenno Shield | — |
| True | DT_FINISHER | — | — | — | — | Tenno Armor |
| Cinematic | DT_CINEMATIC | — | — | — | — | Tenno Armor |
| Energy Drain | DT_ENERGY_DRAIN | — | — | — | — | — |
| Shield Drain | DT_SHIELD_DRAIN | — | — | — | — | — |
| Finisher | — | — | — | — | — | — |

---

## Health — Tipos de salud/escudo/armadura

Tipos de "cuerpo" de los enemigos. Cada tipo tiene sus propias vulnerabilidades.

### Tipos activos (U36+)

Desde Update 36, el sistema de daño fue revisado. Los tipos de facción son ahora genéricos:

| Nombre | InternalName | Type | Faction |
|---|---|---|---|
| Corpus | RK_CORPUS_FACTION | Health | Corpus |
| Corpus Amalgam | RK_CORPUS_AMALGAM_FACTION | Health | Corpus Amalgam |
| Grineer | RK_GRINEER_FACTION | Health | Grineer |
| Infested | RK_INFESTED_FACTION | Health | Infested |
| Infested Deimos | RK_INFESTED_DEIMOS_FACTION | Health | Infested Deimos |
| Kuva Grineer | RK_GRINEER_KUVA_FACTION | Health | Kuva Grineer |
| Narmer | RK_NARMER_FACTION | Health | Narmer |
| Scaldra | RK_SCALDRA_FACTION | Health | Scaldra |
| Techrot | RK_TECHROT_FACTION | Health | Techrot |
| The Murmur | RK_MURMUR_FACTION | Health | The Murmur |
| Anarchs | RK_ANARCHS_FACTION | Health | Anarchs |
| Sentient | RK_SENTIENT_FACTION | Health | Sentient |
| Orokin | RK_OROKIN_FACTION | Health | Orokin |
| Overguard | RK_OVERGUARD | Shield | — |
| Tenno Flesh | RK_TENNO_FLESH | Health | Tenno |
| Tenno Shield | RK_TENNO_SHIELD | Shield | Tenno |

### Tipos deprecados (pre-U36, Damage 2.0)

Mantenidos en el módulo para compatibilidad con templates de la wiki.

| Nombre | InternalName | Type | Faction | Positivos | Negativos |
|---|---|---|---|---|---|
| Cloned Flesh | RK_CLONED_FLESH | Health | Grineer | Viral +75, Heat +25, Slash +25 | Gas -50, Impact -25 |
| Ferrite Armor | RK_ARMOR | Armor | Grineer | Corrosive +75, Puncture +50 | Blast -25, Slash -15 |
| Alloy Armor | RK_HULKING_ARMOR | Armor | Grineer | Radiation +75, Cold +25, Puncture +15 | Electricity -50, Magnetic -50 |
| Machinery | RK_MACHINERY | Health | Grineer | Blast +75, Electricity +50, Impact +25 | Viral -25, Toxin -25 |
| Flesh | RK_FLESH | Health | Corpus | Viral +50, Toxin +50, Slash +25 | Gas -25, Impact -25 |
| Shield | RK_SHIELD | Shield | Corpus | Magnetic +75, Cold +50, Impact +50 | Puncture -20 |
| Proto Shield | RK_HEAVY_SHIELD | Shield | Corpus | Magnetic +75, Toxin +25, Impact +15 | Corrosive -50, Heat -50, Puncture -50 |
| Robotic | RK_ROBOTIC | Health | Corpus | Radiation +25, Electricity +50, Puncture +25 | Toxin -25, Slash -25 |
| Fossilized | RK_FOSSILIZED | Health | Infested | Corrosive +75, Blast +50, Slash +15 | Radiation -75, Toxin -50, Cold -25 |
| Infested Flesh | RK_INFESTED_FLESH | Health | Infested | Gas +50, Heat +50, Slash +50 | Cold -50 |
| Infested Sinew | RK_INFESTED_ARMOUR | Armor | Infested | Radiation +50, Cold +25, Puncture +25 | Blast -50 |
| Infested (D2.0) | RK_INFESTED | Health | Infested | Gas +75, Heat +25, Slash +25 | Radiation -50, Viral -50 |
| Indifferent Facade | — | Health | The Murmur | Radiation +75, Void +25, Electricity +25, Puncture +25 | Viral -50, Slash -50 |

---

## Procs — Status Effects

Efectos de estado que aplican los tipos de daño.

| Proc | InternalName | Tipo de daño | Efecto |
|---|---|---|---|
| Freeze | PT_CHILLED | Cold | Slower movement and attack speed |
| Ignite | PT_IMMOLATION | Heat | Fire DoT, Panic, Armor reduction |
| Tesla Chain | PT_ELECTROCUTION | Electricity | Tesla Chain DoT, Stun |
| Corrosion | PT_CAUSTIC_BURN | Corrosive | Armor reduction |
| Gas Cloud | PT_ASPHYXIATION | Gas | Gas Cloud DoT |
| Disrupt | PT_MAGNETIZED | Magnetic | Extra Shield/Overguard damage, Electricity DoT on break |
| Confusion | PT_RAD_TOX | Radiation | Friendly fire |
| Bleed | PT_BLEEDING | Slash | Bleed DoT (True damage) |
| Poison | PT_POISONED | Toxin | Poison DoT |
| Virus | PT_INFECTED | Viral | Increased Health damage |
| Bullet Attractor | PT_RADIANT | Void | Bullet attraction field |
| Status Vulnerability | PT_SENTIENT | Tau | Increased status proc chance |
| Knockback | PT_KNOCKBACK | Impact | Stagger, Mercy Kill threshold + |
| Weakened | PT_FRAILTY | Puncture | Target deals reduced damage |
| Sleep | PT_SLEEP | — | Puts enemy to sleep |
| Stagger | PT_STAGGERED | — | Staggers enemy |
| Knockdown | PT_KNOCKED_DOWN | — | Knocks down enemy |
| Lifted | PT_LIFT_HIT | — | Immobilized mid-air |
| Silence | PT_SILENCED | — | Deafens, disables abilities |
| Slow | PT_GLUE | — | Slows enemy |
| Ragdoll | PT_RAGDOLL | — | Ragdolls enemy |
| Disarmed | PT_DISARMED | — | Disarms weapon |
| Impair | PT_ROOTS | — | Disables jump/sprint |

---

## dictionary — Datos de referencia

### FactionOrder
`{ "Grineer", "Corpus", "Infested", "The Murmur" }`

### Factions (health types por facción, pre-U36)
| Facción | Health Types |
|---|---|
| Grineer | Cloned Flesh, Ferrite Armor, Alloy Armor, Machinery, Overguard |
| Corpus | Flesh, Shield, Proto Shield, Robotic, Overguard |
| Infested | Infested, Infested Flesh, Fossilized, Infested Sinew, Overguard |
| The Murmur | Indifferent Facade, Overguard |

---

## Notas del módulo

1. Does not affect Bosses.
2. Does not affect Rollers, Regulators, Latchers or Ospreys.
3. Does not affect MOAs.
4. This Status Effect bypasses Shield protections as it consists of Toxin damage.
5. The damage associated bypasses these secondary protections.
