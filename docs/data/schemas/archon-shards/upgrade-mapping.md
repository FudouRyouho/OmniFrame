---
Estado: "referencia"
Rol: "Mapeo de upgrade_type por stat de Archon Shard — catálogo de tokens D-6 y bloqueos"
Version: "v0.1.0"
Impacto_ID: "D-Archon-Mapping"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-05-25"
Fecha_de_actualizacion: "2026-05-25"
---

# Archon Shards — Mapeo upgrade_type

Catálogo detallado del estado de mapeo de cada stat de Archon Shard hacia el vocabulario D-6.
Entry point operativo: `docs/data/status.md`.

**Archivo:** `Project/public/data/archon-shards.json` ✅ — 6 entradas, 27 stats totales
**Schema:** `docs/data/schemas/archon-shards/schema.md`

## upgrade_type mapeados ✅

| Stat | Token |
|---|---|
| ability_strength, ability_duration, ability_range, ability_efficiency | `AVATAR_ADD_*` |
| health_max, shield_max, energy_max, armour (ADD), armour (BASE_FLAT) | `AVATAR_ADD_*` / `AVATAR_BASE_ARMOUR` |
| casting_speed | `AVATAR_ADD_CASTING_SPEED` |

## upgrade_type nulos — pendientes de taxonomía (OQ-W-4)

Estos stats tienen `upgrade_type: null` porque requieren sub-familia en D-6:

| Stat | Bloqueo |
|---|---|
| `crimson-melee-critical-damage` | Necesita `MELEE_ADD_CRIT_MULT` |
| `crimson-primary-status-chance` | Necesita `PRIMARY_ADD_STATUS_CHANCE` |
| `crimson-secondary-critical-chance` | Necesita `SECONDARY_ADD_CRIT_CHANCE` |
| `violet-primary-electricity-damage` | Necesita `PRIMARY_ADD_ELECTRICITY_DAMAGE` + context scaling (stacking) |
| `violet-melee-critical-damage-on-energy` | Necesita `MELEE_ADD_CRIT_MULT` + condition vocab |
| `topaz-secondary-crit-on-heat-kill` | Necesita `SECONDARY_ADD_CRIT_CHANCE` + condition vocab |

## upgrade_type nulos — sin token D-6 definido aún

Efectos sin mapping porque el concepto no existe en el vocabulario actual:

| Stat | Razón |
|---|---|
| `amber-energy-filled-on-spawn` | Inicialización de energía al spawn — no es atributo continuo |
| `amber-health-orb-effectiveness`, `amber-energy-orb-effectiveness` | Efectividad de pickup — sin token |
| `amber-parkour-velocity` | Parkour velocity ≠ sprint_speed ni movement_speed |
| `azure-health-regeneration` | Health regen por segundo — sin token |
| `topaz-radiation-ability-damage`, `emerald-ability-damage-on-corrosive`, `violet-electricity-ability-damage` | Daño de habilidad condicional por estado del enemigo — sin token ni semántica de condition |
| `topaz-health-on-blast-kill`, `topaz-shields-on-blast-kill` | On-kill recovery — sin token ni semántica de condition |
| `emerald-corrosive-stacks` | Modifica ley de juego (`corrosive_max_stacks`) — sistema distinto al de atributos |
| `emerald-toxin-status-damage` | Daño de tick de estado — sin token |
| `emerald-health-on-toxin-status-damage` | On-DoT recovery — sin token ni condition |
| `violet-pickup-health-energy-conversion` | Conversión pickup — sin token |

## Deuda conocida

- Valores tauforged sin verificar (estimación 1.5x). `topaz-health-on-blast-kill: [1, 2]` único confirmado.
- `condition` vocabulary no definido — todos los condicionales están en `null` como placeholder.
- Violet stacking bonus (n× por shards de familia equipados) requiere `context_variable` — ver OQ-W-4.
- `id` naming convention en stats → deuda semántica explícita en schema doc.

## UI

| Componente | Estado |
|---|---|
| `useArchonShardCatalog.ts` | ✅ implementado (2026-05-21) |
| `ArchonShardSelectionView.tsx` | ✅ implementado — selector de tipo, tauforged toggle, lista de stats |
| `ArsenalView.tsx` (sección shards) | ✅ iconos resueltos vía `resolveLocalImageUrl` |
