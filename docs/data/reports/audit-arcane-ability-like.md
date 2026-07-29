---
Estado: "referencia"
Rol: "auditoria-manual"
Impacto_ID: "OQ-ENGINE-17"
Fidelidad_Fisica: "Project/public/data/arcane-stats.override.json"
Fecha_de_creacion: "2026-07-09"
Fecha_de_actualizacion: "2026-07-09"
---

# Auditoría manual — corpus arcane ability-like (`upgrade_type:null`)

**Estado:** barrido completo (2 pases). Migrado desde `.working/arcane-corpus-sweep.md` al cerrar
`DC-OQ-ENGINE-17` (`docs/governance/closed-decisions.md`). Residuo-tabla crudo — consulta bajo
demanda, no lectura obligatoria de sesión. Precedente/hermano: `audit-arcane.md` (auditoría del
corpus completo con `condition`, 2026-06-02) y `audit-mods.md`.

**Pase 2 (2026-07-09):** todo ítem marcado abajo con 🔎 fue **contrastado contra la wiki real**
(WebFetch), no solo contra la palabra del usuario. Varios ítems que se creían triviales resultaron
tener escalado por rank o reglas de exclusión no capturadas — ver "Correcciones del pase 2" al
final.

**Scope note:** parkeados Amp (5) + Operator (17) + Zaw (5) + Kitgun (7) = 34 arcanos — ver
`OQ-DATA-14` (ensamblaje de DNA modular) y el gate de foco-operador. Corpus real en scope: **51
arcanos** (23 warframe + 11 secondary + 8 primary + 7 melee + 2 `unknown`).

**Decisión que este barrido produjo:** `DC-OQ-ENGINE-17` — no es familia-vs-per-arcano binario. De
85 arcanos `upgrade_type:null`: 34 parkeados, 2 familias reales (13 casos —
`STACK_DECAY_BUFF`/`arch-decisions.md §11`, `linearThresholdScale`/`§12`), 6 complejos con
`references/*` propio, ~30 genuinamente per-arcano.

---

## Familia A — buff de daño con decay temporal (8)

*Forma: `evento → +val% por Ns, cap Nx` — mismo patrón `CONDITION_OVERLOAD` (§9/§10 arch-decisions).*

Primary Deadhead · Primary Dexterity · Primary Exhilarate · Primary Merciless · Cascadia Flare ·
Secondary Deadhead · Secondary Dexterity · Secondary Merciless

**Veredicto del usuario:** nada que aportar — de los más fáciles de modelar, hoy. **No contrastado
contra wiki en pase 2** (el usuario los conoce bien, meta consolidada — foco del pase 2 fue el
residuo).

**Decisión de arquitectura tomada (2026-07-09):** operación `STACK_DECAY_BUFF`, hermana de CO (no
reuso) — ver [`arch-decisions.md §11`](../../domains/engine/design/arch-decisions.md). Cruza
`OQ-DATA-4` (evidencia D-20) y `OQ-ENGINE-16` (caso de estrés, distinto del clúster proc-stacking).
Prerequisito antes de cablear: popular `base_value` (hoy `null`) de estos 8 arcanos con el valor
per-stack real (ya extraído acá arriba, en las notas de cada uno del override).

## Familia D — corregida (2026-07-09) tras verificar contra código real

*Forma original asumida en pase 1: `bonus = (stat_fuente / unidad) × valor, cap` — generaliza
OQ-W-6. Al verificar el código (`SimulationEngine.ts`) contra los 6 miembros originales, 2 no
encajan y se reclasifican:*

**Reclasificado → Familia CO (no Familia D):** **Secondary Shiver**. `arch-decisions.md §10` ya
tenía esta fila desde antes de esta sesión: "Escalado aditivo per-N | CO, Galvanized ×3, Cedo,
**Shiver (per freeze stack)**, mayoría de perks | `coef × stacks × N` | `CONDITION_OVERLOAD`". Lee
stacks de Cold del **target**, no un stat propio — es CO-shape, no cross-attribute. Solo necesita
el enganche genérico per-arcano routeando a `CONDITION_OVERLOAD`, cero fórmula nueva.

**Reclasificado → tratamiento tipo Familia A (C1-declarado, no cross-attribute-read):**
**Melee Retaliation**. Lee Shields **actuales** (recurso vivo, fluctúa en combate), no un atributo
resuelto en el grafo de build estático. No encaja en `source_attribute` (que asume una fuente
fijada al terminar de resolver la build) — se declara como input asumido, mismo espíritu que los
stacks de CO/Familia A.

