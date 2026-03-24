# Placeholder minimums (S4)

> Estado: activo
> Rol: contrato de lectura para areas sin implementacion completa o con UI stub
> Fuente de verdad de: que existe hoy, que falta para dejar de ser placeholder, dependencias entre piezas
> No usar para: diseño visual final, formulas del engine ni schema profundo
> Depende de: `current-state.md`, `stabilization-backlog.md`, `../domains/engine/builder-v1.md`, `../features/navigation-shell/status.md`, `../features/builder-engine/s6-horizontal-minimum.md`
> Ultima actualizacion: 2026-03-22

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

Hoy **no** estan registradas en `App.tsx` ni aparecen en el menu (`routes` solo incluye entradas con `label`). Los componentes existen como modulos con JSDoc; varios devuelven `null`.

| Vista | Archivo | Placeholder minimo util | Falta para completar | Depende de |
|-------|---------|-------------------------|----------------------|------------|
| Arcanes | `arcanes/ArcanesView.tsx` | listado filtrable similar a Mods usando datos de arcanos | ruta en `App.tsx`, fetch a `arcanes.json` (generado por `generate-data` cuando el pipeline publica artefactos), patron de lista reutilizable | datos publicados en `public/data`, shell |
| Options | `options/OptionsView.tsx` | selector de tema y, cuando exista, locale (ver NS-DT-2 en `navigation-shell/debt.md`) | decision de persistencia y modelo de opciones | minimo: estado local o storage; opcional: i18n |
| Profile | `profile/ProfileView.tsx` | lista de builds o layouts guardados con nombre | modelo de persistencia (localStorage o backend futuro), relacion con layout activo | `layout-context` operativo, posiblemente engine para validar builds |
| Arsenal | `arsenal/ArsenalView.tsx` | superficie de builder: muestra layout activo y resultados del motor | motor calculable, provider de layout, componentes de equipo | builder engine, `layout-context` |

**Nota:** `ModsView` esta implementada y enlazada como `/equipament/mods` (ortografia actual del codigo).

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
