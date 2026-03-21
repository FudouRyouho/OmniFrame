# Wiki Modules

Contenido raw extraído de los módulos Lua de wiki.warframe.com.
Cada archivo contiene el Lua completo del módulo correspondiente.

| Archivo | Módulo | URL raw | Documentado |
|---|---|---|---|
| `ability-data-stats.lua` | `Module:Ability/data/stats` | `https://wiki.warframe.com/w/Module:Ability/data/stats?action=raw` | `ability-data-stats.md` |
| `maximization-data.lua` | `Module:Maximization/data` | `https://wiki.warframe.com/w/Module:Maximization/data?action=raw` | `maximization-data.md` |
| `damage-types-data.lua` | `Module:DamageTypes/data` | `https://wiki.warframe.com/w/Module:DamageTypes/data?action=raw` | `damage-types-data.md` |
| `text-icons.lua` | `Module:TextIcons` | `https://wiki.warframe.com/w/Module:TextIcons?action=raw` | `text-icons-data.md` |
| `text-icons-data.lua` | `Module:TextIcons/data` | `https://wiki.warframe.com/w/Module:TextIcons/data?action=raw` | `text-icons-data.md` |

## Notas de uso

- `ability-data-stats.lua` — stats base por uniqueName de habilidad. Keyed por `/Lotus/Powersuits/...`.
  Campos: `Label`, `Modifier` (upgradeBy), `Values.Val1`, `Values.Val2?`, `Max?`, `Min?`, `HelminthValues?`, `InverseModifier?`
- `maximization-data.lua` — fórmulas de maximización por warframe y habilidad.
  Usa variables `STR`, `DUR`, `RNG`, `EFF`, `COMBO`, `TARGET`, `HEALTH`, `SHIELDS`, `xARMOR`, `aARMOR`.
- `damage-types-data.lua` — tipos de daño, health types de enemigos, procs/status effects y efectividades.
- `text-icons.lua` + `text-icons-data.lua` — renderer de tokens `<TOKEN>` a imágenes wiki.
  Tokens relevantes: `<DT_*>` (daño), `<POLARITY_*>`, `<ENERGY>`, `<HEALTH>`, `<SHIELD>`.

## Última extracción

2026-03-20
