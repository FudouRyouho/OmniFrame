# Semantic Markdown Format

> Estado: activo — **Verificado 2026-04-18**
> Rol: fijar la sintaxis de los archivos de captura en `references/semantic-ui-rips/`
> Fuente de verdad de: gramática esperada por el parser semántico

## Estructura de Captura

Los archivos de ripeo semántico deben seguir esta jerarquía para ser interpretados correctamente:

```markdown
# WARFRAME (Comentario/Header Opcional)

## /Lotus/Powersuits/PowersuitAbilities/SomeAbility
// Comentario con identificador humano (ej: 1 - SHURIKEN)

Drain: <ENERGY> 25
Damage: <DT_SLASH> 750

### Some Mode (Opcional: Sub-habilidad o modo)

#### SOME AUGMENT
Armor Reduction: 70%
```

## Reglas de Niveles

| Nivel | Sintaxis | Uso Operativo |
| :--- | :--- | :--- |
| **Warframe** | `# ...` | Informativo. El parser no lo usa como clave. |
| **Habilidad** | `## ...` | **Frontera Principal**. El parser lo usa para separar habilidades. |
| **Ignorar** | `##! ...` | Prefijo para omitir habilidades ya procesadas o duplicadas. |
| **Subgrupo** | `### ...` | Grupo con identidad propia dentro de una habilidad. |
| **Augment** | `#### ...` | Grupo adicional (Toggleable), usualmente inactivo por defecto. |

## Sintaxis de Contenido

- **Atributos**: Se escriben como `Label: Valor`. Los labels deben coincidir con los del juego.
- **Valores**: Unidades pegadas al número (`10m`, `12s`, `50%`). Rangos con espacios (`40 - 85%`).
- **Iconografía**: Los tags (ej: `<DT_SLASH>`, `<ENERGY>`, `<SHIELD>`) deben situarse en la posición exacta donde se espera que aparezcan en la descripción UI.

## Flujo de Trabajo

La información capturada en este formato se procesa mediante `utilities/parse-semantic.mjs`. El resultado es una estructura de `groups[]` que luego se integra en `Project/public/data/ability-stats.override.json`.

---

### Notas de Integridad
- Este documento no define el esquema final del engine.
- No debe contener fórmulas de escalado ni metadata de runtime; su único objetivo es la **fidelidad de la captura inicial**.
