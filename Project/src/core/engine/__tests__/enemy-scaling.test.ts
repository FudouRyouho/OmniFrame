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

// Fase 1: el enemigo entra por el pipeline "0" (enemies.json normalizado), no por fixture a mano.
await loadEngineData(new NodeAdapter());
const ARID_BUTCHER = EnemyRepository.find('/Lotus/Types/Enemies/Grineer/Desert/Avatars/BladeSawmanAvatar')!;

describe('Enemy scaling — HEALTH (validado contra el calculador del wiki)', () => {
  it('el enemigo se cargó desde el pipeline (no fixture): Arid Butcher existe con stats @wfcd', () => {
    expect(ARID_BUTCHER).toBeTruthy();
    expect(ARID_BUTCHER.health).toBe(50);
    expect(ARID_BUTCHER.armor).toBe(5);
    expect(ARID_BUTCHER.faction).toBe('Grineer');
    expect(ARID_BUTCHER.base_level).toBe(1); // seam: override ?? 1
  });

  it('nivel base (1) → sin escalar: 50 hp', () => {
    expect(EnemyRepository.scale(ARID_BUTCHER, 1).current_health).toBeCloseTo(50, 0);
  });

  it('Grineer región Δx<70 (@50): health ≈ 2922.6', () => {
    expect(EnemyRepository.scale(ARID_BUTCHER, 50).current_health).toBeCloseTo(2922.6, 0);
  });

  it('Grineer región Δx>80 (@215): health = 25612.1 (= calculador wiki 25.612,14; el stub daba ~34.400)', () => {
    expect(EnemyRepository.scale(ARID_BUTCHER, 215).current_health).toBeCloseTo(25612.1, 0);
  });

  it('la facción elige el coeficiente: Corpus @215 ≠ Grineer @215', () => {
    const corpus = { ...ARID_BUTCHER, faction: 'Corpus' };
    const g = EnemyRepository.scale(ARID_BUTCHER, 215).current_health;
    const c = EnemyRepository.scale(corpus, 215).current_health;
    expect(c).not.toBeCloseTo(g, 0);
    expect(g).toBeCloseTo(25612.1, 0);
  });
});

describe('Enemy scaling — ARMOR + DR + EHP (validados contra el calculador del wiki)', () => {
  it('el floor min-200 aplica SIEMPRE (armor>0): @1 el base 5 → 200 (el 5 es nominal)', () => {
    expect(EnemyRepository.scale(ARID_BUTCHER, 1).current_armor).toBe(200);
  });

  it('@215: armor = 200 (escala a 116 → floor min-200), = calculador wiki', () => {
    expect(EnemyRepository.scale(ARID_BUTCHER, 215).current_armor).toBe(200);
  });

  it('@215: DR = 24.49% (√(3·200)/100, NO armor/(armor+300)), = calculador wiki', () => {
    const armor = EnemyRepository.scale(ARID_BUTCHER, 215).current_armor;
    expect(damageReductionFromArmor(armor)).toBeCloseTo(0.2449, 4);
  });

  it('@215: EHP = 33.918,87 (health/(1−DR); wiki redondea DR a 4 dec), = calculador wiki', () => {
    const s = EnemyRepository.scale(ARID_BUTCHER, 215);
    const dr = Math.round(damageReductionFromArmor(s.current_armor) * 10000) / 10000; // como el gadget
    const ehp = s.current_health / (1 - dr) + s.current_shields;
    expect(ehp).toBeCloseTo(33918.87, 0);
  });
});
