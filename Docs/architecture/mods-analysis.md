# Análisis de Implementación de Mods

> Estado: activo
> Última actualización: 2026-03-19

Este documento detalla la investigación sobre cómo integrar el sistema de Mods en OmniFrame, tomando como referencia el sistema de Overframe y la base de datos de `warframe-items`.

## 1. Evaluación de `warframe-items` (Mods.json)

La estructura actual en `warframe-items/data/json/Mods.json` es **muy completa** para propósitos visuales, pero requiere procesamiento para cálculos:

*   **Puntos Positivos:**
    *   Contiene `levelStats`: Un array de strings por cada rango del mod.
    *   Contiene `compatName`: Indica para qué arma o Warframe es específico (ej: "Hek", "Trinity").
    *   Contiene `isAugment`: Booleano para identificar mods de aumento.
    *   Contiene `baseDrain` y `fusionLimit`: Vital para calcular el coste de capacidad.

*   **Puntos Negativos:**
    *   Los stats están en **texto plano** (ej: `"+90% Damage"`). Para el builder, necesitamos extraer `{ "stat": "damage", "value": 0.9 }`.
    *   Usa placeholders de la wiki (ej: `<DT_PUNCTURE_COLOR>`).

### Información adicional de la Wiki (Module:Mods/data)

A diferencia de la API oficial de DE, el módulo Lua de la wiki contiene un campo técnico muy valioso: **`UpgradeTypes`**.

*   **Ejemplo:** `UpgradeTypes = { "WEAPON_DAMAGE_AMOUNT" }` para Serration.
*   **Utilidad:** Esto nos permite mapear strings como "+165% Damage" a variables internas exactas sin ambigüedades. Es la "llave" para conectar el parser de texto con el motor de cálculo de OmniFrame.

#### Estructura interna completa de un Upgrade (Public Export / Overframe)

La fuente canónica real (accesible via Overframe `__NEXT_DATA__` y documentada en `Module:Mods/data`)
expone la estructura completa de cada efecto de un mod:

```json
{
  "UpgradeType": "WEAPON_DAMAGE_AMOUNT",
  "OperationType": "STACKING_MULTIPLY",
  "Value": 0.15,
  "DamageType": "DT_ANY",
  "ValidPostures": [],
  "ValidProcTypes": [],
  "ValidModifiers": [],
  "ValidType": ""
}
```

Campos relevantes para el builder:
- `UpgradeType` — qué stat modifica (canónico, sin ambigüedad)
- `OperationType` — cómo se aplica (`STACKING_MULTIPLY`, `STACKING_LINEAR`, etc.)
- `Value` — valor base (rango 0); los rangos superiores se calculan linealmente desde aquí
- `ValidPostures` — condiciones de estado del avatar (`AIMING`, `AIRBORNE`, `CROUCHING`, `WALLATTACH`...)
- `ValidProcTypes` — status effects requeridos en el enemigo para activar el efecto
- `DamageType` — tipo de daño si aplica (`DT_ANY`, `DT_FIRE`, `DT_FREEZE`...)

**Implicación clave**: el juego modela cada efecto como un objeto separado. Un mod con dos efectos
tiene dos `Upgrade` distintos — no un solo objeto con dos valores. Esto sugiere que nuestro
override debería seguir el mismo modelo: **un rawStat por `UpgradeType`**, no por línea de descripción.

**Implicación para condiciones**: `ValidPostures` y `ValidProcTypes` ya son la respuesta canónica
a D1 (condiciones de activación). No hay que inventar un campo `condition: string` — la fuente
ya tiene el modelo correcto. La pregunta es si adoptamos esa semántica directamente o la abstraemos.

## 2. Benchmark Técnico: Overframe.gg

Tras una inspección profunda del estado interno de Overframe (`__NEXT_DATA__`), hemos confirmado su motor de datos:

*   **Identificadores Técnicos:** Coinciden al 100% con la Wiki. Usan `UpgradeType` (ej: `WEAPON_DAMAGE_AMOUNT`, `WEAPON_FIRE_ITERATIONS`) para mapear efectos a las piezas del arsenal.
*   **Almacenamiento:** No guardan cada rango. Guardan un `Value` base (Rango 0) y un `OperationType` (ej: `STACKING_MULTIPLY`).
    *   *Serration Rango 0:* `Value: 0.15`.
*   **Fórmula de Cálculo:** Usan una base (Generalmente Rango 0) y escalan linealmente, pero con excepciones para rarezas específicas (Primed, Galvanized, Archon).
*   **Compatibilidad:** Utilizan `ItemCompatibility` que apunta al `uniqueName` del arma.

---

## 3. Estado actual — upgradeTypes como fuente canónica

> Actualizado: 2026-03-19. Ver análisis completo en `decisions/mods-builder-analysis.md`.

El fork de `warframe-items` incluye `upgradeTypes[]` en cada mod. Este campo identifica
sin ambigüedad qué stat modifica cada mod para el ~85% de los mods de armas.

El override (`mod-stats.json`) es un complemento quirúrgico — no la fuente de verdad.
Ver `architecture/mod-stats-gap.md` para los gaps que cubre y el schema reducido.

### Decisiones tomadas

- D1: override reducido al mínimo. `modifier` inventados obsoletos. `misc: []` como
  placeholder para augmentos UNIQUE, sin poblar hasta que el builder lo necesite.
- D2: ampliar el fork con `Value`, `DamageType`, `ValidPostures`, `ValidProcTypes`,
  `OperationType` del Public Export. Próximo paso inmediato.
- D3: el builder nace como lógica pura sin UI.

Ver `decisions/open-questions.md` para el detalle completo y el orden de trabajo.
