---
Estado: "referencia"
Rol: "Catálogo de gaps semánticos — 87 armas Incarnon (48 genesis), 727 efectos"
Impacto_ID: "data-incarnon-gaps"
Fidelidad_Fisica: "Project/public/data/incarnon-evolutions.override.json"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-07-24"
---

# Gaps semánticos — Incarnon Genesis / Incarnon nativo

Inventario derivado de `Project/scratch/incarnon-raw-extract.json` (extracción automática sobre 48 archivos wikitext).  
Estructura actual: genesis-first — `genesis_slug → { weapons, evolutions }`. Ver [schema.md](schema.md).

Objetivo: mapear qué se puede implementar ahora vs qué requiere trabajo en C1.

---

## 1. Tokens activos en el engine

Todos estos tokens están en `Project/src/shared/types/modifier.ts` (UPGRADES + UPGRADE_MAP) y son reconocidos por el engine. Los perks correspondientes están mapeados en el override.

| Token | Op | Semántica de perk | Ejemplo |
|---|---|---|---|
| `WEAPON_BASE_DAMAGE` | `BASE_FLAT` | "Increase [Base] Damage by +N" | Boltor EVO II: +18 / +4 |
| `WEAPON_BASE_CRIT_CHANCE` | `BASE_FLAT` | "Increase Critical Chance by +N%" | Sibear EVO IV: +25% |
| `WEAPON_BASE_STATUS_CHANCE` | `BASE_FLAT` | "Increase Status Chance by +N%" | Boltor EVO IV: +20% |
| `WEAPON_BASE_MAGAZINE_MAX` | `BASE_FLAT` | "Increase [magazine/ammo] capacity by +N" | Boltor EVO III: +20 |
| `WEAPON_BASE_CRIT_MULT` | `BASE_FLAT` | "Increase **Base** Critical Damage Multiplier by +Nx" | Boar EVO IV: +0.5x |
| `WEAPON_ADD_RELOAD_SPEED` | `ADD` | "+N% Reload Speed" | Boltor EVO III: +60% |
| `WEAPON_ADD_FIRE_RATE` | `ADD` | "+N% Fire Rate / Attack Speed" (incondicional) | Zariman weapons EVO II: +20–25% |
| `WEAPON_ADD_MULTISHOT` | `ADD` | "+N% Multishot" (incondicional) | munitions_grit: +20% |
| `WEAPON_ADD_CRIT_MULT` | `ADD` | "+Nx Critical Damage Multiplier" (sin "Base") | Gammacor EVO IV: +0.2x |
| `WEAPON_ADD_PROJECTILE_SPEED` | `ADD` | "+N% Projectile Speed" | Boltor EVO III: +60% |
| `WEAPON_ADD_ACCURACY` | `ADD` | "+N% Accuracy" | Braton EVO III: +60% |
| `WEAPON_ADD_RECOIL` | `ADD` | "-N% Recoil (valor negativo)" | Braton EVO III: -60% |
| `WEAPON_ADD_STATUS_DURATION` | `ADD` | "+N% Status Duration" | Okina EVO IV: +25% |
| `WEAPON_ADD_HEAVY_CHARGE_SPEED` | `ADD` | "+N% Heavy Attack Wind Up Speed" | HATE EVO III: +60% |
| `WEAPON_BASE_HEAVY_EFFICIENCY` | `BASE_FLAT` | "+N% Heavy Attack Efficiency (base=0, cap 90%)" | Furax EVO III: +20% |
| `WEAPON_ADD_ZOOM` | `ADD` | "-N% Zoom (valor negativo = reducción)" | Varios EVO III: -30% |
| `WEAPON_ADD_SLAM_RADIUS` | `ADD` | "+N% Slam Attack Radius" | Varios EVO IV: +50% |
| `WEAPON_ADD_RANGE` | `ADD` | "Increase Range by +N" | Skana/Bo EVO III: +0.4–1 |
| `WEAPON_ADD_MAGAZINE_MAX` | `ADD` | "+N% Magazine Capacity (porcentaje)" | ZarimanSemiAutoRifle: +50% |
| `WEAPON_BASE_COMBO_DURATION` | `BASE_FLAT` | "+Ns Combo Duration (segundos planos)" | Varios: +4–8s |
| `WEAPON_ADD_COMBO_DURATION` | `ADD` | "±N% Combo Duration" | Split de WEAPON_MELEE_COMBO_DURATION_BONUS |
| `WEAPON_BASE_COMBO_INITIAL` | `BASE_FLAT` | "+N Initial Combo" | Varios: +20 |
| `WEAPON_ADD_FINISHER_DAMAGE` | `ADD` | "+N% Finisher Damage" | Varios |

