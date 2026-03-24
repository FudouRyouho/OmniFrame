# Goals Roadmap

> Estado: activo
> Rol: ordenar los goals del proyecto y su dependencia entre tracks
> Fuente de verdad de: prioridades y orden de trabajo recomendado
> No usar para: detalle de implementacion interna de un track
> Depende de: `current-state.md`
> Ultima actualizacion: 2026-03-21

## Goal 1 - Estabilizar abilities data

Objetivo:
- fijar un flujo claro entre fuente canonica, markdown semantico, parser, merge y override

Incluye:
- schema de `ability-stats.override.json`
- pipeline semantico
- reglas de `upgradeBy`, `upgradeType`, grupos y augments

Track principal:
- `../features/semantic-pipeline/status.md`

Desbloquea:
- calculo real de habilidades en el builder
- migracion futura de hidratacion a build time

## Goal 2 - Definir e implementar el builder engine v1

Objetivo:
- construir un motor puro `calculate(layout, context) -> EngineOutput`

Incluye:
- contrato de entrada y salida
- formula base de armas y warframes
- integracion inicial de habilidades
- estrategia para mods con condiciones, stacks y overrides

Track principal:
- `../features/builder-engine/status.md`

Depende de:
- Goal 1 parcial
- estabilidad suficiente del goal de data foundation
- claridad sobre fuente numerica de mods

## Goal 3 - Consolidar shell, rutas e integracion

Objetivo:
- conectar el engine futuro con una capa de integracion estable y una UI desacoplada

Incluye:
- provider de layout activo
- HUD y menu
- rutas faltantes
- composicion runtime entre data, engine y UI

Track principal:
- `../features/navigation-shell/status.md`

Depende de:
- contrato del builder engine

## Goal transversal - Preparar el cutover documental

Objetivo:
- completar el cleanup posterior al renombre y dejar estable la convivencia con `Docs-legacy/`

Incluye:
- ledger de migracion
- validacion manual de legacy
- plan de corte controlado

Documento principal:
- `docs-cutover-plan.md`

## Orden recomendado

1. estabilizar semantic pipeline y schema de habilidades
2. cerrar contrato del builder engine y fuente numerica de mods
3. implementar capa de integracion basada en provider
4. conectar UI y layout activo
