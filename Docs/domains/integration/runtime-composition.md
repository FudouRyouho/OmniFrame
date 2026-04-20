---
Estado: "activo"
Rol: "Describir la jerarquía y conexión entre datos, engine, providers y UI"
Version: "v0.0.2"
Impacto_ID: "I-Composition"
Fidelidad_Fisica: "Project/src/providers/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-20"
---

# Runtime Composition

La capa de integracion conecta los loaders de datos con el estado de la UI y el motor de calculo.

## Jerarquia de Providers (`main.tsx`)

OmniFrame utiliza una jerarquia estricta para asegurar que el motor tenga acceso a los datos antes de que la UI intente renderizar.

1. `DataStateProvider`: Manejo de estado dinámico de UI (hover, active, etc.).
2. `LoadoutProvider`: Gestiona el equipamiento activo (`providers/Loadout/`).
3. `MenuProvider`: Gestión del menú principal (ESC) y registro de diálogos activos.
4. `ShellProvider`: Resuelve la zona y el layout desde la ruta (`providers/Shell/`).
5. `ThemeProvider`: Aplicacion de estilos CSS.

### Contrato del ShellProvider
```ts
type ShellContextValue = {
  zone: "equipment" | "arsenal" | "profile" | "options" | "dev" | "home";
  view: string | null;       // "warframes" | "primary" | "secondary" | "melee"
  isDetail: boolean;          // true en vista profunda de entidad
  entityId: string | null;    // uniqueName de la entidad activa
  footerKind: "none" | "item-details" | "arsenal";
  pageTitle: string;          // Título dinámico de la zona
};
```

## Modelo de flujo

```text
Data Loaders -> LoadoutProvider -> Engine (core/engine) -> View Models -> UI
```

## Fronteras de responsabilidad

- **LoadoutProvider**: Es un gestor de estado puro. No debe contener formulas del motor; delega el calculo al `Resolver`.
- **ShellProvider**: Resuelve solo estado derivado de la ruta (titulo, zona). No se mezcla con el estado del builder.
- **Engine**: Vive en `core/engine/` y es independiente de React. Recibe el estado del loadout y devuelve resultados calculados.

## Casos de uso

- `LoadoutProvider` expone hooks de lectura (`useLoadout`) y escritura (`useLoadoutDispatch`).
- HUD y `ArsenalView` consumen el output del engine a traves de selectores reactivos sobre el provider.
