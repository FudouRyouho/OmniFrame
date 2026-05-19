---
Estado: "activo"
Rol: "Inventario de residuos de transición en Project/src/ — base para purga y refactor"
Version: "v0.1.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-19"
Dependencias:
  - "docs/domains/engine/sim-v2-audit.md"
---

# Inventario de Residuos de Transición

**Alcance**: Escaneo exhaustivo de `Project/src/` (excluyendo `__tests__/`, `node_modules/`, `dist/`).
**Método**: Exploración estática de archivos .ts y .tsx.
**Fecha**: 2026-05-18

Leyenda de clasificación:
- **PURGE** — Eliminar sin debate, no tiene valor actual.
- **KEEP** — Necesario pero requiere limpieza (comentarios, tipos, etc.).
- **PENDING** — Decisión arquitectónica requerida antes de actuar.

---

## 1. PURGE — Candidatos directos

Solo 2 archivos son purga clara e inmediata:

| Archivo | Razón | Condición para purgar |
| :--- | :--- | :--- |
| `domains/arsenal/state/use-arsenal-stub-state.ts` | Stub con nombre explícito. `useSyncExternalStore` con snapshot local sin persistencia real. `@status stub / persistencia temporal`. | Cuando Arsenal se conecte a EnsembleStore real. |
| `domains/hud/footer/ArsenalFooter.tsx` | `const active_channel_count = 0; // Stub` — constante hardcodeada marcada explícitamente como stub sin integración pendiente. | Cuando el footer de Arsenal consuma datos reales. |

> **Nota**: Ambos dependen de OQ-STATE-2 (conexión Arsenal → Motor). No purgar antes de resolverlo.

---

## 2. PENDING — Requieren decisión arquitectónica

### 2.1 El triángulo del Arsenal

Tres archivos forman un sistema cohesivo de transición que NO se puede purgar individualmente:

| Archivo | Estado actual | Por qué es PENDING |
| :--- | :--- | :--- |
| `domains/arsenal/arsenal-state.ts` | `@status stub / en desarrollo`. Contiene factories mock, metadata visual para slots vacíos ("Metadata visual del slot de X para cerrar el Arsenal aunque no exista wiring real"). | ¿Se integra con EnsembleStore o se refactoriza como capa de presentación permanente? |
| `domains/arsenal/ArsenalView.tsx` | `@status stub / en desarrollo`. Vista principal del Arsenal. Consume `useArsenalUiState()` que es el stub de arriba. | Bloqueada por la decisión sobre `arsenal-state.ts`. |
| `providers/Loadout/loadout-context.tsx` | **PURGADO (2026-05-19)** — OQ-STATE-1 cerrado. `LoadoutState` (tipo + helpers en `loadout.ts`) se conserva como formato interno del Adapter. | ✅ |

**Vínculo con OQ-STATE**: OQ-STATE-1 cerrado (2026-05-19). `EnsembleIntention` es el SSoT canónico.

### 2.2 Vocabulario de `@status` sin estándar

El inventario encontró al menos 6 valores distintos para `@status` en JSDoc:
- `en desarrollo` (más común)
- `stub / en desarrollo`
- `stub / persistencia temporal`
- `v2-flat-record`
- `BLOQUEADO - Pendiente 'arcane-stats.override.json'`
- `Parche Inicial - Cargador de dataset warframe-items`
- `activo`

No hay un vocabulario canónico. Antes de limpiar JSDoc masivamente, definir el estándar.

---

## 3. KEEP — Necesitan limpieza, no purga

### 3.1 Comentarios con nomenclatura legacy

Dos referencias a "Snapshot B4" (nomenclatura de fases B1-B4 deprecada):

| Archivo | Línea | Texto | Acción |
| :--- | :--- | :--- | :--- |
| `core/engine/sim-v2/hooks/useSimulation.ts` | 15 | `"Proporciona el Snapshot B4 (resultados del motor)"` | Reemplazar por `"ProjectionSnapshot del motor"` |
| `domains/arsenal/view/UpgradeView.tsx` | 22 | `"Simulación reactiva desde el EnsembleStore (Snapshot B4)"` | Reemplazar por `"Simulación reactiva desde EnsembleStore"` |

### 3.2 `any` types por archivo (engine)

Todos son KEEP — el código es funcional, pero los `any` esconden problemas de tipo que se manifestarán al escalar:

| Archivo | Ocurrencias | Problema raíz |
| :--- | :--- | :--- |
| `core/engine/sim-v2/logic/ModRepository.ts` | 2 (`stat: any`, `val: any`) | El override JSON no tiene interfaz TypeScript. Necesita `ModStatRaw` interface. |
| `core/engine/sim-v2/logic/ItemRepository.ts` | 4+ (`data: any[]`, `attack: any`, `mapDamage(damage: any)`, retornos `any\|null`) | El dataset warframe-items no tiene contratos TS. Necesita `RawWeaponData` etc. |
| `core/engine/sim-v2/logic/MutatorBridge.ts` | 1 (`mapCalculatedStats(): any`) | Retorno debería ser `Record<AttributeId, AttributeNode>`. |
| `core/engine/sim-v2/logic/EnsembleAdapter.ts` | 1 (`mapEntity(): any`) | Retorno debería ser el bloque de warframe de `Ensemble`. |
| `core/engine/sim-v2/logic/CombatSimulator.ts` | 1 (`entity: any`) | Parámetro debería ser `SimulationEntity`. |

