---
Estado: "activo"
Rol: "Describir el pulso real de la estructura física y funcional del repositorio"
Version: "v0.0.2"
Impacto_ID: "SSoT-State"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-20"
---

# OmniFrame Current State

## 1. Estructura Física (`/Project/src`)

### Núcleo y Capas Transversales

- **`App.tsx`**: Ruteador principal y montaje de piezas globales.
- **`lib/`**: Utilidades de infraestructura e integraciones de datos.
- **`shared/`**: Recursos transversales y sistema de diseño.
  - **`shared/types/` (12 módulos)**: Contrato canónico de dominio (`ability.ts`, `warframe.ts`, `weapon.ts`, etc.).
  - **`shared/components/`**: **SISTEMA DE DISEÑO ACTIVO**. Centraliza Cards, Specs, Popovers y Filtros.
- **`providers/`**: Gestores de estado global y contexto.
  - **`Shell/`**: Resuelve navegación, zona, título y footer derivando desde `pathname`.
  - **`Loadout/`**: Gestiona la integración con el motor matemático y el estado del equipamiento activo.
- **`core/engine/`**: Motor matemático de cálculo, fórmulas y resolver.

### Features (Dominios de producto)

- **`domains/arsenal/`**: Stubs de flujo UX para Loadout, Companion y Vehicles.
- **`domains/equipment/`**: Vistas de inventario y detalle sustentadas en `@shared`.
- **`domains/hud/`**: Resumen del loadout activo.

## 2. Estado del Pipeline y Datos

- **Pipeline de Datos**: `Project/scripts/generate-data.ts`.
- **Overrides**: Establecidos en `Project/public/data/` como SSoT Manual definitivo.
- **Base de Datos**: IndexedDB vía Dexie (`lib/db.ts`). Versión actual: `DB_VERSION = 4`.

## 3. Deuda y Bloqueos Técnicos Reales (Drift Sanity)

- **Resolver (🔴 MAYOR)**: Rediseño del contrato B1-B4. El desacoplamiento total del Resolver fuera del provider de UI es el bloqueo principal.
- **Persistencia**: Contratos de persistencia en fase de definición funcional.

---

**Nota de Auditoría**: Este documento refleja la geografía real del repositorio a fecha de 2026-04-20. Cualquier ruta mencionada aquí ha sido validada físicamente.
