---
Estado: "referencia"
Rol: "Mapeo de upgrade_type por stat de Archon Shard — catálogo de tokens D-6 y bloqueos"
Version: "v0.2.0"
Impacto_ID: "D-Archon-Mapping"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-05-25"
Fecha_de_actualizacion: "2026-05-27"
---

# Archon Shards — Mapeo upgrade_type

Catálogo detallado del estado de mapeo de cada stat de Archon Shard hacia el vocabulario D-6.
Entry point operativo: `docs/data/status.md`.

**Archivo:** `Project/public/data/archon-shards.json` ✅ — 6 entradas, 27 stats totales
**Schema:** `docs/data/schemas/archon-shards/schema.md`
**Estado:** 14 mapeados / 13 nulos (auditado 2026-05-27 contra JSON real)

---

## upgrade_type mapeados ✅ — 14 / 27

| Shard | Stat | Token D-6 | Op |
|---|---|---|---|
| Crimson | `crimson-ability-strength` | `AVATAR_ADD_ABILITY_STRENGTH` | ADD |
| Crimson | `crimson-ability-duration` | `AVATAR_ADD_ABILITY_DURATION` | ADD |
| Crimson | `crimson-melee-critical-damage` | `WEAPON_MELEE_ADD_CRIT_MULT` | ADD |
| Crimson | `crimson-primary-status-chance` | `WEAPON_PRIMARY_ADD_STATUS_CHANCE` | ADD |
| Crimson | `crimson-secondary-critical-chance` | `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | ADD |
| Amber | `amber-health-orb-effectiveness` | `AVATAR_ADD_HEALTH_ORB_EFFICIENCY` | ADD |
| Amber | `amber-energy-orb-effectiveness` | `AVATAR_ADD_ENERGY_ORB_EFFICIENCY` | ADD |
| Amber | `amber-casting-speed` | `AVATAR_ADD_CASTING_SPEED` | ADD |
| Amber | `amber-parkour-velocity` | `AVATAR_ADD_PARKOUR_VELOCITY` | ADD |
| Azure | `azure-health-max` | `AVATAR_FLAT_HEALTH_MAX` | ADD_FLAT |
| Azure | `azure-shield-capacity` | `AVATAR_FLAT_SHIELD_MAX` | ADD_FLAT |
| Azure | `azure-energy-max` | `AVATAR_FLAT_ENERGY_MAX` | ADD_FLAT |
| Azure | `azure-armor` | `AVATAR_FLAT_ARMOUR` | ADD_FLAT |
| Azure | `azure-health-regeneration` | `AVATAR_FLAT_HEALTH_REGEN` | ADD_FLAT |

> Tokens de sub-familia (`WEAPON_MELEE_*`, `WEAPON_PRIMARY_*`, `WEAPON_SECONDARY_*`) resueltos en OQ-W-4 (2026-05-26).
> Azure usa `AVATAR_FLAT_*` (ADD_FLAT) — planos post-escala. `AVATAR_BASE_ARMOUR` eliminado de la taxonomía (2026-05-26).

---

## upgrade_type nulos — 13 / 27

### Bloqueo: condition vocabulary no definido

Efectos que requieren un sistema de condiciones o eventos de runtime:

| Stat | Bloqueo | Token base disponible |
|---|---|---|
| `violet-melee-critical-damage-on-energy` | Condición: `maxEnergy > 500` | `WEAPON_MELEE_ADD_CRIT_MULT` ✅ |
| `topaz-secondary-crit-on-heat-kill` | Condición: on-kill con Heat status | `WEAPON_SECONDARY_ADD_CRIT_CHANCE` ✅ |
| `topaz-health-on-blast-kill` | Evento: on-kill con Blast damage | — |
| `topaz-shields-on-blast-kill` | Evento: on-kill con Blast damage | — |
| `topaz-radiation-ability-damage` | Condición: enemy tiene Radiation status | — |
| `violet-electricity-ability-damage` | Condición: enemy tiene Electricity status | — |
| `emerald-ability-damage-on-corrosive` | Condición: enemy tiene Corrosion status | — |
| `emerald-toxin-status-damage` | Modifica daño de tick de estado — sin token | — |
| `emerald-health-on-toxin-status-damage` | Evento: on-DoT recovery | — |

### Bloqueo: token D-6 faltante o semántica nueva

| Stat | Razón | Nota |
|---|---|---|
| `amber-energy-filled-on-spawn` | Inicialización de energía al spawn — no es atributo continuo | — |
| `violet-primary-electricity-damage` | Necesita `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` (no en UPGRADES[]) + stacking por nº de shards equipados | Token sub-familia P1 para Incarnon gap §2 |
| `violet-pickup-health-energy-conversion` | Conversión pickup — sin token ni semántica | — |
| `emerald-corrosive-stacks` | Modifica ley de juego (`corrosive_max_stacks`) — sistema distinto al de atributos | — |

---

## Deuda conocida

| Deuda | Descripción |
|---|---|
| `condition` vocabulary | On-kill, on-status, energy-threshold — todos con `condition: null`. Requieren vocabulario canónico de condiciones. |
| Violet stacking bonus | `violet-primary-electricity-damage` tiene bonus adicional de `+10%`/`+15%` por cada shard Crimson/Azure/Violet equipado. Requiere `context_variable` en `Modifier`. |
| `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` | Token sub-familia de daño elemental — no en UPGRADES[]. Añadir cuando se trabaje gap §2 de Incarnon o se necesite para shards. |
| Valores tauforged sin verificar | La mayoría usa estimación 1.5x. `topaz-health-on-blast-kill: [1, 2]` único confirmado. |

---

## UI

| Componente | Estado |
|---|---|
| `useArchonShardCatalog.ts` | ✅ implementado (2026-05-21) |
| `ArchonShardSelectionView.tsx` | ✅ implementado — selector de tipo, tauforged toggle, lista de stats |
| `ArsenalView.tsx` (sección shards) | ✅ iconos resueltos vía `resolveLocalImageUrl` |
