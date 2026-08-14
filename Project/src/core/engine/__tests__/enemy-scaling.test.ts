/**
 * Enemy level scaling — CONTRASTE #0 (primer ladrillo del eje enemigo).
 *
 * Ancla: el **calculador del wiki** (por-enemigo) — el juego NO muestra HP numérico, así que el
 * calculador es el oráculo práctico. Fórmulas en `references/wiki/mechanics/enemy-level-scaling.md`.
 *
 * Estado (2026-07-06): los 4 campos del panel del calculador reproducidos EXACTO para Arid Butcher
 * @215 — health 25.612,14 · armor 200 (escala 116 → floor min-200) · DR 24,49% · EHP 33.918,87. La
 * lógica salió del gadget del wiki (`references/temp/ext.gadget.enemyinfoboxslider-script-0.js`).
 * Sentencia el stub cuadrático previo (~34.400 / ~295 @215).
 *
 * ⚠️ La **DR** (`√3a/100`) es PROVISIONAL — `OQ-ENGINE-15` (conflicto de 3 vías en la wiki). El #0
 * valida que el engine reproduce el CALCULADOR; que el calculador = el juego se confirma en el #1 (popup).
 */
import { describe, it, expect } from 'vitest';
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { EnemyRepository } from '../simulate/enemies/EnemyRepository';
import { damageReductionFromArmor } from '../formulas/enemy/armor-mitigation';
import { scaleHealth } from '../formulas/enemy/enemy-scaling';
import { hostileEntity } from './hostile-entity';
import { vitalsOf } from '../simulate/EntityState';

/**
 * Los vitales de un enemigo del catálogo a un nivel dado, POR EL CAMINO VIVO: se declara un escenario
 * con ese hostil y se leen los nodos que C1 resolvió. Antes esto llamaba a `EnemyRepository.scale`,
 * un orquestador paralelo que el motor ya no usa — un test que siguiera midiéndolo estaría validando
 * un camino muerto y podría quedar verde mientras el camino real se rompe.
 */
const vitalsAt = (uniqueName: string, level: number) => vitalsOf(hostileEntity(uniqueName, level));

// Fase 1: el enemigo entra por el pipeline "0" (enemies.json normalizado), no por fixture a mano.
await loadEngineData(new NodeAdapter());
const ARID_BUTCHER = '/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar';
const aridDna = EnemyRepository.find(ARID_BUTCHER)!;

describe('Enemy scaling — HEALTH (validado contra el calculador del wiki)', () => {
  it('el enemigo se cargó desde el pipeline (no fixture): Arid Butcher existe con stats @wfcd', () => {
    expect(aridDna).toBeTruthy();
    expect(aridDna.health).toBe(50);
    expect(aridDna.armor).toBe(5);
    expect(aridDna.faction).toBe('Grineer');
    expect(aridDna.base_level).toBe(1); // ya viene en el dato (cosecha wiki), no del seam
  });

  it('nivel base (1) → sin escalar: 50 hp', () => {
    expect(vitalsAt(ARID_BUTCHER, 1).health).toBeCloseTo(50, 0);
  });

  it('Grineer región Δx<70 (@50): health ≈ 2922.6', () => {
    expect(vitalsAt(ARID_BUTCHER, 50).health).toBeCloseTo(2922.6, 0);
  });

  it('Grineer región Δx>80 (@215): health = 25612.1 (= calculador wiki 25.612,14; el stub daba ~34.400)', () => {
    expect(vitalsAt(ARID_BUTCHER, 215).health).toBeCloseTo(25612.1, 0);
  });

  // Este va contra la PRIMITIVA y no contra el camino vivo, a propósito: fabrica un Arid Butcher
  // "Corpus" que no existe en el catálogo, y lo que ejerce es la FÓRMULA (qué coeficiente elige la
  // facción), no la composición del participante. Forzarlo por el escenario sería pedirle al catálogo
  // un enemigo inventado.
  it('la facción elige el coeficiente: Corpus @215 ≠ Grineer @215', () => {
    const dx = 215 - aridDna.base_level;
    const g = scaleHealth(aridDna.health, 'Grineer', dx);
    const c = scaleHealth(aridDna.health, 'Corpus', dx);
    expect(c).not.toBeCloseTo(g, 0);
    expect(g).toBeCloseTo(25612.1, 0);
    // …y el camino vivo llega al MISMO número que la primitiva: la composición no agrega ni pierde nada.
    expect(vitalsAt(ARID_BUTCHER, 215).health).toBeCloseTo(g, 6);
  });
});

