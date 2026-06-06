---
Estado: "referencia"
Rol: "Diccionario consolidado de condition tokens — vocabulario endógeno derivado de labels (D-19)"
Impacto_ID: "semantic-conditions"
Fidelidad_Fisica: "Project/public/data/"
Version: "v1.14.0"
Fecha_de_creacion: "2026-05-28"
Fecha_de_actualizacion: "2026-06-05"
Fuentes: "arcane-stats, incarnon-evolutions, mod-stats (exilus), archon-shards"
---

# Condition Vocabulary — Diccionario Consolidado

Diccionario de tokens de condición presentes en los overrides de inteligencia manual:
- `arcane-stats.override.json` — stats con `condition` estructurado (snake_case)
- `incarnon-evolutions.override.json` — triggers consolidados en `condition` desde el label
- `mod-stats.override.json` — exilus weapon mods en mapeo activo (galvanizados pendientes)

## Naturaleza de este documento (D-19)

`condition` es **endógeno**: a diferencia de `upgrade_*` —que entra desde tipos DE de
`@wfcd/items` y se normaliza a la taxonomía D-6 (`upgrade-tokens.md`)— `condition` no existe
en ninguna fuente externa. Nace de **leer, auditar y confirmar el label**, cuya única
trazabilidad es el texto ruidoso de la wiki/juego. (Verificado 2026-06-01: `ability-stats` no
tiene `condition` ni en dato ni en schema; `condition` vive solo en mods, arcanes e incarnon.)

Por eso este documento es un **consolidador posterior**, no un portero previo:

- El **SSoT de los tokens es el override JSON** — es el frente de captura. Un token nuevo nace
  ahí, derivado directo del label, "como viene".
- Este documento **consolida** lo capturado: elige la forma canónica cuando hay variantes de
  redacción, agrupa, y documenta la semántica **a medida que madura**.
- Un token presente en un override pero ausente de aquí **no es drift ni deuda** — es *cola de
  consolidación*. La normalización ocurre cuando se define, no como requisito de entrada.
- **No se asume equivalencia entre tokens por parecido de label.** Labels similares pueden
  esconder mecánicas distintas (la nube de gas de Dual Ichor reactiva su propio efecto; la de
  Furax no). Colapsar tokens es análisis de naturaleza, no de redacción.

Los prefijos `on_` / `while_` / `with_` son la señal más temprana de naturaleza (qué fórmula
aplicará el engine) y se preservan literales. Las secciones de abajo agrupan los tokens **por
prefijo** — organización emergente de lo capturado, no una taxonomía cerrada con reglas de
derivación como la de `upgrade_*`. La única clasificación con contenido mecánico es el **Modelo**
(`engine:class:c2/*`): qué debe computar el engine para evaluar la condición.

> **Evidencia** (taxonomía: `docs/governance/deuda-taxonomy.md`): la mayoría de condition tokens
> son **auto-evidentes** — el trigger del label ES la condición (`on_kill` = al matar). Evidencia
> por defecto: `[empirical]`. Las definiciones con incertidumbre real (composición OR no expresable,
> umbrales no listados en UI, dependencia de contexto sin diseñar) se listan en §Gate 1 abajo.

### Altitud de los debates (estado de madurez)

Esta taxonomía **no está consolidada**: no tiene capas reales ni una estructura de derivación
como `upgrade_*` (que sí entra normalizado desde tipos DE). Sus únicos agrupadores hoy son los
**prefijos dominantes** (`on_`/`while_`/`with_`/`per_`), organización emergente — no una jerarquía
cerrada. Mientras esto siga así, los debates de ingesta se resuelven al nivel de **coherencia mínima**
(¿el token nombra la condición del label sin colapsar mecánicas distintas?), **no de rigor semántico**
(naturaleza, modelo `c2/*`, capa). La clasificación fina se difiere hasta que exista una capa de semántica
derivada con estructura propia. Acuñar un token nuevo con `modelo: diferido` es la norma, no la excepción.

---

## Modelo de evaluación (`engine:class:c2/*`)

La única clasificación con contenido mecánico: **qué necesita el SimulationContext para evaluar cada condition**. Usa la [gramática canónica](../governance/nomenclature-grammar.md):

> ⚠ **Eje bajo revisión ([OQ-SEM-2](../governance/open-questions.md)):** esta clasificación está anclada al modelo de un engine que aún no existe. Está abierto si el eje primario debería ser la **mecánica real del juego** (estado/evento/umbral/maniobra) y dejar `engine:class:c2/*` como proyección derivada.
>
> La taxonomía de naturaleza (eje mecánico) se formaliza —a título de análisis— en [`condition-nature.md`](condition-nature.md): allí `engine:class:c2/*` aparece como **columna derivada** de la naturaleza. Este `§Modelo` es esa misma información vista desde el engine; `condition-nature.md` la ve desde el juego.

| Tag (gramática) | Significado |
| :--- | :--- |
| `engine:class:c2/binary` | Flag booleano en SimContext. No requiere cálculo — se activa desde el loadout o el estado del jugador antes de simular. |
| `engine:class:c2/derived` | Comparación de un stat de C1/SimContext contra un threshold. El stat ya existe; solo falta la comparación. |
| `engine:class:c2/event` | C2 dispara un evento en el momento exacto del trigger (`on_kill`, `on_hit`, etc.). Requiere sistema de eventos. |
| `engine:class:c2/stack` | Evento con contador + ventana temporal ("N eventos en Xs"). Requiere lógica de counting en C2. |
| `—` | Fuera del scope del weapon simulator — Operator scope, multiplayer, loadout multi-arma o schema blocker OR. |

