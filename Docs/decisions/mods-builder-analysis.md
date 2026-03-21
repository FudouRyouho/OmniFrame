# Análisis de mods — estructura canónica y gaps del builder

> Fecha: 2026-03-19
> Estado: activo
> Fuente primaria: `Project/public/data/mods.json` (post-fork `warframe-items`)
> Fuente canónica: `Module:Mods/data` (wiki) + Public Export DE (`ExportUpgrades_en.json`)

---

## 1. La fuente canónica: `upgradeTypes` y el Public Export

El juego modela cada efecto de un mod como un objeto `Upgrade` con semántica completa.
Esta estructura viene del Public Export de DE y está parcialmente expuesta en `Module:Mods/data`:

```json
{
  "UpgradeType":    "WEAPON_DAMAGE_AMOUNT",   // qué stat modifica — sin ambigüedad
  "OperationType":  "STACKING_MULTIPLY",       // cómo se apila con otros mods del mismo tipo
  "Value":          0.15,                      // valor en rango 0 (base)
  "DamageType":     "DT_ANY",                  // tipo de daño si aplica
  "ValidPostures":  [],                        // condiciones de estado del avatar (AIMING, AIRBORNE...)
  "ValidProcTypes": [],                        // status effects requeridos en el enemigo
  "ValidModifiers": [],
  "ValidType":      ""
}
```

Un mod con múltiples efectos tiene múltiples objetos `Upgrade` — uno por efecto.
Esto resuelve de forma natural el problema de "mods con dos stats": no hay dos valores
en un stat, hay dos `Upgrade` distintos con sus propios `UpgradeType` y `Value`.

### Lo que tenemos ahora en `Project/public/data/mods.json`

Tras los cambios al fork de `warframe-items` (2026-03-19):

```
id, name, kind, image, uniqueName, categoryRaw, type, category,
compatName, baseDrain, polarity, rarity, levelStats, masteryReq,
polarities, tags, description, imageName,
upgradeTypes[],        ← canónico — identifica qué stat modifica el mod
rank,                  ← maxRank del wikia (más fiable que fusionLimit del API)
isExilus,
isFlawed,
modClass,              ← "Galvanized" | "Primed" | "Archon"
isWeaponAugment,
incompatible[],
incompatibilityTags[]
```

`upgradeTypes[]` es el campo central: identifica sin ambigüedad qué stat modifica cada mod.
Cubre el ~85% de los mods de armas. Los campos `modClass`, `isExilus`, `incompatible`
son metadatos de compatibilidad relevantes para el builder (filtrado de slots, reglas de equip).

### Lo que NO tenemos todavía (está en el Public Export pero el fork lo descarta)

`OperationType`, `Value` (rango 0), `DamageType`, `ValidPostures`, `ValidProcTypes`.

Esto significa que actualmente:
- No sabemos cómo apila un mod con otros del mismo tipo (`OperationType`)
- No sabemos el valor base para calcular rangos intermedios (`Value`)
- No sabemos el tipo de daño de mods elementales (`DamageType`) — solo el texto de `levelStats`
- No sabemos las condiciones de activación canónicas (`ValidPostures`, `ValidProcTypes`)

Ampliar el fork para incluir estos campos es la decisión técnica más importante pendiente.

---

## 2. Taxonomía de `upgradeTypes` — qué significa cada tipo

> Total tipos únicos en el JSON: 176 (WEAPON_: ~90, AVATAR_: ~70, VEHICLE_: ~8, otros: ~8)

### Prefijo WEAPON_ — efectos sobre armas

