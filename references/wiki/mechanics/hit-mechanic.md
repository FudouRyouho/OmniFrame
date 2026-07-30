# Hit Mechanic

> Estado: activo
> Rol: la jerarquía `DmgSrc → HitPtr → HitStruct` con la que el juego agrupa los impactos, y qué se resuelve en cada nivel
> Fuente de verdad de: qué decide cada estructura, las tres categorías de HitPtr con sus subtipos, el tope de **2 HitStructs por tick**, que el DoT **no rollea status ni efectos on-hit**, las fórmulas de conteo, y la distinción juicio **group** vs **individual**
> No usar para: fórmulas de daño (→ [`damage-types.md`](damage-types.md), `damage-calculation`) · el comportamiento de multishot en sí (→ [`multishot.md`](multishot.md))
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Hit_Mechanic
> Raw: hit-mechanic.wikitext

> ⚠️ La wiki marca la página con **`{{Community}}`** y lleva **ocho `{{UpdateMe}}`** internos con
> preguntas sin resolver. Sus autores además advierten: describe *"un algoritmo de uso común en
> shooters"* tal como se observa desde el lado del jugador, y **se desconoce si el juego usa el mismo
> algoritmo para los impactos de enemigos contra el jugador**.

## Las tres estructuras

```text
HitStruct   — resoluciones de evento por game tick (máximo 2)
└── HitPtr  — contiene uno o más DmgSrc
    └── DmgSrc — la unidad mínima de registro de impacto
```

### DmgSrc

Es **un número de daño en pantalla** (con el HUD en modo *Legacy*). Lleva:

- distribución de tipos de daño
- si hubo crítico y de qué **tier**
- si hay proc de status, y **cuál** —según la distribución de tipos—
- si hay **proc forzado**
- las tiradas de los demás efectos *on-hit*

> La wiki aclara que es una simplificación: hay lógica adicional. Ejemplo suyo — **un proc de Toxin
> nunca puede ser crítico**, así que el `DmgSrc` de su DoT probablemente lleva "no critea".

### HitPtr

Tres categorías, y una relación de dependencia que ordena todo lo demás:

- **MainPtr** — sale de ataques que requieren **colisión con la hitbox**; típicamente los que consumen
  munición o son input de melee.
- **OtherPtr** — **sólo existe colgado de un MainPtr**. Sin MainPtr padre, ningún efecto puede sumar
  sus HitPtrs.
- **StatusPtr** — de los procs que hacen daño (Slash, Blast). Puede nacer de un MainPtr **o** de un
  OtherPtr.

> **StatusPtr no es un subtipo de OtherPtr**, es una categoría independiente: existe sólo si el
> enemigo disparó un status, y cada instancia de daño de ese DoT es un StatusPtr.

`Total HitPtrs = MainPtrs + OtherPtrs + StatusPtrs`

**El daño de un HitPtr es la suma de sus DmgSrc.** Con multishot 2.1, si salen dos proyectiles, el
HitPtr hace **2 veces** el daño que haría a multishot 1; si salen tres, **3 veces**. En la Cernos
Prime (multishot 3), un total de 9000 es el daño **del HitPtr**, que el HitPtr reparte en **3 DmgSrc
de 3000** — no es que el multishot divida un daño fijo.

### HitStruct

Representa **el segmento de salud que el enemigo pierde con un ataque**. Dispararle dos veces a un
enemigo con una Karak le quita dos segmentos: dos HitStructs.

- Si varios `DmgSrc` impactan **en momentos distintos**, se crean varios HitStructs.
- Los MainPtr que impactan **simultáneamente** arman su propio HitStruct.
- **Los StatusPtr se cuentan a partir de la cantidad de HitPtrs de cada HitStruct.**

### Dónde caen los Extra Hits

El ejemplo que la wiki desarrolla —Kuva Quartakk con +100% de multishot, 8 proyectiles simultáneos—
se reparte en `HitStruct1` con **un** MainPtr (2 `DmgSrc`) y `HitStruct2` con los **tres** restantes.
Cada `DmgSrc` **tira su proc por separado**: en el ejemplo, uno saca Cold, dos sacan Corrosive y cinco
no sacan nada, todos dentro del mismo ataque.

Al añadir Xata's Whisper, los HitPtrs extra:

- **copian la forma** del hit que los originó, pero **con daño distinto y los procs vueltos a tirar**;
- **caen todos en el segundo HitStruct**.

## Subtipos de HitPtr

