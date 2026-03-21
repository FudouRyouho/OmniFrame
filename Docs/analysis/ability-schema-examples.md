# Schema de habilidades — Análisis, decisiones y ejemplos

> Estado: activo — documento central de schema
> Última actualización: 2026-03-20
> Reemplaza: `ability-stat-model.md`, `data-model-unification.md`
> Relacionado: `ability-formulas.md` (catálogo de fórmulas), `ability-stats-audit.md` (fuente de datos)

---

## 1. Contexto: qué estamos modelando y por qué

El objetivo no es modelar "cómo se calcula una habilidad" — eso es responsabilidad
del motor de cálculo (DT-11). El objetivo es modelar **qué datos tiene una habilidad**
de forma que el motor pueda consumirlos sin ambigüedad.

Dos capas distintas que no deben mezclarse:

```
ability-stats.json     → qué valores tiene la habilidad y con qué escalan
schema del motor       → cómo se calculan esos valores en contexto de build
```

Todo lo que discutimos aquí es capa 1. El motor (DT-11) consume esa capa y decide
qué hacer con ella. El schema de datos no necesita saber nada sobre "si este grupo
está activo, el otro se calcula diferente" — eso es lógica del motor.

---

## 2. La fuente de verdad

Hay dos módulos Lua en la wiki que son la fuente canónica:

**`Module:Ability/data/stats`** — valores base y campos de scaling
```lua
{
  Label = "Bonus Damage: |val1|%",
  Modifier = "AVATAR_ABILITY_STRENGTH",
  Values = { Val1 = 50 },
  HelminthValues = { Val1 = 30 },
  Max = 95,           -- cap máximo tras escalar
  Min = 0.25,         -- cap mínimo
  HelminthMax = 75,
  RoundTo = 1,
  InverseModifier = true,
}
```

**`Module:Maximization/data`** — fórmulas de cálculo con variables del engine
```lua
{'STR * 50', '%', 'Bonus damage'}
{'(2-EFF)*75', 'Energy'}
{'(2-EFF)*2.5/DUR', '/s', 'Energy drain'}
{'(STR * 80), 95', '%', 'Damage reduction'}  -- con cap
```

El `Modifier` del primer módulo y las variables del segundo son el mismo vocabulario:
`AVATAR_ABILITY_STRENGTH` = `STR`, `AVATAR_ABILITY_RANGE` = `RNG`, etc.

---

## 3. Variables del engine — vocabulario canónico

| Variable del módulo | Identificador canónico | Descripción |
|---|---|---|
| `STR` | `AVATAR_ABILITY_STRENGTH` | `1 + Σ(mods de fuerza)` |
| `DUR` | `AVATAR_ABILITY_DURATION` | `1 + Σ(mods de duración)` |
| `RNG` | `AVATAR_ABILITY_RANGE` | `1 + Σ(mods de rango)` |
| `EFF` | `AVATAR_ABILITY_EFFICIENCY` | `1 + Σ(mods de eficiencia)` |
| `ENERGY_COST` | `ENERGY_COST` | `(2-EFF)*base` — coste de activación |
| `ENERGY_DRAIN` | `ENERGY_DRAIN` | `(2-EFF)*base/DUR` — drain por segundo |
| `NONE` | `NONE` | Sin escala — valor fijo |

Estos identificadores son los mismos que `upgradeTypes[]` en mods de warframe:
```
Intensify  → upgradeTypes: ["AVATAR_ABILITY_STRENGTH"]
Stretch    → upgradeTypes: ["AVATAR_ABILITY_RANGE"]
```
El builder puede cruzar ambos sistemas sin ninguna tabla de traducción.

---

## 4. Schema de `AbilityStatValue` — decisiones tomadas

### D4 — Sintaxis del engine en todo el ecosistema ✅

Usar `AVATAR_ABILITY_STRENGTH` (no `STRENGTH`) en todos los campos de scaling.
Razón: coherencia directa con `upgradeTypes[]` de mods, cero mapeo intermedio.

### D5 — Dos dimensiones semánticas distintas ✅

