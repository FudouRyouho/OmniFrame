# Architecture Alert: B1-B4 Broken State

> Estado: **RE-ABIERTO / ROTO**
> Rol: Documentar el fallo de la arquitectura actual del Builder y la necesidad de re-construcción.
> Fidelidad_Fisica: "Project/src/providers/Loadout/loadout-context.tsx"

## 🚨 Diagnóstico de Crisis (2026-04-20)

La supuesta "Entrega v1" del motor y su integración se declara **fallida**. Todo el flujo B1-B4 (Loadout -> Resolver -> Engine -> UI) está conceptualmente roto por las siguientes razones:

### 1. El LoadoutProvider como "Contexto Referencial"
- **Problema**: El `LoadoutProvider` no actúa como una SSoT reactiva pura. Se comporta como un contenedor de funciones que se llaman directamente, lo que acopla la UI a la lógica de ejecución.
- **Consecuencia**: El desacoplamiento deseado es inexistente. La UI "sabe" demasiado sobre cómo se resuelven los datos.

### 2. Fallo de la Capa del Resolver
- **Problema**: El Resolver no cumple su contrato de mediación. La implementación actual es "horrible" y no garantiza la integridad de los datos antes de llegar al Engine.
- **Estado**: Todo el código de integración actual (excepto las fórmulas matemáticas puras del Engine) está marcado para **Deprecación**.

### 3. El Engine en Aislamiento
- **Estado**: Las fórmulas de cálculo (`src/core/engine/formulas`) son la única pieza rescatable. Sin embargo, al estar conectadas a un Resolver roto, su output en el Arsenal es inválido.

---

## ⛔ Gaps Críticos de Integridad

- **C20 (Falso Optimismo)**: El `CalculationContext` es ignorado porque la capa de UI actual no tiene una forma limpia de inyectar estado en el motor.
- **Damage SSoT**: Inexistente. El motor suma multiplicadores sin entender la naturaleza del daño.
- **Reactividad B4**: Rota. No hay un flujo unidireccional confiable hacia la UI.

## 🏹 Próximo Paso Obligatorio

**No se debe construir lógica de dominio sobre el hardware actual.** La prioridad absoluta es el **Desacoplamiento Total** y la definición de una capa de **Observer** que reemplace al Contexto Referencial.
