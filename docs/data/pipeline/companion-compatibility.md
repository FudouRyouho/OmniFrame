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

- el dato ya esta preservado
- la explotacion correcta en runtime sigue pendiente

