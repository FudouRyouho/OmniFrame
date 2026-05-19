---
Estado: "activo"
Rol: "Estado operativo del HUD, rutas y layouts del proyecto"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Shell-Status"
Fidelidad_Fisica: "Project/src/providers/Shell/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-23"
---

# Navigation Shell Status

## Funcionalidades Actuales

- **HUD Core**: Header estabilizado y Footer contextual (`Back`, `Build`, `Wiki`).
- **Navegación**: Menú principal (`DialogMenu.tsx`) con rutas activas a `Arsenal`, `Equipment` y zona `Dev`.
- **Equipment Browser**: Vistas funcionales con datos reales (`warframes`, `weapons`, `mods`, etc.) en `shared/components/items/views/`.
- **Detalle de Item**: Vistas de detalle centralizadas en `shared/components/items/specs/`.
- **Cache**: En memoria — `DataRegistry` usa `Map` interno. No hay persistencia en IndexedDB.

## Alcance de las Vistas

- `/equipment/*`: Browsing de ítems e inspección de metadata (Consumidor de `shared/components/items/cards`).
- `/arsenal`: **ESTADO: STUB**. `use-arsenal-stub-state.ts` — sin conexión definitiva al motor. `UpgradeView` sin diseño definido. Ver OQ-STATE-2.
- `/profile` | `/options`: Rutas para gestión de caché y persistencia.

---

### Notas de Navegación

El `ShellProvider` centraliza la resolución de la zona activa (`zone`, `view`, `isDetail`) para coordinar el contenido del Header y el Footer dinámicamente detectando el `pathname`.
