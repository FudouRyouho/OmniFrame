---
Estado: "referencia"
Rol: "Diccionario canónico de condition tokens — semántica y capa de evaluación"
Impacto_ID: "SSoT-Data-Conditions"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Version: "1.0"
Fecha_de_creacion: "2026-05-28"
Fecha_de_actualizacion: "2026-05-28"
---

# Condition Vocabulary — Diccionario Canónico

Vocabulario de tokens de condición derivado de las fuentes de datos activas:
- `arcane-stats.override.json` — 121 stats con `condition` estructurado (snake_case)
- `incarnon-evolutions.override.json` — 383 notes con triggers en texto libre (~35 triggers únicos)
- `mod-stats.override.json` — sin conditions mapeadas aún

Los tokens de este documento son el **vocabulario canónico** al que deben normalizarse
todas las fuentes. Las variantes de texto libre del incarnon (mayúsculas inconsistentes,
redacciones distintas del mismo trigger) se mapean aquí a su forma canónica.

---

## Taxonomía — 4 capas de evaluación

El criterio de capa define **qué necesita el engine para evaluar la condición**, no su dificultad de implementación.

| Capa | Patrón | Evaluación | Ejemplos |
|---|---|---|---|
| **L1 — Estado** | `while_*` | flag booleano en `SimContext` ya calculado antes de la simulación | `while_shields_active`, `while_melee_equipped` |
| **L2 — Umbral** | `with_*_over/below_N` | comparar un stat del frame/arma contra un valor en `SimContext` | `with_armor_over_450`, `with_crit_chance_below_40` |
| **L3 — Evento** | `on_*` | trigger del sistema de eventos en runtime | `on_kill`, `on_critical_hit` |
| **L4 — Operador** | tokens de Operator/Amp | scope separado, fuera de weapon sim | `on_void_sling`, `on_transference_in` |

> **C1-A candidatos**: L1 y L2 — no requieren sistema de eventos, solo `SimContext` con flags/stats pre-calculados.
> L3 requiere que el engine dispare eventos; L4 está fuera del scope del weapon sim.

---

## L1 — Estado (`while_*`)

Flags booleanos evaluados antes de iniciar la simulación. El `SimContext` debe exponer cada flag.

| Token canónico | Fuentes | Texto libre equivalente (incarnon/arcanes) |
|---|---|---|
| `while_shields_active` | arcanes | "While Shields are Active", "while_shields_are_active" |
| `while_overshields_active` | arcanes | "While Overshields Active" |
| `while_melee_equipped` | incarnon | "With Melee Weapon Equipped" |
| `while_channeled_ability_active` | incarnon | "With Channeled Ability active", "With Channeled Ability Active" |
| `while_invisible` | arcanes | "While invisible" (parte de Arcane Crepuscular) |
| `while_airborne` | arcanes | "while Airborne" (parte de Pax Soar) |
| `while_sliding` | arcanes | "While sliding" |
| `while_aim_gliding` | arcanes | "aim gliding" (combinado con sliding) |
| `while_no_primary_equipped` | incarnon | "With No Primary Equipped" |
| `while_buffing_ally_warframes` | arcanes | "while Buffing Ally Warframes" |

> `while_sliding_or_aim_gliding` (token arcane actual) debe normalizarse a dos flags independientes
> o a un alias `while_evasion_active`. Decisión pendiente.

---

## L2 — Umbral (`with_*_over/below_N`)

Requieren comparar un stat de runtime contra un threshold. El valor N es parte del token
(cada umbral es un condition distinto, no parametrizable sin trabajo de diseño adicional).

| Token canónico | N | Stat requerido | Fuente |
|---|---|---|---|
| `with_armor_over_450` | 450 | Armor actual | incarnon (Boltor, Sibear, varios) |
| `with_armor_over_700` | 700 | Armor actual | incarnon (Arcane Persistence) |
| `with_energy_max_over_700` | 700 | Energy Max | incarnon ("With Energy Max Over 700") |
| `with_energy_at_or_above_90pct` | 90% | Energy % actual | arcanes (Primary Overcharge) |
| `with_sprint_speed_above_1_2` | 1.2 | Sprint Speed | incarnon |
| `with_crit_chance_below_40` | 40% | Crit Chance | incarnon (Furis) |

> Los valores N no son parametrizables en el schema actual. Un perk "With Armor Over 450"
> y un perk "With Armor Over 700" son dos tokens distintos. Alternativa futura: `condition_params`
> — fuera de scope de este documento.

