/**
 * @domain Engine / Formulas / Status / StackDebuff
 * @SSoT references/wiki/mechanics/status-effects.md §Procs de stack (Debuff acumulable)
 *
 * LEY de Familia A (arch-decisions §14, damage-flow-model §5): "primer stack especial +
 * incremento lineal, con techo" — `f(n) = first + perAdd × max(0, n−1)`, clamp opcional.
 * Función pura número→número, agnóstica a source/target (es ley del juego, no "fórmula de
 * enemigo"): el orquestador (EntityState) lee los stacks y llama acá. Keyeada por EFECTO
 * (Infection/Disruption/Corrosion), NO por tipo de daño — un efecto puede aplicarse sin su
 * tipo de daño homónimo (Arista 1, damage-flow-model §2).
 *
 * Familia C (DoT-tick dependiente del daño del arma) NO vive acá — tiene su propio plan
 * (damage-status-model.md §Checkpoint 3). El armor-strip por tiempo de Heat (Ignite) tampoco
 * es Familia A (rampa por tiempo transcurrido, no por stacks) — se queda inline en EntityState.
 */

import type { StatusEffect } from "@shared/types";
import { deviationFor, forces, modifies, type DeviationTable, type ParamDeviation } from "../common/param-deviation";
import type { ReceiverContext } from "./effect-behavior";

/** Parámetros de la LEY de Familia A para un efecto concreto. */
export interface StackDebuffLaw {
	/** Valor en el 1er stack (n=1). */
	first: number;
	/** Incremento por stack adicional (n>1). */
	perAdditional: number;
	/**
	 * Techo opcional del valor resultante. **Es el límite del EFECTO, no el del contador** — cuántos
	 * stacks caben es otro parámetro, con otro dueño, y se aplica aguas arriba (`applyStackProc`).
	 *
	 * ⚠️ Escribir acá `f(maxStacks)` guarda el cap de stacks dos veces en dos ejes distintos, y el
	 * segundo **no tiene a quién preguntarle**: con dos emisores de caps distintos el contador es uno
	 * solo y `resolutionModifier` sólo ve el estado del receptor. Un techo que dependiera del emisor
	 * sería una pregunta sin dueño; uno físico —*no se puede sacar más armadura de la que hay*— no.
	 */
	cap?: number;
}

/**
 * LEY de Familia A: `f(n) = first + perAdd × max(0, n−1)`, clamp al `cap` opcional.
 * Definida para n≥1 (un stack existe); el orquestador guarda `n>0` antes de llamar, porque
 * el "valor neutro" difiere por efecto (×1.0 para multiplicadores, 0 para strip) y no es
 * responsabilidad de esta primitiva.
 */
export function stackDebuffValue(law: StackDebuffLaw, n: number): number {
	const raw = law.first + law.perAdditional * Math.max(0, n - 1);
	return law.cap !== undefined ? Math.min(raw, law.cap) : raw;
}

/**
 * LA APLICACIÓN de un proc sobre un contador con cap (`arch-decisions §17`, §*La aplicación de un
 * proc sobre-cap*): **suma o reemplaza; nunca se rechaza**.
 *
 *     count <  cap  →  count + amount   (SUMA — clamp al cap: `amount` es EV, no un proc suelto)
 *     count >= cap  →  count            (REEMPLAZA — refresca el stack más viejo, el count no cambia)
 *
 * Medido con dos jugadores de caps distintos aplicando Corrosive al mismo enemigo
 * (`references/ingame-tests/status-stack-caps.md`): *mantener es refrescar, subir es sumar* — el cap
 * bloquea lo segundo y nunca baja el contador. `min(cap, count + amount)` coincide con esta regla
 * mientras `count ≤ cap` y **lo colapsa hacia abajo** en cuanto lo supera, que es el estado que
 * produce un segundo emisor con cap mayor (19 por `3 × Tauforged Emerald` contra un cap 10).
 *
 * ⚠️ **El `cap` sigue llegando como constante de módulo.** De quién es ese número —del emisor, del
 * receptor que fuerza— es la cadena de cuatro eslabones de §17, que no está construida: esta función
 * es su punto de entrada, no su reemplazo. Y *"refresca el más viejo"* se observa acá como *"el count
 * no cambia"*; refrescar de verdad exige instancias con timer propio (`OQ-ENGINE-16`).
 */
