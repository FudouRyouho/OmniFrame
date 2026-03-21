# Schema de AbilityStatValue y AbilityGroup

> Estado: referencia canónica — decisiones D4-D8 cerradas
> Fuente de decisiones: `Docs/analysis/ability-schema-examples.md`
> Última actualización: 2026-03-20

Schema definitivo para los datos de habilidades en `ability-stats.json`.

---

## AbilityStatValue

```typescript
interface AbilityStatValue {
  baseValue: number          // valor base sin modificadores
  upgradeBy: string          // con qué variable del engine escala — ver ability-engine-variables.md
  upgradeType?: string       // qué modifica externamente — solo buff abilities (Roar, Warcry)
  cap?: number               // valor máximo tras escalar
  capMin?: number            // valor mínimo tras escalar
  helminthBase?: number      // valor base alternativo vía Helminth
  helminthCap?: number       // cap alternativo vía Helminth
  inverse?: boolean          // true si el modificador actúa inversamente
}
```

### upgradeBy — valores válidos

```
AVATAR_ABILITY_STRENGTH    escala con Ability Strength
AVATAR_ABILITY_RANGE       escala con Ability Range
AVATAR_ABILITY_DURATION    escala con Ability Duration
AVATAR_ABILITY_EFFICIENCY  escala con Ability Efficiency (raro)
ENERGY_COST                coste de activación: (2-EFF)*base
ENERGY_DRAIN               drain por segundo: (2-EFF)*base/DUR
NONE                       valor fijo, no escala
```

### upgradeType — solo buff abilities

Usa el mismo vocabulario que `upgradeTypes[]` en mods. Ejemplos:

```
WEAPON_DAMAGE_AMOUNT       Roar — daño de armas
WEAPON_ATTACK_SPEED        Warcry — velocidad de ataque
ARMOR_BONUS                Warcry — armor
AVATAR_SPRINT_BOOST        Volt Speed — velocidad de movimiento
```

### Ejemplos

```json
// Stat propio — solo upgradeBy
{ "baseValue": 650, "upgradeBy": "AVATAR_ABILITY_STRENGTH" }

// Buff ability — upgradeBy + upgradeType
{ "baseValue": 50, "upgradeBy": "AVATAR_ABILITY_STRENGTH",
  "upgradeType": "WEAPON_DAMAGE_AMOUNT", "helminthBase": 30 }

// Con cap (Shatter Shield, Iron Skin)
{ "baseValue": 80, "upgradeBy": "AVATAR_ABILITY_STRENGTH", "cap": 95 }

// Fijo
{ "baseValue": 97.5, "upgradeBy": "NONE" }

// Coste de energía
{ "baseValue": 75, "upgradeBy": "ENERGY_COST" }

// Drain por segundo (toggle)
{ "baseValue": 2.5, "upgradeBy": "ENERGY_DRAIN" }
```

---

## AbilityGroup

```typescript
interface AbilityGroup {
  id?: string            // sin id = grupo base (siempre activo, sin header)
                         // con id = sección con toggle
  label?: string         // etiqueta UI del grupo
  defaultActive?: boolean
  exclusive?: boolean    // true = radio (solo uno activo) | false = checkbox (varios activos)
  stats: AbilityStatEntry[]
}
```

### Regla del discriminador

- Sin `id` → grupo base: siempre activo, sin header, no toggleable
- Con `id` → sección: tiene header, tiene estado de activación, es toggleable

### Patrones de grupos

| Caso | Grupos con id | exclusive | Ejemplo |
|---|---|---|---|
| Habilidad simple | No | — | Rhino Iron Skin |
| Formas exclusivas | Sí | `true` | Chroma Elemental Ward (Heat/Cold/Electric/Toxin) |
| Motes simultáneos | Sí | `false` | Wisp Reservoirs (Vitality/Haste/Shock) |
| Augment | Sí | `true` | Cualquier augment (solo uno por habilidad) |

### Ejemplo — Wisp Reservoirs

```json
{
  "groups": [
    {
      "stats": [
        { "label": "Drain: <ENERGY> |val1|", "values": [{ "baseValue": 25, "upgradeBy": "ENERGY_COST" }] },
        { "label": "Radius: |val1|m",        "values": [{ "baseValue": 5,  "upgradeBy": "AVATAR_ABILITY_RANGE" }] },
        { "label": "Buff Duration: |val1|s", "values": [{ "baseValue": 30, "upgradeBy": "AVATAR_ABILITY_DURATION" }] }
      ]
    },
    {
      "id": "vitality-mote", "label": "Vitality Mote",
      "exclusive": false, "defaultActive": true,
      "stats": [
        { "label": "Max Health: |val1|",      "values": [{ "baseValue": 300, "upgradeBy": "AVATAR_ABILITY_STRENGTH" }] },
        { "label": "Health / Second: |val1|", "values": [{ "baseValue": 30,  "upgradeBy": "AVATAR_ABILITY_STRENGTH" }] }
      ]
    },
    {
      "id": "haste-mote", "label": "Haste Mote",
      "exclusive": false, "defaultActive": true,
      "stats": [
        { "label": "Speed Multiplier: |val1|%", "values": [{ "baseValue": 20, "upgradeBy": "AVATAR_ABILITY_STRENGTH" }] },
        { "label": "Fire Rate: |val1|%",         "values": [{ "baseValue": 30, "upgradeBy": "AVATAR_ABILITY_STRENGTH" }] }
      ]
    },
    {
      "id": "shock-mote", "label": "Shock Mote",
      "exclusive": false, "defaultActive": true,
      "stats": [
        { "label": "Status Chance: <DT_ELECTRICITY> |val1|%", "values": [{ "baseValue": 100, "upgradeBy": "NONE" }] },
        { "label": "Range: |val1|m",   "values": [{ "baseValue": 15, "upgradeBy": "AVATAR_ABILITY_RANGE" }] },
        { "label": "Targets: |val1|",  "values": [{ "baseValue": 5,  "upgradeBy": "NONE" }] }
      ]
    }
  ]
}
```

---

## AbilityStatsData — entrada completa en ability-stats.json

```typescript
interface AbilityStatsData {
  name: string           // nombre de la habilidad
  description: string    // descripción con tags <DT_*_COLOR>
  icon: string           // nombre del archivo de icono
  groups: AbilityGroup[]
}
```

Keyed por `uniqueName` de la habilidad (`/Lotus/Powersuits/...`).

---

## Tags en labels y descriptions

`FormattedText.tsx` renderiza estos tags como iconos:

```
<DT_SLASH>        <DT_IMPACT>       <DT_PUNCTURE>
<DT_HEAT>         <DT_COLD>         <DT_ELECTRICITY>   <DT_TOXIN>
<DT_BLAST>        <DT_RADIATION>    <DT_GAS>
<DT_MAGNETIC>     <DT_VIRAL>        <DT_CORROSIVE>
<DT_VOID>         <DT_TAU>          <DT_TRUE>
<ENERGY>          <SHIELD>          <HEALTH>
```

El tag va en el label en la posición exacta donde el juego muestra el icono:
```
"Drain: <ENERGY> |val1|"
"Damage: <DT_SLASH> |val1|"
"Status Chance: <DT_ELECTRICITY> |val1|%"
```

---

## Fuentes

- Decisiones D4-D8: `Docs/analysis/ability-schema-examples.md`
- Variables del engine: `Docs/canonical/ability-engine-variables.md`
- Fórmulas completas: `Docs/analysis/ability-formulas.md`
