# Variables del Engine — Habilidades de Warframe

> Estado: referencia canónica
> Fuente: `Module:Maximization/data`, `Module:Ability/data/stats`
> Última actualización: 2026-03-20

Vocabulario canónico del engine para scaling de habilidades.
Estos identificadores son los mismos en los tres sistemas:
`Module:Ability/data/stats` (campo `Modifier`), `Module:Maximization/data` (variables de fórmula),
y `upgradeTypes[]` de mods en `mods.json`.

---

## Variables de build

| Variable en módulo | Identificador canónico | Descripción | Fórmula base |
|---|---|---|---|
| `STR` | `AVATAR_ABILITY_STRENGTH` | `1 + Σ(mods de fuerza)` | `STR * baseValue` |
| `DUR` | `AVATAR_ABILITY_DURATION` | `1 + Σ(mods de duración)` | `DUR * baseValue` |
| `RNG` | `AVATAR_ABILITY_RANGE` | `1 + Σ(mods de rango)` | `RNG * baseValue` |
| `EFF` | `AVATAR_ABILITY_EFFICIENCY` | `1 + Σ(mods de eficiencia)` | ver §Energía |
| — | `NONE` | Sin escala — valor fijo | `baseValue` |

### Caps de variables

| Variable | Cap mínimo | Cap máximo | Efecto del cap |
|---|---|---|---|
| `EFF` | 0.25 | 1.75 | Coste mínimo = 25% del base; máximo = 175% |
| `STR`, `DUR`, `RNG` | sin cap canónico | sin cap canónico | Depende del stat individual (`cap` en el schema) |

---

## Tipos especiales de energía

| Identificador | Fórmula | Descripción |
|---|---|---|
| `ENERGY_COST` | `(2 - EFF) * base` | Coste de activación — la mayoría de habilidades |
| `ENERGY_DRAIN` | `(2 - EFF) * base / DUR` | Drain por segundo — habilidades toggle/canal |

### Patrones de energía menos comunes

| Patrón | Fórmula | Ejemplos | Tratamiento en schema |
|---|---|---|---|
| Drain con TARGET | `(2-EFF)*base/DUR * TARGET` | Oberon Renewal | `misc` hasta que el motor lo necesite |
| Coste por acción | `(2-EFF)*base / COMBO` | Atlas Landslide | `misc` hasta que el motor lo necesite |
| Shields (Hildryn) | `base * STR` (shields, no energía) | Todas las habilidades de Hildryn | `upgradeBy: AVATAR_ABILITY_STRENGTH`, label con `<SHIELD>` |
| Drain por enemigo | `(2-EFF)*base * TARGET_COUNT` | Equinox Pacify & Provoke | `misc` hasta que el motor lo necesite |

---

## Patrones de fórmula — resumen

| Patrón | Fórmula en módulo | Schema `upgradeBy` | Campo adicional |
|---|---|---|---|
| Lineal simple | `STR * 50` | `AVATAR_ABILITY_STRENGTH` | — |
| Con cap máximo | `(STR * 80), 95` | `AVATAR_ABILITY_STRENGTH` | `cap: 95` |
| Con cap mínimo | `(STR * 0.5), 0.25` | `AVATAR_ABILITY_STRENGTH` | `capMin: 0.25` |
| Con ambos caps | `(STR * 25), 10-75` | `AVATAR_ABILITY_STRENGTH` | `capMin: 10, cap: 75` |
| InverseModifier | `25 / RNG` | `AVATAR_ABILITY_RANGE` | `inverse: true` |
| Fijo | `10` | `NONE` | — |
| Helminth alternativo | `Val1=30, HelminthValues={Val1=20}` | (mismo) | `helminthBase: 20` |
| Coste activación | `(2-EFF)*75` | `ENERGY_COST` | — |
| Drain por segundo | `(2-EFF)*2.5/DUR` | `ENERGY_DRAIN` | — |

---

## Coherencia con upgradeTypes de mods

Los mods de warframe usan exactamente los mismos identificadores:

```
Intensify  → upgradeTypes: ["AVATAR_ABILITY_STRENGTH"]
Stretch    → upgradeTypes: ["AVATAR_ABILITY_RANGE"]
Continuity → upgradeTypes: ["AVATAR_ABILITY_DURATION"]
Streamline → upgradeTypes: ["AVATAR_ABILITY_EFFICIENCY"]
```

El builder puede cruzar "este mod afecta a `AVATAR_ABILITY_STRENGTH`" con
"este stat escala con `AVATAR_ABILITY_STRENGTH`" sin ninguna tabla de traducción.

---

## Fuentes

- `Module:Maximization/data` — fórmulas completas: `wiki.warframe.com/w/Module:Maximization/data?action=edit`
- `Module:Ability/data/stats` — campo `Modifier` por stat: `wiki.warframe.com/w/Module:Ability/data/stats?action=edit`
- Análisis completo de patrones: `Docs/analysis/ability-formulas.md`
