---
Estado: "activo"
Rol: "Fuente de verdad del backlog técnico y matriz de dependencias físicas"
Version: "v0.0.5"
Impacto_ID: "SSoT-Backlog"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-27"
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

## ✅ HITOS COMPLETADOS (v0.0.3 Rabbit Hole)
_Sistemas transversales construidos como prerrequisito para la estabilidad._

### 1. Estabilización Taxonómica (4 Pilares) — [🔴 MAYOR]
- **Logro**: Implementación de `domain`, `kind`, `family` y `stats` en el pipeline determinista (`entities.ts`).
- **Impacto**: Eliminación de ambigüedades en Compañeros, Necramechs y Armas. Datos 100% tipados.

### 2. Unificación de UI (@shared) — [🔴 MAYOR]
- **Logro**: Migración masiva de Grillas, Vistas, Cards y Toolbars a `@shared`.
- **Impacto**: El Arsenal y el Equipment ahora consumen el mismo motor de renderizado agnóstico.

### 3. Esqueleto Headless del Engine de Simulación (Capa C) — [🔴 MAYOR]
- **Logro**: Estructura de Grafo de Atributos, Mutadores y Fórmulas Maestras.
- **Impacto**: Motor preparado para recibir intenciones y emitir proyecciones B4.

---

### 4. EnsembleStore y Eutanasia del Legacy Loadout — [🔴 MAYOR]
- **Logro**: Implementación de la Capa A (`useEnsemble`), conexión del `MutatorBridge` (B4), y eliminación absoluta del `LoadoutProvider` v1 en todo el proyecto (`HudHeader`, `main.tsx`).
- **Impacto**: OmniFrame ahora posee Una Sola Fuente de Verdad reactiva. Cero "zombies" arquitectónicos.

### 5. Materialización del Arsenal (Chasis) — [🟡 MENOR]
- **Logro**: Hidratación real en `ArsenalView`, migración reactiva de `ModSlot`, y blindaje de errores en interacciones de slots vacíos.
- **Impacto**: El Arsenal ya no es un "mockup", es un cliente real del motor de simulación y del `DataRegistry`.

### 6. Formalización Arquitectónica del Motor — [🔴 MAYOR] (2026-05-19)
- **Logro**: Modelo de 5 capas (A / B / C1 / C2 / D) definido, debatido y documentado. `simulation-architecture.md` reescrito a v0.2.0. Resolución de `OQ-STATE-1/2/3/4`.
  - OQ-STATE-1/3: Purga completa de `LoadoutProvider` y `LoadoutContext` — eliminados del árbol.
  - OQ-STATE-4: `EnsembleAdapter` eliminado — su lógica absorbida por `MutatorBridge`.
  - OQ-STATE-2: Migración de Archon Shards a `EnsembleIntention` (Capa A pasiva).
  - **Nuevo**: Capa D (Proyección) definida formalmente como puente reactivo entre engine y UI — contrato `ViewModelContract` pendiente de implementación.
- **Impacto**: Nomenclatura B4/Loadout Store deprecada. Toda la capa de presentación ahora tiene una identidad arquitectónica clara.

### 7. Contratos de Motor y Corrección de ModRepository — [🔴 MAYOR] (2026-05-19)
- **Logro**: `attribute-node-contract.md` creado — mapeo formal de campos `AttributeNode` a capas de la fórmula de Warframe y operaciones de modificador. `ModRepository.ts` corregido.
  - `UPGRADE_MAP` refactorizado de `Record<string, string>` a `Record<string, UpgradeEntry>` — operations tipadas.
  - Agregadas 13 entradas: warframe stats, `WEAPON_MELEE_DAMAGE`, `GAMEPLAY_FACTION_DAMAGE` (con conversión `toPercent`).
  - `faction_damage_bonus` documentado como nodo sintético (patrón análogo a `WEAPON_DAMAGE`, base 100, stack aditivo).
- **Impacto**: `ModRepository` ya no produce `ADD` hardcodeado para todo — operaciones derivadas del mapa tipado. La corrección de `GAMEPLAY_FACTION_DAMAGE` elimina el bug silencioso de conversión de formato multiplicador→porcentaje.

### 8. Purga Legacy Completa — [🔴 MAYOR] (2026-05-21)
- **Logro**: D-10: `SimulationLab.tsx`, `LoadoutState`, `loadout.ts`, `__tests__-legacy/` (12 suites) purgados.
- **Impacto**: `MutatorBridge` tiene única ruta canónica `simulateFromIntention()`. Tests via pipeline real (D-9).

