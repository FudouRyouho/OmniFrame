# Repo Structure Snapshot

> Estado: referencia
> Rol: snapshot de la estructura feature-based observada en el repo durante la auditoria
> Fuente de verdad de: inventario historico de carpetas y placeholders activos
> No usar para: contrato final de arquitectura
> Ultima actualizacion: 2026-03-24

## Snapshot

Areas destacadas:
- `features/hud/` — no tocar, tema aparte
- `features/equipment/` — feature principal en evolucion, ver estructura objetivo en `placeholder-minimums.md`
- `features/arsenal/` — se mantiene como esta, tema del builder
- `features/mods/` — deprecada (NS-DT-14), logica util migra a `features/equipment/view/`
- `features/arcanes/` — deprecada (NS-DT-14), stub sin implementacion
- `features/options/` — no tocar
- `features/profile/` — no tocar
- `features/dev/example/` — migracion completada (NS-DT-15); carpetas vacias residuales pendientes de eliminar (NS-DT-16)

Estado general:
- equipment es el feature central y evoluciona para contener todas las vistas de browsing
- arsenal sigue en placeholder, depende del builder engine
- options, profile siguen sin implementar
- arcanes y mods se deprecan en favor de vistas dentro de equipment

