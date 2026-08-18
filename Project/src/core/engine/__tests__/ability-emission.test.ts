/**
 * EL VERBO EMITE-INSTANCIA, CONTRA EL DATO REAL — `AbilityRepository.getEmissions`.
 *
 * `ability-instance.test.ts` ejerce la instancia de habilidad **declarada** (banco). Esto ejerce la
 * **derivada del catálogo**: mismo destino, otro origen. Es lo que faltaba para que "una habilidad
 * puede emitir" dejara de ser cierto sólo en el banco.
 *
 * ─── QUÉ SE MIDIÓ ANTES DE ESCRIBIRLO ─────────────────────────────────────────────────────────────
 *
 * Los 28 stats con `<DT_*>` de las habilidades marcadas: **18 limpios · 4 multi-tipo · 2 rango ·
 * 2 comodín · 2 porcentuales**. Los diez que no pasan se omiten con warn — el gate no es defensivo,
 * es la diferencia entre no saber y aproximar.
 *
 * Y **6 de 21 habilidades emiten más de una vez**, así que la unidad es la emisión, no la habilidad.
 */
import { describe, it, expect, vi } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { AbilityRepository, type AbilityEmission } from '../resolve/hydration/AbilityRepository';
import { CombatSimulator } from '../simulate/combat/CombatSimulator';
import { EntityState } from '../simulate/EntityState';
import { syntheticHostile } from './hostile-entity';
import { WEAPON_DAMAGE_ABILITIES } from '../contracts/emitter-class';
import { expectedProcEvents } from '../formulas/status/proc-population';
import { makeIsolatedTarget } from './status/harness';
import { hitContextOf } from './ability-instance';
import { effectOfDamageType } from '@shared/types';
import { consume } from '../output/consume';
import { ashShuriken, ASH } from '../fixtures/builds';
import type { SimulationEntity } from '../contracts';

await loadEngineData(new NodeAdapter());

const SHURIKEN     = '/Lotus/Powersuits/PowersuitAbilities/GlaiveAbility';
const FIREBALL     = '/Lotus/Powersuits/PowersuitAbilities/FireBallAbility';
const NULL_STAR    = '/Lotus/Powersuits/PowersuitAbilities/NullStarAbility';
const AXIOS        = '/Lotus/Powersuits/PowersuitAbilities/HopliteImpaleAbility';
const SPECTRAL     = '/Lotus/Powersuits/PowersuitAbilities/DragonBreathAbility';
const RADIAL_JAV   = '/Lotus/Powersuits/PowersuitAbilities/RadialJavelinAbility';
const RADIAL_JAV_UMBRA = '/Lotus/Powersuits/PowersuitAbilities/UmbraRadialJavelinAbility';

/** Silencia los warns esperados de los gates — se afirma el efecto, no el ruido. */
const quiet = <T>(fn: () => T): T => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try { return fn(); } finally { spy.mockRestore(); }
};

/**
 * Censo puro: gates y catálogo, sin peer. `''` no matchea ninguna entidad en `[]`, así que
 * `strength`/`lawDeviations`/factor de pool caen a su default neutro — exactamente lo que estos
 * casos quieren ejercer (el parseo del override, no el peer-read de F3).
 */
const emit = (abilityId: string): AbilityEmission[] => AbilityRepository.getEmissions(abilityId, '', []);

/**
 * Ash + Shuriken, hidratado de verdad (F3) — el único caso de este archivo que ejercita el
 * peer-read/escalado contra un build real en vez de un `entities: []` sintético.
 */
const emitShuriken = (opts: { strength?: boolean } = {}): AbilityEmission[] => {
  const entities = consume(ashShuriken(opts), { flags: {} }).snapshot();
  const caster = entities.find((e) => e.unique_name === ASH)!;
  return AbilityRepository.getEmissions(SHURIKEN, caster.id, entities);
};

