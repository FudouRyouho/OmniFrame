# Auditoría de Arquitectura — Estado actual

> Última actualización: 2026-03-18 (rev 2)
> Estado: activo
> Referencia: `architecture/architecture.md`

---

## Mapa de capas — estado actual

```
@wfcd/items
    ↓
generate-data.mjs          ✅ mapeo fiel, normalización de formato, sin desnormalización
    ↓
JSON estático              ✅ weapons.json / warframes.json / mods.json
    ↓
types.ts                   ✅ solo tipos y constantes de lógica (DAMAGE_TYPES[])
    ↓
*Data.ts (fetch/cache)     ✅ weaponData.ts / modData.ts — fetch + cache
                           ✅ warframeData.ts — fetch + cache + hidratación documentada
    ↓
use-items.ts               ✅ carga lazy + cache por categoría
use-items-filters.ts       ✅ filtrado, búsqueda, ordenamiento, excludeKinds
    ↓
item-details.ts            ✅ capa de Mapeo — getAttackStats / getModStats → StatEntry[]
i18n/stat-labels.ts        ✅ capa de Traducción — EN/ES, default EN
i18n/damage-labels.ts      ✅ capa de Traducción — labels + status effects + descripciones EN/ES
    ↓
EquipmentView.tsx          ✅ única fuente de vista — orquesta todo
ItemsGrid.tsx              ✅ grid genérico sobre BaseItem
    ↓
item-details-panel.tsx     ✅ panel lateral — recibe BaseItem completo
item-details-popover.tsx   ✅ popover hover — altura calc(100vh-50px), sin animación, sin jump
use-item-details.ts        ✅ gestión de ataque seleccionado
    ↓
attack-profile-panel.tsx   ✅ solo itera StatEntry[]
mod-details-view.tsx       ✅ solo itera StatEntry[]
IconDamageType.tsx         ✅ usa getDamageLabels() / getStatusEffectLabels() / getDamageDescriptions()
stat-row.tsx               ✅ componente de presentación puro
AbilityStatsEditor.tsx     ✅ usa getDamageLabels() de i18n
```

### Shell — Hud.tsx

`Hud.tsx` es el shell raíz de la app — monta en `App.tsx` como contenedor de todo:

```tsx
// App.tsx
<Hub>
  <DialogAppMenu />
  <Routes>...</Routes>
</Hub>
```

`Hud.tsx` renderiza `<header>` (placeholder HudHeader) + `<main>{children}</main>`.
Esto cumple DT-8 estructuralmente — el HUD es la capa exterior permanente.

### Path aliases — estado

Configurados en `tsconfig.app.json` y `vite.config.ts`. TypeCheck limpio (`tsc --noEmit` sin errores).

| Alias | Resuelve a |
|---|---|
| `@lib/*` | `src/lib/*` |
| `@features/*` | `src/features/*` |
| `@shared/*` | `src/shared/*` |
| `@assets/*` | `src/assets/*` |
| `@providers/*` | `src/providers/*` |

Archivos migrados a aliases: todos los archivos activos en `features/`, `assets/`, `shared/`, `pages/dev/`.

Archivos que mantienen imports relativos (justificado):
- `App.tsx` — importa `pages/` deprecados
- `pages/` — deprecados, no migrar

---

## Componentes — estado de uso

### Activos y en uso
| Archivo | Usado por |
|---|---|
| `Hud.tsx` | `App.tsx` — shell raíz |
| `HudHeader.tsx` | `Hud.tsx` — básico funcional |
| `DialogMenu.tsx` | `App.tsx` |
| `CustomPopover.tsx` | `ItemsGrid.tsx` |
| `FilterBar.tsx` | `inventory-toolbar.tsx`, `ModsView.tsx` |
| `ItemDetailsHeader` / `ItemDetailsFooter` | `item-details-panel.tsx`, `item-details-popover.tsx` |
| `IconTag.tsx` | `item-details-header.tsx` |
| `IconDamageType.tsx` | `FormattedText.tsx`, `attack-profile-panel.tsx`, `stat-row.tsx` |
| `FormattedText.tsx` | `AbilityStatsEditor.tsx`, `WarframeDetail.tsx` |
| `DataStateProvider` + `useDataState` | `main.tsx`, `inventory-toolbar.tsx` |
| `MenuProvider` + `useMenu` | `main.tsx`, `DialogMenu.tsx` |
| `ThemeProvider` + `useTheme` | `main.tsx` |