> Verificados en juego (2026-05-28): `WEAPON_BASE_CRIT_MULT` (Soma Prime + Vital Sense → ×2.2 sobre base ampliada), `WEAPON_ADD_HEAVY_CHARGE_SPEED` (HATE + Amalgam Ripkas → 0.91s), `WEAPON_BASE_HEAVY_EFFICIENCY` (Furax MK1 + Galvanized Reflex → 60.9%).

---

## 2. Gaps semánticos (diseño requerido en C1)

Estas categorías no pueden modelarse en el snapshot estático actual sin trabajo de diseño previo. Los perks están anotados en el override con `upgrade_type: null` + `note`.

### 2.1 Condiciones de combate (`context.flags`)

Perks con trigger condicional activo:

| Trigger | Afecta (~N perks) | Ejemplo |
|---|---|---|
| `with_armor_over_N` | ~12 | Boltor: "With Armor Over 450: Increase Damage by +40" |
| `with_channeled_ability_active` | ~8 | Braton: "With Channeled Ability active: +Y Damage" |
| `with_melee_equipped` | ~10 | Furax: "With Melee Weapon Equipped: +100% Combo Count Chance" |
| `with_sprint_speed_above_N` | ~3 | Latron: "With Sprint Speed 1.2 or Higher: +30% Direct Damage" |
| `on_first_attack` | ~3 | Sibear: "On First Attack With Primary Equipped: +2x Crit Mult" |
| `with_crit_chance_below_N` | ~1 | Furis: "With Critical Chance below 40%: +3x Base Crit Mult" |

Patrón compartido: `Modifier` con flag de condición, activo solo cuando `context.flags[flag] === true`. Requiere definir el vocabulario de `context.flags` en C1.

### 2.2 Perks on-event (triggers de runtime)

No modelables en snapshot estático — requieren sistema de eventos:

| Trigger | Afecta (~N perks) | Ejemplo |
|---|---|---|
| `on_kill` | ~25 | Boltor: "On Kill: Increase Damage by +2 for 5s. Stacks up to 4x" |
| `on_reload_from_empty` | ~8 | Boar: "On Reload From Empty: +100% Reload Speed" |
| `on_hit_status` | ~5 | Dera: "On Status Effect: +5% Fire Rate for 5s" |
| `on_shield_break` | ~3 | Cestra: "On Shield/Overguard break: x3 Critical Damage for 6s" |
| `on_headshot` | ~4 | Furis: "On Headshot: +5% Fire Rate for 2s, stacks 10x" |

### 2.3 Buffs dinámicos / stacking

Modificadores que dependen de un contador de runtime:

| Patrón | Afecta (~N perks) | Ejemplo |
|---|---|---|
| Stacking damage (n kills → +damage) | ~15 | Boltor: "+2 per kill, max 4 stacks" |
| Condition Overload style | ~3 | Soma: "+40% Damage per Status affecting target" |
| Energy-gated stacking | ~3 | Gammacor: "On 50 Energy Spent: +5 Damage for 10s, stacks 4x" |
| Combo-counter based | ~8 | Sibear: "+15 Initial Combo for 10s, stacks 4x" |

### 2.4 Atributos de jugador (fuera de scope weapon sim)

| Atributo | Ejemplo |
|---|---|
| Sprint Speed | Sibear: "+10% Sprint Speed" |
| Parkour Velocity | Sibear: "+10% Parkour Velocity" |
| Movement Speed | Anku: "+20% Movement Speed" |
| Healing | Dual Ichor: "+33 Heal Rate/s for 9s" |
| Overshields | Varios |

---

## 3. Multishot especial (Munitions Grit)

`braton-incarnon-genesis / munitions_grit`: "Multishot consumes ammo from Capacity and increases Damage by +Y. +20% Multishot."

El multishot consume ammo del pool en lugar del cargador — requiere modelado de ammo economy. Gap de diseño, no de token.

---

## 4. Perks con valor "capacity TO N" (operación SET)

Casos conocidos que establecen valor absoluto en lugar de sumar:

