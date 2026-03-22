# Wiki Modules

> Estado: activo
> Rol: indexar los modulos Lua descargados y su uso como referencia tecnica
> Fuente de verdad de: organizacion de los modulos wiki dentro de la documentacion activa
> No usar para: estado operativo del proyecto
> Ultima actualizacion: 2026-03-22

## Objetivo

Esta carpeta referencia los modulos descargados desde la wiki y explica por que existen
y para que sirven dentro del proyecto.

## Modulos descargados relevantes

- `Module:Ability/data/stats`
- `Module:Maximization/data`
- `Module:DamageTypes/data`
- `Module:TextIcons/data`

## Estructura

- `*.md` en esta carpeta: documentacion derivada y util de lectura
- `raw/*.lua`: fuente descargada desde la wiki

## Regla

Los archivos raw ya viven en `reference/wiki/modules/raw/`. Los `.md` de esta carpeta
describen lo relevante del modulo sin reemplazar la fuente raw.

## Relacion con otras areas

- `reference/wiki/mechanics/` destila mecanicas del juego
- `domains/data/abilities/` usa estos modulos como apoyo de modelado
- `reference/audits/` conserva analisis historicos basados en esos modulos
- `downloaded-modules.md` lista el inventario actual
