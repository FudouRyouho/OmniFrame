# Migration Status

> Estado: activo
> Rol: registrar el estado de consolidacion del arbol documental activo
> Fuente de verdad de: avances y pendientes de consistencia documental en `Docs/`
> No usar para: contenido tecnico de una feature
> Ultima actualizacion: 2026-03-28

## Estado actual

La documentacion opera sobre un unico arbol activo: `Docs/`.

## Checkpoint 2026-03-28

- el vertical slice minimo del builder ya esta implementado en codigo: Engine, Resolver forward, Loadout y `LoadoutProvider`
- `open-questions.md` ya cierra OQ-2 con provider dominante (`LoadoutProvider`)
- `builder-engine/status.md` y `navigation-shell/status.md` ya reflejan el estado real post-Paso 18
- lotes sincronizados ya aplicados en esta sesion: `overview/`, `domains/engine/architecture.md`, `domains/integration/runtime-composition.md`, `domains/README.md`, `domains/data/warframes/source-model.md`, `features/builder-engine/` y `features/navigation-shell/`
- pasada fina adicional aplicada en tracks activos: `features/data-foundation/` y `features/semantic-pipeline/`
- seguimiento fino adicional aplicado en `domains/data/abilities/` y en `overview/` para corregir la narrativa falsa de cobertura total del semantic pipeline
- pasada fina adicional aplicada en `reference/` para distinguir evidencia historica de lectura operativa vigente
- normalizacion estructural aplicada en `reference/historical/` para convertir snapshots sueltos en archivo explicito con cabeceras y notas de sustitucion
- barrido final aplicado en `decisions/` para alinear la gobernanza del indice y el rol vigente de `implementaciones-temporales.md`
- remate cosmetico aplicado en indices raiz (`Docs/README.md`, `Docs/features/README.md`) para reflejar la estructura real del arbol, el rol de `temp/` y la variacion legitima entre tracks
- el arbol activo ya no depende de documentos retirados del builder para lectura operativa; las referencias residuales quedan en `temp/` y `reference/` como trazabilidad historica esperada
- plan canonico agregado en `overview/green-checkpoint-plan.md` para separar el checkpoint documental del futuro commit global en verde
- indice canonico agregado en `decisions/stage-0-architecture-decisions.md` para absorber C1-C41 sin depender de `temp/` como lectura operativa normal

## Barrido sistematico 2026-03-27

Revision carpeta por carpeta de los 70 archivos activos (excluidos `temp/`, `reference/`, `historical/`):

- 0 referencias rotas a archivos eliminados en docs activos para ese corte
- Drift corregido en: `overview/` (5 archivos), `decisions/` (3 archivos), `domains/ui/shell-and-navigation.md`, `domains/data/mods/upgrade-taxonomy.md`, `features/builder-engine/` (4 archivos + README)
- Links relativos incorrectos en `decisions/` corregidos
- 16 archivos eliminados en sesion previa; sus decisiones y referencias utiles ya quedaron absorbidas por el arbol canonico o preservadas como contexto historico explicito

Nota:
- los cambios de 2026-03-28 en builder/integration reabrieron trabajo de sincronizacion en `overview/` y `domains/`
- los lotes ejecutados en esta sesion cerraron el drift principal de `overview/`, `domains/` y tracks criticos; el resto pendiente debe tratarse como ajuste puntual, no como reescritura general
- la pasada fina de `semantic-pipeline/` corrigio un falso positivo documental: el track no esta en 100% cobertura; el runtime actual sigue fallando `verify-ability-stats.mjs`
- este archivo ya no debe leerse como cierre absoluto del arbol, sino como ledger de checkpoints sucesivos

## Criterios de consolidacion

- consistencia de workflow en todos los documentos de gobierno
- links relativos validos entre `overview/`, `features/`, `domains/`, `decisions/` y `reference/`
- `status.md` por track actualizado despues de cada implementacion relevante
- decisiones transversales registradas en `decisions/`

## Checklist operativo

1. revisar que no existan referencias operativas a arboles documentales retirados
2. corregir links rotos detectados en documentos de entrada (`README`, `overview/*`)
3. verificar que el workflow de 5 fases este alineado en reglas e instrucciones
4. confirmar que cada track mantenga su `status.md` y sus documentos locales equivalentes al dia
5. registrar cada lote de sincronizacion cuando cambie el estado operativo descrito por `overview/` o `domains/`

## Proximo uso recomendado

Al cerrar cambios estructurales de documentacion:
- actualizar este estado
- actualizar `docs-cutover-plan.md` si cambia la estrategia
- dejar trazabilidad de decisiones en `decisions/open-questions.md` solo cuando aplique
- usar `features/*/status.md` + `decisions/stage-0-architecture-decisions.md` como referencia cruzada antes de afirmar que el arbol ya quedo alineado
