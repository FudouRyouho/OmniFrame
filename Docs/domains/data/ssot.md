# Data SSoT

> Estado: activo
> Rol: definir las fuentes de verdad por entidad y su sistema de origen
> Fuente de verdad de: mapa estable de SSoT del proyecto
> No usar para: backlog de gaps activos
> Ultima actualizacion: 2026-03-21

## Fuentes por entidad

| Dato | Sistema | Fuente primaria |
|---|---|---|
| metadata de warframe | scraper | API DE + wiki via `warframe-items` |
| stats de habilidades | local DB | `Project/public/data/ability-stats.json` |
| pasivas | local DB | `Project/public/data/passives.json` |
| mods | scraper | wiki via `warframe-items` |

## Regla

Una fuente se considera SSoT cuando:
- es la que consume el runtime
- tiene un flujo de actualizacion conocido
- cualquier override o migracion termina convergiendo ahi

