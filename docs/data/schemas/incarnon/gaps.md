---
Estado: "referencia"
Rol: "Catálogo de gaps semánticos — 48 armas Incarnon, 723 efectos"
Impacto_ID: "SSoT-Data-Incarnon"
Fecha_de_creacion: "2026-05-27"
Fecha_de_actualizacion: "2026-05-27"
---

# Gaps semánticos — Incarnon Genesis / Incarnon nativo

Inventario derivado de `Project/scratch/incarnon-raw-extract.json` (extracción automática sobre 48 archivos wikitext).  
Objetivo: mapear qué se puede implementar ahora vs qué requiere trabajo en C1.

---

## 1. Implementable ahora (tokens existentes)

| Token | Semántica de perk | Ejemplo |
|---|---|---|
| `WEAPON_BASE_DAMAGE` | "Increase [Base] Damage by +N" | Boltor EVO II: +18 / +4 |
| `WEAPON_BASE_CRIT_CHANCE` | "Increase Critical Chance by +N%" | Sibear EVO IV: +25% |
| `WEAPON_BASE_STATUS_CHANCE` | "Increase Status Chance by +N%" | Boltor EVO IV: +20% |
| `WEAPON_BASE_MAGAZINE_MAX` | "Increase [magazine/ammo] capacity by +N" | Boltor EVO III: +20 |
| `WEAPON_ADD_RELOAD_SPEED` | "+N% Reload Speed" | Boltor EVO III: +60% |

Todos operan como `BASE_FLAT`: se suman al `base` antes de mods multiplicativos (amplificados por Serration / Hornet Strike).  
Cobertura estimada: ~220–240 efectos de 723 (~32%).

---

## 2. Tokens faltantes (vocabulario a extender, sin complejidad semántica nueva)

Estos perks tienen mecánica simple (flat o percent add) pero el token no existe en `UPGRADES`.

| Token propuesto | Semántica | Afecta (N efectos) | Ejemplo |
|---|---|---|---|
| `WEAPON_ADD_MULTISHOT` | "+N Multishot" | ~21 | Bronco EVO II: +2 Multishot |
| `WEAPON_ADD_FIRE_RATE` / `WEAPON_ADD_ATTACK_SPEED` | "+N% Fire Rate / Attack Speed" | ~21 | Dera EVO III: +5% Fire Rate stacking |
| `WEAPON_ADD_PROJECTILE_SPEED` | "+N% Projectile Speed" | ~16 | Boltor EVO III: +60% (gap conocido) |
| `WEAPON_ADD_PUNCH_THROUGH` | "+N Punch Through" | ~13 | Boltor EVO II: +4 PT condicional |
| `WEAPON_ADD_ACCURACY` / `WEAPON_REDUCE_RECOIL` | "+N% Accuracy / -N% Recoil" | ~12 | Braton EVO III: +60% Accuracy |
| `WEAPON_ADD_HEAVY_WINDUP_SPEED` | "+N% Heavy Attack Wind Up Speed" | ~9 | Ack & Brunt EVO III: +70% |
| `WEAPON_ADD_STATUS_DURATION` | "+N% Status Duration" | ~1–2 | Okina EVO III: +25% |
| `WEAPON_ADD_CRIT_MULT` | "+Nx Critical Damage Multiplier" | ~18 | Braton EVO IV: +0.4x |
| `WEAPON_SET_HEAVY_EFFICIENCY` | "Heavy Attack Efficiency SET TO N%" | ~2 | Furax EVO III: set to 20% |

> `WEAPON_SET_*` requiere operación `BASE_SET` — diferente a `BASE_FLAT`. Añadir si se decide modelar SET operations en el engine.

---

## 3. Gaps semánticos (diseño requerido en C1)

Estas categorías no pueden modelarse en el snapshot estático actual sin trabajo de diseño previo.

### 3.1 Condiciones de combate (`context.flags`)

Perks con trigger condicional activo:

