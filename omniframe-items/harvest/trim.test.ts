import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { bootstrapHarvestData } from '../build/harvest-data.ts'

// El grafo del parser carga la wiki al importar; se impide toda red incluso en el clon.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'node-fetch') return { url: 'data:text/javascript,export default function fetch(){return Promise.reject(new Error("red deshabilitada"))}', shortCircuit: true }
  return nextResolve(specifier, context)
} })

test('no se solicitan drops ni ducats', async () => {
  for (const path of ['./build/scraper.ts', './build/hashManager.ts', '../build/raw-build.ts']) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /drops\.warframestat\.us|Ducats\/Prices\/All|fetchDropRates\s*\(/, path)
  }
})

test('parseo conserva los campos ajenos al recorte frente al clon', async (t) => {
  try { await import('lodash.clonedeep') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') { t.skip('Dependencias de harvest ausentes'); return }
    throw error
  }
  // El parser lee `harvest/data` al importarse: se crea igual que lo hace raw-build.
  await bootstrapHarvestData(new URL('./data/', import.meta.url), new URL('../data/cache/.export.json', import.meta.url))
  const { default: parser } = await import('./build/parser.ts')
  const { default: original } = await import('../../warframe-items/build/parser.ts')
  const raw = {
    api: [
      { category: 'Weapons', data: [{ uniqueName: '/Lotus/Weapons/TestPrime', name: 'Test Prime', slot: 1, productCategory: 'LongGuns' }] },
      { category: 'Recipes', data: [{ uniqueName: '/Lotus/Recipes/Test', resultType: '/Lotus/Weapons/TestPrime', buildPrice: 123, buildTime: 42, ingredients: [] }] },
    ],
    manifest: [], drops: [], relics: [], i18n: {},
    patchlogs: { changed: true, posts: [], patchlogs: { getItemChanges: () => [] } },
    wikia: { weapons: [{ name: 'Test Prime', uniqueName: '/Lotus/Weapons/TestPrime', slot: 'Primary', thumbnail: 'img', url: 'url' }], warframes: [], mods: [], versions: [], ducats: [], arcanes: [], archwings: [], companions: [], vaultData: [] },
  }
  const expected = original.parse(structuredCloneForRaw(raw) as never).data
  const actual = parser.parse(structuredCloneForRaw(raw) as never).data
  for (const chunk of expected) for (const item of chunk.data) {
    for (const key of ['components', 'drops', 'ducats', 'buildPrice', 'buildTime', 'skipBuildTimePrice', 'buildQuantity', 'consumeOnBuild', 'itemCount', 'parents']) delete item[key]
  }
  for (const chunk of actual) for (const item of chunk.data) { assert.equal('components' in item, false); assert.equal('drops' in item, false); assert.equal('ducats' in item, false) }
  assert.deepEqual(actual, expected)
})

function structuredCloneForRaw(raw: any): any {
  return { ...structuredClone({ ...raw, patchlogs: undefined }), patchlogs: raw.patchlogs }
}
