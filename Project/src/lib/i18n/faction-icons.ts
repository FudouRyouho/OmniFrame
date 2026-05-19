/**
 * faction-icons.ts
 *
 * Mapa canónico de facción → { icon, label }
 * Patrón consistente con category-icons.ts y damage-labels.ts.
 *
 * Nota: este proyecto no soporta multi-locale. Todos los labels son en inglés
 * y no existe selector de idioma ni fallback multi-locale. "i18n" aquí significa
 * únicamente lookup de labels y assets — no internacionalización real.
 */

export type FactionKey =
  | "Anarchs"
  | "Corpus"
  | "Grineer"
  | "Murmur"
  | "Narmer"
  | "Orokin"
  | "Scaldra"
  | "Sentient"
  | "Techrot"
  | "Tenno";

const FACTIONS_BASE = "/assets/factions";

export const factionIconMap: Record<FactionKey, { icon: string; label: string }> = {
  Anarchs:  { icon: `${FACTIONS_BASE}/Anarchs.png`,  label: "Anarchs" },
  Corpus:   { icon: `${FACTIONS_BASE}/Corpus.png`,   label: "Corpus" },
  Grineer:  { icon: `${FACTIONS_BASE}/Grineer.png`,  label: "Grineer" },
  Murmur:   { icon: `${FACTIONS_BASE}/Murmur.png`,   label: "Murmur" },
  Narmer:   { icon: `${FACTIONS_BASE}/Narmer.png`,   label: "Narmer" },
  Orokin:   { icon: `${FACTIONS_BASE}/Orokin.png`,   label: "Orokin" },
  Scaldra:  { icon: `${FACTIONS_BASE}/Scaldra.png`,  label: "Scaldra" },
  Sentient: { icon: `${FACTIONS_BASE}/Sentient.png`, label: "Sentient" },
  Techrot:  { icon: `${FACTIONS_BASE}/Techrot.png`,  label: "Techrot" },
  Tenno:    { icon: `${FACTIONS_BASE}/Tenno.png`,    label: "Tenno" },
};

export const getFactionIcon = (key: string): { icon: string; label: string } | null =>
  factionIconMap[key as FactionKey] ?? null;
