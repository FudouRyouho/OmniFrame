---
Estado: "referencia"
Rol: "Registrar decisiones de arquitectura cerradas que no deben reabrirse sin evidencia nueva"
Impacto_ID: "G-ADL-Closed"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-07-17"
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
| **DC-OQ-ENGINE-1** | Patrón de nodo de daño global | Nodo `WEAPON_ADD_DAMAGE`, `base = damage_sum` del perfil activo. `final/base` como multiplicador global (= el pool ADITIVO expresado como factor, Step 1 de `calculating-bonuses.md` — **no un hack**). Detalle ↓. |
| **DC-OQ-ENGINE-3** | Label parsing en ModRepository | No aplica en v2. Consume `upgrade_type` directamente vía `isUpgrade()` + UPGRADE_MAP/`resolveToken()`. |
| **DC-OQ-ENGINE-4** | DNA Mutation (Archon Shards) | `StaticHydrator.hydrate()` consume shards vía `ShardRepository`. Shards = mods en slots especiales. Helminth sin implementar. |
| **DC-OQ-ENGINE-5** | Fórmulas legacy desconectadas | `weapon-core.ts` y `warframe-core.ts` purgados (2026-05-27). `formulas/` conectado a `AtomicSimulator` + `SimulationEngine`. |
| **DC-OQ-ENGINE-6** | WEAPON_FIRE_ITERATIONS sin mapear | Alias añadido en UPGRADE_MAP → `WEAPON_ADD_MULTISHOT`. 3 mods Galvanized añadidos manualmente al override. |
| **DC-OQ-W-4** | Sub-familia en D-6 | Patrón: `{FAMILY}_{SUB_FAMILY}_{OPERATION}_{PREFIX}_{SUFFIX}`. Sub-familias activas: PRIMARY, SECONDARY, MELEE. Deuda D-7 en pipeline de filtrado. |
| **DC-OQ-UI-1** | Unificación de infraestructura UI en @shared | `shared/components/items/` activo: views por entidad (WarframesView/WeaponsView/etc.), cards, specs/detail-views, ItemsGrid. `shared/hooks/data/use-items.ts` + `use-performance-debug.ts`. Dominios actúan como smart wrappers. Implementado (2026-04-23). Ref: `docs/decisions/ui-unification.md` (histórico). |

---

## DC-OQ-ENGINE-1 — patrón de nodo de daño global

**Dominio:** engine / pools globales de daño

**Evidencia** (nombrada, no contada — un conteo caduca solo):
- `formulas/weapon/stat-accumulator.ts::globalDamageBucketFactor` — la primitiva.
- `__tests__/lanka.test.ts` + `__tests__/nikana-melee.test.ts` — la propagación del pool global a los nodos
  por-tipo (525→787.5 / 594→2376).
- `__tests__/tiberon-dot.test.ts` — el mismo factor vía `formulas/status/dot-base-scaling.ts`, **validado
  contra medición in-game** (`references/ingame-tests/`).
- `__tests__/rhino.test.ts` — la **misma primitiva aplicada a un segundo pool global** (facción), verificada
  in-game (Roar+Expel suman, `×2.428`). Ver `../domains/engine/design/arch-decisions.md` §16.

**Frontera:** la *colección* de pools globales es implícita (hardcodeada en `rebuildGraph` +
`calculateCurrentValue`). **Declararla sería un refactor de realización — compatible con esta decisión, no
una alternativa: no la reabre.** Lo que no se re-debate es el patrón `final/base`.

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

