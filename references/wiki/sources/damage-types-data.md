# Module:DamageTypes/data — Documentación extraída

> Fuente: `https://wiki.warframe.com/w/Module:DamageTypes/data?action=raw`
> Fuente actualizada: 2026-07-04
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

> ⚠️ **Conflicto ↔ el módulo se contradice en `Tau`.** La fila está destilada fiel: `Types.Tau` declara
> literalmente `InternalName = "PT_SENTIENT"` — **un token de proc en el campo del tipo de daño**. Tau
> es el único tipo sin `DT_*` propio en el módulo. No se corrige acá: `wiki/` guarda datos, no
> opiniones.

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

> ⚠️ **Esta tabla se reextrajo el 2026-08-06** contra `damage-types-data.lua`. La versión previa tenía
> **24 de 38** entradas y destilaba el campo `Status` de `Types`, que es **más pobre** que el de
> `Procs` — ver *Dos copias de `Status`* abajo. No era wiki desactualizada: era pérdida de destilación.

**38 entradas · 29 con `InternalName` · 9 sin token.**

### `Name` es el proc · `Status` es la **primitiva** — y es un array

El módulo separa las dos cosas por estructura, no por convención:

```lua
["Ignite"] = { InternalName = "PT_IMMOLATION",
               Status = { "Fire DoT as Heat damage", "Panic", "Armor reduction" } }
```

**Un proc, tres primitivas.** Y varios procs distintos comparten primitiva —`Freeze` (`PT_CHILLED`) y
`Slow` (`PT_GLUE`) declaran los dos *slow*; `Knockback` (`PT_KNOCKBACK`) y `Stagger` (`PT_STAGGERED`),
los dos *stagger*. Es la distinción *"Freeze **usa** slow, no **es** slow"* declarada por la fuente.

⚠️ **`Status[]` es prosa, no vocabulario** (*"Increased health threshold for Mercy finisher"* es una
oración). DE **no publica tokens de primitiva**: quien quiera una lista cerrada de primitivas la tiene
que derivar del label, no leerla.

### Con token — 29

| Proc (`Name`) | `InternalName` | `Status[]` (primitivas) |
|---|---|---|
| Freeze | `PT_CHILLED` | Slower movement and attack speed |
| Ignite | `PT_IMMOLATION` | Fire DoT as Heat damage · **Panic** · Armor reduction |
| Tesla Chain | `PT_ELECTROCUTION` | Tesla Chain · Stun · Electric DoT as Electricity damage |
| Corrosion | `PT_CAUSTIC_BURN` | Armor reduction |
| Gas Cloud | `PT_ASPHYXIATION` | Gas Cloud that deals DoT as Gas damage |
| Disrupt | `PT_MAGNETIZED` | Additional damage against Shields and Overguard · **Delays natural shield regeneration** · Electricity DoT on Shield/Overguard break |
| Confusion | `PT_RAD_TOX` | Friendly fire |
| Bleed | `PT_BLEEDING` | Bleed DoT as True damage |
| Poison | `PT_POISONED` | Poison DoT as Toxin damage |
| Virus | `PT_INFECTED` | Increased damage against Health |
| Bullet Attractor | `PT_RADIANT` | Spawn a bullet attraction field on target |
| Status Vulnerability | `PT_SENTIENT` | Increased likelihood of Status procs on target |
| Knockback | `PT_KNOCKBACK` | Stagger · **Increased health threshold for Mercy finisher** |
| Weakened | `PT_FRAILTY` | Target deals reduced damage |
| Inaccuracy | `PT_FLASHBANG` | Accuracy reduction |
| Microwave | `PT_MICROWAVE_BURN` | Enlarged body parts |
| Lifted | `PT_LIFT_HIT` | Immobilized in mid-air |
| Knockdown | `PT_KNOCKED_DOWN` | Knock down enemy, opening them up to ground finishers |
| Stagger | `PT_STAGGERED` | Staggers the enemy, interrupting many actions |
| Big Stagger | `PT_BIG_STAGGER` | Longer stagger effect |
| Stun | `PT_STUNNED` | Stuns the enemy, interrupting many actions for a time |
| Ragdoll | `PT_RAGDOLL` | Ragdolls the enemy |
| Sleep | `PT_SLEEP` | Puts enemy to sleep, preserving their alert state and opening them to finishers |
| Silence | `PT_SILENCED` | Deafens the enemy and disables most active abilities |
| Disarmed | `PT_DISARMED` | Equipped weapon is disarmed |
| Parried | `PT_PARRIED` | Opens enemy up to a counter-finisher |
| Slow | `PT_GLUE` | Slows the enemy |
| Impair | `PT_ROOTS` | Disables jumping, bullet jump, and sprinting — **`(PvP only)` / Conclave** |
| — | `PT_VOID` | *"Unknown; may be old version of bullet attractor (`PT_RADIANT`)"* — **el `Name` es el propio token** |

### Sin token — 9

**Seis son de Railjack/Empyrean**, y no reusan tokens de tierra: tienen entrada propia con
`InternalName = ""`.

