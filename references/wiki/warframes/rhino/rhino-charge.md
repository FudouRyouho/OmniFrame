# Rhino Charge — Rhino (habilidad 1)

> Última actualización: 2026-07-24
> Fuente: https://wiki.warframe.com/w/Rhino_Charge
> Fuente actualizada: 2026-07-10
> Raw: rhino-charge.wikitext

## Qué es

Rhino embiste en línea recta, dañando (Impact) y ragdolleando enemigos en un radio de impacto.
Rhino es inmune a daño a la Salud mientras dura el dash (no es invulnerabilidad total: Overguard/
Shield normal siguen aplicando si algo los alcanza fuera de la mecánica del dash).

## Valores por rank

| Rank | 0 | 1 | 2 | 3 (max) |
|---|---|---|---|---|
| Impact damage | 150 | 250 | 450 | **650** |
| Charge range | 6m | 8m | 10m | **12m** |
| Impact radius | 1.5m | 1.6m | 1.8m | **2m** |

- **Energía:** 25 (`× Efficiency`). **Combo window:** 1s (`× Duration`).
- **Dash speed = 40/42/44/48 m/s por rank — NO escala con ningún mod.** La wiki lo dice explícito:
  *"Dash speed is not able to be modified"*. Confirmado consistente con `Rhino.md` (línea `Speed:
  48m/s`, sin modificador).

## Recast dentro del combo window (NO modelado)

Recastear dentro de la ventana de 1s multiplica daño ×2 (o ×4 en el tercer cast+) y range ×1.25
(×1.5), y reduce el costo de energía 50%/75%. Es un mecanismo de **combo con estado entre casts**
(cuenta de casts consecutivos + ventana de tiempo) — misma familia que el combo de melee
(`melee-combo.md`), pero para una ability, no un arma. No hay consumidor hoy; anotado para no asumir
que Charge es una ability "simple" de un solo cast.

## Sinergias (no modeladas, cross-ability)

- Con Iron Skin activo: el daño de Charge tiene 100% status chance de Blast.
- Contra enemigos afectados por Rhino Stomp: +100% daño.
- Ironclad Charge (augment): bonus de armadura temporal que, si se cronometra con el cast de Iron
  Skin, alimenta el Armor Multiplier de Iron Skin (ver `../Iron-Skin/Iron-Skin.md`).

## Fuentes

- https://wiki.warframe.com/w/Rhino_Charge
