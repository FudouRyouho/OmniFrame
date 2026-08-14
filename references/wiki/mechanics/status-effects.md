# Status Effects (Procs)

> Estado: activo
> Rol: mecánicas de efectos de estado — aplicación y reparto, los status sin tipo de daño, fórmulas de DoT, stacks, duración, CC, y las tres defensas
> Fuente de verdad de: comportamiento de procs — aplicación por pellet, **re-normalización del reparto por inmunidad del enemigo**, los **status independientes del daño** (y cuáles cuentan para CO), DoT, stacks, duración/ciclo de vida, CC, **Status Damage como stat**, y la partición inmunidad / cleansing / resistencia
> No usar para: elección del tipo de proc por peso de daño — ver `damage-types.md` §Regla de elección de proc
> Última actualización: 2026-08-13
> Fuente: https://wiki.warframe.com/w/Status_Effect
> Fuente actualizada: 2026-07-02
> Raw: status-effect.wikitext

## Distinción fundamental

Un **efecto de estado** (proc) es independiente del tipo de daño que lo activa.

- `heat` → tipo de daño (componente de la distribución de daño del arma)
- `Ignite` → efecto de estado aplicado al enemigo al triggerear un proc de calor

---

## Tabla de tipos → procs

| Tipo de daño | Proc | Interno | Categoría |
|---|---|---|---|
| `impact` | **Knockback** | `PT_KNOCKBACK` | CC |
| `puncture` | Weakened | `PT_FRAILTY` | Debuff |
| `slash` | Bleed | `PT_BLEEDING` | DoT |
| `heat` | Ignite | `PT_IMMOLATION` | DoT + Debuff |
| `cold` | Freeze | `PT_CHILLED` | CC |
| `electricity` | Tesla Chain | `PT_ELECTROCUTION` | DoT (AoE) + CC |
| `toxin` | Poison | `PT_POISONED` | DoT |
| `blast` | **Detonate** | `PT_FLASHBANG` | DoT + AoE |
| `corrosive` | Corrosion | `PT_CAUSTIC_BURN` | Stack Debuff |
| `gas` | Gas Cloud | `PT_ASPHYXIATION` | DoT (AoE) |
| `magnetic` | **Disrupt** | `PT_MAGNETIZED` | Stack Debuff |
| `radiation` | Confusion | `PT_RAD_TOX` | CC |
| `viral` | **Virus** | `PT_INFECTED` | Stack Debuff |
| `void` | Bullet Attract | `PT_RADIANT` | CC |
| `tau` | Status Vulnerability | — | Debuff |
| `true` | — | — | — |

> **Los nombres de la columna `Proc` son los visibles; los `PT_*` son los internos.** Una versión
> anterior de esta tabla traducía los códigos —*Infection*, *Disruption*, *Detonation*— en vez de
> usar los nombres reales. `Damage` y `Status_Effect` coinciden en los tres.

**Un hit proca un solo tipo de daño**, salvo con status chance > 100% (ver abajo).

---

## Status que NO vienen de un tipo de daño

> La wiki marca esta sección con **`{{Community}}`** y **`{{UpdateMe|Hidden status effects need more
> research}}`**. Varias entradas llevan signo de interrogación de sus propios autores.

Existen en paralelo a la tabla de arriba: los aplican armas, habilidades o mecánicas, **sin pasar por
la distribución de daño**.

| Status | Interno | Qué hace |
|---|---|---|
| **Stagger** | `PT_STAGGERED` | *"Universal: players and enemies get staggered for a brief moment"* |
| **Big Stagger** | `PT_BIG_STAGGER` | stagger más largo. Opticor, Opticor Vandal, Vulkar, Vulkar Wraith — y el techo de **5+ stacks de Impact** |
| **Knockdown** | `PT_KNOCKED_DOWN` | jugadores y enemigos caen al suelo |
| **Lifted** | `PT_LIFT_HIT` | suspende brevemente en el aire |
| **Ragdoll** | `PT_RAGDOLL` | lanza el cuerpo por el aire, incapacitando |
| **Microwave** | `PT_MICROWAVE_BURN` | agranda una parte del cuerpo al dispararle. **Duración infinita.** Exclusivo de **Nukor** y **Kuva Nukor** |
| **Stun** | `PT_STUNNED` | inmoviliza y bloquea disparo; en enemigo, **abre a finishers de melee 3 s** |
| **Sleep** | `PT_SLEEP` | duerme al enemigo temporalmente |
| **Silence** | `PT_SILENCED` | desactiva habilidades activas e impide castear |
| **Slow** | `PT_GLUE` | *(la wiki no lo describe)* |
| **Disarmed** | `PT_DISARMED` | desarma al objetivo. Halikar y Halikar Wraith *(la wiki duda)* |
| **Parried** | `PT_PARRIED` | abre a finishers *(la wiki duda; ¿vía Parry?)* |
| **Impair** | `PT_ROOTS` | **sólo Conclave** — bloquea saltos y baja velocidad **2 s**; después, 2 s de inmunidad a lo mismo y a knockdowns |
| ? | `PT_VOID` | sin describir |

> ### Tres de ellos cuentan para Condition Overload
>
> **Knockdown, Lifted y Microwave** cuentan como *"individual status"* para **Condition Overload,
> Galvanized Aptitude, Galvanized Savvy y Galvanized Shot** — la wiki lo declara **en la fila de cada
> uno**, y `Condition Overload (Mechanic)` lo repite en su propia lista. Dos páginas coincidiendo.
>
> **Microwave es el caso extremo:** duración **infinita** y exclusivo de la familia Nukor — un stack
> permanente para el multiplicador de CO.
>
> Lifted y Knockdown **no pueden coexistir** en el mismo objetivo (→ [`condition-overload.md`](condition-overload.md)).

