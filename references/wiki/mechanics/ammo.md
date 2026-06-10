# Ammo — Mecánica de munición

> Estado: activo
> Rol: estructura de munición (magazine vs reserva), ammo efficiency, tipos de pickup
> Fuente de verdad de: distinción magazine/ammo-max, fórmula de ammo efficiency, tipos y cantidades de pickup
> No usar para: catálogo de valores de ammo max por arma (no expuestos por la API; solo en la wiki)
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Ammo

## Estructura del sistema — dos pools independientes

| Pool | Descripción |
|---|---|
| **Magazine** (cargador) | Munición cargada, disponible inmediatamente. Se consume al disparar. |
| **Ammo Maximum** (reserva) | Munición total que se puede cargar, para recargar el cargador. |

Son **independientes**: *"Ammo Maximum has no effect on Magazine Capacity"* y viceversa
(*"Magazine Capacity bonuses do not affect weapons that pull ammo directly from their reserve pool
like Bows"*). En la UI se muestran juntos como `cargador / reserva` (ej. Laetum `12 / 210`).

> El valor de Ammo Maximum por arma se ve en la UI y la wiki, pero **no lo expone la API de datos**
> (solo magazine). Por eso no hay catálogo de reservas en el dataset.

## Mods de Ammo Maximum — porcentaje

Ammo Drum, Ammo Chain, Primed Ammo Chain, Ammo Case, Trick Mag, Shell Compression (+); Draining
Gloom (−). Todos son porcentaje sobre la reserva base.

## Ammo Efficiency — disparos antes de consumir munición

*"Ammo Efficiency determines the number of shots that occur before consuming ammo."* No es una
chance de no consumir — reduce el costo efectivo por disparo:

```text
Disparos por munición consumida = 1 / (1 − Ammo Efficiency Bonus)
```

Ej.: 75% efficiency → la munición se consume cada 4 disparos.

- **Stacking:** las fuentes de efficiency se suman **aditivamente** entre sí; **Energized Munitions**
  (habilidad, +75% a todas las armas equipadas) stackea **multiplicativamente**.
- **Fuentes:** pasivas de arma (Velox: 20% innato), mods (Brain Storm, Skull Shots), arcanes
  (Arcane Pistoleer), Focus (Void Fuel), habilidad Energized Munitions.
- **Beneficiados:** armas de cargador único (Exergis), bows (consumen 1 flecha cada 4 disparos, pero
  mantienen el delay de recarga), alt-fires que vacían cargador (Nagantaka).

## Tipos de munición y pickup

| Tipo (color) | Cantidad por pickup |
|---|---|
| Primary (morado) — rifles/continuas/crossbows | 80 |
| Primary — spearguns | 60 |
| Primary — auto shotguns | 40 |
| Primary — semi-auto shotgun / sniper / bow | 15 |
| Secondary (naranja) — mayoría | 40 |
| Secondary — shotgun sidearms | 20 |
| Heavy (amarillo) — Archgun | 1000 (o resetea cooldown del Deployer) |
| Universal (azul) | 1× pickup de cada tipo equipado |

- **Ammo Mutation:** convierte pickups de otros tipos al tipo del arma equipada, mientras el otro
  pool esté lleno.
- **AoE:** tienden a tener menor ammo pickup base.

## Casos especiales — armas sin reserva

- **Melee:** las únicas armas que no usan munición.
- **Battery weapons** (Kuva Ogris, Shedu, etc.): batería autorecargable en vez de reserva — Ammo
  Maximum no les aplica.
- **Archguns en Archwing:** excluidos de los efectos de Ammo Maximum.

## Holster reload

Recarga mientras el arma está guardada — mecánica separada, no cubierta por esta página.
