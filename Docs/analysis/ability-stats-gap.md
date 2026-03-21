# Gap: Ability Stats — Estado del Pipeline Semántico

> Estado: activo
> Última actualización: 2026-03-20

---

## Contexto

`ability-stats.json` tiene 299 entradas con datos reales del módulo de la wiki, pero con
limitaciones estructurales: sintaxis legacy (`modifier: "STRENGTH"`), sin subgrupos
(augments, formas, elementos), y warframes recientes sin datos.

El pipeline semántico resuelve esto de forma controlada:

```
references/Semantic/*.md  →  parse-semantic.mjs  →  parsed-output.json  →  ability-stats.json
```

Ver `references/Semantic/README.md` para el formato completo de los .md.
Ver `.kiro/steering/omniframe-context.md` para el flujo completo del pipeline.

---

## Estado de los .md semánticos

### Formato nuevo (uniqueNames en `##`) — listos para el parser

| Warframe | Estado |
|---|---|
| Ash | ✅ completo |

### Formato antiguo (pendientes de migrar `##` a uniqueNames)

Estos .md tienen stats reales pero usan el formato `## N - NOMBRE` en vez de
`## /Lotus/...`. Hay que migrarlos al nuevo formato para que el parser los procese.

Atlas, Banshee, Baruuk, Chroma, Ember, Equinox, Excalibur Umbra, Frost, Gara,
Garuda, Gauss, Harrow, Hildryn, Hydroid, Inaros, Ivara, Khora, Limbo, Loki,
Mag, Mesa, Oberon, Rhino, Vauban, Wisp, Zephyr

### Placeholders (estructura vacía, sin stats)

Caliban, Citrine, Cyte-09, Dagath, Grendel, Gyre, Jade, Koumei, Kullervo, Lavos,
Mirage, Nekros, Nezha, Nidus, Nokko, Nova, Nyx, Octavia, Oraxia, Protea, Qorvex,
Revenant, Saryn, Sevagoth, Styanax, Temple, Titania, Trinity, Uriel, Valkyr, Volt,
Voruna, Wukong, Xaku, Yareli

---

## Cómo obtener los uniqueNames de un warframe

```bash
node -e "
const wf = require('./Project/public/data/warframes.json');
const w = wf.find(x => x.name === 'NOMBRE');
console.log('# ' + w.name + ' — ' + w.uniqueName);
w.abilities.forEach(a => console.log('## ' + a.uniqueName));
"
```

---

## Flujo para añadir un warframe al pipeline

1. Obtener uniqueNames con el comando de arriba
2. Editar el `.md` en `references/Semantic/` con el nuevo formato
3. Correr `node utilities/parse-semantic.mjs --file NombreWarframe.md`
4. Verificar el output en `references/Semantic/parsed-output.json`
5. Copiar el bloque `{ groups }` de cada habilidad a `ability-stats.json`
6. Asignar `upgradeBy` correcto en `ability-stats.json` (reemplazar `"NONE"`)

---

## Warframes recientes sin datos en el módulo de la wiki

Estos warframes no tienen entrada en `Module:Ability/data/stats` — hay que capturar
los datos directamente del juego usando `utilities/ocr-capture.py`.

Koumei, Cyte-09, Jade, Dante, Qorvex, Dagath, Kullervo, Citrine, Voruna, Styanax,
Gyre, Caliban, Nokko, Oraxia, Temple, Uriel

### Herramienta OCR

`utilities/ocr-capture.py` — captura un área de pantalla y envía el texto al portapapeles.

```
Hotkey: Ctrl+Shift+C — registrar punto (2 veces para capturar)
Hotkey: Ctrl+Shift+Q — salir
```

Flujo: abrir la pantalla de habilidades en el juego → Ctrl+Shift+C en esquina superior-izquierda
→ Ctrl+Shift+C en esquina inferior-derecha → texto OCR al portapapeles → pegar en el .md.
