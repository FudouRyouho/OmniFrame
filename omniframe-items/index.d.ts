// Tipos PRESTADOS de @wfcd/items — el runtime ya no lo es.
//
// `index.mjs` dejó de extender la clase de upstream: lee nuestro propio `data/json`. Los ítems
// conservan el shape que produce su `parser` (que el build propio importa), así que sus tipos siguen
// describiendo el dato correctamente y no hay razón para duplicarlos todavía.
//
// Lo que este passthrough NO describe: los campos que agrega `enrichItems` (weaponClass,
// upgradeTypes, wikiFaction, baseLevel, …). Cuando el shape divergía de verdad —o cuando el tipado
// salga de `@shared` a un paquete reusable— estos tipos pasan a ser propios. Ver OQ-DATA-16.
export { default } from '@wfcd/items';
