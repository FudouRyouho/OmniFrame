# Runtime Composition

> Estado: activo
> Rol: describir como se conectan datos, engine, provider y UI
> Fuente de verdad de: limites de la capa de integracion
> No usar para: formulas del engine o backlog visual
> Ultima actualizacion: 2026-03-21

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

## Casos que viven aqui

- `warframeData.ts` y su hidratacion runtime actual
- `layout-context.tsx`
- provider de build/layout
- transformaciones de wiring entre entities y el engine

## Dependencias

- `../data/abilities/pipeline.md`
- `../engine/builder-v1.md`
- `runtime-hydration.md`
- `engine-consumption.md`
- `../../features/navigation-shell/dependencies.md`
