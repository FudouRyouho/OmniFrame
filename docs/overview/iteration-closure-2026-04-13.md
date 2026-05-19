# Cierre de Iteración 2026-04-13

> Estado: cierre operativo de decisiones y alineacion documental
> Rol: registrar el estado consolidado tras decisiones P1/P3/P4 y cierres OQ-4/OQ-8
> Fecha: 2026-04-13
> Audiencia: equipos de trabajo (IA + usuario), agentes en próximos ciclos

## Decisiones cerradas en esta iteración

### Opción B (purga quirúrgica) — Aprobada

**Contexto**: Arsenal y trace de builder contenían deuda transicional fuerte y arrastre de `B4-lite`.

**Decisión**: purga quirúrgica sin borrar el core mínimo útil.

**Implicación**:
- `Loadout` + `Resolver` se preservan como **base mínima funcional de contrato/testeo**, no como cierre final de producto.
- `Engine` fuera del barrido de purga (core de cálculo estable).
- `ArsenalView` permanece como stub/mocks para iteración UX, separado del cierre contractual.
- Trabajo paralelo autorizado: carril IA (contratos/purga) y carril usuario (UX stub).

**Documentación**: `Docs/overview/horizontal-roadmap.md`, `Docs/features/builder-engine/status.md`, `Docs/features/navigation-shell/status.md`, `Docs/overview/decision-frontier.md`.

**Bloqueante**: sólo cuando se viole la frontera Arsenal baseline ≠ Builder extendido (R3).

---

### P1 - OQ-4 Taxonomía wiki — Cerrada (Opción A acotada)

**Decisión**: cerrar alcance documental mínimo sin promover todavía un schema runtime de simulación.

**Alcance**:
- Taxonomía wiki mínima para navegación y trazabilidad documental.
- Materialización detallada en iteración concreta dentro del roadmap.
- Correlación con análisis de dataset y semántica derivada, sin bloquear carril UX.

**Documentación**: `Docs/decisions/open-questions.md#OQ-4`, `Docs/overview/horizontal-roadmap.md#R16`.

**No bloqueante v1**: correcto (diferido a análisis correlacional de dataset).

---

### P3 - OQ-8 Overrides en tipado nuevo — Cerrada (Opción A)

**Decisión**: contrato mínimo explícito de overrides por dominio (`arcane`, `companion`, `vehicle`, `archwing_weapon`), alineado al análisis de dataset en iteración correspondiente.

**Alcance**:
- Define tabla mínima de campos obligatorios + origen (raw/derivado/override) por dominio.
- Ejecución iterativa junto al análisis correlacional del dataset.
- No adelanta integración UI final ni desplaza gate de UX.

**Documentación**: `Docs/decisions/open-questions.md#OQ-8`, `Docs/overview/horizontal-roadmap.md#R14`.

**Patrón correlativo**: replicar aprendizaje del frente mods sin forzar cierre de edge cases en mismo corte.

---

### P4 - Gate de convergencia UX↔contratos — Formalizado

**Decisión**: Definition of Ready explícito para integración UI final (evitar choques).

**Regla de convergencia**:
1. Flujo UX de `/arsenal` aprobado por usuario ✓ required
2. Payload B4 final disponible ✓ required
3. Wiring mínimo R5 operativo sin `B4-lite` ✓ required

**Guardrail crítico**: la existencia de stubs/placeholders funcionales **NO habilita** cierre de integración UI final.

**Documentación**: `Docs/overview/horizontal-roadmap.md` (carriles paralelos + regla de convergencia).

---

## Puntos pendientes de confirmación

### OQ-5 Migración hidratación runtime → build-time

**Estado**: abierto, pendiente de confirmación explícita por usuario.

**Opciones vigentes**:
- **A**: gatillo por calidad de datos (R8 verificación estructural estable).
- **B**: migración por fecha/hito release.
- **C**: mantener runtime indefinidamente.

**Lectura actual**: abierto sin prejuicio. No bloquea P1/P3/P4.

**Próximo paso**: usuario confirma A/B/C en siguiente sesión.

---

## Estado documental post-cierre

### Limpieza aplicada

- Narrativa de "reabierto" en `stabilization-backlog.md` clarificada (S3/S5 reflejan estado transicional, no permanente).
- Referencias a "pendiente" en `current-state.md` contextualizadas sin ambigüedad.
- `migration-status.md` actualizado para reflejar consolidación de cierre.

### Trazabilidad establecida

- OQ-4 y OQ-8 cierres linkados a `horizontal-roadmap.md` (R14, R16).
- Gate UX reforzado en `builder-engine/status.md` y `navigation-shell/status.md`.
- Carril IA + carril usuario explícitamente separados en roadmap.

### Plantilla de reutilización

**Nueva**: `Docs/decisions/oq-iterative-closure-template.md`  
Patrón homogéneo para cierres iterativos futuros de OQ abiertas.

---

## Riesgos residuales minimizados

| Riesgo | Mitigación |
|---|---|
| Inferencia sobre "cerrado total" | Alcance acotado por iteración + criterio de ejecución explícito |
| Choque UX↔contratos | Gate de convergencia con 3 checks obligatorios |
| Deuda de semantica transicional | Descrita en `decision-frontier.md` (`raw → derivado → canon → presentation`) |
| Ruido en implementación IA futura | Plantilla de cierre + linkaje a roadmap + trazabilidad por referencia |

---

## Lectura recomendada (orden de entrada)

1. `Docs/overview/horizontal-roadmap.md` (matriz de frentes actualizada)
2. `Docs/decisions/open-questions.md` (OQ-4/OQ-8 cerradas, OQ-5 explícitamente abierta)
3. `Docs/overview/decision-frontier.md` (frontera de decisión vigente)
4. `Docs/features/builder-engine/status.md` (gate UX reforzado)
5. `Docs/decisions/oq-iterative-closure-template.md` (plantilla para próximas iteraciones)

---

## Siguiente ciclo

- Confirmación de P2 (OQ-5)
- Iteración de cierre P1 (dataset correlacional)
- Ejecución transversal de P3 (overrides por dominio)
- Validación de gate P4 en cada sprint de UX
