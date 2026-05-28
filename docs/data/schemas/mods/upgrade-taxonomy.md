---
Estado: "activo"
Rol: "Taxonomía de UpgradeType — vocabulario canónico OmniFrame D-6"
Version: "v0.3.0"
Impacto_ID: "S-Upgrade-Taxonomy"
Fidelidad_Fisica: "Project/src/shared/types/modifier.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-27"
Dependencias:
  - "Project/src/shared/types/damage.ts"
  - "docs/data/schemas/mods/mods-schema.md"
  - "docs/semantic/damage-types.md"
---

# Mods Upgrade Taxonomy

## Principio de derivación

DE suministra tipos genéricos sin semántica de tipo de daño explícita. OmniFrame resuelve
esto con **vocabulario derivado**: el override JSON (`mod-stats.override.json`) reemplaza el
tipo genérico DE con el tipo OmniFrame específico. El engine los consume directamente sin
parsing de labels.

**Fuente de verdad de tipos de daño**: `Project/src/shared/types/damage.ts` → `DamageType`

---

## Convención D-6: `{FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`

### FAMILY

| Token | Dominio |
| :--- | :--- |
| `WEAPON_` | Arma y ataques — ranged y melee (compatibilidad se maneja en el slot, no en el tipo) |
| `AVATAR_` | Stats del Warframe — habilidades, defensas, movilidad |
| `VEHICLE_` | K-Drive y vehículos |
| `GAMEPLAY_` | Facción, utilidades, reglas generales |

### OPERATION — mapeo 1:1 con `Modifier.operation` del engine

| Token | Engine op | Formula bucket | Tipo de valor |
| :--- | :--- | :--- | :--- |
| `ADD` | `ADD` | `mods_add_pct` | % aditivo estándar — la gran mayoría de los mods |
| `BASE` | `BASE_FLAT` | `base_flat` | Plano pre-escala — **se amplifica** con mods `ADD` |
| `FLAT` | `ADD_FLAT` | `total_flat` | Plano post-escala — **no se amplifica** |
| `MULT` | `MULTIPLICATIVE` | `multiplicative` | % multiplicativo — stack separado del `ADD` |

Fórmula de referencia (`SimulationEngine.calculateCurrentValue()`):
```
scaledBase = (base + base_flat) × (1 + base_add_pct / 100)
withMods   = scaledBase         × (1 + mods_add_pct / 100)
val        = (withMods + total_flat) × multiplicative
```

### PREFIX / SUFFIX

- **PREFIX**: subcategoría del stat (`HEAT`, `CRIT`, `STATUS`, `ABILITY`, `FACTION`, `MELEE`, …)
- **SUFFIX**: atributo específico (`DAMAGE`, `CHANCE`, `MULT`, `SPEED`, `STRENGTH`, …)
- Sin PREFIX cuando el stat es raíz de la familia (ej: `WEAPON_ADD_DAMAGE` — daño global).

Regla de derivación elemental: `{PREFIX}` = `DamageType` en mayúsculas (`heat` → `HEAT`).

### Convención de resolución D-6

**Regla general:** `attr = token` (auto-referencial). `resolveToken()` en `modifier.ts` deriva
`{ attr, op }` directamente del nombre del token sin consultar `UPGRADE_MAP`.

**Excepciones explícitas en UPGRADE_MAP** (token ≠ attr):

| Token | Engine attr | Motivo |
| :--- | :--- | :--- |
| `WEAPON_ADD_DAMAGE` | `WEAPON_DAMAGE` | Daño global: alias del atributo raíz |
| `WEAPON_FIRE_ITERATIONS` | `WEAPON_ADD_MULTISHOT` | Alias del pipeline @wfcd/items — resolución OQ-ENGINE-6 |
| `WEAPON_BASE_DAMAGE` | `WEAPON_DAMAGE` | Perk Incarnon: BASE_FLAT del atributo raíz |
| `WEAPON_BASE_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | Perk Incarnon: BASE_FLAT de CC |
| `WEAPON_BASE_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | Perk Incarnon: BASE_FLAT de SC |
| `WEAPON_BASE_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | Perk Incarnon: BASE_FLAT de magazine |

---

## Vocabulario completo (UPGRADES[])

### WEAPON — daño global

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_DAMAGE` | `WEAPON_DAMAGE` | ADD | Serration, Hornet Strike, Pressure Point |

### WEAPON — derivados elementales y físicos

`resolveToken()` auto-deriva: **attr = token**, op = `ADD`. Sin entrada en UPGRADE_MAP (D-7b Fase 2).

