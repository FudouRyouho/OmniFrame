# Docs Cutover Status

> Estado: activo
> Rol: registrar el corte documental y su estado final de operacion
> Fuente de verdad de: estrategia de corte de la documentacion
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-25

## Objetivo

Dejar un unico arbol documental operativo y evitar drift entre instrucciones.

## Corte ejecutado

```text
Docs-new  -> Docs
```

## Regla desde ahora

- toda documentacion nueva sigue yendo a `Docs/`
- evitar agregar rutas hardcodeadas innecesarias a `Docs/` dentro de los docs nuevos
- preferir links relativos dentro del arbol nuevo
- eliminar referencias operativas a arboles documentales retirados

## Estado actual del corte

Hecho:
1. `Docs-new` ya fue renombrado a `Docs`
2. el steering ya entra por el arbol activo
3. `Docs/` queda como fuente canonica unica

Pendiente:
1. seguir corrigiendo referencias heredadas que aun apunten al arbol viejo o al nombre anterior
2. mantener consistencia entre `overview/`, `features/` y `decisions/`

## Punto importante

Conviene seguir trabajando asi:
- escribir sobre `Docs/`
- registrar el avance en `migration-status.md`
