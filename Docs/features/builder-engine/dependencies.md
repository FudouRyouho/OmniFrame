# Builder Engine Dependencies

> Estado: activo
> Rol: mapear dependencias de entrada y salida del builder engine
> Fuente de verdad de: relaciones del track con el resto del proyecto
> Ultima actualizacion: 2026-03-28

## Depende de

- schema de abilities estable
- fuente numerica de mods
- `LoadoutProvider` y contratos de integracion para `LoadoutInput`, `ResolvedLayout` y `EngineOutput`
- referencia clara de mecanicas del juego cuando el engine las necesite

## Desbloquea a

- `../navigation-shell/status.md`
- futuras vistas de arsenal
- simulaciones y comparaciones de build

## Deudas tecnicas relacionadas

- hidratacion runtime actual de abilities
- `arcanes.json` se genera con `generate-data` y se consume en `view/ArcanesView.tsx` (listado); falta modelado completo para el engine
- falta de documentacion de companions para v2

