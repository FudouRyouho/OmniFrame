# Semantic Pipeline Dependencies

> Estado: activo
> Rol: mapear dependencias de entrada y salida del track semantic pipeline
> Fuente de verdad de: relaciones del track con otros dominios y features
> Ultima actualizacion: 2026-03-21

## Depende de

- `../../domains/data/abilities/source-model.md`
- `../../domains/data/abilities/schema.md`
- `../../domains/data/abilities/pipeline.md`
- fuentes de juego y/o captura manual para warframes recientes

## Desbloquea a

- `../builder-engine/status.md` para calculo de habilidades
- `../../domains/integration/runtime-composition.md` para migraciones futuras

## Riesgos de acoplamiento

- si cambia el schema de `ability-stats.override.json`, hay que actualizar parser, docs y editor
- si cambia la semantica de groups, tambien cambia el futuro engine
