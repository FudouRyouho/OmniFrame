---
Estado: "activo"
Rol: "Definición de macro y micro arquitectura del motor de simulación v2"
Impacto_ID: "E-01"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-20"
Fecha_de_actualizacion: "2026-08-08"
Dependencias:
  - "docs/domains/engine/design/simulation-blueprint.md"
Dependidos:
  - "docs/domains/engine/design/simulation-contracts.md"
---

# OmniFrame Simulation Architecture

Capas horizontales con comunicación vertical estricta: cada capa es completa en su nivel de abstracción y solo se comunica hacia abajo (computar) o hacia arriba (proyectar).

---

## 1. Macro-Arquitectura: El Flujo de Verdad

```
┌─────────────────────────────────────────────────┐
│  A — INTENCIÓN                                  │
│  Scene — el escenario y sus grupos              │
└───────────────────┬─────────────────────────────┘
                    │ snapshot de intención
┌───────────────────▼─────────────────────────────┐
│  B — COMUNICACIÓN                               │
│  MutatorBridge                                  │
└───────────────────┬─────────────────────────────┘
                    │ MoldedIntent[] (el espacio con sus moldes)
┌───────────────────▼─────────────────────────────┐
│  C1 — ENGINE (resolve/)   C2 — SIMULATION       │
│  SimulationEngine         CombatCalculator      │
│  StaticHydrator           TimelineSimulator     │
│  ModRepository            CombatSimulator       │
└───────────────────┬─────────────────────────────┘
                    │ snapshot(): SimulationEntity[]  (salida de C, output/consume.ts)
┌───────────────────▼─────────────────────────────┐
│  D — PROYECCIÓN                                 │
│  ViewModelContract v0 (display-only/C1)          │
│  @shared/view-model + useViewModel (@providers)  │
└─────────────────────────────────────────────────┘
```

> **Nomenclatura:** la salida cruda de C es `snapshot(): SimulationEntity[]` y las **métricas de
> combate** cristalizan en `CombatMetrics` (`output/combat-metrics.ts`, contrato neutro particionado por
> dependencia-de-target) — ver `DC-OQ-ENGINE-8`. La **Capa E** (ViewModel intermedio) está **descartada**
> (`DC-OQ-ENGINE-10`): no hay capa entre D y la UI; D se lee por dos lentes de salida (D1 UI /
> D2 CLI) y la hidratación de chrome viene del piso "0". Residual editorial: el rename de `ViewModelContract`
> (cut C→D display) sigue diferido (`DC-OQ-ENGINE-8` §residual).

---

### Las dos intenciones del usuario

El sistema recibe dos tipos de intención del usuario, con ciclos de vida independientes:

| Intención | Contrato | Quién la produce | Destino |
|---|---|---|---|
| **Equipamiento** | `Scene` | quien arma el escenario (fixtures, CLI; la UI aún no) | B → C1/C2 |
| **Contexto de simulación** | `SimulationContext` | Arsenal State (UI) | B → C1/C2, D |

**`Scene`** responde "¿quiénes participan y con qué?". No cambia si el usuario activa o desactiva una condición.

**`SimulationContext`** responde "¿cómo quiero ver el resultado?". Arsenal State lo construye derivando las condiciones disponibles de la propia `Scene`: si Galvanized Savvy está equipada, Arsenal State sabe que existe la condición asociada y la incluye en `flags`. El engine no infiere condiciones — las recibe ya construidas.

**Estado inicial (simplificación estática):** `flags` = todas las condiciones derivadas del equipamiento en `true`, `variables` = todos los stacks al máximo. A medida que el modelo evolucione, el usuario podrá controlar condiciones individuales y cantidad de stacks desde la UI.

**`SimulationContext` como punto de variabilidad de C2:** C2 no tiene sub-modos. Lo que varía es la riqueza del contexto:
- Mínimo (flags derivadas del equipo, sin enemigo) → resolución "todo activo al máximo"
- Completo (enemigo + timeline) → simulación con DoT y TTK

La capa, el contrato y el flujo son idénticos en ambos casos.

---

### Capa A: Intención (EnsembleStore)

- **Naturaleza**: Dos preocupaciones horizontales bajo el mismo concepto:
  - **EnsembleStore** — contenedor reactivo (observable agnóstico de framework). Reacciona a acciones explícitas del usuario (equipar ítem, asignar mod). Es proactivamente reactivo: no sabe de UI interna, pero emite snapshots cuando el usuario actúa.
  - **Scene** — contrato de datos puro (POJO tipado). Declara **quién participa** en dos grupos (`squad` ⊥ `hostile`) y qué porta cada uno; el portador contiene lo que se le monta.
- **Responsabilidad**: Almacenar la intención del usuario como datos puros. No contiene lógica de juego ni fórmulas.
- **Contrato**: `Scene` — ver `@shared/types/scene.ts` (+ `scene-compose.ts`, las primitivas que derivan un participante de otro).
- ⚠️ **El store todavía escribe la forma vieja** (`EnsembleIntention`, `@shared/types/ensemble.ts` — marcada `@deprecated FORMA ESTACIONADA`). El motor consume `Scene`; quien la arma hoy son los fixtures y el CLI. Ese desfase **es** la razón por la que D1 está desconectada (`providers/Ensemble/use-view-model.ts`) y se cierra con la mudanza de la hidratación (`OQ-ENGINE-36`).
- **No conoce**: fórmulas del engine, contexto de simulación, cómo la UI se renderiza.
- **Físico**: store `ensembleStore` en `@core/intention/ensemble-store.ts`; binding React `EnsembleProvider` en `providers/Ensemble/` (composición).

> **Edge cases (ej: armas exaltadas):** Cuando una habilidad activa un arma exaltada (Excalibur, Valkyr), la intención debe reflejar ese cambio de estado sin que sea una selección directa del usuario. Este caso no está resuelto hoy — es una preocupación de diseño pendiente en Capa A.

#### Qué contiene A: **el escenario y los participantes**

Lo de arriba describe **cómo** vive A (contenedor + contrato). Esto describe **qué** hay adentro, que es
un eje distinto.

