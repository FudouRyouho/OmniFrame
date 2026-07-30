# Reload

> Estado: activo
> Rol: las tres fórmulas de recarga (normal, por cartucho, batería), qué parte del ciclo escala con Reload Speed y cuál no, y el peso real del reload en el DPS sostenido
> Fuente de verdad de: `Total Reload Time` en sus tres formas, el escalado inverso, que en batería el bonus toca **sólo el delay** y no el recharge rate, que la recarga enfundada **no** escala con mods, la equivalencia magazine capacity ↔ reload speed para DPS sostenido
> No usar para: valores de reload por arma (están en el arsenal) · los bonus por mod y por habilidad (viven en la página de cada uno)
> Última actualización: 2026-07-30
> Fuente: https://wiki.warframe.com/w/Reload
> Raw: reload.wikitext

## Fórmula base

```text
Total Reload Time = Weapon Reload Time / (1 + Reload Speed Bonus)
```

- `Weapon Reload Time` — el tiempo que muestran los stats del arma **sin modificar**.
- `Reload Speed Bonus` — el porcentaje de las cartas, como decimal.

> **Ningún mod modifica el tiempo base.** Todos dan `Reload Speed`, que **divide**.

Ejemplos del raw, sobre una Braton de 2.0 s:

```text
+30% (Fast Hands r5)  →  2.0 / 1.30 = 1.54 s
−30% (Tainted Mag r9) →  2.0 / 0.70 ≈ 2.85 s
```

### Escalado inverso

> *"reduced reload speed has a more substantial effect than increased reload speed"*

Un penalty de −30% cuesta **+0.85 s**; un bonus de +30% ahorra **0.46 s**. La asimetría es
estructural: dividir por `1 + x` comprime hacia arriba y expande hacia abajo.

> La wiki escribe *"−0.54s from +30%"* al enunciar esta comparación, pero sus propios números dan
> **0.46 s** (`2.0 − 1.54`). El `0.85` del otro lado sí cierra.

## El retardo antes de la recarga automática

Vaciar el cargador **no** dispara la recarga de inmediato: hay un retardo igual al **recíproco de la
cadencia** del arma. Se evita apretando la tecla de recarga justo antes de que se agote el cargador,
manteniendo el gatillo (o repicando, en semiautomáticas).

**En las armas de batería este retardo no se puede evitar.**

Con el ajuste *"Context Action Includes Reload"* activado, intentar disparar sin munición recarga.
La animación bloquea el disparo, pero **se puede cancelar** rodando.

## Armas que recargan de a un cartucho

```text
Total Reload Time =   Reload Start and End Delay / (1 + Bonus)
                    + Weapon Reload Time Per Shell / (1 + Bonus) × Magazine Capacity
```

> **Consecuencia:** subir la **capacidad de cargador** en estas armas **aumenta** el tiempo total de
> recarga.

La recarga parcial **se puede interrumpir** —volviendo a pulsar recargar o disparando el arma a medio
llenar—. Armas: Corinth, Felarx, Mk1-Strun, Strun, Strun Wraith, Zarr.

## Armas de batería

No tienen animación de recarga: el cargador se repone **con el tiempo**, tras un retardo inicial entre
disparar y empezar a recargar.

```text
Total Reload Time = Recharge Delay / (1 + Bonus) + Magazine Capacity / Recharge Rate
```

> **El bonus de Reload Speed afecta sólo el `Recharge Delay`. El `Recharge Rate` no se puede
> cambiar.**

También acá subir la capacidad de cargador aumenta el tiempo total, y también se puede interrumpir
disparando. Ejemplos: Flux Rifle, Plinx.

## Recarga enfundada

Ciertas armas y mods reponen una fracción del cargador **por segundo mientras están enfundadas**.

> **Esa tasa no la modifican los mods de reload speed.**

| Fuente | Tasa |
|---|---|
| Tactical Reload (rifle) · Lock and Load (escopeta) · Eject Magazine (pistola) | 20% del cargador / s |
| Synth (efecto de set) | 5% / 10% / 15% / 20% por segundo, primaria y secundaria |
| Afentis · Ferrox · Javlok · Scourge (y Prime) | 33% / s |
| Felarx (Evolved Autoreloader) | 50% / s |
| Laetum (Awakened Readiness) | 30% / s |
| Tenet Envoy | 1 bala / s |
| Tenet Diplos | 8 balas / s |

