# Override Pattern

> Estado: activo
> Rol: definir cuando y como se introduce un override de datos
> Fuente de verdad de: patron de overrides del proyecto
> No usar para: backlog especifico de un override puntual
> Ultima actualizacion: 2026-03-21

## Patron

```text
fuente primaria
  -> gap confirmado
  -> override estatico
  -> merge en build o flujo controlado
  -> JSON final limpio
```

## Criterios

Crear un override solo cuando:
- el dato no existe en la fuente primaria
- el dato impacta logica o UI
- existe fuente alternativa confiable o captura manual justificable

## Ejemplo actual

- `ability-stats.json`