export function applyStackProc(count: number, amount: number, cap: number): number {
	return count >= cap ? count : Math.min(cap, count + amount);
}

/**
 * EL DESVÍO DEL RECEPTOR SOBRE EL CAP DE STACKS — una tabla por clase de unidad, no un número.
 *
 * `arch-decisions §17` §*Un portador puede traer una tabla*: el Acolyte **no desvía un cap, overridea
 * parcialmente la tabla entera**, y `Impact` es la prueba de que un escalar no alcanza — toma tres
 * valores para el mismo parámetro (default `5`, Acolyte `3`, Lich `6`). El `'*'` es lo que el portador
 * dice de todos los que no nombra; una clave ausente sin comodín significa **que sobre ese status no
 * habla**, y entonces rige el default del concepto (o el emisor).
 *
 * Fuente, [`acolytes.wikitext:17`](../../../../../../references/wiki/mechanics/acolytes.wikitext):
 * *"Acolytes can only receive up to **4 stacks of any Status Effect** with the exception of Impact
 * which can stack up to **3** times"*. El verbo es `forces` y no `modifies`: la fuente dice *"can only
 * receive up to N"*, que es la forma que §17 correlaciona con forzar — un límite, no un valor.
 *
 * **Y el techo se ejerce contra el emisor:** cinco fragmentos esmeralda (`+10` al cap) no rinden nada
 * contra un acólito, porque el receptor **habla** sobre este parámetro y entonces el emisor no llega
 * (`resolveParam`, precedencia por dueño).
 *
 * ⚠️ **Vive acá y no con la clase**, aunque sea el Acolyte quien la declare: son los coeficientes de
 * una ley de status, y §17 los pone junto a su fórmula. Una clase que declare sobre otra ley pondrá su
 * fila **en esa otra ley** — el Acolyte también cambia la rama de `Radiation`, y esa fila no va a
 * vivir en este archivo.
 *
 * ⚠️ **Lo que la fuente declara y esta tabla no puede expresar:** el Lich trae *"a **cooldown** to how
 * quickly you can stack up Impact"*. Es una **tasa**, no un tope — ni un cap ni una tabla de caps lo
 * dicen. Sin modelar y sin portador instanciable; registrado para que no se descubra dos veces.
 */
export const RECEIVER_MAX_STACKS: Readonly<Record<string, DeviationTable<StatusEffect>>> = {
	acolyte: {
		"*": forces(4),
		// ⚠️ **La fuente dice `Impact` y el motor lo llama `stagger`** — el tipo de daño y el efecto que
		// produce no comparten nombre en este vocabulario (`shared/types/damage.ts`), y ésta es la
		// primera fila del corpus que se escribe leyendo la fuente en vez del efecto. El compilador la
		// atrapó; queda anotado porque la próxima tabla del receptor vuelve a pasar por acá.
		//
		// No tiene behavior (`EFFECT_BEHAVIORS` es parcial), así que hoy esta fila no se ejerce contra
		// ningún contador — la ejerce la suite, que es lo que impide que el comodín se lea como "el
		// Acolyte topea todo en 4" y la excepción se pierda al no tener quién la contradiga.
		stagger: forces(3),
	},
};

/**
 * Qué fuerza el receptor sobre el cap de **este** status, si es que fuerza algo.
 *
 * Es el punto donde los dos ejes se encuentran: el emisor declaró por parámetro de ley
 * (`corrosive.maxStacks`) y el receptor por status (`'*'`, `impact`), y quien traduce es el behavior,
 * que ya sabe cuál es su efecto. Un receptor con varias clases aporta la fila de cada una y
 * `applyDeviations` las compone entre sí — que para `forces` es el `min`, o sea la más restrictiva.
 */
export function receiverMaxStacks(
	receiver: ReceiverContext | undefined,
	effect: StatusEffect,
): readonly ParamDeviation[] {
	const out: ParamDeviation[] = [];
	for (const cls of receiver?.unit_class ?? []) {
		const d = deviationFor(RECEIVER_MAX_STACKS[cls], effect);
		if (d) out.push(d);
	}
	return out;
}

/** La marca que Hydroid deja en todo enemigo que haya dañado (`warframes/hydroid/passive.md`). */
export const HYDROID_MARK = "hydroid";

