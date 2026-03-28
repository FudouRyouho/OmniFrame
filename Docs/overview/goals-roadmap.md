# Goals Roadmap

> Estado: activo
> Rol: ordenar los goals del proyecto y su dependencia entre tracks
> Fuente de verdad de: prioridades y orden de trabajo recomendado
> No usar para: detalle de implementacion interna de un track
> Depende de: `current-state.md`
> Ultima actualizacion: 2026-03-28

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

Objetivo medio vigente:
- validar primero un corte S6: engine puro acotado + integration minima + UI dev textual
- Arsenal final y HUD final quedan para una fase posterior

Depende de:
- Goal 1 parcial
- estabilidad suficiente del goal de data foundation
- fuente numerica de mods suficientemente operativa para arrancar engine core; edge cases aun pendientes

Estado operativo actual:
- engine core v1, Resolver forward, Loadout e integration minima ya estan implementados
- el siguiente pendiente real de esta linea es B4, wiring real y persistencia

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

Estado operativo actual:
- `LoadoutProvider` ya existe como frontera de integracion activa
- HUD y Arsenal ya consumen el vertical slice minimo del builder
- queda wiring real con seleccion/persistencia y la UI final de producto

## Goal transversal - Preparar el cutover documental

Objetivo:
- completar el cleanup posterior al renombre y dejar estable el arbol documental activo

Incluye:
- ledger de migracion
- cierre de referencias heredadas en docs activos
- plan de corte controlado

Documento principal:
- `docs-cutover-plan.md`

## Orden recomendado

1. estabilizar semantic pipeline y schema de habilidades
2. cerrar contrato del builder engine y fuente numerica de mods
3. consolidar el vertical slice minimo ya implementado
4. cerrar B4, wiring real y persistencia
