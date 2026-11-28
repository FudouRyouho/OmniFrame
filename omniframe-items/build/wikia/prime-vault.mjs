import { load } from 'cheerio'

const sections = new Map([
  ['Vaulted Items', true],
  ['Formerly Vaulted', true],
  ['Not Yet Vaulted', false],
  ['Never Vaulted', false],
])

export function parsePrimeVault(html) {
  const $ = load(html)
  const result = ['Excalibur Prime', 'Lato Prime', 'Skana Prime'].map(name => ({ name, vaulted: true }))
  const seen = new Set(result.map(({ name }) => name))

  for (const [title, vaulted] of sections) {
    const tables = $(`.tabbertab[data-title="${title}"] table[data-tableid="CollectedPrimes"]`)
    if (tables.length !== 1) throw new Error(`Prime Vault — ${title}: se esperaba una tabla, llegaron ${tables.length}`)
    const rows = tables.find('tbody > tr').filter((_, row) => $(row).children('td').length > 0)
    if (!rows.length) throw new Error(`Prime Vault — ${title}: tabla sin datos`)

    for (const row of rows) {
      const cells = $(row).children('td')
      const first = cells.eq(0)
      const name = (first.find('[data-param-name]').first().attr('data-param-name') ?? first.find('a').first().text()).trim()
      if (!name) throw new Error(`Prime Vault — ${title}: fila sin nombre`)
      if (seen.has(name)) throw new Error(`Prime Vault — ${title}: ${name} duplicado`)
      seen.add(name)
      const date = cells.eq(1).text().trim()
      if (vaulted && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Prime Vault — ${title}: ${name} sin fecha válida`)
      result.push(vaulted ? { name, vaulted, vaultDate: date, estimatedVaultDate: date } : { name, vaulted })
    }
  }
  return result
}

const active = new WeakSet()

// El build CLI hace una sola cosecha. Upstream instancia la clase internamente
// sin aceptar un adaptador; sustituimos sólo ese paso durante la llamada.
export async function withPrimeVaultScraper(VaultScraper, fetchHtml, run) {
  if (active.has(VaultScraper)) throw new Error('Prime Vault: ya hay una cosecha activa')
  const original = VaultScraper.prototype.scrape
  VaultScraper.prototype.scrape = async () => parsePrimeVault(await fetchHtml())
  active.add(VaultScraper)
  try {
    return await run()
  } finally {
    VaultScraper.prototype.scrape = original
    active.delete(VaultScraper)
  }
}
