# Runtime Composition

> Estado: activo
> Rol: describir como se conectan datos, engine, provider y UI
> Fuente de verdad de: limites de la capa de integracion
> No usar para: formulas del engine o backlog visual
> Ultima actualizacion: 2026-03-28

## Responsabilidad de esta capa

La capa de integracion existe para conectar:
- fetch/cache de datos
- hidratacion runtime mientras siga existiendo
- estado del layout activo
- provider del builder
- consumo por UI

No debe:
- redefinir schemas
- contener formulas del engine
- mezclar decisiones visuales con reglas de calculo

## Direccion recomendada

La direccion actual del proyecto favorece un provider como punto central de estado,
con hooks pequenos de lectura y escritura alrededor de ese provider.

Modelo deseado:

```text
data loaders -> provider/layout state -> engine -> view models -> UI
```

Para el **primer corte horizontal** (S6), la vision operativa — rutas `/dev/*`, engine
minimo, catalogo filtrado, flujo de estado a traves de la capa intermedia sin que la UI
llame al motor directamente — ya quedo absorbida por `../engine/architecture.md`,
`../../features/builder-engine/status.md` y `../../decisions/stage-0-architecture-decisions.md`.

Lectura operativa actual:
- OQ-2 ya quedo cerrada (2026-03-28) con `LoadoutProvider` como frontera activa de integracion
- esto no autoriza a mezclar shell con builder state: `ShellProvider` sigue resolviendo solo estado derivado de rutas

## Casos que viven aqui

- `warframeData.ts` y su hidratacion runtime actual
- `LoadoutProvider` y sus hooks de lectura/escritura
- transformaciones de wiring entre entities y el engine
- carga runtime de datasets para el Resolver (`engine/runtime-deps.ts`)

Estado real hoy:
- `LoadoutProvider` ya existe en `Project/src/providers/Loadout/loadout-context.tsx`
- el provider se monta en `main.tsx` con jerarquia `DataState -> Loadout -> Menu -> Shell -> Theme -> App`
- HUD y `ArsenalView` ya consumen el estado real del loadout y los outputs derivados del engine
- el principal pendiente de esta capa ya no es crear el provider, sino cerrar B4, persistencia y wiring real desde equipment/Profile

## Dependencias

- `../../features/builder-engine/status.md`
- `../../decisions/open-questions.md`
- `../data/abilities/pipeline.md`
- `runtime-hydration.md`
- `../../features/navigation-shell/dependencies.md`
