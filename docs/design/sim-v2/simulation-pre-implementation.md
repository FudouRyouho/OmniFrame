---
Estado: "ratificado"
Rol: "Auditoría de riesgos y validación de datos pre-v2"
Version: "v0.1.0"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-04-21"
Dependencias:
  - "docs/design/sim-v2/simulation-blueprint.md"
Dependidos:
  - "docs/design/sim-v2/simulation-roadmap.md"
---

# OmniFrame Simulation Pre-Implementation

Este documento reúne la estrategia previa a código: evolución futura, riesgos, dependencias mínimas y auditoría estática del ecosistema actual.

---

## 6. Consideraciones Futuras y Estrategia de Evolución

### 6.1 Gestión de Dependencias y Propagación
- **Estrategia de Actualización**: Batch + Orden Topológico.
- **Push vs Pull vs Invalidation**: El motor publica únicamente un evento de `snapshot invalidated`; la UI Bridge decide cuándo realizar el Pull y actualizar sus Signals.
- **Orden de Resolución**: Resuelve el grafo asegurando que los Buffs de habilidades se calculen antes que el daño final de las armas.

### 6.2 Persistencia y Simulación Avanzada
- **Estado de Guardado (Snapshot)**: El motor debe permitir exportar/importar el estado completo de la simulación. Esto facilita funciones de "Comparar Builds" o "Replay" de simulacros de combate.
- **Rewind/Time Travel**: Dado que el motor es puramente funcional y determinista, se abre la posibilidad de implementar un historial de cambios para deshacer/rehacer acciones del usuario.

### 6.3 Estrategia de Testing y Calidad
- **Testing Aislado**: Cada capa (Hidratación, Simulación, Sistemas) debe ser testeable de forma independiente mediante Unit Tests.
- **Snapshots de Simulación**: Se implementarán tests de integración que comparen el "Payload de Proyección" contra resultados esperados (Gold Standard) basados en la wiki oficial.

### 6.4 Escalabilidad Técnica
- **Compatibilidad con Workers**: El motor debe mantener una API serializable. Esto permitirá mover la carga pesada de simulación a un **Web Worker** en el futuro sin afectar la fluidez de la UI.
- **Gestión de Casos Límite**: El sistema de Grafo debe incluir mecanismos de detección de **Dependencias Cíclicas** (ej: Modificador A depende de B, y B de A) para evitar bucles infinitos, cortando la propagación y emitiendo una alerta de integridad.

---

## 7. Pre-Implementación Estática y Pre-Roadmap

Antes de escribir código nuevo del motor, OmniFrame debe pasar por una fase de validación estática. El objetivo no es construir todavía, sino confirmar que el ecosistema actual soporta el patrón propuesto y detectar deuda que bloquearía la implementación.

### 7.1 Objetivo de esta fase
- **Verificar aplicabilidad**: Confirmar que los JSONs, overrides y contratos actuales permiten materializar `Entity`, `Modifier`, `Simulation Context` y `Projection Snapshot`.
- **Reducir retrabajo**: Detectar dependencias mínimas, huecos de datos y ambigüedades antes de tocar `core/engine/`.
- **Cerrar fronteras**: Asegurar que la implementación futura no mezcle responsabilidades entre `lib/`, `core/engine/`, providers y UI.

### 7.2 Dependencias mínimas a validar
- **Data Pipeline local**: `warframes.json`, `weapons.json`, `mods.json`, `arcanes.json` y overrides manuales deben cubrir el ADN mínimo de las entidades base.
- **Hydration Contracts**: La Capa B debe poder resolver un payload consistente sin acoplarse a detalles de presentación.
- **Resolver Inputs actuales**: El modelo legacy de `LoadoutInput` debe mapearse conceptualmente al nuevo modelo sin perder identidad ni slots.
- **Presentation Boundary**: La UI debe poder seguir consumiendo snapshots serializables sin leer internals del motor.

### 7.3 Riesgos a evaluar antes de implementar
- **Huecos de ADN**: Hay entidades cuyo dataset base existe, pero sus comportamientos o stats avanzados dependen de overrides aún incompletos.
- **Condiciones no modeladas**: Mods, arcanos o habilidades condicionadas (`on headshot`, `while aiming`, `on kill`) requieren una taxonomía común antes de codificarse.
- **Ambigüedad temporal**: Algunas mecánicas pertenecen a simulación instantánea; otras exigen ventana temporal. Mezclarlas demasiado pronto rompería el núcleo inicial.
- **Deuda de hidratación**: El runtime actual mezcla cacheo, fetch y merge de overrides; antes del nuevo motor conviene entender qué partes son reutilizables y cuáles son transicionales.
- **Normalización desigual**: No todos los datasets tienen el mismo nivel de fidelidad. El motor no debe asumir uniformidad donde aún no existe.

