---
Estado: "activo"
Rol: "Entry point operativo del dominio data/ — estado de overrides, pipeline y deuda activa"
Version: "v0.1.0"
Impacto_ID: "D-Data-Status"
Fidelidad_Fisica: "Project/public/data/"
Fecha_de_creacion: "2026-05-22"
Fecha_de_actualizacion: "2026-05-24"
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
| Tipos D-6 con UPGRADE_MAP | 39 |

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

## Arcanos (`arcanes.json`)

**Schema:** ❌ Sin definir para override
**Estado actual:** `level_stats` = plain text por rango — sin estructura semántica

**Hipótesis de schema:** Similar a mods (slot distinto, misma lógica de modificador).
Casos con condición (Arcano Energize → on-pickup):
- Requiere campo `condition` igual que mods con stacks

**Deuda:** Definir schema, crear 2-3 entradas verificadas antes de generalizar.

---

## Archon Shards (`archon-shards.json`)

**Schema:** `docs/data/schemas/archon-shards/schema.md` ✅
**Mapeo upgrade_type detallado:** `docs/data/schemas/archon-shards/upgrade-mapping.md` (referencia)
**Estado:** ⚠️ Parcial — 6 entradas / 27 stats. Mapeado solo donde existe token D-6 sin ambigüedad. Bloqueos y deuda en mapping.
**UI:** ✅ `useArchonShardCatalog`, `ArchonShardSelectionView`, iconos en Arsenal (2026-05-21).

---

## Orden de trabajo sugerido

1. Completar `.md` restantes (~10 warframes) + revisar los 5 con `//! UPDATE NEEDED`
2. Arcanos — schema a definir, posponer hasta tener ability stats más completos
3. Passives — schema pendiente de definir
