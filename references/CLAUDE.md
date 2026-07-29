# Referencias del juego — references/

Datos del juego y anotaciones semánticas para el pipeline de OmniFrame.

## Contenido y roles

| Carpeta | Qué contiene | Editable |
|---|---|---|
| `game-ui/` | Habilidades por warframe — captura de UI + anotaciones `$`/`$$` para el pipeline | ✅ Sí |
| `wiki/` | Wiki local auditada: leyes, entidades y fuentes del juego, cada `.md` con su raw al lado | ⚠️ Solo con autorización |
| `visual/` | Imágenes, screenshots, web-rips de referencia visual | ❌ Read-only |

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
`.md` — layout y campos obligatorios en `wiki/README.md` § *"el raw vive junto a su `.md`"*. Un raw
sin `.md` que lo explique, o un `.md` sin raw contra el cual verificarse, son ambos defectos.

Cualquier `.md` de `wiki/` escrito **sin** haber pasado por este método es candidato a tener huecos del
mismo tipo — no asumir que un doc ya citado varias veces está completo solo porque fue leído antes.

## Cuándo consultar

- `game-ui/<Warframe>.md` → fuente de verdad para poblar/corregir ability stats
- `wiki/mechanics/` → leyes del juego: validar fórmulas del engine
- `wiki/{warframes,arcanes,mods,incarnon,archon-shards}/` → entidades y sus stats
- `wiki/sources/` → de dónde viene el dato (módulos Lua de la wiki, export), no qué dice el juego
