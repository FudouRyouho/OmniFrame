# Avisos de terceros

## WFCD/warframe-items (MIT)

Los archivos de `harvest/` derivan de [WFCD/warframe-items](https://github.com/WFCD/warframe-items), commit `5056d7f30`, y se copian sin cambios salvo una cabecera de procedencia (líneas que empiezan con `// [omniframe] `) que `harvest/fidelity.test.ts` descarta antes de comparar con el original:

- `harvest/build/`: `readJson.ts`, `stringify.ts`, `dedupe.ts`, `objectsort.ts`, `progress.ts`, `proxyAgent.ts`, `network.ts`, `sleep.ts`, `tradable.ts` y `types/shared.ts`.
- `harvest/config/`: `bpConflicts.json`, `dt_map.json`, `itemTypes.json`, `locales.json`, `masterableCategories.json`, `overrides.json`, `polarities.json`, `relicGrades.json` y `variants.json`. Son JSON y no admiten cabecera: su procedencia se declara sólo acá, y la prueba de fidelidad exige que sean idénticos al original salvo el fin de línea (el repo exige LF).
- `stringify.ts` cita como origen del formato de arrays primitivos https://gist.github.com/nrkn/c7a89bb7039182314415.

```
MIT License

Copyright (c) 2017 Kaptard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## JSON.lua (CC-BY 3.0)

`harvest/build/wikia/JSON.lua` es el paquete de Jeffrey Friedl (versión 20211016.28), incluido por warframe-items. Se copia byte a byte, sin ninguna edición, porque su licencia (Creative Commons CC-BY "Attribution", http://creativecommons.org/licenses/by/3.0/deed.en_US) exige mantener:

1. el aviso de copyright (`Copyright 2010-2017 Jeffrey Friedl`),
2. los enlaces de la cabecera (http://regex.info/blog/ y http://regex.info/blog/lua/json),
3. la cadena `AUTHOR_NOTE`: `-[ JSON.lua package by Jeffrey Friedl (http://regex.info/blog/lua/json) version 20211016.28 ]-`.
