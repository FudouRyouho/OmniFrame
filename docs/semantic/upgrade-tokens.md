---
Estado: "referencia"
Rol: "Taxonomía de UpgradeType — vocabulario canónico OmniFrame D-6"
Version: "v0.5.6"
Impacto_ID: "semantic-upgrade-tokens"
Fidelidad_Fisica: "Project/src/shared/types/modifier.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-06"
Dependencias:
  - "Project/src/shared/types/damage.ts"
  - "docs/data/schemas/mods/mods-schema.md"
  - "docs/semantic/damage-types.md"
---

# Upgrade Token Taxonomy

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

**Evidencia** (eje [EVD]: `docs/governance/deuda-taxonomy.md` · gramática de tags: `docs/governance/nomenclature-grammar.md`): cada sección declara su nivel por defecto.
Los `[ref: X]` apuntan a `references/wiki/mechanics/X`. Tokens con `⚠` requieren verificación — ver §Gate 1.

**Columna `Modelo`** — clasificación de modelado por capa de engine:

| Tag | Significado |
| :--- | :--- |
| `C1` | Atributo estándar — bucket ADD / FLAT / BASE / MULT según `Op`. El engine lo resuelve con la fórmula general. |
| `C1·F` | C1 con fórmula específica — no es un bucket estándar; requiere lógica propia en C1. |
| `C2·F` | Requiere SimulationContext o fórmula de C2 — la aplicación depende de estado de simulación (faction, combo, ability output). |
| `—` | No modelado — stat de manejo, economía o scope fuera del output de simulación (DPS / HP efectivo). Se muestra en UI como dato informativo. |

### WEAPON — daño global

> Evidencia por defecto: `[empirical]` — daño global es la mecánica más probada del juego.

| Tipo OmniFrame D-6 | Engine attr | Op | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- |
| `WEAPON_ADD_DAMAGE` | `WEAPON_DAMAGE` | ADD | `C1` | Serration, Hornet Strike, Pressure Point |

### WEAPON — derivados elementales y físicos

`resolveToken()` auto-deriva: **attr = token**, op = `ADD`. Sin entrada en UPGRADE_MAP (D-7b Fase 2).
> Evidencia por defecto: `[ref: damage-types.md]` para el tipo; `[empirical]` para la operación ADD.

| Tipo OmniFrame D-6 | Familia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- |
| `WEAPON_ADD_IMPACT_DAMAGE` | physical | `C1` | Heavy Trauma, Comet Blast, Rupture |
| `WEAPON_ADD_PUNCTURE_DAMAGE` | physical | `C1` | Piercing Hit, Bore, Flechette |
| `WEAPON_ADD_SLASH_DAMAGE` | physical | `C1` | Buzz Kill, Maim, Jagged Edge |
| `WEAPON_ADD_HEAT_DAMAGE` | elemental | `C1` | Hellfire, Molten Impact, Thermite Rounds |
| `WEAPON_ADD_COLD_DAMAGE` | elemental | `C1` | Cryo Rounds, Deep Freeze, North Wind |
| `WEAPON_ADD_ELECTRICITY_DAMAGE` | elemental | `C1` | Stormbringer, Convulsion, High Voltage |
| `WEAPON_ADD_TOXIN_DAMAGE` | elemental | `C1` | Infected Clip, Malignant Force, Fever Strike |
| `WEAPON_ADD_BLAST_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_CORROSIVE_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_GAS_DAMAGE` | combined | `C1` | Sin mods de adición directa conocidos — definido por completitud |
| `WEAPON_ADD_MAGNETIC_DAMAGE` | combined | `C1` | Magnetic Might |
| `WEAPON_ADD_RADIATION_DAMAGE` | combined | `C1` | Containment Breach, Atomic Fallout, Radiated Reload |
| `WEAPON_ADD_VIRAL_DAMAGE` | combined | `C1` | Damzav-Vati |
| `WEAPON_ADD_VOID_DAMAGE` | special | `C1` | Xaku (añade Void a armas vía habilidad — override de arma) |
| `WEAPON_ADD_TAU_DAMAGE` | special | `C1` | Venato unique trait |
| `WEAPON_ADD_TRUE_DAMAGE` | special | `C1` | Mecánicas de ejecución (Innodem y similares) |
| `WEAPON_ADD_NONE_DAMAGE` | special | `C1` | Sentinel — no debe aparecer en overrides de producción |

