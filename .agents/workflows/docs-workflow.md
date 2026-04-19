---
description: Workflow Maestro de OmniFrame — Especialización y Gobernanza Documental
---

# 📚 Workflow: Sistema Documental de OmniFrame

Este documento rige el ciclo de vida, la organización y la taxonomía de la documentación del proyecto. Es el SSoT para la gestión de archivos en `docs/`, `docs-archive/` y `docs-references/`.

---

## 🏛️ Clasificación del Conocimiento (Los 3 Pilares)

Toda información debe ser depositada en el pilar correcto según su temporalidad y origen:

| Pilar | Ubicación | Función y Ciclo de Vida |
| :--- | :--- | :--- |
| **Runtime** | `docs/*` | **Estado Vivo**. Refleja la arquitectura actual. Se actualiza en paralelo al código. |
| **Archive** | `docs-archive/*` | **Contexto Histórico**. Porqués de alto impacto de piezas retiradas o refactorizadas. |
| **References** | `docs-references/*` | **Datos Externos**. Fuentes canon de Warframe. Estáticas y organizadas para consulta. |

---

## ⚖️ Leyes de Gobernanza Documental

1. **Sincronización SemVer**: La documentación en `Runtime` debe estar alineada con la matriz de versión `vX.X.X` definida en `docs/README.md`.
2. **Impact-Matrix SSoT**: Ninguna propuesta documental puede contradecir los estados y dependencias mapeados en `docs/overview/impact-matrix.md`.
3. **Anatomía de la Verdad (YAML Frontmatter)**: Todo documento debe cumplir con el estándar definido en [documentation-structure.md](file:///d:/Development/Warframe/OmniFrame/.agents/workflows/documentation-structure.md). La ausencia de metadatos o su desactualización se considera "Estado No Verificado".
4. **Relatividad de Enlaces**: Uso obligatorio de links relativos para garantizar la integridad del sistema documental en cualquier entorno.
5. **Sincronización de Fechas**: Es mandatorio actualizar `Fecha_de_actualizacion` ante cualquier cambio en el documento o en su origen de `Fidelidad_Fisica`.

---

## 🛠️ Protocolo de Gestión Documental

### 1. Actualización de Runtime
- Cuando el código cambia, el documento de dominio (`docs/domains/*`) **debe** ser actualizado.
- No se permiten documentos "huérfanos" (que no tengan un correlato físico en el código).

### 2. Migración al Archive
- La información no se borra si tiene **Impacto Contextual** (ej: "Por qué este override es así").
- Se limpia de inconsistencias técnicas antes de ser archivada para no confundir a futuros agentes.

### 3. Saneamiento de References
- El agente actúa como **Bibliotecario**: limpia enlaces rotos, crea índices y categoriza los `.wikitext` o `.lua` externos para reducir el exceso de contexto.

---

## 🚫 Restricciones Críticas
- **Prohibición de Borrado en Runtime**: No se eliminan contratos de arquitectura de `docs/` sin una auditoría de impacto previa aprobada por el usuario.
- **Diferenciación Game/Project**: Nunca mezclar lógica del motor de OmniFrame con datos del juego en el mismo documento.
