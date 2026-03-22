# Mod Category Normalization

> Estado: activo
> Rol: documentar la normalizacion de `mod.type` hacia `ModCategory`
> Fuente de verdad de: criterio estable de categorias de mods
> No usar para: filtrado runtime detallado
> Ultima actualizacion: 2026-03-21

## Regla

`mod.type` de la fuente se colapsa a una categoria mas estable para consumo interno.

## Casos representativos

| `mod.type` | `ModCategory` |
|---|---|
| `Warframe Mod` | `warframe` |
| `Primary Mod`, `Shotgun Mod` | `primary` |
| `Secondary Mod` | `secondary` |
| `Melee Mod`, `Stance Mod` | `melee` |
| `Companion Mod`, `Posture Mod` | `companion` |
| `Arch-Gun Mod` | `archgun` |
| `Arch-Melee Mod` | `archmelee` |
| `Archwing Mod` | `archwing` |
| `Focus Way` | `focus` |
| `Plexus Mod`, `Railjack Mod` | `railjack` |
| `Necramech Mod` | `necramech` |
| `K-Drive Mod` | `kdrive` |
| `Parazon Mod` | `parazon` |
| `* Riven Mod` | `riven` |

## Nota

La exclusión o tratamiento especial de subcategorias puede seguir ocurriendo en runtime.

