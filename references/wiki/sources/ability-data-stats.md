# Module:Ability/data/stats — Documentación extraída

> Fuente: `https://wiki.warframe.com/w/Module:Ability/data/stats?action=raw`
> Fuente actualizada: 2022-07-01  ← 🔴 CONGELADO
> Extraído: 2026-03-20
> Archivo raw: `ability-data-stats.lua` (175 KB / 7289 líneas)
> Raw: ability-data-stats.lua

---

## Estructura del módulo

```lua
return {
  ["/Lotus/Powersuits/.../AbilityName"] = {
    {
      Label          = "Stat name: |val1|unit",
      Modifier       = "AVATAR_ABILITY_STRENGTH",
      Values         = { Val1 = 500, Val2 = 1000 },  -- Val2 opcional
      Max            = 100,          -- opcional, cap del valor calculado
      Min            = 0.25,         -- opcional, floor del valor calculado
      HelminthValues = { Val1 = 30 },-- opcional, valores cuando se usa via Helminth
      HelminthMax    = 75,           -- opcional, cap cuando se usa via Helminth
      InverseModifier = true,        -- opcional, el modifier actúa al revés
      RoundTo        = 2,            -- opcional, decimales de redondeo
      OperationType  = "ADD",        -- opcional, tipo de operación
    },
    ...
  },
  ...
}
```

La clave es el `uniqueName` interno de la habilidad (`/Lotus/Powersuits/...`).
Cada entrada es una lista de stats, donde cada stat describe un valor escalable.

---

## Valores de Modifier

| Modifier | Descripción | Variable de build |
|---|---|---|
| `AVATAR_ABILITY_STRENGTH` | Escala con Ability Strength | STR |
| `AVATAR_ABILITY_DURATION` | Escala con Ability Duration | DUR |
| `AVATAR_ABILITY_RANGE` | Escala con Ability Range | RNG |
| `AVATAR_ABILITY_EFFICIENCY` | Escala con Ability Efficiency | EFF |
| `ENERGY_DRAIN` | Drain de energía por segundo | EFF (inverso) |
| `NONE` | Valor fijo, no escala con mods | — |

---

## Campos por stat

| Campo | Tipo | Descripción |
|---|---|---|
| `Label` | string | Texto de display con `\|val1\|` y `\|val2\|` como placeholders |
| `Modifier` | string | Qué stat de build lo modifica |
| `Values` | table | Valores base: `{ Val1, Val2? }` |
| `Max` | number | Cap máximo del valor calculado (ej. `Max = 100` → no supera 100%) |
| `Min` | number | Floor mínimo del valor calculado |
| `HelminthValues` | table | Valores base alternativos cuando la habilidad es subsumida via Helminth |
| `HelminthMax` | number | Cap alternativo para uso Helminth |
| `InverseModifier` | bool | El modifier actúa inversamente (ej. Efficiency aumenta el valor en lugar de reducirlo) |
| `RoundTo` | number | Decimales para redondeo del resultado |
| `OperationType` | string | Tipo de operación (ej. `"ADD"`) |

---

## Formato del Label

El `Label` usa `|val1|` y `|val2|` como tokens de interpolación:

```
"Duration: |val1|s"           → "Duration: 30s"
"Energy Cost: |val1|-|val2|"  → "Energy Cost: 25-50"
"Damage Reduction: |val1|%"   → "Damage Reduction: 75%"
"Angle: |val1|xb0"            → "Angle: 45°"  (xb0 = símbolo de grado)
```

---

## Cálculo del valor final

```
valorFinal = Val1 * modificador(build)
```

Donde `modificador(build)` según el Modifier:
- `AVATAR_ABILITY_STRENGTH` → `abilityStrength` (ej. 1.30 con mods)
- `AVATAR_ABILITY_DURATION` → `abilityDuration`
- `AVATAR_ABILITY_RANGE` → `abilityRange`
- `AVATAR_ABILITY_EFFICIENCY` → `abilityEfficiency` (para costos: `(2 - EFF) * Val1`)
- `ENERGY_DRAIN` → `(2 - EFF) * Val1 / DUR` (drain por segundo)
- `NONE` → `Val1` (sin modificación)

Si `Max` está definido: `valorFinal = min(valorFinal, Max)`
Si `Min` está definido: `valorFinal = max(valorFinal, Min)`
Si `InverseModifier = true`: el modifier actúa en sentido contrario al habitual

---

## Casos especiales

### Val2 — rango de valores
Algunas habilidades tienen un rango mínimo-máximo:
```lua
Label = "Energy Cost: |val1|-|val2|",
Values = { Val1 = 25, Val2 = 50 }
-- Ambos escalan con el mismo Modifier
```

### HelminthValues — valores Helminth
Cuando una habilidad se subsume via Helminth, algunos stats tienen valores distintos:
```lua
HelminthValues = { Val1 = 30 },
Label = "Bonus Damage: |val1|%",
Modifier = "AVATAR_ABILITY_STRENGTH",
-- Sin HelminthValues: usa Values.Val1 normal
-- Con Helminth: usa HelminthValues.Val1 = 30
```

### Cooldown (Lavos)
Lavos usa `Modifier = "NONE"` con `Max`/`Min` para sus cooldowns:
```lua
{ Label = "Cooldown: |val1|s", Modifier = "NONE", Values = { Val1 = 30 } }
```

---

## Cobertura del módulo

Incluye habilidades de:
- Warframes (todos los warframes del juego)
- Archwings (`/Lotus/Powersuits/Archwing/...`)
- Necramechs (Voidrig, Bonewidow)
- Operators / Drifter (habilidades de Void)
- Companions (Helminth Charger, etc.)

Total aproximado: ~400 uniqueNames de habilidades.
