---
Estado: "referencia"
Rol: "Documentar el fork de warframe-items y los deltas que aporta al dataset base"
Impacto_ID: "D-Pipeline-WFI-Source"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-22"
Fecha_de_actualizacion: "2026-07-22"
---

# Warframe Items Source Integration

OmniFrame utiliza un fork especializado de `warframe-items` para obtener, transformar y enriquecer el dataset base del juego antes de aplicarle los overrides manuales internos.

## 1. El Pipeline Externo (Build)

Ubicación del fork: repositorio hermano `warframe-items`.

### Flujo de transformación
```text
build/build.mjs
  -> scraper.mjs (Fetch de wikia y export del juego)
  -> sub-scrapers (Módulos Lua)
  -> parser.mjs (Merge, filtros y normalización base)
  -> data/json/*.json (Artefactos de salida)
```

### Componentes clave
- **Scraper**: Obtiene la información bruta.
- **Parser**: Aplica la primera capa de limpieza para reducir el ruido visual en los JSON.

---

## 2. Qué aporta upstream vs. qué agrega el fork

Distinción medida contra el merge-base con `WFCD/warframe-items` (git), no por inspección visual del JSON.

**Enriquecimiento wiki heredado del upstream VIEJO (base del fork), no del fork** (framework de scrapers
`build/wikia/scrapers/*` + transformers): armas (`weaponClass`), mods (`upgradeTypes[]`, `maxRank`, `isFlawed`,
`modClass`), warframes (`playstyle`, `progenitor`, `subsumed`, etc.), arcanos, compañeros, taxonomía de clase,
versión, vault. El fork **no agrega nada de esto** — es maquinaria del upstream del que salió.
**Ojo — depende de la versión:** el `master` actual de `WFCD/warframe-items` (rewrite a TS) **removió** buena
parte de este enriquecimiento wiki (0 referencias a `weaponClass`/`upgradeTypes`/`playstyle` en su `build/`;
verificado 2026-07-22). Por eso el swap a pristino-master es un major bump breaking, no un refresh — el plan es
**re-cosechar** esos campos vía `omniframe-items` (mismo patrón que el AbilityScraper). Detalle e inventario
completo en `OQ-DATA-16` (§Ejecución 2026-07-22).

**Delta genuino del fork** (~117 líneas, casi todo aditivo sobre el patrón de plugin de upstream):
- **Habilidades**: `AbilityScraper` cosecha `Module:Ability/data` + `Module:Ability/data/stats` de la wiki;
  `transformAbility` los normaliza; un hook de ~12 líneas en `parser.mjs` mergea los campos wiki sobre
  `item.abilities` por `uniqueName`. Registrado en `scraper.mjs` (fetch) y re-exportadas
  `getLuaData`/`convertLuaDataToJson` para reuso externo.
- Higiene: `data/json/*` gitignoreado (artefactos generados), fetch `--depth=1`.

La **maquinaria Lua es genérica y reusable**: `getLuaData(url)` baja cualquier `Module:X/data?action=edit`;
`convertLuaDataToJson` lo pasa a JSON. Agregar un módulo que upstream ignora (p. ej. enemigos) = un scraper
con la receta de `AbilityScraper`. Esta capacidad es la base de la dirección en `OQ-DATA-16`.

---

## 3. Límites e Implicaciones

Aunque el fork es la fuente primaria automatizada, **no cierra todos los gaps**:
- El export público a veces descarta estructuras de upgrades necesarias para la simulación.
- Cuando la fuente no expone un dato vital, OmniFrame utiliza el **Override Pattern** (ver `../rules/overrides.md`).
---

Antes de diagnosticar un error de datos como "problema del engine", se debe verificar si el dato está presente en este pipeline o si requiere una corrección manual.
