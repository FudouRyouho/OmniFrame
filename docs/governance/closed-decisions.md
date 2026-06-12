---
Estado: "referencia"
Rol: "Registrar decisiones de arquitectura cerradas que no deben reabrirse sin evidencia nueva"
Version: "v0.0.7"
Impacto_ID: "G-ADL-Closed"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-12"
---

# Decisiones Cerradas de Arquitectura

## Propósito

Este documento existe para evitar que decisiones ya evaluadas y cerradas sean tratadas como deudas activas o preguntas abiertas. Cada entrada incluye el contexto real que llevó al cierre.

---

## DC-1 — No hay soporte i18n / multi-locale

**Fecha de cierre:** Estimado Q1 2026 (confirmado 2026-04-18).

**Decisión:** El proyecto no soporta multi-locale ni internacionalización real. El idioma operativo es **inglés exclusivo**. No existe selector de idioma ni existe infraestructura i18n en runtime.

**Lo que sí existe (y no es i18n real):**
`src/lib/i18n/` contiene módulos de lookup de labels y assets en inglés:
- `stat-labels.ts` — labels de stats de armas y mods
- `damage-labels.ts` — labels de tipos de daño
- `category-icons.ts` — iconos por categoría
- `faction-icons.ts` — iconos y labels de facciones

El directorio se llama `i18n/` por convención de capa de presentación, **no porque implemente internacionalización**. Los propios archivos lo declaran explícitamente en sus comentarios.

**Contexto del cierre:**
El proyecto tuvo una maqueta inicial para soportar inglés, español y portugués. El choque de realidad llegó cuando se entendió el coste de mantenimiento operativo de los overrides de habilidades y mods en múltiples idiomas: los overrides son 100% manuales y requieren conocimiento del juego en cada idioma. Esto hace el mantenimiento multi-locale inviable hoy.

**Condición para reabrirse:**
Solo si se formula un sistema que permita generar overrides de idioma sin mantenimiento manual por idioma. No existe ese sistema ni existe propuesta concreta para crearlo. No es una discusión activa.

**No reabrir este debate** hasta que los contratos de datos estén completamente cerrados y exista una propuesta técnica concreta para los overrides multi-idioma.

---

## Historial de Decisiones Derivadas (OQ-Archive)

| ID | Título | Decisión / Resultado |
|---|---|---|
| **DC-OQ-3** | Fuente de Mods | Enfoque mixto: parseo automático + overrides manuales (Project/public/data/). |
| **DC-OQ-4** | Taxonomía Wiki | Taxonomía documental mínima sin acople prematuro al runtime de simulación. |
| **DC-OQ-6** | Sistema de Popovers | `CustomPopover` (@tippyjs/react) como base única compartida. |
| **DC-OQ-8** | Overrides de Tipado | Contratos explícitos por dominio ejecutados en la iteración de dataset. |
| **DC-OQ-9** | Damage Taxonomy | Taxonomía canónica única para damage types (estabilizada). |
| **DC-OQ-10** | Naming Conventions | Naming semántico por capa: PascalCase (Tipos), camelCase (Funciones), snake_case (Raw). |
| **DC-OQ-11** | TextFormatter | Pertenencia a Presentation, consume semántica resuelta sin inferirla. |
| **DC-OQ-STATE-1** | Contrato de estado del usuario | `EnsembleIntention` (EnsembleStore) es el SSoT canónico. `LoadoutContext` eliminado (2026-05-19). `LoadoutState` y `loadout.ts` eliminados (2026-05-21). |
| **DC-OQ-STATE-2** | Conexión Arsenal → Motor | Escritura: `EnsembleStore.setItem/setMod/setShard`. Lectura: `useSimulation()` con `entity.channel` como clave estable. |
| **DC-OQ-STATE-3** | Ciclo de vida de LoadoutContext | Eliminado físicamente (2026-05-19). Sin remanentes del sistema legacy. |
| **DC-OQ-STATE-4** | Rol de EnsembleAdapter | Eliminado (2026-05-19). Lógica absorbida por `MutatorBridge`. Una sola ruta: `simulateFromIntention`. |
| **DC-OQ-2** | Rol del LoadoutProvider | Abandonado. Arquitectura Sim-v2: MutatorBridge + EnsembleStore serializable. |
| **DC-OQ-5** | Migración hidratación build time | No aplica. `StaticHydrator` + overrides JSON = funcionalmente equivalente a build-time. |
| **DC-OQ-12** | Contrato de Proyección B4 | Projection Snapshot inmutable y serializable. Reactividad via Selective UI Reactive Bridge externo. |
| **DC-OQ-13** | Frontera Arsenal / Builder | No hay frontera de cálculo. Mismo engine, distinto SimulationContext (Target vs Baseline). |
| **DC-OQ-ENGINE-1** | Patrón WEAPON_DAMAGE global | `base = damage_sum` del perfil activo. `final/base` como multiplicador global. Validado en 33 tests gold standard (2026-05-27). |
| **DC-OQ-ENGINE-3** | Label parsing en ModRepository | No aplica en v2. Consume `upgrade_type` directamente vía `isUpgrade()` + UPGRADE_MAP/`resolveToken()`. |
| **DC-OQ-ENGINE-4** | DNA Mutation (Archon Shards) | `StaticHydrator.hydrate()` consume shards vía `ShardRepository`. Shards = mods en slots especiales. Helminth sin implementar. |
| **DC-OQ-ENGINE-5** | Fórmulas legacy desconectadas | `weapon-core.ts` y `warframe-core.ts` purgados (2026-05-27). `formulas/` conectado a `AtomicSimulator` + `SimulationEngine`. |
| **DC-OQ-ENGINE-6** | WEAPON_FIRE_ITERATIONS sin mapear | Alias añadido en UPGRADE_MAP → `WEAPON_ADD_MULTISHOT`. 3 mods Galvanized añadidos manualmente al override. |
| **DC-OQ-W-4** | Sub-familia en D-6 | Patrón: `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`. Sub-familias activas: PRIMARY, SECONDARY, MELEE. Deuda D-7 en pipeline de filtrado. |
| **DC-OQ-UI-1** | Unificación de infraestructura UI en @shared | `shared/components/items/` activo: views por entidad (WarframesView/WeaponsView/etc.), cards, specs/detail-views, ItemsGrid. `shared/hooks/data/use-items.ts` + `use-performance-debug.ts`. Dominios actúan como smart wrappers. Implementado (2026-04-23). Ref: `docs/decisions/ui-unification.md` (histórico). |

