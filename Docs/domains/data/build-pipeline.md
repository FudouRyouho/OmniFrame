# Build Pipeline

> Estado: activo
> Rol: describir el rol de `generate-data.mjs` dentro del flujo de datos
> Fuente de verdad de: responsabilidades del pipeline de build
> No usar para: hidratacion runtime o logica del builder
> Ultima actualizacion: 2026-03-21

## Responsabilidades

- mapear fielmente la estructura canonica
- normalizar formato de calculo
- aplicar overrides
- generar JSON estatico limpio

## No hace

- no desnormaliza campos del padre hacia hijos
- no inventa campos inexistentes
- no toma decisiones de presentacion

## Complemento

Para el pipeline externo del fork y sus scrapers:
- `warframe-items-build.md`
