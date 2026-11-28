// [omniframe] Copia fiel de warframe-items/build/wikia/transformers/transformVersion.ts (WFCD/warframe-items, commit 5056d7f30, MIT).
// [omniframe] Sin cambios fuera de estas líneas; procedencia y licencia en omniframe-items/THIRD_PARTY_NOTICES.md.
import type { WikiaVersion } from '../../types/shared';

interface OldVersion {
  Name?: string;
  Link?: string;
  Date?: string;
  Parent?: string;
  Aliases?: string[];
  [key: string]: unknown;
}

export default (oldVersion: OldVersion): WikiaVersion | undefined => {
  let newVersion: WikiaVersion | undefined;

  if (!oldVersion.Name) {
    return undefined;
  }

  try {
    const { Name, Link, Date, Parent, Aliases } = oldVersion;
    const linkTarget = Link?.trim() ?? Name;
    newVersion = {
      name: Name,
      url: `https://wiki.warframe.com/w/${encodeURIComponent(linkTarget.replace(/\s/g, '_'))}`,
      aliases: Aliases ?? [],
      parent: Parent,
      date: Date,
    };
  } catch (error) {
    console.error(`Error parsing ${oldVersion.Name}`);
    console.error(error);
  }
  return newVersion;
};
