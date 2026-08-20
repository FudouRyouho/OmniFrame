---
Estado: "activo"
Rol: "Contrato de public/data/enemies.json — forma, procedencia por campo y gaps del data-set del enemigo"
Impacto_ID: "data-enemy"
Fidelidad_Fisica: "Project/public/data/enemies.json"
Fecha_de_creacion: "2026-07-22"
Fecha_de_actualizacion: "2026-08-20"
---

# Enemy — Schema de `enemies.json`

Generado por `buildEnemiesArtifacts` (`Project/scripts/pipeline/runtime-data-artifacts.ts`) sobre
`omniframe-items`, emitido por `generate-data.ts`. 638 entradas.

Es el único dato del engine cuya fuente es **doble**: el `Enemy.json` de `warframe-items` da los stats
base; el `Module:Enemies/data/<facción>` del wiki (cosechado por `EnemyScraper`, mergeado en
`omniframe-items/enrich.mjs`) da lo que aquél no trae. El schema es deliberadamente **plano y chico**:
entra lo que existe en el juego, no una estructura anticipada.

> 🚨 **La mitad "export" de esa fuente está muerta.** DE **no expone enemigos**: no existe
> `ExportEnemies` en el Public Export (ver [`../../../domains/source/public-export.md`](../../../domains/source/public-export.md)),
> y el `Enemy.json` de upstream es un **fósil sin tocar desde 2019-12-04** — su contenido corta en Orb
> Vallis, sin un solo enemigo de Deimos/Narmer/Zariman/Duviri/1999. Todo lo que este schema atribuye
> "al export" son datos de 2019. **La única fuente viva de enemigos es el wiki.**

---

## 1. Contrato

```ts
interface EnemyEntry {
  unique_name: string;        // clave del registro (EnemyRepository)
  name: string | null;
  faction: string;            // canónica, ver §2
  base_level: number;         // nivel base; el escalado usa Δ = level − base_level
  health: number;
  armor: number;              // 0 = sin armadura
  shields: number;            // 0 = sin escudo
  eximus_health?: number;     // base de reemplazo Eximus, no total (283 entradas) — sin consumidor
  weakpoints?: Weakpoint[];   // 407 entradas — sin consumidor
}
interface Weakpoint {
  part: string;               // "Head", "Back Crown", "Stealth/Finisher", …
  multiplier: number;         // 3 para "Head: 3.0x"
}
```

Consumidor: `EnemyRepository.load` (`RawEnemyEntry` = este contrato + lo que el override agregue).
`load()` sólo registra: no sintetiza ningún campo.

### El override — curación manual, y el único origen de `unit_class`

```ts
type EnemyOverride = Record<string, {
  base_level?: number;
  unit_class?: UnitClass;   // hoy: 'acolyte' (6 filas)
}>;
```

**`unit_class` no lo trae la cosecha y no va a traerlo:** el wiki declara la regla del Acolyte en su
página de mecánica (*"can only receive up to 4 stacks of any Status Effect"*), no en la fila del
enemigo. Se escribe a mano, y el engine la consume como llave de los desvíos de ley del receptor
(`arch-decisions §17`).

⚠️ **Derivarla del `unique_name` se descartó.** El path `/Lotus/Types/Enemies/Acolytes/` parte los 6
exacto, pero es la clase de inferencia que `OQ-ENGINE-31` ya midió fallar en los precepts (12
desacuerdos sobre 26). El path queda como **tripwire**: un test verifica que los 6 del override son
exactamente los 6 del path, así un acólito nuevo se nota en vez de desincronizar el dato en silencio.

🔴 **La curación corre ANTES del reparto, y no es un detalle de orden.** `enemies.json` se consume dos
veces —`EnemyRepository` para resolver nombres, `ItemRepository` para hidratar al participante que se
simula—. Mientras el override se aplicaba dentro de `load()`, sólo la primera rama lo veía y la entidad
simulada nacía con el dato crudo. `curateEnemies` corre una vez y las dos ramas leen lo mismo.

**Procedencia por campo:**

| campo | fuente | cobertura |
|---|---|---|
| `unique_name` `name` `health` `armor` `shields` | export del juego | 638 |
| `faction` | cascada export → wiki (§2) | 638 |
| `base_level` | wiki (`BaseLevel`), default 1 | 61 con valor > 1 |
| `eximus_health` | wiki (`EximusHealth`) | 283 |
| `weakpoints` | wiki (`Multis`), §4 | 407 |

