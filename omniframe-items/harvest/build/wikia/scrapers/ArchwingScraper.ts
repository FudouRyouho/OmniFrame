// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/ArchwingScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformWarframe from '../transformers/transformWarframe';
import type { WikiaArchwing } from '../../types/shared';

export default class ArchwingScraper extends WikiaDataScraper<WikiaArchwing> {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Warframes/data?action=edit', 'Archwing', transformWarframe);
  }
}
