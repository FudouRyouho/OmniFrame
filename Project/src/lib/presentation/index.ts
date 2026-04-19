/**
 * Suite de presentación — src/lib/presentation/
 *
 * Agrupa componentes y utilidades de rendering semántico inline.
 * Cada pieza consume semántica ya resuelta — no la inventa ni la redefine.
 *
 * Piezas actuales:
 *   - FormattedText  — parsea tags DT_* en texto y los reemplaza por iconos
 *   - IconDamageType — icono + label + popover de tipo de daño
 *   - IconTag        — icono + label de facción
 *
 * Referencia canónica: Docs/domains/ui/presentation-layer.md
 */
export { FormattedText } from "./FormattedText";
export { IconDamageType } from "./icons/IconDamageType";
export { IconTag } from "./icons/IconTag";
