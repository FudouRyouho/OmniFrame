# Weapon Data Known Gaps

> Estado: activo
> Rol: registrar gaps reales de la fuente de armas que afectan lectura o calculo
> Fuente de verdad de: limitaciones conocidas del dataset de armas
> No usar para: inventar overrides sin necesidad
> Depende de: `source-model.md`, `attack-structure.md`
> Ultima actualizacion: 2026-03-22

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

