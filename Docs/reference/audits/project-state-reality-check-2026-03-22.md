# Project State Reality Check — 2026-03-22

> Estado: referencia
> Rol: snapshot de contraste entre documentacion y repo en la fecha 2026-03-22
> Fuente de verdad de: observaciones verificadas en `Project/`, `utilities/` y `references/` en ese corte
> No usar para: estado operativo actual ni decisiones cerradas de arquitectura
> Depende de: `../../overview/current-state.md`, `../../features/`
> Ultima actualizacion: 2026-03-28

> **Nota 2026-03-28**: este reality check fue superado por la implementacion post-Paso 18
> y por la resincronizacion documental posterior. Para lectura actual usar primero
> `Docs/overview/current-state.md`, `Docs/features/*/status.md` y, en abilities,
> `Docs/features/semantic-pipeline/status.md`.

## Objetivo

Verificar si el estado actual del proyecto coincide con lo que dicen los tracks
activos de `Docs/`, y separar:

- implementado real
- implementacion parcial
- placeholders
- desalineaciones documentales

## Resumen ejecutivo

La documentacion activa describe bien la direccion general del proyecto, pero hoy el
codigo esta en una transicion intermedia:

- el proyecto tiene shell, rutas base, carga de datos y editor de abilities vivos
- el builder engine real sigue sin existir
- el pipeline de abilities existe, pero esta fragmentado entre scripts viejos y nuevos
- el tipado del proyecto quedo desalineado con parte de la UI
- el build de TypeScript no pasa

La conclusion practica es esta:

- el proyecto no esta vacio
- el proyecto tampoco esta en estado "implementable desde docs" sin primero cerrar
  la migracion de tipos y del pipeline de abilities

## Estado verificado por track

## 1. Semantic Pipeline

### Confirmado

- `utilities/parse-semantic.mjs` existe y ya genera salida con `groups`.
- `Project/public/data/ability-stats.json` usa el schema nuevo con `groups`.
- `Project/data/ability-stats.json` y `Project/public/data/ability-stats.json`
  son hoy identicos en contenido.
- `references/Semantic/` ya no es un caso piloto minimo:
  - 63 archivos `.md`
  - 248 headers activos `## /Lotus/...`
  - 0 headers `##!` detectados en esta revision

### Desalineaciones

- `Docs/features/semantic-pipeline/status.md` sigue mostrando el estado heredado:
  - "1 warframe en formato nuevo"
  - "26 warframes en formato antiguo"
  - "35 placeholders"
  Ese snapshot ya no representa el estado real del directorio `references/Semantic/`.

- El pipeline existe, pero no como flujo unico:
  - `parse-semantic.mjs` trabaja con `groups`
  - `generate-data.mjs` consume `Project/data/ability-stats.json`
  - `migrate-ability-stats.mjs` opera sobre `Project/public/data/ability-stats.json`
  - en ese corte `verify-ability-stats.mjs` todavia validaba el schema viejo con `stats[]`
  - `extract-ability-stats.mjs` tambien sigue leyendo/escribiendo bajo supuestos viejos

### Interpretacion

El problema principal del track ya no es "no hay pipeline", sino:

- hay pipeline parcial
- hay demasiados scripts de transicion
- no hay una sola ruta canonica de entrada/salida

## 2. Data Foundation

### Confirmado

- `generate-data.mjs` genera `warframes.json`, `weapons.json`, `mods.json`,
  `passives.json` y `ability-stats.json`.
- `warframeData.ts` hace hidratacion runtime real:
  - merge de `warframes.json`
  - merge de `ability-stats.json`
  - merge de `passives.json`
  - merge de backup local desde `localStorage`

### Desalineaciones

- La documentacion dice correctamente que `ability-stats.json` sigue siendo base
  activa, pero el estado real es mas fuerte:
  - no solo es base activa
  - hoy sigue siendo una pieza central del runtime

- La duplicacion `Project/data` vs `Project/public/data` no esta documentada como
  decision estable. Hoy ambas copias coinciden, pero el workflow no deja claro cual
  es la fuente canonica de edicion.

### Interpretacion

La base de datos existe y es utilizable, pero la frontera entre:

- fuente editable
- fuente publicada
- fuente generada

no esta cerrada.

## 3. Builder Engine

### Confirmado

- En ese corte no existia motor real de builder.
- `Project/src/features/arsenal/engine/index.ts` era placeholder.
- `Project/src/features/arsenal/ArsenalView.tsx` devolvia `null`.
- `Project/src/features/hud/layout-context.tsx` devolvia `export {}`.

### Implementacion parcial relacionada

- `Project/src/lib/abilityCalc.ts` ya implementa un calculador acotado para stats
  de habilidades.
