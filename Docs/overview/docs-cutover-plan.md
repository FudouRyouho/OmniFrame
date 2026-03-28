# Docs Cutover Status

> Estado: activo
> Rol: registrar el corte documental y su estado final de operacion
> Fuente de verdad de: estrategia de corte de la documentacion
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-28

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
4. `overview/`, domains criticos y tracks `builder-engine` / `navigation-shell` ya fueron resincronizados con el estado post-Paso 18

Pendiente:
1. aislar las referencias heredadas restantes en `temp/` y `reference/` cuando solo tengan valor historico
2. mantener consistencia entre `overview/`, `domains/`, `features/` y `decisions/` con registro por lotes en `migration-status.md`

## Punto importante

Conviene seguir trabajando asi:
- escribir sobre `Docs/`
- registrar el avance en `migration-status.md`
- tratar `temp/` como registro de sesion/decisiones y `reference/` como evidencia historica, no como fuente operativa primaria
- usar `green-checkpoint-plan.md` para el cierre global del repo; este documento solo gobierna el cutover del arbol documental