---

## Estado (`while_*`)

Flags booleanos evaluados antes de iniciar la simulación. El `SimContext` debe exponer cada flag.

| Token canónico | Fuentes | Modelo | Texto libre equivalente (incarnon/arcanes) |
|---|---|---|---|
| `while_shields_active` | arcanes | `engine:class:c2/binary` | "While Shields are Active", "while_shields_are_active" |
| `while_overshields_active` | arcanes | `engine:class:c2/binary` | "While Overshields Active" |
| `while_melee_equipped` | incarnon | `engine:class:c2/binary` | "With Melee Weapon Equipped" |
| `while_channeled_ability_active` | incarnon | `engine:class:c2/binary` | "With Channeled Ability active", "With Channeled Ability Active" |
| `while_invisible` | arcanes | `engine:class:c2/binary` | "While invisible" (parte de Arcane Crepuscular) |
| `while_airborne` | arcanes, mods exilus | `engine:class:c2/binary` | "while Airborne" (Pax Soar), "when Airborne" (Soaring Strike, Air Thrusters) |
| `while_grounded` | incarnon | `engine:class:c2/binary` | "while grounded" — opuesto de `while_airborne`; el jugador está en contacto con el suelo |
| `while_aiming` | mods exilus | `engine:class:c2/binary` | "when Aiming", "while Aiming" — ADS activo (suelo o aire) |
| `while_sliding` | arcanes, mods exilus | `engine:class:c2/binary` | "While sliding", "when Sliding" |
| `while_aim_gliding` | arcanes, mods exilus | `engine:class:c2/binary` | "while Aim Gliding" — mecánica nombrada de Warframe: ADS sostenido en el aire que frena la caída. Distinto de `while_aiming` (no aplica en suelo) y de `while_airborne` (no requiere ADS). Ver wiki: Maneuvers. |
| `while_holstered` | mods exilus | `—` | "when Holstered", "+X%/s when Holstered" — estado continuo de arma guardada. **Nota:** depende de si el sim tiene noción de "arma activa"; si no la tiene, este flag no es evaluable. Posponer evaluación hasta diseño de contexto multi-arma. |
| `while_blocking` | mods exilus | `engine:class:c2/binary` | "while Blocking" — estado continuo de bloqueo sostenido. Distinto de `on_block` (L3 evento de parry/bloqueo puntual). |
| `while_no_primary_equipped` | incarnon | `engine:class:c2/binary` | "With No Primary Equipped" |
| `while_buffing_ally_warframes` | arcanes | `—` | "while Buffing Ally Warframes" — requiere contexto multiplayer; fuera del scope del sim personal. |
| `while_magazine_empty` | incarnon | `engine:class:c2/derived` | "while the magazine is empty" — derivado del estado de ammo actual; no es un flag pre-calculado sino estado de runtime. |
| `while_incarnon_form` | incarnon | `engine:class:c2/binary` | "On the Incarnon form", "on Incarnon mode" — estado activo del modo Incarnon del arma. Distinto de `on_equip_from_primary` (evento de cambio) — este es el estado continuo mientras se está en forma Incarnon |
| `while_dread_and_hate_equipped` | incarnon | `engine:class:c2/binary` | "With Dread and Hate equipped" — par específico de stalker weapons equipadas simultáneamente. Estado de loadout. Token por par (no genérico) por precedente de especificidad de umbrales N. Fuente: Despair Incarnon Genesis |
| `while_hate_and_despair_equipped` | incarnon | `engine:class:c2/binary` | "With Hate and Despair Equipped" — ídem, par Hate+Despair |
| `while_dread_and_despair_equipped` | incarnon | `engine:class:c2/binary` | "With Dread and Despair equipped" — ídem, par Dread+Despair |

> **OR de movimiento (`while_sliding` ∨ `while_aim_gliding`)** — **resuelto (Fase 3b, 2026-06-05):**
> migrado del token-paraguas `while_sliding_or_aim_gliding` a `condition: {any:["while_sliding","while_aim_gliding"]}`
> en arcane (Akimbo Slip Shot) e incarnon (Agile Executor, Feather of Justice). El shape obj-key
> (prototipo, `../data/rules/overrides.md §Prototipo`) lo expresa; `evalCondition` lo evalúa.

---

## Umbral (`with_*_over/below_N`)

Requieren comparar un stat de runtime contra un threshold. El valor N es parte del token
(cada umbral es un condition distinto, no parametrizable sin trabajo de diseño adicional).

| Token canónico | N | Stat requerido | Modelo | Fuente |
|---|---|---|---|---|
| `with_armor_over_450` | 450 | Armor actual | `engine:class:c2/derived` | incarnon (Boltor, Sibear, varios) |
| `with_armor_over_700` | 700 | Armor actual | `engine:class:c2/derived` | incarnon (Arcane Persistence) |
| `with_energy_max_over_200` | 200 | Energy Max | `engine:class:c2/derived` | incarnon (Dual Toxocyst — requisito "unlisted", no aparece en UI del juego; descubierto por la comunidad) |
| `with_energy_max_over_700` | 700 | Energy Max | `engine:class:c2/derived` | incarnon (Angstrum, Atomos) |
| `with_energy_at_or_above_90pct` | 90% | Energy % actual | `engine:class:c2/derived` | arcanes (Primary Overcharge). Nota: requiere energía *actual* (runtime), no solo max — SimContext necesita exponer el % de energía como stat de input. |
| `with_sprint_speed_above_1_2` | 1.2 | Sprint Speed | `engine:class:c2/derived` | incarnon |
| `with_crit_chance_below_40` | 40% | Crit Chance | `engine:class:c2/derived` | incarnon (Furis) |
| `with_crit_chance_below_50` | 50% | Crit Chance | `engine:class:c2/derived` | incarnon (Braton Incarnon Genesis) |
| `with_energy_max_over_500` | 500 | Energy Max | `engine:class:c2/derived` | archon shards (Violet — "while high energy") |

