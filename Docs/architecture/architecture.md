# Arquitectura de Datos — OmniFrame

> Última actualización: 2026-03-18
> Estado: activo
>
> Principio rector: los datos siguen la estructura canónica de la fuente.
> La UI recibe datos ya procesados — no procesa, no convierte, solo muestra.

---

## 1. Flujo de datos

```
Canónico (@wfcd/items, wiki.warframe.com)
    ↓
generate-data.mjs          ← normalización de formato (build time)
    ↓
Override (ability-stats.json, futuros gaps)
    ↓
JSON estático limpio       ← weapons.json, warframes.json, mods.json
    ↓
types.ts                   ← solo tipos de datos, sin conveniencias de UI
    ↓
Lógica (Builder, cálculo, filtrado)   ←→   Traducción (i18n, iconos)
    ↓
UI (solo renderiza, no procesa ni convierte)
```

### Reglas del flujo

- **Normalización de formato** ocurre en `generate-data.mjs` (build time):
  - Decimales: `crit_chance 20 → 0.20`, `status_chance 6 → 0.06`
  - Nombres canónicos: `DT_EXPLOSION → blast`, `DT_FIRE → heat`
  - Aliases: `shot_speed` colapsado en `flight` (canónico)

- **Normalización de presentación** ocurre en la capa de Traducción (runtime):
  - `0.20 → "20%"`, `1.6 → "1.6x"`, `8.75 → "8.75/s"`
  - Nunca antes — el JSON siempre guarda el valor en formato de cálculo

- **Overrides** ocurren en `generate-data.mjs` (build time):
  - El Builder y la UI no saben de dónde vienen los datos
  - Patrón: `ability-stats.json` — datos adicionales que la fuente primaria no expone
  - Solo se crean cuando hay un gap real con objetivo claro

- **Builder y UI son consumidores paralelos** de la capa de Lógica — no secuenciales

---

## 2. Capas y responsabilidades

### 2.1 Fuente canónica

| Fuente | Rol |
|---|---|
| `@wfcd/items` (npm) | Fuente primaria — datos del juego extraídos del cliente |
| `wiki.warframe.com` | Referencia canónica para validar semántica y valores |
| `docs.warframestat.us` | API pública — referencia secundaria |

### 2.2 `generate-data.mjs` — build time

Responsabilidades:
- Mapeo fiel a la estructura canónica de la fuente
- Normalización de formato (decimales, nombres de damage types)
- Aplicación de overrides (ability-stats.json, futuros archivos de override)
- Generación de JSON estático limpio

No hace:
- Desnormalización (copiar campos del arma padre a cada attack)
- Inventar campos que no existen en la fuente
- Decisiones de presentación

### 2.3 `types.ts` — tipado

Orden de prioridad del tipado:
1. **Lógica** (Builder, cálculo, filtrado) — tipos que el motor de cálculo necesita
2. **Mapeo** (traducción, conversión a UI) — tipos intermedios
3. **UI** (solo "escucha") — tipos de presentación derivados

No incluye:
- Conveniencias de UI (campos desnormalizados del padre)
- Campos inventados que no existen en la fuente

### 2.4 Lógica — runtime

Responsabilidades:
- Builder: composición de builds (arma + mods + arcanos)
- Cálculo: aplicar fórmulas de daño, crítico, estado
- Filtrado: búsqueda, ordenamiento, comparación

Consumidores: Builder UI, Items View, comparadores

### 2.5 Traducción — runtime

Responsabilidades:
- i18n: labels por locale (`stat-labels.ts`, `damage-labels.ts`)
- Iconos: mapeo de damage type → asset
- Formato de presentación: `0.20 → "20%"`, `1.6 → "1.6x"`

Estructura de los archivos de i18n:
- Objeto por locale (`en`, `es`) con las mismas keys
- Getter `getXLabels(locale?)` — default `'en'`
- El selector de locale se implementará más adelante (ver `architecture-audit.md` DT-2)

No hace:
- Modificar valores numéricos
- Tomar decisiones de qué mostrar

### 2.5.1 Mapeo — runtime

Capa entre el dato crudo y la UI. Responsabilidades:
- Recibir `(Weapon, WeaponAttack)` o `Mod` y devolver `StatEntry[]`
- Decidir qué stats mostrar y en qué orden
- Formatear valores usando los formateadores de Traducción
- Aplicar labels desde i18n

