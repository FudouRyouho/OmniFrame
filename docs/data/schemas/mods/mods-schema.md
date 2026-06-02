---
Estado: "activo"
Rol: "Contrato del archivo mod-stats.override.json consumido por el Resolver"
Version: "v0.2.0"
Impacto_ID: "data-mods-schema"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-01"
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
  label:      string;          // Texto descriptivo con placeholders |val1|, |val2|
  values:     ModStatValue[];
  condition?: string | null;   // ausente = sin condición · null = condición sin token · token = condicional (D-18)
  notes?:     string[];        // semántica no tokenizable (D-14/D-15); prefijo "engine:note" (modus operandi incarnon). Migrado de `note` singular el 2026-06-01
}
```

Taxonomía de `condition` (D-18, monosemántica): **ausente** = no hay condición · **`null`** = condición real sin token todavía · **token** = condicional mapeada. El estado de análisis se infiere de `upgrade_type`/`notes[]`.  
Ver D-15 para el modelo de runtime: durante Fase 0, `condition` no se evalúa — todos los modificadores se aplican siempre.  
Vocabulario canónico de `condition`: `docs/semantic/conditions.md`.

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
- Las condiciones (`condition`) se capturan desde el label; el JSON es el SSoT del token y `docs/semantic/conditions.md` las consolida (D-19) — no es portero previo.
- `notes[]` no es documentación de sesión — es semántica de diseño pendiente de implementación. Ver D-14.
- Mods con stacking: `baseValue` almacena el **total a máximo de stacks**. El desglose va en `notes[]`. Ver D-15.
