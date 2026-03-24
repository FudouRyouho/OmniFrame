# S6 — Mínimo horizontal (engine, capa intermedia, UI dev)

> Estado: activo
> Rol: fijar la vision operativa del cierre S6: fundamento claro sin arquitectura final
> Fuente de verdad de: alcance y limites del primer corte v1 del builder
> No usar para: formulas completas del juego, rutas de producto, ni diseño del HUD
> Depende de: `../../domains/engine/builder-v1.md`, `../../domains/integration/runtime-composition.md`, `../navigation-shell/status.md`, `../../overview/stabilization-backlog.md`
> Ultima actualizacion: 2026-03-22

## Que problema resuelve S6

Warframe acumula mecanicas raras; el builder pretende respetarlas. Antes de invertir en
vistas de producto, rutas de equipo o layout completo, hace falta una **columna vertebral**
minima:

```text
engine (calculo puro, acotado) <-> capa intermedia (estado + orquestacion) <-> UI dev (texto)
```

S6 **no** define la arquitectura definitiva. Si define **fundamentos** y un lugar donde
**comprobar** que las cuentas tienen sentido bajo los conceptos de v1.

## Alcance: solo `/dev/*`

- El trabajo inicial vive en **rutas y vistas bajo `/dev/*`**.
- **No** se debe acoplar aun al shell de producto (equipment, HUD, menu) como consumidor
  principal: esa UI probablemente requiera cambios profundos cuando el sistema trabaje en
  conjunto.
- Objetivo: impacto minimo en lo ya implementado fuera de dev.

## Engine minimo

- Calculos **sencillos** de stats de warframe y de arma (v1 acotado), manejables y legibles.
- Uso de **clases** e instancias (`engine.*` o modulos equivalentes) es **opcion valida** para:
  - reutilizar contexto de calculo bajo el mismo estado
  - no repetir en cada “stage” que magnitudes entran al calculo
- El motor sigue siendo **puro respecto a React**: sin hooks dentro del nucleo; la UI no
  contiene formulas de reglas de juego.
- Contrato conceptual alineado a `builder-v1.md`; el alcance numerico es deliberadamente
  pequeño hasta validar mecanica.

## Capa intermedia (“API” / provider / hooks)

- Puede ser **provider, hooks o ambos**; debe permitir **evolucionar** con poco roce.
- Vision de flujo: la **capa intermedia consume el engine** y **entrega a la UI** datos ya
  estructurados para mostrar o editar. La UI **no** pregunta “que deberia calcularse” en
  cada interaccion: el flujo de datos va **desde estado de build -> intermediario -> engine
  -> resultado -> intermediario -> UI**.
- “Bidireccional” aqui significa: **el estado del build puede cambiar desde la UI** y el
  intermediario vuelve a ejecutar el camino hacia el engine y actualizar resultados — no que
  la UI invoque el motor directamente ni que el intermediario duplique formulas del engine.
- Limites: lo ya dicho en `runtime-composition.md` — sin fórmulas de negocio duplicadas, sin
  redefinir schemas canonicos.

## UI minima

- **Texto plano** (listados, JSON legible opcional, etiquetas simples).
- **No** el catalogo completo del juego: se trabaja con una **seleccion minima** bajo un
  **filtro explicito** (que warframes, que armas por tipo, etc.) para poder **deducir si las
  cuentas tienen sentido** frente a mecanicas de v1.
- No existe aun en producto una vista de estadisticas de build ni el flujo “objeto -> crear
  build”; tampoco la separacion completa entre “layout warframe + armas + …” y “solo
  warframe + derivados (exaltada, etc.)”. Eso queda **fuera** del criterio de exito de S6,
  salvo mencion como deuda conocida.

## Relacion con vistas y layout futuros

- El objetivo de v1 en este corte es demostrar **logica < consumidor > UI** coherente.
- Las rutas de producto, el layout activo global y el arsenal visual se apoyaran despues en
  esta columna cuando el modelo de datos y el engine lo permitan.

## Relacion con otros documentos

- `file-structure.md` — ubicacion objetivo del motor bajo `features/arsenal/engine/`; el
  primer codigo puede aparecer ahi o en modulos vecinos siempre que las importaciones desde
  `/dev` sigan siendo claras.
- `placeholder-minimums.md` — expectativas de Arsenal y layout; S6 alimenta la inspeccion
  previa a ese producto.
- `status.md` — estado de implementacion del track.
