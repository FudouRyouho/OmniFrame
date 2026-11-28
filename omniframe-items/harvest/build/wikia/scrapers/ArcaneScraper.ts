// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/ArcaneScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformArcanes from '../transformers/transformArcanes';
import type { WikiaArcane } from '../../types/shared';

export default class ArcaneScraper extends WikiaDataScraper<WikiaArcane> {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Arcane/data?action=edit', 'Arcane', transformArcanes);
  }
}