---

## DC-OQ-ENGINE-9 — Reestructura interna de `@core` (capas/cortes) + ruling `@providers → @core` — **EJECUTADO (2026-06-12)**

**Dominio:** engine / arquitectura de `@core`

**Contexto:** `@core` creció sin estructura interna deliberada (ver `OQ-ENGINE-9`): Capa A co-ubicada en `providers/`, `bridge/`+`combat/`+`resolution/`+`hydration/` planos bajo `engine/`, contratos y primitivos mezclados en un `contracts/index.ts`. Plan validado y blast-radius medido (2026-06-11/12); ejecutado desde Linux en la rama `refactor/core-stage0-restructure`, commit por slice, gate `tsc -b` CLEAN + 95 tests verde en cada uno.

**Ejecutado (Stage 0 — reorg interno de `engine/`, blast externo 0):**
- `contracts/index.ts` → split en `contracts.ts` (cortes de frontera / DTOs) + `primitives.ts` (vocabulario no-corte: `AttributeNode`, `Modifier`, `GameLaws`, ids); `index.ts` queda como barrel.
- `combat/` + `enemies/` → `engine/simulate/` (C2, anidado).
- `resolution/` + `hydration/` → `engine/resolve/` (C1, `SimulationEngine` a la raíz + `hydration/` anidado).
- `bridge/` (MutatorBridge, Capa B) sale de `engine/` → `@core/bridge/` (hermano de engine).

**Ejecutado (Stage 1 — split de Capa A):**
- `ensemble.types.ts` (gemelo-de-entrada: `EnsembleChannel`/`EnsembleIntention`/`INITIAL_INTENTION`) → `@shared/types/ensemble.ts` (único corte domain-visible). De paso cerró un smell de Restricción 1: 4 dominios importaban `@providers/Ensemble/ensemble.types` (no permitido).
- `ensemble-store.ts` (A1, `ensembleStore`) → `@core/intention/`. `EnsembleProvider.tsx` (binding React) se queda en `@providers/Ensemble/`.

**Ruling `@providers → @core` = PERMITIDO (2026-06-12):** `EnsembleProvider` (capa de composición / adapter) importa `@core/intention/ensemble-store`. Adapter→core es la dirección correcta de Ports&Adapters; la Restricción 1 protege a los **dominios de feature** entre sí y de `@core`, **no** a la capa de composición. **No contradice** "los dominios no importan `@core`" (sigue NO; `domains/* → @core` es drift): `@providers` no es un dominio de feature. Esto resuelve la **simetría de entrada** de `OQ-ENGINE-FUTURE` (contrato de intención en `@shared` ↔ store en `@core`).

**Pendiente (gated por consumidor D real — Stage 2, NO ejecutar en abstracto):** extraer `engine/hooks/` (D-parcial) fuera de `@core`; separar bootstrap de `fixtures/`; construir A2 (`SimulationContext` aún mezcla intención+dato+leyes); `ProjectionSnapshot` → `ViewModelContract`. También diferido: lift de `contracts/`/`primitives/` a nivel `@core` (ubicación de `damage-logic`/`damage-multipliers`/`mod-overrides` = decisión nueva).

**Condición para reabrir el ruling:** ninguna prevista. Reabrir solo si `@providers` deja de ser capa de composición pura.

---

## DC-OQ-DATA-3 — DataLoader singleton: contrato de consumo de overrides — **DIRECCIÓN ELEGIDA (2026-05-29)**

**Dominio:** data / pipeline / engine / UI

