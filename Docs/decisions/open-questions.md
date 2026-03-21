# Preguntas Abiertas — OmniFrame

> Estado: activo
> Última actualización: 2026-03-19
> Fuentes: `decisions/mods-builder-analysis.md` §4, `architecture/architecture-audit.md` §DT-*

Este documento es el registro canónico de decisiones pendientes. Cada pregunta tiene
un área, descripción, opciones conocidas, y prioridad estimada.

Prioridades: 🔴 bloqueante | 🟡 importante | 🟢 puede esperar

---

## Post-mortem: el override como sistema de datos

### Qué pasó

Se diseñó un sistema de `modifier` inventados (`DAMAGE_BASE`, `CRIT_CHANCE`, `MULTISHOT`, etc.)
para identificar qué stat modifica cada mod. El `ModStatsEditor` y los archivos
`Project/data/mods/mod.*.stats.json` se construyeron sobre ese sistema.

Al descubrir `Module:Mods/data` en la wiki y añadir `upgradeTypes[]` al fork, quedó claro
que esos `modifier` inventados son un duplicado inferior de lo que DE ya expone canónicamente.
`upgradeTypes` cubre el ~85% de los mods sin necesidad de override manual.

### Decisiones tomadas (2026-03-19)

**D1 — Override: reducir al mínimo necesario** ✅ Decidido

El override queda reducido a un único caso de uso real: `misc` para augmentos UNIQUE
(efectos Lua sin `upgradeType` canónico).

- `label` con templates `|val1|`: no necesario. La descripción la provee `warframe-items` directamente.
- `values[]` por rango: no necesario en la UI inmediata. Cuando el builder los necesite,
  vendrán del fork (D2) para el ~95% de los mods. El override de `values[]` solo tendría
  sentido para casos con progresión genuinamente no lineal que el Public Export no cubra.
- `modifier` inventado: eliminado. Obsoleto desde que existe `upgradeTypes`.
- `misc`: campo reservado para override futuro. La estructura de mods debe incluir `misc: []`
  como placeholder, sin poblar entradas hasta que el builder lo necesite. Mantener
  entradas `misc` pobladas ahora solo genera contexto fuera del estado real del proyecto.

Implicación en código:
- Eliminar `ModModifier`, `MOD_MODIFIERS`, `MOD_MODIFIER_GROUPS` de `types.ts` y `editor-types.ts`.
- El `ModStatsEditor` puede simplificarse o archivarse — no tiene utilidad inmediata.
- Los archivos `mod.*.stats.json` actuales son contexto histórico, no bloquean nada.

**D2 — Ampliar el fork: revisado** ⚠️ Hallazgo crítico

El `ExportUpgrades_en.json` del Public Export de DE **no contiene** `Upgrades[]`,
`UpgradeType`, `OperationType`, `Value`, `DamageType`, `ValidPostures` ni `ValidProcTypes`.
Solo tiene `levelStats` como texto plano — idéntico a lo que ya tiene `@wfcd/items`.

Los datos estructurados de Overframe vienen de una fuente diferente al Public Export
accesible. Los Gaps A, B y C no se pueden cerrar con el Public Export.

Opciones reales para los gaps:
- Gap A (tipo de daño): parsear `levelStats` o tabla de lookup estática por `uniqueName`
- Gap B (condiciones): tabla de lookup estática para los ~20 mods afectados
- Gap C (OperationType): inferir por `upgradeType` — cada tipo tiene siempre el mismo

El build del fork sigue siendo necesario para obtener `upgradeTypes[]` y los campos
del wikia en el JSON de salida. Ver `architecture/warframe-items-changes.md` §D2.

**D3 — El builder nace como texto plano** ✅ Decidido

El builder arranca como lógica pura sin UI. La UI del builder es el "punto de quiebre":
se aborda cuando la lógica tenga peso real en el proyecto y la taxonomía canónica
esté correctamente documentada para todos los apartados (mods, warframes, arcanos,
compañeros — falta documentación en varios de estos).

