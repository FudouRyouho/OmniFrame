import type { SimulationEntity } from "../../contracts";
import type { StatusEffect } from "@shared/types";
import { EFFECT_BEHAVIORS } from "../../formulas/status/behaviors";
import type { EffectBehavior, HitContext, Layer, Resolucion } from "../../formulas/status/effect-behavior";
// NO importa `CombatSimulator`: el estado ya no invoca al resolvedor de lo que él mismo emite. La
// composición «avanzar → resolver → recibir» vive en `../advance.ts`, que es el dueño del bucle.
import { LAYER_STACK } from "../../contracts/layers";
import { PLAYER_VITAL_CHANNELS, byChannel, forChannels } from "../../contracts/unit-class";
import { gateLawFor } from "../../formulas/defense/shield-gate";
import { damageToDeplete, shieldDamageReductionFor } from "../../formulas/defense/shield-mitigation";

/**
 * EnemyState — estado dinámico de un enemigo durante la simulación temporal. **Modelo unificado de
 * proc** (`damage-status-model.md §Modelo unificado de proc`): un contenedor único `effectStates`
 * (Map por efecto, OPACO a core) + iteración sobre el registro `EFFECT_BEHAVIORS`. Core no conoce el
 * comportamiento de cada efecto — lo delega a su fórmula; solo itera. **Y ya no resuelve**: `advance`
 * devuelve las emisiones y quien es dueño del bucle las resuelve y se las devuelve por `receive`
 * (`../advance.ts`).
 *
 * EL ESTADO NACE DE LA FOTO DE t=0 (`simulation-architecture.md` §El escenario consolidado): recibe la
 * **entidad resuelta de C1**, no un objeto paralelo. Antes recibía un `ScaledEnemy` que C1 nunca vio, y
 * eso era medible — un debuff `ENEMY_*` compuesto en el escenario no llegaba al daño: C1 resolvía un
 * Bombard con armadura 2214 (Corrosive Projection) mientras C2 medía contra el enemigo del `--vs`.
 *
 * DEUDA DE NORTE (O1, decision-frontier.md) — CERRADA EN LA FORMA, NO EN EL VOCABULARIO: el ESTADO era
 * portado-por-entidad mientras la LEY (`formulas/status/`) ya era agnóstica a source/target. Lo que
 * amarraba este contenedor a "enemigo" era `base: ScaledEnemy`; de sus cuatro únicos usos
 * (health/shields/armor + facción) los cuatro estaban ya en la entidad resuelta, así que hoy la clase
 * no sabe de qué lado está su portador. El **rename** de la clase espera un segundo portador real
 * (`OQ-ENGINE-8`) — hoy sería vocabulario sin caso.
 */
/** Valor resuelto de un nodo, o 0 si el participante no lo tiene (sin shields, sin armadura). */
const nodeFinal = (entity: SimulationEntity, id: string): number => entity.attributes[id]?.final ?? 0;

export interface Vitals { health: number; armor: number; shields: number }

/**
 * Los tres vitales POR CLASE DE UNIDAD. Un participante no nombra sus vitales igual según de qué lado
 * esté: el hostil los lleva `ENEMY_*` y el avatar `AVATAR_*` — y son los mismos tres vitales, no stats
 * distintos. La clase la resuelve el **canal** que el espacio ya le puso, no la marca de ruteo:
 * `contracts/unit-class.ts` explica por qué son dos preguntas distintas. Un arma no figura, y es
 * correcto: no tiene vitales.
 *
 * **El compañero SÍ entra acá** —lleva los mismos `AVATAR_*` y el test lo fija (300 de armor base)—,
 * a diferencia de la mitigación, donde la fuente no dice qué ley le toca.
 */
const VITAL_TOKENS: Record<string, { health: string; armor: string; shields: string }> = {
  enemy: { health: "ENEMY_ADD_HEALTH_MAX", armor: "ENEMY_ADD_ARMOUR", shields: "ENEMY_ADD_SHIELD_MAX" },
  ...forChannels(PLAYER_VITAL_CHANNELS, {
    health: "AVATAR_ADD_HEALTH_MAX", armor: "AVATAR_ADD_ARMOUR", shields: "AVATAR_ADD_SHIELD_MAX",
  }),
};

