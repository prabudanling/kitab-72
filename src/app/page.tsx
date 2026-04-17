'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { domains, type Pillar, type Domain } from '@/lib/pillar-data'

// ═══════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════
const BURGUNDY = '#5E2129'
const GOLD = '#C5A059'
const CHARCOAL = '#2C2417'
const PARCHMENT = '#FAF9F6'
const DARK_BG = '#1A1814'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type BookPage =
  | { type: 'cover' }
  | { type: 'dedication' }
  | { type: 'toc' }
  | { type: 'domain-opener'; data: Domain }
  | { type: 'pillar'; data: { pillar: Pillar; domain: Domain } }
  | { type: 'philosophy' }
  | { type: 'covenant' }
  | { type: 'back-cover' }

// ═══════════════════════════════════════════════════════════════
// PAGE FLIP SOUND — Web Audio API (no external files needed)
// ═══════════════════════════════════════════════════════════════
function usePageFlipSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  return useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current

      // Create a soft paper rustle sound
      const duration = 0.18
      const sampleRate = ctx.sampleRate
      const bufferSize = Math.floor(sampleRate * duration)
      const buffer = ctx.createBuffer(2, bufferSize, sampleRate)

      // Layer 1: Main paper rustle (left channel)
      const left = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize
        const envelope = Math.exp(-t * 14) * Math.min(t * 80, 1)
        left[i] = (Math.random() * 2 - 1) * envelope * 0.10
      }

      // Layer 2: Subtle crackle (right channel, slightly different)
      const right = buffer.getChannelData(1)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize
        const envelope = Math.exp(-t * 18) * Math.min(t * 100, 1)
        right[i] = (Math.random() * 2 - 1) * envelope * 0.07
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      // Bandpass filter for paper-like quality
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 2500 + Math.random() * 1500
      filter.Q.value = 0.6

      source.connect(filter)
      filter.connect(ctx.destination)
      source.start(ctx.currentTime)
    } catch {
      // Audio not supported — fail silently
    }
  }, [])
}

// ═══════════════════════════════════════════════════════════════
// Z-INDEX FORMULA
// ═══════════════════════════════════════════════════════════════
const getZIndex = (index: number, currentLeaf: number, total: number) => {
  if (index < currentLeaf) return index + 1
  if (index === currentLeaf) return total + 1
  return total - (index - currentLeaf)
}

// ═══════════════════════════════════════════════════════════════
// BATIK WATERMARK — Kawung-inspired SVG pattern (3-5% opacity)
// ═══════════════════════════════════════════════════════════════
function BatikWatermark() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ opacity: 0.035 }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="batik-kawung" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="8" fill="none" stroke={GOLD} strokeWidth="0.5" />
            <circle cx="45" cy="45" r="8" fill="none" stroke={GOLD} strokeWidth="0.5" />
            <circle cx="15" cy="15" r="3" fill="none" stroke={GOLD} strokeWidth="0.3" />
            <circle cx="45" cy="45" r="3" fill="none" stroke={GOLD} strokeWidth="0.3" />
            <path d="M15 7L23 15L15 23L7 15Z" fill="none" stroke={GOLD} strokeWidth="0.3" />
            <path d="M45 37L53 45L45 53L37 45Z" fill="none" stroke={GOLD} strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#batik-kawung)" />
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DECORATIVE ELEMENTS
// ═══════════════════════════════════════════════════════════════
function GoldDivider({ color = GOLD, className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1 max-w-[120px]" style={{ backgroundColor: `${color}40` }} />
      <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ backgroundColor: `${color}60` }} />
      <div className="h-px flex-1 max-w-[120px]" style={{ backgroundColor: `${color}40` }} />
    </div>
  )
}