**A entrega un mundo completo; B lo hidrata; C computa.** No hay paso intermedio: meter una capa entre
A y B convertiría `A → B` en delegación en vez de hidratación.

##### El escenario es **el cero y el contexto de instanciación**. Nada más.

Criterio, aplicable sin discutir:

> **Sacá todos los participantes. Lo que queda es el escenario.**
> Pero preguntá por **la regla, no por su número**: si el número cambia según quién actúa, es del actor.

| Cosa | ¿Sobrevive sin participantes? | Dónde vive |
|---|---|---|
| *Que exista* un cap de stacks | sí | la mecánica ([`arch-decisions.md`](arch-decisions.md) §17) |
| *Cuánto vale* ese cap | **no** | el participante (§17) |
| El instante cero | sí | **escenario** |
| Qué loadout se instancia (archwing ⊥ misión normal) | sí | **escenario** |
| Nivel · facción del objetivo | no | el participante |
| **Steel Path** | **no** | el participante |

*Steel Path parece del ambiente y no lo es: sólo modifica stats del enemigo — sin enemigo no significa
nada.* En cambio un archgun **no es el mismo** desplegado desde el warframe que entrando por
railjack/archwing: **el escenario no lleva parámetros de mecánica — decide qué participantes existen y
con qué forma.**

**Al escenario no le queda nada que el usuario declare directamente, y tampoco le quedan leyes** (son de
las mecánicas, no del mundo). Lo que el usuario declara son los participantes y sus condiciones — la
partición de §*Las dos intenciones del usuario*.

**Y el contrato lo refleja.** `Scene` declara `hostile: HostileIntent[]` —el grupo, con
el nivel adentro de cada participante— y **`environment` no existe**: no se reemplazó por otro campo,
porque el escenario es el todo y no un rincón adentro del todo. `targetFaction` no sobrevivió (se
deriva de qué enemigo elegiste) y **`isSteelPath` tampoco**: el dataset no trae su bonus —0 de 638
enemigos—, y declarar un campo sin dato es fabricar el mismo campo mudo que esta partición vino a
eliminar. Que Steel Path sea del participante ya está decidido; entra cuando el dato exista.

##### El cero: **un origen declarado, N ventanas derivadas, todas en el mismo reloj**

El caso que lo prueba es el que parecía complicarlo: *si Roar está activo durante el DoT da un número;
si se desactiva a mitad, otro*. Esa pregunta **sólo tiene respuesta si el cero es único** — con un cero
por entidad son dos escalas sin conversión posible.

Lo que cada cosa tiene no es un cero propio sino una **ventana** (cuándo empieza, cuánto dura),
expresada en el reloj común y **derivada** por composición (duración × mods), no declarada. *"El
proyectil llegó en 1,2 s"* no es el cero de la habilidad: es un evento a los 1,2 s del único reloj.

> **El stat de duración es un nodo. La ventana que produce, no.** El `+X% Ability Duration` compone
> buckets como cualquier atributo; la ventana resultante es el producto de aplicarlo, y vive en el reloj.

**Está en A aunque hoy sólo lo consuma C2**, y eso no es una excepción: C1 no lo usa porque no construye
timeline, no porque no lo tenga. Para C1 su presencia significa *"el escenario está cargado"* y nada
más. Hoy C2 lo improvisa con un `let currentTime = 0` local.

##### Qué es un participante: **declarado ⊥ derivado**

| Declarado *(lo único que el usuario dice)* | Derivado *(todo lo demás)* |
|---|---|
| **qué entidad es** — una referencia | su composición: nodos, atributos, valores |
| **en qué estado está** — Roar activo, a media vida, a 30 m | sus **marcas**: de qué lado está, de quién es · lo que recibe y lo que emite |

La distinción no admite excepción: *"este mod funciona así"* o *"Roar alcanza al arma"* **no lo declara
nadie** — lo resuelve el motor. Las marcas son derivadas igual que el resto: que el warframe lleve
*mío* sale de haber entrado por el loadout; que un enemigo bajo mind control cambie de bando sale de una
habilidad.

**Por qué "participante" y no clases por especie.** Una entidad **no *es* un bando: lo porta como
marca**. El caso que lo decide es el mind control — con estructuras separadas, Nyx obligaría a migrar
una entidad de una a otra en mitad del cálculo; con marcas cambia una etiqueta y no se movió de lugar.
Y está medido que la herencia por especie produce miembros falsos: cuando el compañero se normalizaba
*"igual que un warframe"*, un Kavat tenía fuerza y eficiencia de habilidad en 100.

*(Eje ortogonal al de §2.1 `PE`/`TE`, que clasifica por **ciclo de vida**, no por qué se declara.
Conviven.)*

##### De dónde salen los participantes: **pobladores ⊥ derivación**

- **Pobladores** — traen participantes declarados. El loadout del jugador es uno; el catálogo de
  enemigos es otro. Son las puertas de entrada.
- **Derivación** — un participante trae a otro: una invocación, un specter, el compañero. No es una
  puerta nueva: **cuelga de alguien que ya está**.

En una escuadra cada jugador es poblador de lo suyo, y lo que invoca cuelga de él por propiedad — el
mismo árbol de [`arch-decisions.md`](arch-decisions.md) §18.

> **`A1` y `A2` no son capas** y no existen en el código como tales. Sobreviven sólo como nombres de
> conveniencia para hablar de **dos pobladores**.

##### Los dos pobladores **no son espejos** — y ninguno declara menos que el otro

Los grupos son **bandos**: `Squad` y `Hostil`. Dentro de un grupo todos son aliados, entre grupos son
enemigos. El grupo es lo que impide que un warframe y un enemigo se mezclen — no por un `if` que los
separe después, sino porque **nacen de puertas distintas del escenario**.

Cada uno declara con la forma que su naturaleza pide, y eso no los hace desiguales:

| Grupo | Qué declara el usuario | Qué produce |
|---|---|---|
| **Squad** | un loadout: warframe, armas, mods, arcanos, compañero | participantes con composición interna |
| **Hostil** | qué enemigo, a qué nivel, si es Steel Path | participantes con **su propia** cadena de composición |

