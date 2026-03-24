# Override Pattern

> Estado: activo
> Rol: definir cuando y como se introduce un override de datos
> Fuente de verdad de: patron de overrides del proyecto
> No usar para: backlog especifico de un override puntual
> Ultima actualizacion: 2026-03-22

## Patron

```text
fuente primaria
  -> normalizacion generated
  -> gap o enriquecimiento manual confirmado
  -> override estatico
  -> merge en build o flujo controlado
  -> artefacto runtime limpio
```

## Criterios

Crear un override solo cuando:
- el dato no existe en la fuente primaria
- o el dato no es derivable automaticamente desde la fuente primaria
- el dato impacta logica o UI
- existe fuente alternativa confiable o captura manual justificable

Un override tambien es valido cuando:
- agrega tipado o metadata extra no derivable
- completa casos manuales que la fuente base no puede producir de forma estable

## Regla

Los overrides no son "parches sucios".

Son una capa legitima del sistema cuando existe una frontera clara entre:

- base generated
- conocimiento manual auditado

## Artefactos

Separar siempre entre:

- fuente editable del override
- backup historico
- copia runtime consumida por la app

La app puede consumir una copia runtime del override, pero esa copia no debe
confundirse con el lugar donde se trabaja o se respalda el dato.

## Ejemplo actual

- `ability-stats.override.json` como override manual de habilidades

Ver:
- `data-layer-roles.md`
