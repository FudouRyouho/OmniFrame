# System Data Flow

> Estado: activo
> Rol: describir el flujo de datos del sistema desde fuente canonica hasta UI
> Fuente de verdad de: panorama estable del flujo de datos
> No usar para: estado operativo de una feature concreta
> Ultima actualizacion: 2026-03-21

## Flujo

```text
fuente canonica
  -> build pipeline
  -> overrides
  -> JSON estatico
  -> tipado
  -> logica y traduccion
  -> UI
```

## Regla central

- la normalizacion de formato ocurre en build time
- la normalizacion de presentacion ocurre en runtime
- la UI no procesa ni convierte datos

