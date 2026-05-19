# Implementaciones Temporales

> Estado: activo
> Rol: registrar implementaciones no cerradas y sujetas a cambios estructurales
> Fuente de verdad de: estado de implementaciones temporales y cuestiones abiertas
> No usar para: decisiones cerradas o implementaciones completas
> Depende de: 
> Ultima actualizacion: 2026-04-13

Este documento registra implementaciones que aún no están cerradas y están sujetas a posibles cambios estructurales. Se utiliza para mantener claridad en el estado del proyecto y facilitar referencias cruzadas con la documentación principal.

## Virtualización por Vista (VirtualizedItemsGrid)

- **Estado**: Implementación temporal para mejor DX en desarrollo. No es una implementación completa o planeada como tal de momento; está en fase de pruebas.
- **Detalles**: Refactorización con props configurables (itemSize, overscan, computeColumnCount).
- **Decisión**: Ver [virtualization-per-view.md](virtualization-per-view.md)
- **Referencias**: [Estado actual](../overview/current-state.md), [Navigation Shell status](../features/navigation-shell/status.md)

## Tipado Nuevo (Arcanos, Vehicles, etc.)

- **Estado**: Implementaciones abiertas a cambios de semántica y trazabilidad. La base ya existe, pero la documentación transversal del override/cambio sigue abierta.
- **Detalles**: Nuevos tipos en lib/types/ (Arcane, Companion, ArchwingWeapon, Vehicle). El estado operativo vive en data-foundation; la decisión transversal pendiente sigue en OQ-8.
- **Referencias**: [Data foundation status](../features/data-foundation/status.md), [Open Questions](open-questions.md), [Estado actual](../overview/current-state.md)

## Frente Dev de Overrides / Semantica

- **Estado**: Implementacion transicional activa. `ability-stats`, `mod-stats` y `ability-schema` siguen vivos, pero dejan de leerse como herramientas aisladas; la direccion acordada es consolidarlos bajo una futura zona `/dev/overrides`. `UIShowcase` queda fuera de esa direccion y pasa a salida pendiente del runtime.
- **Detalles**: El frente debe compartir base tecnica (provider/context, tipado comun, adaptadores y componentes reutilizables) y organizarse por `dominio > responsabilidad` en lugar de crecer como vistas sueltas. El tracking no debe vivir dentro del JSON runtime/editable actual; debe usar sidecars dedicados. Los cortes estables deben preservarse como snapshots/manual backups separados. El alcance del frente no se limita a mods o abilities: responde al diccionario semantico completo del proyecto.
- **Lectura T1**: este tooling sostiene trazabilidad y trabajo editorial sobre semantica derivada, pero no debe convertirse en la frontera que define por si sola el contrato canonico del dato o del runtime.
- **Referencias**: [Estado actual](../overview/current-state.md), [Data foundation status](../features/data-foundation/status.md), [Navigation Shell status](../features/navigation-shell/status.md)

## Orquestacion temporal Arsenal -> Loadout -> Resolver (opcion C)

- **Estado**: analisis exhaustivo temporal activo (sin cambio runtime). Se usa para alinear capas antes de implementar wiring definitivo.
- **Decision base vigente**: B4 estructural (no textual), `B4-lite` deprecado sin compatibilidad extendida, baseline reactivo `E1`.

### Regla central acordada

- la **accion UI** expresa una intencion de dominio (ej. `swapWarframe`)
- la **reactividad** no nace del click en si, nace de la **mutacion del `Loadout`**
- `Resolver`/`Engine` reaccionan al cambio de `Loadout` cuando el cambio impacta calculo

### Escenario 1 — Arsenal > Swap > seleccion > volver al Arsenal

Flujo:

1. usuario abre `Swap` para warframe/arma
2. UI de seleccion muestra catalogo de entidades disponibles (sin calcular panel builder)
3. usuario selecciona entidad
4. muta `Loadout` (slot activo cambia `uniqueName`; la config asociada se carga despues)
5. al volver a Arsenal, `Resolver` detecta mutacion relevante y recalcula
6. UI consume projection B4 y renderiza stats del panel derecho (health/shield/armor/energy/...)

No debe ocurrir:

- recalculo continuo durante browsing del catalogo de seleccion si no hubo confirmacion de equipamiento
- formateo textual final dentro del Resolver

### Escenario 2 — Arsenal > Upgrade (builder)

Flujo:

1. usuario entra a `Upgrade`
2. interacciones de builder (ej. colocar/quitar mod, cambiar rank) mutan `Loadout`
3. `Resolver` detecta diff relevante, ejecuta `resolve -> calculate -> projection`
4. UI actualiza stats y vistas derivadas (incluyendo hover de habilidades con stats actuales)

Notas:

- existe asincronia indirecta de pipeline (carga/estado de calculo), pero la UI no conoce protocolo interno del Resolver
- `hover` puro sin mutacion de `Loadout` no debe disparar calculo

### Escenario 3 — Swap con entidad ya equipada (Nova Prime -> Baruuk Prime)

Flujo:

1. estado inicial con warframe equipado y stats visibles
2. `Swap` reemplaza warframe activo
3. mutacion estructural en `Loadout` dispara reaccion E1
4. panel Arsenal refleja nuevos stats en comparativa (ejemplo observado: cambios de base stats en captura de referencia local)

Lectura de ownership:

- UI: selecciona/confirmar entidad y renderiza
- Loadout: source of truth de equipamiento/config/ranks
- Resolver: traduce estado mutable a calculo y projection
- Engine: calcula en forma pura

### Matriz de disparo (baseline E1)

Disparan reaccion de calculo:

- `swapWarframe`, `swapWeapon`, `equipMod`, `removeMod`, `setModRank`, `setActiveConfig`

No disparan calculo por si solos:

- hover visual, foco de UI, scroll/listado en seleccion, filtros visuales sin mutacion de `Loadout`

### Riesgo aceptado en este corte

- E1 prioriza simplicidad y depuracion sobre optimizacion
- batching/coalescing (E2/E2.5) queda diferido hasta validar dolor real en runtime

### Referencias

- [Open Questions](open-questions.md)
- [Builder Engine status](../features/builder-engine/status.md)
- [Engine architecture](../domains/engine/architecture.md)
- [Decision frontier](../overview/decision-frontier.md)

Este documento se actualizará conforme se cierren o avancen estas implementaciones.
