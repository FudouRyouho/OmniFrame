---
Estado: "activo"
Rol: "Especificar las fórmulas matemáticas que el motor ejecuta"
Version: "v0.0.2"
Impacto_ID: "E-Formulas"
Fidelidad_Fisica: "Project/src/core/engine/"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Engine Formula Overview

## 1. Supuesto Matemático (Estado Estático)

El motor asume un estado determinista para el cálculo de estadísticas:
- El cálculo sigue el patrón: `input -> engine -> output`.
- Se asume la suma de bonos aditivos antes de aplicar multiplicadores finales.

---

## 2. Primitivas Matemáticas

### Bonus Aditivos (Mods estándar)
Se agrupan por `upgradeType` y se suman antes de aplicar a la base.
```text
stat_final = base * (1 + suma_de_bonus / 100)
```
*Ejemplo: Serration (+165%) y Heavy Caliber (+165%) -> base * (1 + 1.65 + 1.65)*

### Críticos (Chance y Nivel)
1. **Critical Chance Decimal**: `base * (1 + sum(relative_bonus)) + sum(absolute_bonus)`
2. **Critical Tier**: `floor(total_decimal)`
3. **Multiplicador Promedio**: `1 + CritChance * (CritMultiplier - 1)`

### Multishot (Proyectiles Esperados)
1. **Projectile Count**: `base_multishot * (1 + sum(multishot_bonus))`
2. **Beam/Continuous**: El multishot actúa como un multiplicador directo del daño por tick.

---

## 3. Especificaciones por Dominio

### Mods de Arma
- **Damage Total**: `baseDamage * (1 + sum(additive_base_mods)) * (multiplicadores_finales)`
- **Status Weight**: La probabilidad de un proc depende de su peso relativo en el daño total.

### Warframes y Habilidades
- **Stats Base**: Health, Shield, Armor y Energy escalan sobre la base del warframe.
- **Habilidades**:
    - `SCALING`: `base * (1 + abilityStrength / 100)`
    - `INVERSE`: `base / (1 + abilityModifier / 100)`

---

### Notas Operativas
Estas fórmulas representan el núcleo estable del cálculo matemático. La lógica de **cuándo** se activan estas fórmulas (condiciones, triggers) es responsabilidad del **Resolver** y la configuración del contexto de entrada.
