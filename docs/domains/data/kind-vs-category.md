---
Estado: "activo"
Rol: "Documentar la frontera top-level entre kind canónico y category raw"
Version: "v0.0.3"
Impacto_ID: "D-Taxonomy"
Fidelidad_Fisica: "Project/scripts/normalization/entities.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-23"
---

# Kind vs Category — Taxonomía

## Regla

- `category` pertenece a la capa de raw source semantics: preserva el valor que llega de `warframe-items`
- `kind` pertenece a la capa de canonical internal semantics: nace de una normalizacion determinista sobre la fuente
- `kind` (campo de `BaseItem`) es la categoria normalizada, lowercase, sin guiones
- `kind` es el discriminante del union type — se usa para filtrado, type guards y logica
- `category` existe para trazabilidad y debugging, no para logica de negocio
- este documento cubre solo el top-level; la taxonomia inferior (`family`, `variant`, compatibilidades) se resuelve aparte

## Tabla de normalización (Modelo de 4 Pilares)

| Fuente (`warframe-items`) | `category` (raw) | `domain` (canónico) | `kind` (normalizado) |
|---------------------------|------------------|---------------------|----------------------|
| Warframes.json | `'Warframes'` | `'warframe'` | `'warframe'` |
| Primary.json | `'Primary'` | `'weapon'` | `'primary'` |
| Secondary.json | `'Secondary'` | `'weapon'` | `'secondary'` |
| Melee.json | `'Melee'` | `'weapon'` | `'melee'` |
| Mods.json | `'Mods'` | `'mod'` | `'mod'` |
| Arcanes.json | `'Arcanes'` | `'arcane'` | `'arcane'` |
| Pets.json | `'Pets'` | `'companion'` | `'pet'` |
| Sentinels.json | `'Sentinels'` | `'companion'` | `'sentinel'` |
| Arch-Gun.json | `'Arch-Gun'` | `'weapon'` | `'archgun'` |
| Arch-Melee.json | `'Arch-Melee'` | `'weapon'` | `'archmelee'` |
| Warframes.json (Necramechs) | `'Warframes'` | `'vehicle'` | `'necramech'` |
| Archwing.json | `'Archwing'` | `'vehicle'` | `'archwing'` |

## Casos especiales (Actualizado 2026-04-22)

- **Necramechs**: Se identifican prioritariamente por `productCategory: 'MechSuits'` (aunque la `category` sea `'Warframes'`). Se asignan al domain `'vehicle'` y kind `'necramech'`.
- **Moas y Hounds**: Digital Extremes los exporta como `'Pistols'` en `productCategory`. OmniFrame invalida esto en favor de la `category: 'Pets'` para forzar el `domain: 'companion'` y el `kind` correspondiente (`moa`, `hound`).
- **Detección Heurística**: El motor de normalización utiliza el `uniqueName` para inferir el `kind` específico (`moa`, `hound`, `pet`) e inyectar los tags taxonómicos necesarios (`robotic`, `beast`).