**Dirección elegida:** Runtime-universal con DataLoader singleton. Todos los overrides se cargan en runtime por un DataLoader singleton que expone cada par `JSON base + override` ya mergeado. El pipeline (`generate-data.ts`) no toca los overrides. Cada repositorio delega al DataLoader en vez de implementar su propio loader.

**Corrección ya aplicada (2026-05-29):** `generate-data.ts` ya no lee ni escribe `ability-stats.override.json`. El pipeline produce solo datos de fuente externa. Gestión de overrides = responsabilidad de scripts manuales/agente.

**Patrón objetivo:**
```
DataLoader.getWeapons()      → weapons.json + weapon-stats.override.json   (mergeado)
DataLoader.getMods()         → mods.json + mod-stats.override.json          (mergeado)
DataLoader.getWarframes()    → warframes.json + ability-stats.override.json (mergeado)
DataLoader.getIncarnonData() → incarnon-evolutions.override.json            (directo)
```

**Implementación pendiente.** `DataRegistry.ts` (UI) es el candidato natural a evolucionar hacia este patrón.
**Condición de cierre total:** cuando el DataLoader singleton esté implementado y los repositorios deleguen en él.
**Ref:** `docs/data/rules/overrides.md` (D-1), `docs/data/decisions.md` (D-1)

---

## DC-OQ-DATA-2 — Ubicación de vocabularios que son simultáneamente semantic + data — **DIRECCIÓN ELEGIDA (2026-06-05)**

**Dominio:** data / semantic

**Contexto:** vocabularios como polaridad, tipos de daño y facciones son a la vez **significado canónico** (token del juego) y **estructura de datos materializada** (campos en `mods.json`, `warframes.json`, etc.). La auditoría 2026-05-25 los reportó como huérfanos documentales (0 links entrantes), planteando si debían moverse fuera de `semantic/`.

**Dirección elegida: opción (a) — vocabulario en `semantic/`, visibilidad del grafo por link al consumidor.**
El criterio organizador es la regla de enrutamiento ya vigente en `docs/CLAUDE.md`: *"si un documento define qué SIGNIFICA algo → `semantic/`; si define cómo se ESTRUCTURA en JSON → `data/schemas/`."* Un vocabulario que es significado canónico vive en `semantic/` aunque se materialice en datos.

**Evidencia (el corpus ya la adoptó de facto, verificado 2026-06-05):** `damage-types.md` (6 links entrantes, incl. engine y governance) y `factions.md` (links desde consumidores reales: `audit-mods.md`, `engine/status.md`) ya viven en `semantic/` con links entrantes desde quien los consume. El patrón existe sin haberse nombrado.

**Convención de visibilidad del grafo de consumo:**
- Consumidor **documental** (un doc de `data/` usa el vocabulario) → link entrante obligatorio hacia el doc de `semantic/`.
- Consumidor de **código** sin doc-consumidor → basta `Fidelidad_Fisica` + declaración del consumidor en el cuerpo del doc.

**Falso positivo resuelto:** `polarity.md` no era huérfano problemático — su consumidor es código (`shared/types/polarity.ts`, `scripts/normalization/polarity.ts`), ya declarado vía `Fidelidad_Fisica` y §Manifestación. La auditoría contó solo links `.md` entrantes e ignoró el consumo por código. No requirió mover ni re-linkear nada.

**Corolario para OQ-DATA-4 (ubicación del puente):** el "puente de patrones estructurales" (stacking / duration cross-schema) **no es vocabulario de significado sino estructura de schema** → su ubicación es `data/` (`rules/` o `schemas/`), **no** `semantic/`. Esto resuelve la *ubicación* del puente; su *creación* sigue gateada por `D-20` (≥2 casos misma forma) + `D-16` (cobertura ≥70%), independiente de esta decisión.

**Ref:** `docs/semantic/polarity.md`, `docs/semantic/damage-types.md`, `docs/semantic/factions.md`, `docs/governance/open-questions.md` (OQ-DATA-4), `docs/CLAUDE.md` (regla de enrutamiento semantic vs data).

---

## DC-OQ-TYPES-1 — Type System: taxonomía canónica de damage types — **CIERRE PARCIAL (implementado)**

**Dominio:** types / damage / shared

**Decisión aplicada (Opción B):** Consolidar una taxonomía canónica única para damage types dentro de `src/shared/types/`. `damage.ts` concentra la raíz canónica mínima. Labels, aliases raw e iconografía consumen esa raíz en vez de mantener tablas paralelas. Cierra drift de damage types sin promover semántica amplia de combate.

**Alcance del cierre:** No autoriza promover semántica de `upgrade_type`, conditions ni contratos de combate más amplios al runtime productivo. La taxonomía de combate amplia queda como pre-definición documental (Opción C), sin fecha ni propuesta activa.

**Condición para reabrirse:** Cuando el backlog de estabilización lo permita y exista una propuesta concreta para promover semántica amplia de combate al runtime. No es una discusión activa.

**Ref:** `docs/governance/type-system-boundaries.md` (reglas de frontera vigentes), `docs/semantic/damage-types.md`.
