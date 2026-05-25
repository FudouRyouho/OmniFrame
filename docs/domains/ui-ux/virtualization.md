---
Estado: "referencia"
Rol: "Documentar el comportamiento de la virtualización de listas en la interfaz"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Performance"
Fidelidad_Fisica: "Project/src/shared/components/items/ItemsGrid.tsx"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-23"
---

# UI Virtualization

## Estrategia: Virtualización Localizada

El proyecto utiliza una estrategia de virtualización **por vista**, en lugar de una abstracción global rígida en el grid. Esto permite adaptar el threshold de rendimiento a la complejidad de las cards de cada dominio.

### Componente: `ItemsGrid` (Virtualización Integrada)

- **Ubicación**: `Project/src/shared/components/items/ItemsGrid.tsx`
- **Uso**: El componente `ItemsGrid` encapsula la lógica de virtualización y decide cuándo activarla basado en la densidad de datos y la configuración del dominio.
- **Contrato**: Recibe `items`, `isLoading` y callbacks de acción, centralizando el comportamiento de scroll infinito y renderizado por batches.

## Thresholds de Activación

| Vista         | Comportamiento | Criterio                                                |
| :------------ | :------------- | :------------------------------------------------------ |
| **Weapons**   | Virtualizado   | +200 items (Primary, Secondary, Melee combinados).      |
| **Mods**      | Virtualizado   | Por defecto (Dataset extenso > 1000 items).             |
| **Warframes** | Grilla Simple  | Cantidad reducida (< 100). Prioriza simplicidad de DOM. |
| **Resto**     | Grilla Simple  | Layouts transicionales o datasets pequeños.             |

## Limitaciones Técnicas

1.  **Dimensiones Fijas**: El cálculo de la altura virtual asume cards de aspecto cuadrado (`aspect-square`), consistente con el componente `BaseItemCard`.
2.  **Estado de Selección**: La virtualización no gestiona la posición del scroll tras una navegación. El estado de selección visual debe resolverse en la capa de la Vista o el Contexto.

---

### Notas de Mantenimiento

Cualquier cambio en el aspecto de las cards (`aspect-ratio`) requiere coordinar el ajuste en el cálculo de filas de `VirtualizedItemsGrid` para evitar saltos visuales en el scroll.
