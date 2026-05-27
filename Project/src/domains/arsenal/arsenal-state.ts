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


// --- Factories de Metadata Visual ---

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
