# Condition Overload (Mechanic)

> Estado: activo
> Rol: la familia de bonus que escala con los status activos del enemigo — sus cinco comportamientos, cómo apilan y qué formas de daño los reciben
> Fuente de verdad de: los dos ejes de comportamiento (stacking × application), la matemática de "Adding" y "Multiplying", qué multiplicadores ignora el CO aditivo, qué formas de ataque aplican CO y cuáles no
> No usar para: el catálogo por arma y ataque (son ~500 líneas del raw) ni el listado completo de fuentes
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Condition_Overload_(Mechanic)
> Fuente actualizada: 2026-07-23
> Raw: condition-overload.wikitext

> ⚠️ La wiki marca esta página con **`{{Community}}`, `{{UpdateMe}}` y `{{CleanUp}}`** a la vez. Y
> sus autores advierten: *"much of this page may be considered and acknowledged by developers as
> **bugs**, this page exists to reflect the **present state** of the mechanic"*. Es descripción de
> comportamiento observado, no de diseño intencional.

## Qué es

Bonus de daño que se activan por **condiciones transitorias del enemigo** —típicamente un status
effect— a diferencia de los de facción, que siempre aplican.

En el juego aparecen como **"+X% Direct Damage"**. Ese *"Direct"* es lenguaje intencional para
excluir el daño de explosión radial — pero la wiki aclara que **no es completamente cierto**: muchas
otras formas de daño en área sí lo reciben.

**Terminología de la comunidad, usada por la propia wiki:** `CO` para la mecánica en general,
`GunCO` para su versión en armas a distancia.

## Fuentes

| Fuente | Clase | Bonus |
|---|---|---|
| Condition Overload | melee | **+80%** por status único |
| Galvanized Aptitude | rifle | +40% por status, hasta **2** stacks (+80%) |
| Galvanized Savvy | shotgun | +40% por status, hasta **2** stacks (+80%) |
| Galvanized Shot | secundaria | +40% por status, hasta **3** stacks (+120%) |

El raw lista varias más (45%, 60%, 33%, 30% por status según la fuente).

## Los cinco comportamientos — dos ejes, no uno

Esta es la parte que se pierde al resumir. La wiki clasifica en **dos ejes ortogonales**:

- **Stacking** — cómo apila con Serration: multiplicativo o aditivo.
- **Application** — cuánto del `+X%` listado aplica **realmente**: más, exacto o menos.

| # | Valoración | Stacking | Application | Ejemplos |
|---|---|---|---|---|
| **1** | excelente | **Multiplicativo** *(no intencional)* | **por encima** del X% *(no intencional)* | la mayoría de las armas de **proyectil**: Arca Plasmor, modo Incarnon del Latron |
| **2** | bueno | Aditivo *(intencional)* | **por encima** del X% *(no intencional)* | **proyectiles hijos** que nacen de un proyectil padre — el CO usa el daño del **padre**, que suele ser mayor: Kuva Bramma, Kulstar |
| **3** | esperado | Aditivo | **exactamente** X% *(intencional)* | casi todas las **hitscan**: Braton normal e Incarnon, Latron normal, Paris sin cargar |
| **4** | malo | Aditivo | **por debajo** del X% *(no intencional)* | **arcos y disparos cargados** — el CO usa el daño del proyectil **sin cargar**, que es menor: Paris cargado |
| **5** | muy malo | — | **no aplica** | el componente **AoE** de los ataques, para bonus GunCO |

> El eje de *application* es el que explica los casos raros. Un disparo cargado del Paris y una
> bomba hija de la Kuva Bramma son **ambos "Adding"** en el eje de stacking; lo que los separa es que
> uno calcula el CO sobre una base menor y el otro sobre una mayor.

## La matemática

Los cinco comportamientos se agrupan en **dos** por su stacking.

### "Multiplying" — sólo el comportamiento #1

Apila **aditivamente sólo con otros bonus CO-like**, y **multiplicativamente con todo lo demás**
(Serration, Vex Armor, Arcane Fury). Es el menos común, y el más confiable: compatible con todos los
bonus del arma.

```text
Base × Most Damage Bonuses × CO × Other Damage Multipliers
```

Ejemplo con Serration y 2 procs / 1 stack de Galvanized Aptitude:

```text
Final = Base × (1 + 1.65 Serration) × (1 + 0.4 + 0.4)
```

### "Adding" — los comportamientos #2, #3 y #4

Apila **aditivamente con TODOS** los bonus de +% daño. Es el más común.

```text
(Base × Most Damage Bonuses × Other Multipliers) + (Base × CO)
= Base × [ (Most Damage Bonuses × Other Multipliers) + CO ]
```

Internamente es una **recalculación aditiva de todos los efectos que omite el +X% Damage** — de ahí
que resulte aditivo respecto a él.

