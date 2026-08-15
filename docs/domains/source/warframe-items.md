---
Estado: "referencia"
Rol: "El repo de WFCD como fuente: qué aporta, cómo se ejecuta su maquinaria y qué re-cosechamos por fuera"
Impacto_ID: "D-Source-WFI"
Fidelidad_Fisica: "omniframe-items/"
Fecha_de_creacion: "2026-04-22"
Fecha_de_actualizacion: "2026-07-23"
---

# `warframe-items` (WFCD) — el intermediario

Repo de la comunidad que consume el [Public Export](public-export.md) y lo parsea a `data/json/*`.
Vive clonado en `OmniFrame/warframe-items` (gitignored), apuntando a **`WFCD/warframe-items`
pristino** — no a un fork. Es a la vez **repositorio de datos** y **maquinaria importable**, y esas
dos facetas se usan de forma distinta.

## Qué aporta

Sobre el export crudo, el parser agrega la capa que hace el dato usable: merge de fuentes,
categorización (`Primary`/`Secondary`/`Melee`/`Mods`/…), `patchlogs` (de donde sale el `versionTag`
que alimenta el audit), `compatName`, y el scrape de wikia para thumbnails y drops.

**No aporta versión citable:** su `package.json` publica `0.0.0-dev`. Por eso el catálogo de
[`gaps.md`](gaps.md) ancla cada entrada a una prueba de reproducción y no a un número.

## Lo que la promoción a pristino nos costó

El proyecto venía de un **fork de un upstream viejo** cuyo `build/wikia/scrapers/*` enriquecía el
dato con campos que hoy el `master` de WFCD **ya no produce**: `weaponClass` en armas,
`upgradeTypes[]`/`maxRank`/`isFlawed`/`modClass` en mods, `playstyle`/`progenitor`/`subsumed` en
warframes, más taxonomía de clase, versión y vault.

Ese enriquecimiento **no era del fork** — era maquinaria del upstream de entonces, que el rewrite a
TypeScript removió. Por eso el swap a pristino fue un breaking change, no un refresh: la respuesta es
**re-cosechar** esos campos por nuestra cuenta.

## La cosecha propia: `omniframe-items`

Capa intermedia nuestra (`omniframe-items/`, versionada en este repo) que baja módulos Lua del wiki y
los mergea sobre la salida de upstream. Cadena completa:

```
Public Export → warframe-items → omniframe-items → generate-data.ts → Project/public/data
└──────── ajeno ──────────────┘ └──────── nuestro ────────────────┘
```

La maquinaria Lua es genérica: `getLuaData(url)` baja cualquier `Module:X/data?action=edit` y
`convertLuaDataToJson` lo pasa a JSON. Agregar un módulo que upstream ignora es un scraper nuevo con
la misma receta — así nacieron los de habilidades, arcanos, mods, warframes, armas y **enemigos**
(`EnemyScraper`, que cubre el agujero de [`gaps.md`](gaps.md) §G-2).

El merge es **fill-if-missing** y por nombre en el caso de enemigos; los criterios de resolución y
las colisiones detectadas están en
[`../../data/schemas/enemy/schema.md`](../../data/schemas/enemy/schema.md).

## Anatomía de su build (por qué se puede orquestar desde afuera)

Relevante porque el build propio lo **reusa in-situ** en vez de reimplementarlo:

- **La orquestación son ~30 líneas** de `build/build.ts` (447 en total). El músculo vive en módulos
  importables: `scraper` (fetch) y `parser` (1435 líneas). **El parser se importa, no se copia** — por
  eso sus bugs de derivación llegan intactos, y por eso G-1 se corrige *después* del parseo
  ([`gaps.md`](gaps.md) §G-1) en vez de en el parser.
- **`build.ts` no exporta su clase** (`new Build(); void build.init()` al final), así que el pegamento
  —`applyCustomCategories`, `dedupImageNames`, `saveJson`— **se copia**: importarlo dispararía el
  build entero de upstream.
- **El clon se ejecuta, no es sólo un repositorio de datos.** El build propio importa su
  `scraper`/`parser`, así que el clon necesita sus deps instaladas (`npm install` en su directorio —
  Node resuelve por la ubicación del importador). De sus 54 deps, la cadena `scraper`+`parser` necesita
  **11**; las pesadas (`sharp`, `imagemin*`) no están entre ellas — son de `saveImages`, que se salta.
- **El estado del build vive en el directorio de upstream.** El caché incremental está anclado por
  `import.meta.url`: `previousBuild` lee `../data/json/All.json` (reusa drops y patchlogs si el hash
  no cambió) y `hashManager` **lee y escribe** `../data/cache/.export.json`. La formulación precisa de
  lo que hace el build propio es *orquestar la maquinaria de upstream in-situ y materializar la salida
  en su propio layout*.
- **La clase `Items` de upstream no es re-apuntable** (`dirname(fileURLToPath(import.meta.url))`, sin
  parámetro) y exige satélites propios (`require('data/cache/.export.json')` sin try/catch). Por eso
  escribimos loader propio (`omniframe-items/index.mjs`): lee nuestro layout, toma `.export.json` con
  fallback y ya no depende de `i18n.json` (que el control de acción dejó de emitir). A cambio, Project
  no cambia una línea.
- Métricas: origin alcanzable en ~450 ms; el fetch de recursos ~158 MB. El build completo tarda
  ~5 min — lo domina la descarga de los 15 idiomas.

## Dependencias estáticas sin auditar

Dos activos de upstream que el build consume y que **envejecerían en silencio** igual que
`Enemy.json` si WFCD dejara de publicarlos:

- `warnings.json` — de donde sale `failedImage`, que alimenta `dedupImageNames`.
- `data/img` — 605 MB, lo que lee `get-img`.

Ninguno tiene hoy un tripwire que avise si se congelan.
