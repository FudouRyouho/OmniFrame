# Molecular Prime — Nova (habilidad 4)

> Estado: activo
> Rol: habilidad 4 de Nova — **dos casteos** sobre una onda expansiva: tap ralentiza, hold acelera; en ambos casos deja a los enemigos con **+100% de vulnerabilidad al daño** y detonando al morir
> Fuente de verdad de: que el modo lo elige el casteo (tap/hold) · los valores por rank y los dos caps · **que la vulnerabilidad al daño es +100% fijo, sin escalar con Strength** · la fórmula del radio de onda y su velocidad de propagación · que la explosión cuenta como **hit de arma** y hereda rasgos del arma que dio el golpe mortal
> No usar para: los stats base de Nova · el resto de sus habilidades · la ley de damage falloff (ver [`../../mechanics/damage-falloff.md`](../../mechanics/damage-falloff.md))
> Última actualización: 2026-08-01
> Fuente: https://wiki.warframe.com/w/Molecular_Prime
> Fuente actualizada: 2026-07-27
> Raw: molecular-prime.wikitext

## Qué es

Nova gasta **100 de energía** y suelta una onda de antimateria que **arranca a 5 m** y se propaga a
**5 m/s** durante **2 / 3 / 4 / 6 s**. Los enemigos alcanzados quedan *primed* por
**10 / 15 / 20 / 30 s**.

```
Radio de la onda = 5 + (5 × (Duración de onda × Ability Duration))
```

Pueden coexistir **5 ondas** como máximo; recastear elimina la más vieja. Si Nova muere o deja la
misión, los enemigos pierden el estado al instante.

## Los dos casteos

| Casteo | Qué hace |
|---|---|
| **Tap** | onda de **Slow** |
| **Hold** | onda de **Speed-Up** |

En ambos casos el enemigo *primed* recibe:

| Efecto | Valor (rank 0 → 3) | Escala con |
|---|---|---|
| Velocidad de acción (± según el casteo) | 35% / 40% / 45% / **50%** | Ability Strength — **cap 75%**, alcanzable con 150% de Strength |
| **Damage Vulnerability** | **+100%** | **no escala** — es fijo |
| Detonación al morir (**Blast**, 20% de status) | 150 / 300 / 500 / **800** en 6 / 7 / 8 / 10 m | Ability Strength |

La explosión tiene **60% de damage falloff lineal**, y puede encadenarse: cada muerte detona a los
vecinos. **No stackea entre varias Novas.**

## La explosión cuenta como hit de arma

Esta es la parte que la separa de cualquier otro debuff: **la detonación se computa como un impacto del
arma que dio el golpe mortal**, y por eso hereda sus rasgos, propagándolos por toda la cadena:

- **Faction damage** del arma que mató aplica a la explosión.
- Los mods elementalistas aplican a sus procs de Blast.
- Matar con melee permite que la explosión sea **Stealth Hit** (+700%).
- Dispara arcanos de arma: *Melee Influence* en kill melee, *Secondary Fortifier* contra overguard,
  *Secondary Encumber* (24% de status extra), y acumula *Merciless*, *Dexterity* y *Deadhead*.
- Matar con *Toxic Lash*, *Xata's Whisper*, *Demonium*, *Resupply* o *Silken Stride* activos agrega
  **otra instancia de daño**.

## Sinergia con la pasiva

Los enemigos que Nova mata **ralentizados** tienen **15%** de chance de soltar un orbe de salud; los
que mata **acelerados**, 15% de soltar uno de energía.
