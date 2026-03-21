# Override de mods — schema y estado

> Estado: placeholder
> Última actualización: 2026-03-19

Esta carpeta contendrá los archivos de override para mods cuando el builder los necesite.
Los archivos legacy (`mod.*.stats.json`) fueron eliminados — su schema era obsoleto.

---

## Cuándo se necesita el override

El builder consume `upgradeTypes[]` directamente desde `mods.json` para el ~85% de los mods.
El override solo es necesario para:

| Caso | Mods afectados | Campo |
|---|---|---|
| Progresión no lineal | Primed (~30), Galvanized (~10), Archon (~5) | `values[]` por rango |
| Augmentos UNIQUE | ~13 por categoría | `misc: []` (placeholder) |
| Tipo de daño elemental | Hellfire, Cryo Rounds, etc. | `damageType` (lookup estático) |
| Condiciones de activación | Argon Scope, Galvanized Scope, etc. | `condition` (lookup estático) |

---

## Schema del override (cuando se implemente)

```json
{
  "/Lotus/Upgrades/Mods/Rifle/Primed/WeaponDamageAmountModExpert": {
    "values": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 165]
  },

  "/Lotus/Upgrades/Mods/Shotgun/Event/ProjectNightwatch/SobekNightwatchMod": {
    "misc": []
  }
}
```

Campos válidos:
- `values[]` — valores por rango para progresión no lineal
- `damageType` — tipo de daño elemental como fallback
- `condition` — condición de activación como fallback
- `misc: []` — placeholder para augmentos UNIQUE, sin poblar hasta que el builder lo necesite

---

## Referencias

- `Docs/architecture/mod-stats-gap.md` — gaps documentados y schema completo
- `Docs/decisions/open-questions.md` §D1 — decisión sobre el override
- `Docs/decisions/mods-builder-analysis.md` §5 — rol del override en su nuevo contexto