> Los valores N no son parametrizables en el schema actual. Un perk "With Armor Over 450"
> y un perk "With Armor Over 700" son dos tokens distintos. Alternativa futura: `condition_params`
> — fuera de scope de este documento.

---

## Evento (`on_*`)

Requieren que el engine dispare un evento en el momento exacto. El Modifier con esta condition
solo se activa dentro de la ventana del trigger (o durante la duración del buff generado).

### Kills (todas las variantes)

| Token canónico | Variantes conocidas | Modelo | Fuente |
|---|---|---|---|
| `on_kill` | "On Kill", "On kill" | `engine:class:c2/event` | arcanes, incarnon |
| `on_melee_kill` | "On Melee Kill" | `engine:class:c2/event` | arcanes, incarnon |
| `on_headshot_kill` | "On Headshot Kill", "On Headshot kill" | `engine:class:c2/event` | arcanes, incarnon |
| `on_precision_headshot_kill` | "On Precision Headshot Kill" | `engine:class:c2/event` | arcanes |
| `on_pistol_headshot_kill` | "On Pistol Headshot Kill" | `engine:class:c2/event` | arcanes |
| `on_primary_weapon_kill` | "On Primary Weapon Kill" | `engine:class:c2/event` | arcanes |
| `on_kitgun_kill` | "On Kitgun Kill" | `engine:class:c2/event` | arcanes |
| `on_heavy_attack_kill` | "On Heavy Attack Kill" | `engine:class:c2/event` | arcanes |
| `on_finisher_kill` | "On Finisher Kill" | `engine:class:c2/event` | arcanes, incarnon |
| `on_mercy_kill` | "On Mercy Kill" | `engine:class:c2/event` | arcanes |
| `on_bleed_kill` | "On Bleed Kill" | `engine:class:c2/event` | incarnon |
| `on_airborne_melee_kill` | "On Airborne Melee Kill" | `engine:class:c2/event` | incarnon |
| `on_shotgun_kill_within_5m` | "On shotgun kill within 5m of target" | `engine:class:c2/event` | arcanes |
| `on_6_melee_kills_within_30s` | literal | `engine:class:c2/stack` | arcanes (Arcane Bodyguard) |
| `on_slide_kill` | "On Slide Kill" — kill ejecutado durante un slide | `engine:class:c2/event` | incarnon (Praedos) |
| `on_heat_status_kill` | "On Heat-status kill" — kill en un enemigo que tenía Heat status activo al morir. El trigger es el estado del **target**, no la fuente del kill. | `engine:class:c2/event` | archon shards (Topaz) |

### Hits y crits

| Token canónico | Variantes conocidas | Modelo | Fuente |
|---|---|---|---|
| `on_hit` | "On Hit" | `engine:class:c2/event` | arcanes, incarnon |
| `on_melee_hit` | "On Melee Hit" | `engine:class:c2/event` | arcanes |
| `on_heavy_attack_hit` | "On Heavy Attack Hit" — sub-evento de melee, distinto de `on_heavy_attack_kill` | `engine:class:c2/event` | mods exilus |
| `on_critical_hit` | "On Critical Hit", "apply on Critical" | `engine:class:c2/event` | arcanes, incarnon, mods (Hunter Munitions) |
| `on_base_critical_hit` | "On Base Critical Hits" — normalizado desde `on_base_critical_hits` (plural); forma canónica: singular | `engine:class:c2/event` | arcanes |
| `on_headshot` | "On Headshot" | `engine:class:c2/event` | arcanes, incarnon |
| `on_weakpoint_hit` | "On Weakpoint Hits", "On Weak Point Hit" | `engine:class:c2/event` | arcanes, incarnon |
| `on_punch_through_hit` | "On Punch Through Hit" | `engine:class:c2/event` | incarnon |
| `on_punch_through_3_enemies` | "On Punch Through 3 enemies" | `engine:class:c2/stack` | incarnon |
| `on_consecutive_weakpoint_hits` | "On Consecutive Weakpoint Hits" | `engine:class:c2/stack` | incarnon |
| `on_full_burst_hit` | "On Full Burst Hit" | `engine:class:c2/event` | incarnon |
| `on_first_attack_with_primary` | "On First Attack With Primary Equipped" | `engine:class:c2/event` | incarnon |
| `on_2_headshots_within_2s` | "On 2 headshots within 2 seconds" | `engine:class:c2/stack` | incarnon |
| `on_burst_headshots` | "On Burst Headshots" | `engine:class:c2/stack` | incarnon |
| `on_neutral_combo_final_hit` | "On striking target with final move of Neutral Combo" | `engine:class:c2/event` | incarnon |
| `on_non_crit_non_status_hit` | "On Hit that is neither Critical nor applies a Status Effect" — hit que no fue crítico ni aplicó status; gatillo de Devouring/Overwhelming Attrition | `engine:class:c2/event` | incarnon (Laetum, Phenmor) |

### Status effects aplicados

