/**
 * @domain Features / Arsenal
 * @SSoT docs/domains/ui-ux/shell-status.md
 * @status stub / en desarrollo
 */

// --- Tipos de Dominio ---

export type ArsenalMetadataSource =
  | "core"
  | "dataset"
  | "mock"
  | "manual"
  | "unavailable";

export type ArsenalMetadataPresence = "empty" | "filled";

export type ArchonShardType =
  | "crimson"
  | "amber"
  | "azure"
  | "topaz"
  | "violet"
  | "emerald";

export interface ArchonShardBonusOption {
  effectId: string;
  effectLabel: string;
  valueLabel: string;
  tauforgedValueLabel?: string;
  description: string;
}

export interface ArchonShardCatalogEntry {
  shardType: ArchonShardType;
  shardName: string;
  iconPath: string;
  tauforgedIconPath: string;
  bonusOptions: readonly ArchonShardBonusOption[];
}

export interface ArchonShardBonusCatalogEntry extends ArchonShardBonusOption {
  shardType: ArchonShardType;
  shardName: string;
  iconPath: string;
  tauforgedIconPath: string;
}

export type WeaponMetadataChannel =
  | "primaryWeapon"
  | "secondaryWeapon"
  | "meleeWeapon";

export type ArsenalMetadataSlotKey =
  | "focus"
  | "parazon"
  | "companion"
  | "companionWeapon"
  | "necramech"
  | "archwing"
  | "archgun";

export interface ArsenalMetadataEntity {
  label: string;
  description: string;
  source: ArsenalMetadataSource;
  state: ArsenalMetadataPresence;
  uniqueName?: string;
}

export interface ArchonShardSelection {
  slotIndex: number;
  label: string;
  effectLabel: string;
  valueLabel: string;
  description: string;
  source: ArsenalMetadataSource;
  state: ArsenalMetadataPresence;
  shardType: ArchonShardType | null;
  effectId: string | null;
  selectedBonusId: string | null;
  availableBonuses: readonly ArchonShardBonusOption[];
  isTauforged: boolean;
  iconPath: string | null;
}

export interface IncarnonEvolutionOption {
  optionId: string;
  label: string;
  description: string;
}

export interface IncarnonEvolutionSelection {
  evolutionIndex: number;
  label: string;
  description: string;
  source: ArsenalMetadataSource;
  selectedOptionId: string | null;
  selectedOptionLabel: string;
  options: IncarnonEvolutionOption[];
}

export interface IncarnonMetadata {
  available: boolean;
  modeLabel: string;
  source: ArsenalMetadataSource;
  evolutions: IncarnonEvolutionSelection[];
}

export interface ArsenalWarframeMetadata {
  archonShards: ArchonShardSelection[];
  extensions: ArsenalMetadataEntity[];
  focus: ArsenalMetadataEntity;
  parazon: ArsenalMetadataEntity;
}

export interface ArsenalWeaponMetadata {
  incarnon: IncarnonMetadata | null;
  extras: ArsenalMetadataEntity[];
}

export interface ArsenalCompanionMetadata {
  companion: ArsenalMetadataEntity;
  companionWeapon: ArsenalMetadataEntity;
}

export interface ArsenalVehicleMetadata {
  necramech: ArsenalMetadataEntity;
  archwing: ArsenalMetadataEntity;
  archgun: ArsenalMetadataEntity;
}

export interface ArsenalMetadataState {
  warframe: ArsenalWarframeMetadata;
  weapons: {
    primaryWeapon: ArsenalWeaponMetadata;
    secondaryWeapon: ArsenalWeaponMetadata;
    meleeWeapon: ArsenalWeaponMetadata;
  };
  companion: ArsenalCompanionMetadata;
  vehicles: ArsenalVehicleMetadata;
}

export interface ArsenalUiState {
  selectedArchonShardSlotIndex: number | null;
}

// --- Catálogo Mock (Transicional) ---

