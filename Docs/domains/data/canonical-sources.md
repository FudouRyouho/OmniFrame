# Canonical Sources

> Estado: activo
> Rol: listar las fuentes canonicas y su rol dentro del proyecto
> Fuente de verdad de: jerarquia de fuentes de datos
> No usar para: estado de cobertura de una entidad puntual
> Ultima actualizacion: 2026-03-21

## Fuentes

| Fuente | Rol |
|---|---|
| `@wfcd/items` | fuente primaria de datos del juego |
| `wiki.warframe.com` | referencia canonica de semantica y validacion |
| `docs.warframestat.us` | referencia secundaria |
| fork `warframe-items` | pipeline real que transforma y enriquece parte del dataset |

## Regla

La estructura del proyecto debe seguir la estructura canonica de la fuente siempre que
sea posible. Los overrides existen solo para gaps reales con objetivo claro.

## Donde seguir

- `warframe-items-build.md`
- `abilities/source-model.md`
- `mods/source-model.md`
- `weapons/source-model.md`
