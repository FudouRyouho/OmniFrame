# Referencias del juego — references/

Datos del juego y anotaciones semánticas para el pipeline de OmniFrame.

## Contenido y roles

| Carpeta | Qué contiene | Editable |
|---|---|---|
| `game-ui/` | Habilidades por warframe — captura de UI + anotaciones `$`/`$$` para el pipeline | ✅ Sí |
| `wiki/` | Wiki local auditada: leyes, entidades y fuentes del juego, cada `.md` con su raw al lado | ⚠️ Solo con autorización |
| `ingame-tests/` | **Mediciones propias in-game** — data cruda medida por el usuario | ⚠️ Solo el usuario mide |
| `visual/` | Imágenes, screenshots, web-rips de referencia visual | ❌ Read-only |

**`ingame-tests/` es la única fuente con autoridad sobre la wiki.** Cuando una medición la
desmiente, el documento de `wiki/` lleva una marca `⚠️ Discrepancia →` apuntando acá, y el test
declara a quién corrige (`> Corrige: wiki/…`). El vínculo es **bidireccional**: si el test cambia,
hay que poder saber qué documentos dependían de él.

## `game-ui/` — fuente activa del pipeline

Los `.md` de `game-ui/` alimentan directamente `ability-stats.override.json` vía parser. Son la fuente primaria de `groups`, `stats`, `upgrade_by` y `upgrade_type`. **Se editan** para añadir anotaciones semánticas.

Formato y convenciones: ver `game-ui/README.md`.

## `wiki/` y `visual/`

Datos de referencia pasiva. No se editan sin autorización explícita — son capturas del estado del juego en un momento dado.

## Captura de páginas de wiki.warframe.com — herramienta obligatoria

**Nunca usar `WebFetch`/similares para capturar contenido de `wiki.warframe.com`.** Confirmado
2026-07-11 (`.working/c2-population-rng-stress.md` Iteración 7): esas herramientas procesan el HTML a
través de un modelo intermedio que **resume según su propio criterio de relevancia**, incluso pidiendo
explícitamente verbatim/sin omitir nada — no es un límite de tamaño de página, es pérdida estructural
del tool. Ya causó al menos un caso confirmado de una mecánica citada varias veces (`>100% Status
Chance`, `Status_Effect`) cuya explicación literal nunca llegó a `wiki/mechanics/status-effects.md`
por este motivo.

**Usar en su lugar** el patrón `?action=raw` (o `?action=edit` + extraer `#wpTextbox1`, mismo mecanismo
que `utilities/fetch-wiki-module.mjs` ya usa para módulos Lua — creada puntualmente para Incarnon por
este mismo problema): `curl -sL "https://wiki.warframe.com/w/<Página>?action=raw"` da el wikitext
crudo completo, sin resumen. Guardar la captura **como hermana del `.md` que la destila**
(`wiki/<categoría>/<página>.wikitext`, sin carpeta intermedia) y declararla en el encabezado del
`.md`. **Un `.md` sin raw contra el cual verificarse es un defecto**; un raw sin `.md` sólo lo es si
pretendía ser fuente principal — una **fuente citada** no lleva `.md` propio y su dueño es el
documento que la declara. Layout, figuras y campos obligatorios: `wiki/README.md`.

Cualquier `.md` de `wiki/` escrito **sin** haber pasado por este método es candidato a tener huecos del
mismo tipo — no asumir que un doc ya citado varias veces está completo solo porque fue leído antes.

## `wiki/` guarda datos, no opiniones

Un dato de la wiki que está mal **se marca, no se corrige**. Corregirlo en el lugar mezcla la
autoridad del proyecto con la de la fuente y vuelve `wiki/` no confiable — que es exactamente el
defecto que la campaña de reconciliación está limpiando.

La marca es mínima —`⚠️ <TIPO> <flecha> <puntero>`— con cuatro tipos (**Desactualizado**,
**Conflicto**, **Discrepancia**, **Ilustración propia**) y sin explicación adjunta: el dato apuntado
se explica solo, y el cómo se llegó vive en git. Forma completa y quién tiene autoridad para marcar:
`wiki/README.md` § *La marca*.

