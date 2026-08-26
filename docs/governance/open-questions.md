---
Estado: "activo"
Rol: "Registrar preguntas abiertas cross-cutting del proyecto"
Impacto_ID: "G-OQ"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-08-26"
---

# Open Questions (Preguntas Abiertas)

Este documento contiene únicamente los debates técnicos **activos** (abierto / gated / condicional). Una pregunta que se cierra de verdad se mueve **entera** a `closed-decisions.md` y se **borra de acá** — cuerpo y fila del índice, sin lápida. La regla completa (y cómo verificar que un cierre es genuino) vive en `docs/CLAUDE.md §Frontera open-questions ↔ closed-decisions`.

## Índice

**Leé esta tabla, no el documento.** El detalle de cada OQ se consulta bajo demanda: buscar `## <ID>`.
Es lectura obligatoria de arranque (`docs/CLAUDE.md` §Jerarquía) y el cuerpo son ~15k palabras — el
presupuesto de atención se gasta acá, no leyendo las 35 en fila.

| OQ | Tema | Dominio | Estado |
|---|---|---|---|
| `OQ-W-5` | Semántica de los canales de costo: `ENERGY_COST` / `ENERGY_DRAIN`, la forma invertida como ganancia, y el costo en Health | data / ability-stats → engine | abierta — no bloquea |
| `OQ-W-6` | Vocabulary gap: `upgrade_by` para stats base de warframe | data / ability-stats | abierta |
| `OQ-W-7` | Double-scaling y semántica especial de `upgrade_by` | data / ability-stats → formulas | abierta — no bloquea |
| `OQ-W-8` | Qué hace la emisión con un stat de daño que el override no alcanza a describir | data / ability-stats → engine | abierta — no bloquea |
| `OQ-SEM-1` | Conditions de abilities y augments | data / semantic / ability-stats | abierta — no bloquea |
| `OQ-SEM-2` | Eje organizador del mapa de `condition` | semantic / conditions → engine | abierta — no bloquea |
| `OQ-DATA-1` | Materialización de slots por entidad | data / arsenal / engine | abierta |
| `OQ-DATA-4` | Patrones transversales (stacking / duration / condition) | data / schema | abierta — no bloquea |
| `OQ-DATA-5` | Weapon-type gate en arcanes: campo ausente | data / schema (arcane) → UI | abierta — no bloquea |
| `OQ-DATA-6` | Set Mods: bonus de conjunto como entidad | data / schema → engine / UI | abierta — no bloquea |
| `OQ-DATA-7` | Archgun range vs melee reach en `WEAPON_ADD_RANGE` | data / semantic → engine | abierta — no bloquea |
| `OQ-DATA-8` | Unidad flat (`+Xm`) vs `%` bajo un mismo token de range | data / semantic / schema | abierta — no bloquea |
| `OQ-DATA-9` | Overrides = vista-consumidor (no doble-merge); convergencia por salida diferida | data / integration | re-scopeada — gate: madurez de datos |
| `OQ-DATA-10` | Convergencia ruta catálogo ↔ proyector del engine | ui-ux / presentation | abierta — re-scopeada 2026-07-17 |
| `OQ-DATA-11` | Compatibilidad de mods por entidad | data / semantic | abierta — degrada usabilidad |
| `OQ-DATA-13` | Íconos de habilidad/shard: presentación duplicada/divergente | ui-ux / presentation | abierta — no bloquea |
| `OQ-DATA-14` | Armas modulares: ensamblaje de DNA desde piezas | data / hidratación | abierta — no bloquea |
| `OQ-DATA-15` | Campo `faction` contaminado del enemigo (scaling + FACTION_BONUS) | data / "0" → engine | abierta — síntoma resuelto en el consumidor (cascada); **causa raíz en el parser de upstream**, alcance fuera del enemigo sin medir |
| `OQ-DATA-16` | Fuente de datos propia (estructura a medida) vs el fork `@wfcd/items` | data / pipeline / fuente | abierta — el raw es propio y Project lo consume; las **imágenes** siguen saliendo del clon de upstream (605 MB) y los iconos de habilidades no existen en ninguna fuente resuelta; no bloquea |
| `OQ-DATA-17` | Escuelas de enfoque: cero dato, y antes hay que decidir si el operador es un participante | data / fuente + engine / Capa A | abierta — **gated por cosecha**; hoy el bridge fabrica `zenurik` hardcodeado |
| `OQ-UI-2` | Dónde vive el estado de sesión/UI | ui-ux / arquitectura de estado | abierta — no bloquea |
| `OQ-UI-3` | Footer: acciones contextuales + confirmación | ui-ux / interacción | abierta — **bloquea flujo BUILD** |
| `OQ-UI-4` | Profile como "utility hub" | ui-ux / producto | abierta — no bloquea |
| `OQ-UI-5` | OptionsView + decisión de NO-i18n | ui-ux / configuración | abierta — no bloquea |
| `OQ-UI-6` | Revisión funcional del menú de navegación | ui-ux / interacción | abierta — no bloquea |
| `OQ-ENGINE-2` | Profile switching en runtime (Incarnon/Alt-fire) | engine / simulation-context | re-scopeada — path dinámico sin consumidor |
| `OQ-ENGINE-7` | Nodos de arma faltantes (Capa 4): resta el eje (c)/C2 | engine / hydration | abierta — no bloquea |
| `OQ-ENGINE-11` | Exaltadas: intención estructural en A1 | engine / Capa A | abierta — diferida |
| `OQ-ENGINE-12` | Puncture (crit condicional) no aplica a AoE/habilidades de warframe | engine / C2 | gateada — sin AoE modelado, gancho cerrado (`DC-OQ-ENGINE-12`) |
| `OQ-ENGINE-14` | Alcance del modelado melee | engine / C1 + C2 | promovida a diseño |
| `OQ-ENGINE-15` | DR de armor enemigo: conflicto de 3 vías | engine / C2 | abierta — `√3a/100` provisional |
| `OQ-ENGINE-16` | N-declarado vs timers reales de stacks | engine / C1 + C2 | abierta — no bloquea |
| `OQ-ENGINE-18` | Status Duration en DoT: ¿más ticks o estirados? | engine / C1-timeline | abierta — gated por test in-game |
| `OQ-ENGINE-19` | Generador discreto de N proc-slots a SC >100% | engine / C1-población | abierta — gated por dato in-game |
| `OQ-ENGINE-20` | Frontera de congelación: qué determina el proc, qué evalúa el tick | engine / C2 | abierta — eje medido; falta el caso del combo (P-10) |
| `OQ-ENGINE-21` | Fidelidad de la ley de scaling: la tabla no está validada por DE | engine / C2 | abierta — gated por medición; Anarchs cerrado |
| `OQ-ENGINE-22` | Generalizar EHP/DR de `enemy/` a `entity/` (player/companion) | engine / formulas | abierta **sólo en EHP** — el eje DR se resolvió: primitiva por clase, selección en el borde |
| `OQ-ENGINE-23` | Rank de ítem (warframe/arma) sin consumidor; `mod.rank` vestigial | engine / A1-C1 | abierta — diferida, no bloquea, sin necesidad real hoy |
| `OQ-ENGINE-24` | Derivación cross-stat (Iron Skin y su clase): fórmula dedicada ↔ grafo | engine / C1 | abierta — **diferida por decisión**: 1 de 1241 `upgrade_by` emite modifier; gap rojo-ejecutable |
| `OQ-ENGINE-25` | Orden de `total_flat` vs `multiplicative` contra la referencia canónica | engine / formulas — fidelidad | abierta — **latente**: intersección vacía medida, no bloquea |
| `OQ-ENGINE-26` | Composición entre fuentes de life steal: la fuente no lo declara | engine / C2 — sustain | abierta — hueco de la wiki, gated por medición |
| `OQ-ENGINE-27` | `co_base`: la regla padre→hijo del CO, declarada en el schema y sin validar del todo | engine / C1 — fidelidad CO | abierta — **gated por investigación**; el qué ya está decidido en `arch-decisions §9` |
| `OQ-ENGINE-28` | Resistencias por entidad: capa aparte de la matriz por facción | engine / C2 — modelo de enemigo | abierta — campo nullable + test con dato a mano |
| `OQ-ENGINE-29` | ¿Los status sin ícono (`Lifted`/`Knockdown`/`Microwave`) cuentan para CO? | engine / C2 — población de status | abierta — gated por test propio, **diseño listo** |
| `OQ-ENGINE-31` | ¿Qué le falta a una entidad para ser modelable? — el compañero como forcing-case | engine / modelo de entidades | abierta — corpus partido en **5 direcciones** (3 sin dueño); **gated por medición** (P-5) y por capacidad de propagación |
| `OQ-ENGINE-32` | ¿Los estados físicos de CC forman un eje ordenado o son cuatro independientes? | engine / modelo de status | abierta — **sin medición posible**; sin consecuencia numérica mientras no se simule comportamiento |
| `OQ-ENGINE-33` | ¿El proc deja de ser un campo del tipo de daño? | engine / vocabulario + contrato core | abierta — **sin convergencia**; arrastra el bug `DT_RADIANT` |
| `OQ-ENGINE-34` | ¿Las relaciones entre entidades necesitan ser un bloque propio? | engine / modelo de entidades | abierta — **acotada**: *"esto es de aquel"* se declara y costó un campo (`owner`); las relaciones dirigidas siguen sin caso |
| `OQ-ENGINE-35` | ¿Cuánta geometría necesita el escenario? — declara quiénes existen, no dónde están | engine / Capa A — escenario | abierta — **gated por consumidor**; ya hay distancia sin espacio donde medirla |
| `OQ-ENGINE-36` | Claves derivadas que colisionan sin chequeo — 3 de 4 apariciones muertas | engine / identidad de participante y de slot | abierta **sólo en slots** — el participante se identifica por su coordenada en la escena; la clave de slot sigue siendo `Record<number,T>` con guarda y sin forma |
| `OQ-ENGINE-37` | `evitar` ⊥ `mitigar` ⊥ `acortar` ⊥ `limpiar` — cuatro verbos que el corpus llama "resistencia" | engine / defensa del portador | abierta — 3 verbos sin caso construido; **`mitigar` ya no**: `Adaptation` tiene dato entero (11 rangos, `upgrade_types: []`), la ley (Familia A) y el portador (`EntityState` sobre warframe real). Falta token + hook de *"when damaged"* + DR por tipo |
| `OQ-ENGINE-FUTURE` | Features de evolución del motor | engine / simulation-v2 | abierta — backlog |
| `OQ-DOC-1` | Docs commiteados citan `.working/` (gitignored) como autoridad | governance / higiene-docs | abierta — no bloquea |
| `OQ-DOC-2` | Fuente estancada: falta la señal inversa (no se mueve hace años) | governance / higiene de fuentes | abierta — (a) ejecutable ya, (b) worklist per-item |

---

## OQ-ENGINE-2 — Profile switching en runtime (Incarnon/Alt-fire) — **RE-SCOPEADA (2026-07-15): sin consumidor para el path dinámico**
**Dominio:** engine / simulation-context
**Contexto:** `SimulationContext.active_profile_id` existe pero no se usa durante `SimulationEngine.resolve()`. El perfil se selecciona en hidratación (`StaticHydrator.createBaseEntity()`). Cambiar a modo Incarnon requiere re-hidratar todo el ensemble.
**Pregunta original:** ¿El motor debe re-hidratar al cambiar perfil (path simple), o debe conmutar atributos durante `resolve()` (path diseñado)? El diseño original requería el segundo.

**Re-scope (2026-07-15, debate source-state → `decision-frontier §4`):** para lo que OmniFrame **es** (un calculador de builds) **no hay consumidor del switch en runtime** — se **computa cada perfil por separado** (dos hidrataciones estáticas: `consume(build_base)` vs `consume(build_incarnon)`). El "switch" es preocupación de **intención/UI** (cuál perfil se muestra), no del runtime del engine. Verificado (2026-07-15): los **perks incarnon son literalmente `Modifier[]`** (`IncarnonRepository.getModifiers`, tests `co-incarnon-perk`/`boltor-prime-incarnon`) — *"mods con pasos extra"*, resueltos por el mismo grafo; la **selección estática de perfil ya funciona**. Un runtime-switch solo tendría sentido dentro de una **timeline-sim completa donde la transformación es un evento simulado** (llenás el medidor Incarnon → transforma en el segundo N) — fuera de scope, probablemente para siempre.
**Consecuencia:** el profile-switch **NO** pertenece a la clase de re-composición de C1 (esa clase = `source-state` vivo: CO dinámico / combo / buff vivo — modificadores con reloj, no swaps de raíz). No se cierra del todo (queda la puerta por si algún día hay timeline-sim consumidora), pero el **path dinámico no se construye**: no tiene consumidor. No confundir con **combo / medidor Incarnon**, que son modificadores vivos (`source-state`), no switches de perfil.
**Fuente:** `docs/domains/engine/engine-audit.md §2.4`; debate source-state 2026-07-15 (`decision-frontier §4`).

---

## OQ-W-5 — Semántica derivada de ENERGY_COST / ENERGY_DRAIN — **ABIERTO (2026-05-22)**
**Dominio:** data / ability-stats → engine
**Contexto:** `ENERGY_COST` y `ENERGY_DRAIN` son tokens válidos en `upgrade_by` de ability-stats. El pipeline los captura correctamente. La semántica derivada (cómo interactúan con Ability Efficiency, caps, etc.) no está implementada en el engine.
**Fórmulas conocidas:**
- `ENERGY_COST` → `(2 − efficiency) × base_cost`
- `ENERGY_DRAIN` → `((2 − efficiency) × base_drain) / duration_multiplier`

**La misma forma aparece invertida, como ganancia.** Bloodletting (Garuda) restaura energía con
`÷ (2 − efficiency)` — mismo factor, división en vez de multiplicación, ganancia en vez de costo.
No es una fórmula nueva: es el mismo primitivo leído al revés. Si `ENERGY_COST` se implementa, el
caso de ganancia sale casi gratis. (Bloodletting **no** dispara mods de daño→energía tipo Rage /
Hunter Adrenaline — exclusión explícita, anotar al modelar para no duplicar la conversión.)

**Hay al menos un canal de costo que no es energía.** Scarab Shell (Inaros, 3ª) se paga en
**Health**: 25 HP por cada 1% de armor generado, ramp de 4.67 s, hasta 2.500 HP para carga completa,
y **se puede detener a medio cargar**. El vocabulario actual (`ENERGY_COST` / `ENERGY_DRAIN`) no
cubre ese eje.

> ⚠️ **No asumir que es el mismo mecanismo con otro recurso.** Que ambos sean "costo de activación"
> no dice que compartan forma: el de energía es un factor sobre un costo puntual, el de Inaros es un
> **drenaje progresivo con estado intermedio** (carga parcial) y tope. Colapsarlos en `HEALTH_COST`
> por analogía sería afirmar algo que no está medido. Se resuelve cuando aparezca un segundo caso de
> costo-no-energía con el que comparar la forma — criterio `D-20`, no antes.

**Estado:** deuda legítima. No bloquea el pipeline de datos ni el schema.
**Condición:** cuando el engine necesite resolver valores de energía para habilidades activas.
**Fuente:** `references/wiki/warframes/garuda/bloodletting.md` · `references/wiki/warframes/inaros/scarab-shell.md`

---

## OQ-DATA-1 — Materialización de slots por entidad — **ABIERTO (2026-05-25)**
**Dominio:** data / arsenal / engine
**Contexto:** Los slots por entidad (Warframe 8 mods + Aura + Exilus + 2 Arcanos, Melee + Stance, etc.) son información canónica del juego documentada en `docs/domains/ui-ux/slot-reference.md`. Casos especiales como Jade (2 Auras), Sevagoth Shadow, exaltadas y companions modulares requieren modelado explícito. `UpgradeView.tsx` ya está **activo** (consume el engine vía `useViewModel` + `toStatEntries`), pero sin diseño definido del **layout de slots por entidad** — que es lo que esta OQ gatea.
**Pregunta:** ¿Cómo se materializan estas capacidades en el sistema? Opciones:
- (a) **JSON por entidad** (similar a `archon-shards.json`) — `slot-capabilities.json` indexado por `uniqueName`
- (b) **Constantes/mapeos en código** — en `Project/src/shared/types/` o `Project/src/lib/`
- (c) **Derivado del dataset** de `@wfcd/items` cuando lo expone
- (d) **Híbrido** — baseline en código + overrides por excepción en JSON
**Implicación:** La elección determina si `slot-reference.md` pertenece a `data/rules/`, `data/schemas/`, o vive como referencia canónica sin dominio fijo. **Hoy se mantiene en `docs/domains/ui-ux/` como huérfano explícito** para no pre-cerrar esta decisión.
**Bloquea:** Diseño definitivo de `UpgradeView`; modelado de Jade Aura×2, Sevagoth Shadow, exaltadas, companions modulares.
**Fuente:** `docs/domains/ui-ux/slot-reference.md`

---

## OQ-ENGINE-FUTURE — Features de evolución del motor en backlog — **ABIERTA (2026-05-25)**
**Dominio:** engine / simulation-v2
**Contexto:** backlog vivo de features sin prioridad asignada — las dos primeras vienen de pre-implementación (abril 2026); se suman las que aparecen después (fechadas en la tabla). Ninguna tiene consumidor que la exija hoy.

| Feature | Descripción | Implicación |
|---|---|---|
| **Web Worker compatibility** | API serializable del motor para mover la simulación a un Worker | Performance bajo simulaciones extensas |
| **Rewind / Time Travel** | Historial de cambios para deshacer/rehacer; aprovecha que el motor es determinista | UX de comparación de builds |
| **Overguard como capa de entidad** (2026-07-22) | Modelar overguard **para entidades en general**, no solo enemigos (hoy sólo aparece como "futuro" en `effect-behavior.ts`; el caso puntual de Cold-cap-4 se destiló a Issue, ver `DC-OQ-ENGINE-12`). Dato disponible: coeficientes de scaling en `Module:Enemies/infobox` (`f1 0.0015/4.00, f2 260.00/0.90`) | Capa de mitigación propia + caps de status (Freeze 4 stacks en Overguard) |

**Estado:** la condición-gate original ("cuando la Capa D se materialice y haya un cliente real") **ya se cumplió** — `ViewModelContract` v0 existe, consumido por D1 (`use-view-model`) y D2 (`oracle`). Aun así ninguna de las dos features tiene demanda: se retoman si un consumidor las pide. Nada en código todavía (verificado 2026-07-17).

> El debate del **contrato de salida / `ViewModelContract`** que creció dentro de esta OQ se cerró o migró y **ya no vive acá**: el contrato es **estructurado neutral** (`StatViewModel { token, value, unit }` — decidido, no strings formateados); el rename D→nombre-neutro (residual `ViewModelContract`) es `DC-OQ-ENGINE-8`; la simetría de entrada (`ensemble.types`→`@shared`, store→`@core`) es `DC-OQ-ENGINE-9`; "dominios ↛ `@core`" (y `@providers → @core` permitido) está en `arch-decisions.md §7` + `decision-frontier.md §1`; el principio consumer-shaped / anti producer-laundered vive en `arch-decisions.md` + `view-model/index.ts`.

**No bloquea:** nada.
**Fuente:** notas de pre-implementación (abril 2026).

## OQ-W-6 — Vocabulary gap: upgrade_by para stats base del warframe — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → taxonomía
**Contexto:** El vocabulario `AbilityUpgradeBy` cubre los 4 stats de habilidad (`AVATAR_ABILITY_STRENGTH/RANGE/DURATION/EFFICIENCY`) y los dos ejes de energía (`ENERGY_COST/DRAIN`). Inaros Scarab Swarm tiene un stat (`Damage: 241`) que escala con Max Health del warframe — un eje de base stat sin token. El `//!` en `Inaros.md` lo registra: `"scale with health, literaly 'vitality' maxed (100% health) affected this number 483"`.
**Pregunta:** ¿Cómo se extiende `upgrade_by` para cubrir stats base del warframe (health, shield, armor)?
- La taxonomía D-6 ya define `AVATAR_ADD_HEALTH_MAX` como token de mod. El principio que se busca es **globalizar la semántica**: el mismo vocabulario `AVATAR_*` debería aplicar.
- Opciones: token completo idéntico al mod (`AVATAR_ADD_HEALTH_MAX`), o forma sin OPERATION (`AVATAR_HEALTH_MAX`) para separar el eje "con qué escala" del eje "qué modifica".
**Condición para resolver:** al resolver la taxonomía general de `upgrade_by` — cuando haya ≥2 casos distintos de base-stat scaling en abilities que justifiquen el patrón. ~~Hoy solo Inaros es caso confirmado.~~

**El umbral de ≥2 casos YA se superó** (barrido contra `references/wiki/`)**:** Iron Skin
(`× TotalArmor`), Snow Globe (idéntica), Icy Avalanche (`20% armor→OG`), Trinity pasiva
(`0.5 × Energy Max`), Bloodletting (`MaxEnergy` **y** `MaxHealth`) — **5 casos además de Inaros**, en
3 formas distintas. Que el umbral esté cubierto **no** dispara la extensión del vocabulario: el eje
**mecanismo** está diferido en `OQ-ENGINE-24` por falta de corpus de habilidades modeladas, y extender
`upgrade_by` sin mecanismo que lo consuma sería vocabulario muerto.

**Medición del dato:** el override tiene **1241 `upgrade_by` en 5 valores** —
`AVATAR_ABILITY_STRENGTH` (481), `_RANGE` (257), `ENERGY_COST` (245), `_DURATION` (223),
`ENERGY_DRAIN` (35). **Ningún capacity-stat, y ninguno va a aparecer por parsing:** la wiki expresa
esas dependencias en prosa ("Armor Multiplier × Total Armor"), no en formato de stat. Cualquiera sea
la forma que se elija, el dato hay que **escribirlo a mano** — lo que empuja la decisión hacia dónde
es verificable (código tipado y testeado) y no hacia el JSON.
**Bloquea:** Anotar correctamente Inaros Scarab Swarm. Extensión del vocabulario `AbilityUpgradeBy` en `shared/types/ability.ts`.

> ⚠️ **Al barrer, no capturar la habilidad equivocada.** Esta OQ habla de **Scarab Swarm**, la **1ª**
> de Inaros (daño que escala con Max Health). **Scarab Shell** es la **3ª** — armor a cambio de
> Health— y **no** es un caso de esta OQ: su bonus escala sólo con Strength, no lee ningún capacity
> stat como input. Lo que aporta es un **canal de costo**, y vive en `OQ-W-5`. Nombres parecidos,
> habilidades distintas.

