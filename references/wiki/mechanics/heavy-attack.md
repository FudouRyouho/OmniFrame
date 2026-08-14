# Heavy Attack

> Estado: activo
> Rol: el ataque pesado del melee — su multiplicador fijo por clase de arma, el wind-up, el heavy slam y Tennokai
> Fuente de verdad de: la tabla de **multiplicador fijo × clase**, que se compone multiplicativamente con el combo · el **wind-up por clase** y que la attack speed **no** lo reduce · que el wind-up **no tiene cap** · que el heavy slam no tiene wind-up y aplica `Lifted`
> No usar para: el contador de combo, su duración y Heavy Attack Efficiency — ver [`melee-combo.md`](melee-combo.md)
> Última actualización: 2026-07-31
> Fuente: https://wiki.warframe.com/w/Melee
> Fuente actualizada: 2026-08-11
> Raw: melee.wikitext

## Qué es

Tocar **MMB** (o mantener el botón de ataque) ejecuta un **Heavy Attack**; en el aire, un **Heavy
Slam**. Los dos escalan con el multiplicador de combo y **consumen** el contador, total o
parcialmente.

- **Se pueden ejecutar sin contador de combo.**
- Los heavy slam además dejan a los enemigos **`Lifted`**, y los mantienen suspendidos **más tiempo
  a mayor multiplicador**.

> La página lleva un `{{UpdateMe}}` propio sobre la distinción **First / Second Heavy Attack**: el
> segundo se ejecuta encadenando tras el primero, y **también** al hacer heavy attack deslizándose.

## El multiplicador es fijo por clase de arma

No es una propiedad del arma sino **de su clase**, y se compone **multiplicativamente** con el
combo:

```text
Daño del heavy = Daño normal moddeado × Multiplicador de clase × Multiplicador de combo
```

Ejemplo textual de la wiki — Staff con 400 de daño normal moddeado, a 3x de combo:
`400 × 5 × 3`, a cambio de dejar el contador en cero (sin mods de Combo Efficiency).

> **Combo Efficiency no baja el multiplicador de combo del heavy** — sólo cuánto contador consume.

| Clase | 1er heavy | 2º heavy (o deslizando) | Wind-up |
|---|---|---|---|
| Assault Saw | 6x | 6x | 1.0 s |
| Blade and Whip | 4x | 12x (4x × 3) | 0.4 s |
| Claws | 5x Slash | 5x Slash | 0.6 s |
| Dagger | 5x (2.5 Slash + 2.5) | ídem | 0.4 s |
| Dual Daggers | 5x (2.5 + 2.5, Slash) | ídem | 0.5 s |
| Dual Nikanas | 12x (2x × 3 + 6x) | 6x (1x + 2x + 3x) | 1.0 s |
| Dual Swords | 5x (2.5 + 2.5) | ídem | 0.7 s |
| Fist | 5x | 5x | 0.6 s |
| Glaive | 2x | 3x | 0.6 s |
| Gunblade | 5x | 5x | 0.4 s |
| Hammer | 6x | 6x | **1.2 s** |
| Heavy Blade | 6x | 6x | 1.1 s |
| Heavy Scythe | 6x (2x × 3) | 12x (6x × 2) | 1.0 s |
| Machete | 6x (1.5 Slash + 1.5 × 3) | 5x | 0.7 s |
| Nikana | 5x Slash | 5x Slash | 0.5 s |
| Nunchaku | 5x | 5x | 0.5 s |
| Polearm | 6x | 6x | 0.9 s |
| Rapier | 4.5x Slash | 4.5x Slash | 0.5 s |
| Scythe | 6x Slash | 6x Slash | 1.0 s |
| Sparring | 5x (+200% Impact) | 5x (1x × 5 hits) | 0.5 s |
| Staff | 5x | 5x | 0.5 s |
| Sword | 5x | 5x | 0.6 s |
| Sword and Shield | 5x | 5x | 0.7 s |
| Tonfa | 5x (2.5 + 2.5, Slash) | ídem | 0.7 s |
| Two-Handed Nikana | 6x Slash | 6x (3 + 3, Slash) | 0.7 s |
| Warfan | 5x (2.5 + 2.5, Slash) | 5x Slash | 0.5 s |
| Whip | 4.5x Slash | 4.5x Slash | 0.4 s |

Los wind-up de la tabla son **típicos de la clase**; la ficha del arma manda.

## Wind Up

> *"Time a Heavy Attack must charge up before it activates."*

El retardo entre activar el heavy y que el ataque ocurra. El Skana tarda **0.6 s**: el golpe sale
0.6 s después de tocar MMB.

Cuatro reglas que no son obvias:

- **La attack speed NO reduce el wind-up.** Lo que reduce es el **intervalo entre** heavy attacks.
  Son dos tiempos distintos y sólo uno responde a la velocidad de ataque.
- **Durante el wind-up el decay del combo está pausado**, y el jugador puede moverse y maniobrar —
  lo único que no puede es lanzar otro ataque de melee. **Un knockdown cancela la carga.**
- **Se puede hacer heavy attack con el contador en cero**, y conectar uno **no suma** combo.
- **Los heavy slam no tienen wind-up.**

### No hay cap, aunque el arsenal diga lo contrario

> *"There is no cap to Wind Up. Even if numbers stop changing in the arsenal after adding multiple
> Wind Up mods, this is due to **diminishing returns and the game's number rounding system**."*

Los números del arsenal se congelan por **rendimiento decreciente + redondeo**, no porque exista un
tope. La wiki apunta que se demuestra con un test de animación por FPS.

## Tennokai

Ciertos mods habilitan **Tennokai**: los golpes de melee tienen **15%** de probabilidad de mostrar
un ícono de espada en la retícula durante **2 segundos**. Ejecutar un Heavy Attack o Heavy Slam
durante ese destello **aumenta su Wind Up Speed y no consume el contador de combo**.

## Fuentes

- https://wiki.warframe.com/w/Melee
- [`melee-combo.md`](melee-combo.md) · [`status-effects.md`](status-effects.md) (`Lifted`)
