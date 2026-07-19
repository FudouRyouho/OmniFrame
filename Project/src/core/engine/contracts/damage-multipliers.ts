/**
 * @domain Simulation-v2 / Contracts / Damage
 * @status en-desarrollo
 */

/**
 * Bonificación de facción (**Update 36.0**) — el modelo vigente de daño-vs-target. Post-U36 las 13 clases
 * de capa del modelo viejo (Ferrite Armor / Cloned Flesh / Proto Shield / …) **ya no rigen**: el daño-vs-
 * target es **por facción** (ver `references/wiki/mechanics/enemy-resistances.md`).
 * Matriz facción×elemento **uniforme**: vulnerable = `+0.5` (×1.5), resistente = `−0.5` (×0.5), neutral
 * ausente (0). Convención = delta de eficiencia para `typeMultiplier = 1 + bonus`.
 * SSoT: `references/wiki/mechanics/enemy-resistances.md §Matriz facción×elemento` (verificada por el usuario).
 *
 * Keyed `[damageToken][faction]`. **Consumida por `resolveHit` vía `targetFactionMult` (matriz③, checkpoint-1).**
 * Facción canónica = vocabulario raw (`semantic/factions.md`: Orokin, NO "Corrupted").
 *
 * ⚠️ Incluye **subfacciones** (Kuva Grineer, Corpus Amalgam, Narmer, The Murmur, Infested Deimos, Techrot,
 * Scaldra, Anarchs, Zariman) que el `enemies.json` actual NO distingue (sólo bases) → esos bonus quedan
 * latentes hasta poder resolver subfacción en el dato (gap conocido).
 */
export const FACTION_BONUS: Record<string, Record<string, number>> = {
  "WEAPON_ADD_IMPACT_DAMAGE":      { "Grineer": 0.5, "Kuva Grineer": 0.5, "Scaldra": 0.5, "Anarchs": 0.5 },
  "WEAPON_ADD_PUNCTURE_DAMAGE":    { "Corpus": 0.5, "Orokin": 0.5 },
  "WEAPON_ADD_SLASH_DAMAGE":       { "Infested": 0.5, "Narmer": 0.5 },
  "WEAPON_ADD_HEAT_DAMAGE":        { "Infested": 0.5, "Kuva Grineer": -0.5 },
  "WEAPON_ADD_COLD_DAMAGE":        { "Sentient": 0.5, "Techrot": -0.5 },
  "WEAPON_ADD_ELECTRICITY_DAMAGE": { "Corpus Amalgam": 0.5, "The Murmur": 0.5, "Anarchs": 0.5 },
  "WEAPON_ADD_TOXIN_DAMAGE":       { "Narmer": 0.5 },
  "WEAPON_ADD_BLAST_DAMAGE":       { "Infested Deimos": 0.5, "Corpus Amalgam": -0.5 },
  "WEAPON_ADD_CORROSIVE_DAMAGE":   { "Grineer": 0.5, "Kuva Grineer": 0.5, "Scaldra": 0.5, "Sentient": -0.5 },
  "WEAPON_ADD_GAS_DAMAGE":         { "Infested Deimos": 0.5, "Techrot": 0.5, "Scaldra": -0.5 },
  "WEAPON_ADD_MAGNETIC_DAMAGE":    { "Corpus": 0.5, "Corpus Amalgam": 0.5, "Techrot": 0.5, "Narmer": -0.5 },
  "WEAPON_ADD_RADIATION_DAMAGE":   { "Sentient": 0.5, "The Murmur": 0.5, "Anarchs": -0.5 },
  "WEAPON_ADD_VIRAL_DAMAGE":       { "Orokin": 0.5, "Infested Deimos": -0.5, "The Murmur": -0.5 },
  "WEAPON_ADD_VOID_DAMAGE":        { "Zariman": 0.5 },
  // Tau, True → sin bonificación de facción (matriz vacía).
};

/**
 * Accessor de la matriz ③ (`FACTION_BONUS`) — física del target, source-agnostic (ver
 * `simulation-architecture.md §2.0`). `FACTION_BONUS` es **dato** (lookup, no cómputo) → el accessor
 * se co-loca con la tabla, NO en `formulas/` (que es matemática pura; ver `formulas-integration.md`).
 *
 * **Single-dip, keyed en el target** (facción), NO en el bucket de mods/buffs del source — confirmado
 * `damage-status-model.md §Evidencia`: Heat/Toxin contra Charger dan ratio ×1.5 constante en TODO nivel
 * de buff (no ×2.25) → la matriz se aplica **una** vez, se distingue del pool② (que sí double-dipea
 * en DoT). Post-U36 la matriz NO distingue capa (shields/armor/salud) — mismo valor sin importar dónde
 * pega el hit (`enemy-resistances.md`, "el modelo de resistencias es por facción, no por clase de capa").
 */
export function targetFactionMult(damageToken: string, faction: string): number {
  return 1 + (FACTION_BONUS[damageToken]?.[faction] ?? 0);
}