**Precisión (2026-07-09, debate de `source_attribute`):** Inaros Scarab Swarm es **composición
cross-stat con fórmula dedicada** (`rhino.test.ts:72`, "Iron Skin overguard = (1200×str) +
armor×(2.5×str) — fórmula dedicada [post-scope]"), **no** el shape simple de `linearThresholdScale`
(`arch-decisions.md §12`) que sí sirve a Roar y a la Familia D de arcanos. No confundir: esta OQ
sigue abierta y sin relación directa con §12 — es una fórmula propia, no un caso más del primitivo.
**Fuente:** `references/game-ui/Inaros.md` línea `//!`

---

## OQ-SEM-1 — Conditions de abilities y augments — **ABIERTO (2026-05-28)**
**Dominio:** data / semantic / ability-stats
**Contexto:** El vocabulario canónico de `conditions.md` cubre weapons, arcanes, incarnon y mods. Las abilities de Warframe tienen condiciones situacionales (e.g., "target tiene X stacks", "cristal del 4 de Citrine golpeado") que en su mayoría mapean a tokens existentes. Los augments son el caso complejo real — pueden tener condiciones propias no cubiertas por el vocabulario actual.
El field `condition` estuvo en el schema de `ability-stats.override.json` y fue removido por desuso; la infraestructura conceptual existe.
**Pregunta:** ¿Cuándo y cómo se reintroduce `condition` en ability-stats? ¿Los augments requieren tokens nuevos o extienden el vocabulario existente?
**Pendiente de:** revisar los `.md` de referencia de Warframes para identificar casos reales de conditions en abilities y augments. Hoy no hay evidencia sistematizada.
**No bloquea** el vocabulario de weapons/mods/arcanes ni el engine actual.

---

## OQ-W-7 — Double-scaling y semántica especial de upgrade_by — **ABIERTO (2026-05-26)**
**Dominio:** data / ability-stats → engine / formulas
**Contexto:** Dos categorías de edge-cases detectadas en la auditoría del diccionario (2026-05-26):

**A — Double-scaling:** dos abilities tienen un stat que escala simultáneamente con dos modificadores distintos:
- `Gara Mass Vitrify` → `Max Radius: 11m $DURATION $RANGE`
- `Harrow Covenant` → `Energy Conversion: 15% $EFFICIENCY $STRENGTH`
El parser `apply-ability-md.ts` toma solo el primer token y emite `console.warn`. El schema **ya soporta** `upgrade_by` como `AbilityUpgradeBy | AbilityUpgradeBy[]` (resuelto 2026-05-26); el engine usa `[0]`. Límite activo: la **fórmula dedicada de double-scaling**, no el schema — `formulas/ability/` ya existe (`ability-crit`, `ability-status`) pero sin la fórmula de composición de dos modificadores.

**B — Tokens válidos en contexto no-estándar:**
- `Lavos`: `$EFFICIENCY` → `ENERGY_COST` pero Lavos no tiene pool de energía — `EFFICIENCY` reduce cooldown, no energy cost.
- `Grendel Feast`: `$EFFICIENCY` → `ENERGY_COST` pero el drain es de salud (`<HEAL>`), no de energía.
- `Nidus Virulence`: `$EFFICIENCY` → `ENERGY_COST` con efecto *negativo* — Efficiency reduce el Energy Refund, no el coste. El campo `inverse: true` existe en el schema pero no está anotado.

**Condición para resolver:** cuando se empiece a trabajar con `upgrade_type` (que abre más edge-cases) o al generar tests masivos del engine con datos reales. Estos casos dependen de fórmulas dedicadas por habilidad.
**No bloquea** el pipeline de datos ni el schema actual.
**Fuente:** `references/game-ui/Gara.md`, `references/game-ui/Harrow.md`, `references/game-ui/Lavos.md`, `references/game-ui/Grendel.md`, `references/game-ui/Nidus.md`

---

## OQ-W-8 — Qué hace la emisión con un stat de daño que el override no alcanza a describir — **ABIERTA — tres de los cinco gates dependen del source-state, dos son captura**
**Dominio:** data / ability-stats → engine (emisión)

**Contexto.** `AbilityRepository.getEmissions` emite 18 de los 28 stats marcados con `<DT_*>`. Los otros 10 se omiten **avisando** (`console.warn`, nunca en silencio), por cinco gates que `emissionGate()` evalúa en orden. `arch-decisions.md §15` los nombra al narrar Fase 3 —*"se omiten avisando por cinco gates medidos"*— pero eso describe **qué hace el código**, no qué se decidió: la única formulación de cada gate vive en el string de su propio warn.

| gate | n | qué falta para levantarlo |
|---|---|---|
| tipo comodín `<DT_*>` | 2 | el tipo lo elige un estado del source, que el motor no modela |
| rango `[min,max]` sin estado que lo resuelva | 2 | quién resuelve el rango (batería de Gauss, Immolation de Ember); el par ni siquiera es siempre `(min,max)` — hay rangos descendentes en el corpus |
| N tipos y una sola magnitud | 4 | el override no da la proporción entre tipos |
| porcentual | 2 | es multiplicador sobre otra cosa: falta declarar sobre qué |
| declara daño sin declarar tipo | 3 | dato faltante — Radial Javelin (además el catálogo inconsistente de `Issue #6`), Breach Surge, Minelayer |

**Lo que falta decidir — y por qué no es una sola pregunta.** Contarlos juntos ("faltan 10 stats") oculta que **tres de los cinco no son de dato sino de modelo**: comodín, rango y porcentual dependen de **estado del source**, que es el hueco que `OQ-ENGINE-31` y `arch-decisions §17` tienen abierto — levantarlos exige construir el source-state, no capturar mejor. Los otros dos (proporción multi-tipo, daño sin tipo) sí son captura. Los costos son de orden de magnitud distinto y las decisiones no se toman juntas.

**Lo que esta OQ NO discute:** si omitir es correcto. Lo es, y por doctrina explícita: emitir un número plausible y falso es peor que no emitir (mismo criterio que `getModifiers` aplica a los rangos). El gate avisa, y el aviso es el contrato.

**No bloquea:** ninguno de los cinco produce un número falso hoy — omiten y avisan. Bloquean sólo la cobertura de emisión de habilidad, no su corrección.
**Vínculo:** `../domains/engine/design/arch-decisions.md` §15 (narración de Fase 3) + §17 (de dónde sale el desvío cuando el emisor no es un arma) · `OQ-ENGINE-31` (source-state, el gate compartido por tres de los cinco) · `AbilityRepository.emissionGate` · `__tests__/ability-emission.test.ts`.
**Fuente:** censo de emisión de habilidad; vive acá y no en Issues porque es debate de modelo, no trabajo pendiente.

---

## OQ-DATA-4 — Patrones estructurales transversales (stacking / duration / composición de condition) — **ABIERTA (2026-06-02)**
**Dominio:** data / schema (mods + arcanes + incarnon + archon)
**Contexto:** stacking, duration y la composición OR/AND de `condition` son conceptos **análogos** en los 4 schemas, hoy resueltos de forma divergente (mods: stacking=total, D-15 §2; arcanes Merciless: `base_value:null` + nota). Aislar cada schema produce drift. El criterio de **cuándo** acuñar estructura está en `decisions.md#D-20` (≥2 casos misma forma + gate de consumidor + escape hatch como hipótesis con contador). Passives queda **fuera** (no es un schema único; su heterogeneidad se reparte en las puertas de D-20).

**Resuelto:**
- **Ubicación del puente** (definición canónica cross-schema de stacking/duration): `DC-OQ-DATA-2` — es estructura de schema, no vocabulario → vive en `data/` (`rules/` o `schemas/`), no en `semantic/`. Su **creación** sigue gateada por D-20 (≥2 casos) + D-16 (cobertura ≥70%).
- **Nivel:** stacking/duration/condition viven a nivel **stat**, no entry (confirmado: entradas multi-efecto como Merciless/Deadhead/Pax Soar mezclan stats con y sin condición; el split `1 label = 1 stat` hace del stat el nivel natural).

**Abierto — composición de `condition` (OR/AND):** el shape `condition: string | {any:[…]} | {all:[…]}` está **implementado y el engine lo evalúa** (`evalCondition`, `SimulationEngine`); los OR planos y el primer AND (`on_hit_while_target_affected_by_electricity`) ya migraron; `on_hit_incarnon_form` queda **stub** por el eje `charged` — el eje headshot/weakpoint está **resuelto**: no colapsan, están en **subsunción** (`semantic/condition-nature.md §Tabla semilla de subsunción`, fuente `references/wiki/mechanics/enemy-body-parts.md`). El shape es **hipótesis abierta, no cerrada** (gateada por D-16 cobertura + resto de la migración). Claves del diseño:
- `any`=OR, `all`=AND como **intención explícita del autor** (no derivable de la sintaxis: `["while_aim","while_airborne"]` puede ser AND co-ocurrente u OR de alternativas). Un nivel, sin anidar. Un array plano *sin* operador se descartó (no distingue AND de OR).
- Criterio (2026-06-03): OR/AND **derivado de la estructura del dato** (validable por la forma), no lógica por encima — eje `string → array → objeto`. Trade-off: más denso/rígido a cambio de precisión a nivel engine. La gramática (separador `:`, reglas de derivación) es **posterior** a fijar el shape.
- Frontera (→ fórmula dedicada): anidado, secuencial/acumulativo (eje `duration`, separado de condition), relacional (variable ligada, p.ej. Primary Debilitate).
- Documentado a nivel flujo en [`../data/rules/overrides.md`](../data/rules/overrides.md); la granularidad en [`../semantic/condition-nature.md`](../semantic/condition-nature.md). Cobertura y conteo de composiciones: `conditions.md §Resumen` (no duplicar acá). **Próximo paso:** razonar los casos mapeados bajo obj-key antes de acuñar.

**Abierto — scope-grupo** (varios stats, una condición): hoy se **repite** el token (precedente Pax Soar). Optimización anti-repetición, no expresividad — salvo semántica compartida no-replicable (pool de stacks común). Latente.

**Estado del gate D-20:** tiene evidencia cross-schema concreta — Galvanized (mods, D-15 §2) y, del
lado arcanes, Cascadia Flare, la misma forma "evento → +val por stack, cap Nx", **ambas resueltas a
nivel engine** vía `STACK_DECAY_BUFF` (`arch-decisions.md §11`, `galvanized-stack-decay.test.ts` +
`cascadia-flare.test.ts`), consumiendo `stacks` como input C1-declarado sin tocar el schema. El resto
del corpus arcane de esta forma (Merciless×2, Deadhead×2, Dexterity×2, Exhilarate) **sigue sin
ejercer**: `upgrade_type` queda `null` en sus stats de stacking, así que ni siquiera llegan a la rama
`STACK_DECAY_BUFF` — verificado que ninguno de los 7 lo tiene poblado (no es un supuesto sin
comprobar). Lo que se cerró es el **motor**, no la **gramática**: el bridge de schema (`condition`/
`duration` estructurados cross-schema) sigue sin resolver; 6 de los 8 arcanos de la familia siguen con
`base_value:null` (Merciless×2, Deadhead×2, Dexterity×2 — Cascadia Flare y Exhilarate ya lo tienen
poblado), y 7 de los 8 siguen sin `max_stacks` — sólo Cascadia Flare lo tiene, derivado de su propio
dato (`arch-decisions.md §11`). El eje "quién" (sujeto de condition sobre el target) también tiene un
caso concreto resuelto sin infraestructura nueva (`while_enemy_below_half_health` vía `EnemySnapshot`,
`arch-decisions.md §13`); el operando literal (`_450`, `_3_stacks`) sigue sin forzar.

**Bloquea:** unificación del modelado de stacking/duration entre los 4 schemas; diseño de composición de condition.
**No bloquea:** captura de datos actual (escape hatch D-20) ni el engine Fase 0 (D-15).
**Vínculo:** `DC-OQ-ENGINE-17` (barrido de arcanes que aportó la evidencia cross-schema), `OQ-DATA-14` (armas modulares, par cercano).
**Fuente:** debate 2026-06-02; `docs/data/schemas/arcane/schema.md §3`, `docs/data/reports/audit-arcane.md`.

## OQ-DATA-5 — Weapon-type gate en arcanes: campo ausente en schema — **ABIERTO (2026-06-02)**
**Dominio:** data / schema (arcane) → UI / filter
**Contexto:** Varios arcanos tienen restricciones de tipo de arma que el schema actual no captura como campo estructurado. Casos identificados en auditoría 2026-06-02:

| Arcano | Restricción |
|---|---|
| Arcane Pistoleer / Ammunition Case | Dual Pistols (ambas manos) |
| Arcane Shotgunner / Primary Shotgunner / ShotgunVendetta | Shotguns |
| Longbow Sharpshot | Bows |
| Arcane Merciless / Deadhead / Dexterity | Primaria / Secundaria / Melee respectivamente (familia tripartita) |
| Residual Arcanes (Boils, Malodor, Viremia, Shock) | Kitguns exclusivamente |

Hoy esta restricción vive únicamente en el campo `label` como texto libre y en `notes[]` como anotación de trazabilidad. No hay campo `weapon_type` ni equivalente en el schema.

**Preguntas abiertas:**
- ¿Se agrega un campo `weapon_type: string | null` al schema de arcano? ¿Array para casos multi-restricción?
- ¿El filtro de UI consume este campo o deduce la restricción del label?
- ¿Afecta solo arcanos o también mods, incarnon perks? (Mods ya tienen sistema de tags — revisar si aplica el mismo patrón antes de diseñar separado.)

**Condición para resolver:** cuando exista un consumidor real (UI de filtro de arcanos, o engine que valide compatibilidad de equipamiento). Hoy es información display-only.
**No bloquea:** captura de datos, engine Fase 0, ni el schema actual.
**Fuente:** auditoría `docs/data/reports/audit-arcane.md`; arcanos ShotgunVendetta, AmmoEfficiencyOnSliding, LongbowSharpshot, familia Residual.

---

## OQ-SEM-2 — Eje organizador del mapa de clasificación de condition: ¿mecánica de juego o modelo de engine? — **ABIERTO (2026-06-03)**
**Dominio:** semantic / conditions → engine
**Contexto:** `conditions.md` clasifica los tokens con `engine:class:c2/*` (binary / derived / event / stack / —). Ese eje describe qué debería computar el C2. Cuando la OQ se abrió (2026-06-03) ese engine no existía y el eje era puramente especulativo; hoy el C2 se materializó parcialmente (`SimulationContext`, `EntityState`, `behaviors`, stacks) — el eje ya **se puede contrastar** contra el engine real en vez de contra uno hipotético. Aun así el criterio organizador sigue anclado al modelo de evaluación, no a la mecánica del juego.

**Pregunta:** ¿El mapa de clasificación de condition debe organizarse por **naturaleza/mecánica real del juego** —qué *es* la condición en el juego: estado del jugador, estado del target, evento de combate, maniobra de parkour, umbral de recurso, restricción de loadout— en vez de por el modelo de evaluación del engine? Bajo esta dirección, `engine:class:c2/*` pasa a ser una **proyección derivada** del mapa de naturaleza, no el eje primario.

**Relación:**
- El eje **scope** (weapon / avatar / companion / operator, derivado del prefijo de `upgrade_type`) es **ortogonal** a la naturaleza y debería vivir fuera de esta clasificación (constatado en sesión 2026-06-03 al triagear mods).
- Vínculo con **OQ-DATA-4** (gramática/shape de condition): la naturaleza real es candidata natural a ser el "sujeto/predicado" de esa gramática — por eso este eje conviene fijarse antes o junto con el shape OR/AND.
- Coherente con `conditions.md §Altitud de los debates` (taxonomía no consolidada; coherencia mínima, no rigor semántico hasta tener capas reales).

**Avance (2026-06-05):** [`docs/semantic/condition-nature.md`](../semantic/condition-nature.md) formaliza la taxonomía de naturaleza **a título de análisis** (4 naturalezas: evento/estado/umbral/escala × scope ortogonal; 145 tokens, 0 huérfanos). Adopta la naturaleza como eje primario y proyecta `engine:class:c2/*` como derivada — **contraste vivo, no cierre**. Si el eje se torna ambiguo al madurar, se debate aquí su destino.
**No bloquea:** captura de datos ni el vocabulario actual — los tokens entran literal (D-19) independientemente del eje de clasificación.
**Fuente:** debate 2026-06-03 sobre cobertura y prototipado de taxonomía; `docs/semantic/conditions.md §Modelo de evaluación (engine:class:c2/*)`; `docs/semantic/condition-nature.md`.

---

## OQ-DATA-6 — Set Mods: bonus de conjunto como entidad estructurada — **ABIERTO (2026-06-03)**
**Dominio:** data / schema (mods → sets) → engine / UI
**Contexto:** el bonus de conjunto —el efecto emergente que escala con el nº de piezas equipadas (ej. *"Gladiator Set: +X% melee crit per combo stack"*)— no llega a `public/data/mods.json`, y hace falta para simular un loadout. **Es un gap de pipeline, no de datos** (ver `docs/data/references/set-mods.md` y `docs/domains/source/gaps.md` §G-4):

- **La fuente lo trae completo.** `warframe-items/data/json/Mods.json` expone `modSet` (puntero al portador) en los 72 mods miembro, y los 19 portadores `type: "Mod Set Mod"` con `numUpgradesInSet` + `stats[]`: un escalón de texto por cantidad de piezas. `generate-data.ts` no lee ninguno de esos campos, así que los portadores llegan vacíos a nuestro dataset.
- **Gap A — pertenencia al set:** resuelto en la fuente (`modSet` explícito, no hay que derivar del `unique_name`). Queda `pipeline:debt` trivial: propagar el campo.
- **Gap B — el modelado, no la captura:** los valores vienen como **texto libre** → hay que tokenizarlos (mismo parseo que `levelStats`). Y el bonus sigue sin caber en `mod-stats.override.json` (shape per-mod): es un efecto del *set*, parametrizado por piece-count + condition propia. Es una **entidad nueva** (`set → {bonus, escala por piezas, miembros, condition}`). Tabla del wiki en `references/set-mods.md`, ahora como contraste del tokenizado.

**Preguntas abiertas:**
- ¿Schema/entidad `sets` propia, o extensión del modelo de mods (override colgado del portador `Mod Set Mod`)? El bonus es un efecto **stacking por piece-count** → instancia de `OQ-DATA-4` (stacking + composición de condition); la escala 1→max es literalmente un array indexado por nº de piezas.
- **Eje de condition nuevo:** los bonus introducen `requires_<equipo>` (companion type, umbral mods, both pieces) ausente del vocabulario actual → cruzar con `OQ-SEM-2` (naturaleza de condition) antes de acuñar.
- La noción "nº de piezas equipadas" requiere conocer el loadout completo → cercano al patrón de materialización de `OQ-DATA-1`.
- ¿Gap A se resuelve como campo derivado en pipeline o como tag?
- ¿El tokenizado del `stats[]` del portador reusa el parseo de `levelStats`, o el eje piece-count pide el suyo?

**Procedencia — RESUELTA:** era la duda de si el bonus es gap de datos o de pipeline. Se inspeccionó `Mods.json` de upstream: el dato está entero, `generate-data.ts` lo descarta. Es **gap de pipeline** → la solución es propagarlo, no capturarlo a mano.

**Condición para resolver:** cuando exista consumidor real (engine que compute bonus de set, o UI que lo muestre). Hoy es captura/investigación.
**No bloquea:** captura de datos, engine Fase 0, ni el override actual (los stats propios de los mods miembro ya viven bien en `mod-stats.override.json`).
**Vínculo:** `OQ-DATA-4` (stacking/condition), `OQ-DATA-1` (materialización de capacidades por loadout).
**Fuente:** auditoría `docs/data/reports/audit-mods.md §Grupo D`; captura `docs/data/references/set-mods.md`; debate 2026-06-03.

---

## OQ-DATA-7 — Archgun range vs melee reach bajo `WEAPON_ADD_RANGE` — **ABIERTO (2026-06-03)**
**Dominio:** data / semantic (mods) → engine
**Contexto:** tras acuñar `WEAPON_ADD_BEAM_RANGE` (D-17, 2026-06-03), `WEAPON_ADD_RANGE` queda con dos mecánicas: **melee reach** (canónico — Reach, Primed Reach, Extend, Necramech Reach) y **archgun range** (Ballista Measure, `+% Range` en contexto Archwing — afecta el alcance/fall-off en el espacio). No es la misma cantidad física que el reach de melee.
**Pregunta:** ¿el archgun range merece token propio (`WEAPON_ADD_ARCHGUN_RANGE` o similar), o se mantiene bajo `WEAPON_ADD_RANGE` con desambiguación por compat de arma? Requiere investigación concreta de la mecánica (wiki + datos) antes de decidir.
**Condición para resolver:** cuando se añadan más datos de Archwing/Archgun al repositorio o haya un consumidor de engine. Posible D-* propio o captura en D-17.
**No bloquea:** captura de datos ni el engine Fase 0 — Ballista Measure sigue mapeado a `WEAPON_ADD_RANGE` (modelo `—`, capture-only).
**Fuente:** investigación F.1, `docs/data/reports/audit-mods.md §F.1`; `docs/data/decisions.md#D-17`.

---

## OQ-DATA-8 — Unidad flat (`+Xm`) vs porcentaje (`+%`) bajo un mismo token de range — **ABIERTO (2026-06-03)**
**Dominio:** data / semantic / schema
**Contexto:** tanto `WEAPON_ADD_RANGE` como `WEAPON_ADD_BEAM_RANGE` mezclan unidades: flat en metros (`+Xm Beam Range` — Sinister Reach) y porcentaje (`+% Beam Range` — Galvanized Acceleration; `+% Range` — archgun). Hoy la unidad vive solo en el `label`; el token no la distingue. El mismo patrón existe en otros tokens del vocabulario.
**Pregunta:** ¿se diferencia la unidad estructuralmente (token o campo `unit`/operación distinta) o se mantiene en el label? Choca entre tipos de mod (flat-additive vs multiplicativo-%), con implicación en cómo el engine compone el valor.
**Condición para resolver:** etapa de conciliación muy temprana — diferir hasta tener más datos y un modelo de engine que consuma estos valores. No acuñar distinción de unidad prematuramente.
**No bloquea:** captura de datos ni el vocabulario actual.
**Fuente:** investigación F.1, `docs/data/reports/audit-mods.md §F.1`; `docs/semantic/upgrade-tokens.md` (filas range/beam).

---

## OQ-ENGINE-7 — Materialización de nodos de atributo de arma faltantes (Capa 4) — **ABIERTA: ejes (a)+(b) resueltos por molde, eje (c)/C2 de fondo**
**Dominio:** engine / hydration
**Contexto:** ~18 tokens `WEAPON_*` catalogados producen un `Modifier` correcto, pero `ItemRepository.getDNA()` solo materializa ~8 nodos de arma — el resto (`punch_through`, `recoil`, `zoom`, `projectile_speed`, `ammo_*`, `headshot_mult`, familias `combo_*`/`heavy_*`/`slam_*`) se evapora sin nodo que lo reciba.
**Pregunta — separar los tres ejes (no conflacionar):**
- **(a) Operación del upgrade** — cómo compone el token. *Resuelta por molde.*
- **(b) Dato base faltante** — de dónde sale el valor nato del arma (raw de `@wfcd/items`, override por-arma, o sintético). *Resuelta por molde.*
- **(c) Resolución del ataque** — ¿el stat computa o es display-only? Es el **eje de fondo abierto**: los nodos computan valor en C1 (metros, m/s) pero su *efecto* es **C2** (geometría de penetración, falloff) — sin modelo todavía; `it.todo` en `lanka.test.ts`/`cedo-prime.test.ts`.

**Qué hay:** 4 nodos materializados, que fijan los **cuatro moldes de base reusables** para el resto de la capa — `punch_through` (override), `projectile_speed` (raw, gate `flight != null` = ausencia ≠ 0), `recoil` (sintético 100, nodo inerte), `accuracy` (cascada par-de-ataque → escalar-de-arma → sin nodo). Detalle vivo de cada molde: [`gap-map.md §Capa 4`](../domains/engine/test/gap-map.md).
**Qué falta:** el resto de los nodos (`zoom`, `ammo_max`/`ammo_efficiency`, `headshot_mult`, `combo_*`/`heavy_*`/`slam_*`) por su molde; `ammo` pausado (`ammo_max` = deuda de fuente, `@wfcd/items` no lo expone; `ammo_efficiency` = no encaja en los moldes, efecto `1/(1−eff)` es C2, espera caso Laetum); y sobre todo el **eje (c)/C2** — falloff, penetración, geometría balística — que decide si estos nodos son display-only o computan.

**`WEAPON_ADD_ACCURACY` — MATERIALIZADO, y con un molde (b) propio.** Las **32 fuentes** del stat
rinden: 15 perks/arcanos que ya usaban el token, y 17 mods que hablaban `WEAPON_SPREAD` — misnomer
DE-legacy que no estaba en `UPGRADES`, así que gritaban en hidratación y morían ahí. El rename fue
puro: sus labels ya decían `% Accuracy` con el signo correcto (Heavy Caliber `−55`), o sea el token
nombraba el mecanismo interno de DE, no un stat distinto. El caso obligó a un
cuarto molde de base, distinto de los tres anteriores: **cascada de dos fuentes del mismo stat**, de
la más fiel a la más pobre. La base sale del par `min_spread`/`max_spread` **por ataque** —
`100 / ((min + max) / 2)`, cosechado de `Module:Weapons/data`— y sólo cae al escalar `accuracy` del
arma cuando el par falta; sin ninguno, no hay nodo (ausencia ≠ 0).

Por qué no alcanzaba el escalar: los dos consumidores son perks de **forma Incarnon**, y la forma
tiene precisión propia que el promedio colapsado del export no puede expresar — Boltor Prime vale 50
en su ataque normal y **10** en Incarnon. Con el escalar, `hunters_mantra` habría mejorado una base
cinco veces equivocada: un número plausible y falso, peor que el silencio anterior. Contrato del dato
en `data/schemas/weapons/weapons-attack-structure.md`; test en `__tests__/weapon-accuracy.test.ts`.

Sigue abierto el **efecto**: cono → probabilidad de impacto es C2 y no tiene modelo. El nodo computa
un valor honesto en C1 y ahí se detiene.

**No bloquea:** captura de datos ni el vocabulario (tokens correctos y aplicados).
**Gate:** el resto se materializa cuando el foco *weapons* retome Capa 4; el eje (c) se resuelve con consumidor C2, no antes.
**Vínculo:** el mapa de gaps y el detalle de moldes viven en `gap-map.md §Capa 4` (SSoT vivo). Spec de falloff: [`damage-falloff.md`](../../references/wiki/mechanics/damage-falloff.md).
**Fuente:** `gap-map.md §Capa 4`; `references/wiki/mechanics/{punch-through,projectile-speed,recoil,damage-falloff}.md`; `docs/semantic/upgrade-tokens.md`.

## OQ-DATA-9 — Borde de entrada: los overrides son vista-consumidor legítima (no doble-merge); convergencia diferida por madurez de datos — **RE-SCOPEADA (2026-07-20 contra código)**
**Dominio:** data / integration / arquitectura de acceso

**Modelo acordado (2026-06-12, vigente):** la carga **no es una capa del flujo A→B→C→D** — es un **plano de memoria** ortogonal, direccionado por referencia. A guarda *punteros* (ids); B y la UI los *dereferencian* contra esa memoria. Regla `datos vs información`: 0 entrega *datos canónicos*; los consumidores derivan *información*.
- **Frontera β (anti-god-object):** 0 normaliza *datos* — un override es *el valor verdadero*, no un cómputo — y NO construye *información* (ni el grafo DNA del engine ni el shape display). Test de pertenencia: si X *corrige* el valor → 0; si X *deriva* del valor → consumidor.
- **Puerto y proyecciones:** `DataSource` es el puerto (ports-and-adapters: `BrowserAdapter` / `NodeAdapter`); sobre él proyectan el engine (→ DNA/grafo) y `DataRegistry` (→ display), compartiendo `browserSource`.

**Corrección de premisa (análisis 2026-07-20, con datos):** NO hay "doble-merge". Los overrides son **disjuntos por consumidor** — el engine aplica los suyos (`mod`/`weapon`/`arcane`/`incarnon`/`enemy-stats.override`, en `ModRepository`/`ItemRepository`/…), `DataRegistry` aplica `ability-stats.override` + `passives`. **Ningún override se aplica dos veces.** Y los `*-stats.override` NO son "dato-crudo que 0 deba normalizar": son **vista-CONSUMIDOR** (forma-engine). Verificado sobre Serration — `mods.json.stats` = objeto con strings pre-formateados (`"+10% Damage"`) + token @wfcd (`WEAPON_DAMAGE_AMOUNT`); `mod-stats.override.stats` = array con números por rango (`[15,30,…]`) + token D-6 (`WEAPON_ADD_DAMAGE`). **Schemas distintos a propósito**: engine-computable vs display-legible.

**Consecuencia — el corte "normalizar overrides en 0" se DESCARTA:** 0 normaliza *dato-crudo*; la vista-engine no lo es. Que cada consumidor aplique su vista **es** ports-and-adapters correcto (no el síntoma de un god-object). La frontera β sigue vigente, solo que el test *"corrige→0 / deriva→consumidor"* clasifica los `*-stats.override` como **deriva** (forma-engine), no corrige.

**Lo que queda vivo (diferido) — y su gate real:** *"un dato, ambos consumen"* **sí** es alcanzable, pero por **SALIDA**: la UI deriva sus stats de la vista-engine vía `lib/format` (el mismo proyector que `oracle view`), en vez de leer `mods.json.stats` como fuente-display paralela → eso vive en **`OQ-DATA-10`** (no acá; los dos JSON de entrada son legítimos). El gate NO es "consumidor" ni "contrato de entrada de @core" — es **madurez de datos**: overrides incompletos, contrapartes del pipeline desactualizadas, y **cero tracking de sincronización override↔pipeline**. Converger dos vistas sobre datos que no se sabe si están sincronizados = construir sobre arena. Diferido hasta que exista ese seguimiento (idea del usuario: campo `version`/patchnotes por schema — ver conversación 2026-07-20).

**Residual menor:** `lib/image-url.ts` mezcla los dos bordes — `hydrateImageFromImageName` (entrada) y `resolveLocalImageUrl` (salida/display → OQ-DATA-10).

**No bloquea:** nada. El engine ya no corre contra repos vacíos (`main.tsx` llama `loadEngineData(browserSource)` antes de `createRoot`); el oracle usa `NodeAdapter`.
**Vínculo:** **OQ-DATA-10** (borde de salida — donde vive la convergencia real por proyección) · `DC-OQ-ENGINE-9` (simetría de entrada respecto a `@core`, resuelta).
**Fuente:** debate 2026-06-12; re-scope 2026-07-17 (puerto+adapters, bootstrap, `fetch` lazy `DC-OQ-DATA-12`, colapso de islas `lib/*-data` — ejecutados); análisis 2026-07-20 (premisa del doble-merge corregida con datos; corte de entrada descartado; gate = madurez de datos).

## OQ-DATA-10 — Borde de salida: convergencia de la ruta catálogo con el proyector del engine — **ABIERTA (2026-06-12; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / presentation (owner) — par espejo de OQ-DATA-9 (data).

**Contexto:** el borde de salida (información → píxeles) tiene **dos rutas que no convergen**, cada una con su vocabulario de label y su formateo:
- **Ruta engine (C→D):** `lib/format/stat-presentation` (token D-6 → `{label, category, unit}`) + `toStatEntries` / `formatStatValue` (tabla `unit→regla`, locale-free). Proyector único, consumido por D1 (`UpgradeView`) y D2 (oráculo).
- **Ruta catálogo:** `lib/item-details` (`getAttackStats` / `getModStats`) + `lib/i18n/stat-labels`, con formateo `Intl es-ES` / `toFixed` inline en `WeaponDetailView`, `WarframeDetailView` y popovers.

**Pregunta:** ¿convergen a un proyector único, o son dos espacios de id legítimamente distintos (`@wfcd/items` humano vs tokens `WEAPON_ADD_*` del engine) que solo comparten el sumidero `StatPanel`?

**No bloquea:** nada — la UI renderiza y ambas rutas funcionan.
**Gated por:** un consumidor que necesite el mismo stat por las dos rutas con el mismo formato. Sin eso, unificar es especulativo.
**Vínculo:** OQ-DATA-9 (borde de entrada, par espejo) · `DC-OQ-ENGINE-10` (Capa E, descartada) · `DC-OQ-ENGINE-8` (sobrecarga de "Proyección", resuelta).
**Fuente:** diagnóstico 2026-06-12. Re-scope 2026-07-17 al cruzar contra código: los stages A–D y D-7 Fase 4 ya están ejecutados — proyector único, `StatEntry` único, registro token-keyed en `lib/format`, formateo locale-free centralizado y leak β muerto. Todo eso dejó de ser pregunta; la OQ describía como abierto lo que ya estaba hecho.

## OQ-DATA-11 — Compatibilidad de mods por entidad: no materializada — **ABIERTA (2026-06-12)**
**Dominio:** data / semantic / compatibilidad (hermana de OQ-DATA-1, que cubre slots)

**Contexto:** al cablear el filtro de compat del picker de mods en `UpgradeView` se destapó que la relación mod↔entidad **no está en la data**:
- **`tags:[]` vacíos.** La única señal es `compat_name` (string: `Rifle`/`Shotgun`/`Sniper`/`Pistol`/`Melee`/`WARFRAME`/nombre-de-arma/`null`). La Restricción 3 ("filtros dependen de `tags`") no puede aplicarse tal como está — el fix correcto es enriquecer los mods con compat en `tags`.
- **Matriz muchos-a-muchos ausente:** en el juego los mods `Rifle` caben en rifle+sniper+bow; `compat_name` da una sola clase y el cruce (qué clases acepta cada `family`) no vive en ningún lado. Conocimiento de dominio sin materializar.
- **Duplicados en `mods.json`** (Serration ×3, Adaptation ×2) — fuente sucia, bug de pipeline.
- **`useItemsFilters` (`domains/equipment`) no es reutilizable desde `domains/arsenal`** (Restricción 1) → mover a `@shared` si se quiere una lógica única.

**Estado del filtro (stopgap PROVISIONAL, marcado en `UpgradeView.tsx`):** compara campo-a-campo `mod.compat_name ↔ entity.family` (arma) / `entity.domain` (warframe) + dedup. Data-driven (no matriz hardcodeada), pero **incompleto** — oculta augments/universales y el cruce de tipos. Roto donde `family` no coincide literal con la clase de mod: `Afuris.family="dual pistols"` vs `compat_name="Pistol"` → picker vacío; igual `throwing`(Kunai), `sniper`/`bow`→`Rifle`. Melee/rifle/shotgun/pistol andan solo porque `family == compat_name`. Secondary queda **gated por esta OQ** (decisión del usuario: sin stopgap). **Arcanos = caso limpio** (resuelto v1): su `compat_name` ya es a granularidad de **canal** (`warframe`/`primary`/`secondary`/`melee`), match directo sin cruce M2M; solo los sub-tipos (`zaw`→melee, `kitgun`→primary/secondary, `bow`/`shotgun`→primary, ~19 arcanos) quedan ocultos. Confirma que el fix correcto es **por-fuente**.

**Pregunta:** ¿dónde/cómo se materializa la compat mod↔entidad? (espejo de OQ-DATA-1) — (a) enriquecer cada mod con `tags` en pipeline (Restricción 3 limpia); (b) matriz `family → clases aceptadas` como dato; (c) híbrido (`compat_name` base + matriz de cruce).
**Vínculo:** **OQ-DATA-1** (slots = otra cara de "qué equipa una entidad"), **Restricción 3** (`Project/CLAUDE.md`), capa "0" (compat = dato canónico que 0 normaliza). Dedup de `mods.json` toca el pipeline (OQ-DATA-9).
**No bloquea:** el loop equip→stat funciona; degrada la usabilidad del picker para tipos no-rifle.
**Fuente:** implementación del filtro de compat 2026-06-12 (`UpgradeView.tsx`).

## OQ-DATA-13 — Render de íconos/nodos de habilidad y shards: presentación duplicada sin SSoT — **ABIERTA (2026-06-13; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / presentation (hermana de OQ-DATA-10)

**Contexto:** dos conceptos de display se renderizan dispersos, sin componente/derivación única:
- **Nodos de habilidad de warframe** — `WarframeDetailView` (`AbilityCard`) y `ArsenalView` (`showAbilityNodes`) lo implementan por separado; no hay util compartida en `lib/*`. Los popovers (`warframe-details-popover`) **no** muestran íconos de habilidad y deberían.
- **Ícono de shard** — no es duplicación literal sino **divergencia**: `ArchonShardSelectionView` arma la URL con `shardImageUrl()` (`/assets/archon-shard/` + prefijo `Tauforged`), mientras `ArsenalView` (`ArchonShardsPreviewSection`) usa `resolveLocalImageUrl(entry.image_name)` (`/images/`). Dos rutas de asset distintas para el mismo ícono — peor que copia: pueden resolver a archivos distintos.

**Pregunta:** ¿dónde vive el render único de "ícono de habilidad/shard (ícono + nombre + desc)" para que los 3+ consumidores lo compartan? Mismo patrón SSoT-duplicado que OQ-DATA-10 (formateo) — un concepto de display sin fuente única. El caso del shard además exige **unificar la vía de asset** antes de compartir el componente.

**No bloquea:** función; es consistencia/DRY de presentación. Diferido con el resto del borde de salida (function-first). *(La Capa E que iba a alojar el enriquecimiento de chrome se descartó — `DC-OQ-ENGINE-10`; el SSoT de presentación es `lib/format` + componentes compartidos, no una capa.)*
**Vínculo:** **OQ-DATA-10** (borde de salida / convergencia de rutas de presentación). El mismatch UI↔engine id es síntoma vecino.
**Fuente:** anotación del usuario 2026-06-13 durante la consolidación de "0" (los flags inline originales ya no están en el código).

## OQ-UI-2 — Estado de sesión/UI del usuario: ¿dónde encaja en A→B→C→D→UI + 0? — **ABIERTA (2026-06-13; re-scopeada 2026-07-17 contra código)**
**Dominio:** ui-ux / arquitectura de estado (cruza 0, A, B, D)

**Contexto:** hay un estado que el modelo de capas (`simulation-architecture.md`) **no nombra**: el *estado de sesión de la UI* — qué slot está seleccionado, selección de shard en curso, foco/navegación transitoria. Es distinto de la intención de build (`Scene`/`ensemble-store`, A1 = *qué está equipado*): esto es *en qué está el usuario ahora mismo en la UI*. Hoy vive en `domains/arsenal/arsenal-ui-session.ts` (store `useSyncExternalStore` module-level).

**Pregunta abierta (el eje de fondo):** ¿dónde encaja el estado de sesión UI en el flujo? ¿Es un plano ortogonal (como 0 lo es para datos) que ni A ni B poseen, o React-state local sin lugar en el modelo de capas? El *qué* (nombre, hogar físico) ya está resuelto; falta el *encaje conceptual*.

**Resuelto (refactor de honestidad, 2026-06-13):** la vieja sombra `arsenal-state` fundía intención (A) + dato (0) + display/mock (B) en un shape con `ArsenalMetadataSource`. Al cruzarla, la mitad `arsenalMetadata` estaba **muerta** (0 consumidores, mock duplicado de una feature viva) → **purgada como dead-code**, no migrada. Sobrevive el estado UI-local (`ArsenalUiState`/`selectArchonShardSlot`), renombrado a `arsenal-ui-session`. Decisión de shape: es **React-state local** (hogar por vista), NO plano global ni capa E; se conserva el store module-level por la **vida cross-route** del slot (lo escribe `ArsenalView`, lo lee `ArchonShardSelectionView` tras `navigate`). Ref `DC-OQ-STUB-1`. Exemplar ya-honesto: `IncarnonEvolutionSelector` (A vía `useEnsemble` + 0 vía `useCatalog`).

**Sigue abierto:**
- El **encaje conceptual** del estado de sesión UI en A→B→C→D→UI + 0 (la pregunta de fondo).
- **Chrome de slot disperso:** nombre+imagen por slot hidratados a mano en `ArsenalView` (`Registry.getItemById` en `useEffect`) y `SLOT_DEFINITIONS` (labels/desc/iconos inline). Es lectura de 0 inconsistente — deuda de consistencia menor (la Capa E que iba a centralizarlo se descartó, `DC-OQ-ENGINE-10`; el patrón vigente es leer 0 directo). Los candidatos de formateo/íconos ya están en OQ-DATA-10/-13.

**No bloquea:** la UI funciona.
**Vínculo:** **OQ-DATA-9** (0 / borde de entrada), **`DC-OQ-ENGINE-9`** (Capa A / intención respecto a `@core`, resuelta), **OQ-DATA-10/-13** (lo display deriva de la proyección), **OQ-UI-3** (la confirmación de pérdida consulta el estado "sucio" de esta capa), `DC-OQ-ENGINE-10-C` (modelo de 2 canales / separación de ejes). El mismatch UI↔engine id es síntoma vecino.
**Fuente:** TODO inline del usuario en la vieja sombra `arsenal-state`; debate 2026-06-13.

## OQ-UI-3 — Footer: acciones contextuales de navegación + patrón de confirmación (gated por sistema de guardado) — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / interacción + navegación

**Contexto:** El `HubFooter` (`domains/hud/footer/`) cumple función de navegación **parcial** (back a la zona anterior), no completa. Su composición varía por zona; en `item-details` implementa acciones stub: **BUILD**, **SIMILAR**, **WIKI**. La doc de UI/UX casi no lo cubre (estructura "parcialmente" definida, decidida solo en términos de responsabilidad). Comportamiento esperado, no consolidado:
- **BUILD** — equipar el ítem actual y navegar a `upgrade` directo. Slot vacío → equipa y navega (o pregunta). Si **ya hay algo equipado con build en curso** → dispara un **patrón de confirmación** ("¿guardar build actual?") porque la acción puede **perder progreso**.
- **WIKI** — abrir el link oficial (EN) del ítem en otra pestaña.
- **SIMILAR** — diferible.

**Dependencia dura:** el flujo BUILD-con-confirmación **depende de un sistema de guardado de builds que aún no existe**. No se puede consolidar el flujo sin decidir ese sistema primero.

**Preguntas abiertas:**
- **Patrón de confirmación de pérdida de progreso** como primitiva de UI reutilizable (no solo footer): ¿dónde vive, cómo se dispara, qué estado consulta ("¿build guardada/sucia?" → OQ-UI-2)?
- **Sistema de guardado de builds** — inexistente, es el bloqueante real. ¿Persistencia local? ¿shape? ¿relación con la `Scene`/A?
- **Modelo de navegación del footer**: contrato de qué acciones expone por zona (item-details vs arsenal vs …) — hoy ad-hoc.

La campaña de documentación UI/UX ya se **completó** (2026-06-16; `docs/domains/ui-ux/` tiene status/decisions/workflow activos) — pero el **footer y el modelo de interacción siguen sin consolidar**, que es lo que esta OQ cubre. Principio: derivar de **D2 (oráculo/CLI)** + dominio, **no** anclar contratos al stub actual.

**No bloquea:** la UI navega (footer stub anda). **Bloquea:** flujo BUILD real (gated por guardado).
**Vínculo:** **OQ-UI-2** (estado de sesión/UI), **OQ-DATA-1** (materialización de slots para upgrade), **OQ-DATA-10/-13** (presentación). Sistema de guardado = nueva área sin OQ previa.
**Fuente:** TODO inline del usuario en `HubFooter.tsx`; debate 2026-06-13.

---

## OQ-UI-4 — Profile como "utility hub" (no mapeo de Equipment) + dimensión social diferida — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / producto

**Contexto:** `ProfileView` (`@todo` pendiente, gated por materialización del Builder/Arsenal) no está definido como "se va a implementar". El concepto del usuario: una **réplica del profile de Warframe pero enfocada a utilidades** —"qué incarnon tengo", "qué armas kuva tengo", etc.—, una especie de **companion-hub de cosas específicas**, **no** un mapeo de Equipment ni de builds guardadas. Va a existir, pero sin forma cerrada; "debo desarrollarlo muchísimo".

**Pregunta:** ¿Cuál es el shape de Profile como vista de utilidad (qué consulta, sobre qué estado/inventario), distinta de Equipment (browsing) y del Arsenal (build activa)?
- **Sub-eje social (diferido fuerte):** una dimensión tipo overframe.gg (compartir/social) requeriría **usuario + base de datos + despliegue no-local**, muy lejos del scope actual (function-first; aún no existe ni 1/3 de capa A→D). Interesante, no prioridad.

**No bloquea:** nada (Profile es stub `@todo`).
**Vínculo:** OQ-UI-2 (estado de sesión/UI), OQ-DATA-1 (materialización de slots). Persistencia/usuario = área nueva sin OQ previa.
**Fuente:** TODO inline del usuario en `ProfileView.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-UI-5 — OptionsView: tabs de configuración + decisión de NO-i18n (incompatibilidad con overrides de "0") — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / configuración (cruza data/0)

**Contexto:** `OptionsView` debería organizarse en **tabs de paneles** (display / graphics / audio / accessibility); hoy solo existe `display` con el theme-selector. El resto es a futuro (animaciones/efectos BLUR/CANVAS, audio).

**Sub-punto con peso real — NO-i18n (de momento):** se **descarta** implementar i18n ahora. `@wfcd/items` **sí provee** i18n, pero **no es compatible** con el sistema de **overrides manuales** de piso 0: por su naturaleza de mantenimiento manual, mantener traducciones sincronizadas es inviable hoy. Deseado a futuro, no prioridad. Esto **cruza OQ-DATA-9/0** (qué es dato canónico) y el estrato `lib/format` (`DC-OQ-ENGINE-10-A` / OQ-DATA-10, labels/locale).

**Pregunta:** ¿Contrato de paneles de configuración (qué persiste, dónde) y condición para reabrir i18n (¿requiere resolver la compat overrides↔traducciones primero?)?

**No bloquea:** nada (theme-selector funciona).
**Vínculo:** OQ-DATA-9 (0 / dato canónico), OQ-DATA-10 + `DC-OQ-ENGINE-10-A` (`lib/format`/locale), OQ-UI-2 (persistencia de preferencias).
**Fuente:** TODO inline del usuario en `OptionsView.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-UI-6 — Revisión funcional del menú de navegación + gestión de inputs/jerarquías — **ABIERTO (2026-06-13)**
**Dominio:** ui-ux / interacción + navegación

**Contexto:** `DialogMenu` funciona y replica en buena medida el menú de Warframe, pero merece una **revisión funcional** (no estética) como componente principal de navegación. Síntomas: la navegación puede ser tosca para una web-app; el control por `esc` **choca** con otras funcionalidades (cerrar otro diálogo / salir de un input) → posible necesidad de un **sistema dedicado de jerarquía de inputs** que evite saltos del menú.

**Sub-eje arquitectónico:** ¿usar **headless UI** aquí es contraproducente? No expone una API como tal; gestionarlo vía React con estados globales puede ser over-engineering. Contrastar con una **capa de captura propia — desacoplada, genérica y react-free** que React consuma (el principio "núcleo react-free que React solo consume", aplicado a **inputs/navegación**, no a presentación). Ojo: evaluar el impacto real antes de reescribir (anti-reescritura).

**Pregunta:** ¿El proyecto necesita un gestor de inputs/jerarquías dedicado (react-free, consumido por React), o basta endurecer el manejo de `esc`/foco sobre lo actual? ¿headless UI suma o estorba en el menú?

**No bloquea:** nada (el menú navega correctamente).
**Vínculo:** OQ-UI-3 (footer / modelo de navegación), OQ-UI-2 (estado de sesión/UI).
**Fuente:** TODO inline del usuario en `DialogMenu.tsx`; triage de user-TODOs 2026-06-13.

---

## OQ-ENGINE-11 — Exaltadas: derivación de intención estructural en A1 — **ABIERTO (2026-06-16)**
**Dominio:** engine / Capa A (intención) — downstream del eje *estructura* de `U-3` ([`../domains/ui-ux/decisions.md`](../domains/ui-ux/decisions.md))

**Contexto:** el barrido de UI (campaña ui-ux) trazó `SLOT_DEFINITIONS` (chrome hardcodeado) hasta un hueco de la Capa A: las **exaltadas** (Reguladoras de Mesa, Exalted Blade, Venari, etc.) **no están modeladas, no hay datos**. Vestigio del `loadout` de V1. `U-3` aisló esto como la materialización *dinámica* del eje *estructura/contexto de aplicación* (lo que `SLOT_DEFINITIONS` hoy hardcodea estático).

**Hipótesis establecida (puntos clave del debate — NO re-litigar):**
1. Exaltada = **intención estructural derivada** → vive en **A1** (no A2 = condicionales de combate; no B).
2. La derivación corre en la **acción de equipar** del ensemble (dispatch): `equipWarframe` lee "0" (el hecho "otorga exaltada" del dato de habilidad) → escribe **ambos** punteros (warframe + exaltada derivada) en A1 al mutar. **Sin círculo B→A1** (el puntero nace en A1, no se descubre en B).
3. A1 = punteros puros (la lógica vive en la acción). Nodo derivado: flag `origen:derivado` + **acciones recortadas** (p. ej. solo `Upgrade`, sin `Swap`) = la entry `secondary_weapon` clonada y recortada.
4. B = hidratación agnóstica pura (deref de A1, sin inyección estructural).
5. Exaltada = arma de **canal real** (p. ej. `secondary`) → el ruteo agnóstico de buffs de C la alcanza **gratis** (un arcano de secundaria buffea también Reguladoras). Confirma que va en A1, no como conditional. **El "gratis" ya está construido:** `resolve/hydration/channel-routing.ts` resuelve canal → **`EntityId[]`** filtrando entidades por su `channel` (que `StaticHydrator` estampa al construirlas). Una exaltada que nazca como entidad con `channel: 'secondary'` la alcanza sin tocar el ruteo. La firma-lista es deliberada por esto: con firma escalar la exaltada le pisaría el slot al arma equipada. Verdad del juego que lo exige: `references/wiki/archon-shards/archon-shard.md` — *"Affects Exalted Weapons of the appropriate class"*.
6. Re-derivación **continua**: cambiar warframe re-corre la acción; la **política de mods huérfanos** vive ahí.

**Preguntas abiertas (requieren datos):** schema del dato de exaltada (¿`weapons` + marcador granted-by / canal / fixed? *lean:* nuevo JSON, no muy distinto de `weapons`) · shape de la declaración en el modelo de habilidad · política de mods huérfanos al re-derivar · **escalado cruzado** (exaltada ← power strength) = ability-like, **RED**, sub-concern separado.

**Método (data-first):** 1 exaltada real → nuevo JSON → inyectar vía **oracle (CLI/D2)** → testear `A1→B→C` → recién generalizar. No resolver sobre supuestos.

**El borde de la premisa 5: la exaltada recíproca.** [`exalted-weapon.wikitext`](../../references/wiki/mechanics/exalted-weapon.wikitext) declara que *"**Sirius** and **Orion** function as an 'Exalted' Warframe of each other that is **separately moddable**"*. La derivación de A1 (premisa 2) le sirve tal cual —un puntero derivado que nace al equipar—, pero el ruteo por canal (premisa 5) no tiene dónde aterrizarla: `channel: 'secondary'` presupone que lo derivado es un **arma**, y acá lo derivado es un warframe. No re-abre la hipótesis; marca hasta dónde llega y suma una fila a las preguntas de schema. Único caso conocido de esta forma.

**No bloquea:** nada (diferido). **Estado:** no se modelará de inmediato; el usuario arranca el **prototipo** apenas cierre tareas en pausa.
**Vínculo:** **`U-3`** (su upstream estructural), **OQ-UI-2** (que ya lista exaltadas como caso de slot-modeling junto a Jade Aura×2 / Sevagoth Shadow / companions modulares — UI-2 = layout de slots; ésta = mecanismo de derivación en A1), **OQ-ENGINE-7** (materialización de nodos de atributo).
**Fuente:** debate de la campaña ui-ux (2026-06-15) + promoción a ID real en el cruce de consolidación (2026-06-16).

---

## OQ-ENGINE-12 — Puncture (crit condicional) no aplica a AoE/habilidades de warframe — **ABIERTA, gateada**
**Dominio:** engine / C2 (micro-arquitectura de daño y status)

**Lo único que sigue vivo de esta OQ:** el gancho de crit condicional (Puncture/Cold) cerró — ver
`DC-OQ-ENGINE-12`. Las ausencias de fidelidad que sostenía (Cold cap 4 con Overguard presente, freeze
sólido al 10º stack) eran "qué hacer" ya sabido, no debate — se destilaron a Issues de GitHub
(`docs/CLAUDE.md` §Frontera `open-questions.md` ↔ GitHub Issues).

**Lo que queda:** Puncture no aplica su buff de crit a daño de área (AoE) ni a habilidades de
warframe — el gate está ausente en el código, pero es irrelevante hoy porque el modelo de combate son
hits de arma y no hay AoE modelado todavía. Se gatea cuando exista AoE.

**No bloquea:** el núcleo; Puncture/Cold ya entran a v1 con fidelidad de suelo.
**Vínculo:** `DC-OQ-ENGINE-12` (el gancho), `damage-status-model.md`.
**Fuente:** debate de modelado C2 (2026-07-02); implementación del gancho + re-scope 2026-07-20.

---

## OQ-ENGINE-14 — Alcance del modelado melee: ¿qué estrato entra primero? — **PROMOVIDA A DISEÑO (2026-07-05)**
**Dominio:** engine / C1 (base estadística) + C2 (combo simulado)

**Resuelta y promovida.** La OQ creció hasta ser una mecánica completa (melee combo engloba casi todo lo melee), así que se **promovió a un doc de diseño propio**: [`../domains/engine/design/melee-combo.md`](../domains/engine/design/melee-combo.md) — **SSoT vivo** de la mecánica, incluido su worklist (lo resuelto sentenciado, lo diferido como estado abierto *dentro* del doc).

**Respuestas (cerradas):** el primer ladrillo fue el **hit-base determinista** (estrato 1, ejecutado sin cambios al motor); el combo multiplier **reusa el patrón §8/§9 como mecánica hermana de CO** (factor declarado→emergente), **no** una vía nueva; heavy/slam entran como **perfiles `attacks[]`**. Diferidos (viven en el doc): C2 dinámico del counter, Blood Rush/Weeping Wounds, slam-por-distancia (falta dato), HAE/wind-up, passives que desvían la tabla, y la capa genérica de combo (§10, ≥2 casos reales).

**Vínculo:** [`../domains/engine/design/melee-combo.md`](../domains/engine/design/melee-combo.md), `../domains/engine/design/arch-decisions.md` §8/§9/§10, `references/wiki/mechanics/melee-combo.md`.
**Fuente:** pausa teórica 2026-07-04 + estrés/promoción 2026-07-05.

## OQ-ENGINE-15 — Fórmula de DR de armor enemigo: conflicto de 3 vías — **ABIERTO (2026-07-06)**
**Dominio:** engine / C2 (mitigación del target)

**Contexto.** Al modelar el escalado de enemigo (contraste #0, Arid Butcher), la fuente que trae los stats escalados —el **gadget del calculador del wiki** (`references/temp/ext.gadget.enemyinfoboxslider-script-0.js`)— computa la DR de armor como `DR = √(3·AR)/100`. Eso **contradice** dos capturas previas de `references/*`, que a su vez se contradicen entre sí:

| Fórmula | Fuente | DR @AR 200 | @2700 |
|---|---|---|---|
| `√(3·AR)/100` | gadget del calculador (adoptada) | 24,49% | 90% |
| `0.9·AR/2700` (lineal U36) | `enemy-resistances.md` (SSoT declarada) + decisión provisional 2026-07-02 | 6,67% | 90% |
| `AR/(AR+300)` (era vieja) | pre-U36 | 40% | 90% |

Las tres coinciden en el cap (90% @2700) pero divergen fuerte abajo. La propia wiki está **auto-desincronizada** entre sus páginas y su gadget — no es un problema nuestro de resolver, sino de **normalizar** cuál adoptar.

**Decisión provisional (usuario, 2026-07-06):** el engine adopta **`√(3·AR)/100`** (`damageReductionFromArmor`, `EnemyRepository.ts`) — es la fuente más honesta HOY: la que usa el calculador del wiki y la comunidad como referencia. **NO se deprecan** las otras capturas ni se toca `references/*` por ahora (la reconciliación queda para este OQ). El #0 valida contra el calculador (health exacto; DR/EHP reproducen el calculador, cuya DR es esta fórmula provisional).

**Condición para resolver:** contraste **#1** (un popup de daño real contra Arid Butcher) — el primer número de mitigación que el juego SÍ muestra. Ahí se confirma o se tira `√(3·AR)/100` contra el juego, y recién entonces se normaliza `references/*` (reconciliar `enemy-resistances.md` ↔ `enemy-level-scaling.md`) y se cierra este OQ.

**Precisión añadida (verificación de estabilidad, 2026-07-09):** la fila `AR/(AR+300)` de la tabla NO es
"era vieja" en abstracto — `references/wiki/mechanics/{armor.md,damage-reduction.md}` confirman que es
la fórmula **vigente y correcta para Tenno** (jugador), coeficiente 300 explícitamente descrito como
"escala estándar para Tenno". El conflicto de 3 vías es exclusivamente sobre DR de **enemigo**; no hay
conflicto en la fórmula de jugador. Esto re-diagnostica (no resuelve) el checkpoint 2 de la
reconciliación de `resolveHit` (`damage-status-model.md`): la fórmula vieja que tenía `resolveHit` no
era "una DR incorrecta" sin más — era la fórmula de Tenno aplicada a un target enemigo.

**Manifestación en código:** `formulas/enemy/ehp.ts` (`EHP = Health×(Armor+300)/300`, huérfana) computa exactamente la DR "era vieja"/Tenno de esta tabla, mal ubicada bajo `enemy/`. El CLI oráculo (lente `enemy`) usa la DR adoptada vía la primitiva correcta `formulas/enemy/effective-health.ts`. `ehp.ts` queda disponible (sin consumidor) para cuando exista EHP de jugador, con docstring corregido para no confundir.

**⭐ Cuarta fuente, y coincide con la adoptada.** `references/wiki/mechanics/damage-calculation.wikitext`
da el damage modifier canónico como `DM = 1 − 0.9·√(AR/2700)`, que es **algebraicamente idéntica** a
`√(3·AR)/100` (`0.9/√2700 = √3/100 = 0.017320`). No es una cuarta vía del conflicto: es la misma ley
escrita de otra forma, en una página que ninguna de las tres capturas previas citaba.

**Qué cambia y qué no.** La adoptada deja de ser *"la del gadget"* y pasa a estar respaldada por la
**página de cálculo de daño de la wiki**, que es fuente de mecánica y no herramienta de comunidad —
sube el piso de confianza sin cerrar la OQ. **La condición para resolver sigue siendo el contraste #1**
(popup de daño real): dos fuentes que coinciden entre sí no son el juego, y `enemy-resistances.md`
sigue sosteniendo la lineal. Lo que sí queda descartado es que la adoptada fuera la opción *menos*
respaldada de las tres.

**Vínculo:** `references/wiki/mechanics/{enemy-level-scaling.md §Armor, enemy-resistances.md §DR, armor.md, damage-reduction.md}`, `references/temp/ext.gadget.enemyinfoboxslider-script-0.js`, `Project/src/core/engine/formulas/enemy/{armor-mitigation.ts (movido de EnemyRepository.ts en P1, 2026-07-09), effective-health.ts, ehp.ts}`.
**Fuente:** eje enemigo / contraste #0 (2026-07-06); verificación de estabilidad pre-C1 (2026-07-09).

---

## OQ-ENGINE-16 — Fidelidad de N-declarado vs. timers reales para stacks de status (C1) — **ABIERTA (2026-07-09)**
**Dominio:** engine / C1 (input declarado) + C2 (timers de status)

**Contexto.** Doctrina §8 (`arch-decisions.md`): toda mecánica C2 se modela primero en modo **input declarado** ("asumo N stacks") antes que simulado (el valor emerge de una timeline). Para el clúster de status-stacks (Viral/Magnetic/Corrosive — `c2/stack`=42 del roadmap, Galvanized-like) **las fórmulas del multiplicador ya están cross-validadas** contra `references/wiki/mechanics/status-effects.md` (verificado in-game): viven en `formulas/status/stack-debuff.ts` (Viral/Magnetic `first + perAdd×(n−1)`, Corrosive `min(0.26+0.06×(n−1),1.00)`). **No es la fórmula lo que falta.**

**Lo que falta:** el comportamiento real de cada stack es **timer independiente por instancia, con decay/reemplazo propio** (confirmado empíricamente, `damage-status-model.md`). Declarar N estáticamente asume un snapshot fijo, pero el juego tiene stacks entrando y venciendo escalonados. **¿Hasta qué punto un N declarado es fiel** antes de que el número mienta (infle/desinfle)? El clúster trae además **2 modelos de decay divergentes** ("expiran juntos" vs "incremental 1-stack") sin resolver cuál aplica a qué caso.

**Método (no re-litigar, aplicar):** mismo patrón que double-dipping (`DC-OQ-ENGINE-13`) — la fórmula "sonaba" simple y no lo era hasta estresarla in-game. **No se resuelve teorizando:** se elige un caso real (candidato: primer Galvanized real, o el `c2/stack` de mayor payoff) y se estresa con dato antes de generalizar.

**Estado del tracker (verificado 2026-07-17):** el motor **no tiene tracker real de acumulación para ninguna familia** — `stacks`/`activeStacks` se declaran a mano por variable de contexto (`SimulationEngine`, default 0/1). Confirma el diagnóstico: el resolver **no intenta** modelar decay, aun teniendo el dato (`notes[]` documenta `duration` por mod), a propósito.

**Caso hermano — NO fusionar:** el buff-on-event con cap (Merciless/Deadhead/Galvanized, `STACK_DECAY_BUFF`, `arch-decisions.md §11`) comparte la tensión (¿N declarado sin timer es fiel?) pero **es otro mecanismo** que el clúster `c2/stack`=42 de status: buff propio on-event vs. procs del target, fórmulas y fuentes de N distintas. Se ejecutó C1-declarado puro (sin timer) — dejó esta OQ **donde estaba a propósito**. Capturar por separado (precaución explícita del usuario).

**Destilado a Issue, no resuelve esta OQ:** el caso real de dos emisores con caps
distintos (`references/ingame-tests/status-stack-caps.md`) exigió que `StackState { count: number }`
pase a instancias —espejo de `DotState { pulses: DotPulse[] }`— por una razón **independiente** de la
fidelidad del N declarado, que sigue abierta acá (dos razones distintas para el mismo cambio). El
refactor por sí solo no contesta esta OQ — ver el Issue de `StackState`→instancias
(`docs/CLAUDE.md` §Frontera `open-questions.md` ↔ GitHub Issues).

**No bloquea:** el modo-input declarado es válido como techo donde el consumidor acepta "asumido, no simulado" (mismo espíritu que CO estático). Bloquea sólo la confianza en la FIDELIDAD del número para el clúster de 42 casos.
**Vínculo:** `damage-status-model.md` (timers independientes — el estado del receptor ya los lleva, lo que sigue abierto acá es si declarar N es *fiel*), `arch-decisions.md §8` (doctrina) + `§11` (caso hermano), `OQ-DATA-4` (evidencia cruzada de schema).
**Fuente:** debate 2026-07-08; cristalizada en la verificación de estabilidad pre-C1 (2026-07-09).

## OQ-ENGINE-18 — Status Duration en DoT: ¿más ticks o ticks estirados? (A vs B) — **ABIERTO (2026-07-10)**
**Dominio:** engine / C1-timeline (ancho del pulso de DoT) — depende de dato in-game

**Contexto.** El modelo de timeline de DoT (`../domains/engine/design/damage-status-model.md` §Modelo de
timeline) trata cada instancia como un **pulso** `{inicio, ancho, amplitud}`. Un mod de **Status Duration**
ensancha el pulso, pero NO está verificado CÓMO:
- **(A) más ticks a intervalo fijo** → +100% dur. = 12 ticks en vez de 6 → **daño total sube ×2**.
- **(B) los mismos ticks a intervalo estirado** → 6 ticks repartidos en 12s → **daño total igual**, solo más lento.

Ambas coinciden en "el proc dura más" — por eso la observación de duración **NO las distingue**.

**Test decisivo (in-game):** **sumar el daño total** del DoT con y sin Status Duration (duplica → A; igual
→ B), o contar los números de tick que aparecen. NO observar si "dura más" (ambas lo hacen).

**Lo que la wiki dice hoy:** `references/wiki/mechanics/status-effects.md` solo especifica el escalado de
duración para **Blast/Heat/Electricity**; para el resto (Slash/Toxin/etc.) es **hueco de dato**, no ley.
Lean del equipo = **(A)** (Status Duration es multiplicador de daño conocido en builds de DoT — nadie lo
correría si fuera B), pero **sin verificar cuantitativamente**.

**Ramificación a los stack-debuffs (no confundir):** para Viral/Corrosive (capeados) "más duración" NO
sube el techo — el strip que dan sus stacks es el mismo; sube el **uptime** (los stacks decaen más
lento). Lo que sí mueve el techo es otro eje, y por eso no se confunden: el cap de **stacks** (Emerald
Archon Shard) sube cuántos caben, y con 14 el strip de Corrosive llega al 100 %. Es una
consecuencia distinta del eje A/B del DoT; testear por separado (DoT → ¿sube el total? / debuff → ¿sube el
uptime?).

**No bloquea:** la agregación de pulsos **declarados** (`formulas/status/dot-timeline.ts`, Slice 3a) — ahí
el ancho se declara directo ("6 ticks"), no se deriva del mod. A/B solo importa cuando se derive el ancho
desde un valor de Status Duration.

**Vínculo:** `../domains/engine/design/damage-status-model.md` §Modelo de timeline (el pulso y sus 5
fronteras), `OQ-ENGINE-16` (fidelidad N-declarado vs timers — eje hermano de duración/decay),
`references/wiki/mechanics/status-effects.md` (escalado de duración documentado solo para Blast/Heat/Electric).
**Fuente:** debate 2026-07-10 (Slice 3, modelo de timeline); observación in-game del usuario, pendiente de comprobación cuantitativa.

---

## OQ-ENGINE-19 — Generador discreto de N proc-slots a Status Chance >100% — **ABIERTO (2026-07-11)**
**Dominio:** engine / C1-población (eje RNG del DoT) — depende de dato in-game / doc oficial

**Contexto.** El eje Población del frame de C2 (`../domains/engine/design/damage-status-model.md
§Población/RNG`) modela cuántos proc-slots dispara un pellet cuando su Status Chance supera 100%. La
wiki confirma el **mecanismo** (cada hit puede aplicar más de un status, cada slot dibuja su tipo
independiente — `references/wiki/mechanics/status-effects.md §Aplicación`, cita literal + nota de
parche `{{ver|27.2}}`) pero no da la fórmula exacta del **generador discreto**: cuántos slots produce,
ej., un SC=234%.

**Hipótesis de trabajo, no confirmada:** floor+remainder, por analogía con el generador YA confirmado
de Multishot (`references/wiki/mechanics/multishot.md`: `Guaranteed=floor(total)`, `Extra
Chance=frac(total)`). Plausible (misma familia de mecanismo), pero la wiki de Status Chance nunca lo
escribe letra por letra para status — a diferencia de multishot.

**Por qué no bloquea:** para el total esperado y la curva esperada, el valor exacto del generador es
irrelevante — por identidad de Wald, `E[N]=chance` alcanza sin importar la distribución completa de N.
Solo importaría para un futuro sampler de corrida individual (Monte Carlo, varianza) o para UI que
muestre "qué pasó en este hit exacto" — ninguno de los dos existe hoy.

**Ramificación — folding contra el cap del primitivo de stack (no confundir).** Si N≥2 slots del mismo
efecto stack-debuff (Corrosive, Viral, etc.) nacen del mismo hit simultáneamente, ¿el primitivo de
N-timers/cap-K (`damage-status-model.md §primitivo reusable`) los pliega secuencial (cada uno chequeando
el estado ya actualizado por los anteriores del mismo hit) o hay una regla especial para eventos
co-instantáneos? Sin evidencia in-game ni wiki que lo distinga. Gated por la brecha YA existente de
`EntityState.processDots()` (pool lineal, no N-timers) — no es un gate nuevo, solo se vuelve relevante
cuando esa brecha se resuelva.

**Vínculo:** `../domains/engine/design/damage-status-model.md §Población/RNG` (debate destilado; scratch `.working/` purgado), `OQ-ENGINE-18` (mismo patrón de hueco —
fórmula de promedio conocida, generador discreto no).
**Fuente:** debate 2026-07-11 (eje Población/RNG, tramo b); captura in-game del usuario (Exalted Blade,
SC=200,6%, 3 stacks de Corrosive de 1 hit — confirma que el mecanismo existe y permite same-type
multi-stack, no confirma el conteo exacto).

---

## OQ-ENGINE-20 — La frontera de congelación: qué determina el proc, qué evalúa el tick — **ABIERTO (2026-07-13)**
**Dominio:** engine / C2 (modelo de proc/DoT) — el eje está medido; falta ubicar la línea

**Contexto.** El tick de un DoT compone dos cosas de naturaleza distinta: una **base que el proc
determina al nacer** y un **contexto que el tick evalúa al emitir**. Lo que la evidencia ya reparte:

| Lado | Qué le pertenece | Medición |
|---|---|---|
| **Base** — la determina el proc | `modded_base` físico del arma, `own_element`, `status_damage` | `references/ingame-tests/dot-scaling.md` Test 1: el hit subió `114 → 171` al agregar Heat y el Slash DoT **no se movió** de 45 |
| **Contexto** — lo evalúa el tick al emitir | pool② del emisor (al cuadrado), `Damage Vulnerability` (single), matriz③/armor | `references/ingame-tests/damage-buckets.md` Test 7: seis razones independientes, error máximo 0.13% |

**Lo que se cayó, y hay que dejarlo escrito para no re-derivarlo.** Esta pregunta era *"bajo drop del
buff, ¿cae sólo la mitad live o muere todo?"*, sobre la premisa de que el tick fuera `snapshot(hit
resuelto, con buffs source horneados) × live(re-aplicación)`. La premisa no se sostiene por tres lados
independientes:

1. **El DoT no hereda el hit resuelto** — Test 1 de `dot-scaling.md` (arriba): el hit se movió y el DoT
   no. La base sale del arma por una regla propia del tipo de DoT.
2. **La "huella dura" era una inferencia no forzada.** De `DoT ÷ base = 4.53 = 2.128²` se concluía que
   *"el mismo multiplicador vive en las dos mitades"*. El mismo número sale de **una sola evaluación con
   exponente 2** — que es lo que la fórmula autoritativa declara literalmente: `× (1+faction)²`.
3. **El código tampoco lo congela:** `dotModdedBase` lee sólo `WEAPON_ADD_DAMAGE`. No hay un solo lugar
   —evidencia, fórmula ni implementación— donde el buff del emisor esté congelado.

**Posición vigente:** el factor del emisor vive **entero** del lado que se evalúa al emitir, así que al
caer el buff **cae entero** — el tick vuelve al valor sin buff, no a un intermedio. No es una de dos
opciones empíricas: es consecuencia de la fórmula. Concuerda con la observación replicada del usuario
(ver el DoT caer exactamente al número sin buff, nunca a uno intermedio), que es discriminante porque el
intermedio estaría `×1.6`–`×2.13` más arriba: no es un margen fino que la vista pueda confundir.

**Lo que sigue abierto: dónde cae exactamente la línea.** El **combo de melee** es el caso que la ubica,
porque cae justo en el medio: entra al hit del heavy attack pero **no es un stat del arma**. Decide si la
frontera corre por *"lo que entró al hit"* o por *"lo que pertenece al arma"* — y las dos lecturas
sobreviven a todo lo medido hasta hoy.

**Por qué importa.** Define qué lleva adentro la Instancia que C1 le pasa a C2: si lo que el suceso
guarda es *"el resultado del hit"* o *"un puntero al emisor"*. Lo primero conserva la agnosticidad
source; lo segundo la rompe a propósito — *fidelidad*, no accidente.

**Alcance (de-conflación).** El double-dip **steady-state** `(1+Σpool②)²` (toda la data medida) NO es parte
de este OQ: es **(A)**, decidido (`DC-OQ-ENGINE-13`) y **build-debt** gated por poblar el pool②
(`../domains/engine/status.md §Deudas`). Esta pregunta no lo bloquea.

**Test que lo cierra:** `references/ingame-tests/pending.md` **P-10** — con su paso previo (¿el combo
entra al DoT, siquiera?) y el par que lo aísla: heavy attack normal (gasta el 100% del contador) vs.
heavy attack con **Tennokai** (no consume nada), comparando el mismo tick.

**Vínculo:** `references/ingame-tests/pending.md` **P-10** (la tirada), `dot-scaling.md` + `damage-buckets.md`
§Test 7 (las dos mediciones que reparten), `../domains/engine/design/damage-status-model.md §Modelo unificado de proc`,
frontera "coupling Viral-en-vivo/snapshot" (5 fronteras del timeline, `decision-frontier.md §4`),
`OQ-ENGINE-16` (mismo eje de fidelidad temporal: N-declarado vs. timers reales), pool② gating.
**Fuente:** debate 2026-07-13 (ontología instancia/proc); re-scopeada al medir que la premisa
`snapshot(hit resuelto) × live` era una inferencia no forzada sobre `4.53 = 2.128²`.

---

## OQ-DATA-14 — Armas/entidades modulares: ensamblaje de DNA desde piezas — **ABIERTO (2026-07-09)**
**Dominio:** data / hidratación ("B", hipótesis tentativa — no confirmado)

**Contexto.** Durante el barrido de clasificación de arcanes (DC-OQ-ENGINE-17) se detectó que un subconjunto
del corpus `upgrade_type:null` cuelga de armas/entidades **modulares** — no una pieza única con stats
propios, sino **N piezas que se combinan** para producir el DNA final (stats base, tipo de daño, etc.):
**Zaw** (strike+link+grip, 5 arcanos), **Kitgun** (chamber+grip+loader, 7 arcanos), **Amp** (prism+scaffold+brace,
5 arcanos) ya confirmados con arcanos propios en el dataset; **MOA** y **Hound** son la misma "bolsa"
conceptual (compañeros modulares) aunque hoy no tienen arcanos propios capturados en `arcanes.json`. Lo que
cambia entre casos es únicamente **qué piezas** se combinan y **con qué regla** — el problema de fondo
("construir un DNA canónico a partir de N componentes") es el mismo.

**Hipótesis (tentativa, "entre comillas" — no se investiga todavía):** el ensamblaje es responsabilidad de
**B** (hidratación/materialización), no de C — mismo principio que `§1` (Weapon = nodo canónico principal:
C opera sobre el nodo ya hidratado, agnóstico a su origen) y el precedente de exaltadas (`OQ-ENGINE-11`,
la derivación vive en A1/B, no en C). Sin confirmar contra datos reales todavía.

**Condición para resolver:** cuando se decida atacar el modelado de armas/entidades modulares — primero
traer información real de la wiki por tipo (piezas, reglas de combinación) y construir la teoría desde
ahí, no antes (mismo método que CO/melee-combo: no diseñar la abstracción sin el corpus enfrente).

**No bloquea:** el resto del engine, ni el barrido de arcanes no-modulares (ya separado en DC-OQ-ENGINE-17).
**Bloquea:** modelar los arcanos Amp/Zaw/Kitgun-específicos (22 arcanos parkeados: 5 amp + 5 zaw + 7 kitgun,
más los 17 de Operator que quedan gated aparte por falta de foco en el Operador, no por este eje); build
completo de cualquier Zaw/Kitgun/Amp.
**Vínculo:** **DC-OQ-ENGINE-17** (el disparador — barrido de arcanes, 2026-07-09), **OQ-DATA-1** (par cercano
pero eje distinto: DATA-1 = *layout de slots* de companions modulares; ésta = *cómputo de stats* del DNA
ensamblado).
**Fuente:** debate 2026-07-09, barrido de corpus arcane (DC-OQ-ENGINE-17).

---

## OQ-DATA-15 — Campo `faction` contaminado del enemigo: quiebra scaling + FACTION_BONUS — **ABIERTA — síntoma resuelto, causa raíz upstream sin acotar**
**Dominio:** data / "0" (DataRegistry) → engine (scaling + matriz③)

**Contexto:** el campo `faction` de `enemies.json` **no es la taxonomía real de facciones**. De 638 entries
con `faction`, muchas traen valores que no son facción: categorías de arma (`Shotgun`, `Rifle`, `Melee`),
rol de IA/allegiance (`Neutral`, `Predator`, `Prey`), u otros (`Orbiter`, `Warframe`). La lista real (wiki
`Factions`) son 14 y no incluye ninguno de esos. Es el mismo patrón "tipo de carne/escudo" de Damage 2.0:
un campo de la fuente (`@wfcd/items`) que el engine trata como input vivo pero que mezcla ejes.

**Dos consumidores lo keyean — ambos degradados en silencio:**
- **Scaling** (`enemy-scaling.ts` vía `ItemRepository.normalizeEnemy`): `HEALTH_COEF[faction]` / `SHIELDS_COEF[faction]`
  → facción no reconocida cae al **default** (health: grupo Unaffiliated tras el fix F5; shields: Grineer,
  elección de código). El enemigo escala con una curva que no es la de su facción real.
- **FACTION_BONUS** (`targetFactionMult(token, dna.faction)`, matriz③ de `resolveHit`): `FACTION_BONUS[token]?.[faction] ?? 0`
  → facción-basura ⇒ **bonus 0** (no se aplica el bonus anti-facción). *(`resolveHit` corre en producción
  por D2 —`oracle metrics`, `DC-2`—, así que el defecto no sólo es real: es alcanzable.)*

**Resolución (2026-07-22) — opción (b), y salió barata.** La cosecha de `Module:Enemies/data/<facción>`
(fase-2 de `OQ-DATA-16`) la resolvió sin pipeline pesado: **el submódulo de origen ES la facción** (la tabla
Lua no tiene campo de facción), y sus 12 valores son exactamente el dominio de `HEALTH_COEF`. El módulo Lua
*es* el grupo de scaling — no hizo falta un `scaling_group` separado (opción (d)): el eje contaminado no
tenía consumidor, sólo estorbaba.

El generador resuelve `faction` en **cascada**: `faction` del export (lo trae justo para los 33 con `type`
contaminado) → facción del submódulo wiki → `type` si es facción válida → `Unaffiliated` explícito.
Resultado: 638/638 con facción canónica, ningún valor que no sea facción. Contrato y tabla de procedencia en
[`../data/schemas/enemy/schema.md`](../data/schemas/enemy/schema.md).

**Causa raíz: el parser de upstream, no la normalización propia.** `warframe-items/build/parser.ts`
asigna `type` matcheando **substrings del `uniqueName`** contra su tabla de tipos de arma
(`/…/Avatars/RifleLancerAvatar` contiene `"Rifle"` → `type = 'Rifle'`), y sólo si no matcheó nada hace
`item.type = item.faction; item.faction = undefined`. De ahí el patrón exacto: 605 enemigos con `type`
= facción real (movida por la segunda regla) y 33 con `type` = arma **que conservan `faction`**, porque
la primera los capturó antes. La cascada del generador resuelve el síntoma **en un consumidor**; la
regla sigue viva aguas arriba.

**Lo que queda abierto — el alcance.** Si la causa es un matcher por substring de `uniqueName`,
puede estar mal-tipando **cualquier** ítem cuyo path contenga `Rifle`/`Shotgun`/`Melee`, no sólo
enemigos. Nadie midió eso. Censo pendiente: ítems no-`Enemy` cuyo `type` no cuadra con su categoría.

**Residual (no es contaminación, es ausencia de dato):**
- **Subfacciones:** `FACTION_BONUS` distingue Kuva Grineer, Corpus Amalgam, Infested Deimos, Zariman…;
  `enemies.json` sólo trae la base. Esos bonus siguen latentes (gap ya anotado en `damage-multipliers.ts`).
- **Facciones modernas sin enemigos:** el export no contiene **ninguna** unidad de Narmer/Anarchs/Murmur/
  Techrot/Scaldra (115 en el wiki, 0 match). Hay ley (coefs + bonus) sin dato contra el cual ejercerla;
  cerrarlo implica cosechar los stats base del wiki y emitir entradas wiki-only — decisión abierta.

### Addendum — la wiki no trata "la facción" como un campo, sino como tres

`Module:Enemies/infobox` (capturado en `references/wiki/sources/enemies-infobox.md`) lee **tres campos
independientes** del enemigo, cada uno con su propio fallback a la etiqueta nominal:

| Campo | Determina | Usos en 912 enemigos |
|---|---|---|
| `Faction` | la etiqueta mostrada, la categoría de la página | — |
| `FactionScaling` | **qué coeficientes de scaling** aplican | **3** |
| `FactionDamageOverride` | **qué fila de la matriz de resistencias** aplica | **152** |

Eso valida el diagnóstico de esta OQ desde afuera —la facción **es** un eje partido— y a la vez acota
dos huecos de la resolución adoptada:

**1. "El submódulo de origen ES la facción" es cierto salvo para 3 enemigos, que lo declaran al revés.**
`Jordas Golem` vive en la partición `infestation` y declara `FactionScaling = "Default"`; `H-09 Apex` y
`H-09 Efervon Tank` viven en `techrot` y declaran `FactionScaling = "Corpus"`. Para esos tres, la
cascada del generador asigna el grupo de scaling **equivocado** — son 3 de 912 y ninguno está en el
data-set hoy, pero la regla que los produce sí está viva.

**2. El eje de resistencias no está cubierto por la cascada.** `FactionDamageOverride` decide la fila de
la matriz③, y **125 de sus 152 usos son la cadena vacía**: no redirigen a otra facción, **anulan** la
matriz para ese enemigo. Un modelo que derive la fila de resistencias desde `faction` va a aplicar
modificadores a enemigos que no los reciben. Los 27 restantes: 12 `Zariman` —una facción de
resistencias que **no es** una de las 12 particiones de enemigos—, 5 `Grineer`, 2 `The Murmur`, 1
`Corpus`, y **6 con paths de asset del juego** en el campo, que son datos rotos de la wiki.

**Consecuencia para el residual "subfacciones":** `Zariman` aparecía como subfacción sin dato; ahora se
sabe que es un valor legítimo de `FactionDamageOverride` con 12 usos, no una etiqueta huérfana.

**No bloquea:** el engine corre. **Ya no degrada** el scaling por facción-basura.
**Vínculo:** **OQ-ENGINE-21** (fidelidad de la LEY de scaling, hermana — ésta es el INPUT, aquélla la ley),
**OQ-DATA-9** (borde de entrada "0" / normalización de datos), **OQ-ENGINE-15** (DR provisional, scaling
vecino). Realización: `enemy-scaling.ts` (fallback + comentarios), `contracts/damage-multipliers.ts`.
**Fuente:** censo de `enemies.json` (638 entries) + wiki `Factions`. Auditoría: F5-P2 (2026-07-19).

---

## OQ-DATA-16 — Fuente de datos propia (estructura a medida) vs. el fork `@wfcd/items` — **ABIERTA — el raw es propio y Project lo consume; falta que las imágenes también lo sean**

**Dominio:** data / pipeline / fuente

**Contexto:** el pipeline consumía `@wfcd/items` como **fork local**, con la estructura de upstream re-mapeada entera a los contratos del engine. Hoy el raw lo emite **`omniframe-items`** (cosecha propia) y `warframe-items` es el upstream **pristino**, traído en build. Lo que sigue abierto es **hasta dónde llega la fuente propia**: qué se cosecha, qué se deriva y qué sigue apoyado en upstream.

**Pregunta (a INVESTIGAR, no a resolver):** ¿la "estructura a medida" **elimina** normalización o sólo la **mueve** aguas arriba? (mismo riesgo que `OQ-DATA-9`: mover-no-eliminar). ¿Qué del fork hay que replicar para no perderlo, y qué **no** conviene replicar?

### Lo ya medido — no re-medir

1. **La capa-1 de upstream es reusable y no hay que reconstruirla.** El delta genuino del fork sobre su merge-base eran ~117 líneas, casi todo aditivo sobre el patrón de plugin de upstream. La maquinaria Lua es genérica (`getLuaData` baja cualquier `Module:X/data`, `convertLuaDataToJson` lo pasa a JSON): cosechar un módulo que upstream ignora = **un scraper con la receta del `AbilityScraper`**. Anatomía del build en [`../domains/source/warframe-items.md`](../domains/source/warframe-items.md).
2. **Upstream pristino no es "lean": dejó de cosechar del wiki.** Los campos que faltaban (`weaponClass`, `upgradeTypes`, `maxRank`, `incompatibilityTags`, los de warframe) tenían 0 referencias en su código — todos venían de wiki-scrapers, por eso son **re-cosechables** desde `omniframe-items`. Eso es exactamente el caso de uso que motivó el repo.
3. **⚠️ `compat_name` no se replica tal cual — replicarlo hereda su defecto.** Sobre 1.803 mods mezcla **cinco naturalezas** en un `string | null`: clase de arma, clase de entidad, **slot**, vehículo y nombre propio de warframe, más **223 `null`**. No expresa clase de entidad, así que no responde *"¿este mod es de arma o de compañero?"* sin una matriz `compat_name → clase` que el proyecto **deliberadamente no tiene** (`UpgradeView.tsx`: *"data-driven, no matriz hardcodeada"*). El contraste vive en el repo: los arcanos sí tienen vocabulario cerrado (`ArcaneCompatName`, 11 valores). **El hueco es del dato, no de la lectura: es la fuente la que debe emitir la clase.**
4. **Ese hueco ya tiene consumidor en el motor, no sólo en la UI.** Tres fuentes vivas no se pueden modelar hasta que exista la clase: `Rifle Amp` (*"Rifle Damage"* — una escopeta es primaria y no lo recibe), `Dead Eye` (*"Sniper Rifle Damage"*) y los cuatro `Scavenger`. La sub-familia del token D-6 es el **slot**, y mapearlos a `primary` mediría de más — examen en [`../semantic/upgrade-tokens.md`](../semantic/upgrade-tokens.md) §*sub-familia clase* y `arch-decisions.md` §18. El eje falta también del lado del arma: `kind`/`category`/`type`/`family` se solapan y ninguno es la clase de compatibilidad.

### Dirección (investigada, NO decidida)

No es "fuente propia vs fork" como binario, sino un **repo-superset de cosecha**: mismo ingest de upstream (capa-1 intacta, dependencia dura), exprimiendo N módulos Lua que `@wfcd` deja sobre la mesa (opt-in — cada módulo es superficie de mantenimiento propia), emitiendo sólo lo que OmniFrame necesita.

**Dos motivaciones a NO amalgamar:** (a) cosecha-superset = lo que carga la decisión del repo; (b) reducir peso del output se resuelve HOY project-side en los builders de `generate-data` y **no** justifica repo nuevo por sí solo.

**Forma — tres hermanos** (organización interna de `omniframe-items` diferida a propósito):

```
OmniFrame/  Project/  ←  omniframe-items/  ←  warframe-items/ (upstream PRISTINO)
flujo:   warframe-items (upstream puro) ─► omniframe-items (cosecha) ─► Project (consume)
```

`warframe-items` **no se sube** al repo: se trae en build (`git clone --depth=1`; **pin diferido**, HEAD por ahora). El pipeline de datos corre en **HOST, no en Docker** (necesita salida a `origin.warframe.com`, wiki y GitHub).

**Estado:** el raw propio y la cosecha de enemigos ya están (`AbilityScraper` y `EnemyScraper` viven en `omniframe-items`; `generate-data`/`generate-enemies` lo consumen). Decisiones tomadas al promover, para no re-litigarlas: **stats base de warframe = core del export**, no wiki (diferían en 2 warframes); la pérdida de `tags` en Dark Split-Sword y los campos `wikia_*` de arma (muertos, sin consumidor) quedaron **aceptados**.

### Fase-3 — `omniframe-items` genera su propio raw (planificada, no arrancada)

**Tesis: enriquecer no alcanza, el gap se traslada.** Hoy `omniframe-items` no genera nada propio — enriquece en memoria el output de upstream, sin artefacto en disco que mirar. Sirve para lo **ausente**, no para lo **mal derivado**: cuando el defecto nace en la construcción del raw sólo se parchea el síntoma en cada consumidor. Caso testigo: el `type` contaminado del enemigo (`OQ-DATA-15`), cuya cascada vive en un consumidor y cualquier otro la hereda.

```
warframe-items ──► omniframe-items ──► generate-data.ts ──► dataset final
  capa raw           build propio        normalización
  (caja negra)       (scrapers propios,  (sin cambio de rol)
                      gaps de derivación corregidos)
```

Materializar el raw hace **diffeable cada frontera**: un breakage se bisecta en un paso en vez de ejecutar código.

**Build propio, NO wrapper.** El wrapper es lo que ya teníamos y es lo que **no** protegió: el incidente que costó la migración fue un cambio de **contenido** (upstream dejó de cosechar campos), no de forma — un wrapper lo recibe idéntico. El discriminador no es el riesgo de mantenimiento (existe en ambas) sino el **control de acción**: elegir qué se genera, corregir derivaciones, aligerar el raw.

**Sin pin de versión, a propósito.** Un pin sin política de bump es deuda que driftea en silencio (mismo patrón por el que se retiró el campo `Version` de los docs). El criterio sano es por versión del juego y exige maquinaria que hoy sería over-engineering. **El pin es consecuencia de esta fase, no requisito**: el sello de versión nativo (`.export.json`) es su insumo. Mientras tanto el árbitro es el golden-master — detección, no prevención.

| # | Paso | Árbitro |
|---|---|---|
| 0 | **Fusión del pipeline.** `generate-enemies.mjs` → `buildEnemiesArtifacts`; `enemies.json` se emite desde `generate-data` y entra al `source-change-audit`. Independiente del source: **se puede hacer ya** | `git diff public/data/enemies.json` vacío; un solo `new Items()` |
| 1 | **Build propio passthrough.** Orquestador en `omniframe-items` que emite `data/json/*` reutilizando la capa-1 de upstream | `git diff public/data` vacío. Si no da vacío, no se avanza |
| 2 | **Control de acción.** Elegir categorías **y locales** (el fetch baja los 15; Project consume 1) | diff vacío en lo consumido + peso del output |
| 3 | **Las correcciones suben de capa.** Censo del matcher por substring (`OQ-DATA-15`) → corregir `type` en el raw → **borrar la cascada de `faction`** | diff **no** vacío: esperado y explicado ítem por ítem |

**Por qué la fase 0 va primero:** hoy hay **dos** consumidores independientes del source, cada uno con su `new Items()`, y `enemies.json` está **fuera del ciclo de regeneración** — no lo dispara ningún script, así que queda stale en silencio. Fusionar deja un punto de contacto.

**Forma de la fase 1 (resuelta y validada ejecutándola):** el parser **no se copia, se importa** — la orquestación de upstream son ~30 líneas y el músculo vive en módulos importables; el build propio es importar `scraper`+`parser` y escribir el `saveJson` propio (ahí vive el control de acción). `saveImages` se salta. Consecuencias asumidas: el clon **hay que instalarlo** (11 de sus 54 deps, ninguna pesada), su caché incremental y `.export.json` **viven en el directorio de upstream**, y `omniframe-items` **replica el layout** (`data/json/` + `data/cache/.export.json` + `i18n.json`) porque la clase `Items` resuelve su ruta relativa a sí misma — así **Project no cambia una línea** y el árbitro de diff vacío sigue siendo viable. Formulación precisa: *orquesta el build con la maquinaria de upstream in-situ y materializa la salida en su propio layout*. Costo asumido a conciencia: `parser`/`scraper` no están en los `exports` de upstream → se importan por ruta relativa.

**Diferido con gate:** normalización dentro de `omniframe-items` (gated por sacar el tipado de `@shared` a un paquete reusable) · frontera source/normalizado en dos carpetas con `generate-data` reducido a comprobar/copiar/auditar (`OQ-DATA-9`) · pin y maquinaria de versión.

### Residuales abiertos

- **Imágenes — la asimetría que sostiene el clon.** El raw es propio pero las imágenes salen de `warframe-items/data/img` (605 MB) vía `get-img.mjs`. El manifest de DE (19.690 entradas) las cubriría y haría innecesaria esa dependencia. Coherente mientras el build propio use el `parser` de upstream (mismo `imageName`); si esa derivación se toca, `get-img` es el primer damnificado.
- **Los iconos de habilidad no son el mismo problema, y no se resuelven por ahora** (ningún consumidor los reclama). Las 507 referencias de `ability-stats.override.json` **no están en el manifest de DE**: son **títulos de wiki**, no nombres de archivo — y el título real lleva paréntesis que la normalización del wiki oculta, así que no matchean ni contra un directorio local. El mecanismo existe (API MediaWiki `imageinfo`, verificada), pero el consumidor real es `DataRegistry.hydrateAbility` leyendo el override: arreglarlo toca **tres** piezas (scraper + override + resolver), no una.
- **Locales.** El fetch baja los 15 idiomas aunque se consuma `en`; `locales` se lee a nivel de módulo del clon, así que recortarlo exige tocar upstream o reimplementar `fetchResources`. **Diferido:** no es rentable por ahorro (29 MB de raw contra 1,7 GB del clon), sí lo será por **control** cuando haga falta el pin.
- **`wikia_thumbnail` sin consumidor.** Nadie lo lee y ensucia el árbitro del dataset (scrape en vivo). Se conserva como único puntero a la imagen remota. Cobertura: 73% armas, 49% companions, 0% warframes/mods/arcanes.
- **El stub de `@wfcd/items` del Dockerfile no es removible todavía:** `omniframe-items` declara `file:../warframe-items` por los tipos, así que el `prepare` con husky se dispara igual. Muere cuando el tipado salga de `@wfcd/items`.
- **Entradas wiki-only:** el export no trae ninguna unidad de Narmer/Anarchs/Murmur/Techrot/Scaldra (115 en el wiki). Emitirlas exige cosechar también sus stats base del wiki → **cambia la procedencia del stat base** (hoy siempre export). Ver `OQ-DATA-15`.
- **Dependencias estáticas de upstream sin auditar:** su `warnings.json` (de donde sale `failedImage`) y su `data/img`. Si upstream deja de publicarlas, envejecen en silencio igual que `Enemy.json`.
- **Normalizaciones `?? []` a auditar:** compensaban la incompletitud del fork (ej. `incompatibility_tags`, vacío en 1660/1801 mods) y el dato fresco las puede volver innecesarias. No son overrides a remover: son defaults defensivos a revisar.

### Dirección candidata para el contrato — NO comprometida

Si la fuente debe emitir la clase de entidad, hace falta un **contrato común**: hoy `Project` define los tipos y `omniframe-items` emite a ciegas, así que el mapeo se decidiría dos veces o ninguna. Extraer `@shared/types` como paquete compartido invierte la dirección — la fuente emite contra el contrato del consumidor. **El costo está medido y es menor de lo que parece:** son 18 archivos, ninguno importa React, imports todos relativos internos; lo caro no es la extracción.

**Y el paquete es el vehículo, no la respuesta.** Compartir el `type` no decide si `Claws` es arma de compañero, si `Tome` es de warframe, ni qué son los 223 `null`. Esa decisión hay que tomarla igual — amalgamarlas arriesga construir la infraestructura y dejar la pregunta semántica sin dueño: el patrón **mover-no-eliminar** del que esta misma OQ advierte.

**Gate:** campaña de recomposición del engine cerrada y motor estable. Antes no — reorganizar el borde de tipos mientras el consumidor se reacomoda invierte el orden de construcción.

**No bloquea:** nada.
**Vínculo:** `OQ-DATA-9` (un ingest propio llevaría el sello de versión nativo, cerrando la mitad-override que falta; y aloja la frontera raw-vs-normalizado diferida) · `OQ-DATA-15` (el `type` contaminado que la fase 3 corrige en el raw) · [`../domains/source/warframe-items.md`](../domains/source/warframe-items.md) (qué aporta upstream y anatomía de su build).

---

## OQ-DATA-17 — Escuelas de enfoque: cero dato, y una pregunta de modelo antes que la de cosecha — **ABIERTA — gated por cosecha**
**Dominio:** data / fuente + engine / Capa A

**La pregunta, y son dos en orden.** Antes de *"¿de dónde sacamos el dato de focus?"* está *"¿el
operador es un participante del escenario?"*. La respuesta cambia qué dato hace falta: si el operador
participa, lo suyo cuelga de él en el árbol de propiedad
(`../domains/engine/design/arch-decisions.md` §18); si no, todo lo que aporte aterriza en el warframe y
el operador nunca se materializa.

**Y la respuesta no es una sola, porque el operador hace tres cosas distintas** (relevamiento del
usuario — el "da energía" es la versión de hace diez años, no la actual):

| Qué hace | Naturaleza | Qué implica |
|---|---|---|
| **Porta un amp** | arma modular — **sin mods, sólo arcanos** | es un portador con reglas propias: el único que no acepta mods |
| **Lanza habilidades** | 2 slots, más un **3.º que habilita un artefacto** | las habilidades varían por escuela |
| **Movimientos del vacío** | modo vacío (Ctrl) + onda del vacío (salto-bala que atraviesa entidades) | el efecto **depende de la escuela**: curarse, ganar armadura, volver inmune al warframe, quitarle resistencias a un enemigo |

**El artefacto es una entidad aparte, no un stat.** Es un potenciador del amp que depende de tener la
escuela (¿sólo Zenurik? entonces sólo ahí existe esa ranura), habilita la 3.ª habilidad, y **lleva build
propia** — tiene sus propios mods. Un portador colgando de otro portador.

**Las pasivas sí son estadísticas y no exigen al operador en combate** — ésas son las que aterrizarían
en el warframe. Lo que varía por escuela son los nodos y la habilidad que el artefacto habilita; las
estadísticas base no.

O sea: **hay de las dos**, y por eso decidir antes de cosechar no es un rodeo. Un modelo que asuma
"focus = buffs pasivos al warframe" no tiene dónde poner el amp, el artefacto ni sus builds.

**Medido — no hay dato, ni parcial:**

| Rastro | Qué es |
|---|---|
| ~~`Ensemble.focus?: { school_id, nodes[] }`~~ | era un contrato **sin dataset, sin escritor y sin lectores** — un campo declarado en la forma intermedia que B construía. Se fue con ella. **La ausencia sigue siendo la misma:** hoy `Scene` no declara nada de focus, que es lo honesto mientras no haya dato |
| 20 mods con `mod_class` ∈ {Madurai, Zenurik, Vazarin, Naramon, Unairu} | **falso positivo**: son `Tektolyst Artifact Mod`. El `mod_class` marca afinidad de escuela de un artefacto, no un nodo del árbol de focus |
| `public/data/` | ningún dataset de focus / escuelas / nodos |

**Por qué se abre ahora.** `Ensemble.focus` **ya se borró** — cayó con la forma intermedia entera, que no
computaba nada. Era un campo fabricado por B que ninguna estructura declaraba y ningún consumidor leía.
Esta OQ es lo que impide que ese borrado sea postergar sin dejar rastro: el campo se fue, la ausencia
queda registrada, y el modo de falla que esta campaña vino a corregir —desaparecer algo en silencio— no
se repite.

**Lo que haría falta, en orden:** (1) decidir qué del operador se materializa como participante y qué
aterriza como pasiva en el warframe; (2) cosechar — la wiki tiene las páginas de cada escuela con sus
nodos y valores, y el patrón de captura ya está probado (`references/wiki/`, `action=raw`); (3) recién
ahí, schema y override. El amp (arma modular sin mods) y el artefacto (portador con build propia que
cuelga del amp) son los dos que más presionan el modelo de portadores, no el catálogo de nodos.

**No bloquea:** nada. Ningún cálculo del motor depende de focus hoy.
**Vínculo:** `OQ-DATA-16` (fuente de datos propia — de dónde saldría el dataset),
`OQ-ENGINE-31` (qué le falta a una entidad para ser modelable — el operador es un caso),
`../domains/engine/design/arch-decisions.md` §18 (el árbol de propiedad donde colgaría).

---

## OQ-ENGINE-21 — Fidelidad de la ley de enemy-scaling: la tabla no está validada por DE — **ABIERTO (2026-07-19), GATED POR MEDICIÓN**
**Dominio:** engine / C2 (enemy scaling) — hermana de `OQ-ENGINE-15` (DR)

**Contexto:** los coeficientes de `enemy-scaling.ts` se transcriben de `Enemy_Level_Scaling`
(`references/wiki/mechanics/enemy-level-scaling.wikitext`). El propio raw advierte que las fórmulas
"are derived from in-game testing and have **not** been confirmed or denied valid by Digital
Extremes… accuracy still under review".

**Lo que queda abierto:** toda la tabla (coefs health/shield/armor, smoothstep, DR `√3a/100`) es
community-derived; hoy solo Arid Butcher @215 está validado contra el **calculador** del wiki (no contra el
juego — no muestra HP numérico). La DR ya es `OQ-ENGINE-15`. El módulo Lua de abajo es *del wiki*, no de DE:
resuelve la **coherencia interna** de la fuente, no la fidelidad al juego.

**La transcripción está validada contra el módulo Lua propio del wiki.** `Module:Enemies/infobox` (el que la
propia wiki ejecuta para mostrar stats) contiene las tablas de scaling machine-readable, sin ambigüedad de
prosa. Ver: `curl -sS "https://wiki.warframe.com/w/Module:Enemies/infobox?action=raw" | sed -n '15,160p'`.
- **`Anarchs` = grupo Orokin/Corrupted en AMBAS capas** (health `f1 0.0150/2.10, f2 10.7332/0.685`; shields
  `f1 0.0200/1.75, f2 2.0000/0.75`) — el código lo declara así en las dos tablas. El tab "Anarchs, Corrupted"
  tenía razón contra la prosa que los agrupaba con Murmur/Sentient/Unaffiliated, y esa prosa ya no existe: la
  página vigente titula ese grupo "Murmur, Sentient, and Unaffiliated". Fuente y módulo coinciden.
- **El resto de la tabla del proyecto MATCHEA el módulo:** armor exacto (`0.005/1.75, 0.4/0.75`, fórmula única
  confirmada), health de Grineer/Scaldra/Corpus/Orokin/Techrot y el default para Sentient/Murmur/Unaffiliated,
  shields de Corpus/Orokin/Grineer. Techrot shields `f1_expo` = `1.75` e Infested health `16.1` siguen al
  módulo, no a la prosa: los números del calculador salen del módulo, así que validar "exacto contra el
  calculador" con otro decimal es validar contra otro número.
- **Ninguna de las dos facciones tiene enemigos en `enemies.json`** (las 9 vivas: Grineer, Corpus, Infested,
  Corpus Amalgam, Unaffiliated, Orokin, Kuva Grineer, Sentient, Stalker). La fila existe para cuando el dato
  llegue; hoy no cambia ningún número.

### Lo que trajo la reescritura de la fuente — tres frentes vivos

La versión vigente de la página es una reescritura completa de las secciones Armor, Overguard, Damage,
Shields y Health, ya reconciliada en `references/wiki/mechanics/enemy-level-scaling.md` (las fechas de
fuente y destilado viven ahí, que es su régimen). Tres consecuencias que el engine todavía no absorbe:

**1. La curva no se elige — se interpola siempre.** *"Both endpoint curves are evaluated at every level,
including when s=0 or s=1."* Nuestra lectura previa ("`Δx<70` → `f1`, `Δx>80` → `f2`, en el medio
smoothstep") describe una **selección de región**; la fuente describe un `clamp` + smoothstep aplicado
siempre. Da el mismo número en aritmética exacta y **no** necesariamente en binary32 (ver punto 4).
La wiki además retiró la afirmación de que las curvas se cruzan en x=80.

**2. Overguard es un punto de fidelidad propio, no un detalle.** Si el engine va a modelar Overguard
enemigo, hereda dos divergencias respecto de health/shields/armor — **`q` es el mismo input** en los
cuatro, confirmado línea por línea contra el gadget (`Math.pow(curr_lvl - base_lvl_v, expo)`), corrección
sobre la lectura previa de esta OQ:

| | Overguard | health / shields / armor |
|---|---|---|
| input de nivel | `Nivel Actual − Nivel Base` (mismo `q`) | `Nivel Actual − Nivel Base` |
| bounds `L`/`U` | **45 / 50** (sobre ese mismo Δnivel) | 70 / 80 |
| coeficientes | `f1 = 1 + 0.0015·q⁴` · `f2 = 1 + 260·q^0.9` — universales, una sola entrada `Default` | por facción (health/shields); armor también universal |

Base Eximus = **12 es el default**, reemplazado por el Overguard Eximus propio del enemigo cuando ese
dato existe (`eximus_overguard_v !== 0`). ⚠️ Es además **la fórmula peor respaldada de la página**: su
única referencia es un hilo de Reddit de 2022 marcado `[Confirmation needed]`. Entra al engine con menos
crédito que el resto de la tabla, no con el mismo. Detalle y verificación: `#45` /
[`../../references/wiki/mechanics/enemy-level-scaling.md`](../../references/wiki/mechanics/enemy-level-scaling.md)
§Overguard.

**3. Pregunta nueva — ¿reproducimos binary32?** La fuente ahora declara la precisión como **normativa**:
*"coefficients, exponents, power results, and intermediate arithmetic results must be evaluated in
**binary32** in the displayed order"*, y prohíbe explícitamente reescribir `f1 + (f2−f1)·s` como
`f1(1−s) + f2·s`. Que se moleste en prohibir una identidad algebraica sugiere que la diferencia se
observó. Tres caminos, ninguno obvio:

- **Ignorarlo** — calcular en `number` (float64) y aceptar el delta. Barato; el delta no está medido.
- **`Math.fround()` en cada paso** — reproduce binary32 en JS sin dependencias, al costo de que la
  fórmula deje de leerse como fórmula.
- **Medir primero** — cuantificar el delta contra el calculador del wiki en el rango jugable y decidir
  con el número en la mano. Es lo consistente con cómo se resolvió el resto de esta OQ.

**No bloquea:** el engine corre — la transcripción es coherente con la fuente en toda la tabla.
**Bloquea:** confianza plena en la ley, que exige medición in-game; y validar "exacto" con precisión
defendible, que hoy se hace contra el gadget sin saber en qué precisión calcula él.
**Vínculo:** **OQ-DATA-15** (el INPUT `faction`, hermana), **OQ-ENGINE-15** (DR, mismo "provisional hasta
popup #1"), mirror `references/wiki/mechanics/enemy-level-scaling.md` (reconciliado 2026-07-19).
**Fuente:** re-captura raw (`references/wiki/mechanics/enemy-level-scaling.wikitext`). Auditoría: F5-P2 (2026-07-19).

---

## OQ-ENGINE-22 — Generalizar EHP/DR de `enemy/` a `entity/` (player/companion) — **ABIERTO, DIFERIDO**
**Dominio:** engine / formulas — hermana de `OQ-ENGINE-15` (DR de enemigo)

**Contexto:** `damageReductionFromArmor` y `effectiveHealthVsEnemy` (`formulas/enemy/{armor-mitigation,effective-health}.ts`)
son primitivas de enemigo. La mitigación por armadura no es conceptualmente enemy-specific — jugador
(Tenno) y compañero/minion tienen su propia versión (jugador: `DR = Armor/(Armor+300)`, distinta de la
de enemigo, confirmada vigente en el addendum "Precisión añadida" de `OQ-ENGINE-15`). `armor-mitigation.ts`
ya declara el gate de esta migración en su propio docstring.

**Pregunta (a evaluar cuando aparezca, no a resolver ahora):** ¿la generalización sube el *código* a
`formulas/entity/` con una fórmula por tipo (`entity → player | enemy | companion`), o alcanza con que
cada tipo tenga su propia primitiva en su propia carpeta, sin scope compartido? Cada entidad diverge en
fórmula y en caps propios — no está garantizado que unificar la ubicación ahorre algo más que
organización.

**El eje DR está resuelto, y la respuesta fue NO generalizar.** La condición de apertura —un consumidor
real de DR de jugador— se cumplió: un avatar que porta estado mitigaba con `√(3a)/100` donde le toca
`a/(a+300)`, coincidencia al sexto decimal con la fórmula equivocada (`__tests__/state-neutrality.test.ts`).
Y lo que el consumidor mostró es que **las dos no comparten forma algebraica**: ningún coeficiente
convierte una en la otra, así que un scope `entity/` compartido no tendría qué compartir. Cada clase
conserva su primitiva en su carpeta (`formulas/{enemy,warframe}/armor-mitigation.ts`) y **quién elige es
el borde de resolución**, por la marca de ruteo del portador — el mismo mecanismo de `vitalsOf`.

**Lo que sigue abierto es el otro término: EHP.** `effectiveHealthVsEnemy` no tiene consumidor del lado
jugador. No se construye por consumidor hipotético.

⚠️ **El argumento del acoplamiento ya no aplica — se pagó por otra puerta (#55).** Esta OQ
decía que generalizar *"arrastra además la pila de capas (`contracts/layers.ts`), que hoy declara cuatro
y sólo dos tienen origen modelado"*. Las dos mitades envejecieron: son **tres** con origen (el Overguard
lo tiene desde #38), y la fórmula **ya importa `LAYER_STACK`** — no por generalizar a `entity/`, sino por
fidelidad: enumerar capas a mano le costaba el término `overguard`. Así que el acoplamiento a la pila
dejó de ser un costo futuro de esta decisión y es el estado actual. Lo que queda del gate es sólo la
**demanda**: no hay EHP de jugador que pida esta primitiva.

**Vínculo:** `OQ-ENGINE-15` (DR de enemigo, la mitad ya resuelta de este eje), `Project/src/core/engine/formulas/enemy/armor-mitigation.ts` (declara el gate), `docs/domains/oracle/design/architecture.md` (lente `enemy`, el consumidor actual de la mitad enemigo).
**Fuente:** debate de organización del CLI oráculo (Trabajo 1/2, dominio `oracle`).

---

## OQ-ENGINE-23 — Rank de ítem sin consumidor; `mod.rank` vestigial — **ABIERTO, DIFERIDO**
**Dominio:** engine / A1→C1 (intención → hidratación)

**Contexto:** `mod.level`/`arcane.rank` ya se autodescriben (índice sobre el `base_value[]` propio del ítem,
clamp al último valor — `ModRepository`/`ArcaneRepository`).

**La mitad vestigial ya cayó, y sin decidir nada acá:** `ModIntent` es `{ uniqueName, level }` — el
`mod.rank` heredado de `SlotIntention` no sobrevivió a la bajada de la Capa A, porque la forma nueva se
escribió desde lo que el motor lee y no desde lo que la vieja declaraba. Sigue vivo sólo en la forma
estacionada (`@shared/types/ensemble.ts`, `@deprecated`).

**Lo que queda es el rank de ítem, y no tiene consumidor.** `Bearer.rank` lo declaran los cuatro
portadores de la `Scene` y **nadie lo lee**: `EntityIntent` no lo lleva, así que muere en el poblador
para los cuatro por igual. Hoy un ítem rank-0 y uno rank-30 computan idéntico.

Antes moría en tres lugares distintos y ninguno ruidoso —el del arma y el del compañero en la
traducción, el del warframe una capa más abajo con un `?? 30` que B inventaba—; la forma intermedia se
fue y con ella el default fabricado. Que ahora muera **en un solo lugar** no lo arregla, pero vuelve la
pregunta contestable de una sola vez.

**Se va a usar, pero no hoy:** por simplicidad, hoy no hay consumidor real ni necesidad de modelarlo. Esta
OQ existe para no dejarlo acoplado a "código real" implícito — no para forzar diseño ahora.

**Condición para retomar:** un consumidor real (que el rank de ítem escale algo). Purgar `Bearer.rank`
es la otra salida y es RED por radio: lo declaran los fixtures y el corpus de parciales del oráculo.

**Vínculo:** `Project/src/core/engine/resolve/hydration/space.ts` (el poblador, donde `rank` deja de viajar), `Project/src/core/engine/resolve/hydration/ModRepository.ts`, `Project/src/shared/types/scene.ts` (`Bearer.rank`).
**Fuente:** debate de organización del CLI oráculo (Trabajo 1/2, dominio `oracle`).

---

## OQ-ENGINE-24 — Derivación cross-stat: el mecanismo, DIFERIDO por falta de corpus de habilidades — **ABIERTO, DIFERIDO**
**Dominio:** engine / C1 — frontera grafo de buckets ↔ fórmula dedicada

**Contexto.** Una clase de habilidades computa su efecto **leyendo capacity-stats ya resueltos del propio
warframe**. Corpus relevado contra `references/wiki/` (no contra el override, que estaba sembrado
pre-pipeline):

| Caso | Fórmula | Forma |
|---|---|---|
| Iron Skin (Rhino) | `(1200 + 2.5 × TotalArmor) × Strength + Absorbed` | bracket armor × strength |
| Snow Globe (Frost) | idéntica letra por letra | ídem |
| Icy Avalanche (Frost augment) | `60 × str` + `20% armor→OG × str` + cap | ídem + cap |
| **Warding Halo (Nezha)** | `Damage Absorption 1662` + `Absorption Multiplier 2.5x`, ambos `$STRENGTH` | **ídem** — 4º caso, hallado en el propio override |
| Trinity (pasiva) | `ally_health += 0.5 × trinity_energy_max` | 1 input, sin bracket ni cap |
| Bloodletting (Garuda) | `% × MaxEnergy × min(1, hp/½MaxHealth) ÷ (2−efic)` | 2 inputs + clamp + no-lineal |

**3 casos de UNA forma + 2 formas de un caso cada una.**

**Casos mirados y DESCARTADOS del eje** — parte del "conteo real de formas" que la condición de
retomar pide, y el resultado más útil del barrido: el eje es **más angosto** de lo que parecía.

| Caso | Por qué no es de este eje |
|---|---|
| Grendel (pasiva) | el input es **cuántos enemigos tiene tragados** —estado de combate en vivo—, no un capacity-stat. El capacity-stat (Armor) es el **output**. Dirección opuesta. Su bucket (`+250 flat` después de los multiplicativos) ya está resuelto |
| Nourish (Grendel) | los tres efectos son valores por rango × Ability Strength — no hay lectura de un capacity-stat de otra entidad, ni bajo ningún ángulo distinto a un buff con escalado estándar |
| Speed (Volt) | `base × Strength` y **aditivo al pool del stat destino**. Sin bracket, sin leer ningún nodo |
| Rhino Charge · Rhino Stomp | dash speed y speed decrease son **valores fijos que no escalan con nada**; el engine ya los trata bien |

**Candidato para prototipar el mecanismo: la pasiva de Trinity, no Iron Skin.** Es el mismo problema
base —leer un capacity-stat ya resuelto y escribir en otra entidad— pero **sin bracket compuesto, sin
absorbed damage, sin cap y sin Strength**: un solo término. Iron Skin agrega tres capas encima de eso.
Encaja con la condición de retomar, que pide recorrer las **simples** primero.

**Evidencia medida** (`Project/src/core/engine/__tests__/cross-stat-derivation.test.ts`, fixtures
sintéticos hand-built al molde de `rhino.test.ts` Fase 1a):
- **`× Strength` es estructuralmente inexpresable** por el acumulador actual: resolver
  `value × (str/100) = str − 100` da `value = 100(str−100)/str`, que depende de `str` ⇒ no existe
  `value` constante. El calibrado a `str=130` produce **3507.69** en `str=200` cuando la wiki dice **4800**.
- **La derivación post-resolve no sobrevive** (analogía con `effective-health.ts` descartada): escribir
  `node.final` fuera del grafo deja el nodo inconsistente con sus buckets y el aporte **se borra en el
  siguiente `resolve()`**; escribir el bucket exige reimplementar `calculateCurrentValue` afuera y
  `resetAccumulators()` lo zeroea igual. ⇒ la fórmula **no puede escribir `final`**: debe aportar a un bucket.
- **El bucket destino no es libre:** el `+ Absorbed` de Iron Skin va a `total_flat` (fuera del `× Strength`).
  Depositar el escalado en `multiplicative` amplifica el Absorbed (3770 vs 3620 real).
- **`value × (final/base)` ≡ `(value/100) × final` sólo si `base = 100`.** Los tres `source_attribute`
  que la hidratación puede emitir (`ABILITY_SCALE_NODE`) tienen base 100 ⇒ el mecanismo actual es una
  **particularización accidental**, no una decisión. Con un capacity-stat (energy 175, armor 240) divergen.

**Pregunta.** ¿Cómo lee una fórmula de familia los nodos **ya resueltos** del grafo?
Refina el enunciado de [`../domains/engine/test/gap-map.md`](../domains/engine/test/gap-map.md) —
"cómo el grafo consume una fórmula escalar-cerrada" ya está respondido por CO
(`resolveConditionOverload` consume `coBonusPct` y rutea a bucket). Lo que **no** existe es una familia
con **dependencia topológica**: las 5 actuales (CO, melee/sniper combo, combo-scaled-add, stack-decay)
leen `context.variables`, **ninguna lee otro nodo**. Implicaría arista declarada + `rebuildGraph`
iterando N sources + acceso a nodos source en `FamilyResolver`.

**Descartado en el análisis (no re-proponer sin argumento nuevo):**
- **Op genérica de derivación** con bucket elegido por dato — reintroduce el failure mode que
  `arch-decisions.md §9` mató en `CONTEXT_SCALE` ("generalizar el ruteo ⇒ un no-miembro se cuela").
  Regla vigente de §10: *generalizar la fuente del factor, NO el ruteo*.
- **Expresar la fórmula en los buckets del override** (descomponer Iron Skin en 3 stats sueltos): el
  schema `{label, base_value, upgrade_by, upgrade_type}` es **un stat = un modifier** y nada declara que
  pertenecen a la misma expresión; además exigiría meter `ARMOUR` en `upgrade_by`, que es el eje de
  *modding del jugador* (`OQ-W-6`). Mueve la fórmula de TypeScript a JSON: pierde tipos, tests y
  explicitud. La precedencia de buckets es fácil de errar en silencio (se erró durante el propio análisis).

**DIFERIDO — decisión de dirección.** No se paga el costo estructural hoy. Razón medida:
**de 1241 `upgrade_by` del override, exactamente 1 emite modifier** (Roar) — hay **una sola habilidad
funcional** en todo el sistema. Modelar la clase más compleja antes de estresar el pipeline con
habilidades simples (Volt Speed, Ember Fireball) invierte el orden de construcción.

**Condición para retomar:** haber recorrido warframes modelando habilidades **simples** primero, y que
de ese recorrido salga el conteo real de formas — con esa evidencia se decide si la familia se recorta
angosta (sólo "bracket de armadura × strength", 3 casos) o más ancha. **No antes.**

**Dos candidatos concretos para ese recorrido, con su costo previo medido:**

| Caso | Veredicto |
|---|---|
| **Light Verse (Dante)** | **Entra.** Overguard de **un solo término** — sin bracket compuesto, sin cap, sin Absorbed: del mismo eje que Iron Skin y más simple, hermano de la pasiva de Trinity. **Costo previo:** `AVATAR_ADD_OVERGUARD` **no está acuñado** — cero apariciones en `modifier.ts` y en [`../semantic/upgrade-tokens.md`](../semantic/upgrade-tokens.md); hoy existe sólo dentro del fixture sintético de `cross-stat-derivation.test.ts`. No es conectar un consumidor a un token: es **acuñar y recién después consumir**, dos pasos |
| **Brief Respite** | **No entra**, y delimita el eje igual que los cuatro descartados de arriba. Su entrada de override —`AVATAR_ABILITY_ENERGY_TO_SHIELD`, *"Squad converts \|val1\|% of Energy **spent** to Shields while Overshields are inactive"*— pide un hook de **gasto de energía**, no de cast, y en `@core` no existe ninguno de los dos. Arrastra otros dos gaps: el token es uno de los 201/90 fuera de `UPGRADES` que registra [`../data/status.md`](../data/status.md), y su alcance es **squad** — el mismo tercer destino que `AVATAR_HEAL_RATE` tiene declarado fuera de scope |

**Segundo eje, no cubierto por el enunciado de arriba: DÓNDE aterriza el resultado.** Iron Skin
escribe en la **misma entidad** que castea (Rhino). **Snow Globe escribe en otra**: el Health del
globo no es un stat de Frost, es el de un **objeto desplegado** —ni weapon ni warframe— que Frost
crea y que hoy no existe en el modelo. Misma fórmula letra por letra, destino estructuralmente
distinto. Resolver "cómo una fórmula lee otro nodo" **no** resuelve "a qué entidad escribe" — son dos
problemas, y el segundo es más grande. Anotado, no atacado.

**Bloquea:** Iron Skin, Snow Globe, Icy Avalanche, Trinity (pasiva), Bloodletting. `formulas/warframe/`
sigue vacío a propósito.
**Vínculo:** `Project/src/core/engine/contracts/primitives.ts` (`source_attribute` singular),
`Project/src/core/engine/resolve/SimulationEngine.ts` (`rebuildGraph`, `FAMILY_RESOLVERS`),
`Project/src/core/engine/__tests__/cross-stat-derivation.test.ts` (`it.fails` = el gap, ejecutable).
**Fuente:** `references/wiki/warframes/{rhino/iron-skin,frost/snow-globe,trinity/passive,garuda/bloodletting}.md`.

---

## OQ-ENGINE-25 — Orden de `total_flat` vs `multiplicative` contra la referencia canónica — **ABIERTO, LATENTE**
**Dominio:** engine / formulas — fidelidad del acumulador

**Contexto.** [`references/wiki/mechanics/calculating-bonuses.md`](../../references/wiki/mechanics/calculating-bonuses.md)
§*"Orden de operaciones — implementación canónica"* fija el orden:

```
1. Bonuses aditivos del primer pool
2. Multiplicativos independientes (MULTIPLICATIVE, uno a la vez)
3. Flat bonuses post-escala (ADD_FLAT)

Stat = [Base × (1 + ΣAdd_Pool1) × (1 + ΣAdd_Pool2) × (1 + Mult1) × (1 + Mult2) …] + ΣFlat
```

`formulas/weapon/stat-accumulator.ts::resolveStatValue` aplica:

```
final = ((base + base_flat) × (1 + mods_add_pct) + total_flat) × multiplicative
```

**Los pasos 2 y 3 están invertidos.** `references/wiki/mechanics/armor.md` no dirime: su ecuación
(`Base × (1 + Mod Multiplier) + Flat Bonus`) no contiene multiplicativos independientes, así que la
única fuente que fija el orden relativo es `calculating-bonuses.md`, y el motor la contradice.

**Por qué no se corrige de una: la intersección es VACÍA (medido).**

| bucket | nodos que lo reciben hoy |
|---|---|
| `total_flat` | `WEAPON_ADD_STATUS_CHANCE` (perk Felarx), `AVATAR_ADD_{HEALTH,SHIELD,ENERGY}_MAX`, `AVATAR_ADD_ARMOUR` (Azure Shards) + acumuladores propios (`AVATAR_FLAT_*_REGEN`, `WEAPON_FLAT_PUNCH_THROUGH`) |
| `multiplicative` | **sólo nodos de daño** — `resolveMeleeComboMult`, `resolveSniperComboMult`, CO con `co_behavior: multiplying`. La op `MULTIPLICATIVE` por vocabulario es inalcanzable (`design/vocabulary.md` L-9) |

Ningún nodo recibe ambos y **no existe token FLAT de daño** ⇒ ningún valor del motor cambia con el
orden actual. La discrepancia es de forma, no de resultado.

**Condición de activación:** el primer nodo que reciba `ADD_FLAT` **y** `multiplicative` a la vez.
Caminos concretos: un multiplicativo sobre armor/health (clase Vex Armor, no modelada) o la aparición
de un token FLAT de daño.

**Gate de resolución:** no se decide de escritorio. Invertir el orden **cambia resultados**, y la
referencia sola no alcanza para tocar el acumulador — precedente `OQ-ENGINE-15` (DR de armor: 3
fórmulas en conflicto, se adopta la más honesta como provisional y se deja gated por medición).
Método: `references/ingame-tests/`.

**No bloquea:** nada hoy. **Degrada:** la fidelidad se vuelve incierta en el momento exacto en que
alguien modele el primer caso que cruce los dos buckets — y ese caso no va a avisar.
**Vínculo:** `Project/src/core/engine/formulas/weapon/stat-accumulator.ts`,
[`../domains/engine/design/vocabulary.md`](../domains/engine/design/vocabulary.md) (`L-9`),
[`../domains/engine/attribute-node-contract.md`](../domains/engine/attribute-node-contract.md).

---

## OQ-ENGINE-26 — Composición entre fuentes de life steal: la fuente no lo declara — **ABIERTO**
**Dominio:** engine / C2 — sustain

**Contexto:** el corpus de wiki afirmaba *"las fuentes de life steal se acumulan aditivamente entre sí"*.
La afirmación **no está en `Life_Steal`** —2 KB que definen la mecánica y listan fuentes, sin una palabra
sobre composición— ni en `Exodia_Might`. Salió del corpus por eso.

**Lo que sustenta la afirmación hoy:** experiencia de juego del usuario, sin medición. No es un dato que
se nos escapó al destilar: **es un hueco de la fuente**. La wiki no dice que sea aditivo ni que no lo sea.

**La pregunta:** cuando dos fuentes de life steal están activas a la vez (arcano + arma innata + habilidad),
¿los porcentajes se suman antes de aplicarse al daño, se aplican en cadena, o se resuelven como instancias
de curación independientes? Las tres dan números distintos y sólo una es cierta.

**Por qué se registra sin consumidor:** `life_steal` no existe en `Project/src/` — el sustain no está en el
eje de stats del engine. Se registra porque el modelado está previsto, y porque el hueco es de la **fuente**:
volver a buscarlo en la wiki dentro de seis meses da el mismo resultado. Lo que falta es medición.

**Método de cierre (barato):** dos fuentes conocidas de life steal, enemigo de health conocida, contar HP
recuperado con cada una por separado y con las dos juntas. Si `AB = A + B` es aditivo; si `AB < A + B`,
compone en cadena. Resultado → `references/ingame-tests/`, y de ahí el doc de wiki lleva
`⚠️ Discrepancia →` sólo si contradice algo que la wiki sí afirme.

**No bloquea:** nada. **Vínculo:** `references/wiki/mechanics/life-steal.md` (el doc destilado, hoy sin la
afirmación), `references/ingame-tests/pending.md`.
**Fuente:** reconciliación del corpus de wiki (residuo R-3).

---

## OQ-ENGINE-27 — `co_base`: la regla padre→hijo del CO, declarada en el schema y sin validar del todo — **ABIERTO, GATED POR INVESTIGACIÓN**
**Dominio:** engine / C1 — fidelidad de la mecánica CO

**Estado:** el **qué** está decidido (`arch-decisions §9` pieza 3): la base de cálculo del CO entra como
**puntero al ataque padre** (`co_base`), declarado en el schema del override y **sin contrato TS ni
resolver**. Lo que queda abierto es el **warrant**: la regla no reproduce todavía el corpus completo, y
poblar punteros sobre una regla que falla afirmaría más de lo medido.

**La regla:** un ataque que **deriva** de otro computa el CO sobre la base del **padre**, no sobre la
propia — el radial sobre el impacto directo que lo genera, el disparo cargado sobre el sin cargar, el
proyectil hijo sobre el que lo escupe. El ratio se **deriva** de `innate_dna.profiles`; el override sólo
lleva el puntero.

**Validación contra el dataset** (`base_padre / base_propia` vs la columna `CO Damage Bonus Relative To
Base Damage` de la tabla ítem-por-ítem del wikitext):

| Arma · ataque | padre | propia | derivado | wiki | |
|---|---|---|---|---|---|
| Ferrox · `Radial Attack` | Charged Shot 350 | 100 | 350% | 350% | ✅ |
| Opticor Vandal · `Charged Shot AoE` | Charged Shot 400 | 200 | 200% | 200% | ✅ |
| Trumna · `Auto AoE` | Auto 82 | 50 | 164% | 164% | ✅ |
| Ambassador · `Charged AoE` | Charge 600 | 800 | 75% | 75% | ✅ |
| Paris Prime · `Charged Shot` | Uncharged 180 | 360 | 50% | 50% | ✅ |
| Lanka · `Charged Shot` | Partially Charged 200 | 525 | 38.1% | 38% | ✅ |
| Kulstar · `Cluster Bombs` | Rocket Impact 200 | 75 | **266.7%** | 257% | ⚠️ la wiki mide bonus 200 sobre base 75 y publica mal el cociente — el derivado la corrige |
| Braton Prime · `Incarnon Form AoE` | Incarnon Form 70 | 70 | 100% | 95% | ❌ la wiki usa base 74 para el radial; el dataset dice 70 |
| Zylok Prime · `Incarnon Form Radial` | Incarnon Form 500 | 700 | 71.4% | 90% | ❌ la wiki usa 776/700; ninguna de las dos bases coincide |

**Lo que la investigación tiene que cerrar:**

1. **Braton Prime y Zylok Prime** — ¿discrepa el dataset, la wiki, o la regla? Ambos son radiales de forma
   incarnon, así que el fallo puede ser sistemático de esa clase y no de dos armas sueltas.
2. **Qué ataque es el padre, cuando no es obvio.** Kuva Bramma tiene cuatro ataques (`Charged Shot`,
   `Radial Attack`, `Cluster Bomb Contact`, `Cluster Bomb Explosion`) y la wiki **no le da fila** en la
   tabla per-arma: el puntero de la bomba hija no está medido por nadie.
3. **Ataques que la fuente nunca midió.** La tabla lista *sólo discrepancias conocidas*: un ataque ausente
   no es un ataque exacto. Caso vivo: la Lex Incarnon — **ni la wiki ni el dataset le registran un radial**
   (sólo `Normal Attack` e `Incarnon Form`), aunque en el juego el radial exista como consecuencia del
   impacto. Si el dato upstream no trae el ataque, no hay padre al que apuntar ni base propia que corregir.

**Lo que `co_base` no puede expresar, y su complemento diferido** (además de la base congelada de arriba):
los **11 incarnon de secundarias** donde
el CO ignora el aumento de base damage de una Evolution (nota literal de la fuente: *"CO-bonus does not use
base damage increase Evolution"* — Atomos, Bronco Prime, Cestra, Despair, Dual Toxocyst, Furis, Lato
Vandal, Lex Prime, Vasto Prime, Zylok Prime). Ahí no hay ataque padre: hay un upgrade que el cálculo
saltea, y el ratio queda **condicional a la build** (`100% or 81%`, `100% or 53%`, …). Ese eje lo cubre
**`co_ratio`** —escalar medido por ataque—, **diferido con su propio gate**: se agrega, no hoy.

**Lo que la relectura ya corrigió** (vive en `arch-decisions §9`, no acá): los dos ejes de la wiki **no son
ortogonales entre sí**. El de *application* se concentra en `adding` —56 de 68 filas con ratio ≠ 100%,
contra **2 de 90** en `multiplying`— y `none` es su caso degenerado (16 filas en 0%). La partición por
composición de §10 sigue **correcta y fuera de discusión**: `co_base` refina la magnitud de un bucket que
`co_behavior` ya eligió, no abre una familia hermana.

**Corpus completo del eje, más allá de los guns.** La regla padre→hijo se validó sobre primarias, pero las
filas discrepantes cubren cinco secciones y **dos causas más** que ningún puntero expresa:

| Clase | Ejemplos | Encaja en `co_base` |
|---|---|---|
| Radial ← impacto directo | Ferrox, Opticor Vandal, Trumna, Ambassador, Mausolon (archgun) | sí, validado |
| Cargado ← sin cargar | Paris, Lanka, Cernos, Dread, Daikyu, Drakgoon | sí, validado |
| Proyectil hijo ← padre | Kulstar, Kuva Bramma | plausible, sin medición que lo confirme |
| **Melee derivado** | Innodem `Aerial Incarnon Wave 1/2` (360%/720%), Quassus Prime `Heavy Attack 1/2 Daggers` (40%/20%), Stropha `Heavy Attack Projectile` (25%), Tenet Agendus `Heavy Attack Wave 1/2` (20%, y son **`multiplying`**) | forma compatible, **sin validar** — §9 declara melee `adding` siempre y no dice nada de la base |
| **Base congelada** | Noctua ×3 (*"CO scaling value of 200 does not scale with Ability Strength"*), Artemis Bow (*"scales off 100 base damage per projectile instead of 240, unaffected by Power Strength"*) | **no** — no hay ataque padre: hay un número que no escala con el build |

La **base congelada de exaltadas** es una tercera causa junto a las Evolution: el ratio depende de la
Ability Strength del jugador, así que tampoco la cubre un `co_ratio` fijo por ataque. Ambas comparten la
forma *"el CO ignora una fuente de escalado que el ataque sí recibe"*, y si se modelan, se modelan juntas.

**Gap de la propia fuente:** la sección `Robotic` (armas de compañero) está **vacía y marcada
`{{UpdateMe}}`**. No es "sin discrepancias": es sin medir.

**Lo que NO es esta OQ — dos casos que ya tienen hogar:**

- **Secondary Shiver** (`+45% por stack de Cold`) está **contemplado en §10**: aparece en su tabla y la
  justificación generaliza *la fuente del factor* (`unique_status_count`, `freeze_stacks`, …) manteniendo
  fijo el CÓMO. No es una forma nueva.
- **Primary Frostbite** (`+3% CD por proc de Cold, 12 s, cap 40`) es la forma de **§11
  `STACK_DECAY_BUFF`** —*evento discreto → +val por stack, cap Nx*, sin leer el status del target— que
  ya está **ejecutada** con Galvanized Chamber.

**No bloquea:** nada hoy — el modo estático replica el techo declarado. **Degrada:** la fidelidad de todo
ataque derivado en cuanto el CO se calcule en vez de declararse. El error es conocido y acotado, no
silencioso: en los arcos cargados el bonus queda **al doble** del real, y Lanka ya está en el corpus de
tests. `co_behavior` **no** lo corrige — pone el bucket bien y deja la magnitud mal.
**Condición de cierre:** la investigación de los tres puntos de arriba. **No** es una campaña de tests
in-game: el ratio se deriva del dataset que el pipeline ya carga, y la wiki queda de oráculo de contraste.
**Vínculo:** `docs/domains/engine/design/arch-decisions.md` §9 (las tres piezas de CO) y §10 (la
partición), `docs/data/schemas/weapons/weapons-attack-structure.md` (el campo declarado),
`references/wiki/mechanics/condition-overload.md` + su `.wikitext` (la tabla ítem-por-ítem sólo vive en el
crudo), `Project/src/core/engine/formulas/weapon/weapon-condition-overload.ts`.
**Fuente:** reconciliación del corpus de CO (residuo R-6) — el eje perdido al destilar.

---

## OQ-ENGINE-28 — Resistencias por entidad: una capa aparte de la matriz por facción — **ABIERTO, DIFERIDO**
**Dominio:** engine / C2 — modelo de enemigo

**Contexto:** `enemy-resistances.md` sostiene la matriz de Damage 3.0, que es **por facción**. Las secciones
`==Sources of X Resistances==` de las subpáginas `Damage/<Tipo>` traen otra capa: **resistencia de una
unidad concreta, con número, independiente de su facción**.

| Unidad | Resistencia |
|---|---|
| Hyekka Master | **80% a Heat** y **80% a Slash** |
| Techrot Obsolyte | Electricity |
| Toxic Ancient | Toxin |
| The Fragmented | **inmune** a Cold y a Viral |
| Leaping Thrasher · Scaldra TI-92 | **inmunes** a Viral |

**La pregunta, cuando el modelo de enemigo llegue:** esta capa **se compone con** la matriz por facción —
no la reemplaza. Falta decidir cómo: ¿multiplicativa sobre el resultado de la matriz, o reemplazo del valor
de la matriz para ese tipo de daño en esa unidad? Una inmunidad (`The Fragmented` vs Viral) sugiere que
al menos algunos casos son **override**, no factor.

**Por qué se registra sin consumidor:** no hay modelo de resistencias por enemigo y no lo habrá pronto. Se
registra porque el dato **se descubre una sola vez**: está esparcido en 19 subpáginas, y quien modele
resistencias partiendo sólo de `enemy-resistances.md` va a construir una matriz por facción y descubrir la
capa por unidad después de haberla cerrado.

⚠️ El eje enemigo arrastra además el fósil de `Enemy.json` (`docs/domains/source/gaps.md` §G-2): las
unidades nombradas acá **no están en el data-set**.

### 🔄 Re-encuadre: no es "diferida sin consumidor" — es **campo nullable + test con dato a mano**

La salida deja de estar gated por un modelo de resistencias: es **un campo opcional en el contrato de
enemigo**, poblado a mano en el test hasta que exista la fuente. **El campo declarado ES el aviso** que
esta OQ dice querer dejar, y no hay que esperar nada para ponerlo.

Dos precedentes vivos en el mismo schema: `eximus_health?` (283 entradas) y `weakpoints?` (407) **ya se
emiten sin consumidor, por fidelidad**. Mismo patrón que `ExtraHeadshotDmg`.

**Lo que esta OQ hereda de `Damage Vulnerability`** (cerrada por medición): el **método** —medir para
decidir composición— y el **default**: *multiplica; lo aditivo es excepción enumerada*.
**Lo que NO hereda: la respuesta.** Son dos filas distintas del lado receptor
(`../domains/engine/design/arch-decisions.md` §21), separadas por el discriminador de §20 —
resistencia por unidad = **clase/identidad**, DV = **estado**.

⚠️ **Y el Kuva Grineer es la contraprueba de que "capa extra" no es la única salida:**
`../data/schemas/enemy/schema.md` documenta que *"comparte vulnerabilidades con Grineer pero resiste
Heat"*, y eso se resolvió **como facción propia**. `The Fragmented` inmune a Viral con la matriz en ×1.0
es indistinguible entre `×0` y `override`; **contra Zariman/Void —matriz en ×1.5— sí se distinguiría**.
Ese es el caso que decide la forma, y es medible.

**No bloquea:** nada. **Vínculo:** `references/wiki/mechanics/enemy-resistances.md`,
`docs/domains/source/gaps.md` §G-2, `OQ-ENGINE-21` (scaling del mismo eje),
`../domains/engine/design/arch-decisions.md` §21 (el lado receptor completo).
**Fuente:** retrospectiva de las 19 subpáginas `Damage/<Tipo>` (residuo R-13).

---

## OQ-ENGINE-29 — ¿Los status sin ícono cuentan para Condition Overload? — **ABIERTO — gated por test propio**
**Dominio:** engine / C2 — población de status

**Contexto:** `condition-overload.md` §Qué cuenta como status effect lista `Lifted`, `Knockdown` y
`Microwave` entre los que cuentan para el multiplicador. Son estados **sin ícono en la UI del enemigo**.
La duda del usuario: eso se habría parcheado hace años, y Warframe arregla bugs sin anunciarlos.

**Lo que la wiki sostiene, y lo que no:** los tres están en la página desde al menos 2024-06, y sobrevivieron
25 ediciones recientes que afinaron listas vecinas sin tocarlos. Pero la página lleva `{{Community}}`,
`{{UpdateMe}}` y `{{CleanUp}}` a la vez, y **`Condition Overload (Mechanic)/Testing` no los menciona** — es
un checklist de armas, no de status. **Sobrevivir ediciones no es verificación:** nadie los miró.

**Por qué importa:** es un stack del multiplicador. Si no aplican, el CO sale **sobreestimado** — y el error
es silencioso, porque el número sigue pareciendo razonable.

### Diseño del test — tres restricciones que lo hacen honesto

**1. La métrica es un ratio, no un daño absoluto.** Dos disparos contra **el mismo enemigo**, con y sin el
status en cuestión. Los stats del enemigo —health, armor, resistencias— **se cancelan en la división**. Esto
es lo que vuelve el test inmune al fósil de `Enemy.json` (§G-2): no necesitamos que el data-set modele bien
al enemigo, sólo que el enemigo sea el mismo en las dos mediciones.

**2. El sujeto debe aislar el status.** Un arma que aplique el status escondido **junto con otro** no sirve:
si el multiplicador se mueve, no se sabe cuál lo movió. Descarta a la Nukor para `Microwave` (Radiation
innato → aplica los dos a la vez). `Lifted` (heavy slam) y `Knockdown` (jump kick) se inducen **sin aplicar
ningún status elemental**, que es la propiedad que se necesita.

**3. Enemigo sin armor.** Para no arrastrar la fórmula de DR, que sigue en conflicto de 3 vías
(`OQ-ENGINE-15`). Sin armor, la cadena entre daño moddeado y daño aplicado tiene un eslabón menos.

**Predicción falsable:** con CO activo y **cero** status normales sobre el enemigo, aplicar sólo un
`Lifted` o un `Knockdown` debe mover el daño si la wiki tiene razón, y no moverlo si el parche existió.

**Cierre:** si se mueve, el dato entra al engine como ley. Si no, es `⚠️ Discrepancia →` contra
`references/ingame-tests/`, y el conteo de status del engine excluye los sin-ícono.

**Mientras tanto:** el dato queda como la wiki lo dice —es lo que la fuente afirma— pero **no entra al
motor como ley** sin la medición.

**No bloquea:** nada hoy. **Bloquea:** fidelidad del conteo de status en cuanto el CO se modele.
**Vínculo:** `references/wiki/mechanics/condition-overload.md`,
`references/wiki/mechanics/crowd-control.md` (`Lifted` / `Knockdown`), `references/ingame-tests/pending.md`,
`OQ-ENGINE-15` (por qué el enemigo va sin armor).
**Fuente:** duda del usuario sobre el corpus de CO (residuo Q-3).

---

## OQ-ENGINE-32 — ¿Los estados físicos de CC forman un eje ordenado, o son cuatro independientes? — **ABIERTO — sin medición posible**
**Dominio:** engine / modelo de status

**Dos lecturas del mismo corpus, y el corpus no las separa.** Al barrer qué puede portar una entidad
apareció una lectura —*el eje `postura` es una escalera ordenada por severidad, un solo slot con un
ganador*— que **contradice a un documento vivo de `references/`**:

| Lectura | Sostiene |
|---|---|
| **escalera ordenada** | `stagger < knockdown < lifted < ragdoll` ocupan **un slot**; la exclusión mutua es *consecuencia* de que sea uno solo, no una regla aparte |
| **`references/wiki/mechanics/crowd-control.md`** | *"**No forman una escala.** Son cuatro estados con fuentes propias. La única escalada declarada es stagger → knockdown, y sólo en el self-stagger de las AoE."* |

**Las citas compartidas no deciden.** *Lifted ×2 → Ragdoll* y la exclusión mutua Lifted ↔ Knockdown
están en las dos lecturas. Lo que difiere es qué se concluye de ellas.

**Lo que la evidencia restante sostiene, y lo que no.** *"Lifted, a more specific type of ragdolling
effect"* es **subsunción taxonómica**; *"anything that can apply Knockdown may also ragdoll enemies"*
es **correlación de fuentes**; `{{ver|43}}` habla de **animaciones compartidas** y `{{ver|27.2}}` de
**resistencia compartida**. Ninguna afirma reemplazo por severidad — que es lo que un slot ordenado
exigiría.

⚠️ **Un dato adyacente sí quedó resuelto y no forma parte de esta duda:** la rampa *Impact ×5 →
Knockdown/Ragdoll* murió en `{{ver|27.3}}` y el escalón quedó **dentro de la familia stagger** (*"will
now result in a 'big stagger'"*, declarado textual en el raw de Impact). Eso está en
`../semantic/damage-types.md`.

### Por qué no se resuelve: no hay medición replicable

A diferencia del resto del corpus de status, esto **no tiene test**. Observar el orden exigiría
provocar dos estados en el mismo objetivo y determinar cuál "gana" a partir de la animación — sin
número que leer, sin popup de daño, y con un resultado que depende del timing exacto de dos
aplicaciones. **No es un test que produzca una restricción falsable**, que es el requisito para cerrar.

### Por qué no bloquea nada: el orden no tiene consecuencia numérica

**El motor no simula el comportamiento del enemigo, y esa exclusión es de diseño, no un pendiente.**
Modelar que un enemigo esté tambaleándose, tumbado o suspendido sólo cambia números si algo depende de
lo que el enemigo **hace** — su movimiento, su puntería, su ciclo de ataque. Eso es simulación de
comportamiento (IA), **descartada por complejidad de diseño**, y su costo no es la regla: es toda la
infraestructura para ejecutarla con fidelidad.

Lo único que hoy tiene consecuencia numérica de esta familia **ya está modelado por otra vía**:
`Lifted`, `Knockdown` y `Microwave` cuentan para Condition Overload, y CO **cuenta presencia de marca,
no orden** (`../domains/engine/design/damage-status-model.md` §*El criterio de pertenencia*). Un eje
ordenado no cambiaría ese conteo.

**Se registra, entonces, para que no se vuelva a descubrir:** el cruce de `ragdoll` / `knockdown` /
`lifted` / `stagger` produce esta lectura con facilidad, y sin esta entrada el próximo barrido la va a
derivar de nuevo y a chocar otra vez contra `crowd-control.md`.

**Condición de reapertura:** que aparezca un efecto cuyo **valor numérico** dependa del estado físico
del target (no de su presencia como marca) — o que el proyecto revierta la exclusión de simular
comportamiento.

**No bloquea:** nada. **Vínculo:** `references/wiki/mechanics/{crowd-control.md, condition-overload.md}`,
`../domains/engine/design/arch-decisions.md` §20 (`is_cc` deliberadamente no acuñado — misma familia,
misma razón), `../domains/engine/design/damage-status-model.md` §*El proc y su primitiva*.
**Fuente:** barrido de qué puede portar una entidad (campaña de recomposición del engine, 2026-08).

---

## OQ-ENGINE-33 — ¿El proc deja de ser un campo del tipo de daño? — **ABIERTO — sin convergencia**
**Dominio:** engine / vocabulario + contrato core

**La estructura actual hace que todo proc tenga tipo de daño por construcción.** `statusEffect` es un
**campo dentro** de la definición del `DamageType` (`Project/src/shared/types/damage.ts`), y
`effectOfDamageType(type) → StatusEffect | null` es la **única puerta** de entrada. La inversión
propuesta: **el proc existe por sí mismo, y el tipo de origen pasa a ser un campo suyo, nullable**.

**Qué la fuerza.** El corpus mide **38 procs, 29 con token, y sólo 15 con `DT_` de origen**
(`../../references/wiki/sources/damage-types-data.md`). `Lifted`, `Knockdown`, `Microwave`, `Sleep`,
`Slow` y `Blind` **no cuelgan de ningún tipo, así que hoy no tienen fila donde existir** — y los tres
primeros **cuentan para Condition Overload**, que sí está implementado. El motor cuenta status y no
puede contar tres de los que el juego cuenta.

**Qué NO la fuerza, y por eso no es urgente.** La relación `DT → PT` no se pierde con la inversión:
cambia de lugar. Y el patrón para alojar el token ya existe (`DAMAGE_TYPE_DEFINITIONS` ancla el canónico
al nombre de DE y admite N alias), así que **no hay que renombrar nada**
(`../semantic/damage-types.md`).

### Por qué está abierta y no decidida

1. **Sin convergencia.** Es una sola vía —el barrido de vocabulario—; ningún censo de código ni
   medición in-game apunta al mismo objeto de forma independiente.
2. **Toca `docs/semantic/`**, que es SSoT de vocabulario, y el contrato de `@shared`.
3. **Unificar el vocabulario no unifica el mecanismo de entrada.** Un `PT_*` sin `DT_*` llega por otra
   vía (heavy attack, arma específica, habilidad); tener fila donde existir **no le construye la
   puerta**. La inversión es condición necesaria, no suficiente, y la segunda mitad no está diseñada.
4. **Arrastra un bug de vocabulario ya registrado** —`DT_RADIANT` mapeado a Radiación debiendo ser Void,
   32 ocurrencias vivas (`../domains/engine/status.md`)— cuya corrección el usuario decidió ejecutar
   **dentro de este saneamiento**, no antes ni por separado.

**Ortogonal al canal de desvío del portador** (`arch-decisions.md` §17), que es la otra mitad de la
misma descomposición y **sí** está cerrada: aquella cambia *quién resuelve los parámetros*, ésta cambia
*qué es un proc*. Se separaron a propósito para que la segunda no bloquee a la primera.

**Condición de cierre:** una segunda vía independiente que pida el mismo objeto — el candidato natural
es que el modelo de Condition Overload necesite contar los tres procs sin tipo.

**No bloquea:** el canal de desvío (§17), ni el corte proc ⊥ primitiva
(`../domains/engine/design/damage-status-model.md`).
**Vínculo:** `../semantic/damage-types.md`, `../../references/wiki/sources/damage-types-data.md`,
`../domains/engine/status.md` (deuda `DT_RADIANT`), `arch-decisions.md` §20.
**Fuente:** descomposición B (campaña de recomposición del engine, 2026-08).

---

## OQ-ENGINE-34 — ¿Las relaciones entre entidades necesitan ser un bloque propio? — **ABIERTO — gated por múltiples objetivos**
**Dominio:** engine / modelo de entidades

**La pregunta.** ¿Hace falta modelar *"esta entidad apunta a **esa** otra"* como estructura, o alcanza
con derivar las relaciones de lo que ya existe?

**Lo que se encontró al barrer el corpus:** el caso que parecía pedirlas **argumenta en contra**. Los
Peacemakers de Mesa **no** apuntan a nullifiers, drones de arbitration ni la mayoría de bosses. Eso no
es *"le disparo a ese enemigo"* — es *"a todos los que no sean de estas clases"*. **Es una condición
sobre marcas**, no una relación.

**Y del lado del jugador no existe el ruteo dirigido a un individuo.** Lo que parece serlo es ruteo por
categoría: *Covenant* de Harrow buffea el crítico de armas primarias y secundarias — **token + alcance**
(`../domains/engine/design/arch-decisions.md` §18), no una relación con un destinatario. Los únicos
candidatos a uno-a-uno apuntan al enemigo (Nyx, Sonar).

**La única relación que el motor necesita hoy no es *"le pego a ese"* sino *"esto es de aquel"*** — y
ésa **ya no se deriva: se declara**. El poblador la conocía (`companionIntents` construye el arma
adentro del compañero) y la descartaba al aplanar; hoy viaja como `EntityIntent.owner` porque el
ruteo la necesita — sin ella, un buff de alcance propio del warframe aterriza en el arma del
compañero, que porta la misma marca `weapon`. Ausente = cuelga del Jugador, la raíz que no se
materializa.

**Eso acota la pregunta en vez de cerrarla, y en la dirección útil:** *"esto es de aquel"* costó **un
campo escalar**, no un bloque de relaciones. Lo que sigue abierto es si las relaciones *dirigidas*
(las que apuntan a un individuo) necesitan estructura propia — y para ésas el corpus sigue sin dar
un caso del lado del jugador.

### Por qué está gated y no cerrada

> **Mientras haya un solo objetivo en el escenario, *"este"* y *"todos los hostiles"* son el mismo
> conjunto.**

No hay forma de observar si la decisión fue correcta: cualquier modelo y su contrario producen el mismo
número. **No es postergar por comodidad** — es que el caso que discriminaría no existe todavía.

**Condición de reapertura:** múltiples objetivos simultáneos en el escenario. Ahí los dos conjuntos se
separan y la decisión pasa a ser observable. **Su upstream es `OQ-ENGINE-35`:** múltiples objetivos piden
un lugar donde ubicarlos.

---

## OQ-ENGINE-35 — ¿Cuánta geometría necesita el escenario? — **ABIERTA — gated por consumidor**
**Dominio:** engine / Capa A — escenario

**La pregunta.** El escenario declara **quiénes existen** y no **dónde están**
(`../domains/engine/design/simulation-architecture.md` §*Qué contiene A*). ¿Cuánta geometría hace falta
para que eso deje de ser un hueco — un escalar de distancia por participante, un plano con posiciones, o
nada porque un calculador de builds no lo necesita?

**Por qué no es especulativa: ya hay distancia sin espacio donde medirla.** El motor computa
`falloff_mult` en cada corrida de métricas —un multiplicador por distancia contra un rango que nadie
declara— y el modelado melee arrastra *"slam-por-distancia (falta dato)"* (`OQ-ENGINE-14`). Son dos
consumidores de geometría operando sobre un escenario que no la tiene.

**Qué queda gateado detrás.** El concepto de Capa A admite N participantes por grupo (`Squad` = uno o
más jugadores, `Hostil` = uno o más enemigos de uno o más tipos) y la construcción declara uno de cada
lado. **No es simplificación perezosa: poblar N sin un lugar donde ubicarlos repite el error que la
partición del escenario vino a corregir** — construir los pobladores antes que el lugar donde pueblan.
Tres unidades idénticas sin posición son tres clones que ningún cómputo distingue; el problema nunca fue
la cantidad sino dónde está cada una.

### Lo que la pregunta NO asume

**No asume que haga falta un plano.** El rango de respuestas va de *un escalar de distancia declarado
por participante* (barato, y suficiente para falloff y slam) hasta *posiciones reales* (que un calculador
de builds probablemente no necesita nunca). Cerrarla con "hay que construir el espacio" sería elegir el
extremo caro sin caso que lo fuerce.

**Condición de cierre:** una mecánica que dependa de la posición **relativa entre dos participantes** —
no de la distancia a un objetivo único, que es lo que falloff necesita y podría resolverse con un
escalar. AoE con solapamiento parcial es el candidato natural.

**Vínculo:** `OQ-ENGINE-34` (relaciones entre entidades — su gate de múltiples objetivos cuelga de
ésta), `OQ-ENGINE-14` (slam-por-distancia), `OQ-ENGINE-7` (falloff),
`../domains/engine/design/simulation-architecture.md` §*El plano*.

⚠️ **Riesgo si se decide antes:** construir un mecanismo de relaciones sin caso que lo fuerce es el
patrón que esta campaña viene desarmando — `GameLaws` nació igual. La alternativa barata (derivar de la
procedencia) ya cubre todo lo que el corpus pide hoy.

**No bloquea:** nada. **Vínculo:** `../domains/engine/design/arch-decisions.md` §18 (ruteo por token +
alcance, que es lo que absorbe los falsos casos), `../domains/engine/design/simulation-architecture.md`
§*De dónde salen los participantes*, `OQ-ENGINE-31` (qué le falta a una entidad para ser modelable).
**Fuente:** Parte I del barrido de definiciones (campaña de recomposición del engine, 2026-08).

---

## OQ-ENGINE-36 — ¿Cómo se identifica lo que la intención declara? — **ABIERTA en su eje de SLOTS; el participante ya está cerrado**
**Dominio:** engine / identidad del participante

**La pregunta.** La traducción de la intención al ensemble deriva claves a partir del contenido —el `unique_name` para un participante, el índice parseado para un slot— y **ninguna de las dos escrituras chequea si la clave ya existe**. Mismo patrón en ambos casos: *clave derivada que puede colisionar, sin chequeo de colisión*. ¿La identidad se declara, se deriva de la posición, o el problema desaparece cuando la hidratación cambie de capa?

✅ **Para el participante está contestado: se deriva de la posición.** `EntityIntent` separa `entity_id` (la coordenada: `squad.0.primary`, `hostile.1`) de `unique_name` (el puntero al catálogo), y `createBaseEntity` dejó de escribir el `id`. Esa era la causa: **el catálogo describe qué es algo, no quién es**, así que mientras la identidad saliera de ahí, dos participantes del mismo ítem nacían iguales. Quien la acuña ahora es el **poblador** (`space.ts`), el único que sabe dónde está parado cada participante — la coordenada ya estaba en la `Scene` y se descartaba al aplanar, mismo patrón que `owner`. La salida gana dos lentes: `weapon(molde)` para el caso 1:1 y `at(coordenada)` cuando hay más de uno. Estresado en `enemy.test.ts` §*Dos participantes del mismo ítem* y `unlanded-modifiers.test.ts`: dos hostiles a niveles distintos resuelven cada uno el suyo, al mismo nivel siguen siendo dos, Corrosive Projection alcanza a ambos, y el mismo molde con dos dueños (Deconstructor como primaria y como arma del compañero) son dos participantes de los que sólo el propio recibe el buff.

### El eje abierto: la clave de slot

**`Record<number, …>` no existe en runtime.** JavaScript pasa toda clave de objeto a string y un `.json` no tiene cómo escribir otra cosa, así que el tipo no atrapa nada de lo que entra desde afuera. **Y rompe cosas distintas según quién lea la clave**, ninguna ruidosa por sí sola:

| dónde | qué es la clave | qué pasa con una no entera |
|---|---|---|
| `mods` | el orden de combinación elemental (`DamageCombiner` hace `sort((a,b) => a.index - b.index)`) | el comparador devuelve `NaN`, el sort no ordena y **el emparejamiento de elementos queda arbitrario** |
| `evolutionPerks` | **el tier** (`entry.evolutions[tierStr]`) | no matchea y el perk se omite sin decir nada |
| `arcanes` | nada — se leen por `Object.values` | no se pierde dato; por eso el poblador no los valida |

Hubo un tercer modo de falla, peor y ya extinto: la traducción re-indexaba (`result[parseInt(k)] = v`), así que las claves rotas escribían la propiedad `"NaN"` y **tres de cuatro mods desaparecían**, ganando el último escrito. Lo grave nunca fue el bug sino que **el resultado tiene cara de válido**: el oráculo es el instrumento con el que se valida el motor contra el juego, y un número plausible y falso no corrompe código — corrompe una medición, y el modelo podría ajustarse para explicarlo.

**Por qué no se cierra con el mismo movimiento que el participante.** Que la identidad sea la posición vale para el squad (cuatro puestos, ley del juego) y para el hostil (lista sin tope), pero **no para los slots**: ahí la posición absoluta es de la UI (quién decide "acá van sólo exilus") y la cantidad varía con el portador — Jade lleva dos auras y un exilus. Lo que el motor necesita de un slot **no es el hueco sino el orden**, porque el orden de la grilla determina la combinación elemental (`../../references/wiki/mechanics/damage-types.md` §*Jerarquía de combinación*).

### El patrón durable

**Tres de las cuatro apariciones murieron sin que nadie negociara una forma:** el mapa de moldes se fue al colapsar la doble pasada sobre el espacio; el `parseInt` que producía el `NaN` se fue con la forma intermedia; y la identidad del participante se resolvió leyendo una estructura que **ya existía en A**. De ahí la lección: **una clave derivada puede no ser una decisión de identidad sino el precio de una duplicación, de una traducción, o de un trabajo que nadie tiene asignado** — y en los tres casos desaparece cuando se cierra lo que la generaba. Antes de rediseñar una clave, preguntar si existe porque algo se hace dos veces, se re-shapea sin necesidad, o porque una etapa está haciendo el trabajo de otra.

⚠️ **El precedente que NO se imita.** El ruteo cross-banda de `StaticHydrator` desambigua condicionalmente (`targets.length > 1 ? id@entidad : id`): una clave que **cambia de forma según cuántos haya**, así que la colisión reaparece en cuanto algo compare claves entre escenarios. La coordenada hace lo contrario — un participante único se nombra igual que uno de varios.

**Condición de cierre del eje que queda:** que la clave de slot deje de ser un `Record<number, T>`, o que se decida explícitamente que la guarda alcanza. Hoy `assertSlotKeys` (en el poblador) tira sobre una clave no entera nombrando portador y clave, `unlanded-modifiers.test.ts` fija ese grito y lleva la forma pendiente como `it.todo`.

**No bloquea:** el modelado de mecánicas ni la medición contra el juego, mientras las guardas estén.
**Vínculo:** `OQ-DATA-9` (el plano "0": A declara punteros, B/UI dereferencian — la pregunta madre) · [`simulation-architecture.md`](../domains/engine/design/simulation-architecture.md) §*El escenario consolidado: la foto de t=0* · [`arch-decisions.md`](../domains/engine/design/arch-decisions.md) §18 (ruteo por token, que consume el `entity_id`).

---

## OQ-ENGINE-31 — ¿Qué le falta a una entidad para ser modelable? — **ABIERTO — gated por medición y por capacidad**
**Dominio:** engine / modelo de entidades

**La pregunta no es en qué orden se modelan las entidades** — un ranking no tiene forcing-case y se discute sin cerrar. Es **qué le falta a una entidad para entrar**, y si ese faltante es el mismo para todas; el orden cae después, como consecuencia.

**El eje es la propagación de efectos, no el origen de la entidad.** Warframe, compañero, objeto de habilidad y minion son todos **portadores y receptores** de buffs. Que una nazca del loadout y otra de una habilidad es consecuencia de dónde nace, no una frontera que las separe. Tratarlas como cajones distintos lleva a construir un mecanismo por cajón cuando el problema real —a quién le llega un efecto y cómo— es uno solo.

**"Hay datos" no discrimina:** `companions.json` trae 83 entidades con stats de supervivencia (45 pet · 21 moa · 17 sentinel) y `shared/types/companion.ts` ya define `Companion` + `CompanionWeapon`; `vehicles.json` trae 150. Lo único sin dataset son los **minions**, que tampoco entran por loadout.

**El forcing-case es el compañero, con un gate ya declarado por escrito:** `semantic/upgrade-tokens.md` §*`AVATAR_` = el portador* fija que un mod de compañero con token `AVATAR_*` buffea **al compañero** (`Enhanced Vitality` → vida del sentinel), que rutearlo al warframe sería peor bug que el que arregla el salto por familia, y que **el caso compañero se decide cuando existan esas entidades**. Es un ruteo resuelto sólo para armas, con el otro lado esperando.

**Que los buffs de warframe alcanzan al compañero está asentado:** los compañeros **son *allies*** —como los NPC de misión—, así que el *"affects all allies in range"* ya los cubre. La entidad compañero nace **ya necesitando recibir efectos de otra entidad**: no es un portador aislado con su propio grafo, es un receptor.

**Lo abierto es el borde:** la mayoría de los buffs le llegan, **pero no todos**, y qué los separa no lo publica la página `Companion`. No es "¿propaga?" sino **qué determina que un efecto propague o se detenga en el portador** — sin esa regla el modelo enumera excepciones a mano. Se releva midiendo (**`ingame-tests/pending.md` P-5**), mismo régimen que `OQ-ENGINE-26`.

### El corpus: 158 mods, cinco direcciones

`mods.json` trae **158** `Companion Mod`; 29 tienen override curado y 37 conservan el token crudo de DE. El censo de [`arch-decisions.md`](../domains/engine/design/arch-decisions.md) §18 se hizo sobre los overrides, así que **el 82 % de este corpus no entró a ningún censo previo**. El eje que lo parte es **hacia dónde va el efecto**, y el `label` lo declara en **60 de 158**:

| Dirección | Casos | Estado |
|---|---|---|
| **1 · self** — el compañero se modifica | Enhanced Vitality · Metal Fiber · Calculated Redirection · Bite · Maul | resuelta por §18 |
| **2 · lee del warframe** | los 3 `Link *` · Hunter Synergy · Mecha Overdrive | `../semantic/upgrade-tokens.md` §Registro de lo inexpresable |
| **3 · escribe en el dueño** | Shield Charger · Guardian · Medi-Ray · Molecular Conversion · Anti-Grav Array · Hunter Recovery · Negate · Protect · Transfusion · Sacrifice | **sin dueño** |
| **4 · escribe en aliados** | Cat's Eye · Iatric Mycelium | **sin dueño** |
| **5 · trigger cruzado** — los `*Bond` | **16 mods**, `[[Category:Bond Mods]]` de la fuente | **sin dueño** |

**El eje no lo inventamos nosotros: DE lo declara en el token crudo.** Mismo stat, dos sujetos, dos tokens — `AVATAR_BLEEDOUT_MODIFIER` (el propio) vs `AVATAR_SENTINEL_MASTER_BLEEDOUT_MODIFIER` (el del maestro); `AVATAR_SENTINEL_PACK_LEADER` vs su `_REVERSE`. Los infijos `SENTINEL_` / `MASTER_` / `_REVERSE` **son** el eje del sujeto, y la normalización a D-6 los tira. `tandem-bond.wikitext` §Patch History registra como **bug corregido** que el trigger se contara del jugador (*"originating from your Companion's melee hits, **not your own**"*): DE trata el sujeto como contrato, no como detalle.

### Lo que la fuente refuta del modelo vigente

| Refuta | Fuente | Qué rompe |
|---|---|---|
| **Los tres niveles de alcance de §18 no expresan la dirección 3** | [`shield-charger.wikitext`](../../references/wiki/mods/shield-charger.wikitext): *"**Sentinels, Companions**, Rescue Targets, Operatives, Specters o Factional Allies **cannot benefit** from this mod"* | el destino es **el warframe del dueño y sólo él**: no es *propio* (incluiría al compañero portador) ni *aliado* (los excluye por nombre). Falta un cuarto nivel — **dueño** |
| **La dirección 2 no necesita vínculo de estado: son dos mecanismos superpuestos** | [`link-vitality.wikitext`](../../references/wiki/mods/link-vitality.wikitext) §Patch History `ver\|34` | el mod es vínculo de **máximo** (`source_entity` + `source_attribute` alcanza); que las restauraciones puntuales lleguen al pet es la **vía general de aliados** abierta en `ver\|34`. El mod aporta el **contenedor**, no el contenido — de ahí que no cree overshields ni comparta regen pasiva |
| **El gate por presencia de `vitalsProfile` tiene contraejemplo** | *"Venari **does not have any base shields, but can still equip Link Redirection to gain shields**"* | `ItemRepository` declara *"un stat ausente NO se materializa"*; acá el vínculo **crea** el nodo donde la entidad no lo tenía |

**El "dueño" es un rol, no una clase de entidad.** `guardian.wikitext` §Patch History `ver|42` corrige *"**Sevagoth's Shadow** not benefitting from […] Guardian"*: el receptor de la dirección 3 puede ser una **entidad derivada de habilidad**. Segunda evidencia independiente: `astral-bond` nombra Operador/Drifter/Amp **15** veces y al warframe **cero**. Eso ata esta OQ con `OQ-ENGINE-11` por el mismo nudo — quién ocupa el rol *dueño* cambia en runtime.

**La dirección 5 lee estado ajeno con tres predicados distintos.** En `reinforced-bond.wikitext` el buff de fire rate del jugador se gatea por el **máximo** de shields del compañero (estático), **o** por su shield **actual** con overshield (dinámico), **y** se desactiva si el compañero está *incapacitated* — un estado que no es ningún atributo. Es el eje 2 de §18 (*sujeto leído*) en forma pura, y ninguno de los tres predicados es del portador del mod. Su forma más difícil: en un Vulpaphyla el gate *"stays activated in their larval forms, **even though the larvae don't have enough shields**"* — la condición se evalúa contra una forma que la entidad ya no tiene.

**`AVATAR_ADD_ABILITY_DURATION` sobre un compañero no es el mismo stat.** `Tek Enhance` lo lleva con label *"+30% Kavat Ability Duration"* y `cats-eye.wikitext` lo computa sobre el uptime del precept (`10/(10+20)` → `(10×1.3)/(10×1.3+20)`): el token nombra la duración de los **precepts**, no la de las cuatro habilidades del warframe. Mismo nombre, otro nodo.

### El precept es el eje que el dataset no tiene

`companion.wikitext` lo define: *"precepts are mods which **alter the behavior** of a Companion, y son efectivamente sus **'abilities'**"*, específicos por tipo y otorgados al adquirir el compañero. Es una partición real —comportamiento vs. atributo— y **`mod_class` viene `null` en los 158**, así que el motor no puede distinguirlos. Su única fuente es la columna `Precept` de las diez tablas que `companion-mods.wikitext` transcluye.

🔴 **El atajo que el dataset parece ofrecer ya se midió: no sirve.** El `unique_name` parte los 158 con un corte sospechosamente limpio (105 bajo `/Lotus/Types/…` con `Precept` en el path, 53 bajo `/Lotus/Upgrades/Mods/…`, 158 exactos) y **no es esta partición**: contra la columna `Precept` de la tabla universal hay **12 desacuerdos sobre 26 filas**, todos los `*Bond` presentes ahí. El path agrupa por **cómo DE implementa el mod** —un Bond se implementa como precepto de sentinel— no por comportamiento ⊥ atributo. **46 % de desacuerdo en el único tramo verificable → el barrido va por página, no por path.**

**Lo que el precept aporta al modelo no son sus efectos sino su forma: es una habilidad con ventana, no un modifier.** Cat's Eye `10 s / cd 20 s` · Shield Charger `10 s / cd 30 s` · Guardian `cd 30 s`. ⚠️ El cooldown **no** es parte de la forma: `ambush.wikitext` dura 3 s sin cooldown y se gatea por **otro precept del mismo compañero** (`Ghost`), no por tiempo.

### Los `*Bond`: la fuente ya tiene el vocabulario del eje

**`[[Category:Bond Mods]]` agrupa a los 14, y sólo a ellos** — los homónimos `Deceptive Bond` (augment de Loki) y `Dreamer's Bond` (aura) no la llevan: el nombre es coincidencia léxica, la categoría es exacta. El corpus está capturado en [`references/wiki/mods/`](../../references/wiki/mods/) como `*-bond.wikitext`.

**Su forma es dos cláusulas que cruzan la frontera en direcciones opuestas** — el mod *es* el vínculo, no un efecto con destino:

| Mod | Una dirección | La otra |
|---|---|---|
| `astral-bond` | daño del **Operador/Drifter** → Void a los ataques del compañero | Void del compañero → eficiencia de **Amp y Transferencia** |
| `seismic-bond` | ability canalizada activa → shockwaves del compañero | ataques del compañero → **Ability Efficiency al dueño** |
| `tenacious-bond` | headshot kills → baja el recovery del compañero | CC del compañero > 50 % → **Crit Damage al arma del dueño** |
| `mystic-bond` | — | el compañero usa N habilidades → **el dueño castea sin energía** |
| `covert-bond` | finisher/mercy **del dueño** → stealth al compañero | — |

Tres cosas que fija este corpus:

- **Ninguno alcanza al squad.** Los 14 operan estrictamente sobre el par dueño ↔ compañero; la dirección 4 es de los **precepts**, no de los Bond. Los dos ejes no se mezclan, y eso los vuelve separables.
- **El recurso que más manipulan no existe en el modelo:** el *Companion Recovery Timer* aparece en **6 de 14**. **Su base son 60 s, iguales para todos** `[empirical]` — no es un gap de dataset sino una **constante de mecánica** del tipo de `ENEMY_GATE_DURATION`, y vive en `formulas/`. Lo que falta no es el número sino **el ciclo de muerte que lo consuma**.
- ⚠️ **El revive resetea los cooldowns de los precepts** `[empirical]`: es un **cierre de ventana por evento, no por tiempo** — la forma que [`time-model.md`](../domains/engine/design/time-model.md) §3 llama `until` conjuntivo. Sin verificar contra la wiki; el registro con autoridad sería `references/ingame-tests/`.

⚠️ **El vocabulario de sujeto de la prosa no es un campo:** los 14 nombran al receptor con `owner`, `you`/`your` o `Warframe` según la página, sin término canónico. Sirve para partir el corpus, no para alimentar un modelo.

**Hallazgo lateral, fuera del alcance de esta OQ, destilado a Issue:** `../semantic/upgrade-tokens.md` §Registro de lo inexpresable declara `absoluteCritBonus` *"no resoluble con el corpus local"*. `cats-eye.wikitext` §Notes lo resuelve **con** corpus local: da la segunda fuente del pool absoluto y su fórmula textual, donde el `45%` es **Arcane Avenger**, hoy clasificado en el pool relativo (`WEAPON_ADD_CRIT_CHANCE`). El término ya existe construido en `formulas/common/crit-base.ts` y no tiene emisor — ver Issue #27 (`__tests__/crit-stack-buff.test.ts`).

**Lo que el eje NO es: una familia de token.** Un `COMPANION_ADD_SHIELD_MAX` diría *"el nodo de shield del compañero"*, que es lo mismo que `AVATAR_ADD_SHIELD_MAX` sobre un portador compañero — y ese caso ya cae bien por §18. El faltante no es `{dónde}` vive el nodo sino **a quién le llega el efecto**: se resuelve en el alcance, no en el vocabulario.

**La progresión que esto sugiere no es de entidades sino de capacidades del motor** — una entidad se gana el lugar cuando el motor ya sabe propagarle lo que le llega: warframe → habilidades de buff simples → habilidades de daño simples → sentinel como entidad → reevaluar. Los escalones intermedios **no son entidades**, y ése es el punto.

**Residuo declarado, sin OQ propia:** el dataset clasifica **necramech dentro de `vehicles.json`** mientras el vocabulario de DE lo pone del lado del avatar (`AVATAR_` = warframe · archwing · necramech; `VEHICLE_` = lo que se monta). Dos cortes distintos sobre la misma entidad; se resuelve cuando el horizonte llegue ahí.

**No bloquea:** nada hoy. **Bloquea:** el ruteo de mods `AVATAR_*` de compañero, que hoy no tiene lado al que aterrizar, y cualquier decisión sobre entidades derivadas de habilidad.
**Vínculo:** `semantic/upgrade-tokens.md` §*`AVATAR_` = el portador* (el gate declarado) · `OQ-ENGINE-22` (EHP/DR de `enemy/` a `entity/`, la misma generalización desde otra cara) · `OQ-ENGINE-11` (exaltadas) · `data/reports/audit-arcane-ability-like.md` (minions como *entidad generada*) · `__tests__/volt.test.ts` (los `it.todo` de cap-para-aliados y opt-out) · `references/ingame-tests/pending.md` P-5.

---

## OQ-DOC-1 — Docs commiteados citan `.working/` (gitignored) como autoridad de razonamiento — **ABIERTO (2026-07-19)**
**Dominio:** governance / higiene de documentación

**Contexto:** líneas en docs commiteados referencian archivos de `.working/` (scratch de campaña,
gitignored). El archivo **no existe** fuera de la máquina donde se escribió, y —cuando el scratch se
purga— tampoco existe ahí. Choca con `docs/CLAUDE.md` regla 1 ("un doc activo nunca es la única copia
de un warrant del que depende una nota viva").

**La regla es única: ningún doc commiteado apunta a `.working/`.** Antes se toleraba una "Clase-1 de
procedencia honesta" con el argumento de que *equivalía a un puntero a git-history*. **Ese argumento
es falso:** `.working/` es gitignored, así que sus archivos **nunca estuvieron en git**. Un puntero a
un scratch purgado no lleva a un commit viejo — no lleva a ningún lado. Es una referencia muerta con
forma de cita, y se borra igual que cualquier otra.

Único caso que no aplica: nombrar `.working/` como **concepto del flujo** (`docs/CLAUDE.md` lo hace al
explicar el ruteo docs↔scratch). Eso no promete un archivo.

**Remediación por cita — dos formas:**
- **Puntero de procedencia** → se borra y la oración se reescribe auto-suficiente. **Ejecutado** en
  `doc-map.md`, `test-workflow.md`, `audit-arcane-ability-like.md`, `gap-map.md`, `data/decisions.md`,
  `closed-decisions.md` y `arch-decisions.md §13`.
- **Warrant vivo** — el doc **depende** del scratch para entenderse (plan de implementación con
  §-anchor, tabla de corpus). Requiere comprimir lo decidido inline **antes** de borrar el puntero.
  **Ejecutado:** `governance/decision-frontier.md` + `current-state.md` + `arch-decisions.md:535` → el
  plan de fases de `.working/ability-model-debate.md §9` se comprimió inline (estado real, verificado
  contra código: Fases 0/0.5/1a/1b ejecutadas, Fase 3 adelantada fuera de secuencia y ya construida).
  Pendiente:
  - `domains/ui-ux/decisions.md` (×2) + `doc-map.md:114` → `.working/consolidation-map.md` — gate:
    refactors **UI U-2**
  - `data/reports/audit-arcane-ability-like.md:505` → `.working/c1-corpus-roadmap.md §1`

**El gate real (corrige el "circular" aparente):** las citas que quedan parecen atascadas —el `.working/`
no madura a docs, y las decisiones que lo desbloquearían están diferidas— pero la regla dura pide solo que
**el doc no dependa del `.working/` para entenderse**, NO que el diseño esté cerrado. Por eso la remediación
**no es graduar** (ésa sí la bloquea el horizonte), sino **hacer la oración commiteada auto-suficiente sobre
lo YA decidido y borrar el puntero**. Eso es ungated y editorial, por cita — independiente de
habilidades/source-state. **Pregunta operativa:** ¿la oración ya se sostiene sin el `.working/` (→ borrar el
puntero) o hoy **depende** de él (→ comprimir lo decidido inline primero)?

**El alcance es todo lo commiteado, no sólo `docs/`.** `references/` también entra a git y también
tiene citas — 8, ninguna hasta ahora inventariada: `CLAUDE.md` (×2), `wiki/README.md` (×2),
`wiki/mechanics/{calculating-bonuses,status-effects}.md`, `ingame-tests/double-dip.md`. Se parten en
las mismas dos formas: las de `CLAUDE.md`/`wiki/README.md` nombran `.working/` como **destino del
flujo** ("se preserva en `.working/` con su procedencia") — el caso exento, no prometen archivo; las
de `calculating-bonuses.md`, `status-effects.md` y `double-dip.md` son **punteros de procedencia** y
se borran reescribiendo la oración.

**No bloquea:** cada doc afectado es legible; el puntero roto solo se nota en otra máquina. **Degrada:**
reproducibilidad del razonamiento fuera de esta máquina.
**Vínculo:** `docs/CLAUDE.md` regla 1 (warrant pegado a la nota viva) + regla 4 (procedencia vive en git).
**Fuente:** cierre de la campaña engine-fidelity F1–F5 (2026-07-19); inventario reproducible:
`grep -rn '\.working/' docs/ references/`.

---

## OQ-DOC-2 — Detección de fuente estancada: la señal que falta es la inversa de la que existe — **ABIERTO**
**Dominio:** governance / higiene de fuentes ajenas

**Contexto:** `references-layout.mjs` detecta **una** patología: *la fuente se movió después de que
destilamos*. La opuesta —*la fuente no se mueve hace años*— está **nombrada** en
`references/wiki/README.md` §Las tres fechas ("fuente estancada") y **no se mide en ningún lado**.

El costo ya se pagó: `Module:Maximization/data` está congelado desde **2021-05** y
`Module:Ability/data/stats` desde **2022-07**; cuando el primero dejó de tocarse el juego iba por Hotfix
30.2.2 y hoy va por 43.0.8. `references/wiki/sources/` está exento del régimen de fechas, así que nada
podía avisarlo — y se llegó a escribir un doc apoyado en un módulo de 2021 antes de mirar su historial.
Los `.md` de `sources/` ya declaran su fecha real; **lo que falta es que sea ejecutable**.

### Se parte en dos herramientas, no una

**(a) `sources/` al régimen de fechas — angosto y ejecutable ya.** Cinco módulos Lua. La señal es la
antigüedad de la última edición del módulo, y la unidad correcta **no es el calendario**: es **cuántas
versiones del juego se publicaron desde entonces**, expresable con `version-data.lua`, que ya está
capturado. *"302 parches después"* es un argumento; *"hace cuatro años"* es una anécdota.

**(b) Frescura per-item — el trabajo grande.** Un umbral global miente en las dos direcciones: pueden
pasar 70 versiones sin que una mecánica cambie en lo más mínimo. La pregunta correcta es **por ítem**:
*¿cuándo se modificó esto por última vez → se actualizó en nuestro proyecto?* Es el mismo criterio que
ya usa el audit de overrides, y el patch history está disponible por las dos vías (la API de la wiki y
el raw que `omniframe-items` destila).

### El límite que define el tier de salida

**El patch history da un evento, no un alcance.** Que un warframe se haya tocado sólo en su pasiva **no
descarta** que sus cuatro habilidades estén desactualizadas — el parche nombra lo que DE decidió nombrar.
Por eso (b) **no puede emitir veredictos**: su salida es una **worklist de revisión**, tier informativo y
ratcheteable. Un check de frescura que pretenda decir "esto está mal" se llena de falsos positivos y se
aprende a ignorar, que es cómo mueren estas herramientas.

**Nota de alcance:** (a) no puede usar el mecanismo de (b) — los módulos Lua **no tienen patch history del
juego**, sólo historial de edición de la wiki. Son dos señales distintas sobre dos clases de fuente.

**No bloquea:** nada. **Degrada:** una fuente muerta se detecta cuando alguien la recuerda, no cuando se
muere. **Vínculo:** `references/wiki/README.md` §Las tres fechas, `references/CLAUDE.md` §Qué audita cada
herramienta, `docs/domains/source/wiki-modules.md`, `Project/scripts/references-layout.mjs`.
**Fuente:** los dos módulos congelados, encontrados por memoria del usuario y verificados con
`prop=revisions` (residuo R-17).

---

## OQ-ENGINE-37 — `evitar` ⊥ `mitigar` ⊥ `acortar` ⊥ `limpiar`: cuatro verbos bajo un solo nombre — **ABIERTA, recién planteada**
**Dominio:** engine / defensa del portador

**Cómo se abrió.** Escribiendo [`time-model.md`](../domains/engine/design/time-model.md) apareció
*Primed Sure Footed*, que **impide que el hecho nazca** — no acorta su ventana ni baja su número. Ese
caso no era de tiempo, y al buscarle dueño **no había ninguno**. Los otros dos ejes que el modelo de
tiempo ruteó afuera sí lo tenían (`OQ-ENGINE-29`, `OQ-ENGINE-24`); éste es el que faltaba.

**La pregunta.** El corpus llama *"resistencia"* a cuatro operaciones que actúan en momentos distintos
sobre cosas distintas. ¿Son cuatro verbos irreducibles, o algunos colapsan? Y para cada uno: **¿dónde
vive** —anclaje, resolución, ventana o estado— y **cómo componen entre sí**.

| Verbo | Qué hace | Cuándo actúa | Casos |
|---|---|---|---|
| **evitar** | el efecto **no nace** | antes de que exista | *Primed Sure Footed*, *Sure Footed*, *Power Drift*, *Fortitude*, *Resolute Focus*, *Cautious Shot* · Overguard **del jugador** (*"niega todos los status"*) · toda la lista *Inmunidad real* |
| **mitigar** | el número **baja** | al resolver | *Adaptation* (cap 90%, por tipo) · armor · shields · la DR de habilidades |
| **acortar** | la ventana **dura menos** | durante | *Pain Threshold*, *Constitution*, *Handspring* |
| **limpiar** | el efecto ya nació y **se remueve** | después | Excalibur *Purging Slash* · Hildryn *Pillage* · Revenant *Reave* · Saryn *Molt* · Wyrm *Negate* |

### `Adaptation` es el forcing-case de `mitigar`, y está más cerca de lo que parece

**El dato está entero y muere en la hidratación** — mismo modo de falla que el Emerald Archon Shard
antes de que se le acuñara token. Medido sobre `mods.json`: dos entradas
(`/Lotus/Upgrades/Mods/Warframe/AvatarResistanceOnDamageMod` y su gemela Nemesis) con los **11 rangos**
y el texto completo — *"When Damaged: +5% Resistance to that Damage Type for 10s. Stacks up to 90%"*
(rango 10: `+10%` / `20s`) — y **`upgrade_types: []`**. No falta fuente: falta token.

**Y su forma ya está construida.** `+X% por instancia recibida, cap 90%` es Familia A
(`stackDebuffValue` + `applyStackProc`), la misma que resuelven los cinco behaviors de stack. El
portador tampoco falta: `EntityState` ya corre sobre un warframe del catálogo por el camino real
(`__tests__/state-neutrality.test.ts` — 11 de sus 15 construcciones no son hostiles) y ya contrasta
mitigación del Tenno vs del hostil sobre la misma armadura.

**Lo que sí falta, medido:**

| Pieza | Estado |
|---|---|
| token `AVATAR_*` para la resistencia por tipo | ausente — los `AVATAR_CHANCE_RESIST_*` son **chance de resistir un proc**, otro verbo (`evitar`) |
| el disparo *"when damaged"* | `applyProc` lo llama el **emisor**; esto nace de **recibir** — no hay hook en la resolución sobre el portador |
| un `resolutionModifier` **por tipo de daño** | hoy el contrato ofrece `armorMult` y `layerMult` (por capa); la DR por tipo no tiene canal |
| `ReceiverContext` en `resolutionModifier` | ✅ existe el contexto, ❌ no llega a ese método (`arch-decisions §17`) |

**Ninguna de las cuatro es de decisión** — son construcción, y las cuatro se pueden estresar contra
dato real hoy. Esto no cierra la OQ (los otros tres verbos siguen sin caso construido), pero saca a
`mitigar` de *"cero implementación"*: tiene el dato, la ley y el portador.

### Lo que ya está medido y no hay que re-derivar

**La fuente misma los separa, y en dos lugares distintos.**
`crowd-control.md` §*Resistencia ≠ velocidad de recuperación*: *"Son dos ejes distintos, y la wiki los
lista en secciones separadas"* — o sea `evitar` ⊥ `acortar` está declarado, no inferido.
`buff-debuff.md` §Status Immunity parte la lista en *"**Inmunidad real**"* vs *"**Sólo limpia (no
inmuniza)**"* — `evitar` ⊥ `limpiar`, también declarado.

⚠️ **Y la fuente se contradice en un punto:** *Constitution* y *Handspring* aparecen en **ambas** listas
—resistencia bajo `Knockdown`, velocidad de recuperación bajo `Stagger`—. La partición es real; su
adjudicación caso por caso, no.

**Dos familias de mitigación con reglas de composición distintas** (`buff-debuff.md` §Defense):

| Familia | Entre sí | Con las otras |
|---|---|---|
| **Damage Reduction** | multiplicativo | multiplicativo con armor |
| **Damage Type Modifier** (*Adaptation*, *Aviator*, resistencias elementales, **los shields**) | **aditivo** | multiplicativo con DR |

⇒ `mitigar` **no es un verbo con una regla**: son dos pools que componen distinto, y la línea entre
ellos la declara la fuente, no una taxonomía nuestra.

**El eje cruza la clase del portador.** El Overguard *evita* del lado del jugador y **no hace nada** del
lado del enemigo (`overguard.md` §*Jugador y enemigo se comportan distinto*). Y *Adaptation* declara que
su DR **no aplica a Overguard**. Es la misma pregunta local de `time-model.md §8` (*toda regla de
anclaje se resuelve local; algunas no discriminan por clase*), sobre otro material.

### Estado de la implementación: **cero**

| Qué | Estado |
|---|---|
| `AVATAR_INJURY_BLOCK_CHANCE` (resistir knockdown/stagger) | **token declarado, sin consumidor** — `shared/types/modifier.ts:292` lo anota como *"un token distinto, no D-6"* |
| *Adaptation* | no modelada |
| `evitar` / `limpiar` | no existen como concepto en el motor |
| `stagger` | está en el vocabulario (`shared/types/damage.ts`) y **no tiene behavior** |

### Hipótesis a estresar (no elegir todavía)

- **H1 — son cuatro y viven en capas distintas.** `evitar` es **anclaje** (§8 de `time-model`: la
  entidad declara qué le llega) · `mitigar` es **resolución** · `acortar` es **ventana** · `limpiar` es
  **estado**. Si se sostiene, el eje no necesita módulo propio: se reparte entre mecanismos que ya
  existen o están planteados.
- **H2 — `evitar` y `limpiar` son el mismo verbo en distinto `t`.** *"No nace"* y *"nace y muere ya"*
  dan el mismo resultado observable en la mayoría de los casos. Falsable: buscar un efecto donde
  **haber nacido deje rastro** (un contador que subió, un trigger que disparó).
- **H3 — `acortar` no es un verbo sino un desvío de parámetro.** Sería `arch-decisions §17` aplicado a
  la duración: el **receptor modifica** el parámetro `until` del hecho. Si se sostiene, `acortar`
  desaparece y queda cubierto por la cadena de desvíos de `arch-decisions §17`.

**Gate para cerrarla:** ninguna. **No la abre un consumidor** — la abre que cuatro operaciones distintas
compartan nombre y que el proyecto no tenga dónde ponerlas. Lo que sí está gateado es *construir*: hoy
no hay un solo consumidor de defensa del portador en el motor.

**Vínculo:** [`time-model.md`](../domains/engine/design/time-model.md) §*Lo que vive SOBRE el tiempo*
(de dónde salió) y §8 (la pregunta local) · `OQ-ENGINE-29` (el payload del CC, eje hermano) ·
`arch-decisions §17` (la cadena de desvíos, que H3 reusaría) · `§22` (capa ⊥ estado ⊥ clase).
**Fuente:** `references/wiki/mechanics/{crowd-control,buff-debuff,overguard,damage-reduction}.md`,
`references/wiki/mechanics/adaptation.wikitext`.