| Genesis | Perk | Efecto |
|---|---|---|
| `atomos-incarnon-genesis` | `mercenary_chamber` | "Increase ammo capacity to 560" |
| `boar-incarnon-genesis` | `mercenary_chamber` | "Increase ammo capacity to 195" |

Distintos de `WEAPON_BASE_MAGAZINE_MAX` (que suma). Necesitan operación `BASE_SET` o manejo especial — anotados en override con `note: "WEAPON_SET_MAGAZINE_MAX N"`.

---

## 5. Cobertura y deuda de datos

### Estado actual

- **48 genesis** mapeados, **87 unique weapons** cubiertos
- **727 efectos** en override (post-migración genesis-first)
- **P1 completo** — 23 tokens activos en el engine (§1)
- **P2+ pendiente** — ~120 perks condicionales/on-event anotados con `upgrade_type: null`

### Perk data incompleta (5 weapons — fingerprint inconsistente)

Weapons con perk set diferente al resto de su genesis. Causa probable: datos parciales en el override previo a la migración.

| Weapon | Genesis | Perks faltantes probables |
|---|---|---|
| Burston Prime | `burston-incarnon-genesis` | `reavers_rapture` (presente en BurstRifle, ausente en Prime) |
| MK1-Braton | `braton-incarnon-genesis` | 7 perks distintos vs base Braton |
| Gorgon Wraith | `gorgon-incarnon-genesis` | Perk set diferente a HeavyRifle/Prisma |
| Dex Sybaris | `sybaris-incarnon-genesis` | Perks distintos vs base Sybaris |
| Latron Wraith | `latron-incarnon-genesis` | `extended_volley`/`flensing_spikes`/`deadhead` (ausentes) |

Acción: completar manualmente con wiki antes de usar estos genesis en tests.

### Deuda de valores manuales

Efectos con placeholder `+X`/`+Y` del extractor — valor real requiere verificación en wiki:

- `WEAPON_BASE_DAMAGE` ×4 (Braton Incarnon Form: "+X Damage")
- `WEAPON_BASE_STATUS_CHANCE` ×10 ("Increase Status Chance by +Y")
- `WEAPON_BASE_MAGAZINE_MAX` ×9 ("Increase Base Magazine Capacity by +X")
- `WEAPON_BASE_CRIT_MULT` ×3 ("Increase Base Critical Damage Multiplier by +Yx")
- `WEAPON_ADD_CRIT_MULT` ×4 ("Increase Critical Damage Multiplier by +Y") — sin "Base"

### Falsos positivos en detección de weapons faltantes

La detección extraía `{{Weapon|Name}}` de **todo** el wikitext, incluyendo Trivia y comparaciones — de ahí los falsos positivos. Dos casos identificados:

- **Klamora Prism** aparece en `furis-incarnon-genesis.wikitext` como comparación de Incarnon Form ("fires a wide Klamora Prism-like beam") — no pertenece al genesis.
- **Arca Titron** aparece en `magistar-incarnon-genesis.wikitext` en Trivia como referencia de slam radius — no pertenece al genesis.

---

## 6. Schema — variantes por alias (genesis-first)

La estructura genesis-first resuelve el problema de variantes. Ver [schema.md](schema.md) para el contrato completo.

Resumen del patrón:
- **`weapons: string`** — genesis de un solo arma (e.g., Zariman nativos: `felarx`, `laetum`)
- **`weapons: { alias: unique_name }`** — genesis multi-weapon con aliases (`base`, `prime`, `wraith`, `mk1`, `vandal`, `prisma`, `dex`, `telos`, `sancti_<name>`)
- **`value: number`** — escalar cuando todas las variantes comparten el mismo valor
- **`value: { alias: number }`** — dict cuando los valores difieren por variante (e.g., Boltor `hunters_mantra`: `{ base: 18, prime: 4, telos: 4 }`)

---

## 7. Cola de consolidación de condition tokens

Inventario de tokens `condition` presentes en el override que **aún no se consolidaron** en
`docs/semantic/conditions.md`. Por [D-19](../../decisions.md), el JSON es el SSoT del token; este
listado es cola de consolidación, **no** una lista de errores ni de drift. Reglas al leerlo:

- **No se asume equivalencia por parecido de label.** Cada token se preserva literal hasta que su
  naturaleza mecánica se analice. Labels similares pueden esconder mecánicas distintas (Dual Ichor
  reactiva su nube de gas; Furax no).
