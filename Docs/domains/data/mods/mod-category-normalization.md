---
Estado: "activo"
Rol: "Documentar la normalización de mod.type hacia ModCategory"
Version: "v0.0.2"
Impacto_ID: "D-Mods-Taxonomy"
Fidelidad_Fisica: "Project/src/lib/types/mod.ts"
Fecha_de_creacion: "2026-03-21"
Fecha_de_actualizacion: "2026-04-19"
---

# Mod Category Normalization

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

