import type { ItemDomain, ItemKind, ItemFamily } from '../../src/shared/types/base.ts';

export interface EntityTaxonomy {
  domain: ItemDomain;
  kind: ItemKind;
  family?: ItemFamily;
  tags?: string[];
}

const PRODUCT_CATEGORY_TO_DOMAIN: Record<string, ItemDomain> = {
  'Suits': 'warframe',
  'LongGuns': 'weapon',
  'Pistols': 'weapon',
  'Melee': 'weapon',
  'SpaceGuns': 'weapon',
  'SpaceMelee': 'weapon',
  'SentinelWeapons': 'weapon',
  'Sentinels': 'companion',
  'KubrowPets': 'companion',
  'Pets': 'companion',
  'SpaceSuits': 'vehicle',
  'MechSuits': 'vehicle',
  'CrewShipWeapons': 'vehicle',
};

const CATEGORY_TO_DOMAIN: Record<string, ItemDomain> = {
  'Warframes': 'warframe',
  'Primary': 'weapon',
  'Secondary': 'weapon',
  'Arch-Gun': 'weapon',
  'Arch-Melee': 'weapon',
  'Mods': 'mod',
  'Arcanes': 'arcane',
  'Archwing': 'vehicle',
  'Railjack': 'vehicle',
  'Pets': 'companion',
  'Sentinels': 'companion',
};

