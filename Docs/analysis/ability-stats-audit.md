# Auditoría: ability-stats.json vs Module:Ability/data/stats

> Estado: referencia histórica — decisiones de diseño en `ability-schema-examples.md`
> Última actualización: 2026-03-20
> Prerequisito de: DT-6, GAP-DOC-1
> Fusiona: `ability-stats-data-source.md` (eliminado)

---

## 1. Lo que tenemos

`Project/public/data/ability-stats.json` — 299 entries, indexados por `uniqueName` de habilidad.

### Estructura actual por entry

```json
{
  "/Lotus/Powersuits/PowersuitAbilities/SlashDashNewAbility": {
    "name": "Slash Dash",
    "description": "Slash and dash through enemies...<DT_SLASH_COLOR>Slash Status.",
    "icon": "SlashDash130xWhite.png",
    "stats": [
      {
        "label": "Energy Cost: |val1|",
        "stats": [{ "value": 25, "modifier": "EFFICIENCY" }],
        "misc": []
      }
    ]
  }
}
```

Campos presentes en el JSON actual:
- `name`, `description`, `icon` — metadata de la habilidad
- `stats[]` — array de grupos de stats
  - `label` — texto con `|val1|`, `|val2|` como placeholders
  - `stats[]` — array de valores con `value` y `modifier`
  - `misc[]` — siempre vacío en todos los 299 entries
  - `mode` — ausente en todos los entries
  - `helminthValues` — ausente a nivel de grupo (pero sí existe a nivel de stat individual en 7 casos)

Campos en `stats[].stats[]`:
- `value` — valor base
- `modifier` — `STRENGTH | RANGE | DURATION | EFFICIENCY | ENERGY_DRAIN | NONE`
- `maxCap` — presente en 16 stats
- `minCap` — presente en algunos stats
- `helminthValues` — presente en 7 stats

### Tags en descriptions

50 entries tienen tags `DT_*_COLOR` en `description` (no en `label`):
`DT_CORROSIVE_COLOR`, `DT_ELECTRICITY_COLOR`, `DT_EXPLOSION_COLOR`, `DT_FIRE_COLOR`,
`DT_FREEZE_COLOR`, `DT_POISON_COLOR`, `DT_RADIANT_COLOR`, `DT_RADIATION_COLOR`,
`DT_SENTIENT_COLOR`, `DT_SLASH_COLOR`, `DT_VIRAL_COLOR`

`FormattedText.tsx` ya maneja estos tags correctamente — los normaliza a keys canónicas
de `IconDamageType`. No hay tags sin mapear en el código actual.

---

## 2. Lo que dice la fuente canónica

`Module:Ability/data/stats` en la wiki — Lua, indexado por `uniqueName`.

### Estructura canónica por stat

```lua
{
  Label = "Energy Cost: |val1|",
  Modifier = "AVATAR_ABILITY_EFFICIENCY",
  Values = { Val1 = 25 },
  -- Opcionales:
  Max = 75,           -- cap máximo del valor escalado
  Min = 0.25,         -- cap mínimo
  HelminthValues = { Val1 = 30 },  -- valor alternativo vía Helminth
  HelminthMax = 75,   -- cap máximo para la versión Helminth
  RoundTo = 1,        -- precisión de redondeo
  InverseModifier = true,  -- el modifier actúa inversamente (ej: Garuda Blood)
}
```

### Campos canónicos que NO están en nuestro JSON

| Campo canónico | Presente en JSON | Notas |
|---|---|---|
| `Label` | ✅ como `label` | |
| `Modifier` | ✅ normalizado | `AVATAR_ABILITY_STRENGTH` → `STRENGTH` |
| `Values.Val1` | ✅ como `value` | Solo Val1 — ver §3 |
| `Max` | ✅ como `maxCap` | Solo en 16 stats |
| `Min` | ✅ como `minCap` | |
| `HelminthValues` | ⚠️ parcial | Solo en 7 stats, a nivel de stat individual |
| `HelminthMax` | ❌ ausente | Cap del valor Helminth |
| `RoundTo` | ❌ ausente | Precisión de redondeo |
| `InverseModifier` | ❌ ausente | Garuda Blood y similares |

### Campos de agrupación que NO están en nuestro JSON

La wiki usa entries sin `Values` como **separadores de sección** dentro de una habilidad:

```lua
{ Label = "Accuse" },   -- separador de modo/fase
{ Label = "Gaze" },
{ Label = "Deny" },
```

Estos son los 36 `StatGroups sin stats[]` que encontramos en el JSON actual.
Están presentes pero con `stats: []` vacío — se renderizan como headers de sección.
El campo `mode` en `AbilityStat` del tipo TypeScript fue diseñado para esto pero
**nunca se pobló** — los separadores están como labels sin stats, no como `mode`.