---

## L3 — Evento (`on_*`)

Requieren que el engine dispare un evento en el momento exacto. El Modifier con esta condition
solo se activa dentro de la ventana del trigger (o durante la duración del buff generado).

### L3-A — Kills (todas las variantes)

| Token canónico | Variantes conocidas | Fuente |
|---|---|---|
| `on_kill` | "On Kill", "On kill" | arcanes, incarnon |
| `on_melee_kill` | "On Melee Kill" | arcanes, incarnon |
| `on_headshot_kill` | "On Headshot Kill", "On Headshot kill" | arcanes, incarnon |
| `on_precision_headshot_kill` | "On Precision Headshot Kill" | arcanes |
| `on_pistol_headshot_kill` | "On Pistol Headshot Kill" | arcanes |
| `on_primary_weapon_kill` | "On Primary Weapon Kill" | arcanes |
| `on_kitgun_kill` | "On Kitgun Kill" | arcanes |
| `on_heavy_attack_kill` | "On Heavy Attack Kill" | arcanes |
| `on_finisher_kill` | "On Finisher Kill" | arcanes, incarnon |
| `on_mercy_kill` | "On Mercy Kill" | arcanes |
| `on_bleed_kill` | "On Bleed Kill" | incarnon |
| `on_airborne_melee_kill` | "On Airborne Melee Kill" | incarnon |
| `on_shotgun_kill_within_5m` | "On shotgun kill within 5m of target" | arcanes |
| `on_6_melee_kills_within_30s` | literal | arcanes (Arcane Bodyguard) |

### L3-B — Hits y crits

| Token canónico | Variantes conocidas | Fuente |
|---|---|---|
| `on_hit` | "On Hit" | arcanes, incarnon |
| `on_melee_hit` | "On Melee Hit" | arcanes |
| `on_critical_hit` | "On Critical Hit" | arcanes, incarnon |
| `on_base_critical_hit` | "On Base Critical Hits" | arcanes |
| `on_headshot` | "On Headshot" | arcanes, incarnon |
| `on_weak_point_hit` | "On Weak Point Hit" | arcanes |
| `on_punch_through_hit` | "On Punch Through Hit" | incarnon |
| `on_punch_through_3_enemies` | "On Punch Through 3 enemies" | incarnon |
| `on_consecutive_weakpoint_hits` | "On Consecutive Weakpoint Hits" | incarnon |
| `on_full_burst_hit` | "On Full Burst Hit" | incarnon |
| `on_first_attack_with_primary` | "On First Attack With Primary Equipped" | incarnon |
| `on_2_headshots_within_2s` | "On 2 headshots within 2 seconds" | incarnon |
| `on_burst_headshots` | "On Burst Headshots" | incarnon |
| `on_neutral_combo_final_hit` | "On striking target with final move of Neutral Combo" | incarnon |

### L3-C — Status effects aplicados

| Token canónico | Variantes | Fuente |
|---|---|---|
| `on_status_effect` | "On Status Effect" | arcanes, incarnon |
| `on_cold_status_effect` | "On Cold Status Effect" | arcanes |
| `on_heat_status_effect` | "On Heat Status Effect" | arcanes |
| `on_toxin_status_effect` | "On Toxin Status Effect" | arcanes |
| `on_electricity_status_effect` | "On Electricity Status Effect" | arcanes |
| `on_puncture_status_effect` | "On Puncture Status Effect" | incarnon |
| `on_weapon_impact_status_effect` | "On Weapon Impact Status Effect" | arcanes |
| `on_weapon_magnetic_status_effect` | "On Weapon Magnetic Status Effect" | arcanes |
| `on_melee_electricity_status` | "On Melee Electricity Status" | arcanes |
| `on_hitting_enemies_afflicted_by_radiation_10` | "On hitting enemies afflicted by 10 stacks of Radiation" | arcanes |
| `on_hitting_enemies_affected_by_electricity` | "On hitting enemies affected by Electricity Status" | incarnon |
| `on_enemy_frozen` | "On Enemy Frozen" | arcanes |
| `on_shield_break` | "On Shield Break" | incarnon |

### L3-D — Acciones del jugador

