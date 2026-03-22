# Builder Layout Contract

> Estado: activo
> Rol: definir la estructura de entrada `Layout` para el builder engine
> Fuente de verdad de: contrato de datos de entrada del motor
> No usar para: estrategia de valores de mods o estado de implementacion
> Depende de: `builder-v1.md`
> Ultima actualizacion: 2026-03-21

## Entidades equipadas

El layout debe describir las entidades equipadas por `uniqueName` y sus mods.

```ts
interface EquippedMod {
  uniqueName: string
  rank: number
}

interface Layout {
  warframe?:  { uniqueName: string; mods: EquippedMod[] }
  primary?:   { uniqueName: string; mods: EquippedMod[] }
  secondary?: { uniqueName: string; mods: EquippedMod[] }
  melee?:     { uniqueName: string; mods: EquippedMod[] }
}
```

## Regla de resolucion

- el motor no persiste el objeto `Mod` completo dentro del layout
- el layout solo referencia mods por `uniqueName` y `rank`
- la resolucion de entidades completas pertenece a la capa de integracion

## Slots por entidad

| Entidad | Slots normales | Slot especial | Exilus | Arcanos |
|---|---|---|---|---|
| Warframe | 8 | 1 aura | 1 | 2 |
| Primaria | 8 | - | 1 | 1 |
| Secundaria | 8 | - | 1 | 1 |
| Melee | 8 | 1 stance | 1 | 1 |

Excepcion conocida:
- Jade tiene 2 auras en lugar de aura + exilus

## Extensibilidad prevista

- Sevagoth: `shadow`
- armas exaltadas
- arcanos por entidad
- companions en v2