/**
 * Lo que una **marca** del receptor desvía sobre el strip inicial de Corrosive.
 *
 * Hermana de `RECEIVER_MAX_STACKS` y por el mismo criterio de ubicación: son coeficientes de una ley
 * de status, y §17 los pone junto a su fórmula. Lo que cambia es **por dónde entra la llave** — aquélla
 * se indexa por lo que el receptor **es** (`unit_class`, del molde), ésta por lo que le **pasó**
 * (`marks`, adquirida). Mismo canal `receiver` de `resolveParam`, dos pobladores.
 *
 * `replace` y no `add`: la fuente dice *"50% **rather than** 26%"*, que es el discriminador textual
 * que §17 usa para separar reemplazo de composición. La cuenta cierra contra la ley ya construida —
 * a 10 stacks, `50 + 6×9 = 104%` topa en el techo físico de `1.0`, contra `26 + 6×9 = 80%` por
 * defecto; la fuente declara ese 100% y por eso el techo es físico y no `f(maxStacks)`.
 */
export const RECEIVER_INITIAL_STRIP: Readonly<Record<string, ParamDeviation>> = {
	[HYDROID_MARK]: modifies.replace(50),
};

/**
 * Qué desvía el receptor sobre el strip inicial de Corrosive, por las marcas que porta.
 *
 * Devuelve lista por la misma razón que `receiverMaxStacks`: un receptor puede portar varias marcas y
 * `applyDeviations` las compone entre sí — que para dos `replace` del mismo dueño **tira**, en vez de
 * elegir en silencio. Hoy hay una sola marca conocida, así que ese camino no se ejerce todavía.
 */
export function receiverInitialStrip(
	receiver: ReceiverContext | undefined,
): readonly ParamDeviation[] {
	const out: ParamDeviation[] = [];
	for (const mark of receiver?.marks ?? []) {
		const d = RECEIVER_INITIAL_STRIP[mark];
		if (d) out.push(d);
	}
	return out;
}

/**
 * LEYES de crit-buff-por-stack (`DC-OQ-ENGINE-12`, status-effects.md §Weakened/§Cold). El target
 * debilitado sube el crit del ATACANTE — misma forma Familia A, aplicada al crit en vez del daño.
 * Constantes de ley fija: el default vive acá, con su fórmula. Si algún día algo las desvía, el desvío
 * entra por su procedencia (emisor/receptor, `CV-3`) — no por una tabla de config paralela.
 *
 * ⚠️ **Sus caps son `f(maxStacks)`, la misma forma que `corrosionLaw` corrige** (`25 = f(5)`,
 * `0.5 = f(9)`), y quedan como están porque **ninguna fuente conocida sube su cap de stacks**: el
 * único desvío declarado va hacia abajo (Freeze cap 4 en bosses/Overguard → `f(4) = 0.25`, por debajo
 * del techo, que no interviene). Un clamp sólo trunca hacia arriba. Cuál es su techo real no se sabe y
 * no se inventa — se mide cuando aparezca la fuente que lo mueva.
 */
/** Weakened (Puncture): +5% crit chance/stack, cap +25% a 5 stacks. */
export const WEAKENED_CRIT_LAW: StackDebuffLaw = { first: 5, perAdditional: 5, cap: 25 };
/** Freeze (Cold): +0.1× crit damage (1er) luego +0.05×/stack, cap +0.5× (≈9 stacks). */
export const COLD_CRIT_LAW: StackDebuffLaw = { first: 0.1, perAdditional: 0.05, cap: 0.5 };

/**
 * **Los parámetros de las leyes de status viven acá, con su fórmula** (`arch-decisions §17`: el default
 * es del concepto, junto a su fórmula; sólo el *desvío* es del portador). Antes viajaban en `GameLaws`,
 * una tabla plana que el estado transportaba hasta cada behavior — y §17 la desarma por estructural: un
 * valor plano **no tiene dónde poner su procedencia**, así que no puede expresar *"0.26 por defecto ·
 * 0.50 si el receptor lleva la marca de Hydroid · +2 al cap si el emisor tiene esmeralda"*.
 *
 * Estos seis quedan como las constantes que siempre fueron: son los **defaults**, y un default no deja
 * de serlo porque alguien pueda desviarlo.
 *
 * `CORROSIVE_MAX_STACKS` **ya es el argumento `default` de `resolveParam`** por los dos lados: el canal
 * del emisor (shard → nodo del arma → instancia) y el del receptor (`RECEIVER_MAX_STACKS`, abajo). La
 * primitiva vive en `formulas/common/param-deviation.ts` con los 10 casos del corpus en su suite. Los
 * otros cinco siguen siendo constantes sin desvío conocido, y eso es una respuesta, no un hueco.
 */
