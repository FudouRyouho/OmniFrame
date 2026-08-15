---
Estado: "activo"
Rol: "Punto de entrada y mapa de navegación del SSoT de OmniFrame"
Impacto_ID: "N/A"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-04-15"
Fecha_de_actualizacion: "2026-07-03"
---

# OmniFrame — Documentation Suite

Documentación orientada a consumo de agentes IA. Refleja la realidad física y operativa del proyecto.

---

## Punto de entrada por intención

| Intención | Leer primero |
|---|---|
| ¿Qué hay que hacer hoy? | [`governance/open-questions.md`](governance/open-questions.md) |
| ¿Cuál es el estado real del código? | [`governance/current-state.md`](governance/current-state.md) |
| ¿Qué preguntas están abiertas sin respuesta? | [`governance/open-questions.md`](governance/open-questions.md) |
| ¿Qué decisiones ya están cerradas y no se reabren? | [`governance/closed-decisions.md`](governance/closed-decisions.md) |
| ¿Cuáles son las convenciones de nombres? | [`governance/naming-conventions.md`](governance/naming-conventions.md) |
| ¿Cómo está estructurado el SSoT de datos? | [`data/`](data/) |
| ¿Qué vocabulario canónico existe (damage, factions, polarity)? | [`semantic/`](semantic/) |
| ¿Cómo funciona el motor matemático? | [`domains/engine/`](domains/engine/) |
| ¿Cómo se diseñó el motor de simulación? | [`domains/engine/design/`](domains/engine/design/) |
| ¿Cómo está organizada la UI? | [`domains/ui-ux/`](domains/ui-ux/) |
| ¿Cómo se integra el estado con el motor? | [`domains/integration/`](domains/integration/) |

---

## Estructura de `docs/`

```
docs/
├── data/         — SSoT de datos: status, decisions, rules/, schemas/, pipeline/, references/
├── semantic/     — vocabulario canónico transversal (damage-types, factions, polarity)
├── domains/      — dominios funcionales (comportamiento)
│   ├── engine/         — motor matemático + design/ (blueprint del motor de simulación)
│   ├── integration/    — capa entre estado del usuario y motor
│   └── ui-ux/          — presentación, vistas, shell, componentes
├── governance/   — reglas, convenciones, estado actual, OQ, decisiones cerradas, doc-map
└── decisions/    — plantillas de cierre de OQ + decisiones históricas (los debates activos viven en governance/open-questions.md)
```

**Principio arquitectónico:** `data/` y `semantic/` son **fundación transversal** consumida por todos los dominios funcionales. NO son features, son SSoT. Los dominios funcionales (engine, ui-ux, integration) **dependen** de ellos.

---

## Reglas para agentes

- **Leer antes de proponer.** Si el tema tiene un `schema.md` o `status.md` en el dominio — la respuesta sale de ahí.
- **No reabrir decisiones cerradas.** Están en `governance/closed-decisions.md`. Citarlas, no debatirlas.
- **Drift detectado = RED.** Si el código contradice un doc, registrar en `governance/open-questions.md` antes de actuar.
- **Referencias de juego.** Los datos crudos del juego (abilities, wiki, mods) viven en `references/` (raíz del repo), no aquí.
- **Reglas procedurales.** Ver `CLAUDE.md` en esta carpeta.