La cadena del hostil no es la pobre: [`enemy-level-scaling.md`](../../../../references/wiki/mechanics/enemy-level-scaling.md)
la tiene entera y con orden de operaciones — base de la unidad → Steel Path flat → Empowered flat →
Eximus → Steel Path ×2.5 → Empowered ×N → **recién ahí** la curva de nivel. Siete pasos, tan
estructurados como el `Base × (1 + Mods%) + Flat` del jugador. **Espejar sería inventarle un loadout
vacío al enemigo o un nivel al arma** — de ahí salen los `if` que [`arch-decisions.md`](arch-decisions.md)
§18 prohíbe. Derivar es que los dos entren por la misma puerta con el contenido que les toca.

De ahí que **nacer sea estar compuesto**: un enemigo no se escala después de existir, igual que un
warframe no nace desnudo para que le pongan los mods encima. Su nivel y su Steel Path son parte del
frame-0, no una capa posterior.

**El grupo provee la marca.** Un participante nace con la marca de su bando puesta por el grupo del que
salió, no inferida después. No compite con el ruteo por familia de §18: el grupo declara **de quién es**
un participante, el token declara **a dónde va** un efecto. Pertenencia ⊥ destino.

**Consecuencia operativa: emite un solo bando.** Ningún participante hostil porta mods ni fuentes
propias, así que el portador de cualquier modifier es del Squad. Por eso un efecto que cruza bandos **no
necesita computar el bando del emisor**: la familia del token ya declara el destino (`ENEMY_*` cruza,
ninguna otra). Es lo que hace innecesaria una tabla `alcance × bando`, que con un solo emisor tendría
una sola fila útil.

⚠️ **Eso no sale de que el hostil declare menos** — sale de que **no modelamos el daño hacia el
jugador**. Es un recorte de alcance del proyecto (simular builds, daño y sinergias desde la perspectiva
del jugador), no una propiedad del modelo de entidades ni una ley del juego. Cae el día que un
participante del otro bando **emita**: un aliado NPC con loadout propio, o una entidad bajo mind control
que además porte fuentes. Que la marca de bando cambie ya está resuelto (es una marca,
§*Qué es un participante*); lo que no está resuelto es que el **emisor** pueda no ser del Squad.
Registrado, no construido — `OQ-ENGINE-31` lleva el eje.

##### El plano: **cuántos hay depende de dónde están** (`OQ-ENGINE-35`)

El concepto admite N participantes por grupo —`Squad` = uno o más jugadores, `Hostil` = uno o más
enemigos de uno o más tipos— y la construcción declara uno de cada lado. No es simplificación perezosa:
**poblar N sin un lugar donde ubicarlos repite el error que esta partición vino a corregir**, construir
los pobladores antes que el lugar donde pueblan. Tres Bombards sin posición son tres clones que ningún
cómputo puede distinguir; el problema nunca fue la cantidad sino *dónde está cada uno*.

El hueco tiene rastro medible: el motor ya computa **distancia sin espacio donde medirla** — el
`falloff_mult` sale en cada corrida de métricas, y el modelado melee arrastra *"slam-por-distancia
(falta dato)"* (`OQ-ENGINE-14`). La forma de la declaración no debe impedir el segundo participante;
poblarlo espera al plano. Registrado, no construido.

##### El escenario consolidado: **la foto de t=0**

A termina en un mundo resuelto y quieto: todos los participantes existen, cada uno con sus números ya
compuestos, y lo que cruza entre ellos ya aplicado. Nadie disparó, no pasó un segundo.

**De esa foto nace el estado.** Lo que evoluciona en el tiempo no es "el enemigo": es el escenario
consolidado dejado correr. Por eso el contenedor de estado resulta **entidad-neutral por consecuencia**
y no por un refactor aparte — nace de un participante resuelto, y un participante resuelto ya es neutral.

**Y la foto es lo que el tiempo golpea.** `EntityState` recibe el participante resuelto y lee de él sus
tres vitales; no hay un objetivo paralelo. El camino que había —un orquestador que componía un
`ScaledEnemy` desde el dato crudo— **no existe más**: coincidía con el frame-0 al decimal porque usaba
las mismas primitivas, y divergía en lo único que importaba, que es lo que el escenario agregó encima.

La medición que lo cierra es el mismo build con y sin Corrosive Projection, contra el Bombard que
declara: `armor 2700 → total_damage 227` sin el aura, `armor 2214 → 421` con ella. Por el camino viejo
los dos daban **exactamente 1716**, midiendo contra un enemigo que el escenario nunca declaró.

De ahí caen dos cosas que no hubo que construir aparte: el contenedor de estado quedó **entidad-neutral**
(lo único que lo ataba a "enemigo" era el objeto paralelo), y el nivel dejó de poder divergir entre las
capas — antes un build que declaraba 100 corrido con `--lvl 50` daba C1 a 100 y C2 a 50.

---

### Capa B: Comunicación (MutatorBridge)

- **Naturaleza**: unidireccional — solo baja (intención → engine), no sube. **Y ya no traduce**: la `Scene` no se re-shapea en el camino.
- **Dos entradas:** recibe la `Scene` desde Capa A **y** `SimulationContext` desde Arsenal State (UI). No construye el contexto — lo recibe ya formado y lo reenvía al engine junto con los participantes.
- **Responsabilidad — una sola cosa, en un solo recorrido:** `attachMolds(scene)` → `MoldedIntent[]`.
  - **Quién participa** lo decide el espacio (`resolve/hydration/space.ts`, `populateFromScene`): recorre los dos grupos y emite un intent por participante, con su canal y sus marcas de ruteo.
  - **Qué ES cada uno** lo dereferencia B: `DnaRepository` → `MutatedDNA`, colgado del intent. Un participante declarado que no se puede hidratar **tira**, nombrando el dataset que falta.
  - **Positional Mapping**: el orden de slots de mods se conserva tal cual para el Elemental System de C1; la guarda `assertSlotKeys` rechaza una clave que no sea índice entero.
