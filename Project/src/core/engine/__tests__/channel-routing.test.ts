/**
 * Ruteo por canal — un arcano montado en el WARFRAME que aterriza en un ARMA.
 *
 * Es el caso que la pertenencia no puede resolver: un warframe contiene TRES armas, así que
 * "el arcano está montado en el warframe" no dice *cuál* de ellas buffea. Ese `{cuál}` viaja en
 * la sub-familia del token (`WEAPON_PRIMARY_ADD_DAMAGE`) y lo resuelve la hidratación
 * (`resolve/hydration/channel-routing.ts`), NO el motor — que filtra por `target_entity` y nunca
 * mira `target_channel`.
 *
 * Los dos arcanos del fixture cubren las dos formas:
 *   Arcane Rage          canal DIRECTO   (trigger y destino en la misma arma: headshot → primaria)
 *   Arcane Blade Charger canal CRUZADO   (kill con rifle → daño de MELEE) — el salto lateral que
 *                        ninguna contención deriva.
 *
 * Cubre las DOS compuertas del descarte silencioso, que son distintas:
 *   (1) el token resuelve            → `resolveUpgradeEntry` no devuelve undefined
 *   (2) el modifier ATERRIZA         → llega a un nodo que existe, en la entidad correcta
 * Sin (2), (1) puede dar verde con cero efecto: antes de esto los 10 modifiers de estos arcanos
 * apuntaban al warframe, que no tiene `WEAPON_ADD_DAMAGE`, y se perdían sin ruido.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { voltChannelArcanes, VOLT, TIBERON_PRIME, NIKANA_PRIME } from '../fixtures/builds';
import { resolveUpgradeEntry } from '@shared/types/modifier';

await loadEngineData(new NodeAdapter());

// Uptime asumido: los dos arcanos son condicionales en el juego. El `{cuándo}` vive en `condition`
// y lo evalúa el motor contra `context.flags` — eje separado del `{cuál}` que prueba este archivo.
type Ctx = { flags: Record<string, boolean> };
const ON: Ctx = { flags: { on_headshot: true, on_primary_weapon_kill: true } };
const OFF: Ctx = { flags: {} };

const primary = (ctx = ON) => consume(voltChannelArcanes(), ctx).weapon(TIBERON_PRIME);
const melee   = (ctx = ON) => consume(voltChannelArcanes(), ctx).weapon(NIKANA_PRIME);
const frame   = (ctx = ON) => consume(voltChannelArcanes(), ctx).weapon(VOLT);

describe('canal — compuerta 1: el token resuelve', () => {
  it('los 6 tokens de sub-familia de arcano resuelven a attr + canal', () => {
    const casos: [string, string, string][] = [
      ['WEAPON_PRIMARY_ADD_DAMAGE',        'WEAPON_ADD_DAMAGE',        'primary'],
      ['WEAPON_PRIMARY_ADD_FIRE_RATE',     'WEAPON_ADD_FIRE_RATE',     'primary'],
      ['WEAPON_PRIMARY_ADD_RELOAD_SPEED',  'WEAPON_ADD_RELOAD_SPEED',  'primary'],
      ['WEAPON_SECONDARY_ADD_DAMAGE',      'WEAPON_ADD_DAMAGE',        'secondary'],
      ['WEAPON_SECONDARY_ADD_FIRE_RATE',   'WEAPON_ADD_FIRE_RATE',     'secondary'],
      ['WEAPON_MELEE_ADD_DAMAGE',          'WEAPON_ADD_DAMAGE',        'melee'],
    ];
    for (const [token, attr, channel] of casos) {
      const entry = resolveUpgradeEntry(token);
      expect(entry, token).toBeDefined();
      expect(entry!.attr, token).toBe(attr);
      expect(entry!.target_channel, token).toBe(channel);
      expect(entry!.op, token).toBe('ADD');
    }
  });

  // S2-C: la sub-familia SOLO existe bajo WEAPON. Antes de atar familia↔sub-familia estos tres
  // resolvían y devolvían basura — pasaba sólo porque {PRIMARY,SECONDARY,MELEE} y
  // {ADD,BASE,FLAT,MULT} no se solapan, invariante accidental que nada verificaba.
  it('sub-familia fuera de WEAPON NO resuelve (guard familia↔sub-familia)', () => {
    for (const token of ['AVATAR_MELEE_ADD_ABILITY_STRENGTH', 'VEHICLE_PRIMARY_ADD_SPEED', 'MELEE_MELEE_ADD_ATTACK_SPEED']) {
      expect(resolveUpgradeEntry(token), token).toBeUndefined();
    }
  });

  it('el token legítimo de la familia MELEE sigue resolviendo (el guard no lo pisa)', () => {
    const entry = resolveUpgradeEntry('MELEE_ADD_ATTACK_SPEED');
    expect(entry?.attr).toBe('MELEE_ADD_ATTACK_SPEED');
    expect(entry?.target_channel).toBeUndefined();
  });
});

describe('canal — compuerta 2: el modifier aterriza en el arma correcta', () => {
  // C3-b: no basta con "ya no se descarta" — el número tiene que ser el del dato.
  it('[directo] Arcane Rage +180% @rank5 aterriza en el daño de la PRIMARIA', () => {
    const dmg = primary().node('WEAPON_ADD_DAMAGE');
    expect(dmg.base).toBeCloseTo(48, 0);          // Tiberon Prime, daño innato
    expect(dmg.mods_add_pct).toBeCloseTo(180, 5); // base_value[5] del override
    expect(dmg.final).toBeCloseTo(48 * 2.8, 5);   // 48 × (1 + 180/100) = 134.4
  });

  it('[cruzado] Arcane Blade Charger +300% @rank5 aterriza en el daño del MELEE', () => {
    const dmg = melee().node('WEAPON_ADD_DAMAGE');
    expect(dmg.base).toBeCloseTo(198, 0);         // Nikana Prime
    expect(dmg.mods_add_pct).toBeCloseTo(300, 5);
    expect(dmg.final).toBeCloseTo(198 * 4.0, 5);  // 198 × (1 + 300/100) = 792
  });

  it('no se cruzan entre sí: cada arcano toca UNA sola arma', () => {
    // Si el ruteo cayera a "todas las armas" (o al fan-out equivocado) estos dos se contaminarían.
    expect(primary().node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(180, 5);
    expect(melee().node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(300, 5);
  });

  it('el warframe NO acumula el efecto: es el portador, no el destino', () => {
    // `target_entity` nace siendo Volt (donde está montado el arcano); el ruteo lo reemplaza.
    // Que Volt no tenga nodo `WEAPON_ADD_DAMAGE` ES la aserción — y es justamente por qué estos
    // modifiers se perdían antes: apuntaban a un nodo inexistente y el motor los ignoraba callado.
    expect(() => frame().node('WEAPON_ADD_DAMAGE')).toThrow(/ausente/);
  });
});

describe('canal — el {cuándo} es un eje aparte del {cuál}', () => {
  // El ruteo ocurre SIEMPRE (en hidratación); la condition la evalúa el motor al resolver.
  // Que el modifier llegue al nodo y no aplique NO es un descarte silencioso: es el gate haciendo
  // su trabajo, y el trace lo reporta (`cond=false`). Distinguirlos es el punto.
  it('con el trigger apagado el modifier sigue aterrizando, pero no aporta', () => {
    const dmg = primary(OFF).node('WEAPON_ADD_DAMAGE');
    expect(dmg.mods_add_pct).toBe(0);
    expect(dmg.final).toBeCloseTo(48, 0);
  });

  it.todo('uptime real: proc 15%/24s (Rage) y 30%/12s (Blade Charger) — C1 los proyecta al 100% [arch §15]');
});

// ─── El salto inverso: un MOD de arma que buffea al warframe ────────────────────────
//
// Los arcanos de arriba nacen en el warframe y bajan al arma. Este es el camino contrario y
// llega por otra puerta: un mod montado en un arma cuyo token es `AVATAR_*`. No tiene canal
// (la sub-familia sólo existe bajo `WEAPON`), así que sin ruteo por familia se queda donde
// nació — y un arma no tiene ni puede tener nodos de avatar.
//
// No era hipotético: `AVATAR_ADD_MOVEMENT_SPEED` YA estaba materializado en el warframe y el
// buff de Dispatch Overdrive igual moría en la melee.

describe('familia — un mod de arma cuyo token pertenece al warframe', () => {
  const DISPATCH = '/Lotus/Upgrades/Mods/Melee/MoveSpeedOnChannelKillMod';
  const AMALGAM  = '/Lotus/Upgrades/Mods/DualSource/Rifle/SerratedRushMod';

  it('Dispatch Overdrive (melee) sube su Movement Speed al warframe', () => {
    const build: any = voltChannelArcanes();
    build.mods = { melee: { 0: { itemId: DISPATCH, rank: 5, level: 5 } } };
    const mov = consume(build, ON).weapon(VOLT).node('AVATAR_ADD_MOVEMENT_SPEED');
    expect(mov.mods_add_pct).toBeCloseTo(60, 5);
    expect(mov.final).toBeCloseTo(1.6, 5);
  });

  it('la melee NO se queda el nodo de avatar (el salto mueve, no copia)', () => {
    const build: any = voltChannelArcanes();
    build.mods = { melee: { 0: { itemId: DISPATCH, rank: 5, level: 5 } } };
    const out = consume(build, ON);
    expect(() => out.weapon(NIKANA_PRIME).node('AVATAR_ADD_MOVEMENT_SPEED')).toThrow(/ausente/);
  });

  // Amalgam Serration es el caso de doble destino: su daño se queda en el rifle y su sprint
  // sube. Que el salto NO se lleve puesto el stat que sí pertenece al arma es el punto.
  it('un mod de dos stats reparte: el daño queda en el arma, el avatar sube', () => {
    const build: any = voltChannelArcanes();
    build.mods = { primary: { 0: { itemId: AMALGAM, rank: 10, level: 10 } } };
    const out = consume(build, ON);
    // el arcano de la fixture ya aporta 180 al rifle; el Amalgam suma sus 155 encima
    expect(out.weapon(TIBERON_PRIME).node('WEAPON_ADD_DAMAGE').mods_add_pct).toBeCloseTo(335, 5);
  });
});
