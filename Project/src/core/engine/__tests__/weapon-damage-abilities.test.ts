/**
 * LA MARCA DEL EMISOR, VERIFICADA CONTRA EL CATÁLOGO — `contracts/emitter-class.ts`.
 *
 * `WEAPON_DAMAGE_ABILITIES` es **dato importado de la fuente**, no una regla derivada: la wiki enumera
 * qué habilidades trata el juego como armas, y su propio texto desmiente el criterio que insinúa
 * (*"usually projectile-based"* contra una tabla que incluye campos persistentes).
 *
 * Una lista importada tiene un modo de falla propio: **envejece en silencio**. Si DE renombra el path
 * de una habilidad o el catálogo se actualiza, la entrada deja de matchear y la marca simplemente no
 * aplica — sin error, sin warn, exactamente el modo de falla que esta campaña viene persiguiendo. Este
 * archivo es el consumidor que lo impide, y el mismo patrón que `curateEnemies` usa para `UNIT_CLASSES`.
 *
 * ⚠️ Lo que este test **no** hace es validar los stats de emisión (base damage, tipos, status, crit).
 * Esos viven en `references/wiki/mechanics/universal-weapon-bonuses.md` y entran al código cuando haya
 * una ley que los consuma — hoy `ability-instance.ts` declara los que su eje necesita.
 */
import { describe, it, expect } from 'vitest';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { WEAPON_DAMAGE_ABILITIES, isWeaponDamageAbility } from '../contracts/emitter-class';

const overrides = (await new NodeAdapter().read('ability-stats.override')) as Record<string, { name?: string }>;

describe('Weapon Damage Abilities — la marca contra el dato real', () => {
  it('cada `unique_name` declarado existe en el catálogo de habilidades', () => {
    const ausentes = WEAPON_DAMAGE_ABILITIES.filter((id) => !(id in overrides));
    expect(ausentes).toEqual([]);
  });

  it('cada entrada resuelve a una habilidad con nombre — no a un registro vacío', () => {
    const sinNombre = WEAPON_DAMAGE_ABILITIES.filter((id) => !overrides[id]?.name);
    expect(sinNombre).toEqual([]);
  });

  it('no hay duplicados: la lista es un conjunto', () => {
    expect(new Set(WEAPON_DAMAGE_ABILITIES).size).toBe(WEAPON_DAMAGE_ABILITIES.length);
  });

  /**
   * El nombre de la wiki es **display** y la clave del catálogo es el path de Lotus; casi nunca
   * coinciden. Ésta es la razón por la que la lista se resolvió contra el dato en vez de escribirse
   * de memoria, y el test la deja visible en vez de confiarla a un comentario.
   */
  it('la clave del catálogo no se deduce del nombre de la habilidad', () => {
    expect(overrides['/Lotus/Powersuits/PowersuitAbilities/GlaiveAbility']?.name).toBe('Shuriken');
    expect(overrides['/Lotus/Powersuits/PowersuitAbilities/ShieldRegenAbility']?.name).toBe('Polarize');
    expect(overrides['/Lotus/Powersuits/PowersuitAbilities/NezhaSashAbility']?.name).toBe('Warding Halo');
  });

  it('la pregunta es total: lo que no está en la lista no lleva la marca', () => {
    expect(isWeaponDamageAbility('/Lotus/Powersuits/PowersuitAbilities/FireBallAbility')).toBe(true);
    // Iron Skin existe y NO es weapon-damage: no emite instancia, muta un state.
    expect(isWeaponDamageAbility('/Lotus/Powersuits/PowersuitAbilities/IronSkinAbility')).toBe(false);
    expect(isWeaponDamageAbility(undefined)).toBe(false);
  });

  /**
   * 🔴 EL HUECO DECLARADO, ANCLADO EN VEZ DE COMENTADO.
   *
   * La wiki lista **Jade Stars (Sirius)** y el catálogo no la trae — el dataset de ítems está atrasado
   * a propósito (`OQ-DATA-16`). El día que el dato la incluya, este test empieza a fallar y avisa que
   * la entrada se puede agregar. Es la única forma de que un dato faltante haga ruido cuando deje de
   * faltar; anotado en un comentario, nadie volvería a mirarlo.
   */
  it.fails('Jade Stars (Sirius) ya está en el catálogo y puede entrar a la lista', () => {
    const sirius = Object.entries(overrides).filter(([, v]) => v?.name === 'Jade Stars');
    expect(sirius.length).toBeGreaterThan(0);
  });
});
