# Open Questions

> Estado: activo
> Rol: registrar preguntas abiertas cross-cutting del proyecto
> Fuente de verdad de: dudas que atraviesan varios tracks o dominios
> No usar para: preguntas locales de una sola feature
> Ultima actualizacion: 2026-03-25

## OQ-1 - Retiro del arbol documental legacy (resuelta)

Pregunta:
- en que momento el arbol documental legacy deja de ser necesario para el trabajo cotidiano y
  puede pasar a revision final o archivo

Impacto:
- afecta mantenimiento documental, onboarding y limpieza final del repositorio

Resolucion:
- cerrada el 2026-03-25
- la carpeta legacy documental fue migrada y eliminada del repositorio
- `Docs/` queda como unica fuente de verdad para documentacion activa

## OQ-2 - Provider vs hooks como frontera de integracion

Pregunta:
- el layout activo y el estado del builder deben vivir en un provider central con hooks
  auxiliares, o en hooks compuestos sin un provider dominante

Impacto:
- afecta engine, shell y wiring de runtime

## OQ-3 - Fuente numerica de mods para el builder

Pregunta:
- cual es la fuente aceptada para valores numericos y condiciones:
  override manual, parseo controlado, o enfoque mixto

Impacto:
- afecta data, engine y mantenimiento del builder

## OQ-4 - Taxonomia de referencia wiki

Pregunta:
- como se clasifica la referencia profunda de mecanicas del juego:
  `wiki/mechanics/`, `wiki/status/`, `wiki/combat/`, etc.

Impacto:
- afecta escalabilidad de la referencia tecnica para simulaciones futuras

## OQ-5 - Punto de migracion de hidratacion a build time

Pregunta:
- cuando deja de vivir la hidratacion de abilities en runtime y pasa al pipeline de build

Impacto:
- afecta data, engine y performance de runtime

## OQ-6 - Diseño y Reutilización de Popover

Pregunta:
- ¿Reutilizar popover existente o componentizar vía 'ui' compartida (static data vs dynamic data)?

Impacto:
- Afecta diseño de UI, reutilización en vistas y separación de responsabilidades.

## OQ-7 - Arquitectura de ItemsGrid

Pregunta:
- ¿ItemsGrid debe ser absorbido por el componente padre o implementación derivada en cada vista particular con reutilización de lógica?

Impacto:
- Afecta estructura de componentes, mantenibilidad y flexibilidad de vistas.

## OQ-8 - Overrides en Tipado Nuevo

Pregunta:
- ¿Cómo documentar los cambios/overrides en semántica de warframe-items para arcanos, vehicles, etc.?

Impacto:
- Afecta referencia, mantenimiento de tipos e integración con warframe-items.