- Ese calculador no es el builder engine documentado, pero si es una pieza real de
  logica de calculo reusable.

### Interpretacion

La documentacion acierta al decir que el engine real no existe, pero conviene
aclarar que ya hay una semilla de calculo viva en el dominio de abilities.

## 4. Navigation Shell

### Confirmado

- `Project/src/main.tsx` ya monta:
  - `BrowserRouter`
  - `DataStateProvider`
  - `MenuProvider`
  - `ThemeProvider`
- `Project/src/App.tsx` ya define rutas reales.
- `Project/src/features/hud/Hud.tsx` y `HudHeader.tsx` existen y estan montados.
- `Project/src/features/equipment/EquipmentView.tsx` existe y tiene flujo real de
  seleccion de items + panel de detalle.
- `DialogMenu.tsx` funciona como menu global con rutas visibles.

### Desalineaciones

- `HudHeader.tsx` no consume layout real.
- El texto del layout esta hardcodeado.
- El shell existe, pero no esta conectado a un layout vivo ni a un builder.
- Hay features placeholder fuera del flujo principal:
  - `ArcanesView`
  - `OptionsView`
  - `ProfileView`

### Interpretacion

La documentacion acierta en lo esencial:

- hay shell
- hay HUD
- falta wiring real

Pero hoy el proyecto ya esta mas alla de "shell basico":

- ya hay navegacion estable
- ya hay providers montados
- ya hay una vista principal funcional

## Problema estructural no reflejado con suficiente peso

## Build roto por drift de tipos

El hallazgo mas importante de esta revision no es una ausencia de feature, sino una
rotura de consistencia interna:

- `npm run build` falla

Los errores observados se agrupan en tres bloques:

### A. UI vieja consumiendo contracts viejos

- `WarframeDetail.tsx` sigue leyendo `a.stats.stats`, pero el schema actual de
  abilities es `groups`.

### B. Guards demasiado debiles para el nuevo type split

- `isWeapon()` e `isMod()` estrechan por `kind`, pero dejan el valor como
  `BaseItem & { kind: ... }`, no como `Weapon` o `Mod`.
- Por eso `item-details-panel.tsx` y archivos relacionados no pueden acceder
  limpiamente a `attacks`, `rank`, `baseDrain`, etc.

### C. Configuracion TypeScript/Vite incompleta

- `vite.config.ts` usa `resolve(__dirname, ...)`
- faltan tipos o configuracion para Node
- la propiedad `test` no esta tipada como config valida en el estado actual

## Impacto en la lectura de Docs

Hoy `Docs/` describe bien la direccion, pero no refleja con suficiente claridad que:

- el proyecto esta en una migracion de tipos a mitad de camino
- el principal bloqueo inmediato no es el builder engine
- el principal bloqueo inmediato es recuperar consistencia compilable

## Desalineaciones documentales concretas

## Requieren ajuste pronto

- `Docs/features/semantic-pipeline/status.md`
  La seccion de cobertura conocida esta vieja.

- `Docs/overview/current-state.md`
  Deberia decir explicitamente que el build no esta sano y que el proyecto esta en
  migracion tipada.

- `Docs/features/navigation-shell/status.md`
  Deberia reflejar que:
  - el shell y las rutas ya existen
  - el layout sigue hardcodeado
  - el problema no es ausencia total de UI, sino falta de integracion real

- `Docs/features/builder-engine/status.md`
  Conviene aclarar que existe `abilityCalc.ts` como logica acotada, aunque no sea
  el engine v1.

## Direccion practica recomendada

Orden recomendado para seguir sin aumentar deuda:

1. Recuperar build verde.
2. Cerrar la migracion de abilities en UI y scripts.
3. Elegir una sola fuente canonica para `ability-stats.json`.
4. Actualizar los `status.md` con conteos y estado real.
5. Recién despues, en ese contexto, avanzar con provider/layout y engine v1.

## Propuesta concreta de foco inmediato

### Fase 1

- corregir `WarframeDetail.tsx` al schema `groups`
- corregir guards y tipado de `BaseItem -> Weapon | Mod`
- corregir `vite.config.ts`

### Fase 2

- definir si la fuente editable de abilities vive en:
  - `Project/data/ability-stats.json`
  - o `Project/public/data/ability-stats.json`
- adaptar todos los scripts a esa unica decision

### Fase 3

- reescribir los `status.md` principales con el estado verificado
- dejar el builder engine como siguiente paso real, no como prioridad ficticia

## Conclusión

La documentacion nueva ya ordena bien el proyecto a nivel conceptual.

Lo que falta ahora no es otra taxonomia, sino un cierre de coherencia entre:

- tipos
- scripts
- runtime
- estado documentado

Ese cierre es el prerequisito real para retomar una direccion clara de implementacion.
