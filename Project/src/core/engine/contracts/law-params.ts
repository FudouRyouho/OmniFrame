/**
 * @domain Engine / Contracts — los parámetros de ley que un portador puede desviar
 * @SSoT docs/domains/engine/design/vocabulary.md
 *
 * **Qué es este módulo y qué NO es.** Es el índice de *qué tokens declaran una desviación de
 * parámetro* — nada más. El **default** de cada parámetro sigue viviendo con su fórmula
 * (`formulas/status/stack-debuff.ts`, `formulas/defense/shield-gate.ts`), y cómo se resuelve una
 * desviación es la primitiva (`formulas/common/param-deviation.ts`). Acá no hay valores: si aparece
 * un número en este archivo, algo se colapsó de vuelta a la tabla plana que `arch-decisions §17`
 * desarmó.
 *
 * **Por qué hace falta un índice.** La hidratación tiene que saber **antes de resolver** que un
 * modifier apunta a un parámetro de ley y no a un atributo, porque un parámetro **no tiene nodo
 * sembrado**: nace sólo cuando alguien lo declara (`vocabulary.md §6`, regla dura sobre callar ≠
 * declarar un valor neutro). Sembrarlo en toda arma haría que cada arma declare *"desvío 0"*, que es
 * una afirmación distinta de *"no hablo"*.
 */

import type { ParamDeviation } from "../formulas/common/param-deviation";

/**
 * El parámetro que un token desvía, en notación `<ley>.<parámetro>`.
 *
 * Es el nombre **del parámetro**, no del token: dos fuentes distintas pueden desviar el mismo, y es
 * ahí donde se encuentran. Crece de a un miembro por parámetro con desviación conocida — no por
 * anticipación.
 */
export type LawParam = "corrosive.maxStacks";

/**
 * Token → parámetro que desvía. **Un token de esta tabla materializa nodo en su destino**; los que no
 * están acá y no tienen nodo se quedan en *acuñado sin nodo* y el tripwire los reporta, que es el
 * comportamiento que hay que preservar (`upgrade-tokens.md` §Acuñado sin nodo).
 *
 * El verbo de la desviación **no está acá**: sale de la operación del token (`FLAT` → `add`), y el
 * dueño lo decide de dónde se lee el nodo — no el token (`vocabulary.md §6`, regla dura 2: el Emerald
 * y la Decaying Dragon Key se equipan las dos en el jugador y desvían lados opuestos).
 */
export const LAW_PARAM_TOKENS: Readonly<Record<string, LawParam>> = {
  GAMEPLAY_FLAT_CORROSIVE_MAX_STACKS: "corrosive.maxStacks",
};

/** ¿Este token declara una desviación de parámetro en vez de un atributo? */
export function lawParamOf(token: string): LawParam | undefined {
  return LAW_PARAM_TOKENS[token];
}

/**
 * ⚠️ **DÓNDE NACE EL NODO — deuda declarada, con condición de disparo.**
 *
 * El nodo se siembra en la entidad que el ruteo eligió, y para la familia `GAMEPLAY_` eso es **el
 * arma** (`FAMILY_ROUTE`). Alcanza mientras el arma sea el único emisor de instancias, y **la fuente
 * no dice eso**: el Emerald sube *"the maximum Corrosive status procs"* sin acotar, así que una
 * habilidad que aplique Corrosive debería ver el mismo cap.
 *
 * El sesgo **es preexistente y del ruteo**, no de este índice: `roar.wikitext` declara *"bonus damage
 * to all weapons and abilities"* y el motor aterriza Roar sólo en las armas.
 *
 * 🔴 **La condición de disparo se cumplió: ya hay un segundo emisor.** `__tests__/ability-instance.ts`
 * declara instancias que no salen de un arma, y la suite mide que el desvío rinde igual venga de donde
 * venga (19 con los tres Tauforged, 10 sin ellos, 4 contra un acólito). Lo que el banco **no** puede
 * hacer es sacarlo del grafo: una habilidad no tiene nodo `GAMEPLAY_*`, así que ahí el desvío se
 * **declara**. La decisión pendiente es la que estaba escrita — duplicar el nodo en cada destino ⊥
 * dejarlo donde nace y que cada instancia lo lea subiendo por el árbol de propiedad
 * (`arch-decisions §18`) — y ya no es hipotética. Anclada en `__tests__/ability-emission.test.ts`.
 */

/**
 * Las desviaciones que una instancia trae **del emisor**, por parámetro.
 *
 * Es lo que `arch-decisions §17` pedía y la instancia no llevaba: su *output* (`moddedBase`,
 * `statusDamageBonusPct`, `elementBonusPct`) ya viajaba, sus **desvíos de ley** no, *"así que
 * `applyProc` toma el cap de una constante de módulo"*. ⚠️ No es persistencia: el estado del receptor
 * sigue sin recordar quién puso cada stack (`time-model.md` §Evaluado y descartado — lo refutado es
 * que el estado persista al emisor; esto es un **argumento** de la aplicación).
 */
export type EmitterDeviations = Partial<Record<LawParam, readonly ParamDeviation[]>>;