**Familia D real (5 miembros, no 6):** Melee Doughty · Primary Bulwark · Arcane Battery ·
Arcane Bellicose · **Arcane Expertise** (agregado — estaba mal puesto en "residuo, listo" en el
pase 2; comparte la misma forma estructural: lee Ability Strength resuelto → bonus a Max Shields).

**Veredicto del usuario (pase 1, previo a esta corrección):** nada que aportar, más fácil de
modelar hoy. **Corrección post-verificación de código (ver sección "source_attribute" más abajo):**
depende de infraestructura real a mitad de camino (grafo topológico + campo `source_attribute` ya
existen, pero sin productores reales ni fórmula de consumo validada para este shape). No es tan
"fácil" como se asumió en el pase 1 — necesita resolver primero el debate de `source_attribute`.

## Familia E — pickup radial compartido (2)

Arcane Energize · Arcane Pulse

**Veredicto del usuario:** modelable, pero deprioritizado por cantidad/utilidad/prioridad arbitraria
del usuario. Queda "a un lado" — no es bloqueo técnico. **No contrastado en pase 2** (deprioritizado).

---

## Residuo per-arcano (35) — captura ítem por ítem, verificada 🔎

### Melee (5)

**Melee Afflictions** 🔎 — `references/wiki/arcanes/melee-afflictions.md` (creado)
Confirmado complejo. Fórmula de 4 pasos (MBD por proc → promedio por tipo → Affliction Hit →
DoT tick). Tabla de restricción CC-state×enemy-state (Overguard bloquea todo; Cold-freeze solo
permite Ragdoll). Exclusiones de mods elementales por tipo (Heat NO se beneficia salvo Heat
Inherit; Gas cap 10 stacks; Blast no usa Affliction Damage). Bug conocido: Lifted da 12 stacks en
vez de 6. Posible bug de scaling exponencial con Faction/Status bonus, sin confirmar vigencia.
→ **Verdict: complejo, `references/*` propio — HECHO.**

**Melee Careen** 🔎
- Multiplicador escala por rank: **1.25x (R0) → 2.50x (R5)**, no un valor fijo.
- Solo afecta enemigos **completamente congelados** (10 stacks de Cold).
- Cold aplicado por rodar dura 6s; afectado por pasivas universales (Harmony, Lavos) pero **NO**
  por mods de duración (Lasting Sting).
- Shivering Contagion afecta la pasiva de Cold-al-rodar sin importar el arma equipada, incluso
  Robóticas.
- Sinergiza con Arcane Ice Storm, Primary Frostbite, Secondary Shiver.
→ **Verdict: fórmula simple con escalado por rank a capturar (no es un valor fijo).**

**Melee Duplicate** — `references/wiki/arcanes/melee-duplicate.md` (creado)
Chance 25%→100% por rank. El golpe duplicado **re-rollea** crit tier y status de forma
independiente (no hereda el original). Exclusiones: Shield Gating en la instancia AoE separada,
Seeking Talons no fuerza status en el duplicado, Exodia Contagion solo si el primer burst no mata.
→ **Verdict: simple, `references/*` propio — HECHO.**

**Melee Influence** — `references/wiki/arcanes/melee-influence.md` (creado)
Confirmado complejo. Chance fija 20% (no escala), radio/duración sí escalan (10m/3s → 20m/18s).
**Faction Damage Bonus se aplica 2× en daño directo y 3× en status procs** — detalle crítico no
trivial. Lista cerrada de status propagables/excluidos. No refrescable mientras activo.
→ **Verdict: complejo, `references/*` propio — HECHO.**

**Melee Vortex** 🔎
- Chance escala por rank: **20% (R0) → 45% (R5)**, no fija — corrige la lectura previa de "simple,
  20% fijo".
- Radio constante 18m en todos los ranks.
- Magnetic Status no necesita ser infligido por el arma portadora — confirmado con ejemplo de
  companion robótico + precept + arma modded.
→ **Verdict: simple, pero con chance escalable a capturar (no fija como se creía).**

### Primary (3)

**Primary Debilitate** 🔎
- Chance escala **50% (R0) → 100% (R5)** — dato que faltaba en la primera pasada.
- El Status Effect extra se aplica como instancia de daño **separada** → Faction Damage Bonus
  multiplica el DoT de Heat/Electricity/Toxin **3 veces por separado**.
- Solo activa una vez por instancia de daño.
- Aplica status desde cualquier fuente de daño elemental combinado (ej. Smite Infusion).
→ **Verdict: simple con chance escalable + detalles de composición a respetar.**

