# Presentation Layer

> Estado: activo
> Rol: documentar la capa de traduccion, mapeo y presentacion
> Fuente de verdad de: limites de presentacion en runtime
> No usar para: formulas del builder o estructura de fuentes primarias
> Ultima actualizacion: 2026-03-21

## Traduccion

Responsabilidades:
- labels por locale
- iconos
- formato de presentacion

No hace:
- no modifica valores de calculo
- no decide semantica de datos

## Mapeo

Responsabilidades:
- decidir que stats mostrar
- ordenar stats
- formatear valores usando traduccion

## UI

Regla principal:
- la UI renderiza lo que recibe
- no procesa datos crudos
- no hardcodea labels si existe capa de traduccion

