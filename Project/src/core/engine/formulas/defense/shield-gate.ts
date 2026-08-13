/**
 * @domain Engine / Formulas / Defense — el shield gate
 *
 * LA LEY, en una línea: **al agotarse una capa, el derrame se corta y se abre una ventana.**
 * Cambiala y deja de ser shield gating; por eso es ley y vive acá, con su fórmula.
 *
 * Lo que **no** es ley son sus dos parámetros —cuánta fracción del exceso pasa igual, y cuánto dura
 * la ventana—, y esos se resuelven por la cadena de `arch-decisions §17`:
 *
 * ```
 * default            del concepto              0 %  ·  t(S) = 0.33…2.5 s
 *   → ¿clase?        pregunta local            enemigo: 5 %  ·  0.1 s
 *   → ¿el receptor   modifica?                 Hildryn 3.5 s · Protea ×2 · Catalyzing 1.33 s
 *   → ¿el receptor   fuerza?                   Decaying Dragon Key: cap 0.33 s
 * ```
 *
 * ⚠️ **Los dos últimos eslabones NO están construidos** (`CV-3`): este módulo cubre el default y la
 * pregunta local. Los cuatro desvíos conocidos quedan declarados en `RECEIVER_DEVIATIONS` como dato,
 * sin canal que los aplique — es el material del stage, no una tabla que alguien deba leer hoy.
 *
 * **Y `Decaying vs Catalyzing` confirma §17 en vez de refutarlo.** La wiki dice que la Dragon Key
 * *"anula por completo a Catalyzing Shields"*, que suena a dos desvíos compitiendo por el mismo
 * parámetro. No compiten: uno **modifica** (1.33 s) y el otro **fuerza** un cap (0.33 s), y
 * `min(1.33, 0.33) = 0.33`. El "anula" es aritmética, no precedencia.
 *
 * Fuente: `references/wiki/mechanics/shield.md` §Shield Gating + §El gate del enemigo es otra mecánica.
 */

/** Los dos parámetros que la clase del portador resuelve. */
export interface GateLaw {
  /** Fracción del exceso que **igual** llega a la capa siguiente. `0` = invulnerabilidad total. */
  leakFraction: number;
  /** Duración de la ventana, en segundos, dado `S` = shields repuestos desde el último gate. */
  duration: (replenishedShields: number) => number;
}

/**
 * Duración del gate del jugador. **Su argumento no es el shield máximo** — es cuánto shield se
 * repuso desde el gate anterior, que es lo que hace de esta ventana un caso aparte: no sale de un
 * snapshot del emisor (como el DoT) ni de una constante del receptor (como Adaptation), sino de
 * **integrar un evento del receptor entre dos ocurrencias del mismo hecho**.
 *
 *     S < 53          →  S/180 + 1/3
 *     53 ≤ S ≤ 1150   →  (S/350)^0.65 + 1/3
 *     S > 1150        →  2.5
 */
export function playerGateDuration(replenishedShields: number): number {
  const s = Math.max(0, replenishedShields);
  if (s < 53) return s / 180 + 1 / 3;
  if (s <= 1150) return Math.pow(s / 350, 0.65) + 1 / 3;
  return 2.5;
}

/** El gate del enemigo **es otra mecánica**, no el mismo con otros números: deja pasar el 5%. */
export const ENEMY_GATE_LEAK = 0.05;
export const ENEMY_GATE_DURATION = 0.1;

const GATE_BY_FAMILY: Readonly<Record<string, GateLaw>> = {
  avatar: { leakFraction: 0,                duration: playerGateDuration },
  enemy:  { leakFraction: ENEMY_GATE_LEAK,  duration: () => ENEMY_GATE_DURATION },
};

/**
 * La ley del gate para una familia, o `undefined` si esa familia no gatea.
 *
 * **`undefined` no es un hueco**: una familia sin entrada **no tiene gate**, que es una respuesta
 * legítima (el Overguard del enemigo es justamente eso — `overguard.md`: *"Gate al agotarse: 0.5 s
 * del lado jugador · **ninguno** del lado enemigo"*). Distinto de `armorMitigationFor`, que **tira**
 * cuando no encuentra familia: allá la ausencia significa "no sé mitigar" y produce un número falso;
 * acá significa "no gatea" y produce el comportamiento correcto.
 */
export function gateLawFor(routes: readonly string[] | undefined): GateLaw | undefined {
  const family = routes?.find((r) => r in GATE_BY_FAMILY);
  return family ? GATE_BY_FAMILY[family] : undefined;
}

/**
 * DATO, NO TABLA VIVA — los cuatro desvíos del receptor sobre la duración, con su verbo de §17.
 * Ninguno se aplica hoy: el canal que los resolvería es `CV-3`. Se declaran acá para que el stage
 * arranque del corpus medido y no de cero.
 */
export const RECEIVER_DEVIATIONS = [
  { fuente: "Hildryn (y aliados con Haven)", verbo: "modifica", efecto: "duración = 3.5 s" },
  { fuente: "Grenade Fan (Protea)",          verbo: "modifica", efecto: "duplica el mínimo → 0.66–5 s" },
  { fuente: "Catalyzing Shields",            verbo: "modifica", efecto: "1.33 s por CUALQUIER cantidad repuesta — rompe la proporcionalidad" },
  { fuente: "Decaying Dragon Key",           verbo: "fuerza",   efecto: "cap 0.33 s" },
] as const;
