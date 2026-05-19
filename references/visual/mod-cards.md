# Guía de Proporciones Visuales: Mod Cards

Esta guía establece las relaciones matemáticas y visuales para la reconstrucción de las cartas de Mod, basadas en las capturas del juego original.

## 1. Jerarquía de Fuentes (Font Scaling)
El tamaño se calcula siempre en base al ancho de la carta (`--mod-w`).

| Elemento | Ratio (Divisor) | % del Base | Notas |
| :--- | :--- | :--- | :--- |
| **Nombre** | `w / 14.5` (Expandido) | 125% | Fuente Black/Bold. Usar `tracking-tight` si > 2 líneas. |
| **Nombre** | `w / 16` (Contraído) | 100% | Centrado sobre la imagen. |
| **Stats** | `w / 21` | 100% (Base) | Fuente Medium. Interlineado `leading-snug`. |
| **Compatibilidad** | `w / 26` | 70-75% | Bold + Uppercase. Tracking amplio en el tab. |


## 2. Layout y "Muelles" (Flex Logic)
La carta expandida se divide en tres bloques principales dentro de un contenedor `flex-col justify-between`.

*   **Bloque Superior (Nombre):**
    *   `padding-top`: ~10% del área de texto.
    *   Anclado arriba.
*   **Bloque Central (Stats):**
    *   Comportamiento `flex-1`.
    *   Actúa como un muelle que empuja la compatibilidad hacia abajo.
    *   Si hay poco texto, se centra verticalmente en el hueco sobrante.
*   **Bloque Inferior (Compatibilidad + Estrellas):**
    *   La compatibilidad se renderiza sobre la pestaña de rareza.
    *   `padding-bottom`: ~15% para dejar sitio a las estrellas y el borde inferior.

## 3. Posicionamiento de Estrellas (Fusion)
Las estrellas deben ser hijas directas del contenedor de contenido, con posicionamiento `absolute` para evitar que el flujo del texto las mueva.

*   **Normal:** `bottom: 10%`
*   **Legendario / Archon:** `bottom: 4%` (El borde es más fino y estilizado).
*   **Amalgam:** `bottom: 13%` (El borde es masivo y tiene luces laterales).
*   **Riven:** `bottom: 6%` (El marco es irregular/cristalino).


## 4. Notas de Implementación (Tailwind 4)
*   Usar `group-data-hover` para todos los cambios de estado.
*   Evitar `absolute` en el texto de stats para permitir que la carta crezca dinámicamente si el texto es muy largo.
