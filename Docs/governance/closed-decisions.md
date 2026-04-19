---
Estado: "activo"
Rol: "Registrar decisiones de arquitectura cerradas que no deben reabrirse sin evidencia nueva"
Version: "v0.0.2"
Impacto_ID: "G-ADL-Closed"
Fidelidad_Fisica: "docs/governance/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Decisiones Cerradas de Arquitectura

## Propósito

Este documento existe para evitar que decisiones ya evaluadas y cerradas sean tratadas como deudas activas o preguntas abiertas. Cada entrada incluye el contexto real que llevó al cierre.

---

## DC-1 — No hay soporte i18n / multi-locale

**Fecha de cierre:** Estimado Q1 2026 (confirmado 2026-04-18).

**Decisión:** El proyecto no soporta multi-locale ni internacionalización real. El idioma operativo es **inglés exclusivo**. No existe selector de idioma ni existe infraestructura i18n en runtime.

**Lo que sí existe (y no es i18n real):**
`src/lib/i18n/` contiene módulos de lookup de labels y assets en inglés:
- `stat-labels.ts` — labels de stats de armas y mods
- `damage-labels.ts` — labels de tipos de daño
- `category-icons.ts` — iconos por categoría
- `faction-icons.ts` — iconos y labels de facciones

El directorio se llama `i18n/` por convención de capa de presentación, **no porque implemente internacionalización**. Los propios archivos lo declaran explícitamente en sus comentarios.

**Contexto del cierre:**
El proyecto tuvo una maqueta inicial para soportar inglés, español y portugués. El choque de realidad llegó cuando se entendió el coste de mantenimiento operativo de los overrides de habilidades y mods en múltiples idiomas: los overrides son 100% manuales y requieren conocimiento del juego en cada idioma. Esto hace el mantenimiento multi-locale inviable hoy.

**Condición para reabrirse:**
Solo si se formula un sistema que permita generar overrides de idioma sin mantenimiento manual por idioma. No existe ese sistema ni existe propuesta concreta para crearlo. No es una discusión activa.

**No reabrir este debate** hasta que los contratos de datos estén completamente cerrados y exista una propuesta técnica concreta para los overrides multi-idioma.
