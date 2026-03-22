# Type System Boundaries

> Estado: activo
> Rol: documentar el rol de `src/lib/types/` y sus limites dentro de la arquitectura
> Fuente de verdad de: frontera del sistema de tipos compartidos
> No usar para: tipos feature-specific del builder engine
> Ultima actualizacion: 2026-03-21

## Regla de prioridad

El tipado compartido prioriza:
1. logica
2. mapeo
3. UI

## Lo que si incluye

- tipos compartidos por dominio
- constantes y opciones necesarias para editores y consumidores
- re-export central desde `index.ts`

## Lo que no incluye

- conveniencias exclusivas de UI
- campos inventados que no existen en la fuente
- tipos propios del motor de builds

## Estructura actual

- `base.ts`
- `ability.ts`
- `damage.ts`
- `weapon.ts`
- `warframe.ts`
- `mod.ts`
- `legacy.ts`
- `index.ts`