- **Lo que dejó de hacer, y por qué importa.** Construía un `Ensemble` intermedio que —medido campo por campo— **no computaba nada**: renombraba (`uniqueName`→`id`, `mods`→`slots`, `{uniqueName,effectId,isTauforged}`→`{type,stat,is_tau}`) y arrastraba cuatro campos que nadie leía (`warframe.rank` con un `?? 30` inventado, `abilities[].rank`, `helminth`, `focus`). Su costo no era el código: **hacía pasar por *"el engine no lo modela"* cosas que el engine sí modelaba** pero que esa forma no tenía dónde poner — el arma de compañero (hoy poblada, canal `companion_weapon`) y el archgun (al que sólo le falta que `DataLoader` lea un `.json` que ya está en `public/data/`).
- **DNA Mutation Step**: Archon Shards implementados (OQ-ENGINE-4 cerrado) — viajan en el intent y `StaticHydrator` los resuelve vía `ShardRepository`. Helminth sigue sin implementar.
- **No conoce**: React, UI, cómo las fórmulas funcionan internamente. No decide qué condiciones están activas.
- **Físico**: `Project/src/core/bridge/MutatorBridge.ts` (fuera de `engine/` — B no es C). ⚠️ El poblador vive en `engine/resolve/hydration/space.ts`, o sea **físicamente adentro de C**. Es ubicación heredada, no decisión: `@core` sólo tiene `bridge/` con un archivo e `intention/` con otro, así que todo lo demás creció en `engine/`.

---

### Capa C1: Engine (Fórmulas Puras)

- **Naturaleza**: Motor matemático funcional y determinista. No tiene estado mutable.
- **Responsabilidad**:
  - Recibe de Capa B los participantes ya poblados y con su molde (`MoldedIntent[]`) más el `SimulationContext`.
  - Construye el grafo reactivo de atributos (`AttributeNode` por entidad).
  - Resuelve el grafo mediante Topological Sort + Fixed-Point fallback.
  - Emite entidades con atributos completamente resueltos.
- **No conoce**: tiempo, enemigos, entorno de combate, UI.
- **Contrato de AttributeNode**: ver `docs/domains/engine/attribute-node-contract.md`
- **Físico**: `engine/resolve/SimulationEngine.ts` + `engine/resolve/hydration/{StaticHydrator, ModRepository, DnaRepository, ItemRepository (segmentado weapon/warframe, Slice C), ShardRepository, IncarnonRepository, ArcaneRepository, DamageCombiner}.ts`.

---

### Capa C2: Simulation (Entorno Reproducible)

- **Naturaleza**: Aplica el resultado de C1 en un escenario reproducible con contexto. **Consume** la salida de C1 (no la re-compone); la extiende con tiempo/target/RNG. Principio **C1 compone, C2 realiza** — ver §2.0.1.
- **Responsabilidad**:
  - Recibe las entidades resueltas de C1 + `SimulationContext` (flags de condiciones, variables de stacks, target opcional, distancia).
  - Resuelve daño final, procs de estado, líneas de tiempo. El nivel de detalle depende de la riqueza del `SimulationContext` recibido — no de sub-modos internos de C2.
  - Emite métricas de combate (DPS, TTK, status weights). *(Las métricas fluyen a `CombatMetrics` — el contrato de salida único cristalizado (`output/combat-metrics.ts`, particionado `target_agnostic`/`vs_target`), ver `DC-OQ-ENGINE-8`. El modelo de daño/status de C2 vive en `design/damage-status-model.md`.)*
- **No conoce**: UI, intención del usuario, cómo se presentan los resultados.
- **Distinción clave con C1**: C1 resuelve *qué vale cada atributo*. C2 resuelve *qué pasa en el juego con esos valores*.
- ⚠️ **C1 → C2 no es una línea de capa: es `C1 → C1 + C2`.** C2 **no puede trabajar sin C1** — no son piezas desacopladas que se comuniquen por un contrato reemplazable, es el mismo cómputo extendido con tiempo, target y RNG. Consecuencia práctica: **lo que la Capa A carga para C2 también está cargado para C1**; que C1 no lo use (el cero, por ejemplo) no lo vuelve ajeno a C1 — significa que C1 no construye timeline, no que el dato no esté.
- **Físico**: `engine/simulate/combat/{CombatCalculator, CombatSimulator, AtomicSimulator, TimelineSimulator, RngProvider}.ts` + `engine/simulate/enemies/{EnemyRepository, EntityState}.ts`. (El proc/DoT lo modelan los `EffectBehavior` sobre `EntityState`.)

---

### Capa D: Proyección (Reactive View Bridge)

- **Naturaleza**: Capa de transformación y presentación reactiva. Solo sube (snapshot → UI).
- **Responsabilidad**:
  - Recibe el snapshot resuelto de C (`consume().snapshot(): SimulationEntity[]`).
  - Transforma el snapshot en una estructura que la UI puede consumir sin conocer internos del engine (`project()` → `ViewModelContract`).
  - *(Pendiente)* Gestiona la granularidad reactiva: emitir solo los nodos que cambiaron respecto al snapshot anterior (diff).
  - Expone los buckets de `AttributeNode` estructurados para la vista de "sheets" (contribución de mods por capa de fórmula).
- **No es el Observer de v1**: el Observer era externo y para debug. La Capa D es parte del flujo de presentación.
- **No conoce**: fórmulas del engine, lógica de simulación.
- **`view_mode`** *(diseñado, no implementado)*: `"classic"` expondría solo `AttributeNode.final`; `"advanced"` los buckets completos con atribución por fuente. Mismo cálculo de C1 — distinta profundidad de exposición.
- **Estado actual**: **`ViewModelContract` v0 (display-only/C1) materializado** — `project()` en `@shared/view-model` (snapshot crudo → `token·value·unit·category`), consumido por **D1** (`UpgradeView` vía `useViewModel` en `@providers`) y **D2** (oráculo CLI, `npm run oracle -- view`). Ningún dominio importa `@core`.
- **Pendiente**: versión reactiva completa (diff tracker, granular emitters), `metrics`/A2 (C2). *(El contrato de salida de métricas ya cristalizó como `CombatMetrics`, `DC-OQ-ENGINE-8`; el rename residual de `ViewModelContract` display queda diferido.)* *(La **Capa E** intermedia está descartada — `DC-OQ-ENGINE-10`; la hidratación de chrome viene del piso "0", no de una capa entre D y la UI.)*