export const ARCHON_SHARD_CATALOG: readonly ArchonShardCatalogEntry[] = [
  {
    shardType: "crimson",
    shardName: "Crimson Archon Shard",
    iconPath: "/assets/archon-shard/CrimsonArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedCrimsonArchonShard.png",
    bonusOptions: [
      {
        effectId: "crimson-ability-strength",
        effectLabel: "Ability Strength",
        valueLabel: "+10% Ability Strength",
        description: "Shard ofensivo orientado a potenciar el Warframe y escalar habilidades.",
      },
      {
        effectId: "crimson-ability-duration",
        effectLabel: "Ability Duration",
        valueLabel: "+10% Ability Duration",
        description: "Mejora duración de habilidades para rotaciones con uptime prolongado.",
      },
      {
        effectId: "crimson-melee-critical-damage",
        effectLabel: "Melee Critical Damage",
        valueLabel: "+25% Melee Critical Damage",
        description: "Incrementa el daño crítico melee para builds centradas en multiplicadores.",
      },
      {
        effectId: "crimson-primary-status-chance",
        effectLabel: "Primary Status Chance",
        valueLabel: "+25% Primary Status Chance",
        description: "Aumenta la consistencia de proc de estado en arma primaria.",
      },
      {
        effectId: "crimson-secondary-critical-chance",
        effectLabel: "Secondary Critical Chance",
        valueLabel: "+25% Secondary Critical Chance",
        description: "Aumenta la consistencia de crítico en armamento secundario.",
      },
    ],
  },
  {
    shardType: "amber",
    shardName: "Amber Archon Shard",
    iconPath: "/assets/archon-shard/AmberArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedAmberArchonShard.png",
    bonusOptions: [
      {
        effectId: "amber-energy-filled-on-spawn",
        effectLabel: "Maximum Energy filled on Spawn",
        valueLabel: "+30% Maximum Energy filled on Spawn",
        description: "Incrementa energía inicial al iniciar misión o reaparecer.",
      },
      {
        effectId: "amber-health-orb-effectiveness",
        effectLabel: "Health Orb Effectiveness",
        valueLabel: "+100% Health Orb Effectiveness",
        description: "Potencia la recuperación de salud proveniente de health orbs.",
      },
      {
        effectId: "amber-casting-speed",
        effectLabel: "Casting Speed",
        valueLabel: "+25% Casting Speed",
        description: "Shard utilitario orientado a ritmo de casteo y movilidad del Warframe.",
      },
      {
        effectId: "amber-energy-orbs-effectiveness",
        effectLabel: "Energy Orb Effectiveness",
        valueLabel: "+50% Energy Orb Effectiveness",
        description: "Potencia la recuperación de energía proveniente de orbes.",
      },
      {
        effectId: "amber-parkour-velocity",
        effectLabel: "Parkour Velocity",
        valueLabel: "+15% Parkour Velocity",
        description: "Mejora movilidad aérea y ritmo general de desplazamiento.",
      },
    ],
  },
  {
    shardType: "azure",
    shardName: "Azure Archon Shard",
    iconPath: "/assets/archon-shard/AzureArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedAzureArchonShard.png",
    bonusOptions: [
      {
        effectId: "azure-energy-max",
        effectLabel: "Energy Max",
        valueLabel: "+50 Energy Max",
        description: "Shard defensivo/utility orientado a energía y supervivencia base.",
      },
      {
        effectId: "azure-health-max",
        effectLabel: "Health Max",
        valueLabel: "+150 Health",
        description: "Aumenta vida máxima para mejorar umbral de supervivencia.",
      },
      {
        effectId: "azure-shield-capacity",
        effectLabel: "Shield Capacity",
        valueLabel: "+150 Shield Capacity",
        description: "Aumenta capacidad máxima de escudo para builds orientadas a shield gate.",
      },
      {
        effectId: "azure-armor",
        effectLabel: "Armor",
        valueLabel: "+150 Armor",
        description: "Incrementa reducción de daño efectiva sobre salud.",
      },
      {
        effectId: "azure-health-regenerated",
        effectLabel: "Health/s Regenerated",
        valueLabel: "+5 Health/s",
        description: "Regeneración de salud pasiva por segundo en runtime.",
      },
    ],
  },
  {
    shardType: "topaz",
    shardName: "Topaz Archon Shard",
    iconPath: "/assets/archon-shard/TopazArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedTopazArchonShard.png",
    bonusOptions: [
      {
        effectId: "topaz-radiation-ability-damage",
        effectLabel: "Ability Damage on Radiation",
        valueLabel: "+10% Ability Damage on enemies affected by Radiation",
        description: "Fuente de radiación anti entrópica ideal para builds apoyadas en estados.",
      },
      {
        effectId: "topaz-health-on-blast-kill",
        effectLabel: "Health on Blast Kill",
        valueLabel: "+1 Health per enemy killed with Blast",
        tauforgedValueLabel: "+2 Health per enemy killed with Blast",
        description: "Recupera salud al eliminar enemigos con Blast.",
      },
      {
        effectId: "topaz-shields-on-blast-kill",
        effectLabel: "Shields on Blast Kill",
        valueLabel: "+5 Shields on Blast kill",
        description: "Recupera escudos al eliminar enemigos con Blast.",
      },
      {
        effectId: "topaz-secondary-crit-on-heat-kill",
        effectLabel: "Secondary Critical Chance on Heat-Status Kill",
        valueLabel: "+1% Secondary Critical Chance on Heat-status kill",
        description: "Escalado de crítico secundario por bajas con estado Heat.",
      },
    ],
  },
  {
    shardType: "violet",
    shardName: "Violet Archon Shard",
    iconPath: "/assets/archon-shard/VioletArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedVioletArchonShard.png",
    bonusOptions: [
      {
        effectId: "violet-electricity-ability-damage",
        effectLabel: "Ability Damage on Electricity",
        valueLabel: "+10% Ability Damage on enemies affected by Electricity",
        description: "Shard híbrido asociado a electricidad, energía y escalados especiales.",
      },
      {
        effectId: "violet-primary-electricity-damage",
        effectLabel: "Primary Electricity Damage",
        valueLabel: "+30% Primary Electricity Damage",
        description: "Aumenta daño eléctrico en arma primaria, con bonus adicional por cada shard Crimson/Azure/Violet equipado.",
      },
      {
        effectId: "violet-melee-critical-damage-on-energy",
        effectLabel: "Melee Critical Damage on High Energy",
        valueLabel: "+25% Melee Critical Damage while high energy",
        description: "Aumenta crítico melee condicionado al estado de energía.",
      },
      {
        effectId: "violet-pickup-health-energy-conversion",
        effectLabel: "Health/Energy Pickup Conversion",
        valueLabel: "+20% Health↔Energy pickup conversion",
        description: "Health pickups dan energía y energy pickups dan salud con eficiencia adicional.",
      },
    ],
  },
  {
    shardType: "emerald",
    shardName: "Emerald Archon Shard",
    iconPath: "/assets/archon-shard/EmeraldArchonShard.png",
    tauforgedIconPath: "/assets/archon-shard/TauforgedEmeraldArchonShard.png",
    bonusOptions: [
      {
        effectId: "emerald-corrosive-stacks",
        effectLabel: "Corrosive Stack Cap",
        valueLabel: "+2 max Corrosive stacks",
        description: "Shard orientado a toxina/corrosivo y condiciones ligadas a estados del enemigo.",
      },
      {
        effectId: "emerald-ability-damage-on-corrosive",
        effectLabel: "Ability Damage on Corrosive",
        valueLabel: "+10% Ability Damage on enemies affected by Corrosive",
        description: "Escalado de daño de habilidad para builds de corrosivo.",
      },
      {
        effectId: "emerald-toxin-status-more-damage",
        effectLabel: "Toxin Status Deals More Damage",
        valueLabel: "+30% Toxin Status Damage",
        description: "Incrementa el daño de ticks de estado Toxin (DoT).",
      },
      {
        effectId: "emerald-recover-health-on-toxin-status-damage",
        effectLabel: "Recover Health on Toxin Status Damage",
        valueLabel: "+2 Health on Toxin status damage",
        description: "Recupera salud cuando infliges daño de estado Toxin.",
      },
    ],
  },
] as const;

