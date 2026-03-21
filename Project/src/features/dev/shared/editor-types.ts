/**
 * editor-types.ts
 * Tipos y constantes compartidos entre los editores de dev (AbilityStatsEditor, ModStatsEditor, etc.)
 */

import type { ModModifier } from "@lib/types";

export type EditorStatus = "Pendiente" | "Completado" | "Revision" | "Problemas";

export const STATUS_CONFIG: Record<EditorStatus, { color: string; bg: string }> = {
  Pendiente:  { color: "bg-gray-400",   bg: "bg-gray-400/20"  },
  Completado: { color: "bg-green-500",  bg: "bg-green-500/20" },
  Revision:   { color: "bg-yellow-500", bg: "bg-yellow-500/20" },
  Problemas:  { color: "bg-red-500",    bg: "bg-red-500/20"   },
};

export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG) as EditorStatus[];

// ── Mod Modifiers ─────────────────────────────────────────────────────────────

export const MOD_MODIFIERS: ModModifier[] = [
  "",
  // Daño base
  "DAMAGE_BASE",
  // Daño elemental
  "DAMAGE_COLD", "DAMAGE_HEAT", "DAMAGE_ELECTRICITY", "DAMAGE_TOXIN",
  // Daño físico
  "DAMAGE_IMPACT", "DAMAGE_PUNCTURE", "DAMAGE_SLASH",
  // Daño combinado
  "DAMAGE_BLAST", "DAMAGE_CORROSIVE", "DAMAGE_GAS",
  "DAMAGE_MAGNETIC", "DAMAGE_RADIATION", "DAMAGE_VIRAL", "DAMAGE_VOID",
  // Daño por facción
  "DAMAGE_FACTION_CORPUS", "DAMAGE_FACTION_GRINEER",
  "DAMAGE_FACTION_INFESTED", "DAMAGE_FACTION_MURMUR", "DAMAGE_FACTION_OROKIN",
  // Stats de arma
  "CRIT_CHANCE", "CRIT_DAMAGE", "STATUS_CHANCE", "STATUS_DURATION",
  "MULTISHOT", "FIRE_RATE", "RELOAD_SPEED", "MAGAZINE_CAPACITY",
  "AMMO_MAX", "PUNCH_THROUGH", "PROJECTILE_SPEED", "ACCURACY", "ZOOM", "RECOIL",
  // Stats de warframe / companion
  "ABILITY_STRENGTH", "ABILITY_DURATION", "ABILITY_EFFICIENCY", "ABILITY_RANGE",
  "HEALTH", "SHIELD", "ARMOR", "ENERGY_MAX", "SPRINT_SPEED",
  // Especiales
  "CONDITIONAL", "UNIQUE",
];

/** Grupos para el select del editor */
export const MOD_MODIFIER_GROUPS: { label: string; values: ModModifier[] }[] = [
  { label: "— Sin asignar —",       values: [""] },
  { label: "Daño base",             values: ["DAMAGE_BASE"] },
  { label: "Daño elemental",        values: ["DAMAGE_COLD", "DAMAGE_HEAT", "DAMAGE_ELECTRICITY", "DAMAGE_TOXIN"] },
  { label: "Daño físico",           values: ["DAMAGE_IMPACT", "DAMAGE_PUNCTURE", "DAMAGE_SLASH"] },
  { label: "Daño combinado",        values: ["DAMAGE_BLAST", "DAMAGE_CORROSIVE", "DAMAGE_GAS", "DAMAGE_MAGNETIC", "DAMAGE_RADIATION", "DAMAGE_VIRAL", "DAMAGE_VOID"] },
  { label: "Daño por facción",      values: ["DAMAGE_FACTION_CORPUS", "DAMAGE_FACTION_GRINEER", "DAMAGE_FACTION_INFESTED", "DAMAGE_FACTION_MURMUR", "DAMAGE_FACTION_OROKIN"] },
  { label: "Stats de arma",         values: ["CRIT_CHANCE", "CRIT_DAMAGE", "STATUS_CHANCE", "STATUS_DURATION", "MULTISHOT", "FIRE_RATE", "RELOAD_SPEED", "MAGAZINE_CAPACITY", "AMMO_MAX", "PUNCH_THROUGH", "PROJECTILE_SPEED", "ACCURACY", "ZOOM", "RECOIL"] },
  { label: "Stats warframe/compañero", values: ["ABILITY_STRENGTH", "ABILITY_DURATION", "ABILITY_EFFICIENCY", "ABILITY_RANGE", "HEALTH", "SHIELD", "ARMOR", "ENERGY_MAX", "SPRINT_SPEED"] },
  { label: "Especiales",            values: ["CONDITIONAL", "UNIQUE"] },
];