describe('Enemy scaling — ARMOR + DR + EHP (validados contra el calculador del wiki)', () => {
  it('el floor min-200 aplica SIEMPRE (armor>0): @1 el base 5 → 200 (el 5 es nominal)', () => {
    expect(vitalsAt(ARID_BUTCHER, 1).armor).toBe(200);
  });

  it('@215: armor = 200 (escala a 116 → floor min-200), = calculador wiki', () => {
    expect(vitalsAt(ARID_BUTCHER, 215).armor).toBe(200);
  });

  it('@215: DR = 24.49% (√(3·200)/100, NO armor/(armor+300)), = calculador wiki', () => {
    const armor = vitalsAt(ARID_BUTCHER, 215).armor;
    expect(damageReductionFromArmor(armor)).toBeCloseTo(0.2449, 4);
  });

  it('@215: EHP = 33.918,87 (health/(1−DR); wiki redondea DR a 4 dec), = calculador wiki', () => {
    const s = vitalsAt(ARID_BUTCHER, 215);
    const dr = Math.round(damageReductionFromArmor(s.armor) * 10000) / 10000; // como el gadget
    const ehp = s.health / (1 - dr) + s.shields;
    expect(ehp).toBeCloseTo(33918.87, 0);
  });
});

describe('Enemy scaling — SHIELDS (gap cerrado 2026-07-09; fórmula de enemy-level-scaling.md §Shields)', () => {
  // Arid Butcher tiene shields=0 — no ejercita este eje. Se eligen enemigos shield-dominant,
  // no-boss, health/armor triviales para AISLAR el eje (precedente Doc2: "exponer gaps, no esconderlos").
  const ELITE_CREWMAN = '/Lotus/Types/Enemies/Corpus/Spaceman/EliteSpacemanAvatar';
  const TUSK_CARABUS = '/Lotus/Types/Enemies/Grineer/Eidolon/Vip/Avatars/EidolonVipGruntDroneAvatar';
  const eliteDna = EnemyRepository.find(ELITE_CREWMAN)!;
  const tuskDna = EnemyRepository.find(TUSK_CARABUS)!;

  it('el pipeline trae ambos fixtures con shields>0, health/armor triviales', () => {
    expect(eliteDna).toBeTruthy();
    expect(eliteDna.shields).toBe(200);
    expect(eliteDna.faction).toBe('Corpus');
    expect(tuskDna).toBeTruthy();
    expect(tuskDna.shields).toBe(50);
    expect(tuskDna.faction).toBe('Grineer');
  });

  it('nivel base → sin escalar (mult=1)', () => {
    expect(vitalsAt(ELITE_CREWMAN, 1).shields).toBeCloseTo(200, 0);
  });

  it('Corpus Δx<70 (@51): shields ≈ 4110.63 (coef 0.02/1.76)', () => {
    expect(vitalsAt(ELITE_CREWMAN, 51).shields).toBeCloseTo(4110.63, 1);
  });

  it('Corpus Δx>80 (@151): shields ≈ 18225.58 (coef 2/0.76)', () => {
    expect(vitalsAt(ELITE_CREWMAN, 151).shields).toBeCloseTo(18225.58, 1);
  });

  it('Grineer Δx<70 (@51): shields ≈ 990.15 (coef 0.02/1.75, distinto de Corpus)', () => {
    expect(vitalsAt(TUSK_CARABUS, 51).shields).toBeCloseTo(990.15, 1);
  });

  it('Grineer Δx>80 (@151): shields ≈ 3478.93 (coef 1.6/0.75 — crece más lento que Corpus)', () => {
    expect(vitalsAt(TUSK_CARABUS, 151).shields).toBeCloseTo(3478.93, 1);
  });

  it('sin floor/cap (a diferencia de armor): un shield bajo no se pisa a un mínimo', () => {
    // Security Camera: shields=10, sin equivalente al floor-200 de armor.
    const cam = '/Lotus/Types/Enemies/Corpus/Turrets/TurretAvatars/SecurityCameraAvatar';
    expect(vitalsAt(cam, 1).shields).toBeCloseTo(10, 0);
  });
});