**Cierre del eje (b) — por solución mejor (2026-07-17).** El eje (b) de `OQ-ENGINE-9` preguntaba "dónde vive el harness de consumidores (lado-entrada) respecto al puerto de salida (`output/`)", gated por "esperar a la Capa D real". **Se disolvió al ejecutarse el eje (a):** el harness dejó de ser una cosa — `bootstrap/` se graduó a producción (lo llama `main.tsx`) y `fixtures/builds.ts` quedó como el **catálogo de builds compartido tests↔CLI**, consumido por el oráculo D2 (`scripts/oracle/oracle.ts`) y por las suites. Es el harness compartido que el Contexto original pedía: cumple su función y hace crecer el CLI y D1/D2. El gate además nunca fue el correcto — D consume `output/`, nunca `fixtures/`, así que esperar a D no iba a informar esta ubicación. Cerrado sin reorganizar: no hay consumidor que pida moverlo.

**Pendiente (verificado contra código 2026-07-17):**
- **A2** — `SimulationContext` (`contracts/contracts.ts`) sigue mezclando intención (`active_profile_id`/`flags`/`variables`) + leyes (`laws`) + dato (`target`).
- **Shape de la Capa A** (backlog del usuario, 2026-06-16; pariente de A2): la estructura de las **intenciones** huele incoherente — `EnsembleIntention` mezcla `slots`+`arcanes` y la forma de los intents pide una estructura más coherente → revisión de la Capa A. Encaja con una fase futura del saneamiento de `@core`. No bloquea.
- **Lift de `contracts/`/`primitives/` a nivel `@core`** — siguen en `engine/contracts/`; la ubicación de `damage-logic`/`damage-multipliers`/`mod-overrides` = decisión nueva.

De la lista original de Stage 2 ya no queda nada más: `engine/hooks/` se purgó (era cluster muerto, no se extrajo), el bootstrap se separó de `fixtures/` (`bootstrap/engine-data.ts`; `fixtures/` solo aloja `builds.ts`) y `ProjectionSnapshot` fue reemplazado por `ViewModelContract` (consumido por D1 `use-view-model`, D2 oráculo y `UpgradeView`).

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

---

## DC-OQ-ENGINE-10 — Capa E DESCARTADA: D se lee por dos lentes de salida, no por una capa intermedia — **CERRADO (2026-07-17)**

**Dominio:** engine / arquitectura de capas + ui-ux / presentación

**Qué proponía E:** una capa intermedia entre la salida de C y la UI que **enriquecía e hidrataba** el snapshot para display, moviendo `ViewModelContract` **fuera de D**. La topología propuesta era:
```
C → D → salida cruda → D2 (CLI/oracle)
C → D → salida cruda → E (enriquece + hidrata) → UI
```

**Por qué NO (decisión 2026-07-17):** E era un pasamanos con dos trabajos, y ambos ya tienen mejor hogar:
- **La hidratación de chrome** (nombre/imagen/desc) la provee el **piso "0"** — la capa **horizontal** de datos (`DataRegistry`, OQ-DATA-9). Que la UI lea el chrome de 0 directo es más sólido que una capa vertical E que lo re-hidrate: 0 ya es el SSoT de datos y la UI (como los DetailViews) ya lee de ahí.
- **El formateo** (labels/unidades/números) lo provee `lib/format` (estrato de utilidad, `DC-OQ-ENGINE-10-A`), consumido por igual por CLI y UI.
- Sin esos dos trabajos, E no queda con nada propio: **D se divide en sus dos lentes de salida** — **D1** (`use-view-model`, binding reactivo UI, aún prematuro) y **D2** (`oracle`, CLI). Ambas consumen el mismo `project()` (cut C→D); no hace falta una capa entre medio.

**Consecuencia:** `ViewModelContract` **se queda en D** (no se mueve a E). El modelo de capas es `A→B→C→D→UI` con D leído por dos lentes; **no hay Capa E**. Un agente futuro **no debe re-proponer E**: la confluencia info+chrome se resuelve con 0 (horizontal) + lib/format, no con una capa vertical. En una frase: **E era sobredimensionar una solución** — el concepto quedó completamente suspendido.