| Trigger | Afecta (~N perks) | Ejemplo |
|---|---|---|
| `with_armor_over_N` | ~12 | Boltor: "With Armor Over 450: Increase Damage by +40" |
| `with_channeled_ability_active` | ~8 | Braton: "With Channeled Ability active: +Y Damage" |
| `with_melee_equipped` | ~10 | Furax: "With Melee Weapon Equipped: +100% Combo Count Chance" |
| `with_sprint_speed_above_N` | ~3 | Latron: "With Sprint Speed 1.2 or Higher: +30% Direct Damage" |
| `on_first_attack` | ~3 | Sibear: "On First Attack With Primary Equipped: +2x Crit Mult" |
| `with_primary_equipped` | ~3 | Sibear: "On First Attack With Primary Equipped..." |

Todas comparten el mismo patrón: un `Modifier` con flag de condición que solo se aplica cuando `context.flags[flag] === true`. Requiere definir el vocabulario de `context.flags` en C1.

### 3.2 Perks on-event (triggers de runtime)

No modelables en snapshot estático — requieren sistema de eventos:

| Trigger | Afecta (~N perks) | Ejemplo |
|---|---|---|
| `on_kill` | ~25 | Boltor: "On Kill: Increase Damage by +2 for 5s. Stacks up to 4x" |
| `on_reload_from_empty` | ~8 | Boar: "On Reload From Empty: +100% Reload Speed" |
| `on_hit` | ~5 | Dera: "On Status Effect: +5% Fire Rate for 5s" |
| `on_shield_break` | ~3 | Cestra: "On Shield/Overguard break: x3 Critical Damage for 6s" |

### 3.3 Buffs dinámicos / stacking

Modificadores que dependen de un contador de runtime:

| Patrón | Afecta (~N perks) | Ejemplo |
|---|---|---|
| Stacking damage (n kills → +damage) | ~15 | Boltor Crimson Overture: "+2 per kill, max 4 stacks" |
| Energy-gated stacking | ~3 | Gammacor: "On 50 Energy Spent: +5 Damage for 10s, stacks 4x" |
| Combo-counter based | ~8 | Sibear: "+15 Initial Combo for 10s, stacks 4x" |

### 3.4 Atributos de jugador (fuera de scope weapon)

Modificadores que afectan al Warframe, no al arma:

| Atributo | Ejemplo |
|---|---|
| Sprint Speed | Sibear: "+10% Sprint Speed" |
| Parkour Velocity | Sibear: "+10% Parkour Velocity" |
| Movement Speed | Anku: "+20% Movement Speed" |
| Healing | Dual Ichor: "+33 Heal Rate/s for 9s" |
| Overshields | Varios |

---

## 4. Multishot especial (Munitions Grit)

`braton-incarnon-genesis / munitions_grit`: "Multishot consumes ammo from Capacity and increases Damage by +Y. +20% Multishot."

El multishot consume ammo del pool en lugar del cargador. Esto no es un simple +N al stat — requiere modelado de ammo economy. Gap de diseño, no de token.

---

## 5. Perks con valor "ammo capacity TO N" (SET en lugar de ADD)

`atomos-incarnon-genesis / mercenary_chamber`: "Increase ammo capacity to 560" — establece el valor absoluto, no suma.  
Distintos de `WEAPON_BASE_MAGAZINE_MAX` (que suma). Necesita operación `BASE_SET` o manejo especial.

---

## 6. Variantes per-unique_name (resuelto)

Para perks como Boltor Hunter's Mantra (+18 Boltor / +4 Telos / +4 Prime), cada variante tiene su propia entrada en `incarnon-evolutions.override.json`. No hay campo "variant" — la key del objeto ES el `unique_name`.

Ver [`schema.md`](schema.md) — "Convención de variantes per-arma".

---

## Resumen de prioridades para C1

| Prioridad | Trabajo | Valor |
|---|---|---|
| P1 | Extender `UPGRADES` con tokens de la sección 2 (flat/percent sin condición) | Cubre ~60 efectos adicionales sin diseño nuevo |
| P2 | Diseñar `context.flags` vocabulary para condiciones de sección 3.1 | Desbloquea ~40 perks condicionales simples |
| P3 | Sistema de eventos on-kill / on-event | Desbloquea buffs temporales pero requiere runtime state |
| — | Atributos de jugador | Fuera de scope weapon sim |
