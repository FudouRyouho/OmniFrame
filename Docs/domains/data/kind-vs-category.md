---
Estado: "activo"
Rol: "Documentar la frontera top-level entre kind canónico y category raw"
Version: "v0.0.2"
Impacto_ID: "D-Taxonomy"
Fidelidad_Fisica: "Project/src/lib/types/base.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
---

# Kind vs Category — Taxonomía

## Regla

- `category` pertenece a la capa de raw source semantics: preserva el valor que llega de `warframe-items`
- `kind` pertenece a la capa de canonical internal semantics: nace de una normalizacion determinista sobre la fuente
- `kind` (campo de `BaseItem`) es la categoria normalizada, lowercase, sin guiones
- `kind` es el discriminante del union type — se usa para filtrado, type guards y logica
- `category` existe para trazabilidad y debugging, no para logica de negocio
- este documento cubre solo el top-level; la taxonomia inferior (`family`, `variant`, compatibilidades) se resuelve aparte

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
  — se identifican por `uniqueName` via `NECRAMECH_UNIQUE` en `generate-data.ts`
- Pets y Sentinels comparten `kind: 'companion'` — se distinguen por `category` raw o por la taxonomia inferior que se derive despues, no por buckets de UI
- Arch-Gun y Arch-Melee comparten el loader `fetchArchwingWeapons()` — se separan por `kind` en `use-items.ts`
