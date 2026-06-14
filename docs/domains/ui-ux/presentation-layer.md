---
Estado: "referencia"
Rol: "Mapa del borde de salida (información/datos → píxeles) y diagnóstico del plano de formateo"
Version: "v0.2.0"
Impacto_ID: "UI-UX-Presentation"
Fidelidad_Fisica: "Project/src/lib/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-14"
Dependencias:
  - "docs/semantic/upgrade-tokens.md"
  - "docs/governance/open-questions.md"
---

# Presentation Layer (borde de salida)

> **Estado real (2026-06-14):** este doc fue reescrito tras trazar un caso real por todos los
> estratos (ver `OQ-ENGINE-10` "Pendiente de estresar"). La versión v0.0.2 describía un pipeline
> lineal de 3 etapas que **no matchea el código**: hay **dos rutas** distintas al sumidero, y el
> plano de formateo (`lib/*`) **no consume el SSoT semántico**. Lo abierto vive en las OQ; este
> doc solo mapea lo que **es**.
>
> **⚠️ Update D-7 Fase 4 (2026-06-14):** la **ruta información** ya fue saneada en su lado de
> vocabulario. El leak β murió (el motor ya no importa `lib/presentation`; el nodo es puro;
> `project()` adjunta `unit`+`category` por lookup keyed en el token D-6). `attribute-registry` es
> ahora `Partial<Record<Upgrade, PresentationMeta>>` keyed por token, sin `label` (la label es i18n).
> Los síntomas 1/2/5 abajo están **RESUELTOS**; el trazo se conserva como historia. Sigue abierto el
> plano numérico (síntoma 4) y la convergencia con la **ruta catálogo** (`stat-labels`).

## Topología: dos rutas, un sumidero

La UI recibe el mismo concepto (ej. `crit chance`) por **dos caminos distintos**, que hoy no
comparten formateo. El sumidero de render es único (`StatPanel` → `StatRow`); el fork está
**aguas arriba**, en cómo se proyecta a `StatEntry`.

```
RUTA INFORMACIÓN (atraviesa el motor):
  0 → A → B → C → D (project, contrato neutro) → [formateo inline ad-hoc] → StatPanel

RUTA CHROME (no toca el motor):
  0 (DataRegistry) ──────────────────────────────► UI  (nombre/imagen/desc/íconos)
```

Es el par espejo de "0" (borde de entrada, `OQ-DATA-9`): así como 0 es un puerto con dos
proyecciones, la salida es un sumidero con dos fuentes (info reactiva de C/D + chrome estático de
0). `OQ-ENGINE-10` nombra ese nodo de confluencia **Capa E** (aún no existe — hoy conflado inline).

## Trazo real verificado — `crit chance` de un arma (ruta información)

| Estrato | Archivo / función | Qué hace |
| :--- | :--- | :--- |
| **0** | `core/engine/resolve/hydration/ItemRepository.ts:68` `getDNA()` | escribe el token canónico `WEAPON_ADD_CRIT_CHANCE = crit_chance × 100` |
| **C1** | `core/engine/resolve/hydration/StaticHydrator.ts` `createBaseEntity` | crea el `AttributeNode` **puro** (Fase 4: ya NO spread de `getAttributeMetadata` — leak β muerto) |
| **C** | `core/engine/formulas/weapon/weapon-crit.ts` | resuelve `node.final` |
| **D** | `core/engine/output/consume.ts` `snapshot()` → `shared/view-model/index.ts:51` `project()` | tira los 6 buckets; adjunta `unit`+`category` por lookup (Fase 4) → `{ id, value: final, unit, category }` (`StatViewModel` = contrato **neutro**) |
| **D1** | `providers/Ensemble/use-view-model.ts:23` `useViewModel` | binding reactivo |
| **(E)** | **no existe** — inline en `domains/arsenal/view/UpgradeView.tsx:69-74` | `label = id.replace(/_/g," ").toUpperCase()`; `value = final.toFixed(1)+unit` |
| **UI** | `shared/components/items/specs/StatPanel.tsx` | render |

Mismo `crit chance` por la **ruta catálogo** (sin motor): `lib/item-details.ts:50` (`getAttackStats`)
lee `attack.crit_chance` crudo, formatea con `Intl('es-ES')` + `pct(v×100)`, label desde
`lib/i18n/stat-labels.ts:46`.

## Diagnóstico central: el formateo no consume el SSoT semántico

El proyecto **sí tiene** un SSoT de vocabulario — [upgrade-tokens.md](../../semantic/upgrade-tokens.md)
(taxonomía D-6, `WEAPON_ADD_CRIT_CHANCE`, etc.), fidelidad → `shared/types/modifier.ts`. **El motor
(C\*) lo consume directo.** El plano de formateo (`lib/*`) **no** — nació antes del SSoT y mantiene
vocabularios humanos divergentes. Resultado: tres tablas para el mismo stat, **ninguna es fuente**:

