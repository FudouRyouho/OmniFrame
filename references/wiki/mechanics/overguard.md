# Overguard

> Estado: activo
> Rol: mecánica de Overguard — capa pre-shield independiente
> Fuente de verdad de: comportamiento de Overguard (daño, CC, tipos efectivos), orden de capas
> No usar para: simulación de generación de Overguard por habilidad o escalado de Eximus en alta dificultad
> Última actualización: 2026-06-10

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

Los valores exactos de escalado de Eximus pertenecen al sistema de enemigos, fuera del alcance de
esta página.

## Modificación de Overguard

El Overguard **no tiene mods de modificación estáticos** — todas sus fuentes son habilidades o
mecánicas que lo generan dinámicamente. No existe un equivalente a los mods de max shield para
Overguard.

## Fuentes

- https://wiki.warframe.com/w/Overguard
- [`shield.md`](shield.md) · [`hit-points.md`](hit-points.md)
