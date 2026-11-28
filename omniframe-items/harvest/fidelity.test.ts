import { test } from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'

// Archivos que divergen a propósito del original: cada uno con su motivo. Si uno
// coincide con el original, la prueba falla para que la excepción no sobreviva sin razón.
const modificados = new Map<string, string>([
  ['build/parser.ts', 'recorte de components, ducats y drops'],
  ['build/scraper.ts', 'sin solicitudes de ducats ni drops'],
  ['build/hashManager.ts', 'sin hash ni solicitud de drops'],
])

const listar = async (dir: URL, base = ''): Promise<string[]> => {
  const salida: string[] = []
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = `${base}${entrada.name}`
    if (entrada.isDirectory()) salida.push(...(await listar(new URL(`${entrada.name}/`, dir), `${ruta}/`)))
    else salida.push(ruta)
  }
  return salida
}

const raiz = new URL('./', import.meta.url)
const archivos = [
  ...(await listar(new URL('build/', raiz))).map((f) => `build/${f}`),
  ...(await listar(new URL('config/', raiz))).map((f) => `config/${f}`),
]
const prefijo = Buffer.from('// [omniframe] ')
// El repo exige LF; el clon puede traer CRLF en el checkout. Se compara sin esa diferencia.
const lf = (bytes: Buffer): string => bytes.toString('utf8').replace(/\r\n/g, '\n')

for (const file of archivos) {
  test(`fidelidad: ${file}`, async (t) => {
    const clone = new URL('../../warframe-items/', import.meta.url)
    try { await access(clone) } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') { t.skip('Clon warframe-items ausente; fidelidad no verificada'); return }
      throw error
    }
    const actual = await readFile(new URL(file, raiz))
    const original = await readFile(new URL(file, clone))
    let start = 0
    while (actual.subarray(start, start + prefijo.length).equals(prefijo)) {
      const end = actual.indexOf(10, start)
      assert.notEqual(end, -1, 'Cabecera sin salto de línea')
      start = end + 1
    }
    const igual = lf(actual.subarray(start)) === lf(original)
    if (modificados.has(file)) assert.equal(igual, false, `${file} figura como modificado pero coincide con el original`)
    else assert.ok(igual, `${file} difiere del original`)
  })
}
