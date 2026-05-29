---
Estado: "referencia"
Rol: "Criterios genéricos de evaluación para nuevos schemas de datos (passives, arcanes, vehicles, etc.)"
Version: "v0.1.0"
Impacto_ID: "D-Schema-Pilot-Template"
Fidelidad_Fisica: "docs/data/schemas/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-25"
---

# Criterios genéricos de evaluación de schemas

Template aplicable cuando se diseña un **nuevo schema de datos** (passives, arcanes, vehicles, etc.). El piloto original de abilities/mods cerró exitosamente con D-11 y D-12 (2026-05-22); este documento captura las lecciones generalizadas para schemas futuros.

## Criterio 1 — Volumen de cobertura

No hay número fijo. La **cobertura por tipo de caso** importa más que el volumen bruto. Buscar:

- **Caso simple** representativo (el más frecuente)
- **Caso exclusivo** (múltiples estados mutuamente excluyentes)
- **Caso aditivo** (múltiples estados coexistentes)
- **Caso límite** (mecánica que estresa la abstracción)

## Criterio 2 — Condición de éxito

El piloto es exitoso cuando el schema **resiste stress** en entorno controlado:

1. Todos los casos seleccionados tienen representación válida bajo el shape propuesto, sin modificar el contrato.
2. Los valores son verificables contra fuente conocida (wiki, `warframe-items`, captura manual).
3. Casos con `condition` no-null tienen su identificador registrado en el catálogo incremental de condiciones (cuando aplique).
4. Casos "ligeramente fuera de regla" también encajan — el schema los absorbe sin requerir campos adicionales no previstos.

## Criterio 3 — Condición de falla (reabre debate del schema)

El piloto **falla y requiere re-abrir debate** (no solo corregir datos) cuando:

1. **El schema no puede representar un caso sin inferencia** — si el engine necesita "adivinar" qué hacer con el dato, o necesita lógica adicional no derivable del shape, el modelo no es suficientemente abstracto.
2. **Un caso real requiere un campo no previsto** — si el shape debe extenderse para acomodar algo dentro del scope del piloto.
3. **La progresión por rank/valor necesita estructura no-lineal** que no puede expresarse como array plano.
4. **`condition` necesita múltiples valores simultáneos** para un mismo stat — condiciones compuestas que no caben en un string del vocabulario.
5. **El schema requiere configuración específica por caso** — si el engine necesita saber de antemano el tipo para interpretarlo correctamente.

> **Regla de oro del fallo:** si el schema obliga al engine a _inferir_ en lugar de _leer_, el schema ha fallado — no los datos.

## Qué NO es falla del piloto

- Un dato cuya fuente (wiki / `warframe-items`) tiene el valor incorrecto.
- Un edge case especial fuera del scope explícito del piloto.
- Un token de vocabulario que no existe todavía en el catálogo correspondiente (ej. [`../../semantic/upgrade-tokens.md`](../../semantic/upgrade-tokens.md)).

## Aplicación a schemas pendientes

| Schema | Estado actual | Casos canónicos sugeridos |
|---|---|---|
| `passives.json` | Sin schema definido | Ash (mod global), Hydroid (cambio de regla), Frost (condición transversal) |
| `arcanes.json` extendido | `level_stats` sin estructura semántica | Arcane Energize (on-pickup), Arcane Grace (on-status), Arcane Aegis (sustained) |
| Schemas futuros | — | Aplicar criterios 1-3, registrar casos canónicos en [`../decisions.md`](../decisions.md) |
