/**
 * @domain Engine / Formulas / Common / ParamDeviation
 * @SSoT docs/domains/engine/design/vocabulary.md
 *
 * §6 fija el vocablo y sus cuatro reglas duras; `docs/domains/engine/design/arch-decisions.md` §17, la
 * cadena de dueños que esta primitiva ejecuta.
 *
 * **La resolución de un parámetro de ley cuando alguien declara sobre él.**
 *
 * Una ley trae el default de sus parámetros con su fórmula; un portador puede **desviarlos**. Esta es
 * la primitiva pura que los compone — número→número, sin saber de quién es el parámetro ni qué ley lo
 * usa, igual que `stackDebuffValue` no sabe qué efecto la llama.
 *
 * **DOS NIVELES, y confundirlos es de donde salía el diseño equivocado.** El primero es **precedencia
 * por dueño**; el segundo, **composición dentro del dueño que habla**:
 *
 * ```
 * 1. ¿el RECEPTOR declara sobre este parámetro?  → rige él, y el emisor NO llega
 *    ¿calla?                                     → rige el emisor
 * 2. dentro del que habla: modifies → forces      (los suyos, entre sí)
 * ```
 *
 * §17 fija el primero y explica por qué no es dominancia: *"cinco fragmentos esmeralda (+10 al cap) no
 * rinden nada contra un Acolyte"* — pero *"la regla no es 'el receptor gana': si lo fuera el esmeralda
 * no funcionaría nunca"*. **Gana cuando habla.** Y el segundo aparece en el gate del escudo, donde
 * `Catalyzing Shields` (modifica a 1.33 s) y `Decaying Dragon Key` (fuerza un techo de 0.33 s) son
 * **los dos del receptor**: ahí sí `min(1.33, 0.33) = 0.33`, y §17 lo marca — *"el 'anula' es
 * aritmética, no precedencia"*. Aritmética **entre pares**, no la regla general.
 */

/**
 * Lo que un portador declara sobre un parámetro. El **verbo** es de `arch-decisions §17` (`modifica` ⊥
 * `fuerza`); la **operación** es cómo entra el valor, y sólo `modifies` la necesita — `forces` es
 * siempre un techo.
 *
 * Las tres operaciones salen del corpus medido, ninguna es especulativa:
 * `add` (Emerald Archon Shard, `+2` al cap) · `scale` (Protea, `×2` a la ventana) · `replace` (Hydroid,
 * *"50% **rather than** 26%"*; Hildryn, `3.5 s`; el Acolyte, que **overridea la tabla** de caps).
 */
export type ParamDeviation =
  | { verb: "modifies"; op: "add" | "scale" | "replace"; value: number }
  | { verb: "forces"; value: number };

/** Constructores — leen mejor en las tablas de ley que un objeto literal repetido. */
export const modifies = {
  add:     (value: number): ParamDeviation => ({ verb: "modifies", op: "add", value }),
  scale:   (value: number): ParamDeviation => ({ verb: "modifies", op: "scale", value }),
  replace: (value: number): ParamDeviation => ({ verb: "modifies", op: "replace", value }),
};
/** `forces` es **techo**, no piso: los tres casos medidos acotan hacia abajo (Acolyte, Dragon Key, bosses). */
export const forces = (value: number): ParamDeviation => ({ verb: "forces", value });

/** Quién declara. Ausente o vacío = **calla**, que es distinto de declarar un valor neutro. */
export interface DeviationSources {
  emitter?: readonly ParamDeviation[];
  receiver?: readonly ParamDeviation[];
}

/**
 * Compone las declaraciones **de un mismo dueño** sobre el mismo parámetro.
 *
 * Orden: `replace` fija la base, `add` y `scale` la mueven, `forces` acota al final. ⚠️ **El orden
 * entre las tres operaciones de `modifies` no tiene caso medido** — ningún portador conocido declara
 * dos operaciones distintas sobre el mismo parámetro. Se elige uno y se declara acá; no se infiere de
 * la aritmética, que daría cualquiera.
 *
 * 🔴 **Dos `replace` del mismo dueño TIRAN.** No hay dato que diga cuál gana, y elegir en silencio
 * produce un número creíble y falso — *"morir gritando"* es la regla de la casa cuando la alternativa
 * es componer mal sin que nada lo reporte.
 */
export function applyDeviations(defaultValue: number, deviations: readonly ParamDeviation[]): number {
  const replaces = deviations.filter((d) => d.verb === "modifies" && d.op === "replace");
  if (replaces.length > 1) {
    throw new Error(
      `ParamDeviation: ${replaces.length} declaraciones 'replace' del mismo dueño sobre el mismo ` +
      `parámetro (${replaces.map((r) => r.value).join(", ")}). Cuál gana no está medido — ver vocabulary.md §6.`,
    );
  }

  let value = replaces.length === 1 ? replaces[0].value : defaultValue;
  for (const d of deviations) {
    if (d.verb === "modifies" && d.op === "add") value += d.value;
  }
  for (const d of deviations) {
    if (d.verb === "modifies" && d.op === "scale") value *= d.value;
  }
  for (const d of deviations) {
    if (d.verb === "forces") value = Math.min(value, d.value);
  }
  return value;
}

/**
 * El valor del parámetro: el default de la ley, desviado por quien tenga voz.
 *
 * **El receptor gana cuando habla** — si declara, el emisor no llega a este parámetro. Que sea por
 * parámetro y no global es lo que deja funcionar al esmeralda contra cualquier enemigo que no sea un
 * Acolyte, y lo que hace que contra un Acolyte no rinda nada.
 */
export function resolveParam(defaultValue: number, sources: DeviationSources = {}): number {
  const receiver = sources.receiver ?? [];
  if (receiver.length > 0) return applyDeviations(defaultValue, receiver);
  return applyDeviations(defaultValue, sources.emitter ?? []);
}

/**
 * **La unidad de declaración es una tabla, no un escalar** (`vocabulary.md §6`, regla dura 4). Lo
 * fuerzan los tres receptores que traen la suya: el Acolyte declara *"4 para **cualquier** status,
 * excepto Impact → 3"* y el Lich lo mismo con `6`, que es **mayor** que el default de Impact (`5`) —
 * prueba de que overridean la tabla en vez de acotar un número.
 *
 * `'*'` es el default del portador; una clave ausente significa que **sobre ese parámetro no habla**,
 * y entonces rige el default del concepto (o el emisor).
 */
export type DeviationTable<K extends string> = Partial<Record<K | "*", ParamDeviation>>;

/** Qué declara esta tabla sobre `key`: su fila, la del comodín, o nada. */
export function deviationFor<K extends string>(
  table: DeviationTable<K> | undefined,
  key: K,
): ParamDeviation | undefined {
  if (!table) return undefined;
  return table[key] ?? table["*"];
}