---

## Aplicación: status chance

- **El roll es por pellet, no por disparo**: el status chance del Arsenal es la probabilidad
  de que **cada pellet individual** aplique un proc (ej. wiki: Strun Wraith 12% × 10 pellets
  = 10 rolls independientes de 12%). **Confirmado con fundamento histórico** (nota de parche
  `{{ver|27.2}}`, `raw/status-effect.wikitext` L937-952): antes de ese parche el SC de Arsenal
  venía inflado por multishot en el display; se separó a un stat propio y **desde entonces el
  SC mostrado ya es la probabilidad real por pellet**, sin ajuste adicional. Las escopetas tienen
  un buff ×3+ ya horneado en su dato base (mismo motivo) — no hace falta modelar caso especial.
- **>100%**: cada hit puede aplicar efectos de estado adicionales "únicos", **confirmado y con
  mecanismo explicado** (`raw/status-effect.wikitext` L168-172, cita literal):
  > *"When a weapon achieves a status chance higher than 100%, each hit may apply additional
  > 'unique' status effects. **The type of each proc is independently drawn**, so it is possible
  > to apply the same status several times in one hit."*
  > *"A specific status type shown at 100% status chance... does not guarantee that status
  > effect. An example... a weapon that has 200% Status with only Heat and Impact... can still
  > trigger two heat or two impact status effects regardless of their relative status chance
  > values."*
  > *"If a single attack hits multiple enemies, **each enemy gets their own status roll**..."*

  Origen del mecanismo — nota de parche `{{ver|27.2}}` (L943-952), cita de diseño de Digital
  Extremes: *"When you hit a Status Chance greater than 100%, a single damage instance will be
  able to create two Status Effects. ...a Shot with 200% Status Chance modded with both Blast
  and Toxin Damage, that single shot will result in both Status Effects!"*

  Fórmula del promedio agregado (no el generador discreto de una tirada individual):

  ```text
  Procs promedio por disparo = Multishot × (Forced Procs + Status Chance por proyectil)
  ```

  ⚠️ **"Forced Procs" en esta fórmula NO es "la parte garantizada de un SC>100%"** — es un
  mecanismo de arma/mod **separado y aparte** (`raw/status-effect.wikitext` L360-367, sección
  `==Forced Procs==`): *"Forced Procs are guaranteed to occur regardless of the status chance
  and damage distribution of the weapon... **this is not the same as having 100% status
  chance**."* (ej. Hunter Munitions, Kunai con Slash forzado innato). Para la mayoría de las
  armas ese término es 0; el `Status Chance por proyectil` de la fórmula es el SC crudo, sin
  descomponer — el 150% SC ≈ 1.5 procs promedio ya lo captura tal cual, sin floor+remainder.
  El generador discreto exacto de una tirada única (¿floor(SC) garantizados + frac(SC) de
  chance del extra, por analogía con `multishot.md`?) sigue sin una fórmula explícita en la
  wiki — residual de baja prioridad, no bloqueante (detalle del debate en
  `.working/c2-population-rng-stress.md`).
- **Qué tipo sale**: ponderado por la participación de cada tipo en el daño del hit
  (`Proc Type Chance = Damage ÷ Total Damage`) — detalle en `damage-types.md` §Regla de elección.
  Aplica igual a cada proc-slot resuelto, **incluida la porción garantizada** (ver cita arriba).
- ⚠️ **Era**: el peso ×4 de los físicos (Impact/Puncture/Slash) de Damage 2.0 **ya no existe**
  en la página actual — fuentes viejas que lo citen están desactualizadas.

### La inmunidad del enemigo re-normaliza el reparto

> *"Proc type chances are **not altered by enemy resistances or weaknesses** to the damage components
> used in their computation; however, **they are modified by enemy status immunities**. When an attack
> procs a status effect on an enemy which is immune to a particular proc type, **the respective damage
> type is excluded from proc type chance calculations**."*

O sea: la resistencia al **daño** no toca el reparto de procs; la inmunidad al **status** sí — saca ese
tipo del denominador y reparte su peso entre los demás. Ejemplo de la wiki (20 Impact / 5 Puncture /
10 Slash / 25 Heat / 50 Corrosive):

| | Impact | Puncture | Slash | Heat | Corrosive |
|---|---|---|---|---|---|
| normal | 18.18% | 4.55% | 9.09% | 22.73% | 45.45% |
| **inmune a Corrosion** | **33.33%** | **8.33%** | **16.67%** | **41.67%** | **N/A** |

El 45.45% del Corrosive no se pierde: **se redistribuye**. Contra un enemigo inmune a un status, el
resto de los tipos proca *más*, no igual.

### Lo que NO cambia con el daño

**Subir el daño de un tipo no alarga su proc.** Más Radiation no confunde por más tiempo — sólo
aumenta la probabilidad de que salga Confusion.

### Armas continuas

> *"Despite Continuous Weapons firing only one beam after adding multishot (with damage instances
> merged), it will **still proc status effects as if more than one projectile was visually present**."*

El multishot beneficia el status de las continuas **como en cualquier otra arma**, aunque el daño se
fusione en un solo tick (→ [`multishot.md`](multishot.md)).

