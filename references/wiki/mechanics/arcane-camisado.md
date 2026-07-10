# Arcane Camisado

> Estado: activo
> Rol: arcano warframe — stack de Ability Strength por ataque de minion invocado, consumido en el próximo cast
> Fuente de verdad de: tabla de escalado por rank, lista canónica de qué cuenta como "summoned minion"
> No usar para: modelado real (fuera de scope — depende de "minions", sistema no modelado hoy, ver OQ-ENGINE-17/sweep)
> Última actualización: 2026-07-09
> Fuente: https://wiki.warframe.com/w/Arcane_Camisado

## Qué es

**Efecto (Rank 5):** "Attacks from summoned minions increase Ability Strength by 6% up to 60% on
the next Ability Cast."

Cada ataque de un minion otorga un stack. A rank máximo (5), el cap es 10 stacks (6% × 10 = 60%).
El buff aplica **solo al próximo cast de habilidad**, y luego los stacks vuelven a cero.

**Bonus secundario:** los summons ganan 20% de velocidad de movimiento (solo a rank máximo).

## Escalado por rank

| Rank | Por ataque | Cap |
|---|---|---|
| 0 | 1% | 10% |
| 1 | 2% | 20% |
| 2 | 3% | 30% |
| 3 | 4% | 40% |
| 4 | 5% | 50% |
| 5 | 6% | 60% |

## Qué cuenta como "summoned minion" (lista canónica de la wiki)

**Cuentan:** Atlas Rumblers, Caliban Lethal Progeny, Chroma Effigy, Dante Paragrimms, Equinox
Duality, Inaros Swarm Kavats, Khora Venari, Loki Decoy, Nekros Shadows of the Dead, Nidus Maggots,
Oraxia Scuttlers, Titania Razorflies, Uriel Demons, Wukong Celestial Twin, Yareli Loyal Merulina.

**NO cuentan:** Ash Shadow Clones, Citrine Prismatic Gem, Dagath Cavalry, Dante Noctua, Excalibur
Umbra Passive, Hydroid Tentacles, Mirage Hall of Mirrors, Nekros Shadows... (nota: hay overlap
aparente con la lista "sí cuenta" — verificar en captura futura si hay revisión de wiki), Nyx Mind
Control, Octavia objects, Protea Artillery, Revenant Enthrall, Sevagoth shadows, Styanax specters,
Vauban turrets, Xaku The Lost.

## Interacciones específicas

- **Loki Decoy:** solo triggerea por daño cuerpo a cuerpo del decoy; "Damage Decoy mod does **not**
  increase stacks."
- **Caliban Conculysts:** el daño de Fusion Strike cuenta para stacks.
- **Caliban Summulyst:** los Choralysts que invoca también cuentan.

## Known issues (parcheados, referencia histórica)

- Fix: Nidus Ravenous Maggots no triggereaban (Update 39.0).
- Fix: problemas de performance client-side con Nekros Shadows (Hotfix 38.0.8).
- Fix: error de script a rank máximo (Hotfix 38.0.8).
- Clarificación de descripción: el buff resetea tras el cast (Hotfix 38.0.6).

## Sin documentar

No hay límite de duración documentado para los stacks antes del cast — persisten indefinidamente
hasta usarse una habilidad.

## Por qué está fuera de scope (nota de modelado)

Depende de un sistema de "minions/summons" que el engine no modela hoy — no es la fórmula lo que
bloquea (es simple, lineal con cap), es la ausencia del concepto "minion invocado ataca" como evento
observable. Diferido hasta que exista ese sustrato.

## Fuentes

- https://wiki.warframe.com/w/Arcane_Camisado