### 7.4 Orden recomendado de análisis
1. **Entidades base**: Warframe, Weapon, Mod, Arcane, Ability, Target.
2. **Taxonomía de atributos**: Qué atributos son universales, cuáles son exclusivos y cuáles son solo metadata.
3. **Taxonomía de modificadores**: `ADD`, `MUL`, `SET`, caps, floors, condiciones y duración.
4. **Contexto de simulación**: Qué entra por corrida y qué jamás debe persistirse.
5. **Snapshot de salida**: Qué necesita realmente la UI y qué debe quedar como diagnóstico interno.
6. **Propagación**: Qué significa `dirty`, qué se recalcula y con qué granularidad.

### 7.5 Ejemplos de validación estática
- **Caso Rhino + Braton**: Verificar que el ADN del Warframe, el arma y sus mods existe hoy en el pipeline y que el patrón permite expresar `Ability Strength -> Roar -> Final Damage`.
- **Caso Slash/Viral**: Verificar que el snapshot puede representar distribución de procs aunque la simulación temporal completa todavía no exista.
- **Caso dataset incompleto**: Verificar que una entidad con `Hard Dependencies` ausentes produce `blocked`, y con `Soft Dependencies` ausentes produce `partial`.
- **Caso Target Context**: Verificar que `Faction`, `Armor Type` y `Armor Value` pueden modelarse como entrada efímera y no como parte del loadout.

### 7.6 Fases previas a implementación
- **Fase A - Auditoría de datos**: Confirmar cobertura real del pipeline y overrides sobre los casos base.
- **Fase B - Contratos cerrados**: Congelar definiciones conceptuales de `Entity`, `Attribute`, `Modifier`, `Simulation Context` y `Projection Snapshot`.
- **Fase C - Mapa de transición**: Identificar qué piezas actuales del engine y de la hidratación pueden sobrevivir como infraestructura.
- **Fase D - Prototipo en papel**: Simular uno o dos flujos completos sin código nuevo, describiendo entradas, propagación y salida esperada.

### 7.7 Criterio de salida de esta fase
Esta fase se considera cerrada cuando:
- existe una taxonomía mínima estable de entidades y modificadores,
- el equipo entiende qué datos ya existen y cuáles siguen siendo deuda,
- hay al menos dos casos de referencia trazados end-to-end,
- y el riesgo principal deja de ser conceptual para pasar a ser puramente de implementación.

### 7.8 Auditoría estática inicial de entidades

| Entidad | ADN disponible hoy | Puede emitir modifiers | Depende de overrides | Riesgo actual |
| :--- | :--- | :--- | :--- | :--- |
| **Warframe** | `warframes.json`, `passives.json` | Sí | Sí, para habilidades y pasivas ricas | Medio |
| **Weapon** | `weapons.json` | Sí | Parcial, para casos avanzados y formulas no cerradas | Medio |
| **Mod** | `mods.json`, `mod-stats.override.json` | Sí | Sí, fuerte dependencia de override manual | Bajo-Medio |
| **Arcane** | `arcanes.json` | Sí | Parcial, según fidelidad del dataset | Medio |
| **Ability** | `ability-stats.override.json` | Sí | Sí, crítica | Alto |
| **Target** | No existe como dataset runtime formal | No aplica como loadout entity | Requiere contrato propio | Alto |

#### Lectura inicial
- **Warframe** y **Weapon** ya tienen identidad y ADN suficientes para iniciar una simulación instantánea básica.
- **Mod** también es viable hoy porque el proyecto ya considera `mod-stats.override.json` como inteligencia manual prioritaria.
- **Ability** sigue siendo el punto más frágil del sistema: existe data útil, pero depende de consolidación y taxonomía estable.
- **Target** no debe bloquear la fase inicial si se modela primero como `Simulation Context`, no como entidad persistente.

### 7.9 Auditoría detallada: Warframe y Weapon

#### 7.9.1 Warframe

| Aspecto | Estado actual | Lectura para Fase 1 |
| :--- | :--- | :--- |
| **Identity** | `uniqueName` existe y es estable en `warframes.json` | Listo |
| **ADN base** | `health`, `shield`, `armor`, `power`, `sprintSpeed`, `energy`, `initialEnergy` | Listo para simulación instantánea |
| **Behaviors** | `abilities[]`, `passive`, `subsumed`, metadata temática | Parcial; útil para enlazar abilities, no para simulación completa |
| **Hydration actual** | `warframe-data.ts` ya hidrata pasivas e abilities con overrides | Reutilizable como base conceptual para Capa B |
| **Emisión de modifiers** | Hoy solo parcialmente expresada vía stats de warframe y ability scaling | Requiere taxonomía formal de buffs |
| **Dependencia crítica** | `ability-stats.override.json`, `passives.json` | Alta para features avanzadas |
| **Riesgo principal** | Pasivas y habilidades no están aún modeladas como emisores uniformes de modifiers | Medio |