### Forced procs — la interacción con Tornado

Los forced procs **no se aplican a los enemigos atrapados en los Tornados de Zephyr**: se aplican **al
tornado**, que después proca sobre los enemigos el status con el que quedó afectado.

---

## Duración y ciclo de vida

> ✅ Tabla **corregida contra las subpáginas por tipo** (`Damage/<Tipo>_Damage`, barrido
> 2026-07-02) — la tabla de la página general estaba marcada "outdated" por la propia wiki
> y tenía al menos un valor muerto (decía Impact 1 s; la subpágina da 6 s).

| Proc | Duración base | Fuente |
|---|---|---|
| Slash, Heat, Toxin, Electricity, Gas (DoTs) | 6 s | subpáginas |
| Cold, Viral, Magnetic | 6 s | subpáginas |
| Impact (stagger) | 6 s | subpágina (la general decía 1 s — muerto) |
| Corrosive | 8 s | subpágina |
| Tau (Status Vulnerability) | 8 s | subpágina |
| Puncture | 10 s | subpágina |
| Radiation | 12 s | subpágina |
| Void (Bullet Attractor) | 3 s | subpágina |
| Blast | 1.5 s de fusa por stack | subpágina (rework) |

- Más duración = más ticks = más daño total en DoTs (los ticks son 1/s).
- **Conteo de ticks — todos los DoT dan 6 ticks.** Lo que cambia es **dónde caen**:

  | Time from proc | 0s | 1s | 2s | 3s | 4s | 5s | 6s |
  |---|---|---|---|---|---|---|---|
  | Slash · Heat · Toxin | ❌ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
  | Electricity · Gas | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ | ❌ |

  > *"**Area of effect** statuses (Electricity y Gas) **siempre empiezan a hacer daño en el momento**
  > en que se procan, mientras que los de **objetivo único** (Slash, Heat, Toxin) tienen **1 segundo
  > de retardo**."*

  **La página general y las subpáginas `Damage/<Tipo>_Damage` coinciden** — verificado contra Slash,
  Gas y Electricity. Una versión anterior de este doc afirmaba *"Gas: 7 ticks según su subpágina"*:
  era un error de lectura de la tabla —contar las siete **columnas** `0s..6s` en vez de los seis
  ✓— que sobrevivió porque esas subpáginas **no estaban capturadas** y nadie podía cotejarlo.
- **Status Duration (mods):** documentado por subpágina solo en: **Blast** (la fusa escala;
  excepción: la detonación ocurre igual aunque la duración total sea <0%), **Heat** (alarga
  los *intervalos* del ramp de armor strip — +100% duración = strip cada 1 s en vez de 0.5 s),
  y **Electricity** (el stun de ~3 s **NO** escala — cita textual; el DoT no está especificado).
  El resto de tipos: **no especificado en su subpágina** — dudoso abierto.
- ✅ **Gate de Magnetic resuelto (2026-07-30, con el raw en mano).** La frase que sonaba anómala
  —*"status duration mods … are a final multiplier to the **total** damage"*— **no es un error**:
  no habla del status de Magnetic sino del **proc forzado de Electricity** que se dispara al
  romper escudos/Overguard. Ese proc entrega un total fijo (**3% de los escudos máximos por
  stack**, hasta 30%) **repartido en 6 s**; alargar la ventana agrega ticks, así que la duración
  multiplica el total. Es correcto por la magnitud a la que se aplica. El gate se abrió sólo
  porque la frase se leyó sin su contexto —la subpágina no estaba capturada—. Detalle en
  [`damage-elemental-combined.md`](damage-elemental-combined.md) §Magnetic.

---

## Stacks: caps y comportamiento

> Fuente: subpáginas por tipo (2026-07-02).

| Proc | Cap | Sobre-cap | Timers |
|---|---|---|---|
| Slash, Toxin, Electricity | **sin cap mecánico** (solo límite visual de 10) | n/a | timer propio por instancia |
| Heat | sin cap especificado | n/a | **excepción: los stacks se consolidan en UN solo tick/s compartido; procs nuevos refrescan y suman al tick** |
| Corrosive, Magnetic, Radiation, Viral, Gas | 10 | reemplaza al más viejo (documentado en Corrosive/Magnetic/Radiation/Viral) | timer propio por stack |
| Cold | 10 (**bosses/Overguard: 4**) | el 10º congela 3 s; al descongelar quedan 3 stacks residuales | timer propio |
| Impact, Puncture | 5 | reemplaza al más viejo (Puncture: aunque al viejo le quede más duración) | timer propio |
| Blast | 10 | detonación al 10º **o al morir el target** | fusa propia de 1.5 s por stack |
| Tau | 10 | no especificado | timer propio |

**Regla general emergente:** timer independiente por stack/instancia en casi todos;
la única consolidación real es **Heat**. "Reemplaza al más viejo" es el patrón sobre-cap
en todos los que lo documentan.

✅ **Reforzado por observación directa (usuario, 2026-07-02):** Kuva Nukor (Magnetic puro,
alto rate de proc por ser arma de rayo) — decaimiento visible stack por stack, 6→5→4→...→0,
uno a la vez. Confirma el modelo de timer-independiente-por-stack también en Magnetic (no
solo inferido por texto, visto en vivo). Generaliza con alta confianza a Radiation/Tau (mismo
lenguaje de stacking). **Distinción correcta señalada por el usuario:** Knockdown (ventana de
vulnerabilidad/finisher de Heavy Attack) NO es uno de los 16 tipos con proc elemental — es una
mecánica de combate distinta, fuera de esta taxonomía; no contradice el patrón, confirma que
el corte 16-tipos-vs-mecánicas-de-combate está bien puesto.

