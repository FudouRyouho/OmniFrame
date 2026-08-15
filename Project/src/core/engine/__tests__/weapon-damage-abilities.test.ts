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
import { readFileSync } from 'node:fs';
import { NodeAdapter } from '@shared/data/adapters/NodeAdapter';
import { WEAPON_DAMAGE_ABILITIES, isWeaponDamageAbility } from '../contracts/emitter-class';

const overrides = (await new NodeAdapter().read('ability-stats.override')) as Record<string, { name?: string }>;

/**
 * Los warframes que la tabla de la fuente enumera — leídos del `.md`, no transcritos.
 *
 * Se ancla al **header de la tabla**, no a la sección: la sección puede ganar prosa y otras tablas
 * (ya pasó — la marca de discrepancia agregó una), y anclar al `##` contaba filas ajenas.
 */
const warframesEnLaFuente = (): string[] => {
  const md = readFileSync('../references/wiki/mechanics/universal-weapon-bonuses.md', 'utf8');
  const desdeHeader = md.split(/^\| Warframe \| Habilidad \|.*$/m)[1] ?? '';
  const nombres = desdeHeader
    .split(/^(?!\|)/m)[0]                       // hasta la primera línea que no sea de tabla
    .split('\n')
    .filter((l) => l.startsWith('| ') && !l.includes('---'))
    .map((l) => l.split('|')[1]?.trim())
    .filter((n): n is string => Boolean(n));
  return [...new Set(nombres)];
};

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
   * ⚠️ **LA DIRECCIÓN QUE FALTABA — y que dejó pasar un miss.**
   *
   * Los tests de arriba verifican que *lo declarado existe en el catálogo*. Ninguno verificaba que *lo
   * que la fuente enumera esté declarado*, así que **Uriel se omitió en silencio** en el primer pase:
   * la lista compilaba, resolvía y pasaba los tres tests, con un warframe menos.
   *
   * Una lista importada tiene dos modos de falla, no uno — sobra (entrada muerta) y **falta** (fuente
   * que creció). Éste cubre el segundo: si la wiki agrega un warframe a la tabla, el conteo se mueve y
   * hay que mirarlo. No compara ids porque el `unique_name` no dice de qué warframe es
   * (`DemonFrameCloneAbility` no menciona a Uriel), y derivarlo sería la misma inferencia que esta
   * campaña viene sacando del engine.
   */
  it('la tabla de la fuente no creció sin que lo miráramos', () => {
    const warframes = warframesEnLaFuente();
    // 23 al 2026-08-14. Todos declarados salvo Sirius, que el catálogo todavía no trae.
    expect(warframes.length).toBe(23);
    expect(warframes).toContain('Uriel');
    expect(warframes).toContain('Sirius');
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
