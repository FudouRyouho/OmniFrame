---
Estado: "finalizado"
Rol: "Auditoría de estabilización taxonómica y lógica de filtrado"
Version: "v0.0.3"
Impacto_ID: "P-04"
Fidelidad_Fisica: "Project/scripts/normalization/entities.ts"
Fecha_de_creacion: "2026-04-22"
Fecha_de_actualizacion: "2026-04-23"
---

# Audit: Taxonomic Stabilization (2026-04-22)


> Estado: **Finalizado**
> Impacto: 🔴 MAJOR (Cambio en contrato de pipeline y lógica de filtrado UI)
> Responsable: Antigravity AI

## 1. Problema Raíz
Se detectó una deriva taxonómica crítica donde:
1. Las **Glaives** y otras armas especializadas no eran filtrables por su clase real (clase 'glaive' perdida).
2. Los **Compañeros Modulares** (Moas/Hounds) eran clasificados como armas secundarias (`Pistols`) por inconsistencias en los datos de Digital Extremes (DE).
3. La interfaz de **Arcanos** mostraba iconos incorrectos (Necramech) y carecía de sub-filtros funcionales.

## 2. Modificaciones en el Fork (`warframe-items`)

Para resolver la pérdida de metadatos de la Wiki, se aplicó un parche directo en el pipeline de build del fork:

- **Archivo**: `warframe-items/build/parser.mjs`
- **Cambio**: Se modificó la función `addWeaponWikiaData` para asegurar que el campo `weaponClass` (extraído del transformador de la Wiki) se asigne al objeto `item` final.
- **Razón**: Anteriormente, aunque el scraper obtenía el dato, el parser lo descartaba al no estar en el esquema de exportación estándar.

## 3. Lógica de Normalización (`Project`)

Se rediseñó el motor de normalización en `scripts/normalization/entities.ts` para implementar una **Jerarquía de Confianza**:

1. **Prioridad de Dominio**: Se estableció que la `category` (Pets, Sentinels) manda sobre la `productCategory` (Pistols) para evitar que los compañeros modulares contaminen el catálogo de armas.
2. **Inyección Heurística (Fallback Guard)**:
   - Si `type` es genérico ('Pets'), se utiliza el `uniqueName` para inferir el `kind` (`moa`, `hound`, `pet`).
   - Se inyectan tags taxonómicos automáticos (`robotic`, `beast`, `sentinel`, etc.) para habilitar los filtros de la UI.
3. **Persistencia de Clase**: Se extendió la interfaz `EntityTaxonomy` para incluir `weaponClass`, permitiendo que el motor de filtrado consuma tags como `glaive`, `sword` o `sniper` directamente desde la fuente.

## 4. Refactor de Interfaz y Filtros

### Arcanos (`ArcanesToolbar.tsx`)
- Se eliminaron las entradas hardcodeadas con claves `unknown`.
- Se implementó un mapeo dinámico basado en el campo `compat_name` del dataset.
- Se añadieron sub-filtros para: `Warframe`, `Primary`, `Secondary`, `Melee`, `Operator` y `Amp`.

### Lógica de Filtrado (`use-items-filters.ts`)
- Se implementaron **Agrupaciones Semánticas** para Arcanos:
  - `Primary` ahora incluye automáticamente `shotgun` y `bow`.
  - `Melee` incluye `zaw`.
  - `Operator` incluye `amp`.

## 5. Mantenimiento y Deuda
- **LF Policy**: Se instauró el uso de `.editorconfig` con `end_of_line = lf` para prevenir errores de parcheo en entornos Windows.
- **Build Warning**: Cualquier actualización del fork de `warframe-items` requiere verificar que el parche en `parser.mjs` persista, de lo contrario la taxonomía de las Glaives se romperá nuevamente.

---
*Documento generado tras la sesión de estabilización del 22 de Abril de 2026.*
