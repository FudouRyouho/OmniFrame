---
Estado: "activo"
Rol: "Fuente de verdad del backlog técnico y matriz de dependencias físicas"
Version: "v0.0.2"
Impacto_ID: "SSoT-Backlog"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Matriz de Impacto y Dependencias (SSoT)


> **ESTADO:** Activo — **v0.0.2 (Estandardización Documental y Filtros Cerrada)**
> **OBJETIVO:** Este documento es la fuente de verdad del backlog técnico. Define qué se puede trabajar hoy basado en dependencias físicas reales.
> **REGLAS:**
>
> - 🔴 MAYOR: Rompe arquitectura, cambia contratos core o SSoT.
> - 🟡 MENOR: Añade lógica de dominio o features sin romper el núcleo.
> - 🟢 PATCH: Limpieza, perfiles IA, alineación de nombres.

---

## 🔴 Nivel MAYOR

_Refactorizaciones nucleares y establecimiento de leyes SSoT._

| 🔴 | **Sincronización de Tests** | Los tests deben validar `Project/data/` (fuente) y no el artefacto `public/`. | [D-12] |
| 🔴 | **Consolidación de Overrides** | Absorción de `mod-stats` y `passives` en `Project/data/overrides/` y purga de `public/`. | [D-13] |
| 🔴 | **Formalización de Facciones** | Extraer facciones de `tags[]` y cerrar el contrato de `FactionType`. | [D-14] |
| 🔴 | **Unificación de UI (@shared)** | Migrar Cards, Specs, Popovers y Toolbars a `@shared` bajo un sistema de diseño único. | [R-01] |
| 🔴 | **Re-definición B1-B4 (Resolver)** | Re-abrir y fijar el contrato core de comunicación entre Loadout, Resolver y Engine. | [E-01] |

### Dominio: `integration`