**Qué sobrevive de los sub-DC:** `DC-OQ-ENGINE-10-A` (lib/* = utilidad) intacto — es independiente de E. `DC-OQ-ENGINE-10-C` conserva el modelo de 2 canales de lectura y los dos ejes de refactor; su "Canal 2 = E" se lee ahora como "canal de presentación (D1 + lib/format + chrome de 0)", sin capa E. `DC-OQ-ENGINE-10-B` (topología mini-framework de E) se **purgó** — era el manual de construcción de E; su historia queda en git.

**Distinto del rename de D:** el "rename D→contrato neutro" que E arrastraba en su enunciado es **decisión aparte y sigue viva** — es `OQ-ENGINE-8` (nombre del payload de salida de C), independiente de que E se descarte.

**Condición para reabrir:** ninguna prevista. E se reabre solo si aparece un trabajo de confluencia que **ni 0 ni lib/format** puedan cubrir — no anticipado.
**Ref:** `OQ-ENGINE-10` (lápida), `DC-OQ-ENGINE-10-A/-B/-C`, `OQ-DATA-9` (piso 0), `OQ-ENGINE-8` (rename de D).

---

## DC-OQ-ENGINE-10-A — `lib/*` = suite de utilidad de presentación, no capa ni orquestador — **CERRADO (2026-06-13)**

**Dominio:** ui-ux / presentación + arquitectura de capas

**Decisión:** `lib/*` (labels `i18n/`, `presentation/`, formateadores numéricos, `FormattedText`, el lado display de `image-url`) es una **suite de utilidad** — funciones consumidas, sin estado, **no una capa** del flujo `A→B→C→D→E` ni un orquestador. Es un **plano de utilidad ortogonal a la salida**, espejo conceptual de `0` (el plano de memoria de la entrada): ninguno de los dos es un eslabón de la cadena vertical. El **orquestador** que decide qué invocar de `lib/*` es `E` (lado UI) / el consumidor (CLI por su lado).

**Qué corrige:** el diagrama de `OQ-ENGINE-10` dibujaba `lib/format` como un *estrato dentro del flujo* ("invocado por D2 y E por igual"). Eso queda corregido: no es estrato, es utilidad.

**Disuelve el "ruido abierto" de OQ-ENGINE-10** (¿partir el consumo de `lib/format` entre D2 y E recrea islas?): **no.** Dos consumidores que llaman a una misma suite de utilidad = biblioteca compartida, no isla. El riesgo de isla es **lógica duplicada**, no **utilidad compartida**. (No rompe la Restricción 1: `lib/*` ya es shared legal.)

**Condición para reabrir:** ninguna.
**Ref:** `docs/governance/open-questions.md` (OQ-ENGINE-10, OQ-DATA-10). Memoria de proyecto: capa E / presentación.

---

## DC-OQ-STUB-1 — Principio de stub honesto: un placeholder no simula conexión — **CERRADO (2026-06-13)**

**Dominio:** ui-ux / disciplina de implementación

**Decisión:** un stub/placeholder **no debe simular conexión al flujo**. Un campo que existe como *"futuro"* (visible, vacío o deshabilitado) es **correcto**; la **lógica que finge wiring** —p. ej. "equipar companion" que muta estado mock local sin conexión real al engine— es **el defecto**. Placeholder vacío y honesto > falso silencioso funcional.

**Precedente:** el fix del bug de canales (`OQ-DATA-9`) eligió *"panel vacío honesto"* en vez de *"mostrar el warframe en silencio"*. Este DC generaliza ese criterio a todo placeholder de UI.

**Aplicación inmediata:** las funciones `replace*` de `ArsenalMetadataState` + el enum `source: "mock"|"manual"` son exactamente "lógica que finge wiring" → marcadas para purga (ejecución gated, ver `OQ-UI-2`).

**Condición para reabrir:** ninguna.
**Ref:** `docs/governance/open-questions.md` (OQ-UI-2, OQ-DATA-9 L304).

---

## DC-OQ-UI-SPEC-1 — La UI de arsenal no es spec del flujo; derivar contratos de D2 + dominio — **CERRADO (2026-06-13)**

**Dominio:** ui-ux / arquitectura de contratos

**Decisión:** la UI de arsenal existente **no es la especificación** del flujo de datos. Los contratos (qué exponen `E`/`D`) se **derivan de D2 (oráculo/CLI) + el dominio**, y la UI se **conecta al flujo re-visto** — no se retrofitea el contrato desde el stub-con-aspiraciones. Concretamente: ni el proyector inline de `UpgradeView` ni el shape de `arsenal-state` definen los contratos de `E`/`D`.

**Por qué:** arsenal hoy es un placeholder semi-conectado con aspiración a ser el flujo completo, cuando no lo es. Anclar contratos a esa UI cristaliza el stub como verdad.

**Condición para reabrir:** ninguna.
**Ref:** `docs/governance/open-questions.md` (OQ-UI-2, OQ-UI-3). Memoria de feedback: *UI no es biblia, derivar de D2*.

---

## DC-OQ-ENGINE-10-C — Modelo de 2 canales de lectura + ejes ortogonales — **CERRADO (2026-06-13; reencuadrado 2026-07-17 tras descartar E)**

**Dominio:** ui-ux / arquitectura de estado + capas

> ⚠️ **Reencuadre (2026-07-17):** este DC nombraba el canal de presentación como "Capa E". E se descartó (`DC-OQ-ENGINE-10`). El **modelo de 2 canales sigue vigente** — solo que el canal de presentación es **D1 + `lib/format` + chrome de 0 leído directo**, no una capa E. Léase "`E`" abajo como "canal de presentación". La sub-decisión *"`E` no es block stage"* se vuelve trivial: no hay E que secuenciar.

**Decisión (modelo de 2 canales hacia la UI):** la UI consume de **dos canales distintos**, no tres:
- **Canal 1 — espejo de intención (`useEnsemble`):** un **puntero** a A (itemId, rank, slots). Responsabilidad única: leer + mutar intención. **NO pasa por el canal de presentación.** No es un flujo de datos, es un espejo.
- **Canal 2 — presentación:** confluencia de **dos entradas** (chrome de `0` leído directo + info computada de `A→B→C→D` vía D1) hacia la UI. El chrome de `0` es una de las dos entradas — reafirma `DC-OQ-ENGINE-10-A`. (Enunciado original: "nodo de confluencia `E`"; E descartada, la confluencia la hace la UI leyendo 0 + D1, sin capa intermedia.)

**Qué corrige (drift transitorio en debate):** durante la iteración se propuso un "canal 3 = lectura directa `0→UI`" para el chrome puro (nombre/ícono). **Descartado:** no existe la "lectura cruda de `0`" — resolver un ícono es **normalización de patch** y mostrar una descripción es **formateo `<DT_*>`**; ambos son **enriquecimiento = trabajo de `E`**. Un canal aparte reimplementaría ese enriquecimiento → **isla**. El chrome puro entra por `E` (con `D`-side vacío); los casos verdaderamente inertes pasan por `E` como no-op, lo que no justifica otro canal.

**Decisión (dos ejes ortogonales):** la sombra `arsenal-state` parece "una sola pieza rota" porque **funde dos ejes que viven en el mismo archivo**:
- **Eje 1 — honestidad de intención:** fake-`A`+`B`+`D` → `A` real (`useEnsemble`). **E-independiente.** "Equipar companion sin channel" pasa a *"estado UI sin channel disponible"* — honesto (`DC-OQ-STUB-1`), no simulado.
- **Eje 2 — centralización de chrome:** `0`-disperso en componentes → `E`. Trabajo de `E`, **diferible**.

> *"Es parte del problema, no del mismo problema."* Los ejes son ortogonales; partir la sombra por estos dos ejes **es** la jugada de refactor.

**Decisión (secuencia — `E` NO es block stage):** `E` se construye **después** de estabilizar el ciclo `A→D→UI` + `A=UI`. Mientras tanto la UI **sigue leyendo `0` directo** (acoplado, pero honesto-funcional). Esto **no crea isla nueva**: los detail views (`WarframeDetailView`, etc.) **ya** leen `0` directo (`resolveLocalImageUrl` + `FormattedText`) — ese es el patrón dominante; la sombra es la anomalía. Purgarla = **regresar a la media existente**, no escribir un centralizador nuevo. (Corrige el overreach previo *"construir el selector 0-read = construir E-v0 delgada"*: falso, porque no se escribe nada nuevo en el lado-`0`.)

**Disciplina asociada (gate del eje 2):** los saltos `0→E` que hoy quedan acoplados se **mapean como candidatos durables** ("esto debería vivir en `E`") en backlog, no en memoria de trabajo. El test de *"`E` es real después"* vs *"`E` nunca"* es si ese mapa se consulta al estabilizar `A→D→UI`.

**Pendiente de verificación (checkpoint, no decisión):** ¿los componentes de arsenal ya tienen acceso directo a `DataRegistry`/`0`, o reciben chrome **solo** vía la sombra? Si es lo segundo, purgar fuerza lecturas-de-`0` nuevas (más caro). Confirmar con el código en mano antes de cantar "barato".

**Condición para reabrir:** el eje 2 (centralización en `E`) se retoma al estabilizar `A→D→UI` + `A=UI`; el mapa de candidatos es el gate. El modelo de 2 canales y la separación de ejes no se reabren sin evidencia nueva.
**Ref:** `docs/governance/open-questions.md` (OQ-UI-2, OQ-ENGINE-10), `DC-OQ-ENGINE-10-A/-B`, `DC-OQ-STUB-1`. Plan de stages: `.working/` (scratchpad, no SSoT).

---

## DC-OQ-DATA-12 — Carga de runtime del engine: `import` estático → `fetch` (lado engine de "0")

**Fecha de cierre:** 2026-07-02 (migrada desde `open-questions.md` el 2026-07-03).

**Decisión:** cerrado el mecanismo de carga del engine en runtime. El `loadEngineData` que hacía `DataLoader.init` con `import` estático de los 7 JSON (cableado en `main.tsx`, bundleaba los datos: chunk ~2.3 MB) se migró a `fetch` lazy y se reubicó fuera de `fixtures/`.

**Cómo cerró (dos pendientes):**
- **`fetch` lazy** → Fase 1 (2026-06-12/13, saneamiento `@core`): `BrowserAdapter` reemplaza el `import` estático; bundle 2.3 MB→565 kB (gzip 431→171 kB); `DataRegistry` comparte la instancia `browserSource`, sin doble-fetch.
- **Ubicación** → Fase 2 Slice E (2026-07-02): `loadEngineData` movido a `@core/engine/bootstrap/engine-data.ts`; `fixtures/` ya solo aloja `builds.ts`.

**Reencuadre clave (por qué NO fue "mover el loader a fetch"):** la opción barata de un fetch engine-privado de los 7 JSON se descartó — 5 son overrides = **dato canónico compartido**, no proyección privada del engine (un loader propio reconstruiría la isla que "0" venía a cerrar). El `import` estático se queda como provisional solo para tests/CLI en Node.

**Lo que NO cierra esta decisión:** el eje RED-adjacent "contrato de entrada del engine" (quién normaliza los overrides, β de OQ-DATA-9) sigue **abierto** — es otro eje, gated por el consumidor D real. Se rastrea en `OQ-DATA-9`.

**Ref:** `OQ-DATA-9` (borde de entrada / "0"); campaña de saneamiento `@core` (Fase 1 + Fase 2 Slices B/C/E). Procedencia completa en git history de `open-questions.md`.

---

## DC-OQ-ENGINE-13 — ¿Los buffs de habilidad tipo Roar/Xata double-dipean en DoTs? — SÍ, confirmado

**Fecha de cierre:** 2026-07-08 (migrada desde `open-questions.md` el 2026-07-09).

**Decisión:** confirmado empíricamente (test in-game, Akvasto Prime vs Arid Butcher/Charger,
`damage-status-model.md §Evidencia`). Roar **sí** double-dipea en DoTs, igual que el faction bonus —
y por la misma razón: ambos caen en el **mismo bucket aditivo** de bonos de daño-final (bucket ②,
`simulation-architecture.md §2.0`).

**Cómo cerró (más preciso que la hipótesis original):** la OQ preguntaba si Roar double-dipeaba "igual
que faction". La respuesta real **refina la regla**, no sólo la confirma: el double-dip **no es una
propiedad de "faction"** — es una propiedad del **bucket ② en general** (mods de facción + buffs de
habilidad, aditivos entre sí). Evidencia: Expel (mod) y Roar (buff) cada uno double-dipea **solo**, y
juntos dan `(1+Expel+Roar)²`, no `(1+Expel)²×(1+Roar)²`. La matriz ③ del target (vulnerabilidad por
facción×elemento) es un mecanismo **aparte** y single-dipea — no se confunde con el bucket.

**Lo que NO cierra esta decisión:** el **consumo** en código (bucket② + matriz③ en el tick de DoT,
`StatusEngine`) sigue sin implementar — es deuda de implementación, no pregunta abierta. Ver
`status.md §Deudas` y `damage-status-model.md §Reconciliación de resolveHit`.

**Ref:** `damage-status-model.md §Evidencia` (test in-game 2026-07-08); `simulation-architecture.md §2.0`
(bucket②/matriz③); `status.md §Deudas` (`GAMEPLAY_MULT_FACTION_DAMAGE`, consumo pendiente).

---

## DC-OQ-ENGINE-17 — Fórmula de arcanos ability-like: ¿por-arcano o por-familia? — NO BINARIO, ambos caminos coexisten

**Fecha de cierre:** 2026-07-09 (barrido completo del corpus, migrada desde `open-questions.md`).

**Decisión:** la hipótesis original ("varios arcanos comparten forma → familia, no N fórmulas")
**se confirma solo parcialmente.** El barrido completo del corpus `upgrade_type:null` de
`arcane-stats.override.json` (85 arcanos; 34 parkeados por `OQ-DATA-14` — Amp/Operator/Zaw/Kitgun;
51 en scope real) reparte así:

- **2 familias reales (13 casos, ~15% del residuo):** `STACK_DECAY_BUFF` (buff on-event con decay,
  8 arcanos — `arch-decisions.md §11`) y `linearThresholdScale` + `source_attribute`
  (cross-attribute-read con cap, 5 arcanos — `arch-decisions.md §12`).
- **6 casos complejos con `references/wiki/mechanics/arcane-*.md` propio** (Afflictions, Duplicate,
  Influence, Camisado, Persistence, Universal Fallout) — demasiado ricos para generalizar, cada uno
  con su propia fórmula documentada.
- **~30 genuinamente per-arcano** (sin forma compartida) — necesitan fórmula dedicada individual.

**Método que produjo la respuesta:** el mismo que CO/melee-combo (`arch-decisions §9/§10`) — no
diseñar la abstracción antes del corpus; barrer con el corpus real enfrente y dejar que la
familia emerja donde exista. Confirma el principio, no lo reabre.

**Lo que NO cierra esta decisión:** la ejecución (cero código todavía para ninguna de las 2
familias ni para el residuo per-arcano) — es deuda de implementación, no pregunta abierta.
El residuo-tabla completo (ítem por ítem, con datos de escalado por rank verificados contra la
wiki) vive en `docs/data/reports/audit-arcane-sweep.md` (tier referencia).

**Ref:** `arch-decisions.md §11` (`STACK_DECAY_BUFF`), `§12` (`linearThresholdScale`);
`docs/data/reports/audit-arcane-sweep.md` (residuo-tabla); `OQ-DATA-14` (park modular);
`OQ-ENGINE-16` (tensión hermana, sigue abierta — fidelidad de N-declarado, no resuelta acá).
