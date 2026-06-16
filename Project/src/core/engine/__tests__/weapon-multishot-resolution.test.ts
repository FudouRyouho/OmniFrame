/**
 * Test de la regla de resolución de multishot por perfil de ataque.
 *
 * Regla (docs/data/schemas/weapons/weapons-known-gaps.md):
 *   1. Override explícito en weapon-stats.override.json → usar ese valor
 *   2. attacks[0] → usar stats.multishot
 *   3. Cualquier otro índice → 1
 *
 * Tests de datos: verifica que weapon-stats.override.json contiene los valores
 * correctos para las armas con multishot innato en perfiles alternativos.
 */
import { loadEngineData } from '../fixtures/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import weaponsData        from '../../../../public/data/weapons.json';
import weaponStatsOverride from '../../../../public/data/weapon-stats.override.json';
import { describe, it, expect } from 'vitest';
import { ItemRepository }  from '../resolve/hydration/ItemRepository';

await loadEngineData(new NodeAdapter());

const IDS = {
  FELARX:       '/Lotus/Weapons/Tenno/Zariman/LongGuns/PumpShotgun/ZarimanPumpShotgun',
  CEDO:         '/Lotus/Weapons/Tenno/LongGuns/TnAlchemistShotgun/TnAlchemistShotgun',
  BASMU:        '/Lotus/Weapons/Sentients/SentRifleNewWar/SentRifleNewWarGun',
  KUVA_HEK:     '/Lotus/Weapons/Grineer/KuvaLich/LongGuns/Hek/KuvaHekWeapon',
  EUPHONA_PRIME:'/Lotus/Weapons/Tenno/Pistols/AllNew1hSG/AllNew1hSG',
};

// ─── Regla: attacks[0] hereda stats.multishot ────────────────────────────────

describe('Resolución multishot — regla attacks[0]', () => {
  it('Felarx Normal Attack (attacks[0]): multishot = 4 (stats.multishot)', () => {
    const dna = ItemRepository.getDNA(IDS.FELARX);
    expect(dna?.profiles['normal_attack']?.WEAPON_ADD_MULTISHOT).toBe(4);
  });

  it('Felarx Incarnon Form (attacks[1]): multishot = 1 (no es attacks[0])', () => {
    const dna = ItemRepository.getDNA(IDS.FELARX);
    expect(dna?.profiles['incarnon_form']?.WEAPON_ADD_MULTISHOT).toBe(1);
  });

  it('Cedo Normal Attack (attacks[0]): multishot = 6 (stats.multishot)', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO);
    expect(dna?.profiles['normal_attack']?.WEAPON_ADD_MULTISHOT).toBe(6);
  });

  it('Cedo Alt-Fire Glaive (attacks[1]): multishot = 1', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO);
    expect(dna?.profiles['alt-fire_glaive']?.WEAPON_ADD_MULTISHOT).toBe(1);
  });

  it('Cedo Glaive Radial Attack (attacks[2]): multishot = 1', () => {
    const dna = ItemRepository.getDNA(IDS.CEDO);
    expect(dna?.profiles['glaive_radial_attack']?.WEAPON_ADD_MULTISHOT).toBe(1);
  });
});

// ─── Regla: override explícito tiene prioridad ───────────────────────────────

describe('Resolución multishot — weapon-stats.override.json', () => {
  it('Basmu Held: multishot = 2 (override, no attacks[0])', () => {
    const dna = ItemRepository.getDNA(IDS.BASMU);
    expect(dna?.profiles['held']?.WEAPON_ADD_MULTISHOT).toBe(2);
  });

  it('Basmu Auto (attacks[0]): multishot = 1 (stats.multishot del arma)', () => {
    const dna = ItemRepository.getDNA(IDS.BASMU);
    expect(dna?.profiles['auto']?.WEAPON_ADD_MULTISHOT).toBe(1);
  });

  it('Kuva Hek Normal Attack (attacks[0]): multishot = 7 (stats.multishot)', () => {
    const dna = ItemRepository.getDNA(IDS.KUVA_HEK);
    expect(dna?.profiles['normal_attack']?.WEAPON_ADD_MULTISHOT).toBe(7);
  });

  it('Kuva Hek Alt-Fire (attacks[1]): multishot = 28 (override)', () => {
    const dna = ItemRepository.getDNA(IDS.KUVA_HEK);
    expect(dna?.profiles['alt-fire']?.WEAPON_ADD_MULTISHOT).toBe(28);
  });

  it('Euphona Prime Buckshot (attacks[1]): multishot = 10 (override)', () => {
    const dna = ItemRepository.getDNA(IDS.EUPHONA_PRIME);
    expect(dna?.profiles['buckshot']?.WEAPON_ADD_MULTISHOT).toBe(10);
  });

  it('Euphona Prime Slug (attacks[0]): multishot = 1 (stats.multishot del arma)', () => {
    const dna = ItemRepository.getDNA(IDS.EUPHONA_PRIME);
    expect(dna?.profiles['slug']?.WEAPON_ADD_MULTISHOT).toBe(1);
  });
});

// ─── Datos: weapon-stats.override.json es estructuralmente correcto ──────────

describe('weapon-stats.override.json — integridad del archivo', () => {
  const override = weaponStatsOverride as Record<string, any>;

  it('todas las entradas activas tienen unique_name que existe en weapons.json', () => {
    const weapons = weaponsData as any[];
    const knownIds = new Set(weapons.map(w => w.unique_name));
    const activeEntries = Object.keys(override).filter(k => !k.startsWith('_'));

    for (const key of activeEntries) {
      expect(knownIds.has(key), `unique_name no encontrado en weapons.json: ${key}`).toBe(true);
    }
  });

  it('todas las entradas activas tienen al menos un ataque en attacks{}', () => {
    const activeEntries = Object.entries(override).filter(([k]) => !k.startsWith('_'));
    for (const [key, val] of activeEntries) {
      expect(
        val.attacks && Object.keys(val.attacks).length > 0,
        `entrada sin attacks{}: ${key}`
      ).toBe(true);
    }
  });

  it('todos los valores de multishot en attacks son números positivos', () => {
    const activeEntries = Object.entries(override).filter(([k]) => !k.startsWith('_'));
    for (const [key, val] of activeEntries) {
      for (const [attackName, attackVal] of Object.entries(val.attacks as Record<string, any>)) {
        if (attackVal.multishot !== undefined) {
          expect(
            typeof attackVal.multishot === 'number' && attackVal.multishot > 0,
            `multishot inválido en ${key} → ${attackName}: ${attackVal.multishot}`
          ).toBe(true);
        }
      }
    }
  });

  it('los nombres de ataque en el override existen en el arma correspondiente en weapons.json', () => {
    const weapons = weaponsData as any[];
    const byId = new Map(weapons.map(w => [w.unique_name, w]));
    const activeEntries = Object.entries(override).filter(([k]) => !k.startsWith('_'));

    for (const [key, val] of activeEntries) {
      const weapon = byId.get(key);
      if (!weapon) continue;
      const knownAttackNames = new Set((weapon.stats?.attacks ?? []).map((a: any) => a.name));
      for (const attackName of Object.keys(val.attacks)) {
        expect(
          knownAttackNames.has(attackName),
          `attack name "${attackName}" no existe en ${val._name ?? key}`
        ).toBe(true);
      }
    }
  });
});