| Tipo OmniFrame D-6 | Familia | Ejemplo de mod |
| :--- | :--- | :--- |
| `WEAPON_ADD_IMPACT_DAMAGE` | physical | Heavy Trauma, Comet Blast, Rupture |
| `WEAPON_ADD_PUNCTURE_DAMAGE` | physical | Piercing Hit, Bore, Flechette |
| `WEAPON_ADD_SLASH_DAMAGE` | physical | Buzz Kill, Maim, Jagged Edge |
| `WEAPON_ADD_HEAT_DAMAGE` | elemental | Hellfire, Molten Impact, Thermite Rounds |
| `WEAPON_ADD_COLD_DAMAGE` | elemental | Cryo Rounds, Deep Freeze, North Wind |
| `WEAPON_ADD_ELECTRICITY_DAMAGE` | elemental | Stormbringer, Convulsion, High Voltage |
| `WEAPON_ADD_TOXIN_DAMAGE` | elemental | Infected Clip, Malignant Force, Fever Strike |
| `WEAPON_ADD_BLAST_DAMAGE` | combined | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_CORROSIVE_DAMAGE` | combined | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_GAS_DAMAGE` | combined | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_MAGNETIC_DAMAGE` | combined | Magnetic Might |
| `WEAPON_ADD_RADIATION_DAMAGE` | combined | Containment Breach, Atomic Fallout, Radiated Reload |
| `WEAPON_ADD_VIRAL_DAMAGE` | combined | Damzav-Vati |
| `WEAPON_ADD_VOID_DAMAGE` | special | Xaku (añade Void a armas vía habilidad — override de arma) |
| `WEAPON_ADD_TAU_DAMAGE` | special | Venato unique trait |
| `WEAPON_ADD_TRUE_DAMAGE` | special | Mecánicas de ejecución (Innodem y similares) |
| `WEAPON_ADD_NONE_DAMAGE` | special | Sentinel — no debe aparecer en overrides de producción |

> Los tipos `combined` sin mods directos (blast, corrosive, gas) se incluyen porque la misma
> semántica se reutilizará en habilidades y augments.

**Patrón reservado** (daño plano pre-escala): `WEAPON_BASE_{TYPE}_DAMAGE`. No instanciar hasta
confirmar un mod o mecánica que lo requiera.

### WEAPON — stats de disparo y crítico

`attr = token` (auto-derivado) para todos, excepto `WEAPON_FIRE_ITERATIONS` (alias).

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_FIRE_RATE` | `WEAPON_ADD_FIRE_RATE` | ADD | Speed Trigger, Shred |
| `WEAPON_ADD_MULTISHOT` | `WEAPON_ADD_MULTISHOT` | ADD | Split Chamber, Galvanized Chamber |
| `WEAPON_FIRE_ITERATIONS` | `WEAPON_ADD_MULTISHOT` | ADD | Hell's Chamber, Galvanized Hell, Barrel Diffusion — alias pipeline |
| `WEAPON_ADD_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | ADD | Point Strike, True Steel |
| `WEAPON_ADD_CRIT_MULT` | `WEAPON_ADD_CRIT_MULT` | ADD | Vital Sense, True Steel |
| `WEAPON_ADD_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | ADD | Infected Clip (60/60), High Voltage |
| `WEAPON_ADD_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | ADD | Ammo Stock, Trick Mag |
| `WEAPON_ADD_RELOAD_SPEED` | `WEAPON_ADD_RELOAD_SPEED` | ADD | Fast Hands, Tactical Reload |
| `WEAPON_ADD_STATUS_DAMAGE` | `WEAPON_ADD_STATUS_DAMAGE` | ADD | Rifle/Shotgun/Pistol/Melee Elementalist (+90%) |

### WEAPON — perks base Incarnon (BASE_FLAT)

Tokens `BASE` — planos pre-escala que se suman al `base` del atributo y se amplifican
por mods `ADD` (Serration, Hornet Strike, etc.). Fuente: `incarnon-evolutions.override.json`.

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de perk |
| :--- | :--- | :--- | :--- |
| `WEAPON_BASE_DAMAGE` | `WEAPON_DAMAGE` | BASE_FLAT | Boltor EVO II: +18 daño |
| `WEAPON_BASE_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | BASE_FLAT | Sibear EVO IV: +25% CC |
| `WEAPON_BASE_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | BASE_FLAT | Boltor EVO IV: +20% SC |
| `WEAPON_BASE_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | BASE_FLAT | Boltor EVO III: +20 magazine |