#### Daño base y multiplicadores

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_DAMAGE_AMOUNT` | +% daño total del arma | Serration, Heavy Caliber | Capa BASE — aditiva |
| `WEAPON_MELEE_DAMAGE` | +% daño melee (equivalente para melee) | Pressure Point | Mismo pool que DAMAGE_AMOUNT |
| `WEAPON_PERCENT_BASE_DAMAGE_ADDED` | +% del daño base como tipo elemental/físico adicional | Hellfire, Cryo Rounds, Piercing Caliber | No es multiplicador global — añade un tipo. El tipo específico NO está en `upgradeTypes` (ver §3) |
| `WEAPON_DAMAGE_TYPE_BIAS` | Convierte X% del daño total a un tipo físico | Comet Rounds, Ripper Rounds | Redistribuye — no añade. Tipo destino tampoco en `upgradeTypes` |
| `WEAPON_AIMED_SHOT_DAMAGE_BONUS` | +% daño mientras apunta | Lasting Purity | Condición implícita: AIMING |
| `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` | +% daño por cada tipo de status activo en el enemigo | Condition Overload, Galvanized Aptitude/Savvy/Shot | Escala con N status — no es valor fijo |
| `WEAPON_INIT_DAMAGE_MOD` | +% daño en el primer disparo del cargador | Primed Chamber, Charged Chamber | Condición: FIRST_SHOT |
| `WEAPON_LAST_DAMAGE_MOD` | +% daño en el último disparo del cargador | Synth Charge | Condición: LAST_SHOT |
| `WEAPON_DAMAGE_OVER_DISTANCE` | Daño aumenta con la distancia | Spring-Loaded Broadhead | Requiere distancia asumida |
| `WEAPON_OVERHEAT_DAMAGE` | Acumula daño de calor por golpe | Fired Up | Mecánica de stacks — no calculable en v1 |

#### Críticos y headshot

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_CRIT_CHANCE` | +% probabilidad de crítico | Point Strike, Argon Scope | Pool multiplicativo |
| `WEAPON_CRIT_DAMAGE` | +% multiplicador de daño crítico | Vital Sense, Bladed Rounds | Pool aditivo |
| `WEAPON_HEADSHOT_MULTIPLIER` | +% al multiplicador de headshot | Amalgam Daikyu Target Acquired | Distinto de CRIT_DAMAGE — solo en headshot |
| `WEAPON_BODYSHOT_MULTIPLIER` | +% daño en disparos al cuerpo | Meticulous Aim | Nombre confuso — Meticulous Aim dice "+Headshot Damage" pero usa este tipo. Verificar. |
| `WEAPON_SLASH_PROC_ON_CRIT_CHANCE` | % de chance de Slash proc en crítico | Hunter Munitions | Probabilístico |

#### Status

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_PROC_CHANCE` | +% probabilidad de status | Malignant Force, High Voltage | Pool aditivo |
| `WEAPON_PROC_TIME` | +% duración de efectos de status | Augur Seeker, Continuous Misery | Multiplica duración base |
| `WEAPON_PROC_DAMAGE` | +% daño de efectos de status activos | Boreal's Contempt | Afecta ticks de DoT |
| `WEAPON_PROC_AMOUNT` | Modifica cantidad/intensidad del proc | Hunter's Bonesaw | Contexto-dependiente |
| `WEAPON_PROC_SELF_CC_REDUCTION_CHANCE` | Reduce stagger propio de explosiones | Cautious Shot | Utilidad |

#### Cadencia, recarga y cargador

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_FIRE_RATE` | +% cadencia de disparo | Speed Trigger, Vile Acceleration | Pool multiplicativo |
| `WEAPON_FIRE_ITERATIONS` | +% multishot | Barrel Diffusion, Galvanized Chamber | Nombre técnico para multishot — cada iteración = proyectil extra |
| `WEAPON_RELOAD_SPEED` | +% velocidad de recarga | Primed Fast Hands | Pool aditivo |
| `WEAPON_CLIP_MAX` | +% capacidad del cargador | Ammo Stock, Trick Mag | Afecta DPS sostenido |
| `WEAPON_AMMO_MAX` | +% munición máxima total | Ammo Drum | Sustain — no DPS burst |
| `WEAPON_AMMO_CONSUME_RATE` | Modifica consumo de munición por disparo | Brain Storm, Zazvat-Kar | Negativo = eficiencia; positivo = consume más |
| `WEAPON_AUTO_RELOAD_RATE` | % del cargador recargado/s al holster | Lock And Load | Mecánica de holster |
| `WEAPON_CHARGE_RATE` | +% velocidad de carga | Archgun Ace | Solo armas con mecánica de carga |
| `WEAPON_AMMO_RETRIEVED` | +% munición recuperada de pickups | Rifle Scavenger | Utilidad |
| `WEAPON_CONVERT_AMMO` | Convierte munición de otro tipo | Arrow Mutation | Utilidad |