Orden de trabajo:
1. D2: ampliar el fork con datos canónicos del Public Export
2. DT-11: diseñar la arquitectura del motor de cálculo (documento de arquitectura)
3. Completar la taxonomía canónica para cada apartado antes de que el motor la consuma
4. Implementar el motor como lógica pura (funciones/módulos sin UI)
5. UI del builder: cuando la lógica tenga suficiente cobertura para justificarla

**D4 — Sintaxis del engine en todo el ecosistema** ✅ Decidido (2026-03-19)

Adoptar los identificadores del engine (`AVATAR_ABILITY_*`) en lugar de las abreviaciones
del scraper (`STRENGTH`, `RANGE`, etc.) en `ability-stats.json` y `types.ts`.

Razón: los mods de warframe ya usan `AVATAR_ABILITY_STRENGTH` en `upgradeTypes[]`.
El módulo de la wiki usa los mismos identificadores. La normalización del scraper
era un mapeo innecesario que rompía la coherencia entre mods y habilidades.
Con D4, el builder puede cruzar ambos sistemas sin ninguna tabla de traducción.

Ver `analysis/ability-stats-audit.md` §7 y §8 para el análisis completo.

**D5 — Schema de AbilityStatValue: `upgradeType` + `upgradeBy`** ✅ Decidido (2026-03-19)

Un stat de habilidad tiene dos dimensiones semánticas distintas que requieren
dos campos separados:

- `upgradeType` — qué modifica/mejora este stat (el efecto sobre el mundo)
  Solo presente cuando la habilidad actúa como modificador externo.
  Usa el mismo vocabulario canónico que `upgradeTypes[]` en mods.
  Ejemplos: `WEAPON_DAMAGE_AMOUNT` (Roar), `WEAPON_ATTACK_SPEED` (Warcry)

- `upgradeBy` — con qué variable del engine escala el valor base
  Siempre presente. Es la variable de la fórmula `upgradeBy * baseValue`.
  Ejemplos: `AVATAR_ABILITY_STRENGTH`, `AVATAR_ABILITY_RANGE`, `AVATAR_ABILITY_DURATION`

Para stats propios de la habilidad (daño, rango, duración): solo `upgradeBy`.
Para buff abilities (Roar, Warcry, Volt Speed): ambos campos.

Esto resuelve también D6 — no se necesita un campo `effectType` separado.
`upgradeType` ya cubre ese rol con el vocabulario canónico del engine.

**D6 — Buff abilities: resuelto por D5** ✅ Decidido (2026-03-19)

El campo `upgradeType` de D5 cubre los casos de habilidades que modifican
stats externos (armas, warframe, compañeros). No se necesita campo adicional.
Ver D5 para el schema completo.

**D7 — `label` canónico temporal** ✅ Decidido (2026-03-19)

Usar el `Label` del módulo de la wiki (`Module:Ability/data/stats`) directamente
como valor del campo `label` en `ability-stats.json`.

- Formato: texto con placeholders `|val1|`, `|val2|` — compatible con `FormattedText.tsx`
- i18n: no es objetivo del builder v1 — el módulo solo existe en inglés
- Fuente: canónica (misma que el scraper ya usa), no inventada
- Cuando i18n sea necesario, se resuelve en el scraper, no en el schema

**D8 — Sistema de energía/eficiencia** ⏳ Pendiente de investigación (2026-03-19)

El consumo de energía no es un patrón uniforme. Hallazgos del módulo:

Patrones identificados:
- Coste fijo: `(2 - EFF) * cost` — la mayoría de habilidades
- Drain por segundo (toggle): `(2 - EFF) * X / DUR` — Hysteria, Exalted Blade, etc.
- Drain por segundo con TARGET: `(2 - EFF) * X / DUR * TARGET` — Oberon Renewal
- Drain por segundo con EFF y DUR independientes: `(2-EFF)*12/DUR` — Sound Quake
- Coste por acción: `(2 - EFF) * X / COMBO` — Atlas Landslide, Valkyr Rip Line
- Coste en shields (no energía): Hildryn — sistema completamente distinto
- Coste especial Equinox: Pacify & Provoke tiene drain por enemigo en rango

