---
Estado: "referencia"
Rol: "Los módulos Lua de la wiki como fuente ajena — cuáles siguen vivos, cuáles están congelados, y qué se puede apoyar en cada uno"
Impacto_ID: "S-WikiMod"
Fidelidad_Fisica: "references/wiki/sources/"
Fecha_de_creacion: "2026-07-31"
Fecha_de_actualizacion: "2026-07-31"
---

# Módulos Lua de la wiki

La wiki publica datos en módulos Lua consultables, capturados en `references/wiki/sources/*.lua`.
Cada uno tiene su `.md` al lado describiendo **la estructura del módulo**; este documento describe
**la decisión sobre el módulo** — qué confianza merece y qué se apoya en él.

## Lo primero: la mitad están muertos

**Un módulo que "se actualiza" como familia no dice nada sobre si *ese* módulo se actualizó.** Medido
contra `prop=revisions` de la API:

| Módulo | Última edición | |
|---|---|---|
| `Maximization/data` | **2021-12-07** — y el contenido, 2021-05-15 | 🔴 **congelado** |
| `Ability/data/stats` | **2022-07-01** | 🔴 **congelado** |
| `Enemies/data` | 2026-04-09 | 🟢 vivo |
| `TextIcons` | 2026-05-26 | 🟢 vivo |
| `Enemies/infobox` | 2026-06-25 | 🟢 vivo |
| `DamageTypes/data` | 2026-07-04 | 🟢 vivo |
| `Version/data` | 2026-07-17 | 🟢 vivo |
| `Mods/data` | 2026-07-21 | 🟢 vivo |

**El corte no es aleatorio: los dos congelados son los de habilidades.** Los demás siguen mantenidos.

Cuando `Maximization/data` dejó de tocarse, el juego estaba en **Hotfix 30.2.2**. Hoy va por
**43.0.8**: **302 versiones publicadas después**, incluido el rework completo a Damage 3.0.

## Qué usamos, hoy

**Casi nada, y es deliberado.** Ningún módulo se consume en runtime: sus datos entran por el
pipeline propio o están absorbidos en los schemas. De la cosecha wiki se usan **imágenes** y la
verificación manual contra la wiki local.

| Módulo | Uso |
|---|---|
| `Ability/data/stats` | ninguno · el schema de abilities cubre lo mismo con más profundidad — **y además está congelado** |
| `DamageTypes/data` | ninguno · absorbido en `semantic/` y en `references/wiki/mechanics/damage-types.md` |
| `TextIcons` | ninguno · el render de `<DT_*>` lo resuelve la capa de presentación |
| `Version/data` | resolver alias `{{ver|N}}` → fecha de parche, a mano |
| `Maximization/data` | **pista, no fuente** — ver abajo |
| `Enemies/infobox` | **árbitro de la ley de scaling** — ver abajo |
| `Enemies/data` | el mapa de alias canónicos de facción; **no contiene enemigos** (es un router) |

## `Module:Enemies/infobox` — el único módulo con autoridad sobre su página

Es la excepción al patrón de arriba: no es apoyo ni pista, es **la forma ejecutable de una ley que
también existe en prosa**. La página `Enemy_Level_Scaling` describe el escalado; este módulo es lo que
la wiki **corre** para poblar cada infobox de enemigo. Cuando difieren, el módulo describe lo que la
referencia realmente produce.

Ya sirvió dos veces: resolvió la contradicción de Anarchs (`OQ-ENGINE-21`) y hoy sostiene **dos marcas
de conflicto** contra la página —Techrot shields (`1.75` vs `1.76`) e Infested health (`16.100` vs
`16.0998`)—. Destilado en `references/wiki/sources/enemies-infobox.md`.

**Lo que no se capturó, a propósito:** las 12 particiones `Module:Enemies/data/<facción>` — 836 KB y
912 enemigos. No hay consumidor (el data-set de enemigos es el fósil de [`gaps.md`](gaps.md) §G-2) y su
volumen sería mantenimiento puro. Lo que sí se midió sobre ellas está en el `.md` del módulo, con el
comando para reproducirlo.

### La facción de un enemigo son tres campos, no uno

El hallazgo con más consecuencias para `OQ-DATA-15`: el módulo lee **tres campos independientes**.

| Campo | Determina | Usos medidos |
|---|---|---|
| `Faction` | la etiqueta mostrada y la categoría | — |
| `FactionScaling` | qué coeficientes de scaling aplican | **3** de 912 |
| `FactionDamageOverride` | qué fila de la matriz de resistencias aplica | **152** de 912 |

