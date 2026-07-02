# Status Effects (Procs)

> Estado: activo
> Rol: mecánicas de efectos de estado — aplicación, fórmulas de DoT, stacks de debuff, duración, CC
> Fuente de verdad de: comportamiento de procs — aplicación por pellet, DoT, stacks de debuff, duración/ciclo de vida, CC
> No usar para: elección del tipo de proc por peso de daño — ver `damage-types.md` §Regla de elección de proc
> Última actualización: 2026-07-02

## Distinción fundamental

Un **efecto de estado** (proc) es independiente del tipo de daño que lo activa.

- `heat` → tipo de daño (componente de la distribución de daño del arma)
- `Ignite` → efecto de estado aplicado al enemigo al triggerear un proc de calor

---

## Tabla de tipos → procs

| Tipo de daño | Proc | Categoría |
|---|---|---|
| `impact` | Stagger | CC |
| `puncture` | Weakened | Debuff |
| `slash` | Bleed | DoT |
| `heat` | Ignite | DoT + Debuff |
| `cold` | Freeze | CC |
| `electricity` | Tesla Chain | CC |
| `toxin` | Poison | DoT |
| `blast` | Detonation | CC |
| `corrosive` | Corrosion | Stack Debuff |
| `gas` | Gas Cloud | DoT (AoE) |
| `magnetic` | Disruption | Stack Debuff |
| `radiation` | Confusion | CC |
| `viral` | Infection | Stack Debuff |
| `void` | Bullet Attraction | CC |
| `tau` | Tau | Debuff |
| `true` | — | — |

---

## Aplicación: status chance

- **El roll es por pellet, no por disparo**: el status chance del Arsenal es la probabilidad
  de que **cada pellet individual** aplique un proc (ej. wiki: Strun Wraith 12% × 10 pellets
  = 10 rolls independientes de 12%).
- **>100%**: cada hit puede aplicar efectos de estado adicionales "únicos". Fórmula de la wiki:

```text
Procs promedio por disparo = Multishot × (Forced Procs + Status Chance por proyectil)
```

  (150% SC ≈ 1.5 procs promedio por proyectil; la página **no** explicita el mecanismo
  "1 garantizado + excedente como chance del segundo".)
- **Qué tipo sale**: ponderado por la participación de cada tipo en el daño del hit
  (`Proc Type Chance = Damage ÷ Total Damage`) — detalle en `damage-types.md` §Regla de elección.
- ⚠️ **Era**: el peso ×4 de los físicos (Impact/Puncture/Slash) de Damage 2.0 **ya no existe**
  en la página actual — fuentes viejas que lo citen están desactualizadas.

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
- **Conteo de ticks — inconsistencia entre subpáginas, capturada literal (no unificar):**
  Slash y Toxin: delay 1 s → ticks en s1..s6 = **6 ticks**. Gas: la tabla de su subpágina
  muestra ticks en s0..s6 = **7 ticks** (el cloud tickea al instante). Heat: tick/s por 6 s
  tras 1 s de delay. (La versión previa de este doc decía "7 ticks en 6s" para todos — corregido.)
