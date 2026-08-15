# Multishot

> Estado: activo
> Rol: fórmula de multishot y sus tres comportamientos distintos — proyectiles, armas continuas y casos que no lo reciben
> Fuente de verdad de: cálculo del conteo de proyectiles, por qué en beams el status se afecta dos veces pero el crítico no, qué queda fuera del multishot
> No usar para: el catálogo de armas con multishot innato ni la lista completa de mods (están en el raw)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Multishot
> Fuente actualizada: 2026-07-07
> Raw: multishot.wikitext

## Fórmula

```text
Total Projectiles = Weapon Projectile Count × (1 + Multishot Modifier)
```

**Todas** las armas a distancia tienen un stat base de multishot. En la mayoría vale 1 —el proyectil
original, sin adicionales—; las que traen más se suelen llamar de "multishot innato" y suelen ser
escopetas, aunque no sólo ellas.

La **parte entera** del resultado es la cantidad de disparos; la **fracción** es la probabilidad de
un proyectil más. `1.2` = un proyectil con 20% de chance de un segundo.

Ejemplos textuales de la wiki:

```text
Lex (base 1) + 180%              → 2.8   = 2 instancias + 80% de una tercera
Hek (base 7) + Hell's Chamber    → 15.4  = 15 instancias + 40% de una decimosexta
```

> **La Accuracy del arma afecta la efectividad del multishot** (→ [`accuracy.md`](accuracy.md)), y la
> UI del juego muestra la **suma** del daño de todos los proyectiles — así que el daño efectivo puede
> ser menor en armas de dispersión amplia, donde algunos fallan.

## Proyectiles: cada instancia es independiente

Cada proyectil o pellet tira **su propio crítico y su propio status**, y puede acertar o fallar por
separado. Por eso el multishot multiplica las oportunidades de crit y de proc por disparo.

## Armas continuas: se fusionan, y el crítico no escala

En armas continuas los haces adicionales que golpean **al mismo objetivo** se fusionan en **un solo
tick de daño**. Ese tick combinado tiene:

| | Resultado |
|---|---|
| **Daño** | la **suma** de los haces individuales |
| **Status Chance** | la **suma** de los haces individuales |
| **Critical Chance** | **la de un solo haz** — no escala |

**Consecuencia:** el output de los status **dañinos** (Slash, Heat, Toxin, Electricity, Gas) se ve
afectado **dos veces** por el multishot — una por el daño del tick y otra por la chance de proc.

Ejemplo del raw, con 40% de status y multishot 2.5:

```text
si el multishot rolea 2  →  status chance del tick = 2 × 40% = 80%
si rolea 3               →  status chance del tick = 3 × 40% = 120%
```

Y con daño, sobre Amprex (22 base por tick, multishot base 1):

```text
+ Split Chamber (90%)                    → 90% de chance de duplicar a 44
+ Vigilante Armaments (total 150%)       → siempre 44, con 50% de chance de 22 más = 66
```

En ambos casos **el número de instancias de daño sigue siendo 1 por tick**.

### Los status forzados son la excepción

Hunter Munitions, Seeking Talons y demás status forzados se aplican **después** de fusionar las
instancias. Por eso:

- Su daño **no** se ve afectado dos veces — equivale a usarlos en un arma normal.
- **La cantidad de procs forzados es menor de lo esperado**: un enemigo sólo puede recibir **un proc
  por intervalo**, no una cantidad igual al multishot.

### Continuas con multishot innato

Vale lo mismo. La Quanta dispara dos haces (base 2): cada uno puede golpear a un objetivo
**distinto**, pero dos haces sobre el **mismo** objetivo son una sola instancia con chances extra de
status por haz. Con Split Chamber, cada haz tira por separado su 90% de duplicar de 10 a 20 —
resultado total 40, 30 o 20, y siempre **2 instancias por tick**.

> Los haces extra del multishot **normalmente no se ven**: se superponen con el principal por su
> accuracy perfecta.

## Qué NO recibe multishot

- **El radio de explosión esférico** de armas continuas: Ignis (y Wraith), Glaxion Vandal, Gaze
  primario, Embolist, Catabolyst, Cortege.
- **El componente lanzado de las spearguns.** El ataque primario sí lo recibe.

## Bloqueo del multishot — Acuity Mods

Desde la versión 38 existen los **Acuity Mods**, que **impiden que el multishot sea modificado por
cualquier medio** —incluidas las penalidades de Rivens— a cambio de aumentar el daño y la critical
chance **contra weak points** (→ [`enemy-body-parts.md`](enemy-body-parts.md)).

Con uno instalado, la UI del arsenal muestra un candado junto al valor de multishot. A la versión 41
existen dos: **Primary Acuity** (rifles) y **Pistol Acuity** (secundarias).

## Fuentes

- https://wiki.warframe.com/w/Multishot
- [`accuracy.md`](accuracy.md) · [`enemy-body-parts.md`](enemy-body-parts.md) · [`critical-hits.md`](critical-hits.md)