De los 152, **125 son la cadena vacía**: no redirigen a otra facción, **anulan** la matriz para ese
enemigo. Y 6 contienen **paths de asset del juego** en vez de un nombre de facción — datos rotos de la
wiki, anotados sin corregir.

## `Module:Maximization/data` — una pista de 2021, no un censo

Contiene las **fórmulas completas** de stats de habilidad (con sus modificadores), no sólo los
valores base. Su forma:

- cada fórmula se evalúa **sustituyendo STR / DUR / RNG / EFF** del build;
- `AUG = true` marca la entrada como de **augment**;
- el campo `Unit` define cómo se muestra el valor;
- las fórmulas con `COMBO`, `HEALTH`, `SHIELDS`, `xARMOR`, `aARMOR` **dependen de stats del warframe
  o del estado de combate**, no sólo del build de mods.

Ese último punto es lo interesante para la derivación cross-stat de `OQ-ENGINE-24`. En todo el
archivo hay **5 usos de `xARMOR`, 5 de `aARMOR`, 8 de `COMBO`, 1 de `HEALTH`, 1 de `SHIELDS`**:

```lua
ATLAS   3750 + 5 * (450 * xARMOR * STR + aARMOR)                                      -- Health
ATLAS   1200 * (4 + HEALTH + SHIELDS + STR)                                           -- Health
ATLAS   500 * (xARMOR + STR) + aARMOR                                                 -- Armor
FROST   (5000 + 5 * (300 * xARMOR + aARMOR)) * STR                                    -- Health
NEZHA   (1000 + 2.5 * (190 * (1 + xARMOR) + aARMOR)) * STR                            -- Base health
RHINO   (1200 + (2.5 * ((190 + aARMOR) * (1 + xARMOR)) * (1 + existance(IRONCLAD_CHARGE)))) * STR
```

### Qué se puede afirmar de esto, y qué no

> ⚠️ **Esto es un estado de 2021, no el estado del juego.** No sirve como censo de formas: sirve
> como **lista de sospechosos a contrastar** contra la página de wiki de cada habilidad, que sí está
> mantenida.

**Corroborado por otra vía** — Iron Skin (Rhino), Snow Globe (Frost) y Warding Halo (Nezha) ya están
en la tabla de `OQ-ENGINE-24`, verificados contra medición (`rhino.test.ts`) y contra las páginas
vigentes. El módulo **coincide**, y esa coincidencia es lo que le da crédito: no al revés.

**Sin corroborar — no asumir:**

- **Atlas.** No estaba catalogado, y aporta tres entradas, una con una forma que no aparece en
  ningún otro lado (`4 + HEALTH + SHIELDS + STR`, dos capacity-stats como términos aditivos). Pero
  Atlas tuvo cambios de semi-exaltada que **el módulo nunca incorporó**. Tratarlo como caso nuevo
  sin abrir su página de wiki sería construir sobre una fórmula de hace cinco años.
- **Los augments.** `existance(IRONCLAD_CHARGE)` mete el augment dentro de la expresión. La wiki
  modela los augments de forma irregular, así que la forma de esa entrada dice más del editor que
  del juego. Verificar caso por caso, nunca por patrón.

**Y aun corroborado, no es consumible:** son strings Lua con su propio mini-lenguaje (`existance()`,
nombres de mods embebidos). Censo y verificación, no fuente ejecutable. La decisión de mecanismo
sigue siendo la de `OQ-ENGINE-24`.

## La exención que escondió todo esto

`references/wiki/sources/` está **fuera del régimen de fechas** del corpus de wiki — no lleva
`> Fuente actualizada:` y ninguna herramienta lo audita. Por eso nadie vio durante años que dos de
sus módulos estaban muertos, y por eso se pudo escribir una página entera apoyada en uno de ellos
antes de mirar su historial.

El corpus **ya nombra esta patología** (`references/wiki/README.md` §Las tres fechas, "fuente
estancada") pero no la mide en ningún lado. Traer `sources/` al régimen de fechas la volvería
visible: la señal no es que la fuente se haya movido **después** de destilarla, sino que **no se
mueve hace años**.

Cómo se vuelve ejecutable —y por qué la unidad correcta es *versiones del juego* y no meses de
calendario— vive en [`../../governance/open-questions.md`](../../governance/open-questions.md)
(`OQ-DOC-2`), que además separa este caso angosto del audit de frescura per-item.

## Fuentes

- `references/wiki/sources/` — los `.lua` capturados y la estructura de cada uno
- [`../engine/test/gap-map.md`](../engine/test/gap-map.md) · [`../../governance/open-questions.md`](../../governance/open-questions.md) (`OQ-ENGINE-24`)
