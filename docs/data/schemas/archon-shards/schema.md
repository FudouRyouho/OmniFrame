---
Estado: "activo"
Rol: "Contrato del archivo archon-shards.json — catálogo de tipos de shard y sus bonus options"
Version: "v0.1.0"
Impacto_ID: "D-ArchonShards-Schema"
Fidelidad_Fisica: "Project/public/data/archon-shards.json"
Fecha_de_creacion: "2026-05-20"
Fecha_de_actualizacion: "2026-05-27"
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
  condition: string | null;    // null = pasivo. Token canónico si es condicional
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

---

## Deudas conocidas

| Deuda | Descripción |
|---|---|
| `id` naming convention | Kebab-case descriptivo por ahora (`"crimson-ability-strength"`). Pendiente formalizar como vocab semántico. |
| ~~Slot-awareness en upgrade_type~~ | **Resuelto (2026-05-26, OQ-W-4):** Tokens sub-familia `WEAPON_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}` formalizados. Los tres crimson slot-específicos ya tienen `upgrade_type` en el JSON: `WEAPON_MELEE_ADD_CRIT_MULT`, `WEAPON_PRIMARY_ADD_STATUS_CHANCE`, `WEAPON_SECONDARY_ADD_CRIT_CHANCE`. `target_channel` se emite vía `resolveToken()`. Deuda residual: `WEAPON_PRIMARY_ADD_ELECTRICITY_DAMAGE` (violet) aún no en UPGRADES[]. |
| Violet stacking bonus | `violet-primary-electricity-damage` tiene un bonus adicional que escala con cantidad de shards de familia equipados (`n * value`). No es `condition` booleano ni `upgrade_type` estándar — requiere `context_variable` en el contrato de `Modifier`. Pendiente hasta que se defina semántica de context scaling. |
| Efectos condicionales sin vocabulario | On-kill, on-status, on-high-energy — tienen `condition: null` como placeholder. Requieren vocabulario canónico de condiciones aún no definido. |
| Valores tauforged sin verificar | La mayoría usa estimación 1.5x. `topaz-health-on-blast-kill: [1, 2]` es el único confirmado. Resto pendiente verificación contra el juego. |