Un stat de habilidad tiene dos dimensiones que requieren dos campos separados:

- `upgradeBy` — **con qué variable del engine escala el valor base**
  Siempre presente. Es la variable de la fórmula `upgradeBy * baseValue`.

- `upgradeType` — **qué modifica/mejora este stat en el mundo del juego**
  Solo presente cuando la habilidad actúa como modificador externo (buff abilities).
  Usa el mismo vocabulario canónico que `upgradeTypes[]` en mods.

```typescript
interface AbilityStatValue {
  baseValue: number
  upgradeBy: string          // AVATAR_ABILITY_STRENGTH | RANGE | DURATION | EFFICIENCY
                             // ENERGY_COST | ENERGY_DRAIN | NONE
  upgradeType?: string       // Solo buff abilities: WEAPON_DAMAGE_AMOUNT | ARMOR_BONUS | etc.
  cap?: number               // Valor máximo tras escalar — (STR * 80), 95 en el módulo
  capMin?: number            // Valor mínimo
  helminthBase?: number      // Valor base alternativo vía Helminth
  helminthCap?: number       // Cap alternativo vía Helminth
  inverse?: boolean          // true si el modificador actúa inversamente
}
```

Ejemplos:

```json
// Stat propio de la habilidad — solo upgradeBy
{ "baseValue": 650, "upgradeBy": "AVATAR_ABILITY_STRENGTH" }

// Buff ability (Roar) — upgradeBy + upgradeType
{ "baseValue": 50, "upgradeBy": "AVATAR_ABILITY_STRENGTH",
  "upgradeType": "WEAPON_DAMAGE_AMOUNT", "helminthBase": 30 }

// Stat con cap (Shatter Shield)
{ "baseValue": 80, "upgradeBy": "AVATAR_ABILITY_STRENGTH", "cap": 95 }

// Stat fijo — no escala
{ "baseValue": 97.5, "upgradeBy": "NONE" }

// Coste de energía
{ "baseValue": 75, "upgradeBy": "ENERGY_COST" }

// Drain por segundo (toggle)
{ "baseValue": 2.5, "upgradeBy": "ENERGY_DRAIN" }
```

### D7 — `label` canónico del módulo ✅

Usar el `Label` de `Module:Ability/data/stats` directamente como valor del campo `label`.
Formato: texto con placeholders `|val1|`, `|val2|` — compatible con `FormattedText.tsx`.
i18n no es objetivo del builder v1.

### D8 — `ENERGY_COST` y `ENERGY_DRAIN` como tipos especiales ✅

El drain por segundo `(2-EFF)*base/DUR` requiere dos variables simultáneas.
En lugar de un array de `upgradeBy`, se usan tipos especiales que el motor conoce:
- `ENERGY_COST` → el motor aplica `(2-EFF)*base`
- `ENERGY_DRAIN` → el motor aplica `(2-EFF)*base/DUR`

Casos con `TARGET`/`COMBO` (Oberon Renewal, Atlas Landslide) se documentan como
`misc` hasta que el motor los necesite — son estados de combate, no variables de build.

---

## 5. Schema de `AbilityGroup` — decisiones tomadas

### P3 — `groups[]` unificado ✅

El problema con el modelo anterior (`stats[]` + `sections[]`) era que creaba
dos estructuras paralelas que no podían superponerse de forma uniforme.
La UI tenía que bifurcar su lógica dependiendo de si la habilidad tenía secciones.

**La solución: `groups[]`**

Un grupo sin `id` es el grupo base — siempre activo, sin header, no toggleable.
Un grupo con `id` es una sección — tiene header y estado de activación.
La UI itera `groups[]` siempre igual, sin casos especiales.

```typescript
interface AbilityGroup {
  id?: string                // Sin id = grupo base (siempre activo, sin header)
                             // Con id = sección con toggle
  label?: string             // Etiqueta UI (si difiere del id)
  defaultActive?: boolean    // Default: true si no hay id, false si hay id
  exclusive?: boolean        // true = radio (solo uno activo) — Chroma, Equinox
                             // false = checkbox (varios activos) — Wisp motes
  stats: AbilityStat[]
}

interface AbilityEntry {
  uniqueName: string
  name: string
  description: string
  icon: string
  groups: AbilityGroup[]     // Un solo array — sin stats[] separado
}
```