**Atributos mínimos que ya existen hoy**
- Vitales: `health`, `shield`, `armor`, `power`
- Movimiento/base: `sprintSpeed`
- Identidad funcional: `abilities[]`, `passive`

**Modifiers que razonablemente debería poder emitir en el nuevo motor**
- Buffs de estadísticas del propio Warframe (`AVATAR_HEALTH_MAX`, `AVATAR_ARMOUR`, `AVATAR_POWER_MAX`)
- Buffs ofensivos o utilitarios hacia otras entidades desde habilidades
- Debuffs o efectos globales cuando una habilidad altere el entorno de combate

**Dependencias que consume**
- Mods equipados del loadout
- Overrides manuales de habilidades
- Contexto de simulación cuando una habilidad dependa de distancia, target o condición

**Conclusión de viabilidad**
- `Warframe` es viable para Fase 1 como entidad persistente del motor.
- La parte **base** del Warframe está suficientemente cubierta.
- La parte **ability-driven** debe entrar progresivamente y no bloquear la simulación instantánea inicial.

#### 7.9.2 Weapon

| Aspecto | Estado actual | Lectura para Fase 1 |
| :--- | :--- | :--- |
| **Identity** | `uniqueName` existe y es estable en `weapons.json` | Listo |
| **ADN base** | `damage`, `totalDamage`, `criticalChance`, `criticalMultiplier`, `procChance`, `fireRate`, `multishot`, `attacks[]` | Listo para simulación instantánea |
| **Behaviors** | `attacks[]` ya expresa variantes de ataque, AoE, falloff y delivery type | Muy buen punto de partida |
| **Hydration actual** | `weapon-data.ts` carga el dataset y `runtime-deps.ts` lo mapea al resolver | Reutilizable como infraestructura |
| **Emisión de modifiers** | El arma emite resultados de combate más que buffs globales | Válida como entidad consumidora de modifiers |
| **Dependencia crítica** | `mod-stats.override.json` para valores reales de mods y upgrade types | Alta |
| **Riesgo principal** | Parte del shape actual mezcla stats agregados y `attacks[]`, por lo que habrá que decidir qué es canónico en el motor | Medio |

**Atributos mínimos que ya existen hoy**
- Ofensivos: `damage`, `totalDamage`, `criticalChance`, `criticalMultiplier`, `procChance`
- Ritmo: `fireRate`, `reloadTime`, `magazineSize`, `multishot`
- Ataques: `attacks[]` con tipos de entrega y breakdown de daño

**Modifiers que razonablemente debería consumir**
- Daño base/aditivo de mods
- Crit chance / crit damage
- Proc chance / multishot / fire rate
- Buffs externos desde Warframe, Arcane o Contexto de simulación

**Dependencias que consume**
- Mods equipados
- Posibles buffs externos del Warframe
- Target Context para daño efectivo, mitigación y procs

**Conclusión de viabilidad**
- `Weapon` es probablemente la entidad mejor preparada para inaugurar el motor.
- Ya tiene suficiente ADN para producir un `Projection Snapshot` útil incluso antes de modelar timeline.
- El principal trabajo no es de datos, sino de **normalización conceptual** entre weapon-level stats and attack-level stats.

### 7.10 Decisión recomendada para Fase 1
- **Entrar primero con `Warframe` y `Weapon`** como entidades persistentes del núcleo.
- **Consumir `Mod` como fuente de modifiers** desde el primer corte, porque el proyecto ya dispone de `mod-stats.override.json`.
- **Tratar `Ability` como extensión progresiva del Warframe**, no como requisito de entrada para cerrar el motor base.
- **Mantener `Target` fuera del conjunto de entidades persistentes iniciales** y modelarlo primero como `Simulation Context`.

### 7.11 Preguntas abiertas derivadas de esta auditoría
- ¿En `Weapon`, el nodo canónico principal será el arma completa o cada entrada de `attacks[]`?
- ¿En `Warframe`, una habilidad se modela como sub-entidad persistente o como behavior resoluble bajo demanda?
- ¿Las pasivas deben emitir modifiers al cargar la entidad o solo al cumplirse condiciones explícitas del contexto?
- ¿Los caps/floors de habilidades viven en el modifier, en el behavior o en una capa posterior de resolución?

### 7.12 Resoluciones provisionales de diseño

#### 7.12.1 Weapon como nodo canónico principal
**Decisión provisional**
- El nodo canónico de `Weapon` debe ser **el arma completa**, no cada entrada de `attacks[]`.

