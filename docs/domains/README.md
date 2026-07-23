# Domains — Mapa de dominios funcionales

Conocimiento técnico organizado por **capa funcional** (comportamiento). Cada dominio mapea a una capa física del proyecto.

> **Nota arquitectónica:** `data/` (SSoT de datos) y `semantic/` (vocabulario canónico) viven en [`../data/`](../data/) y [`../semantic/`](../semantic/), NO bajo `domains/`. Son fundación transversal consumida por todos los dominios funcionales — no son features.

## Dominios funcionales

| Dominio | Mapea a | Descripción |
|---|---|---|
| [`engine/`](engine/) | `Project/src/core/engine/` | Motor matemático, fórmulas y estado operativo. Blueprint y diseño en [`engine/design/`](engine/design/). |
| [`integration/`](integration/) | `core/bridge/MutatorBridge` (B) + `core/intention/ensemble-store` (A) + `useViewModel`/`ViewModelContract` (D) | Capa de traducción entre estado del usuario y motor (Capas A→B→D del modelo de 5 capas) |
| [`ui-ux/`](ui-ux/) | `src/domains/` + `src/shared/components/` + `src/lib/presentation/` | Capa de presentación: shell, vistas, componentes, virtualización |
| [`source/`](source/) | `omniframe-items/` + `warframe-items/` (repos hermanos) | Las fuentes de datos **ajenas**: qué exponen, qué les falta, qué tienen mal. Catálogo de gaps en [`source/gaps.md`](source/gaps.md). |

> `source/` es el único dominio que **no** mapea a `Project/src/`: su capa física está fuera del
> proyecto (el Public Export de DE y el repo de WFCD). Se organiza como dominio porque tiene estado
> operativo propio y un catálogo que se consulta, no porque sea una capa del código.

## Jerarquía de lectura dentro de un dominio

```
1. <dominio>/status.md      ← estado operativo actual
2. Archivos específicos     ← detalle técnico bajo demanda
```

Para tocar el SSoT consumido por estos dominios:
- [`../data/`](../data/) — SSoT de datos (schemas, pipeline, reglas)
- [`../semantic/`](../semantic/) — vocabulario canónico
