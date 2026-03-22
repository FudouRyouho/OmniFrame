# Downloaded Wiki Modules

> Estado: activo
> Rol: listar los modulos Lua descargados y su utilidad inmediata
> Fuente de verdad de: inventario activo de modulos descargados
> No usar para: decidir por si solo la arquitectura del proyecto
> Ultima actualizacion: 2026-03-22

## Inventario principal

| Modulo | Ubicacion raw actual | Uso principal |
|---|---|---|
| `Module:Ability/data/stats` | `reference/wiki/modules/raw/ability-data-stats.lua` | stats numericos por habilidad |
| `Module:Maximization/data` | `reference/wiki/modules/raw/maximization-data.lua` | formulas de STR, DUR, RNG, EFF |
| `Module:DamageTypes/data` | `reference/wiki/modules/raw/damage-types-data.lua` | damage types, health types y procs |
| `Module:TextIcons/data` | `reference/wiki/modules/raw/text-icons-data.lua` | tokens de iconos |
| `Module:TextIcons` | `reference/wiki/modules/raw/text-icons.lua` | renderer de tokens |
| `Module:Mods/data` | `reference/wiki/modules/raw/mods-data.lua` | referencia de upgrade types y metadata de mods |

## Reglas de acceso

- preferir `?action=edit` o raw controlado para contenido Lua
- no depender del HTML renderizado de la wiki

## Uso esperado

Estos modulos sirven como:
- fuente de validacion
- material para documentacion de mecanicas
- apoyo para decisiones de schema o formulas
