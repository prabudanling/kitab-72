'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Database, FolderOpen, Image as ImageIcon, Settings,
  History, X, LogOut, ChevronRight, Search, Plus, Eye, EyeOff,
  Edit3, Trash2, Upload, GripVertical, Loader2, RefreshCw, Save,
  ChevronDown, ExternalLink, Calendar, Clock, User, Activity,
  Package, BarChart3, ToggleLeft, ArrowUpDown, Filter, MoreHorizontal,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useAdminStore, apiFetch } from '@/stores/admin-store'
import { AdminLogin } from './AdminLogin'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface PageItem {
  id: string
  pageNumber: number
  pageType: string
  title: string
  subtitle?: string | null
  status: string
  updatedAt: string
  createdAt: string
  publishedAt?: string | null
  _count?: { media: number }
  author?: { id: string; name: string; email: string }
}

interface DomainItem {
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
  sortOrder: number
  _count?: { pilars: number }
  pilarStats?: { total: number; draft: number; review: number; published: number }
}

interface PilarItem {
  id: string
  pillarId: number
  code: string
  name: string
  nameEng?: string | null
  description?: string | null
  domainId: number
  domainColor?: string | null
  badge?: string | null
  vision?: string | null
  status: string
  sortOrder: number
  updatedAt: string
  _count?: { dimensions: number; principles: number; xrefs: number }
  domain?: DomainItem
  dimensions?: DimensionItem[]
  principles?: PrincipleItem[]
  xrefs?: { targetPilarId: number }[]
}

interface DimensionItem {
  id: string
  pilarId: string
  label: string
  value: string
  sortOrder: number
}

interface PrincipleItem {
  id: string
  pilarId: string
  content: string
  sortOrder: number
}

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt?: string | null
  folder?: string | null
  createdAt: string
}

interface AuditLogItem {
  id: string
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: { id: string; name: string; email: string } | null
}