export function normalizeEntityTaxonomy(
  raw: { 
    name: string; 
    uniqueName?: string | null;
    productCategory?: string | null; 
    category?: string | null; 
    type?: string | null; 
    weaponClass?: string | null;
    tags?: string[] | null 
  }
): EntityTaxonomy {
  const productCategory = raw.productCategory || '';
  const category = raw.category || '';
  const name = raw.name.toLowerCase();
  const uniqueName = (raw.uniqueName || '').toLowerCase();
  const tags = (raw.tags || []).map(t => t.toLowerCase());

  const isPart = uniqueName.includes('/modular/') || uniqueName.includes('/parts/') || tags.includes('component');
  if (isPart && !tags.includes('weapon') && !tags.includes('warframe')) {
    return { domain: 'unknown' as any, kind: 'unknown' as any, tags };
  }

  // PRIORIDAD: 
  // 1. Necramechs (PCat MechSuits) -> vehicle (aunque cat sea Warframes)
  // 2. Compañeros (Cat Pets/Sentinels) -> companion (aunque PCat sea Pistols)
  let domain: ItemDomain = 'unknown' as ItemDomain;
  if (productCategory === 'MechSuits') {
    domain = 'vehicle';
  } else if (category === 'Pets' || category === 'Sentinels') {
    domain = 'companion';
  } else if (category === 'Warframes' || category === 'Mods' || category === 'Arcanes') {
    domain = CATEGORY_TO_DOMAIN[category];
  } else {
    domain = PRODUCT_CATEGORY_TO_DOMAIN[productCategory] || CATEGORY_TO_DOMAIN[category] || 'unknown' as ItemDomain;
  }
  
  let kind: ItemKind = 'unknown' as any; 
  let family: ItemFamily | undefined = undefined;

  if (domain === 'warframe') kind = 'warframe';
  if (domain === 'mod') kind = 'mod';
  if (domain === 'arcane') kind = 'arcane';
  
  if (domain === 'weapon') {
    if (productCategory === 'LongGuns' || category === 'Primary') kind = 'primary';
    else if (productCategory === 'Pistols' || category === 'Secondary') kind = 'secondary';
    else if (productCategory === 'Melee' || category === 'Melee') kind = 'melee';
    else if (productCategory === 'SpaceGuns' || category === 'Arch-Gun') kind = 'archgun';
    else if (productCategory === 'SpaceMelee' || category === 'Arch-Melee') kind = 'archmelee';
    else if (productCategory === 'SentinelWeapons') {
      const type = raw.type?.toLowerCase() || '';
      kind = type.includes('melee') ? 'melee' : 'primary';
    } else {
      kind = 'primary';
    }
  }

  if (domain === 'companion') {
    if (productCategory === 'Sentinels' || category === 'Sentinels') kind = 'sentinel';
    else if (productCategory === 'KubrowPets' || category === 'Pets' || productCategory === 'Pets' || productCategory === 'Pistols') {
      const type = raw.type?.toLowerCase() || '';
      const un = uniqueName;
      if (type.includes('hound') || un.includes('hound')) kind = 'hound';
      else if (type.includes('moa') || un.includes('moa')) kind = 'moa';
      else kind = 'pet';
    } else {
      kind = 'pet';
    }
  }

  if (domain === 'vehicle') {
    if (productCategory === 'MechSuits') kind = 'necramech';
    else kind = 'archwing';
  }

  const rawType = (raw.type || '').toLowerCase();

  if (domain === 'warframe') family = 'warframe';
  else if (domain === 'weapon') family = (rawType as ItemFamily) || 'unknown';
  else if (domain === 'companion') family = 'companion';
  else if (domain === 'mod') family = 'mod';
  else if (domain === 'vehicle') family = 'vehicle';
  else if (domain === 'arcane') family = 'arcane';

  if (name.includes(' prime') || tags.includes('prime')) family = 'prime';
  else if (name.includes('kuva ')) family = 'kuva';
  else if (name.includes('tenet ')) family = 'tenet';
  else if (name.includes('prisma ')) family = 'prisma';
  else if (name.includes('wraith')) family = 'wraith';
  else if (name.includes('vandal')) family = 'vandal';
  
  const isRobotic = tags.includes('robotic') || productCategory === 'Sentinels' || productCategory === 'SentinelWeapons' || category === 'Sentinels';
  const isBeast = tags.includes('beast') || tags.includes('animal') || tags.includes('kavat') || tags.includes('kubrow') || productCategory === 'KubrowPets' || category === 'Pets';

  if (isRobotic) family = 'robotic';
  else if (isBeast) family = 'beast';
  else if (tags.includes('infested')) family = 'infested';

  if (name.includes(' prime') || tags.includes('prime')) family = 'prime';

  if (domain === 'mod') {
    if (tags.includes('augment')) family = 'augment';
    else if (tags.includes('exilus')) family = 'exilus';
    else if (tags.includes('stance')) family = 'stance';
  }

  // FALLBACK GUARD: Inyección heurística + Datos de la Wiki (weaponClass)
  if (kind === 'melee' || kind === 'primary' || kind === 'secondary') {
    const un = uniqueName;
    const wc = (raw.weaponClass || '').toLowerCase();
    
    // Inyección basada en weaponClass de la Wiki (Prioridad)
    if (wc.includes('sword') || wc.includes('katana') || wc.includes('rapier')) tags.push('sword');
    if (wc.includes('polearm') || wc.includes('staff') || wc.includes('scythe') || wc.includes('trident')) tags.push('polearm');
    if (wc.includes('hammer') || wc.includes('mace')) tags.push('hammer');
    if (wc.includes('dagger')) tags.push('dagger');
    if (wc.includes('heavy blade')) tags.push('heavy_blade');
    if (wc.includes('fist') || wc.includes('sparring') || wc.includes('nunchaku')) tags.push('fist');
    if (wc.includes('glaive') || wc.includes('thrown')) tags.push('glaive');
    if (wc.includes('gunblade')) tags.push('gunblade');
    if (wc.includes('whip')) tags.push('whip');
    if (wc.includes('sniper')) tags.push('sniper');
    if (wc.includes('bow')) tags.push('bow');
    if (wc.includes('shotgun')) tags.push('shotgun');

    // Heurística basada en uniqueName (Fallback de segundo nivel)
    if (tags.length === (raw.tags || []).length) { // Si no inyectamos nada arriba
      if (un.includes('sword') || un.includes('katana') || un.includes('machete') || un.includes('blade')) tags.push('sword');
      if (un.includes('polearm') || un.includes('staff') || un.includes('stave') || un.includes('halberd') || un.includes('scythe')) tags.push('polearm');
      if (un.includes('hammer') || un.includes('mace') || un.includes('fragor') || un.includes('magistar')) tags.push('hammer');
      if (un.includes('dagger')) tags.push('dagger');
    }
  }

  // Inyección de tags para Companions
  if (domain === 'companion') {
    if (kind === 'sentinel') tags.push('sentinel', 'robotic');
    if (kind === 'hound') tags.push('hound', 'robotic');
    if (kind === 'moa') tags.push('moa', 'robotic');
    if (kind === 'pet') {
      const un = uniqueName;
      if (un.includes('kavat')) tags.push('kavat', 'beast');
      if (un.includes('kubrow')) tags.push('kubrow', 'beast');
      if (un.includes('predasite')) tags.push('predasite', 'beast');
      if (un.includes('vulpaphyla')) tags.push('vulpaphyla', 'beast');
    }
  }

  return { domain, kind, family, tags };
}
