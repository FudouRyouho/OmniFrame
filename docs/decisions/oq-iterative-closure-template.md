---
Estado: "referencia"
Rol: "Plantilla para cerrar Open Questions de forma iterativa"
Version: "v0.2.0"
Impacto_ID: "G-OQ-Template"
Fidelidad_Fisica: "docs/governance/open-questions.md"
Fecha_de_creacion: "2026-04-13"
Fecha_de_actualizacion: "2026-05-25"
---

# Plantilla — Cierre iterativo de Open Questions

Patrón homogéneo para cerrar OQ abiertas cuando la decisión fija una **dirección acotada**, no un cierre total.

**Usar cuando:** OQ con múltiples opciones viables que impactan roadmap; cierre parcial con criterio iterativo.
**No usar para:** decisiones locales de track, ambigüedad aún no lista para cerrarse, OQ ya cerradas (editar la sección existente en `../governance/open-questions.md`).

---

## Estructura mínima de cierre

### Encabezado

```
## OQ-N — [Título] ✓ CERRADO (YYYY-MM-DD)
```

Si el cierre es acotado por iteración: `✓ CERRADO PARCIAL (YYYY-MM-DD, dirección fijada)`.

### Contexto

- **Dominio:** [dominio transversal afectado]
- **Pregunta original:** [formulación breve de la OQ original]
- **Impacto:** [efecto en módulos/tracks dependientes]
- **Estado anterior:** abierto / parcial / [última lectura conocida]

### Opciones consideradas

- **A** — [descripción + impacto si se elige]
- **B** — [descripción + impacto si se elige]
- **C** — [descripción + impacto si se elige]

### Decisión

- **Opción elegida:** [X] — [síntesis ejecutiva]
- **Por qué ganó:** [criterio técnico]; [criterio de mantenimiento/escalado si aplica]
- **Lectura de cierre:** [qué implica exactamente; qué se diferió; qué frontera queda fija vs cuál aún puede evolucionar]

### Alcance iterativo (solo si es cierre parcial)

- **Esta iteración cierra:** [dirección arquitectónica / contrato mínimo]
- **Diferido explícito:** [criterio de ejecución / iteración prevista]
- **Criterio de cierre siguiente:** [evidencia/hito verificable]

### Documentación a actualizar

- `docs/governance/open-questions.md` — sección OQ-N
- `docs/governance/current-state.md` — si afecta arquitectura

---

## Checklist antes de cerrar

- [ ] Dominio y pregunta original son claros
- [ ] Opciones son mutuamente excluyentes
- [ ] Decisión tiene fundamento técnico explícito
- [ ] Si parcial: alcance iterativo es operativo, no vago
- [ ] Criterio de cierre siguiente es verificable
