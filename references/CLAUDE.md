# Referencias del juego — references/

Datos del juego y anotaciones semánticas para el pipeline de OmniFrame.

## Contenido y roles

| Carpeta | Qué contiene | Editable |
|---|---|---|
| `game-ui/` | Habilidades por warframe — captura de UI + anotaciones `$`/`$$` para el pipeline | ✅ Sí |
| `wiki/` | Mecánicas y fórmulas extraídas de la wiki | ⚠️ Solo con autorización |
| `visual/` | Imágenes, screenshots, web-rips de referencia visual | ❌ Read-only |

## `game-ui/` — fuente activa del pipeline

Los `.md` de `game-ui/` alimentan directamente `ability-stats.override.json` vía parser. Son la fuente primaria de `groups`, `stats`, `upgrade_by` y `upgrade_type`. **Se editan** para añadir anotaciones semánticas.

Formato y convenciones: ver `game-ui/README.md`.

## `wiki/` y `visual/`

Datos de referencia pasiva. No se editan sin autorización explícita — son capturas del estado del juego en un momento dado.

## Cuándo consultar

- `game-ui/<Warframe>.md` → fuente de verdad para poblar/corregir ability stats
- `wiki/mechanics/` → validar fórmulas del engine
- `wiki/systems/` → datos de sistemas específicos (incarnon, archon shards, etc.)
