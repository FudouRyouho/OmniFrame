# Type System Boundaries

> Estado: activo
> Rol: documentar el rol de `src/lib/types/` y sus limites dentro de la arquitectura
> Fuente de verdad de: frontera del sistema de tipos compartidos
> No usar para: tipos feature-specific del builder engine
> Ultima actualizacion: 2026-03-22

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

## Pre-documentacion de taxonomia futura

Esta seccion no define una policy cerrada todavia.

Su objetivo es conservar contexto sobre hacia donde deberia evolucionar el tipado del
proyecto una vez cerrado el backlog de estabilizacion.

La formalizacion final se hara mas adelante via JSDoc y documentacion especifica.

## Tipado canonico

Idea:
- representa estructuras alineadas con la semantica canonica del juego o de la
  fuente base

Ejemplos posibles:
- damage tags del juego
- stats y campos que vienen de `warframe-items`
- vocabulario base de mods y habilidades cuando la fuente ya los define con claridad

Intencion:
- conservar cercania semantica con la fuente
- evitar perder significado original durante el modelado

## Tipado inferido

Idea:
- representa estructuras que siguen el patron canonico del juego, pero que aun no
  tienen una forma completamente cerrada o explicitada por la fuente

Ejemplos posibles:
- adaptaciones que respetan la semantica del juego aunque la fuente no entregue una
  estructura perfectamente usable
- tipos intermedios derivados de convenciones internas del juego

Intencion:
- capturar semantica real sin afirmar todavia que el shape final es definitivo

## Tipado conceptual

Idea:
- representa estructuras abiertas a cambio, creadas para organizar el proyecto y
  preparar consumidores futuros

Ejemplos posibles:
- `Layout`
- contratos intermedios del builder
- tipos de UI o integracion aun no cerrados

Intencion:
- permitir evolucion controlada del proyecto
- no fingir que todo shape actual ya es definitivo

## Regla futura deseada

Cuando esta taxonomia se formalice:

- los tipos deben dejar claro si son canonicos, inferidos o conceptuales
- esa aclaracion debe vivir en JSDoc y en la documentacion de fronteras
- no todos los tipos necesitan la misma rigidez
- los tipos conceptuales no deben venderse como contratos estables del dominio

## Lo que esta seccion no autoriza ahora

- no obliga a renombrar archivos en `S2`
- no obliga a refactorizar hoy `src/lib/types/`
- no redefine todavia el sistema de tipos compartidos

Por ahora solo fija el contexto para que `S2 minimo` no cierre en falso una
discusion mas profunda que se resolvera despues del backlog.
