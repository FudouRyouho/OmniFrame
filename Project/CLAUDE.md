# Reglas de arquitectura — Project/

Aplica a todo trabajo en `Project/src/` y `Project/scripts/`.
Estas restricciones son equivalentes a errores de compilador: no se bypassean.

## Restricción 1: Localidad estricta

Los módulos de un dominio no pueden importar de dominios hermanos directamente.

- Imports permitidos: `@shared/*`, `@lib/*`, `./internal/*`
- Si un import viola esto → detener y mover la dependencia a `@shared/` antes de continuar.

## Restricción 2: Modelo de cuatro pilares

Toda estructura de datos de ítem mantiene exactamente cuatro propiedades raíz: `domain`, `kind`, `family`, `stats`.

- No agregar propiedades raíz nuevas sin autorización explícita.
- Si un cambio rompe esto → output `[ESPERANDO AUTORIZACIÓN]` y detener.

## Restricción 3: Integridad del pipeline

Los filtros de UI dependen del array `tags` — nunca de sets de compatibilidad hardcodeados.

- No hardcodear lógica de compatibilidad en componentes UI.

## Convención: scripts de patch one-off

Los scripts que mutan un override una sola vez (patches one-off) van en `Project/scripts/.local/` — carpeta gitignored. Git no los trackea: no generan ruido ni hace falta purgarlos a mano.

- Herramientas read-only o reusables (triage, generadores reproducibles) → `Project/scripts/` normal (trackeadas).
- SSoT del dato = el JSON resultante. La procedencia de un cambio de datos vive en git history, no en el script.
- Citas de scripts purgados en `docs/` → reemplazar por "patch one-off (purgado tras uso; ver git history)".

## Triggers de fricción

Si cualquier cambio rompe la Restricción 1 o 2:

- Impacto: `MAJOR_RED`
- Acción: detener ejecución, output `[ESPERANDO AUTORIZACIÓN]`
- No continuar hasta recibir autorización explícita.
