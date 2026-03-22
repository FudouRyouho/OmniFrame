# Warframe Items Build

> Estado: activo
> Rol: resumir como el fork de `warframe-items` obtiene y transforma datos
> Fuente de verdad de: panorama del pipeline externo que alimenta nuestros JSON
> No usar para: estado operativo del proyecto o decisiones de UI
> Ultima actualizacion: 2026-03-22

## Flujo externo resumido

```text
build/build.mjs
  -> scraper.mjs
  -> sub-scrapers wikia y export
  -> parser.mjs
  -> data/json/*.json
```

## Componentes relevantes

- `build/build.mjs`: orquestacion general
- `build/scraper.mjs`: fetch de fuentes externas
- `build/wikia/*`: scrapers por modulo Lua o pagina wiki
- `build/parser.mjs`: merge, filtros y salida final

## Relevancia para OmniFrame

Este pipeline explica por que ciertos campos existen en `mods.json`, `warframes.json`
y `weapons.json`, y tambien donde se generan varios gaps que luego resolvemos con
documentacion o overrides.

## Regla

Cuando una decision dependa de "la fuente no lo expone" o "el fork lo descarta",
este documento es el punto de entrada antes de revisar el fork mismo.