export const ARCHON_SHARD_BONUS_CATALOG: readonly ArchonShardBonusCatalogEntry[] =
  ARCHON_SHARD_CATALOG.flatMap((entry) =>
    entry.bonusOptions.map((bonus) => ({
      ...bonus,
      shardType: entry.shardType,
      shardName: entry.shardName,
      iconPath: entry.iconPath,
      tauforgedIconPath: entry.tauforgedIconPath,
    })),
  );

// --- Mutaciones y Factories ---

function createMetadataEntity(
  label: string,
  description: string,
  source: ArsenalMetadataSource = "mock",
  state: ArsenalMetadataPresence = "empty",
): ArsenalMetadataEntity {
  return {
    label,
    description,
    source,
    state,
  };
}

function createArchonShardSelection(slotIndex: number): ArchonShardSelection {
  return {
    slotIndex,
    label: `Shard Slot ${slotIndex + 1}`,
    effectLabel: "Empty Slot",
    valueLabel: "Empty",
    description: "Sin Archon Shard equipado todavía.",
    source: "mock",
    state: "empty",
    shardType: null,
    effectId: null,
    selectedBonusId: null,
    availableBonuses: [],
    isTauforged: false,
    iconPath: null,
  };
}

function findArchonShardBonus(effectId: string): {
  shard: ArchonShardCatalogEntry;
  bonus: ArchonShardBonusOption;
} | null {
  for (const shard of ARCHON_SHARD_CATALOG) {
    const bonus = shard.bonusOptions.find((entry) => entry.effectId === effectId);
    if (bonus) {
      return { shard, bonus };
    }
  }

  return null;
}