Pendiente: catalogar todos los patrones del módulo y definir el schema.
Ver `analysis/ability-formulas.md` §Energía para el catálogo completo.
Bloqueante para: schema final de `AbilityStatValue`, DT-11.

---

## Próximo paso inmediato

Estado del pipeline de datos (completado 2026-03-19):
- Fork `warframe-items` construido con `upgradeTypes[]`, `maxRank`, `modClass`, `isExilus`, `isWeaponAugment`, `incompatible`
- `Project/src/lib/types.ts` actualizado con `Mod` expandida, `ModClass`, `UpgradeType`
- `Project/public/data/mods.json` regenerado — 1804 mods con campos canónicos
- Archivos override legacy (`mod.*.stats.json`) eliminados

Estado del pipeline semántico de habilidades (en progreso 2026-03-20):
- `utilities/parse-semantic.mjs` — parser funcional, output keyed por uniqueName
- `references/Semantic/Ash.md` — primer .md en formato nuevo (con uniqueNames en `##`)
- Resto de .md completos en formato antiguo — pendientes de migrar
- Flujo documentado en `.kiro/steering/omniframe-context.md` y `analysis/ability-stats-gap.md`

Estado del modelo de habilidades:
- D4-D7 decididos — sintaxis del engine, schema `upgradeType`/`upgradeBy`, `label` canónico
- D8 pendiente — sistema de energía catalogado en `analysis/ability-formulas.md` §Energía
- DT-6 (migración de ability-stats.json) pendiente — no bloquea el pipeline semántico

Siguiente paso: migrar los .md completos al nuevo formato (uniqueNames en `##`) y
ejecutar el parser para generar el output. Ver `analysis/ability-stats-gap.md` para el estado.

---

## Builder / Mods

### Q1 — Fuente de valores numéricos de mods
Área: architecture/builder
Prioridad: ✅ Cerrado — ver D2

Decisión: ampliar el fork con `Value`, `DamageType`, `ValidPostures`, `ValidProcTypes`,
`OperationType` del Public Export. El parseo de `levelStats` es innecesario para el ~85%
de los mods. D2 es el próximo paso de implementación.

### Q2 — Modelo de condiciones de activación cross-sistema
Área: architecture/builder
Prioridad: 🔴 bloqueante — afecta schema del override y motor del builder

¿Cómo se modelan las condiciones de activación para mods y habilidades?

Opciones:
- A) Adoptar `ValidPostures` del Public Export directamente — máxima fidelidad canónica
- B) Abstraer en `condition: string` — más legible, semántica propia
- C) Toggle en el builder — el usuario activa/desactiva condiciones manualmente

Nota: los triggers de evento (On Kill, On Hit) son distintos de las posturas (AIMING,
AIRBORNE). Probablemente se modelan como "asumir activo" (max stacks) o como toggle.
Pendiente de decidir en DT-11.

### Q3 — Modelo de OperationType
Área: architecture/builder
Prioridad: 🟡 importante

¿Cómo se modela `OperationType` (STACKING_MULTIPLY, STACKING_LINEAR, OVERRIDE)?

Opciones:
- A) Inferir por upgradeType — cada tipo tiene siempre el mismo OperationType
- B) Incluir explícito en el fork (depende de Q1-A)

Pendiente de decidir en DT-11. Con D2 resuelto, B es trivial.

### Q4 — Modelo de stacks Galvanized
Área: architecture/builder
Prioridad: 🟡 importante

¿Cómo se modelan los mods Galvanized (stat base + stat condicional On Kill)?

Opciones:
- A) Asumir max stacks (como Overframe) — DPS teórico máximo
- B) Exponer slider de stacks en el builder — más flexible
- C) Mostrar ambos valores (base y max stacks) — más informativo

Pendiente de decidir en DT-11.

### Q5 — Mods con upgradeTypes: [] (augmentos UNIQUE)
Área: architecture/builder
Prioridad: � puede esperar

¿Qué hace el builder con mods que tienen `upgradeTypes: []`?

