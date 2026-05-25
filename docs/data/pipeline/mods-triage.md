---
Estado: "referencia"
Rol: "Memoria técnica de errores del parser de mods — taxonomía de fallos y casos críticos"
Version: "v0.1.0"
Impacto_ID: "D-Pipeline-Mods-Triage"
Fidelidad_Fisica: "Project/scripts/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-05-25"
---

# Mods Rejection Triage

## Objetivo

Convertir la cola de rechazos del parser en reglas verificables. Cada ajuste de lógica en el extractor debe salir de casos reales clasificados aquí y quedar cubierto por tests de regresión para evitar el "drift" semántico.

## Snapshot de Reporte (Histórico)

- **Candidatos**: 739 | **Aceptados**: 639 | **Rechazados**: 100
- **Principales fallos**: `stat-count-mismatch` (81), `multiple-numbers-in-stat` (19).

> **Nota de Ubicación**: El reporte base (`mod-stats.report.json`) reside en `docs-archive/data-overrides/overrides/mods/`. La tarea mayor pendiente es su restauración en la carpeta de overrides del proyecto.

## Familias de Fallos Semánticos

1. **T1 (Narrativa)**: Stat numérico mezclado con líneas de texto puro sin valor de cálculo.
2. **T2 (Multi-valor)**: Varios efectos numéricos en una sola línea (ej: `Shield Recharge` + `Delay`).
3. **T3 (Auxiliares)**: Duraciones (`S`) o radios mezclados con la magnitud principal (`N/P`).
4. **T4 (PvP/Movilidad)**: Atributos compactados específicos de modos competitivos.
5. **T5 (Unique/Augment)**: Efectos fuera del contrato base que requieren tratamiento manual.

## Casos Críticos Identificados

- **Proton Snap**: El parser extrae el valor correcto pero el placeholder de reemplazo cae sobre un valor auxiliar.
- **Hidden Scaling (Argon Scope, etc.)**: La duración de un buff escala por rango, pero el parser la congela en el label, invalidando la fidelidad editorial.

## Criterio de Mejora

Una regla solo debe promoverse del triaje al código del parser si:
- Cumple con los fixtures reales registrados (`MTR-*`).
- Pasa el test de clasificación de tokens (`N`, `S`, `P`, `X`).
- No reduce la fidelidad de los mods ya aceptados.

---

### Notas de Auditoría
Este documento es la **Memoria Técnica de Errores**. Cualquier refactorización del sistema de extracción de stats de mods debe consultar estos casos de borde para no introducir regresiones.
