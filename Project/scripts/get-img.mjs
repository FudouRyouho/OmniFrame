/**
 * get-img.mjs
 *
 * Sincroniza en local las imagenes REFERENCIADAS por los JSON generados en public/data.
 * Flujo esperado:
 *   1) npm run generate:data:base
 *   2) node scripts/get-img.mjs --clean
 *
 * Copia desde:
 *   - ../warframe-items/data/img (workspace local)
 *   - node_modules/@wfcd/items/data/img (fallback)
 *
 * Hacia:
 *   - public/images (flat)
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const dataDir = path.resolve(projectRoot, 'public/data')
const targetDir = path.resolve(projectRoot, 'public/images')

const args = new Set(process.argv.slice(2))
const shouldClean = args.has('--clean')
const strictMode = args.has('--strict')

const IMAGE_EXT_RE = /\.(png|jpg|jpeg|webp|avif|gif)$/i

const sourceCandidates = [
  path.resolve(projectRoot, '../warframe-items/data/img'),
  path.resolve(projectRoot, 'node_modules/@wfcd/items/data/img'),
]

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function resolveSourceDir() {
  for (const candidate of sourceCandidates) {
    if (await exists(candidate)) return candidate
  }
  throw new Error(
    [
      'No se encontro directorio de imagenes fuente.',
      'Se probaron:',
      ...sourceCandidates.map((p) => `- ${p}`),
    ].join('\n'),
  )
}

async function listJsonFiles(root) {
  const out = []

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
        out.push(full)
      }
    }
  }

  await walk(root)
  return out
}

function normalizeImageName(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const withoutQuery = trimmed.split('?')[0]
  const filename = path.basename(withoutQuery)
  if (!IMAGE_EXT_RE.test(filename)) return null

  return filename
}

function collectImageNamesFromValue(value, parentKey, bucket) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectImageNamesFromValue(item, parentKey, bucket)
    }
    return
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      collectImageNamesFromValue(nested, key, bucket)
    }
    return
  }

  if (typeof value !== 'string') return

  // `image_name` es el campo que emite el pipeline; `imageName` es la forma cruda de la fuente.
  // Se aceptan ambas: leer sólo la camelCase dejaba fuera TODO el dataset actual —el pipeline
  // normaliza a snake_case— y hacía que este script sincronizara contra JSON muertos.
  if (parentKey === 'image_name' || parentKey === 'imageName') {
    const normalized = normalizeImageName(value)
    if (normalized) bucket.add(normalized)
  }
}

async function collectRequiredImageNames() {
  const files = await listJsonFiles(dataDir)
  const bucket = new Set()

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.warn(`[get-img] JSON invalido, se omite: ${file}`)
      continue
    }

    collectImageNamesFromValue(parsed, '', bucket)
  }

  return bucket
}

async function syncImages() {
  await fs.mkdir(targetDir, { recursive: true })

  const sourceDir = await resolveSourceDir()
  const required = await collectRequiredImageNames()

  const copied = []
  const skipped = []
  const missing = []

  for (const imageName of required) {
    const sourcePath = path.join(sourceDir, imageName)
    const targetPath = path.join(targetDir, imageName)

    if (!(await exists(sourcePath))) {
      missing.push(imageName)
      continue
    }

    if (await exists(targetPath)) {
      skipped.push(imageName)
      continue
    }

    await fs.copyFile(sourcePath, targetPath)
    copied.push(imageName)
  }

  let removed = []
  if (shouldClean) {
    const current = await fs.readdir(targetDir, { withFileTypes: true })
    for (const entry of current) {
      if (!entry.isFile()) continue
      if (!required.has(entry.name)) {
        await fs.unlink(path.join(targetDir, entry.name))
        removed.push(entry.name)
      }
    }
  }

  console.log(`[get-img] fuente: ${sourceDir}`)
  console.log(`[get-img] destino: ${targetDir}`)
  console.log(`[get-img] referencias en JSON: ${required.size}`)
  console.log(`[get-img] copiados: ${copied.length}`)
  console.log(`[get-img] ya existentes: ${skipped.length}`)
  console.log(`[get-img] faltantes en fuente: ${missing.length}`)
  if (shouldClean) {
    console.log(`[get-img] sobrantes eliminados: ${removed.length}`)
  }

  if (missing.length > 0) {
    const preview = missing.slice(0, 15).join(', ')
    console.warn(`[get-img] faltantes (preview): ${preview}${missing.length > 15 ? ', ...' : ''}`)
    if (strictMode) {
      throw new Error('Faltan imagenes en la fuente (--strict activo).')
    }
  }
}

await syncImages()
