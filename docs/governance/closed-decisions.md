---
Estado: "referencia"
Rol: "Registrar decisiones de arquitectura cerradas que no deben reabrirse sin evidencia nueva"
Version: "v0.0.2"
Impacto_ID: "G-ADL-Closed"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-27"
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

