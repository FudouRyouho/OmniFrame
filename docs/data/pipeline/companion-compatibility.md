---
Estado: "referencia"
Rol: "Documentar la semántica de compatName y la jerarquía de pertenencia para mods de companion"
Impacto_ID: "D-Pipeline-Companion"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-03-21"
Fecha_de_actualizacion: "2026-05-25"
---

# Companion Compatibility

## Punto central

`compatName` existe en la fuente y define a que companion o grupo aplica un mod.

## Niveles jerarquicos

- universal
- grupo (`ROBOTIC`, `BEAST`)
- tipo (`Sentinel`, `Kavat`, `Moa`, `Hound`)
- individuo especifico

## Implicacion

El filtrado no puede resolver esto con un simple `item.compatName === selected`.
Necesita una jerarquia de pertenencia.

## Estado

El dato está preservado (`compat_name` en `mods.json`) y la explotación jerárquica **sigue
pendiente**: los dos consumidores en runtime comparan por igualdad plana —
`use-items-filters.ts` (`compat === filterStr`, con tres agrupaciones hardcodeadas) y
`UpgradeView.tsx` (`compat_name?.toLowerCase() !== compatToken`). Un mod `ROBOTIC` no matchea
cuando el usuario tiene un Sentinel seleccionado.

Los grupos existen declarados en `lib/i18n/category-icons.ts` (`robotic`, `beast`), pero sólo para
elegir el ícono — nadie los usa como relación de pertenencia.