- **No se asigna clasificación de naturaleza aquí** (modelo `c2/*`). Eso es análisis posterior.
- Los prefijos (`on_` / `while_`) se conservan como señal temprana de naturaleza.

### 7.1 Tokens con variante de forma respecto a un token ya consolidado

Coinciden parcialmente con un token existente; la forma a unificar se decide **al consolidar**, no antes.

| Token en override | Token consolidado cercano | Observación (sin juicio de equivalencia) |
|---|---|---|
| `on_weakpoint_hit` | `on_weak_point_hit` / `on_consecutive_weakpoint_hits` | Forma canónica **resuelta** = `on_weakpoint_hit` (`conditions.md §G1`); la variante `weak_point` ya migró. `on_consecutive_*` sigue distinto: lleva contador, no es variante ortográfica |
| `on_hit_while_target_affected_by_electricity` | `on_hitting_enemies_affected_by_electricity` | Misma área conceptual; naturaleza real sin confirmar |
| `while_aim_gliding_or_sliding` | `while_sliding_or_aim_gliding` (arcanes) | OR — bloqueado por schema (§Gate 1 conditions.md); orden a unificar al resolver OR |

### 7.2 Tokens sin entrada en conditions.md — prefijo `while_`

Naturaleza sin analizar. No asumir relación con la familia `on_hitting_enemies_affected_by_*`.

| Token | Fuente | Label (referencia) |
|---|---|---|
| `while_target_affected_by_cold` | sibear | +combo en targets con Cold |
| `while_target_affected_by_electricity` | furis | +multishot en targets con Electricity |
| `while_target_affected_by_puncture` | latron | +multishot en targets con Puncture |
| `while_target_affected_by_slash` | okina | +combo en targets con Slash |
| `while_target_affected_by_toxin` | dual-ichor | +combo en targets con Toxin |
| `while_enemy_undamaged` | paris | +CC/CD a enemigos sin dañar |
| `while_enemy_impaled` | ruvox | vulnerabilidad de impaled enemies |
| `while_enemy_below_half_health` | dread, kunai | +% damage <50% HP |
| `while_enemy_status_count_below_3` | phenmor | efecto al tener <3 status |
| `while_enemies_within_6m` | furax | +attack speed por enemigo cercano (stacks 5x) |
| `while_impaling_5_or_more_enemies` | ruvox | +heavy efficiency al impalar 5+ |

### 7.3 Tokens sin entrada en conditions.md — prefijo `on_`

Naturaleza sin analizar.

| Token | Fuente | Label (referencia) |
|---|---|---|
| `on_hit_incarnon_form` | onos | stacks de CC/CD en forma incarnon |
| `on_multishot` | miter, torid | +damage en multishot pellets |
| `on_non_critical_hit` | felarx, laetum | +damage en hits no críticos (distinto de `on_non_crit_non_status_hit`) |
| `on_slam_hit` | praedos, ruvox | +combo por enemigo en radio de slam |
| `on_slide_attack_hit` | thalys | +combo por enemigo en slide attack |
| `on_shard_damage` | thalys | +combo en shard damage |

### 7.4 Token sin prefijo de los patrones conocidos

| Token | Fuente | Label (referencia) |
|---|---|---|
| `per_melee_combo_multiplier` | ruvox | +X% movement speed por combo multiplier — escalar proporcional continuo |

---

## Resumen de prioridades

| Prioridad | Trabajo | Estado |
|---|---|---|
| P1 | Tokens §1 en `modifier.ts` + `UPGRADE_MAP` | ✅ Completado |
| P1 | Boar Prime + Soma Prime en override | ✅ Completado |
| P2 | Completar perk data de 5 weapons incompletas | Pendiente (wiki manual) |
| P2 | Valores placeholder `+X`/`+Y` (~30 efectos) | Pendiente (wiki manual) |
| C1-A | Diseñar `context.flags` vocabulary (§2.1) | Requiere debate — ~40 perks simples |
| C1-B | Sistema on-event / stacking (§2.2–2.3) | Requiere runtime state — fuera de snapshot estático |
| C1-C | Arcanes — sin override aún | Scope nuevo, trabajo similar al Incarnon |
| — | Atributos de jugador (§2.4) | Fuera de scope weapon sim |
