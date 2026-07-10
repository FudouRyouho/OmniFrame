/**
 * @domain Simulation-v2 / Contracts / Damage
 * @status en-desarrollo
 */

/**
 * @deprecated Modelo per-clase **pre-U36** (Ferrite Armor / Cloned Flesh / …). Las 13 clases de
 * salud/armor/shield **ya no rigen** — desde Update 36.0 el daño-vs-target es **por facción**
 * (ver `FACTION_BONUS` abajo y `references/wiki/mechanics/enemy-resistances.md`). Se conserva SÓLO
 * porque el legacy `CombatSimulator.resolveHit` aún la consume; se elimina cuando ese resolveHit se
 * reconcilie a `FACTION_BONUS` (deferido, C2). **No usar en código nuevo.**
 */
export const DAMAGE_EFFICIENCY: Record<string, Record<string, number>> = {
  "WEAPON_ADD_IMPACT_DAMAGE": {
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Machinery": 0.25
  },
  "WEAPON_ADD_PUNCTURE_DAMAGE": {
    "FerriteArmor": 0.50,
    "AlloyArmor": 0.15,
    "Robotic": 0.25
  },
  "WEAPON_ADD_SLASH_DAMAGE": {
    "ClonedFlesh": 0.25,
    "Infested": 0.25,
    "Flesh": 0.25,
    "FerriteArmor": -0.15,
    "AlloyArmor": -0.50,
    "Robotic": -0.25
  },
  "WEAPON_ADD_HEAT_DAMAGE": {
    "ClonedFlesh": 0.25,
    "Flesh": 0.25,
    "InfestedFlesh": 0.50,
    "ProtoShield": -0.50
  },
  "WEAPON_ADD_COLD_DAMAGE": {
    "AlloyArmor": 0.25,
    "Shields": 0.50,
    "ProtoShield": 0.15,
    "Fossilized": -0.50
  },
  "WEAPON_ADD_ELECTRICITY_DAMAGE": {
    "Robotic": 0.50,
    "Shields": 0.50,
    "AlloyArmor": -0.50
  },
  "WEAPON_ADD_TOXIN_DAMAGE": {
    "Flesh": 0.50,
    "ProtoShield": -0.25,
    "Robotic": -0.25
    // Nota: Toxin ignora Shields en el combate real
  },
  "WEAPON_ADD_CORROSIVE_DAMAGE": {
    "FerriteArmor": 0.75,
    "Fossilized": 0.75,
    "ProtoShield": -0.50
  },
  "WEAPON_ADD_VIRAL_DAMAGE": {
    "ClonedFlesh": 0.75,
    "Flesh": 0.50,
    "Machinery": -0.25
  },
  "WEAPON_ADD_MAGNETIC_DAMAGE": {
    "Shields": 0.75,
    "ProtoShield": 0.75,
    "AlloyArmor": -0.50
  },
  "WEAPON_ADD_RADIATION_DAMAGE": {
    "AlloyArmor": 0.75,
    "Robotic": 0.25,
    "InfestedSinew": 0.50,
    "Shields": -0.25,
    "Fossilized": -0.75
  },
  "WEAPON_ADD_BLAST_DAMAGE": {
    "Fossilized": 0.50,
    "Machinery": 0.75,
    "FerriteArmor": -0.25
  },
  "WEAPON_ADD_GAS_DAMAGE": {
    "Infested": 0.75,
    "InfestedFlesh": 0.50,
    "ClonedFlesh": -0.50,
    "Flesh": -0.50
  }
};

/**
 * Bonificación de facción (**Update 36.0**) — el modelo vigente que reemplaza a `DAMAGE_EFFICIENCY`.
 * Matriz facción×elemento **uniforme**: vulnerable = `+0.5` (×1.5), resistente = `−0.5` (×0.5), neutral
 * ausente (0). Convención = delta de eficiencia para `typeMultiplier = 1 + bonus` (idéntica a la vieja).
 * SSoT: `references/wiki/mechanics/enemy-resistances.md §Matriz facción×elemento` (verificada por el usuario).
 *
 * Keyed `[damageToken][faction]` (espeja `DAMAGE_EFFICIENCY` → swap directo cuando `resolveHit` se reconcilie).
 * Facción canónica = vocabulario raw (`semantic/factions.md`: Orokin, NO "Corrupted").
 *
 * ⚠️ Incluye **subfacciones** (Kuva Grineer, Corpus Amalgam, Narmer, The Murmur, Infested Deimos, Techrot,
 * Scaldra, Anarchs, Zariman) que el `enemies.json` actual NO distingue (sólo bases) → esos bonus quedan
 * latentes hasta poder resolver subfacción en el dato (gap conocido). **Aún NO consumida:** `resolveHit`
 * sigue en `DAMAGE_EFFICIENCY` hasta su reconciliación (deferido, C2).
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
 * de buff (no ×2.25) → la matriz se aplica **una** vez, se distingue del bucket② (que sí double-dipea
 * en DoT). Post-U36 la matriz NO distingue capa (shields/armor/salud) — mismo valor sin importar dónde
 * pega el hit (`enemy-resistances.md`, "el modelo de resistencias es por facción, no por clase de capa").
 */
export function targetFactionMult(damageToken: string, faction: string): number {
  return 1 + (FACTION_BONUS[damageToken]?.[faction] ?? 0);
}
