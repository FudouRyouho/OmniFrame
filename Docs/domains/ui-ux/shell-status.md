---
Estado: "activo"
Rol: "Estado operativo del HUD, rutas y layouts del proyecto"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Shell-Status"
Fidelidad_Fisica: "Project/src/providers/Shell/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Navigation Shell Status

## Funcionalidades Actuales

- **HUD Core**: Header estabilizado y Footer contextual (`Back`, `Build`, `Wiki`).
- **Navegación**: Menú principal (`DialogMenu.tsx`) con rutas activas a `Arsenal`, `Equipment` y zona `Dev`.
- **Equipment Browser**: 7 vistas funcionales con datos reales (`warframes`, `weapons`, `mods`, etc.) bajo `domains/equipment/view/`.
- **Detalle de Item**: Vistas de detalle centralizadas en `shared/components/items/specs/`.
- **Cache**: Persistencia de datos en IndexedDB (Dexie).

## Alcance de las Vistas

- `/equipment/*`: Browsing de ítems e inspección de metadata (Consumidor de `shared/components/items/cards`).
- `/arsenal`: **ESTADO: ROTO**. Flujo basado en stubs UX con implementación altamente acoplada. Marcado para deprecación total y re-diseño.
- `/profile` | `/options`: Rutas para gestión de caché y persistencia.

---

### Notas de Navegación

El `ShellProvider` centraliza la resolución de la zona activa (`zone`, `view`, `isDetail`) para coordinar el contenido del Header y el Footer dinámicamente detectando el `pathname`.