> **Salida de C ≠ Capa D (frontera de dominios):** `consume()` (en `@core/engine/output/`) es el **punto de salida de C** — superficie del dominio engine, consumida directo por **scripts y tests (no-dominios)**. **No es la Capa D.** La Capa D (consumo derivado: `ViewModelContract` + mapping) vive **fuera** de `@core` y cruza por `@shared`; los dominios no importan `@core` (Restricción 1). Ver [`arch-decisions.md`](arch-decisions.md) §6-7.
>
> **Primer cliente real (no-UI):** el CLI oráculo (`scripts/oracle/`) consume `consume()` y, en modo `view`, `project()` — es el cliente que `OQ-ENGINE-FUTURE` ponía como condición para materializar D. Su output fue el material del que se derivó `ViewModelContract` v0.
>
> **Estado:** `A→B→C→D→UI` coherente con D v0 (display-only), leído por dos lentes (D1 UI / D2 CLI). La confluencia info+chrome la resuelve la UI leyendo el piso "0" + `lib/format`; la **Capa E** intermedia se **descartó** (`DC-OQ-ENGINE-10`).

> **Regla clave:** el engine no expone signals ni objetos reactivos propios. La reactividad vive exclusivamente en Capa D, no en C1 ni C2.

---

## 2. Micro-Arquitectura: El Modelo de Entidades (Reactive Attribute Graph)

OmniFrame opera como un motor de juego simplificado. Todo objeto en el sistema es una **Entidad** conectada a un **Grafo Reactivo de Atributos**.

### 2.0 El trazado de una instancia de daño (source-agnostic)

> **Reconciliación.** Las facetas del ciclo de vida de una instancia de daño estaban
> **dispersas** en §2.1 (TE), §2.5 (modo Expected/atómico), §2.6 (capas decoradoras) y §2.7 (Casting
> Snapshot) — varias "diseñado-no-implementado". Esta sección las unifica en **un trazado único**. Es
> **ortogonal** al flujo macro A→B→C→D (§1): aquél es equipamiento→proyección; éste es el ciclo de vida
> de una **instancia** dentro de C. No lo reemplaza.

**Principio rector — desacople emergente, no capas preventivas.** Una etapa/separación se agrega **sólo
cuando una mecánica real la fuerza**, nunca para prevenir. Separar sobre dato-sin-modelar *genera* drift
(lo contrario del objetivo). Y el costo es asimétrico: **desacoplar después es barato mientras lo que se
mueve sea una función pura** (`scaleHealth`/`scaleArmor` se reubicaron en un move; su viejo orquestador
no, porque alimentaba un camino paralelo entero y arrastraba a `EntityState` y sus tests — lo que
terminó de resolverlo no fue moverlo sino **borrarlo**, una vez que el estado nació del escenario),
**refactorizar lo enredado es caro** — `simulateAttack` (que fusiona
ejecución del Hit + ② + invocación de ③ + elección de paradigma en una god-function, abajo) es la evidencia
viva de lo segundo.

**El trazado — 3 etapas:**

```
[C1 ya resolvió los stats de la fuente (§2.3 accumulator). La instancia nace DESPUÉS de C1.]
        │
① NACE                una fuente emite instancia(s):
                      · arma      → perfil (§2.1 AttackProfileRegistry) + multishot (N instancias)
                      · habilidad → cast + ADN inyectado (§2.7 Casting Snapshot)
                      · proc/DoT  → TE (§2.1)
                      cada instancia lleva magnitudes base por tipo + un snapshot CONGELADO de los
                      stats de su fuente (§2.7 es el caso ability; para arma el snapshot es el entity C1).
        │
② COMPONE-TRAYECTO    transforms DETERMINISTAS sobre la instancia, source-agnostic. Todos conmutan
                      → UNA sola etapa (sub-clasificación interna, NO sub-etapas):
                      · sinergia externa        (Roar ×, mods de facción Expel/Bane, arcanos final-crit-damage)
                      · mutación contextual     (falloff por distancia)
                      · aplicación del crit
                      Modo promedio (build-calculator, averageCritMultiplier) vs tirada (timeline,
                      resolveCritTier) = eje §2.5 (Expected/Atómico) + arch-decisions §8 (input→simulado).
                      El modo NO cambia la etapa.
        │
③ RESUELVE-VS-TARGET  física del target-entidad EN `t` — target-keyed, NO innata: buena parte de ③ es
                      estado temporal. Source-agnostic, keyed en el TARGET (no en el trayecto):
                      bonificación de facción · DR de armadura (post-strip) · ruteo/bypass de capa
                      (shields/health, Toxin bypass, Slash=True) · multiplicadores de stacks de status ·
                      Damage Vulnerability · caps/floors.
```

**Fronteras que el trazado clarifica:**

- **C1/C2.** La "mutación" de stats es C1 (§2.3); ①②③ son C2. Ninguna etapa del trazado re-resuelve el grafo.
- **§2.6 = orden de resolución de un STAT (C1), NO del daño-vs-target.** La línea "POST_MUL: Faction damage
  adjustments" que §2.6 lista pertenece en realidad a **③** (propiedad del target, C2), no a un decorador de
  stat. Se separan los dos órdenes (deshace el muddle histórico).
- **② vs ③ = trayecto vs contexto-target.** ② es lo que la instancia acumula/lleva hasta llegar
  (instance-keyed); ③ es lo que el target le hace (target-keyed). Una "sinergia sobre el target" (ej. el
  target tiene Viral → recibe más) es **③**, no ②. **El criterio es operativo y está medido:** en el tick
  de DoT ② se eleva al cuadrado y ③ no — Roar `×1.6²` contra Reap `×2.00` en la misma tirada
  (`references/ingame-tests/damage-buckets.md` Test 7). Dos efectos con la misma forma `+X% daño` caen en
  buckets distintos; la pertenencia **se mide**, no se infiere de cómo se lee el efecto.
- **③ vive como auxiliares de la ENTIDAD-target**, source-agnostic — cualquier fuente (arma, habilidad, tick)
  llama las mismas. DR es entidad-level (con variantes: enemigo `√3a/100`, jugador `armor/(armor+300)`);
  encerrarla por tipo de entidad fue el origen del bug de `resolveHit` (usa la DR del jugador sobre enemigos).

