/**
 * @domain Tooling / Validador del corpus `docs/`
 *
 * Ejercita `validate-docs.mjs` COMO BINARIO sobre una raíz de repo falsa: el script resuelve `REPO`
 * desde su propia ubicación (`<repo>/Project/scripts/`), así que copiarlo a un árbol temporal lo
 * apunta a un `docs/` de fixture sin tocar el corpus real.
 *
 * Existe porque `docs/AGENTS.md` (§Pre-flight 1) exime a `AGENTS.md` del frontmatter: si `EXENTOS`
 * deriva de la regla, el validador falla en el propio archivo de reglas, o deja de exigirlo a los demás.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const SCRIPT = path.resolve(__dirname, '../validate-docs.mjs')

const FRONTMATTER = [
  '---',
  'Estado: "activo"',
  'Rol: "fixture"',
  'Impacto_ID: "T-0"',
  'Fidelidad_Fisica: "docs/ok.md"',
  'Fecha_de_creacion: "2026-01-01"',
  'Fecha_de_actualizacion: "2026-01-01"',
  '---',
  '',
  '# ok',
  '',
].join('\n')

let root: string
let out: string

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-docs-'))
  fs.mkdirSync(path.join(root, 'Project/scripts'), { recursive: true })
  fs.mkdirSync(path.join(root, 'Project/src'), { recursive: true })
  fs.mkdirSync(path.join(root, 'docs/governance'), { recursive: true })
  fs.mkdirSync(path.join(root, 'references/wiki'), { recursive: true })
  fs.copyFileSync(SCRIPT, path.join(root, 'Project/scripts/validate-docs.mjs'))
  fs.writeFileSync(path.join(root, 'docs/ok.md'), FRONTMATTER)
  fs.writeFileSync(path.join(root, 'docs/AGENTS.md'), '# Reglas sin frontmatter\n')
  fs.writeFileSync(path.join(root, 'docs/README.md'), '# Índice sin frontmatter\n')
  fs.writeFileSync(path.join(root, 'docs/sin-frontmatter.md'), '# Sin frontmatter\n')
  const r = spawnSync('node', [path.join(root, 'Project/scripts/validate-docs.mjs')], { encoding: 'utf-8' })
  out = r.stdout + r.stderr
})

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('validate-docs — exención de frontmatter', () => {
  it('no exige frontmatter a docs/AGENTS.md', () => {
    expect(out).not.toMatch(/AGENTS\.md\s*\n[^\n]*sin frontmatter YAML/)
  })

  it('sigue eximiendo a README.md', () => {
    expect(out).not.toMatch(/README\.md\s*\n[^\n]*sin frontmatter YAML/)
  })

  it('sigue exigiendo frontmatter a un .md ordinario', () => {
    expect(out).toMatch(/sin-frontmatter\.md[\s\S]*?sin frontmatter YAML/)
  })
})
