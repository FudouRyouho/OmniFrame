---
Estado: "referencia"
Rol: "Los módulos Lua de la wiki como fuente de datos ajena — qué ofrecen, qué de eso el proyecto usa y qué no"
Impacto_ID: "S-WikiMod"
Fidelidad_Fisica: "references/wiki/sources/"
Fecha_de_creacion: "2026-07-31"
Fecha_de_actualizacion: "2026-07-31"
---

# Módulos Lua de la wiki

La wiki publica sus datos en módulos Lua consultables. Están capturados en
`references/wiki/sources/*.lua`, cada uno con su `.md` describiendo la **estructura del módulo**.
Este documento es la contraparte: **qué nos ofrecen como fuente**, y qué de eso consumimos.

> El `.md` de `references/` describe el módulo. Este describe **la decisión sobre el módulo**. Esa
> es la línea: allá el dato, acá el criterio.

## Qué usamos, hoy

**Casi nada — y es deliberado.** El proyecto no consume estos módulos en runtime: sus datos ya
entran por el pipeline propio o están absorbidos en los schemas. Lo que sí se usa de la cosecha wiki
son **imágenes** y la verificación manual contra la wiki local.

| Módulo | Uso |
|---|---|
| `Maximization/data` | **candidato real** — ver abajo |
| `Ability/data/stats` | ninguno · el schema de abilities cubre lo mismo con más profundidad |
| `DamageTypes/data` | ninguno · absorbido en `semantic/` y en `references/wiki/mechanics/damage-types.md` |
| `TextIcons` | ninguno · el render de `<DT_*>` lo resuelve la capa de presentación |
| `Version/data` | resolver alias `{{ver|N}}` → fecha de parche, a mano |

## `Module:Maximization/data` — el único con valor no absorbido

Es la **fuente de las fórmulas completas** de stats de habilidad, con todos sus modificadores — no
sólo los valores base (eso es `Ability/data/stats`).

- Cada fórmula se evalúa **sustituyendo STR / DUR / RNG / EFF** del build.
- `AUG = true` marca la entrada como de **augment**: exige el mod equipado.
- El campo `Unit` define cómo se muestra el valor.
- **Las fórmulas con `COMBO`, `HEALTH`, `SHIELDS`, `xARMOR`, `aARMOR` dependen de stats del warframe
  o del estado de combate**, no sólo del build de mods.

### Ese último punto responde parte de `OQ-ENGINE-24`

Esa OQ está diferida esperando *"que del recorrido salga el conteo real de formas"* de derivación
cross-stat. **El conteo no requiere recorrer warframes a mano: está en el módulo, y es chico.**

En todo `maximization-data.lua`: **5 usos de `xARMOR`, 5 de `aARMOR`, 8 de `COMBO`, 1 de `HEALTH`,
1 de `SHIELDS`**. Las fórmulas literales:

```lua
ATLAS   3750 + 5 * (450 * xARMOR * STR + aARMOR)                                      -- Health
ATLAS   1200 * (4 + HEALTH + SHIELDS + STR)                                           -- Health
ATLAS   500 * (xARMOR + STR) + aARMOR                                                 -- Armor
FROST   (5000 + 5 * (300 * xARMOR + aARMOR)) * STR                                    -- Health
NEZHA   (1000 + 2.5 * (190 * (1 + xARMOR) + aARMOR)) * STR                            -- Base health
RHINO   (1200 + (2.5 * ((190 + aARMOR) * (1 + xARMOR)) * (1 + existance(IRONCLAD_CHARGE)))) * STR
```

Dos cosas que la tabla de `OQ-ENGINE-24` no tenía:

1. **Atlas no estaba catalogado** — y aporta tres entradas, una de ellas con una forma que no
   aparece en ningún otro lado: `4 + HEALTH + SHIELDS + STR`, que lee **dos** capacity-stats como
   términos aditivos de un multiplicador.
2. **Rhino trae su augment dentro de la fórmula** (`existance(IRONCLAD_CHARGE)`), o sea que la
   fuente ya modela el eje augment-condicional dentro de la misma expresión.

> **Lo que esto NO dice.** Que las fórmulas sean legibles por máquina no las vuelve consumibles: son
> strings Lua con su propio mini-lenguaje (`existance()`, nombres de mods embebidos). Sirven como
> **censo y verificación**, no como fuente ejecutable. La decisión de mecanismo sigue siendo la de
> `OQ-ENGINE-24`.

## Fuentes

- `references/wiki/sources/` — los `.lua` capturados y la estructura de cada uno
- [`../engine/test/gap-map.md`](../engine/test/gap-map.md) · [`../../governance/open-questions.md`](../../governance/open-questions.md) (`OQ-ENGINE-24`)
