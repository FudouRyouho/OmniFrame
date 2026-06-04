---
Estado: "referencia"
Rol: "Mecánica Accuracy/Spread — base para unificación WEAPON_SPREAD → WEAPON_ADD_ACCURACY"
Version: "v0.1.0"
Impacto_ID: "REF-Accuracy"
Fidelidad_Fisica: "Project/public/data/mod-stats.override.json"
Fecha_de_creacion: "2026-06-04"
Fecha_de_actualizacion: "2026-06-04"
Fuente: "https://wiki.warframe.com/w/Accuracy"
---

# Accuracy / Spread — Mecánica de Precisión

## Definición

**Accuracy** = qué tan cerca caen los disparos del retículo. Post-Update 35.5 (2024) se muestra en **grados** (`Deviation With Aim` / `Max Deviation`): menor desviación = mayor precisión. Antes era una escala 0-100.

**Spread** = nombre interno del **cono de dispersión** (en grados). `Accuracy` es el stat mostrado, derivado del spread.

---

## Accuracy y Spread son el mismo stat (inversos)

> *"Bonuses that increase accuracy decrease the deviation (spread) of a shot."*

Son la **misma mecánica subyacente** con signo invertido: `+40% Accuracy` = `−40% Spread`.

```
Base Accuracy = 100 / Average Spread
Average Spread = (Min Spread + Max Spread) / 2

Modding: Modified Spread = [Base Spread × (1 + %mod)] + Flat mod
```

---

## Shotgun vs hitscan — diferencia de contexto, no de stat

Shotguns (y armas con multishot) disparan al menos un pellet centrado en el retículo; los demás toman trayectorias aleatorias dentro del cono de spread. La diferencia *cómo se distribuyen los pellets* es una propiedad **del arma** (contexto), no un stat distinto. El stat subyacente (spread/accuracy) es el mismo.

---

## Mods — el token crudo dice "Spread", el label dice "Accuracy"

| Mod | Token crudo `@wfcd` | Label en juego |
|---|---|---|
| Narrow Barrel | `WEAPON_SPREAD` | "On Hit: +X% Accuracy when Aiming" |
| Tainted Shell | `WEAPON_SPREAD` | "+X% Accuracy / −Y% Fire Rate" |
| Heavy Caliber, Magnum Force, Vicious Spread | (negativos) | empeoran accuracy / aumentan spread |

Los mods de `WEAPON_SPREAD` **se muestran como "Accuracy"** en el juego. `Spread` es la implementación interna de DE; `Accuracy` es el stat visible.

---

## Relevancia para el engine / token

- `WEAPON_SPREAD` (token crudo `@wfcd`, solo en `mods.json` raw) y `WEAPON_ADD_ACCURACY` (registrado en `UPGRADES[]`, usado en arcanes/incarnon) son **la misma mecánica** → unificar bajo **`WEAPON_ADD_ACCURACY`**.
- El "spread de shotgun" es **contexto de arma**, no justifica token aparte.
- La sim actual **asume aim perfecto** → accuracy es un **stat informativo**, bajo riesgo de cómputo.
- **Pendiente (mecanismo de unificación):** alias en engine (`WEAPON_SPREAD` → `WEAPON_ADD_ACCURACY` en `UPGRADE_MAP`, patrón de `WEAPON_FIRE_ITERATIONS`) vs mapeo en el pipeline `generate-data.ts`. No hay mods `WEAPON_SPREAD` en overrides curados todavía → decisión gateada hasta que se curen Narrow Barrel / Tainted Shell.
