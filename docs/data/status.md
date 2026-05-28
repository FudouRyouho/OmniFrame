---
Estado: "activo"
Rol: "Entry point operativo del dominio data/ — estado de overrides, pipeline y deuda activa"
Version: "v0.1.0"
Impacto_ID: "D-Data-Status"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-22"
Fecha_de_actualizacion: "2026-05-28"
---

# Data Domain — Estado Operativo

> Entry point del dominio `data/`. Actualizar cuando se revisen o completen entradas.
> El engine no hardcodea datos — si un override no existe, el slot no aplica modificadores.

---

## Mods (`mod-stats.override.json`)

**Schema:** `docs/data/schemas/mods/mods-schema.md` ✅
**Vocabulario:** D-6 aplicado — `shared/types/modifier.ts` → `UPGRADES` + `UPGRADE_MAP`

| Estado | Cantidad |
|---|---|
| Entradas totales en override | 853 |
| Revisadas y verificadas (usuario) | 119 |
| Pendientes de revisión | 734 |
| Tokens en UPGRADES[] | 55 |
| Con entrada en UPGRADE_MAP (explícito) | 35 |

Ver `docs/data/schemas/mods/upgrade-taxonomy.md` para el breakdown completo (inc. resolveToken implícito y sub-familia).

**Revisión en curso:** Las primeras 119 entradas están correctas en upgrade_type D-6.
El campo `condition` está ausente en todos los casos — requiere semántica nueva, **fuera de scope actual**.

**Deuda conocida:**
- `condition` — semántica de modificadores condicionales (galvanizados, arcanos con trigger, etc.) no definida aún
- Tipos sin UPGRADE_MAP entry → se mapean por demanda conforme se revisan

---

## Ability Stats (`ability-stats.override.json`)

**Schema JSON:** `Project/public/data/ability-stats.schema.json` ✅ — draft-07, VS Code validation activa
**Schema de dominio:** `docs/data/schemas/abilities/schema.md` ✅ — actualizado (2026-05-24)
**Estado:** 286 entradas con datos reales, 704 stats aplicados vía pipeline

### Pipeline de datos (activo, 2026-05-22)

```
references/game-ui/<Warframe>.md   ← fuente de verdad (anotaciones $/$$ manuales)
         ↓  npm run apply:ability -- ../references/game-ui/<Warframe>.md
  apply-ability-md.ts              ← parser + merge en un paso
         ↓
ability-stats.override.json        ← groups/stats actualizados; name/desc/image_name intactos
```

El override **no se edita a mano** para groups/stats. Fuente de verdad: el `.md`.
`name`, `description`, `image_name` siguen viniendo de `@wfcd/items` vía `generate-data.ts`.

**Shorthands activos:** `$STRENGTH` · `$RANGE` · `$DURATION` · `$EFFICIENCY` · `$DRAIN` (mapeados en el parser a tokens completos).
**`//!`** en `.md` → `console.warn` en output del script. Registra edge-cases sin bloquear el pipeline.

### Schema — cambios relevantes (2026-05-22)

| Decisión | Estado |
|---|---|
| D-11 — `upgrade_by` opcional, `"NONE"` eliminado | ✅ CERRADO |
| D-12 — `AbilityStatValue` eliminado, `AbilityStatEntry` plano (`base_value: number \| [number,number]`) | ✅ CERRADO — ver `shared/types/ability.ts` |

### Estado de los .md

Cobertura: ~25 warframes anotados, ~10 pendientes (Mag → ...), 5 marcados `//! UPDATE NEEDED`, Kullervo sin acceso.
Detalle por warframe: `docs/data/schemas/abilities/annotation-status.md` (referencia).
**Formato de anotaciones:** `references/game-ui/README.md`.

### Herramienta de visualización

`AbilityStatsViewer.tsx` — ruta `/dev/ability-stats` ✅ operativa
- Verificación visual completada (2026-05-22) — schema y datos correctos
- Issues de renderización pendientes son presentación, no de schema

### Deuda conocida