### Muertos / sin referencias activas
| Archivo | Estado | Motivo |
|---|---|---|
| `Nav.tsx` | muerto | No importado en ningún archivo activo. Reemplazado por `DialogMenu.tsx`. |
| `MenuBar.tsx` | deprecado | Navegación via header descartada. No eliminar hasta confirmar que no hay nada reutilizable. |
| `ThemeSelector.tsx` | sin montar — necesario | Vivirá en `/options`. No eliminar. |
| `useSharedDataState` | sin consumidor — justificado | Parte del sistema `data-state-*`. No eliminar. |
| `HudHeader.tsx` | básico funcional — pendiente | Toggle + isOver + useDataState implementados. Layout activo pendiente DT-8. |
| `layout-context.tsx` | placeholder — pendiente | Contexto del layout activo. Pendiente DT-8. |

---

## Deuda técnica pendiente

### DT-1 — `warframeData.ts` — hidratación en runtime, pendiente migrar a build time
La hidratación de abilities (merge de `ability-stats.json` + passives) ocurre en runtime
porque `ability-stats.json` es editable desde el Editor UI sin pasar por el pipeline de build.
Cuando el pipeline absorba completamente `ability-stats.json`, esta hidratación debe moverse
a `generate-data.mjs`. La función `hydrateAbility` está separada y documentada con JSDoc
para facilitar esa migración futura.

**Acción pendiente:** mover `hydrateAbility` a `generate-data.mjs` cuando `ability-stats.json`
deje de ser editable en runtime.

---

### DT-2 — Locale switching no implementado
`stat-labels.ts` y `damage-labels.ts` tienen estructura multi-locale (EN/ES) con `DEFAULT_LOCALE = 'en'`.
El selector de locale (contexto React, localStorage, etc.) no existe aún.
Preparado para implementar. Vivirá en `/options`.

---

### DT-3 — `pages/` deprecados
`WeaponDetail.tsx` y `WarframeDetail.tsx` son prototipos de referencia marcados como `@deprecated`.
Se mantienen por compatibilidad con las rutas actuales. No extender.

---

### DT-4 — Vistas de Mods y Arcanos pendientes
`ModsView.tsx` está implementado con `FilterBar` + `useItemsFilters(subCategory)`.
Aún no está añadido a las rutas en `App.tsx` ni al menú en `DialogMenu.tsx` — pendiente decisión del usuario.
La vista de Arcanos no existe aún.

El filtrado de compañeros por subtipo (`ROBOTIC` / `BEAST` / tipo específico) requiere lógica
jerárquica sobre `compatName` — pendiente de diseño. Ver `data-audit.md` §Gap: compatName.

**Acción pendiente (usuario):** añadir `ModsView` a rutas y `DialogMenu.tsx`. Diseñar vista de Arcanos.
**Acción pendiente (código):** diseñar filtrado jerárquico de compañeros cuando se implemente ModsView completo.

---

### DT-5 — Arquitectura de rutas pendiente
`App.tsx` define las rutas inline. La arquitectura de rutas se definirá cuando se implemente
la navegación completa (Arsenal / Equipment / Mods / Arcanos / Options / Profile).
El comentario `// Project/src/config/routes.ts` marca la intención futura.

**Acción pendiente:** mover `routes` a `src/config/routes.ts` cuando se implemente la
navegación completa entre features.

---

### DT-6 — `FormattedText.tsx` — ICON_MAP hardcodeado con tags legacy
`FormattedText` tiene su propio mapa `DT_EXPLOSION → blast` para normalizar tags legacy
de `ability-stats.json`. Esa normalización debería ocurrir en `generate-data.mjs` (build time).

**Acción pendiente (usuario):** actualizar `ability-stats.json` manualmente para usar nombres
canónicos. Cuando esté hecho, `ICON_MAP` puede eliminarse y `FormattedText` solo necesita
recibir el nombre canónico directamente.

---

### DT-7 — `Nav.tsx` — legacy sin uso activo
`Nav.tsx` tiene `NavLink` a `/weapons` y `/` que no corresponden a rutas activas en `App.tsx`.
La navegación definitiva es via `DialogMenu.tsx`.

