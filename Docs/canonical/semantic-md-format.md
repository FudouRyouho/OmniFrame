# Formato de los .md semánticos — Pipeline de habilidades

> Estado: referencia canónica
> Fuente de verdad: `references/Semantic/README.md`
> Última actualización: 2026-03-20

Formato de los archivos `references/Semantic/*.md` que alimentan el parser
`utilities/parse-semantic.mjs`.

---

## Estructura

```markdown
# NOMBRE — /Lotus/Powersuits/...    ← comentario de warframe, el parser lo ignora

## /Lotus/Powersuits/PowersuitAbilities/GlaiveAbility
// 1 - SHURIKEN                     ← comentario opcional para legibilidad humana
Drain: <ENERGY> 25
Shurikens: 5
Damage: <DT_SLASH> 750
#### SEEKING SHURIKEN               ← augment (grupo no-exclusivo, UPPER CASE)
Armor Reduction: 70%
Duration: 8s

## /Lotus/Powersuits/PowersuitAbilities/WispReservoirAbility
// 1 - RESERVOIRS
Drain: <ENERGY> 25
Radius: 5m
Buff Duration: 30s
### Vitality Mote                   ← subgrupo exclusivo (Title Case)
Max Health: 300
Health / Second: 30
### Haste Mote
Speed Multiplier: 20%
Fire Rate: 30%
#### FUSED RESERVOIR                ← augment después de los subgrupos
Energy Drain: 200%

##! /Lotus/...                      ← skip: ya procesado en ability-stats.json
```

---

## Reglas de niveles

| Nivel | Sintaxis | Caso de uso | Formato |
|---|---|---|---|
| Warframe | `# NOMBRE — /Lotus/...` | Comentario, ignorado por el parser | UPPER CASE |
| Habilidad | `## /Lotus/Powersuits/.../NombreAbility` | Clave del output JSON | uniqueName completo |
| Habilidad procesada | `##! /Lotus/...` | Skip — ya en ability-stats.json | — |
| Subgrupo | `### Nombre` | Forma, elemento, mote — exclusivo | Title Case |
| Augment | `#### NOMBRE` | Augment — `exclusive: true` (solo uno por habilidad) | UPPER CASE |

---

## Reglas de labels y valores

### Labels
- Title Case exacto como lo muestra el juego: `Drain`, `Damage / Second`, `Energy / Mark`
- Separador de partes: ` / ` (con espacios)
- Separador label/valor: `: `

### Valores numéricos
- Miles: `.` como separador → `1.500`, `8.000`
- Decimales: `,` como separador → `1,5s`, `0,5x`, `67,5`
- Rango min-max: `40 - 85%` (espacios alrededor del guion)
- Unidades pegadas al número: `10m`, `12s`, `50%`, `1,25x`

### Tags de icono
El tag va en la posición exacta donde el juego muestra el icono:
```
Drain: <ENERGY> 25
Damage: <DT_SLASH> 750
Status Chance: <DT_ELECTRICITY> 100%
Damage / Second: <DT_HEAT> <DT_RADIATION> 1.500
```

### Comentarios
```
// Este texto es ignorado por el parser
```

---

## Output del parser

El parser genera un objeto keyed por uniqueName, directamente compatible con `ability-stats.json`:

```json
{
  "/Lotus/Powersuits/PowersuitAbilities/GlaiveAbility": {
    "groups": [
      {
        "stats": [
          { "label": "Drain: <ENERGY> |val1|", "values": [{ "baseValue": 25, "upgradeBy": "NONE" }] },
          { "label": "Shurikens: |val1|",       "values": [{ "baseValue": 5,  "upgradeBy": "NONE" }] },
          { "label": "Damage: <DT_SLASH> |val1|","values": [{ "baseValue": 750,"upgradeBy": "NONE" }] }
        ]
      },
      {
        "id": "seeking-shuriken", "label": "SEEKING SHURIKEN",
        "exclusive": true, "defaultActive": false,
        "stats": [
          { "label": "Armor Reduction: |val1|%", "values": [{ "baseValue": 70, "upgradeBy": "NONE" }] },
          { "label": "Duration: |val1|s",         "values": [{ "baseValue": 8,  "upgradeBy": "NONE" }] }
        ]
      }
    ]
  }
}
```

`upgradeBy: "NONE"` es placeholder — se asigna manualmente en `ability-stats.json`.
El parser NO genera `name`, `description`, `icon` — esos vienen de `ability-stats.json`.

---

## Uso del parser

```bash
node utilities/parse-semantic.mjs                   # todos los .md
node utilities/parse-semantic.mjs --file Ash.md     # solo un warframe
node utilities/parse-semantic.mjs --out custom.json # output alternativo
```

---

## Obtener uniqueNames de un warframe

```bash
node -e "
const wf = require('./Project/public/data/warframes.json');
const w = wf.find(x => x.name === 'Ash');
console.log('# ' + w.name + ' — ' + w.uniqueName);
w.abilities.forEach(a => console.log('## ' + a.uniqueName));
"
```

---

## Lo que NO va en los .md

- Descripciones de habilidades (las provee ability-stats.json)
- `upgradeBy` / `upgradeType` (se asignan manualmente en ability-stats.json)
- Valores de rangos intermedios (solo rango máximo)
- Stats de armas exaltadas (crit, status — pertenecen al arma, no a la habilidad)
- Pasivas (se revisan en una iteración posterior)

---

## Fuentes

- Parser: `utilities/parse-semantic.mjs`
- Formato completo con casos especiales: `references/Semantic/README.md`
- Estado de los .md por warframe: `Docs/analysis/ability-stats-gap.md`