- Double-scaling (`$DURATION $RANGE` en Gara, `$EFFICIENCY $STRENGTH` en Harrow) — deuda de engine, no de datos. `//!` registra los casos.
- `AVATAR_HEALTH` scaling (Inaros 4) — nuevo eje de scaling sin token. `//!` registrado.
- Lavos — semántica de cooldown distinta a energía. Datos capturados con mejor token disponible + `//!`.
- OQ-W-5 — semántica derivada de `ENERGY_COST`/`ENERGY_DRAIN` en el engine.

---

## Passives

**Schema:** ❌ Sin definir (posiblemente similar a ability-stats — groups + upgrade_by/type)
**Override:** ❌ Sin archivo

**Casos de referencia para schema:**
- Ash (pasiva "mod global"): `upgrade_type` → daño de sigilo → mismo patrón que mod
- Hydroid (pasiva "cambia reglas"): lógica de ley, NO es un modificador de atributo

**Deuda:** Definir schema, crear primer override con 2-3 casos (uno "mod global", uno "ley").

---

## Arcanos (`arcane-stats.override.json`)

**Schema:** `docs/data/schemas/arcane/schema.md` ✅ (2026-05-28)
**Override:** `Project/public/data/arcane-stats.override.json` ✅
**Generador:** `Project/scripts/generate-arcane-override.py`

| Estado | Cantidad |
|---|---|
| Entradas totales | 164 |
| Stats con `upgrade_type` mapeado | 60 (34%) |
| Stats con `upgrade_type: null` | 122 (66%) |
| Stats con `condition` capturado | 121 / 175 total |
| Tokens activos cubiertos | 14 |

**Schema:** idéntico a `mod-stats.override.json` — `base_value` siempre array de 6 ranks, `condition` capturado de triggers "On X:" / "While X:".

**Breakdown de null:** ver `docs/data/schemas/arcane/schema.md §3`. Categorías principales: status resistances (~11), buffs on-event de HP/Armor/Shield (~10), economía de HP/Energía (~8), fórmulas per-stat (~7), arcanes de Operador/Kitgun (~18), Primary/Secondary mecánicas de stacking (~14).

**Repository:** `ArcaneRepository` — pendiente (análogo a `IncarnonRepository`).

**Deuda:** Ver schema §6 para prioridades. P1 inmediato: arcanes con `condition: null` + `upgrade_type` mapeado (~15 entries — efectos siempre activos, los más simples).

---

## Incarnon Evolutions (`incarnon-evolutions.override.json`)

**Schema:** `docs/data/schemas/incarnon/schema.md` ✅
**Gaps:** `docs/data/schemas/incarnon/gaps.md` ✅

| Estado | Cantidad |
|---|---|
| Armas con datos | 85 |
| Efectos mapeados (tokens D-6) | ~444 (~35%) |
| Gaps documentados (null + note) | ~801 (~65%) |

**Mantenimiento:** SSoT manual — patrón archon. Nuevas armas se añaden a mano siguiendo el schema.
**Repository:** `IncarnonRepository` — resuelve `evolution_perks: Record<number, string>` → `Modifier[]` vía `UPGRADE_MAP`. Cargado en `StaticHydrator.hydrate()` (2026-05-27).
**Cobertura:** Tokens P1 (`gaps.md §2`) — 9 tokens simples sin diseño nuevo; cubren ~60 efectos adicionales cuando se implementen. P2+ requieren `context.flags` o sistema de eventos.

---

## Archon Shards (`archon-shards.json`)

**Schema:** `docs/data/schemas/archon-shards/schema.md` ✅
**Mapeo upgrade_type detallado:** `docs/data/schemas/archon-shards/upgrade-mapping.md` (referencia)
**Estado:** ⚠️ Parcial — 6 entradas / 27 stats. Mapeado solo donde existe token D-6 sin ambigüedad. Bloqueos y deuda en mapping.
**UI:** ✅ `useArchonShardCatalog`, `ArchonShardSelectionView`, iconos en Arsenal (2026-05-21).

---

## Orden de trabajo sugerido

1. Completar `.md` restantes (~10 warframes) + revisar los 5 con `//! UPDATE NEEDED`
2. Incarnon — ampliar token coverage (P1 de `gaps.md §2`: ~9 tokens simples, +60 efectos adicionales)
3. Arcanos — schema a definir, posponer hasta tener ability stats más completos
4. Passives — schema pendiente de definir
