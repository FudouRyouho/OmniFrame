# Builder Engine Dependencies

> Estado: activo
> Rol: mapear dependencias de entrada y salida del builder engine
> Fuente de verdad de: relaciones del track con el resto del proyecto
> Ultima actualizacion: 2026-03-22

## Depende de

- schema de abilities estable
- fuente numerica de mods
- provider/layout state en integracion
- referencia clara de mecanicas del juego cuando el engine las necesite

## Desbloquea a

- `../navigation-shell/status.md`
- futuras vistas de arsenal
- simulaciones y comparaciones de build

## Deudas tecnicas relacionadas

- hidratacion runtime actual de abilities
- `arcanes.json` se genera con `generate-data` pero `ArcanesView` aun no consume datos en UI
- falta de documentacion de companions para v2