## Recarga instantánea

Blood Forge y el buff *Instant Reload* de Charm **saltean la animación** por completo.

## One-Handed Action

Ciertas habilidades se pueden castear **mientras se recarga**: sus animaciones ocupan como mucho una
mano, dejando la otra libre. No basta con que la animación *muestre* una sola mano — es una propiedad
declarada de la habilidad.

## Fuentes de Reload Speed

| Clase | Fuentes |
|---|---|
| Rifle | Fast Hands (Primed) · Radiated Reload · Depleted Reload · Aero Agility |
| Escopeta | Tactical Pump (Primed) · Chilling Reload · Seeking Fury · Amalgam Ripkas True Steel |
| Secundaria | Quickdraw (Primed) · Pistol Elementalist · Stunning Speed · Combo Fury |
| Archgun | Archgun Ace · Quick Reload |
| Augments | Precision Strike · Blood Forge |
| **Negativos** | Burdened Magazine · Tainted Mag · Tainted Clip |
| Arcanos | Fractalized Reset y Primary Merciless (primarias) · Shotgun Vendetta · Arcane Momentum (snipers) · Secondary Merciless y Conjunction Voltage (secundarias) |
| Habilidades | Elemental Ward/Toxin (Chroma) · Redline (Gauss) · Penance (Harrow) · pasiva de Mesa · Speed (Volt) |
| Conclave | Loose Hatch / Chamber / Magazine · Maximum / Loaded / Full Capacity |

**Arcos, snipers y lanzadores usan los mods de reload de tipo Rifle.** Quickdraw y Stunning Speed
conviven en la misma secundaria; Fast Hands y Primed Fast Hands **no** pueden coexistir.

## DPS sostenido — cuándo el reload importa de verdad

El DPS **burst** ignora la recarga; el **sostenido** promedia sobre disparar *y* recargar. La wiki es
tajante:

> *"modding for reload speed is a poor choice on almost every weapon […] due to the opportunity cost
> of using the same mod slot for elemental damage or the like."*

### Reload Speed vs Fire Rate

Ambos acortan un tramo del mismo ciclo, así que se comparan directo. Con la **Viper** —caso raro donde
disparar (0.97 s) y recargar (1.1 s) duran casi lo mismo— y 7 de capacidad:

| Mod | Efecto | Sustained DPS |
|---|---|---|
| Gunslinger r3 | cadencia 14.4 → 21.31; disparo 0.97 → 0.66 s | 224 daño / 1.76 s = **127.27** |
| Quickdraw r5 | recarga 1.1 → 0.74 s | 224 daño / 1.71 s = **131.99** |

Pero la Viper es la excepción. En casi todas las armas el tramo de disparo domina, y a rango máximo un
Gunslinger r5 (+72% cadencia) supera de largo a Quickdraw (+48% recarga). **Sólo tiene sentido elegir
reload por encima de cadencia cuando la recarga domina el ciclo** — la Tigris dispara 1 s y recarga
1.8 s.

### Reload Speed vs Magazine Capacity

Subir el cargador un X% alarga el tramo de disparo un X% (salvo redondeos y armas con spool-up), lo
que **reduce la fracción de tiempo recargando** — exactamente lo que hace un bonus de reload.

Con la **Grakata** (3 s disparando, 2.4 s recargando ⇒ 55%/45%):

| Mod | Fracción disparando |
|---|---|
| sin mod | ~55% |
| Fast Hands max (recarga → 1.85 s) | ~61% |
| Magazine Warp max (disparo → 3.9 s) | ~62% |

> **+30% de cargador ≈ +30% de reload speed.** Elegir entre los dos se decide por lo demás: en rifles
> Fast Hands cuesta 2 puntos menos de capacidad que Magazine Warp para el mismo efecto; en escopetas
> Ammo Stock (+60% cargador) cuesta lo mismo que Tactical Pump (+30% recarga) y rinde más — **salvo en
> Strun y Corinth**, que recargan de a un cartucho y por eso prefieren Tactical Pump.

## Fuentes

- https://wiki.warframe.com/w/Reload
- [`ammo.md`](ammo.md)
