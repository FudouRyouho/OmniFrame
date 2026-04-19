# Engine — Arquitectura de capas (B1-B4)

> Estado: **RE-ABIERTO** — Verificado 2026-04-18
> Rol: Contrato conceptual del sistema de 3 capas
> Depende de: `../data/conditions-baseline.md`

## Modelo de 3 capas

El proyecto se estructura en tres capas de responsabilidad para evitar el acoplamiento entre la lógica de interfaz y el motor matemático:

```
  Loadout   →──[B2]──→   Resolver   →──[B3]──→   Engine
 (Estado)               (Mediador)              (Cálculo)
                            │
                          [B4]
                            ↓
                          UI / Consumer
```

### Definición de Boundaries (En Revisión)

- **B1**: Selección del jugador hacia el Resolver (Entidades, Mods, Ranks).
- **B2**: Contrato del Resolver hacia el Engine (`ResolvedLayout`).
- **B3**: Output crudo del Engine hacia el Resolver.
- **B4**: Proyección del Resolver hacia la interfaz (Stats formateados y metadata).

## Responsabilidades por Capa

### 1. Engine (Capa de Cálculo)
Cálculo puro y determinista. No conoce la interfaz ni los JSONs. Recibe datos ya resueltos y aplica las fórmulas matemáticas.

### 2. Resolver (Capa de Mediación)
Es la única capa que accede a los archivos de datos (overrides, datasets). Traduce el estado del Loadout al lenguaje del motor y viceversa.
- **Estado**: La dirección del flujo **Backward (B4)** está siendo re-discutida para asegurar una reactividad robusta sin ambigüedad.

### 3. Loadout (Capa de Estado)
Gestiona qué tiene equipado el jugador (Armas, Warframe, Mods). Es el SSoT mutable del Builder.

---

### Nota de Diseño
El objetivo de esta arquitectura es que el **Engine** sea totalmente independiente de la plataforma (React/Vite). El debate actual (2026-04-18) se centra en formalizar el contrato del **Resolver** para evitar que la interfaz asuma lógica de cálculo o resolución de datos.