/**
 * Los tres vitales de un participante, tal como el escenario los consolidó. SSoT de **qué nodos son
 * los vitales**: el estado los lee para arrancar y la salida los lee para presentar, y si cada uno
 * nombrara los suyos podrían divergir sin que nada lo note.
 *
 * Leía la familia `ENEMY_*` fija, y eso hacía que la neutralidad del contenedor fuera de forma y no de
 * vocabulario: un warframe —que declara `AVATAR_ADD_HEALTH_MAX`— devolvía `0/0/0` y nacía `isDead()`,
 * **en silencio**. Ahora una familia sin entrada **tira**: un participante que no puede portar vitales
 * no debe llegar acá, y si llega es un bug que tiene que sonar.
 */
export function vitalsOf(entity: SimulationEntity): Vitals {
  const t = byChannel(VITAL_TOKENS, entity.channel);
  if (!t) {
    throw new Error(
      `[estado] el participante "${entity.id}" (${entity.unique_name}) no declara ninguna clase con ` +
        `vitales — canal: ${entity.channel ?? "ninguno"}. Clases conocidas: ` +
        `${Object.keys(VITAL_TOKENS).join(", ")}.`,
    );
  }
  return {
    health:  nodeFinal(entity, t.health),
    armor:   nodeFinal(entity, t.armor),
    shields: nodeFinal(entity, t.shields),
  };
}

export class EnemyState {
  public current_health: number;
  public current_shields: number;
  /**
   * Las dos capas que la pila declara y que **todavía no tienen origen modelado** (`contracts/layers.ts`).
   * Existen con su número en cero porque lo que no existe no se puede componer: el Overguard nace de la
   * clase (Eximus) o de una habilidad (Iron Skin) y el Overshield de una restauración que excede el
   * máximo, y ninguno de esos tres caminos está construido. La LEY de cómo se consumen sí está.
   */
  public current_overguard = 0;
  public current_overshield = 0;
  /** Estado de proc por efecto — opaco a core (cada behavior modela su `S` distinto). */
  public effectStates: Map<StatusEffect, unknown>;

  /** El participante tal como el escenario lo consolidó. Reemplaza al `ScaledEnemy` paralelo. */
  public entity: SimulationEntity;

  /**
   * Armadura de la foto de t=0 — el piso sobre el que los efectos aplican su `armorMult`. Se congela
   * en el constructor y NO se relee: lo que compuso el escenario (mods, auras) es frame-0, y lo que
   * pasa DURANTE es de los efectos. Es la misma línea que `arch-decisions §19` traza entre las dos.
   */
  private readonly base_armor: number;

  constructor(entity: SimulationEntity) {
    this.entity = entity;
    const vitals = vitalsOf(entity);
    this.current_health  = vitals.health;
    this.current_shields = vitals.shields;
    this.base_armor      = vitals.armor;
    this.effectStates = new Map();
  }

  /**
   * Facción canónica del portador, para la matriz ③. Sale del campo de la entidad y no de `tags`:
   * ver `SimulationEntity.faction`. Vacía = sin bonus (`targetFactionMult` devuelve 1).
   */
  public get faction(): string {
    return this.entity.faction ?? "";
  }

  /** Aplica un proc de un efecto (o `amount` fraccional, EV). Rutea a su behavior; efecto sin modelar = no-op. */
  public applyProc(effect: StatusEffect, hit: HitContext, amount: number, currentTime: number = 0) {
    const behavior = EFFECT_BEHAVIORS[effect];
    if (!behavior) return;
    this.effectStates.set(effect, behavior.applyProc(this.effectStates.get(effect), hit, amount, currentTime));
  }

  /**
   * Avanza el estado en `[currentTime, +dt)` y **devuelve** lo que los efectos emitieron. No resuelve
   * ni escribe capas: eso lo hace quien es dueño del bucle (`simulate/advance.ts`).
   *
   * Antes esta misma función resolvía adentro, pasándose a sí misma al resolvedor —que a su vez la
   * volvía a leer para mitigar y elegir capa—. La causa y el efecto quedaban en el mismo lugar. Que
   * `advance` de un behavior ya devolviera `{state, damage}` mostraba la forma correcta desde abajo:
   * acá se extiende al contenedor.
   */
  public advance(currentTime: number, dt: number): Resolucion[] {
    const emitido: Resolucion[] = [];
    for (const [effect, behavior] of this.activeBehaviors()) {
      const { state, damage } = behavior.advance(this.effectStates.get(effect), currentTime, dt);
      this.effectStates.set(effect, state);
      emitido.push(...damage);
    }
    return emitido;
  }