### WEAPON — sub-familia clase (D-6 extensión, activa 2026-05-26)

Patrón extendido: `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`.
Sin entrada en UPGRADE_MAP — `resolveToken()` los deriva automáticamente, emitiendo `target_channel`.
Deuda D-7: el pipeline de filtrado por canal no está implementado.

| Tipo OmniFrame D-6 | Engine attr derivado | Op | target_channel | Fuente |
| :--- | :--- | :--- | :--- | :--- |
| `WEAPON_PRIMARY_ADD_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | ADD | `primary` | Crimson Archon Shard |
| `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | ADD | `secondary` | Crimson Archon Shard |
| `WEAPON_MELEE_ADD_CRIT_MULT` | `WEAPON_ADD_CRIT_MULT` | ADD | `melee` | Crimson Archon Shard |

### AVATAR — habilidades

`attr = token` (auto-derivado).

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `AVATAR_ADD_ABILITY_STRENGTH` | `AVATAR_ADD_ABILITY_STRENGTH` | ADD | Intensify, Blind Rage |
| `AVATAR_ADD_ABILITY_RANGE` | `AVATAR_ADD_ABILITY_RANGE` | ADD | Stretch, Overextended |
| `AVATAR_ADD_ABILITY_DURATION` | `AVATAR_ADD_ABILITY_DURATION` | ADD | Continuity, Narrow Minded |
| `AVATAR_ADD_ABILITY_EFFICIENCY` | `AVATAR_ADD_ABILITY_EFFICIENCY` | ADD | Streamline, Fleeting Expertise |

### AVATAR — stats base

`attr = token` (auto-derivado).

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `AVATAR_ADD_HEALTH_MAX` | `AVATAR_ADD_HEALTH_MAX` | ADD | Vitality, Primed Vigor |
| `AVATAR_ADD_SHIELD_MAX` | `AVATAR_ADD_SHIELD_MAX` | ADD | Redirection, Primed Vigor |
| `AVATAR_ADD_ARMOUR` | `AVATAR_ADD_ARMOUR` | ADD | Steel Fiber, Warcry (habilidad) |
| `AVATAR_ADD_ENERGY_MAX` | `AVATAR_ADD_ENERGY_MAX` | ADD | Flow, Primed Flow |
| `AVATAR_ADD_MOVEMENT_SPEED` | `AVATAR_ADD_MOVEMENT_SPEED` | ADD | Rush |
| `AVATAR_ADD_SPRINT_SPEED` | `AVATAR_ADD_SPRINT_SPEED` | ADD | Rush |
| `AVATAR_ADD_CASTING_SPEED` | `AVATAR_ADD_CASTING_SPEED` | ADD | Natural Talent |
| `AVATAR_ADD_SHIELD_RECHARGE_RATE` | `AVATAR_ADD_SHIELD_RECHARGE_RATE` | ADD | Fast Deflection |
| `AVATAR_ADD_PARKOUR_VELOCITY` | `AVATAR_ADD_PARKOUR_VELOCITY` | ADD | Mobilize (aura), Amber Archon Shard |
| `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | ADD | Amber Archon Shard (+100/+150%) |
| `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | ADD | Amber Archon Shard (+50/+75%) |

### AVATAR — planos post-escala (ADD_FLAT)

Fórmula verificada (wiki + test en juego 2026-05-26):
```
Total = Base × (1 + Mods%) + FLAT
```
Los valores FLAT se suman **después** del pool de mods porcentuales. No se amplifican por Steel Fiber, Vitality, ni ningún otro mod.

| Tipo OmniFrame D-6 | Engine attr | Op | Fuentes confirmadas |
| :--- | :--- | :--- | :--- |
| `AVATAR_FLAT_HEALTH_MAX` | `AVATAR_FLAT_HEALTH_MAX` | ADD_FLAT | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_SHIELD_MAX` | `AVATAR_FLAT_SHIELD_MAX` | ADD_FLAT | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_ENERGY_MAX` | `AVATAR_FLAT_ENERGY_MAX` | ADD_FLAT | Azure Archon Shard (+50/+75) |
| `AVATAR_FLAT_ARMOUR` | `AVATAR_FLAT_ARMOUR` | ADD_FLAT | Azure Archon Shard (+150/+225), Stone Skin (Focus), Arcanos de armor |
| `AVATAR_FLAT_HEALTH_REGEN` | `AVATAR_FLAT_HEALTH_REGEN` | ADD_FLAT | Azure Archon Shard (+5/+7.5 Health/s), Rejuvenation (aura) |

