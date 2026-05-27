import { useState, useEffect } from 'react'
import type { ArchonShardCatalog } from '@shared/types'

let catalogPromise: Promise<ArchonShardCatalog> | null = null

function fetchCatalog(): Promise<ArchonShardCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/archon-shards.json').then(r => r.json())
  }
  return catalogPromise
}

/** Retorna el catálogo de archon shards. null mientras carga. */
export function useArchonShardCatalog(): ArchonShardCatalog | null {
  const [catalog, setCatalog] = useState<ArchonShardCatalog | null>(null)

  useEffect(() => {
    fetchCatalog().then(setCatalog)
  }, [])

  return catalog
}
