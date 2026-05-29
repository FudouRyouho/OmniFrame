# OmniFrame

**Advanced Warframe Builder & Combat Simulator.**

---

### v0.0.4 — Engine Core + Data Pipeline *(en desarrollo)*

- **Engine**: Motor de simulación funcional en capas (hidratación, resolución, combate). `ModRepository` e `IncarnonRepository` operativos con perks Incarnon Genesis.
- **Data**: Pipeline de overrides completo — armas, arcanes, mods exilus, incarnon, archon shards.
- **Semantic**: Vocabulario canónico de conditions (~104 tokens, 4 capas L1–L4) y upgrade tokens (taxonomía D-6).
- **Tests**: Gold standard contra valores reales del juego — 33 tests passing (Aklex Prime, Cedo Prime).

**Meta de cierre:** Cedo Prime con mods galvanizados (stacks máximos) + un arma Incarnon simple — ambos verificados contra valores reales del juego.

---

### v0.0.3 — Reorganización Estructural

- **Engine**: Capas explícitas: `hydration/`, `resolution/`, `combat/`, `enemies/`, `bridge/`.
- **Docs**: Renombrado `Docs/` → `docs/`. Arquitectura de gobernanza, contratos y sistema de decisiones.
- **Git**: `.gitignore` reescrito. Eliminadas herramientas de Copilot, ignorados artefactos generados.

---

### v0.0.2 — Estandarización y Refactor de Filtros

- **Estructura Documental**: Transición a dominios horizontales para soportar la lógica de simulación.
- **OmniToolbar**: Refactorización de toolbars y filtros genéricos en `shared/`.
- **Gobernanza**: Implementación de workflows SemVer y estandarización de contratos.
- **Engine Core**: Re-apertura de los temas B1-B4 (Engine, Loadout y Resolver) para el cálculo de stats.

---

_OmniFrame busca la máxima precisión técnica, moviéndose del simple "building" hacia la simulación profunda._