export function createEquippedArchonShardSelection(
  slotIndex: number,
  shard: ArchonShardCatalogEntry,
  bonus: ArchonShardBonusOption,
  isTauforged = false,
  source: ArsenalMetadataSource = "mock",
): ArchonShardSelection {
  return {
    slotIndex,
    label: isTauforged
      ? `Tauforged ${shard.shardName}`
      : shard.shardName,
    effectLabel: bonus.effectLabel,
    valueLabel: isTauforged
      ? bonus.tauforgedValueLabel ?? bonus.valueLabel.replace(/\+(\d+(?:\.\d+)?)/, (_m, value) => {
          const scaled = Number(value) * 1.5;
          return `+${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}`;
        })
      : bonus.valueLabel,
    description: bonus.description,
    source,
    state: "filled",
    shardType: shard.shardType,
    effectId: bonus.effectId,
    selectedBonusId: bonus.effectId,
    availableBonuses: shard.bonusOptions,
    isTauforged,
    iconPath: isTauforged ? shard.tauforgedIconPath : shard.iconPath,
  };
}

function createDefaultIncarnonMetadata(
  modeLabel: string,
): IncarnonMetadata {
  return {
    available: false,
    modeLabel,
    source: "mock",
    evolutions: Array.from({ length: 5 }, (_, index) => ({
      evolutionIndex: index + 1,
      label: `Evolution ${index + 1}`,
      description: "Sin selección definida todavía.",
      source: "mock",
      selectedOptionId: null,
      selectedOptionLabel: "Sin definir",
      options: [],
    })),
  };
}

function createDefaultWeaponMetadata(
  modeLabel: string,
): ArsenalWeaponMetadata {
  return {
    incarnon: createDefaultIncarnonMetadata(modeLabel),
    extras: [],
  };
}

