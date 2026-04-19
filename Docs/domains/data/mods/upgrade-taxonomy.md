---
Estado: "en revision"
Rol: "Documentar la taxonomía de UpgradeType del proyecto"
Version: "v0.0.2"
Impacto_ID: "S-Upgrade-Taxonomy"
Fidelidad_Fisica: "Project/src/lib/types/mod.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Mods Upgrade Taxonomy

## Estado de la Taxonomía

La taxonomía está actualmente en fase de **Análisis Semántico**. No se deben añadir nuevos tipos sin contrastar con el análisis de los JSON fuente normalizados (`@wfcd/items` + `Module:Mods/data`).

### Familias Identificadas (Prefijos)

| Prefijo | Dominio de Aplicación | Ejemplo |
| :--- | :--- | :--- |
| `WEAPON_` | Efectos directos sobre el arma y sus ataques. | `WEAPON_CRIT_CHANCE` |
| `AVATAR_` | Efectos sobre el Warframe (Base stats y habilidades). | `AVATAR_ABILITY_STRENGTH` |
| `VEHICLE_` | Efectos sobre K-Drive y otros vehículos. | `VEHICLE_BOOST_MAX` |
| `GAMEPLAY_` | Efectos de facción, utilidades y reglas generales. | `GAMEPLAY_FACTION_DAMAGE` |

## Regla de Oro Operativa

El código (`lib/types/mod.ts`) mantiene `UpgradeType` como un string abierto hasta que la auditoría del catálogo sea definitiva. El documento de referencia para el análisis detallado es `mods-builder-analysis.md` (Capa de Auditoría).

---

### Referencias de Integridad
- [Mod Types (Code)](../../../Project/src/lib/types/mod.ts)
