# Decisión: Virtualización por Vista

> Estado: activo
> Rol: documentar decisión de implementación de virtualización granular
> Fuente de verdad de: estrategia de virtualización en UI
> No usar para: implementación técnica detallada
> Depende de: 
> Ultima actualizacion: 2026-03-25

## Decisión

Se mantiene virtualización por vista, pero deja de vivir dentro de `ItemsGrid`.
`ItemsGrid` pasa a ser una grilla simple y la virtualización queda montada explícitamente solo en `WeaponsView` y `ModsView` mediante `VirtualizedItemsGrid`.

El contrato del virtualizer se reduce a props de layout transicional (`minColumnWidth`, `gap`, `overscan`) porque el diseño visual todavía no es final y no conviene fijar una abstracción más rígida.

## Razones

- **Claridad**: la vista declara explícitamente si virtualiza o no; no hay política implícita en `ItemsGrid`.
- **Simplicidad**: se elimina una API sobredimensionada (`itemSize`, `computeColumnCount`, `rowGap`, `columnGap`) para un layout todavía transicional.
- **Rendimiento**: Weapons y Mods siguen evitando render masivo sin arrastrar complejidad al resto de vistas.
- **Temporal**: el layout no es final; por eso la solución se mantiene deliberadamente acotada y fácil de reemplazar.

## Alternativas Consideradas

- Virtualización global en `ItemsGrid`: rechazada por mezclar política de rendimiento con layout compartido.
- Virtualización específica por vista con API amplia: rechazada por exceso de knobs para un diseño aún no final.
- Sin virtualización: rechazada por rendimiento en listas grandes.

## Consecuencias

- `ItemsGrid` queda más predecible y fácil de ajustar visualmente.
- `WeaponsView` y `ModsView` controlan directamente threshold, dimensiones y overscan.
- Si el layout final cambia, el reemplazo queda acotado a las vistas virtualizadas y no a toda la grilla compartida.

## Referencias

- [Docs/overview/current-state.md](../overview/current-state.md)
- [Docs/features/navigation-shell/status.md](../features/navigation-shell/status.md)