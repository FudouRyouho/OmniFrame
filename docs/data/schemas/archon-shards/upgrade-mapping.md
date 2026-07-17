---
Estado: "referencia"
Rol: "Mapeo de upgrade_type por stat de Archon Shard — catálogo de tokens D-6 y bloqueos"
Impacto_ID: "data-archon-mapping"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-05-25"
Fecha_de_actualizacion: "2026-06-01"
---

# Archon Shards — Mapeo upgrade_type

Catálogo detallado del estado de mapeo de cada stat de Archon Shard hacia el vocabulario D-6.
Entry point operativo: `docs/data/status.md`.

**Archivo:** `Project/public/data/archon-shards.json` ✅ — 6 entradas, 27 stats totales
**Schema:** `docs/data/schemas/archon-shards/schema.md`
**Estado:** 20 mapeados / 7 nulos (auditado Gate 2b 2026-05-31 contra JSON real)

---

## upgrade_type mapeados ✅ — 14 / 27

| Shard | Stat | Token D-6 | Op |
|---|---|---|---|
| Crimson | `crimson-ability-strength` | `AVATAR_ADD_ABILITY_STRENGTH` | ADD |
| Crimson | `crimson-ability-duration` | `AVATAR_ADD_ABILITY_DURATION` | ADD |
| Crimson | `crimson-melee-critical-damage` | `WEAPON_MELEE_ADD_CRIT_MULT` | ADD |
| Crimson | `crimson-primary-status-chance` | `WEAPON_PRIMARY_ADD_STATUS_CHANCE` | ADD |
| Crimson | `crimson-secondary-critical-chance` | `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | ADD |
| Topaz | `topaz-secondary-crit-on-heat-kill` | `WEAPON_SECONDARY_ADD_CRIT_CHANCE` | ADD | `on_heat_status_kill` |
| Topaz | `topaz-radiation-ability-damage` | `AVATAR_ADD_ABILITY_DAMAGE` | ADD | `null` — condition token pendiente |
| Violet | `violet-electricity-ability-damage` | `AVATAR_ADD_ABILITY_DAMAGE` | ADD | `null` — condition token pendiente |
| Violet | `violet-melee-critical-damage-on-energy` | `WEAPON_MELEE_ADD_CRIT_MULT` | ADD | `with_energy_max_over_500` |
| Emerald | `emerald-ability-damage-on-corrosive` | `AVATAR_ADD_ABILITY_DAMAGE` | ADD | `null` — condition token pendiente |
| Emerald | `emerald-toxin-status-damage` | `GAMEPLAY_ADD_TOXIN_STATUS_DAMAGE` | ADD | — |
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

## upgrade_type nulos — 7 / 27


### Bloqueo: fuera del modelo upgrade_type

Efectos que no encajan en el modelo de atributos continuo:

| Stat | Razón |
|---|---|
| `topaz-health-on-blast-kill` | Recovery de HP por evento de kill — sin bucket en el modelo actual |
| `topaz-shields-on-blast-kill` | Recovery de Shields por evento de kill — ídem |
| `emerald-health-on-toxin-status-damage` | Recovery de HP al tickear un DoT — evento sub-tick |
| `emerald-corrosive-stacks` | Modifica regla de juego (`corrosive_max_stacks`) — candidato `GAMEPLAY_*` futuro |

### Bloqueo: token D-6 faltante

| Stat | Razón | Nota |
|---|---|---|
| `amber-energy-filled-on-spawn` | Inicialización de energía al spawn — no es atributo continuo | Out of scope |
| `violet-primary-electricity-damage` | Necesita `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` (no en UPGRADES[]) | Deuda existente — añadir junto con gap §2 Incarnon |
| `violet-pickup-health-energy-conversion` | Conversión pickup — mecánica de orbs, sin token ni semántica definida | Out of scope |

---

## Deuda conocida

| Deuda | Descripción |
|---|---|
| Violet stacking bonus | `violet-primary-electricity-damage` tiene bonus adicional de `+10%`/`+15%` por cada shard Crimson/Azure/Violet equipado. Necesita escalado por conteo en `Modifier` — no hay `context_variable` genérico (el único escalado-por-contexto es `CONDITION_OVERLOAD`/`co_factors`, específico de CO). Mecanismo propio pendiente. |
| `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` | Token sub-familia de daño elemental — no en UPGRADES[]. Añadir cuando se trabaje gap §2 de Incarnon o se necesite para shards. |
| Valores tauforged sin verificar | La mayoría usa estimación 1.5x. `topaz-health-on-blast-kill: [1, 2]` único confirmado. |

---

## UI

| Componente | Estado |
|---|---|
| `useArchonShardCatalog.ts` | ✅ implementado (2026-05-21) |
| `ArchonShardSelectionView.tsx` | ✅ implementado — selector de tipo, tauforged toggle, lista de stats |
| `ArsenalView.tsx` (sección shards) | ✅ iconos resueltos vía `resolveLocalImageUrl` |