function CornerOrnament({ color = GOLD, size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="opacity-40">
      <path d="M2 38V12C2 6.48 6.48 2 12 2H38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 28V16C2 8.26 8.26 2 16 2H28" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// Batik-style chapter divider
function ChapterDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-4" style={{ opacity: 0.3 }}>
      <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke={GOLD} strokeWidth="0.6" />
        <circle cx="8" cy="8" r="2" fill={GOLD} opacity="0.5" />
      </svg>
      <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════════════════════════════════

function CoverPage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden paper-grain"
      style={{ backgroundColor: PARCHMENT }}>
      {/* Batik watermark */}
      <BatikWatermark />

      {/* Double gold border */}
      <div className="absolute inset-4 pointer-events-none" style={{ border: '2px solid #C5A05930', borderRadius: 4 }} />
      <div className="absolute inset-6 pointer-events-none" style={{ border: '1px solid #C5A05920', borderRadius: 2 }} />

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6"><CornerOrnament /></div>
      <div className="absolute top-6 right-6" style={{ transform: 'scaleX(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 left-6" style={{ transform: 'scaleY(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 right-6" style={{ transform: 'scale(-1,-1)' }}><CornerOrnament /></div>

      <div className="page-content-reveal flex flex-col items-center gap-4 max-w-md text-center relative z-10">
        {/* Classification */}
        <p className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px] tracking-[2px] uppercase"
          style={{ color: '#8B7D6B' }}>
          Dokumen Super-Master &nbsp;|&nbsp; Klasifikasi: Absolut &nbsp;|&nbsp; Horizon: 100 Tahun
        </p>

        <GoldDivider />

        {/* KNBMP */}
        <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-none"
          style={{ color: CHARCOAL }}>
          KNBMP
        </h1>

        {/* PGA-72 */}
        <p className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl tracking-[6px] font-normal"
          style={{ color: BURGUNDY }}>
          PGA-72
        </p>

        <GoldDivider />

        {/* Anatomi Peradaban */}
        <p className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic"
          style={{ color: '#6B5E50' }}>
          Anatomi Peradaban:
        </p>

        <h2 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl md:text-2xl leading-snug font-normal"
          style={{ color: BURGUNDY }}>
          72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat
        </h2>

        <GoldDivider />

        {/* Bottom subtitle */}
        <p className="font-[family-name:var(--font-body)] text-[8px] sm:text-[9px] tracking-[1.5px] uppercase mt-2"
          style={{ color: '#A09385' }}>
          Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih
        </p>
      </div>
    </div>
  )
}

function DedicationPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <div className="page-content-reveal flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-8 sm:py-12 relative z-10">
        <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[3px] uppercase mb-6"
          style={{ color: GOLD }}>
          Kata Pengantar
        </p>
        <div className="h-px w-16 mb-8" style={{ backgroundColor: `${GOLD}30` }} />

        <div className="max-w-xl mx-auto space-y-5 sm:space-y-6">
          {/* Paragraph 1 — with Drop Cap, VOC in grey */}
          <p className="drop-cap font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }}>
            <span className="font-semibold tracking-wide" style={{ color: '#999', letterSpacing: '0.03em' }}>VOC</span> berdiri tahun 1602 dengan satu tujuan: mengeksploitasi
            kekayaan Nusantara. Selama 347 tahun,{' '}
            <span style={{ color: '#999' }}>Hindia Belanda</span> menghisap
            rempah, emas, dan nyawa dari tanah yang subur — meninggalkan jejak luka yang masih
            terasa hingga kini.
          </p>

          {/* Paragraph 2 — KNBMP in burgundy + gold */}
          <p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }}>
            Namun dari rahim penderitaan itu, lahir sebuah tekad yang tak bisa dipatahkan.{' '}
            <span className="font-semibold" style={{ color: BURGUNDY }}>KNBMP</span> —{' '}
            <span className="font-semibold" style={{ color: BURGUNDY }}>Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih</span>{' '}
            — hadir sebagai{' '}
            <span style={{ color: BURGUNDY }}>antitesis absolut</span> dari seluruh
            sistem yang pernah menindas rakyat.
          </p>

          {/* Paragraph 3 — Gold highlights */}
          <p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }}>
            Buku ini bukan sekadar manual korporasi. Ia adalah{' '}
            <span className="font-semibold" style={{ color: GOLD }}>72 anak tangga</span>{' '}
            menuju kemerdekaan ekonomi yang sesungguhnya. Setiap domain mewakili
            satu fungsi vital, setiap pilar menguatkan yang lain — sebuah arsitektur
            peradaban yang dirancang untuk bertahan{' '}
            <span className="font-semibold" style={{ color: GOLD }}>100 tahun ke depan</span>.
          </p>
        </div>

        {/* Classification box */}
        <div className="max-w-xl mx-auto mt-8 w-full">
          <div className="border rounded-lg p-4 sm:p-5"
            style={{ borderColor: `${GOLD}25`, backgroundColor: PARCHMENT }}>
            <div className="space-y-2">
              {[
                { label: 'Klasifikasi', value: 'Absolute Source of Truth' },
                { label: 'Horizon', value: '100 Tahun (2025–2125)' },
                { label: 'Cakupan', value: '83.763 Desa, 34 Provinsi' },
                { label: 'Populasi Dampak', value: '275 Juta Jiwa' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <span className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8B7D6B' }}>
                    {item.label}
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-xs sm:text-sm"
                    style={{ color: '#3E2723' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TableOfContentsPage() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden paper-grain"
      style={{ backgroundColor: '#FFFEFB' }}>
      <BatikWatermark />

      {/* Left burgundy accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 z-20" style={{ backgroundColor: BURGUNDY }} />

      <div className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-6 sm:py-8">
        {/* ═══ HEADER — Exactly as in uploaded document ═══ */}
        <div className="text-center mb-6">
          {/* Top ornamental line */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: `${GOLD}50` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
            <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: `${GOLD}50` }} />
          </div>

          <h2 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-normal tracking-wide"
            style={{ color: CHARCOAL }}>
            Master Index PGA-72
          </h2>
          <p className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-normal mt-1"
            style={{ color: BURGUNDY }}>
            Anatomi Peradaban KNBMP
          </p>
          <p className="font-[family-name:var(--font-heading)] text-[10px] sm:text-xs tracking-[2px] uppercase mt-2"
            style={{ color: '#8B7D6B' }}>
            Dokumen Super-Master &nbsp;|&nbsp; Klasifikasi: Absolut &nbsp;|&nbsp; Horizon: 100 Tahun
          </p>

          {/* Bottom ornamental line */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: `${GOLD}50` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
            <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: `${GOLD}50` }} />
          </div>
        </div>

        {/* ═══ INTRO PARAGRAPH — Exactly as in uploaded document ═══ */}
        <p className="font-[family-name:var(--font-serif)] text-[11px] sm:text-[13px] leading-[1.85] text-center mb-8 max-w-lg mx-auto"
          style={{ color: '#4A3F32' }}>
          Buku ini bukan sekadar manual korporasi. Ini adalah 72 anak tangga menuju kemerdekaan ekonomi. Setiap domain mewakili satu fungsi vital dari ekosistem kita. Berikut adalah arsitektur lengkap beserta makna filosofis di balik setiap dokumennya.
        </p>

        {/* ═══ 9 DOMAINS × 8 PILLARS — Exact format from uploaded document ═══ */}
        <div className="space-y-5 sm:space-y-6">
          {domains.map((domain, domainIdx) => (
            <div key={domain.id} className="relative">
              {/* Domain header — exactly: "🏛️ DOMAIN 1: IDENTITY & CIVILIZATION (RUH & JATI DIRI)" */}
              <div className="flex items-start gap-2 mb-1.5">
                <span className="text-sm sm:text-base flex-shrink-0 mt-px">{domain.emoji}</span>
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs font-bold tracking-wider uppercase leading-tight"
                    style={{ color: domain.color }}>
                    Domain {domain.id}: {domain.name}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: '#6B5E50' }}>
                    ({domain.nameId} — {domain.nameSubtitle})
                  </p>
                </div>
              </div>

              {/* Domain description */}
              <p className="font-[family-name:var(--font-serif)] text-[11px] sm:text-[13px] leading-[1.75] ml-5 sm:ml-6 mb-2"
                style={{ color: '#3E2723' }}>
                {domain.description}
              </p>

              {/* Pillar list — exactly: "PGA-01: Name (English) — Description" */}
              <div className="ml-5 sm:ml-6 space-y-2 mb-2">
                {domain.pillars.map((pillar) => (
                  <div key={pillar.id}
                    className="relative pl-3"
                    style={{ borderLeft: `2px solid ${domain.color}20` }}>
                    <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-[11px] leading-[1.6]"
                      style={{ color: '#3E2723' }}>
                      <span className="font-bold" style={{ color: domain.color }}>{pillar.code}</span>
                      <span style={{ color: '#3E2723' }}>:{' '}</span>
                      <span className="font-semibold">{pillar.name}</span>
                      <span className="font-[family-name:var(--font-serif)] italic" style={{ color: '#6B5E50' }}>
                        {' '}({pillar.eng})
                      </span>
                      <span style={{ color: '#8B7D6B' }}> — </span>
                      <span style={{ color: '#4A3F32' }}>{pillar.desc}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Domain separator — elegant batik-style */}
              {domainIdx < domains.length - 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="h-px flex-1" style={{ backgroundColor: `${domain.color}15` }} />
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.3 }}>
                    <path d="M5 0L10 5L5 10L0 5Z" fill="none" stroke={domain.color} strokeWidth="0.5" />
                  </svg>
                  <div className="h-px flex-1" style={{ backgroundColor: `${domain.color}15` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom spacing for scroll */}
        <div className="h-6" />
      </div>
    </div>
  )
}

function DomainOpenerPage({ domain }: { domain: Domain }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain">
      <BatikWatermark />
      {/* Left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: domain.color }} />

      <div className="page-content-reveal flex flex-col px-8 sm:px-12 py-10 sm:py-14 flex-1 relative z-10">
        <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[3px] uppercase mb-4"
          style={{ color: domain.color }}>
          Domain {domain.id}
        </p>

        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal leading-tight mb-1"
          style={{ color: CHARCOAL }}>
          {domain.emoji} {domain.name}
        </h2>

        <p className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic mb-6"
          style={{ color: domain.color }}>
          ({domain.nameId} — {domain.nameSubtitle})
        </p>

        <ChapterDivider />

        <p className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed mb-auto"
          style={{ color: '#3E2723' }}>
          {domain.description}
        </p>

        <div className="mt-6 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-px" style={{ backgroundColor: domain.color }} />
            <span className="font-[family-name:var(--font-body)] text-xs font-semibold"
              style={{ color: domain.color }}>
              {domain.pillars.length} Pilar
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {domain.pillars.map((p) => (
              <span key={p.id} className="font-[family-name:var(--font-body)] text-[10px]"
                style={{ color: '#6B5E50' }}>
                {p.code}
              </span>
            ))}
          </div>
        </div>

        <p className="font-[family-name:var(--font-body)] text-sm font-semibold mt-4"
          style={{ color: domain.color }}>
          {domain.range}
        </p>

        <div className="absolute bottom-4 right-4 opacity-30">
          <CornerOrnament color={domain.color} size={50} />
        </div>
      </div>
    </div>
  )
}

function PillarPage({ pillar, domain }: { pillar: Pillar; domain: Domain }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain">
      {/* Top color strip */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 flex-shrink-0"
        style={{ backgroundColor: `${domain.color}08` }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domain.color }} />
          <span className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: domain.color }}>
            {domain.code} &middot; {domain.nameId}
          </span>
        </div>
        <span className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px]"
          style={{ color: '#A09385' }}>
          {pillar.badge === 'foundation' ? 'Fondasi' : pillar.badge === 'strategic' ? 'Strategis' : 'Operasional'}
        </span>
      </div>

      {/* Large faded background number */}
      <div className="relative flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-5 page-fold-shadow">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
          style={{
            fontSize: 'clamp(100px, 18vw, 200px)',
            color: `${domain.color}08`,
            lineHeight: 1,
          }}>
          {pillar.id}
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          {/* Badge */}
          <span className="inline-block self-start px-3 py-1 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-bold tracking-wider"
            style={{ backgroundColor: `${domain.color}15`, color: domain.color }}>
            {pillar.code}
          </span>

          {/* Pillar name */}
          <h3 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-normal leading-tight"
            style={{ color: CHARCOAL }}>
            {pillar.name}
          </h3>

          {/* English name */}
          <p className="font-[family-name:var(--font-heading)] text-xs sm:text-sm italic"
            style={{ color: '#8B7D6B' }}>
            {pillar.eng}
          </p>

          {/* Gold line */}
          <div className="h-px w-full max-w-[200px]" style={{ backgroundColor: `${GOLD}40` }} />

          {/* Description */}
          <p className="font-[family-name:var(--font-body)] text-[13px] sm:text-sm leading-relaxed"
            style={{ color: '#3E2723' }}>
            {pillar.desc}
          </p>

          {/* Vision quote */}
          <div className="border-l-3 rounded-r p-3 sm:p-4"
            style={{
              backgroundColor: `${domain.color}06`,
              borderColor: `${domain.color}60`,
              borderLeftWidth: 3,
            }}>
            <p className="font-[family-name:var(--font-serif)] text-xs sm:text-[13px] leading-relaxed italic"
              style={{ color: '#3E2723' }}>
              {pillar.vision}
            </p>
          </div>

          {/* Dimensions */}
          {pillar.dimensions.length > 0 && (
            <div>
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-2"
                style={{ color: '#8B7D6B' }}>
                Dimensi
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {pillar.dimensions.map((dim, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs font-semibold flex-shrink-0"
                      style={{ color: '#6B5E50' }}>
                      {dim.label}:
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs"
                      style={{ color: '#3E2723' }}>
                      {dim.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Principles */}
          {pillar.principles.length > 0 && (
            <div>
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-2"
                style={{ color: '#8B7D6B' }}>
                Prinsip Utama
              </p>
              <ul className="space-y-1.5">
                {pillar.principles.map((principle, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: GOLD }} />
                    <span className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs leading-relaxed"
                      style={{ color: '#3E2723' }}>
                      {principle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cross references */}
          {pillar.xref.length > 0 && (
            <div className="mt-1">
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-1.5"
                style={{ color: '#8B7D6B' }}>
                Referensi Silang
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pillar.xref.map((refId) => (
                  <span key={refId}
                    className="inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-[family-name:var(--font-body)] font-semibold"
                    style={{ backgroundColor: `${domain.color}10`, color: domain.color }}>
                    PGA-{String(refId).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom page indicator */}
      <div className="flex-shrink-0 px-5 sm:px-8 py-2">
        <div className="h-px w-full mb-1.5" style={{ backgroundColor: '#E8E0D4' }} />
        <p className="font-[family-name:var(--font-body)] text-[8px] sm:text-[9px] text-center tracking-wider"
          style={{ color: '#B0A898' }}>
          {pillar.code} &middot; {pillar.id} / 72
        </p>
      </div>
    </div>
  )
}

function PhilosophyPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: BURGUNDY }} />
      <BatikWatermark />

      {/* Phi watermark */}
      <div className="absolute top-8 right-6 sm:top-12 sm:right-10 font-[family-name:var(--font-heading)] pointer-events-none select-none z-0"
        style={{
          fontSize: 'clamp(120px, 25vw, 250px)',
          color: `${BURGUNDY}08`,
          lineHeight: 1,
        }}>
        φ
      </div>

      <div className="page-content-reveal flex-1 flex flex-col justify-center px-10 sm:px-16 py-10 sm:py-14 relative z-10">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal leading-tight mb-2"
          style={{ color: CHARCOAL }}>
          Mengapa 72? Mengapa 9 Domain?
        </h2>

        <GoldDivider className="my-4" color={BURGUNDY} />

        <div className="max-w-lg mx-auto space-y-5">
          <p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }}>
            Angka 72 bukan kebetulan. Ia adalah kelipatan dari Golden Ratio Fibonacci —
            8 &times; 9 = 72. Delapan representasi arah mata angin dalam Nusantara, sembilan simbol
            kekuatan sembilan naga langit dalam filosofi Jawa kuno.
          </p>

          <p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }}>
            Arsitektur PGA-72 dibangun dengan prinsip bahwa setiap domain saling bergantung —
            tidak ada satu pilar pun yang berdiri sendiri. Ketika satu pilar goyah, seluruh
            ekosistem merasakan getarannya. Inilah desain peradaban:{' '}
            <span className="font-semibold" style={{ color: BURGUNDY }}>terhubung, tangguh, dan abadi</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function CovenantPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center px-8 sm:px-12 py-10 sm:py-14 overflow-hidden paper-grain">
      <BatikWatermark />
      <div className="page-content-reveal flex flex-col items-center max-w-md text-center relative z-10">
        {/* Decorative top border */}
        <div className="w-16 h-px mb-6" style={{ backgroundColor: BURGUNDY }} />

        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal"
          style={{ color: BURGUNDY }}>
          Covenant of Civilization
        </h2>

        <p className="font-[family-name:var(--font-heading)] text-sm italic mt-1 mb-6"
          style={{ color: GOLD }}>
          Perjanjian Suci
        </p>

        <GoldDivider />

        <blockquote className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85] italic mt-6 mb-8"
          style={{ color: '#3E2723' }}>
          &ldquo;Kami berjanji — di hadapan sejarah, di hadapan 275 juta rakyat Indonesia, dan
          di hadapan generasi yang belum lahir — bahwa{' '}
          <span className="font-semibold" style={{ color: BURGUNDY }}>kedaulatan ekonomi rakyat</span>{' '}
          bukanlah impian. Ia adalah tujuan yang kami pertaruhkan dengan segala daya dan upaya.&rdquo;
        </blockquote>

        <GoldDivider />

        <p className="font-[family-name:var(--font-body)] text-xs tracking-wider uppercase mt-6"
          style={{ color: '#A09385' }}>
          Grand Architect&apos;s Office &middot; KNBMP
        </p>

        {/* Decorative bottom */}
        <div className="w-16 h-px mt-6" style={{ backgroundColor: BURGUNDY }} />
      </div>
    </div>
  )
}

function BackCoverPage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden paper-grain"
      style={{ backgroundColor: PARCHMENT }}>
      <BatikWatermark />

      {/* MERDEKA watermark */}
      <div className="absolute font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
        style={{
          fontSize: 'clamp(60px, 15vw, 140px)',
          color: `${BURGUNDY}06`,
          letterSpacing: '0.1em',
          lineHeight: 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
        MERDEKA
      </div>

      <div className="page-content-reveal flex flex-col items-center gap-6 relative z-10">
        <GoldDivider color={BURGUNDY} />

        <p className="font-[family-name:var(--font-heading)] text-lg sm:text-xl italic"
          style={{ color: '#6B5E50' }}>
          Grand Architect&apos;s Office
        </p>

        <p className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase"
          style={{ color: '#A09385' }}>
          Klasifikasi: Absolute Source of Truth
        </p>

        <p className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
          style={{ color: GOLD }}>
          2025
        </p>

        <GoldDivider color={BURGUNDY} />

        {/* Small decorative element */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${GOLD}40` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${BURGUNDY}30` }} />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RENDER PAGE DISPATCHER
// ═══════════════════════════════════════════════════════════════
function renderPage(page: BookPage, index: number) {
  switch (page.type) {
    case 'cover':
      return <CoverPage key={`cover-${index}`} />
    case 'dedication':
      return <DedicationPage key={`ded-${index}`} />
    case 'toc':
      return <TableOfContentsPage key={`toc-${index}`} />
    case 'domain-opener':
      return <DomainOpenerPage key={`do-${page.data.id}`} domain={page.data} />
    case 'pillar':
      return (
        <PillarPage
          key={`p-${page.data.pillar.id}`}
          pillar={page.data.pillar}
          domain={page.data.domain}
        />
      )
    case 'philosophy':
      return <PhilosophyPage key={`phil-${index}`} />
    case 'covenant':
      return <CovenantPage key={`cov-${index}`} />
    case 'back-cover':
      return <BackCoverPage key={`bc-${index}`} />
    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN FLIPBOOK COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const [currentLeaf, setCurrentLeaf] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const playFlipSound = usePageFlipSound()

  // ── Generate book pages ──
  const bookPages = useMemo<BookPage[]>(() => {
    const pages: BookPage[] = [
      { type: 'cover' },
      { type: 'dedication' },
      { type: 'toc' },
      ...domains.flatMap((domain) => [
        { type: 'domain-opener' as const, data: domain },
        ...domain.pillars.map((pillar) => ({
          type: 'pillar' as const,
          data: { pillar, domain },
        })),
      ]),
      { type: 'philosophy' as const },
      { type: 'covenant' as const },
      { type: 'back-cover' as const },
    ]
    return pages
  }, [])

  const totalPages = bookPages.length

  // ── Hide hint after 5s ──
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // ── Get current domain color for page indicator ──
  const currentPageInfo = useMemo(() => {
    const page = bookPages[currentLeaf]
    if (!page) return { domainColor: GOLD, domainName: '', pillarCode: '' }
    switch (page.type) {
      case 'cover': return { domainColor: GOLD, domainName: 'Sampul', pillarCode: '' }
      case 'dedication': return { domainColor: BURGUNDY, domainName: 'Kata Pengantar', pillarCode: '' }
      case 'toc': return { domainColor: BURGUNDY, domainName: 'Daftar Isi', pillarCode: '' }
      case 'domain-opener': return { domainColor: page.data.color, domainName: page.data.name, pillarCode: '' }
      case 'pillar': return { domainColor: page.data.domain.color, domainName: page.data.domain.name, pillarCode: page.data.pillar.code }
      case 'philosophy': return { domainColor: BURGUNDY, domainName: 'Filosofi', pillarCode: '' }
      case 'covenant': return { domainColor: BURGUNDY, domainName: 'Covenant', pillarCode: '' }
      case 'back-cover': return { domainColor: GOLD, domainName: 'Sampul Belakang', pillarCode: '' }
      default: return { domainColor: GOLD, domainName: '', pillarCode: '' }
    }
  }, [currentLeaf, bookPages])

  // ── Navigation functions ──
  const goNext = useCallback(() => {
    if (isAnimating || currentLeaf >= totalPages - 1) return
    setIsAnimating(true)
    if (soundEnabled) playFlipSound()
    setCurrentLeaf((prev) => prev + 1)
    setTimeout(() => setIsAnimating(false), 850)
  }, [isAnimating, currentLeaf, totalPages, soundEnabled, playFlipSound])

  const goPrev = useCallback(() => {
    if (isAnimating || currentLeaf <= 0) return
    setIsAnimating(true)
    if (soundEnabled) playFlipSound()
    setCurrentLeaf((prev) => prev - 1)
    setTimeout(() => setIsAnimating(false), 850)
  }, [isAnimating, currentLeaf, soundEnabled, playFlipSound])

  // ── Keyboard handler ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  // ── Click handler (desktop: left/right halves) ──
  const handleBookClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const midX = rect.width / 2
      if (clickX < midX) goPrev()
      else goNext()
    },
    [goNext, goPrev]
  )

  // ── Touch handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goNext()
        else goPrev()
      }
    },
    [goNext, goPrev]
  )

  // ── Progress ──
  const progress = ((currentLeaf + 1) / totalPages) * 100
  const displayPage = currentLeaf + 1

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: DARK_BG }}>
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 gap-6">
        {/* Left nav arrow */}
        <button
          onClick={goPrev}
          disabled={currentLeaf <= 0}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#2A2520',
            color: GOLD,
            border: '1px solid #3A3530',
          }}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Book */}
        <div
          className="relative flex-shrink-0 rounded-sm overflow-hidden cursor-pointer select-none"
          style={{
            width: 'min(780px, 80vw)',
            height: 'min(90vh, 780px * 4/3)',
            perspective: '2500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(197,160,89,0.3)',
          }}
          onClick={handleBookClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="book"
          aria-label={`Halaman ${displayPage} dari ${totalPages}`}
        >
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div
                key={index}
                className="absolute inset-0 bg-white overflow-hidden"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped
                    ? '-5px 0 20px rgba(0,0,0,0.15)'
                    : isCurrent
                      ? '8px 0 30px rgba(0,0,0,0.25)'
                      : '3px 0 10px rgba(0,0,0,0.15)',
                }}
              >
                {renderPage(page, index)}
              </div>
            )
          })}
        </div>

        {/* Right nav arrow */}
        <button
          onClick={goNext}
          disabled={currentLeaf >= totalPages - 1}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#2A2520',
            color: GOLD,
            border: '1px solid #3A3530',
          }}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden flex-1 flex-col">
        {/* Book area */}
        <div
          className="relative flex-1 overflow-hidden cursor-pointer select-none"
          style={{ perspective: '2500px' }}
          onClick={handleBookClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="book"
          aria-label={`Halaman ${displayPage} dari ${totalPages}`}
        >
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div
                key={index}
                className="absolute inset-0 bg-white overflow-hidden"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped
                    ? '-3px 0 10px rgba(0,0,0,0.15)'
                    : isCurrent
                      ? '4px 0 15px rgba(0,0,0,0.2)'
                      : '2px 0 5px rgba(0,0,0,0.1)',
                }}
              >
                {renderPage(page, index)}
              </div>
            )
          })}
        </div>

        {/* Bottom navigation bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          style={{ backgroundColor: DARK_BG }}
        >
          <button
            onClick={goPrev}
            disabled={currentLeaf <= 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{
              backgroundColor: '#2A2520',
              color: GOLD,
              border: '1px solid #3A3530',
            }}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Enhanced mobile page indicator */}
          <div className="text-center min-w-0 flex-1 mx-3">
            {currentPageInfo.pillarCode && (
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-wider truncate"
                style={{ color: currentPageInfo.domainColor }}>
                {currentPageInfo.pillarCode} · {currentPageInfo.domainName}
              </p>
            )}
            <p className="font-[family-name:var(--font-body)] text-xs tracking-wider"
              style={{ color: '#A09385' }}>
              Halaman {displayPage} / {totalPages}
            </p>
          </div>

          <button
            onClick={goNext}
            disabled={currentLeaf >= totalPages - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{
              backgroundColor: '#2A2520',
              color: GOLD,
              border: '1px solid #3A3530',
            }}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 h-1 pointer-events-none">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: currentPageInfo.domainColor || GOLD,
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── Desktop bottom bar (page indicator + sound toggle) ── */}
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-3">
        <div
          className="flex items-center gap-3 px-5 py-2 rounded-full"
          style={{
            color: '#A09385',
            backgroundColor: '#1A1814CC',
            border: '1px solid #2A2520',
          }}
        >
          {/* Domain color dot */}
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: currentPageInfo.domainColor || GOLD }} />

          {/* Page + Domain info */}
          <div className="text-center min-w-0">
            {currentPageInfo.pillarCode && (
              <p className="font-[family-name:var(--font-body)] text-[10px] tracking-wider"
                style={{ color: currentPageInfo.domainColor }}>
                {currentPageInfo.pillarCode}
              </p>
            )}
            <p className="font-[family-name:var(--font-body)] text-sm tracking-wider">
              {displayPage} / {totalPages}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-5" style={{ backgroundColor: '#3A3530' }} />

          {/* Sound toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSoundEnabled((prev) => !prev)
              if (!soundEnabled) {
                // Play a test sound when enabling
                try {
                  playFlipSound()
                } catch { /* ignore */ }
              }
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
            style={{ color: soundEnabled ? GOLD : '#6B5E50' }}
            aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Keyboard hint (fades after 5s) ── */}
      <div
        className="fixed bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: showHint ? 1 : 0 }}
      >
        <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-wider"
          style={{ color: '#6B5E50' }}>
          ← → atau klik untuk berpindah halaman
        </p>
      </div>
    </main>
  )
}
