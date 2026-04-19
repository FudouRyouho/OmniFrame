---
Estado: "activo"
Rol: "Documentar el estado de la carga de datos en runtime"
Version: "v0.0.2"
Impacto_ID: "I-Hydration"
Fidelidad_Fisica: "Project/src/lib/warframeData.ts"
Fecha_de_creacion: "2026-04-18"
Fecha_de_actualizacion: "2026-04-19"
---

# Runtime Hydration

OmniFrame realiza hidratacion de datos en runtime para permitir la inyeccion de overrides manuales sin necesidad de recompilar todo el dataset.

## Flujo de hidratacion

1. El `DataStateProvider` dispara la carga de los JSON base.
2. `warframeData.ts` (en `lib/`) resuelve el fetch y aplica el cache inicial.
3. Se inyectan los overrides locales de `Project/data/overrides/` (SSoT Manual).
4. El engine recibe el payload hidratado para sus operaciones.

## Direccion futura

El objetivo del proyecto es mover la mayor cantidad de hidratacion posible a **Build Time**:
- El pipeline (`generate-data`) deberia absorber los overrides estables.
- El runtime solo deberia cargar el payload ya resuelto, minimizando el calculo en el cliente.

## Relacion con semantic pipeline

La estabilidad de esta capa depende directamente de que el schema de habilidades en los overrides sea consistente con el contrato `groups[]` definido en la documentacion de datos.
