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
4. Revisar `references/Semantic/parsed-output.json`.
5. Integrar `groups` en `Project/data/overrides/ability-stats.override.json`:
   - opcion A: `npm run merge:semantic-groups` (desde `Project/`) o
     `node scripts/merge-semantic-groups.mjs` — solo reemplaza `groups` por clave existente
   - opcion B: edicion manual del mismo campo
6. Asignar o revisar `upgradeBy` (el parser deja `NONE`).
7. `npm run generate:data` para publicar a `Project/public/data/`.
8. `node scripts/verify-ability-stats.mjs` para validar el runtime.
9. Validar que el estado del track siga documentado en `Docs/` si aplica.

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

- la metadata (`name`, `description`, `imageName`) vive en el override; el parser solo aporta `groups`
- merge mecanico: `merge-semantic-groups.mjs` desde `parsed-output.json` hacia
  `Project/data/overrides/ability-stats.override.json` (no crea claves nuevas: las habilidades
  deben existir ya en el override, p. ej. tras `generate-data`)
- merge semantico: revision de `upgradeBy` y labels sigue siendo manual

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