**El split ②③ ya está en el código; el drift restante es `simulateAttack`.** La
resolución ③ (target-keyed: facción/DR/capa/stacks) vive limpia en `resolveDamageEvent` (extraída,
agnóstica al origen — lo comparten el hit directo y el tick de DoT); ② (crit) se aplica upstream en
`simulateAttack`; la Instancia (§2.0.1) ya nace target-agnóstica. `resolveHit` quedó como **fan-out por tipo**
sobre `resolveDamageEvent`, no como el colapso ②③ que este párrafo describía antes. Lo que sigue enredado es
**`simulateAttack` como god-function**: fusiona ejecución del Hit (rolls multishot/crit) + ② + invocación de ③
+ **elección de paradigma** (atómico vs bulk por `HYBRID_THRESHOLD` escondido — el eje consecuencia/predictivo
sin identidad). Darle a ② **identidad-de-objeto** (una etapa COMPONE-TRAYECTO reutilizable) es **gated — sin
consumidor que lo fuerce hoy**: el crit ya está centralizado en `crit-base`, el falloff tiene un solo hogar
(`CombatCalculator`, gated por `OQ-ENGINE-7`), y Roar/Bane (la sinergia externa que ② nombra) no existen aún.
Se difiere hasta el forcing-case (1ª sinergia externa, o falloff-en-timeline). Separar el paradigma = Opción C,
ver `decision-frontier §4`.

**Estado.** El trazado es el **objetivo** de arquitectura; la implementación actual (`CombatCalculator`/
`resolveHit`) aún no lo sigue. La **salida** del trazado (métricas C2) ya tiene un **consumidor real** (oráculo
`metrics`, materializó `DC-OQ-ENGINE-8` — contrato `CombatMetrics` cristalizado); la **entrada** (el objeto que baja la
composición de C1 a la realización de C2) se cristaliza en §2.0.1.

### 2.0.1 La Instancia como objeto (el seam C1→C2)

> **Decisión de arquitectura.** El trazado de §2.0 es un **ciclo de vida**: la instancia **nace** (potencial),
> el Hit la **ejecuta**, la Aplicación **deposita** un hijo (proc) que migra al target con su propio ciclo, y
> **D consume la historia** de esos ciclos — el frame-0 = la composición de C1; los deltas = la realización de
> C2 (`§5.5`, Initial Snapshot + deltas). Ese ciclo se materializa en **un objeto Instancia construido UNA vez
> en el seam C1→C2**, no re-derivado por cada proyector. Ese objeto es `deriveInstance` (`damage-instance.ts`):
> `CombatCalculator`, `CombatSimulator` y `TimelineSimulator` lo **CONSUMEN**, ya no re-extraen de `attributes`.
> `HitContext` quedó como una **vista angosta** (subset de la Instancia) que los DoT behaviors consumen. Lo
> que la Instancia todavía NO materializa es el **status-spec** (`procWeights`): se deriva on-the-fly en cada
> proyector vía `expectedProcEvents` — completarlo es trabajo abierto (`formulas-integration.md §2`).

**Principio rector — C1 COMPONE, C2 REALIZA.** C1 compone *cuánto vale cada cosa*; C2 realiza *qué pasa con
esos valores en el tiempo, contra un target, con RNG* — lo único que C1 estructuralmente no puede. **C2 consume
la salida de C1 — la llama y la extiende — NUNCA re-compone.** Del lado source, C2 tiene **un solo upstream: el
output de C1** (del lado target tiene su propio input, el enemigo; eso ES la extensión:
`C1-output ⊕ target ⊕ tiempo ⊕ RNG`). Donde C2 hoy reconstruye lo que C1 ya compuso (`elementBonusPct` vía
`final/base` — con el double-count de Serration como huella, `moddedBase` sumado a mano, `status_map`
recalculado) es **deuda de re-implementación**: el fix sube a lo que C1 emite, no a reconstruir mejor.

**Tres entradas, no una** (el átomo separado del throughput separado del target):
- **Instancia** — potencial de UN disparo (①②): daño por tipo (congelado), spec de crit, spec de status
  `{chance, forced}`, multishot, bonus por elemento, snapshot del source + **stamp** de procedencia.
  **Target-agnóstica**; **congela valores, no refs** — lo que queda del lado vivo lo evalúa el tick al
  emitir, y dónde cae exactamente esa frontera es `OQ-ENGINE-20`.
- **Schedule** — la cadencia/fire-mode (auto/charge/beam/burst) que **produce** Instancias en el tiempo
  (`fire_rate`/`mag`/`reload`). Multishot = 1 Instancia · N Hits; burst-x3 = N Instancias.
- **Target** — la física del enemigo **en `t`** (③): facción/DR/capa/stacks/`Damage Vulnerability`. **Input
  propio de C2**, no de C1.

**Consecuencias estructurales:**
- La Instancia target-agnóstica **ya habilitó** la separación ②③: la física del target vive en
  `resolveDamageEvent` (③, extraído), no dentro de la Instancia. El drift restante no es `resolveHit` sino
  `simulateAttack` god-function (arriba) — y darle identidad a la etapa ② es gated (sin consumidor hoy).
- El **contrato C1→C2** (qué emite C1 para consumo de C2, no solo para display) es el cimiento **simétrico al
  contrato de salida C2→D** (`DC-OQ-ENGINE-8`, ya cristalizado): ambos = *emitir rico para el consumidor*. Diseñarlo mata la re-implementación.
- **Hueco estructural único que esto deja abierto:** el **`source-state` vivo** (buffs con duración, combo)
  contra el que la Instancia se deriva **no existe** todavía — el target tiene su columna (`EntityState`), el
  source no. Para arma sin buffs live, `source-state = la entity estática de C1` (funciona hoy). Propuesta de
  horizonte (`decision-frontier §4`): un **`NeutralState` base (objeto-de-estado)** del que derivan los estados
  por naturaleza del nodo (source/target/minion/object); **consumidor-puente = la cadena `warframe→weapon→enemy`**
  (dos acumuladores vivos con un derive en el medio, caso **Rhino+Roar** — no requiere minion). NO construido
  hasta que un buff con duración lo fuerce. (La **clase de re-composición** = {CO dinámico, combo, buff vivo};
  `OQ-ENGINE-2` profile-switch **no** es de ella — cómputo estático por perfil, sin runtime-switch.)