---

## 3. Gaps identificados

### Gap A — `Values` multi-valor (Val1, Val2, Val3...)

La wiki soporta múltiples valores por stat:
```lua
{ Label = "Damage Reduction: |val1|-|val2|%", Values = { Val1 = 40, Val2 = 85 } }
```

Nuestro JSON solo almacena `value` (Val1). Val2, Val3 se pierden.
Afecta a habilidades con rangos de valores (Ember Immolation, etc.).

### Gap B — `HelminthMax` ausente

`HelminthMax` es el cap del valor cuando la habilidad se usa vía Helminth.
Presente en la wiki (ej: Wisp Motes, Garuda Blood), ausente en nuestro JSON.

### Gap C — `RoundTo` ausente

Precisión de redondeo para el display. Menor — afecta solo al formato visual.

### Gap D — `InverseModifier` ausente

Indica que el modifier actúa inversamente (más Efficiency = más coste, no menos).
Presente en Garuda Blood. Afecta al cálculo del builder.

### Gap E — Separadores de sección sin `mode`

36 StatGroups son separadores de fase/modo (Accuse/Gaze/Deny en Broken Frame,
Heat/Electricity/Toxin/Cold en Dragon Luck, etc.).
Están en el JSON como `stats: []` vacío, pero el campo `mode` de `AbilityStat`
nunca se usó para modelarlos. Impacto: visual únicamente, no afecta al cálculo.

### Gap F — Warframes recientes sin datos

12 Warframes recientes (Koumei, Cyte-09, Jade, Dante, Qorvex, Dagath, Kullervo,
Citrine, Voruna, Styanax, Gyre, Caliban) tienen entries vacíos o con datos mínimos.
La wiki tampoco los tiene en `Module:Ability/data/stats` — son datos que hay que
cargar manualmente vía el AbilityStatsEditor.

---

## 4. Lo que está bien y no hay que tocar

- Los 6 `Modifier` normalizados (`STRENGTH`, `RANGE`, `DURATION`, `EFFICIENCY`, `ENERGY_DRAIN`, `NONE`) son correctos y completos — cubren el 100% de los casos del módulo
- El mapeo `DT_KEY_MAP` en `FormattedText.tsx` cubre todos los tags que aparecen en descriptions — no hay tags sin mapear
- La estructura `{ name, description, icon, stats[] }` es correcta y suficiente para renderizar
- Los 299 entries existentes tienen datos reales (no inventados) — vienen del scraper del módulo de la wiki

---

## 5. Datos inventados vs datos reales

A diferencia de `ModModifier` (que era un sistema inventado de raíz), los datos de
`ability-stats.json` son **reales** — vienen directamente de `Module:Ability/data/stats`.

Lo que hay "inventado" o incompleto:
- `misc[]` — siempre vacío, el campo existe en el tipo pero nunca se usó
- `mode` — campo en el tipo para separadores de sección, nunca se pobló
- Algunos `maxCap`/`minCap` pueden estar incompletos (solo 16 stats los tienen)
- `HelminthMax`, `RoundTo`, `InverseModifier` — campos canónicos no capturados

No hay `modifier` inventados ni valores fabricados. El problema es de **cobertura**,
no de corrección.

---

## 6. Recomendaciones antes de tocar ability-stats.json

**No urgente para el builder v1:**
- Gap C (`RoundTo`) — solo afecta al display
- Gap E (separadores de sección) — visual, no afecta al cálculo
- Gap F (Warframes recientes) — datos manuales, no bloquean la arquitectura

**Relevante para el builder:**
- Gap A (`Val2`, `Val3`) — afecta a habilidades con rangos de valores
- Gap D (`InverseModifier`) — afecta al cálculo de Efficiency en casos edge
- Gap B (`HelminthMax`) — relevante si el builder soporta builds Helminth

**Acción recomendada:**
Antes de modificar `ability-stats.json`, actualizar el scraper/transformer para
capturar `Val2`/`Val3`, `HelminthMax`, `RoundTo`, `InverseModifier` del módulo.
Luego re-scrappear y regenerar. Editar el JSON a mano para estos campos sería
repetir el error del `ModStatsEditor`.

---

---

## 7. Hallazgo crítico — Coherencia con upgradeTypes de mods

Al revisar los `upgradeTypes` de mods de warframe en `mods.json`:

```
Intensify  → upgradeTypes: ["AVATAR_ABILITY_STRENGTH"]
Stretch    → upgradeTypes: ["AVATAR_ABILITY_RANGE"]
Continuity → upgradeTypes: ["AVATAR_ABILITY_DURATION"]
Streamline → upgradeTypes: ["AVATAR_ABILITY_EFFICIENCY"]
```