> Los tipos `combined` sin mods directos (blast, corrosive, gas) se incluyen porque la misma
> semántica se reutilizará en habilidades y augments.

**Patrón reservado** (daño plano pre-escala): `WEAPON_BASE_{TYPE}_DAMAGE`. No instanciar hasta
confirmar un mod o mecánica que lo requiera.

### WEAPON — stats de disparo y crítico

`attr = token` (auto-derivado) para todos, excepto `WEAPON_FIRE_ITERATIONS` (alias).
> Evidencia por defecto: `[ref]` a la mecánica indicada por token; `[empirical]` donde no hay doc dedicado.

| Tipo OmniFrame D-6 | Engine attr | Op | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WEAPON_ADD_FIRE_RATE` | `WEAPON_ADD_FIRE_RATE` | ADD | `[empirical]` | `C1` | Speed Trigger, Shred |
| `WEAPON_ADD_MULTISHOT` | `WEAPON_ADD_MULTISHOT` | ADD | `[ref: multishot.md]` | `C1` | Split Chamber, Galvanized Chamber |
| `WEAPON_FIRE_ITERATIONS` | `WEAPON_ADD_MULTISHOT` | ADD | `[ref: multishot.md]` | `C1` | Hell's Chamber, Galvanized Hell, Barrel Diffusion — alias pipeline `@wfcd/items`; resolución formal en OQ-ENGINE-6 |
| `WEAPON_ADD_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | ADD | `[ref: critical-hits.md]` | `C1` | Point Strike, True Steel |
| `WEAPON_ADD_CRIT_MULT` | `WEAPON_ADD_CRIT_MULT` | ADD | `[ref: critical-hits.md]` | `C1` | Vital Sense, True Steel |
| `WEAPON_ADD_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | ADD | `[ref: status-effects.md]` | `C1` | Infected Clip (60/60), High Voltage |
| `WEAPON_ADD_STATUS_DURATION` | `WEAPON_ADD_STATUS_DURATION` | ADD | `[ref: status-effects.md]` | `C1` | Lasting Sting, Continuous Misery (DE: `proc_time`) |
| `WEAPON_ADD_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | ADD | `[empirical]` | `C1` | Ammo Stock, Trick Mag |
| `WEAPON_ADD_AMMO_MAX` | `WEAPON_ADD_AMMO_MAX` | ADD | `[empirical]` | `—` | Ammo Drum, Ammo Chain, Shell Compression — pool total, distinto de MAGAZINE_MAX (cargador). `[ref: ammo.md]` |
| `WEAPON_ADD_RELOAD_SPEED` | `WEAPON_ADD_RELOAD_SPEED` | ADD | `[ref: reload.md]` | `C1` | Fast Hands, Tactical Reload |
| `WEAPON_ADD_STATUS_DAMAGE` | `WEAPON_ADD_STATUS_DAMAGE` | ADD | `[empirical]` | `C1` | Rifle/Shotgun/Pistol/Melee Elementalist (+90%) |
| `WEAPON_ADD_FINISHER_DAMAGE` | `WEAPON_ADD_FINISHER_DAMAGE` | ADD | `[empirical]` | `C1` | Finishing Touch, Covert Lethality |
| `WEAPON_ADD_SLAM_DAMAGE` | `WEAPON_ADD_SLAM_DAMAGE` | ADD | `[empirical]` | `C1` | Seismic Wave, Necramech Seismic Wave — daño de slam attack. Distinto de `WEAPON_ADD_SLAM_RADIUS` (radio de AoE del slam) |
| `WEAPON_ADD_HEADSHOT_MULT` | `WEAPON_ADD_HEADSHOT_MULT` | ADD ⚠ | `[needs-verification]` | `C1` | Primary/Secondary Deadhead "+30% to Headshot Multiplier". Op ADD confirmada por usuario. ⚠ Semántica: "headshot" en DE es legacy — hoy aplica a **cualquier weak point** del enemigo, no solo cabeza. Requiere doc `references/wiki/mechanics/weak-points.md` (fuente: wiki.warframe.com/w/Enemy_Body_Parts) antes de implementar en engine |
| `WEAPON_FLAT_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | ADD_FLAT ⚠ | `[empirical]` ⚠ | `C1·F` | Perk Incarnon (Felarx). ⚠ valor pre-dividido por base_multishot del perfil — modelado complejo, ver comentario en `modifier.ts` |
| `WEAPON_ADD_AMMO_EFFICIENCY` | `WEAPON_ADD_AMMO_EFFICIENCY` | ADD | `[empirical]` | `C1` | Brain Storm, Zazvat-Kar (mods); Arcane Pistoleer, Akimbo Slip Shot, Eternal Logistics, Primary Crux (arcanes). D-6 compliant; `resolveToken()` lo cubre. Reduce la tasa de consumo de munición por disparo. |

### WEAPON — puntería y movimiento de proyectil

`attr = token` (auto-derivado), op = ADD.
> Evidencia por defecto: `[empirical]` — stats de manejo conocidos; sin doc de mecánica dedicado.
> ⚠ Estos provienen de tokens crudos de DE absorbidos por el pipeline. Verificar nomenclatura DE vs D-6 en auditoría de mods.

| Tipo OmniFrame D-6 | Engine attr | Op | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WEAPON_ADD_ACCURACY` | `WEAPON_ADD_ACCURACY` | ADD | `[ref: accuracy.md]` | `—` | Pax Soar (arcane); exilus On-Equip. `WEAPON_SPREAD` (DE legacy) confirmado = **mismo stat** (spread = inverso de accuracy; Narrow Barrel / Tainted Shell llevan token spread con label "+% Accuracy") → unificar bajo este token. Sim asume aim perfecto — stat informativo. |
| `WEAPON_ADD_RECOIL` | `WEAPON_ADD_RECOIL` | ADD | `[empirical]` | `—` | Stabilizer, Steady Hands (valores negativos = reducción) |
| `WEAPON_ADD_PROJECTILE_SPEED` | `WEAPON_ADD_PROJECTILE_SPEED` | ADD | `[empirical]` | `—` | Terminal Velocity, Lightning Dash |
| `WEAPON_FLAT_PUNCH_THROUGH` | `WEAPON_FLAT_PUNCH_THROUGH` | ADD_FLAT | `[ref: punch-through.md]` | `—` | Penetración **flat en metros** (post-escala, nunca se amplifica). Metal Auger, Seeking Force, Vigilante Offense + stats Incarnon. Cadena de rename: `WEAPON_PUNCTURE_DEPTH` (misnomer DE-legacy) → `WEAPON_ADD_PUNCH_THROUGH` (2026-06-04, intermedio) → `WEAPON_FLAT_PUNCH_THROUGH` (2026-06-06; segmento D-6 `FLAT` → op `ADD_FLAT` vía `resolveToken`). 10 mods + 7 stats incarnon. Sin consumidor de engine aún: el modifier se produce, pero el nodo de arma `PUNCH_THROUGH` no existe (Capa 4 → OQ-ENGINE-7). |
| `WEAPON_ADD_ZOOM` | `WEAPON_ADD_ZOOM` | ADD | `[empirical]` | `—` | Eagle Eye (DE: `zoom`) |

