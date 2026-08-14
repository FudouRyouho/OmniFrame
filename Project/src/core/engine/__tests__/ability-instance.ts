/**
 * EL EMISOR DECLARADO — el gemelo de `hostile-entity.ts` del lado source.
 *
 * `makeIsolatedTarget` existe porque *"un test de ley que dependiera del dato del juego se rompería
 * cuando ese dato cambie, y acá lo que se ejerce es el behavior, no el enemigo"*. Del lado emisor no
 * había equivalente: **toda instancia salía de una build real**, así que para ejercer una ley había
 * que elegir un arma concreta y heredar sus números — y peor, `deriveInstance` filtra por
 * `isWeaponDamageToken`, o sea que lo que no es arma no puede emitir nada.
 *
 * ─── QUÉ FABRICA Y QUÉ NO ─────────────────────────────────────────────────────────────────────────
 *
 * **Fabrica el input, no la ley.** Devuelve un `DamageInstance` —el contrato real del seam C1→C2, no
 * un gemelo— y ahí se termina: la población de procs (`expectedProcEvents`), el mapeo tipo→efecto
 * (`effectOfDamageType`), la combinación elemental (`describeAbilityStatus`) y la aplicación
 * (`applyProc`) son las de producción y el test las llama. Es la misma línea que sostiene al harness
 * del receptor: `makeIsolatedTarget` declara `stacks: { corrosion: 5 }` y no simula cinco procs.
 *
 * **Y el tipo lo fuerza el compilador:** si `DamageInstance` gana un campo, esto no compila. Un
 * proto-objeto paralelo se habría separado en silencio.
 *
 * ─── EL EJE QUE EL TEST DECLARA ───────────────────────────────────────────────────────────────────
 *
 * La estructura la trae el dato real —Fireball es *"un proyectil que hace `<DT_HEAT> 400-800` y escala
 * con `AVATAR_ABILITY_STRENGTH`"*, o sea tipo, magnitud y escalado— y lo que el test declara es **el
 * eje que ejerce**: mismo emisor base, distinto estado por instancia. Es el mismo movimiento que
 * `lanka('charged_shot')`, donde el dato trae los perfiles y el test elige cuál correr.
 *
 * ⚠️ **El label NO es la fuente de composición** (`arch-decisions §15`, la regla es por verbo). Que
 * Fireball sea mono-tipo hace que su instancia casi no necesite fórmula propia; una habilidad
 * multi-verbo (daño + defense reduction + slow en el mismo cast) no se deriva de su renglón de UI.
 * Acá se toma **la forma**, no el renglón.
 */
import type { DamageInstance } from "../simulate/combat/damage-instance";
import type { HitContext } from "../formulas/status/effect-behavior";
import type { EmitterDeviations } from "../contracts/law-params";
import { damageTokenFromType } from "../contracts/damage-logic";
import type { DamageType } from "@shared/types";

export interface AbilityInstanceSpec {
  /**
   * El daño por tipo — **el eje que el test declara**. Fireball trae Heat; que una instancia lleve
   * Corrosive en su lugar es la variación que este banco existe para expresar, y no exige inventar
   * una habilidad: es la misma forma con otro tipo.
   */
  damageByType: Partial<Record<DamageType, number>>;
  /**
   * 0..1. Default **1**: una habilidad que aplica estado lo aplica garantizado
   * (`AbilityProcBehavior.guaranteed`), a diferencia de un arma que tira los dados. El `"none"` de esa
   * misma unión se expresa acá con `0` — y ése es el caso que hoy no se prueba en ningún lado: emitir
   * daño y **no** proquear.
   */
  statusChance?: number;
  /** Desvíos de ley del emisor. Ausente = calla, que no es declarar 0 (`vocabulary.md §6`). */
  lawDeviations?: EmitterDeviations;
  critChance?: number;
  critMult?: number;
  statusDamageBonusPct?: number;
}

/**
 * La instancia que emite una habilidad, declarada.
 *
 * `damageByToken` se deriva de `damageByType` por la tabla canónica (`damageTokenFromType`) en vez de
 * escribirse a mano: son la misma información en dos llaves, y dejarlas escribir por separado permite
 * que un test declare un par incoherente que ninguna build real podría producir.
 *
 * ⚠️ **`dotModdedBase` = `moddedBase`, y es una simplificación con dueño.** En un arma los dos
 * difieren porque el DoT escala con el base innato × Serration y **no** con el compuesto
 * (`ingame-tests/dot-scaling.md`); una habilidad no tiene `dot_scaling` —ni mods de elemento que
 * descontar— así que hoy coinciden. Si aparece el equivalente para habilidades (Ability Strength sobre
 * el tick), esta línea es donde se nota.
 *
 * 🔴 **Y expone un hueco de vocabulario que este banco no inventa: el token de daño dice `WEAPON_`.**
 * `damageTokenFromType('heat')` da `WEAPON_ADD_HEAT_DAMAGE`, así que una habilidad emite su daño con
 * tokens de arma. No se corrige acá —sería compensar dato en el consumidor— y no bloquea: el motor
 * rutea el daño por **tipo**, y el token es la llave con la que ese tipo viaja. Pero es el mismo sesgo
 * preexistente que `channel-routing` ya tenía (`GAMEPLAY_ → weapon`), visto desde el otro lado, y
 * ahora tiene un segundo emisor que lo hace visible en vez de teórico. Anclado en
 * `ability-emission.test.ts`.
 */
export function abilityInstance(spec: AbilityInstanceSpec): DamageInstance {
  const damageByToken: Record<string, number> = {};
  for (const [type, value] of Object.entries(spec.damageByType) as Array<[DamageType, number]>) {
    damageByToken[damageTokenFromType(type)] = value;
  }
  const moddedBase = Object.values(spec.damageByType).reduce((sum, v) => sum + (v ?? 0), 0);

  return {
    damageByToken,
    damageByType: spec.damageByType,
    moddedBase,
    dotModdedBase: moddedBase,
    ownElementBonusPct: {},
    critChance: spec.critChance ?? 0,
    critMult: spec.critMult ?? 1,
    statusChance: spec.statusChance ?? 1,
    statusDamageBonusPct: spec.statusDamageBonusPct ?? 0,
    multishot: 1,
    ...(spec.lawDeviations ? { lawDeviations: spec.lawDeviations } : {}),
  };
}

/**
 * El contexto del hit desde la instancia — **copiado de `TimelineSimulator`, no reinventado**.
 *
 * Que el arma y la habilidad armen su `HitContext` igual es el punto: si divergieran, el sample
 * probaría un camino que la producción no tiene. El día que esta derivación se extraiga a producción
 * (`deriveInstance` es su hermana), este helper se reemplaza por ella — no se conserva como gemelo.
 */
export function hitContextOf(instance: DamageInstance): HitContext {
  return {
    moddedBase: instance.dotModdedBase,
    statusDamageBonusPct: instance.statusDamageBonusPct,
    elementBonusPct: instance.ownElementBonusPct,
    ...(instance.lawDeviations ? { lawDeviations: instance.lawDeviations } : {}),
  };
}
