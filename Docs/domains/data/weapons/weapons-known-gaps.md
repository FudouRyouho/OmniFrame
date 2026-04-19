---
Estado: "activo"
Rol: "Registrar gaps reales de la fuente de armas que afectan lectura o cálculo"
Version: "v0.0.2"
Impacto_ID: "D-Weapons-Gaps"
Fidelidad_Fisica: "Project/src/lib/types/weapon.ts"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
---

# Weapon Data Known Gaps

## Gaps confirmados

| Gap | Descripcion | Regla actual |
|---|---|---|
| `shot_speed` vs `flight` | alias redundante o incompleto | preferir `flight`; usar fallback controlado |
| `slide` vs `slideAttack` | inconsistente en algunas melee | preferir `attacks[].slide` y tratar top-level como referencia |
| `heavyAttackDamage` | vive solo en top-level para melee estandar | leerlo desde el arma, no desde `attacks[]` |
| `punchThrough` | no existe por ataque en `@wfcd/items` | no inventarlo en el JSON |
| `damage` top-level | no siempre coincide con el modo de ataque principal | no usarlo para calculo |
| `speed` ausente | algunos ataques no exponen `speed` | tratarlo como opcional |

## Implicacion

Estos gaps informan al builder y a la UI, pero no justifican desnormalizar el modelo
ni llenar el dataset con campos inventados.