**Alcance (no over-engineering):** el objeto se construye para el **fire-event de arma** que los 3 proyectores
+ el oráculo consumen HOY (reconciliación de estructura ya construida). Habilidad = source que emite Instancias
vía Delivery, y source-hijo (exaltada/minion) = capacidades **nombradas, no construidas** (no se simulan arcos).

### 2.1 Clasificación de Entidades (PE vs TE)
Para mantener el motor ligero y determinista, las entidades se dividen por su ciclo de vida:

- **PE (Persistent Entities)**:
  - **Definición**: Entidades que el usuario "posee" y equipa en su loadout.
  - **ADN Extendido**: Las armas poseen un **`AttackProfileRegistry`** (Primary, Alt, Incarnon), donde cada perfil define su propio `DeliveryType` (Beam, Projectile, etc.).
  - **Ejemplos**: Warframe, Weapon, Companion, Mods, Arcanes.

- **TE (Transient Entities)**:
  - **Definición**: Entidades efímeras generadas por una acción o comportamiento.
  - **Jerarquía de Generación** *(TE-como-entidad-en-cola: diseñado, no implementado)*: la idea era que una TE genere TEs hijas (Impacto → Proc). Hoy los procs/DoT son **proyecciones matemáticas** de los `EffectBehavior` sobre `EntityState` (modelo unificado de proc), no TEs reales en una cola (sin límite de profundidad ni energía de tick). El **double-dip** sí se modela como regla de composición aritmética — ver [`damage-status-model.md`](damage-status-model.md) §Reglas de composición (faction sobre DoTs, `DC-OQ-ENGINE-13`).
  - **Ejemplos**: Proyectiles, Procs de Estado, Invocaciones temporales.

### 2.2 Condiciones en vez de coordenadas
La simulación **no utiliza coordenadas físicas (X, Y, Z)**: expresa la situación como condiciones
lógicas. Ese es el principio, y no cambia.

⚠️ **Lo que sí cambió: esto no es "el escenario".** Los tres ítems de abajo tienen **tres dueños
distintos**, y agruparlos bajo un nombre único hacía parecer que pertenecían al mundo. El discriminador
es el de §2.2.1: *sacá todos los participantes y mirá qué queda*.

| Condición | Ejemplos | De quién es |
|---|---|---|
| **Buckets de distancia** | `0-10m`, `10-20m` — falloff, AoE | **la relación** source ↔ target, no el mundo |
| **Punto de impacto** | `Head`, `Body`, `Weakpoint` | **la instancia** — es el slot ③ de [`arch-decisions.md`](arch-decisions.md) §21 |
| **Estados de postura** | `In Air`, `Sliding` | **el participante** — sacás al jugador y desaparecen |
| **Zonas de efecto** | `Inside Magnetize Bubble` | **otra entidad** — la habilidad que las creó |

*(Falloff parametrizado; el bucketing por distancia como variable de C2 sigue en diseño — ver
`references/wiki/mechanics/damage-falloff.md` y `OQ-ENGINE-7`. El multiplicador por punto de impacto
sigue sin aplicarse en `CombatSimulator.resolveHit()`.)*

### 2.3 El Acumulador de Atributos (Stat Accumulator v3 - "The Audited Formula")
Estructura de cálculo blindada para evitar ambigüedades en la suma y escalados cruzados.

- **Fórmula Maestra**:
  `V = ((Base + BaseFlat) * (1 + BaseAddPct/100) * (1 + ModsAddPct/100) + TotalFlat) * Multiplicative`

- **Desglose de Buckets**:
  1. **Base**: Valor inmutable de la "fábrica" (DNA).
  2. **Base Flat (Add to Base)**: Sumas directas al valor base (ej: Arcanos de Armadura fija). Afecta a todos los porcentajes posteriores.
  3. **Base Add Pct (Scale Base)**: Porcentajes que aumentan la base antes de los mods (Casos raros de "Base Stat Link").
  4. **Mods Add Pct (Relative Additive)**: El bucket estándar de mods (ej: Serration, Vitality). Se suman entre sí: `1 + (Σ mods / 100)`.
  5. **Total Flat (Add to Total)**: Sumas fijas finales (ej: daño adicional plano de algunas pasivas). No escalan con mods.
  6. **Multiplicative**: Multiplicadores finales independientes (ej: Roar, Críticos).

- **Contrato detallado**: ver `docs/domains/engine/attribute-node-contract.md`

- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si un Arcano da +900 de Armadura?* Entra en `BaseFlat`. La armadura total sube y los mods de `% Armor` escalan sobre ese nuevo valor.
  - *¿Qué pasa si tengo Serration (+165%) y Heavy Caliber (+165%)?* Entran en `ModsAddPct`. Resultado: `(1 + 1.65 + 1.65) = 4.3x`.
  - *¿Qué pasa si un buff dice "Doble de daño"?* Entra en `Multiplicative`. Resultado: `V * 2`.

### 2.4 Resolución del Grafo: Ciclos y Convergencia
Warframe permite que el Atributo A dependa de B, y B de A (ej: Escudo -> Daño -> Lifesteal -> Escudo).

- **Detección de Ciclos**: El Topological Sort detecta ciclos estáticos.
- **Resolución de "Cross-Stat Scaling"**: 
  - Para dependencias lineales (Armor -> Crit), el grafo las resuelve en un solo paso.
  - Para **Dependencias Circulares**, el motor aplica **Fixed-Point Iteration (Max 3 pasos)**:
    1. Paso 1: Resuelve usando valores base/identidad para los nodos del ciclo.
    2. Paso 2-3: Re-calcula los nodos del ciclo usando los resultados del paso anterior.
    3. **Convergence Check** *(diseñado, no implementado)*: Si el valor cambia menos del 0.01%, se consideraría resuelto. Hoy los 3 pasos corren **incondicionalmente** (sin comparación de delta).
    4. **Emergency Break** *(diseñado, no implementado)*: el `STALE_LOOP_WARNING` no se emite; el corte a 3 pasos sí existe (evita el cuelgue).
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el loop es infinito (A=B+1, B=A+1)?* El Emergency Break corta la ejecución en el paso 3, evitando el cuelgue del hilo principal.