| Token canónico | Variantes | Modelo | Fuente |
|---|---|---|---|
| `on_status_effect` | "On Status Effect" | `engine:class:c2/event` | arcanes, incarnon |
| `on_cold_status_effect` | "On Cold Status Effect" | `engine:class:c2/event` | arcanes |
| `on_heat_status_effect` | "On Heat Status Effect" | `engine:class:c2/event` | arcanes |
| `on_toxin_status_effect` | "On Toxin Status Effect" | `engine:class:c2/event` | arcanes |
| `on_electricity_status_effect` | "On Electricity Status Effect" | `engine:class:c2/event` | arcanes |
| `on_puncture_status_effect` | "On Puncture Status Effect" | `engine:class:c2/event` | incarnon |
| `on_weapon_impact_status_effect` | "On Weapon Impact Status Effect" | `engine:class:c2/event` | arcanes |
| `on_weapon_magnetic_status_effect` | "On Weapon Magnetic Status Effect" | `engine:class:c2/event` | arcanes |
| `on_melee_electricity_status` | "On Melee Electricity Status" | `engine:class:c2/event` | arcanes |
| `on_hitting_enemies_affected_by_radiation` | "On hitting enemies affected by Radiation" — cualquier stack de Radiation activo en el target | `engine:class:c2/event` | archon shards (Topaz) |
| `on_hitting_enemies_affected_by_radiation_10` | "On hitting enemies afflicted by 10 stacks of Radiation" — requiere exactamente 10 stacks; normalizado a `affected_by` (el juego usa "afflicted" como sinónimo) | `engine:class:c2/stack` | arcanes |
| `on_hitting_enemies_affected_by_corrosive` | "On hitting enemies affected by Corrosive" — cualquier stack de Corrosive activo en el target | `engine:class:c2/event` | archon shards (Emerald) |
| `on_hitting_enemies_affected_by_electricity` | "On hitting enemies affected by Electricity Status" | `engine:class:c2/event` | incarnon |
| `on_hitting_enemies_affected_by_cold` | "on targets affected by Cold Status" — el estado ya existe en el target independientemente de la fuente | `engine:class:c2/event` | incarnon |
| `on_hitting_enemies_affected_by_slash` | "on targets affected by Slash Status" | `engine:class:c2/event` | incarnon |
| `on_hitting_enemies_affected_by_toxin` | "on targets affected by Toxin" | `engine:class:c2/event` | incarnon |
| `on_killing_enemies_with_3_cold_stacks` | "On Killing Enemy With 3+ Cold Stacks" — kill con mínimo 3 stacks de Cold activos en el target. Número en el token por precedente de `radiation_10`. Fuente: Sibear Incarnon Genesis | `engine:class:c2/stack` | incarnon |
| `on_killing_enemies_with_3_toxin_stacks` | "On killing an enemy with 3+ Toxin Stacks" — ídem, Toxin. Fuente: Dual Ichor Incarnon Genesis | `engine:class:c2/stack` | incarnon |
| `on_enemy_frozen` | "On Enemy Frozen" | `engine:class:c2/event` | arcanes |
| `on_shield_break` | "On Shield Break" | `engine:class:c2/event` | incarnon |
| ~~`on_shield_or_overguard_break`~~ | "On Shield/Overguard break" — OR de break de Shield O de Overguard. **migrado (Fase 4)** → `{any:["on_shield_break","on_overguard_break"]}`. | `—` | incarnon |
| `on_bleed_proc` | "On Bleed proc" — DoT de Slash *tickea* sobre un target. Semánticamente distinto de `on_slash_status_effect` (que es la *aplicación* del proc al hit). Patrón extensible: `on_heat_proc`, `on_toxin_proc`, etc., solo se registran con evidencia en fuentes | `engine:class:c2/event` | mods Hunter/Vigilante |

### Acciones del jugador

| Token canónico | Variantes | Modelo | Fuente |
|---|---|---|---|
| `on_reload` | "On Reload" | `engine:class:c2/event` | arcanes, incarnon |
| `on_reload_from_empty` | "On Reload From Empty", "On Reload from Empty", "On Reload from Empty Magazine" | `engine:class:c2/event` | arcanes, incarnon |
| `on_damaged` | "On Damaged" | `engine:class:c2/event` | arcanes |
| `on_health_damaged` | "On Health Damaged" | `engine:class:c2/event` | arcanes |
| `on_shield_damaged` | "On Shield Damaged" | `engine:class:c2/event` | arcanes |
| `on_predeath` | "On Predeath" | `engine:class:c2/event` | arcanes |
| `on_lethal_damage` | "On Lethal Damage" | `engine:class:c2/event` | arcanes |
| `on_block` | "On Block" | `engine:class:c2/event` | arcanes |
| `on_ground_slam` | "On Ground Slam" | `engine:class:c2/event` | arcanes |
| `on_wall_latch` | "On Wall Latch" | `engine:class:c2/event` | arcanes |
| `on_roll` | "On Roll" | `engine:class:c2/event` | arcanes |
| `on_ability_cast` | "On Ability Cast" | `engine:class:c2/event` | arcanes, incarnon |
| `on_finisher` | "On Finisher" | `engine:class:c2/event` | incarnon |
| `on_equip` | "On Equip" | `engine:class:c2/event` | incarnon |
| `on_equip_from_primary` | "On Equip From Primary", "On equip from Primary" | `engine:class:c2/event` | incarnon |
| `on_energy_pickup` | "On Energy Pickup" | `engine:class:c2/event` | arcanes |
| `on_health_pickup` | "On Health Pickup" | `engine:class:c2/event` | arcanes |
| `on_energy_depleted` | "On Energy Depleted" | `engine:class:c2/event` | arcanes |
| `on_archgun_equipped` | "On Archgun Equipped" | `engine:class:c2/event` | arcanes |
| `on_50_energy_spent` | "On 50 Energy Spent" | `engine:class:c2/stack` | incarnon |
| `on_firing` | "On Firing" (disparando sostenido) | `engine:class:c2/event` | incarnon |
| `on_slide_attack` | "on Slide Attacks" — ataque melee ejecutado durante un slide; evento puntual | `engine:class:c2/event` | incarnon |
| `on_tennokai_attack` | "on Tennokai attacks" — mecánica de Whispers in the Walls; la ventana de Tennokai es un evento puntual, no un estado continuo | `engine:class:c2/event` | mods exilus |

