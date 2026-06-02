---
Estado: "referencia"
Rol: "Inventario de residuos de transición en Project/src/ — base para purga y refactor"
Version: "v0.2.0"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "Project/src/"
Fecha_de_creacion: "2026-05-18"
Fecha_de_actualizacion: "2026-05-27"
Dependencias:
  - "docs/domains/engine/engine-audit.md"
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

> **Nota**: OQ-STATE-2 cerrado (2026-05-19). `use-arsenal-stub-state.ts` sigue activo pero reducido a metadata visual (incarnon, focus, companion, vehicles). Purga final bloqueada por OQ-ENGINE-2 (conexión completa Arsenal → EnsembleStore).

---

## 2. PENDING — Requieren decisión arquitectónica

### 2.1 El triángulo del Arsenal

Tres archivos forman un sistema cohesivo de transición que NO se puede purgar individualmente:

| Archivo | Estado actual | Por qué es PENDING |
| :--- | :--- | :--- |
| `domains/arsenal/arsenal-state.ts` | `@status stub / en desarrollo`. Contiene factories mock, metadata visual para slots vacíos ("Metadata visual del slot de X para cerrar el Arsenal aunque no exista wiring real"). | ¿Se integra con EnsembleStore o se refactoriza como capa de presentación permanente? |
| `domains/arsenal/ArsenalView.tsx` | `@status stub / en desarrollo`. Vista principal del Arsenal. Consume `useArsenalUiState()` que es el stub de arriba. | Bloqueada por la decisión sobre `arsenal-state.ts`. |

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
| `core/engine/hooks/useSimulation.ts` | 15 | `"Proporciona el Snapshot B4 (resultados del motor)"` | Reemplazar por `"ProjectionSnapshot del motor"` |
| `domains/arsenal/view/UpgradeView.tsx` | 22 | `"Simulación reactiva desde el EnsembleStore (Snapshot B4)"` | Reemplazar por `"Simulación reactiva desde EnsembleStore"` |

### 3.2 `any` types por archivo (engine)

Estado actualizado — mayoría resueltos en Bloques A/B. Pendiente solo `ItemRepository`:

| Archivo | Estado | Nota |
| :--- | :--- | :--- |
| `core/engine/hydration/ModRepository.ts` | ✅ Resuelto (Bloque B) | `ModStatRaw` + `ModOverrideEntry` en `contracts/mod-overrides.ts`. |
| `core/engine/hydration/ItemRepository.ts` | KEEP — Bloque D | 4+ `any` (`data: any[]`, `attack: any`, `mapDamage`, retornos `any\|null`). Necesita `RawWeaponData`. |
| `core/engine/bridge/MutatorBridge.ts` | ✅ Resuelto (Bloque A) | `mapCalculatedStats()` tipado → `Record<AttributeId, AttributeNode>`. |
| ~~`core/engine/bridge/EnsembleAdapter.ts`~~ | **ELIMINADO** (OQ-STATE-4) | Absorbido por `MutatorBridge`. |
| `core/engine/combat/CombatSimulator.ts` | ✅ Resuelto (Bloque A) | `simulateAttack()` tipado → `SimulationEntity` + `AtomicRoll`. |

### 3.3 `any` types en DataRegistry (shared)

**Archivo**: `shared/data/DataRegistry.ts`

El más problemático del conjunto: tiene cadenas de cast estilo `as unknown as T[]` para cargar `ability-stats.override.json`. Patrón de cast inseguro que oculta divergencias entre el formato del JSON y los tipos esperados.

No es urgente (funciona), pero es la deuda técnica más alta del área de datos.

### 3.4 `any` types en tests (patrón `laws: {} as any`)

En 6+ archivos de test: `laws: {} as any` para mockear `SimulationContext`. No es un problema de tests — es una señal de que `SimulationContext` debería tener `laws` como campo opcional o con un `Partial<GameLaws>` helper.

### 3.5 JSDoc con `@SSoT` — falsa alarma

El agente marcó los `@SSoT` de los archivos engine como "paths rotos". Verificación: los paths referenciados (`docs/domains/engine/design/simulation-architecture.md`, `docs/domains/engine/design/simulation-roadmap.md`, etc.) **sí existen** en el repo — el agente buscó desde `Project/src/` sin contexto de la raíz. Los `@SSoT` están correctos.

**Excepción real** — `providers/Loadout/loadout-context.tsx` línea 3: ✅ **Corregido (2026-05-18)**
```
@SSoT docs/domains/integration/README.md
```

---

## 4. BUENAS NOTICIAS

**Cero imports ilegales entre dominios.** La topología de `Project/src/domains/` es limpia — ningún dominio importa de otro hermano directamente. Las reglas de `Project/CLAUDE.md` se están respetando.

---

## 5. Deuda técnica pendiente

11. Refactorizar `DataRegistry.ts` (cadenas `as unknown as T[]`).
12. Tipar `ItemRepository` (requiere mapear shape del dataset warframe-items).

---

## 6. Open Questions

OQs cerradas: ver `docs/governance/closed-decisions.md`.

**Bloqueador activo**: OQ-ENGINE-2 (profile switching Incarnon/Alt-fire).