Opciones:
- A) Ignorarlos en el cálculo — solo mostrar en el card
- B) Mostrar como "efecto especial" sin cálculo con descripción del override
- C) Marcar como UNIQUE y documentar en el override (`misc`)

---

## Arquitectura / Sistema

### DT-4 — Vistas de Mods y Arcanos
Área: architecture/navigation
Prioridad: 🟡 importante

`ModsView.tsx` está implementado pero no está en las rutas ni en `DialogMenu.tsx`.
La vista de Arcanos no existe.

Decisiones pendientes:
- ¿Añadir ModsView a rutas y DialogMenu.tsx?
- ¿Diseño de la vista de Arcanos?
- ¿Filtrado jerárquico de compañeros por subtipo?

### DT-5 — Arquitectura de rutas
Área: architecture/navigation
Prioridad: � puede esperar

`App.tsx` define rutas inline. ¿Cuándo mover a `src/config/routes.ts`?
Trigger sugerido: cuando se implementen las rutas de Arsenal, Mods, Arcanos, Options, Profile.

### DT-6 — Migrar ability-stats.json a sintaxis del engine
Área: architecture/data
Prioridad: 🔴 bloqueante para el builder — afecta coherencia con upgradeTypes

**D4 y D5 decididos (2026-03-19)** — ver `analysis/ability-stats-audit.md` §7-8 y `analysis/ability-stat-model.md` §3.

Schema de `AbilityStatValue` definido por D5:
- `upgradeBy` — reemplaza a `modifier` — con qué variable del engine escala el valor base
- `upgradeType?` — opcional — qué modifica la habilidad externamente (solo buff abilities)
- `baseValue`, `cap?`, `capMin?`, `helminthBase?`, `helminthCap?`, `inverse?` — campos canónicos

Migración requerida en `modifier`:
- `STRENGTH` → `AVATAR_ABILITY_STRENGTH`
- `RANGE` → `AVATAR_ABILITY_RANGE`
- `DURATION` → `AVATAR_ABILITY_DURATION`
- `EFFICIENCY` → `AVATAR_ABILITY_EFFICIENCY`
- `ENERGY_DRAIN` y `NONE` sin cambio (pendiente D8 para definir si `ENERGY_DRAIN` se divide)

Archivos afectados: `types.ts` (`AbilityScaling` → renombrar `modifier` a `upgradeBy`, añadir `upgradeType?`),
`ability-stats.json` (script de migración), scraper/transformer (eliminar normalización),
componentes con comparaciones hardcodeadas.

Pendiente también: capturar `Val2`/`Val3`, `HelminthMax`, `InverseModifier` del módulo
actualizando el scraper — no editar el JSON a mano.

Bloqueante parcial: D8 debe cerrarse antes de ejecutar la migración completa
(para saber si `ENERGY_DRAIN` se mantiene o se divide en `ENERGY_COST`/`ENERGY_DRAIN`).

### DT-7 — Eliminar Nav.tsx legacy
Área: architecture/components
Prioridad: 🟢 puede esperar

`Nav.tsx` tiene NavLinks a rutas que no existen en `App.tsx`. No está importado en
ningún archivo activo. Candidato a eliminar cuando se confirme que no hay nada reutilizable.

### DT-8 — Diseño visual de la caja de layout activo en HudHeader
Área: architecture/ui
Prioridad: 🟡 importante (depende de DT-11)

`HudHeader.tsx` tiene implementación básica funcional. Pendiente: la caja de layout
activo (Warframe + armas + compañero del layout activo).

Decisión pendiente del usuario: diseño visual de la caja.
Bloqueante: DT-11 (Builder) y `layout-context.tsx`.

### DT-9 — Implementar rutas y vistas faltantes, conectar ThemeSelector
Área: architecture/navigation
Prioridad: � importante

`DialogMenu.tsx` solo muestra rutas con `label`. Rutas previstas: Arsenal, Equipment,
Mods, Arcanes, Options, Profile. `ThemeSelector.tsx` debe ser accesible desde `/options`.

### DT-10 — Reorganizar CSS con sistema de variables semánticas
Área: architecture/css
Prioridad: 🟢 puede esperar

