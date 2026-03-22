# Companion Compatibility

> Estado: activo
> Rol: documentar la semantica de `compatName` para mods de companion
> Fuente de verdad de: compatibilidad jerarquica de companions
> No usar para: filtros de UI definitivos
> Ultima actualizacion: 2026-03-21

## Punto central

`compatName` existe en la fuente y define a que companion o grupo aplica un mod.

## Niveles jerarquicos

- universal
- grupo (`ROBOTIC`, `BEAST`)
- tipo (`Sentinel`, `Kavat`, `Moa`, `Hound`)
- individuo especifico

## Implicacion

El filtrado no puede resolver esto con un simple `item.compatName === selected`.
Necesita una jerarquia de pertenencia.

## Estado

- el dato ya esta preservado
- la explotacion correcta en runtime sigue pendiente

