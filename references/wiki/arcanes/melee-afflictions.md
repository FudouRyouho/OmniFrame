# Melee Afflictions

> Estado: activo
> Rol: arcano melee — añade stacks a los status ya presentes en enemigos derribados o lanzados por ataques melee
> Fuente de verdad de: stacks por rank, cálculo del daño de Affliction, tabla de estados que permiten el trigger, exclusiones por tipo elemental
> No usar para: catálogo de stances que fuerzan Ragdoll
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Melee_Afflictions
> Fuente actualizada: 2026-06-21
> Raw: melee-afflictions.wikitext

> ⚠️ **La wiki marca esta página con `{{UpdateMe}}`** — se declara desactualizada a sí misma. Todo
> lo de abajo es lo que dice hoy, pero es el documento con menos garantía de los arcanos melee.

## Qué es

Cuando un enemigo que ya tiene **Status Effects** es **derribado o lanzado por un ataque melee**,
gana **stacks adicionales** de esos mismos status.

| Rank | Stacks adicionales |
|---|---|
| 0 | 1 |
| 1 | 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | **6** |

Los status **de cualquier fuente** cuentan, incluidos los aplicados por el mismo ataque que disparó
el arcano.

## Cálculo del daño

Para los status que hacen daño, cada stack agregado se calcula en cuatro pasos.

**1 — Daño base modded de cada proc individual**

```
Proc MBD = Weapon Base Damage
         × (1 + Weapon Base Damage Bonus)
         × (1 + Weapon Faction Damage Bonus)
         × (1 + Weapon Status Damage Bonus)
         × (Additional Multipliers)
```

*Additional Multipliers* incluye el multiplicador de crítico modded en un crítico y los
multiplicadores por parte del cuerpo del enemigo; **entre sí son multiplicativos**.

**Los bonus de facción se aplican una sola vez, desde el arma que originó el status: el "double dip"
no se cuenta acá.**

**2 — Promedio por tipo de status**

```
Status Effect Average Damage = Σ(Proc MBD del tipo) ÷ (cantidad de procs de ese tipo)
```

**3 — Affliction Damage Hit** — la instancia de daño que causa el arcano:

```
Affliction Damage Hit = ( promedio de Slash
                        + promedio de Heat
                        + promedio de Toxin
                        + promedio de Electricity
                        + promedio de Gas )
                      × (1 + Melee Faction Bonuses)
```

**4 — Daño por tick de los status generados**

```
Affliction Damage Tick = Affliction Damage
                       × Status Effect Multiplier
                       × (1 + Melee Faction Damage Bonus)
                       × (1 + Melee Status Damage Bonus)
                       × (1 + Elemental on Melee of Status Effect, donde aplique)
```

### Qué elementos se benefician de los mods elementales

- **Toxin y Electricity:** son los **únicos** que aprovechan los bonus de daño elemental.
- **Heat:** **no** aprovecha bonus elementales ni de facción del arma melee, **salvo** que el melee
  haya sido la fuente del primer proc de Heat en ese enemigo (*Heat Inherit*).
- **Blast: sí usa** el Affliction Damage para calcular el daño de los procs nuevos que agrega.
  > ⚠️ Punto frágil. La oración del raw está gramaticalmente rota (*"does use Affliction Damage to
  > calculated the damage of new status procs are added by"*), y el historial de parches registra en
  > la versión 43 que *"las instancias de Blast agregadas por Melee Afflictions, cuando no hay otras
  > instancias de status dañino presentes, ahora hacen el daño previsto"* — con la propia wiki
  > anotando que **no está confirmado** que ese sea el parche donde se arregló. Es decir: el
  > comportamiento cambió hace poco y la redacción actual no es confiable como cita literal.

## Qué estado del enemigo permite el trigger

Un proc de Knockdown, Lifted o Ragdoll **no siempre** dispara el arcano: depende del estado en que
esté el enemigo. Tabla vigente según la wiki **a la versión 39**, con datos tomados de
[jWFlab](https://jwflab.com/en/melee-afflictions-enemy-state/).

| Estado del enemigo | Knockdown | Ragdoll | Lifted |
|---|---|---|---|
| Overguard | ❌ | ❌ | ❌ |
| Cold freeze | ❌ ⁽¹⁾ | ✔️ | ❌ |
| Heat panic | ✔️ | ✔️ | ✔️ |
| Electricity stun | ✔️ | ✔️ | ✔️ |
| Impact stagger | ✔️ | ✔️ | ✔️ |
| Knockdown | ✔️ | ✔️ | ✔️ |
| Ragdoll | ✔️ | ✔️ | ✔️ |
| Lifted | ✔️ | ✔️ | ✔️ |
| Petrify (Atlas) | ❌ | **✔️** | ❌ |
| Crystallize (Citrine) | ❌ | ❌ | ❌ |
| Blood Altar (Garuda) | ❌ | ❌ | ❌ |
| Condemn (Harrow) | ❌ | ❌ | ❌ |
| Ensnare (Khora) | ✔️ | ✔️ | ✔️ |
| Stasis (Limbo) | ❌ | ❌ | ❌ |
| Divine Spears (Nezha) | ✔️ | ✔️ | ✔️ |
| Larva (Nidus) | ✔️ | ✔️ | ✔️ |
| Rhino Stomp | ✔️ | ✔️ | ✔️ |
| Well of Life (Trinity) | ❌ | ❌ | ❌ |
| Bastille Vortex (Vauban) | ✔️ | ✔️ | ✔️ |

⁽¹⁾ **Slash Dash** puede derribar objetivos congelados y aun así disparar el arcano.

## Con armas exaltadas

- **Stackea** con Arcane Impetus y Arcane Ice Storm.
- **Dispara** Archon Vitality — pero Vitality **no duplica**: suma un solo stack extra (de +6 a +7).
- **Dispara** Archon Continuity en objetivos con Toxin (resulta en **1** stack de Corrosive).
- **Dispara** Archon Stretch en objetivos con Electricity.
- **No dispara** Archon Flow acumulando Cold.

## Notas de uso

- Los bonus de **facción** y de **status damage** aumentan mucho el daño del arcano, y **escalan
  exponencialmente — probablemente un bug** (la wiki lo consigna así, sin confirmar).
- Las **stances que fuerzan Ragdoll** son las más eficientes: el Ragdoll ignora la mayoría de los
  estados que bloquean el trigger.
- **Slams y heavy slams** son excelentes para forzar Lifted o Knockdown.
- **Gas** escala muy bien: está capado a **10 stacks** y los procs nuevos reemplazan a los viejos,
  así que siempre quedan los 10 más fuertes.
- **Blast** conviene para instancias grandes de daño una vez que los DoT acumularon.
- **Heat** sirve para componer daño por Heat Inherit. Los elementales combinados del melee
  (Magnetic, Corrosive, Viral) igual aportan bonus a Toxin y Electricity; para que aporten a Heat,
  el Heat tiene que venir del arma — con Incarnons u otras armas de Heat forzado, los combinados
  (Gas, Blast, Radiation) sí bonifican el Heat.

## Bugs conocidos

- Los procs de **Lifted** agregan **12** stacks en vez de 6.

## Adquisición

De la **Sister of Parvos** opcional de Ascension (invocada juntando 3 Sister Beacons durante el
ascensor), o comprándolo a **Ordis** en el Drifter's Camp por 10 Vestigial Motes — 210 en total para
rango máximo.

## Fuentes

- https://wiki.warframe.com/w/Melee_Afflictions
- https://jwflab.com/en/melee-afflictions-enemy-state/ (tabla de estados, citada por la wiki)
