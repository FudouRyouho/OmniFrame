---
Estado: "referencia"
Rol: "Documentar el rol de src/shared/types/ y sus límites"
Version: "v0.0.4"
Impacto_ID: "G-Types"
Fidelidad_Fisica: "Project/src/shared/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-05-27"
---

# Type System Boundaries

## Regla de prioridad

El tipado compartido prioriza:
1. logica
2. mapeo
3. UI

## Lo que sí incluye

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
- `stats.ts`
- `modifier.ts`
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

- la semantica canonica de `upgrade_type`, condiciones y contratos de combate mas amplios
  no se promueve todavia como shape productivo compartido
- el conocimiento adquirido si debe quedar asentado desde ahora en la documentación
  de frontera (`docs/`), evitando narrativa interna en el código.
- cuando el backlog de estabilizacion lo permita, la raiz canonica de damage types podra
  crecer hacia una taxonomia de combate mas amplia sin rehacer la base conceptual

La formalizacion final de ese salto no ocurre en este corte.

