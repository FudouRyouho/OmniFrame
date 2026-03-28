# Equipment Views - Arquitectura Actual

> Estado: activo
> Rol: descripción técnica del funcionamiento actual de las vistas de equipment
> Fuente de verdad de: arquitectura de vistas, hooks y flujo de datos
> No usar para: decisiones de diseño futuras o backlog
> Depende de: `status.md`, `../../domains/data/ssot.md`
> Ultima actualizacion: 2026-03-28

## Objetivo

Documentar cómo funcionan las 7 vistas de equipment actualmente para facilitar
la discusión de cambios arquitectónicos (D-4, D-5) y la integración con el builder.

---

## Estructura general

Todas las vistas siguen el mismo patrón minimalista, con una excepción explícita para virtualización localizada:

```tsx
const XView = () => {
  const { data, isLoading } = useItems(source);
  return <ItemsGrid items={data} isLoading={isLoading} onSelect={() => {}} />;
};
```

### Vistas operativas

1. `WarframesView` → `useItems("warframe")`
2. `WeaponsView` → `useItems(["primary", "secondary", "melee"])`
3. `CompanionsView` → `useItems("companion")`
4. `ModsView` → `useItems("mod")`
5. `ArcanesView` → `useItems("arcane")`
6. `VehiclesView` → `useItems(["necramech", "archwing"])`
7. `ArchwingWeaponsView` → `useItems(["archgun", "archmelee"])`

---

## Hook: `useItems`

**Ubicación:** `features/equipment/hooks/use-items.ts`

**Responsabilidad:** carga lazy de items por `ItemSource` con caching en memoria.

### Signature

```ts
type ItemSource = 'primary' | 'secondary' | 'melee' | 'warframe' | 'mod' 
  | 'arcane' | 'companion' | 'archgun' | 'archmelee' | 'necramech' | 'archwing' | 'all';

useItems(source: ItemSource | ItemSource[]) 
  → { data: BaseItem[], isLoading: boolean, error: Error | null, reload: () => void }
```

### Comportamiento

- acepta un `ItemSource` único o un array de sources
- cada source tiene un loader lazy asociado (`lazyLoaders` map)
- los loaders resuelven independientemente y van añadiendo items al estado `data` conforme se cargan
- implementa caching en `itemsCache` para evitar peticiones redundantes
- el estado `isLoading` es `true` hasta que todos los sources resuelven

### Scope de `all`

`useItems("all")` solo incluye warframes, weapons y mods (scope builder v1).
Arcanes, companions, vehicles y archwing-weapons están excluidos hasta que el builder los consuma.
Ver comentario en `use-items.ts` y gap DF-G8 en `data-foundation/status.md`.

### Loaders por source

Cada source mapea a un loader que filtra desde el JSON correspondiente:

- `primary`, `secondary`, `melee` → `fetchWeapons()` + filtro por `category`
- `warframe` → `fetchWarframes()`
- `mod` → `fetchMods()`
- `arcane` → `fetchArcanes()`
- `companion` → `fetchCompanions()`
- `archgun`, `archmelee` → `fetchArchwingWeapons()` + filtro por `kind`
- `necramech`, `archwing` → `fetchVehicles()` + filtro por `kind`

---

## Componente: `ItemsGrid`

**Ubicación:** `features/equipment/ItemsGrid.tsx`

**Responsabilidad:** renderizar grid simple de items con loading state, hover popover y selección.

### Props

```ts
type ItemsGridProps<TItem extends BaseItem> = {
  items: TItem[];
  selectedId?: string | null;
  onSelect: (item: TItem) => void;
  isLoading: boolean;
  renderItem?: (item: TItem) => React.ReactNode;
  layout?: { minColumnWidth?: number; gap?: number; containerClassName?: string };
};
```

### Comportamiento

