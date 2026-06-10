# Recoil

> Estado: activo
> Rol: mecánica de recoil — camera kick post-disparo, mods de reducción
> Fuente de verdad de: definición (recoil ≠ accuracy), sin valor numérico expuesto, mods bidireccionales
> No usar para: catálogo de valores de recoil por arma (internos, no expuestos)
> Última actualización: 2026-06-10
> Fuente: https://wiki.warframe.com/w/Recoil

## Definición

**Recoil** = el "pateo" del arma al disparar — el retículo y la pantalla se mueven hacia arriba
y/o tiemblan. Distinto de accuracy:

> *"accuracy is about how far from the reticle the weapon shoots its projectile, while recoil is
> the amount that the reticle moves after the weapon is shot."*

Accuracy = dónde cae el disparo respecto al retículo; recoil = cuánto se mueve el retículo después.
Ver [`accuracy.md`](accuracy.md).

## Sin valor numérico expuesto

El recoil **no tiene stat numérico** ni en la UI del juego ni en la API de datos. Es un stat
**interno** de DE (`/Lotus/Types/Game/WeaponProperties/Recoil/`), oculto. Ni la wiki tiene valores
por arma — solo descripciones cualitativas ("harder to manage recoil").

La única semántica disponible es **relativa** (% sobre el recoil nato del arma), y el juego opera
así: *"Having at least −100% recoil bonus will negate all recoil."*

## Mods — porcentaje bidireccional

| Dirección | Mods | Rango |
|---|---|---|
| Reducción (−) | Vile Precision, Primed Counterbalance, Counterbalance, Hydraulic *, Double-Barrel Drift, Gun Glide, Strafing Slide, Stabilizer, Steady Hands | −20% → −90% |
| Aumento (+) | familia Loose (Chamber/Hatch/Magazine), Lie In Wait | +50% → +100% |

Los positivos son trade-offs (corrupted). Stack aditivo; con −100% acumulado el recoil se anula.

## Comportamiento — camera feel

Recoil **no modifica daño ni geometría** — mueve la cámara. Es feel de runtime.

- **Sobre-reducción:** dos reductores que sumen más de −100% no producen recoil "negativo"; el
  juego clampea a 0 (recoil nulo).
- **Aim vs hip:** internamente DE separa el recoil al apuntar del recoil disparando desde la cadera
  (sin dato público de ninguno).
- **Fire rate:** *"Fire rate also increases recoil in some weapons"* (ej. Grakata).