### WEAPON — melee

`attr = token` (auto-derivado). Combo y heavy attack.
> Evidencia por defecto: `[ref: melee-combo.md]` para combo; `[empirical]` para el resto.

| Tipo OmniFrame D-6 | Engine attr | Op | Evidencia | Modelo | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WEAPON_ADD_RANGE` | `WEAPON_ADD_RANGE` | ADD | `[empirical]` | `—` | Reach, Primed Reach (alcance **melee**). Beam range movido a `WEAPON_ADD_BEAM_RANGE` (D-17, 2026-06-03); archgun `+% Range` (Ballista Measure) sigue aquí → OQ-DATA-7 |
| `WEAPON_ADD_BEAM_RANGE` | `WEAPON_ADD_BEAM_RANGE` | ADD | `[empirical]` | `—` | Alcance del rayo de armas continuas. Sinister Reach, Ruinous Extension, Sequence Burn, Galvanized Acceleration (split). Flat `+Xm` y `+%` conviven; unidad en label → OQ-DATA-8 |
| `WEAPON_ADD_SLAM_RADIUS` | `WEAPON_ADD_SLAM_RADIUS` | ADD | `[empirical]` | `—` | Mods de slam attack radius |
| `WEAPON_ADD_HEAVY_CHARGE_SPEED` | `WEAPON_ADD_HEAVY_CHARGE_SPEED` | ADD | `[empirical]` | `C1` | Corrupt Charge y similares |
| `WEAPON_ADD_COMBO_DURATION` | `WEAPON_ADD_COMBO_DURATION` | ADD | `[ref: melee-combo.md]` | `C1` | Body Count, Drifting Contact |
| `WEAPON_ADD_COMBO_COUNT_CHANCE` | `WEAPON_ADD_COMBO_COUNT_CHANCE` | ADD | `[empirical]` | `C1` | Exodia Triumph/Valor (arcanes), Guardian Derision (mod) — cross-schema |
| `WEAPON_ADD_LIFESTEAL` | `WEAPON_ADD_LIFESTEAL` | ADD | `[ref: life-steal.md]` | `—` | Life Strike (melee); Amalgam Daikyu Target Acquired, Winds of Purity (ranged); Exodia Might (arcano Zaw). No es melee-exclusivo — prefijo WEAPON correcto. Restricción de slot va por OQ-DATA-5. |

### WEAPON — perks base Incarnon (BASE_FLAT)

Tokens `BASE` — planos pre-escala que se suman al `base` del atributo y se amplifican
por mods `ADD` (Serration, Hornet Strike, etc.). Fuente: `incarnon-evolutions.override.json`.
> Evidencia por defecto: `[empirical]` para la operación BASE_FLAT (modelado OmniFrame, verificado contra valores de wiki Incarnon).

| Tipo OmniFrame D-6 | Engine attr | Op | Modelo | Ejemplo de perk |
| :--- | :--- | :--- | :--- | :--- |
| `WEAPON_BASE_DAMAGE` | `WEAPON_DAMAGE` | BASE_FLAT | `C1` | Boltor EVO II: +18 daño |
| `WEAPON_BASE_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | BASE_FLAT | `C1` | Sibear EVO IV: +25% CC |
| `WEAPON_BASE_CRIT_MULT` | `WEAPON_ADD_CRIT_MULT` | BASE_FLAT | `C1` | Perk Incarnon: BASE_FLAT de crit damage |
| `WEAPON_BASE_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | BASE_FLAT | `C1` | Boltor EVO IV: +20% SC |
| `WEAPON_BASE_MAGAZINE_MAX` | `WEAPON_ADD_MAGAZINE_MAX` | BASE_FLAT | `C1` | Boltor EVO III: +20 magazine |
| `WEAPON_BASE_COMBO_DURATION` | `WEAPON_ADD_COMBO_DURATION` | BASE_FLAT | `C1` | Perk melee: combo duration base |
| `WEAPON_BASE_COMBO_INITIAL` | `WEAPON_ADD_COMBO_INITIAL` | BASE_FLAT | `C1` | Melee Crescendo (arcane), perks melee |
| `WEAPON_BASE_HEAVY_EFFICIENCY` | `WEAPON_ADD_HEAVY_EFFICIENCY` | BASE_FLAT | `C1` | Perks de heavy attack efficiency |

> `WEAPON_ADD_COMBO_INITIAL` y `WEAPON_ADD_HEAVY_EFFICIENCY` son engine attrs (target de los tokens BASE),
> no tokens del vocabulario. No instanciar como `upgrade_type` sin mod/perk confirmado.

### WEAPON — sub-familia clase (D-6 extensión, activa 2026-05-26)

Patrón extendido: `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`.
Sin entrada en UPGRADE_MAP — `resolveToken()` los deriva automáticamente, emitiendo `target_channel`.
Deuda D-7: el pipeline de filtrado por canal no está implementado.

> ⚠ **Deuda alias-en-cadena (2026-06-01):** los sub-family de daño (`WEAPON_{PRIMARY,SECONDARY,MELEE}_ADD_DAMAGE`)
> derivan `attr = WEAPON_ADD_DAMAGE` (resolveToken línea ~210), que a su vez es **alias** de `WEAPON_DAMAGE`
> en UPGRADE_MAP. `resolveToken()` no encadena la segunda resolución → el attr final queda en `WEAPON_ADD_DAMAGE`
> en vez de `WEAPON_DAMAGE`. Los sub-family de fire_rate/reload/status/crit (auto-referenciales) no tienen este
> problema. Detectado al mapear arcanes sub-family (Arcane Precision/Rage/Primary Charger/Awakening/Rise/Blade
> Charger). **No bloquea captura de datos** (token correcto en el override); requiere fix de engine —re-resolver
> el alias o registrar UPGRADE_MAP entries— antes de implementar D-7. Canales válidos: solo `PRIMARY/SECONDARY/MELEE`
> (no hay `SNIPER`/`SHOTGUN` — son subtipos de primary, mapeados a `primary` + nota de restricción).
> Evidencia por defecto: `[empirical]` — fuente Archon Shards, verificada en juego.

| Tipo OmniFrame D-6 | Engine attr derivado | Op | target_channel | Modelo | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WEAPON_PRIMARY_ADD_STATUS_CHANCE` | `WEAPON_ADD_STATUS_CHANCE` | ADD | `primary` | `C1` | Crimson Archon Shard |
| `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | `WEAPON_ADD_CRIT_CHANCE` | ADD | `secondary` | `C1` | Crimson Archon Shard |
| `WEAPON_MELEE_ADD_CRIT_MULT` | `WEAPON_ADD_CRIT_MULT` | ADD | `melee` | `C1` | Crimson Archon Shard |

### AVATAR — habilidades

`attr = token` (auto-derivado).
> Evidencia por defecto: `[empirical]` — los 4 stats de habilidad son mecánica core conocida.

| Tipo OmniFrame D-6 | Engine attr | Op | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AVATAR_ADD_ABILITY_STRENGTH` | `AVATAR_ADD_ABILITY_STRENGTH` | ADD | `[empirical]` | `C1` | Intensify, Blind Rage |
| `AVATAR_ADD_ABILITY_RANGE` | `AVATAR_ADD_ABILITY_RANGE` | ADD | `[empirical]` | `C1` | Stretch, Overextended |
| `AVATAR_ADD_ABILITY_DURATION` | `AVATAR_ADD_ABILITY_DURATION` | ADD | `[empirical]` | `C1` | Continuity, Narrow Minded |
| `AVATAR_ADD_ABILITY_EFFICIENCY` | `AVATAR_ADD_ABILITY_EFFICIENCY` | ADD | `[empirical]` | `C1` | Streamline, Fleeting Expertise |
| `AVATAR_ADD_ABILITY_DAMAGE` | `AVATAR_ADD_ABILITY_DAMAGE` | ADD ⚠ | `[empirical]` ⚠ | `C2·F` | Archon Shards Topaz/Violet/Emerald — multiplicador directo sobre output de daño, condicional por status. ⚠ interacción con ABILITY_STRENGTH en engine sin definir |

