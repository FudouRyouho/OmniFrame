---
Estado: "activo"
Rol: "Identidad y estado del dominio Oracle (CLI / D2)"
Impacto_ID: "O-Status"
Fidelidad_Fisica: "Project/scripts/oracle/"
Fecha_de_creacion: "2026-07-24"
Fecha_de_actualizacion: "2026-07-24"
---

# Oracle — Estado del dominio

## Qué es el Oracle

El Oracle es el **adaptador no-reactivo del motor**: el cliente que consume la salida del engine por
terminal, hermano del adaptador reactivo (la UI). Es **D2** — no "Capa D", sino un consumidor sobre el
corte C→D, par de D1 (UI). Ver [`domains/engine/design/arch-decisions.md`](../engine/design/arch-decisions.md) §5-7.

Su identidad no se agota en "ver lo que el engine ya hace". El Oracle cumple **tres roles**, y la
reorganización de diseño existe para servir a los tres:

1. **Consumidor** — ejerce el motor (`consume()`, `computeCombatMetrics`, trace) y serializa el
   resultado a stdout, para humano (`text`) y para máquina/IA (`json`).
2. **Partera de contratos** — como primer consumidor real de un borde de salida todavía sin forma, el
   Oracle **materializa** contratos que después consume un consumidor de producción. Precedente: de su
   modo `view` se derivó `ViewModelContract v0`; de su modo `metrics`, `CombatMetrics`
   ([`DC-OQ-ENGINE-8`](../../governance/closed-decisions.md)). El próximo es **A2** (la consulta de C2).
3. **Banco de trabajo del engine** — el instrumento con el que se construye el motor *desde adentro*:
   ejerce cada seam del pipeline (A→B→C1→C2) y absorbe su trazabilidad, para verificar un mecanismo
   nuevo antes de que tenga consumidor de producción.

## Estado

La identidad (los tres roles) es estable. La **organización** que la sirve —eje de lentes, tres capas
internas (dispatch/adquisición/presentación en [`scripts/oracle/internal/`](../../../../Project/scripts/oracle/internal/)),
el seam adquisición↔presentación como órgano de crecimiento— **ya aterrizó en código**, espejando
[`design/architecture.md`](design/architecture.md). Diferido con hogar (no incompletitud, decisión
explícita): la lente `intention` (requiere exponer la salida de B desde `@core`), flags componibles,
validación robusta del JSON externo, saneamiento de `EnsembleIntention` (RED, toca contrato core) — ver
`design/architecture.md §4`.

## Punteros

- Diseño de la organización actual: [`design/architecture.md`](design/architecture.md)
- Contrato de intención que consume (A1): [`@shared/types/ensemble.ts`](../../../../Project/src/shared/types/ensemble.ts), ejercido vía [`consume()`](../../../../Project/src/core/engine/output/consume.ts)
- Estado del motor que el Oracle consume: [`domains/engine/status.md`](../engine/status.md)