describe('emite-instancia — la habilidad como fuente, desde el catálogo', () => {
  it('un stat de daño limpio se vuelve instancia: Shuriken → 750 Slash', () => {
    const [e, ...resto] = emitShuriken();
    expect(resto).toHaveLength(0);
    expect(e.instance.damageByType).toEqual({ slash: 750 });
    expect(e.instance.moddedBase).toBe(750);
  });

  /**
   * ⭐ **Todo es status 100% salvo que se diga lo contrario.** Si el dato del juego declara que la
   * habilidad hace `<DT_SLASH>`, hace daño de corte **y proquea corte** — no tira los dados como un
   * arma. La regla no necesita dato nuevo: sale del tipo que el override ya declara.
   *
   * Se afirma sobre `expectedProcEvents`, que es la ley de producción, no sobre el campo: lo que
   * importa es que del emisor salga **un proc del tipo declarado**, no cómo se escribe el 100%.
   */
  it('lo que declara su tipo, proquea ese tipo — un evento, esperanza 1', () => {
    const [e] = emitShuriken();
    const eventos = expectedProcEvents(e.instance.damageByType, e.instance.statusChance, 0);
    expect(eventos).toHaveLength(1);
    expect(eventos[0].type).toBe('slash');
    expect(eventos[0].expected).toBe(1);
  });

  it('…y el receptor lo recibe: Sporespring deja bleed de Toxin, no un estado vacío', () => {
    const [e] = emit('/Lotus/Powersuits/PowersuitAbilities/NokkoLaunchAbility');
    const t = makeIsolatedTarget({ armor: 1000 });
    for (const ev of expectedProcEvents(e.instance.damageByType, e.instance.statusChance, 0)) {
      const effect = effectOfDamageType(ev.type);
      if (effect) t.applyProc(effect, hitContextOf(e.instance), ev.expected, 0);
    }
    expect(t.activeEffects()).toEqual(['poison']);
  });

  /**
   * El eje que el usuario eligió ejercer: el escalado **declarado**, ahora contra el grafo real
   * (F3) en vez de un `strength` pasado a mano. `upgrade_by` dice *con qué* escala; Blind Rage
   * (+99% str, lvl 10) sobre Ash limpio lleva `AVATAR_ADD_ABILITY_STRENGTH` a `199/100 = 1.99`.
   */
  it('el escalado se aplica donde el dato lo declara — y sólo ahí', () => {
    const conStr = emitShuriken({ strength: true })[0];
    expect(conStr.instance.damageByType.slash).toBe(1492.5);   // 750 × 1.99 (Blind Rage), `upgrade_by` presente

    // Pyrotechnics no declara `upgrade_by`: es plano por la carta, no por falta de dato — censo puro.
    const plano = emit('/Lotus/Powersuits/PowersuitAbilities/TempleShredAbility')[0];
    expect(plano.instance.damageByType.heat).toBe(550);
  });

  /**
   * ⚠️ EL HALLAZGO DEL PASE. La primera versión devolvía UNA instancia por habilidad y acumulaba los
   * tipos; eso fusionaba emisiones que la fuente distingue —Fireball directo tiene `0%` de status y el
   * área `100%`— y peor, mezclaba naturalezas (Tesla Nervos: un impacto y un daño/segundo).
   */
  it('una habilidad emite N veces: Null Star da dos instancias, no una suma', () => {
    const es = emit(NULL_STAR);
    expect(es).toHaveLength(2);
    expect(es.map((e) => e.instance.damageByType)).toEqual([{ blast: 300 }, { heat: 240 }]);
  });

  it('y el label es lo que las distingue cuando el tipo no alcanza', () => {
    const es = emit(AXIOS);
    expect(es).toHaveLength(2);
    expect(es[0].label).toContain('Damage:');
    expect(es[1].label).toContain('Explosion Damage:');
  });
});