**No se emiten:** `resistances` y los `health_type`/`armor_type`/`shield_type` que derivaba — modelo
per-clase **pre-U36**, era muerta: desde U36 el daño-vs-target es por facción (`FACTION_BONUS`).
`EnemyDNA` tampoco los declara ya: eran contrato obligatorio sin un solo lector, y `RawEnemyEntry`
existía sólo para restarlos. Tampoco `wikiInternalName` (es trazabilidad de la cosecha, no dato de
dominio), ni `drops`/`patchlogs`/`regionBits`/`imageName`.

---

## 2. `faction` — cascada, no campo crudo

El `type` del export **mezcla ejes**: para 33 enemigos trae la categoría de arma o el rol de IA
(`Lancer` → `"Rifle"`, `Prod Crewman` → `"Melee"`, fauna → `"Predator"`/`"Prey"`). Como `faction`
keyea el escalado (`HEALTH_COEF`/`SHIELDS_COEF`) y `FACTION_BONUS`, tomarlo crudo manda a esos
enemigos a la curva default en vez de la suya. Por eso el generador **no lo usa crudo**: `OQ-DATA-15`.

Orden de verdad, **validando cada nivel por separado** — un candidato inválido no consume el turno,
porque el wiki también trae basura (`?`, `Unknown`, `Objects`) y taparía un `type` bueno del export:

1. **`faction` del export** — el propio export lo trae, justo cuando `type` está contaminado.
2. **`wikiFaction`** — `General.Faction` de la cosecha. Única fuente con **subfacciones**.
3. **`type`** si es una facción válida — el caso normal.
4. **`Unaffiliated`** — default documentado del wiki para facción no reconocida.

Distribución resultante: Grineer 229 · Corpus 181 · Infested 53 · Corpus Amalgam 46 ·
Unaffiliated 44 · Orokin 40 · Kuva Grineer 25 · Sentient 12 · Stalker 8. Ningún valor que no sea
facción.

**Las subfacciones son facciones propias, no etiquetas.** Kuva Grineer comparte vulnerabilidades con
Grineer pero **resiste Heat**; `FACTION_BONUS` ya las keyea (`Kuva Grineer`, `Corpus Amalgam`,
`Infested Deimos`, `The Murmur`) y hasta ahora estaban latentes por falta de dato. Agruparlas para el
**escalado** es trabajo de la ley, no del dato: `enemy-scaling.ts` tiene `SCALING_GROUP`
(subfacción → curva de su base, porque el wiki no publica tablas separadas).

Los 44 `Unaffiliated` son fauna (Kuaka, Condroc, Sawgaw, Bolarola…) y sueltos (Clem, Wolf of Saturn
Six, drones de Arbitration): entidades sin match en el wiki que el proyecto **no modela**. No se
persigue el 100% de cobertura — alcanza una base de prueba sólida.

`Anarch` (3 entradas del wiki, todas Specters) **no** se aliasa a `Anarchs` (26) pese al parecido:
sin verificar que sean la misma facción, el candidato se descarta y la cascada sigue.

---

## 3. Nombres duplicados: 155, y son correctos

479 nombres únicos en 638 entradas. Los duplicados son el par `…Avatar` / `…AvatarLeader` (mismo
enemigo, variante de escuadrón); 133 tienen stats idénticos y 22 difieren de verdad (Jackal ×3 =
fases; Vapos/Terra = tiers).

La clave del registro es `unique_name`, así que **no colisionan**. El merge con el wiki sí es por
**nombre** (ver §4), de modo que ambos hermanos reciben la misma `faction`/`base_level`/`weakpoints`:
es lo correcto, son la misma unidad. No se desambigua ni se deriva un flag `leader` del sufijo — no
hay consumidor y sería inferencia sobre el naming del export.

⚠️ `EnemyRepository.find(name)` por nombre display devuelve el primero que matchea — sin consecuencia
mientras los consumidores keyeen por `unique_name`, que es lo que hacen hoy.

---

## 4. `weakpoints` — parseo estricto de `Multis`

**El merge wiki↔export es por NOMBRE, no por `uniqueName`.** El wiki indexa por el path del *Agent*
(`/Lotus/…/Desert/BladeSawman`), el export por el del *Avatar*
(`/Lotus/…/Desert/Avatars/BladeSawmanAvatarLeader`), con sufijo variable — derivarlo sería frágil.
Medido: por `uniqueName` matchea el 2.4%, por nombre el 86.5%.

El precio del nombre como clave: **16 nombres colisionan dentro del propio wiki** (`Condor Dropship`
del Corpus vs el de Venus; `Bailiff` de AIWeek vs el de Fortress; `Heavy Gunner` ×2). El scraper
conserva **el primero** y reporta el resto por consola — nunca en silencio, porque la entrada que
gana decide los stats de un enemigo real.

