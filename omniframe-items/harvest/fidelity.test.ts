import { test } from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const files = [
  ...['readJson.ts', 'stringify.ts', 'dedupe.ts', 'objectsort.ts', 'progress.ts', 'proxyAgent.ts', 'network.ts', 'sleep.ts', 'tradable.ts', 'types/shared.ts', 'wikia/JSON.lua'].map((file) => `build/${file}`),
  ...['bpConflicts', 'dt_map', 'itemTypes', 'locales', 'masterableCategories', 'overrides', 'polarities', 'relicGrades', 'variants'].map((file) => `config/${file}.json`),
]

for (const file of files) {
  test(`fidelidad: ${file}`, async (t) => {
    const clone = new URL('../../warframe-items/', import.meta.url)
    try { await access(clone) } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') { t.skip('Clon warframe-items ausente; fidelidad no verificada'); return }
      throw error
    }
    const actual = await readFile(new URL(file, import.meta.url))
    const original = await readFile(new URL(file, clone))
    const prefix = Buffer.from('// [omniframe] ')
    let start = 0
    while (actual.subarray(start, start + prefix.length).equals(prefix)) {
      const end = actual.indexOf(10, start)
      assert.notEqual(end, -1, 'Cabecera sin salto de línea')
      start = end + 1
    }
    // El repo exige LF; el clon puede traer CRLF en el checkout. Se compara sin esa diferencia.
    const lf = (bytes: Buffer): string => bytes.toString('utf8').replace(/\r\n/g, '\n')
    assert.equal(lf(actual.subarray(start)), lf(original))
  })
}
