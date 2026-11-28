// Derivado de warframe-items/build/types/shared.ts, commit 5056d7f30, MIT.
// Recortados tipos no usados por raw-build ni por sus dependencias transitivas. Cada interfaz se reformateó
// en una línea; los campos y las firmas de índice son los de upstream (verificado por nombre de campo).
export interface ImageManifestItem { uniqueName: string; textureLocation: string; fileTime: string; }
export type ImageManifest = ImageManifestItem[];
export interface Item { uniqueName: string; name: string; type: string; category: string; productCategory?: string; imageName: string; components?: Item[]; abilities?: Ability[]; isAugment?: boolean; tradable?: boolean; drops?: Drop[]; [key: string]: unknown; }
export interface Ability { uniqueName: string; name: string; imageName: string; [key: string]: unknown; }
export interface RawItemData { api: ApiCategory[]; manifest: ImageManifest; drops: RawDrop[]; patchlogs: PatchlogWrap; wikia: WikiaData; relics: TitaniaRelic[]; i18n: Record<string, ApiCategory[]>; }
export interface PatchlogPost { name: string; url: string; date: string; [key: string]: unknown; }
export interface CategoryData { category: string; data: Item[]; }
export interface Warnings { missingImage: string[]; missingDucats: string[]; missingComponents: string[]; missingVaultData: string[]; polarity: [string, string][]; missingType: string[]; failedImage: string[]; missingWikiThumb: string[]; missingReleaseDates: string[]; ambiguousWikiMatch: string[]; missingExaltedSlot: string[]; }
export interface WikiaData { weapons: WikiaWeapon[]; warframes: WikiaWarframe[]; mods: WikiaMod[]; versions: WikiaVersion[]; ducats: WikiaDucat[]; arcanes: WikiaArcane[]; archwings: WikiaArchwing[]; companions: WikiaCompanion[]; vaultData: VaultData[]; }
export interface WikiaWeapon { name: string; uniqueName?: string; url: string; mr?: number; type?: string; class?: string; slot?: string | number; attacks?: unknown[]; ammo?: number; polarities?: string[]; exilusPolarity?: string; stancePolarity?: string; tags?: string[]; thumbnail?: string; marketCost?: number; bpCost?: number; introduced?: string; vaulted?: boolean; [key: string]: unknown; }
export interface WikiaWarframe { name: string; uniqueName?: string; url: string; auraPolarity?: string; exilusPolarity?: string; conclave?: number; mr?: number; polarities?: string[]; sprint?: number; introduced?: string; sex?: string; vaulted?: boolean; thumbnail?: string; color?: number; marketCost?: number; bpCost?: number; [key: string]: unknown; }
export interface WikiaMod { name: string; uniqueName?: string; url: string; transmutable?: boolean; introduced?: string; thumbnail?: string; [key: string]: unknown; }
export interface WikiaArcane { name: string; uniqueName?: string; url: string; transmutable?: boolean; introduced?: string; type?: string; rarity?: string; thumbnail?: string; [key: string]: unknown; }
export interface WikiaArchwing { name: string; uniqueName?: string; url: string; mr?: number; polarities?: string[]; sprint?: number; introduced?: string; vaulted?: boolean; thumbnail?: string; [key: string]: unknown; }
export interface WikiaCompanion { name: string; uniqueName?: string; url: string; mr?: number; polarities?: string[]; stamina?: number; introduced?: string; vaulted?: boolean; vaultDate?: string; estimatedVaultDate?: string; thumbnail?: string; [key: string]: unknown; }
export interface WikiaVersion { name: string; url: string; aliases: string[]; parent?: string; date?: string; }
export interface WikiaDucat { name: string; ducats: number; }
export interface VaultData { name: string; vaulted: boolean; vaultDate?: string; estimatedVaultDate?: string; }
export interface Drop { location: string; type: string; chance: number; rarity: string; rotation?: string; uniqueName?: string; rewards?: RelicReward[]; marketInfo?: unknown; vaulted?: boolean; vaultDate?: string; }
export interface RawDrop { place: string; item: string; chance: number | string; rarity: string; }
export interface RelicReward { item?: { name: string; }; chance?: number; [key: string]: unknown; }
export interface TitaniaRelic { name: string; uniqueName: string; locations: string[]; rewards: RelicReward[]; warframeMarket?: unknown; vaultInfo?: { vaulted: boolean; vaultDate?: string; }; }
export interface PatchlogWrap { patchlogs: { getItemChanges: (target: { name: string; type: string }) => unknown[]; }; posts: PatchlogPost[]; changed: boolean; }
export interface ApiCategory { category?: string; data: Partial<Item>[]; }