  /**
   * Cuánto queda en cada capa — lo que `layerFor` necesita para elegir a quién le toca. Las capas sin
   * origen modelado valen 0 y por eso nunca son elegidas: existir no es lo mismo que participar.
   */
  public get layerAmounts(): Record<Layer, number> {
    return {
      overguard:  this.current_overguard,
      overshield: this.current_overshield,
      shield:     this.current_shields,
      health:     this.current_health,
    };
  }

  /**
   * Piso de la salud. El derrame y el corte viven en `receive`; esto sólo evita que el contenedor
   * arrastre un negativo que nadie declaró.
   *
   * ⚠️ **El derrame ya NO es "la ley del hostil"** —como decía este comentario hasta que se midió—:
   * los dos lados gatean, con mecánicas distintas. El jugador corta entero; el enemigo deja pasar el
   * 5% durante 0.1 s (`shield.md §El gate del enemigo es otra mecánica`). Lo que sigue faltando es el
   * gate del **Overguard**, que existe sólo del lado jugador (0.5 s) y no está implementado.
   */
  public clampVitals() {
    if (this.current_health < 0) this.current_health = 0;
  }

  /** Escribe una capa por su nombre. El espejo de `layerAmounts`, que sólo lee. */
  public setLayer(layer: Layer, value: number) {
    if (layer === "overguard")  this.current_overguard  = value;
    if (layer === "overshield") this.current_overshield = value;
    if (layer === "shield")     this.current_shields    = value;
    if (layer === "health")     this.current_health     = value;
  }

  /**
   * EL TERCER VERBO DE LA CAPA. Absorber y atravesar ya estaban; **cerrar** no: la capa se agota y
   * en vez de derramar el exceso, **abre una ventana** (`time-model.md §7`). Un gate no extiende la
   * salud —que es lo que las capas hacen—, la protege absolutamente, y por eso no entraba en el
   * modelo de derrame.
   *
   * Se implementa como LEY con parámetros resueltos por clase (`formulas/defense/shield-gate.ts`):
   * el jugador corta entero, el enemigo deja pasar el 5% durante 0.1 s. **No es el mismo gate con
   * otros números — la fuente los declara como mecánicas distintas.**
   */
  private gateUntil: number | null = null;

  /** ¿Hay ventana de gate abierta en `t`? Lectura por MUESTREO, no por evento (`§20`). */
  public isGated(currentTime: number): boolean {
    return this.gateUntil !== null && currentTime < this.gateUntil;
  }

  /**
   * Repone shields, y con eso trae el **cierre conjuntivo** de `time-model.md §3`: la ventana cierra
   * por tiempo **o** porque se repuso shield, lo que ocurra primero — *"recuperar shields durante la
   * invulnerabilidad la termina de inmediato: cualquier cantidad, de cualquier fuente, incluida la
   * regeneración natural"*.
   *
   * **Ya no acumula un contador.** Existía un `shieldsReplenished` para alimentar la duración del
   * gate, siguiendo la prosa de la wiki (*"repuestos desde el último gate"*); la fuente primaria dice
   * otra cosa —*"the amount of Shields you had **upon Shield Break**"*— y esa no necesita estado: el
   * número está en la capa, justo antes de restarlo.
   */
  public replenishShields(amount: number, currentTime = 0) {
    if (amount <= 0) return;
    this.current_shields += amount;
    if (this.isGated(currentTime)) this.gateUntil = null;
  }