| Fuente | Keyed por | Label de crit chance | Unit |
| :--- | :--- | :--- | :--- |
| `lib/presentation/attribute-registry.ts` | ~~nombres humanos~~ **tokens D-6 (Fase 4)** | (label fuera del dict) | `%` |
| `lib/i18n/stat-labels.ts` | claves de catálogo (`crit_chance`) | `"CRIT CHANCE"` | (implícito en formateador) |
| inline en `UpgradeView.tsx` | id de engine, des-slugificado | `"WEAPON ADD CRIT CHANCE"` | el `unit` del nodo |

### Síntomas verificados que esto produce

1. **✅ RESUELTO (Fase 4) — El leak β estaba roto, no solo feo.** `StaticHydrator` (el motor, C1)
   llamaba `getAttributeMetadata("WEAPON_ADD_CRIT_CHANCE")`, pero `attribute-registry` estaba keyed
   por `"critical_chance"` → caía al fallback en silencio (solo `WEAPON_ADD_DAMAGE` coincidía). Ahora
   el registry está keyed por token D-6 y el motor no lo consume.
2. **✅ RESUELTO (Fase 4) — La unidad se perdía en el número.** Por el mismatch de claves crit chance
   salía `25.0` sin `%`, categoría `utility`. Re-keyado → vuelve a renderizar `%` y `category: primary`.
3. **`project()` no reenvía la label — y es correcto (Fase 4).** La label NO es del contrato neutro:
   es i18n (`stat-labels`), se compone en el borde. `project()` adjunta `unit`+`category` (meta
   estructural). Lo que falta es que `UpgradeView` deje su label inline y consuma i18n por el token.
4. **Dos convenciones numéricas** para la misma cifra: catálogo `Intl('es-ES')` → `"25%"`;
   engine `toFixed(1)` → `"25.0"`. Labels en inglés + números en locale `es-ES`. **(SIGUE ABIERTO — OQ-DATA-10.)**
5. **✅ RESUELTO (Fase 4) — Dependencia invertida.** El motor ya no importa de `lib/presentation`; la
   proyección de la salida del motor vive en `project()` (borde C→D), dirección correcta `@shared → @lib`.

### La excepción que confirma la regla

`FormattedText` (tags `DT_*` → ícono) **sí** está anclado al SSoT semántico (`damage-types.md` vía
los tags `<DT_SLASH>`…) y por eso es la única pieza de `lib/*` genuinamente compartida y sana. El
resto del plano de formateo está desconectado del vocabulario canónico.

## Forma del plano (lo que es hoy)

Todo `lib/*` es el **plano de formateo** (utilidad ortogonal, espejo de "0" en la entrada —
`DC-OQ-ENGINE-10-A`), no un eslabón de la cadena. Piezas:

- `lib/i18n/` — tablas de labels/nombres fijos (`stat-labels`, `damage-labels`). Vocabulario catálogo.
- `lib/presentation/attribute-registry.ts` — `category`+`unit` keyed por token D-6 (`Partial<Record<Upgrade>>`; **Fase 4: re-keyado + label fuera**). Consumido por `project()` en el borde, no por el motor.
- `lib/presentation/FormattedText.tsx` + `icons/` — tags semánticos → íconos (anclado a semantic, sano).
- `lib/item-details.ts` — proyector → `StatEntry[]` de la ruta catálogo (~13 consumidores, vivo).
- `lib/image-url.ts` — straddlea dos bordes (chrome de entrada + URL display de salida); ver `OQ-DATA-10`.

## Lo abierto (no se decide acá)

- **`OQ-DATA-10`** — la suite de presentación como SSoT del borde de salida (las 3 tablas → una;
  las 2/4 convenciones numéricas → una). **DIFERIDO** por function-first.
- **`OQ-ENGINE-10`** — Capa E (confluencia info+chrome) + el estrato `lib/format` re-anclado al SSoT
  semántico. **Fase 4 ✅** re-keyó `attribute-registry` por tokens D-6 y lo desenchufó del motor;
  **falta** construir E y renombrar D (siguen prematuros — la UI se re-enfoca, function-first).
- **`OQ-DATA-13`** — render de íconos de habilidad/shard duplicado (ruta chrome sin SSoT).
- **`OQ-ENGINE-8`** — rename del payload de D (sobrecarga "Proyección").

**Estado UI-local** (slot seleccionado, hover, nav): **no participa del flujo del dato** — es
selector de *qué entidad/lista proyectar* (`UpgradeView.tsx:60-64`), ortogonal. No es entrada de E
ni de D. Ver `OQ-UI-2`.
