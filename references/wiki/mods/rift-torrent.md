# Rift Torrent — augment de *Rift Surge* (Limbo)

> Estado: activo
> Rol: Warframe Augment Mod de *Rift Surge* — da daño a Limbo **por cada enemigo con Rift Surge**, mientras esté en el Rift Plane
> Fuente de verdad de: los valores por rank · **que el bonus se multiplica por la cantidad de enemigos afectados**, con su fórmula · que es aditivo al pool de Serration/Hornet Strike · que el enemigo **no** necesita estar en el Rift · que varios Limbos comparten y suman sus bonos · el doble conteo con Exodia Contagion y glaives
> No usar para: los stats base ni las habilidades de Limbo · la mecánica del Rift Plane
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Rift_Torrent
> Fuente actualizada: 2026-02-12
> Raw: rift-torrent.wikitext

## Qué es

Mod augment de *Rift Surge*. Aumenta el daño de Limbo **mientras esté en el Rift Plane**, en función de
**cuántos enemigos tengan Rift Surge encima**.

| Rank | Bonus de daño | Costo |
|---|---|---|
| 0 | 15% | 6 |
| 1 | 20% | 7 |
| 2 | 25% | 8 |
| 3 | **30%** | 9 |

Escala con Ability Strength.

## Cómo compone

El bonus **es aditivo** con mods como *Serration* y *Hornet Strike*, y **se multiplica por la cantidad
de enemigos afectados**:

```
Daño = Base × (1 + Bonus × (1 + Ability Strength) × Enemigos afectados + Damage Mods)
     = 100  × (1 + 0.3  × (1 + 0.3)              × 5                  + 1.65)
```

## Detalles del contador

- Limbo **pierde el buff al salir** del Rift Plane y lo **recupera al instante** al volver a entrar.
- **El enemigo no necesita estar en el Rift** para que su Surge cuente.
- Si un enemigo con Surge muere, el bono **se recalcula** a la cantidad actual.
- Con **varios Limbos con Rift Torrent** en el escuadrón, los bonos **se comparten y se suman**: un
  jugador con 20 enemigos surgeados aporta 2.000%, y si el Limbo aliado surgea otro enemigo por 50%,
  el total queda en 2.050%.

## Casos de doble aplicación

Con *Exodia Contagion* y con explosiones de glaive, Rift Torrent **se aplica dos veces**. Para la
explosión de glaive:

```
Explosión = Base × (1 + Damage Mods + Rift Torrent) × (1 + Rift Torrent + Vigorous Swap + Power Throw)
```

## Con qué se combina

Es **el mismo tipo de buff de daño** que *Vex Armor* y *Amp*. A diferencia de esos, **Rift Torrent sí
se puede combinar** con *Eclipse*, *Roar* o *Xata's Whisper*.