---

## Operador / Amp (scope separado)

Fuera del scope del weapon simulator. Se documentan para completitud.

| Token | Modelo | Trigger |
|---|---|---|
| `on_void_sling` | `—` | Void Sling del Operador |
| `on_transference_in` | `—` | Entrar a modo Operador |
| `on_transference_out` | `—` | Salir del modo Operador |
| `on_transference_static` | `—` | Transference estática |
| `on_void_mode` | `—` | Activar Void Mode |
| `on_warframe_melee_transference` | `—` | Melee en Transference |
| `on_operator_ability` | `—` | Habilidad del Operador |
| `while_an_operator` | `—` | Mientras en modo Operador |
| `while_in_void_sling` | `—` | Durante Void Sling |

---

## Consolidación pendiente

Tokens capturados en los overrides cuya forma canónica aún no se consolidó aquí. No es deuda ni
drift (D-19) — es cola de consolidación; se resuelve al definir, no como requisito previo:

| Token actual (override) | Token canónico | Archivo |
|---|---|---|
| ~~`while_sliding_or_aim_gliding`~~ | **resuelto (Fase 3b, 2026-06-05)** — migrado a `{any:["while_sliding","while_aim_gliding"]}` | arcane-stats.override.json |
| ~~Incarnon notes: texto libre~~ | **mapeado (2026-05-30)** — `condition` token en `stats[]` | incarnon-evolutions.override.json |

> **Incarnon completado (2026-05-30):** los 120 stats condicionales del override usan `condition`
> con token canónico. El mapeo trigger→token se aplicó vía patch one-off (purgado tras uso; ver git history).
> 5 tokens nuevos añadidos a este vocabulario (`on_slide_kill`, `on_non_crit_non_status_hit`,
> 3× `while_*_equipped` de stalker pairs).

## Ingesta incarnon (2026-06-01) — cola de clasificación

Tokens capturados en `incarnon-evolutions.override.json` durante la auditoría de contraste del
2026-06-01. Ingresan **a nivel texto** (D-19: el override es SSoT del token). La clasificación de
**naturaleza, modelo (`engine:class:c2/*`) y scope queda diferida** hasta tener más datos — no se
fuerza aquí para no pre-juzgar. El token vive literal; la consolidación ocurre al definir, no al ingresar.

### G1 — normalización aplicada / pendiente

- **`on_weakpoint_hit`** confirmado como forma canónica (2026-06-01). Misma mecánica de weak point;
  pura diferencia de redacción. Drift cerrado: arcanes migró su única instancia `on_weak_point_hit`
  → `on_weakpoint_hit` en `arcane-stats.override.json`.
- ~~`while_aim_gliding_or_sliding`~~ — **resuelto (Fase 3b, 2026-06-05):** los dos labels que cubría
  (el "and" coloquial de Agile Executor y el "or" de Feather of Justice) son mecánicamente **OR**
  (aim-gliding y sliding se excluyen). Migrados a `{any:["while_aim_gliding","while_sliding"]}` — el
  "and" del label **no** derivó el operador; lo fijó la mecánica de co-ocurrencia. Mismo destino que el paraguas de arcanes.

### G2 — `while_target_affected_by_*` (requieren análisis propio)

Familia capturada con prefijo `while_` (estado del target). **No se asume equivalencia** con la
familia documentada `on_hitting_enemies_affected_by_*` (evento) pese al parecido de label: la
naturaleza real depende de **cómo se aplica cada condición**, registrado en las `notes[]` del perk
(p.ej. *Alchemist's Wrath* documenta que `while_target_affected_by_toxin` también lo disparan los
campos de toxin, no solo ataques directos — no es análogo a un hit puntual). Análisis caso por caso, diferido.

| Token | Perk / fuente | Conflicto a resolver |
|---|---|---|
| `while_target_affected_by_toxin` | Alchemist's Wrath | label "on targets affected" vs notes "campos de toxin disparan también" |
| `while_target_affected_by_cold` | Master's Shatter | "additional Combo on targets affected by Cold" — ¿estado o evento? |
| `while_target_affected_by_slash` | Seeing Red | "additional Combos on targets affected by Slash" — sin notes aún |
| `while_target_affected_by_electricity` | Stormburst | label dice "On hitting enemies affected by Electricity" → prefijo `while_` vs evento |
| `while_target_affected_by_puncture` | Riddled Target, Flensing Spikes | mezcla "On Puncture Status Effect" (evento) + "per Puncture Status" (estado) |

### G3 — tokens nuevos (ingesta directa, naturaleza diferida)

Sub-familia emergente `while_enemy_*` — condición sobre el **estado del target** (distinta de los
`while_*` existentes, que son flags del jugador/loadout):

