import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePrimeVault, withPrimeVaultScraper } from './prime-vault.mjs'

const tabs = [
  ['Vaulted Items', '<span data-param-name="Ash Prime">Ash&nbsp;Prime</span>', '2017-05-30'],
  ['Formerly Vaulted', '<span data-param-name="Nyx Prime">Nyx Prime</span>', '2016-08-23'],
  ['Not Yet Vaulted', '<a>Citrine Prime</a>', '2026-09-23'],
  ['Never Vaulted', '<a>Braton Prime</a>', '2013-07-13'],
]
const render = (sections) => sections.map(([title, name, date]) => `
  <div class="tabbertab" data-title="${title}"><table data-tableid="CollectedPrimes">
    <tr><th>Item Name</th><th>Date</th></tr><tr><td>${name}</td><td>${date}</td></tr>
  </table></div>`).join('')

const vaulted = (name, date) => ({ name, vaulted: true, vaultDate: date, estimatedVaultDate: date })

test('lee las cuatro pestañas por nombre y conserva las fechas y estados de upstream', () => {
  assert.deepEqual(parsePrimeVault(render(tabs.toReversed())), [
    ...['Excalibur Prime', 'Lato Prime', 'Skana Prime'].map(name => ({ name, vaulted: true })),
    vaulted('Ash Prime', '2017-05-30'), vaulted('Nyx Prime', '2016-08-23'),
    { name: 'Citrine Prime', vaulted: false }, { name: 'Braton Prime', vaulted: false },
  ])
})

test('rechaza una sección ausente o ambigua, una fila incompleta y nombres duplicados', () => {
  assert.throws(() => parsePrimeVault(render(tabs.slice(1))), /Vaulted Items: se esperaba una tabla/)
  assert.throws(() => parsePrimeVault(render([...tabs, tabs[0]])), /Vaulted Items: se esperaba una tabla/)
  assert.throws(() => parsePrimeVault(render([['Vaulted Items', '<a>Ash Prime</a>', ''], ...tabs.slice(1)])), /Ash Prime.*sin fecha/)
  assert.throws(() => parsePrimeVault(render([...tabs.slice(0, 3), ['Never Vaulted', '<a>Ash Prime</a>', '']])), /Ash Prime.*duplicado/)
})

test('acota el adaptador a una ejecución y restaura upstream tanto al pasar como al fallar', async () => {
  class FakeVault {
    async scrape() { return 'upstream' }
  }
  const original = FakeVault.prototype.scrape
  const run = () => new FakeVault().scrape()
  const fetchHtml = async () => render(tabs)
  assert.deepEqual(await withPrimeVaultScraper(FakeVault, fetchHtml, run), parsePrimeVault(render(tabs)))
  assert.equal(FakeVault.prototype.scrape, original)
  const error = new Error('falló otro scraper')
  await assert.rejects(withPrimeVaultScraper(FakeVault, fetchHtml, async () => { throw error }), err => err === error)
  assert.equal(FakeVault.prototype.scrape, original)
  assert.equal(await run(), 'upstream')
})
