# Engine Design — Blueprint y contratos del motor

Documentación de diseño del motor de simulación v2. `engine/` (el dominio funcional)
**es** la implementación de lo que aquí se especifica.

## Documentos

| Archivo | Rol |
|---|---|
| [`simulation-blueprint.md`](simulation-blueprint.md) | Índice maestro del track — leer primero |
| [`vocabulary.md`](vocabulary.md) | **SSoT del vocabulario interno** — el idioma de `@core` (node / bucket / pool / flat / independiente). No es vocabulario del juego (eso es `docs/semantic/`) |
| [`simulation-architecture.md`](simulation-architecture.md) | Macro y micro arquitectura del motor |
| [`simulation-contracts.md`](simulation-contracts.md) | Contratos técnicos base |
| [`arch-decisions.md`](arch-decisions.md) | Decisiones arquitectónicas críticas (invariantes vigentes) |
| [`integration-status.md`](integration-status.md) | Estado de integración con el Arsenal |

## Estado de sincronización (saneado 2026-07-03)

Estos docs se escribieron **antes** de la implementación (abril-mayo 2026). En la campaña de
saneamiento de docs (paso previo al merge de `refactor/core-stage0-restructure` a master) se
**trajeron al presente**: los claims de estado-actual stale se corrigieron contra el código real
(post-reestructura `@core` + saneamiento A+B+C), y el **diseño no implementado** (Logic Decorators,
Casting Snapshot, Hit Location, el payload rico `ProjectionSnapshot`) quedó **marcado inline** como tal.

- **Estado vivo del motor** (qué existe hoy): [`../status.md`](../status.md).
- **Contrato de salida de métricas**: cristalizado como `CombatMetrics` (`DC-OQ-ENGINE-8`); residual editorial = rename de `ViewModelContract` display. *(La Capa E se descartó — `DC-OQ-ENGINE-10`.)*
- [`../engine-audit.md`](../engine-audit.md) es un **snapshot histórico congelado** (2026-05-18), **NO**
  la referencia de estado actual — se conserva como registro de auditoría point-in-time.

> La **revisión de arquitectura profunda** (diseño vs implementación vs futuro, evolución del proyecto)
> es un trabajo aparte, **posterior al merge a master**. Esta pasada fue saneamiento, no re-evaluación.
