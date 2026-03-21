# Auditoría de Datos — OmniFrame

> Estado: activo
> Última actualización: 2026-03-19

## Fuentes de Verdad (SSoT)

| Dato | Sistema | Fuente Primaria |
|---|---|---|
| Metadata Warframe | Scraper | API DE + Wiki (`warframe-items`) |
| **Stats Numéricos** | **Local DB** | `Project/data/ability-stats.json` |
| **Pasivas** | **Local DB** | `Project/public/data/passives.json` |
| Mods | Scraper | Wiki (`warframe-items`) |

---

## Gap Analysis (Estado Actual)

### 0. Rank Bonuses (sistema de progresión post-30)
- **Estado**: ❌ No documentado, no modelado.
- **Descripción**: Algunos warframes tienen bonificaciones que se desbloquean al subir rangos más allá del nivel 30 (sistema de Forma/Mastery extendida). Estas bonificaciones son **permanentes y acumulativas** — no son pasivas de habilidad sino modificadores base del warframe.
- **Ejemplo confirmado**: Nidus Rank 30 → `+100 Armor`, `+50 Energy`, `+15 Base Heal Rate`, `+100 Health`, **`+15% Strength`**.
- **Impacto en el builder**: El `+15% Strength` de Nidus se comporta como un mod de `AVATAR_ABILITY_STRENGTH` — entra en la misma cadena multiplicativa. Confirmado en juego: `Virulence base 200 * 1.15 = 230`, `Teeming Virulence crit 120% * 1.15 = 138%`. No es aditivo al base — es un multiplicador idéntico a un mod de Strength. Implementación futura: añadir `rankBonuses` al pool de modificadores antes del cálculo, igual que los mods.
- **Otros warframes afectados**: Desconocido. Requiere auditoría completa. Nidus es el caso más conocido por su mecánica de stacks, pero otros frames pueden tener rank bonuses de stats distintos (Armor, Energy, Health, Shield).
- **Fuente de datos**: No existe en `@wfcd/items`. Requiere override manual o scraping de la wiki (`Module:Warframes/data` o página individual de cada frame).
- **Nota adicional sobre los valores base del JSON**: Confirmado — el JSON contiene los stats de **rank 0 de cada warframe** (normal y Prime como entradas separadas). No hay nada que inferir: `Nidus` y `Nidus Prime` tienen sus propios `base_rank0` distintos en el JSON. La fórmula completa para obtener los stats en juego a rank 30 es:
  ```
  stats_rank30 = base_rank0 (JSON, ya diferenciado por normal/Prime)
               + rank_scaling (0→30)  ← pendiente §2
               + rank_bonuses         ← solo frames específicos como Nidus, pendiente este gap
  ```
  Verificación Nidus Prime rank 30: `550(JSON Prime) + 100(rank bonus) = 650 HP` ✓
- **Decisión actual**: Gap documentado, sin implementar. Prioridad baja hasta que el motor de cálculo esté activo. Cuando se implemente, el campo candidato en el tipo `Warframe` sería `rankBonuses?: RankBonus[]` donde cada entrada describe el rango, el stat y el valor.
- **Posible extensión a Semantic**: Los rank bonuses podrían documentarse en los `.md` de Semantic como sección `## RANK BONUSES` con formato similar a los stats de habilidad. Pendiente de diseño de sintaxis.

### 1. Sistema de Habilidades
- **Metadata (Nombre/Desc/Icono)**: ✅ Extraído automáticamente y editable en UI.
- **Stats (Variables)**: ✅ Migrado a estructura de objetos. 100% editable.
- **Fórmulas**: ⚠️ Pendiente integración de Maximización para cálculos reales.

### 2. Stats de Warframe
- **Base (Rank 0)**: ✅ API DE.
- **Rank 30**: ⚠️ Parcial. La mayoría escala linealmente (HP/Shield/Energy), pero algunos frames tienen curvas manuales en la wiki. Pendiente unificador de escalado.

### 3. Mods
- **Metadata**: ✅ Wiki.
- **Normalización de categoría**: ✅ `mod.type → ModCategory` en `generate-data.mjs` (build time). Campo `category` disponible en `mods.json`.
- **Vista de Mods**: ✅ `ModsView.tsx` implementado con `FilterBar` + `useItemsFilters(subCategory)`. Pendiente añadir a rutas.
- **Valores por Rango**: ❌ No estructurado. Solo texto plano. Gap técnico pendiente para el motor de cálculo (DT-11).
- **Compatibilidad de compañero (`compatName`)**: ✅ Existe en `@wfcd/items`. ❌ No incluido en `mapMod` de `generate-data.mjs` — campo perdido en el pipeline. Ver §Gap: compatName.

---

