import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'

export interface SourcePatchlogLike {
  name?: string | null
  date?: string | null
  url?: string | null
}

export interface SourceItemForAudit {
  uniqueName?: string | null
  patchlogs?: SourcePatchlogLike[] | null
}

export interface SourceUpdateSignal {
  name: string | null
  date: string | null
  url: string | null
  versionTag: string | null
}

export interface SourceChangeAuditItem<TKind extends string = string> {
  uniqueName: string
  name: string
  category: string
  kind: TKind
  lastSourceUpdate: SourceUpdateSignal | null
  sourceFingerprint: string
}

export interface SourceChangeAuditDelta {
  mode: 'baseline' | 'diff'
  comparedToGeneratedAt: string | null
  previousTotalItems: number
  currentTotalItems: number
  newItems: number
  removedItems: number
  changedFingerprint: number
  changedLastSourceUpdate: number
  unchangedItems: number
  possibleChanges: number
}

export interface SourceChangeAuditReport<TKind extends string = string> {
  generatedAt: string
  totalItems: number
  delta: SourceChangeAuditDelta
  items: Record<string, SourceChangeAuditItem<TKind>>
}

export interface GeneratedAuditEntryForAudit<TPayload = unknown, TKind extends string = string> {
  uniqueName: string
  name: string
  kind: TKind
  category: string
  payload: TPayload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extractVersionTag(value: string | null): string | null {
  if (!value) {
    return null
  }

  const contextual = value.match(/(?:update|hotfix)[^0-9]*((?:\d+\.)*\d+)/i)

  if (contextual?.[1]) {
    return contextual[1]
  }

  const fallback = value.match(/\b\d+(?:\.\d+){0,2}\b/)
  return fallback?.[0] ?? null
}

export function resolveLastSourceUpdate(raw: SourceItemForAudit): SourceUpdateSignal | null {
  const patchlogs = raw.patchlogs ?? []

  if (patchlogs.length === 0) {
    return null
  }

  const best = patchlogs.reduce<SourcePatchlogLike>((current, candidate) => {
    const currentMs = current.date ? Date.parse(current.date) : Number.NaN
    const candidateMs = candidate.date ? Date.parse(candidate.date) : Number.NaN

    if (Number.isNaN(currentMs) && !Number.isNaN(candidateMs)) {
      return candidate
    }

    if (!Number.isNaN(currentMs) && !Number.isNaN(candidateMs) && candidateMs > currentMs) {
      return candidate
    }

    return current
  }, patchlogs[0])

  const name = best.name ?? null

  return {
    name,
    date: best.date ?? null,
    url: best.url ?? null,
    versionTag: extractVersionTag(name),
  }
}

function toCanonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => toCanonicalValue(entry))
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))

    const out: Record<string, unknown> = {}

    for (const [key, entryValue] of entries) {
      out[key] = toCanonicalValue(entryValue)
    }

    return out
  }

  return value
}

export function createStableFingerprint(value: unknown): string {
  const canonical = toCanonicalValue(value)
  const json = JSON.stringify(canonical)
  const digest = createHash('sha256').update(json).digest('hex')
  return `sha256:${digest}`
}

export function buildAuditEntries<
  TItem extends { uniqueName: string; name: string; kind: TKind; category?: string | null },
  TKind extends string,
>(items: TItem[]): GeneratedAuditEntryForAudit<TItem, TKind>[] {
  return items
    .filter((item) => item.uniqueName !== '')
    .map((item) => ({
      uniqueName: item.uniqueName,
      name: item.name,
      kind: item.kind,
      category: item.category ?? 'unknown',
      payload: item,
    }))
}

export function buildSourceChangeAuditReport<
  TKind extends string,
  TPayload,
