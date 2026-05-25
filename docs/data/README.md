# Data — SSoT de datos del proyecto

Contratos, schemas, reglas y pipeline de datos consumidos por todos los dominios funcionales.
Esta es la **fundación**: ninguna parte del proyecto (engine, ui-ux, integration) inventa datos
por su cuenta. Todos consumen desde aquí.

## Estructura

| Ruta | Rol |
|---|---|
| [`status.md`](status.md) | Estado operativo global del flujo de datos |
| [`decisions.md`](decisions.md) | Decisiones D-series del dominio data |
| [`rules/`](rules/) | Gobernanza y reglas de datos (SSoT, roles, overrides, taxonomía) |
| [`schemas/`](schemas/) | Contratos por tipo de dato (abilities, mods, archon-shards, warframes, weapons) |
| [`pipeline/`](pipeline/) | Procesos de transformación: build, normalización, triage |
| [`references/`](references/) | Fuentes upstream (canonical-sources, warframe-items) |

## Lectura inicial sugerida

1. [`status.md`](status.md) — estado real del flujo
2. [`rules/ssot.md`](rules/ssot.md) — qué es fuente de verdad para qué
3. [`schemas/<tipo>/schema.md`](schemas/) — solo cuando se va a tocar un tipo específico

## Principio

`data/` NO es un dominio funcional. Sus subdirectorios (`abilities/`, `mods/`, etc.) NO son sub-dominios:
son **contratos bajo un mismo flujo**. La separación es organizacional por tipo de dato.
