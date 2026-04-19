---
description: Workflow Maestro de OmniFrame — Arquitectura y Operación Global
---

# 🛸 Workflow: Arquitectura de OmniFrame

Este documento define la estructura física y lógica del proyecto. Es el SSoT para cualquier cambio en el código fuente.

---

## 🏛️ Definición de Arquitectura: Dominios Horizontales e Intersecciones

OmniFrame se organiza por **Propósito y Ámbito de Influencia**, no por tipo de archivo.

### 1. El Marco (Infrastructure / The Frame)

- **Componentes**: `Menu`, `Shell`, `Theme`, `DataState`.
- **Propósito**: Sostener la aplicación. No contienen lógica de negocio de dominios específicos. El Marco es global y orquestador.

### 2. Dominios Horizontales (Sections / Systems)

- **Ubicación**: `domains/`
- **Territorios**: `Arsenal`, `Equipment`, `Hub`.
- **Estatus**: Autónomos, Hermanos e Aislados.
- **Regla SSS (Single Sibling Sourcing)**: Los dominios no pueden importar código entre hermanos. La comunicación es exclusivamente vertical (hacia `shared`, `lib` o vía el Marco).

### 3. Intersecciones Emergentes (Shared)

- **Ubicación**: `shared/`.
- **Propósito**: Alojar código cuya utilidad ha sido demostrada en **2 o más dominios**.
- **Naturaleza**: El código en `shared` tiende a ser genérico y agnóstico al dominio.

### 4. El Cimiento (Lib)

- **Ubicación**: `lib/`.
- **Propósito**: Lógica pura, constantes, tipado global y normalización de datos. Agnosticismo absoluto.

---

## ⚖️ Leyes Universales de Desarrollo

1. **Ley de Localidad Estricta**: El código nace y muere dentro de su propio dominio. Solo se extrae a `shared` tras un diálogo que justifique su intersección real.
2. **Arquitectura > Código**: Si la implementación rompe el plano definido en los documentos de dominio, el código es el que está en error (**Deriva**).
3. **Flujo de Discusión en Deriva (Inmutable)**:
   - **Detección**: Identificar la discrepancia.
   - **Información**: Recabar contexto y presentar evidencia al usuario.
   - **Diálogo**: Parada crítica. No se automatizan decisiones de arquitectura.

---

## 🛠️ Protocolo Operativo del Agente

Antes de tocar código, el agente debe:

1. Consultar la **Matriz de Impacto** (`docs/overview/impact-matrix.md`).
2. Leer el documento del **Dominio Correspondiente** (`docs/domains/*`).
3. Verificar si la tarea implica crear una **Intersección** o modificar el **Marco**.
4. **Validación de Localidad**: Preguntarse "¿Este archivo pertenece realmente aquí o estoy ensuciando un dominio?".