## Próximos pasos técnicos

1. **Motor de Cálculo (DT-11)**: Implementar el motor que sume todos los bonos (Stats Base + Mods + Arcanos) y los aplique a las habilidades. Ver `architecture/architecture-audit.md` DT-11.
2. **Estructuración de Mods para builder**: Convertir el texto de los mods en valores numéricos. Ver `architecture/mods-analysis.md`.

---

## Gap: `compatName` — Mods de Compañero

### Origen del gap

El campo `compatName` existe en `@wfcd/items` para todos los mods de tipo `Companion Mod` y `Posture Mod`, pero `mapMod` en `generate-data.mjs` no lo incluía — se perdía en el pipeline.

**La fuente tiene el dato correcto. No se necesita override ni wiki.**

### Taxonomía canónica de `compatName`

`compatName` define a qué compañero(s) aplica un mod. Es una jerarquía de 4 niveles:

```
COMPANION                    → universal (todos los compañeros)
├── ROBOTIC                  → todos los robóticos
│   ├── Sentinel             → cualquier Sentinel
│   │   ├── Carrier          → solo Carrier
│   │   ├── Helios           → solo Helios
│   │   ├── Diriga           → solo Diriga
│   │   ├── Djinn            → solo Djinn
│   │   ├── Dethcube         → solo Dethcube
│   │   ├── Oxylus           → solo Oxylus
│   │   ├── Shade            → solo Shade
│   │   ├── Taxon            → solo Taxon
│   │   ├── Wyrm             → solo Wyrm
│   │   └── Nautilus         → solo Nautilus
│   ├── Moa                  → cualquier Moa
│   └── Hound                → cualquier Hound
└── BEAST                    → todos los bestias
    ├── Kavat                → cualquier Kavat
    │   ├── Adarza Kavat     → solo Adarza
    │   ├── Smeeta Kavat     → solo Smeeta
    │   └── Vasca Kavat      → solo Vasca
    ├── Kubrow               → cualquier Kubrow
    │   ├── Chesa Kubrow     → solo Chesa
    │   ├── Huras Kubrow     → solo Huras
    │   ├── Raksa Kubrow     → solo Raksa
    │   ├── Sahasa Kubrow    → solo Sahasa
    │   └── Sunika Kubrow    → solo Sunika
    ├── PREDASITE            → cualquier Predasite
    │   ├── Medjay Predasite → solo Medjay
    │   ├── Pharaoh Predasite→ solo Pharaoh
    │   └── Vizier Predasite → solo Vizier
    ├── VULPAPHYLA           → cualquier Vulpaphyla
    │   ├── Crescent Vulpaphyla → solo Crescent
    │   ├── Panzer Vulpaphyla   → solo Panzer
    │   └── Sly Vulpaphyla      → solo Sly
    └── Helminth Charger     → solo Helminth Charger
```

Valores especiales:
- `ANY` — cualquier compañero (solo Companion Weapon Riven Mod)
- `Claws` / `Kavat Claws` / `Kubrow Claws` / `Helminth Claws` — mods de arma de compañero (Posture Mods y precepts de melee)

### Distribución por `compatName` (165 mods totales)

| compatName | count | nivel |
|---|---|---|
| `Claws` | 27 | arma (melee de bestia) |
| `COMPANION` | 26 | universal |
| `ROBOTIC` | 11 | grupo |
| `BEAST` | 10 | grupo |
| `Hound` | 9 | tipo |
| `Moa` | 8 | tipo |
| `Sentinel` | 7 | tipo |
| `Kavat` | 6 | tipo |
| individuales | ~61 | compañero específico |

### Fix aplicado

- `generate-data.mjs` — `mapMod` incluye `compatName: raw.compatName ?? null`
- `types.ts` — `Mod` incluye `compatName?: string | null`
- `mods.json` regenerado

### Implicaciones para ModsView

Con `compatName` disponible, el filtrado de compañeros puede operar en dos niveles:
1. **Nivel grupo** (`ROBOTIC` / `BEAST`) — tab principal, igual que el juego
2. **Nivel tipo** (`Sentinel`, `Kavat`, `Moa`...) — subtab o filtro secundario
3. **Nivel individuo** (`Carrier`, `Smeeta Kavat`...) — filtro avanzado o búsqueda

La lógica de filtrado necesita considerar la jerarquía: un mod con `compatName: "BEAST"` aplica a todos los Kavats, Kubrows, etc. Un mod con `compatName: "Kavat"` aplica a todos los Kavats pero no a los Kubrows.

Esto es más complejo que un simple `item.compatName === selected` — requiere un mapa de pertenencia jerárquica. Pendiente de diseño cuando se implemente el filtrado avanzado de compañeros.
