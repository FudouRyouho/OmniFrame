---
Estado: "activo"
Rol: "Estado operativo de las fuentes de datos ajenas: qué las alimenta, qué tan vivas están y qué hereda el proyecto"
Impacto_ID: "D-Source-Status"
Fidelidad_Fisica: "omniframe-items/"
Fecha_de_creacion: "2026-07-23"
Fecha_de_actualizacion: "2026-07-23"
---

# Source — estado de las fuentes ajenas

Este dominio documenta **el dato que no producimos**: de dónde viene, qué le falta y qué tiene mal.
Es el único lugar del corpus donde una afirmación sobre una fuente externa es normativa.

**Qué NO vive acá:** cómo estructuramos *nuestro* JSON (→ [`../../data/schemas/`](../../data/schemas/))
ni cómo el pipeline lo transforma (→ [`../../data/pipeline/`](../../data/pipeline/)). El
discriminador es a nivel-oración: si la oración describe la fuente ajena, es de este dominio; si
describe nuestra salida, no.

## 🚨 Condición de partición del dominio

**El día que `omniframe-items` sea promovido a normalizador, `source/` se parte.** Queda `source/` =
datos de entrada raw, y nace un dominio hermano (`normalization/`) = el puente entre el tipado de la
fuente y el que consume `data/*`.

Esto no es una nota de futuro: es **la costura por donde el dominio se va a cortar**, y por eso
**no se mete normalización dentro de `source/` por comodidad**. Hoy `omniframe-items` sólo cosecha y
mergea — la normalización vive en `Project/scripts/generate-data.ts`, y esa frontera se sostiene a
propósito. La promoción requiere además sacar el tipado de `@shared` a un paquete reusable; el gate
está en [`../../governance/open-questions.md`](../../governance/open-questions.md) (`OQ-DATA-16`).

## Las tres fuentes

| Fuente | Qué es | Estado | Detalle |
|---|---|---|---|
| **Public Export (DE)** | endpoint oficial de Digital Extremes; la capa-1 real de todo | vivo, versionado por hash | [`public-export.md`](public-export.md) |
| **`warframe-items` (WFCD)** | repo hermano que consume el export y lo parsea a `data/json/*` | vivo en armas/mods; **muerto en enemigos** | [`warframe-items.md`](warframe-items.md) |
| **Cosecha wiki propia** | `omniframe-items` baja módulos Lua que el export no expone | vivo, mantenido por nosotros | [`warframe-items.md`](warframe-items.md) §Cosecha |

La cadena real es `Public Export → warframe-items → omniframe-items → generate-data.ts → public/data`.
Las dos primeras son ajenas; las dos últimas son nuestras.

## Lo que hay que saber antes de tocar datos

1. **La fuente no es un contrato.** DE advierte que el export *"does not necessarily represent the
   current and future state of the game"*. Que un endpoint desaparezca es un modo de falla previsto
   — ya pasó con los enemigos.
2. **`warframe-items` no tiene versión citable** (`package.json` dice `0.0.0-dev`). Por eso el
   catálogo de gaps ancla cada entrada a una **prueba de reproducción**, no a un hash: el comando
   dice si el bug sigue vivo; un hash sólo dice cuándo lo vimos.
3. **Un gap de la fuente no se arregla en la fuente.** No controlamos WFCD ni DE. La mitigación
   siempre es nuestra: cosecha propia, override manual, o corrección en el raw propio.

## Los comandos

Todo desde `omniframe-items/`, y **en host, no en Docker** — necesitan salida a `origin.warframe.com`,
a la wiki y a GitHub. El clon de `warframe-items` necesita sus propias deps (`npm install` allí): el
build importa su código, y Node resuelve por la ubicación del importador.

| Comando | Qué hace | Cuándo |
|---|---|---|
| `npm run build:raw` | regenera `data/json/` desde el Public Export (~5 min: el fetch baja los 15 idiomas) | cuando DE actualiza, o en un clon nuevo |
| `npm run build` | refresca la **cosecha wiki** (`data/*.json`, el enriquecimiento) | cuando el wiki cambia |
| `npm run diff:raw` | compara nuestro raw contra el de upstream | tras tocar `raw-build.ts` |
| `npm run census` | censa qué campos de upstream no llegan a `public/data` | al buscar dato perdido |

`diff:raw` **ya no espera diff vacío**: hay dos divergencias deliberadas — G-1 (~620 ítems en
`damage`) y el control de acción (10 archivos que no emitimos). Ambas se descuentan. Lo que sigue
siendo señal ahí es *solo-upstream / solo-nuestro ≠ 0* dentro de una categoría que sí emitimos, o
cualquier campo que no sea `damage`.

El árbitro del dataset es `git diff Project/public/data` tras correr `generate-data.ts`.
⚠️ **Tiene un ruido conocido:** `wikia_thumbnail` es scrape del wiki en vivo y aparece/desaparece
entre corridas (~13 armas). Viaja en el contrato y en `shared/types/*`, pero **ningún componente lo
consume** — candidato a dejar de emitirse, lo que limpiaría el árbitro. Es contrato de salida, no
control de acción: decisión aparte.

## Qué emitimos y qué no

El raw pasó de **149 MB a 28 MB**. Medido, no supuesto: se rastreó de qué categoría del raw viene
cada ítem que llega a `public/data`.

- **15 categorías emitidas** — las que alimentan algún artefacto.
- **`Node` se emite sin consumidor**, a propósito: es `ExportRegions` (nivel y facción de los 269
  nodos del Star Chart), 1,2 MB, el único dato de enemigos fresco que sobrevive al fósil.
- **8 categorías no se emiten** — Fish, Gear, Glyphs, Quests, Relics, Resources, Sigils, Skins: no
  aportan un solo ítem a ningún artefacto (~15 MB).
- **`All.json` (57 MB) e `i18n.json` (50 MB) tampoco** — el agregado que el loader ya excluía, y
  traducciones que nadie pide. Eran el 72% del raw.

Dos cosas que no son obvias y sostienen esto:

1. **El filtro es de emisión, no de parseo.** `dedupImageNames` corre antes y sobre *todas* las
   categorías: resuelve colisiones de `imageName` entre ellas. Filtrar aguas arriba cambiaría los
   nombres de lo que sí emitimos y rompería `get-img.mjs`.
2. **El build purga lo que ya no corresponde.** Dejar de escribir no borra, y el loader lista el
   directorio — sin la purga, un archivo de un build anterior se seguiría cargando.

Lo que **no** se ahorra es red: el fetch baja los 15 idiomas igual. `locales` se lee del
`config/locales.json` del clon a nivel de módulo, así que recortarlo exige tocar upstream pristino o
reimplementar `fetchResources`. Diferido: el costo es tiempo de build, no dato.

## Catálogo de gaps

El corazón del dominio: [`gaps.md`](gaps.md) — cada gap con síntoma, alcance medido, cómo
reproducirlo, qué impacto tiene acá hoy y qué lo mitiga.
