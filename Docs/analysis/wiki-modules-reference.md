# Wiki Modules de Referencia

> Estado: referencia
> Última actualización: 2026-03-20

Lista completa de módulos Lua de `wiki.warframe.com` relevantes para el builder.
Fuente: https://wiki.warframe.com/w/WARFRAME_Wiki:Modules

Acceso a cualquier módulo: `https://wiki.warframe.com/w/Module:<Nombre>?action=edit`
Script de descarga: `node utilities/fetch-wiki-module.mjs "Module:Nombre" nombre-archivo`

---

## Módulos descargados y documentados

Archivos raw en `Docs/wiki-modules/*.lua`. Documentación en `Docs/wiki-modules/*.md`.

| Módulo | Archivo raw | Documentación | Contenido |
|---|---|---|---|
| `Module:Ability/data/stats` | `ability-data-stats.lua` | `ability-data-stats.md` | Stats numéricos por habilidad: Label, Modifier, Values, Max, Min, HelminthValues |
| `Module:Maximization/data` | `maximization-data.lua` | `maximization-data.md` | Fórmulas STR/DUR/RNG/EFF por warframe y habilidad |
| `Module:DamageTypes/data` | `damage-types-data.lua` | `damage-types-data.md` | Tipos de daño, health types, procs/status effects, efectividades |
| `Module:TextIcons/data` | `text-icons-data.lua` | `text-icons-data.md` | Tokens `<DT_*>`, `<POLARITY_*>`, `<ENERGY>` → archivos de imagen |

Análisis derivados en `Docs/canonical/`:
- `ability-engine-variables.md` — vocabulario canónico STR/DUR/RNG/EFF, patrones de fórmula
- `ability-stat-schema.md` — schema definitivo AbilityStatValue + AbilityGroup (D4-D8)

---

## Warframes (alta prioridad)

| Módulo | URL | Contenido | Estado |
|---|---|---|---|
| `Module:Ability/data` | `/w/Module:Ability/data?action=edit` | Metadata de habilidades: nombre, costo, subsumable, augments, etc. | ✅ scrapeado (en fork) |
| `Module:Ability/data/stats` | `/w/Module:Ability/data/stats?action=edit` | Stats numéricos por habilidad | ✅ descargado + documentado |
| `Module:Maximization/data` | `/w/Module:Maximization/data?action=edit` | Fórmulas de maximización STR/DUR/RNG/EFF | ✅ descargado + documentado |
| `Module:Warframes/data` | `/w/Module:Warframes/data?action=edit` | Stats base: health, shield, armor, energy, sprint | fuera de scope actual |

---

## Weapons (media prioridad)

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Weapons/data` | `/w/Module:Weapons/data?action=edit` | Stats de armas: daño, fire rate, crit, status, etc. |
| `Module:Weapons/ppdata` | `/w/Module:Weapons/ppdata?action=edit` | Datos de prime/primed weapons |
| `Module:Modular/data` | `/w/Module:Modular/data?action=edit` | Kitguns, Zaws, Moas — stats de partes modulares |
| `Module:Stances/data` | `/w/Module:Stances/data?action=edit` | Datos de stances de melee |

---

## Upgrades / Mods (media prioridad)

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Mods/data` | `/w/Module:Mods/data?action=edit` | Stats de mods: efecto, rango, polaridad, compatibilidad |
| `Module:Arcane/data` | `/w/Module:Arcane/data?action=edit` | Stats de arcanes por rango |
| `Module:Focus/data` | `/w/Module:Focus/data?action=edit` | Árbol de Focus: nodos, stats, costos |
| `Module:Decrees/data` | `/w/Module:Decrees/data?action=edit` | Decretos de Duviri |

---

## Drop Tables (baja prioridad para builder)

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Acquisition/data` | `/w/Module:Acquisition/data?action=edit` | Fuentes de obtención de items |
| `Module:DropTables/data` | `/w/Module:DropTables/data?action=edit` | Tablas de drop por misión/enemigo |
| `Module:Void/data` | `/w/Module:Void/data?action=edit` | Relics y recompensas del Void |

---

## Crafting / Recursos

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Blueprints/data` | `/w/Module:Blueprints/data?action=edit` | Requisitos de crafteo (ya usado por warframe-items) |
| `Module:Resources/data` | `/w/Module:Resources/data?action=edit` | Datos de recursos del juego |
| `Module:Research/data` | `/w/Module:Research/data?action=edit` | Investigaciones del Clan Dojo |

---

## Generales / Utilidad

| Módulo | URL | Contenido | Estado |
|---|---|---|---|
| `Module:DamageTypes/data` | `/w/Module:DamageTypes/data?action=edit` | Tipos de daño, efectividades, iconos | ✅ descargado + documentado |
| `Module:TextIcons/data` | `/w/Module:TextIcons/data?action=edit` | Tokens `<DT_*>`, `<POLARITY_*>`, `<ENERGY>` → imágenes | ✅ descargado + documentado |
| `Module:Enemies/data` | `/w/Module:Enemies/data?action=edit` | Stats de enemigos: health, armor, faction, vulnerabilidades | pendiente |
| `Module:Missions/data` | `/w/Module:Missions/data?action=edit` | Datos de misiones y nodos | pendiente |
| `Module:Codex/data` | `/w/Module:Codex/data?action=edit` | Entradas del Codex | pendiente |
| `Module:Companions/data` | `/w/Module:Companions/data?action=edit` | Stats de companions/sentinels | pendiente |
| `Module:InternalNames` | `/w/Module:InternalNames?action=edit` | Mapa de uniqueNames a nombres legibles | pendiente |
| `Module:MasteryRank` | `/w/Module:MasteryRank?action=edit` | Requisitos y recompensas por rango de maestría | pendiente |

---

## Vendors / Economía

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Baro/data` | `/w/Module:Baro/data?action=edit` | Inventario histórico de Baro Ki'Teer |
| `Module:Vendors/data` | `/w/Module:Vendors/data?action=edit` | Datos de vendedores (Syndicates, Nightwave, etc.) |

---

## Cosmetics (baja prioridad)

| Módulo | URL | Contenido |
|---|---|---|
| `Module:Cosmetics/data` | `/w/Module:Cosmetics/data?action=edit` | Skins, syandanas, etc. |
| `Module:TennoGen/data` | `/w/Module:TennoGen/data?action=edit` | Items de TennoGen |
| `Module:Decorations/data` | `/w/Module:Decorations/data?action=edit` | Decoraciones de Orbiter/Dojo |

---

## Notas

- Todos los módulos se acceden con `?action=edit` para obtener el Lua crudo (estable y parseable).
- Scrappear el HTML renderizado de la wiki es inconsistente — siempre usar `?action=edit`.
- Para descargar un módulo: `node utilities/fetch-wiki-module.mjs "Module:Nombre" nombre-archivo`