`Multis` llega como strings crudos (`"Head: 3.0x"`) y se parsea al patrón canónico
`Parte: Nx`, tolerando `3.0` sin `x` y `Body:3x` sin espacio. Partes más frecuentes: `Head` (393),
`Stealth/Finisher` (9), `Back Crown` (8), `Gun` (6).

Lo que **no** matchea se descarta y el generador lo imprime (censo visible, no silencio):

| caso | tratamiento |
|---|---|
| `""` / `"None"` | ausencia de weakpoint, no descarte |
| `"Thruster: ?"` | valor desconocido en el wiki → descarte (2 entradas: Ogma, Tusk Ogma) |
| `"Head: +2 Crit Tier, 3x Critical Damage"` | **gap deliberado**: ese `3x` es crit damage, no un multiplicador de daño. Parsearlo como tal daría un número falso. No se modela |
| `"Hands: 3x (Incarnon Compatible)"` | ídem: el multiplicador está condicionado a otra mecánica |

Los dos últimos casos existen en la cosecha pero hoy no llegan a `enemies.json` (sus enemigos no
tienen match en el export). Quedan anotados acá para que no se lean como omisión.

---

## 5. Rarezas de la fuente

Cosas observadas al construir el merge que no son bugs del pipeline sino **formas raras del dato**.
Se anotan para que un agente futuro no las lea como omisión ni las "arregle" por inferencia.

**El modelo `1 registro = 1 enemigo` no nombra las fases de boss.** `Jackal` son tres `unique_name`
con stats crecientes (1200/2000 → 3000/3000 → 5000/3000): no son variantes de escuadrón como el par
`Avatar`/`AvatarLeader`, son **fases del mismo combate**. Hoy entran como tres enemigos sueltos con el
mismo nombre. No molesta mientras el CLI no apunte a un boss; si lo hace, es modelado nuevo, no un fix
de datos.

**El conflicto de fuente cruza un umbral de la ley, no sólo un número.** En 11 enemigos una fuente dice
`armor: 0` y la otra no (`Angst` wiki 50 / export 0; `Oxium Osprey` 40 / 0). `scaleArmor` aplica el
floor de 200 **sólo si `armor > 0`** — o sea que elegir fuente ahí no mueve un valor, cambia de rama.

**El wiki tiene entradas sin `InternalName` (180 de 1000)** — sin trazabilidad al path del juego. Dos
de ellas (`Hollow Thrax Centurion`, `Void Angel`) colisionan entre sí, y ni siquiera se puede reportar
cuál ganó. `Heavy Gunner` es peor: dos entradas del wiki con el **mismo** `InternalName`, duplicado
exacto en la fuente.

**`eximus_health` es el base de reemplazo de la variante Eximus — ni total ni componente sumado.**
El juego lo sustituye al `health` normal **antes** de correr el escalado (por eso puede ser *menor* que
el `health` normal: `Scrofa Drover Bursa` 1200 → 900 Eximus, imposible bajo las otras dos lecturas). Ley
completa en
[`../../../../references/wiki/mechanics/enemy-level-scaling.md`](../../../../references/wiki/mechanics/enemy-level-scaling.md)
§Escalado de Eximus. Se guarda tal cual llega; el día que tenga consumidor, aplicar como reemplazo — no
como suma.

**81 entradas de `Multis` son `""` o `"None"`** — el wiki distingue "sin punto débil" de "no lo
sabemos". Se tratan como ausencia, que es lo que dicen.

---

## 6. Gaps del data-set

- **Sin consumidor todavía:** `eximus_health` y `weakpoints` se emiten por fidelidad (dato real del
  juego), no porque el engine los use — no modela ni la variante Eximus ni los headshots.
- **No se cosecha:** `Attacks` / `DamageDistribution` del wiki. Su consumidor (modelo de DR/EHP para
  builds tanque) no existe; se suma cuando el engine lo pida.
- **⚠️ Facciones modernas ausentes: ley sin dato — y ya sabemos por qué.** El wiki tiene 1000 enemigos
  y el fósil 638; el faltante no es aleatorio: **ningún** enemigo de Narmer (41), Anarchs (26),
  The Murmur (26), Techrot (13) ni Scaldra (9) llega al output, porque **todas esas facciones son
  posteriores a diciembre de 2019**. `enemy-scaling.ts` tiene coeficientes para ellas y `FACTION_BONUS`
  tiene bonus, contra enemigos que el proyecto no puede instanciar. Cerrar el hueco = cosechar también
  `Health`/`Armor`/`Shield` del wiki y emitir las entradas wiki-only — que es el mismo movimiento que
  invertir la política de fuente (fila 1 del inventario), no una decisión aparte.
