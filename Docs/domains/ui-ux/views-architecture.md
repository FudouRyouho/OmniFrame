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
| **Vistas (Páginas)**  | `Project/src/domains/equipment/view/`        |
| **Grillas (Layout)**  | `Project/src/domains/equipment/`             |
| **Hooks de Datos**    | `Project/src/domains/equipment/hooks/`       |
| **Cards de Ítems**    | `Project/src/shared/components/items/cards/` |
| **Vistas de Detalle** | `Project/src/shared/components/items/specs/` |
| **Toolbars/Filtros**  | `Project/src/shared/components/filters/`     |
| **Popovers/Hover**    | `Project/src/shared/components/popovers/`    |

## Patrón de Composición

Las vistas en `domains/equipment/view/` actúan como controladores que orquestan los hooks de datos con los componentes compartidos:

```tsx
// Ejemplo conceptual en ArcaneView.tsx
const ArcanesView = () => {
  const { data, isLoading } = useItems("arcane");
  return (
    <ItemsGrid // Contenedor en domains/equipment/
      items={data}
      isLoading={isLoading}
      renderItem={(item) => <ArcaneCard item={item} />} // Card en shared/components/items/cards/
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

## Hooks de Dominio (`domains/equipment/hooks/`)

- **`useItems.ts`**: Carga y cacheo de datasets JSON.
- **`use-items-filters.ts`**: Lógica de filtrado y búsqueda.
- **`use-view-filter.ts`**: Estado local de la toolbar de filtros.

---

### Notas de Integridad

Para mantener esta arquitectura, cualquier nuevo componente que represente un "Ítem" o una "Especificación" debe crearse en la carpeta `shared/components/items/` y no dentro de las carpetas de features específicas.
