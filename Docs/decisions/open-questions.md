# Open Questions

> Estado: activo
> Rol: registrar preguntas abiertas cross-cutting del proyecto
> Fuente de verdad de: dudas que atraviesan varios tracks o dominios
> No usar para: preguntas locales de una sola feature
> Ultima actualizacion: 2026-03-21

## OQ-1 - Retiro de `Docs-legacy`

Pregunta:
- en que momento `Docs-legacy/` deja de ser necesario para el trabajo cotidiano y
  puede pasar a revision final o archivo

Impacto:
- afecta mantenimiento documental, onboarding y limpieza final del repositorio

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
- afecta data, integracion y mantenimiento del editor
