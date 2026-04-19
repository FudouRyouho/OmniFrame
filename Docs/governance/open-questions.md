---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Version: "v0.0.2"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-04-19"
---

# Open Questions

## OQ-2 - Provider vs hooks como frontera de integracion ✓ CERRADO (2026-03-28)

Decision: `LoadoutProvider` dedicado con `useReducer` + hooks pequeños como frontera dominante de integración.
Lectura operativa: montado en `main.tsx`; expone `LoadoutState` + acciones puras; HUD y Arsenal consumen el loadout real.
Referencia canónica: `../domains/integration/runtime-composition.md`.

## OQ-3 - Fuente numerica de mods para el builder ✓ CERRADO (2026-03-28)

Decision: enfoque mixto — parseo automático como base + override para edge cases.
Lectura operativa: `mod-stats.override.json` con contrato canónico; cobertura 86.47%; cobertura de edge cases y trazabilidad del pipeline mixto siguen abiertas como trabajo de track, no de OQ.
Referencia canónica: `../domains/data/mods/schema.md`, `../domains/data-foundation/pilot-criteria.md`.

## OQ-4 - Taxonomia de referencia wiki ✓ CERRADO (2026-04-13)

Decision: taxonomía documental mínima cerrada sin acople prematuro a schema runtime de simulación; materialización detallada en iteración concreta.
Referencia canónica: `../overview/horizontal-roadmap.md#R16`.

## OQ-5 - Punto de migracion de hidratacion a build time

Dominio:

- integracion

Pregunta:

- cuando deja de vivir la hidratacion de abilities en runtime y pasa al pipeline de build

Impacto:

- afecta data, engine y performance de runtime

## OQ-6 - Diseño y Reutilización de Popover ✓ CERRADO (2026-03-31)

Decision: `CustomPopover` como base compartida para tooltips/popovers de la aplicación.
Lectura operativa: centraliza comportamiento hover/popover (`@tippyjs/react`); futuras superficies de hover/tooltip deben converger a su API; deuda con React 19 + Tippy acotada a implementación subyacente.
Referencia canónica: `Project/src/shared/components/CustomPopover.tsx`.

## OQ-8 - Overrides en Tipado Nuevo ✓ CERRADO (2026-04-13)

Decision: contrato mínimo explícito de overrides por dominio, ejecución en iteración de dataset correlacional.
Referencia canónica: `../overview/horizontal-roadmap.md#R14`.

## OQ-9 - Taxonomia canonica compartida para damage types ✓ CERRADO (2026-03-28)

Decision: taxonomía canónica única para damage types cerrada como checkpoint de estabilización; dirección futura hacia taxonomía de combate amplia predefinida pero no activa aún.
Lectura operativa: `DamageType` canónico con aliases raw, labels e iconografía; semántica de `upgradeType` y condiciones diferida a iteración posterior.

## OQ-10 - Naming conventions transversales ✓ CERRADO (2026-03-29)

Decision: naming semántico por capa, no convención única global.
Lectura operativa: `PascalCase` tipos/componentes; `camelCase` funciones/hooks símbolo; `kebab-case` módulos técnicos/docs; `snake_case` contratos raw/persistidos; `UPPER_SNAKE_CASE` IDs externos del juego.
Referencia canónica: `../domains/integration/naming-conventions.md`.

## OQ-11 - Frontera canonica de `TextFormatter` ✓ CERRADO (2026-04-01)

Decision: clase padre + estrategias/adaptadores mínimos por categoría; pertenece a presentation, no data ni integration; consume semántica ya resuelta sin inventarla.
Lectura operativa: implementación productiva diferida hasta que existan categorías semánticas observables (`FACTION` y equivalentes). `TextFormatView` sigue como harness visual/experimental.
Referencia canónica: `../domains/ui/presentation-layer.md`.

## OQ-12 - Definicion del contrato Backward Resolver (B4) — **RE-ABIERTO (2026-04-18)**

Dominio:

- integration / engine

Pregunta:

- Cuál es el payload final de B4 y cómo se sincroniza la reactividad con el Loadout.

Estado:

- El cierre anterior (A+/E1) se ha declarado como ambiguo y sin bases fundamentadas. Se reabre el debate técnico para alinear con la realidad del proyecto.
- El arrastre transicional del código fue purgado, dejando el terreno limpio para una nueva definición.

## OQ-13 - Frontera de calculo entre Arsenal y Builder — **RE-ABIERTO (2026-04-18)**

Estado:

- Supeditado a la re-definición de los boundaries B1-B4. Se debe discutir nuevamente si el Arsenal mantiene un baseline estrictamente estático o si el Resolver requiere una interfaz compartida más profunda.
