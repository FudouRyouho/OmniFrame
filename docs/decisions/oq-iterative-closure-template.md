# Plantilla de Cierre Iterativo para Open Questions

> Rol: patrón homogéneo para cerrar OQ abiertas de forma iterativa
> Uso: aplicar a OQ-5, OQ-9+, y futuras preguntas transversales abiertas
> Actualización: 2026-04-13 (primera instancia)

## Cuándo usar esta plantilla

- **Sí**: OQ abierta que requiere decisión explícita sobre **dirección acotada** (no cierre absoluto).
- **Sí**: OQ con múltiples opciones viables que impactan roadmap.
- **No**: OQ que ya está cerrada (usar sección `✓ CERRADO` de `open-questions.md`).
- **No**: decisiones locales de track (usar `questions.md` local del track).

## Estructura de cierre iterativo

### 1. Encabezado estándar

```markdown
## OQ-N — [Título] ✓ CERRADO (YYYY-MM-DD)
```

**Nota**: si el cierre es **acotado por iteración** (no absoluto), añadir:
```markdown
## OQ-N — [Título] ✓ CERRADO PARCIAL (YYYY-MM-DD, dirección fijada, ejecución iterativa)
```

---

### 2. Sección de contexto

```markdown
Dominio:
- [dominio transversal afectado]

Pregunta original:
- [formulación breve de la OQ original]

Impacto:
- [efecto en módulos/tracks dependientes]

Estado anterior:
- abierto / parcial / [última lectura conocida]
```

**Ejemplo**:
```markdown
Dominio:
- integracion

Pregunta original:
- cuando deja de vivir la hidratacion de abilities en runtime y pasa al pipeline de build

Impacto:
- afecta data, engine y performance de runtime
- condiciona cierre de OQ-8 / R13

Estado anterior:
- abierto sin criterio de migración operativo
```

---

### 3. Opciones presentadas

```markdown
Opciones consideradas:
- opcion A — [descripción + impacto si se elige]
- opcion B — [descripción + impacto si se elige]
- opcion C — [descripción + impacto si se elige]
```

---

### 4. Decisión + fundamento

```markdown
Decision:
- opcion [X] — [síntesis ejecutiva]

Por que gano:
- [criterio técnico 1]
- [criterio técnico 2]
- [criterio de mantenimiento/escalado si aplica]

Lectura de cierre:
- [qué implica exactamente este cierre, sin inferencias]
- [qué se diferió, si aplica]
- [qué frontera queda fija vs qué aún puede evolucionar]
```

---

### 5. Alcance iterativo (si es cierre parcial)

```markdown
Alcance de esta iteración:
- [qué se cierra ahora: dirección arquitectónica, contrato mínimo, etc.]
- [qué se diferió explícitamente: criterio de ejecución, iteración prevista, etc.]
- [correlación con frentes del roadmap, si aplica]

Criterio de cierre siguiente:
- [qué evidencia / hito de entrega se necesita para la próxima iteración]
- [owner/track responsable]
- [referencia a roadmap.md]
```

---

### 6. Impacto en documentación

```markdown
Documentación afectada:
- `Docs/overview/horizontal-roadmap.md` — Rx actualizado
- `Docs/features/[track]/status.md` — reflejar alcance
- `Docs/overview/decision-frontier.md` — frontera vigente
- `Docs/overview/iteration-closure-[YYYY-MM-DD].md` — síntesis de this iter
```

---

### 7. Historial breve (si hay debate previo)

```markdown
Historial breve:
- [si la OQ fue debatida antes y cerrada parcialmente, registrar recorrido]
- [mentionar decisiones descartadas y por qué]
```

---

## Ejemplo completo (usando OQ-5)

```markdown
## OQ-5 — Punto de migración hidratación runtime → build-time ✓ CERRADO PARCIAL (2026-04-13, gatillo definido)

Dominio:
- integracion

Pregunta original:
- cuando deja de vivir la hidratacion de abilities en runtime y pasa al pipeline de build

Impacto:
- afecta data, engine y performance de runtime
- condiciona estabilidad de R13 en roadmap
- requiere verificación previa de R8 (abilities pipeline)

Estado anterior:
- abierto sin criterio operativo

Opciones consideradas:
- opcion A — migrar cuando R8 (abilities) pase verificación estructural estable y exista pipeline reproducible
- opcion B — migrar por fecha/hito de release, aunque haya deuda semántica
- opcion C — mantener runtime indefinidamente (postergación sin criterio)

Decision:
- opcion A — gatillo basado en calidad de datos

Por que gano:
- preserva incrementalismo: no mueve incertidumbre al build si datos aún inestables
- respeta cadena de dependencias (R13 <- R8/R12)
- permite validación clara antes de cambio de flujo
- alineado con estrategia de "carril IA paralelo" sin bloqueo cruzado

Lectura de cierre:
- OQ-5 se cierra operativamente con gatillo explícito: cuando R8 (abilities) esté en estado "validado por verificador estructural" + pipeline reproducible
- la migración misma queda dentro de R13 en `horizontal-roadmap.md`
- implementación diferida: no bloquea P2 (esta iteración) ni P1/P3/P4 aprobados
- próxima iteración: cuando R8 sea "parcial" o "implementado", reavaluar si gatillo está cumplido

Alcance de esta iteración:
- cierre de criterio de gatillo (opción A)
- referencia a R8/R12 en roadmap como dependencias
- diferimiento de implementación efectiva a próxima sesión después de R8

Criterio de cierre siguiente:
- R8 (abilities pipeline) pase verify-ability-stats.mjs con <10% errores sobre 1000+ entradas
- `merge-semantic-groups.mjs` corra reproduciblemente sin intervención manual

Documentación afectada:
- `Docs/decisions/open-questions.md#OQ-5`
- `Docs/overview/horizontal-roadmap.md#R13`
- `Docs/features/semantic-pipeline/status.md` (cuando R8 avance)

Impacto en roadmap:
- R13 no se desbloquea hasta que R8 esté en estado "parcial operativo"
- no afecta P1/P3/P4 ni carril UX
- carril IA puede trabajar en R8/R12 mientras tanto
```

---

## Checklist de aplicación

Antes de cerrar una OQ iterativamente, validar:

- [ ] Dominio y pregunta original son claros
- [ ] Impacto está documentado sin ambigüedad
- [ ] Opciones presentadas son mutuamente excluyentes
- [ ] Decisión tiene fundamento técnico explícito
- [ ] Si es cierre parcial, alcance iterativo es operativo (no vago)
- [ ] Criterio de cierre siguiente es verificable
- [ ] Linkaje a roadmap.md (R0..R17) es explícito
- [ ] Referencias de archivo en `Docs/` son válidas

---

## Cuándo NO usar esta plantilla

- Decision local de feature (ej. "¿navbar arriba o abajo?") → usar `features/[track]/questions.md`
- Ambigüedad que requiere 1-2 horas más de debate antes de cerrar → diferir a siguiente sesión
- OQ ya cerrada → editar sección existente en `open-questions.md`

---

## Mantenimiento de esta plantilla

**Dueño**: Architecture Critic (usuario principal del proyecto)  
**Revisión**: cada 2-3 ciclos de iteración  
**Cambios aceptados**: simplificación de estructura, clarificación de ejemplos