### 9. Limpieza Schema de Habilidades — [🟡 MENOR] (2026-05-22)
- **Logro**: D-11 (`upgrade_by: "NONE"` → campo opcional, 468 instancias) + D-12 (`AbilityStatValue` eliminado, `base_value: number | [number, number]`, 1564 stats migrados).
- **Impacto**: Schema de habilidades limpio y alineado con la UI del juego.

### 10. Vocabulario D-6 — ModRepository v2 — [🔴 MAYOR] (2026-05-27)
- **Logro**: OQ-ENGINE-3 cerrado. `resolveToken()` en `modifier.ts`. D-7 Fase 1: attrs renombrados a tokens D-6. Label parsing eliminado. 55 tokens en UPGRADES[]; 35 UPGRADE_MAP + 20 `resolveToken()`.
- **Impacto**: Engine resuelve `upgrade_type` directamente. SSoT matemático en `modifier.ts`.

### 11. WEAPON_DAMAGE base = damage_sum — [🔴 MAYOR] (2026-05-27)
- **Logro**: OQ-ENGINE-1 cerrado. Base = `damage_sum` del perfil activo (`ItemRepository`). Multiplicador global = `final/base`. 33 tests gold standard.
- **Impacto**: Matemática correcta de Serration/Heavy Caliber stacking. Arquitectura validada.

### 12. Archon Shards consumer + Incarnon Genesis pipeline — [🔴 MAYOR] (2026-05-27)
- **Logro**: OQ-ENGINE-4 cerrado. `StaticHydrator` consume `ensemble.warframe.shards` → `ShardRepository` → `Modifier[]`. `IncarnonRepository` + `incarnon-evolutions.override.json` (85 armas, tokens `WEAPON_BASE_*`).
- **Impacto**: Shards como modificadores en runtime. Perks de evolución Incarnon accesibles al engine.

### 13. formulas/ SSoT activo + layer boundary — [🟡 MENOR] (2026-05-27)
- **Logro**: Fases 1+2 de `formulas-integration.md`. `crit-base.ts` ← `AtomicSimulator`. `scaling-base.ts` ← `SimulationEngine`. `DamageCombiner` movido de `combat/` → `hydration/`.
- **Impacto**: Cero duplicación de fórmulas crit/scaling. Layer boundary engine/combat → hydration cerrada.

---

## 🚧 ESTADO DE TRANSICIÓN: `arsenal/upgrade`
> **Aviso de Auditoría:** La vista `UpgradeView` se encuentra actualmente **blindada funcionalmente** (no crashea), pero su UI/UX está en estado **STUB/UNDEFINED**. El diseño, disposición de slots (2x4, Aura, Exilus) y el panel de atributos requieren un rediseño completo por parte del usuario. No se deben hacer cambios arquitectónicos aquí hasta que la UI esté definida.

---

## 🔴 Nivel MAYOR (Enfoque Actual)
_Bloqueantes críticos para la funcionalidad real._

| ID | Tarea | Descripción | Referencia |
| :--- | :--- | :--- | :--- |
| ✅ | ~~Sincronización de Tests~~ | D-9 (2026-05-21) + 33 tests gold standard con pipeline real. | [D-9] |
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

---

## 🟢 Nivel PATCH
_Mantenimiento y Refine._

1. **Limpieza de "Retoques" @shared**
   - **Descripción**: Ajustar bugs menores de layout y filtrado detectados tras la migración masiva.
2. **Purga Física de Docs-Archive**
   - **Descripción**: Eliminar archivos marcados para borrar tras verificar integridad.

3. **Deuda Técnica ESLint (Any)**
   - **Descripción**: Purgar gradualmente los ~110 errores de `@typescript-eslint/no-explicit-any` en `DataRegistry` y vistas compartidas.
   - **Estado**: Postergado para el ciclo de pulido (v0.1.x).

---

**Nota de Integridad**: El proyecto ha alcanzado el hito **v0.0.5**. 13 hitos completados. WEAPON_DAMAGE base corregida, 33 tests gold standard, Archon Shards y Incarnon Genesis con pipeline activo, formulas/ como SSoT matemático activo. Deuda activa: Capa D (Proyección), faction damage wiring, OQ-ENGINE-2 (profile switching).
