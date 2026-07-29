# Module:Maximization/data — Documentación extraída

> Fuente: `https://wiki.warframe.com/w/Module:Maximization/data?action=raw`
> Extraído: 2026-03-20
> Archivo raw: `maximization-data.lua`
> Raw: maximization-data.lua

---

## Estructura del módulo

```lua
Data = {
  ['WARFRAME_NAME'] = {
    Types = { "Element", ... },  -- opcional, solo Chroma y similares
    {
      Name = 'Ability Name',
      AUG = true,                -- opcional, indica que es augment
      Type = 'Heat',             -- opcional, variante elemental
      { 'formula', Unit = 'u', 'label' },
      ...
    },
    ...
  },
  ...
}
```

Cada entrada de habilidad es una tabla indexada donde cada elemento es `{ formula, Unit = '...', label }`.
Las fórmulas son strings de expresiones matemáticas con variables de build.

---

## Variables de fórmula

| Variable | Descripción | Valor base (sin mods) |
|---|---|---|
| `STR` | Ability Strength | 1.0 |
| `DUR` | Ability Duration | 1.0 |
| `RNG` | Ability Range | 1.0 |
| `EFF` | Ability Efficiency | 1.0 |
| `COMBO` | Combo Counter multiplier | 1.0 |
| `TARGET` | Número de targets | — |
| `HEALTH` | Warframe health modifier | — |
| `SHIELDS` | Warframe shield modifier | — |
| `xARMOR` | Armor multiplier (relativo) | — |
| `aARMOR` | Armor absoluto (base) | — |

Patrón de energía: `(2 - EFF) * baseCost`
- Con EFF = 1.0 → costo base
- Con EFF = 1.75 (max) → `0.25 * baseCost` (mínimo 25%)
- Con EFF = 0.4 (min sin Fleeting) → `1.6 * baseCost`

Patrón de drain: `(2 - EFF) * rate / DUR`

---

## Campos por entrada de habilidad

| Campo | Tipo | Descripción |
|---|---|---|
| `Name` | string | Nombre de la habilidad o augment |
| `AUG` | bool | Si es augment (true) |
| `Type` | string | Variante elemental (solo Chroma) |
| `[n]` | table | `{ 'formula', Unit = 'unidad', 'label' }` |

Formato de stat: `{ formula_string, Unit = 'unidad_opcional', 'label' }`
- `formula_string` — expresión evaluable con las variables de build
- `Unit` — unidad de display: `'s'`, `'m'`, `'%'`, `'x'`, `'/s'`, `'°'`, etc.
- `label` — nombre del stat (ej. `'Duration'`, `'Range'`, `'Energy'`)

Algunos stats tienen cap: `'STR * 70, 100'` → min(STR*70, 100)

---

## Warframes incluidos

Todos los warframes del juego base. Lista completa (orden alfabético en el módulo):

ASH, ATLAS, BANSHEE, BARUUK, CALIBAN, CHROMA, CITRINE, DAGATH, EMBER, EQUINOX,
EXCALIBUR, FROST, GARA, GARUDA, GAUSS, GRENDEL, GYRE, HARROW, HILDRYN, HYDROID,
INAROS, IVARA, KHORA, KOUMEI, KULLERVO, LAVOS, LIMBO, LOKI, MAG, MESA, MIRAGE,
NEKROS, NEZHA, NIDUS, NOVA, NYRE, OBERON, OCTAVIA, PROTEA, QORVEX, REVENANT,
RHINO, SARYN, SEVAGOTH, STYANAX, TITANIA, TRINITY, VALKYR, VAUBAN, VOLT,
VORUNA, WISP, WUKONG, XAKU, YARELI, ZEPHYR

---

## Ejemplos representativos

### Patrón estándar (Ash — Shuriken)
```lua
{ 'STR * 500', 'Base damage' }
{ 'STR * 500 * 0.4375', Unit = '/s', 'Bleed DoT' }
{ '(2 - EFF) * 25', 'Energy' }
```

### Con cap (Banshee — Sonic Fracture augment)
```lua
{ '(STR * 70), 100', Unit = '%', 'Armor reduction' }
-- interpreta como: min(STR * 70, 100)
```

### Con drain por duración (Banshee — Sound Quake)
```lua
{ '(2 - EFF) * 12 / DUR', Unit = '/s', 'Energy drain' }
```

### Con COMBO (Atlas — Landslide)
```lua
{ 'STR * 350 * COMBO', 'Damage' }
{ '(2 - EFF) * 25 * (1 / COMBO)', 'Energy' }
```

### Con HEALTH/SHIELDS/ARMOR (Atlas — Rumblers)
```lua
{ '1200 * (4 + HEALTH + SHIELDS + STR)', 'Health' }
{ '500 * (xARMOR + STR) + aARMOR', 'Armor' }
```

### Con variantes elementales (Chroma — Elemental Ward)
```lua
Types = {"Element", "Heat", "Electric", "Toxin", "Cold"}
-- Cada variante tiene su propia entrada con Type = 'Heat' | 'Electric' | etc.
```

### Augment sin stats (Wukong — Primal Rage)
```lua
{ Name = 'Primal Rage', AUG = true }
-- Sin fórmulas: el augment no tiene stats numéricos propios
```

---

## Relevancia para el builder

- Este módulo es la fuente de verdad para **calcular stats de habilidades con un build específico**
- Cada fórmula se evalúa sustituyendo STR/DUR/RNG/EFF del build actual
- `AUG = true` indica que la entrada corresponde a un augment — requiere que el mod esté equipado
- Las fórmulas con `COMBO`, `HEALTH`, `SHIELDS`, `xARMOR`, `aARMOR` dependen de stats del warframe o contexto de combate, no solo del build de mods
- El campo `Unit` define cómo mostrar el valor en la UI
- Complementa `Module:Ability/data/stats` que tiene los valores base — este módulo tiene las fórmulas completas con todos los modificadores
