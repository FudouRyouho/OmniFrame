---
Estado: "referencia"
Rol: "Listar las fuentes canónicas y su rol dentro del proyecto"
Version: "v0.0.2"
Impacto_ID: "D-Sources"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Canonical Sources

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

- `./warframe-items-source.md`
- `../schemas/weapons/source-model.md`
