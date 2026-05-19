# Canvas Composition Mod Guide

> [!NOTE]
> Las referencias de las posiciones de las imagenes siempre sera en relacion al canvas completo.

## Introduccion a el concepto del Canvas de los Mods

- El canvas se divive principalmente en 3 grupos principales.

1. "Canvas" completo incluyendo paddings externos 333x439px
2. "FrameTop" 333x175px X:0 Y:0
3. "FrameBottom" 333x159 X:0 Y:280

- "Puntos cardinales" o "guias" de posicionamiento relativo.

> Concepto de 'guia' o 'grilla' imaginaria de posicion, 'limite' imaginario de 'hasta donde llega un elemento', etc como 'referencia de posicion relative'.

1. Guias de limite del canvas:

- Guias X :
- - 20px : Padding Izquierdo
- - 44px : Posicion aproximada del "Slider" izquierdo.
- - 290px : Posicion aproximada del "Slider" derecho.
- - 313px : Padding Derecho
- Guias Y :
- - 21px : Padding Superior
- - 52px : Posicion aproximada de "Background"
- - 86px : Posicion aproximada de "Fusion" (Final, no inicio)
- - 175px : Limite de FrameTop
- - 280px : Inicio de FrameBottom
- - 349px : Posicion aproximada de 'Tab compatibilidad' (Inicio, aun en proceso, sin recursos establecidos en /test)
- - 388px : Posicion Aproximada de final del "Background" (Aunque, los recursos estas redimencionados 2-4px para no 'salir' de los bordes, esto ya se maneja en las propias imagenes de fondo que tiene una resolucion completa del canvas.)
- - 419px : Limite de FrameBottom y Fin del Canvas (Sin contar padding exterior)

## Explicacion de la composicion de las imagenes a debate.

- Todos los "Frames" tienen sus respectivos 'padding' con la resolucion definidas anteriormente.
- Los "Backgrounds" incluyen los "Padding" exteriores teniendo la resolucion del canvas completo.
- Los "Sliders" tienen su propia resolcion independiente, pero el H es del canvas completo (439px) incluyendo los padding exteriores. (De momento solo se ha exportado el "Galvanized" como prueba.)
- Aun no se ha exportado los "Tab de compatibilidad".

## Jerarquia de Capas (Z-Index Teorico)

1. **z-10**: Background (Lienzo base).
2. **z-11**: Contenido (Texto de descripcion, Imagen del Mod, Estrellas de Fusion).
3. **z-12**: Frames (Top y Bottom).
4. **z-13**: Elementos con Glow (Sliders laterales y Tab de compatibilidad).

> [!NOTE]
> El contenido (z-11) vive dentro del cuerpo del mod, mientras que los glows (z-13) deben estar por encima de los frames para que sus resplandores se proyecten correctamente sobre los bordes metalicos.

