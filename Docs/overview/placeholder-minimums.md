# Placeholder minimums (S4)

> Estado: activo
> Rol: contrato de lectura para areas sin implementacion completa o con UI stub
> Fuente de verdad de: que existe hoy, que falta para dejar de ser placeholder, dependencias entre piezas
> No usar para: diseño visual final, formulas del engine ni schema profundo
> Depende de: `current-state.md`, `stabilization-backlog.md`, `../domains/engine/builder-v1.md`, `../features/navigation-shell/status.md`, `../features/builder-engine/s6-horizontal-minimum.md`
> Ultima actualizacion: 2026-03-24

## Como leer este documento

Cada bloque responde:

- **Hoy**: implementacion o archivo existente
- **Placeholder minimo util**: que debe poder hacer o mostrar la pieza para ser util sin ser producto final
- **Falta para completar**: criterio de salida del placeholder
- **Depende de**: otras piezas del repo o datos

## Builder engine

**Hoy:** contrato documentado en `../domains/engine/builder-v1.md`; carpeta de implementacion prevista en `file-structure.md`; sin `calculate()` productivo conectado a la app.

**Placeholder minimo util:**

| Concepto | Descripcion |
|----------|-------------|
| Entrada | `Layout` (equipamiento por `uniqueName` + `rank`) y `CalculationContext` resueltos por la capa de integracion |
| Salida | `EngineOutput` con stats derivados alineados al contrato de salida (ver dominio `engine/`) |
| Consumer esperado | vistas que comparan builds (futuro Arsenal), HUD de resumen, depuracion textual (relacion con S6) |

**Falta para completar:** implementacion pura del motor, fuente numerica estable de mods, y provider que inyecte layout + contexto sin acoplar React dentro del motor.

**Depende de:** `../features/builder-engine/status.md`, `../features/data-foundation/status.md`, `../domains/integration/runtime-composition.md`.

## Navigation shell — vistas stub

Ubicacion en codigo: `Project/src/features/`.

| Vista | Archivo | Estado | Placeholder minimo util | Falta para completar | Depende de |
|-------|---------|--------|-------------------------|----------------------|------------|
| Options | `options/OptionsView.tsx` | stub | selector de tema y locale | decision de persistencia y modelo de opciones | minimo: estado local o storage; opcional: i18n |
| Profile | `profile/ProfileView.tsx` | stub | lista de builds o layouts guardados con nombre | modelo de persistencia, relacion con layout activo | `layout-context` operativo, posiblemente engine |
| Arsenal | `arsenal/ArsenalView.tsx` | stub | superficie de builder: muestra layout activo y resultados del motor | motor calculable, provider de layout, componentes de equipo | builder engine, `layout-context` |

**Nota:** `arcanes/ArcanesView.tsx` y `mods/ModsView.tsx` estan deprecadas. Su funcionalidad se migra a `features/equipment/view/` como parte de NS-DT-14 y NS-DT-15.

## Equipment — estructura objetivo

`features/equipment/` evoluciona a la siguiente estructura:

```
features/equipment/
  context/
    EquipmentContext.tsx        — hovered, search, order compartidos
  hooks/
    use-items.ts                — existente, no tocar
    use-items-filters.ts        — existente, no tocar
    useViewFilter.ts            — nuevo, categorias y subcategorias por vista
  details/                      — existente, paneles de detalle compartidos
  toolbar/
    EquipmentToolbar.tsx        — toolbar principal (3 filas)
    FilterIcon.tsx              — componente compartido de icono de filtro
    toolbars/
      WarframesToolbar.tsx
      WeaponsToolbar.tsx
      CompanionsToolbar.tsx
      ModsToolbar.tsx
      ArcanesToolbar.tsx
      VehiclesToolbar.tsx
      ArchwingWeaponsToolbar.tsx
  view/
    WarframesView.tsx
    WeaponsView.tsx
    CompanionsView.tsx
    ModsView.tsx
    ArcanesView.tsx
    VehiclesView.tsx
    ArchwingWeaponsView.tsx
  ItemsGrid.tsx                 — existente, reutilizable
  EquipmentView.tsx             — @deprecated, reemplazado por view/*
  EquipmentLayout.tsx           — layout route principal con Outlet
```

**Origen del codigo:** todo el codigo de `features/dev/example/` fue migrado a esta estructura eliminando la nomenclatura `.dev.tsx`. Migracion completada (NS-DT-15 y NS-DT-16 cerradas).

**Features deprecadas tras la migracion:**
- `features/arcanes/` — deprecada (NS-DT-14)
- `features/mods/` — deprecada (NS-DT-14)

## HUD

**Hoy:** `Project/src/features/hud/` — `Hud.tsx` envuelve la app con cabecera y `main`; `HudHeader.tsx` esta pensado para layout activo; `layout-context.tsx` es stub (`export {}`).

**Placeholder minimo util:** marco persistente (cabecera + area de contenido) sin asumir diseño final del juego.

**Falta para completar:** caja de layout activo en cabecera o panel lateral, alimentada por un contexto real.

**Conceptual, no diseño final:** proporciones, estilos "tipo Warframe" y animacion son iterables; la regla estable es "shell estable que no mezcle calculo en el componente HUD".

**Depende de:** `../domains/ui/shell-and-navigation.md`, `navigation-shell/status.md`.

## Mapa de dependencias (resumen)

```text
datos (mods, abilities, arcanos publicados)
  -> opcional sin engine (Arcanes, Options parcial)
layout-context real + engine
  -> Arsenal, Profile util
HUD
  -> contenedor de todo lo anterior sin acoplar formulas
```

## Relacion con otros documentos

- `../features/navigation-shell/debt.md` — deuda local; debe mantenerse alineado con este archivo cuando cambien rutas o stubs
- `../features/builder-engine/gaps.md` — detalle de huecos del motor
- `../features/builder-engine/s6-horizontal-minimum.md` — vision del corte S6 (dev, engine minimo, capa intermedia)
- `stabilization-backlog.md` seccion S6 — consumer intermedio del engine
