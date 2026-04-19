---
Estado: "activo"
Rol: "Punto de entrada y resumen global del SSoT de OmniFrame"
Version: "v0.0.2"
Impacto_ID: "N/A"
Fidelidad_Fisica: "docs/"
Fecha_de_creacion: "2026-04-15"
Fecha_de_actualizacion: "2026-04-19"
---

# OmniFrame Documentation Suite


Bienvenido al SSoT (Source of Truth) de OmniFrame. Esta documentación se rige por el concepto de **Runtime**: refleja la realidad física y operativa del proyecto.

---

## 🚀 Navegación Rápida

1. **¿Qué estamos haciendo hoy?** → [Matriz de Impacto y Dependencias](overview/impact-matrix.md)
2. **¿Cuál es el estado real del código?** → [Estado Actual (Current State)](governance/current-state.md)
3. **¿Cuáles son las reglas de datos?** → [Capas Semánticas (Semantic Layers)](governance/semantic-layers.md)
4. **¿Cómo se gobierna el proyecto?** → [Gobernanza de Documentación](governance/documentation-governance.md)

---

## 📚 Estructura de Trabajo

### 1. [Governance](governance/) - El "Cerebro"
Contiene las reglas, políticas y la auditoría de estado. Aquí es donde se definen los contratos y se verifica la verdad del repositorio.

### 2. [Overview](overview/) - El "Mapa"
Contiene la visión global, el backlog real basado en dependencias físicas y los roadmaps de versiones.

### 3. [Domains](domains/) - El "Cuerpo"
Contiene el conocimiento técnico profundo segmentado por responsabilidad:
- **[Engine](domains/engine/)**: Motor matemático y fórmulas.
- **[Integration](domains/integration/)**: Cómo se conectan las piezas.
- **[Data](domains/data/)**: Ciclo de vida de la información y pipelines.
- **[Semantic](domains/semantic/)**: Capas de significado y taxonomías.
- **[UI-UX](domains/ui-ux/)**: Interfaz, arquitectura de vistas y HUD.

---

## 🚫 Reglas para Agentes

- **No crear carpetas raíz**: Solo se permiten `governance`, `overview` y `domains`.
- **Anclaje de Dependencias**: Antes de proponer un cambio en un dominio, verifica su estado en la `impact-matrix.md`.
- **Game vs Project**: La documentación del juego (Warframe) vive en `docs-references/`, NO aquí.

---
