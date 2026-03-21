# Scraper Module System in `warframe-items`

> Estado: referencia
> Última actualización: 2026-03-19

## Overall Architecture

The build pipeline is orchestrated by `build/build.mjs`, which coordinates four main modules: the `scraper`, `parser`, `hashManager`, and image processing. The flow is:

```mermaid
graph TD
  "build.mjs (orchestrator)" --> "scraper.mjs"
  "build.mjs (orchestrator)" --> "parser.mjs"
  "build.mjs (orchestrator)" --> "hashManager.mjs"
  "scraper.mjs" --> "Warframe API (origin/content.warframe.com)"
  "scraper.mjs" --> "drops.warframestat.us"
  "scraper.mjs" --> "@wfcd/patchlogs"
  "scraper.mjs" --> "wiki.warframe.com (Wikia)"
  "scraper.mjs" --> "@wfcd/relics (RelicGenerator)"
  "scraper.mjs" --> "WikiaDataScraper sub-modules"
  "WikiaDataScraper sub-modules" --> "WeaponScraper"
  "WikiaDataScraper sub-modules" --> "WarframeScraper"
  "WikiaDataScraper sub-modules" --> "ModScraper"
  "WikiaDataScraper sub-modules" --> "ArcaneScraper"
  "WikiaDataScraper sub-modules" --> "ArchwingScraper"
  "WikiaDataScraper sub-modules" --> "CompanionScraper"
  "WikiaDataScraper sub-modules" --> "VaultScraper"
  "WikiaDataScraper sub-modules" --> "VersionScraper"
  "parser.mjs" --> "data/json/*.json (output)"
  "hashManager.mjs" --> "data/cache/.export.json"
```

---

## 1. The Build Orchestrator (`build/build.mjs`)