| Token | Label (override) | `upgrade_type` |
|---|---|---|
| `while_enemy_below_half_health` | "+Damage to enemies below half Health" | — |
| `while_enemy_undamaged` | "Combo / Base CC / Base CD on undamaged enemies" | varios |
| `while_enemy_impaled` | "Puncture Status while impaled" / "+vulnerable to SC" | — |
| `while_enemy_status_count_below_3` | "enemies with <3 Status Effects: +Crit Damage" | `WEAPON_ADD_CRIT_MULT` |
| `while_enemies_within_6m` | "+Attack Speed per enemy within 6m. Stacks 5x" | `WEAPON_ADD_FIRE_RATE` |
| `while_impaling_5_or_more_enemies` | "+Heavy Attack Efficiency for 20s when impaling 5+ enemies" | `WEAPON_BASE_HEAVY_EFFICIENCY` |

Eventos nuevos:

| Token | Label (override) | Nota |
|---|---|---|
| `on_multishot` | "+Damage on Multishot" / "On Multishot: Increase Damage" | — |
| `on_non_critical_hit` | "+damage on non-critical hits" | distinto de `on_non_crit_non_status_hit` (más restrictivo) |
| `on_shard_damage` | "+Combo Count on Shard Damage" | — |
| `on_slam_hit` | "per enemy hit by Slam radius, gain Combo" | per-enemy; ¿variante de `on_ground_slam`? — diferido |
| `on_slide_attack_hit` | "per enemy hit by Slide Attack, gain Combo" | per-enemy; ¿variante de `on_slide_attack`? — diferido |
| `on_hit_incarnon_form` | "On Hit (Incarnon Form): +CC/CD... Stacks 50x" | compuesto evento+estado |
| ~~`on_hit_while_target_affected_by_electricity`~~ | "On hitting target affected by Electricity, 40% chance restore round" | **migrado (Fase 4)** → `{all:["on_hit","while_target_affected_by_electricity"]}` |

### G4 — prefijo `per_` (naturaleza nueva)

| Token | Label (override) | Naturaleza |
|---|---|---|
| `per_melee_combo_multiplier` | "+Movement Speed per Melee Combo Multiplier" | **escala lineal proporcional** a un stat de runtime — no es flag binario (`while_`), umbral (`with_`) ni evento (`on_`). Prefijo `per_` sin precedente; se esperan más casos. Sección/modelo a definir con más datos. |

---

## Ingesta archon (2026-06-01) — cola de clasificación

`archon-shards.json` adoptó la taxonomía D-18 + `notes[]` (modus operandi incarnon) el 2026-06-01:
17 pasivos pasaron de `condition: null` a *ausente*; los condicionales se mapearon a token; un único
hueco real `null` (Violet Equilibrium). Tokens nuevos capturados (naturaleza diferida):

| Token | Label (override) | Shard | Nota de naturaleza |
|---|---|---|---|
| `on_blast_kill` | "Health per enemy killed with Blast" / "Shields on Blast kill" | Topaz | kill cuyo daño final es Blast. Distinto de `on_heat_status_kill` (estado del target) — aquí es el tipo de daño del kill. |
| `on_toxin_status_damage` | "Health on Toxin status damage" | Emerald | trigger sobre el **daño de status de Toxin**, NO el DoT/Poison (efecto del status). "Daño de estado" ≠ "daño de efecto de estado" — **no análogo** a `on_*_proc`; no consolidar con `on_bleed_proc` ni `on_toxin_status_effect` (que es la *aplicación* del proc). |
| `on_spawn` | "Maximum Energy filled on Spawn" | Amber | efecto de inicialización (relleno al aparecer), fuera del loop de combate. Captura literal; ¿modelable como condition o es setup? — diferido. |

Tokens de archon ya existentes en el vocabulario (sin cambio): `on_hitting_enemies_affected_by_radiation`,
`on_hitting_enemies_affected_by_electricity`, `on_hitting_enemies_affected_by_corrosive`,
`on_heat_status_kill`, `with_energy_max_over_500`.

> **Hueco D-18 (`null`):** Violet `violet-pickup-health-energy-conversion` — mecánica **Equilibrium**
> (conversión bidireccional de recursos: Health pickup → +Energy, Energy pickup → +Health). No se
> modela como dos buffs `on_*_pickup` separados; es conversión de recursos con naturaleza propia,
> pendiente de diseño de engine. Ref: https://wiki.warframe.com/w/Equilibrium

## Ingesta arcanes (2026-06-01) — cola de clasificación

Patrón 4 de la homogeneización de arcanes: condition faltante. Se mapearon huecos `null` y ausentes con
condición latente. Tokens **nuevos** acuñados (captura literal, naturaleza diferida):