Archivo: `item-details.ts` — `getAttackStats()`, `getModStats()`

No hace:
- Lógica de cálculo
- Decisiones de layout o estilo

### 2.6 UI — runtime

Responsabilidades:
- Renderizar lo que recibe — sin procesar, sin convertir
- Recibir `BaseItem` completo (no fragmentos)
- Derivar estado de presentación de los datos (ej. `isMelee` de `weapon.kind`)

No hace:
- Leer campos del arma padre desde el attack
- Hardcodear labels (siempre pasan por Traducción)
- Tomar decisiones de datos

---

## 3. Override pattern

El patrón de override sigue el modelo de `ability-stats.json`:

```
Fuente primaria (@wfcd/items)
    ↓ gap identificado con objetivo claro
Override file (JSON estático)
    ↓ merge en generate-data.mjs
JSON final limpio
```

Criterios para crear un override:
- El campo no existe en la fuente primaria (gap confirmado exhaustivamente)
- El campo tiene impacto real en la lógica o la UI
- La fuente alternativa (wiki, API DE) tiene el dato de forma confiable

Gaps documentados pendientes de decisión:
- `punchThrough` por attack — ver `weapon-data-analysis.md` §5.5

---

## 4. Estructura de archivos relevantes

```
Project/
├── scripts/
│   └── generate-data.mjs       ← pipeline de build
├── public/
│   ├── assets/
│   │   ├── factions/            ← iconos de facción (PNG estáticos)
│   │   ├── damage-type/         ← iconos de damage type (PNG estáticos)
│   │   ├── ui/                  ← iconos de UI general (filtros, checkmarks, etc.)
│   │   └── Glyph/               ← glifos de Warframe (PNG estáticos)
│   └── data/
│       ├── weapons.json             ← generado
│       ├── warframes.json           ← generado
│       ├── mods.json                ← generado (incluye campo category: ModCategory)
│       ├── ability-stats.json       ← override (SSoT habilidades)
│       └── passives.json            ← generado
├── src/
│   ├── lib/
│   │   ├── types.ts             ← tipos canónicos (Kind, ModCategory, Weapon, Mod, Warframe…)
│   │   ├── item-details.ts      ← capa de Mapeo (getAttackStats, getModStats)
│   │   ├── FormattedText.tsx    ← renderiza tags legacy de ability-stats.json
│   │   ├── weaponData.ts        ← fetch + cache
│   │   ├── warframeData.ts      ← fetch + cache + hidratación
│   │   ├── modData.ts           ← fetch + cache
│   │   └── i18n/
│   │       ├── stat-labels.ts      ← labels de stats EN/ES
│   │       ├── damage-labels.ts    ← labels de damage types EN/ES
│   │       └── category-icons.ts   ← mapa canónico ItemCategory → { icon, label }
│   ├── features/
│   │   ├── hud/
│   │   │   ├── Hud.tsx          ← shell raíz — <header> + <main>{children}</main>
│   │   │   ├── HudHeader.tsx    ← HUD permanente — icono jugador + ESC + layout activo
│   │   │   └── layout-context.tsx ← placeholder — contexto layout activo (pendiente DT-8)
│   │   ├── equipment/
│   │   │   ├── EquipmentView.tsx ← vista de equipment (warframes + weapons)
│   │   │   ├── ItemsGrid.tsx    ← grid genérico sobre BaseItem
│   │   │   ├── hooks/
│   │   │   │   ├── use-items.ts           ← carga lazy + cache por categoría
│   │   │   │   ├── use-items-filters.ts   ← filtrado por kind + subCategory (mods)
│   │   │   │   └── use-item-details.ts
│   │   │   ├── details/
│   │   │   │   ├── attack-profile-panel.tsx
│   │   │   │   ├── item-details-panel.tsx
│   │   │   │   ├── item-details-popover.tsx
│   │   │   │   ├── item-details-header.tsx
│   │   │   │   ├── mod-details-view.tsx
│   │   │   │   └── stat-row.tsx
│   │   │   └── toolbar/
│   │   │       └── inventory-toolbar.tsx  ← usa FilterBar
│   │   ├── mods/
│   │   │   └── ModsView.tsx     ← vista de mods — FilterBar + useItemsFilters(subCategory)
│   │   ├── arsenal/             ← placeholder — Builder (pendiente DT-11)
│   │   ├── arcanes/             ← placeholder — vista arcanos (pendiente DT-4)
│   │   ├── options/             ← placeholder — configuración (pendiente DT-9)
│   │   └── profile/             ← placeholder — builds del usuario (pendiente DT-12)
│   ├── shared/
│   │   ├── components/
│   │   │   ├── CustomPopover.tsx  ← wrapper de Tippy.js
│   │   │   ├── FilterBar.tsx      ← barra de filtrado compartida — resuelve iconos desde category-icons.ts
│   │   │   └── navigation/
│   │   │       └── DialogMenu.tsx ← centro de navegación ESC
│   │   └── hooks/
│   ├── assets/
│   │   ├── IconDamageType.tsx   ← icono + tooltip de damage type
│   │   └── IconTag.tsx          ← icono de facción + label (rutas /assets/factions/)
│   └── providers/
│       ├── DataState/
│       ├── Menu/
│       └── Theme/
```

