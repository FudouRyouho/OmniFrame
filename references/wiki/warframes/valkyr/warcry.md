# Warcry — Valkyr (habilidad 2)

> Estado: activo
> Rol: habilidad 2 de Valkyr — aura en Affinity Range que da Attack Speed y Armor a ella y a sus aliados
> Fuente de verdad de: los valores por rank de ambos buffs · **dónde compone cada uno** (attack speed aditivo a los mods; armor sobre la armadura **base** de quien lo recibe) y sus dos fórmulas con ejemplo · a qué entidades alcanza · qué lo disipa y qué se recupera · las dos sinergias (Hysteria ×3, carga de Rage) · el valor reducido al subsumirla
> No usar para: los stats base de Valkyr · su pasiva (ver [`passive.md`](passive.md)) · *Hysteria* ni el resto de sus habilidades · las reglas generales de armadura (ver [`../../mechanics/armor.md`](../../mechanics/armor.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Warcry
> Fuente actualizada: 2026-07-10
> Raw: warcry.wikitext

## Qué es

Valkyr gasta **75 de energía** y genera un aura dentro del **Affinity Range** que la refuerza a ella y
a sus aliados durante **10 / 14 / 17 / 20 s**.

| Stat | 0 | 1 | 2 | 3 (max) | Escala con |
|---|---|---|---|---|---|
| Attack Speed (melee) | 15% | 20% | 25% | **50%** | Ability Strength |
| Armor | 25% | 35% | 45% | **50%** | Ability Strength |

La duración escala con Ability Duration. **No tiene stat de rango**: el alcance es el Affinity Range.

## Dónde compone cada buff

**Attack Speed — aditivo a los mods** (*Fury* y compañía):

```
Attack Speed Mods + Warcry × (1 + Strength Mods)
```

Ejemplo de la fuente, con *Fury* al máximo, *Intensify* y Warcry a rank 3:
`0.3 + 0.5 × (1 + 0.3)` = **95%**.

**Armor — sobre la armadura *base* del warframe que lo recibe**, y por eso **stackea aditivamente**
con los demás bonus de armadura:

```
Armadura Base × (1 + Armor Mods + Warcry × (1 + Strength Mods))
```

Ejemplo de la fuente, Valkyr con *Steel Fiber* al máximo y 130% de Ability Strength:
`855 × (1 + 1 + 0.5 × (1 + 0.3))`.

## A quién alcanza

Otros **Warframes**, **compañeros**, **rehenes** de Rescue, **objetivos de Defense**, **Shadows** de
*Shadows Of The Dead* y **Specters**.

**Qué lo quita y qué se recupera:** si un aliado pierde Warcry —por muerte o por un nullifier— lo
**vuelve a ganar** al re-entrar al Affinity Range de Valkyr. Pero si es **Valkyr** quien entra a un
campo nullifier o cae fuera de los límites, Warcry **se disipa de todo el escuadrón**.

## Sinergias

- Con **Hysteria activa**, el bonus de armadura de Warcry se multiplica **×3**.
- El bonus de attack speed **acelera la carga de Rage** ([`passive.md`](passive.md)), lo que facilita
  volver al umbral de death-gate mientras Valkyr sigue invulnerable tras un golpe mortal.

## Helminth

Warcry es **subsumible**. Al usarla desde el Helminth en otro warframe, el bonus de attack speed baja
a **9% / 12% / 15% / 30%**; el de armadura no cambia.

Su augment es *Eternal War*.
