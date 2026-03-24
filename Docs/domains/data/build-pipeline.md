# Build Pipeline

> Estado: activo
> Rol: describir el rol de `generate-data.mjs` dentro del flujo de datos
> Fuente de verdad de: responsabilidades del pipeline de build
> No usar para: hidratacion runtime o logica del builder
> Ultima actualizacion: 2026-03-22

## Responsabilidades

- mapear fielmente la estructura canonica
- normalizar formato de calculo
- aplicar capas de override declaradas de forma controlada
- generar JSON estatico limpio

## No hace

- no desnormaliza campos del padre hacia hijos
- no agrega conocimiento manual no derivable desde la fuente base
- no mezcla fuentes automaticas con auditoria manual como si fueran la misma capa
- no toma decisiones de presentacion

## Regla de interpretacion

`generate-data` obtiene y normaliza bases.

Ejemplos validos:
- conversion de porcentajes a fracciones
- normalizacion de damage tags legacy a tags canonicos del proyecto
- mapeos tecnicos como `MOD_TYPE_TO_CATEGORY`

Eso puede introducir estructura nueva, pero sigue siendo una transformacion
determinista de la fuente base.

Lo que no debe hacer:
- inyectar datos manuales de abilities
- completar pasivas o mecanicas desde evidencia externa
- mezclar conocimiento auditado con la capa generated sin una frontera explicita

Para esa frontera ver:
- `data-layer-roles.md`
- `override-pattern.md`

## Complemento

Para el pipeline externo del fork y sus scrapers:
- `warframe-items-build.md`