`build/build.mjs` is the entry point. It:
1. Calls `scraper.checkOriginServerAvailability()`, then `hashManager.updateExportCache()` to skip the build if nothing changed.
2. Assembles a `raw` object from **all scraper methods**, passing it to `parser.parse(raw)`.
3. Writes category JSON files to `data/json/`, images to `data/img/`, and a warnings file. [1](#1-0) 

The `applyCustomCategories` method further splits items by their `productCategory` when it matches the `allowedCustomCategories` list (e.g., `SentinelWeapons`). [2](#1-1) [3](#1-2) 

---

## 2. The Central Scraper (`build/scraper.mjs`)

The `Scraper` class is a **single exported singleton** (`export default new Scraper()`). It exposes five distinct data-fetching methods, each corresponding to a different upstream source: [4](#1-3) 

### Method 1: `fetchResources()` — Warframe API (primary game data)

Fetches all `Export*.json` endpoints from `content.warframe.com` for English and all supported locales (defined in `config/locales.json`). It also handles special merging logic:
- `ExportSortieRewards` gets Nightwave challenges appended.
- `ExportWeapons` gets Railjack weapons appended.
- `ExportWarframes` gets a synthetic **Helminth** entry constructed from `ExportAbilities`. [5](#1-4) [6](#1-5) 

The locales fetched are: [7](#1-6) 

### Method 2: `fetchImageManifest()` — Image Manifest

Fetches the image manifest from `content.warframe.com` to map `uniqueName` → `textureLocation`. [8](#1-7) 

### Method 3: `fetchDropRates()` — Drop Rate Data

Fetches drop data from `drops.warframestat.us`. [9](#1-8) 

### Method 4: `fetchPatchLogs()` — Patch Logs

Returns the `patchlogs` object from the `@wfcd/patchlogs` npm package (no HTTP call). [10](#1-9) 

### Method 5: `fetchWikiaData()` — Wikia Data (multiple sub-scrapers)

Orchestrates **8 Wikia sub-scrapers** plus a Cheerio HTML scrape for Ducat prices: [11](#1-10) 

### Method 6: `generateRelicData()` — Relic Data

Uses the `@wfcd/relics` `RelicGenerator` to produce structured relic data. [12](#1-11) 

---

## 3. The Wikia Sub-Scraper System

### Base Class: `build/wikia/WikiaDataScraper.mjs`

All Wikia sub-scrapers (except `VaultScraper`) extend `WikiaDataScraper`. Its constructor accepts:
- `url` (single string) or `urls` (array of strings) pointing to a Wikia Lua data module (`?action=edit`)
- `luaObjectName` — the Lua variable name (e.g., `"Weapon"`, `"Warframe"`)
- `transformFunction` — a transformer function applied to each Lua-parsed item [13](#1-12) 

The `scrape()` method:
1. Fetches the raw Lua text with `getLuaData(url)` using Cheerio to extract the `#wpTextbox1` textarea.
2. Converts Lua to JSON using a temporary Lua runtime (`lua` CLI + `JSON.lua`).
3. Fetches image URLs via the Wikia MediaWiki API (batches of 50).
4. Runs each raw item through `this.transformFunction`. [14](#1-13) [15](#1-14) 

### Existing Wikia Sub-Scrapers

| Class | Source URL | Transformer |
|---|---|---|
| `WeaponScraper` | `Module:Weapons/data/{submodule}` (8 submodules) | `transformWeapon` |
| `WarframeScraper` | `Module:Warframes/data` | `transformWarframe` |
| `ModScraper` | `Module:Mods/data` | `transformMod` |
| `ArcaneScraper` | `Module:Arcane/data` | `transformArcanes` |
| `ArchwingScraper` | `Module:Warframes/data` | `transformWarframe` |
| `CompanionScraper` | `Module:Companions/data` | `transformCompanion` |
| `VersionScraper` | `Module:Version/data` | `transformVersion` |
| `AbilityScraper` | `Module:Ability/data/stats` | `transformAbility` |
| `VaultScraper` | `Prime_Vault` (HTML) | *(custom scrape, no base class)* |

---

## 4. The Network Layer (`build/network.mjs`)

All HTTP fetches go through `build/network.mjs`, which exports `get`, `getJSON`, and `retryAttempts`. It supports optional SOCKS5/HTTPS proxy via `build/proxyAgent.mjs`. [24](#1-23) [25](#1-24) 

---

## 5. The Hash Manager (`build/hashManager.mjs`)

Before any build work, `hashManager.updateExportCache()` checks whether any upstream data has changed by comparing MD5 hashes of the API endpoints, image manifest, drop rates, and patchlogs against the cached values in `data/cache/.export.json`. If nothing changed and `--force` is not set, the build exits early. [26](#1-25) [27](#1-26) 

---

## 6. The Parser (`build/parser.mjs`)

`parser.parse(raw)` receives the full `RawItemData` object (api, manifest, drops, patchlogs, wikia, relics, i18n) and for each API category runs `process()` → `filter()`, which chains:

- `addType`, `addDamage`, `sanitize`, `addImageName`, `addCategory`, `addTradable`
- `addDucats`, `addDropRate`, `addPatchlogs`, `addAdditionalWikiaData`
- `addIsPrime`, `addVaultData`, `addResistanceData`, `addRelics`, `applyMasterable`, `applyOverrides` [28](#1-27) 

Notably, **Warframe abilities are already handled** in the `sanitize` step, which maps the raw `abilities` array (each with `abilityUniqueName`, `abilityName`, `description`) to a clean `{ uniqueName, name, description }` format, and images are also fetched for each ability in `build/build.mjs`: [29](#1-28) [30](#1-29) 

The raw `ExportAbilities` data is injected into the Warframes category inside the scraper itself: [31](#1-30) 

---

## How to Add a New Data Source

### Adding a new Wikia sub-scraper (e.g., for a new item type)

1. **Create a transformer** in `build/wikia/transformers/transformNewThing.mjs` — an async function `(rawItem, imageUrls, blueprints) => transformedItem`.
2. **Create a scraper** in `build/wikia/scrapers/NewThingScraper.mjs` extending `WikiaDataScraper`, passing the Wikia Lua module URL, Lua object name, and transformer.

   Pattern to follow: [18](#1-17) 

3. **Import and instantiate** the new scraper in `build/scraper.mjs`'s `fetchWikiaData()` method and add its result to the returned object. [32](#1-31) [33](#1-32) 

4. **Consume the new data** in `build/parser.mjs`'s `filter()` or `addAdditionalWikiaData()` methods, using the new property from `data.wikia`. [34](#1-33) 

### Adding a completely new HTTP data source (non-Wikia)

Add a new method to the `Scraper` class in `build/scraper.mjs` using `get`/`getJSON` from `build/network.mjs`, then call it in `build/build.mjs`'s `init()` and add the result to the `raw` object passed to `parser.parse(raw)`. If the new source should be cache-checked, also add its hash tracking to `hashManager.updateExportCache()`. [35](#1-34) 

---

## Notes

- The `build/` directory does not appear in `glob_search` results but its files are present and readable — this is a quirk of the tool's indexing, not a missing directory.
- `VaultScraper` is the **only** Wikia scraper that does **not** extend `WikiaDataScraper` — it scrapes HTML directly using Cheerio instead of a Lua data module.
- Warframe **abilities** are already fully supported: raw `ExportAbilities` data is attached to Warframes in `scraper.mjs` (including the synthetic Helminth entry), then sanitized in `parser.mjs`, and their images are fetched in `build.mjs`. To add *more* ability data (e.g., Wikia ability stats), you would need a new Wikia Lua module scraper and merge step in `addAdditionalWikiaData`.
- The `i18nAllowedKeys` in `parser.applyI18n` explicitly includes `"abilities"`, meaning ability data is already internationalized across the 14 supported locales. [36](#1-35)

### Citations

**File:** build/build.mjs (L20-21)
```javascript
const allowedCustomCategories = ['SentinelWeapons'];

```

**File:** build/build.mjs (L27-37)
```javascript
const force = process.argv.slice(2).some((arg) => ['--force', '-f'].includes(arg)) || process.env.FORCE === 'true';

class Build {
  async init() {
    await scraper.checkOriginServerAvailability();

    await hashManager.updateExportCache();
    if (!force && hashManager.isUpdated) {
      console.log('Data already up-to-date');
      return;
    }
```

**File:** build/build.mjs (L39-56)
```javascript
    const resources = await scraper.fetchResources();
    /** @type {RawItemData} */
    const raw = {
      api: resources.en,
      manifest: await scraper.fetchImageManifest(),
      drops: await scraper.fetchDropRates(),
      patchlogs: await scraper.fetchPatchLogs(),
      wikia: await scraper.fetchWikiaData(),
      relics: await scraper.generateRelicData(),
      i18n: resources,
    };
    const parsed = parser.parse(raw);
    const data = this.applyCustomCategories(parsed.data);
    const i18n = parser.applyI18n(data, raw.i18n);
    const all = await this.saveJson(data, i18n);
    await this.saveWarnings(parsed.warnings);
    await this.saveImages(all, raw.manifest);
    await this.updateReadme(raw.patchlogs);
```

**File:** build/build.mjs (L76-104)
```javascript
  applyCustomCategories(data) {
    const result = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const chunk of data) {
      if (chunk.category === 'Recipes') continue; // Skip blueprints

      for (let i = 0; i < chunk.data.length; i += 1) {
        const item = chunk.data[i];

        // write an additional file for the desired custom categories
        if (item.productCategory && allowedCustomCategories.includes(item.productCategory)) {
          if (result[item.productCategory]) {
            result[item.productCategory].push(item);
          } else {
            result[item.productCategory] = [item];
          }
          continue;
        }

        if (result[item.category]) {
          result[item.category].push(item);
        } else {
          result[item.category] = [item];
        }
      }
    }

    return result;
  }
```

**File:** build/build.mjs (L194-200)
```javascript
      if (item.abilities) {
        // eslint-disable-next-line no-restricted-syntax
        for (const ability of item.abilities) {
          await this.saveImage(ability, false, duplicates, manifest);
        }
      }
      bar.tick();
```

**File:** build/scraper.mjs (L1-17)
```javascript
import lzma from 'lzma';
import { load } from 'cheerio';
import { Generator as RelicGenerator } from '@wfcd/relics';
import patchlogs from '@wfcd/patchlogs';

import Progress from './progress.mjs';
import ArcaneScraper from './wikia/scrapers/ArcaneScraper.mjs';
import ArchwingScraper from './wikia/scrapers/ArchwingScraper.mjs';
import CompanionScraper from './wikia/scrapers/CompanionScraper.mjs';
import ModScraper from './wikia/scrapers/ModScraper.mjs';
import WeaponScraper from './wikia/scrapers/WeaponScraper.mjs';
import WarframeScraper from './wikia/scrapers/WarframeScraper.mjs';
import VaultScraper from './wikia/scrapers/VaultScraper.mjs';
import VersionScraper from './wikia/scrapers/VersionScraper.mjs';
import readJson from './readJson.mjs';
import sleep from './sleep.mjs';
import { get, getJSON, retryAttempts } from './network.mjs';
```

**File:** build/scraper.mjs (L26-30)
```javascript
class Scraper {
  endpointCache = new Map();

  originServerAvailable = false;

```

**File:** build/scraper.mjs (L82-155)
```javascript
  async fetchResources() {
    const endpoints = await this.fetchEndpoints();
    const result = [];
    const i18nEndpoints = {};
    await Promise.all(
      locales.map(async (locale) => {
        i18nEndpoints[locale] = await this.fetchEndpoints(false, locale);
      })
    );
    const totalEndpoints =
      i18nEndpoints[Object.keys(i18nEndpoints)[0]].length * Object.keys(i18nEndpoints).length + endpoints.length;
    const bar = new Progress('Fetching API Endpoints', totalEndpoints);

    const fetchEndpoint = async (endpoint) => {
      const category = endpoint.replace('Export', '').replace(/_[a-z]{2}\.json.*/, '');
      const raw = await getJSON(`https://content.warframe.com/PublicExport/Manifest/${endpoint}`, true);
      const data = raw ? raw[`Export${category}`] : undefined;
      bar.tick();

      if (category === 'SortieRewards') {
        data.push(...raw.ExportNightwave.challenges);
      }

      if (category === 'Weapons') data.push(...raw.ExportRailjackWeapons);

      if (category === 'Warframes') {
        const helminth = {
          uniqueName: '/Lotus/Powersuits/PowersuitAbilities/Helminth',
          name: 'Helminth',
          health: 0,
          shield: 0,
          armor: 0,
          stamina: 0,
          power: 0,
          abilities: raw.ExportAbilities,
        };

        data.push(helminth);
      }

      if (category === 'Upgrades') {
        const modSets = raw.ExportModSet.map((modSet) => ({
          ...modSet,
          type: 'Mod Set',
        }));
        data.push(...modSets, ...raw.ExportAvionics, ...raw.ExportFocusUpgrades);
      }

      return { category, data };
    };

    await Promise.all(
      endpoints.map(async (endpoint) => {
        result.push(await fetchEndpoint(endpoint));
      })
    );

    const i18n = {
      en: result,
    };

    // Request i18n sequentially by locale to avoid getting randomly stuck in some computers
    // It is roughly the same speed as the "all async" method but is always successfull
    for (let i = 0; i < locales.length; i += 1) {
      const locale = locales[i];
      i18n[locale] = [];
      await Promise.all(
        i18nEndpoints[locale].map(async (endpoint) => {
          i18n[locale].push(await fetchEndpoint(endpoint));
        })
      );
    }
    return i18n;
  }
```

**File:** build/scraper.mjs (L172-181)
```javascript
  async fetchImageManifest(skipProgress) {
    const bar = skipProgress ? undefined : new Progress('Fetching Image Manifest', 1);
    const endpoint = await this.fetchEndpoints(true);
    const manifest = (await getJSON(`https://content.warframe.com/PublicExport/Manifest/${endpoint}`, true)).Manifest;
    if (!skipProgress) {
      bar.tick();
    }

    return manifest;
  }
```

**File:** build/scraper.mjs (L188-196)
```javascript
  async fetchDropRates(skipProgress) {
    const bar = skipProgress ? undefined : new Progress('Fetching Drop Rates', 1);
    const rates = await getJSON('https://drops.warframestat.us/data/all.slim.json', true);
    if (!skipProgress) {
      bar.tick();
    }

    return rates;
  }
```

**File:** build/scraper.mjs (L203-210)
```javascript
  async fetchPatchLogs(skipProgress) {
    const bar = skipProgress ? undefined : new Progress('Fetching Patchlogs', 1);
    if (!skipProgress) {
      bar.tick();
    }

    return patchlogs;
  }
```

**File:** build/scraper.mjs (L226-275)
```javascript
  async fetchWikiaData() {
    const bar = new Progress('Fetching Wikia Data', 9);
    const ducats = [];
    const ducatsWikia = await get('https://wiki.warframe.com/w/Ducats/Prices/All', true);
    const $ = load(ducatsWikia);

    $('.mw-content-text table tbody tr').each(function () {
      const name = $(this).find('td:nth-of-type(1) a:nth-of-type(2)').text();
      const value = $(this).find('td:nth-of-type(3)').attr('data-sort-value');
      ducats.push({ name, ducats: Number.parseInt(value, 10) });
    });
    bar.tick();

    await sleep(100);
    const weapons = await new WeaponScraper().scrape();
    bar.tick();
    await sleep(100);
    const warframes = await new WarframeScraper().scrape();
    bar.tick();
    await sleep(100);
    const mods = await new ModScraper().scrape();
    bar.tick();
    await sleep(100);
    const arcanes = await new ArcaneScraper().scrape();
    bar.tick();
    await sleep(100);
    const versions = await new VersionScraper().scrape();
    bar.tick();
    await sleep(100);
    const archwings = await new ArchwingScraper().scrape();
    bar.tick();
    await sleep(100);
    const companions = await new CompanionScraper().scrape();
    bar.tick();
    await sleep(100);
    const vaultData = await new VaultScraper().scrape();
    bar.tick();

    return {
      weapons,
      warframes,
      mods,
      versions,
      ducats,
      archwings,
      companions,
      arcanes,
      vaultData,
    };
  }
```

**File:** build/scraper.mjs (L281-291)
```javascript
  async generateRelicData() {
    const bar = new Progress('Generating Relic Data', 1);
    const relicGenerator = new RelicGenerator();
    try {
      const relicData = await relicGenerator.generate();
      bar.tick();
      return relicData;
    } catch (e) {
      console.error(e);
    }
  }
```

**File:** config/locales.json (L1-1)
```json
["de","fr","it","ko","es","zh","ru","ja","pl","pt","tc","th","tr","uk"]
```

**File:** build/wikia/WikiaDataScraper.mjs (L14-58)
```javascript
const getLuaData = async (url) => {
  try {
    const $ = load(await fetch(url).then((data) => data.text()));
    return $('#wpTextbox1').text();
  } catch (err) {
    console.error('Failed to fetch latest Lua data:');
    console.error(err);
    return '';
  }
};

const convertLuaDataToJson = async (luaData, luaDataName) => {
  const objReturn = `return ${luaDataName}Data`;
  const hasObjReturn = luaData.includes(objReturn);

  const modifiedScript = hasObjReturn
    ? luaData.replace(objReturn, '')
    : luaData.replace('return {', `local ${luaDataName}Data = {`);

  // Add JSON conversion
  const luaToJsonScript = `JSON = (loadfile "build/wikia/JSON.lua")()
${modifiedScript}
print(JSON:encode(${luaDataName}Data))
`;

  // Run updated JSON lua script
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'temp-'));
  const lua = path.join(temp, 'dataraw.lua');
  const json = path.join(temp, 'dataraw.json');
  await fs.writeFile(path.join(temp, 'dataraw.lua'), luaToJsonScript, {
    encoding: 'utf8',
    flag: 'w',
  });

  try {
    await run(`lua ${lua} > ${json}`);
    const dataRaw = await fs.readFile(json, { encoding: 'utf8' });
    return JSON.parse(dataRaw);
  } catch (err) {
    console.error(`Failed to execute modified lua script:\n${err}`);
    console.error(err);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
};
```

**File:** build/wikia/WikiaDataScraper.mjs (L123-135)
```javascript
export default class WikiaDataScraper {
  constructor(url, luaObjectName, transformFunction) {
    if (Array.isArray(url)) {
      this.urls = url;
    } else {
      this.url = url;
    }
    this.luaObjectName = luaObjectName;
    this.transformFunction = transformFunction;
    if (typeof transformFunction === 'undefined') {
      this.transformFunction = defaultTransform;
    }
  }
```

**File:** build/wikia/WikiaDataScraper.mjs (L137-189)
```javascript
  async scrape() {
    const jsonData = {};
    jsonData[`${this.luaObjectName}s`] = {};
    if (this.url) {
      const luaData = await getLuaData(this.url);
      const jTemp = await convertLuaDataToJson(luaData, this.luaObjectName);
      Object.keys(jTemp).forEach((key) => {
        if (!jTemp[key].name) {
          jsonData[`${this.luaObjectName}s`] = {
            ...jsonData[`${this.luaObjectName}s`],
            ...jTemp,
          };
        }
      });
    } else if (this.urls.length) {
      await Promise.all(
        this.urls.map(async (url) => {
          const luaData = await getLuaData(url);
          const jTemp = await convertLuaDataToJson(luaData, this.luaObjectName);
          jsonData[`${this.luaObjectName}s`] = {
            ...jsonData[`${this.luaObjectName}s`],
            ...jTemp,
          };
        })
      );
    }
    if (jsonData[`${this.luaObjectName}s`][`${this.luaObjectName}s`]) {
      jsonData[`${this.luaObjectName}s`] = jsonData[`${this.luaObjectName}s`][`${this.luaObjectName}s`];
    }

    if (!Object.keys(jsonData).length) {
      throw new Error('No json data');
    }
    const imageUrls = await getImageUrls(jsonData[`${this.luaObjectName}s`]);

    const things = [];

    try {
      await Promise.all(
        Object.keys(jsonData[`${this.luaObjectName}s`]).map(async (thingName) => {
          const thingToTransform = jsonData[`${this.luaObjectName}s`][thingName];
          if (thingToTransform && !thingToTransform.Name) thingToTransform.Name = thingName;
          const transformedThing = await this.transformFunction(thingToTransform, imageUrls, blueprints);
          things.push(transformedThing);
        })
      );
      things.sort(nameCompare);
    } catch (e) {
      console.error(e.stack);
    }
    if (!things.length) console.error(`scraped no ${this.luaObjectName}`);
    return things;
  }
```

**File:** build/wikia/scrapers/WeaponScraper.mjs (L1-16)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformWeapon from '../transformers/transformWeapon.mjs';

const base = 'https://wiki.warframe.com/w/Module:Weapons/data';
const suffix = '?action=edit';
const subModules = ['archwing', 'companion', 'melee', 'misc', 'modular', 'primary', 'secondary', 'railjack'];

export default class WeaponScraper extends WikiaDataScraper {
  constructor() {
    super(
      subModules.map((subModule) => `${base}/${subModule}${suffix}`),
      'Weapon',
      transformWeapon
    );
  }
}
```

**File:** build/wikia/scrapers/WarframeScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformWarframe from '../transformers/transformWarframe.mjs';

export default class WarframeScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Warframes/data?action=edit', 'Warframe', transformWarframe);
  }
}
```

**File:** build/wikia/scrapers/ModScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformMod from '../transformers/transformMod.mjs';

export default class ModScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Mods/data?action=edit', 'Mod', transformMod);
  }
}
```

**File:** build/wikia/scrapers/ArcaneScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformArcanes from '../transformers/transformArcanes.mjs';

export default class ArcaneScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Arcane/data?action=edit', 'Arcane', transformArcanes);
  }
}
```

**File:** build/wikia/scrapers/ArchwingScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformWarframe from '../transformers/transformWarframe.mjs';

export default class ArchwingScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Warframes/data?action=edit', 'Archwing', transformWarframe);
  }
}
```

**File:** build/wikia/scrapers/CompanionScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformCompanion from '../transformers/transformCompanion.mjs';

export default class CompanionScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Companions/data?action=edit', 'Companion', transformCompanion);
  }
}
```

**File:** build/wikia/scrapers/VersionScraper.mjs (L1-8)
```javascript
import WikiaDataScraper from '../WikiaDataScraper.mjs';
import transformVersion from '../transformers/transformVersion.mjs';

export default class VersionScraper extends WikiaDataScraper {
  constructor() {
    super('https://wiki.warframe.com/w/Module:Version/data?action=edit', 'Version', transformVersion);
  }
}
```

**File:** build/wikia/scrapers/VaultScraper.mjs (L1-79)
```javascript
import { load } from 'cheerio';

import { get } from '../../network.mjs';

export default class VaultScraper {
  /**
   * Formatted date string. Format: "YYYY-MM-DD"
   * @typedef {string} VaultDateStamp
   */
  /**
   * @typedef {Object} VaultData
   * @property {string} name name of the vaulted item
   * @property {boolean} vaulted whether the item is vaulted or not
   * @property {VaultDateStamp} [estimatedVaultDate] estimated vault date
   * @property {VaultDateStamp} [vaultDate] vault date, only available if the item is vaulted
   */
  /**
   * Get (estimated) vault dates from wiki.
   * @returns {Array<VaultData>}
   */
  async scrape() {
    const vaultInfoWikia = await get('https://wiki.warframe.com/w/Prime_Vault', true, true);
    const $ = load(vaultInfoWikia);
    // Since data attributes are generated aferwards, we cannot rely on them to find the tables containing vaulted items
    const tables = $('#mw-customcollapsible-vaulted > div > div > table').toArray();
    const [vaultedItems, formerlyVaulted, notYetVaulted, neverVaulted] = tables;
    if (!vaultedItems || !formerlyVaulted || !notYetVaulted || !neverVaulted) {
      throw new Error('Could not find the tables containing vaulted items on wiki page.');
    }
    const vaultData = [];

    function extractVaultedItems(row) {
      const $row = $(row);
      // For some reason, the first row of each table contains the column headers
      if ($row.find('th').length) {
        return;
      }
      const name =
        $row.find('td:nth-child(1) > span').attr('data-param-name') ?? $row.find('td:nth-child(1) > a').text().trim();
      const vaultDate = $row.find('td:nth-child(2)').text().trim() ?? '';
      if (name && vaultDate) {
        vaultData.push({ name, vaulted: true, vaultDate, estimatedVaultDate: vaultDate });
      }
    }

    function extractNotVaultedItems(row) {
      const $row = $(row);
      // For some reason, the first row of each table contains the column headers
      if ($row.find('th').length) {
        return;
      }
      const name =
        $row.find('td:nth-child(1) > span').attr('data-param-name') ?? $row.find('td:nth-child(1) > a').text().trim();
      if (name) {
        vaultData.push({ name, vaulted: false });
      }
    }

    // We want this items to be listed as vaulted, but they are not listed on the wiki page
    vaultData.push({ name: 'Excalibur Prime', vaulted: true });
    vaultData.push({ name: 'Lato Prime', vaulted: true });
    vaultData.push({ name: 'Skana Prime', vaulted: true });

    $(vaultedItems)
      .find('tbody > tr')
      .each((_, row) => extractVaultedItems(row));
    $(formerlyVaulted)
      .find('tbody > tr')
      .each((_, row) => extractVaultedItems(row));
    $(notYetVaulted)
      .find('tbody > tr')
      .each((_, row) => extractNotVaultedItems(row));
    $(neverVaulted)
      .find('tbody > tr')
      .each((_, row) => extractNotVaultedItems(row));

    return vaultData;
  }
}
```

**File:** build/network.mjs (L1-43)
```javascript
import fetch from 'node-fetch';

import getProxyAgent from './proxyAgent.mjs';

const prod = process.env.NODE_ENV === 'production';

const agent = getProxyAgent();

// eslint-disable-next-line no-control-regex
const sanitize = (str) => str.replace(/\\r|\r?\n|\x09/g, '').replace(/\\\\"/g, "'");

export const get = async (url, disableProxy = !prod, compress = false) => {
  const res = await fetch(url, {
    agent: disableProxy ? undefined : agent,
    headers: {
      'user-agent': 'node-fetch (warframe-items)',
    },
  });
  return compress === false ? Uint8Array.from(await res.buffer()) : res.text();
};

export const getJSON = async (url, disableProxy) => {
  try {
    return JSON.parse(sanitize(await get(url, disableProxy, true)));
  } catch (err) {
    console.error(`failed to get json from ${url}: ${err.message}`);
    process.exit(1);
  }
};

export const retryAttempts = async (numAttempts, workerFn) => {
  while (numAttempts > 0) {
    try {
      return workerFn();
    } catch (error) {
      if (numAttempts > 0) {
        numAttempts -= 1;
      } else {
        throw error;
      }
    }
  }
};
```

**File:** build/proxyAgent.mjs (L1-32)
```javascript
import { HttpsProxyAgent } from 'https-proxy-agent';
import SOCKS5Agent from 'socks5-http-client/lib/Agent.js';

export default () => {
  switch (process.env.PROXY_TYPE) {
    case 'SOCKS5':
      if (process.env.PROXY_SOCKS5_HOST) {
        console.log('SOCKS5 proxy will be used.');
        return new SOCKS5Agent({
          socksHost: process.env.PROXY_SOCKS5_HOST,
          socksPort: process.env.PROXY_SOCKS5_PORT,
          socksUsername: process.env.PROXY_SOCKS5_USER,
          socksPassword: process.env.PROXY_SOCKS5_PASS,
        });
      }
      console.warn('SOCKS5 proxy is selected but no configuration is provided.');
      return undefined;

    case 'HTTPS':
      if (process.env.PROXY_HTTPS_STRING) {
        console.log('HTTPS proxy will be used.');
        return new HttpsProxyAgent(process.env.PROXY_HTTPS_STRING);
      }
      console.warn('HTTPS proxy is selected but no configuration is provided.');
      return undefined;
    default:
      console.log(
        'No proxy will be used. This is most likely fine in development but origin.warframe.com is usually blocked in most servers.'
      );
      return undefined;
  }
};
```

**File:** build/hashManager.mjs (L57-82)
```javascript
  async updateExportCache() {
    const endpoints = [];

    const allLocales = [...locales, 'en'];
    for (let i = 0; i < allLocales.length; i += 1) {
      const locale = allLocales[i];
      endpoints.push(...(await scraper.fetchEndpoints(false, locale)));
    }

    endpoints
      .flat()
      .map((endpoint) => endpoint.split('!00_'))
      .filter(([key, hash]) => key && hash)
      .forEach(([key, hash]) => {
        this.exportCache[key] = { hash };
      });

    const manifest = await scraper.fetchImageManifest(true);
    this.exportCache.Manifest = { hash: hashObject(manifest) };

    const dropRates = await scraper.fetchDropRates(true);
    this.exportCache.DropChances = { hash: hashObject(dropRates) };

    const patchlogs = await scraper.fetchPatchLogs(true);
    this.exportCache.Patchlogs = { hash: hashObject(patchlogs.posts) };
  }
```

**File:** build/parser.mjs (L181-206)
```javascript
  filter(original, category, data) {
    const result = cloneDeep(original);

    if (result.rewardName) result.uniqueName = result.rewardName;
    this.addType(result, data);
    this.addDamage(result);
    this.sanitize(result);
    this.addImageName(result, data.manifest);
    if (result.abilities) {
      result.abilities.forEach((a) => this.addImageName(a, data.manifest));
    }

    this.addCategory(result, category);
    this.addTradable(result);
    this.addDucats(result, data.wikia.ducats);
    this.addDropRate(result, data.drops);
    this.addPatchlogs(result, data.patchlogs);
    this.addAdditionalWikiaData(result, category, data.wikia);
    this.addIsPrime(result);
    this.addVaultData(result, category, data.wikia);
    this.addResistanceData(result, category);
    this.addRelics(result, data.relics, data.drops);
    this.applyMasterable(result);
    this.applyOverrides(result);
    return result;
  }
```

**File:** build/parser.mjs (L397-406)
```javascript
    // Use `name` key for abilities as well.
    if (item.abilities) {
      item.abilities = item.abilities.map((a) => {
        return {
          uniqueName: a.abilityUniqueName,
          name: title(a.abilityName),
          description: a.description,
        };
      });
    }
```

**File:** build/parser.mjs (L907-968)
```javascript
  addAdditionalWikiaData(item, category, wikiaData) {
    if (!['weapons', 'warframes', 'mods', 'upgrades', 'sentinels'].includes(category.toLowerCase())) return;

    const slots = [
      ['Secondary'], // 0
      ['Primary', 'Hound', 'Beast', 'Archgun', 'Robotic', 'Archgun (Atmosphere)', 'Amp'], // 1
      [], // 2
      [], // 3
      ['Archgun'], // 4
      ['Melee', 'Archmelee'], // 5
      [], // 6
      ['Archgun (Atmosphere)', 'Exalted', 'Secondary', 'Primary', 'Melee', 'Archgun', 'Archmelee'], // 7
      [],
      [],
      [],
      [],
      [],
      [],
      ['Railjack Turret'], // 14
    ];

    let wikiCategory = category.toLowerCase();
    if (category === 'Upgrades') wikiCategory = 'mods';
    if (item.category === 'Archwing') wikiCategory = 'archwings';
    if (category === 'Sentinels') wikiCategory = 'companions';

    const wikiaItem = wikiaData[wikiCategory]
      .filter((i) => i)
      .find((i) => {
        const uMatch = i.uniqueName === item.uniqueName;
        let nMatch = true;
        if (category.toLowerCase() === 'weapons' && typeof item.slot !== 'undefined') {
          nMatch = slots[item.slot]?.includes(i.slot);
        }
        return uMatch && nMatch;
      });
    if (!wikiaItem) return;
    item.wikiAvailable = true;

    switch (category.toLowerCase()) {
      case 'sentinels':
      case 'warframes':
        this.addWarframeWikiaData(item, wikiaItem);
        break;
      case 'weapons':
        this.addWeaponWikiaData(item, wikiaItem);
        break;
      case 'upgrades':
        this.addModWikiaData(item, wikiaItem);
        break;
      case 'arcanes':
        this.addArcaneWikiaData(item, wikiaItem);
        break;
      default:
        break;
    }

    item.introduced = wikiaData.versions.find(
      (v) => v.aliases.includes(wikiaItem.introduced) || v.name === wikiaItem.introduced
    );
    if (item.introduced) item.releaseDate = item.introduced.date;
  }
```

**File:** build/parser.mjs (L1232-1240)
```javascript
    const i18nAllowedKeys = [
      'name',
      'description',
      'passiveDescription',
      'abilities',
      'trigger',
      'systemName',
      'levelStats',
    ];
```
