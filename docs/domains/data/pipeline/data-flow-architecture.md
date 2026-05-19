---
Estado: "activo"
Rol: "Definición de arquitectura de flujo de datos y normalización"
Version: "v0.0.3"
Impacto_ID: "D-17"
Fidelidad_Fisica: "Project/scripts/normalization/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-23"
---

# Auditoría de Flujo de Datos y Normalización (OmniFrame)


**Estado**: Fase 2 — Arquitectura Materializada (2026-04-22).
**Objetivo**: Centralizar la lógica de negocio en el Pipeline/Lib y convertir la UI en una capa puramente presentacional.

---

## 1. Mapeo del Ciclo de Vida del Dato (Materializado)

### El Camino del Dato (Trail)
`warframe-items (Crudo + Patch)` ➔ `runtime-data-artifacts.ts (Pipeline Determinista)` ➔ `JSON (SSoT Consolidado)` ➔ `lib/*-data.ts (Fetch + Hydration)` ➔ `useItems (Agnóstico)` ➔ `useOmniFilter (Lógica de Tags)` ➔ `UI`.

### A. Generación (Pipeline)
### 1. Arquitectura Consolidada: El Modelo de los 4 Pilares

**Estado**: Implementado y verificado en `scripts/normalization/entities.ts`.

#### Definición de los Pilares (SSoT del Contrato)
1.  **`domain` (El "Qué soy")**: Define el contexto de alto nivel.
    - *Materialización*: Mapeo prioritario de `category` sobre `productCategory` para resolver colisiones de compañeros modulares.
2.  **`kind` (El "Cómo opero")**: Especialización funcional.
    - *Materialización*: Heurística basada en `uniqueName` para diferenciar `moa`, `hound`, `pet` y `sentinel`.
3.  **`family` (El "A quién me parezco")**: Linaje y rasgos taxonómicos.
    - *Materialización*: Inyección de tags `robotic`, `beast`, `prime`, `kuva`, `tenet` persistidos en el artefacto final.
4.  **`stats` (El "Qué tengo")**: Módulo genérico de datos numéricos.
    - *Materialización*: Bloque `stats` normalizado para consumo por el Engine (v2).

#### Estrategia Ejecutada
- [x] Materialización de tipos en `src/shared/types`.
- [x] Creación de la librería de normalización de Compañeros y Armas.
- [x] Implementación de tagging heurístico en el pipeline.
- [ ] Refactor del Hydrator del Engine para consumir el bloque `stats` (PENDIENTE).
- **Pipeline Determinista**: El pipeline poblará estos campos basándose en el origen del dato y reglas de normalización centralizadas, ignorando la inconsistencia de la fuente original (`raw.category`).
- **Reversión de `category`**: El campo `category` original se mantendrá únicamente para trazabilidad raw, eliminando su uso en la lógica de negocio.

- [ ] Refactor del Hydrator del Engine para consumir el bloque `stats`.



---

## 2. Identificación de "Drift" (Fugas de Lógica)

| Componente | Lógica "Fugada" | Debería vivir en... |
| :--- | :--- | :--- |
| `use-items-filters.ts` | Listas de compatibilidad `ROBOTIC_COMPAT`, `BEAST_COMPAT`. | Pipeline (campo `compatibility_tags` en JSON). |
| `WeaponsToolbar.tsx` | Literales `"primary"`, `"secondary"`, `"melee"`. | Enums/Tipos compartidos en `@shared/types`. |
| `use-items.ts` | Registro estático de `lazyLoaders`. | `DataRegistry` dinámico. |
| `ItemsGrid.tsx` | Umbral de virtualización (200) y layout base. | Configuración de UI/Domain. |

---

## 3. Arquitectura Propuesta: "Tagging & Generic Motor"

### A. El Pipeline como Etiquetador (Tagging)
El script de generación debe dejar de ser un mapeador de campos para ser un **enriquecedor de datos**.
- **Acción**: Inyectar un campo `omni_tags: string[]` en cada ítem.
- **Ejemplo**: Un Mod de Kavat recibe `['companion', 'beast', 'mod']`.
- **Beneficio**: La UI solo filtra por la existencia de un tag, eliminando los `Sets` hardcodeados en los hooks.

### B. El Registro de Datos (Registry)
Sustituir los 7 archivos `*-data.ts` por un `ItemRegistry` centralizado.
- **Configuración**: Un mapa que define `endpoint`, `type` e `hydration_strategy`.
- **Bypass**: Elimina la necesidad de tocar `use-items.ts` cada vez que se añade una categoría.

### C. El Motor de Filtros Universal
Un hook `useOmniFilter` que no conozca dominios.
- **Entrada**: `items[]`, `activeTags[]`, `searchQuery`.
- **Lógica**: `items.filter(i => activeTags.every(tag => i.omni_tags.includes(tag)))`.

---

## 4. Próximos Pasos (Debate)

1.  **¿Migramos el filtrado a los Tags?** (Esto simplificaría las Toolbars a simples "Selectores de Tags").
2.  **¿Cómo manejamos la hidratación de Warframes?** (Sigue siendo el caso especial).
3.  **¿Centralizamos las Toolbars en un componente declarativo?**

---