### AVATAR — stats base

`attr = token` (auto-derivado).
> Evidencia por defecto: `[empirical]` — stats base del Warframe, ampliamente conocidos.

| Tipo OmniFrame D-6 | Engine attr | Op | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- |
| `AVATAR_ADD_HEALTH_MAX` | `AVATAR_ADD_HEALTH_MAX` | ADD | `C1` | Vitality, Primed Vigor |
| `AVATAR_ADD_SHIELD_MAX` | `AVATAR_ADD_SHIELD_MAX` | ADD | `C1` | Redirection, Primed Vigor |
| `AVATAR_ADD_ARMOUR` | `AVATAR_ADD_ARMOUR` | ADD | `C1` | Steel Fiber, Warcry (habilidad) |
| `AVATAR_ADD_ENERGY_MAX` | `AVATAR_ADD_ENERGY_MAX` | ADD | `C1` | Flow, Primed Flow |
| `AVATAR_ADD_MOVEMENT_SPEED` | `AVATAR_ADD_MOVEMENT_SPEED` | ADD | `—` | Rush |
| `AVATAR_ADD_SPRINT_SPEED` | `AVATAR_ADD_SPRINT_SPEED` | ADD | `—` | Rush |
| `AVATAR_ADD_CASTING_SPEED` | `AVATAR_ADD_CASTING_SPEED` | ADD | `—` | Natural Talent. Velocidad de animación de cast; no afecta output del simulador simplificado. |
| `AVATAR_ADD_SHIELD_RECHARGE_RATE` | `AVATAR_ADD_SHIELD_RECHARGE_RATE` | ADD | `C1` | Fast Deflection |
| `AVATAR_ADD_PARKOUR_VELOCITY` | `AVATAR_ADD_PARKOUR_VELOCITY` | ADD | `—` | Mobilize (aura), Amber Archon Shard |
| `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | ADD | `C1` | Amber Archon Shard (+100/+150%). Multiplicador estático sobre valor del orb; C2 lo usa al modelar economía de recursos. |
| `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | ADD | `C1` | Amber Archon Shard (+50/+75%). Ídem. Equilibrium añade complejidad de conversión — fórmula a definir en C2. |
| `AVATAR_ADD_HEALTH_REGEN` | `AVATAR_ADD_HEALTH_REGEN` | ADD_FLAT ⚠ | `C1` | Arcane Grace, Arcane Victory. ⚠ **Hipótesis usuario**: toda regen de salud en Warframe es plana (HP/s), no porcentual — si fuera %, solo Nidus (con regen nata) tendría base relevante. Si se confirma: este token es duplicado de `AVATAR_FLAT_HEALTH_REGEN` y debe colapsarse. Requiere verificación de valor real de Arcane Grace rank 5 en juego |
| `AVATAR_ADD_HEALTH_DAMAGE_TO_ENERGY` | `AVATAR_ADD_HEALTH_DAMAGE_TO_ENERGY` | ADD | `—` | Rage, Hunter Adrenaline, Kinetic Diversion, Necramech Rage. Convierte % del daño recibido en salud → energía. Renombrado del misnomer DE-legacy `AVATAR_DAMAGE_POWER_MULTIPLIER` (2026-06-04); premisa "escudos→energía (Kinetic Diversion)" desmentida vs raw — los 4 mods son salud→energía. Sin consumidor de engine aún. |

