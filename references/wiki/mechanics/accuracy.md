# Accuracy / Spread

> Estado: activo
> Rol: mecánica de precisión — el spread como cono en grados, la relación accuracy↔spread, qué la recibe y qué no, la fórmula de modding y la accuracy del enemigo
> Fuente de verdad de: qué mide el stat y en qué unidad (grados, post-35.5), el par `Deviation With Aim`/`Max Deviation`, la fórmula de spread modificado, el piso de <1° que siempre acierta, la exclusión de melee y AoE, el `AimGraph` enemigo
> No usar para: el catálogo de deviation por arma · la lista completa de armas con spread inverso/uniforme (galerías del raw)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Accuracy
> Raw: accuracy.wikitext

## Definición

> *"Accuracy describes a ranged weapon's ability to land shots close to where it is aimed, and how
> close to its reticle will multiple shots land over a given period of time."*

**No es lo mismo que *player accuracy*** (el % de disparos del jugador que impactan). Es una
propiedad del arma.

**Spread** es el "cono" de fuego, representado internamente como un **ángulo en grados** desde el
retículo. Cada arma define un mínimo (primer disparo) y un máximo:

| Stat de arsenal | Qué es |
|---|---|
| `Deviation With Aim` | spread **mínimo** |
| `Max Deviation` | spread **máximo** |

Ambos se leen pasando el cursor sobre el stat de Accuracy en el arsenal, y **ambos son mientras se
apunta** — sin apuntar la desviación suele ser bastante mayor. Apuntar reduce la desviación.

Desde la versión **35.5** el arsenal muestra estos dos grados; antes mostraba una escala numérica
única (ver §El stat pre-35.5).

### Categorías

| Categoría | `Deviation With Aim` | Ejemplos |
|---|---|---|
| Very Low | x > 12° | Zarr (modo Barrage), Bronco |
| Low | 6° < x ≤ 10° | Gorgon, Tenet Spirex |
| Medium | 3° < x ≤ 6° | Afuris, Tigris |
| High | 1° < x ≤ 3° | Grinlok, Akstiletto |
| Very High | 0° ≤ x ≤ 1° | Synapse, Tenet Flux Rifle, Perigale, Penta |

Los rangos **no son contiguos** a propósito: no existen armas cuyo valor caiga en los huecos.

> **Piso duro:** un arma con **menos de 1°** de `Deviation With Aim` acierta **siempre** en el
> retículo, sin importar cadencia ni cantidad de pellets — salvo a rango *extremo*.

## Qué NO recibe accuracy

- **Melee no tiene stat de accuracy**, así que ningún modificador de accuracy lo afecta.
- **Las áreas de efecto tampoco** se ven afectadas por modificadores de accuracy.

## Accuracy y spread son el mismo stat, con signo invertido

> *"Bonuses that **increase** accuracy **decrease** the deviation (spread) of a shot. i.e. a +40%
> accuracy buff will decrease the spread by −40%."*

```text
Spread modificado = [ (Min Spread + Max Spread)/2 × (1 + Σ %modificadores) ] + Σ modificadores flat
```

> Ciertos modificadores que **reducen** accuracy lo hacen aumentando el spread en una cantidad
> **flat**, pese a mostrarse como porcentaje en el juego.

Las armas **sin** valor explícito de spread mínimo/máximo usan un spread promedio de **1** a efectos
de modding.

### Fuentes

| Signo | Mods y arcanos |
|---|---|
| **+ accuracy** | Guided Ordnance · Narrow Barrel · Targeting Subsystem · Twitch · Soft Hands · Reflex Draw · Gun Glide · Double-Barrel Drift · Strafing Slide · Resolute Focus · Tainted Shell · Grinloked · Precision Munition · Directed Convergence · Pax Soar |
| **− accuracy** | Heavy Caliber · Magnum Force · Split Flights · Vicious Spread · Blind Shot y Lucky Shot (Conclave) |

## Cadencia: por qué accuracy importa más en unas armas que en otras

> *"A weapon's accuracy value generally becomes more important the higher its Fire Rate is, as the
> weapon's successive shot grouping worsens the faster it fires."*

**Cuanto más rápido dispara un arma, más grande es el cono.** De ahí que el stat pese en fusiles de
asalto y pistolas automáticas, y poco en semiautomáticas.

El ejemplo que la wiki desarrolla es contraintuitivo: la **Grakata** tiene *mejor* deviation apuntada
(2°) que la **Stradavar** en modo automático (6°), pero su cadencia altísima hace que a rango largo
disperse más. Disparada de a poco, la Grakata agrupa **mejor** que la Stradavar.

