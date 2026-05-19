---
Estado: "referencia"
Rol: "Tabla de slots por tipo de entidad para el diseño del Builder"
Version: "v0.0.2"
Impacto_ID: "UI-UX-Slots"
Fidelidad_Fisica: "Project/src/domains/arsenal/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Slots por entidad — Referencia empírica

## Tabla de Capacidades

| Entidad | Slots normales | Slot especial | Exilus | Arcanos |
| :--- | :--- | :--- | :--- | :--- |
| **Warframe** | 8 | 1 Aura | 1 | 2 |
| **Primaria** | 8 | - | 1 | 1 |
| **Secundaria** | 8 | - | 1 | 1 |
| **Melee** | 8 | 1 Stance | 1 | 1 |

## Casos Especiales y Notas

- **Jade**: Posee 2 slots de Aura (excepción única en el dataset).
- **Extensibilidad**: El sistema debe prever slots para Sevagoth Shadow, armas exaltadas y la evolución del sistema de Compañeros.
- **Validación**: Esta tabla es una guía de diseño. La implementación final debe validar el conteo contra los campos de categoría del dataset real.

---

### Notas Operativas
Este documento actúa como SSoT para la maquetación de la UI del Builder y los límites de validación de los canales del Loadout.