### AVATAR — planos post-escala (ADD_FLAT)

Fórmula verificada (wiki + test en juego 2026-05-26):
```
Total = Base × (1 + Mods%) + FLAT
```
Los valores FLAT se suman **después** del pool de mods porcentuales. No se amplifican por Steel Fiber, Vitality, ni ningún otro mod.
> Evidencia por defecto: `[ref: armor.md / health.md / shield.md]` + `[empirical]` (test en juego 2026-05-26).

| Tipo OmniFrame D-6 | Engine attr | Op | Modelo | Fuentes confirmadas |
| :--- | :--- | :--- | :--- | :--- |
| `AVATAR_FLAT_HEALTH_MAX` | `AVATAR_FLAT_HEALTH_MAX` | ADD_FLAT | `C1` | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_SHIELD_MAX` | `AVATAR_FLAT_SHIELD_MAX` | ADD_FLAT | `C1` | Azure Archon Shard (+150/+225) |
| `AVATAR_FLAT_ENERGY_MAX` | `AVATAR_FLAT_ENERGY_MAX` | ADD_FLAT | `C1` | Azure Archon Shard (+50/+75) |
| `AVATAR_FLAT_ARMOUR` | `AVATAR_FLAT_ARMOUR` | ADD_FLAT | `C1` | Azure Archon Shard (+150/+225), Stone Skin (Focus), Arcanos de armor |
| `AVATAR_FLAT_HEALTH_REGEN` | `AVATAR_FLAT_HEALTH_REGEN` | ADD_FLAT | `C1` | Azure Archon Shard (+5/+7.5 Health/s), Rejuvenation (aura) |
| `AVATAR_FLAT_ENERGY_REGEN` | `AVATAR_FLAT_ENERGY_REGEN` | ADD_FLAT ⚠ | `C1` | Energy Nexus, Energy Siphon (aura), Relentless Assault. ⚠ ¿la regen de energía es ADD_FLAT (E/s plano) o tiene mecánica de ramp-up (Energy Nexus sube con el tiempo)? |

> `AVATAR_BASE_ARMOUR` (BASE_FLAT) eliminado — no existe ninguna mecánica de armor pre-escala amplificada por mods. El token fue modelado incorrectamente; corregido 2026-05-26.

### AVATAR — chance de resistir proc (CHANCE-family, desviación D-6)

Tokens de familia `AVATAR_CHANCE_RESIST_*` no siguen D-6 estrictamente (CHANCE no es una OPERATION de la convención). `resolveToken()` no los cubre → sin entrada en UPGRADE_MAP por ahora. Modelado C2 diferido (Fase 0 los trata como `—`).

> Distinto de `AVATAR_INJURY_BLOCK_CHANCE` (resist knockdown/stagger/falls — de-facto pipeline, no D-6, no en UPGRADES aún).

| Tipo OmniFrame | Resistencia | Arcane fuente | Modelo |
| :--- | :--- | :--- | :--- |
| `AVATAR_CHANCE_RESIST_SLASH` | Slash Status | Arcane Deflection | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_PUNCTURE` | Puncture Status | Arcane Defense | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_IMPACT` | Impact Status | Arcane Shield | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_HEAT` | Heat Status | Arcane Ice | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_COLD` | Cold Status | Arcane Warmth | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_ELECTRICITY` | Electricity Status | — (no arcane existente) | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_TOXIN` | Toxin Status | Arcane Detoxifier, Arcane Resistance | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_RADIATION` | Radiation Status | Arcane Healing | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_CORROSIVE` | Corrosive Status | Arcane Protection | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_GAS` | Gas Status | Arcane Liquid | `—` (C2 futuro) |
| `AVATAR_CHANCE_RESIST_MAGNETIC` | Magnetic Status | Arcane Nullifier | `—` (C2 futuro) |

