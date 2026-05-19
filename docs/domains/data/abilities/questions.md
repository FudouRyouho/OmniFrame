---
Estado: "activo"
Rol: "Registro de decisiones de diseño para el dominio de habilidades"
Version: "v0.0.2"
Impacto_ID: "D-Abilities-Questions"
Fidelidad_Fisica: "docs/domains/data/abilities/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Habilidades: Preguntas y Resoluciones

## Decisiones Consolidadas

### ¿Cómo se manejan los Augments?
Se modelan como grupos adicionales en la propiedad `groups[]`. Si el augment es excluyente con el comportamiento base o con otros estados, se usa el flag `exclusive: true`.

### ¿Qué ocurre con los stats que no escalan?
Se marcan con `upgradeBy: "NONE"`. Esto permite que el motor los procese como valores fijos sin aplicar multiplicadores de fuerza o duración.

### ¿Dónde vive la descripción?
La descripción "viva" reside en el override. Se deben usar tags semánticos (`<DT_SLASH>`, etc.) para que la UI pueda inyectar iconos y colores dinámicamente.

### ¿Se permiten múltiples upgradeTypes por stat?
No. El contrato actual es 1 stat = 1 upgradeBy. Los efectos secundarios o múltiples se deben desglosar en entradas de stat separadas para mantener la granularidad del cálculo.

---

### Nota de Historial
Este documento sirve como bitácora de por qué el esquema de habilidades tiene su forma actual, evitando ciclos de rediseño innecesarios.
