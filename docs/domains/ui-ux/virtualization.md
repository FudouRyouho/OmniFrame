---
Estado: "referencia"
Rol: "Documentar el comportamiento de la virtualización de listas en la interfaz"
Impacto_ID: "UI-UX-Performance"
Fidelidad_Fisica: "Project/src/shared/components/items/ItemsGrid.tsx"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-23"
---

# UI Virtualization

## Estrategia: un umbral genérico, con override por vista

`ItemsGrid` es el único punto donde se decide virtualizar. No hay tabla de thresholds por dominio:
la regla es **un solo número** — `items.length > 200` — y la vista puede forzar cualquiera de los
dos modos pasando la prop `virtualized`.

- **Ubicación**: `Project/src/shared/components/items/ItemsGrid.tsx` (implementa con
  `useVirtualizer` de `@tanstack/react-virtual`; no existe un componente `VirtualizedItemsGrid` aparte).
- **Contrato**: recibe `items`, `isLoading`, callbacks de acción, y las opcionales `virtualized`
  y `overscan` (default 5).
- **Resolución**: `virtualizedProp ?? items.length > 200`.

## Quién fuerza el modo

| Vista | Modo | Cómo |
|---|---|---|
| **Mods** | Grilla simple | `virtualized={false}` **explícito** en `ModsView.tsx` — es el dataset más grande y aun así se desactiva a mano |
| **Resto** | Automático | Sin prop: virtualiza si supera 200 ítems, si no grilla simple |

⚠️ **Mods es la excepción declarada, no el caso testigo.** El dataset de mods es el que más se
beneficiaría del umbral automático y es el único que lo apaga; si esa desactivación tiene un motivo
(salto de scroll, altura variable de `ModCard`), no está escrito en el código ni acá.

## Limitaciones Técnicas

1.  **Dimensiones Fijas**: El cálculo de la altura virtual asume cards de aspecto cuadrado (`aspect-square`), consistente con el componente `BaseItemCard`.
2.  **Estado de Selección**: La virtualización no gestiona la posición del scroll tras una navegación. El estado de selección visual debe resolverse en la capa de la Vista o el Contexto.

---

### Notas de Mantenimiento

Cualquier cambio en el aspecto de las cards (`aspect-ratio`) requiere coordinar el ajuste en el cálculo de filas de `ItemsGrid` para evitar saltos visuales en el scroll.
