import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdir, mkdtemp, writeFile, readFile, access, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import stringify from './build/stringify.ts'
import readJson from './build/readJson.ts'
import dedupe from './build/dedupe.ts'
import objectsort from './build/objectsort.ts'
import originalStringify from '../../warframe-items/build/stringify.ts'
import originalReadJson from '../../warframe-items/build/readJson.ts'
import originalDedupe from '../../warframe-items/build/dedupe.ts'
import originalObjectsort from '../../warframe-items/build/objectsort.ts'

test('equivalencia de utilidades con objetos, arrays y entradas vacías', () => {
  for (const value of [[], {}, [1, 1, 'x'], [{ b: 1, a: [2, 1] }, { a: [2, 1], b: 1 }, { z: { b: 1, a: 2 } }], { z: [1, 1], a: { y: 2, x: 1 } }]) {
    assert.equal(stringify(value), originalStringify(value))
    assert.deepEqual(dedupe(value), originalDedupe(value))
    if (!Array.isArray(value)) assert.deepEqual(objectsort(value), originalObjectsort(value))
  }
})

test('readJson conserva resultados y errores', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'omni-equivalence-'))
  try {
    for (const [name, contents] of [['valid.json', '{"b":2,"a":1}'], ['invalid.json', '{invalid'], ['empty.json', '']] as const) {
      await writeFile(join(dir, name), contents)
    }
    for (const name of ['valid.json', 'invalid.json', 'empty.json', 'missing.json']) {
      const url = pathToFileURL(join(dir, name))
      const outcome = async (fn: typeof readJson) => { try { return { value: await fn(url) } } catch (error) { return { type: (error as Error).constructor.name, message: (error as Error).message } } }
      assert.deepEqual(await outcome(readJson), await outcome(originalReadJson))
    }
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('resolución estática de imports de raw-build', async () => {
  const source = new URL('../build/raw-build.ts', import.meta.url)
  const text = await readFile(source, 'utf8')
  const imports = [...text.matchAll(/^import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
  assert.ok(imports.length > 0)
  for (const specifier of imports) {
    if (specifier.startsWith('node:')) continue
    assert.ok(specifier.startsWith('.'), specifier)
    await access(new URL(specifier, source))
  }
})

test('datos reales sin red', async (t) => {
  const dir = new URL('../data/json/', import.meta.url)
  let files: string[]
  try { files = (await readdir(dir)).filter((f) => f.endsWith('.json')) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') { t.skip('Directorio data/json ausente'); return }
    throw error
  }
  assert.equal(files.length, 16)
  for (const file of files) {
    const url = new URL(file, dir)
    assert.equal(stringify(await readJson(url)), originalStringify(await originalReadJson(url)), file)
  }
})
