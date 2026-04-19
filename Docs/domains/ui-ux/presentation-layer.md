---
Estado: "activo"
Rol: "Documentar la capa de traducción, mapeo y renderizado de la UI"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Presentation"
Fidelidad_Fisica: "Project/src/lib/item-details.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Presentation Layer

## Flujo de Presentación de Datos

El sistema procesa el dato crudo en tres etapas antes de llegar al usuario:

1.  **Traducción (`Project/src/lib/i18n/`)**: Tablas de lookup para labels, iconos y nombres fijos.
2.  **Mapeo (`Project/src/lib/item-details.ts`)**: Transforma los stats calculados en un array de `StatEntry[]` (ordenado y formateado).
3.  **UI (`Project/src/shared/components/items/specs/`)**: Componentes que renderizan los `StatEntry[]` en vistas de detalle completas.

## Suite de Presentación (`Project/src/shared/components/`)

Centraliza componentes de renderizado semántico y utilidades visuales compartidas.

- **`FormattedText`**: Renderiza descripciones con tags semánticos (`<DT_SLASH>`, etc).
- **`CustomPopover.tsx`**: Base para todos los popovers de información.
- **`items/cards/`**: Representación visual de ítems en grillas.

## Mapeo de Stats (`item-details.ts`)

Encapsula la lógica de "qué mostrar y cómo":
- **Formateado**: Conversión de números a strings legibles (ej: `%`, metros).
- **Jerarquía**: Orden inspirado en la Wiki (Ataque → Arma → Daños).
- **Secciones**: Soporte para headers visuales en la lista de stats.

---

### Notas de Diseño
La centralización en `shared/components/items/` permite que la misma lógica de visualización de stats sea utilizada en el buscador de equipo y en el Arsenal/Builder.