**Justificación**
- La mayoría de los ataques dependen del ADN base del arma: daño base, crit chance, crit multiplier, proc chance, fire rate y multishot.
- `attacks[]` funciona mejor como una colección de **canales derivados** o **subestructuras internas** de la entidad `Weapon`, no como entidades canónicas separadas en Fase 1.
- Este enfoque reduce complejidad en propagación, porque los modifiers se aplican primero al arma y luego se proyectan a sus ataques.

**Excepción reconocida**
- Hay casos donde un ataque sí se comporta como una estructura más autónoma:
  - armas con modos radicalmente distintos,
  - variantes especiales,
  - Incarnon con comportamiento alterno fuerte.
- Aun así, la recomendación para Fase 1 es mantener esos casos como **subnodos del arma**, no como cambio del nodo canónico.

**Regla provisional**
- `Weapon` = entidad persistente canónica.
- `attacks[]` = subestructura resoluble dentro de `Weapon`.
- Si un caso futuro rompe esa regla de forma sistemática, se reabre como excepción arquitectónica y no como regla base.

#### 7.12.2 Ability no tiene un único modelo ontológico
**Decisión provisional**
- `Ability` no debe modelarse con una única regla rígida. Su naturaleza depende del tipo de habilidad y de lo que materializa dentro del simulador.

**Casos base**
- **Habilidad como behavior resoluble**:
  - buffs,
  - debuffs,
  - escalados internos,
  - efectos sobre stats o contexto.
- **Habilidad como origen de sub-entidad**:
  - exaltadas,
  - invocaciones,
  - objetos persistentes de combate creados por la habilidad.

**Lectura recomendada**
- La habilidad en sí misma sigue siendo un `behavior` del Warframe.
- Pero ese `behavior` puede **instanciar una entidad derivada** cuando la simulación lo requiera.

#### 7.12.3 Caso especial: Exalted
Las exaltadas son el ejemplo más claro de por qué `Ability` no puede reducirse solo a buff o fórmula.

**Lectura provisional**
- Una exaltada sigue siendo, funcionalmente, una **Weapon** para el simulador.
- Pero su existencia depende de una habilidad del Warframe.
- Por lo tanto, el modelo más sano es:
  - la habilidad es un `behavior`,
  - la exaltada es una **entidad derivada** de tipo `Weapon`,
  - y la relación entre ambas debe quedar explícita en hidratación y snapshot.

**Consecuencia arquitectónica**
- El motor debe permitir entidades creadas por behaviors sin obligar a que todas las habilidades sean entidades persistentes por defecto.
- Esto evita forzar la misma ontología sobre buffs simples y sobre armas exaltadas.

#### 7.12.4 Regla provisional para habilidades
- **Ability simple**: behavior resoluble.
- **Ability que crea objeto persistente o actor de combate**: behavior que materializa sub-entidad.
- **Ability exalted**: behavior que materializa una entidad derivada con shape de `Weapon`.

#### 7.12.5 Implicaciones para Fase 1
- No bloquear Fase 1 intentando resolver todas las habilidades con una sola taxonomía.
- Empezar con:
  - `Weapon` como entidad canónica,
  - `attacks[]` como subestructura interna,
  - `Ability` como behavior,
  - y documentar explícitamente que exaltadas e invocaciones abren el primer grupo de excepciones controladas.

#### 7.12.6 Resoluciones Críticas de Rigidez Arquitectónica (Auditadas)
1. **Stat Accumulator v3**: Se desglosa la suma en `BaseFlat`, `BaseAddPct`, `ModsAddPct`, `TotalFlat` y `Multiplicative`. Esto blinda el motor contra el "Spaghetti de Arcanos" y garantiza que el escalado de mods sea siempre sobre la base real modificada.
2. **Attribute-Level Resolve (Graph Convergence)**: El motor resuelve por **Atributo**. Para dependencias circulares, aplica un ciclo de 3 iteraciones (Fixed-Point). Si no converge, congela y emite alerta. Evita cuelgues por recursión infinita.
3. **Differential Timeline Stream**: Sustituye el envío de snapshots masivos por un flujo de deltas + Keyframes opcionales. Reduce el payload de megabytes a kilobytes, eliminando el lag en la UI durante el scrubbing del timeline.
4. **Hybrid Simulation (Expected Value Mode)**: El motor conmuta a un modelo estadístico de agregación cuando la densidad de eventos (ej: escopetas con multishot extremo) supera el umbral de energía. Mantiene la precisión del DPS sin sacrificar el hilo principal.
5. **Layered Logic Decorators**: Se establecen 6 capas de ejecución fijas (desde `INITIAL_OVERRIDE` hasta `FINAL_CLIP`). Elimina condiciones de carrera y garantiza que los "Caps" se apliquen siempre después de los multiplicadores.
6. **Casting Snapshots (Injected DNA)**: Las habilidades "capturan" el estado del padre al momento del casteo. Este snapshot se inyecta como ADN a la nueva entidad, manteniendo la inmutabilidad y la unidireccionalidad de datos.
