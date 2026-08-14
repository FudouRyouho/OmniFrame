/**
 * @domain Engine / Formulas / Status / ProcPopulation
 * @SSoT docs/domains/engine/design/damage-status-model.md §Población/RNG — modelo resuelto
 *
 * Eje Población del frame de C2: `esperado = forzado × chance × peso` (ya lineal — el `forzado`
 * es el multiplicador de daño-por-tick que vive en `dot-tick.ts`, esto cubre `chance × peso`).
 * Generador de eventos ESPERADOS, agnóstico a DoT vs stack-debuff (arch-decisions §14): la tabla
 * tipo→proc no distingue familia, el output es una lista `(tipo, timestamp)` — el consumidor
 * (`dot-population.ts` hoy; stack-debuff cuando su brecha se resuelva) decide qué hacer con ella.
 *
 * Colapsa los "2 niveles" del modelo (por-pellet + por-hit-a-SC>100%) en UNA sola llamada: se usa
 * `statusChance` CRUDO, sin cap a 100% ni split en slots discretos. Por identidad de Wald,
 * `E[N]=chance` sin importar la distribución exacta de slots — el generador discreto exacto
 * (`OQ-ENGINE-19`) es irrelevante acá, no bloquea.
 */

import type { DamageType } from "@shared/types";
import { procWeightByType } from "./proc-selection";

/** Un proc ESPERADO (no un draw sampleado): tipo, cuándo, y su peso esperado. */
export interface ProcEvent {
	type: DamageType;
	/** Momento del pellet/hit que lo origina — SIN delay al primer tick (eso es DoT-side). */
	timestamp: number;
	/** `E[count]` de este tipo en este evento = `statusChance × procWeight`. Ya compute-once. */
	expected: number;
}

/**
 * Un pellet/hit → los eventos esperados por tipo de daño presente en `damageBreakdown`.
 * `statusChance` es la fracción cruda del arma (p.ej. 2.34 para 234%) — sin dividir por pellet
 * (post-27.2 el dato base de multishot ya viene ajustado, `damage-status-model.md §Población/RNG`).
 */
export function expectedProcEvents(
	damageBreakdown: Partial<Record<DamageType, number>>,
	statusChance: number,
	timestamp: number,
): ProcEvent[] {
	const weights = procWeightByType(damageBreakdown);
	const events: ProcEvent[] = [];
	for (const [type, weight] of Object.entries(weights) as Array<[DamageType, number | undefined]>) {
		if (!weight) continue;
		const expected = statusChance * weight;
		// **Ausencia ≠ 0** — la misma ley que gatea `flight != null` en projectile speed y que
		// `vocabulary.md §6` fija para los parámetros (*callar ≠ declarar un valor neutro*), acá del
		// lado del estado. Sin esto el filtro era sólo por peso, así que un emisor con `statusChance:
		// 0` emitía un evento por cada tipo presente **con esperanza cero**, y `applyProc` los aplicaba:
		// el receptor terminaba con `{ignite:{pool:0,…}, corrosion:{count:0}}` sin que ningún número se
		// moviera. Latente en la aritmética y **falso en la lectura** — `activeBehaviors()` los itera en
		// cada `advance` y `effectStates.has(...)` contestaba que sí a un efecto que nunca ocurrió.
		//
		// Se gatea acá y **no** en `applyProc` a propósito: la pregunta *"¿hubo proc?"* es del poblador,
		// que es quien conoce la chance; `applyProc` aplica lo que le den —incluidos los `expected`
		// fraccionales que este mismo modelo EV produce— y no tiene con qué distinguir un 0 legítimo.
		if (expected === 0) continue;
		events.push({ type, timestamp, expected });
	}
	return events;
}