| Token | Label / fuente | Nota de naturaleza |
|---|---|---|
| `while_in_residual_zone` | "Standing in a zone created by a Residual Arcane" (Theorem Demulcent/Contagion/Infection) | estado: jugador dentro de zona de Residual Arcane. Efecto persiste 20s al salir (ver `duration:` en notes). |
| `on_swap_to_secondary` | "On swapping to Secondary Weapon" (Secondary Outburst) | evento de cambio de arma; consume combo. Distinto de `on_equip_from_primary` (incarnon). |
| `on_overguard_threshold_3000` | "When gaining 3,000 or more Overguard threshold" (Arcane Truculence) | evento de umbral de Overguard ganado. N en el token (precedente de umbrales). |
| `while_enemy_lifted` | "on Lifted enemies" (Exodia Valor) | estado del target: enemigo bajo CC Lift. Familia `while_enemy_*` (precedente incarnon). |
| `on_ability_inflicts_heat_status` | "when using abilities to inflict Heat Status" (Arcane Hot Shot) | evento: una habilidad aplica Heat status. Distinto de `on_heat_status_effect` (fuente = arma). |
| `while_reviving` | "Damage Taken During Revive" (Arcane Temperance) | estado: jugador en animación de revive. |
| `on_magnetic_status_kill` | "Kill an enemy affected by Magnetic Status" (Melee Vortex) | kill de enemigo con Magnetic status activo. Familia de `on_*_status_kill` (cf. `on_heat_status_kill`). |
| `on_parkour_maneuver` | "per Dodge, Double Jump and Bullet Jump" (Arcane Double Back) | **OR** de tres maniobras (token paraguas). Composición OR no expresable en `condition:string` — deuda conocida. |

Tokens existentes reutilizados (eran huecos): `while_airborne` (Pax Soar ×2), `with_armor_over_700`
(Arcane Persistence), `while_channeled_ability_active` (Arcane Intention), `while_target_affected_by_cold`
(Secondary Shiver).

Token **pre-existente** en el override que faltaba documentar (detectado en el contraste 2026-06-01):
| Token | Label / fuente | Nota |
|---|---|---|
| `on_bullet_jump_or_double_jump` | "After a Bullet Jump or Double Jump" (Exodia Contagion/Epidemic) | **OR** de 2 maniobras (deuda OR, igual que `on_parkour_maneuver`). ⚠ se solapa con `on_parkour_maneuver` (dodge/double-jump/bullet-jump) — candidato a consolidación futura; **no colapsar ahora** (captura literal). |

> **Huecos `null` compuestos (5, merecen revisión manual):** Primary Debilitate (combined status 10
> stacks + reinflict), Melee Careen (frozen + on_roll, multi-efecto → split), Arcane Camisado (summon +
> ability cast), Melee Afflictions (status + knockdown), Arcane Universal Fallout (radiation por habilidad
> + death). Condición real compuesta, no tokenizable limpio; `condition:null` + `notes[]` descriptiva.

## Ingesta mods exilus/general (2026-06-03) — cola de clasificación

Grupo A del triage `Project/scripts/triage-mod-conditions.py` (read-only) sobre
`mod-stats.override.json`. Tokens IN-SCOPE weapon-sim (`upgrade_type WEAPON_*`), acuñados tras
ratificación vía patch one-off (purgado tras uso; procedencia en git history). **Naturaleza/modelo
diferidos** (ver §Altitud de los debates): entran a nivel captura, derivados del label.

| Token | Fuente (mods) | Label / nota de naturaleza |
|---|---|---|
| `while_crouching` (nuevo) | Lie In Wait | "+Fire Rate when Crouching" — flag binario del jugador, familia de `while_aiming`/`while_sliding`. |
| `on_first_shot_in_magazine` (nuevo) | Charged Chamber, Primed Chamber | "+Damage on first shot in Magazine" (`WEAPON_INIT_DAMAGE_MOD`). Tensión evento (primer disparo) vs derivado (posición en cargador) — diferida hasta diseñar el contador de munición del SimContext. |
| `per_status_type_on_target` (nuevo) | Condition Overload, Healing Return | "per Status Type affecting the target" — escala proporcional al nº de status distintos en el target. Amplía la familia `per_` (G4). ⚠ `upgrade_type WEAPON_DAMAGE_IF_VICTIM_PROC_ACTIVE` es binario (legacy DE); gana el label (fidelidad). **Cross-schema:** misma fórmula en incarnon y en Galvanized Aptitude/Savvy/Shot — pero allí el token primario es `on_kill` (el "per status type" es escala, no condición; `condition:string` guarda una sola). |
| `per_melee_combo_multiplier` (existente, G4) | Weeping Wounds, Blood Rush | Son los "más casos" que G4 anticipaba. Token stat-agnóstico (Status Chance / Crit Chance). Blood Rush: label "stacks with Combo Multiplier" pero su nota de fórmula confirma mecánica idéntica (`val × combo_mult`). |

> **Fuera de scope (Grupo B, no acuñado):** mods con `upgrade_type AVATAR_*`/`VEHICLE_*` —
> `on_bullet_jump` (parkour elemental), `while_falling` (Air Time/Mad Stack), `on_spawn` (Preparation).
> Condición real pero efecto de Warframe/vehículo, no del arma. Trabajo separado.