export const CORROSIVE_MAX_STACKS = 10;
export const CORROSIVE_INITIAL_STRIP_PCT = 26;
export const CORROSIVE_STACK_STRIP_PCT = 6;
export const STATUS_MAX_STACKS = 10;
export const STATUS_INITIAL_BONUS_PCT = 100;  // +100% Viral/Magnetic al 1er stack (×2.0)
export const STATUS_STACK_BONUS_PCT = 25;     // +25% por stack extra

/**
 * Infection (Viral) — multiplicador al daño recibido en la capa de salud.
 * `2 + 0.25 × (n−1)`, cap ×4.25 a 10 stacks (status-effects.md §Infection, verificado in-game).
 *
 * ⚠️ Mismo caso que las leyes de crit: `4.25 = f(10)` es el valor en el cap de stacks, no un techo
 * declarado, y **no hay fuente que suba el cap de Viral** — a diferencia de Corrosive, que tiene el
 * Emerald Archon Shard. Se marca la forma; el número no se toca sin fuente.
 */
export function infectionLaw(
	initialBonusPct: number = STATUS_INITIAL_BONUS_PCT,
	stackBonusPct: number = STATUS_STACK_BONUS_PCT,
): StackDebuffLaw {
	return { first: 1 + initialBonusPct / 100, perAdditional: stackBonusPct / 100, cap: 4.25 };
}

/**
 * Disruption (Magnetic) — multiplicador al daño recibido en la capa de shields/Overguard.
 * PROVISIONAL = misma LEY que Infection (preserva el comportamiento actual: ×4.25 a 10). La wiki
 * dice ×3.25 a 10 (status-effects.md §Disruption), pero el dato está sin verificar — OQ-ENGINE
 * O4 (damage-flow-model §8): "verificar contra /w/Magnetic_Damage ANTES de instanciar 3.25;
 * hipótesis: 100% a Overguard cruza el dato". Hasta cerrarlo, Disruption hereda Infection.
 */
export function disruptionLaw(
	initialBonusPct: number = STATUS_INITIAL_BONUS_PCT,
	stackBonusPct: number = STATUS_STACK_BONUS_PCT,
): StackDebuffLaw {
	return infectionLaw(initialBonusPct, stackBonusPct);
}

/**
 * Corrosion (Corrosive) — fracción de armor stripeada, temporal por stack.
 * `min(0.26 + 0.06 × (n−1), 1.00)` — `initialStripPct=26` → first=0.26, `stackStripPct=6` → perAdd=0.06.
 *
 * **El 80 % no es el techo de la ley: es lo que la ley da en 10 stacks**, que es el cap de stacks por
 * defecto. `damage-corrosive-damage.wikitext` los separa en la misma página — *"culminating in a total
 * armor reduction of 80% **at 10 stacks**"*, y dos líneas después *"Emerald Archon Shard can increase the
 * maximum Corrosive status procs by +2 (+3 Tauforged). Applying **14** stacks can **fully remove all
 * armor**"*. `f(14) = 1.04` y `f(13) = 0.98`: los 14 salen de la fórmula, no de una regla aparte.
 *
 * El techo `1.0` es físico —no se saca más armadura de la que hay— y lo confirma un segundo caso por
 * otro camino: la pasiva de Hydroid desvía `first` a 50 % y la fuente declara *"100% armor reduction at
 * 10 stacks"*, que es `f(10) = 1.04` con ese desvío. Con un techo de 0.80 los dos casos dan 80 % y
 * contradicen a la fuente **en silencio**: el número sigue siendo creíble.
 */
export function corrosionLaw(
	initialStripPct: number = CORROSIVE_INITIAL_STRIP_PCT,
	stackStripPct: number = CORROSIVE_STACK_STRIP_PCT,
): StackDebuffLaw {
	return { first: initialStripPct / 100, perAdditional: stackStripPct / 100, cap: 1.0 };
}