> ⚠️ **Y esa recalculación omite otros efectos sin querer.** Multiplicadores que el CO aditivo
> **ignora**:
>
> - Extinguished Dragon Key
> - **Damage Falloff por rango** (pero **no** el ramp-up de los beams) → [`damage-falloff.md`](damage-falloff.md)
> - Longbow Sharpshot
> - Primary Compression, en armas de proyectil
> - Duality (Equinox)
> - Furious Javelin (Excalibur)

## Qué formas de daño aplican CO

**Sí aplican:** hitscan · hitscan explosion (Trumna, **sólo en el objetivo directo**) · hitscan
ricochet (Lato Incarnon) · proyectiles, incluidos homing (Zymos), rebotantes (Cyanex), con punch
through (Lanka) y de onda (Arca Plasmor) · nube embebida (Pox, **sólo en el objetivo embebido**) ·
beam (Spectra), beam AoE (Glaxion Vandal), beam chain (Kuva Nukor) y multi-beam (Ocucor).

> Los procs de **Blast, Electricity y Gas** se generan con el bonus del objetivo inicial y **llevan
> ese daño de proc a su radio**.

**No aplican:** radio de explosión de proyectil (Ogris) · radio de explosión hitscan (Ambassador) en
todo objetivo no golpeado directamente · radio de nube embebida (Torid) ídem.

**"Cosas que deberían funcionar y no funcionan"** —así lo titula la wiki—: Balefire Charger, Stug,
el alt-fire embebido de la familia Ferrox, la torreta de la Azima y el Sonicor.

## Qué cuenta como status effect

**Todos los status que tienen un tipo de daño equivalente** — los tres físicos (Impact, Puncture,
Slash), los cuatro elementales simples (Cold, Electricity, Heat, Toxin), los seis combinados (Blast,
Corrosive, Gas, Magnetic, Radiation, Viral) y los de tipos únicos (Void, Tau).

**Y además tres que la wiki llama *"unique hidden status effects"*, que NO vienen de ningún tipo de
daño:**

| Status | Nota |
|---|---|
| **Lifted** | **no puede coexistir con Knockdown** en el mismo objetivo |
| **Knockdown** | **no puede coexistir con Lifted** en el mismo objetivo |
| **Microwave** | — |

> Es la excepción a la regla que la propia sección enuncia: para el bonus de CO, estos tres suman
> **aunque no tengan tipo de daño equivalente**. La exclusión mutua Lifted ↔ Knockdown acota cuánto
> pueden aportar entre los dos: **uno, nunca los dos**.

## Secuencia dentro del mismo disparo

Los status aplicados por un hit **no mejoran ese mismo impacto**. Pero si el disparo genera varias
instancias secuenciales, las siguientes sí heredan el bonus — lo que importa en escopetas y en armas
con multishot alto.

## De dónde vienen los comportamientos raros

El patch history de la página explica qué es bug y qué es diseño — la distinción que el aviso de
`{{Community}}` anuncia pero el cuerpo del artículo no desarrolla.

### El #4 (arcos y cargados) es un bug declarado y **sin arreglar**

> **v31.1** — *"(Fixed CO on many projectile attacks. Previously, many projectiles had a **default CO
> damage of 10** instead of using the full projectile damage. Most cases were fixed, but
> **multi-stage damage and charged attacks were not**)."*

Y la explicación de DE de por qué era tan generalizado:

> *"A previous change had them operate relative to 'base damage' but the code was incorrectly getting
> base damage from the **impact behavior** rather than the **projectile**. This problem was pervasive
> and there are hundreds of weapons in our game!"*

Es decir: el comportamiento #4 no es una regla del sistema, es **el resto de una corrección
incompleta**.

### El #5 (AoE) es decisión de diseño, no accidente

> **v30.9** — *"([[GunCO]] **never** applied to explosions"*. La descripción de Galvanized Aptitude se
> cambió para decirlo, y DE justificó no revertirlo: las armas AoE dominan todas las métricas de uso,
> y *"we are not willing to further bolster AoE at this time"*. El CO quedó deliberadamente **exclusivo
> de ataques a un solo objetivo**.

### Dos leyes más del historial

- **v31.1.6** — *"(Fixed Multishot on weapons **multiplying** bonus from CO by each pellet)"*. El bonus
  de CO **no** se multiplica por pellet.
- **v31.2 / v31.5** — el bonus innato de las Kuva/Tenet de proyectil no aplicaba el CO, *"never broken
  on multiplicative cases, **only the additive recalculation**"* — confirma que los dos modos son
  rutas de código distintas, no dos lecturas del mismo cálculo.

**Cronología:** la mecánica nace con el mod Condition Overload en la **v19.2**; se rehace en la
**v26.0**; y llega a las armas a distancia en la **v30.5** con los mods Galvanized.

## Fuentes

- https://wiki.warframe.com/w/Condition_Overload_(Mechanic)
- [`damage-falloff.md`](damage-falloff.md) · [`status-effects.md`](status-effects.md) · [`calculating-bonuses.md`](calculating-bonuses.md)