- genérico sobre `BaseItem` — funciona con cualquier tipo de item
- muestra skeleton loaders mientras `isLoading === true` (20 placeholders)
- no decide virtualización; las vistas que la necesiten la montan explícitamente
- cada item es un botón con hover popover (`ItemDetailsPopover`)
- el popover muestra metadata básica del item (nombre, descripción, stats mínimos)
- `onSelect` se invoca al hacer click en un item
- actualmente todas las vistas pasan `onSelect={() => {}}` — no hay selección activa

## Componente: `VirtualizedItemsGrid`

**Ubicación:** `features/equipment/VirtualizedItemsGrid.tsx`

**Responsabilidad:** virtualizar filas de cards cuadradas solo en vistas con listas grandes y layout todavía transicional.

### Props

```ts
type VirtualizedItemsGridProps<TItem extends BaseItem> = {
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  minColumnWidth?: number;
  gap?: number;
  overscan?: number;
};
```

### Estado actual

- `WeaponsView` decide localmente cuándo virtualizar (`threshold` local)
- `ModsView` decide localmente cuándo virtualizar (`threshold` local)
- `ItemsGrid` queda como fallback no virtual para el resto y para listas pequeñas
- el cálculo de altura virtual asume cards `aspect-square`, consistente con `BaseItemCard`

### Estado de selección

`selectedId` permite marcar un item como seleccionado visualmente (borde accent + glow).
Ninguna vista lo usa actualmente — preparado para integración con el builder.

---

## Hook: `use-items-filters` (no conectado)

**Ubicación:** `features/equipment/hooks/use-items-filters.ts`

**Responsabilidad:** filtrado, búsqueda y ordenamiento de items.

Nota de dominio:
- este hook pertenece al borde UI + integration; el shell consume resultados pero no define la semantica de filtrado

### Estado actual

Este hook existe pero NO está conectado a las vistas actuales.
Las vistas usan `useItems` directo sin aplicar filtros.

### Capacidades

- filtrado por `category` (kind) y `subCategory` (ModCategory)
- búsqueda por nombre (case-insensitive)
- ordenamiento: A-Z, Z-A, Newest, Oldest
- exclusión de kinds y subcategorías
- límite de resultados (default 400)
- filtros especiales para companions: `robotic` y `beast` operan sobre `compatName`

### Scope

Solo opera sobre mods actualmente. Los nuevos kinds (`arcane`, `companion`, `necramech`, etc.)
no tienen lógica de filtrado implementada.

### Decisión pendiente (D-4)

Desacoplar la logica de filtrado por kind en la capa de integration, reutilizando funciones base comunes
(ej: `filterByName`, `filterByMasteryReq`, `filterByPolarity`) sin cargar responsabilidad adicional al shell.

Esta decisión bloquea D-5 (conexión de `search` y `order` del contexto a las vistas).

---

## Contexto: `EquipmentContext`

**Ubicación:** `features/equipment/context/EquipmentContext.tsx`

**Estado compartido:**

```ts
{
  hovered: string | null;        // label del tab en hover
  setHovered: (label: string | null) => void;
  search: string;                // búsqueda global
  setSearch: (s: string) => void;
  order: "A-Z" | "Z-A";          // orden global
  setOrder: (o: "A-Z" | "Z-A") => void;
}
```

### Uso actual

- `hovered` → usado por `EquipmentToolbar` para mostrar el label del tab en hover
- `search` y `order` → NO conectados a las vistas (D-5 pendiente)

### Integración futura

Cuando se resuelva D-4, `search` y `order` del contexto se conectarán a las vistas
via `use-items-filters` o su reemplazo arquitectónico.

Nota de dominio:
- `EquipmentContext` expone estado de UI (`hovered`, `search`, `order`); la logica de aplicacion de filtros vive en integration.

---

## Toolbar: `EquipmentToolbar`

**Ubicación:** `features/equipment/toolbar/EquipmentToolbar.tsx`

**Estructura:** 3 filas

1. Hover label (muestra `hovered` del contexto)
2. Tabs de navegación + orden + búsqueda
3. Filtros dinámicos por vista (toolbars dedicadas)

### Toolbars dedicadas

Cada vista tiene una toolbar dedicada bajo `toolbar/toolbars/`:

