// Maquinaria Lua genérica de omniframe-items — propia, NO importada de @wfcd/items.
// Baja cualquier `Module:X/data?action=edit` de la wiki y lo convierte a JSON vía el
// intérprete `lua` + JSON.lua. Es la base reusable de todo scraper de módulo Lua
// (hoy habilidades; mañana enemigos — ver OQ-DATA-16).
//
// Difiere del original del fork sólo en plomería (sin cambiar comportamiento):
//   - fetch global (Node ≥18) en vez de node-fetch
//   - child_process.exec en vez de node-cmd
//   - JSON.lua por path absoluto (import.meta.url), no relativo al cwd
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'

const run = promisify(exec)
const JSON_LUA = fileURLToPath(new URL('./JSON.lua', import.meta.url))

export const getLuaData = async (url) => {
  try {
    const $ = load(await fetch(url).then((data) => data.text()))
    return $('#wpTextbox1').text()
  } catch (err) {
    console.error('Failed to fetch latest Lua data:')
    console.error(err)
    return ''
  }
}

export const convertLuaDataToJson = async (luaData, luaDataName) => {
  const luaToJsonScript = `
JSON = (loadfile "${JSON_LUA}")()
local ${luaDataName}Data = (function()
${luaData}
end)()
if type(${luaDataName}Data) == 'table' then
  print(JSON:encode(${luaDataName}Data))
else
  print("{}")
end
`

  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'omniframe-lua-'))
  const lua = path.join(temp, 'dataraw.lua')
  const json = path.join(temp, 'dataraw.json')
  await fs.writeFile(lua, luaToJsonScript, { encoding: 'utf8', flag: 'w' })

  try {
    await run(`lua "${lua}" > "${json}"`)
    const dataRaw = await fs.readFile(json, { encoding: 'utf8' })
    if (!dataRaw.trim()) return {}
    return JSON.parse(dataRaw)
  } catch (err) {
    console.error(`Failed to execute lua script for ${luaDataName}`)
    return {}
  } finally {
    await fs.rm(temp, { recursive: true, force: true })
  }
}
