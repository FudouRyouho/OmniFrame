// [omniframe] Copia fiel de warframe-items/build/wikia/scrapers/VersionScraper.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import WikiaDataScraper from '../WikiaDataScraper';
import transformVersion from '../transformers/transformVersion';
import type { WikiaVersion } from '../../types/shared';

export default class VersionScraper extends WikiaDataScraper<WikiaVersion> {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Version/data?action=edit', 'Version', transformVersion);
  }
}