### GAMEPLAY

> Evidencia por defecto: ver por token.

| Tipo OmniFrame D-6 | Engine attr | Op | Evidencia | Modelo | Ejemplo de mod |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GAMEPLAY_MULT_FACTION_DAMAGE` | `GAMEPLAY_MULT_FACTION_DAMAGE` | ADD | `[empirical]` | `C2·F` | Bane of Grineer y familia. Requiere faction tag del target en SimulationContext. |
| `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | ADD ⚠ | `[needs-verification]` | `C2·F` | Archon Shard Emerald. Instancias aditivas. ⚠ Scope real sin confirmar. Afecta proc de Toxin en C2. |

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
| En UPGRADES[] | **93 tokens** = 82 D-6 (inc. alias `WEAPON_FIRE_ITERATIONS` y 3 tokens sub-familia) + 11 `AVATAR_CHANCE_RESIST_*` (desviación D-6, sin `UPGRADE_MAP`) — sincronizado con `modifier.ts` 2026-06-04 |
| Documentados aquí | 100% — delta code-vs-doc = 0 (verificado 2026-06-04) |
| En UPGRADE_MAP (explícito) | 40 entradas — excepciones al patrón self-referencial |
| Via resolveToken() (implícito) | elementales + sub-familia |
| Sin mapear (pipeline deuda) | tipos DE legacy en `mod-stats.override.json` — auditoría de aplicaciones en curso (Fase 2c) |
| Deprecated a migrar | listados en §Deprecated |