**Primary Obstruct** 🔎
- Radio constante 15m; **cooldown escala 60s (R0) → 10s (R5)** — dato nuevo.
- Animación de jam ~4s (igual a Shooting Gallery), duración variable según animación del enemigo.
- ⚠️ **Discrepancia pendiente de verificación manual directa (no cerrada):** el extracto menciona
  una "30 meter diameter zone around the effected enemy where enemies will be stunned" — esto NO
  aparece en el override (`arcane-stats.override.json` solo registra el radio de 15m del jam).
  Puede ser un artefacto de la extracción (confundir con otra sección de la página) o un efecto
  real no capturado. **No aceptar sin re-verificar la página directamente antes de implementar.**
- CC puede prolongarse con Cold procs o Gloom (aturdimientos repetidos antes de que termine la
  animación).
→ **Verdict: ability-like, en pausa, marcar `notes:[]` — pero con más estructura numérica de la
  asumida (radio/cooldown por rank son datos limpios); el "30m stun zone" necesita verificación
  directa antes de descartarlo o capturarlo.**

**Primary Plated Round** 🔎 — [wiki](https://wiki.warframe.com/w/Primary_Plated_Round)
- La fórmula literal que devuelve la extracción ("Damage Bonus=15⋅5⋅Max Magazine Size") **es
  sospechosa de estar mal renderizada** (probable símbolo de raíz perdido en la conversión
  HTML→texto) — no cuadra con los 3 ejemplos dados por la propia wiki.
- **Aproximación empírica derivada de los ejemplos** (1 bala=33.5%, 80 balas=300%, 300 balas=580.9%):
  `Damage Bonus % ≈ 33.5 × √(magazine_size)` — ajusta los 3 puntos con <1% de error. **Pendiente:
  validar contra la página directamente antes de implementar** (no confiar en la fórmula literal
  extraída).
- Duración escala 3s (R0) → 10s (R5).
- Reloads parciales otorgan el % proporcional del bono completo (ej. 50% del cargador = 50% del
  bono completo, no 0).
- **No activa** con armas de batería (kitguns con Pax Charge).
- Solo la transformación Incarnon activa el buff; la desactivación no.
→ **Verdict: fórmula real más compleja que "simple" — posible raíz cuadrada, requiere confirmación
  manual de la wiki antes de implementar.**

### Secondary (6)

**Cascadia Empowered** 🔎
- Daño escala 250 (R0) → 750 (R5), aplicado como instancia extra por proc de status (si hay
  múltiples procs de status en un impacto, se suma daño extra por cada uno).
- **NO afectado por:** daño/elemento/físico estándar, Galvanized Shot stacks, Synth Charge, mods de
  crítico, Eclipse, pasiva de Garuda, Void procs de Xata's Whisper, Cold maggots de Dual Coda
  Torxica, weakspots, falloff (shotguns/explosiones).
- **SÍ afectado por:** mods/bonuses de facción (una vez), Damage Vulnerability (Caliban Sentient
  Wrath, Gara Mass Vitrify, Splinter Storm), Temporal Shot de Zenurik + Seeking Talons, Toxin procs
  de Toxic Lash.
→ **Verdict: la lista de exclusiones/inclusiones ya está bien documentada en la wiki — baja la
  necesidad de test in-game manual, alcanza con capturar la lista tal cual.**

**Secondary Encumber** 🔎
- Chance escala 4% (R0) → 24% (R5). Para multishot: `1 − (1 − 24%×min(statusChance,1))^pelletCount`.
- Pool de 13 tipos de daño físico/elemental (excluye efectos de aturdimiento — solo los que se
  muestran en la barra de vida del enemigo).
- **Solo aplica el status, no genera instancia de daño nueva.**
- Máximo **1 proc adicional por instante de tiempo**, incluso con multishot >100% — y en multi-target
  solo 1 proc para 1 de los targets afectados por instante.
- **Exaltadas SÍ pueden equiparlo y triggerearlo desde Update 38.5** (Mesa Regulators, Titania Dex
  Pixia, Dante Noctua, Hildryn Balefire Charger) — resuelve la duda planteada por el usuario.
- Armas beam/cadena (Atomus) corregidas en Update 33.0 para recibir el bonus correctamente.
- **Sinergia con Roar: no mencionada en la wiki** — sigue sin resolver, requiere test in-game si se
  necesita.
→ **Verdict: mejor documentado de lo esperado (exaltadas resuelto), pero Roar sigue pendiente de
  test real.**

**Secondary Enervate** 🔎 — [wiki](https://wiki.warframe.com/w/Secondary_Enervate)
- Bonus **aditivo**, no multiplicativo: ejemplo literal de la wiki, Lato con 7 stacks = 10% +
  (7×10%) = 80% crit chance.
- Reset tras N "Big Critical Hits" (tier por encima de crítico normal, >100% crit chance, naranja/
  rojo), escala 1 (R0) → 6 (R5).
- Hitscan con multishot = 1 hit único; proyectiles múltiples cuentan por separado.
- Múltiples Big Crits en el mismo tick de juego cuentan como 1 solo stack para el contador de reset.
- Hard cap: no puede triggerear más de 30 veces/segundo.
→ **Verdict: fórmula específica confirmada, con datos de implementación finos (tick-based
  dedup, cap de 30/s) que antes no estaban.**

**Secondary Fortifier** 🔎
- `Overguard ganado = daño_a_Overguard ÷ 100` (redondeo hacia abajo).
- Multiplicador de daño extra a Overguard escala **×3 (R0) → ×8 (R5)**.
- Cap duro: 15,000 Overguard en todos los ranks.
- El daño extra a Overguard **no es heredable** entre stacks — se aplica dinámicamente y se pierde
  al agotar el Overguard del target.
- Detalle de combate: período de inmunidad de 0.5s — con cadencia de disparo >2.0/s puede producir
  "functional immortality" en el usuario.
→ **Verdict: contrario al veredicto original ("nada relevante") — SÍ hay fórmula con escalado y un
  detalle de combate no trivial (inmunidad funcional).**

**Secondary Irradiate** 🔎
- Daño radial escala **180% del hit inicial a 7m** (R5); radio escala 4.5m (R0) → 7m (R5).
- Requiere exactamente 10 stacks de Radiation presentes — **no los consume**.
- Los "spread hits" requieren línea de visión, se calculan como hits de cuerpo independientes (sin
  heredar headshot/weakspot), y cada uno rollea su propio crítico.
- Multishot dispara spread hits adicionales, **excepto en armas beam**.
→ **Verdict: confirma la sospecha del usuario: son cuestiones de simulación física (línea de
  visión, hits independientes con su propio roll de crítico) que probablemente no interese modelar
  ni en C2. Candidato real a "descarta" per gate §8.**

**Secondary Surge** 🔎 — verificado, la info del usuario era correcta al 100%.
Dato adicional: solo funciona en secondarias, incompatible con `OPERATOR_SUIT` equipado, requiere
21 arcanos Dissolution para maxear.
→ **Verdict: simple, fórmula clara, confirmado sin cambios.**

### Warframe (19) + unknown (2)

**Arcane Survival** — no existe en el juego ni en la wiki; edge-case conocido del dataset de
`@wfcd/items`. No se modela — marcar en `notes[]` como edge-case no modelable.
→ **Verdict: no modelable, dataset edge-case, marcar notes[]. (No se re-verifica, no hay wiki.)**

**Arcane Temperance** — mismo caso que Arcane Survival.
→ **Verdict: no modelable, dataset edge-case, marcar notes[].**

**Arcane Barrier** 🔎
- Chance **y** cooldown escalan juntos por rank: 1%/1s (R0) → 6%/6s (R5) — el cooldown NO es un
  valor fijo, escala 1:1 con el rank.
- "On Shield Damage (can no longer activate when receiving damage to health)" — solo trigerea con
  daño directo a shields, no a health.
- Puede triggerear incluso canalizando habilidades que drenan shields en el tiempo.
→ **Verdict: contrario al veredicto original ("nada que aportar") — el cooldown SÍ escala con el
  rank, no es fijo.**

**Arcane Blessing** 🔎
- 24 Max Health por stack (R5), cap 50 stacks = +1200 HP total.
- Orbes universales (Transmutation Probe) y de habilidades (Citrine, Nekros, Protea) cuentan como
  Health Pickup.
- **El cap NO se resetea** — persiste hasta la muerte del warframe (confirma el "3er modelo de
  decay" ya anotado, ver nota cruzada abajo).
- Permite seguir recogiendo orbes de salud sin estar bajo vida máxima, hasta 50 stacks.
→ **Verdict: simple, confirmado — decay-model = "permanente hasta muerte", no vence por tiempo.**

**Arcane Bodyguard** 🔎
- Curación escala 150 (R0) → 900 (R5) por cada 6 Melee Kills en 30s.
- Puede curar **cualquier** companion activo, incluyendo Sentinels y MOAs — no requiere proximidad
  explícita documentada.
- **No revive** al companion si está incapacitado.
→ **Verdict: simple, confirmado con escalado y alcance (cualquier companion, sin restricción de
  proximidad documentada).**

**Arcane Camisado** — `references/wiki/arcanes/arcane-camisado.md` (creado)
Fórmula limpia (1%→6% por ataque de minion, cap 10 stacks) pero lista cerrada de qué cuenta como
"minion" (15 casos sí, 15 casos no). Fuera de scope real: depende de un concepto "minion invocado
ataca" que el engine no modela hoy.
→ **Verdict: fuera de scope (depende de minions), `references/*` — HECHO.**

**Nota de precaución (2026-07-09, debate de priorización):** no confundir "modelar Camisado" con
"agregar un token más" — exige sintetizar una **entidad derivada** (minion: quién lo invocó, qué
cuenta como su ataque, vida propia). Esto NO es exclusivo de minions — hay otras entidades
derivadas de habilidades/unique-traits en el mismo cajón (exaltadas ya tienen su OQ propia,
`OQ-ENGINE-11`; minions serían la siguiente instancia del mismo patrón general "entidad generada
por habilidad, no por loadout directo"). El Warframe anfitrión hoy es básicamente loadout + ~8
nodos genéricos (`project-engine-fase-inventario`) — construir una jerarquía de sub-entidades sobre
un cimiento tan delgado es el riesgo de over-engineering que `CLAUDE.md` pide cortar. **No abrir OQ
nueva** — cuando llegue el momento, es candidato a generalizar junto con `OQ-ENGINE-11` bajo un
concepto más amplio de "entidades derivadas", no a resolver ítem por ítem.

**Arcane Circumvent** 🔎 — resultó **más complejo** de lo asumido originalmente.
- Roba **3 recursos distintos simultáneamente**, no "un %" genérico:
  - **Armor:** cap 1000, dura 15s, basado en el Armor del enemigo con más Armor entre los tocados
    ("Rolling into multiple enemies will not add Armor to the buff" — no suma, toma el máximo).
  - **Shields:** puede convertirse en overshields.
  - **Overguard:** cap 10,000.
- % robado escala 25% (R0) → 50% (R5).
- Radio de efecto: 4m. Cualquier roll (incluso a enemigos sin shields/armor) refresca la duración.
- Además strippea las defensas del enemigo tocado (efecto ofensivo simultáneo).
- Funciona con maniobras de dodge especiales no-roll (ej. Aegis Storm de Hildryn).
→ **Verdict: revisar la decisión de "fuera de scope por ahora" — es más rico que un simple robo de
  %, pero la fórmula en sí (3 acumuladores con cap propio + regla de "toma el máximo, no suma") es
  perfectamente modelable en C1 sin depender de ningún sistema ausente. Candidato a reconsiderar
  como "modelable ya" en la próxima pasada de prioridad. PENDIENTE: confirmación del usuario del
  cambio de veredicto (no cerrado).**

**Arcane Double Back** 🔎
- Confirmado: aditivo intra-stack (+75% DR a 3 stacks), multiplicativo con otras fuentes de DR.
- Duración 4s **por stack independiente** (cada stack tiene su propio timer, no un timer compartido)
  — dato nuevo, relevante para el modelo de decay.
- **Detalle no obvio importante:** para llegar a 3 stacks hay que hacer las **3 acciones distintas**
  (Dodge + Double Jump + Bullet Jump) — repetir la misma acción NO acumula. Ej. 2 Bullet Jumps
  seguidos solo dan 1 stack; Bullet Jump + Dodge da 2 stacks.
→ **Verdict: la regla de "diversidad de acción requerida" es un detalle de composición no trivial
  que el veredicto original no capturaba.**

**Arcane Eruption** 🔎
- Chance escala 17% (R0) → 100% (R5); radio escala 5m → 30m.
- Knockdown atraviesa paredes, no requiere línea de visión.
- Orbes universales de Lavos (Transmutation Probe) SÍ activan; Equilibrium Health Orb conversion y
  Energy Motes de Emergence Dissipate NO activan (Emergence Dissipate está parkeado en Operator de
  todas formas).
- Update 34.0: ahora activa incluso con pools de salud/energía al máximo (aunque ya no recoge el
  orbe en esa condición).
- No se especifica cooldown en la wiki.
→ **Verdict: escalado por rank más agresivo de lo asumido (17%→100%, no un valor casi fijo).**

**Arcane Escapist** 🔎
- Duración de invulnerabilidad 12s (R5), consume 3 de 9 stacks acumulables.
- **Sin cooldown — los stacks duran indefinidamente** hasta usarse (confirma el 3er modelo de decay
  ya anotado).
- Otras pasivas de warframe (Dagath, Nidus, Khora, Voruna, Valkyr) que evitan la muerte se activan
  **antes** que Escapist (orden de prioridad relevante para el modelo).
- Bug conocido: Well of Life deja de salvar tras conseguir al menos 1 stack.
→ **Verdict: simple, confirmado — 3er modelo de decay (permanente/consumido, no por tiempo).**

**Arcane Expertise** 🔎
- La tasa de conversión de Ability Strength→Max Shields escala 50% (R0) → 100% (R5) — **no es
  "1:1 fijo"** como se podría asumir.
- Fórmula base: `shield_bonus = (Ability_Strength_actual − 100%) × tasa_de_conversión`. Ejemplo
  literal: 150% strength → +50% shield capacity (a 100% de tasa, R5).
- **Regla asimétrica importante:** Ability Strength por debajo de 100% **reduce** el shield máximo
  (no es un piso en 0).
- Buffs temporales de Strength (Energy Conversion, Growing Power) SÍ contribuyen mientras están
  activos; buffs de una sola activación se remueven **antes** de que la habilidad se active.
→ **Verdict: la fórmula real tiene una tasa de conversión escalable por rank Y una regla asimétrica
  bajo 100% — más rica que "% de Ability Strength aplica a Shields" tal cual la lee el override.**

**Arcane Ice Storm** 🔎
- Cap de stacks escala **10 (R0) → 20 (R5)** — no es un valor fijo.
- Duración por stack: 15s; todos los stacks se remueven juntos al vencer la duración, y se
  refrescan al congelar de nuevo (decay-conjunto, como Familia A).
- **Armas de companion NO triggerean el arcano.**
- No parece activar contra enemigos con shield en el Simulacrum (dato de testing comunitario, no
  oficial).
- Harrow's Condemn da stacks cuando enemigos afectados reciben daño del jugador — marcado por la
  wiki como "unintended interaction" (posible bug, no diseño).
- Atlas Petrify y otros efectos de congelamiento sin ser daño Cold real **no** activan el arcano.
→ **Verdict: cap escalable por rank (dato nuevo) + varias exclusiones finas a respetar.**

**Arcane Intention** 🔎
- Bonus escala 40 (R0) → 250 (R5) Max Health, **por cada habilidad canalizada simultánea activa,
  hasta 4 stacks** (+1000 HP máximo a R5) — el usuario solo había capturado el delay de 1s, no el
  stacking por múltiples canalizaciones simultáneas.
- Activar el arcano también **cura** al warframe por la misma cantidad de HP ganado (efecto
  secundario no mencionado originalmente).
- Delay de 1s tras terminar la habilidad que sostenía el efecto, antes de poder reactivarla.
- Ciertos mods anulan la activación (Iron Shrapnel, Resonating Quake, Tectonic Fracture).
→ **Verdict: más rico de lo capturado — stacking hasta 4x por canalizaciones simultáneas + efecto
  de curación secundario, no solo "Max Health por habilidad activa".**

**Arcane Persistence** — `references/wiki/arcanes/arcane-persistence.md` (creado)
Cap de daño/s escala 750(R0)→500(R5). Umbral de Armor `>=700` (no estrictamente `>700` pese a la
redacción). Se desactiva con Magnetic Status/Ability Nullifying. Bajo Overguard solo cappea el
primer hit de cada ventana de 1s (limita mucho su efectividad real).
→ **Verdict: prioridad alta (meta), `references/*` propio — HECHO.**

**Arcane Steadfast** 🔎
- Chance escala **5% (R0) → 20% (R5)** — el usuario no había capturado que la chance escala (solo
  mencionó "revisar wiki").
- "Next three Abilities" excluye habilidades sin costo inicial y bajo 3 energy/s modded (Mach Rush,
  Pulverize, Parasitic Link) — esas no consumen ni activan las cargas.
- **No refrescable mientras está activo** — una vez que negoció el costo de una habilidad, no puede
  volver a activarse hasta agotar las 3 cargas.
- Visual: 3 orbes de energía orbitan al warframe, decayendo con cada carga usada.
- Habilidades canalizadas solo tienen gratis el lanzamiento inicial (no el drain continuo).
- Hildryn y Lavos no usan energy → el arcano no tiene beneficio para ellos.
- Stackea con Inner Might para una carga efectiva de 4.
→ **Verdict: chance escalable por rank (dato nuevo) + regla de "no refresh" que cambia el modelo de
  un simple "% chance on cast" a un contador de cargas.**

**Arcane Trickery** 🔎
- **La chance NO escala con rank — fija en 15% en todos los ranks** (Update 31.6 la subió de 3% a
  15% permanentemente). Solo la **duración** escala 5s (R0) → 30s (R5).
- "Finisher Kill" incluye Parazon Mercy kills, habilidades como Blade Storm (Ash) y Mercy's Kiss
  (Oraxia), y ground finishers — pero NO Mercy's Kiss en unidades regulares sin finalizador Parazon.
→ **Verdict: contrario al veredicto original ("nada que aportar") — el dato relevante es que la
  chance NO escala (fija 15%), solo la duración sí — evita el error de asumir escalado uniforme
  entre todos los stats de un arcano.**

**Arcane Truculence** 🔎
- Radio del Radial Attack: 30m a R5 (no capturado antes).
- Daño Viral: **10 stacks de Viral por cada múltiplo de 3000 Overguard alcanzado** — dato más
  preciso que "aplica max Viral Status stacks".
- Respeta línea de visión, no atraviesa paredes.
- Icono muestra contador de progreso hacia el próximo umbral.
→ **Verdict: confirmado el trigger de múltiplos + agrega radio y la cantidad exacta de stacks
  Viral (10 por umbral, no "máximo" genérico).**

**Molt Reconstruct** 🔎
- Escala 1 (R0) → 6 (R5) HP por punto de energy gastado en el costo **inicial** de cast (no
  funciona con drenaje continuo: Peacemaker, Gloom quedan excluidos).
- Lavos e Hildryn no se benefician (no gastan energy).
- **La curación a aliados también se aplica a uno mismo, duplicando efectivamente el auto-heal** —
  detalle no capturado en el veredicto original ("nada que aportar").
- No afecta NPCs aliados; no dispara efectos secundarios de Archon Intensify.
→ **Verdict: contrario al veredicto original — hay un detalle de duplicación de auto-heal + lista
  de exclusiones (habilidades de drenaje continuo, Lavos/Hildryn) que sí importan para modelar.**

**Theorem Contagion** — fuera de scope, de momento (depende de zonas Residual, que están
parkeadas bajo Kitgun — ver `OQ-DATA-14`/park de kitgun).
→ **Verdict: fuera de scope, confirmado — dependencia directa de Residual (100% kitgun-parked).**

**Theorem Infection** — mismo caso, depende de zonas Residual (kitgun-parked).
→ **Verdict: fuera de scope, confirmado.**

---

## Correcciones del pase 2 (lo que cambió al contrastar contra la wiki)

Items donde el veredicto original ("nada que aportar" / "simple, listo") **subestimaba** la
complejidad real:

| Arcano | Lo que faltaba |
|---|---|
| Melee Vortex | Chance escala 20%→45% por rank, no fija |
| Primary Debilitate | Chance escala 50%→100% por rank |
| Primary Obstruct | Cooldown escala 60s→10s; posible efecto "30m stun zone" sin verificar en el override |
| Primary Plated Round | Fórmula literal de la wiki es sospechosa (posible raíz cuadrada perdida en extracción); derivada empírica `≈33.5×√(magsize)` |
| Secondary Fortifier | Multiplicador escala ×3→×8; cap 15,000; detalle de "functional immortality" por inmunidad 0.5s |
| Secondary Irradiate | Confirma sospecha del usuario: son cuestiones físicas de simulación, candidato real a "descarta" |
| Arcane Barrier | Cooldown escala 1s→6s junto con la chance (no fijo) |
| Arcane Circumvent | Roba 3 recursos con reglas propias (Armor=toma el máximo no suma, Shields→overshields, Overguard cap 10k) — más rico que "un %"; **candidato a reconsiderar como modelable ya**, no "fuera de scope" |
| Arcane Double Back | Requiere 3 acciones *distintas* para stackear, no solo repetir la acción |
| Arcane Eruption | Chance escala 17%→100%, más agresivo de lo asumido |
| Arcane Expertise | Tasa de conversión escala 50%→100% + regla asimétrica bajo 100% Strength |
| Arcane Ice Storm | Cap de stacks escala 10→20 por rank |
| Arcane Intention | Stackea hasta 4x por canalizaciones simultáneas + cura al activarse (no solo 1 instancia) |
| Arcane Steadfast | Chance escala 5%→20%; modelo real es "contador de cargas no-refrescable", no "% simple on-cast" |
| Arcane Trickery | La chance NO escala (fija 15%) — solo la duración; esto es información igual de valiosa que un escalado real |
| Arcane Truculence | Agrega radio (30m) y cantidad exacta de stacks Viral (10/umbral) |
| Molt Reconstruct | Auto-heal se duplica (cura a "aliados" incluye al propio jugador) |

**Confirmados sin cambios:** Secondary Surge, Cascadia Empowered (la lista de exclusiones ya
estaba completa), Secondary Encumber (agregó el dato de exaltadas, pendiente solo Roar), Secondary
Enervate, Arcane Blessing, Arcane Bodyguard, Arcane Escapist.

**Pendiente de verificación manual directa (no aceptar el extracto automático tal cual):**
Primary Obstruct (30m stun zone), Primary Plated Round (fórmula con posible raíz cuadrada).

---

## Síntesis (post pase 2)

- **Listos, simples, sin bloqueo real:** Familia A (8) + Familia D (6) + Blessing, Bodyguard,
  Double Back, Eruption, Escapist, Trickery, Truculence, Molt Reconstruct, Debilitate, Vortex,
  Careen, Surge, Cascadia Empowered, Secondary Encumber (salvo Roar), Barrier, Ice Storm,
  Expertise, Steadfast, Intention, Fortifier (25) = **~39 arcanos modelables ya**, todos con datos
  de escalado por rank ahora capturados correctamente (antes varios se habrían implementado con
  valores fijos incorrectos).
- **Deprioritizado (no bloqueo técnico):** Familia E (2).
- **Fórmula específica, sin generalización:** Secondary Enervate (1).
- **Candidato real a descarte de modelado físico (gate §8 `descarta`):** Secondary Irradiate (1).
- **Ability-like, en pausa, marcar `notes:[]`:** Primary Obstruct (1) — pendiente verificar el
  posible efecto de stun-zone antes de cerrar el veredicto.
- **Necesita verificación manual antes de implementar (extracción automática sospechosa):**
  Primary Plated Round (1).
- **No modelable — dataset edge-case:** Arcane Survival, Arcane Temperance (2).
- **Fuera de scope, confirmado (depende de sistema no modelado):** Arcane Camisado (minions),
  Theorem Contagion, Theorem Infection (3).
- **Reconsiderar — pase 2 sugiere que SÍ es modelable ya, contra el veredicto original:** Arcane
  Circumvent (1) — pendiente de que el usuario confirme el cambio de veredicto.
- **`references/*` propio, ya creados:** Melee Afflictions, Melee Duplicate, Melee Influence,
  Arcane Camisado, Arcane Persistence, Arcane Universal Fallout (6).

**Nota cruzada con OQ-ENGINE-16:** Arcane Blessing y Arcane Escapist confirmados como los únicos
del corpus con stack **permanente sin decay temporal** (Blessing: persiste hasta la muerte;
Escapist: sin cooldown, dura indefinidamente hasta consumirse) — 3er modelo de decay a sumar a los
"2 modelos divergentes" que ya menciona esa OQ, distinto del decay-conjunto de Familia A / Ice
Storm.

## Pendientes (no cerrados por este barrido)

- **Primary Obstruct** — verificar directamente contra la wiki si el "30m stun zone" es real o
  artefacto de extracción.
- **Primary Plated Round** — confirmar la fórmula `≈33.5×√(magazine_size)` contra la página
  directamente (no aceptar la extracción literal).
- **Arcane Circumvent** — pendiente de que el usuario confirme el cambio de veredicto (de "fuera
  de scope" a "modelable ya").
- **Secondary Encumber + Roar** — sinergia no documentada en wiki, requiere test in-game si se
  necesita.

## Vínculos

- `docs/governance/closed-decisions.md` — `DC-OQ-ENGINE-17` (la decisión que este barrido produjo)
- `docs/governance/open-questions.md` — `OQ-ENGINE-16`, `OQ-DATA-14`
- `docs/domains/engine/design/arch-decisions.md` §11 (`STACK_DECAY_BUFF`), §12
  (`linearThresholdScale` + `source_attribute`)
- `.working/c1-corpus-roadmap.md` §1 — tabla de corpus que este barrido alimenta
- `Project/public/data/arcane-stats.override.json` — fuente del corpus
- `references/wiki/arcanes/arcane-*.md` — los 6 `references/*` creados en este barrido
