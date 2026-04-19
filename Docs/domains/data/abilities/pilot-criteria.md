---
Estado: "activo"
Rol: "Definir criterios de éxito y falla para la fase piloto del schema de abilities y mods"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Pilot"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Criterios del Piloto de Schema

## Criterio 1 — Volumen del Piloto

No hay número fijo — la cobertura por tipo importa más que el volumen. Se busca cubrir casos simples (Excalibur), exclusivos (Equinox/Chroma) y aditivos (Wisp).

## Criterio 2 — Condición de Éxito

El piloto es exitoso cuando el schema **resiste stress** en entorno controlado:

1. Todos los casos seleccionados tienen representación válida bajo el shape de `schema.md`
   sin necesidad de modificar el contrato.
2. Los valores `baseValue[]` por rank son verificables contra fuente conocida
   (wiki o `warframe-items`) para cada caso.
3. Los casos con `condition` no-null tienen su identificador registrado en
   el catálogo incremental de condiciones.
4. Los casos "ligeramente fuera de regla" también encajan — el schema los absorbe
   sin necesitar extensiones ni campos adicionales no previstos.

## Criterio 3 — Condición de falla que reabre debate del schema

El piloto **falla y requiere re-abrir debate** (no solo corregir datos) cuando:

1. **El schema no puede representar un caso sin inferencia** — si el engine necesita
   "adivinar" qué hacer con el dato, o necesita lógica adicional no derivable del
   shape, el modelo no es suficientemente abstracto.
2. **Un caso real requiere un campo no previsto** — si el shape de `schema.md` debe
   extenderse para acomodar algo dentro del scope del piloto.
3. **`baseValue` necesita estructura no-lineal** — si la progresión por rank de algún
   mod real no puede expresarse como array plano de valores numéricos.
4. **`condition` necesita múltiples valores simultáneos para un mismo stat** —
   si un stat tiene condiciones compuestas que no caben en un string del vocabulario.
5. **El schema requiere configuración específica por caso** — si el engine necesita
   saber de antemano el tipo de mod para interpretarlo correctamente, el schema
   no es lo suficientemente general.

> **Regla de oro del fallo**: si el schema obliga al engine a *inferir* en lugar de *leer*,
> el schema ha fallado — no los datos.

## Qué no es falla del piloto

- Un mod cuya fuente de datos (wiki / `warframe-items`) tiene el valor incorrecto.
- Un edge case de augmento o mecánica especial que quedó fuera del scope explícito.
- Un `upgradeType` que no existe todavía en el catálogo de `upgrade-taxonomy.md`.
