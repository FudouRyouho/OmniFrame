/**
 * El enemigo como PARTICIPANTE de C1 — la mitad de "C1 compone, C2 realiza" que nunca se construyó.
 *
 * Hasta acá el objetivo existía sólo en C2 (`EnemyState`, `ScaledEnemy`) y en A2 como parámetros
 * sueltos (`targetLevel`/`targetFaction`). No era una entidad: no tenía nodos, así que **ninguna
 * fuente declarada podía componer sobre él**. Un armor strip de habilidad (Abating Link −60%,
 * Plunder) no tenía dónde aterrizar, y por eso la pregunta *"¿cómo compone un strip declarado con
 * N stacks de Corrosive?"* no tenía respuesta posible — faltaba el frame-0.
 *
 * Lo que estos tests fijan es el frame-0: el objetivo entra al espacio por `environment` (A2, "contra
 * qué comparo"), materializa sus tres stats vitales bajo la familia `ENEMY_*`, y **no recibe lo que
 * no le corresponde**. La evolución temporal sigue siendo de C2 y no se toca acá
 * (`.working/enemy-node-law-frontier.md`).
 *
 * Valores verificados con `npm run oracle -- nodes <build>` ANTES de asertar.
 */
import { loadEngineData } from '../bootstrap/engine-data';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { describe, it, expect } from 'vitest';
import { consume } from '../output/consume';
import {
  valkyrWarcryTarget, valkyrWarcryCompanion, corrosiveProjectionTarget, rhinoRoarTarget,
  BOMBARD, VALKYR,
} from '../fixtures/builds';

await loadEngineData(new NodeAdapter());

const target = (b = valkyrWarcryTarget()) => consume(b, { flags: {} }).weapon(BOMBARD);

// ─── El objetivo existe ────────────────────────────────────────────────────────────

describe('Enemigo — la entidad', () => {
  it('entra al espacio declarado en `environment`, no equipado en `items`', () => {
    expect(consume(valkyrWarcryCompanion(), { flags: {} }).snapshot()).toHaveLength(3);
    expect(consume(valkyrWarcryTarget(),    { flags: {} }).snapshot()).toHaveLength(4);
  });

  it('materializa sus stats vitales bajo la familia ENEMY_*', () => {
    expect(target().node('ENEMY_ADD_HEALTH_MAX').base).toBe(300);
    expect(target().node('ENEMY_ADD_ARMOUR').base).toBe(500);
    expect(target().node('ENEMY_ADD_SHIELD_MAX').base).toBe(0);
  });

  it('no porta taxonomía de arsenal — un enemigo no es un ítem que se equipa', () => {
    const enemy = consume(valkyrWarcryTarget(), { flags: {} })
      .snapshot().find(e => e.id === BOMBARD)!;
    expect(enemy.domain).toBeUndefined();
    expect(enemy.kind).toBeUndefined();
    expect(enemy.tags).toContain('enemy');
  });
});

// ─── Lo que el objetivo NO recibe ──────────────────────────────────────────────────

describe('Enemigo — el buff del jugador no se filtra', () => {
  it('Warcry sube la armadura del warframe y no toca la del enemigo', () => {
    const wf = consume(valkyrWarcryTarget(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').final).toBe(1282.5);   // 855 × 1.5
    expect(target().node('ENEMY_ADD_ARMOUR').final).toBe(500); // intacta
  });

  /**
   * El caso que prueba que la MARCA es lo que separa, no la ausencia de nodo.
   *
   * `createBaseEntity` siembra los pools de daño global en toda entidad que no sea warframe
   * (`!isWarframe`), así que el enemigo materializa `GAMEPLAY_MULT_FACTION_DAMAGE` igual que un arma
   * — un nodo que no le corresponde. Roar buffea ese pool con ALL-scope y aun así no lo alcanza,
   * porque `FAMILY_ROUTE['GAMEPLAY']` pide la marca `weapon` y el enemigo entra con `enemy`.
   *
   * O sea: hoy el nodo falso está **desactivado por el ruteo**, no ausente. Es exactamente el "ruteo
   * por ausencia" contra el que advierte `channel-routing.ts` — dos entidades materializando el mismo
   * token — sólo que resuelto del lado correcto por accidente afortunado.
   */
  it('Roar no alcanza el pool de daño del enemigo, aunque el enemigo materialice ese nodo', () => {
    const enemy = consume(rhinoRoarTarget(), { flags: {} }).weapon(BOMBARD);
    expect(enemy.node('GAMEPLAY_MULT_FACTION_DAMAGE').multiplicative).toBe(1);
  });

  it.todo('el enemigo no debería materializar WEAPON_ADD_DAMAGE ni el pool de facción');
});

// ─── El debuff cross-entity: hasta dónde llega hoy ─────────────────────────────────

describe('Corrosive Projection — el debuff que sale del warframe hacia el enemigo', () => {
  /**
   * Lo que YA se corrigió y es un bug real de dato, no del motor.
   *
   * El raw de DE tokeniza Corrosive Projection como `AVATAR_ARMOUR` y el override lo copiaba como
   * `AVATAR_ADD_ARMOUR` — la única familia de armadura que existía. Efecto medido: con Warcry (+50%)
   * y el aura equipada, el warframe resolvía `mods_add_pct: 32` (50 − 18). **Un debuff al enemigo
   * le estaba restando armadura al jugador**, en silencio y por años, porque no había familia donde
   * ponerlo. Que el token exista es lo que permite escribirlo bien.
   */
  it('ya no le resta armadura al warframe que la porta', () => {
    const wf = consume(corrosiveProjectionTarget(), { flags: {} }).weapon(VALKYR);
    expect(wf.node('AVATAR_ADD_ARMOUR').mods_add_pct).toBe(50);  // sólo Warcry
    expect(wf.node('AVATAR_ADD_ARMOUR').final).toBe(1282.5);
  });

  /**
   * LA RUPTURA — el modifier se queda donde nació.
   *
   * `ModRepository.getModifiers(mod_id, dna.entity_id, ...)` hornea el portador como `target_entity`,
   * y la pasada de ruteo de `StaticHydrator` sólo lo mueve bajo **una condición hardcodeada**:
   * `holder.domain === 'weapon' && token.startsWith('AVATAR_')` — el parche de Amalgam Serration y
   * Dispatch Overdrive. Corrosive Projection no matchea (portador warframe, token `ENEMY_*`), así
   * que cae al `routed.push(m)` y muere en el warframe, que no tiene ese nodo.
   *
   * El motor lo grita, que es lo correcto:
   *   `[Hydration] Token conocido sin nodo: ENEMY_ADD_ARMOUR en .../Berserker`
   *
   * No es un gap de modelado: el nodo destino EXISTE y el valor es conocido. Es que el ruteo
   * cross-entity de mods está escrito como caso especial en vez de como regla.
   */
  it('hoy NO aterriza en el enemigo — el ruteo cross-entity de mods es un caso especial', () => {
    expect(target(corrosiveProjectionTarget()).node('ENEMY_ADD_ARMOUR').mods_add_pct).toBe(0);
  });

  // Objetivo: 500 × (1 − 0.18) = 410. Gated por la regla de ruteo, no por el dato ni por el nodo.
  it.todo('−18% de armadura al enemigo: 500 → 410');
});