**SUGGEST limpio (14 stats, mismo día):** mapeo de tokens **ya consolidados** (no acuña vocab) a mods
cuyo label matchea frase canónica — `while_aim_gliding` ×6, `while_airborne` ×2, `while_holstered` ×3,
`while_sliding` ×3. Los AVATAR_* (Aero Vantage, Boreal's Anguish, Air Thrusters) llevan nota de scope
(efecto de movimiento WF fuera del weapon-sim; condición válida igual). Patch one-off purgado tras uso.

**Dudosos resueltos (gate manual + contraste @wfcd/items type/compat):** `Hunter Munitions` (Primary Mod)
→ `on_critical_hit` (valor = chance de proc Slash). `Hunter Synergy` (Companion Mod) → ausente: el
"on Critical" del label era match espurio de "Weap**on Crit**ical" (regex del triage endurecido a `\bon`).
`Gale Kick` (Warframe Mod, Jump Kick + knockdown) → ausente, fuera de scope (CC diferido a D-20). Con esto
el balde SUGGEST quedó en 0; los `ausente`+`notes[]` (revisados) van al balde REVIEWED del triage, no reaparecen.

## Taxonomía del campo `condition` (D-18)

`condition` es **monosemántico** — habla solo de la condición, no del estado de análisis:

| `condition` | Significado |
|---|---|
| *(ausente)* | No hay condición — default, caso mayoritario |
| `null` | Condición real, sin token de este vocabulario todavía (hueco de mapeo) |
| `"<token>"` | Condicional, mapeada a un token de aquí |

Aplica a los tres schemas (mods, arcanes, incarnon). El `null` incondicional anterior (D-14) fue
eliminado el 2026-05-30 vía patch one-off (purgado tras uso; ver git history). Ver [D-18](../data/decisions.md).

> La normalización es trabajo de datos (scripts/patch), no de engine. Los overrides son SSoT —
> el engine leerá el token que esté en el JSON. Normalizar evita que el engine tenga que conocer
> múltiples aliases.

---

## Gate 1 — Definiciones de condición que requieren verificación

Tokens cuya **definición** (no su aplicación) tiene incertidumbre. La aplicación por fuente
se audita en Fase 2.

| Token | Duda concreta | Tipo |
| :--- | :--- | :--- |
| ~~`while_sliding_or_aim_gliding`~~ | **resuelto (Fase 3b)** — migrado a `{any:[…]}`; `evalCondition` lo evalúa. | schema |
| ~~`on_shield_or_overguard_break`~~ | **resuelto (Fase 4)** — migrado a `{any:["on_shield_break","on_overguard_break"]}`. | schema |
| `with_energy_max_over_200` | Umbral "unlisted" — no aparece en UI del juego; descubierto por la comunidad (Dual Toxocyst). | evidencia |
| `while_holstered` | Depende de que el sim tenga noción de "arma activa". Si no la tiene, no es evaluable. Posponer hasta diseño de contexto multi-arma. | engine |
| `while_dread_and_hate_equipped` (+2 pares stalker) | Modelados como tokens por-par por precedente de especificidad. ¿Generalizar a un patrón `while_pair_equipped(A,B)` en el futuro? | taxonomía |

> Resolución: igual que upgrade-tokens §Gate 1 — debate, elevar evidencia, o decidir extensión de schema.
> Las condiciones con `⚠` de schema (OR) no son engine-ready hasta que el contrato `condition` soporte la composición.

---

## Tokens de fuentes no cubiertas aún

Fuentes donde conditions existen pero no están mapeadas en los overrides:

| Fuente | Condiciones conocidas | Estado |
|---|---|---|
| `mod-stats.override.json` — exilus weapon | `while_aiming`, `while_aim_gliding`, `while_sliding`, `while_holstered`, `on_equip`, `on_hit`, `on_kill`, `on_heavy_attack_hit`, `on_tennokai_attack` | tokens definidos — mapeo en curso |
| `mod-stats.override.json` — galvanizados | `on_kill`, `on_headshot`, `on_status_effect` + stacking | pendiente |
| `mod-stats.override.json` — Hunter / Vigilante | `on_bleed_proc` → definido; `on_crit` → mapea a `on_critical_hit` existente | parcialmente cubierto |
| `archon-shards.json` | mapeado D-18 (2026-06-01): 9 token · 1 null (Equilibrium) · 17 ausente | ver §Ingesta archon |
| `ability-stats.override.json` | Sin condiciones (habilidades calculan su propio scaling) | fuera de scope |

---

## Resumen por grupo — cobertura actual

Agrupado por prefijo (organización emergente, no taxonomía):

| Grupo | Tokens definidos | En arcanes | En incarnon | En mods |
|---|---|---|---|---|
| Estado (`while_*`) | 19 | 6 mapeados | mapeado en `condition` (incl. 3 stalker pairs) | 3 nuevos (exilus) |
| Umbral (`with_*`) | 9 | 1 | mapeado en `condition` | 0 |
| Evento (`on_*`) | ~76 | 43 mapeados | mapeado en `condition` (incl. `on_slide_kill`, `on_non_crit_non_status_hit`) | 2 nuevos (exilus) |
| Operador | 9 | 9 mapeados | 0 | 0 |

> Mapeo en `condition` (2026-06-01): incarnon 175 token / 0 null (69 únicos · 21 en cola de clasificación, ver §Ingesta incarnon) · mods 80 token / 2 null / 813 ausente (22 únicos; actualizado 2026-06-03, ver §Ingesta mods) · arcanes 137 token / 5 null (33 ausente) · archon 9 token / 1 null (17 ausente). Incondicionales = ausente (D-18).
> Nota: arcanes — Crepuscular corregido (null → `while_invisible`); Exodia Valor añadido `condition: null` (conditional-without-token, "on Lifted enemies").

Los tokens `while_*` y `with_*` (≈28) son los candidatos inmediatos para C1-A porque no requieren
sistema de eventos — solo `context.flags` y `context.stats` en `SimContext`.

> **Shape obj-key en uso (Fase 3a/3b):** `condition: string | {any:[…]} | {all:[…]}` — `any`/`all` como
> intención explícita; `evalCondition` lo evalúa en el engine. Ver [`overrides.md` §Prototipo de condition](../data/rules/overrides.md)
> y `OQ-DATA-4` (prototipo **no cerrado**). Migrados: los OR de movimiento (Fase 3b). **Pendientes de migrar:**
> los paraguas OR de maniobra (`on_parkour_maneuver`, `on_bullet_jump_or_double_jump`) y el AND `on_hit_incarnon_form`.
