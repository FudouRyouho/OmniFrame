/**
 * RngProvider - Seedable Random Number Generator.
 * Used to ensure simulation traces are deterministic and reproducible for auditing.
 */
export class RngProvider {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed;
  }

  /**
   * Mulberry32 algorithm.
   * Returns a pseudo-random float between 0 and 1.
   */
  public next(): number {
    this.state |= 0;
    this.state = (this.state + 0x9e3779b9) | 0;
    let t = this.state ^ (this.state >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  }

  /**
   * Returns true if a roll is successful based on probability [0, 1].
   */
  public roll(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Static convenience method for non-persistent rolls.
   */
  public static create(seed: number): RngProvider {
    return new RngProvider(seed);
  }
}
