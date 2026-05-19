# OmniFrame

**Advanced Warframe Builder & Combat Simulator.**

---

### v0.0.3 — Reorganización Estructural

> Nota: esta versión está en desarrollo.

- **Engine**: Eliminado `sim-v2/` como directorio. El motor ahora vive en capas explícitas: `hydration/`, `resolution/`, `combat/`, `enemies/`, `bridge/`, `audit/`, `hooks/`.
- **Docs**: Renombrado `Docs/` → `docs/`. Limpieza de arquitectura y contratos.
- **Git**: `.gitignore` reescrito. Eliminadas herramientas de Copilot, ignorados artefactos generados.

---

### v0.0.2 — Estandarización y Refactor de Filtros

- **Estructura Documental**: Transición a dominios horizontales para soportar la lógica de simulación.
- **OmniToolbar**: Refactorización de toolbars y filtros genéricos en `shared/`.
- **Gobernanza**: Implementación de workflows SemVer y estandarización de contratos.
- **Engine Core**: Re-apertura de los temas B1-B4 (Engine, Loadout y Resolver) para el cálculo de stats.

---

_OmniFrame busca la máxima precisión técnica, moviéndose del simple "building" hacia la simulación profunda._