- **Status Duration (mods):** documentado por subpágina solo en: **Blast** (la fusa escala;
  excepción: la detonación ocurre igual aunque la duración total sea <0%), **Heat** (alarga
  los *intervalos* del ramp de armor strip — +100% duración = strip cada 1 s en vez de 0.5 s),
  y **Electricity** (el stun de ~3 s **NO** escala — cita textual; el DoT no está especificado).
  El resto de tipos: **no especificado en su subpágina** — dudoso abierto.
  ⚠️ La subpágina de Magnetic trae una frase anómala ("status duration mods... are a final
  multiplier to the total damage") que suena a error de la wiki o de transcripción — gate visual.

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

---

## Procs de tipo DoT

> Patrón común de fórmula (subpáginas 2026-07-02): `tick = coef × modded_base_damage ×
> (1 + bonos_del_propio_elemento) × (1 + faction) × (1 + status_damage_bonuses) × extras`,
> donde `modded_base_damage` ya incluye `(1 + base_damage) × (1 + faction)` → el faction
> **double-dipea** en todos los DoTs. Excepción estructural: **Slash no lleva el factor de
> su propio elemento** (los mods de Slash% no amplifican el tick).

### Bleed (Slash)

```
tick_damage = 0.35 × modded_base_damage × (1 + faction) × (1 + status_damage)
```

- 6 ticks en 6s (delay 1s → ticks en s1..s6; corregido, antes decía 7)
- Tipo de daño del tick: **True/Cinematic** — el armor no lo afecta
- `modded_base_damage` = daño base total × (1 + bonos de daño base) × (1 + faction)
- Los mods de daño Slash **no** aumentan el tick (tampoco Buzz Kill/Contagious Spread/finisher
  mods); sí lo hacen base damage, faction (double-dip explícito) y status damage

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

### Electricity DoT (Tesla Chain) — faltaba como DoT en este doc

```
tick_damage = 0.5 × modded_base_damage × (1 + electricity_bonuses) × (1 + faction) × (1 + status_damage)
```

- 6 ticks en 6s; stacks sin cap mecánico, timer propio; crit del hit afecta el tick
- **Arco**: daña a todos los enemigos en radio de **3 m** del target
- **Stun**: ~3s, **solo el target original**, NO escala con Status Duration;
  inmunes: Ospreys, Bosses, Tenno
- (dudoso de subpágina: si los encadenados reciben stun/proc, y si el daño del arco = tick)

### Gas Cloud (Gas)

```
tick_damage = 0.5 × modded_base_damage × (1 + gas_bonuses) × (1 + faction) × (1 + status_damage)
```

- Cloud de 6s; ticks en s0..s6 según su subpágina (= 7 ticks — difiere de Slash/Toxin,
  capturado literal, no unificar)
- El daño del cloud es **tipo Gas** y pega a todos los enemigos en el radio
- Radio: **3 m base, +0.3 m por stack → 6 m a 10 stacks** (cap 10)

---

## Procs de stack (Debuff acumulable)

### Corrosion (Corrosive)

Reduce el armor del enemigo **temporalmente** por stack (corregido: la versión previa decía
"permanente"; la subpágina es explícita — "temporarily degrades... for 8 seconds").

```
armor_strip(n)   = min(0.26 + 0.06 × (n − 1), 0.80)
effective_armor  = base_armor × (1 − armor_strip(n))
```

| Stacks | Strip |
|---|---|
| 1 | 26% |
| 5 | 50% |
| 10 | 80% (máximo) |

- Dudoso de subpágina: si el armor se recupera de golpe o gradualmente al expirar.

### Infection (Viral)

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

### Disruption (Magnetic)

Multiplica el daño recibido en la capa de shields (y Overguard). Misma fórmula de stacks
que Infection (`2 + 0.25 × (n − 1)` → ×3.25 a 10 stacks).

- Niega la recarga natural de shields durante el proc.
- **Al romper Overguard**: inflige daño Electricity igual al **3% del Overguard máximo
  por stack** (subpágina).
- **Nullifier bubbles**: especialmente efectivo — daño mín. 300 / máx. 1200 por disparo (subpágina).

### Weakened (Puncture)

Debuff del daño **saliente** del enemigo + crit del jugador sobre él (subpágina):

- Enemigo hace **−40%** de daño con el 1er stack, **−10%** por stack extra → **−80%** a 5 stacks.
- El jugador gana **+5% critical chance** por stack contra él → **+25%** a 5 — **no** aplica
  a daño AoE ni a habilidades de warframe.

### Cold — debuff numérico además del CC (subpágina)

- Slow: **50%** el 1er stack, **+5%** por stack → **90%** al 9º.
- Crit damage recibido: **+0.1×** el 1er stack, **+0.05×** por stack (≈ +0.5× al 9º).
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
| Stagger | Impact | Flinch/recoil del enemigo (6 s, cap 5). Contra unidades pesadas: **+8% por proc al threshold de Parazon Mercy** (hasta 80%; 100% en Corpus/Eximus sin shields). Muerte por proc de Impact = ragdoll del cadáver. Inmunes: Ospreys, Bosses, Tenno. |
| Detonation | Blast | Rework: cada stack = carga que explota tras 1.5 s de fusa haciendo **30% del base damage**; al 10º stack **o al morir el target**, todas detonan juntas: **300% del base damage por stack (máx. 3000%) en 5 m** + stagger a los alcanzados. La fusa escala con Status Duration (y detona incluso con duración total <0%). |
| Confusion | Radiation | El confundido ataca a sus aliados con **+100% de daño** (1er stack), **+50% por stack → +550% a 10**; slam attacks contra ex-aliados pasan de Knockdown a **Ragdoll**; al expirar, vuelve a su facción. 12 s, timer propio por stack. |
| Bullet Attraction | Void | Campo de **2.5 m** por **3 s** centrado en el punto de impacto que atrae los proyectiles al target. El daño Void además **resetea la damage adaptation de los Sentients**. |
| Tesla Chain / stun | Electricity | Ver §Electricity DoT — el stun (~3 s, fijo, solo target original) es la faceta CC. |
| Freeze | Cold | Ver §Cold en stack-debuffs — el slow/freeze es CC, el crit-recibido es numérico. |

> Nota de modelado: varios de estos "CC" cargan facetas numéricas (Mercy threshold,
> Confusion +550%, Blast 3000%) — la clasificación fina faceta-por-faceta es trabajo
> de las fichas, no de esta captura.

---

## Fuentes

- https://wiki.warframe.com/w/Status_Effect (página general; su tabla de duración está
  marcada "outdated" por la propia wiki — los valores de este doc vienen de las subpáginas)
- **Subpáginas por tipo** `https://wiki.warframe.com/w/Damage/<Tipo>_Damage` — barrido
  completo de los 16 tipos (2026-07-02): duración/caps/timers/fórmulas/facetas
- https://wiki.warframe.com/w/Damage#Status_Effects
- `references/wiki/mechanics/damage-types.md` — probabilidad de proc por tipo de daño
- `references/wiki/mechanics/enemy-resistances.md` — modelo U36 de vulnerabilidades por facción
- `references/wiki/mechanics/faction-damage.md` — double-dip del faction bonus en los DoTs