**Por qué `id` como discriminador y no un campo `type: "base" | "section"`:**
Si no hay `id`, no hay identidad que togglear — el grupo es anónimo y siempre activo.
Si hay `id`, tiene nombre, tiene estado, tiene toggle. El campo `id` ya es el discriminador.

---

## 6. Cobertura de casos conocidos

| Caso | Patrón | Grupos con `id` | `exclusive` |
|---|---|---|---|
| Rhino (mayoría de warframes) | Stats planos | No | — |
| Chroma Elemental Ward | Elemento activo (toggle por habilidad) | Sí | `true` |
| Equinox todas las habilidades | Forma activa (toggle global) | Sí | `true` |
| Wisp Reservoirs | Motes simultáneos | Sí | `false` |
| Mesa Shatter Shield | Stat con cap | No | — |

---

## 7. Casos pendientes de validación

Estos casos no están en el JSON de prueba todavía. Antes de cerrar el schema
necesitamos confirmar que `groups[]` los cubre sin cambios estructurales.

### 7.1 — Val2 / Val3 (múltiples valores por stat)

El módulo soporta múltiples valores por stat:
```lua
{ Label = "Damage Reduction: |val1|-|val2|%", Values = { Val1 = 40, Val2 = 85 } }
```

El schema actual tiene `values: AbilityStatValue[]` — un array.
Probablemente cubre esto con dos entradas en el array, pero no lo hemos probado visualmente.

**Pendiente:** añadir un caso real con Val2 al JSON de prueba y verificar en la vista dev.

### 7.2 — Equinox: formas exclusivas con estado global ✅ validado

Equinox tiene dos formas (Night/Day) con `exclusive: true` — igual que Chroma.
El módulo lo expresa con `Types = {"Form", "Night", "Day"}` y `Type = 'Night'`/`Type = 'Day'`
en cada entrada de habilidad.

**Lo que Equinox reveló que Chroma no:** el toggle de forma en Equinox es **global** —
afecta a todas las habilidades simultáneamente. En Chroma el elemento es por habilidad.
El schema de datos es idéntico en ambos casos (`groups[]` con `exclusive: true`).
La diferencia es de UI, no de datos: la vista dev resuelve esto con un selector de forma
global que sincroniza el grupo activo en todas las cards.

Esto confirma la separación de responsabilidades:
- Schema de datos: declara qué grupos existen y cuál es el default
- UI/motor: decide si el estado es local (Chroma) o global (Equinox)

**Hallazgo adicional:** Mend & Maim tiene stats completamente distintos por forma
(Shields per Kill en Night vs Aura Damage en Day) — no solo valores distintos sino
semántica distinta. `groups[]` lo cubre sin cambios: cada forma es un grupo con sus
propios stats. El grupo base tiene los stats compartidos (Energy, Range, Drain).

### 7.3 — Habilidades pasivas

No hemos modelado pasivas. Algunas tienen stats escalables (Nidus Mutation stacks,
Garuda Bloodletting). La pregunta es si comparten el mismo schema que habilidades activas
o necesitan algo diferente.

**Posición actual:** no tenemos suficiente información canónica para decidir.
Lo correcto es seguir el patrón de `types.ts` — una base que se extiende.
No asumir que pasivas tienen la misma estructura hasta tener los datos reales.

**Pendiente:** revisar `Module:Ability/data` para ver cómo clasifica las pasivas
y si tienen `Modifier`/`Values` en `Module:Ability/data/stats`.

### 7.4 — Augmentos que añaden grupos (P6)

Peaceful Provocation (Equinox) añade una sección al panel de la habilidad.
El schema de augmentos necesita poder referenciar la habilidad que extienden.

**Posición actual:** se resuelve en el schema de mods/augmentos, no en el schema
de habilidades. El JSON de la habilidad no cambia — el builder inyecta el grupo
del augmento cuando está equipado.