| Token canónico | Variantes | Fuente |
|---|---|---|
| `on_reload` | "On Reload" | arcanes, incarnon |
| `on_reload_from_empty` | "On Reload From Empty", "On Reload from Empty", "On Reload from Empty Magazine" | arcanes, incarnon |
| `on_damaged` | "On Damaged" | arcanes |
| `on_health_damaged` | "On Health Damaged" | arcanes |
| `on_shield_damaged` | "On Shield Damaged" | arcanes |
| `on_predeath` | "On Predeath" | arcanes |
| `on_lethal_damage` | "On Lethal Damage" | arcanes |
| `on_block` | "On Block" | arcanes |
| `on_ground_slam` | "On Ground Slam" | arcanes |
| `on_wall_latch` | "On Wall Latch" | arcanes |
| `on_roll` | "On Roll" | arcanes |
| `on_ability_cast` | "On Ability Cast" | arcanes, incarnon |
| `on_finisher` | "On Finisher" | incarnon |
| `on_equip` | "On Equip" | incarnon |
| `on_equip_from_primary` | "On Equip From Primary", "On equip from Primary" | incarnon |
| `on_energy_pickup` | "On Energy Pickup" | arcanes |
| `on_health_pickup` | "On Health Pickup" | arcanes |
| `on_energy_depleted` | "On Energy Depleted" | arcanes |
| `on_archgun_equipped` | "On Archgun Equipped" | arcanes |
| `on_50_energy_spent` | "On 50 Energy Spent" | incarnon |
| `on_firing` | "On Firing" (disparando sostenido) | incarnon |

---

## L4 — Operador / Amp (scope separado)

Fuera del scope del weapon simulator. Se documentan para completitud.

| Token | Trigger |
|---|---|
| `on_void_sling` | Void Sling del Operador |
| `on_transference_in` | Entrar a modo Operador |
| `on_transference_out` | Salir del modo Operador |
| `on_transference_static` | Transference estática |
| `on_void_mode` | Activar Void Mode |
| `on_warframe_melee_transference` | Melee en Transference |
| `on_operator_ability` | Habilidad del Operador |
| `while_an_operator` | Mientras en modo Operador |
| `while_in_void_sling` | Durante Void Sling |

---

## Normalización pendiente

Los siguientes tokens en el override actual necesitan ser renombrados a la forma canónica:

| Token actual (override) | Token canónico | Archivo |
|---|---|---|
| `while_shields_are_active` | `while_shields_active` | arcane-stats.override.json |
| `while_sliding_or_aim_gliding` | decisión pendiente (ver §L1) | arcane-stats.override.json |
| `on_shotgun_kill_within_5m_of_target` | `on_shotgun_kill_within_5m` | arcane-stats.override.json |
| `on_hitting_enemies_afflicted_by_10_stacks_of_radiation` | `on_radiation_10_stacks` | arcane-stats.override.json |
| `while_at_or_above_90_energy` | `with_energy_at_or_above_90pct` | arcane-stats.override.json |
| `after_a_bullet_jump_or_double_jump` | `on_bullet_jump_or_double_jump` | arcane-stats.override.json |
| Incarnon notes: texto libre | token canónico de este doc | incarnon-evolutions.override.json |

> La normalización es trabajo de datos (scripts/patch), no de engine. Los overrides son SSoT —
> el engine leerá el token que esté en el JSON. Normalizar evita que el engine tenga que conocer
> múltiples aliases.

---

## Tokens de fuentes no cubiertas aún

Fuentes donde conditions existen pero no están mapeadas en los overrides:

| Fuente | Condiciones conocidas | Estado |
|---|---|---|
| `mod-stats.override.json` | Galvanized mods (on kill/headshot/status), Hunter mods (on Bleed), Vigilante (on crit) | sin `condition` en el override |
| `archon-shards.json` | Sin condiciones evidentes (efectos estáticos) | n/a |
| `ability-stats.override.json` | Sin condiciones (habilidades calculan su propio scaling) | fuera de scope |

---

## Resumen por capa — cobertura actual

| Capa | Tokens definidos | En arcanes | En incarnon | En mods |
|---|---|---|---|---|
| L1 — Estado | 10 | 6 mapeados | 4 en notes | 0 |
| L2 — Umbral | 6 | 1 | 5 en notes | 0 |
| L3 — Evento | ~60 | 43 mapeados | ~30 en notes | 0 (galvanizados pendientes) |
| L4 — Operador | 9 | 9 mapeados | 0 | 0 |

Los **~16 tokens L1+L2** son los candidatos inmediatos para C1-A porque no requieren
sistema de eventos — solo `context.flags` y `context.stats` en `SimContext`.
