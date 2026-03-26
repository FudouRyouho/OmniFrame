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

Nota de avance (2026-03-25):
- `ContextualActionsProvider` fue reemplazado por `ShellProvider` como capa transicional para resolver header/footer/zone desde routing
- `ArsenalFooter` y `ArsenalView` quedaron habilitados como placeholders funcionales de shell, pero no resuelven la frontera final de integración
- no resuelve OQ-2: la decisión de frontera final entre provider dominante vs hooks compuestos sigue abierta

## OQ-3 - Fuente numerica de mods para el builder

Pregunta:
- cual es la fuente aceptada para valores numericos y condiciones:
  override manual, parseo controlado, o enfoque mixto

Impacto:
- afecta data, engine y mantenimiento del builder

Nota de avance (2026-03-26):
- `mods.json` hoy contiene solo `levelStats: ["string", "string", ...]` sin estructura numerica
- el builder engine v1 requiere numeros estructurados para `calculate(layout, context)`
- sin decision clara, el builder quedaria acoplado a parsing de texto fragil

Opciones identificadas:

**Opción A - Parsing en Runtime**
- Leer `levelStats[rank]` como string (+20% Critical Damage)
- Parser global extrae valores: regex `(\+|-)?(\d+(?:\.\d+)?)%?` 
- Builder obtiene valores parseados on-demand
- Pros: sin duplicacion de datos en JSON
- Contras: fragil a cambios de formato en warframe-items; regexes complejas para condiciones

**Opción B - Override Estructurado (como ability-stats)**
- Crear `Project/data/overrides/mods-stats.override.json`
- Estructura tipada: `{modId: {levelStats: [{fireRate: 15, accur: -10}, ...]}, ...}`
- Pipeline: generar-si-falta, usuario edita manualmente gaps
- Pros: estructura clara, tipada, auditable
- Contras: duplicacion; mantener dos fuentes en sync; trabajo editorial inicial

**Opción C - Enfoque Hibrido (Recomendado para eval)**
- Mantener `levelStats` como string en `mods.json` (origen warframe-items)
- Agregar campo `_numericStats` opcional durante pipeline si parser puede validar
- Parser intenta extraer numeros; si falla, deja null (trigger para override manual)
- Builder siempre consume `_numericStats` (estructura validada, no strings)
- Pros: compatibilidad origen; transicion gradual; claro donde hay gaps editorial
- Contras: un campo extra; parser aun necesita mantenimiento

Bloqueante para:
- `features/builder-engine/status.md`: `calculate(layout, context)` requiere numeros tipados
- formula base de armas/warframes con mods integrados
- validacion y audita de valores de mods

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

## OQ-7 - Arquitectura de ItemsGrid (resuelta)

Pregunta:
- ¿ItemsGrid debe ser absorbido por el componente padre o implementación derivada en cada vista particular con reutilización de lógica?

Impacto:
- Afecta estructura de componentes, mantenibilidad y flexibilidad de vistas.

Resolucion:
- cerrada el 2026-03-25
- `ItemsGrid` queda como grilla simple compartida
- la virtualización no se absorbe globalmente en `ItemsGrid`; se monta explícitamente en `WeaponsView` y `ModsView`
- `VirtualizedItemsGrid` mantiene una API mínima orientada a layouts transicionales no finales

## OQ-8 - Overrides en Tipado Nuevo

Pregunta:
- ¿Cómo documentar los cambios/overrides en semántica de warframe-items para arcanos, vehicles, etc.?

Impacto:
- Afecta referencia, mantenimiento de tipos e integración con warframe-items.