// ═══════════════════════════════════════════════════════════════
// NAV ITEMS
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pages', label: 'Halaman', icon: FileText },
  { id: 'pga72', label: 'PGA-72', icon: Database },
  { id: 'domains', label: 'Domain', icon: FolderOpen },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
  { id: 'audit', label: 'Log Audit', icon: History },
]

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function statusColor(status: string) {
  switch (status) {
    case 'published': return { bg: '#DCFCE7', text: '#166534', label: 'Terbit' }
    case 'draft': return { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' }
    case 'review': return { bg: '#FEF3C7', text: '#92400E', label: 'Review' }
    default: return { bg: '#F3F4F6', text: '#6B7280', label: status }
  }
}

function badgeColor(badge: string | null) {
  switch (badge) {
    case 'foundation': return { bg: '#5E212915', text: '#5E2129', label: 'Foundation' }
    case 'strategic': return { bg: '#C5A05920', text: '#92760F', label: 'Strategic' }
    case 'operational': return { bg: '#2563EB15', text: '#2563EB', label: 'Operational' }
    default: return { bg: '#F3F4F6', text: '#6B7280', label: badge || '-' }
  }
}

function SkeletonCard() {
  return <div className="h-24 rounded-lg animate-pulse" style={{ backgroundColor: '#F5F0EB' }} />
}

// ═══════════════════════════════════════════════════════════════
// SORTABLE ITEM (for DnD)
// ═══════════════════════════════════════════════════════════════
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2">
      <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5">
        <GripVertical className="w-4 h-4" style={{ color: '#B0A898' }} />
      </button>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════
function DashboardView() {
  const [stats, setStats] = useState({ pages: 0, published: 0, pilars: 0, media: 0 })
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pagesData, pilarsData, mediaData, logsData] = await Promise.all([
          apiFetch<{ pages: PageItem[] }>('/pages?limit=100'),
          apiFetch<{ pilars: PilarItem[] }>('/pilars?limit=100'),
          apiFetch<{ media: MediaItem[] }>('/media?limit=100'),
          apiFetch<{ logs: AuditLogItem[] }>('/audit?limit=10'),
        ])
        const publishedCount = pagesData.pages.filter(p => p.status === 'published').length
        setStats({
          pages: pagesData.pages.length,
          published: publishedCount,
          pilars: pilarsData.pilars.length,
          media: mediaData.media.length,
        })
        setRecentLogs(logsData.logs)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>

  const statCards = [
    { label: 'Total Halaman', value: stats.pages, sub: `${stats.published} terbit`, icon: FileText, color: '#5E2129' },
    { label: 'Total Pilar', value: stats.pilars, sub: 'PGA-72', icon: Database, color: '#C5A059' },
    { label: 'Total Media', value: stats.media, sub: 'file diupload', icon: ImageIcon, color: '#2C2417' },
    { label: 'Aktivitas Terkini', value: recentLogs.length, sub: 'aksi tercatat', icon: Activity, color: '#6B5E50' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-0 shadow-sm" style={{ backgroundColor: '#FAFAF8' }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#8B7D6B' }}>{card.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#B0A898' }}>{card.sub}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}10` }}>
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm" style={{ backgroundColor: '#FAFAF8' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2C2417' }}>
            <History className="w-4 h-4" style={{ color: '#8B7D6B' }} />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: '#B0A898' }}>Belum ada aktivitas</p>
            ) : recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 mt-0.5 w-2 h-2 rounded-full" style={{
                  backgroundColor: log.action === 'create' ? '#22C55E' : log.action === 'delete' ? '#EF4444' : log.action === 'login' ? '#C5A059' : '#3B82F6',
                }} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#2C2417' }}>
                    <span className="font-medium">{log.user?.name || 'Sistem'}</span>
                    {' '}
                    <span style={{ color: '#8B7D6B' }}>{log.action}</span>
                    {' '}
                    <span className="font-medium">{log.entityType}</span>
                    {log.entityId && <span className="text-xs" style={{ color: '#B0A898' }}> #{log.entityId.slice(0, 8)}</span>}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#B0A898' }}>{formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGES MANAGER VIEW
// ═══════════════════════════════════════════════════════════════
function PagesView() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editPage, setEditPage] = useState<PageItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const data = await apiFetch<{ pages: PageItem[] }>(`/pages?${params}`)
      setPages(data.pages)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { loadPages() }, [loadPages])

  const handleEdit = (page: PageItem) => {
    setEditPage(page)
    setEditTitle(page.title)
    setEditSubtitle(page.subtitle || '')
    setEditStatus(page.status)
  }

  const handleSave = async () => {
    if (!editPage) return
    setSaving(true)
    try {
      await apiFetch(`/pages/${editPage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: editTitle, subtitle: editSubtitle || null, status: editStatus }),
      })
      setEditPage(null)
      loadPages()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (page: PageItem) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published'
    try {
      await apiFetch(`/pages/${page.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      loadPages()
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Halaman</h2>
        <Button size="sm" variant="outline" onClick={loadPages} className="gap-1.5 text-xs">
          <RefreshCw className="w-3 h-3" /> Muat Ulang
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B0A898' }} />
          <Input
            placeholder="Cari halaman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
            style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E0D4' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm" style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E0D4' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="published">Terbit</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#F5F0EB' }}>
                <TableHead className="w-12 text-xs">#</TableHead>
                <TableHead className="text-xs">Judul</TableHead>
                <TableHead className="w-24 text-xs">Tipe</TableHead>
                <TableHead className="w-24 text-xs">Status</TableHead>
                <TableHead className="w-40 text-xs">Diperbarui</TableHead>
                <TableHead className="w-24 text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><div className="h-5 rounded animate-pulse" style={{ backgroundColor: '#E8E0D4' }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12" style={{ color: '#B0A898' }}>
                    Tidak ada halaman ditemukan
                  </TableCell>
                </TableRow>
              ) : pages.map((page) => {
                const sc = statusColor(page.status)
                return (
                  <TableRow key={page.id} className="cursor-pointer hover:bg-white/60" onClick={() => handleEdit(page)}>
                    <TableCell className="text-xs font-mono" style={{ color: '#8B7D6B' }}>{page.pageNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#2C2417' }}>{page.title}</p>
                        {page.subtitle && <p className="text-xs truncate max-w-[250px]" style={{ color: '#B0A898' }}>{page.subtitle}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: '#8B7D6B' }}>{page.pageType.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge className="text-xs font-normal px-2 py-0.5" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: '#B0A898' }}>{formatDate(page.updatedAt)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(page)} title={page.status === 'published' ? 'Batalkan terbit' : 'Terbitkan'}>
                          {page.status === 'published' ? <EyeOff className="w-3.5 h-3.5" style={{ color: '#8B7D6B' }} /> : <Eye className="w-3.5 h-3.5" style={{ color: '#C5A059' }} />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(page)}>
                          <Edit3 className="w-3.5 h-3.5" style={{ color: '#8B7D6B' }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: '#E8E0D4', color: '#8B7D6B' }}>
          <span>{pages.length} halaman</span>
          <span>Klik baris untuk mengedit</span>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editPage} onOpenChange={() => setEditPage(null)}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: '#FAFAF8' }}>
          <DialogHeader>
            <DialogTitle className="text-base" style={{ color: '#2C2417' }}>Edit Halaman #{editPage?.pageNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Judul</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subjudul</Label>
              <Input value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="published">Terbit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPage(null)} className="text-sm">Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="text-sm text-white" style={{ backgroundColor: '#5E2129' }}>
              {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Menyimpan...</> : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PGA-72 MANAGER VIEW
// ═══════════════════════════════════════════════════════════════
function PGA72View() {
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null)
  const [pilars, setPilars] = useState<PilarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editPilar, setEditPilar] = useState<PilarItem | null>(null)
  const [editData, setEditData] = useState({ name: '', description: '', vision: '' })
  const [editDimensions, setEditDimensions] = useState<DimensionItem[]>([])
  const [editPrinciples, setEditPrinciples] = useState<PrincipleItem[]>([])
  const [saving, setSaving] = useState(false)
  const [newDimLabel, setNewDimLabel] = useState('')
  const [newDimValue, setNewDimValue] = useState('')
  const [newPrinciple, setNewPrinciple] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const sensors2 = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ domains: DomainItem[] }>('/domains')
        setDomains(data.domains)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadPilars = useCallback(async (domainId: number) => {
    try {
      const data = await apiFetch<{ pilars: PilarItem[] }>(`/pilars?domainId=${domainId}&include=all`)
      setPilars(data.pilars)
    } catch {
      setPilars([])
    }
  }, [])

  const handleDomainClick = (domainId: number) => {
    if (expandedDomain === domainId) {
      setExpandedDomain(null)
    } else {
      setExpandedDomain(domainId)
      loadPilars(domainId)
    }
  }

  const openPilarEditor = async (pilar: PilarItem) => {
    try {
      const data = await apiFetch<{ pilar: PilarItem }>(`/pilars/${pilar.id}`)
      const p = data.pilar
      setEditPilar(p)
      setEditData({ name: p.name, description: p.description || '', vision: p.vision || '' })
      setEditDimensions(p.dimensions || [])
      setEditPrinciples(p.principles || [])
    } catch {
      // silent
    }
  }

  const savePilar = async () => {
    if (!editPilar) return
    setSaving(true)
    try {
      await apiFetch(`/pilars/${editPilar.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editData.name, description: editData.description || null, vision: editData.vision || null }),
      })
      setEditPilar(null)
      loadPilars(editPilar.domainId)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const addDimension = async () => {
    if (!editPilar || !newDimLabel || !newDimValue) return
    try {
      const data = await apiFetch<{ dimension: DimensionItem }>(`/pilars/${editPilar.id}/dimensions`, {
        method: 'POST',
        body: JSON.stringify({ label: newDimLabel, value: newDimValue, sortOrder: editDimensions.length }),
      })
      setEditDimensions([...editDimensions, data.dimension])
      setNewDimLabel('')
      setNewDimValue('')
    } catch {
      // silent
    }
  }

  const deleteDimension = async (dimId: string) => {
    if (!editPilar) return
    try {
      await apiFetch(`/pilars/${editPilar.id}/dimensions?dimensionId=${dimId}`, { method: 'DELETE' })
      setEditDimensions(editDimensions.filter(d => d.id !== dimId))
    } catch {
      // silent
    }
  }

  const addPrinciple = async () => {
    if (!editPilar || !newPrinciple) return
    try {
      const data = await apiFetch<{ principle: PrincipleItem }>(`/pilars/${editPilar.id}/principles`, {
        method: 'POST',
        body: JSON.stringify({ content: newPrinciple, sortOrder: editPrinciples.length }),
      })
      setEditPrinciples([...editPrinciples, data.principle])
      setNewPrinciple('')
    } catch {
      // silent
    }
  }

  const deletePrinciple = async (pId: string) => {
    if (!editPilar) return
    try {
      await apiFetch(`/pilars/${editPilar.id}/principles?principleId=${pId}`, { method: 'DELETE' })
      setEditPrinciples(editPrinciples.filter(p => p.id !== pId))
    } catch {
      // silent
    }
  }

  const handleDimDragEnd = async (event: DragEndEvent) => {
    if (!editPilar) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = editDimensions.findIndex(d => d.id === active.id)
      const newIdx = editDimensions.findIndex(d => d.id === over.id)
      const reordered = arrayMove(editDimensions, oldIdx, newIdx)
      setEditDimensions(reordered)
      // Update sort orders
      for (let i = 0; i < reordered.length; i++) {
        await apiFetch(`/pilars/${editPilar.id}/dimensions`, {
          method: 'PATCH',
          body: JSON.stringify({ dimensionId: reordered[i].id, sortOrder: i }),
        })
      }
    }
  }

  const handlePrincipleDragEnd = async (event: DragEndEvent) => {
    if (!editPilar) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = editPrinciples.findIndex(p => p.id === active.id)
      const newIdx = editPrinciples.findIndex(p => p.id === over.id)
      const reordered = arrayMove(editPrinciples, oldIdx, newIdx)
      setEditPrinciples(reordered)
      for (let i = 0; i < reordered.length; i++) {
        await apiFetch(`/pilars/${editPilar.id}/principles`, {
          method: 'PATCH',
          body: JSON.stringify({ principleId: reordered[i].id, sortOrder: i }),
        })
      }
    }
  }

  if (loading) return <div className="p-6 grid grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>PGA-72 Pilar Manager</h2>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => (
          <Card
            key={domain.id}
            className="border-0 shadow-sm cursor-pointer transition-all hover:shadow-md"
            style={{ backgroundColor: '#FAFAF8' }}
            onClick={() => handleDomainClick(domain.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${domain.color}15` }}>
                  {domain.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: domain.color }}>{domain.name}</p>
                  <p className="text-xs" style={{ color: '#8B7D6B' }}>{domain.pilarStats?.total || domain._count?.pilars || 0} pilar</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedDomain === domain.id ? 'rotate-90' : ''}`} style={{ color: '#B0A898' }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded Domain Pilars */}
      <AnimatePresence>
        {expandedDomain !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-sm" style={{ backgroundColor: '#FAFAF8' }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronDown className="w-4 h-4" style={{ color: '#B0A898' }} />
                  <p className="text-sm font-semibold" style={{ color: '#2C2417' }}>
                    {domains.find(d => d.id === expandedDomain)?.nameId}
                  </p>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {pilars.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#B0A898' }}>Tidak ada pilar</p>
                  ) : pilars.map((pilar) => {
                    const bc = badgeColor(pilar.badge)
                    const sc = statusColor(pilar.status)
                    return (
                      <div
                        key={pilar.id}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white transition-colors"
                        style={{ borderLeft: `3px solid ${pilar.domainColor || '#E8E0D4'}` }}
                        onClick={() => openPilarEditor(pilar)}
                      >
                        <span className="text-xs font-mono font-bold w-14 flex-shrink-0" style={{ color: pilar.domainColor || '#8B7D6B' }}>{pilar.code}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#2C2417' }}>{pilar.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: bc.bg, color: bc.text }}>{bc.label}</Badge>
                            <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: sc.bg, color: sc.text }}>{sc.label}</Badge>
                          </div>
                        </div>
                        <span className="text-[10px]" style={{ color: '#B0A898' }}>{pilar._count?.dimensions || 0}D {pilar._count?.principles || 0}P</span>
                        <Edit3 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B0A898' }} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pilar Editor Dialog */}
      <Dialog open={!!editPilar} onOpenChange={() => setEditPilar(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: '#FAFAF8' }}>
          <DialogHeader>
            <DialogTitle className="text-base" style={{ color: '#2C2417' }}>
              Edit {editPilar?.code}: {editPilar?.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensi ({editDimensions.length})</TabsTrigger>
              <TabsTrigger value="principles">Prinsip ({editPrinciples.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama</Label>
                <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Deskripsi</Label>
                <Textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="text-sm min-h-[100px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Visi</Label>
                <Textarea value={editData.vision} onChange={(e) => setEditData({ ...editData, vision: e.target.value })} className="text-sm min-h-[80px]" />
              </div>
            </TabsContent>

            <TabsContent value="dimensions" className="mt-4 space-y-4">
              {/* Dimensions DnD List */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDimDragEnd}>
                <SortableContext items={editDimensions.map(d => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {editDimensions.map((dim) => (
                      <SortableItem key={dim.id} id={dim.id}>
                        <div className="flex-1 flex items-center gap-2 p-2 rounded bg-white border" style={{ borderColor: '#E8E0D4' }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium" style={{ color: '#2C2417' }}>{dim.label}</p>
                            <p className="text-xs truncate" style={{ color: '#8B7D6B' }}>{dim.value}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteDimension(dim.id)}>
                            <Trash2 className="w-3 h-3" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Dimension */}
              <div className="flex gap-2">
                <Input placeholder="Label" value={newDimLabel} onChange={(e) => setNewDimLabel(e.target.value)} className="h-8 text-sm flex-1" />
                <Input placeholder="Value" value={newDimValue} onChange={(e) => setNewDimValue(e.target.value)} className="h-8 text-sm flex-1" />
                <Button size="sm" onClick={addDimension} disabled={!newDimLabel || !newDimValue} className="h-8 text-xs text-white" style={{ backgroundColor: '#5E2129' }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="principles" className="mt-4 space-y-4">
              {/* Principles DnD List */}
              <DndContext sensors={sensors2} collisionDetection={closestCenter} onDragEnd={handlePrincipleDragEnd}>
                <SortableContext items={editPrinciples.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {editPrinciples.map((principle) => (
                      <SortableItem key={principle.id} id={principle.id}>
                        <div className="flex-1 flex items-center gap-2 p-2 rounded bg-white border" style={{ borderColor: '#E8E0D4' }}>
                          <p className="flex-1 text-sm" style={{ color: '#2C2417' }}>{principle.content}</p>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deletePrinciple(principle.id)}>
                            <Trash2 className="w-3 h-3" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Principle */}
              <div className="flex gap-2">
                <Input placeholder="Tambah prinsip baru..." value={newPrinciple} onChange={(e) => setNewPrinciple(e.target.value)} className="h-8 text-sm flex-1" />
                <Button size="sm" onClick={addPrinciple} disabled={!newPrinciple} className="h-8 text-xs text-white" style={{ backgroundColor: '#5E2129' }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditPilar(null)} className="text-sm">Batal</Button>
            <Button onClick={savePilar} disabled={saving} className="text-sm text-white" style={{ backgroundColor: '#5E2129' }}>
              {saving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Menyimpan...</> : <><Save className="w-3 h-3 mr-1" />Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DOMAINS MANAGER VIEW
// ═══════════════════════════════════════════════════════════════
function DomainsView() {
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ domains: DomainItem[] }>('/domains')
        setDomains(data.domains)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6 grid grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Domain Manager</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => (
          <Card key={domain.id} className="border-0 shadow-sm" style={{ backgroundColor: '#FAFAF8' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${domain.color}15` }}>
                  {domain.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: domain.color }}>{domain.name}</p>
                  <p className="text-xs" style={{ color: '#8B7D6B' }}>{domain.nameId}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B5E50' }}>
                {domain.description.length > 120 ? domain.description.slice(0, 120) + '...' : domain.description}
              </p>
              <div className="flex items-center gap-3 text-xs" style={{ color: '#B0A898' }}>
                <span>Hal: {domain.pageRange}</span>
                <Separator orientation="vertical" className="h-3" />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                  {domain.pilarStats?.total || domain._count?.pilars || 0} pilar
                </span>
              </div>
              {domain.pilarStats && (
                <div className="flex gap-2 mt-2">
                  <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>{domain.pilarStats.published} terbit</Badge>
                  <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>{domain.pilarStats.draft} draft</Badge>
                  <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>{domain.pilarStats.review} review</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MEDIA MANAGER VIEW
// ═══════════════════════════════════════════════════════════════
function MediaView() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ media: MediaItem[] }>('/media?limit=100')
      setMedia(data.media)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMedia() }, [loadMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'general')
      await fetch('/api/admin/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      loadMedia()
    } catch {
      // silent
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const deleteMedia = async (id: string) => {
    try {
      await apiFetch(`/media?id=${id}`, { method: 'DELETE' })
      loadMedia()
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Media Library</h2>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1.5 text-xs text-white" style={{ backgroundColor: '#5E2129' }}>
            {uploading ? <><Loader2 className="w-3 h-3 animate-spin" />Mengunggah...</> : <><Upload className="w-3 h-3" />Unggah</>}
          </Button>
          <Button size="sm" variant="outline" onClick={loadMedia} className="gap-1.5 text-xs">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: '#D4CFC8' }} />
          <p className="text-sm" style={{ color: '#B0A898' }}>Belum ada media diunggah</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm overflow-hidden group" style={{ backgroundColor: '#FAFAF8' }}>
              <div className="aspect-video bg-gray-100 relative">
                {item.mimeType.startsWith('image/') ? (
                  <img src={item.url} alt={item.alt || item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8" style={{ color: '#D4CFC8' }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMedia(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium truncate" style={{ color: '#2C2417' }}>{item.originalName}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: '#B0A898' }}>
                  <span>{formatFileSize(item.size)}</span>
                  <span>{item.mimeType.split('/')[1].toUpperCase()}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS VIEW
// ═══════════════════════════════════════════════════════════════
function SettingsView() {
  const [settings, setSettings] = useState<Record<string, { value: string | null; label: string | null; description: string | null; type: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ settings: typeof settings }>('/settings')
        setSettings(data.settings)
        const fv: Record<string, string> = {}
        for (const [k, v] of Object.entries(data.settings)) {
          fv[k] = v.value || ''
        }
        setFormValues(fv)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const body: Record<string, { value: string | null }> = {}
      for (const [key, value] of Object.entries(formValues)) {
        body[key] = { value: value || null }
      }
      await apiFetch('/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>

  const settingGroups = new Map<string, [string, typeof settings[string]][]>()
  for (const [key, val] of Object.entries(settings)) {
    const group = val.type || 'general'
    if (!settingGroups.has(group)) settingGroups.set(group, [])
    settingGroups.get(group)!.push([key, val])
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Pengaturan</h2>
        <Button onClick={saveSettings} disabled={saving} className="gap-1.5 text-xs text-white" style={{ backgroundColor: '#5E2129' }}>
          {saving ? <><Loader2 className="w-3 h-3 animate-spin" />Menyimpan...</> : <><Save className="w-3 h-3" />Simpan</>}
        </Button>
      </div>

      {Array.from(settingGroups.entries()).map(([group, entries]) => (
        <Card key={group} className="border-0 shadow-sm" style={{ backgroundColor: '#FAFAF8' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold capitalize" style={{ color: '#2C2417' }}>
              {group === 'general' ? 'Umum' : group === 'seo' ? 'SEO' : group === 'theme' ? 'Tema' : group}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {entries.map(([key, val]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs" style={{ color: '#6B5E50' }}>{val.label || key}</Label>
                {val.description && <p className="text-[10px]" style={{ color: '#B0A898' }}>{val.description}</p>}
                {key.includes('color') || key.includes('Color') ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formValues[key] || '#000000'}
                      onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={formValues[key] || ''}
                      onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                ) : key.toLowerCase().includes('description') || key.toLowerCase().includes('desc') ? (
                  <Textarea
                    value={formValues[key] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                    className="text-sm min-h-[80px]"
                  />
                ) : (
                  <Input
                    value={formValues[key] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                    className="h-9 text-sm"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG VIEW
// ═══════════════════════════════════════════════════════════════
function AuditLogView() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entityType', entityFilter)
      const data = await apiFetch<{ logs: AuditLogItem[]; pagination: { totalPages: number } }>(`/audit?${params}`)
      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, entityFilter])

  useEffect(() => { loadLogs() }, [loadLogs])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#2C2417' }}>Log Audit</h2>
        <Button size="sm" variant="outline" onClick={loadLogs} className="gap-1.5 text-xs">
          <RefreshCw className="w-3 h-3" /> Muat Ulang
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[130px] h-9 text-sm" style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E0D4' }}>
            <SelectValue placeholder="Semua Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="publish">Publish</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[130px] h-9 text-sm" style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E0D4' }}>
            <SelectValue placeholder="Semua Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Entity</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="pilar">Pilar</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="setting">Setting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-h-[55vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#F5F0EB' }}>
                <TableHead className="text-xs">Waktu</TableHead>
                <TableHead className="text-xs">Pengguna</TableHead>
                <TableHead className="text-xs">Aksi</TableHead>
                <TableHead className="text-xs">Entity</TableHead>
                <TableHead className="text-xs">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 rounded animate-pulse" style={{ backgroundColor: '#E8E0D4' }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12" style={{ color: '#B0A898' }}>Tidak ada log</TableCell>
                </TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap" style={{ color: '#8B7D6B' }}>{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#5E2129' }}>
                        {log.user?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: '#2C2417' }}>{log.user?.name || 'Sistem'}</p>
                        <p className="text-[10px]" style={{ color: '#B0A898' }}>{log.ipAddress || '-'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] px-1.5 py-0" style={{
                      backgroundColor: log.action === 'create' ? '#DCFCE7' : log.action === 'delete' ? '#FEF2F2' : log.action === 'login' ? '#FEF3C7' : '#EFF6FF',
                      color: log.action === 'create' ? '#166534' : log.action === 'delete' ? '#991B1B' : log.action === 'login' ? '#92400E' : '#1E40AF',
                    }}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs" style={{ color: '#6B5E50' }}>
                    {log.entityType}
                    {log.entityId && <span className="text-[10px] ml-1" style={{ color: '#B0A898' }}>#{log.entityId.slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate" style={{ color: '#B0A898' }}>
                    {log.details ? (log.details.length > 80 ? log.details.slice(0, 80) + '...' : log.details) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: '#E8E0D4' }}>
            <span style={{ color: '#8B7D6B' }}>Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 text-xs">Sebelumnya</Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 text-xs">Berikutnya</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════
export function AdminPanel() {
  const { isPanelOpen, closePanel, isAuthenticated, activeView, setActiveView, logout, user } = useAdminStore()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        useAdminStore.getState().togglePanel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (isPanelOpen && !isAuthenticated) {
      useAdminStore.getState().checkSession()
    }
  }, [isPanelOpen, isAuthenticated])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />
      case 'pages': return <PagesView />
      case 'pga72': return <PGA72View />
      case 'domains': return <DomainsView />
      case 'media': return <MediaView />
      case 'settings': return <SettingsView />
      case 'audit': return <AuditLogView />
      default: return <DashboardView />
    }
  }

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-0 right-0 z-[201] flex w-full max-w-[90vw] lg:max-w-[1200px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {!isAuthenticated ? (
              /* Login Screen */
              <div className="flex-1 bg-white overflow-y-auto" style={{ backgroundColor: '#FAFAF8' }}>
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E8E0D4' }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: '#5E2129' }} />
                    <span className="text-sm font-semibold" style={{ color: '#2C2417' }}>KNBMP Admin</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={closePanel} className="h-8 w-8">
                    <X className="w-4 h-4" style={{ color: '#8B7D6B' }} />
                  </Button>
                </div>
                <AdminLogin />
              </div>
            ) : (
              <>
                {/* Sidebar */}
                <div className="w-56 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#1A1814' }}>
                  {/* Header */}
                  <div className="p-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: '#C5A059' }} />
                    <div>
                      <p className="text-xs font-semibold text-white">KNBMP</p>
                      <p className="text-[10px]" style={{ color: '#6B5E50' }}>Admin Panel</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={closePanel} className="ml-auto h-7 w-7 text-white/50 hover:text-white hover:bg-white/10">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator className="opacity-10" />

                  {/* Nav Items */}
                  <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                          activeView === item.id
                            ? 'text-white'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: activeView === item.id ? '#C5A05915' : undefined,
                          borderLeft: activeView === item.id ? '2px solid #C5A059' : '2px solid transparent',
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* User Info */}
                  <div className="p-3 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#5E2129' }}>
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="w-full justify-start gap-2 text-xs text-white/40 hover:text-red-400 hover:bg-transparent cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      Keluar
                    </Button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white overflow-y-auto" style={{ backgroundColor: '#F7F5F2' }}>
                  {renderView()}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


