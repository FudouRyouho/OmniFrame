/**
 * LA DESVIACIÓN DE PARÁMETRO — la primitiva, contra los 10 casos medidos del corpus.
 *
 * Doctrina: `vocabulary.md §6` (el vocablo y sus reglas) · `arch-decisions §17` (la cadena de dueños).
 *
 * Este archivo mide la LEY pura (altitud 1: número→número). Que el desvío **llegue** desde un shard o
 * desde la clase del enemigo es otro tramo (2b/2c) y no se duplica acá — igual que `stack-debuff-law`
 * mide la Familia A sin pasar por `EntityState`.
 *
 * Los 10 casos no son una lista elegida: son **todos** los que el corpus documenta hoy, sobre 3
 * parámetros y 2 mecánicas. Si aparece un caso nuevo que la primitiva no expresa, es la primitiva la
 * que está mal.
 */
import { describe, it, expect } from 'vitest';
import {
  resolveParam, applyDeviations, deviationFor, modifies, forces,
  type DeviationTable,
} from '../formulas/common/param-deviation';
import { CORROSIVE_MAX_STACKS } from '../formulas/status/stack-debuff';

describe('Precedencia por dueño — el receptor gana CUANDO HABLA, no siempre', () => {
  /**
   * El caso que fija la regla entera (`status-stack-caps.md`): `3 × Tauforged Emerald` = `+9` sobre el
   * default. El receptor calla, así que el desvío del emisor rige.
   */
  it('el emisor desvía si el receptor calla: 10 + 3×3 = 19', () => {
    const tresTauforged = [modifies.add(3), modifies.add(3), modifies.add(3)];
    expect(resolveParam(CORROSIVE_MAX_STACKS, { emitter: tresTauforged })).toBe(19);
  });

  /**
   * *"Cinco fragmentos esmeralda (+10 al cap) no rinden nada contra un Acolyte"* (§17). El receptor
   * declara sobre ESTE parámetro, así que el desvío del emisor no llega — y el resultado no es
   * `min(20, 4)` por casualidad: es que el emisor nunca entró.
   */
  it('el receptor que habla anula al emisor sobre ESE parámetro: 5 esmeraldas vs Acolyte → 4', () => {
    const cincoEsmeraldas = Array.from({ length: 5 }, () => modifies.add(2));
    expect(resolveParam(CORROSIVE_MAX_STACKS, { emitter: cincoEsmeraldas })).toBe(20);
    expect(resolveParam(CORROSIVE_MAX_STACKS, {
      emitter: cincoEsmeraldas,
      receiver: [modifies.replace(4)],
    })).toBe(4);
  });

  it('sin nadie que hable, rige el default del concepto', () => {
    expect(resolveParam(CORROSIVE_MAX_STACKS)).toBe(10);
    expect(resolveParam(CORROSIVE_MAX_STACKS, { emitter: [], receiver: [] })).toBe(10);
  });
});

