---
Estado: "histórico"
Rol: "Debate técnico y decisión sobre la unificación de infraestructura UI — PROMOVIDO a closed-decisions (DC-OQ-UI-1)"
Version: "v0.0.4"
Impacto_ID: "DC-OQ-UI-1"
Fidelidad_Fisica: "Project/src/shared/components/items/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-06-07"
---

# Debate Técnico: Unificación de Infraestructura UI (@shared)


> **Contexto:** Se ha identificado que componentes clave en `src/domains/equipment` son técnicamente agnósticos y su permanencia en dicho dominio bloquea la reutilización limpia por parte del Arsenal.

## 1. Identificación de Candidatos a Migración

| Archivo / Componente | Naturaleza Actual | Justificación de Migración |
| :--- | :--- | :--- |
| `use-items.ts` | Dominio (Equipment) | Es un cargador genérico de JSONs. Debe ser `@shared/hooks/data/use-items.ts`. |
| `ItemsGrid.tsx` | Dominio (Equipment) | Es un layout genérico para `BaseItem`. Debe ser `@shared/components/items/ItemsGrid.tsx`. |
| `use-performance-debug.ts`| Dominio (Equipment) | Utilidad de medición de rendimiento agnóstica. |
| `WarframesView.tsx` (etc) | Dominio (Equipment) | Son controladores de composición. Si se abstraen, pueden servir para el Arsenal (Swap) y el Equipo (Browse). |

## 2. Puntos de Inflexión y Debate

### A. Vistas como "Componentes de Presentación Granulares"
- **Acuerdo**: Las vistas (`WarframesView`, `WeaponsView`, etc.) se moverán a `@shared/components/items/views/`.
- **Naturaleza**: Serán componentes agnósticos (Dumb Components) que reciben:
    - `items`: Datos ya cargados.
    - `isLoading`: Estado de carga.
    - `onSelect`: Callback de acción (desacoplado de la navegación).
    - `...options`: Props opcionales para activar funcionalidades específicas (ej: `isDraggable`, `showRank`).
- **Beneficio**: Permite que el Arsenal añada comportamiento extra (como Drag & Drop) sin afectar al dominio de Equipment ni duplicar la estructura de la grilla.

### B. El Dominio como "Smart Wrapper"
- **Responsabilidad**: El dominio (Equipment, Arsenal, Builder) se encarga de:
    1.  Cargar los datos mediante `useItems`.
    2.  Definir la lógica de la acción (Navegar vs Equipar).
    3.  Configurar la vista compartida mediante props de funcionalidad.

### C. El Riesgo del "Shared Monolítico"
- **Regla**: Solo mover lo que sea ESTRICTAMENTE agnóstico. 
- **Verificación**: ¿Depende `ItemsGrid` de algún context de Equipment? No (usa props).

## 3. Hoja de Ruta Propuesta (Refactor Strangler)

1. **Movimiento de Átomos**: Mover Hooks y Grillas a `@shared`.
2. **Abstracción de Controladores**: Crear versiones genéricas de los browsers de ítems.
3. **Inyección en Dominios**: Actualizar `Equipment` para usar los nuevos compartidos y materializar `Arsenal/Swap` usándolos también.

---

**Feedback Requerido**: ¿Estamos de acuerdo en que `ItemsGrid` y `useItems` son infraestructura y no dominio? ¿O existe alguna razón por la cual deban permanecer bajo la gobernanza de Equipment?