#### Proyectiles, física y área

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_PROJECTILE_SPEED` | +% velocidad del proyectil | Lethal Momentum | No afecta DPS directo |
| `WEAPON_PROJECTILE_BOUNCES` | Número de rebotes | Fomorian Accelerant, Kinetic Ricochet | |
| `WEAPON_PROJECTILE_ELASTICITY` | Elasticidad del rebote | Fomorian Accelerant | Complementa BOUNCES |
| `WEAPON_PROJECTILE_EXPLOSION_CHANCE` | % de chance de que el proyectil explote | Concealed Explosives | Probabilístico |
| `WEAPON_PROJECTILE_LINGERING_AOE_DAMAGE` | Daño del área persistente tras impacto | Nightwatch Napalm | % del daño base como área |
| `WEAPON_PROJECTILE_LINGERING_AOE_DURATION` | Duración del área persistente | Nightwatch Napalm | En segundos |
| `WEAPON_PROJECTILE_LINGERING_AOE_RADIUS` | Radio del área persistente | Nightwatch Napalm | En metros |
| `WEAPON_EXPLOSION_RADIUS` | +% radio de explosión | Primed Firestorm, Heavy Warhead | Pool aditivo |
| `WEAPON_PUNCTURE_DEPTH` | +N metros de punch through | Metal Auger | Valor absoluto (metros) |
| `WEAPON_RANGE` | +% alcance (melee/beam) | Primed Reach, Sinister Reach | Melee: alcance físico; beam: longitud del haz |
| `WEAPON_SPREAD` | +/−% dispersión (accuracy inversa) | Directed Convergence, Gun Glide | Negativo = más preciso. El builder invierte el signo para mostrar como accuracy |
| `WEAPON_RECOIL` | +/−% retroceso | Counterbalance | Negativo = menos retroceso |
| `WEAPON_ZOOM` | +/−% zoom del scope | Aero Periphery, Hawk Eye | Afecta headshot multiplier en algunos casos |

#### Efectos de muerte / cadáver

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_CORPSE_EXPLODE_DAMAGE` | Daño fijo de la explosión en muerte | Acid Shells, Combustion Beam | Valor absoluto |
| `WEAPON_CORPSE_EXPLODE_DAMAGE_ENEMY_HEALTH_PCT` | +% HP del enemigo como daño adicional | Acid Shells | Escala con HP del enemigo |
| `WEAPON_CORPSE_EXPLODE_PROC_CHANCE` | % de chance de proc en la explosión | Amalgam Furax Body Count | Probabilístico |
| `WEAPON_CORPSE_EXPLODE_RADIUS` | Radio de la explosión en muerte | Acid Shells | En metros |