export function createDefaultArsenalMetadataState(): ArsenalMetadataState {
  return {
    warframe: {
      archonShards: Array.from({ length: 5 }, (_, index) =>
        createArchonShardSelection(index),
      ),
      extensions: [],
      focus: createMetadataEntity(
        "Focus School",
        "Metadata visual para Focus mientras no exista backing real completo.",
      ),
      parazon: createMetadataEntity(
        "Parazon",
        "Metadata visual para Parazon mientras no exista backing real completo.",
      ),
    },
    weapons: {
      primaryWeapon: createDefaultWeaponMetadata("Primary Incarnon"),
      secondaryWeapon: createDefaultWeaponMetadata("Secondary Incarnon"),
      meleeWeapon: createDefaultWeaponMetadata("Melee Incarnon"),
    },
    companion: {
      companion: createMetadataEntity(
        "Companion",
        "Metadata visual del companion mientras el slice siga parcial.",
      ),
      companionWeapon: createMetadataEntity(
        "Companion Weapon",
        "Metadata visual del arma del companion mientras el slice siga parcial.",
      ),
    },
    vehicles: {
      necramech: createMetadataEntity(
        "Necramech",
        "Metadata visual del slot de Necramech para cerrar el Arsenal aunque no exista wiring real.",
      ),
      archwing: createMetadataEntity(
        "Archwing",
        "Metadata visual del slot de Archwing para cerrar el Arsenal aunque no exista wiring real.",
      ),
      archgun: createMetadataEntity(
        "Archgun",
        "Metadata visual del slot de Archgun para cerrar el Arsenal aunque no exista wiring real.",
      ),
    },
  };
}

export function createDefaultArsenalUiState(): ArsenalUiState {
  return {
    selectedArchonShardSlotIndex: 0,
  };
}

export function replaceWarframeArchonShard(
  metadata: ArsenalMetadataState,
  slotIndex: number,
  shard: ArchonShardSelection | null,
): ArsenalMetadataState {
  return {
    ...metadata,
    warframe: {
      ...metadata.warframe,
      archonShards: metadata.warframe.archonShards.map((entry, index) => {
        if (index !== slotIndex) {
          return entry;
        }

        return shard ?? createArchonShardSelection(slotIndex);
      }),
    },
  };
}

export function equipWarframeArchonShard(
  metadata: ArsenalMetadataState,
  slotIndex: number,
  effectId: string,
  isTauforged = false,
): ArsenalMetadataState {
  const match = findArchonShardBonus(effectId);

  if (!match) {
    return metadata;
  }

  return replaceWarframeArchonShard(
    metadata,
    slotIndex,
    createEquippedArchonShardSelection(slotIndex, match.shard, match.bonus, isTauforged),
  );
}

export function clearWarframeArchonShard(
  metadata: ArsenalMetadataState,
  slotIndex: number,
): ArsenalMetadataState {
  return replaceWarframeArchonShard(metadata, slotIndex, null);
}

export function selectArchonShardSlot(
  ui: ArsenalUiState,
  slotIndex: number | null,
): ArsenalUiState {
  return {
    ...ui,
    selectedArchonShardSlotIndex: slotIndex,
  };
}

export function replaceWeaponIncarnon(
  metadata: ArsenalMetadataState,
  channel: WeaponMetadataChannel,
  incarnon: IncarnonMetadata | null,
): ArsenalMetadataState {
  return {
    ...metadata,
    weapons: {
      ...metadata.weapons,
      [channel]: {
        ...metadata.weapons[channel],
        incarnon,
      },
    },
  };
}

export function replaceWarframeExtensions(
  metadata: ArsenalMetadataState,
  extensions: ArsenalMetadataEntity[],
): ArsenalMetadataState {
  return {
    ...metadata,
    warframe: {
      ...metadata.warframe,
      extensions,
    },
  };
}

export function replaceSurfaceMetadataEntity(
  metadata: ArsenalMetadataState,
  slotKey: ArsenalMetadataSlotKey,
  entity: ArsenalMetadataEntity,
): ArsenalMetadataState {
  switch (slotKey) {
    case "focus":
    case "parazon":
      return {
        ...metadata,
        warframe: {
          ...metadata.warframe,
          [slotKey]: entity,
        },
      };
    case "companion":
    case "companionWeapon":
      return {
        ...metadata,
        companion: {
          ...metadata.companion,
          [slotKey]: entity,
        },
      };
    case "necramech":
    case "archwing":
    case "archgun":
      return {
        ...metadata,
        vehicles: {
          ...metadata.vehicles,
          [slotKey]: entity,
        },
      };
    default:
      return metadata;
  }
}
