---
Estado: "activo"
Rol: "Punto de entrada y mapa de navegación del SSoT de OmniFrame"
Version: "v0.1.0"
Impacto_ID: "N/A"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-04-15"
Fecha_de_actualizacion: "2026-05-18"
---

# OmniFrame — Documentation Suite

Documentación orientada a consumo de agentes IA. Refleja la realidad física y operativa del proyecto.

---

## Punto de entrada por intención

| Intención | Leer primero |
|---|---|
| ¿Qué hay que hacer hoy? | [`overview/impact-matrix.md`](overview/impact-matrix.md) |
| ¿Cuál es el estado real del código? | [`governance/current-state.md`](governance/current-state.md) |
| ¿Qué preguntas están abiertas sin respuesta? | [`governance/open-questions.md`](governance/open-questions.md) |
| ¿Qué decisiones ya están cerradas y no se reabren? | [`governance/closed-decisions.md`](governance/closed-decisions.md) |
| ¿Cuáles son las convenciones de nombres? | [`governance/naming-conventions.md`](governance/naming-conventions.md) |
| ¿Cómo funciona el motor de simulación? | [`design/sim-v2/`](design/sim-v2/) |
| ¿Cómo están estructurados los datos? | [`domains/data/`](domains/data/) |
| ¿Qué hacen los tipos semánticos? | [`domains/semantic/`](domains/semantic/) |
| ¿Cómo está organizada la UI? | [`domains/ui-ux/`](domains/ui-ux/) |
| ¿Cómo funciona el engine matemático? | [`domains/engine/`](domains/engine/) |
| ¿Cómo se integra el estado con el motor? | [`domains/integration/`](domains/integration/) |

---

## Estructura de `docs/`

```
docs/
├── overview/       — visión global, backlog técnico, cierres de iteración
├── governance/     — reglas, convenciones, estado actual, OQ, decisiones
├── design/
│   └── sim-v2/    — arquitectura, contratos y roadmap del motor de simulación
├── domains/        — conocimiento técnico por área de responsabilidad
│   ├── data/      — pipeline de datos, schemas de entidades, SSoT
│   ├── engine/    — motor matemático y fórmulas
│   ├── integration/ — capa entre estado del usuario y motor
│   ├── semantic/  — contratos de tipos cross-cutting (engine + data + UI)
│   └── ui-ux/    — presentación, vistas, shell, componentes
└── decisions/      — debates técnicos activos y decisiones en curso
```

---

## Reglas para agentes

- **Leer antes de proponer.** Si el tema tiene un `schema.md`, `source-model.md` o `status.md` en el dominio — la respuesta sale de ahí.
- **No reabrir decisiones cerradas.** Están en `governance/closed-decisions.md`. Citarlas, no debatirlas.
- **Drift detectado = RED.** Si el código contradice un doc, registrar en `open-questions.md` antes de actuar.
- **Referencias de juego.** Los datos crudos del juego (abilities, wiki, mods) viven en `references/`, no aquí.
- **Reglas procedurales.** Ver `CLAUDE.md` en esta carpeta.