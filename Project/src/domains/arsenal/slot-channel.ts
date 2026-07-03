/**
 * @domain Arsenal / Slot ↔ Channel
 * @status activo
 *
 * SSoT del mapeo entre los IDs de slot de la UI del Arsenal (`primary_weapon`, …)
 * y los canales del EnsembleStore (`primary`, …). Consumido por ArsenalView
 * (hidratación + equip) y UpgradeView (lookup de la entidad activa). No duplicar:
 * un consumidor que se arme su propio mapa diverge (drift) — fue el bug del
 * channel routing de UpgradeView, cerrado al centralizar acá.
 */
import type { EnsembleChannel } from "@shared/types/ensemble";

export interface SlotChannelConfig {
  channel: EnsembleChannel;
  domain: string;
}

export const SLOT_TO_ENSEMBLE_CHANNEL: Record<string, SlotChannelConfig> = {
  warframe: { channel: "warframe", domain: "warframe" },
  primary_weapon: { channel: "primary", domain: "weapon" },
  secondary_weapon: { channel: "secondary", domain: "weapon" },
  melee_weapon: { channel: "melee", domain: "weapon" },
  companion: { channel: "companion", domain: "companion" },
  companionWeapon: { channel: "companion_weapon", domain: "weapon" }, // o companion-weapon según el data registry
  archwing: { channel: "archwing", domain: "vehicle" },
  archgun: { channel: "archgun", domain: "archwing-weapon" },
  necramech: { channel: "necramech", domain: "vehicle" },
};
