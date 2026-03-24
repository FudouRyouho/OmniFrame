# Data SSoT

> Estado: activo
> Rol: definir las fuentes de verdad por entidad y su sistema de origen
> Fuente de verdad de: mapa estable de SSoT del proyecto
> No usar para: backlog de gaps activos
> Ultima actualizacion: 2026-03-22

## Fuentes por entidad

| Dato | Sistema | Fuente primaria |
|---|---|---|
| metadata de warframe | scraper | API DE + wiki via `warframe-items` |
| stats de habilidades | override local + runtime | fuente manual local, publicada hoy en `Project/public/data/ability-stats.override.json` |
| pasivas | generated local + runtime | generadas hoy hacia `Project/public/data/passives.json` |
| mods | scraper | wiki via `warframe-items` |

## Regla

Una fuente se considera SSoT cuando:
- define el contenido que el runtime debe consumir
- tiene un flujo de actualizacion conocido
- cualquier override o migracion termina convergiendo ahi

## Aclaracion importante

En este proyecto no todo lo que vive en `Project/public/data/` es automaticamente SSoT.

`Project/public/data/` representa runtime publicado.

La fuente real puede ser:
- generated
- override
- o mezcla controlada de ambas capas

Ver:
- `data-layer-roles.md`
