# Semantic Pipeline Workflow

> Estado: activo
> Rol: describir el workflow operativo para agregar o migrar warframes al pipeline
> Fuente de verdad de: pasos de trabajo del track semantic pipeline
> No usar para: semantica de grupos o decisiones del schema
> Depende de: `../../domains/data/abilities/pipeline.md`
> Ultima actualizacion: 2026-03-22

## Flujo de trabajo

1. Obtener los `uniqueName` del warframe y de sus habilidades.
2. Editar el `.md` en `references/Semantic/`.
3. Ejecutar el parser sobre el archivo del warframe.
4. Revisar el output generado.
5. Mover `groups` a `ability-stats.json`.
6. Asignar `upgradeBy` correctamente.
7. Validar que el estado del track siga documentado en `Docs/`.

## Obtener `uniqueName`

```bash
node -e "
const wf = require('./Project/public/data/warframes.json');
const w = wf.find(x => x.name === 'NOMBRE');
console.log('# ' + w.name + ' — ' + w.uniqueName);
w.abilities.forEach(a => console.log('## ' + a.uniqueName));
"
```

## Parser

```bash
node utilities/parse-semantic.mjs --file NombreWarframe.md
```

Revisar luego:
- `references/Semantic/parsed-output.json`

## Merge actual

Estado actual:
- el merge sigue siendo manual o asistido
- la metadata (`name`, `description`, `icon`) sigue viniendo de `ability-stats.json`
- el parser solo genera `groups`

## Asignacion de `upgradeBy`

Estado actual:
- el parser deja `upgradeBy: "NONE"` como placeholder
- la asignacion correcta sigue siendo manual, habilidad por habilidad
- la herramienta disponible hoy es el editor de habilidades y las opciones canonicamente tipadas

## Formato esperado del markdown

Ver `semantic-markdown-format.md`.

## Warframes recientes sin modulo de wiki

Para warframes sin datos en `Module:Ability/data/stats`, la captura manual sigue siendo
parte del workflow.

Herramienta disponible:
- `utilities/ocr-capture.py`

Flujo:
1. abrir la pantalla de habilidades en el juego
2. capturar el area con OCR
3. pegar el texto en el `.md`
4. normalizarlo al formato semantico
