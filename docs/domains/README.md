# Domains — Mapa de dominios

Conocimiento técnico organizado por área de responsabilidad. Cada dominio mapea a una capa física del proyecto.

## Dominios y su contraparte en código

| Dominio | Mapea a | Descripción |
|---|---|---|
| [`data/`](data/) | `Project/scripts/` + `Project/data/` + `shared/types/` | Pipeline de datos build-time, schemas de entidades, SSoT de fuentes |
| [`engine/`](engine/) | `Project/src/core/engine/` | Motor matemático, fórmulas y estado operativo de sim-v2 |
| [`integration/`](integration/) | `sim-v2/logic/MutatorBridge` + `sim-v2/hooks/useSimulation` + `providers/Ensemble` | Capa de traducción entre estado del usuario y motor (Capas A→B→D del modelo de 5 capas) |
| [`semantic/`](semantic/) | `shared/types/` + `lib/presentation/` + engine inputs | Contratos cross-cutting compartidos por engine, data y UI. Rompe isolación a propósito. |
| [`ui-ux/`](ui-ux/) | `src/domains/` + `src/shared/components/` + `src/lib/presentation/` | Capa de presentación: shell, vistas, componentes, virtualización |

## Nota sobre `semantic/`

`semantic/` es intencionalmente cross-cutting. Sus contratos (damage-types, polarity, factions) son consumidos simultáneamente por el engine, el pipeline de datos y la UI. No es un error que no pertenezca a un solo layer — es el vocabulario compartido del sistema.

## Jerarquía de lectura dentro de un dominio

```
1. <dominio>/schema.md o source-model.md  ← contrato del dominio
2. <dominio>/status.md                    ← estado operativo actual
3. Archivos específicos del tema          ← detalle técnico
```