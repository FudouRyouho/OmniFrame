# Shell Provider Refactor — 2026-03-25

> Estado: referencia historica
> Rol: snapshot del refactor que introdujo `ShellProvider` en el corte 2026-03-25
> Fuente de verdad de: trazabilidad del cambio realizado en ese momento
> No usar para: frontera operativa actual de integracion shell/builder
> Ultima actualizacion: 2026-03-28

> **Nota 2026-03-28**: este snapshot sigue siendo util como antecedente, pero la lectura
> operativa actual vive en `Docs/features/navigation-shell/status.md`,
> `Docs/decisions/open-questions.md` (OQ-2) y
> `Docs/domains/integration/runtime-composition.md`.

**Estado original del snapshot:** COMPLETADO — 2026-03-25

## Motivación

`ContextualActionsProvider` mezcla tres responsabilidades que no pertenecen al mismo nivel:

1. **Parsing de rutas** — Leer `pathname` y segmentarlo para derivar zona/vista/entidad
2. **Estado de zona de shell** — Determinar qué footer/header corresponde a cada ruta
3. **Acciones contextuales** — Definir `ContextualAction[]` (concepto de dominio, no de shell)

`resolvePageTitle()` vive como función local en `HudHeader.tsx`, duplicando conocimiento de rutas y siendo no-reutilizable.

## Decisión

Crear `ShellProvider` que centralice toda resolución de `useLocation()` y exponga un contrato tipado. `ContextualActionsProvider` se elimina completamente.

## Contrato

```ts
type ShellZone = "equipment" | "arsenal" | "profile" | "options" | "dev" | "home";
type FooterKind = "none" | "item-details" | "arsenal";

type ShellContextValue = {
  zone: ShellZone;
  view: string | null;       // "warframes" | "primary" | etc — null fuera de /equipment
  isDetail: boolean;          // true cuando pathname tiene 3 segmentos bajo /equipment
  entityId: string | null;    // decodeURIComponent del 3er segmento
  footerKind: FooterKind;
  pageTitle: string;          // mueve resolvePageTitle() fuera de HudHeader
};
```

## Decisiones de implementación

- `availableActions: ContextualAction[]` se elimina del contrato. Los botones en `HubFooter` son placeholders que siempre se muestran cuando `footerKind === "item-details"`. Las acciones reales vendrán con el builder engine.
- `FooterKind` empieza con solo `"none" | "item-details"`. Arsenal/Profile footers se agregan cuando esas zonas tengan UI real.
- El directorio `ContextualActions/` desaparece completamente.
- `ShellProvider` va entre `MenuProvider` y `ThemeProvider` en la jerarquía del root.
- `resolveShell(pathname)` es una función pura (sin hooks) — testeable en aislamiento.

## Archivos afectados

| Archivo | Acción |
|---|---|
| `Project/src/providers/ContextualActions/contextual-actions-context.tsx` | ELIMINADO |
| `Project/src/providers/Shell/shell-context.tsx` | CREADO |
| `Project/src/features/hud/HudHeader.tsx` | MODIFICADO |
| `Project/src/features/hud/footer/HubFooter.tsx` | CREADO |
| `Project/src/features/hud/footer/ItemsDetailsFooter.tsx` | CREADO |
| `Project/src/features/hud/footer/ArsenalFooter.tsx` | CREADO |
| `Project/src/features/hud/HubFooter.tsx` | ELIMINADO |
| `Project/src/main.tsx` | MODIFICADO |

## Jerarquía resultante de providers

```
BrowserRouter
  └─ DataStateProvider
      └─ MenuProvider
          └─ ShellProvider          ← nuevo (era ContextualActionsProvider)
              └─ ThemeProvider
                  └─ App
```

## Resultado

Implementado sin errores. TypeScript 0 errores (`npx tsc -b --noEmit`).

- `providers/Shell/shell-context.tsx` creado con `resolveShell()` pura, `ShellProvider` y `useShell()`
- `HudHeader.tsx` ya no importa `useLocation` ni contiene `resolvePageTitle` — consume `useShell().pageTitle`
- `features/hud/footer/HubFooter.tsx` creado como footer principal; siempre muestra `Back` fuera de `home` y delega contenido contextual a sub-footers por `footerKind`
- `ItemsDetailsFooter.tsx` añadido para `Build / Similar / Wiki`; `ArsenalFooter.tsx` añadido como placeholder
- `main.tsx` actualizado: `ShellProvider` reemplaza `ContextualActionsProvider`
- `contextual-actions-context.tsx`, `features/hud/HubFooter.tsx` y `features/equipment/EquipmentView.tsx` eliminados como código huérfano