| Proc (`Name`) | `Status[]` | Contexto |
|---|---|---|
| **Tear** | ⭐ *"Increase damage vulnerability on target"* | — |
| Blind | Enemy is in a blinded state, opening them up to front/back finishers | — |
| Detonate | Mini explosion | — |
| Concuss | Enemy crew have reduced accuracy and damage | **Railjack** |
| Immobilize | Disable ship weaponry · Slow ship movement to complete stop · Ice Hazard · Disables interactive elements | **Railjack** |
| Scramble | Disable enemy weaponry · Spiral enemy ship out of control · Electricity Hazard · Scrambles minimap · Disable Tactical Menu | **Railjack** |
| Sear | Fire DoT as Heat damage · Fire Hazard · Railjack Armaments overheat faster and cool slower | **Railjack** |
| Decompress | Reduce target ship's Shields and Armor | **Railjack** |
| Intoxicate | Change Faction of afflicted target · Enable friendly fire | **Railjack** |

⭐ **`Tear` es `Damage Vulnerability` nombrada por DE como proc**, y no tiene `InternalName`. Es el
único lugar del módulo donde el concepto aparece con nombre propio.

### Dos copias de `Status`, y no coinciden

El mismo proc trae `Status` en **dos bloques**: en `Types.<tipo>` (junto a `ProcInternalName`) y en
`Procs.<Name>`. **La de `Procs` es más rica** — medido:

| Proc | En `Types` | En `Procs` |
|---|---|---|
| `PT_MAGNETIZED` | 2 primitivas | **3** — suma *"Delays natural shield regeneration"* |
| `PT_ELECTROCUTION` | 2 (*"Tesla Chain DoT", "Stun"*) | **3** — separa el DoT del efecto |
| `PT_ASPHYXIATION` | *"Gas Cloud DoT"* | *"Gas Cloud that deals DoT as Gas damage"* |

**Al destilar, leer `Procs`.** `Types.Status` sirve para el mapeo `DT_ → PT_`, no para saber qué hace.

### El mapeo `DT_ → PT_` lo declara `ProcInternalName` — 13 filas

`Impact→PT_KNOCKBACK` · `Puncture→PT_FRAILTY` · `Slash→PT_BLEEDING` · `Heat(DT_FIRE)→PT_IMMOLATION` ·
`Cold(DT_FREEZE)→PT_CHILLED` · `Electricity→PT_ELECTROCUTION` · `Toxin(DT_POISON)→PT_POISONED` ·
`Gas→PT_ASPHYXIATION` · `Corrosive→PT_CAUSTIC_BURN` · `Magnetic→PT_MAGNETIZED` ·
`Radiation→PT_RAD_TOX` · `Viral→PT_INFECTED` · `Void(DT_RADIANT)→PT_RADIANT`.

🔴 **`DT_EXPLOSION` (Blast) declara `ProcInternalName = ""`** — el módulo dice explícitamente que Blast
**no tiene proc token**, y `Inaccuracy`/`PT_FLASHBANG` vive como entrada suelta. Tau tampoco lo trae.
Los dos los cierra `mechanics/status-effect.wikitext` (`Blast → PT_FLASHBANG`, `Tau → PT_SENTIENT`):
**dos fuentes independientes, 15 filas**. *True* es el único tipo sin proc.

⚠️ **`Inaccuracy` es descripción legacy, no token legacy.** `damage-blast-damage:19-23` dice que Blast
hace **daño**: mecha de 1.5s por stack, 30% del daño base cada uno; a 10 stacks detonan → 300% al
objetivo + AoE de 5m a 300% por stack (máx 3000%). `PT_FLASHBANG` sigue siendo el identificador; *"Accuracy
reduction"* es lo viejo.

---

## Cómo envejece cada campo de este módulo

Los tres campos no tienen la misma vida útil, y confundirlos hace leer datos viejos como vigentes:

| Campo | Qué es | Cómo envejece |
|---|---|---|
| `InternalName` (`PT_*`) | **token de DE** — sobrevive los reworks | ✅ estable · ❌ **no dice qué hace** |
| `Status[]` (prosa) | mantenida por la comunidad | ⚠️ **se queda vieja** — caso Blast |
| **página del tipo de daño** (`mechanics/damage-*.md`) | mantenida por mecánica | ✅ **la más al día para comportamiento** |

Es `references/CLAUDE.md` §*DE desconecta fuentes, no borra tokens* visto **desde adentro del módulo**:
lo que se desconecta acá no es el token, es su descripción.

### Legacy declarado por el propio módulo

| Token | Estado | Qué murió |
|---|---|---|
| `PT_VOID` | `Name = "PT_VOID"`, se autodeclara *"Unknown"* | todo. Void **sí** tiene proc vigente: `PT_RADIANT` (*bullet attraction*), que aplican Xaku *Xata's Whisper* y el amp del operador |
| `PT_GLUE` (Slow) | en tabla, sin fuente conocida | el proc — **sobrevivió la primitiva** `slow`, usada por Freeze, Gloom, Nova, Paralysis |
| `PT_RAD_TOX` (Confusion) | Radiation lo declara | el uso que Nyx *Chaos* le daba sin radiación |
| `PT_ROOTS` (Impair) | `(PvP only)` / Conclave | fuera de alcance **por definición de la fuente**, no por decisión nuestra |
| `PT_BIG_STAGGER` · `PT_DISARMED` · `PT_PARRIED` | la tabla los marca con `?` | la fuente declara su propia incertidumbre |

⚠️ **Procedencia:** los 29 `PT_*` salen **sólo de este módulo** — cero ocurrencias en
`sources/public-export.wikitext`. Su tabla se autodeclara `{{Community}}` + `{{UpdateMe|Hidden status
effects need more research}}`. Los `DT_*` sí están en el export y filtran en texto in-game. **Ambos se
usan; no soportan el mismo peso.** (`references/CLAUDE.md` §*Cómo leer un token*.)

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