Contenido que no viene de la wiki **sale** de `wiki/`, pero **nunca se borra en silencio**: se
preserva en `.working/` con su procedencia para rutearlo después. "No encuentro la fuente en *esta*
página" no autoriza a purgar — puede estar en la página de la entidad y no en la de la mecánica.

## Cómo leer un token: **DE desconecta fuentes, no borra tokens**

*"El token existe"* y *"la mecánica está vigente"* son **dos afirmaciones distintas** y hay que
sostenerlas por separado. Warframe casi nunca elimina un vocablo: le desconecta fuentes, una por una,
y el token sobrevive en datos, assets y tablas de la wiki mucho después de que ninguna entidad lo
aplique.

| Token | Vive | Lo que murió |
|---|---|---|
| `PT_KNOCKED_DOWN` | lo aplican ~30 fuentes | la rampa de Impact hacia él (`{{ver|27.3}}`) |
| `PT_RAD_TOX` (Confusion) | en la tabla | el uso que Nyx *Chaos* le daba |
| `PT_GLUE` (Slow) | en la tabla, **descripción vacía** | toda fuente conocida — sobrevivió la primitiva, no el proc |

**Síntoma barato de detectarlo: prosa vacía o con `?`.** La fuente marca su propia incertidumbre
cuando la tiene — leerla es gratis y evita darle a un residuo la veracidad de un dato vivo.

**Y no todo el corpus tiene la misma procedencia.** Medido 2026-08-05: los prefijos `DT_*` aparecen en
`wiki/sources/public-export.wikitext` y filtran en descripciones in-game; los `PT_*` aparecen **sólo**
en el módulo Lua de la wiki —cero en el export— y su tabla se autodeclara `{{Community}}` +
`{{UpdateMe}}`. Ambos se usan; **no soportan el mismo peso**, y al citarlos se dice cuál es cuál.

La wiki no es culpable de esto: es muchísima información y muchos editores, y actualizar una página
no actualiza los punteros que dependían de ella. Nosotros somos dos y podemos cruzar.

## Qué audita cada herramienta — y qué queda afuera a propósito

Las dos herramientas cubren **sólo `wiki/`**, porque son las reglas de `wiki/` las que ejecutan:

```bash
node Project/scripts/references-layout.mjs   # layout, raw, marcas, fechas
npm run validate:docs                        # links, imágenes, vocablo, encabezado
```

| Fuera del alcance | Por qué | Su contrato |
|---|---|---|
| `game-ui/` | formato propio, alimenta el parser del pipeline | `game-ui/README.md` |
| `ingame-tests/` | mediciones del usuario, autoridad **sobre** la wiki | `ingame-tests/README.md` |
| `visual/` | capturas y referencia de diseño, no hay `.md` que auditar | — |

**No es un hueco: es que las reglas de la wiki no les corresponden.** Un `.md` de `game-ui/` no
tiene `> Fuente:` ni raw porque no destila una página — la fuente es la UI del juego. Antes de
"extender el validador" a estos directorios, hay que escribir **qué** se les exigiría.

> ⚠️ **Lo que sí es un hueco:** `wiki/sources/` está exento del régimen de fechas, y eso escondió
> durante años que dos de sus módulos Lua están congelados (`Maximization/data` en 2021,
> `Ability/data/stats` en 2022). Los `.md` ya declaran su `> Fuente actualizada:` real a mano; la
> detección automática de **fuente estancada** sigue pendiente.

## Cuándo consultar

- `game-ui/<Warframe>.md` → fuente de verdad para poblar/corregir ability stats
- `wiki/mechanics/` → leyes del juego: validar fórmulas del engine
- `wiki/{warframes,arcanes,mods,incarnon,archon-shards}/` → entidades y sus stats
- `wiki/sources/` → de dónde viene el dato (módulos Lua de la wiki, export), no qué dice el juego
