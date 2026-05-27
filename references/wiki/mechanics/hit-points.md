# Hit Points

> Estado: activo
> Rol: modelo unificado de capas de HP y fórmulas de EHP para el engine v1
> Fuente de verdad de: jerarquía de daño (Overguard → Shield → Health), cálculo de EHP, bleedout
> No usar para: escalado de HP de enemigos o mecánicas de revivir detalladas
> Última actualización: 2026-05-26

## Orden de capas

```text
Overguard → Shield (+ Overshield) → Health
```

El daño se aplica a cada capa en orden. Una capa debe vaciarse completamente antes de que el daño pase a la siguiente (con excepciones de bypass como Toxin).

| Capa | Presente en | Bypass conocido |
|---|---|---|
| **Overguard** | Warframes con fuentes específicas; Eximus | Ninguno completo — Void +50% efectivo |
| **Overshield** | Encima de shields normales (cap 1200) | — |
| **Shield** | Todos los warframes excepto Inaros, Nidus | Toxin, True damage |
| **Health** | Todos los warframes y entidades | — |

## EHP — Effective Health Points

EHP mide cuánto daño bruto puede absorber una entidad antes de morir, considerando todas las mitigaciones.

### EHP con solo armor

```text
EHP_armor = Health × (Armor + 300) / 300
```

Ejemplo (Oberon R30, base 740 HP, 900 armor con mods):
```text
EHP = 740 × (900 + 300) / 300 = 740 × 4.0 = 2960
```

### EHP con shield + armor

```text
EHP_total = EHP_health + Shield × 2
```

El factor ×2 refleja la DR inherente del 50% de los shields (cada punto de shield absorbe efectivamente 2 de daño normal).

> Esta fórmula asume daño no elemental. Magnetic vs shields o Toxin bypass cambian el peso relativo de cada capa.

### EHP con DR adicional

Si hay fuentes de DR adicional (Adaptation, habilidades):

```text
EHP_total = Health / (1 − DR_armor) / (1 − DR_hab_1) / (1 − DR_hab_2) / ...
```

Donde `DR_armor = Armor / (Armor + 300)`. Ver `damage-reduction.md` para stacking completo.

## Bleedout

Al llegar a 0 Health el warframe entra en **bleedout**:

- **Duración**: 20 segundos para ser revivido por un compañero
- **Durante bleedout**: el warframe puede arrastrarse y usar algunas habilidades (Inaros resucita solo)
- **Al expirar**: instakill — requiere revivir con token o un compañero cerca
- **Daño en bleedout**: el warframe continúa recibiendo daño — puede morir antes de los 20s

| Warframe / mecánica | Excepción |
|---|---|
| Inaros — Undying | Consume Scarab Armor para auto-resucitar |
| Revenant — Mesmer Skin | Puede bloquear bleedout en algunas circunstancias |
| Nidus — Undying | Consume Mutation Stacks para auto-resucitar |

## Interacciones entre capas

| Mecánica | Comportamiento |
|---|---|
| **Toxin** | Bypasa shields → daña salud directamente; no afecta Overguard |
| **Magnetic** | Drena shields; stacks especiales vs Overguard (hasta 325%) |
| **Viral** | Reduce max health temporalmente — afecta el pool de HP base |
| **Shield Gate** | 0.33s mínimo de invulnerabilidad al romper shields |
| **Overguard gate** | 0.5s de invulnerabilidad al agotar Overguard |
| **Overshield cap** | 1200 independientemente del max shield del warframe |

## Referencia de atributos del engine

| Stat | Token D-6 relevante |
|---|---|
| Max Health | `AVATAR_ADD_HEALTH_MAX` (%), `AVATAR_FLAT_HEALTH_MAX` (plano) |
| Max Shield | `AVATAR_ADD_SHIELD_MAX` (%), `AVATAR_FLAT_SHIELD_MAX` (plano) |
| Health Regen | `AVATAR_FLAT_HEALTH_REGEN` (HP/s plano) |
| Shield Recharge | `AVATAR_ADD_SHIELD_RECHARGE_RATE` (%) |
| Armor (afecta EHP) | `AVATAR_ADD_ARMOUR` (%), `AVATAR_FLAT_ARMOUR` (plano) |

## Fuentes

- https://wiki.warframe.com/w/Hit_Points
- https://wiki.warframe.com/w/Health
- https://wiki.warframe.com/w/Shield
- https://wiki.warframe.com/w/Overguard
- `references/wiki/mechanics/health.md`
- `references/wiki/mechanics/shield.md`
- `references/wiki/mechanics/overguard.md`
- `references/wiki/mechanics/armor.md`
- `references/wiki/mechanics/damage-reduction.md`
