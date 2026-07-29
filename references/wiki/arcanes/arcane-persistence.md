# Arcane Persistence

> Estado: activo
> Rol: arcano warframe — remueve todos los shields y, con Armor ≥ 700, capea el daño recibido por segundo
> Fuente de verdad de: cap por rank, umbral de armor y qué lo baja, efectos que desactivan el arcano
> No usar para: interacción con múltiples hits por segundo bajo Overguard (la wiki sólo describe el primer hit)
> Última actualización: 2026-07-29
> Fuente: https://wiki.warframe.com/w/Arcane_Persistence
> Raw: arcane-persistence.wikitext

## Qué es

Remueve **todos los shields** del warframe y, mientras el **Armor esté en 700 o más**, capea el daño
que se puede recibir **por segundo**.

## Cap por rank

| Rank | Daño/s máximo |
|---|---|
| 0 | 750 |
| 1 | 700 |
| 2 | 650 |
| 3 | 600 |
| 4 | 550 |
| 5 | **500** |

## El umbral de armor

La descripción dice *"if Armor is above 700"*, pero la wiki aclara que **funciona con exactamente
700**: el umbral es `≥ 700`, no `> 700`.

El efecto **se pierde si el armor cae por debajo** de ese valor, típicamente por status. Cuánto
armor hace falta para aguantar cada caso:

| Status | Reducción | Armor mínimo para no caer |
|---|---|---|
| Corrosive | −26% | 946 |
| Heat | −50% | 1400 |
| Ambos juntos | −63% | 1892 |

## Qué lo desactiva

- Recibir un status **Magnetic**.
- Estar dentro de un **campo de nulificación de habilidades** (Nullifier Crewman y similares).

## Otras interacciones

- **No funciona sobre daño autoinfligido**: el drenaje de vida de Bloodletting (Garuda) no se reduce.
- **Hijack** pasa a drenar **health** en vez de shields, ya que estos no existen.
- **Perjudicial en Archwing**: ningún Archwing alcanza los 700 de armor, así que el arcano quita los
  shields sin dar nada a cambio.

## Bugs conocidos

> Clasificados como **bugs** por la wiki, no como comportamiento diseñado.

- **Overguard:** funciona con Overguard de cualquier fuente, pero **sólo capea el primer hit de cada
  segundo** a 500. Eso lo vuelve inviable como herramienta de supervivencia para frames que dependen
  de shields u overguard — el caso que la wiki nombra es Styanax con el augment Intrepid Stand.
- **Quick Thinking / Gladiator Finesse:** funciona con ambos, pero capea **cada hit** a 500, no el
  daño por segundo.

## Cómo llegar al umbral

- **Health Conversion** permite a cualquier warframe alcanzar los 700 de armor.
- **4× Azure Archon Shard** dan +600; **3× Tauforged Azure** dan +675.
- Comparación de la wiki: **Arcane Grace** necesitaría 8.334 de health para sostener 500 health/s, y
  eso asumiendo 100% de uptime, lo cual es irreal.
- **Inaros** lo mantiene activo con facilidad curándose con Sandstorm y ganando armor e inmunidad a
  status con Scarab Shell.
- **Nidus** se beneficia mucho, sobre todo con Parasitic Vitality: con Ravenous supera los 500
  daño/s de curación, y **Parasitic Link** redirige los status negativos al enemigo objetivo, lo que
  evita que el arcano se desactive.

## Adquisición

Se compra a **Roathe** en La Cathédrale (Sanctum Anatomica) por 5 Maphica. También aparece como
recompensa rotativa semanal de The Descendia en Steel Path: Infernum 6 y 13 dan 1, Infernum 20 da 3.

## Fuentes

- https://wiki.warframe.com/w/Arcane_Persistence
