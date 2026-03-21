# Cambios en warframe-items (fork)

> Estado: activo
> Última actualización: 2026-03-19

Registro de todas las modificaciones sobre el repo clonado.

---

## Archivos nuevos

| Archivo | Qué hace |
|---|---|
| `build/wikia/scrapers/AbilityScraper.mjs` | Scrappea `Module:Ability/data` + `Module:Ability/data/stats` en paralelo |
| `build/wikia/transformers/transformAbility.mjs` | Transforma raw Lua de abilities al schema del proyecto, incluyendo stats numéricos |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `build/wikia/scrapers/WarframeScraper.mjs` | Reescrito para manejar estructura de subcategorías del módulo (`Warframes`, `Archwings`, `Necramechs`, `Operators`) |
| `build/wikia/transformers/transformWarframe.mjs` | Añadidos: `health/shield/armor/energy`, `*Rank30`, `initialEnergy`, `playstyle`, `progenitor`, `subsumed`, `themes`, `tactical`, `category` |
| `build/scraper.mjs` | Import + llamada a `AbilityScraper` en `fetchWikiaData()`, añadido `abilities` al return |
| `build/parser.mjs` | `addWarframeWikiaData` recibe `wikiaData` como parámetro; mergea abilities enriquecidas y nuevos campos de Warframe |

---

## Campos añadidos al JSON de salida

### Por Warframe
```
energy, initialEnergy, maxRank
healthRank30, shieldRank30, armorRank30, energyRank30  (parcial)
playstyle[], progenitor, subsumed, themes, tactical
category, wikiaCategory
```

### Por Ability (dentro de cada Warframe)
```
key, cost, costType, subsumable, augments[]
icon, cardImage, powersuit, introduced, weapon
stats[].label, stats[].modifier, stats[].values[], stats[].max?
```

---

## Notas

- `WarframeScraper` ya no extiende `WikiaDataScraper` — tiene su propio `scrape()` para manejar la estructura anidada del módulo.
- `AbilityScraper` hace dos fetches en paralelo y adjunta `_stats` al raw antes de pasar al transformer.
- Los valores de `stats[].values` son números planos (el bug de `{Val1: x}` está corregido en `normalizeValues()`).

---

## Upgrades canónicos en mods — IMPLEMENTADO

### Campos añadidos al JSON de salida (por Mod)

```
upgradeTypes[]        — identificadores canónicos del wikia (Module:Mods/data)
maxRank / rank        — rango máximo del wikia (más fiable que fusionLimit del API)
isExilus              — boolean si es mod exilus
isFlawed              — boolean si es mod defectuoso
modClass              — "Galvanized" | "Primed" | "Archon" | undefined
isWeaponAugment       — boolean si es augment de arma
incompatible[]        — nombres de mods incompatibles
incompatibilityTags[] — tags de incompatibilidad
```

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `build/wikia/transformers/transformMod.mjs` | Extrae `UpgradeTypes`, `MaxRank`, `IsExilus`, `IsFlawed`, `Class`, `IsWeaponAugment`, `Incompatible`, `IncompatibilityTags` del Lua |
| `build/parser.mjs → addModWikiaData()` | Mergea todos los nuevos campos al item |
| `Project/scripts/generate-data.mjs → mapMod()` | Incluye todos los nuevos campos en el output JSON |

### Resultado verificado en mods.json

```json
{
  "name": "Serration",
  "upgradeTypes": ["WEAPON_DAMAGE_AMOUNT"],
  "isFlawed": true,
  "incompatible": ["Serration", "Higasa Serration", "Amalgam Serration", "Spectral Serration"]
}
{
  "name": "Galvanized Chamber",
  "upgradeTypes": ["WEAPON_FIRE_ITERATIONS"],
  "rank": 10,
  "modClass": "Galvanized"
}
{
  "name": "Gun Glide",
  "upgradeTypes": ["WEAPON_RECOIL", "WEAPON_SPREAD"]
}
{
  "name": "Fomorian Accelerant",
  "upgradeTypes": ["WEAPON_PROJECTILE_BOUNCES", "WEAPON_PROJECTILE_SPEED", "WEAPON_PROJECTILE_ELASTICITY"]
}
```

### Impacto en el override (mod-stats.json)

Con `upgradeTypes[]` disponible en el JSON base:
- El override ya no necesita inventar `modifier` — usa `upgradeType` como identificador canónico
- D4 (multi-valor) se resuelve naturalmente: Gun Glide tiene dos `upgradeTypes`, Fomorian tiene tres
- El override solo cubre lo que el wikia no tiene:
  - `values[]` por rango para mods con progresión no lineal (Primed, Galvanized, Archon)
  - `label` con `|val1|` template para renderizado
  - `misc` para efectos sin `UpgradeType` (augmentos Lua)
  - Condiciones (`ValidPostures`) — pendiente de diseño arquitectónico cross-sistema

---

## D2 — upgradeEntries del Public Export — CANCELADO (2026-03-19)

### Hallazgo

El `ExportUpgrades_en.json` del Public Export de DE **no contiene** los campos
`Upgrades[]`, `UpgradeType`, `OperationType`, `Value`, `DamageType`, `ValidPostures`
ni `ValidProcTypes`. Solo contiene `levelStats` como texto plano — idéntico a lo que
ya tiene `@wfcd/items`.

Los datos estructurados que se observaron en el análisis de Overframe (`__NEXT_DATA__`)
provienen de una fuente diferente al Public Export accesible — probablemente del cliente
del juego directamente o de un endpoint privado.

### Implicación

Los Gaps A, B y C documentados en `architecture/mod-stats-gap.md` **no se pueden cerrar
con el Public Export**. Las opciones reales son:

| Gap | Opción viable |
|---|---|
| Gap A (tipo de daño elemental) | Parsear `levelStats` (`"+90% Heat"` → `heat`) o tabla de lookup estática |
| Gap B (condiciones de activación) | Tabla de lookup estática para los ~20 mods afectados |
| Gap C (OperationType) | Inferir por `upgradeType` — cada tipo tiene siempre el mismo OperationType |

### Cambios revertidos

- `addModUpgradeData()` eliminada del parser (nunca llegó a producción)
- `filter()` sin la llamada a `addModUpgradeData()`

### Estado actual del fork

El build sigue siendo necesario para obtener `upgradeTypes[]` y los demás campos
del wikia (`maxRank`, `isExilus`, `modClass`, etc.) en el JSON de salida.
Ver sección anterior "Upgrades canónicos en mods" para el detalle.
