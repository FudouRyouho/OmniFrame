/**
 * EL RECEPTOR QUE **MODIFICA** — la mitad de `arch-decisions §17` que faltaba (#8).
 *
 * §17 separa dos verbos del lado receptor y sólo uno corría: `fuerza` pone un **límite** sin tocar la
 * fórmula (Acolyte `N ≤ 4`, en `receiver-law.test.ts`), `modifica` cambia el **valor** — la pasiva de
 * Hydroid, que sube el strip inicial de Corrosive de 26% a 50%. Son parámetros distintos del mismo
 * efecto, y por eso no compiten.
 *
 * ─── LA FUENTE, Y POR QUÉ ES DEL RECEPTOR Y NO DEL EMISOR ─────────────────────────────────────────
 *
 * `references/wiki/warframes/hydroid/passive.md`: *"Enemies damaged by Hydroid are **permanently** more
 * vulnerable to Corrosive Status, with initial status reducing armor by **50%** rather than 26%"*, y el
 * renglón que decide el dueño: *"the Corrosive Status Effects can be applied from **any source**, not
 * just from Hydroid's weapons or abilities, and will receive the benefit"*.
 *
 * Eso lo saca del canal del emisor por medición, no por gusto: si el desvío viajara en la instancia
 * —como el `+9` al cap de tres Tauforged Emerald— un proc de OTRO jugador no lo cobraría, y la fuente
 * dice que sí. **El dueño determina el alcance**: el del emisor lo cobran sólo sus propios procs, el
 * del receptor lo cobra cualquiera que golpee. Son las dos caras de `DeviationSources`, mismo tipo
 * `ParamDeviation` en los dos campos.
 *
 * ─── QUÉ SE DECLARA Y QUÉ SE EJERCE ──────────────────────────────────────────────────────────────
 *
 * La marca se **declara** en el harness, igual que el Overguard y por el mismo motivo: **su origen no
 * está modelado**. Escribirla en producción pide identidad del source en la instancia (que hoy se tira
 * a propósito) o la proyección estática del source-state que ya usa Roar — ninguna de las dos se
 * construye acá. Lo que se ejerce es la LEY y su canal.
 */
import { describe, it, expect } from 'vitest';
import { makeIsolatedTarget } from './harness';
import {
  HYDROID_MARK,
  CORROSIVE_MAX_STACKS,
  CORROSIVE_INITIAL_STRIP_PCT,
  CORROSIVE_STACK_STRIP_PCT,
} from '../../formulas/status/stack-debuff';

const ARMOR = 1000;

/** Target con N stacks de Corrosive, con o sin la marca de Hydroid. */
const target = (corrosion: number, marked: boolean) =>
  makeIsolatedTarget({
    armor: ARMOR,
    stacks: { corrosion },
    ...(marked ? { marks: [HYDROID_MARK] } : {}),
  });

describe('El receptor que MODIFICA — la marca de Hydroid sobre el strip inicial (§17, #8)', () => {
  it('sin marca rige el default del concepto: 26% al primer stack', () => {
    // El default no deja de serlo porque alguien pueda desviarlo (§17).
    expect(CORROSIVE_INITIAL_STRIP_PCT).toBe(26);
    expect(target(1, false).getEffectiveArmor(0)).toBeCloseTo(ARMOR * (1 - 0.26), 5);
  });

  it('con la marca, el primer stack stripea 50% en vez de 26% — reemplaza, no compone', () => {
    // `replace` y no `add`: la fuente dice "50% rather than 26%". Si compusiera daría 76%.
    expect(target(1, true).getEffectiveArmor(0)).toBeCloseTo(ARMOR * (1 - 0.50), 5);
  });

  it('el desvío toca SÓLO el primer término: el 6% por stack adicional no cambia', () => {
    // 2 stacks: sin marca 26+6 = 32%; con marca 50+6 = 56%. La diferencia se mantiene en 24pp
    // exactos — si el desvío hubiera tocado también el término por-stack, se abriría.
    const sin = ARMOR - target(2, false).getEffectiveArmor(0);
    const con = ARMOR - target(2, true).getEffectiveArmor(0);
    expect(sin).toBeCloseTo(ARMOR * 0.32, 5);
    expect(con).toBeCloseTo(ARMOR * 0.56, 5);
    expect(con - sin).toBeCloseTo(ARMOR * 0.24, 5);
  });

  it('a stacks llenos la marca llega a strip TOTAL, y el default se queda en 80%', () => {
    // La cuenta que la fuente declara —"allowing Corrosive Status to reach 100% armor reduction at
    // full stacks"— cierra contra la ley construida: 50 + 6×9 = 104% topa en el techo FÍSICO de 1.0.
    // Sin marca, 26 + 6×9 = 80%. Es el mismo par de casos por el que §17 fijó el techo en 1.0 y no
    // en f(maxStacks): con el 0.80 viejo los dos daban 80% y la fuente quedaba contradicha en silencio.
    expect(CORROSIVE_INITIAL_STRIP_PCT + CORROSIVE_STACK_STRIP_PCT * (CORROSIVE_MAX_STACKS - 1)).toBe(80);
    expect(50 + CORROSIVE_STACK_STRIP_PCT * (CORROSIVE_MAX_STACKS - 1)).toBeGreaterThan(100);

    expect(target(CORROSIVE_MAX_STACKS, false).getEffectiveArmor(0)).toBeCloseTo(ARMOR * 0.20, 5);
    expect(target(CORROSIVE_MAX_STACKS, true).getEffectiveArmor(0)).toBe(0);
  });

  it('sin stacks la marca no hace nada — es un coeficiente, no un strip por sí misma', () => {
    // Que el receptor "hable" no aplica ningún efecto: modifica el valor de una ley que alguien más
    // tiene que disparar. Es la diferencia entre el parámetro y el proc.
    expect(target(0, true).getEffectiveArmor(0)).toBe(ARMOR);
  });

  it('una marca desconocida no desvía nada — la tabla decide, no la presencia de marcas', () => {
    const t = makeIsolatedTarget({ armor: ARMOR, stacks: { corrosion: 1 }, marks: ['no-existe'] });
    expect(t.getEffectiveArmor(0)).toBeCloseTo(ARMOR * (1 - 0.26), 5);
  });

  /**
   * Los dos verbos del receptor son **ortogonales**, que es lo que §17 afirma cuando dice que no
   * compiten: el Acolyte fuerza el CAP (`N ≤ 4`) y Hydroid modifica el COEFICIENTE. Un target que
   * portara los dos cobraría los dos, sobre parámetros distintos.
   */
  it('`fuerza` ⊥ `modifica`: la marca no toca el cap, la clase no toca el coeficiente', () => {
    // La clase sola: cap 4 (el proc se traba), coeficiente por defecto → 26 + 6×3 = 44%.
    const soloClase = makeIsolatedTarget({ armor: ARMOR, unitClass: ['acolyte'], stacks: { corrosion: 4 } });
    expect(soloClase.getEffectiveArmor(0)).toBeCloseTo(ARMOR * (1 - 0.44), 5);

    // Con las dos: mismo cap 4, pero el coeficiente desviado → 50 + 6×3 = 68%.
    const ambas = makeIsolatedTarget({
      armor: ARMOR, unitClass: ['acolyte'], marks: [HYDROID_MARK], stacks: { corrosion: 4 },
    });
    expect(ambas.getEffectiveArmor(0)).toBeCloseTo(ARMOR * (1 - 0.68), 5);
  });
});
