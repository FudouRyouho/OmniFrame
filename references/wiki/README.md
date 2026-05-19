# Wiki Reference

> Estado: activo
> Rol: alojar referencia profunda de mecanicas del juego necesarias para el engine
> Fuente de verdad de: taxonomia de documentacion tecnica basada en la wiki
> No usar para: estado del proyecto o backlog de implementacion
> Ultima actualizacion: 2026-03-28

## Objetivo

Este espacio existe para documentar como funcionan matematicamente las mecanicas del
juego cuando el builder necesite modelarlas.

Ejemplos:
- status effects
- damage types
- armor and health interactions
- Condition Overload
- ability formulas y scaling
- dots y procs
- crit formulas
- faction modifiers

## Regla editorial

Cada documento de wiki debe responder:

```text
Como funciona esta mecanica del juego y que implicacion tiene para el engine
```

## Estructura inicial

- `mechanics/`: mecanicas de combate y formulas cross-cutting
- `modules/`: inventario y uso de modulos Lua descargados
  incluye `raw/` para el Lua descargado
- `systems/`: sistemas complejos con muchas paginas y tablas derivadas

Extensiones futuras posibles:
- `entities/`
- `sources/`

## Relacion con el engine

La referencia wiki informa al engine, pero no decide por si sola el contrato del
proyecto. Cuando una mecanica impacta el builder:

1. se documenta en `reference/wiki/`
2. se evalua en `features/builder-engine/status.md` y en la documentacion local vigente del track
3. si cambia arquitectura o policy, se registra en `decisions/`
