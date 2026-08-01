# Paralysis — Valkyr (habilidad 3)

> Estado: activo
> Rol: habilidad 3 de Valkyr — onda de área que daña, **ralentiza** y aplica **vulnerabilidad al daño melee**
> Fuente de verdad de: que el slow y la vulnerabilidad melee salen de **esta** habilidad y no de *Warcry* · sus valores por rank y el cap del slow · que el stun de 3 s no escala con Duration y habilita finishers · que el stun **no** se aplica si ya hay otro stun similar · que la línea de vista se mide desde la cámara
> No usar para: los stats base de Valkyr · *Warcry* (ver [`warcry.md`](warcry.md)) ni su pasiva (ver [`passive.md`](passive.md)) · la ley de los multiplicadores de sigilo
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Paralysis
> Fuente actualizada: 2026-07-12
> Raw: paralysis.wikitext

## Qué es

Valkyr gasta **25 de energía** y libera una onda en **5 / 7 / 8 / 10 m** que alcanza a los enemigos en
**línea de vista directa** durante **15 s**.

| Efecto | Valor (rank 0 → 3) | Escala con |
|---|---|---|
| Daño **Impact** | 100 / 200 / 300 / **400** | Ability Strength |
| **Slow** | 15% / 20% / 25% / **30%** | Ability Strength |
| **Melee Damage Vulnerability** | 20% / 30% / 40% / **50%** | Ability Strength |

El **slow topa en 75%**. La duración de 15 s escala con Ability Duration.

## El stun y los finishers

Los enemigos alcanzados quedan **stuneados 3 segundos** —un valor fijo, **no** afectado por Ability
Duration— y eso los deja abiertos a **finishers**.

- Si el enemigo **ya está bajo un stun equivalente** (el pánico de Heat, el stun de Electricity, estar
  congelado por Cold), **este efecto no se dispara** y el objetivo **no** queda abierto a finisher.
- Si no se le puede hacer finisher —por posición o por tipo de enemigo—, durante el stun queda expuesto
  a los **multiplicadores de sigilo** del melee. Como en cualquier ataque sigiloso, el contacto físico
  con el enemigo mientras se lo golpea quita temporalmente el bonus.

## Línea de vista

**Se mide desde la posición de la cámara, no desde la de Valkyr.** Destruir objetos del escenario no
requiere línea de vista.

## Sinergia

Paralysis habilita finishers, que es **la mayor fuente de Rage** de su pasiva
([`passive.md`](passive.md)): 27% por finisher contra 3% por golpe melee.

Su comportamiento se parece al *Sonic Boom* de Banshee —una onda con fuerte knockback—, pero cubre los
360° con la mitad del alcance.
