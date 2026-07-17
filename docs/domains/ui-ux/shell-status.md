---
Estado: "referencia"
Rol: "[PLEGADO] Antiguo status del shell — su contenido vive ahora en status.md"
Impacto_ID: "UI-UX-Shell-Status"
Fidelidad_Fisica: "Project/src/providers/Shell/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-06-16"
---

# Navigation Shell Status — [PLEGADO en `status.md`]

> **Este doc se plegó en [`./status.md`](./status.md)** (campaña UI, paso 4, 2026-06-16). El status del
> shell/menu vive ahora en `status.md` §1.4 (Menu / Shell) + §2 (mapas cross-cutting). Contenido stale
> corregido en la fusión: la zona "Dev" y la abstracción `routes` fueron **purgadas** (MS1/2/3); el footer
> `Build`/`Wiki` son **false-affordances** (botones sin handler, ver `status.md` §2.2 + U-4).
>
> **Se conserva como referencia** sólo hasta que el barrido de mispointers (`@SSoT`) re-apunte los archivos de
> código (`shell-context.tsx`, `App.tsx`, `use-arsenal-ui-session.ts`, `ArsenalView.tsx`, `use-item-details.ts`)
> hacia `status.md`. Tras ese barrido, este archivo se retira.

Durable (ya en `status.md`): `ShellProvider` = resolver puro `URL→estado-de-shell` (`zone`/`view`/`isDetail`/
`footerKind`/`pageTitle`); `DataRegistry` = cache en memoria (`Map`, sin IndexedDB); `/arsenal` = STUB
(`use-arsenal-ui-session`, slot de archon shard cross-route).