**Acción pendiente:** eliminar `Nav.tsx` cuando se confirme que no hay nada reutilizable.

---

### DT-8 — HUD Header global — implementación básica funcional, layout activo pendiente
`HudHeader.tsx` tiene implementación básica funcional: toggle de `DialogMenu.tsx` (ESC),
`isOver` (hover), `useDataState` correctamente conectado. El botón usa `z-[60]` (valor
arbitrario Tailwind) para superar el z-index del Dialog.

Pendiente: la **caja de layout activo** — visible permanentemente, muestra en columna el
Warframe equipado, arma primaria, secundaria, melee, compañero del layout activo.
Depende de `layout-context.tsx` (placeholder) y del Builder (DT-11).

**Acción pendiente (usuario):** diseñar visualmente la caja de layout activo.
**Acción pendiente (código):** implementar `layout-context.tsx` + conectar a `HudHeader.tsx`.

---

### DT-9 — `DialogMenu.tsx` — navegación incompleta y sección Options pendiente
El menú ESC está funcional pero incompleto. Rutas/secciones previstas:

| Ruta | Descripción |
|---|---|
| `Arsenal` | Abre el Builder con el layout activo |
| `Equipment` | `items-view.tsx` — explorar items |
| `Mods` | Vista de mods (pendiente — DT-4) |
| `Arcanes` | Vista de arcanos (pendiente — DT-4) |
| `Options` | Configuración: idioma, tema, vistas técnicas, etc. |
| `Profile` | Colección de layouts/builds del usuario |

Actualmente el menú solo muestra las rutas de `App.tsx` que tienen `label`.
`ThemeSelector.tsx` debe ser accesible desde `Options`.

**Acción pendiente:** implementar rutas y vistas faltantes. Conectar `ThemeSelector` a `/options`.

---

### DT-10 — CSS — reorganización pendiente (usuario)
El CSS actual es plano y sin estructura clara. Necesita reorganización para soportar
la experiencia visual "Warframe" de forma mantenible.

**Acción pendiente (usuario):** reorganizar CSS. Incluye:
- Sistema de variables semánticas (ya iniciado con paletas en `styles/palettes/`)
- Clases de componentes reutilizables (buttons, panels, borders con estética Orokin/HUD)
- Separación clara entre estilos de layout, componentes y temas

---

### DT-11 — Builder — motor de builds pendiente
El Builder es el núcleo funcional de la app. No existe aún ninguna implementación.
Ver §Estructura de carpetas propuesta para la ubicación sugerida (`features/builder/`).

**Acción pendiente:** diseñar la arquitectura del motor de cálculo antes de implementar.
Depende de: DT-8 (HUD header / layout activo), DT-9 (navegación Arsenal).

---

### DT-13 — mod-stats.json — override de stats de mods para el builder (pendiente)

`@wfcd/items` provee `levelStats` como array de strings por rango — suficiente para renderizar
el card del mod, pero insuficiente para el motor de cálculo del builder. Los strings mezclan
valores numéricos, efectos condicionales, saltos de línea y tags de color del juego.

La propuesta es un `Project/data/mod-stats.json` con `uniqueName` como key, siguiendo el
mismo patrón que `ability-stats.json`: `label` con `|val1|` templates + `stats[]` con
`values: number[]` (uno por rango) y `modifier` semántico. El builder indexa `values[rank]`
para obtener el valor del rango actual.

Casos especiales identificados: mods con múltiples efectos por rango (Blind Rage),
efectos condicionales con `\\n` (Galvanized Aptitude), tags de color (Hunter Munitions),
augmentos de warframe/arma (Amalgam Furax Body Count).

Ver análisis completo en `architecture/mod-stats-gap.md`.

**Acción pendiente:** implementar `mod-stats.json` al inicio de la etapa del builder.
Depende de: DT-11 (Builder) — definir lista canónica de `modifier` keys primero.

---

### DT-12 — Profile — colección de layouts/builds pendiente
Vista de perfil del usuario donde se muestran sus layouts y builds guardados.
Conceptualmente diferente de `Equipment` (explorar items) — aquí se muestran
las builds propias del usuario, no el catálogo completo.

**Acción pendiente:** diseñar estructura de datos para layouts/builds y vista de perfil.
Depende de: DT-11 (Builder).

---

## Estructura de carpetas — estado actual

