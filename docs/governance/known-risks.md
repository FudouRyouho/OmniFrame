---
Estado: "activo"
Rol: "Registrar riesgos técnicos conocidos de dependencias externas con decisión de 'no actuar ahora'"
Version: "v0.0.2"
Impacto_ID: "G-Risks"
Fidelidad_Fisica: "."
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Riesgos Técnicos Conocidos

## Propósito

Este documento registra problemas técnicos reales que:
- No son bloqueantes en el estado actual del proyecto.
- Provienen de dependencias externas (no del código propio).
- Ya tienen una decisión tomada sobre cuándo y cómo actuar.

No es un backlog. No es un roadmap. Es un registro de "sabemos que esto puede romperse, y sabemos cuándo preocuparnos".

---

## RT-1 — Tippy.js incompatible con React 19

**Dependencia:** `@tippyjs/react@^4.2.6` + `tippy.js@^6.3.7`

**Riesgo:** Esta versión usa la API de `ref` eliminada en React 19. Genera el siguiente warning en consola:
```
Accessing element.ref was removed in React 19
```
No es bloqueante hoy. No rompe funcionalidad.

**Superficie afectada:** `CustomPopover.tsx` (`src/shared/components/CustomPopover.tsx`) es el único punto de entrada a tooltips y popovers en todo el proyecto. Cualquier migración futura pasa exclusivamente por ahí.

**Decisión activa:** No tocar hasta que sea un problema real en producción o hasta que Tippy publique soporte nativo para React 19.

**Opciones evaluadas:**
- Esperar actualización de Tippy con soporte React 19 (preferida — pasiva).
- Migrar a Floating UI.
- Migrar a Radix Tooltip.

**Trigger para reabrir:** Warning se convierte en error en producción, React actualiza a v20+, o Tippy publica soporte React 19.
