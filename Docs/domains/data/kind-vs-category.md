# Kind vs Category

> Estado: activo
> Rol: documentar la convencion de normalizacion de categorias en el sistema de tipos
> Fuente de verdad de: diferencia entre `kind` (normalizado) y `category` (raw de la fuente)
> No usar para: backlog de gaps o decisiones de UI
> Depende de: `ssot.md`
> Ultima actualizacion: 2026-03-24

## Regla

- `kind` (campo de `BaseItem`) es la categoria normalizada, lowercase, sin guiones
- `kind` es el discriminante del union type — se usa para filtrado, type guards y logica
- `category` (campo de tipos especificos) preserva el valor raw de `warframe-items`
- `category` existe para trazabilidad y debugging, no para logica de negocio

## Tabla de normalizacion

| Fuente (`warframe-items`) | `category` (raw) | `kind` (normalizado) |
|---------------------------|------------------|----------------------|
| Warframes.json | `'Warframes'` | `'warframe'` |
| Primary.json | `'Primary'` | `'primary'` |
| Secondary.json | `'Secondary'` | `'secondary'` |
| Melee.json | `'Melee'` | `'melee'` |
| Mods.json | `'Mods'` | `'mod'` |
| Arcanes.json | `'Arcanes'` | `'arcane'` |
| Pets.json | `'Pets'` | `'companion'` |
| Sentinels.json | `'Sentinels'` | `'companion'` |
| Arch-Gun.json | `'Arch-Gun'` | `'archgun'` |
| Arch-Melee.json | `'Arch-Melee'` | `'archmelee'` |
| Warframes.json (Necramechs) | `'Warframes'` | `'necramech'` |
| Archwing.json | `'Archwing'` | `'archwing'` |

## Casos especiales

- Necramechs tienen `category: 'Warframes'` en la fuente pero `kind: 'necramech'` en el sistema
  — se identifican por `uniqueName` via `NECRAMECH_UNIQUE` en `generate-data.mjs`
- Pets y Sentinels comparten `kind: 'companion'` — se distinguen por `category` si hace falta
- Arch-Gun y Arch-Melee comparten el loader `fetchArchwingWeapons()` — se separan por `kind` en `use-items.ts`
