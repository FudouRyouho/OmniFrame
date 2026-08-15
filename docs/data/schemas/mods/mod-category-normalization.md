---
Estado: "referencia"
Rol: "El mapeo objetivo mod.type → ModCategory, y por qué hoy no lo ejecuta nadie"
Impacto_ID: "data-mods-taxonomy"
Fidelidad_Fisica: "Project/src/shared/types/mod.ts"
Fecha_de_creacion: "2026-03-21"
Fecha_de_actualizacion: "2026-08-14"
---

# Mod Category Normalization

## Qué pasa hoy

**Nadie normaliza.** El pipeline guarda el crudo (`category_raw: raw.category ?? null`, en
`scripts/pipeline/runtime-data-artifacts.ts`) y ahí termina: `category_raw` no se lee en ningún punto
de `src/` fuera de un mock de dev. La interfaz `Mod` **no tiene** un campo `category` derivado.

El tipo `ModCategory` (`shared/types/mod.ts`) existe, pero su único consumidor es `ModsToolbar.tsx`,
donde sirve de **vocabulario de las keys del toolbar** — y la unión ahí ni siquiera es sólo
`ModCategory`: agrega `"all" | "aura" | "augment" | "stance" | "exilus" | "vehicle"`.

El filtrado real de mods (`domains/equipment/hooks/use-items-filters.ts`) matchea contra
`kind` · `family` · `domain` · `compat_name` · `mod_class` · `tags`, más hardcodes semánticos.
Ninguna de esas ramas toca la categoría normalizada.

## El mapeo objetivo

Si la normalización se implementa, la regla es colapsar `mod.type` de la fuente a una categoría
estable. Casos representativos:

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

El enum vive en `shared/types/mod.ts` y es su SSoT — **esta tabla no lo replica**: hay valores en el
tipo sin fila acá (`tektolyst`, `modset`, `transmutation`, `peculiar`, `unknown`) porque no se sabe
qué `mod.type` los produce, si es que alguno lo hace.

## Por qué importa que esté sin implementar

Mientras el colapso no exista, cada consumidor inventa su propia agrupación —
`use-items-filters.ts` ya tiene tres ramas de hardcode para lo que una categoría normalizada
resolvería de una. Es la misma forma del bug de id display ↔ clave canónica: la clave que se compara
no es la que el catálogo declara.

La exclusión o el tratamiento especial de subcategorías puede seguir ocurriendo en runtime aun
después de normalizar.
