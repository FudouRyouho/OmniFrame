# Mod Stats Override Schema

> Estado: activo
> Rol: documentar el contrato acordado para `mod-stats.override.json`
> Fuente de verdad de: shape del override de mods
> No usar para: cobertura de mods, backlog de piloto o decisiones transversales
> Depende de: `source-model.md`, `upgrade-taxonomy.md`
> Decisiones de respaldo: C12–C14, C24–C28 en `Docs/temp/pre-v1-architecture-2026-03-26.md`
> Última actualización: 2026-03-27

## Estructura raíz

El override está indexado por `uniqueName`. Cada entrada tiene esta estructura:

```ts
interface ModStatsEntry {
  name: string
  stats: ModStat[]
}
```

- `name`: nombre legible del mod (para debugging y UI)
- `stats`: array de efectos del mod, uno por stat distinto
- sin `rank` en raíz — el rank activo lo gestiona el Builder, no el schema

## Stat

```ts
interface ModStat {
  label: string
  values: ModStatValue[]
  condition: string | null
}
```

- `label`: texto descriptivo con placeholders `|val1|`, `|val2|`, etc.
- `values`: array de valores, uno por `upgradeType` implicado en el stat
- `condition`: `null` si el stat es pasivo; string del vocabulario canónico si es condicional

## Valor por rank

```ts
interface ModStatValue {
  baseValue: number[]
  upgradeType: string
}
```

- `baseValue`: array indexado por rank — posición 0 = rank 0, posición N = rank máximo
- `upgradeType`: identificador canónico del efecto (vocabulario de `upgrade-taxonomy.md`)

## Convenciones activas

### Placeholders en `label`

`|val1|` referencia `values[0].baseValue[rankActivo]`.
`|val2|` referencia `values[1].baseValue[rankActivo]`.
El índice es posicional en el array `values[]`. El parsing nunca es batch.

### `condition`

Campo siempre presente. Nunca se omite.
- `null`: el stat aplica sin condición
- string: identificador del vocabulario de condiciones canónico

El vocabulario de condiciones **no está predefinido**. Crece incrementalmente:
cada condición nueva encontrada en un mod, arcane o warframe define una entrada
de mapeo si no existe. No se mapean condiciones sin evidencia documental.

### `baseValue` y ranks

El array debe contener un valor por cada rank del mod (rank 0 hasta rank máximo inclusive).
Un mod de rank máximo 10 tiene un array de 10 entradas (índice 0 a 9).
Consistente con el convenio de `ability-stats.override.json`.

## Ejemplos

### Stat simple sin condición

```json
{
  "/Lotus/Upgrades/Mods/Rifle/WeaponCritChanceMod": {
    "name": "Point Strike",
    "stats": [
      {
        "label": "+|val1|% Critical Chance",
        "values": [
          {
            "baseValue": [25, 50, 75, 100, 125, 150],
            "upgradeType": "WEAPON_CRIT_CHANCE"
          }
        ],
        "condition": null
      }
    ]
  }
}
```

### Stat con múltiples valores en el mismo label

```json
{
  "<uniqueName>": {
    "name": "Galvanized Scope",
    "stats": [
      {
        "label": "+|val1|% Critical Chance for |val2|s on Headshot",
        "values": [
          {
            "baseValue": [20, 30, 40, 50, 60, 70, 80, 90, 100, 120],
            "upgradeType": "WEAPON_CRIT_CHANCE"
          },
          {
            "baseValue": [4, 5, 6, 7, 8, 9, 10, 11, 12, 14],
            "upgradeType": "WEAPON_CRIT_DURATION"
          }
        ],
        "condition": "on_headshot"
      }
    ]
  }
}
```

> `"on_headshot"` es ilustrativo. El valor real se define cuando el vocabulario
> de condiciones mapee este caso específico.

### Mod con múltiples stats independientes

```json
{
  "<uniqueName>": {
    "name": "Mod con dos stats",
    "stats": [
      {
        "label": "+|val1|% Critical Chance",
        "values": [
          { "baseValue": [5, 10, 15, 20, 25, 30], "upgradeType": "WEAPON_CRIT_CHANCE" }
        ],
        "condition": null
      },
      {
        "label": "+|val1|% Critical Multiplier",
        "values": [
          { "baseValue": [10, 20, 30, 40, 50, 60], "upgradeType": "WEAPON_CRIT_DAMAGE" }
        ],
        "condition": null
      }
    ]
  }
}
```

## Diferencias respecto a `ability-stats.override.json`

| Aspecto | Abilities | Mods |
|---|---|---|
| Agrupación | `groups[]` con toggle/exclusividad | Sin grupos — `stats[]` directo |
| `upgradeBy` | Siempre presente (STR/DUR/RNG etc.) | No existe — los mods no escalan por stats del warframe |
| `baseValue` | Un único valor (max rank) | Array completo de ranks |
| `condition` | No existe todavía | Presente siempre (`null` o string) |
| Indexado por | `uniqueName` | `uniqueName` |
