---
Estado: "activo"
Rol: "Documentar la interdependencia entre los datasets estáticos del proyecto"
Version: "v0.0.2"
Impacto_ID: "D-Dependencies"
Fidelidad_Fisica: "Project/src/lib/types/"
Fecha_de_creacion: "2026-04-17"
Fecha_de_actualizacion: "2026-04-19"
---

# Data Dependencies

## Depende de

- `../../domains/data/abilities/source-model.md`
- `../../domains/data/abilities/schema.md`
- `../../domains/data/abilities/pipeline.md`
- fuentes de juego y/o captura manual para warframes recientes

## Desbloquea a

- `../builder-engine/status.md` para soporte trazable de habilidades
- `../../domains/integration/runtime-composition.md` para migraciones futuras de hidratacion

## Riesgos de acoplamiento

- si cambia el schema de `ability-stats.override.json`, hay que actualizar parser, docs y editor
- mientras runtime y parser no compartan el mismo estado estructural, el track seguira generando drift documental
- si cambia la semantica de groups, tambien cambia el engine que consume habilidades