**Ubicación de UPGRADE_MAP**: `Project/src/shared/types/modifier.ts`

---

## Gate 1 — Definiciones que requieren verificación

Tokens marcados `⚠` en las tablas: definición plausible pero con evidencia floja
(`[needs-verification]`) o decisión de operación/modelado sin confirmar. **No usar en engine
hasta resolver** (regla anti "trust-me-bro", `docs/governance/deuda-taxonomy.md`).

| Token | Estado post-Gate 1 | Acción pendiente |
| :--- | :--- | :--- |
| `WEAPON_ADD_HEADSHOT_MULT` | Op ADD confirmada. ⚠ semántica: "headshot" = weak point en DE moderno, no solo cabeza | Crear `references/wiki/mechanics/weak-points.md` (fuente: wiki.warframe.com/w/Enemy_Body_Parts) |
| `WEAPON_FLAT_STATUS_CHANCE` | Sin resolver — modelado multi-pellet complejo | Investigación propia |
| `WEAPON_ADD_ACCURACY` | Sin resolver — ¿mismo stat que `WEAPON_SPREAD` (DE legacy)? | Investigación propia, auditoría mods Fase 2c |
| `AVATAR_ADD_ABILITY_DAMAGE` | Pending — engine de habilidades no diseñado aún | Defer hasta diseño de engine de habilidades |
| `AVATAR_ADD_HEALTH_REGEN` | Hipótesis usuario: toda regen en WF es plana (HP/s); si confirma → duplicado de `AVATAR_FLAT_HEALTH_REGEN` | Verificar valor real Arcane Grace rank 5 en juego; si confirma: colapsar token |
| `AVATAR_FLAT_ENERGY_REGEN` | Sin resolver — Energy Nexus puede tener ramp-up temporal | Investigación propia |
| `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | Sin sujeto de prueba (no hay companion/habilidad con Toxin conocida) | Pendiente más pruebas; no bloquea schema ni datos |
| `WEAPON_FIRE_ITERATIONS` | ✅ **Cerrado** — alias conocido con UPGRADE_MAP entry; OQ-ENGINE-6 trackea la resolución formal | — |

> Los ⚠ que quedan **no bloquean el mapeo de datos** (Fases 2a–2c) pero sí bloquean implementación en engine.
> Cada investigación pendiente es su propio volumen; no resolver aquí sin evidencia.