**Pendiente:** definir cómo el schema de augmentos referencia la habilidad destino.

---

## 8. Lo que el schema NO resuelve (responsabilidad del motor)

**Cálculo diferencial de formas activas/inactivas:**
Forma activa → sus stats se calculan con mods aplicados.
Forma inactiva → stats base sin buff de mods activos.
El schema solo declara qué grupos existen y cuál está activo por defecto.

**Variables de combate (COMBO, TARGET, STACK):**
No son variables de build — son estados de combate dinámicos.
El motor los trata como parámetros configurables (toggle max/min en el builder).
No aparecen en el JSON de datos.

**Interacciones cross-habilidad:**
Sol Gate + Wisp Motes, Equinox formas afectando otras habilidades.
Son datos del schema de cálculo interno (DT-11), no del JSON de la habilidad.

**Helminth que elimina grupos:**
Si Helminth ocupa el slot 1 de Chroma, se pierde la selección de elemento.
Lógica del builder — no afecta al schema de datos.

---

## 9. JSONs de prueba — estado actual

Los JSONs viven en `Project/public/data/dev/ability-schema-test.json`.
La vista dev en `/dev/ability-schema` los consume con cálculo real (sliders STR/RNG/DUR/EFF).

### Rhino — caso base (sin grupos con id)

Todas las habilidades tienen un solo grupo base. Cubre:
- Stats lineales simples (Patrón 1)
- Stats fijos NONE (Patrón 11)
- Buff ability con `upgradeType` (Roar)
- `helminthBase` (Roar)

```json
{
  "uniqueName": "/Lotus/Powersuits/PowersuitAbilities/RhinoRoarAbility",
  "name": "Roar",
  "groups": [
    {
      "stats": [
        { "label": "Energy Cost: |val1|",   "values": [{ "baseValue": 75, "upgradeBy": "ENERGY_COST" }] },
        { "label": "Bonus Damage: |val1|%", "values": [{ "baseValue": 50, "upgradeBy": "AVATAR_ABILITY_STRENGTH",
                                                         "upgradeType": "WEAPON_DAMAGE_AMOUNT", "helminthBase": 30 }] },
        { "label": "Range: |val1|m",        "values": [{ "baseValue": 25, "upgradeBy": "AVATAR_ABILITY_RANGE" }] }
      ]
    }
  ]
}
```

### Chroma — grupos exclusivos (elemento activo)

Elemental Ward tiene un grupo base (stats globales) + 4 grupos exclusivos (elementos).
Solo uno puede estar activo a la vez. Cubre:
- `exclusive: true` — radio behavior
- `defaultActive: true` en el primer grupo (Heat)
- Stats con `upgradeType` dentro de grupos (Health Bonus, Shield Bonus, Armor Bonus)

```json
{
  "uniqueName": "/Lotus/Powersuits/PowersuitAbilities/DragonLuckAbility",
  "name": "Elemental Ward",
  "groups": [
    {
      "stats": [
        { "label": "Energy Cost: |val1|", "values": [{ "baseValue": 50, "upgradeBy": "ENERGY_COST" }] },
        { "label": "Duration: |val1|s",   "values": [{ "baseValue": 40, "upgradeBy": "AVATAR_ABILITY_DURATION" }] },
        { "label": "Aura Range: |val1|m", "values": [{ "baseValue": 15, "upgradeBy": "AVATAR_ABILITY_RANGE" }] }
      ]
    },
    { "id": "Heat",     "defaultActive": true,  "exclusive": true, "stats": [...] },
    { "id": "Electric", "defaultActive": false, "exclusive": true, "stats": [...] },
    { "id": "Cold",     "defaultActive": false, "exclusive": true, "stats": [...] },
    { "id": "Toxin",    "defaultActive": false, "exclusive": true, "stats": [...] }
  ]
}
```

### Wisp — grupos aditivos (motes simultáneos)

Reservoirs tiene un grupo base + 3 grupos aditivos (motes).
Todos pueden estar activos simultáneamente. Cubre:
- `exclusive: false` — checkbox behavior
- `defaultActive: true` en todos los grupos de motes
- Múltiples `upgradeType` distintos en el mismo grupo