1. **Desacoplar LoadoutProvider (Agnosticismo Real)**
   - **Descripción:** Actualmente `loadout-context.tsx` importa y ejecuta el `Resolver` en cada `dispatch`. Debe transformarse en un gestor de estado puro que no "sepa" calcular. La lógica de resolución debe ser externa y reactiva.
   - **Evidencia:** [loadout-context.tsx:L123](file:///d:/Development/Warframe/OmniFrame/Project/src/providers/Loadout/loadout-context.tsx).
   - **Bloquea a:** Rendimiento del shell, Portabilidad del Engine, **B1-B4**.
   - **Depende de:** `N/A`

2. **Re-arquitectura del Resolver (B1-B4) — [RE-ABIERTO]**
   - **Descripción:** El anterior cierre (A+/E1) se declara ambiguo. Se requiere definir un contrato de payload robusto para B4 y un flujo de inyección de datos que no dependa de asunciones estáticas ("v1").
   - **Bloquea a:** Todos los dominios de UI con datos reales, Consistencia del cálculo.
   - **Depende de:** `[MAYOR] Desacoplar LoadoutProvider`, `[MAYOR] Taxonomía SSoT de Daño`.

3. **Generalización del Sistema de Toolbars (D-4) — [COMPLETADO]**
   - **Descripción:** Implementación del enfoque "Horizontal" para filtros. Extracción de lógica a `shared/components/filters/` y habilitación de toolbars genéricas route-agnostic. Adoptación del alias `@domains` para toda la arquitectura del proyecto.
   - **Bloquea a:** N/A.
   - **Depende de:** `N/A`.

### Dominio: `semantic / data`

4. **Cierre Semántico de Habilidades (Derivaciones)**
   - **Descripción:** El contrato `groups[]` ya está cerrado y aplicado. El trabajo restante es completar las derivaciones de `upgradeBy` y `upgradeType` en las entradas que aún tienen placeholders.
   - **Bloquea a:** Lógica avanzada del Engine.
   - **Depende de:** `N/A`.

5. **Restaurar SSoT de Overrides y Eliminar Edición Runtime**
   - **Descripción:** El archivo maestro de habilidades ha quedado en el archive o en public. Se debe restaurar en `Project/data/overrides/` y eliminar la capacidad de edición desde las rutas `/dev/*` (depreca el guardado en runtime).
   - **Bloquea a:** Integridad del Pipeline.
   - **Depende de:** `[MAYOR] Cierre Semántico de Habilidades`.

6. **Taxonomía SSoT de Daño (Damage Type Collision)**
   - **Descripción:** Evitar que el Engine sume "Damage" genérico cuando son tipos distintos (Heat vs Cold). Cierre del diccionario semántico.
   - **Bloquea a:** Fidelidad del cálculo del Engine.
   - **Depende de:** `docs-references/`.

7. **Gaps de Normalización de Tipos (Arcane, Companion, Vehicles)**
   - **Descripción:** El pipeline de normalización tiene gaps reales en tipos específicos (Arcane, Companion, Vehicles) que rompen el esquema de normalización del pipeline. Faltan overrides y reglas de derivación para estos dominios en `Project/data/overrides/`.
   - **Bloquea a:** Pipeline de datos completo, filtrado veraz por tipo, cobertura real de `generate-data.ts`.
   - **Depende de:** Contraste de Bloque 11 (auditoría Data Technical — pendiente de ejecución).

### Dominio: `ui / shell`

8. **Arquitectura de Componentes Genéricos UI**
   - **Descripción:** Sin schemas de datos estabilizados (abilities, mods, weapons), implementar componentes genéricos reutilizables (detail-view, popovers, stat panels) genera deuda estructural. Los genéricos deben consumir semántica ya resuelta sin inferirla. La capa de comunicación UI definida antes de cerrar B1-4 requiere rediseño completo.
   - **Bloquea a:** Detail views con datos reales, `TextFormatter` productivo, wiring coherente de popover e inline.
   - **Depende de:** `[MAYOR] Cierre Semántico de Habilidades`, schemas estabilizados de mods y weapons, `[MAYOR] Gaps de Normalización de Tipos`.

---

## 🟡 Nivel MENOR

_Lógica de dominio y expansión de capacidades._

| 🟡 | **Desacoplamiento de Engine** | Mover el cálculo del hilo de UI (`useMemo`) a un WebWorker o Servicio. | [E-4] |

### Dominio: `engine`

1. **Fórmulas de Escalado de Rango (Fórmula Corregida)**
   - **Descripción:** Aplicar `(Base + RankBonus) * (1 + Mod)`. El `RankBonus` (0-30) debe inyectarse en el Pipeline (Capa Generated) para que el Engine trabaje con una base ya escalada antes de los multiplicadores.
   - **Evidencia:** [warframe-core.ts](file:///d:/Development/Warframe/OmniFrame/Project/src/core/engine/formulas/warframe/warframe-core.ts).
   - **Depende de:** `N/A`.

### Dominio: `integration`

2. **Materializar Payload B4 (Backward Resolver)**
   - **Descripción:** Implementar la proyección reactiva del Resolver hacia la UI (unidireccionalidad).
   - **Depende de:** `[MAYOR] Desacoplar LoadoutProvider`.

### Dominio: `semantic-pipeline`

3. **Derivación Determinista de `family` / `variant`**
   - **Descripción:** Inyectar estos campos en el JSON del pipeline, permitiendo que la UI use filtros reales y no nombres de "subCategory" inventados.
   - **Depende de:** `Project/scripts/normalization/`.

4. **Motor de Jerarquía de Compatibilidad (Compañeros)**
   - **Descripción:** Implementar la lógica de pertenencia (ej: `ROBOTIC` engloba a `Sentinels` y `Hounds`) para que el filtrado de mods sea veraz y no dependa de strings exactos.
   - **Depende de:** `N/A`.

5. **Definición de Estructura de Archon Shards**
   - **Descripción:** Pasar del Stub de UX a una definición de datos `shardSlots[]` que permita al motor calcular bonos (normal vs tauforged) y thresholds.
   - **Depende de:** `Conditions Baseline`.

6. **Implementación de `TextFormatter` (OQ-11)**
   - **Descripción:** Crear la suite de renderizado semántico rico (iconos inline, tooltips con `custompopover`, colores) para descripciones de habilidades y mods.
   - **Depende de:** `Saneamiento de Capa de Presentación`.

### Dominio: `ui / shell`

7. **Rutas Inline en App.tsx y Navegación Dinámica en DialogMenu**
   - **Descripción:** Todas las rutas están hardcodeadas en `App.tsx`. El array `routes[]` exportado está vacío (`[] as const`), dejando a `DialogMenu` sin capacidad de navegación dinámica. Nota arquitectónica asociada: ¿metadata de rutas vs derivación desde `pathname` en `ShellProvider`?
   - **Bloquea a:** Navegación dinámica desde `DialogMenu`.
   - **Depende de:** `[MENOR] Evaluación de ShellProvider`.

8. **Arquitectura CSS**
   - **Descripción:** El proyecto tiene `index.css` + paletas por facción en `styles/`. No existe arquitectura CSS formal, design tokens organizados ni convención de capas. Requiere definir la propuesta de diseño antes de ejecutar cualquier reorganización.
   - **Bloquea a:** Coherencia visual y escalabilidad del sistema de estilos.
   - **Depende de:** Propuesta de diseño (pendiente — no ejecutar sin definirla primero).

9. **Evaluación de ShellProvider: Suficiencia vs Metadata de Rutas**
   - **Descripción:** `ShellProvider` resuelve zona/título/footer derivando desde `pathname` via `resolveShell()`. Es funcional hoy. Evaluación pendiente: si a medida que crezcan las zonas conviene migrar a metadata de rutas para evitar que `resolveShell()` crezca como switch monolítico. Punto de inflexión arquitectónico, no urgente.
   - **Bloquea a:** N/A.
   - **Depende de:** Cierre de wiring de `Options`, `Profile` y sistema de rutas dinámicas en `DialogMenu`.
10. **Consistencia de Navegación y Ruteo**
    - **Descripción:** Asegurar flujo fluido entre HUD, Equipo y Arsenal mediante una gestión de rutas centralizada.
    - **Depende de:** `[MENOR] Evaluación de ShellProvider`.

11. **Bidireccionalidad Engine <> Layout**
    - **Descripción:** Conectar la alteración de la grilla de items con el estado del loadout y el recálculo reactivo del motor.
    - **Bloquea a:** Funcionalidad real del Arsenal.
    - **Depende de:** `[MAYOR] Desacoplar LoadoutProvider`, `[MENOR] Materializar Payload B4`.

---

## 🟢 Nivel PATCH

_Mantenimiento y Refine._

| 🟢 | **Sincronización Verificador** | Corregir `verify-ability-stats.mjs` para reflejar la cobertura real y no basura legacy. | [P-3] |
| 🟢 | **Limpieza de Docs Motor** | Arreglar rutas obsoletas en `docs/domains/engine/` detectadas tras la migración. | [D-15] |

### Dominio: `ui / shell`

1. **Sustitución de Mocks en ArsenalView**
   - **Descripción:** Conectar el stub visual al flujo real una vez B4 esté disponible.
   - **Depende de:** `[MENOR] Materializar Payload B4`.

2. **Wiring de Shell post-B4 (HUD, Options, Profile, DialogMenu)**
   - **Descripción:** HUD consume resumen de loadout activo parcialmente. `Options` y `Profile` son stubs de presentación funcionales (UI a implementar manualmente). `DialogMenu` opera con `routes[]` vacío. El wiring real de estos puntos depende de B4 y persistencia.
   - **Depende de:** `[MENOR] Materializar Payload B4`, `[MENOR] Rutas Inline y DialogMenu`, persistencia de builds/layouts.

### Dominio: `gobernanza`

3. **Purga Física de Docs-Archive**
   - **Descripción:** Eliminar archivos `[DELETE]` tras verificar que la información útil ya vive en `docs/` o en esta Matriz.
   - **Estado:** [🟢] Bloque de Gobernanza y Roadmaps saneado (2026-04-18). Pendiente: `historical/` y `dev/`.
