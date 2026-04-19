---
Estado: "activo"
Rol: "Documentar el esquema operativo de ability-stats.override.json"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Schema"
Fidelidad_Fisica: "Project/public/data/ability-stats.override.json"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Ability Stats Override Schema

## Ubicación del Archivo

- **Ruta Operativa**: `Project/public/data/ability-stats.override.json`
- **Contrato de Tipos**: `Project/src/lib/types/ability.ts`

## Estructura de Habilidad (`AbilityStatsData`)

```ts
interface AbilityStatsData {
  name: string;        // Nombre público (manual)
  description: string; // Descripción con tags semánticos e indicadores |val1|
  imageName: string;   // Nombre del activo del icono
  groups: AbilityGroup[];
}
```

### Grupos de Habilidad (`AbilityGroup`)

Agrupan estadísticas por modo de disparo, aumentos o variantes de la habilidad.
```ts
interface AbilityGroup {
  id?: string;            // Opcional. Marca grupos toggleables (Augment/Modo).
  label?: string;         // Nombre del modo o augment.
  defaultActive?: boolean;
  exclusive?: boolean;    // true: Exclusivo (ej: Formas de Equinox/Chroma). false: Coexistente (ej: Buffs de Wisp/Titania).
  stats: AbilityStatEntry[];
}
```

### Entradas de Estadística (`AbilityStatEntry`)

Nido de valores asociados a una etiqueta.
```ts
interface AbilityStatEntry {
  label: string;          // Ejem: "Damage: |val1|", "Drain: |val1|"
  values: AbilityStatValue[];
}
```

### Valores de Estadística (`AbilityStatValue`)

Contrato atómico del valor y su escalado.
```ts
interface AbilityStatValue {
  baseValue: number;
  upgradeBy: AbilityUpgradeBy; // Token del Diccionario Semántico (STR, DUR, RNG, etc.)
  upgradeType?: string;        // Para stats externos (ej: WEAPON_DAMAGE_AMOUNT)
  cap?: number;
  capMin?: number;
  inverse?: boolean;           // true si el valor disminuye con el escalado
}
```

## Vocabulario de `upgradeBy` (`AbilityUpgradeBy`)

Los tokens válidos para el motor de cálculo son:
- `AVATAR_ABILITY_STRENGTH`
- `AVATAR_ABILITY_RANGE`
- `AVATAR_ABILITY_DURATION`
- `AVATAR_ABILITY_EFFICIENCY`
- `ENERGY_COST` | `ENERGY_DRAIN`
- `NONE` (Valor fijo)

---

### Notas de Integridad
- Este documento es el contrato SSoT. Cualquier discrepancia en el JSON físico es considerada deuda técnica de migración.
- El motor utiliza los indicadores `|val1|`, `|val2|` en la descripción para inyectar los valores resueltos de `values[]` en orden.
