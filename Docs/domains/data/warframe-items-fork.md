# Warframe Items Fork

> Estado: activo
> Rol: documentar que cambios del fork siguen siendo relevantes para el proyecto
> Fuente de verdad de: cambios activos del fork y su impacto en el JSON consumido
> No usar para: backlog del builder o historial completo de cada experimento
> Ultima actualizacion: 2026-03-22

## Cambios relevantes mantenidos

### Warframes y abilities

El fork se uso para enriquecer:
- metadata de warframe
- campos adicionales de abilities
- integracion de stats y metadata derivada del wikia

### Mods

El fork ya aporta campos de alto valor:
- `upgradeTypes[]`
- `maxRank`
- `isExilus`
- `isFlawed`
- `modClass`
- `isWeaponAugment`
- incompatibilidades

## Limite importante

El hallazgo D2 sigue siendo clave:
- el Public Export accesible no expone la estructura completa de upgrades esperada
- parte de lo observado en Overframe no puede recuperarse directamente desde esa fuente

## Implicacion

El fork sigue siendo valioso, pero no cierra por si solo todos los gaps del builder.