Los mods de warframe ya usan la sintaxis del engine (`AVATAR_ABILITY_*`).
El módulo de la wiki también usa exactamente esos mismos identificadores como `Modifier`.
La "normalización" del scraper (`AVATAR_ABILITY_STRENGTH → STRENGTH`) fue un paso
innecesario que rompió la coherencia entre los dos sistemas.

Estado actual del ecosistema:

```
Engine / upgradeTypes:   AVATAR_ABILITY_STRENGTH   ← fuente de verdad
Module:Ability/data:     AVATAR_ABILITY_STRENGTH   ← mismo identificador
ability-stats.json:      STRENGTH                  ← abreviación inventada, incoherente
```

No hay dos sistemas distintos. Es el mismo identificador en todas las fuentes.
La abreviación `STRENGTH` es una decisión editorial del scraper, no un dato canónico.

---

## 8. Decisión de diseño — Adoptar sintaxis del engine en todo el ecosistema

**D4 — Usar identificadores del engine en ability-stats.json** (2026-03-19)

Adoptar `AVATAR_ABILITY_STRENGTH`, `AVATAR_ABILITY_RANGE`, `AVATAR_ABILITY_DURATION`,
`AVATAR_ABILITY_EFFICIENCY` como valores canónicos del campo `modifier` en `ability-stats.json`.

Razones:
- Coherencia directa con `upgradeTypes[]` de mods — mismo identificador, cero mapeo
- El builder puede cruzar "este mod afecta a AVATAR_ABILITY_STRENGTH" con "este stat
  escala con AVATAR_ABILITY_STRENGTH" sin ninguna tabla de traducción intermedia
- Es la sintaxis del engine, no una abstracción editorial
- `ENERGY_DRAIN` y `NONE` no tienen equivalente en upgradeTypes — se mantienen tal cual

Impacto en el código:

| Antes | Después |
|---|---|
| `modifier: "STRENGTH"` | `modifier: "AVATAR_ABILITY_STRENGTH"` |
| `modifier: "RANGE"` | `modifier: "AVATAR_ABILITY_RANGE"` |
| `modifier: "DURATION"` | `modifier: "AVATAR_ABILITY_DURATION"` |
| `modifier: "EFFICIENCY"` | `modifier: "AVATAR_ABILITY_EFFICIENCY"` |
| `modifier: "ENERGY_DRAIN"` | `modifier: "ENERGY_DRAIN"` (sin cambio) |
| `modifier: "NONE"` | `modifier: "NONE"` (sin cambio) |

Archivos afectados:
1. `Project/src/lib/types.ts` — `AbilityScaling` type
2. `Project/public/data/ability-stats.json` — todos los `modifier` en los 299 entries
3. El scraper/transformer de habilidades — eliminar la normalización
4. Cualquier componente que compare `modifier` con los valores cortos

Orden de ejecución recomendado:
1. Actualizar `AbilityScaling` en `types.ts` primero
2. Migrar `ability-stats.json` (script de migración, no a mano)
3. Actualizar el scraper para que no normalice
4. Verificar que no hay comparaciones hardcodeadas en componentes

---

## Referencias

- `analysis/ability-schema-examples.md` — schema actual, decisiones D4-D8, P3
- `analysis/ability-stats-gap.md` — Warframes pendientes de carga manual
- `decisions/open-questions.md` §DT-6 — tarea de migración pendiente

---

## Apéndice — Fuente canónica: `Module:Ability/data/stats`

URL: `https://wiki.warframe.com/w/Module:Ability/data/stats?action=edit`

Indexado por `uniqueName` de la habilidad. Campos por stat:

| Campo | Descripción | Presente en JSON actual |
|---|---|---|
| `Label` | Texto con placeholders `\|val1\|`, `\|val2\|` | ✅ como `label` |
| `Modifier` | Variable del engine que escala el valor | ✅ normalizado (incorrecto — ver D4) |
| `Values.Val1` | Valor base | ✅ como `value` |
| `Values.Val2+` | Valores adicionales | ❌ ausente (Gap A) |
| `Max` | Cap máximo tras escalar | ✅ como `maxCap` (solo 16 stats) |
| `Min` | Cap mínimo | ✅ como `minCap` |
| `HelminthValues` | Valores alternativos vía Helminth | ⚠️ parcial (7 stats) |
| `HelminthMax` | Cap del valor Helminth | ❌ ausente (Gap B) |
| `RoundTo` | Precisión de redondeo | ❌ ausente (Gap C) |
| `InverseModifier` | El modifier actúa inversamente | ❌ ausente (Gap D) |

Notas de acceso:
- Siempre usar `?action=edit` para obtener el Lua crudo. El HTML renderizado es inconsistente.
- `Module:Ability/data` (sin `/stats`) solo tiene metadata, no stats numéricos.
- `Module:Maximization/data` tiene las fórmulas de cálculo — ver `ability-formulas.md`.