describe('Composición dentro del dueño que habla', () => {
  // Hydroid: *"50% rather than 26%"* — el receptor lleva la marca y reemplaza el coeficiente.
  it('`replace` pisa el default (Hydroid: first 26% → 50%)', () => {
    expect(resolveParam(0.26, { receiver: [modifies.replace(0.5)] })).toBeCloseTo(0.5, 10);
  });

  // Protea (Grenade Fan): *"duplica el mínimo"* de la ventana del gate.
  it('`scale` multiplica el default (Protea: ×2 sobre la ventana)', () => {
    expect(resolveParam(0.33, { receiver: [modifies.scale(2)] })).toBeCloseTo(0.66, 10);
  });

  // Hildryn (y aliados bajo Haven): la ventana pasa a 3.5 s fijos.
  it('`replace` también cubre el gate (Hildryn: 3.5 s)', () => {
    expect(resolveParam(1.52, { receiver: [modifies.replace(3.5)] })).toBe(3.5);
  });

  /**
   * EL CASO QUE PRUEBA QUE EL `min` ES INTRA-DUEÑO, NO LA REGLA GENERAL.
   *
   * `Catalyzing Shields` modifica la ventana a 1.33 s y la `Decaying Dragon Key` fuerza un techo de
   * 0.33 s — **las dos son del receptor**. La wiki dice que la Key *"anula por completo a Catalyzing
   * Shields"*, y §17 lo desarma: *"no compiten: uno modifica y el otro fuerza un cap, y
   * `min(1.33, 0.33) = 0.33`. El 'anula' es aritmética, no precedencia."*
   */
  it('`forces` acota lo que `modifies` produjo, del mismo dueño (Catalyzing + Dragon Key → 0.33)', () => {
    expect(resolveParam(1.52, {
      receiver: [modifies.replace(1.33), forces(0.33)],
    })).toBeCloseTo(0.33, 10);
  });

  it('un techo por encima del valor no muerde — la desviación existe igual', () => {
    // `vocabulary.md §6` regla dura 3. Sin caso medido hoy; la primitiva no puede inventarse un error.
    expect(applyDeviations(3, [forces(4)])).toBe(3);
  });

  /**
   * 🔴 Dos `replace` del mismo dueño: no hay dato de cuál gana, así que TIRA en vez de elegir. Un
   * número creíble y falso es estrictamente peor que un error visible.
   */
  it('dos `replace` del mismo dueño tiran en vez de elegir en silencio', () => {
    expect(() => applyDeviations(10, [modifies.replace(4), modifies.replace(6)]))
      .toThrow(/dos|2 declaraciones|replace/i);
  });
});

describe('La unidad es una tabla — los tres receptores traen la suya', () => {
  type Effect = 'corrosion' | 'impact' | 'freeze';

  // *"Can only receive up to 4 stacks of any Status Effect with the exception of Impact, which can
  //  stack up to 3 times"* — el comodín declara el default del portador.
  const ACOLYTE: DeviationTable<Effect> = { '*': modifies.replace(4), impact: modifies.replace(3) };
  // *"No Status Effect will exceed a maximum of 4 stacks, with the exception of Impact which can stack
  //  up to 6 times"* — mismo tratamiento, distinto número.
  const LICH: DeviationTable<Effect>    = { '*': modifies.replace(4), impact: modifies.replace(6) };
  // *"Cold — máximo 4 procs"*: habla de UN efecto y calla sobre el resto.
  const OVERGUARD: DeviationTable<Effect> = { freeze: modifies.replace(4) };

  it('el comodín cubre lo que la fila no nombra (Acolyte: corrosion → 4, impact → 3)', () => {
    expect(resolveParam(10, { receiver: [deviationFor(ACOLYTE, 'corrosion')!] })).toBe(4);
    expect(resolveParam(5,  { receiver: [deviationFor(ACOLYTE, 'impact')!] })).toBe(3);
  });

  /**
   * `Impact` es la prueba de que esto **no** es un techo: el Lich lo lleva a `6`, **por encima** del
   * default `5`. Un `forces` daría `min(5, 6) = 5` y contradiría a la fuente — por eso la tabla
   * reemplaza en vez de acotar (`damage-status-model.md` §El cap no siempre es "por tipo").
   */
  it('el Lich SUBE el cap de Impact por encima del default: 5 → 6, no min(5,6)', () => {
    expect(resolveParam(5, { receiver: [deviationFor(LICH, 'impact')!] })).toBe(6);
    expect(resolveParam(10, { receiver: [deviationFor(LICH, 'corrosion')!] })).toBe(4);
  });

  it('una tabla sin comodín calla sobre lo que no nombra (Overguard: sólo Cold)', () => {
    expect(deviationFor(OVERGUARD, 'freeze')).toBeDefined();
    expect(deviationFor(OVERGUARD, 'corrosion')).toBeUndefined();
    // Y callar significa que el default rige — o el emisor, si él sí habla.
    const sinDeclaracion = deviationFor(OVERGUARD, 'corrosion');
    expect(resolveParam(10, { receiver: sinDeclaracion ? [sinDeclaracion] : [] })).toBe(10);
  });

  it('bosses: Freeze 9 → 4, y el default sigue siendo 9 para el resto del mundo', () => {
    expect(resolveParam(9, { receiver: [deviationFor(OVERGUARD, 'freeze')!] })).toBe(4);
    expect(resolveParam(9)).toBe(9);
  });
});
