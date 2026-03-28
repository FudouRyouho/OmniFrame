# Data Foundation Questions

> Estado: activo
> Rol: registrar preguntas abiertas locales del track data foundation
> Fuente de verdad de: decisiones pendientes sobre tipado, filtros de pipeline y overrides de datos
> Ultima actualizacion: 2026-03-26

## DF-Q1 - Type guards para kinds nuevos

Pregunta:
- conviene mantener guards individuales por kind o consolidar guards agrupados para reducir ruido y mejorar mantenimiento

Opciones de debate:
1. punto -> opcion A: guards individuales (`isArcane`, `isCompanion`, `isArchgun`, `isArchmelee`, `isNecramech`, `isArchwing`)
2. punto -> opcion B: guards agrupados (`isVehicleKind`, `isArchwingWeaponKind`) + guards individuales solo donde haga falta
3. punto -> opcion C: sin guards dedicados; narrowing via `kind` con `switch` exhaustivo

Impacto:
- afecta filtros por kind en integration
- afecta consumo de tipos en el builder activo y sus extensiones futuras

## DF-Q2 - Trazabilidad de overrides en tipado nuevo (OQ-8)

Pregunta:
- donde y como se documenta cada override/cambio de semantica respecto a warframe-items para arcanes, companions, vehicles y archwing weapons

Opciones de debate:
1. punto -> opcion A: documento unico de overrides en integration (registro central)
2. punto -> opcion B: notas por tipo (`arcane`, `companion`, `vehicle`, `archwing-weapon`) en archivos separados
3. punto -> opcion C: anotaciones inline en documentos de frontera de tipos

Impacto:
- afecta mantenibilidad de schema
- afecta auditoria de cambios en pipeline
- afecta integracion con `warframe-items/`

## DF-Q3 - Filtros de pipeline previos al parseo de mods

Pregunta:
- que criterios de exclusion se aplican en generate antes de parsear `levelStats`

Decision inicial (2026-03-26):
- excluir mods `Flawed` del generate para el primer corte del parser

Pendiente:
- inventariar otros grupos de mods a excluir o marcar como fuera de scope del parser inicial

## DF-Q4 - Capa source semantica para overrides de mods

Pregunta:
- conviene introducir una capa source editable para mods con placeholders tipo `|val1|`, similar al patron semantico de abilities pero sin trasladar ese contrato directamente al runtime del builder

Opciones de debate:
1. punto -> opcion A: mantener solo el runtime actual orientado a engine (`upgradeType` + `values[]`)
2. punto -> opcion B: agregar una capa source semantica editable y derivar desde alli el runtime de mods
3. punto -> opcion C: migrar el override de mods a un contrato casi identico al de abilities

Lectura actual:
- B es la direccion mas consistente si el objetivo es mejorar trazabilidad editorial sin hacer que el builder dependa de texto o placeholders

Impacto:
- afecta trazabilidad de cambios en overrides de mods
- afecta pipeline source -> runtime de data foundation
- afecta la frontera entre semantica editable y contrato operativo del builder