### 3.3 `any` types en DataRegistry (shared)

**Archivo**: `shared/data/DataRegistry.ts`

El más problemático del conjunto: tiene cadenas de cast estilo `as unknown as T[]` para cargar `ability-stats.override.json`. Patrón de cast inseguro que oculta divergencias entre el formato del JSON y los tipos esperados.

No es urgente (funciona), pero es la deuda técnica más alta del área de datos.

### 3.4 `any` types en tests (patrón `laws: {} as any`)

En 6+ archivos de test: `laws: {} as any` para mockear `SimulationContext`. No es un problema de tests — es una señal de que `SimulationContext` debería tener `laws` como campo opcional o con un `Partial<GameLaws>` helper.

### 3.5 Stubs funcionales de desarrollo

Estos archivos son stubs legítimos y deben quedar marcados como tal, no purgarse:

| Archivo | Rol real |
| :--- | :--- |
| `core/engine/sim-v2/logic/DatasetSeeder.ts` | `@domain Simulation-v2 / Dataset / Stub`. Fixtures de test para registrar armas/mods hardcodeados. |
| `dev/SimulationLab.tsx` | Laboratorio visual del motor. Código de desarrollo, nunca producción. |
| `dev/ModTestPage.tsx` | Mock de Riven para tests CSS. Solo dev. |
| `core/engine/sim-v2/dev/verify-diff.ts` | Herramienta de diff de simulación. Solo dev. |

### 3.6 JSDoc con `@SSoT` — falsa alarma

El agente marcó los `@SSoT` de los archivos engine como "paths rotos". Verificación: los paths referenciados (`docs/design/sim-v2/simulation-architecture.md`, `docs/design/sim-v2/simulation-roadmap.md`, etc.) **sí existen** en el repo — el agente buscó desde `Project/src/` sin contexto de la raíz. Los `@SSoT` están correctos.

**Excepción real** — `providers/Loadout/loadout-context.tsx` línea 3: ✅ **Corregido (2026-05-18)**
```
@SSoT docs/domains/integration/README.md
```

---

## 4. BUENAS NOTICIAS

**Cero imports ilegales entre dominios.** La topología de `Project/src/domains/` es limpia — ningún dominio importa de otro hermano directamente. Las reglas de `Project/CLAUDE.md` se están respetando.

---

## 5. Plan de acción ordenado

### Bloque A — ✅ Completado (2026-05-18)

1. ✅ Limpiar referencias a "Snapshot B4" — `useSimulation.ts`, `UpgradeView.tsx` y 4 providers adicionales.
2. ✅ Corregir `@SSoT` rotos — `loadout-context.tsx` y 5 providers corregidos o saneados.
3. ✅ Vocabulario canónico de `@status` — `docs/governance/jsdoc-standard.md` creado.
4. ✅ Tipar `CombatSimulator.simulateAttack()` → `SimulationEntity` + `AtomicRoll`.
5. ✅ Tipar `MutatorBridge.mapCalculatedStats()` → `Record<AttributeId, AttributeNode>`.
6. ✅ Normalizar todos los `@status en desarrollo` → `en-desarrollo` (11 archivos).
7. ✅ Estandarizar valores no canónicos (`BLOQUEADO`, `Parche Inicial`, `SSoT para...`).

### Bloque B — ✅ Completado (2026-05-18)

6. ✅ `ModStatRaw` + `ModStatValueRaw` + `ModOverrideEntry` — `contracts/mod-overrides.ts` creado.
7. ✅ `ModRepository` tipado con las interfaces (eliminados los 2 `any` de stat/val).
8. `EnsembleAdapter.mapEntity()` — pendiente de OQ-STATE-1.

### Bloque C — Completado (2026-05-19)

9. ✅ `loadout-context.tsx` purgado — OQ-STATE-1.
10. ✅ `EnsembleAdapter.ts` eliminado — lógica absorbida por `MutatorBridge` — OQ-STATE-4.
11. ✅ `ArchonShardSelection` y factories de estado eliminadas de `arsenal-state.ts` — archon shards migrados a `EnsembleIntention` — OQ-STATE-2.
12. `use-arsenal-stub-state.ts` — reducido a metadata visual (incarnon, focus, companion, vehicles). Purga final cuando OQ-ENGINE-2/4 sean implementados.
13. `ArsenalFooter.tsx` — stub hardcodeado. Purgar cuando Arsenal Footer consuma datos reales.

### Bloque D — Deuda técnica baja urgencia

11. Refactorizar `DataRegistry.ts` (cadenas `as unknown as T[]`).
12. Tipar `ItemRepository` (requiere mapear shape del dataset warframe-items).

---

## 6. Open Questions vinculadas

- OQ-STATE-1, OQ-STATE-2 (de `docs/governance/open-questions.md`) — desbloquean el Bloque C.
- OQ-ENGINE-3 (label parsing en ModRepository) — desbloquea el Bloque B (necesita `element_type` explícito en el override).