```json
{
  "uniqueName": "/Lotus/Powersuits/PowersuitAbilities/WispReservoirAbility",
  "name": "Reservoirs",
  "groups": [
    { "stats": [/* stats globales */] },
    { "id": "Vitality", "defaultActive": true, "exclusive": false, "stats": [...] },
    { "id": "Haste",    "defaultActive": true, "exclusive": false, "stats": [...] },
    { "id": "Shock",    "defaultActive": true, "exclusive": false, "stats": [...] }
  ]
}
```

---

## 10. Problemas de schema — estado

| # | Problema | Decisión | Estado |
|---|---|---|---|
| P1 | Variables dinámicas (COMBO/TARGET) | `baseValue` limpio, lógica en motor (DT-11) | ✅ |
| P2 | Fórmulas con armor/shields del warframe | Responsabilidad del motor, no del JSON | ✅ |
| P3 | Variantes/modos/secciones | `groups[]` unificado — grupo base sin `id` + secciones con `id` | ✅ |
| P4 | Stats no escalables | `upgradeBy: "NONE"`, se muestran en UI, no van a `misc` | ✅ |
| P5 | Interacciones cross-habilidad | Schema de cálculo interno (DT-11) | ✅ |
| P6 | Augmentos que extienden grupos | En schema de mods/augmentos, no en habilidad | 🔴 pendiente |
| P7 | Val2/Val3 — múltiples valores por stat | `values[]` probablemente lo cubre — pendiente validación visual | 🟡 pendiente |
| P8 | Pasivas — mismo schema o extendido | Sin datos canónicos suficientes para decidir | 🟡 pendiente |
| P9 | Equinox — estado global vs local | Lógica de UI, no del schema — validado con selector global | ✅ |

---

## 11. Dónde buscar más información

El problema real: los datos canónicos están dispersos y no todos son accesibles
de forma estructurada. Lo que tenemos y lo que falta:

### Tenemos (scrapeado o analizado)
- `Module:Ability/data/stats` — valores base, Modifier, caps, HelminthValues → `Docs/wiki-modules/ability-data-stats.lua`
- `Module:Maximization/data` — fórmulas de cálculo con variables del engine → `Docs/wiki-modules/maximization-data.lua`
- `Module:DamageTypes/data` — tipos de daño, health types, procs → `Docs/wiki-modules/damage-types-data.lua`
- `Module:TextIcons/data` — tokens de iconos para labels y descriptions → `Docs/wiki-modules/text-icons-data.lua`
- `@wfcd/items` fork — upgradeTypes[], maxRank, modClass para mods

### Falta (pendiente de scraping)
- `Module:Ability/data` — metadata de habilidades (subsumable, augments, tipo)
  Necesario para: saber qué habilidades tienen augmentos, cuáles son pasivas
- `Module:Arcane/data` — stats de arcanos por rango
  Necesario para: GAP-DOC-2, modelo de arcanos en el builder

### No existe de forma estructurada
- Fórmulas de habilidades recientes (Koumei, Cyte-09, Jade, etc.) — no están en el módulo
- Interacciones cross-habilidad — no hay fuente canónica, solo la wiki editorial
- Mecánicas de snapshot (Wisp motes + Archon Intensify) — lógica del juego, no datos

### Fuentes alternativas que no hemos explorado
- `ExportAbilities_en.json` del Public Export de DE — puede tener datos estructurados
  que el módulo de la wiki no tiene. Vale la pena revisar antes de asumir que no existe.
- Código fuente de Overframe — open source, puede revelar cómo modelan casos edge.

---

## Referencias

- `ability-formulas.md` — catálogo completo de patrones de fórmula del módulo
- `ability-stats-audit.md` — auditoría de ability-stats.json vs fuente canónica
- `ability-stats-gap.md` — warframes pendientes de carga manual
- `wiki-modules-reference.md` — lista de módulos Lua disponibles
- `decisions/open-questions.md` §DT-6, §DT-11 — decisiones pendientes
- Vista dev: `/dev/ability-schema` — JSON de prueba con cálculo real
