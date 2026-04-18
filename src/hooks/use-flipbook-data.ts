'use client'

import { useState, useEffect, useCallback } from 'react'
import { domains as staticDomains, type Domain, type Pillar } from '@/lib/pillar-data'

// ═══════════════════════════════════════════════════════════════
// Database types (from Prisma)
// ═══════════════════════════════════════════════════════════════
interface DbPilarDimension {
  id: string
  label: string
  value: string
  sortOrder: number
}

interface DbPilarPrinciple {
  id: string
  content: string
  sortOrder: number
}

interface DbPilarXref {
  id: string
  targetPilarId: number
}

interface DbPilar {
  id: string
  pillarId: number
  code: string
  name: string
  nameEng: string | null
  description: string | null
  domainId: number
  domainColor: string | null
  badge: string | null
  vision: string | null
  status: string
  dimensions: DbPilarDimension[]
  principles: DbPilarPrinciple[]
  xrefs: DbPilarXref[]
}

interface DbDomain {
  id: number
  code: string
  emoji: string
  name: string
  nameId: string
  nameSubtitle: string
  pageRange: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  pilars: DbPilar[]
}

interface FlipbookResponse {
  pages: unknown[]
  domains: DbDomain[]
  settings: Record<string, string | null>
  meta: {
    totalPages: number
    totalDomains: number
    totalPilars: number
    generatedAt: string
  }
}

// ═══════════════════════════════════════════════════════════════
// Transform database data → Pillar interface
// ═══════════════════════════════════════════════════════════════
function transformPilar(db: DbPilar): Pillar {
  return {
    id: db.pillarId,
    code: db.code,
    name: db.name,
    eng: db.nameEng ?? '',
    desc: db.description ?? '',
    domain: db.domainId,
    domainColor: db.domainColor ?? '#C4952A',
    badge: (db.badge as Pillar['badge']) ?? 'strategic',
    vision: db.vision ?? '',
    dimensions: db.dimensions.map(d => ({ label: d.label, value: d.value })),
    principles: db.principles.map(p => p.content),
    xref: [...new Set(db.xrefs.map(x => x.targetPilarId))],
  }
}

// ═══════════════════════════════════════════════════════════════
// Transform database data → Domain interface
// ═══════════════════════════════════════════════════════════════
function transformDomain(db: DbDomain): Domain {
  return {
    id: db.id,
    code: db.code,
    emoji: db.emoji,
    name: db.name,
    nameId: db.nameId,
    nameSubtitle: db.nameSubtitle,
    range: db.pageRange,
    color: db.color,
    bgColor: db.bgColor,
    borderColor: db.borderColor,
    description: db.description,
    pillars: db.pilars
      .filter(p => p.status === 'published' || p.status === 'draft')
      .sort((a, b) => a.pillarId - b.pillarId)
      .map(transformPilar),
  }
}

// ═══════════════════════════════════════════════════════════════
// Hook: useFlipbookData
// Fetches from database API, falls back to static data
// ═══════════════════════════════════════════════════════════════
interface UseFlipbookDataReturn {
  domains: Domain[]
  settings: Record<string, string | null>
  isLoading: boolean
  isLive: boolean
  lastFetched: Date | null
  error: string | null
  refresh: () => void
}

const POLL_INTERVAL = 30_000 // 30 seconds
const CACHE_KEY = 'knbmp-flipbook-data'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache(): { data: FlipbookResponse; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return { data, ts }
  } catch { return null }
}

function writeCache(data: FlipbookResponse) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch { /* quota */ }
}

export function useFlipbookData(): UseFlipbookDataReturn {
  const [domains, setDomains] = useState<Domain[]>(() => {
    // Try cache first for instant render
    const cached = readCache()
    if (cached?.data?.domains?.length) {
      return cached.data.domains.map(transformDomain)
    }
    return staticDomains
  })
  const [settings, setSettings] = useState<Record<string, string | null>>(() => {
    const cached = readCache()
    return cached?.data?.settings ?? {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLive, setIsLive] = useState(() => !!readCache())
  const [lastFetched, setLastFetched] = useState<Date | null>(() => {
    const cached = readCache()
    return cached ? new Date(cached.data.meta?.generatedAt ?? Date.now()) : null
  })
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/flipbook')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: FlipbookResponse = await res.json()

      // Cache response for fast reload
      writeCache(data)

      // Transform database domains to match Domain interface
      if (data.domains && data.domains.length > 0) {
        const transformed = data.domains.map(transformDomain)
        setDomains(transformed)
        setIsLive(true)
      }

      setSettings(data.settings ?? {})
      setLastFetched(new Date(data.meta?.generatedAt ?? Date.now()))
      setError(null)
    } catch (err) {
      console.warn('[FlipbookData] Using cached data:', err)
      setError(err instanceof Error ? err.message : 'API unavailable')
      setIsLive(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch (will use cache if available for instant render)
  useEffect(() => {
    // If we already have cached data, still refresh in background
    if (readCache()) {
      setIsLoading(false)
    }
    fetchData()
  }, [fetchData])

  // Auto-poll every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  return {
    domains,
    settings,
    isLoading,
    isLive,
    lastFetched,
    error,
    refresh: fetchData,
  }
}
