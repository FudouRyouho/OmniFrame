/**
 * Precisión — el nodo `WEAPON_ADD_ACCURACY` y la base de la que sale.
 *
 * El test que importa acá no es "¿el mod suma?" sino **de dónde sale la base**. El export
 * publica un `accuracy` por ARMA: el promedio invertido del cono, `100 / ((min + max) / 2)`.
 * Ese escalar no puede expresar que un Incarnon dispersa distinto que el ataque normal, y
 * los dos únicos consumidores vivos del token son justamente perks de forma Incarnon.
 *
 * La base sale del par `min_spread`/`max_spread` por ataque, que cosecha `omniframe-items`
 * de `Module:Weapons/data` (`docs/domains/source/wiki-modules.md`). Cierra `OQ-ENGINE-7`
 * en su caso `accuracy`; el EFECTO del cono —cono → probabilidad de impacto— es C2 y no
 * está modelado.
 *
 *   Felarx        Normal Attack {12, 14} → 7.6923   ·  Incarnon Form {6, 16} →  9.0909
 *   Boltor Prime  Normal Attack { 1,  3} → 50.0     ·  Incarnon Form {8, 12} → 10.0
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { boar, boltor, felarx, nikana, BOAR_PRIME, BOLTOR_PRIME, FELARX, HEAVY_CALIBER, NIKANA_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const ACCURACY = 'WEAPON_ADD_ACCURACY';

// ─── La base: el par por ataque, no el escalar del arma ──────────────────────────

describe('accuracy — la base sale del par de dispersión del ATAQUE', () => {
  it('Felarx: 7.69 en Normal Attack, 9.09 en Incarnon Form', () => {
    // Sin las condiciones activas el perk no aporta: lo que se lee es base pura.
    const base = consume(felarx('base'), { flags: {} }).weapon(FELARX).node(ACCURACY);
    const inc  = consume(felarx('incarnon_form'), { flags: {} }).weapon(FELARX).node(ACCURACY);

    expect(base.base).toBeCloseTo(7.6923, 3);
    expect(inc.base).toBeCloseTo(9.0909, 3);
  });

  it('Boltor Prime: el Incarnon dispersa 5× peor que el ataque normal', () => {
    const base = consume(boltor(), { flags: {} }).weapon(BOLTOR_PRIME).node(ACCURACY);
    const inc  = consume(boltor({ profile: 'incarnon_form' }), { flags: {} })
      .weapon(BOLTOR_PRIME).node(ACCURACY);

    expect(base.base).toBeCloseTo(50, 4);
    expect(inc.base).toBeCloseTo(10, 4);
  });

  it('el escalar del arma NO distingue perfiles — por eso no alcanza como fuente', () => {
    // `stats.accuracy` de Boltor Prime vale 50: coincide con Normal Attack y erraría por
    // 5× en Incarnon. Es la razón entera de cosechar el par. Si esta aserción se rompe
    // porque los dos perfiles empataron, la cosecha dejó de aterrizar.
    const base = consume(boltor(), { flags: {} }).weapon(BOLTOR_PRIME).node(ACCURACY);
    const inc  = consume(boltor({ profile: 'incarnon_form' }), { flags: {} })
      .weapon(BOLTOR_PRIME).node(ACCURACY);

    expect(inc.base).not.toBeCloseTo(base.base, 2);
  });
});

// ─── Los dos consumidores vivos: perks que antes se evaporaban ───────────────────

describe('accuracy — los perks aterrizan (OQ-ENGINE-7, caso vivo)', () => {
  it("Attuned Accuracy: +40% sobre la base del perfil, sólo apuntando", () => {
    const sin  = consume(felarx('base'), { flags: {} }).weapon(FELARX).node(ACCURACY);
    const con  = consume(felarx('base'), { flags: { while_aiming: true } })
      .weapon(FELARX).node(ACCURACY);

    expect(sin.mods_add_pct).toBe(0);
    expect(con.mods_add_pct).toBe(40);
    expect(con.final).toBeCloseTo(sin.base * 1.4, 3);
  });

  it("Hunter's Mantra: +40% sobre la base del Incarnon (10), no sobre la del arma (50)", () => {
    const w = consume(
      boltor({ profile: 'incarnon_form', perks: { 2: 'hunters_mantra' } }),
      { flags: { while_channeled_ability_active: true } },
    ).weapon(BOLTOR_PRIME).node(ACCURACY);

    expect(w.base).toBeCloseTo(10, 4);
    expect(w.mods_add_pct).toBe(40);
    expect(w.final).toBeCloseTo(14, 3); // 10 × 1.4 — con el escalar del arma habría dado 70
  });
});

// ─── Los mods: 17 fuentes que hablaban un token que el motor no conocía ──────────

describe('accuracy — los mods componen sobre la base del perfil', () => {
  it('Heavy Caliber: −55% sobre el ataque normal (50 → 22.5)', () => {
    // 17 mods declaraban `WEAPON_SPREAD`, un misnomer heredado de DE: sus labels dicen
    // "% Accuracy" y traen el signo ya correcto. El token no estaba en `UPGRADES`, así que
    // ninguno producía modifier — gritaban en hidratación y morían ahí.
    const d = consume(boltor({ mods: { 0: HEAVY_CALIBER } }), { flags: {} })
      .weapon(BOLTOR_PRIME).node(ACCURACY);

    expect(d.base).toBeCloseTo(50, 4);
    expect(d.mods_add_pct).toBe(-55);
    expect(d.final).toBeCloseTo(22.5, 4);
  });

  it('el mismo mod sobre el Incarnon compone sobre 10, no sobre 50', () => {
    // Cruce de las dos piezas: el rename del token y la base por ataque. Sin el par de
    // dispersión, Heavy Caliber habría penalizado un 50 que el Incarnon nunca tuvo.
    const d = consume(
      boltor({ profile: 'incarnon_form', mods: { 0: HEAVY_CALIBER } }),
      { flags: {} },
    ).weapon(BOLTOR_PRIME).node(ACCURACY);

    expect(d.base).toBeCloseTo(10, 4);
    expect(d.final).toBeCloseTo(4.5, 4);
  });
});

// ─── `0/0` es dato, no ausencia ──────────────────────────────────────────────────

describe('accuracy — un cono nulo vale 100, no el escalar del arma', () => {
  it('Boar Prime: la escopeta dispersa 10/30, su Incarnon no dispersa nada', () => {
    // El caso que destapó la trampa del fallback. `Incarnon Form` declara {0, 0} — cono nulo,
    // puntería perfecta. Caer al escalar del arma le daría 5, la precisión de la escopeta:
    // un número plausible y falso, peor que el silencio que había antes del nodo.
    const base = consume(boar(), { flags: {} }).weapon(BOAR_PRIME).node(ACCURACY);
    const inc  = consume(boar('incarnon_form'), { flags: {} }).weapon(BOAR_PRIME).node(ACCURACY);

    expect(base.base).toBeCloseTo(5, 4);   // 100 / ((10+30)/2)
    expect(inc.base).toBe(100);            // cono nulo, NO el 5 del ataque hermano
  });
});

// ─── El gate: ausencia ≠ 0 ───────────────────────────────────────────────────────

describe('accuracy — sin dato no hay nodo', () => {
  it('una melee no tiene nodo de precisión (no un 0 que finja precisión nula)', () => {
    const w = consume(nikana(), { flags: {} }).weapon(NIKANA_PRIME);
    expect(() => w.node(ACCURACY)).toThrow(/ausente/);
  });
});