---

## Procs de tipo DoT

> **Fórmula (autoritativa — `raw/damage-over-time.wikitext §DoT Damage Scaling`, capturada 2026-07-15):**
> ```
> tick = coef × modded_base_damage × (1 + own_element_bonuses) × (1 + faction)² × (1 + status_damage) × extras
> ```
> **Ejemplo trabajado del wiki (Bleed):** arma innata 100 + Serration + Bane of Grineer →
> `100 × (1 + Serration 1.65) × 0.35 × (1 + Bane 0.3)² × (1 + Rifle Elementalist 0.9)`.
>
> - `modded_base_damage` = **daño base del arma** (total, todos los tipos sumados) × bonos de daño base
>   (Serration, multiplicadores de daño tipo Furious Javelin/Eclipse, debuffs de enemigo tipo Molecular
>   Prime). **El elemento del DoT define el tipo/peso del tick, NO su magnitud** — el DoT escala con el
>   TOTAL, no con el daño de su solo elemento.
> - `own_element_bonuses` = **SOLO los mods de daño del propio elemento** (Hellfire→Heat, Malignant Force→Toxin):
>   - Aplica solo a status **elementales**; los mods **físicos NO** (Sawtooth Clip no buffea Slash → **Slash
>     lleva `own_element = 0`**, la excepción estructural).
>   - Los DoT de status **combinados** (Gas, Blast) **NO** los buffean sus mods componentes (Thermite+Infected);
>     solo el **daño elemental literal** (Leaded Gas, Valence Formation, Thermal Transfer). Funciona en reverso:
>     Toxic Lash + mods Corrosive buffean el Toxin DoT forzado.
> - `(1 + faction)²` = **double-dip** (el faction ya está en `modded_base` y se aplica una vez más — confirmado
>   empírico en las secciones de abajo).
> - Otros factores que heredan del hit inicial: crit, Stealth, Status Damage (Rifle Elementalist), Melee/Sniper
>   Combo, multiplicadores de body-part. (Weakspots de Sonar/Detect Vulnerability **NO** pasan al proc.)

### Bleed (Slash)

```
tick_damage = 0.35 × modded_base_damage × (1 + faction) × (1 + status_damage)
```

- 6 ticks en 6s (delay 1s → ticks en s1..s6; corregido, antes decía 7)
- Tipo de daño del tick: **Cinematic** (`DT_CINEMATIC_DAMAGE`) — el armor no lo afecta.
  **No es "True/Cinematic": son dos tipos distintos, cada uno con su página.** Lo que aplica el
  proc de Slash es Cinematic; "True" es un término de jugadores para otro tipo, que comparte la
  propiedad de ignorar la DR de armadura pero no la fuente. Ver
  [`damage-unique.md`](damage-unique.md)
- `modded_base_damage` = daño base total × (1 + bonos de daño base) × (1 + faction)
- Los mods de daño Slash **no** aumentan el tick (tampoco Buzz Kill/Contagious Spread/finisher
  mods); sí lo hacen base damage, faction (double-dip explícito) y status damage
- ✅ **Composición True↔Viral confirmada empíricamente (usuario, 2026-07-02) — boundary case
  cerrado.** Dorrclave (Slash puro, 421.8) vs Arid Butcher, tick baseline 233 → con 2 stacks
  Viral 525 (×2.2532, predicción 2.25, 0.14% error) → con 4 stacks 642 (×2.7554, predicción
  2.75, 0.20% error) → con 5 stacks 700 (×3.0043, predicción 3.00, 0.14% error). **El daño que
  ignora armor NO es inmune a Viral** — el bypass es específicamente sobre la reducción de armor,
  no sobre los multiplicadores de capa. Regla de composición confirmada: "ignora armor" ≠
  "inmune a todo lo demás"; sigue siendo daño de capa-salud a efectos de Viral. Crit
  también se apila limpio (mismo patrón que el test de Dual Toxocyst). Sigue sin verificar si
  la matriz de vulnerabilidad por facción (`enemy-resistances.md`) también alcanza a este daño —
  pregunta distinta, no probada en este test.
  > **Qué midió realmente este test.** La sonda fue un tick de Slash, y **el tick de Slash es
  > Cinematic, no True** — distinción que no teníamos cuando se escribió. Los números y la regla
  > de composición no cambian; lo que cambia es el alcance de la etiqueta: está **medido sobre
  > Cinematic** y **extrapolado** a True, que es otro tipo con otras fuentes. Extrapolación
  > razonable —las dos páginas declaran el mismo bypass— pero no medida.

### Ignite (Heat)

```
tick_damage = 0.5 × modded_base_damage × (1 + heat_bonuses) × (1 + faction) × (1 + status_damage)
```

- ticks 1/s por 6s tras ~1s de delay; **stacks consolidados en un solo tick/s compartido**
  (procs nuevos refrescan y suman) — única excepción al patrón timer-por-stack
- Tipo de daño del tick: Heat — afectado por armor del enemigo
- Efecto adicional: reduce armor hasta 50% (ver §Corte de armor por Heat); el strip
  **se revierte gradualmente** al expirar (recupera armor cada 1.5s durante 6s)

### Poison (Toxin)

```
tick_damage = 0.5 × modded_base_damage × (1 + toxin_bonuses) × (1 + status_damage) × (1 + faction)
```

