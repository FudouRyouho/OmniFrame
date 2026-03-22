# Runtime Layer Map Audit

> Estado: referencia
> Rol: snapshot del mapa de capas activo observado en la implementacion actual
> Fuente de verdad de: auditoria heredada del runtime actual
> No usar para: arquitectura objetivo a largo plazo
> Ultima actualizacion: 2026-03-21

## Mapa observado

```text
@wfcd/items
  -> generate-data.mjs
  -> JSON estatico
  -> *Data.ts
  -> hooks de items
  -> item-details e i18n
  -> EquipmentView / UI de detalle
```

## Valor de esta auditoria

Sirve para:
- entender como esta compuesto hoy el runtime
- comparar arquitectura actual vs arquitectura objetivo

No sirve para:
- definir por si sola la estructura final del proyecto

