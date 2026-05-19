---
Estado: "activo"
Rol: "Manual técnico de la arquitectura de vistas y centralización de componentes"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Views"
Fidelidad_Fisica: "Project/src/shared/components/items/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Equipment Views Architecture

## Estructura de Capas

El proyecto ha migrado a una arquitectura de componentes compartidos (`shared/components`) para asegurar que la lógica de Equipment sea reutilizable por el Arsenal y el Builder.

| Responsabilidad       | Ubicación Física                             |
| :-------------------- | :------------------------------------------- |
| **Vistas Compartidas**| `Project/src/shared/components/items/views/` |
| **Grillas (Layout)**  | `Project/src/shared/components/items/`       |
| **Hook de Carga**     | `Project/src/shared/hooks/data/use-items.ts` |
| **Hook de Filtros**   | `Project/src/domains/equipment/hooks/use-items-filters.ts` |
| **Cards de Ítems**    | `Project/src/shared/components/items/cards/` |
| **Vistas de Detalle** | `Project/src/shared/components/items/specs/` |
| **Toolbars/Filtros**  | `Project/src/shared/components/filters/`     |
| **Popovers/Hover**    | `Project/src/shared/components/popovers/`    |

## Patrón de Composición

Las vistas en `domains/equipment/view/` son ahora controladores delegados (wrappers) que consumen el sistema de vistas unificado de `@shared`:

```tsx
// Ejemplo conceptual en ArcaneView.tsx (Wrapper de Dominio)
import { ArcanesGridView } from '@/shared/components/items/views';

const ArcanesView = () => {
  // El dominio solo define la acción y el contexto
  return (
    <ArcanesGridView 
      onSelect={(item) => navigate(`/equipment/arcanes/${item.uniqueName}`)}
    />
  );
};
```

## Componentes Compartidos (SSoT UI)

### Items Cards (`shared/components/items/cards/`)

Contiene la representación visual mínima de cada tipo de ítem (`WeaponCard`, `ModCard`, etc.). Todas heredan o consumen la lógica base de `BaseItemCard.tsx`.

### Specs / Detalle (`shared/components/items/specs/`)

Aloja las vistas de detalle completas (`WarframeDetailView.tsx`, `WeaponDetailView.tsx`). Estas piezas son consumidas tanto por las rutas de equipo como por los paneles de expansión del Arsenal.

### Navigation & Filters (`shared/components/filters/`)

La `OmniToolbar.tsx` centraliza la lógica visual de filtrado, búsqueda y ordenamiento.

## Hooks de Datos

- **`shared/hooks/data/use-items.ts`**: Carga y cacheo de datasets JSON mediante `DataRegistry`.
- **`domains/equipment/hooks/use-items-filters.ts`**: Lógica de filtrado y búsqueda por tags — actualmente en el dominio equipment, no en shared.

---

### Notas de Integridad

Para mantener esta arquitectura, cualquier nuevo componente que represente un "Ítem" o una "Especificación" debe crearse en la carpeta `shared/components/items/` y no dentro de las carpetas de features específicas.