| Categoría | Subtipo | Qué es |
|---|---|---|
| **MainPtr** | **Projectile** | el impacto hitscan o de proyectil principal (Braton, Boltor, heavy a distancia de la Redeemer, y **los proyectiles extra del multishot**) |
| | **AoE** | el componente de área — **incluye los swings de melee** (AoE de la Ogris, blandir una Skana, slam de un Fragor) |
| | **Rebound** | proyectiles que **rebotan** en una superficie o enemigo y golpean a otro (Glaive) |
| | **Clone** | los de los clones de Hall of Mirrors |
| **OtherPtr** | **Extra Hit** | efectos que suman HitPtrs sobre el MainPtr. **No es multishot** |
| | **Distribution** | efectos que reparten el daño instantáneamente a varios objetivos |
| **StatusPtr** | **Blast Proc** | cada stack de Blast al resolverse; single-target o AoE según el stack count |
| | **DoT** | cada proc crea un HitPtr independiente (**apilable sin límite**): Slash, Toxin |
| | **Merged DoT** | varios procs **se funden en un solo HitPtr** sin importar cuántos sean: Heat, Electricity, Gas |

> **Clone es un MainPtr, no un OtherPtr.** El clon replica el MainPtr del arma del jugador. Y **los
> clones no reciben Extra Hits** — sólo pueden sumar HitPtrs por efectos de Distribution.

**Rebound hereda los Extra Hits de su MainPtr.** Con Xata's Whisper activo, un disparo de Cyanex da 1
AoE + 1 Projectile + 2 de Xata's Whisper; al rebotar, **vuelve a dar lo mismo**. Como está en otra
línea de tiempo que los MainPtr y OtherPtr, **la wiki no deriva fórmula de conteo para él**.

## Detección de impacto

| Método | Cómo funciona |
|---|---|
| **Projectile** | objeto físico que necesita contacto real con la hitbox |
| **Hitscan** | comprueba línea de visión y aplica daño **al instante** |
| **AoE** | comprueba objetivos dentro de un rango circular |
| **Melee** | crea **zonas de detección secuenciales en abanico**, del origen al final del golpe — un hitscan multi-impacto diferido, donde cada segmento busca objetivos y aplica daño |

> **La detección AoE es independiente de la hitscan y la de proyectil**, así que un impacto directo
> con un arma AoE produce **dos instancias de daño** — el Tenet Envoy genera **2 MainPtrs**: el AoE y
> el directo.

Otras particiones que crean MainPtrs separados:

- **Melee de dos manos:** cada mano tiene su HitPtr. Un heavy attack de Kronen que impacta produce
  **2 MainPtrs**.
- **Continuas:** muchas consumen **0.5 de munición por disparo**, así que gastar 1 munición produce
  **dos MainPtrs**.
- **Beams encadenados** (Atomos, Tenet Cycron) funcionan como hitscan con ese mismo consumo de 0.5;
  balas y cadenas son *"esencialmente efectos visuales"*, no un tipo especial.
- **Stropha** a bocajarro: un ataque melee + un proyectil = 2 MainPtrs.
- **Sampotes** heavy slam: **13 MainPtrs**, cada onda con su propio conteo.

## El tick

```text
Tick Time (ms) = 1000 / Frame Rate
Tick Time (s)  =    1 / Frame Rate
```

Cada game tick agrupa los MainPtr que impactaron en HitStructs:

> Si **dos o más** MainPtrs impactan en un tick, se parten en **dos** HitStructs: el primer MainPtr
> forma el primero, **todos los demás** forman el segundo. Pasa incluso con armas de intervalo cero
> como el burst de la Quartakk o cualquier hitscan con multishot.

- Si la **frecuencia de impacto ≤ la duración del tick**, los HitStructs son **siempre 1**.
- Si la excede, **cuanto más rápido, mayor la probabilidad de que sean 2**.
- Cuando salen 1 en vez de 2, **el daño de status del mismo tipo se funde en un solo HitPtr**.

La lógica de juego **no está atada al frametime del host** — corre en simulación por ticks—, pero el
*timing* de ejecución sí lo afecta: bajo carga puede haber retrasos, ejecución en ráfaga y jitter de
sincronización. El framerate del cliente afecta el render y la interpolación, **no** el resultado del
combate.

### Juicio *group* vs *individual*

Distinción que decide cómo acumula un efecto:

| Tipo | Comportamiento | Ejemplo |
|---|---|---|
| **Group** | en un mismo tick, 1 o 2 HitStructs contra **varios** enemigos aplican **1 o 2** stacks en total | Secondary Enervate |
| **Individual** | los mismos 1 o 2 HitStructs aplican **1 o 2 efectos a cada** enemigo | Cascadia Empowered |

> Consecuencia: para un efecto *group*, **más frecuencia de impacto = acumulación más rápida**, y el
> beneficio real se calcula **sobre HitStructs**.

## Efectos que suman HitPtrs

