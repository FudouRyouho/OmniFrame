# Auditoría de Imágenes: Investigación Completa

> Estado: referencia historica
> Rol: snapshot de investigacion y ejecucion de la estrategia de imagenes en el corte 2026-03-25
> Fuente de verdad de: trazabilidad del cambio aplicado entonces
> No usar para: estado operativo actual del pipeline de datos e imagenes
> Ultima actualizacion: 2026-03-28

> **Nota 2026-03-28**: usar este archivo como antecedente de implementacion. La lectura
> operativa vigente sobre datos e imagenes debe salir de `Docs/features/data-foundation/status.md`
> y de los documentos de `Docs/domains/data/`.

> **Fecha:** 2026-03-25
> **Estado:** Implementado — 2026-03-25
> **Propósito:** Estrategia de migración de imágenes de items desde CDN a almacenamiento local

---

## I. Estado Actual

### Cómo fluyen las imágenes hoy

```
warframe-items npm package
  ├─ data/img/      ← 1000-2000+ archivos PNG/JPG (100-200 MB)
  └─ data/json/     ← JSON con imageName
  
generate-data.mjs (build time)
  ├─ Lee: imageName del JSON fuente
  ├─ Construye: URL CDN = `https://cdn.warframestat.us/img/${imageName}`
  └─ Escribe: Project/public/data/*.json con URLs CDN
  
Runtime (navegador)
  └─ Descarga imágenes desde cdn.warframestat.us
```

### Campos en JSON actual

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `image` | URL CDN completa | `https://cdn.warframestat.us/img/ash-f2c6f3ab3f.png` |
| `imageName` | Nombre de archivo | `ash-f2c6f3ab3f.png` |
| `wikiaThumbnail` | URL wiki | null (never used) |
| `wikiaUrl` | URL wiki | `https://wiki.warframe.com/w/Ash` |

### Problemas detectados

1. **Latencia**: CDN remota, especialmente en zonas sin cobertura óptima
2. **Fallos ocasionales**: URLs del CDN cambian o se cae el servicio
3. **Dependencia externa**: Sin control sobre disponibilidad
4. **Fallback roto**: `wikiaThumbnail` siempre es null, wiki URL no se usa

---

## II. Opción A: Copiar Localmente (Recomendado)

### Viabilidad

| Métrica | Valor |
|---------|-------|
| Archivos en warframe-items/data/img/ | 1000-2000+ |
| Tamaño promedio por imagen | 30-150 KB (PNG optimizado) |
| **Tamaño total estimado** | **100-200 MB** |
| Viabilidad técnica | ✅ Totalmente realista |
| Overhead en repo | Moderado si se versionan o se usan .gitignore |

### Estructura propuesta en `Project/public/`

```
Project/public/
├── data/
│   └── *.json    (datos + referencias a imágenes locales)
├── assets/       (UI/iconografía OmniFrame — existente)
└── images/       ← NUEVO: imágenes de items
    ├── warframes/          (60 items, ~20 MB)
    ├── primary/            (150+ items, ~40 MB)
    ├── secondary/          (80+ items, ~20 MB)
    ├── melee/              (200+ items, ~50 MB)
    ├── archwing/           (28 items, ~8 MB)
    ├── companions/         (80+ items, ~15 MB)
    ├── arcanes/            (200+ items, ~20 MB)
    └── [otros]/            (mods, vehicles, etc.)
```

**Alternativa flat** (más simple):
```
Project/public/images/       (todos los .png sin subdirectorios)
```

### Configuración JSON recomendada

**Dual URLs (seguro, recomendado):**
```json
{
  "uniqueName": "Ash",
  "name": "Ash",
  "image": "/images/warframes/ash-f2c6f3ab3f.png",
  "imageFallback": "https://cdn.warframestat.us/img/ash-f2c6f3ab3f.png",
  "imageName": "ash-f2c6f3ab3f.png"
}
```

**En componentes:**
```tsx
<img 
  src={item.image} 
  alt={item.name}
  onError={(e) => {
    if (e.target.src !== item.imageFallback) {
      e.target.src = item.imageFallback;
    }
  }}
/>
```

**Ventajas:**
- Local es rápido y confiable
- CDN es fallback si algo falla
- Sin breaking change si se necesita rollback

---

## III. Opción B: Mantener CDN (Status Quo)

**Continuar usando solo URLs CDN sin cambios locales.**

**Ventajas:**
- Cero cambios en código
- Imágenes siempre actualizadas con warframe-items
- Sin overhead en repositorio

**Desventajas:**
- Latencia y fallos ocasionales continúan
- Dependencia externa no eliminada
- Fallback roto no se soluciona

---

## IV. Opción C: Híbrida por Criticidad

**Estructura:**
- Items principales (warframes, mélee): local
- Items secundarios (mods, arcanes): CDN remoto
- UI/categorías: local (ya está)

**Ventajas:**
- Balance entre performance y overhead
- Controla resolución de items más críticos

**Desventajas:**
- Complejidad de mantenimiento
- Lógica duplicada en componentes

---

## V. Plan de Implementación (Si se elige Opción A)

### Fase 1: Preparación
1. Copiar `warframe-items/data/img/*` → `Project/public/images/` (manual o script)
2. Gitignore si es necesario (o comprometer como parte del build artifact)

### Fase 2: Actualizar generate-data.mjs
```javascript
// Cambiar:
- image: `https://cdn.warframestat.us/img/${imageName}`

// Por:
+ image: `/images/warframes/${imageName}`,
+ imageFallback: `https://cdn.warframestat.us/img/${imageName}`
```

### Fase 3: Actualizar componentes
Cambiar renderización de imágenes para soportar fallback:
- [BaseItemCard.tsx](Project/src/features/equipment/view/cards/BaseItemCard.tsx)
- [WarframeDetailView.tsx](Project/src/features/equipment/detail/WarframeDetailView.tsx)
- Otros componentes que usen `item.image`

### Fase 4: Testing
- Verificar que imágenes locales cargan
- Probar fallback a CDN (romper imagen local, ver que se recupera)

---

## VI. Decisiones Aplicadas

1. Opción elegida: **A — Copiar localmente**
2. Estructura elegida: **flat** en `Project/public/imagenes/`
3. Sincronización: **CLI separado** `scripts/get-img.mjs` ejecutado post-generación

---

## VII. Resultado de Implementación

**→ Opción A (Copiar Localmente) con Dual URLs**

**Por qué:**
- Mejora performance significativamente (local vs CDN remoto)
- Elimina fallos ocasionales del CDN
- Fallback protege contra errores
- Tamaño (100-200 MB) es realista para repositorio moderno
- Complejidad de cambio es moderada (generate-data.mjs + componentes)

**Estructura:** Organizada por tipo (`warframes/`, `primary/`, etc.) para futura escalabilidad.

**Sincronización:** Script automatizado en generate-data.mjs (cada build copia imágenes desde node_modules/@wfcd/items).

---

### Cambios ejecutados

- `scripts/get-img.mjs` creado para:
  - leer referencias `imageName` desde `public/data/*.json`
  - copiar desde `warframe-items/data/img` hacia `public/imagenes`
  - limpiar sobrantes con `--clean`
  - reportar faltantes
- `scripts/generate-data.mjs` ahora emite rutas locales en `image`: `/imagenes/<imageName>`
- `package.json`:
  - `generate:data` encadena `generate-data.mjs` + `get-img.mjs --clean`
  - `get:img` disponible como comando independiente
- runtime con fallback a CDN:
  - `BaseItemCard.tsx` usa `onError` para fallback a `https://cdn.warframestat.us/img/<imageName>`
  - `WarframeDetailView.tsx` intenta local para habilidades y cae a CDN/wiki

### Verificación

- `npm run generate:data` ejecuta pipeline completo correctamente
- `npm run get:img` deja `public/imagenes` sincronizado
- `npx tsc -b --noEmit` sin errores
- faltantes reales en fuente: 3 imágenes (`imageName` sin archivo en `warframe-items/data/img`)
