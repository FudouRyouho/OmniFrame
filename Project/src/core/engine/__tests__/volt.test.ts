/**
 * Volt Speed — 2ª habilidad que el motor consume por HIDRATACIÓN REAL (la 1ª fue Roar).
 *
 * Lo que agrega respecto a Roar (`rhino.test.ts` Fase 1b):
 *   - el destino NO es un pool de daño sino un nodo de **utilidad** del arma
 *     (`WEAPON_ADD_RELOAD_SPEED`, base 100) que ya estaba materializado;
 *   - el token `$$` se resuelve **por sintaxis** (`resolveToken`: WEAPON + ADD → op `ADD`),
 *     sin entrada propia en `UPGRADE_MAP`;
 *   - **cero código nuevo**: sólo la anotación `$$WEAPON_ADD_RELOAD_SPEED` en
 *     `references/game-ui/Volt.md`. Es la prueba de que el pipeline
 *     `.md → parser → override → AbilityRepository → grafo` cierra solo.
 *
 * Fidelidad (`references/wiki/abilities/Volt/Speed/Speed.md`): el buff de reload
 * **stackea ADITIVAMENTE** con los mods de reload — la wiki lo declara con ejemplo:
 * `Speed(25%) × Intensify(1.3) + Quickdraw(48%)`. Por eso aterriza en `mods_add_pct`,
 * junto a los mods, y no en un bucket propio.
 *
 * Valores verificados con `npm run oracle -- nodes volt_speed` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import { volt, voltSpeed, VOLT, TIBERON_PRIME } from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const reloadOf = (intention: ReturnType<typeof volt>) =>
  consume(intention, { flags: {} }).weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED');

describe('Volt Speed — buff cross-entity a un nodo de utilidad del arma', () => {
  it('baseline: sin la ability, el nodo de reload queda en su base (no-op)', () => {
    const reload = reloadOf(volt());
    expect(reload.base).toBe(100);
    expect(reload.mods_add_pct).toBe(0);
    expect(reload.final).toBe(100);
  });

  it('con Speed (strength 100%): +25% de reload — el valor de la carta, sin amplificar', () => {
    const reload = reloadOf(voltSpeed());
    expect(reload.mods_add_pct).toBeCloseTo(25, 5);   // 25 × (100/100)
    expect(reload.final).toBeCloseTo(125, 5);         // 100 × (1 + 0.25)
  });

  // El escalado por Ability Strength lo hace el GRAFO (arista `source_attribute` →
  // AVATAR_ADD_ABILITY_STRENGTH), no el hidratador: mismo mecanismo que Roar.
  it('con Speed + Blind Rage (strength 199%): +49.75% = 25 × 1.99', () => {
    const build = voltSpeed({ strength: true });
    const out = consume(build, { flags: {} });
    // el strength vive en el WARFRAME (source de la arista); el reload, en el ARMA (target)
    expect(out.weapon(VOLT).node('AVATAR_ADD_ABILITY_STRENGTH').final).toBeCloseTo(199, 5);
    const reload = out.weapon(TIBERON_PRIME).node('WEAPON_ADD_RELOAD_SPEED');
    expect(reload.mods_add_pct).toBeCloseTo(49.75, 5);
    expect(reload.final).toBeCloseTo(149.75, 5);
  });

  it('aislamiento: quitar la ability de la intención devuelve el nodo a su base', () => {
    const sinSpeed = voltSpeed();
    delete sinSpeed.items.warframe.abilities;
    expect(reloadOf(sinSpeed).final).toBe(100);
  });
});

// ─── Borde — los otros dos efectos de Speed, bloqueados por nodo inexistente ────────
//
// La wiki da los tres buffs de Speed (rank 3): Movement Speed 75%, Melee Attack Speed 75%,
// Reload Speed 25% — los tres `× Ability Strength` y los tres ADITIVOS con los mods del
// stat correspondiente. Sólo el de reload es modelable hoy: su nodo existe.
//
// Estado de los otros dos destinos (verificado en `ItemRepository.normalizeWarframe` y
// `shared/types/modifier.ts`):
//   - MOVEMENT/SPRINT SPEED → el TOKEN existe (`AVATAR_ADD_MOVEMENT_SPEED`,
//     `AVATAR_ADD_SPRINT_SPEED`) y hay dato base (`warframes.json` → `sprint_speed`),
//     pero el NODO no se materializa. Segundo consumidor real: Wisp Reservoirs [HASTE MOTE].
//   - MELEE ATTACK SPEED → no existe ni el token: es decisión de vocabulario, previa.

describe('Volt Speed — borde (efectos sin nodo destino)', () => {
  it.todo('movement speed +75% × str — materializar AVATAR_ADD_MOVEMENT_SPEED (2 consumidores: Speed + Reservoirs)');
  it.todo('melee attack speed +75% × str — el token no existe: decisión de vocabulario primero');
  // Cap asimétrico (wiki): el movement speed capea a 150% para ALIADOS y no capea para
  // el propio Volt. Depende de quién recibe, no de la fuente — eje distinto a los caps
  // por-fuente (Icy Avalanche, Recompense). No bloquea el buff de reload.
  it.todo('cap de movement speed 150% sólo para aliados (no para el caster)');
});
