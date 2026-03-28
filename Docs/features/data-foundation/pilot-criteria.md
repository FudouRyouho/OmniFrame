# Criterios del Piloto — mod-stats.override.json

> Estado: activo
> Rol: definir qué valida el piloto, cuándo se considera exitoso y cuándo falla
> Fuente de verdad de: criterios de aceptación del piloto de mods
> No usar para: cobertura general de mods ni planificación de escalado
> Depende de: `../../domains/data/mods/schema.md`, decisiones C9, C10, C12–C28
> Última actualización: 2026-03-27

## Propósito del piloto

Validar que el contrato definido en `schema.md` es suficientemente abstracto para
representar casos reales del juego sin forzar el modelo ni requerir inferencia externa.
El piloto no es una migración — es una prueba de solidez del schema en entorno controlado.

## Criterio 1 — Selección de casos

Los mods del piloto se identifican y redactan de forma manual por el usuario.
La selección debe abarcar **un representante por tipo de caso**, no una muestra aleatoria:

| Tipo de caso | Objetivo |
|---|---|
| Stat simple sin condición | Validar el shape mínimo |
| Stat con múltiples `upgradeType` en el mismo label | Validar array `values[]` con N entradas |
| Stat con condición activa | Validar campo `condition` no-null y registro en catálogo |
| Mod de warframe (no de arma) | Validar que el `upgradeType` de warframe funciona con el mismo shape |
| Múltiples stats independientes en el mismo mod | Validar `stats[]` como array de N entradas |
| Caso "ligeramente fuera de regla" | Stress-test del schema — ver Criterio 2 |

El usuario determina cuántos mods entran y cuáles son cuando la selección se redacte.
No hay número fijo — la cobertura por tipo importa más que el volumen.

## Criterio 2 — Condición de éxito

El piloto es exitoso cuando el schema **resiste stress** en entorno controlado:

1. Todos los casos seleccionados tienen representación válida bajo el shape de `schema.md`
   sin necesidad de modificar el contrato
2. Los valores `baseValue[]` por rank son verificables contra fuente conocida
   (wiki o `warframe-items`) para cada caso
3. Los casos con `condition` no-null tienen su identificador registrado en
   el catálogo incremental de condiciones
4. Los casos "ligeramente fuera de regla" también encajan — el schema los absorbe
   sin necesitar extensiones ni campos adicionales no previstos

> "Ligeramente fuera de regla" significa: stat con comportamiento poco común pero
> dentro del universo de mods estándar. No incluye augmentos, incarnon, archon shards
> ni mecánicas que ya tienen schema propio planificado.

## Criterio 3 — Condición de falla que reabre debate del schema

El piloto **falla y requiere re-abrir debate** (no solo corregir datos) cuando:

1. **El schema no puede representar un caso sin inferencia** — si el engine necesita
   "adivinar" qué hacer con el dato, o necesita lógica adicional no derivable del
   shape, el modelo no es suficientemente abstracto
2. **Un caso real requiere un campo no previsto** — si el shape de `schema.md` debe
   extenderse para acomodar algo dentro del scope del piloto
3. **`baseValue` necesita estructura no-lineal** — si la progresión por rank de algún
   mod real no puede expresarse como array plano de valores numéricos (C25)
4. **`condition` necesita múltiples valores simultáneos para un mismo stat** —
   si un stat tiene condiciones compuestas que no caben en un string del vocabulario (C28)
5. **El schema requiere configuración específica por caso** — si el engine necesita
   saber de antemano el tipo de mod para interpretarlo correctamente, el schema
   no es lo suficientemente general

> Regla de oro del fallo: si el schema obliga al engine a *inferir* en lugar de *leer*,
> el schema ha fallado — no los datos.

## Qué no es falla del piloto

- Un mod cuya fuente de datos (wiki / `warframe-items`) tiene el valor incorrecto
  → es un gap de datos, no un fallo del schema
- Un edge case de augmento o mechánica especial que quedó fuera del scope explícito
  → se registra como gap pendiente, no reabre el debate
- Un `upgradeType` que no existe todavía en el catálogo de `upgrade-taxonomy.md`
  → se agrega al catálogo incremental, no es fallo del schema