- `WarframesToolbar` → sin filtros actualmente
- `WeaponsToolbar` → sin filtros actualmente
- `CompanionsToolbar` → sin filtros actualmente
- `ModsToolbar` → sin filtros actualmente
- `ArcanesToolbar` → sin filtros actualmente
- `VehiclesToolbar` → sin filtros actualmente
- `ArchwingWeaponsToolbar` → sin filtros actualmente

Todas usan `FilterIcon` como componente compartido para iconos de filtro con `useDataState`.

### Estado actual

Las toolbars existen pero no tienen filtros implementados — preparadas para cuando
se conecte `use-items-filters` o su reemplazo.

---

## Rutas de detalle (placeholder)

**Ubicación:** `features/equipment/detail/`

Cada vista tiene una ruta de detalle bajo `/equipment/{tipo}/:uniqueName`:

- `WarframeDetailView` → `/equipment/warframes/:uniqueName`
- `WeaponDetailView` → `/equipment/weapons/:uniqueName`
- `CompanionDetailView` → `/equipment/companions/:uniqueName`
- `VehicleDetailView` → `/equipment/vehicles/:uniqueName`
- `ArchwingWeaponDetailView` → `/equipment/archwing-weapons/:uniqueName`

### Comportamiento

- resuelven el item por `uniqueName` via `fetchSingle` del loader correspondiente
- muestran metadata básica (nombre, descripción)
- placeholder mínimo hasta integración con el builder

### Rutas legacy

`pages/WarframeDetail.tsx` y `pages/WeaponDetail.tsx` siguen activas bajo `/warframes/:name`
y `/weapons/:name` — se mantienen hasta que las vistas de detalle nuevas sean funcionales.

Ver NS-DT-18 en `debt.md`.

---

## Flujo de datos actual

```
Usuario navega a /equipment/weapons
  ↓
WeaponsView monta
  ↓
useItems(["primary", "secondary", "melee"]) ejecuta
  ↓
fetchWeapons() carga /data/weapons.json
  ↓
items se cachean en itemsCache["primary|secondary|melee"] por source individual
  ↓
si la lista supera el threshold local, `WeaponsView` monta `VirtualizedItemsGrid`
si no, usa `ItemsGrid`
  ↓
Usuario hace click en un item
  ↓
navigate(`/equipment/weapons/:slug`, { state: { uniqueName } })
```

---

## Gaps y decisiones pendientes

### D-4 — Arquitectura de filtrado

`use-items-filters` solo opera sobre mods. Decisión pendiente: desacoplar en clase
con funciones base por kind.

### D-5 — Conexión de contexto

`search` y `order` del `EquipmentContext` no están conectados a las vistas.
Bloqueado por D-4.

### D-1 / DF-G10 — Type guards

Faltan guards para `arcane`, `companion`, `archgun`, `archmelee`, `necramech`, `archwing`.
Decisión de diseño afecta a D-4 y al builder.

### Selección de items

`onSelect` está preparado pero no implementado. Necesario para integración real con el loadout activo.

### ItemDetailsPanel por tipo

El popover actual muestra metadata genérica. Con el builder ya presente como vertical slice
minimo, cada tipo necesitará un panel de detalle específico cuando se conecte la seleccion
real y el consumo de stats (stats de warframe, damage de weapon, etc.).

---

## Próximos pasos

1. Discusión de arquitectura D-4 (desacoplamiento de filtros)
2. Implementación de D-5 (conexión de search/order del contexto)
3. Evaluación de variantes de `ItemsGrid` por kind (mods, vehicles)
4. Decisión de contexto de selección (¿en `EquipmentContext` o contexto dedicado?)
5. Implementación de `ItemDetailsPanel` por tipo sobre el vertical slice actual del builder

---

## Lectura relacionada

- `status.md` — estado operativo del shell
- `debt.md` — deuda técnica local
- `../../domains/data/ssot.md` — fuentes de verdad
- `../../features/data-foundation/status.md` — gaps de datos