## Interacción con multishot

> Ver [`multishot.md`](multishot.md).

- **Hitscan**: cuanto **menor** la accuracy, más probable que cada pellet *generado* por el multishot
  se desvíe de la trayectoria del pellet **principal**.
- **Proyectil con tiempo de viaje**: incluso el proyectil **principal** puede descentrarse al usar
  multishot, y el efecto es **más pronunciado cuanto más lenta la velocidad del proyectil**
  (→ [`projectile-speed.md`](projectile-speed.md)). Por eso Heavy Caliber en armas de proyectil con
  multishot es *extremadamente* perjudicial a media y larga distancia.

Escopetas y hitscan con mods de multishot disparan **al menos un pellet** centrado o casi centrado en
el retículo; el resto toma trayectorias aleatorias dentro del cono.

Las **armas continuas** (Glaxion) tienen poco o nada de spread en su haz.

## Patrones de spread no estándar

| Patrón | Comportamiento | Armas |
|---|---|---|
| **Inverso** | cuanto más se sostiene el disparo, **más** preciso se vuelve | Tenora, Tenora Prime, Aksomati Prime |
| **Uniforme** | los disparos se reparten uniformemente en la **horizontal** | Perigale (sin zoom), Veldt |
| **Único** | el spread sigue una estructura geométrica dependiente del multishot | Angstrum, Prisma Angstrum |

La **Boar Prime** también tiene patrón propio —una **estrella de 8 puntas**—, aunque la wiki lo
documenta con una captura en §Media y no en la sección de patrones.

**Arrojadizas y de proyectil con arco** (Castanas, Tonkor) suelen tener accuracy "Very High" y aun
así presentan desviación notable en la trayectoria.

## Accuracy ≠ Recoil

Un arma de accuracy alta pero recoil alto **sigue siendo difícil de disparar con precisión** a
cadencia alta: la Cestra es el ejemplo, y también la Vectis Prime comparada con la Rubico Prime
—**mismo stat de accuracy, recoil distinto**. Ver [`recoil.md`](recoil.md).

## Accuracy del enemigo

> La wiki marca esta sección con **`{{Speculation}}`**.

Los enemigos resuelven su precisión con un **`AimGraph`**: una curva que mapea **rango del objetivo →
probabilidad de acierto**. Cada arma enemiga tiene el suyo, y varía por rol:

- **Pistola** — muy precisa de cerca, cae con la distancia.
- **Sniper** — poco precisa de cerca, mejora a media y larga distancia, luego decae lentamente.

Además, **necesitan tiempo para afinar la puntería** desde que detectan al jugador. Desde la versión
15.5 la precisión enemiga **baja dinámicamente con el movimiento del jugador** —correr, deslizarse,
saltar, correr por paredes— y **cuanto más rápido se mueve, mayor la penalización**.

Se reduce con Agility Drift, el set Carnis, EMP Aura, Sly Devolution y Tribute (Titania).

## El stat pre-35.5

La wiki lo mueve a Trivia, pero la relación sigue siendo la que conecta grados con el número viejo:

```text
Base Accuracy = 100 / Avg Spread = 100 / [(Min Spread + Max Spread)/2]
```

Ejemplo de la wiki con la Attica (spread 0–5): `100 / 2.5 = 40`, que es el valor que mostraba el
arsenal. Bajo esa escala, **100 de accuracy** era el umbral de "siempre acierta en el retículo" —hoy
expresado como **menos de 1°**.

## Representación interna

> La wiki marca esta sección con **`{{Speculation}}`**.

El spread vive en `/Lotus/Types/Game/WeaponProperties/Accuracy/Weapon/`, con detalles en el
`LotusWeaponProjectileFireBehavior` del arma. Los campos que se ven en el volcado de la Attica nombran
mecánicas que el artículo describe por separado: `AIMED_ACCURACY` vs `HIP_FIRE_ACCURACY`,
`SpreadInverse`, `spreadUniform`, `UseFanSpread`, `SpreadRatioHorizontal`, `MultishotAmmoSpread`,
`AttenuateSpreadForCharge`, y un bloque de recuperación (`recoveryDelay`, `recoveryRate`) que modela
cómo el cono se cierra al dejar de disparar.

## Fuentes

- https://wiki.warframe.com/w/Accuracy
- [`recoil.md`](recoil.md) · [`multishot.md`](multishot.md) · [`projectile-speed.md`](projectile-speed.md)
