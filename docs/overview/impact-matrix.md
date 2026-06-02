---
Estado: "activo"
Rol: "Fuente de verdad del backlog técnico y matriz de dependencias físicas"
Version: "v0.0.6"
Impacto_ID: "SSoT-Backlog"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-29"
---

# Matriz de Impacto y Dependencias (SSoT)


> **ESTADO:** Activo — **v0.0.4 (Formalización Arquitectónica)**
> **OBJETIVO:** Este documento es la fuente de verdad del backlog técnico. Define qué se puede trabajar hoy basado en dependencias físicas reales.
> **REGLAS:**
>
> - 🔴 MAYOR: Rompe arquitectura, cambia contratos core o SSoT.
> - 🟡 MENOR: Añade lógica de dominio o features sin romper el núcleo.
> - 🟢 PATCH: Limpieza, perfiles IA, alineación de nombres.
>
> ### 🗝️ Glosario de Identificadores
>
> | Prefijo | Significado | Ubicación de referencia |
> | :--- | :--- | :--- |
> | **🔴/🟡/🟢** | Nivel de Impacto | Esta matriz |
> | **D-x** | Decisiones (Design) | `docs/decisions/` |
> | **E-x** | Engine (Cálculo) | `docs/domains/engine/` |
> | **R-x** | Refactor / UI | Dominio correspondiente |
> | **P-x** | Patch / Fix | Historial de commits / Matriz |
> | **OQ-x** | Open Question | `docs/governance/open-questions.md` |
> | **DC-x** | Decision Cerrada | `docs/go---

---

## 🚧 ESTADO DE TRANSICIÓN: `arsenal/upgrade`
> **Aviso de Auditoría:** La vista `UpgradeView` se encuentra actualmente **blindada funcionalmente** (no crashea), pero su UI/UX está en estado **STUB/UNDEFINED**. El diseño, disposición de slots (2x4, Aura, Exilus) y el panel de atributos requieren un rediseño completo por parte del usuario. No se deben hacer cambios arquitectónicos aquí hasta que la UI esté definida.

---

## 🔴 Nivel MAYOR (Enfoque Actual)
_Bloqueantes críticos para la funcionalidad real._

| ID | Tarea | Descripción | Referencia |
| :--- | :--- | :--- | :--- |
| **🔴** | **Materializar Capa D (Proyección)** | Definir `ViewModelContract` e implementar el puente reactivo que transforma `ProjectionSnapshot` → estructura consumible por la UI. | [E-01] |
| **🔴** | **Inicializar `faction_damage_bonus` en StaticHydrator** | Inyectar nodo sintético `{ base: 100 }` para entidades `domain: weapon`, análogo a `WEAPON_DAMAGE`. | [E-AttributeNode] |
| **🔴** | **Wiring de faction damage en CombatCalculator** | Aplicar `faction_damage_bonus.final / 100` como multiplicador de combate cuando `target.faction` coincide. | [E-AttributeNode] |

### Dominio: `integration / engine`

1. **Capa D — Proyección Reactiva**
   - **Descripción**: El puente que transforma el `ProjectionSnapshot` de C2 en estructura reactiva para la UI. `useSimulation` es la implementación parcial actual — falta el contrato formal `ViewModelContract` y la definición de granularidad de actualización.
   - **Bloquea a**: Verificación de cálculos en el Arsenal, paneles de stats tipados.
   - **Depende de**: `EnsembleStore` (✅), `MutatorBridge` (✅), contratos C1/C2 (✅).

2. **faction_damage_bonus — Inicialización y Wiring**
   - **Descripción**: `ModRepository` ya mapea `GAMEPLAY_FACTION_DAMAGE` → `faction_damage_bonus` con `op: "ADD"`. Faltan dos pasos: (a) `StaticHydrator` debe inyectar el nodo sintético base 100 en weapon entities; (b) `CombatCalculator` debe consumir `faction_damage_bonus.final / 100` cuando `target.faction` coincide.
   - **Bloquea a**: Cálculos de daño con faction mods (Bane, Expel) correctos.
   - **Depende de**: `ModRepository` corregido (✅).

---

## 🟡 Nivel MENOR
_Lógica de dominio y expansión de capacidades._

### Dominio: `ui / upgrade` (Próximo Ciclo)

1. **Rediseño UI/UX de UpgradeView**
   - **Descripción**: Diseñar e implementar el layout real para el modding (Aura, Exilus, 8 slots normales, Arcanos) y la visualización detallada del StatPanel. *(Asignado al Usuario).*
   - **Depende de**: N/A (Bloquea futuras inyecciones de matemáticas hasta estar estable).

2. **Refinamiento de ModSlot en Upgrade**
   - **Descripción**: Asegurar que las interacciones de arrastrar/soltar o seleccionar mods funcionen fluidamente con el nuevo diseño de UI.
   - **Depende de**: Tarea 1.

### Dominio: `ui / shell`

3. **Rutas Dinámicas y DialogMenu**
   - **Descripción**: Poblar `routes[]` y permitir navegación real basada en el esquema de dominios actual.
   - **Depende de**: N/A.

### Dominio: `data / incarnon`

4. **Cola de consolidación de `condition` en incarnon override** `data:debt`
   - **Descripción**: Inventario completado (2026-06-01). Detalle en `docs/data/schemas/incarnon/gaps.md §7`. 25 `upgrade_type` (exógenos D-6, ya en vocabulario); 70 `condition` tokens, de los cuales ~18 aún sin consolidar en `conditions.md`. Por [D-19] esto es cola de consolidación, no deuda de mapeo: el JSON es el SSoT del token.
   - **Pending consolidación** (análisis de naturaleza, sin asumir equivalencias): 11 tokens `while_*` + 6 `on_*` sin entrada · 3 con variante de forma a unificar al consolidar · 1 sin prefijo conocido (`per_melee_combo_multiplier`) · OR blocker (`while_aim_gliding_or_sliding`) en Gate 1.
   - **Pending verificación**: forma `WEAPON_ADD_CRIT_MULT` vs `WEAPON_BASE_CRIT_MULT` por perk — los `notes[]` son la fuente; no todos los casos verificados.
   - **Depende de**: Análisis de naturaleza por token + verificación manual de notas.

---

## 🟢 Nivel PATCH
_Mantenimiento y Refine._

0. **Gramática de nomenclaturas — Migración completada (2026-06-01)**
   - **Descripción**: Establecida gramática facetada `DOMINIO:ROL[:ESQUEMA/ID]` como SSoT de todas las nomenclaturas internas. Migrados ~750+ tags en 6 docs principales, 1 JSON de producción, y 1 doc de auditoría. Colisión crítica `[engine]`/`[ENGINE]` resuelta. SSoT: `docs/governance/nomenclature-grammar.md`.
   - **Nota de deuda activa:** `B1-B4` deprecado en JSDoc — 2 referencias pendientes de eliminación (`useSimulation.ts:15`, `UpgradeView.tsx:22`). No migrar, eliminar.
   - **Estado**: ✅ Completado.

0b. **D-19 — Naturaleza de `condition` y `notes[]` + poda de L1-L4 (2026-06-01)**
   - **Descripción**: `condition` redefinido como vocabulario endógeno; el SSoT del token es el override JSON y `conditions.md` es consolidador posterior (no portero previo). `notes[]` = anotación no-SSoT. Reescrito el framing de `conditions.md` + propagación a `mods-schema.md`, `doc-map.md`, `incarnon/gaps.md §7`. Ver `docs/data/decisions.md` D-19.
   - **Poda L1-L4 (2026-06-01)**: eliminadas las "4 capas de evaluación" (`engine:class:layer/N`) de conditions — eran redundantes con el prefijo del token y solapaban con el Modelo `c2/*`. Esquema `layer` retirado de la gramática (`nomenclature-grammar.md` v1.1.0). Conditions ahora se organiza por prefijo (`while_`/`with_`/`on_`); la única clasificación con contenido mecánico es `engine:class:c2/*`.
   - **Estado**: ✅ Completado.

1. **DataLoader singleton** — Implementar capa unificada de carga `JSON base + override` en runtime. Reemplaza los loaders fragmentados de `ItemRepository`, `ModRepository`, `IncarnonRepository`. Dirección registrada en `OQ-DATA-3`.

2. **Limpieza de "Retoques" @shared**
   - **Descripción**: Ajustar bugs menores de layout y filtrado detectados tras la migración masiva.
2. **Purga Física de Docs-Archive**
   - **Descripción**: Eliminar archivos marcados para borrar tras verificar integridad.

3. **Deuda Técnica ESLint (Any)**
   - **Descripción**: Purgar gradualmente los ~110 errores de `@typescript-eslint/no-explicit-any` en `DataRegistry` y vistas compartidas.
   - **Estado**: Postergado para el ciclo de pulido (v0.1.x).

---