#### Melee específicos

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_MELEE_COMBO_DURATION_BONUS` | +N segundos de duración del combo counter | Body Count | Valor absoluto |
| `WEAPON_MELEE_COMBO_INITIAL_BONUS` | +N combo inicial al equipar | Corrupt Charge, Covert Lethality | Valor absoluto |
| `WEAPON_MELEE_COMBO_GAIN_EXTRA_CHANCE` | % de chance de ganar combo extra | Quickening | Probabilístico |
| `WEAPON_MELEE_COMBO_CHANCE_FROM_DOT` | % de chance de ganar combo cuando Slash proc daña | Relentless Combination | Probabilístico |
| `WEAPON_MELEE_COMBO_USAGE_EFFICIENCY` | +% eficiencia de heavy attack | Focus Energy | Pool aditivo |
| `WEAPON_MELEE_HEAVY_CHARGE_SPEED` | +% velocidad de carga de heavy attack | Killing Blow | |
| `WEAPON_MELEE_HEAVY_EMPOWERED_CHANCE` | Probabilidad de Tennokai | Dreamer's Wrath | Mecánica Tennokai |
| `WEAPON_MELEE_SLAM_DAMAGE_BONUS` | +% daño de slam attack | Seismic Wave | |
| `WEAPON_MELEE_FINISHER_DAMAGE` | +% daño de finisher | Finishing Touch | |
| `WEAPON_MELEE_ARMOR_REDUCTION` | Reduce armadura del enemigo por golpe | Shattering Impact | Valor absoluto por golpe |
| `WEAPON_MELEE_AUTOTARGET_RANGE_BONUS` | +N metros de rango de auto-target | Heartseeker | Valor absoluto |
| `WEAPON_MELEE_AUTOTARGET_MAXIMUM_ANGLE` | Ángulo máximo de auto-target | Heartseeker | En grados |
| `WEAPON_PARRY_ANGLE` | +N grados de ángulo de bloqueo | Focused Defense | Valor absoluto |
| `WEAPON_PARRY_EFFECTIVENESS` | +/−% efectividad del bloqueo | Heartseeker | |
| `WEAPON_PARRY_DAMAGE_BLOCKED` | +% daño bloqueado | Impenetrable Offense | |
| `WEAPON_PARRY_DAMAGE_REFLECTED` | +% daño reflejado al bloquear | Mortal Conduct | |
| `WEAPON_PARRY_COUNTER_CHANCE` | % de chance de abrir finisher tras bloquear | Parry | |
| `WEAPON_REFLECTION_MODIFIER` | Modifica rebotes de proyectiles melee (chakrams) | Quick Return, Rebound | Valor absoluto |
| `WEAPON_REFLECTION_EXPLOSION_CHANCE` | % de chance de explotar en rebote | Volatile Rebound | |
| `WEAPON_SNIPER_COMBO_DURATION_BONUS` | +N segundos de duración del combo de sniper | Harkonar Scope | Valor absoluto |

#### Utilidad / miscelánea

| UpgradeType | Semántica | Ejemplo | Nota builder |
|---|---|---|---|
| `WEAPON_LIFE_STEAL` | +% de daño infligido recuperado como HP | Life Strike | Solo heavy attack en melee |
| `WEAPON_HEALTH_ON_HIT_ENEMY_WITH_PROC` | +N HP por tipo de status activo en el enemigo | Healing Return | Valor absoluto por status |
| `WEAPON_NOISE_REDUCTION` | Reduce probabilidad de alertar enemigos | Hush, Silent Battery | Utilidad |
| `WEAPON_MARK_TARGET` | Revela enemigo en minimapa | Apex Predator | Utilidad |
| `WEAPON_NULLIFIER_BUBBLE_POP_CHANCE` | % de chance de destruir burbuja Nullifier | Neutralizing Justice | Utilidad |
| `WEAPON_GRENADE_STICKY` | Granadas se adhieren a superficies | Adhesive Blast | Mecánica |
| `WEAPON_SYNDICATE_POWER` | Activa el efecto de sindicato del mod | Blade Of Truth | Mecánica especial |
| `WEAPON_TARGET_AMOUNT` | +N enemigos adicionales golpeados | Swipe (companion) | |
| `WEAPON_INIT_DAMAGE_MOD` | +% daño en el primer disparo del cargador | Primed Chamber | Condición: FIRST_SHOT |
| `WEAPON_LAST_DAMAGE_MOD` | +% daño en el último disparo del cargador | Synth Charge | Condición: LAST_SHOT |


### Prefijo AVATAR_ — efectos sobre el Warframe

> Relevantes para el builder de Warframe. Documentados brevemente.

| UpgradeType | Semántica |
|---|---|
| `AVATAR_ABILITY_STRENGTH` | +% fuerza de habilidades |
| `AVATAR_ABILITY_DURATION` | +% duración de habilidades |
| `AVATAR_ABILITY_EFFICIENCY` | +% eficiencia de habilidades (reduce coste de energía) |
| `AVATAR_ABILITY_RANGE` | +% rango de habilidades |
| `AVATAR_ABILITY_AUGMENT` | Activa el efecto de augment de la habilidad |
| `AVATAR_HEALTH_MAX` | +% HP máximo |
| `AVATAR_SHIELD_MAX` | +% escudo máximo |
| `AVATAR_ARMOUR` | +% armadura |
| `AVATAR_POWER_MAX` | +% energía máxima |
| `AVATAR_POWER_RATE` | +% regeneración de energía |
| `AVATAR_SPRINT_SPEED` | +% velocidad de sprint |
| `AVATAR_MOVEMENT_SPEED` | +% velocidad de movimiento general |
| `AVATAR_CASTING_SPEED` | +% velocidad de casteo de habilidades |
| `AVATAR_SHIELD_RECHARGE_RATE` | +% velocidad de recarga de escudo |
| `AVATAR_SHIELD_RECHARGE_DELAY` | +/−% delay antes de que el escudo empiece a recargarse |
| `AVATAR_DAMAGE_TAKEN` | +/−% daño recibido (negativo = reducción) |
| `AVATAR_PROC_TIME` | +% duración de efectos de status sobre el Warframe |
| `AVATAR_PROC_IMMUNITY_DURATION` | +% duración de inmunidad a status |
| `AVATAR_DAMAGE_POWER_MULTIPLIER` | Multiplica daño de habilidades |
| `AVATAR_AURA_STRENGTH` | +% fuerza del aura |
| `AVATAR_AURA_EFFECTIVENESS_ON_ME` | +% efectividad del aura sobre uno mismo |
| `AVATAR_BLEEDOUT_MODIFIER` | +% tiempo de bleedout |
| `AVATAR_REVIVE_SPEED` | +% velocidad de revivir aliados |
| `AVATAR_ENERGY_SPAWN_PERCENT` | +% energía al spawnear |
| `AVATAR_SPAWN_ENERGY` | Energía inicial al spawnear |
| `AVATAR_ENERGY_ON_FULL_SHIELD_REGEN` | Energía al regenerar escudo completo |
| `AVATAR_ENERGY_TO_OVERSHIELDS_ON_SPAWN` | Convierte energía a overshields al spawnear |
| `AVATAR_ABILITY_ENERGY_TO_SHIELD` | Convierte energía de habilidades a escudo |
| `AVATAR_ABILITY_ENERGY_TO_OVERSHIELD` | Convierte energía de habilidades a overshield |
| `AVATAR_LOOT_RADAR` | +N metros de radar de loot |
| `AVATAR_ENEMY_RADAR` | +N metros de radar de enemigos |
| `AVATAR_JUMP_HEIGHT` | +% altura de salto |
| `AVATAR_PARKOUR_BOOST` | +% velocidad de parkour |
| `AVATAR_PARKOUR_GLIDE` | +% duración de planeo |
| `AVATAR_PARKOUR_GRAVITY` | +/−% gravedad durante parkour |
| `AVATAR_SLIDE_BOOST` | +% velocidad de slide |
| `AVATAR_DODGE_SPEED` | +% velocidad de dodge |
| `AVATAR_KNOCKDOWN_RECOVERY_SPEED` | +% velocidad de recuperación de knockdown |
| `AVATAR_MARKED_DAMAGE_AMOUNT` | +% daño a enemigos marcados |
| `AVATAR_SENTINEL_*` | Varios efectos de link con sentinel/companion |
| `AVATAR_HEAL_RATE` | +% velocidad de curación |
| `AVATAR_STAMINA_*` | Stamina (sistema legacy — no relevante en v1) |

### Prefijos VEHICLE_, SKILL_, GAMEPLAY_

| UpgradeType | Semántica |
|---|---|
| `VEHICLE_SPEED` / `VEHICLE_SPRINT_SPEED` | Velocidad del K-Drive |
| `VEHICLE_JUMP_HEIGHT` / `VEHICLE_DOUBLE_JUMP_HEIGHT` | Altura de salto del K-Drive |
| `VEHICLE_SCORE_MULTIPLIER` | Multiplicador de puntuación en K-Drive |
| `VEHICLE_MAGNETISM` | Magnetismo del K-Drive |
| `SKILL_ABILITY_TACTICAL_EFFICIENCY` | Eficiencia táctica de habilidades (Railjack) |
| `GAMEPLAY_FACTION_DAMAGE` | +% daño a una facción específica (Bane mods) |
| `GAMEPLAY_PICKUP_AMOUNT` | +% cantidad de pickups recogidos |
| `GAMEPLAY_POWER_TO_HEALTH_ON_DEATH` | Convierte energía a HP al morir |

---

## 3. Gaps: lo que `upgradeTypes` no resuelve solo

### Gap A — Tipo de daño en mods elementales y de conversión

`WEAPON_PERCENT_BASE_DAMAGE_ADDED` es el tipo canónico para **todos** los mods de daño
elemental y físico (Hellfire, Cryo Rounds, Piercing Caliber, Stormbringer, etc.).
El tipo de daño específico (heat, cold, puncture...) **no está en `upgradeTypes`** —
está en `DamageType` del Public Export (`DT_FIRE`, `DT_FREEZE`, `DT_PUNCTURE`...).

Lo mismo aplica a `WEAPON_DAMAGE_TYPE_BIAS` (Comet Rounds, Ripper Rounds): el tipo
destino de la conversión tampoco está en `upgradeTypes`.

**Opciones para resolverlo**:
- Ampliar el fork para incluir `DamageType` del Public Export — robusto, fuente canónica
- Parsear `levelStats` (`"+90% Heat"` → `heat`) — funciona para mods estándar, frágil
- Tabla de lookup estática (mod → damageType) — simple, requiere mantenimiento

### Gap B — Condiciones de activación

El Public Export tiene `ValidPostures: ["AIMING"]` y `ValidProcTypes: ["DT_SLASH"]`
por cada `Upgrade`. No los tenemos en nuestro JSON.

Sin esto el builder no sabe que Argon Scope solo aplica mientras apunta, o que
Galvanized Aptitude escala con status activos en el enemigo.

Mods afectados por `ValidPostures` (condición de postura del jugador):

| Condición | Mods representativos |
|---|---|
| AIMING | Argon Scope, Lasting Purity, Directed Convergence, Catalyzer Link, Galvanized Scope |
| AIRBORNE | Soaring Strike, Aero Agility, Zazvat-Kar |
| CROUCHING | Lie In Wait |
| WALLATTACH | Proton Jet |
| SLIDING | Gun Glide |
| INVISIBLE | Spectral Serration |

**Opciones para resolverlo**:
- Ampliar el fork para incluir `ValidPostures` y `ValidProcTypes` del Public Export
- Tabla de lookup estática para los ~20 mods afectados
- Ignorar en v1 y asumir siempre activo (sobreestima el DPS)

### Gap C — Triggers de evento (On Kill, On Hit, On Headshot)

`ValidPostures` cubre estados del avatar, pero "On Kill" o "On Headshot" son **triggers
de evento**, no posturas. El Public Export los modela de forma diferente (probablemente
en `ValidModifiers` o en la lógica Lua del mod).

Mods afectados:

| Trigger | Mods representativos | upgradeType |
|---|---|---|
| On Kill | Galvanized Chamber/Hell/Aptitude/Savvy, Gorgon Frenzy, Kill Switch | `WEAPON_FIRE_ITERATIONS`, `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` |
| On Headshot | Argon Scope, Laser Sight, Brain Storm | `WEAPON_CRIT_CHANCE`, `WEAPON_AMMO_CONSUME_RATE` |
| On Headshot Kill | Galvanized Scope | `WEAPON_CRIT_CHANCE` |
| On Hit | Hata-Satya, Guided Ordnance, Split Flights | `WEAPON_CRIT_CHANCE`, `WEAPON_SPREAD` |
| On Reload | Spring-Loaded Chamber, Repeater Clip | `WEAPON_FIRE_RATE` |
| On Ability Cast | Catalyzer Link, Nano-Applicator | `WEAPON_PROC_CHANCE` |
| On Weak Point Kill | Biotic Rounds | `WEAPON_PERCENT_BASE_DAMAGE_ADDED` |

### Gap D — Progresión no lineal (Primed, Galvanized, Archon)

El Public Export tiene `Value` solo para rango 0. Los rangos superiores se calculan
linealmente — excepto Primed, Galvanized y Archon que tienen progresiones especiales.

El builder necesita los valores exactos por rango para estos ~30-40 mods.
Este es el caso donde el override tiene sentido real: `values[]` explícitos por rango.

Ejemplos verificados:
- Galvanized Chamber: rango 0 = +20% multishot, rango 10 = +110% multishot (no lineal)
- Primed Cryo Rounds: rango 0 = +15% Cold, rango 10 = +165% Cold (lineal pero 10 rangos)
- Archon Stretch: progresión especial con bonus adicional en rangos altos

### Gap E — Mods sin `upgradeTypes` (augmentos de arma específica)

Los augmentos de arma específica tienen `upgradeTypes: []` — el wikia no tiene datos
para ellos porque sus efectos son Lua scripts, no `UpgradeType` estándar.

Mods afectados en primary (~13):

| Mod | Arma | Efecto |
|---|---|---|
| Acid Shells | Sobek | Explosión en muerte: daño fijo + % HP del enemigo |
| Nightwatch Napalm | Ogris | 30% daño base como Heat en área durante 6s |
| Bursting Mass | Embolist | Masa acumula daño y explota |
| Fomorian Accelerant | Drakgoon | Flak rebota + viaja más rápido |
| Kinetic Ricochet | Tetra | Balas rebotan 1x |
| Sentient Barrage | Battacor | Alt-fire con Punch Through infinito |
| Vile Discharge | Embolist | Acumula daño, Alt-fire lanza sac |
| Volatile Variant | Sporothrix | +Punch Through + barbs explotan |
| Necrophagic Vigor | Hema | Recarga drena HP → +Crit |
| Unseen Dread | Stalker Bow | Invisibilidad al golpear 3+ enemigos |
| Spontaneous Singularity | Cephalon Primary | Orbes explotan con Singularity |
| Metamorphic Magazine | Gorgon | +Mag +Ammo + petrifica enemigos |
| Thermagnetic Shells | Supra | Explosión en muerte con Magnetic |

Nota: Fomorian Accelerant sí tiene `upgradeTypes` (`WEAPON_PROJECTILE_BOUNCES`,
`WEAPON_PROJECTILE_SPEED`, `WEAPON_PROJECTILE_ELASTICITY`) — no es un caso sin cobertura.
Los demás son genuinamente UNIQUE.

### Gap F — Tipos ambiguos que requieren contexto adicional

| upgradeType | Ambigüedad | Resolución |
|---|---|---|
| `WEAPON_FIRE_ITERATIONS` | Nombre técnico para multishot — no obvio | Documentado: cada iteración = proyectil extra |
| `WEAPON_SPREAD` | Usado para accuracy (Directed Convergence) y spread literal (Gun Glide) | El builder invierte el signo para mostrar como accuracy cuando es negativo |
| `WEAPON_AMMO_CONSUME_RATE` | Negativo = eficiencia, positivo = consume más | El builder invierte para mostrar como "Ammo Efficiency" cuando es negativo |
| `WEAPON_BODYSHOT_MULTIPLIER` | Meticulous Aim dice "+Headshot Damage" pero usa este tipo | Verificar con más mods — puede ser un error del wikia |
| `WEAPON_DAMAGE_OVER_DISTANCE` | Spring-Loaded Broadhead: daño aumenta con distancia | Requiere distancia asumida o modelado como rango |
| `WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` | Escala con N status activos — no es valor fijo | Modelo especial: multiplicador variable según status asumidos |

---

## 4. Preguntas abiertas para el diseño del builder

Estas preguntas son arquitectónicas — afectan tanto a mods como a habilidades y deben
resolverse de forma coherente cross-sistema.

### Q1 — ¿Cómo obtiene el builder los valores numéricos?

Dos enfoques:
- **Parsear `levelStats`**: `"+90% Heat"` → `0.9`. Funciona para mods estándar, frágil para casos complejos.
- **Ampliar el fork**: incluir `Value` (rango 0) y `DamageType` del Public Export. Robusto, fuente canónica.

Si se amplía el fork, el parseo de texto se vuelve innecesario para el ~85% de los mods.
**Esta decisión desbloquea todo lo demás.**

### Q2 — ¿Cómo se modelan las condiciones de activación?

Tres enfoques:
- **Adoptar `ValidPostures`** del Public Export directamente — máxima fidelidad canónica
- **Abstraer en `condition: string`** — más legible, pero inventamos semántica
- **Toggle en el builder** — el usuario activa/desactiva condiciones manualmente

La decisión afecta tanto a mods como a habilidades (Roar activo, Eclipse activo, etc.).
Debe ser coherente cross-sistema. Los triggers de evento (On Kill, On Hit) son un caso
aparte — no son posturas sino eventos, y el builder probablemente los modela como
"asumir activo" (max stacks) o como toggle.

### Q3 — ¿Cómo se modela `OperationType`?

El juego tiene al menos: `STACKING_MULTIPLY`, `STACKING_LINEAR`, `OVERRIDE`.
En la práctica, cada `upgradeType` tiene siempre el mismo `OperationType` — el builder
podría inferirlo por tipo en lugar de necesitarlo explícito.

### Q4 — ¿Cómo se modelan los Galvanized?

Los Galvanized tienen dos stats en el mismo mod:
1. Stat base (siempre activo): `+80% Status Chance`
2. Stat condicional (On Kill, N stacks, X segundos): `+40% Direct Damage per Status Type`

¿El builder asume max stacks (como Overframe)? ¿Expone slider?
¿Los `values[]` son por rango del mod o por stack?

### Q5 — ¿Qué hace el builder con `upgradeTypes: []`?

Mods sin `upgradeTypes` (augmentos de arma específica). ¿Los ignora? ¿Los muestra
como "efecto especial" sin cálculo? ¿Los marca como UNIQUE?

---

## 5. El override en su nuevo rol

El override (`mod-stats.json`) ya no es la fuente de verdad del modifier — `upgradeTypes`
lo es. El override es un **complemento quirúrgico** para los casos que la fuente canónica
no puede cubrir.

### Qué cubre el override (y solo esto)

| Caso | Qué aporta el override |
|---|---|
| Progresión no lineal (Primed, Galvanized, Archon) | `values[]` explícitos por rango |
| Augmentos de arma específica (`upgradeTypes: []`) | `misc` con descripción del efecto |
| Tipo de daño de mods elementales (si no se amplía el fork) | `damageType: "heat"` como fallback |
| Condiciones de activación (si no se amplía el fork) | `condition` / `trigger` como fallback |
| Label de renderizado con `|val1|` templates | `label` para la UI |

### Qué ya NO hace el override

- Definir qué stat modifica un mod — eso es `upgradeTypes`
- Inventar nombres de modifier (`DAMAGE_BASE`, `CRIT_CHANCE`, `MULTISHOT`) — obsoletos
- Ser la fuente primaria para mods estándar — innecesario si `upgradeTypes` los cubre

### Contexto histórico — por qué existía el override

El override nació cuando no teníamos `upgradeTypes` en el JSON. Se diseñó un sistema
de `modifier` inventados (`DAMAGE_BASE`, `CRIT_CHANCE`, etc.) para identificar qué stat
modifica cada mod. Ese sistema era un gap-fill para lo que la fuente canónica ya tenía.

Al descubrir `Module:Mods/data` y añadir `upgradeTypes[]` al fork, el sistema de
`modifier` inventados se vuelve redundante para el ~85% de los mods. El override
sobrevive solo para los casos genuinamente complejos.

Las CLASES 8 y 9 del análisis original (modifiers faltantes, nuevos ModModifiers en
`types.ts`) ya no son prioritarias — `upgradeTypes` los cubre canónicamente.

---

## 6. Clasificación de mods por complejidad para el builder

Esta clasificación reemplaza las CLASES 1-9 del análisis original, reenfocada en
lo que el builder necesita para cada grupo.

### Grupo A — Cubiertos por `upgradeTypes` + `levelStats` (~60% de mods de armas)

`upgradeTypes` identifica el stat, `levelStats` da el valor. El builder puede operar
sin override para estos.

Ejemplos: Serration, Heavy Caliber, Point Strike, Vital Sense, Speed Trigger,
Primed Fast Hands, Barrel Diffusion, Malignant Force, Metal Auger, Bane mods,
Vitality, Intensify, Stretch, Continuity.

### Grupo B — Necesitan `DamageType` del Public Export (~20% de mods de armas)

`upgradeTypes: ["WEAPON_PERCENT_BASE_DAMAGE_ADDED"]` o `["WEAPON_DAMAGE_TYPE_BIAS"]`
pero el tipo de daño específico no está disponible sin ampliar el fork o parsear texto.

Ejemplos: Hellfire, Cryo Rounds, Piercing Caliber, Stormbringer, Infected Clip,
Comet Rounds, Ripper Rounds, y todos los mods elementales/físicos.

### Grupo C — Necesitan condición de activación (~15% de mods de armas)

`upgradeTypes` identifica el stat pero el efecto solo aplica bajo una condición
(postura del jugador o trigger de evento).

Ejemplos: Argon Scope, Lasting Purity, Galvanized Chamber, Galvanized Scope,
Spring-Loaded Chamber, Spectral Serration, Soaring Strike, Primed Chamber.

### Grupo D — Necesitan `values[]` por rango (~5% de mods de armas)

Progresión no lineal. El builder no puede calcular los rangos intermedios linealmente.

Ejemplos: todos los Primed (10 rangos), todos los Galvanized (10 rangos con progresión
especial), mods Archon.

### Grupo E — UNIQUE: sin cobertura canónica (~3% de mods de armas)

`upgradeTypes: []` o efectos que no son calculables con el sistema estándar.

Ejemplos: augmentos de arma específica (Acid Shells, Nightwatch Napalm, etc.),
Shivering Contagion, Plan B, Brain Storm.

### Grupo F — Ignorar en v1

Mods PvP (Conclave), mods de utilidad sin impacto en DPS (Hush, Apex Predator,
Lock And Load), mods de K-Drive.

---

## 7. Próximos pasos

En orden de prioridad, sin bloqueantes de diseño:

**1. Decidir Q1** — ¿ampliar el fork para incluir `Value`, `DamageType`, `ValidPostures`,
`ValidProcTypes`, `OperationType` del Public Export, o parsear `levelStats`?
Esta decisión determina cuánto trabajo queda en el override y en el builder.

**2. Decidir Q2** — modelo de condiciones cross-sistema (mods + habilidades).
Afecta al schema del override y al motor del builder. No implementar hasta decidir.

**3. Decidir Q3 y Q4** — `OperationType` y modelo de stacks Galvanized.
Pueden decidirse juntos ya que ambos afectan al motor de cálculo.

**4. Documentar augmentos UNIQUE** (Grupo E) en el override con `misc`.
Sin bloqueante de diseño — trabajo de datos puro.

**5. Una vez decidido Q1**: si se amplía el fork, actualizar `warframe-items/build/parser.mjs`
para extraer los campos del Public Export que faltan.

**Lo que ya NO está en la lista:**
- Actualizar `types.ts` con `ModModifier` inventados — obsoleto
- Completar el override para mods estándar — innecesario
- El editor de mods como prioridad — es una herramienta de datos, no el motor
