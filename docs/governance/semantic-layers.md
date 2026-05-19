---
Estado: "activo"
Rol: "Frontera obligatoria para la interpretación y transformación de datos"
Version: "v0.0.3"
Impacto_ID: "G-Semantic"
Fidelidad_Fisica: "Project/src/shared/types/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-22"
---

# Semantic Layers

OmniFrame separa el conocimiento del dato en cuatro capas conceptuales para evitar que la UI invente taxonomías o que el motor dependa de labels visuales.

## 1. Raw source semantics (Fuente Pura)
Datos tal cual vienen de la fuente externa (`@wfcd/items`, Wiki, Export).
- **Ejemplo**: `category`, `type`, `shot_type`, `description` (texto plano).
- **Regla**: Se preservan en su formato original (generalmente `snake_case`). No deben usarse directamente para lógica de negocio compleja sin pasar por la capa de Derivación.

## 2. Derived semantics (Semántica Derivada)
Inferencias deterministas realizadas por OmniFrame para cerrar gaps del source.
- **Ejemplo**: `kind` (discriminante normalizado), mapeos de compatibilidad corporativa, interpretaciones de mods donde el texto raw no basta.
- **Responsabilidad**: Cerrar gaps técnicos o lógicos que la fuente deja abiertos.

## 3. Canonical internal semantics (Canon Interno)
Contrato interno estable y tipado (`src/shared/types/`) publicado como shape para el runtime.
- **Ejemplo**: `damageTypes[]` canónicos, `AbilityGroup[]`, `FactionType`.
- **Propiedad**: Lenguaje técnico compartido entre el motor y la integración.

## 4. Presentation semantics (Presentación)
Traducción de la semántica técnica a lenguaje de interfaz.
- **Ejemplo**: Labels en `lib/i18n/`, iconografía, `subCategory` (cuando es solo visual), rows y panels.
- **Propiedad**: Un token de presentación **nunca** debe convertirse en una regla de lógica en el Engine.

---

## Tabla de lectura rápida

| Pregunta | Capa correcta |
|---|---|
| "¿Esto viene tal cual de la fuente?" | Raw source semantics |
| "¿Esto lo inferimos para unificar o completar?" | Derived semantics |
| "¿Esto ya es un contrato estable del proyecto?" | Canonical internal semantics |
| "¿Es solo la forma en que se muestra o nombra?" | Presentation semantics |

## Regla de promoción de inferencias

Una inferencia no debería vivir solo en runtime si cumple estas condiciones:
- Aparece en más de un consumer o dominio.
- Su costo de re-inferencia local es alto o repetitivo.
- Existe conocimiento suficiente para expresarla de forma determinista.

**Direccion preferida**:
`inferencia repetida en runtime -> semántica derivada explícita -> normalización en pipeline o contrato compartido`

---

## Fronteras por dominio

### Data
- Define fuentes, SSoT, roles lógicos y pipeline. No absorbe decisiones de presentación.

### Integration
- Conecta capas y fija la lectura compartida de semántica derivada. No reemplaza los schemas ni las fórmulas del engine.

### UI / Presentation
- Consume semántica ya resuelta. No debe convertirse en frontera de verdad para taxonomías o contratos.
