---
Estado: "referencia"
Rol: "Los patrones de fórmula que una carta de habilidad puede declarar, y cuáles resuelve el motor"
Impacto_ID: "data-abilities-formulas"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-08-14"
---

# Ability Formula Patterns

Dos cosas distintas que este doc mantiene separadas a propósito: **lo que la carta declara** (el
vocabulario del schema, poblado desde `references/game-ui/*.md`) y **lo que el motor resuelve** hoy.
No coinciden, y confundirlas hace que un agente asuma que un patrón está calculado cuando sólo está
anotado.

## Patrones y su estado en el motor

| Patrón | Fórmula | Resuelto por |
|---|---|---|
| **Lineal** | `variable * baseValue` | ✅ el grafo. `AbilityRepository` traduce `upgrade_by` a un nodo del warframe (`ABILITY_SCALE_NODE`) y emite un `Modifier` con esa arista |
| **Fijo** | `baseValue` | ✅ trivial: sin `upgrade_by`, el valor no escala |
| **Caps** | `clamp(val, min, max)` | ❌ hay `clamp` en `formulas/`, ninguno para habilidades |
| **Inverse** | `baseValue / variable` | ❌ sin ruta: no hay nodo de eficiencia en `ABILITY_SCALE_NODE` |
| **Energía (Uso)** | `(2 - EFF) * baseValue` | ❌ sin implementación en ningún punto de `core/` |
| **Energía (Drain)** | `(2 - EFF) * baseValue / DUR` | ❌ ídem |
| **Cross-stat** | lee otro stat del portador, no un eje de habilidad | ❌ **ninguna existe todavía**; Iron Skin es la primera prevista |

**El corte exacto.** `ABILITY_SCALE_NODE` mapea tres tokens —`AVATAR_ABILITY_STRENGTH`, `_RANGE`,
`_DURATION`. `AVATAR_ABILITY_EFFICIENCY`, `ENERGY_COST` y `ENERGY_DRAIN` **existen en el tipo y en el
dato** (232 y 27 usos en `ability-stats.override.json`) pero no tienen nodo destino: se anotan, se
guardan, y el motor no los consume. Todo lo que escala por eficiencia es hoy display puro.

## Cross-stat — por qué es su propia categoría

Un patrón cross-stat no escala por un eje de habilidad sino por **otro atributo del portador**:
Iron Skin es `overguard = (1200 + armor × 2.5) × strength`, que lee la armadura del warframe. No hay
`upgrade_by` que exprese eso — el vocabulario de la carta sólo sabe decir "escala con Strength".
Por eso requiere **fórmula dedicada**, no una arista más del grafo
([`gap-map.md`](../../../domains/engine/test/gap-map.md) lo tiene como `it.todo` en `rhino.test.ts`).

## Reglas de interpretación

1. **Declaración**: el schema declara `base_value`, `upgrade_by` (cómo escala en la carta) y
   `upgrade_type` (a qué nodo aterriza). Un stat **sin `upgrade_type` es display puro** y el motor lo
   omite — `upgrade_by` solo no alcanza para que algo se compute.
2. **Resolución**: el orden de operaciones es responsabilidad del motor (`core/engine`), nunca del
   dato. Lo que el motor no implementa, no pasa: queda anotado y visible, no calculado.
3. **Fuentes**: las fórmulas salen de la lógica de la comunidad documentada en `references/`.

---

### Mantenimiento

Ampliar el diccionario de fórmulas (patrones por target, combo o armadura dinámica) exige análisis
previo en gobernanza. Agregar un token nuevo a `ABILITY_SCALE_NODE` es lo que convierte un patrón de
"declarado" en "resuelto" — cuando eso pase, la tabla de arriba se actualiza en el mismo paso.