### 2.5 Hybrid Simulation: El "Escudo Térmico" de Rendimiento
Para evitar el agotamiento de la `MAX_TICK_ENERGY` en ráfagas de alta densidad (ej: Kuva Kohm con Multishot extremo).

- **Conmutación Automática**:
  - **Modo Atómico**: Cada perdigón es una TE (Transient Entity) con su propia resolución de procs.
  - **Modo Probabilístico (Expected Value)**: Si `Energy_Tick > Threshold`, el motor agrupa los N perdigones restantes en un **"Batch Entity"**.
  - **Cálculo de Batch**: En lugar de tirar dados por cada perdigón, calcula el `ExpectedValue` de procs y daño (ej: "8.5 procs de Cortante en promedio") y aplica el resultado de forma determinista.
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el modo probabilístico "borra" un proc crítico de 1 en un millón?* El modelo de EV garantiza que estadísticamente el DPS sea idéntico, aunque se pierda la "granularidad" del evento único. Para la UI, el resultado es indistinguible y el rendimiento se mantiene estable.

### 2.6 Jerarquía de Leyes (Logic Decorator Layers)

> **⚠️ Diseñado, NO implementado.** Hoy el engine resuelve todos los modificadores en un solo
> bloque (la fórmula del acumulador §2.3), sin capas decoradoras ordenadas — caps/floors/overrides no tienen
> orden garantizado. Es una de las decisiones de blindaje pendientes (ver [`arch-decisions.md`](arch-decisions.md) §4);
> se construirá cuando el layering con orden crítico empiece a doler.

> **Alcance (§2.0):** estas capas ordenan la resolución de un **STAT** (C1). El `POST_MUL:
> Faction damage adjustments` de abajo NO es un decorador de stat: es la etapa **③ RESUELVE-VS-TARGET** del
> trazado (§2.0) — propiedad del target (C2). No mezclar los dos órdenes.

Para evitar condiciones de carrera entre decoradores (ej: "¿50% de reducción o mínimo 10?").

- **Capas de Ejecución (Orden Estricto)**:
  1. `INITIAL_OVERRIDE`: Forza valores antes de cualquier cálculo.
  2. `PRE_ADD`: Altera la base antes de los buckets aditivos.
  3. `POST_ADD`: Modifica el resultado tras las sumas pero antes de multiplicadores.
  4. `POST_MUL`: Modifica tras multiplicadores (ej: Faction damage adjustments).
  5. `FINAL_CLIP`: Caps y Floors finales (ej: "No menos de 10 de daño").
  6. `UI_DISPLAY`: Formateo estético sin afectar la simulación.

- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si A dice "Min 10" y B dice "Reducción 50%"?* Si "Min 10" está en `FINAL_CLIP` y "Reducción 50%" en `POST_MUL`, el daño será 50% y luego, si es menor a 10, subirá a 10. Resultado determinista.

### 2.7 ADN Dinámico: El "Casting Snapshot"

> **⚠️ Diseñado, NO implementado.** El behavior `CAST` → snapshot parcial del padre →
> `Injected DNA` en la TE no existe (Iron Skin y habilidades-snapshot no modeladas). Feature futura —
> ver [`arch-decisions.md`](arch-decisions.md) §4.

Resuelve el problema de habilidades como Iron Skin de Rhino.

- **Mecánica**: 
  - Al ejecutar el behavior `CAST`, el motor toma un `Projection Snapshot` parcial de los atributos relevantes del padre en ese micro-segundo.
  - Ese snapshot se inyecta como **`Injected DNA`** en la nueva entidad (TE).
  - La TE es inmutable respecto a ese ADN; si los stats del padre cambian después, la TE (Iron Skin) no se ve afectada.
- **Auditoría "Qué pasa si..."**:
  - *¿Qué pasa si el ADN es inmutable?* Se mantiene la pureza A→B→C1→C2. El ADN dinámico es simplemente un parámetro de entrada para C1, no un cambio en los datasets de Capa B.

---

## 3. Principios de Implementación

1. **Agnosticismo Total**: El engine (C1 y C2) no sabe que React existe. Podría correr en un servidor, en un worker o en una terminal.
2. **Reactividad por Bridge**: La granularidad reactiva vive en Capa D, no en C1 ni C2.
3. **Comunicación vertical estricta**: Ninguna capa salta una capa intermedia. No hay comunicación horizontal entre capas del mismo nivel.
4. **Fidelidad Documental**: Cada fórmula en el código debe tener un puntero directo a su correspondiente en `references/wiki/`.

---

## 4. Definición de Sistemas por Capa

### C1 — Engine Modules
- **Elemental System**: Lógica de colisión y combinación de tipos de daño (`DamageCombiner`).
- **Attribute Graph**: Resolución del grafo reactivo de atributos (`SimulationEngine`).
- **Hydration**: Construcción de entidades desde dataset + DNA (`StaticHydrator`, `DnaRepository`).
- **Mod Resolution**: Traducción de upgrade types a modificadores tipados (`ModRepository`).

### C2 — Simulation Modules
- **Combat Simulator**: Resolución de daño final contra un Target (`CombatCalculator`, `CombatSimulator`).
- **Modelo de proc (DoT/status)**: proyecciones de DoT y procs vía `EffectBehavior` por efecto sobre `EntityState` (`StatusEngine` eliminado con el rediseño unificado).
- **Ability System**: Escalado de poderes por contexto de simulación.
- **Time-Window Simulator (Timeline)**:
  - Sistema híbrido que proyecta el comportamiento del loadout en una ventana de tiempo (ej: 0s a 10s).
  - Genera una serie temporal de datos para visualizar gráficas de DPS sostenido, picos de daño y decaimiento de buffs.
  - Permite estimar el Time-to-Kill teórico contra enemigos simulados.