- 6 ticks en 6s (delay 1s); stacks sin cap mecánico, timer propio por instancia
- Tipo de daño del tick: Toxin — **bypasa shields (el hit directo y el DoT), pero NO Overguard**
- Double-dip de faction explícito en la subpágina: `(1 + faction)²` efectivo
  (+69% con Bane ×1.3, +140.25% con Primed ×1.55)

### Electricity DoT (Tesla Chain)

```
tick_damage = 0.5 × modded_base_damage × (1 + electricity_bonuses) × (1 + faction) × (1 + status_damage)
```

- 6 ticks en 6s; stacks sin cap mecánico, timer propio; crit del hit afecta el tick directo
- **Arco**: daña a todos los enemigos en radio de **3 m** del target original (filtro espacial
  trivial — `distancia_al_origen ≤ 3m`, no requiere sistema de coordenadas)
- ✅ **Multi-objetivo confirmado visualmente (usuario, 2026-07-02, capturas de pantalla)** —
  mismo tick (1057 / 378) apareciendo simultáneo en múltiples enemigos distintos en el mismo
  frame. Cierra la duda de si el arco efectivamente propaga daño a otros enemigos: sí.
  **El tick propagado NO hereda el crítico del golpe que lo generó** — con un golpe crítico
  (2112 en el disparo), los enemigos encadenados igual recibieron el tick base (1057, no
  escalado). ⚠️ Caveat metodológico: la prueba se hizo con un arma (Alternox Prime/Vadarya)
  que trae una **pasiva propia** ("creates a conductive area... chance to spawn up to 3
  lightning strikes on random nearby targets") distinta del Tesla Chain genérico documentado
  arriba (radio fijo 3m, sin "chance" de spawneo) — probable mezcla de mecánica genérica +
  pasiva ítem-específica, no aislado al 100%. El hallazgo de multi-objetivo es sólido; el
  detalle de "crit no se propaga" queda marcado como observado en ese contexto mixto, no
  confirmado para el proc genérico en aislamiento.
- **Stun**: ~3s, **solo el target original** — los encadenados por el arco reciben el tick
  de daño pero NO el stun (confirma que el arco es solo aplicación de daño, no un segundo
  proc completo). NO escala con Status Duration; inmunes: Ospreys, Bosses, Tenno
- ✅ **Double-dip de faction confirmado empíricamente (usuario, 2026-07-02)** — Alternox
  Prime (Electricity 187.5, Primed Bane of Grineer +55%) vs Arid Butcher: tick baseline 72 →
  con Bane 172 = ×2.3889. Single-dip predice ×1.55 (descartado, 54% de distancia); double-dip
  predice ×1.55²=2.4025 (0.57% de distancia — matchea). **La lista "afectados: slash/heat/
  toxin/gas" de la página general de Faction Bonus estaba incompleta, no exhaustiva** — mismo
  patrón que la tabla de duración "outdated" ya detectado antes. Electricity SÍ double-dipea,
  igual que los otros 4 DoTs primarios/combinados.
- (dudoso abierto: si el daño del arco a los encadenados = mismo tick que el target original)

### Gas Cloud (Gas)

```
tick_damage = 0.5 × modded_base_damage × (1 + gas_bonuses) × (1 + faction) × (1 + status_damage)
```

- Cloud de 6 s; **6 ticks, en s0..s5** — sin retardo inicial, a diferencia de Slash/Toxin, que
  tickean en s1..s6 (verificado contra `Damage/Gas_Damage`)
- El daño del cloud es **tipo Gas** y pega a todos los enemigos en el radio
- Radio: **3 m base, +0.3 m por stack → 6 m a 10 stacks** (cap 10)

---

## Procs de stack (Debuff acumulable)

### Corrosion (Corrosive)

Reduce el armor del enemigo **temporalmente**, no de forma permanente — la subpágina es explícita:
*"temporarily degrades… for 8 seconds"*.

```
armor_strip(n)   = min(0.26 + 0.06 × (n − 1), 1.00)
effective_armor  = base_armor × (1 − armor_strip(n))
```

| Stacks | Strip |
|---|---|
| 1 | 26% |
| 5 | 50% |
| 10 | 80% — el máximo **con el cap de stacks por defecto**, no el de la fórmula |
| 14 | 100% — la armadura entera |

**El 80 % es `f(10)`, no el techo.** Esta página los da pegados en una sola oración —*"Stacks up to 10
times, with subsequent procs reducing armor by 6% to a total of 80%"*— y quien los desacopla es la
página del tipo de daño ([`damage-corrosive-damage.wikitext`](damage-corrosive-damage.wikitext)): el
Emerald Archon Shard sube el máximo de procs (**+2**, **+3** Tauforged) y *"Applying **14** stacks can
**fully remove all armor**"*. `f(13) = 98%` y `f(14) = 104%`, así que los 14 salen de la fórmula y no de
una regla aparte. El techo real es **físico** —no se saca más armadura de la que hay— y un segundo caso
lo confirma por otro camino: la pasiva de Hydroid lleva el primer proc a 50 % y la fuente declara
*"100% armor reduction at 10 stacks"*, que es `f(10)` con ese desvío.

- ✅ **Cerrado por analogía estructural (2026-07-02), no requiere test propio.** El texto
  "replace the oldest stack" es idéntico al de Viral/Magnetic/Radiation — mismo modelo de
  timer independiente por stack, ya confirmado empíricamente en Viral (ver §Infection). No
  hay "rampa de reversión" que modelar: cuando un stack de 8s expira, desaparece del conteo
  y `armor_strip(n)` se recalcula con un stack menos — es discreto, no una curva temporal.
  Contraste explícito con **Heat**, que sí tiene una rampa real por tiempo ("regains armor
  every 1.5s during 6s") porque consolida sus stacks en un pool compartido, no independiente.

### Virus (Viral)

Multiplica el daño recibido en la capa de salud (health layer únicamente, no shields ni overguard).

```
multiplier = 2 + 0.25 × (stacks − 1)      [subpágina, equivalente a la forma de laws]
multiplier = 1 + initial_bonus + (stacks − 1) × stack_bonus
```

| Parámetro | Valor |
|---|---|
| `initial_bonus` | 1.00 (×2.0 total en 1 stack) |
| `stack_bonus` | 0.25 por stack adicional |
| Cap | 3.25 extra → ×4.25 total a 10 stacks |

- **Funciona aunque la salud esté protegida por armor** (cita de subpágina) — amplifica
  lo que llegue a la capa health, armor mediante.
- Los DoTs que pegan a health también se amplifican mientras el proc esté activo.
- **Y se evalúa tick por tick, no al nacer el proc.** `Damage/Viral_Damage` es explícita: el daño
  del tick se calcula *"based on whether or not a Viral proc is active **when the DoT tick deals
  damage**"*. Ejemplo textual: un arma de 100 que aplica Slash, con 1 stack de Viral, hace 200 en
  el hit y **70/s** de Bleed **hasta que Viral se cae, y ahí baja a 35/s**; al revés, un Bleed que
  nació sin Viral hace 35/s y **sube a 70/s** en cuanto llegue un proc de Viral.
  > **Por eso Viral no double-dipea en los DoT y la facción sí** — la subpágina lo contrasta
  > explícitamente. No son dos reglas arbitrarias: **la facción es propiedad del atacante y queda
  > horneada en el proc al crearse; Viral es estado del objetivo y se lee en cada tick.** La misma
  > partición que ya separa `f(declarado)` de `f(emergente)`.
- ✅ **Fórmula verificada empíricamente (usuario, 2026-07-02):** Dual Toxocyst vs Arid Butcher
  (Grineer nivel 210, con armor Ferrite) — 221 dmg (0 stacks) → 442 dmg (1 stack) = ×2.0000
  exacto; con crit ×2 confirmado: 885 dmg = ×4.0045 (2.0 viral × 2.0 crit, factores limpios
  e independientes). Serie multi-stack (mismo enemigo/arma, baseline 307): ratios observados
  1.9967 / 2.2476 / 2.4984 / 2.9967 — matchean `2+0.25×(n−1)` para n=1,2,3,5 con <0.2% de
  error (las etiquetas de stack del usuario venían corridas respecto al conteo real, pero la
  forma de la fórmula quedó confirmada en 4 puntos). **Cierra el dudoso de orden Viral↔armor
  DR** (ficha de modelado #13): el multiplicador dio limpio contra un enemigo con armor real,
  confirmando que es un factor multiplicativo independiente — el orden interno no importa.
- ✅ **Orden de resolución stack-propio-vs-daño-propio, confirmado (usuario, 2026-07-02).**
  Segunda tanda de datos (mismo build + Deep Freeze, viral 350/475): baseline derivado de la
  lectura estable en cap (10 stacks, ya saturado → pre/post-hit dan lo mismo ahí) = 1667/4.25
  = 392.24. Con ese baseline: la lectura que el usuario tomó como "10 stacks" (1569) matchea
  **n=9** casi exacto (392.24×4.00=1568.94, error 0.004%), NO n=10 (que predeciría 1667). Esa
  lectura es justo el hit que empujó el contador de 9→10 — y su propio daño usó el conteo
  *previo* a su propio proc, no el posterior. **Confirma: el daño de un hit se resuelve con
  los stacks que existían ANTES de que ese mismo hit aplique su propio proc nuevo** (orden:
  resolver daño con estado actual → recién después sumar el stack nuevo para hits futuros).
  Relevante para el orden de operaciones del engine cuando se modele la resolución de stacks
  en tiempo real. Corrobora además lo ya capturado en §Aplicación (roll por pellet): el
  usuario cita el caso real de escopetas + Corrosive metiendo hasta 10 stacks de un solo
  disparo (multishot con cada pellet como proc independiente).

### Disrupt (Magnetic)

Multiplica el daño recibido en la capa de shields (y Overguard). Misma fórmula de stacks
que Infection (`2 + 0.25 × (n − 1)` → ×3.25 a 10 stacks).

- Niega la recarga natural de shields durante el proc. **Los efectos que *restauran* shields
  (links de Shield Osprey y Orokin Drone) bypasean esa penalidad.**
- **Al romper shields u Overguard**: proc **forzado** de Electricity por el **3% de los
  shields/Overguard máximos por stack** (hasta **30%** a 10), repartido en **6 s**.
  Lo escala el arma o habilidad que aplicó el Magnetic, con reglas que **no se parecen a las de
  ningún otro proc**:

  | | |
  |---|---|
  | Base damage mods (Serration) | **ningún efecto** |
  | Status damage mods (Pistol Elementalist) | **×2** → factor 3.61 |
  | Faction damage mods (Expel Corpus) | **×2** |
  | Mods de Electricity (Convulsion) | normales, **aun combinados en otro elemento** |
  | Status duration | **multiplicador final del daño TOTAL** — ver §Status Duration |

  Archon Stretch aplica sobre este proc al romper Overguard, pero **sólo desde habilidades**.
- **Nullifier bubbles**: especialmente efectivo — daño mín. 300 / máx. 1200 por disparo (subpágina).
- **Sobre Tenno**: HUD distorsionado y **30 de Energy Drain por segundo durante 3 s** — primer tick
  instantáneo → **4 ticks, 120 de energía**. Un cleanse corta el drenaje.

### Weakened (Puncture)

Debuff del daño **saliente** del enemigo + crit del jugador sobre él (subpágina):

- Enemigo hace **−40%** de daño con el 1er stack, **−10%** por stack extra → **−80%** a 5 stacks.
- El jugador gana **+5% critical chance** por stack contra él → **+25%** a 5 — **no** aplica
  a daño AoE ni a habilidades de warframe.

### Cold — debuff numérico además del CC (subpágina)

- Slow: **50%** el 1er stack, **+5%** por stack → **90%** al 9º.
- Crit damage recibido: **+0.1×** el 1er stack, **+0.05×** por stack (≈ +0.5× al 9º).
  **Es aditivo con los mods de crit damage y entra ANTES de calcular el tier crítico** — no es un
  multiplicador final. Entra dentro del escalón, no encima
  (→ [`critical-hits.md`](critical-hits.md) §Resolución de tiers). Ejemplos textuales de la
  subpágina: Kunai + Primed Target Cracker a 9 stacks = `1.6 × (1 + 1.10) + 0.5 = 3.86×`;
  Paris Prime + Point Strike a 9 stacks = `1 + n × (2 + 0.5 − 1)` → **2.5×** en tier 1 y **4×**
  en tier 2.
- **10º stack**: congelación sólida 3 s (sin acciones, niega recarga de shields), crit
  recibido sube a **+1.0×**; al descongelar quedan **3 stacks residuales**. Congelado no
  recibe más stacks de Cold.
- Cap especial: **bosses y unidades con Overguard solo aceptan 4 stacks**.

### Tau (Status Vulnerability)

- **+10% status chance recibida por stack** (cap 10 = +100%), 8 s, timer propio.
- Lo infligen Sentients/Amalgams/Archons — y del lado jugador: Caliban, Venato Prime, etc.

### Corte de armor por Heat (Ignite — efecto secundario)

Ramp de 2s iniciado al primer proc de calor activo. No se acumula con múltiples stacks:

| Tiempo desde primer proc | Armor strip |
|---|---|
| 0.5s | 15% |
| 1.0s | 30% |
| 1.5s | 40% |
| 2.0s | 50% (máximo) |

Límite absoluto: 50% — independientemente del número de stacks de Heat activos.
Reversión al expirar: el enemigo **recupera armor cada 1.5 s durante 6 s** (subpágina).
Status Duration alarga los *intervalos* del ramp (+100% duración → strip cada 1 s en vez de 0.5 s).

---

## Procs de CC y utilidad (números de subpáginas, 2026-07-02)

| Proc | Tipo fuente | Efecto |
|---|---|---|
| **Knockback** | Impact | Flinch/recoil del enemigo (6 s, cap 5). Contra unidades pesadas: **+8% por proc al threshold de Parazon Mercy** (hasta 80%; 100% en Corpus/Eximus sin shields). Muerte por proc de Impact = ragdoll del cadáver. Inmunes: Ospreys, Bosses, Tenno. |
| **Detonate** | Blast | Rework: cada stack = carga que explota tras 1.5 s de fusa haciendo **30% del base damage**; al 10º stack **o al morir el target**, todas detonan juntas: **300% del base damage por stack (máx. 3000%) en 5 m** + stagger a los alcanzados. La fusa escala con Status Duration (y detona incluso con duración total <0%). |
| Confusion | Radiation | El confundido ataca a sus aliados con **+100% de daño** (1er stack), **+50% por stack → +550% a 10**; slam attacks contra ex-aliados pasan de Knockdown a **Ragdoll**; al expirar, vuelve a su facción. 12 s, timer propio por stack. Las **auras** del confundido (Eximus, Ancient Healer) dejan de afectar a sus aliados, y él tampoco se beneficia de las ajenas. **En unidades especiales es otra mecánica** — ver abajo. |
| Bullet Attraction | Void | Campo de **2.5 m** por **3 s** centrado en el punto de impacto que atrae los proyectiles al target. El daño Void además **resetea la damage adaptation de los Sentients**. |
| Tesla Chain / stun | Electricity | Ver §Electricity DoT — el stun (~3 s, fijo, solo target original) es la faceta CC. |
| Freeze | Cold | Ver §Cold en stack-debuffs — el slow/freeze es CC, el crit-recibido es numérico. |

> Nota de modelado: varios de estos "CC" cargan facetas numéricas (Mercy threshold,
> **Confusion en unidades especiales no es el mismo status.** En **Kuva Liches, Acolytes,
> Necramechs enemigos, Sisters of Parvos y Hounds** la Confusion **no los vuelve atacables por sus
> aliados** —salvo que esos aliados estén confundidos también—; en cambio les sube el daño que
> **reciben** de unidades aliadas: **+100%**, con cap de **4 stacks** → **+250%**. Es otro efecto
> bajo la misma etiqueta: de "cambia de bando" pasa a "vulnerabilidad direccional".
>
> Los enemigos con **Overguard** reciben el status pero son **inmunes a su efecto** hasta que se
> rompa el buffer.

> Confusion +550%, Blast 3000%) — la clasificación fina faceta-por-faceta es trabajo
> de las fichas, no de esta captura.

---

## Status Damage — el stat, no el efecto

**Status Damage** es *cualquier daño que llega por un tick de status*: **Slash, Heat, Toxin,
Electricity, Gas — y Blast**.

> **Los bonus de Status Damage son multiplicativos con los demás bonus de daño, y aditivos entre
> sí.**
>
> - **Multiplicativo** con multiplicadores de facción: Bane of Grineer, Roar.
> - **Aditivo** con otros de Status Damage: Emerald Archon Shard suma con los mods Elementalist.

Fuentes: los cinco **Elementalist** (Galvanized, Melee, Pistol, Rifle, Shotgun) · Burning Hate ·
Empowered Blades · Immunity Resistance · Boreal's Contempt · Conductive Sphere · Emerald Archon Shard
· Ash.

Tres son **de un solo tipo**: Emerald Archon Shard sólo **Toxin**, Ash sólo **Slash**, Conductive
Sphere sólo **Electricity**.

Los DoT **también reciben** los modificadores de headshot y de crítico
(→ [`enemy-body-parts.md`](enemy-body-parts.md), [`critical-hits.md`](critical-hits.md)).

> **Excepción — los DoT que golpean por su cuenta.** La **Tesla Chain** (Electricity) y la **Gas
> Cloud** pueden impactar cabezas y otras partes **por sí solas**, pero con un multiplicador de
> headshot de **1x** — es decir, ninguno. Sólo sube con Target Acquired, los bonus de zoom de
> algunos sniper rifles, o Primary/Secondary Deadhead. Es la diferencia entre *heredar* el headshot
> del hit que creó el proc y *generar* impactos propios: los DoT de objetivo único heredan; los dos
> que tienen geometría propia, no. Ambas subpáginas lo declaran con la misma frase.

---

## Duración negativa — qué se anula y qué no

Con Rivens se puede bajar la Status Duration **por debajo de −100%**. Entonces *"todos los efectos de
proc que tienen duración o hacen daño en el tiempo quedan anulados; los procs instantáneos, o los que
hacen daño instantáneo, ocurren igual"*.

| Tipo | Se anula | Ocurre igual |
|---|---|---|
| Impact · Puncture · Slash · Cold · Toxin · Corrosive · Radiation | el proc entero | — |
| **Electricity** | el stun | **Tesla Chain** |
| **Heat** | Ignite | la **animación de pánico** (sin llama) |
| **Blast** | — | el daño de expiración; **la explosión sólo si el hit que lo aplicó mata** |
| **Gas** | la nube de Toxin | — |
| **Magnetic** · **Viral** | el daño extra a escudos / salud | sólo los **efectos visuales** |

> ⚠️ La wiki declara que esta tabla sale de **un post de foro** (EDFScout) y *"may need further
> confirmation"*, y que ella misma ajustó las observaciones inconsistentes *"a lo más probable"*. Es
> el bloque menos asentado de la página.

---

## Tres defensas distintas contra el status

La wiki las separa en tres secciones, y **hacen cosas distintas**:

| Mecánica | Qué hace |
|---|---|
| **Status Immunity** | **impide que se apliquen nuevos** status — pero **no remueve los que ya están activos** |
| **Status Cleansing** | **remueve** los status activos |
| **Status Resistance** | da un **porcentaje de chance de ignorar** un proc entrante |

**Invulnerability y Overguard también protegen contra status** — cualquier cantidad de Overguard
otorga inmunidad (→ [`overguard.md`](overguard.md)).

Fuentes de **cleansing**: Bloodletting (Garuda), Pillage (Hildryn), Fire Walker (Nezha), Hallowed
Ground (Oberon), Disometric Guard (Qorvex), Reave (Revenant), Molt (Saryn), Spellbind (Titania),
Cloud Walker y Defy (Wukong).

**Del lado enemigo**, la wiki separa **inmunidad total** de **inmunidad parcial** — la sección lleva
`{{UpdateMe}}` y el catálogo está en el raw. La inmunidad parcial es la que dispara la
re-normalización del reparto de procs descrita arriba.

### Status Vulnerability

El espejo: **aumenta el status chance recibido** de todas las demás fuentes, y **stackea con ellas**.
Es lo que aplica el proc de Tau (+10% por stack, hasta +100% a 10 stacks).

---

## Fuentes

- https://wiki.warframe.com/w/Status_Effect (página general; su tabla de duración está
  marcada "outdated" por la propia wiki — los valores de este doc vienen de las subpáginas).
  **Captura cruda completa (1006 líneas, `?action=raw`) en `raw/status-effect.wikitext`
  (2026-07-11)** — usada para citas literales de §Aplicación; incluye nota de parche
  `{{ver|27.2}}` con el diseño original del mecanismo >100% y de "Forced Procs".
- **Subpáginas por tipo** `https://wiki.warframe.com/w/Damage/<Tipo>_Damage` — barrido
  completo de los 16 tipos (2026-07-02): duración/caps/timers/fórmulas/facetas
- https://wiki.warframe.com/w/Damage#Status_Effects
- `references/wiki/mechanics/damage-types.md` — probabilidad de proc por tipo de daño
- `references/wiki/mechanics/enemy-resistances.md` — modelo U36 de vulnerabilidades por facción
- `references/wiki/mechanics/faction-damage.md` — double-dip del faction bonus en los DoTs