| Fuente | Clase | Aporte |
|---|---|---|
| Xata's Whisper (Xaku) | Extra Hit | +1 HitPtr independiente de **Void**, por **26% del daño total del arma** |
| Toxic Lash (Saryn) | Extra Hit | +1 HitPtr independiente de **Toxin** |
| Resupply (Cyte-09) | Extra Hit | +1 HitPtr independiente **elemental** |
| Silken Stride (Oraxia) | Extra Hit | +1 HitPtr independiente de **Toxin** |
| Melee Duplicate (arcano) | Extra Hit | al hacer **crítico base**, *chance* de +1 HitPtr que **copia los DmgSrc** del impacto que lo disparó |
| Tornado (Zephyr) | Distribution | hasta **3** HitPtrs, copiando y repartiendo los DmgSrc de lo que golpea |
| Funnel Clouds (augment) | Distribution | hasta **8** HitPtrs, ídem |
| Hall of Mirrors (Mirage) | Clone | **0–6** clones, cada uno replicando el MainPtr |
| proc de **Blast** | Status | cada stack resuelto cuenta como **un** HitPtr |

> El **26%** de Xata's Whisper es el único de estos aportes con valor publicado, y la wiki lo verifica
> tres veces en sus propios ejemplos: `1201 × 0.26 = 312.26` (Kuva Quartakk), `92 × 0.26 = 23.92`
> (Cernos Prime) y `29 × 0.26 = 7.54` (Karak).

## Fórmulas de conteo

> Convención de la wiki: un efecto activo vale **1**, inactivo **0** — de ahí los `(0~1)`.

```text
Single MainPtr Count      = 1

Total Extra Hit Count     = 1 × [ Xata's Whisper + Toxic Lash + Resupply
                                + Silken Stride + Melee Duplicate ]          → 0–5

Total Distribution Count  = 1 × [ Tornados impactados + Funnel Clouds ]      → 0–11

Total nth Clone Count     = ¿existe el clon n? × ¿impactó?                   → 0–1  (hasta 6)
```

```text
Single MainPtr Final Hit Count = Single MainPtr Count
                               + Total Extra Hit Count
                               + Total Distribution Hit Count
                               + Σ Total nth Clone Hit Count   (n = 1..6)
```

> **Cada MainPtr se calcula por separado y después se suma.** El burst apuntado de la Kuva Quartakk
> tiene 4 MainPtrs: los cuatro pasan por la fórmula de forma independiente. Y con 2 clones de Hall of
> Mirrors, cada clon dispara 4 ClonePtrs — ese único ataque exige correr el cálculo de clones **8
> veces**.

### StatusPtr

El conteo de DoT **lo determina la cantidad de HitStructs**, no la de DmgSrc ni la de stacks:

- **Slash, Toxin y Electricity**: como máximo **2** DoTPtr del mismo tipo, porque hay como máximo 2
  HitStructs.
- **Heat**: **siempre 1** HitPtr, por su mecánica de *Heat Inherit*. Igual **Electricity** (Tesla
  Chain) y **Gas** (Gas Cloud).
- **Cada HitStruct puede tener un solo DoT HitPtr del mismo tipo de condición.** Si un arma proca Heat
  y Toxin en dos proyectiles simultáneos, un HitStruct se lleva el Heat y el otro el Toxin.
- **Dentro de un mismo HitStruct, los DoT de Slash se funden en un único `DmgSrc`**, sin importar
  cuántos sean. Ídem Toxin.
- **Blast**: por HitStruct, tantos HitPtrs como el límite de stacks de Blast del enemigo.

```text
Total Blast Procs Hit Count = Blast Proc Stack Count + Resupply's Blast Proc Stack Count
Total nth HitStruct DoT     = ¿tiene proc de Slash? + ¿tiene proc de Toxin?
Total Heat / Elec / Gas DoT = 1 × ¿el enemigo tiene ese proc?
```

> La página se contradice sobre **Gas**: en §Status Hit HitPtr Formula dice *"GasCondition can only
> have a maximum of 10 GasConditionDoT"* y dos líneas después *"Gas DoT can only have one HitPtr"*,
> que es lo que repite en las otras tres secciones donde aparece.

**Los StatusPtr no pueden procar más status**, y corren en una línea de tiempo distinta de la de los
OtherPtr: se calculan aparte.

## El DoT no dispara efectos on-hit

> *"Damage over Time effects can be thought as applying hits to the center of the target's hitbox,
> but **will not roll for Status Effects or trigger "on-hit" effects**."*

Es la ley que separa el daño que **propaga** del que sólo **resta**.

## Fuentes

- https://wiki.warframe.com/w/Hit_Mechanic
- [`multishot.md`](multishot.md) · [`damage-types.md`](damage-types.md) · [`status-effects.md`](status-effects.md) · [`damage-over-time.md`](damage-over-time.md)
