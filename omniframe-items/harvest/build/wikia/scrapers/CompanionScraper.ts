// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/CompanionScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformCompanion from '../transformers/transformCompanion';
import type { WikiaCompanion } from '../../types/shared';

export default class CompanionScraper extends WikiaDataScraper<WikiaCompanion> {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Companions/data?action=edit', 'Companion', transformCompanion);
  }
}