La reorganización feature-based está aplicada. Esta es la estructura real en disco:

```
Project/
├── public/
│   └── assets/
│       ├── factions/            ← iconos de facción (PNG estáticos)
│       ├── damage-type/         ← iconos de damage type (PNG estáticos)
│       └── ui/                  ← iconos de UI general (filtros, checkmarks, etc.)
│           ├── CategoryRifle.png, CategorySecondary.png, CategoryMelee.png ✅
│           ├── CategoryShotgun.png, CategoryBow.png, CategoryAmp.png ✅
│           ├── CategoryModular.png, CategoryOperator.png ✅
│           ├── Archwing.png, Sentinel.png, Infinite.png ✅
│           └── [pendientes] CategoryWarframe, CategoryCompanion, CategoryFocus,
│               CategoryRailjack, CategoryNecramech, CategoryKDrive,
│               CategoryParazon, CategoryArchGun, CategoryArchMelee
│
└── src/
    ├── lib/
    │   ├── types.ts
    │   ├── item-details.ts
    │   ├── FormattedText.tsx
    │   ├── weaponData.ts
    │   ├── warframeData.ts
    │   ├── modData.ts
    │   └── i18n/
    │       ├── damage-labels.ts
    │       ├── stat-labels.ts
    │       └── category-icons.ts   ✅ mapa canónico ItemCategory → { icon, label }
    │
    ├── features/
    │   ├── hud/
    │   │   ├── Hud.tsx              ✅ shell raíz activo
    │   │   ├── HudHeader.tsx        ⚠️ básico funcional — layout activo pendiente DT-8
    │   │   └── layout-context.tsx   ⏳ placeholder — pendiente DT-8
    │   ├── equipment/
    │   │   ├── EquipmentView.tsx    ✅
    │   │   ├── ItemsGrid.tsx        ✅
    │   │   ├── hooks/
    │   │   │   ├── use-items.ts
    │   │   │   ├── use-items-filters.ts   ✅ soporta subCategory + excludeSubCategories
    │   │   │   └── use-item-details.ts
    │   │   ├── details/
    │   │   │   ├── attack-profile-panel.tsx
    │   │   │   ├── item-details-panel.tsx
    │   │   │   ├── item-details-popover.tsx
    │   │   │   ├── item-details-header.tsx
    │   │   │   ├── mod-details-view.tsx
    │   │   │   └── stat-row.tsx
    │   │   └── toolbar/
    │   │       └── inventory-toolbar.tsx  ✅ usa FilterBar
    │   ├── arsenal/
    │   │   ├── ArsenalView.tsx      ⏳ placeholder — pendiente DT-11
    │   │   └── engine/index.ts      ⏳ placeholder
    │   ├── mods/
    │   │   └── ModsView.tsx         ✅ implementado — pendiente añadir a rutas (DT-4)
    │   ├── arcanes/
    │   │   └── ArcanesView.tsx      ⏳ placeholder — pendiente DT-4
    │   ├── options/
    │   │   └── OptionsView.tsx      ⏳ placeholder — pendiente DT-9
    │   └── profile/
    │       └── ProfileView.tsx      ⏳ placeholder — pendiente DT-12
    │
    ├── shared/
    │   ├── components/
    │   │   ├── CustomPopover.tsx    ✅ placement=right-start, animation=false, duration=[0,1]
    │   │   ├── FilterBar.tsx        ✅ barra de filtrado compartida — resuelve iconos desde category-icons.ts
    │   │   ├── Nav.tsx              ❌ legacy — candidato a eliminar (DT-7)
    │   │   └── navigation/
    │   │       ├── DialogMenu.tsx   ✅
    │   │       └── MenuBar.tsx      ❌ deprecado
    │   └── hooks/
    │
    ├── assets/
    │   ├── IconDamageType.tsx       ✅
    │   └── IconTag.tsx              ✅ usa rutas públicas /assets/factions/
    │
    ├── providers/
    │   ├── DataState/
    │   ├── Menu/
    │   └── Theme/
    │       └── ThemeSelector.tsx    ⏳ sin montar — pendiente /options
    │
    └── pages/                       ❌ deprecados — no extender
        ├── WarframeDetail.tsx
        ├── WeaponDetail.tsx
        └── dev/
            ├── AbilityStatsEditor.tsx
            └── UIShowcase.tsx
```
