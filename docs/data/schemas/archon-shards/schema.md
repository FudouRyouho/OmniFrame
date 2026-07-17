---
Estado: "activo"
Rol: "Contrato del archivo archon-shards.json — catálogo de tipos de shard y sus bonus options"
Impacto_ID: "data-archon-schema"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-05-20"
Fecha_de_actualizacion: "2026-06-04"
---

# Archon Shards — Schema

> Catálogo propio de OmniFrame. No es un override de DE: los datos de DE para shards
> son de baja fidelidad (nombre sucio, descripción genérica). Este archivo es la fuente primaria.

---

## Estructura raíz

Indexado por `uniqueName` de DE. Cada entrada describe un tipo de shard y sus bonus options.

```ts
interface ArchonShardEntry {
  name: string;           // Nombre limpio del tipo de shard (display)
  image_name: string;     // Nombre del asset propio. Tauforged → "Tauforged{image_name}"
  stats: ArchonShardStat[];
}
```

## Stat (`ArchonShardStat`)

```ts
interface ArchonShardStat {
  id: string;             // Handle de selección. [DEUDA: naming convention pendiente]
  label: string;          // Texto con placeholder |val1|
  value: [number, number]; // [normal, tauforged]
  upgrade_type: string | null; // Token D-6. null si el efecto no tiene mapping aún
  condition?: string | null;   // Taxonomía D-18 — ver tabla. Ausente = pasivo · null = hueco · token canónico
  notes?: string[];            // contrato (SSoT): docs/data/rules/overrides.md §Contrato de notes[]
}
```

## Convenciones

### `|val1|` en label

Resuelve a `value[is_tau ? 1 : 0]`. El renderer decide el índice según si el shard es tauforged.

No confundir con el patrón de mods donde `|val1|/|val2|` indexa entradas de `values[]`.
Aquí cada stat es un único efecto — `|val1|` siempre es la única variable del label.

### `value: [normal, tauforged]`

Dos entradas fijas. No hay "ranks" intermedios. El tauforged no sigue una regla universal
de multiplicación — se declara explícitamente por caso.

### `image_name` y tauforged

El path de asset tauforged se deriva en runtime: `"Tauforged" + image_name`.
Convención verificada en el catálogo existente (ej: `CrimsonArchonShard.png` → `TauforgedCrimsonArchonShard.png`).

### `upgrade_type`

Token D-6 del vocabulario `Upgrade` en `shared/types/modifier.ts`.
Si el efecto no tiene mapping en `UPGRADE_MAP` todavía → `null` con `console.warn` en hydration.

### `condition` (taxonomía D-18, adoptada 2026-06-01)

Archon adopta el mismo modus operandi que `incarnon-evolutions.override.json`: campo monosemántico
de tres estados, alineado con [D-18](../../decisions.md). Migrado el 2026-06-01 (antes todo era `null`).

| `condition` | Significado | Detección |
|---|---|---|
| *(ausente)* | Efecto pasivo, sin condición. Caso mayoritario. | label no condicional |
| `null` | Condición real sin token canónico todavía (hueco de mapeo). | label condicional + sin token |
| `"<token>"` | Condicional, mapeada. Token de `docs/semantic/conditions.md`. | label con trigger + token |

Cobertura (2026-06-01): **9** token · **1** null (Violet Equilibrium) · **17** ausente (27 stats).
Tokens condition usados: `on_hitting_enemies_affected_by_{radiation,electricity,corrosive}`,
`on_heat_status_kill`, `with_energy_max_over_500`, `on_blast_kill`, `on_spawn`, `on_toxin_status_damage`.

### `notes` (ejemplos archon)

Contrato (SSoT): [`overrides.md` §notes[]](../../rules/overrides.md). Ejemplos archon: Violet = Equilibrium
(conversión de recursos); Emerald = daño de status de Toxin ≠ DoT.

---

## Deudas conocidas

| Deuda | Descripción |
|---|---|
| `id` naming convention | Kebab-case descriptivo por ahora (`"crimson-ability-strength"`). Pendiente formalizar como vocab semántico. |
| `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` | Deuda residual del slot-awareness: violet shard aún no en `UPGRADES[]`. Sub-familia D-6 ya definida (ver D-6 §extensión). |
| Violet stacking bonus | `violet-primary-electricity-damage` tiene un bonus adicional que escala con cantidad de shards de familia equipados (`n * value`). No es `condition` booleano ni `upgrade_type` estándar — necesita un escalado por conteo en el `Modifier`. **Nota (2026-07-04):** NO existe un `context_variable` genérico — el único escalado-por-contexto es la operation de familia `CONDITION_OVERLOAD` (`co_factors`), específica de CO/GunCO. Violet requiere su propio mecanismo (o una generalización futura). Pendiente. |
| Violet Equilibrium (`condition: null`) | Los efectos condicionales de shards ya están mapeados a tokens canónicos (`docs/semantic/conditions.md`, D-18). Único hueco restante: Violet Equilibrium (conversión de recursos, naturaleza propia pendiente de diseño). |
| Valores tauforged sin verificar | La mayoría usa estimación 1.5x. `topaz-health-on-blast-kill: [1, 2]` es el único confirmado. Resto pendiente verificación contra el juego. |