> `AVATAR_BASE_ARMOUR` (BASE_FLAT) eliminado — no existe ninguna mecánica de armor pre-escala amplificada por mods. El token fue modelado incorrectamente; corregido 2026-05-26.

### GAMEPLAY

| Tipo OmniFrame D-6 | Engine attr | Op | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `GAMEPLAY_MULT_FACTION_DAMAGE` | `GAMEPLAY_MULT_FACTION_DAMAGE` | ADD | Bane of Grineer y familia |

> `toPercent: true` en UPGRADE_MAP — el JSON almacena el valor como `1.30` (+30%); el engine lo convierte a `30` para `mods_add_pct`.

---

## Deprecated

### Tipos DE heredados (no tienen entrada en UPGRADE_MAP)

Estos tipos aparecen en el override JSON de pipeline anterior y deben migrarse al tipo D-6
correspondiente. Si aparece un tipo deprecated sin migrar, el engine no emite modificador —
fallo silencioso detectable inspeccionando el output de `ModRepository`.

| Tipo DE (deprecated) | Tipo D-6 target |
| :--- | :--- |
| `WEAPON_PERCENT_BASE_DAMAGE_ADDED` | → derivar al tipo elemental específico |
| `WEAPON_DAMAGE_AMOUNT` | `WEAPON_ADD_DAMAGE` |
| `WEAPON_MELEE_DAMAGE` | `WEAPON_ADD_DAMAGE` (mismo target engine) |
| `WEAPON_FIRE_RATE` | `WEAPON_ADD_FIRE_RATE` |
| `WEAPON_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` |
| `WEAPON_CRIT_DAMAGE` | `WEAPON_ADD_CRIT_MULT` |
| `WEAPON_PROC_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` |
| `WEAPON_CLIP_MAX` | `WEAPON_ADD_MAGAZINE_MAX` |
| `WEAPON_RELOAD_SPEED` | `WEAPON_ADD_RELOAD_SPEED` |
| `AVATAR_ABILITY_STRENGTH` | `AVATAR_ADD_ABILITY_STRENGTH` |
| `AVATAR_ABILITY_RANGE` | `AVATAR_ADD_ABILITY_RANGE` |
| `AVATAR_ABILITY_DURATION` | `AVATAR_ADD_ABILITY_DURATION` |
| `AVATAR_ABILITY_EFFICIENCY` | `AVATAR_ADD_ABILITY_EFFICIENCY` |
| `AVATAR_HEALTH_MAX` | `AVATAR_ADD_HEALTH_MAX` |
| `AVATAR_SHIELD_MAX` | `AVATAR_ADD_SHIELD_MAX` |
| `AVATAR_ARMOUR` | `AVATAR_ADD_ARMOUR` |
| `AVATAR_POWER_MAX` | `AVATAR_ADD_ENERGY_MAX` |
| `AVATAR_MOVEMENT_SPEED` | `AVATAR_ADD_MOVEMENT_SPEED` |
| `AVATAR_SPRINT_SPEED` | `AVATAR_ADD_SPRINT_SPEED` |
| `AVATAR_CASTING_SPEED` | `AVATAR_ADD_CASTING_SPEED` |
| `AVATAR_SHIELD_RECHARGE_RATE` | `AVATAR_ADD_SHIELD_RECHARGE_RATE` |
| `GAMEPLAY_FACTION_DAMAGE` | `GAMEPLAY_MULT_FACTION_DAMAGE` |
| `WEAPON_PERCENT_*_DAMAGE_ADDED` (D-3) | `WEAPON_ADD_*_DAMAGE` (D-6) |

---

## Estado del pipeline

| Estado | Descripción |
| :--- | :--- |
| En UPGRADES[] | 55 tokens D-6 (inc. alias `WEAPON_FIRE_ITERATIONS` y 3 tokens sub-familia) |
| En UPGRADE_MAP (explícito) | 35 entradas — excepciones al patrón self-referencial |
| Via resolveToken() (implícito) | 20 tokens — elementales (17) + sub-familia (3) |
| Sin mapear (pipeline deuda) | ~114 tipos DE detectados en `mod-stats.override.json` — ver `.working/semantic-inventory.md` |
| Deprecated a migrar | 21 tipos DE + 17 D-3 listados en §Deprecated |

**Ubicación de UPGRADE_MAP**: `Project/src/shared/types/modifier.ts`