  public receive(layer: Layer, damage: number, currentTime = 0) {
    const law = gateLawFor(this.entity.channel);

    // Ventana abierta: sólo pasa la fracción que la clase declare (jugador 0, enemigo 5%).
    let restante = this.isGated(currentTime) && law ? damage * law.leakFraction : damage;

    // La DR de escudo es del PORTADOR y sólo de las capas de escudo (`shield.md`: el Tenno la tiene,
    // el compañero **no**, el enemigo tampoco). El Overguard no la comparte: es otra capa con sus
    // propias reglas.
    const shieldDR = shieldDamageReductionFor(this.entity.channel);

    for (const l of LAYER_STACK.slice(LAYER_STACK.indexOf(layer))) {
      if (restante <= 0) return;
      if (l === "health") { this.current_health -= restante; return; }
      const disponible = this.layerAmounts[l];
      if (disponible <= 0) continue;

      // **Un DR de capa protege a esa capa, no a la siguiente.** Por eso la capa se mide en puntos y
      // el evento en daño: `costo` es cuánto daño cuesta vaciarla, y lo que sobra sigue de largo
      // **sin** arrastrar esta mitigación. Con DR 0 (enemigo, compañero, Overguard) `costo ===
      // disponible` y el camino es el de siempre.
      const dr = (l === "shield" || l === "overshield") ? shieldDR : 0;
      const costo = damageToDeplete(disponible, dr);
      const absorbido = Math.min(costo, restante);
      this.setLayer(l, disponible - absorbido * (1 - dr));
      restante -= absorbido;

      // La capa se AGOTÓ en este evento (tenía algo, quedó en cero) → cierra, y el exceso no derrama.
      // La duración la fija `disponible`: el shield que había **al romperse**, que es el argumento
      // que la fuente primaria declara. Por eso no hace falta estado acumulado.
      if (law && restante > 0 && l === "shield") {
        this.gateUntil = currentTime + law.duration(disponible);
        restante *= law.leakFraction;
      }
    }
  }

  /** Multiplicador de la capa golpeada = producto de los `layerMult` de los efectos activos (Viral/Magnetic). */
  public getDamageMultiplier(layer: Layer, currentTime: number = 0): number {
    let mult = 1.0;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const m = behavior.resolutionModifier?.(this.effectStates.get(effect), currentTime).layerMult?.[layer];
      if (m !== undefined) mult *= m;
    }
    return mult;
  }

  /**
   * Bonos al crit del ATACANTE según los efectos presentes en este target (`OQ-ENGINE-12`).
   * Suma los `critModifier` de los efectos activos: Weakened (Puncture) → +crit chance (%),
   * Freeze (Cold) → +crit damage (×). Se lee LIVE por hit en `simulateAttack`.
   */
  public getCritBonuses(currentTime: number = 0): { critChanceAdd: number; critMultAdd: number } {
    let critChanceAdd = 0;
    let critMultAdd = 0;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const c = behavior.critModifier?.(this.effectStates.get(effect), currentTime);
      if (c?.critChanceAdd) critChanceAdd += c.critChanceAdd;
      if (c?.critMultAdd) critMultAdd += c.critMultAdd;
    }
    return { critChanceAdd, critMultAdd };
  }

  /** Armor efectivo = base × producto de los `armorMult` de los efectos activos (Corrosion, Heat-ramp). */
  public getEffectiveArmor(currentTime: number): number {
    let armor = this.base_armor;
    for (const [effect, behavior] of this.activeBehaviors()) {
      const m = behavior.resolutionModifier?.(this.effectStates.get(effect), currentTime).armorMult;
      if (m !== undefined) armor *= m;
    }
    return Math.max(0, armor);
  }

  /** Efectos con estado presente (algún proc aplicado). */
  public activeEffects(): StatusEffect[] {
    return [...this.effectStates.keys()];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private *activeBehaviors(): Generator<[StatusEffect, EffectBehavior<any>]> {
    for (const [effect, state] of this.effectStates) {
      const behavior = EFFECT_BEHAVIORS[effect];
      if (behavior && state !== undefined) yield [effect, behavior];
    }
  }

  public isDead(): boolean {
    return this.current_health <= 0;
  }

  /**
   * ⚠️ **Copia LAS CUATRO capas, no dos.** Cuando la pila pasó de `{shields, health}` a las cuatro de
   * `contracts/layers.ts`, este método siguió copiando las dos viejas: un clon nacía con el Overguard
   * y el Overshield en cero. No era un bug activo —no tiene llamadores— pero sí una trampa cargada
   * para el primero que lo usara, y del tipo que no falla: devuelve un estado plausible.
   *
   * Se recorre `LAYER_STACK` en vez de listar los campos, para que agregar una capa no vuelva a
   * dejar este método atrás.
   */
  public clone(): EnemyState {
    const c = new EnemyState(this.entity);
    for (const l of LAYER_STACK) c.setLayer(l, this.layerAmounts[l]);
    // Los estados son inmutables (copy-on-write en applyProc/advance) → copiar el Map alcanza.
    c.effectStates = new Map(this.effectStates);
    return c;
  }
}
