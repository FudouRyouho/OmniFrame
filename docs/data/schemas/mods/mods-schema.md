---
Estado: "operativo"
Rol: "Contrato del archivo mod-stats.override.json consumido por el Resolver"
Version: "v0.1.0"
Impacto_ID: "D-Mods-Schema"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-25"
---

# Mod Stats Override Schema

## Estructura Raíz

El override está indexado por `uniqueName`. Cada entrada sigue la interfaz `ModOverrideEntry`:

```ts
interface ModOverrideEntry {
  name: string;        // Nombre legible del mod (debug/UI)
  stats: ModStat[];    // Array de efectos del mod
}
```

## Estadísticas del Mod (`ModStat`)

```ts
interface ModStat {
  label: string;       // Texto descriptivo con placeholders |val1|, |val2|
  values: ModStatValue[];
  condition: string | null; // null si es pasivo; token canónico si es condicional
}
```

## Valores por Rango (`ModStatValue`)

```ts
interface ModStatValue {
  baseValue: number[]; // Array indexado por rank (0 = base, N = max)
  upgradeType: string; // Identificador del Diccionario Semántico
}
```

## Convenciones de Uso

### Placeholders en `label`
- `|val1|` referencia a `values[0].baseValue[rankActivo]`.
- `|val2|` referencia a `values[1].baseValue[rankActivo]`.
- El índice es posicional respecto al array `values[]`.

### Gestión de Ranks
El array `baseValue` debe contener exactamente `fusionLimit + 1` entradas para cubrir desde el rango 0 hasta el máximo. Un mod con rango máximo 5 debe tener 6 entradas en su array.

---

### Notas de Integridad
- Este esquema es el contrato consumido por el **Resolver**.
- Si un mod requiere múltiples efectos simultáneos (ej: +Damage y +Multishot en el mismo texto), estos se modelan como múltiples entradas en el array `values[]` del mismo `ModStat`.
- Las condiciones (`condition`) deben pertenecer al vocabulario canónico definido en el dominio de semántica.
