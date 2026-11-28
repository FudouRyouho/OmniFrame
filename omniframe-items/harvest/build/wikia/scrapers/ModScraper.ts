// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/ModScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformMod from '../transformers/transformMod';
import type { WikiaMod } from '../../types/shared';

export default class ModScraper extends WikiaDataScraper<WikiaMod> {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Mods/data?action=edit', 'Mod', transformMod);
  }
}
