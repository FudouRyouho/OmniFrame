# Presentation Layer

> Estado: activo
> Rol: documentar la capa de traduccion, mapeo y presentacion de datos para la UI
> Fuente de verdad de: limites de responsabilidad y estructura de la capa de presentacion
> No usar para: formulas del builder, estructura de fuentes primarias, contratos del engine
> Ultima actualizacion: 2026-03-28

## Capas y responsabilidades

La capa de presentacion se divide en tres subcapas con responsabilidades estrictamente separadas:

```
dato crudo (types)
    ↓
Traduccion (lib/i18n/)       — labels, iconos, nombres localizados
    ↓
Mapeo (lib/item-details.ts)  — seleccion, orden y formato de stats para StatEntry[]
    ↓
UI (features/equipment/details/) — renderizado puro de StatEntry[]
```

Ninguna subcapa debe asumir responsabilidades de la otra.

## Traduccion — `lib/i18n/`

**Scope**: inglés exclusivo (`en`). El proyecto no soporta multi-locale en esta fase.
La reestructuración de i18n pendiente incluye eliminar el locale `es` residual en `damage-labels.ts`.

| Archivo | Contenido |
|---|---|
| `stat-labels.ts` | Labels de stats de armas y mods (`WEAPON_STAT_LABELS`, `MOD_STAT_LABELS`) |
| `damage-labels.ts` | Nombres de tipos de daño y efectos de estado (`DAMAGE_LABELS`, `STATUS_EFFECT_LABELS`) |
| `category-icons.ts` | Mapa de categoría de item → `{ icon, label }` — cubre todas las categorías incluyendo las sin icono disponible |

**Regla**: los archivos de i18n son tablas de lookup. No contienen lógica condicional ni dependen de tipos de item.

**Consumidores correctos**: `FilterBar`, `ItemCard`, `item-details.ts`, tooltips, breadcrumbs.
**Consumidores incorrectos**: lógica de cálculo, contratos del engine, scripts de build.

## Mapeo — `lib/item-details.ts`

**Scope**: transforma dato crudo tipado → `StatEntry[]` ordenado y formateado para presentación.

```ts
interface StatEntry {
  key: string
  label: string        // viene de i18n
  value: string        // formateado (número → string)
  isSectionHeader?: boolean  // separa bloques visualmente
}
```

**Responsabilidades**:
- Decidir qué stats mostrar y en qué orden (convención wiki: stats de ataque → stats del arma → daño)
- Formatear valores: `nf.format()` para números, `pct()` para porcentajes
- Aplicar labels desde `i18n/stat-labels` y `i18n/damage-labels`
- Separar secciones con `isSectionHeader: true`

**No hace**:
- Lógica de cálculo — recibe stats ya calculados del dato crudo
- Decisiones de layout o estilo — eso es la UI
- Filtrado por tipo de item — lo resuelve el caller (`AttackProfilePanel`, `ModDetailsView`)

**Funciones exportadas**:
- `getAttackStats(weapon, attack)` → `StatEntry[]` — stats de un ataque concreto con su arma padre
- `getModStats(mod)` → `StatEntry[]` — stats de un mod

## UI — `features/equipment/details/`

**Scope**: renderiza `StatEntry[]` sin procesamiento adicional.

| Componente | Rol |
|---|---|
| `StatRow` | Fila label/valor con soporte de striping, tone de valor (default/accent) y clases custom |
| `AttackProfilePanel` | Renderiza `getAttackStats()` como lista de `StatRow` con header de ataque |
| `ModDetailsView` | Renderiza stats de mod |
| `ItemDetailsPanel` | Orquesta header + panel de stats según tipo de item (`isMod`, `isWeapon`) |
| `ItemDetailsHeader` | Cabecera con nombre en mayúsculas + paginación de ataques (puntos + hint TAB) |
| `item-details-popover` | Versión flotante del panel para uso en grilla de items |

**Reglas**:
- Los componentes renderizan lo que reciben — no resuelven labels ni formatean valores
- No hardcodean labels si existe capa de i18n
- No importan desde lógica de cálculo

## Deuda activa

- `damage-labels.ts` tiene locale `es` residual — eliminar en reestructuración de i18n
- `item-details-popover` y `mod-details-view` sin uso confirmado en rutas activas (pendiente verificación)
- la capa de mapeo solo cubre `Weapon` y `Mod` — `Warframe`, `Companion`, `Arcane` y `Vehicle` no tienen `StatEntry[]` aún

