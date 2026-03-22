# Docs Cutover Status

> Estado: activo
> Rol: registrar el corte ejecutado `Docs-new -> Docs` y `Docs -> Docs-legacy`
> Fuente de verdad de: estrategia de corte de la documentacion
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-21

## Objetivo

El renombre principal ya fue ejecutado. Este documento ahora registra el estado del
corte y el cleanup pendiente posterior.

## Renombre ejecutado

```text
Docs      -> Docs-legacy
Docs-new  -> Docs
```

## Regla desde ahora

- toda documentacion nueva sigue yendo a `Docs/`
- evitar agregar rutas hardcodeadas innecesarias a `Docs/` dentro de los docs nuevos
- preferir links relativos dentro del arbol nuevo

## Estado actual del corte

Hecho:
1. `Docs-new` ya fue renombrado a `Docs`
2. `Docs` anterior ya fue renombrado a `Docs-legacy`
3. el steering ya entra por el arbol activo

Pendiente:
1. seguir migrando bloques restantes
2. seguir corrigiendo referencias heredadas que aun apunten al arbol viejo o al nombre anterior
3. validar manualmente los legacy marcados como `migrado`

## Punto importante

Conviene seguir trabajando asi:
- escribir sobre `Docs/`
- usar `Docs-legacy/` solo como evidencia o contexto historico
- registrar el avance en `migration-status.md`
