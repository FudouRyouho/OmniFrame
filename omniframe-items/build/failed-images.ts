/**
 * Imágenes cuya descarga falló en el último build de upstream. Esa lista la producía `saveImages`,
 * que este build no corre; `dedupImageNames` la necesita para reemplazar su imagen por `missing.png`
 * ANTES de resolver colisiones entre categorías. Hoy es un único Glyph, de una categoría que no se emite.
 * Se mantiene a mano; si aparece una imagen rota que colisione con una emitida, se agrega acá.
 */
export const FAILED_IMAGES: readonly string[] = ['Deathma666ot Glyph']
