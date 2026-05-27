# Overguard

> Estado: activo
> Rol: mecánica de Overguard — capa pre-shield independiente para el engine v1
> Fuente de verdad de: comportamiento de Overguard (daño, CC, tipos efectivos), orden de capas
> No usar para: simulación de generación de Overguard por habilidad o escalado de Eximus en alta dificultad
> Última actualización: 2026-05-26

## Qué es Overguard

Overguard es una **capa de HP independiente** que se sitúa por delante de Shields y Health en la jerarquía de daño. No es un shield — tiene sus propias reglas de interacción elemental.

```text
Orden de daño: Overguard → Shield → Health
```

> Overguard y Shield no coexisten en el mismo layer — el daño siempre drena Overguard primero.

## Propiedades clave

### CC immunity

Mientras el objetivo tiene Overguard activo:

- **Inmune a todos los efectos de control de masas** (CC) — stuns, knockdowns, sleep, etc.
- Las habilidades de CC que normalmente interrumpirían al enemigo no tienen efecto
- Esta inmunidad **desaparece** cuando el Overguard llega a 0

### Gate de invulnerabilidad al agotar

Al llegar a 0 Overguard:

- El objetivo recibe **0.5 segundos de invulnerabilidad** antes de que el daño restante pase a la siguiente capa (Shields o Health)
- Similar al Shield Gate pero para la capa de Overguard

## Interacciones elementales

| Tipo de daño | Efectividad vs Overguard |
|---|---|
| **Void** | +50% — daño efectivo amplificado |
| **Magnetic** | Stacks especiales — ver abajo |
| Físico / demás elementales | Normal (×1.0) |

### Magnetic y Overguard

El status Magnetic tiene un comportamiento especial contra Overguard:

- **Stacks acumulativos** de reducción de Overguard
- Hasta un máximo de **325% de daño** acumulado en stacks
- Cada stack de Magnetic amplifica el daño total recibido por el Overguard del objetivo

> Este es el único tipo de daño/status con un sistema de stacking propio contra Overguard.

## Overguard de jugador

Algunos warframes o mecánicas dan Overguard a los jugadores:

| Fuente | Notas |
|---|---|
| Kullervo — Wrathful Advance | Genera Overguard con uso de habilidades |
| Jade — habilidades | Genera Overguard bajo condiciones |
| Archon Shards + mecánicas específicas | — |

El Overguard de jugador sigue las mismas reglas — absorbe daño antes que shields, otorga inmunidad a CC mientras dure.

## Overguard de enemigos (Eximus)

Los Eximus tienen Overguard que escala con el nivel del enemigo:

```text
OG_enemy = OG_base × (1 + (Level - Level_base) × factor)
```

Los valores exactos de escalado de Eximus están fuera del scope del engine v1 — pertenecen al sistema de enemigos, no al de warframes.

## Mapeo a tokens D-6

El Overguard no tiene tokens de modificación estáticos en el vocabulario actual — todas sus fuentes son habilidades o mecánicas de trigger. No hay equivalente a `AVATAR_ADD_SHIELD_MAX` para Overguard en v1.

| Stat | Estado |
|---|---|
| Max Overguard | No modelado — generado por habilidades (fuera de scope v1) |
| Overguard Void bonus | No modelado — interacción elemental contra layer |
| Magnetic stacking vs OG | No modelado — pertenece a `GameLaws` |

## Fuentes

- https://wiki.warframe.com/w/Overguard
- `references/wiki/mechanics/shield.md`
- `references/wiki/mechanics/hit-points.md`
