---
Estado: "referencia"
Rol: "Documentar el rol de src/shared/types/ y sus límites"
Version: "v0.0.3"
Impacto_ID: "G-Types"
Fidelidad_Fisica: "Project/src/shared/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-20"
---

# Type System Boundaries

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
- `arcane.ts`
- `companion.ts`
- `archwing-weapon.ts`
- `vehicle.ts`
- `polarity.ts`
- `index.ts`

El vocabulario semántico canónico que respalda estos tipos vive en `../semantic/damage-types.md` y similares. 
Antes de añadir un tipo nuevo a `shared/types/`, verificar si ya existe o está pendiente en el diccionario semántico.

## Decision operativa actual

Cierre vigente para este corte:

- opcion B — consolidar una taxonomia canonica unica para damage types dentro de la
  frontera compartida de `src/shared/types/`
- esta raiz debe servir para eliminar drift entre tipo base, aliases raw, labels,
  iconografia y familias semanticas minimas usadas por consumidores actuales
- la decision no autoriza todavia a promover una taxonomia de combate mas amplia al
  runtime productivo

Este checkpoint se considera suficiente para estabilizacion: hasta aca esta bien.

Implementacion base aplicada:
- `Project/src/shared/types/damage.ts` concentra ahora la raiz canonica minima
- labels, aliases raw y iconografia consumen esa raiz en vez de mantener tablas paralelas
- este corte cierra drift de damage types sin promover todavia semantica amplia de combate

## Pre-documentacion de crecimiento futuro

La direccion futura sigue siendo opcion C, pero solo como pre-definicion documental.

Eso significa:

- la semantica canonica de `upgradeType`, condiciones y contratos de combate mas amplios
  no se promueve todavia como shape productivo compartido
- el conocimiento adquirido si debe quedar asentado desde ahora en la documentación
  de frontera (`docs/`), evitando narrativa interna en el código.
- cuando el backlog de estabilizacion lo permita, la raiz canonica de damage types podra
  crecer hacia una taxonomia de combate mas amplia sin rehacer la base conceptual

La formalizacion final de ese salto no ocurre en este corte.

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

Aplicacion operativa actual:
- damage types y sus aliases/documentos auxiliares entran primero en esta categoria
- el objetivo inmediato no es cubrir todo combate, sino fijar una raiz unica y confiable
  para lo que hoy esta disperso

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
- esa aclaracion debe vivir exclusivamente en la documentacion de fronteras (`docs/`)
- no todos los tipos necesitan la misma rigidez
- los tipos conceptuales no deben venderse como contratos estables del dominio
- la evolucion de B hacia C debe quedar trazable como ampliacion de frontera, no como
  parche oportunista en cada consumer

## Lo que esta seccion no autoriza ahora

- formaliza la arquitectura total de `src/shared/types/`
- define el sistema de tipos compartidos como el lenguaje común del dominio

Por ahora solo fija el contexto para evitar que se cierre en falso una discusion mas profunda que se resolvera despues del backlog.
