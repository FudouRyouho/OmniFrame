// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/WeaponScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformWeapon from '../transformers/transformWeapon';
import type { WikiaWeapon } from '../../types/shared';

const base = 'https://wiki.warframe.com/w/Module:Weapons/data';
const suffix = '?action=edit';
const subModules = ['archwing', 'companion', 'melee', 'misc', 'modular', 'primary', 'secondary', 'railjack'];

export default class WeaponScraper extends WikiaDataScraper<WikiaWeapon> {
  constructor() {
    super(
      subModules.map((subModule) => `${base}/${subModule}${suffix}`),
      'Weapon',
      transformWeapon
    );
  }
}
