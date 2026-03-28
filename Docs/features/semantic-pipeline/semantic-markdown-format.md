# Semantic Markdown Format

> Estado: activo
> Rol: fijar el formato operativo de `references/Semantic/*.md`
> Fuente de verdad de: sintaxis esperada por el parser semantico
> No usar para: semantica final de `upgradeBy` o cobertura por warframe
> Depende de: `workflow.md`, `parser-behavior.md`
> Ultima actualizacion: 2026-03-22

## Estructura esperada

```markdown
# WARFRAME — /Lotus/Powersuits/...

## /Lotus/Powersuits/PowersuitAbilities/SomeAbility
Drain: <ENERGY> 25
Damage: <DT_SLASH> 750
### Some Mode
Duration: 10s
#### SOME AUGMENT
Armor Reduction: 70%
```

## Regla de niveles

| Nivel | Sintaxis | Uso |
|---|---|---|
| warframe | `# Nombre - /Lotus/...` | comentario humano, el parser no lo usa como clave |
| habilidad | `## /Lotus/...Ability` | frontera de entrada en el output |
| skip | `##! /Lotus/...Ability` | omitir habilidad ya procesada |
| subgrupo | `### Nombre` | grupo con identidad |
| augment | `#### NOMBRE` | grupo adicional, usualmente no activo por defecto |

## Reglas de contenido

- los labels se escriben como aparecen en el juego
- el separador es `Label: valor`
- el parser genera `groups[]`
- el parser deja `upgradeBy: "NONE"` como placeholder
- `name`, `description` e `imageName` no salen de estos `.md`

## Reglas de labels y valores

- labels en title case, salvo augments o headers fijados en uppercase
- unidades pegadas al numero: `10m`, `12s`, `50%`, `1,25x`
- rangos con espacios: `40 - 85%`
- tags de icono en la posicion exacta donde deben renderizarse

Ejemplos:

```text
Drain: <ENERGY> 25
Damage: <DT_SLASH> 750
Status Chance: <DT_ELECTRICITY> 100%
```

## Output esperado

El parser debe generar una entrada keyed por `uniqueName` con `groups[]`.
No genera metadata completa de runtime y no fija el `upgradeBy` definitivo.

## Comandos utiles

```bash
node utilities/parse-semantic.mjs
node utilities/parse-semantic.mjs --file Ash.md
node utilities/parse-semantic.mjs --out custom.json
```

Desde `Project/` tras revisar `references/Semantic/parsed-output.json`:

```bash
npm run merge:semantic-groups
npm run generate:data
node scripts/verify-ability-stats.mjs
```

## Lo que no debe vivir aqui

- decisiones de schema del engine
- metadata de runtime
- formulas complejas del builder
- pasivas sin formato ya acordado