>(params: {
  sourceItems: SourceItemForAudit[]
  generatedEntries: GeneratedAuditEntryForAudit<TPayload, TKind>[]
}): SourceChangeAuditReport<TKind> {
  const sourceByUniqueName = new Map<string, SourceItemForAudit>()

  for (const sourceItem of params.sourceItems) {
    const uniqueName = sourceItem.uniqueName ?? ''

    if (uniqueName === '' || sourceByUniqueName.has(uniqueName)) {
      continue
    }

    sourceByUniqueName.set(uniqueName, sourceItem)
  }

  const reportItems: Record<string, SourceChangeAuditItem<TKind>> = {}

  for (const generatedEntry of params.generatedEntries) {
    const source = sourceByUniqueName.get(generatedEntry.uniqueName)

    reportItems[generatedEntry.uniqueName] = {
      uniqueName: generatedEntry.uniqueName,
      name: generatedEntry.name,
      category: generatedEntry.category,
      kind: generatedEntry.kind,
      lastSourceUpdate: source ? resolveLastSourceUpdate(source) : null,
      sourceFingerprint: createStableFingerprint(generatedEntry.payload),
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totalItems: params.generatedEntries.length,
    delta: {
      mode: 'baseline',
      comparedToGeneratedAt: null,
      previousTotalItems: 0,
      currentTotalItems: params.generatedEntries.length,
      newItems: 0,
      removedItems: 0,
      changedFingerprint: 0,
      changedLastSourceUpdate: 0,
      unchangedItems: params.generatedEntries.length,
      possibleChanges: 0,
    },
    items: reportItems,
  }
}

function compareUpdateSignal(a: SourceUpdateSignal | null, b: SourceUpdateSignal | null): boolean {
  return JSON.stringify(toCanonicalValue(a)) === JSON.stringify(toCanonicalValue(b))
}

export function computeAuditDelta<TKind extends string>(
  previous: SourceChangeAuditReport<TKind> | null,
  current: SourceChangeAuditReport<TKind>,
): SourceChangeAuditDelta {
  if (!previous) {
    return {
      mode: 'baseline',
      comparedToGeneratedAt: null,
      previousTotalItems: 0,
      currentTotalItems: current.totalItems,
      newItems: 0,
      removedItems: 0,
      changedFingerprint: 0,
      changedLastSourceUpdate: 0,
      unchangedItems: current.totalItems,
      possibleChanges: 0,
    }
  }

  const previousItems = previous.items
  const currentItems = current.items
  const previousKeys = Object.keys(previousItems)
  const currentKeys = Object.keys(currentItems)

  let newItems = 0
  let removedItems = 0
  let changedFingerprint = 0
  let changedLastSourceUpdate = 0
  let unchangedItems = 0

  for (const key of currentKeys) {
    const currentItem = currentItems[key]
    const previousItem = previousItems[key]

    if (!previousItem) {
      newItems += 1
      continue
    }

    const fingerprintChanged = previousItem.sourceFingerprint !== currentItem.sourceFingerprint
    const lastSourceUpdateChanged = !compareUpdateSignal(previousItem.lastSourceUpdate, currentItem.lastSourceUpdate)

    if (fingerprintChanged) {
      changedFingerprint += 1
    }

    if (lastSourceUpdateChanged) {
      changedLastSourceUpdate += 1
    }

    if (!fingerprintChanged && !lastSourceUpdateChanged) {
      unchangedItems += 1
    }
  }

  for (const key of previousKeys) {
    if (!(key in currentItems)) {
      removedItems += 1
    }
  }

  return {
    mode: 'diff',
    comparedToGeneratedAt: previous.generatedAt,
    previousTotalItems: previous.totalItems,
    currentTotalItems: current.totalItems,
    newItems,
    removedItems,
    changedFingerprint,
    changedLastSourceUpdate,
    unchangedItems,
    possibleChanges: newItems + removedItems + changedFingerprint + changedLastSourceUpdate,
  }
}

export async function readPreviousAuditReport<TKind extends string>(
  reportFilePath: string,
): Promise<SourceChangeAuditReport<TKind> | null> {
  try {
    const raw = await fs.readFile(reportFilePath, 'utf8')
    return JSON.parse(raw) as SourceChangeAuditReport<TKind>
  } catch {
    return null
  }
}

export async function createSourceChangeAuditReport<TKind extends string, TPayload>(params: {
  reportFilePath: string
  sourceItems: SourceItemForAudit[]
  generatedEntries: GeneratedAuditEntryForAudit<TPayload, TKind>[]
}): Promise<SourceChangeAuditReport<TKind>> {
  const previousAuditReport = await readPreviousAuditReport<TKind>(params.reportFilePath)

  const sourceChangeAuditReport = buildSourceChangeAuditReport<TKind, TPayload>({
    sourceItems: params.sourceItems,
    generatedEntries: params.generatedEntries,
  })

  sourceChangeAuditReport.delta = computeAuditDelta(previousAuditReport, sourceChangeAuditReport)

  return sourceChangeAuditReport
}

export async function writeSourceChangeAuditReport<TKind extends string>(
  reportFilePath: string,
  report: SourceChangeAuditReport<TKind>,
  pretty = false,
): Promise<void> {
  const output = pretty ? JSON.stringify(report, null, 2) : JSON.stringify(report)
  await fs.writeFile(reportFilePath, output)
}