CSS actual es plano. Necesita: sistema de variables semánticas, clases de componentes
reutilizables (buttons, panels, borders con estética Orokin/HUD), separación entre
estilos de layout, componentes y temas.

### DT-11 — Diseñar arquitectura del motor de cálculo del builder
Área: architecture/builder
Prioridad: 🔴 bloqueante — DT-8, DT-12 dependen de esto

El Builder es el núcleo funcional de la app. No existe ninguna implementación.
El motor nace como lógica pura sin UI (ver D3). La UI es el punto de quiebre posterior.

Estado de prerequisitos (2026-03-19):
- ✅ `upgradeType`/`upgradeBy` en habilidades — D5 decidido
- ✅ `label` en ability-stats — D7 decidido (texto canónico del módulo)
- ✅ Valores numéricos de mods — `upgradeTypes[]` del fork, `levelStats` para el resto
- ⏳ Arcanos en el mismo modelo que mods o modelo propio — pendiente GAP-DOC-2
- ⏳ D8 (energía) — pendiente, no bloquea el diseño inicial del motor

Prerequisito inmediato: cerrar D8 y GAP-DOC-2 antes de escribir el documento de arquitectura.
Ver `analysis/ability-formulas.md` para las fórmulas completas del engine.

### DT-12 — Diseñar estructura de datos para layouts/builds y vista de perfil
Área: architecture/profile
Prioridad: 🟡 importante (depende de DT-11)

Vista de perfil del usuario con sus layouts y builds guardados.
Decisión pendiente: estructura de datos para layouts/builds.

---

## Datos / Gaps de documentación

### GAP-DOC-1 — Auditoría de datos de habilidades
Área: analysis/warframes
Prioridad: ✅ Completado — ver `analysis/ability-stats-audit.md`

Auditoría completada (2026-03-19). Los datos existentes son reales (del módulo de la wiki).
Gaps de cobertura identificados: Val2/Val3, HelminthMax, InverseModifier, RoundTo.
Acción pendiente: actualizar el scraper, no el JSON a mano.

### GAP-DOC-2 — Arcanos: datos base generados, override pendiente
Área: analysis/arcanes
Prioridad: 🟡 importante

`Project/public/data/arcanes.json` generado (2026-03-21) — 165 arcanos desde `@wfcd/items`.
Campos: `uniqueName`, `name`, `type`, `entity` (entidad del Layout), `rarity`, `maxRank`, `levelStats[]`.

Pendiente: `arcane-stats.json` (override de valores numéricos por rango) — mismo patrón que `mod-stats.json`.
Los arcanos no tienen `upgradeTypes` — sin cobertura canónica de stat. Los efectos numéricos
vendrán del override cuando el builder los necesite.

Ver análisis de estructura en `Docs/analysis/arcane-data-analysis.md` (pendiente de crear).

### GAP-DOC-3 — Sin documentación de análisis de datos para Compañeros
Área: analysis/companions
Prioridad: � puede esperar

No existe documento de análisis de datos para Compañeros más allá de `compatName`.
Estructura de datos, tipos de compañeros, filtrado jerárquico.

### GAP-DOC-4 — Sin documentación de arquitectura del Builder
Área: architecture/builder
Prioridad: � bloqueante (ver DT-11)

No existe documento de arquitectura del motor de cálculo del builder.
Prerequisito de DT-11. Debe cubrir: modelo de datos de entrada, pipeline de cálculo,
modelo de stacks, condiciones de activación, y taxonomía canónica de upgradeTypes.

### GAP-DOC-5 — Sin documentación de arquitectura CSS/estilos
Área: architecture/css
Prioridad: � puede esperar

No existe documento de arquitectura del sistema de estilos.
Solo existe DT-10 en `architecture/architecture-audit.md` como nota.

### GAP-DOC-6 — Sin documentación de arquitectura de rutas/navegación
Área: architecture/navigation
Prioridad: 🟢 puede esperar

No existe documento de arquitectura de rutas.
Solo existe DT-5 en `architecture/architecture-audit.md` como nota.