### Normalización de `mod.type` → `ModCategory`

`mod.type` en `@wfcd/items` tiene 29 valores distintos. Se colapsa a `ModCategory` en `generate-data.mjs`:

| `mod.type` (fuente) | `ModCategory` |
|---|---|
| `Warframe Mod` | `warframe` |
| `Primary Mod`, `Shotgun Mod` | `primary` |
| `Secondary Mod` | `secondary` |
| `Melee Mod`, `Stance Mod` | `melee` |
| `Companion Mod`, `Posture Mod` | `companion` |
| `Arch-Gun Mod` | `archgun` |
| `Arch-Melee Mod` | `archmelee` |
| `Archwing Mod` | `archwing` |
| `Focus Way` | `focus` |
| `Plexus Mod`, `Railjack Mod` | `railjack` |
| `Necramech Mod` | `necramech` |
| `K-Drive Mod` | `kdrive` |
| `Parazon Mod` | `parazon` |
| `* Riven Mod` | `riven` |
| otros | `tektolyst`, `modset`, `transmutation`, `peculiar` |

Rivens se normalizan a `riven` pero no se excluyen del JSON — la exclusión ocurre en runtime via `excludeSubCategories` en `useItemsFilters`.

---

## 5. Referencia de documentos

| Doc | Estado | Contenido |
|---|---|---|
| `architecture/architecture-audit.md` | Activo | Estado actual de implementación y deuda técnica |
| `architecture/data-audit.md` | Activo | Estado de datos y SSoT |
| `architecture/mods-analysis.md` | Activo | Análisis de implementación de mods y motor de cálculo |
| `analysis/ability-stats-data-source.md` | Referencia | Referencia de fuentes para stats de habilidades |
| `analysis/ability-stats-gap.md` | Activo | Checklist de Warframes pendientes de carga manual |
| `analysis/wiki-modules-reference.md` | Referencia | Lista de módulos Lua de la wiki |
| `architecture/warframe-items-changes.md` | Activo | Registro de cambios en el fork de warframe-items |
| `analysis/weapon-data-analysis.md` | Referencia | Análisis exhaustivo de estructura de weapons en @wfcd/items |

---

## 6. Deuda técnica en pausa — Rivens

> Referencia: [wiki.warframe.com/w/Riven_Mods](https://wiki.warframe.com/w/Riven_Mods)

Los Riven Mods son un sistema completamente distinto al resto de mods. Implementarlos en el builder requiere:

**Datos externos dinámicos**
- Disposition por arma (0.5–1.55) — se actualiza cada Prime Access (~3 meses)
- DE expuso datos en `https://www-static.warframe.com/repos/weeklyRivensPC.json` pero dejó de actualizarse en mayo 2024
- Fuente alternativa activa: [warframe.market](https://warframe.market) API pública

**Cálculo de stats**
```
valor_final = base_value × disposition × weight_multiplier × random(0.9–1.1)
```
`weight_multiplier` según número de stats: 2+0: ×0.99 / 2+1neg: ×1.2375 / 3+0: ×0.75 / 3+1neg: ×0.9375

Los 31 atributos posibles y sus `base_value` por tipo de arma están en la wiki.

**Prerequisitos antes de implementar:**
1. Motor de cálculo de daño completo (DT-11)
2. Vista de mods funcional ✅
3. Sistema de builds del usuario (DT-12)
4. Fuente de disposition actualizada y confiable
