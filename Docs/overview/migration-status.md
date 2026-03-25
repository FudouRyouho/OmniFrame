# Migration Status

> Estado: activo
> Rol: registrar el estado de consolidacion del arbol documental activo
> Fuente de verdad de: avances y pendientes de consistencia documental en `Docs/`
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-25

## Estado actual

La documentacion opera sobre un unico arbol activo: `Docs/`.

## Criterios de consolidacion

- consistencia de workflow en todos los documentos de gobierno
- links relativos validos entre `overview/`, `features/`, `domains/`, `decisions/` y `reference/`
- `status.md` por track actualizado despues de cada implementacion relevante
- decisiones transversales registradas en `decisions/`

## Checklist operativo

1. revisar que no existan referencias operativas a arboles documentales retirados
2. corregir links rotos detectados en documentos de entrada (`README`, `overview/*`)
3. verificar que el workflow de 5 fases este alineado en reglas e instrucciones
4. confirmar que cada track mantenga su `status.md` y `questions.md` al dia

## Proximo uso recomendado

Al cerrar cambios estructurales de documentacion:
- actualizar este estado
- actualizar `docs-cutover-plan.md` si cambia la estrategia
- dejar trazabilidad de decisiones en `decisions/open-questions.md` solo cuando aplique