describe('los cuatro gates — se omite y se avisa, nunca se aproxima', () => {
  it('rango: Fireball no emite sus dos rangos, y sí su stat sano', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const es = emit(FIREBALL);
    const motivos = warn.mock.calls.map((c) => String(c[0]));
    warn.mockRestore();

    expect(es).toHaveLength(0);                                   // los 3 stats caen: 2 rangos + 1 porcentual
    expect(motivos.filter((m) => m.includes('rango sin estado'))).toHaveLength(2);
    expect(motivos.filter((m) => m.includes('porcentual'))).toHaveLength(1);
  });

  it('comodín: Spectral Scream no inventa un elemento', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const es = emit(SPECTRAL);
    const motivos = warn.mock.calls.map((c) => String(c[0]));
    warn.mockRestore();
    expect(es).toHaveLength(0);
    expect(motivos.every((m) => m.includes('comodín'))).toBe(true);
  });

  /**
   * El gate que la fuente justifica con un número: Redline reparte `81.25% Impact / 18.75% Puncture`.
   * Partir en partes iguales habría dado un resultado plausible y falso — el modo de falla que esta
   * campaña viene cerrando.
   */
  it('multi-tipo: no se parte 1000 en tres porque el override no da la proporción', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const es = emit(RADIAL_JAV_UMBRA);
    const motivos = warn.mock.calls.map((c) => String(c[0]));
    warn.mockRestore();
    expect(es).toHaveLength(0);
    expect(motivos.some((m) => m.includes('3 tipos y una sola magnitud'))).toBe(true);
  });

  /**
   * Quinto gate — Damage sin `<DT_*>` declarado, el código lo saltaba en silencio — #5.
   * Radial Javelin: catálogo con dos entradas inconsistentes para la misma habilidad — #6.
   */
  it('emisión muda: declara daño sin tipo → avisa, no se salta callado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const es = emit(RADIAL_JAV);
    const motivos = warn.mock.calls.map((c) => String(c[0]));
    warn.mockRestore();
    expect(es).toHaveLength(0);
    expect(motivos.some((m) => m.includes('declara daño sin tipo'))).toBe(true);
  });

  it('el censo completo: 18 emisiones sobre las 28 marcadas', () => {
    const total = quiet(() =>
      WEAPON_DAMAGE_ABILITIES.reduce((n, id) => n + emit(id).length, 0),
    );
    expect(total).toBe(18);
  });
});

describe('⭐ la instancia derivada del catálogo atraviesa el motor entero', () => {
  const hostil = (faction: string, opts: { armor?: number; shields?: number } = {}) =>
    new EntityState(syntheticHostile({ faction, health: 100_000, ...opts }));

  /**
   * El cierre del eje: una instancia que **nació de una habilidad del catálogo** —no del banco— paga
   * la matriz de facción como cualquier arma. Sporespring es Toxin 2500; contra Narmer (`+0.5`) son
   * 3750, y el número lo pone la ley, no el test.
   */
  it('Sporespring (Toxin 2500) contra Narmer paga la matriz: 3750', () => {
    const [e] = emit('/Lotus/Powersuits/PowersuitAbilities/NokkoLaunchAbility');
    const hit = CombatSimulator.resolveHit(e.instance.damageByType, hostil('Narmer'));
    expect(hit.total_damage).toBe(3750);
  });

  it('…y su Toxin atraviesa el shield, igual que el de un arma', () => {
    const [e] = emit('/Lotus/Powersuits/PowersuitAbilities/NokkoLaunchAbility');
    const hit = CombatSimulator.resolveHit(e.instance.damageByType, hostil('Isolated', { shields: 500 }));
    expect(hit.by_layer).toEqual({ health: 2500 });
  });

  /**
   * Y el escalado viaja hasta el número final: la misma habilidad con el doble de strength pega el
   * doble, con la matriz aplicada después. Es el eje `input → simulado` cerrado de punta a punta.
   *
   * Sin fixture real de Nokko (F3 sólo construyó Ash+Shuriken — `.working/
   * refactor-engine-2-recomposicion.md`): el caster es un peer SINTÉTICO que declara
   * `AVATAR_ADD_ABILITY_STRENGTH` en `200/100 = 2`, mismo criterio que `hostil()` arriba — es un
   * test de LEY (el escalado llega hasta `resolveHit`), no de dato, así que no necesita un build.
   */
  it('el strength llega hasta el daño resuelto', () => {
    const NOKKO = '/Lotus/Powersuits/PowersuitAbilities/NokkoLaunchAbility';
    const doubledStrength: SimulationEntity = {
      id: 'synthetic-caster', unique_name: 'synthetic-caster', persistence: 'TE', tags: [],
      attributes: { AVATAR_ADD_ABILITY_STRENGTH: { base: 100, base_flat: 0, mods_add_pct: 100, total_flat: 0, multiplicative: 1, final: 200 } },
    };
    const base = emit(NOKKO)[0];
    const buff = AbilityRepository.getEmissions(NOKKO, doubledStrength.id, [doubledStrength])[0];
    const dañoDe = (i: typeof base) => CombatSimulator.resolveHit(i.instance.damageByType, hostil('Narmer')).total_damage;
    expect(dañoDe(buff)).toBe(dañoDe(base) * 2);
    expect(dañoDe(buff)).toBe(7500);
  });
});
