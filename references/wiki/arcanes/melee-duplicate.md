# Melee Duplicate

> Estado: activo
> Rol: arcano melee — chance de que un crítico BASE (amarillo) inflija una segunda instancia de daño
> Fuente de verdad de: tabla de chance por rank, reglas de reroll, fórmula de crit óptimo, bugs conocidos
> No usar para: catálogo de armas/stances compatibles
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Melee_Duplicate
> Fuente actualizada: 2026-05-28
> Raw: melee-duplicate.wikitext

## Qué es

Arcano melee que hace que los **críticos base (amarillos)** inflijan una **segunda instancia de
daño**. El gatillo es el crítico de tier 1 específicamente, no cualquier crítico.

## Chance por rank

| Rank | Chance |
|---|---|
| 0 | 25% |
| 1 | 40% |
| 2 | 55% |
| 3 | 70% |
| 4 | 85% |
| 5 | 100% |

## Comportamiento del golpe duplicado

Crea *"a separate damage instance that will reroll the chance to apply status and also the critical
tier"*. Consecuencias:

- El tier de crítico **se re-rollea**: el golpe duplicado puede salir **no crítico, tier 1 (amarillo)
  o tier 2 (naranja)**. No hereda el tier del original.
- El status **también se re-rollea**, de forma independiente.
- Los **procs de status forzado se aplican** al golpe duplicado **si originan del arma melee**.

## Fórmula de crit óptimo (rank 5)

```
Critical Chance = (3 × Critical Damage Multiplier − 4) ÷ (2 × Critical Damage Multiplier − 2)
```

Dos salvedades que la wiki declara por separado:

- Con un multiplicador de crit damage **bajo**, otros arcanos (p. ej. Melee Exposure) probablemente
  rindan más que Duplicate.
- **La fórmula misma pierde exactitud** en armas de multiplicador total bajo. La wiki lo anota como
  caso que *"no debería ser relevante nunca, pero conviene dejar asentado"*.

## Interacciones (notas de la wiki)

- **Exodia Contagion:** el efecto puede dispararse, **salvo** que la primera ráfaga de daño mate al
  enemigo (o lo haga one-shot).
- **Seeking Talons:** el golpe duplicado **no** aplica el status forzado de ese mod.

## Bugs conocidos

> La wiki clasifica lo siguiente como **bugs**, no como comportamiento diseñado. La distinción
> importa: un bug puede desaparecer en cualquier actualización.

- **Toxic Lash / Xata's Whisper:** el arcano duplica la *instancia de daño extra* que genera la
  habilidad, en vez del golpe melee original.
  - Con **ambas activas a la vez**, prioriza la que ocupa el **slot de habilidad más temprano**.
    Ejemplo de la wiki: en una Saryn con Spores reemplazada por Xata's Whisper vía Helminth, duplica
    el hit extra de **Xata's Whisper**; si en cambio la reemplazada es Miasma, duplica el de
    **Toxic Lash**.
- **Shield Gating:** la instancia separada generada por daño de área (slam attacks, explosión de
  Exodia Contagion) **no** bypassa el Shield Gating enemigo — a diferencia de Toxic Lash o Xata's
  Whisper, que sí lo hacen en el mismo escenario.

## Adquisición

Recompensa potencial de **Netracells** y **Deep Archimedea**. Comerciarlo exige Mastery Rank 11 o
superior (del lado del que entrega, no del que recibe).

## Fuentes

- https://wiki.warframe.com/w/Melee_Duplicate