- **`ExportRegions` trae contexto de combate vivo y sin usar:** los 269 nodos de `Node.json` tienen
  `minEnemyLevel`/`maxEnemyLevel` y `factionIndex`. Es dato fresco de DE sobre enemigos —el único que
  sobrevive— y permitiría anclar el nivel de simulación a misiones reales en vez de a un número
  arbitrario. Ver [`../../../domains/source/public-export.md`](../../../domains/source/public-export.md).
- **Overguard:** no está en el schema. Es una capa de entidad general, no un stat de enemigo —
  backlog (`OQ-ENGINE-FUTURE`).
- **La ley de escalado es otro frente:** este schema fija el **input** (`OQ-DATA-15`); la fidelidad de
  los coeficientes es `OQ-ENGINE-21`.
- **`shield` de la cosecha nunca se emite.** El export siempre trae `shield` (aunque sea 0), así que el
  merge fill-if-missing no lo usa jamás; se cosecha —junto a `health`/`armor`— sólo para **censar** el
  conflicto de fuente. Lo mismo `wikiFaction` (insumo de la cascada) y `wikiType` (ver abajo).

**Dos candidatas a OQ, nombradas y no abiertas** (no bloquean la base del CLI):
1. **Política de fuente wiki↔export** para los stats base — hoy gana el export por omisión, no por
   decisión. Toca `enrich.mjs` (dirección del fill) y potencialmente la rama `armor > 0` de la ley.
2. **Bosses multi-fase** (`Jackal`) — modelado, no datos.

---

## 7. Inventario de verificación

El objetivo **no es** un data-set perfecto ni cobertura total: es una **base calibrada y reproducible**
para el CLI, sobre el puñado de enemigos que se usa en tests y builds del engine. El resto es bonus.

**El set es el que ya ejercita el engine** (5 enemigos, los que aparecen en `enemy-scaling.test.ts` y
como default del oráculo) — no una lista nueva:

| enemigo | facción | wiki ↔ export |
|---|---|---|
| Arid Butcher (default del oráculo) | Grineer | health y armor coinciden |
| Charger | Infested | health coincide |
| Tusk Carabus | Grineer | health y shields coinciden |
| Security Camera | Corpus | health y shields coinciden |
| **Elite Crewman** | Corpus | **health wiki 110 / export 60 · shields wiki 150 / export 200** |

**Esto recorta el inventario a casi nada: 4 de 5 coinciden entre fuentes.** El conflicto de fuente
—que sobre el catálogo entero es 22%/16%/38%— toca **un** enemigo del set. La base para el CLI no está
bloqueada por él; lo que falta es un dato de codex sobre Elite Crewman.

Ordenado por lo que bloquea esa base:

| # | Qué verificar | Toca el set | Estado |
|---|---|---|---|
| 1 | ~~Ninguna fuente es confiable~~ → **el export está muerto y el wiki es la fuente viva.** Las divergencias (health 22%, armor 16%, shields 38%) no son un conflicto entre pares: son **seis años de reworks** que el fósil de 2019 nunca vio. El `fill-if-missing` que hace ganar al export está **al revés** | sí — todo el set | **resuelto en el diagnóstico; falta invertir la política de fuente** |
| 2 | **16 colisiones de nombre en el wiki.** Gana la primera; en `Bailiff` y `Heavy Gunner` las dos entradas son enemigos distintos con el mismo nombre display | no | diferido |
| 3 | **`Ember Specter → Anarchs`**: un Specter clasificado en una facción de Höllvania. Sospecha de match espurio por nombre (el del export puede ser el Specter del jugador) | no | diferido |
| 4 | **`base_level` sin contrastar.** 61 entradas con valor > 1 (Bombard 4, Eidolon ~15). Cambia `Δnivel`, y con él todo el escalado | no — los 5 son `base_level = 1` y ambas fuentes coinciden | diferido |

Ninguna de las cuatro bloquea la base: la #1 se reduce a un enemigo y el resto cae fuera del set. Al
agregar un enemigo al set, el paso previo es pasarlo por esta tabla.

**Bonus, sin urgencia:** `wikiType` (taxonomía de rol del wiki: `Ranged` 297, `Melee` 119, `Boss` 56,
`Field Boss` 32, `Specter` 19, `Objects`…) — cosechado y **no emitido**; es el mejor candidato para el
filtro de entidades, porque distingue bosses (que interesa conservar) de objetos y specters. ·
`Attacks[]` con `DamageDistribution` · `Affinity` (irrelevante) · `ExcludedFromSimulacrum` (descartado
por ahora: probablemente excluye bosses, que sí se quieren para test).
