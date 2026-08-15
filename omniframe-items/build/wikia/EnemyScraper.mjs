// EnemyScraper (lean) — cosecha Module:Enemies/data/<facción> del wiki: los stats de
// enemigo que el export del juego NO trae. Keyed por NOMBRE (ver abajo y schema §4).
// Fase-2 de OQ-DATA-16 — el objetivo de fondo de toda la migración.
//
// El agregador Module:Enemies/data es CÓDIGO (require + mw.*), no se puede pasar por
// convertLuaDataToJson; los submódulos por facción SÍ son tablas Lua puras (`return {...}`).
// `pre-U36` se excluye a propósito: era muerta (modelo de resistencias per-clase pre-U36).
//
// Qué se cosecha y para qué (contrato completo: docs/data/schemas/enemy/schema.md):
//   · wikiFaction  — `General.Faction`, ÚNICA fuente con subfacciones (Kuva Grineer, Corpus
//                    Amalgam…) que `FACTION_BONUS` keyea. Repara el `type` contaminado del
//                    export (categoría de arma/rol de IA: Lancer→"Rifle") — `OQ-DATA-15`.
//                    Trae basura propia (`?`, `Unknown`, `Objects`) → el generador valida.
//   · wikiType     — taxonomía de ROL del wiki (Ranged/Boss/Specter/Objects…). Cosechado y
//                    NO emitido: candidato al filtro de entidades.
//   · BaseLevel    — el export no lo trae; el escalado lo necesita (Δnivel).
//   · EximusHealth — variante eximus, ausente del export. Semántica sin verificar.
//   · Multis       — multiplicadores por parte ("Head: 3.0x") = weakpoints.
//   · Health/Armor/Shield — el export ya los trae y el merge es fill-if-missing, así que NUNCA
//                    se emiten: existen para CENSAR el conflicto de fuente wiki↔export
//                    (22%/16%/38% divergentes; schema §7). No borrar creyéndolos muertos.
// Attacks/DamageDistribution NO se cosechan todavía: su consumidor (modelo de DR/EHP
// para builds tanque) no existe — se suma cuando el engine lo pida.
import { getLuaData, convertLuaDataToJson } from './luaData.mjs'

const BASE = 'https://wiki.warframe.com/w/Module:Enemies/data'
const SUFFIX = '?action=edit'

// COOP_FACTIONS del agregador (Module:Enemies/data) → vocabulario canónico del proyecto
// (`docs/semantic/factions.md`: "Infested" no "Infestation", "Orokin" no "Corrupted").
// Es el FALLBACK de `General.Faction`: el submódulo agrupa por facción base, así que pierde la
// subfacción (los 28 Kuva Grineer viven en `grineer`).
const FACTIONS = {
  grineer: 'Grineer',
  corpus: 'Corpus',
  infestation: 'Infested',
  orokin: 'Orokin',
  sentient: 'Sentient',
  stalker: 'Stalker',
  narmer: 'Narmer',
  themurmur: 'Murmur',
  techrot: 'Techrot',
  scaldra: 'Scaldra',
  anarchs: 'Anarchs',
  unaffiliated: 'Unaffiliated',
}

export default class EnemyScraper {
  async scrape() {
    const out = {}
    const collisions = []
    for (const [module, faction] of Object.entries(FACTIONS)) {
      const lua = await getLuaData(`${BASE}/${module}${SUFFIX}`)
      if (!lua) {
        console.warn(`EnemyScraper: sin data para ${module}`)
        continue
      }
      const parsed = await convertLuaDataToJson(lua, 'Enemy')
      const table = parsed ?? {}
      for (const [key, raw] of Object.entries(table)) {
        if (!raw || typeof raw !== 'object') continue
        // Clave de merge = NOMBRE, no uniqueName: el wiki indexa por el path del *Agent*
        // (`.../Desert/BladeSawman`) y el export del juego por el del *Avatar*
        // (`.../Desert/Avatars/BladeSawmanAvatarLeader`). El sufijo varía
        // (Avatar/AvatarLeader/…) → derivarlo sería frágil. El nombre sí matchea.
        const name = raw.General?.Name ?? key
        if (!name) continue
        const s = raw.Stats ?? {}
        // `General.Faction` es la facción REAL y distingue subfacciones (Kuva Grineer: facción
        // propia — misma vulnerabilidad que Grineer pero resiste Heat). El submódulo es sólo
        // fallback. Mapear subfacción→grupo de scaling es trabajo de la LEY (`enemy-scaling.ts`),
        // no del dato.
        // Clave PROPIA (`wikiFaction`, no `faction`): el export también tiene `faction` y el merge
        // es fill-if-missing — colapsarlas haría que la basura del wiki (`?`, `Unknown`, `Objects`)
        // gane sobre un `type` bueno del export. La cascada la arma el generador, con validación
        // por nivel.
        const fields = { wikiFaction: raw.General?.Faction ?? faction }
        if (raw.General?.Type) fields.wikiType = raw.General.Type
        if (s.BaseLevel != null) fields.baseLevel = s.BaseLevel
        // Health/Armor/Shield: el export ya los trae, así que el merge fill-if-missing NUNCA los
        // usa. Se cosechan para **censar el conflicto de fuente** wiki↔export, no para emitirlos.
        if (s.Health != null) fields.health = s.Health
        if (s.Armor != null) fields.armor = s.Armor
        if (s.Shield != null) fields.shield = s.Shield
        if (s.EximusHealth != null) fields.eximusHealth = s.EximusHealth
        if (Array.isArray(s.Multis) && s.Multis.length) fields.multis = s.Multis
        // Trazabilidad: el uniqueName del wiki (Agent) queda como referencia, NO como clave.
        if (raw.General?.InternalName) fields.wikiInternalName = raw.General.InternalName
        // La clave es el NOMBRE: si dos entradas del wiki lo comparten, una pisaría a la otra en
        // silencio. Se reporta en vez de tragarlo — la primera gana.
        if (out[name]) {
          collisions.push(`${name} (${out[name].wikiInternalName} ⟂ ${fields.wikiInternalName})`)
          continue
        }
        // Se emite siempre: `faction` sola ya es aporte (repara el `type` del export) aunque
        // el enemigo no traiga ningún stat wiki.
        out[name] = fields
      }
    }
    if (collisions.length) {
      console.warn(`EnemyScraper: ${collisions.length} nombres colisionados (se conserva el primero):`)
      for (const c of collisions) console.warn(`  · ${c}`)
    }
    return out
  }
}
