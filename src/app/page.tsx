'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { domains, type Pillar, type Domain } from '@/lib/pillar-data'

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
// Z-INDEX FORMULA
// ═══════════════════════════════════════════════════════════════
const getZIndex = (index: number, currentLeaf: number, total: number) => {
  if (index < currentLeaf) return index + 1
  if (index === currentLeaf) return total + 1
  return total - (index - currentLeaf)
}

// ═══════════════════════════════════════════════════════════════
// DECORATIVE ELEMENTS
// ═══════════════════════════════════════════════════════════════
function GoldDivider({ color = '#C5A059', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1 max-w-[120px]" style={{ backgroundColor: `${color}40` }} />
      <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ backgroundColor: `${color}60` }} />
      <div className="h-px flex-1 max-w-[120px]" style={{ backgroundColor: `${color}40` }} />
    </div>
  )
}

function CornerOrnament({ color = '#C5A059', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="opacity-40">
      <path d="M2 38V12C2 6.48 6.48 2 12 2H38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 28V16C2 8.26 8.26 2 16 2H28" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════════════════════════════════

function CoverPage() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Double gold border */}
      <div
        className="absolute inset-4 pointer-events-none"
        style={{
          border: '2px solid #C5A05930',
          borderRadius: 4,
        }}
      />
      <div
        className="absolute inset-6 pointer-events-none"
        style={{
          border: '1px solid #C5A05920',
          borderRadius: 2,
        }}
      />

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6"><CornerOrnament /></div>
      <div className="absolute top-6 right-6" style={{ transform: 'scaleX(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 left-6" style={{ transform: 'scaleY(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 right-6" style={{ transform: 'scale(-1,-1)' }}><CornerOrnament /></div>

      <div className="flex flex-col items-center gap-4 max-w-md text-center relative z-10">
        {/* Classification */}
        <p
          className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px] tracking-[2px] uppercase"
          style={{ color: '#8B7D6B' }}
        >
          Dokumen Super-Master &nbsp;|&nbsp; Klasifikasi: Absolut &nbsp;|&nbsp; Horizon: 100 Tahun
        </p>

        <GoldDivider />

        {/* KNBMP */}
        <h1
          className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-none"
          style={{ color: '#2C2417' }}
        >
          KNBMP
        </h1>

        {/* PGA-72 */}
        <p
          className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl tracking-[6px] font-normal"
          style={{ color: '#4A3F32' }}
        >
          PGA-72
        </p>

        <GoldDivider />

        {/* Anatomi Peradaban */}
        <p
          className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic"
          style={{ color: '#6B5E50' }}
        >
          Anatomi Peradaban:
        </p>

        <h2
          className="font-[family-name:var(--font-heading)] text-lg sm:text-xl md:text-2xl leading-snug font-normal"
          style={{ color: '#C5A059' }}
        >
          72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat
        </h2>

        <GoldDivider />

        {/* Bottom subtitle */}
        <p
          className="font-[family-name:var(--font-body)] text-[8px] sm:text-[9px] tracking-[1.5px] uppercase mt-2"
          style={{ color: '#A09385' }}
        >
          Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih
        </p>
      </div>
    </div>
  )
}

function DedicationPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col px-8 sm:px-12 py-10 sm:py-14 overflow-y-auto">
      <div className="max-w-lg mx-auto flex flex-col gap-6 flex-1">
        <p
          className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase"
          style={{ color: '#C5A059' }}
        >
          Pendahuluan
        </p>

        <div
          className="h-px w-16"
          style={{ backgroundColor: '#C5A05940' }}
        />

        <p
          className="font-[family-name:var(--font-heading)] text-base sm:text-lg leading-relaxed italic text-center"
          style={{ color: '#3E2723' }}
        >
          Buku ini bukan sekadar manual korporasi. Ini adalah 72 anak tangga menuju kemerdekaan ekonomi. Setiap domain mewakili satu fungsi vital dari ekosistem kita. Berikut adalah arsitektur lengkap beserta makna filosofis di balik setiap dokumennya.
        </p>

        {/* Classification box */}
        <div
          className="mt-auto border rounded-lg p-5 sm:p-6"
          style={{
            borderColor: '#C5A05930',
            backgroundColor: '#FAF9F6',
          }}
        >
          <div className="space-y-2">
            {[
              { label: 'Klasifikasi', value: 'Absolute Source of Truth' },
              { label: 'Horizon', value: '100 Tahun (2025–2125)' },
              { label: 'Cakupan', value: '83.763 Desa, 34 Provinsi' },
              { label: 'Populasi Dampak', value: '275 Juta Jiwa' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <span
                  className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#8B7D6B' }}
                >
                  {item.label}
                </span>
                <span
                  className="font-[family-name:var(--font-body)] text-sm"
                  style={{ color: '#3E2723' }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TableOfContentsPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col px-6 sm:px-10 py-8 sm:py-10 overflow-y-auto">
      <h2
        className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-normal mb-6 text-center"
        style={{ color: '#2C2417' }}
      >
        Daftar Isi
      </h2>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {domains.map((domain) => (
          <div key={domain.id}>
            {/* Domain header */}
            <div className="flex items-start gap-2 mb-1">
              <span className="text-sm sm:text-base flex-shrink-0">{domain.emoji}</span>
              <div className="min-w-0">
                <p
                  className="font-[family-name:var(--font-heading)] text-xs sm:text-sm font-semibold leading-tight"
                  style={{ color: domain.color }}
                >
                  DOMAIN {domain.id}: {domain.name}
                </p>
                <p
                  className="font-[family-name:var(--font-heading)] text-[10px] sm:text-xs italic"
                  style={{ color: '#8B7D6B' }}
                >
                  ({domain.nameId} — {domain.nameSubtitle})
                </p>
                <p
                  className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px]"
                  style={{ color: '#A09385' }}
                >
                  {domain.range}
                </p>
              </div>
            </div>

            {/* Pillar list */}
            <div className="ml-5 sm:ml-7 space-y-0.5 mb-3">
              {domain.pillars.map((pillar) => (
                <p
                  key={pillar.id}
                  className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs leading-relaxed"
                  style={{ color: '#4A3F32' }}
                >
                  <span className="font-semibold" style={{ color: domain.color }}>{pillar.code}</span>
                  {' '}{pillar.name}
                </p>
              ))}
            </div>

            {/* Separator */}
            <div className="h-px" style={{ backgroundColor: '#E8E0D4' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DomainOpenerPage({ domain }: { domain: Domain }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* Left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: domain.color }}
      />

      <div className="flex flex-col px-8 sm:px-12 py-10 sm:py-14 flex-1">
        {/* Domain number label */}
        <p
          className="font-[family-name:var(--font-body)] text-[10px] tracking-[3px] uppercase mb-4"
          style={{ color: domain.color }}
        >
          Domain {domain.id}
        </p>

        {/* Title */}
        <h2
          className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal leading-tight mb-1"
          style={{ color: '#2C2417' }}
        >
          {domain.emoji} {domain.name}
        </h2>

        {/* Subtitle */}
        <p
          className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic mb-6"
          style={{ color: domain.color }}
        >
          ({domain.nameId} — {domain.nameSubtitle})
        </p>

        {/* Description */}
        <p
          className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed mb-auto"
          style={{ color: '#3E2723' }}
        >
          {domain.description}
        </p>

        {/* Pillar count */}
        <div className="mt-6 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-px" style={{ backgroundColor: domain.color }} />
            <span
              className="font-[family-name:var(--font-body)] text-xs font-semibold"
              style={{ color: domain.color }}
            >
              {domain.pillars.length} Pilar
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {domain.pillars.map((p) => (
              <span
                key={p.id}
                className="font-[family-name:var(--font-body)] text-[10px]"
                style={{ color: '#6B5E50' }}
              >
                {p.code}
              </span>
            ))}
          </div>
        </div>

        {/* Range */}
        <p
          className="font-[family-name:var(--font-body)] text-sm font-semibold mt-4"
          style={{ color: domain.color }}
        >
          {domain.range}
        </p>

        {/* Corner ornament */}
        <div className="absolute bottom-4 right-4 opacity-30">
          <CornerOrnament color={domain.color} size={50} />
        </div>
      </div>
    </div>
  )
}

function PillarPage({ pillar, domain }: { pillar: Pillar; domain: Domain }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* Top color strip */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 flex-shrink-0"
        style={{ backgroundColor: `${domain.color}08` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domain.color }} />
          <span
            className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase"
            style={{ color: domain.color }}
          >
            {domain.code} &middot; {domain.nameId}
          </span>
        </div>
        <span
          className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px]"
          style={{ color: '#A09385' }}
        >
          {pillar.badge === 'foundation' ? 'Fondasi' : pillar.badge === 'strategic' ? 'Strategis' : 'Operasional'}
        </span>
      </div>

      {/* Large faded background number */}
      <div className="relative flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-5">
        <div
          className="absolute top-2 right-2 sm:top-4 sm:right-4 font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
          style={{
            fontSize: 'clamp(100px, 18vw, 200px)',
            color: `${domain.color}08`,
            lineHeight: 1,
          }}
        >
          {pillar.id}
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          {/* Badge */}
          <span
            className="inline-block self-start px-3 py-1 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-bold tracking-wider"
            style={{
              backgroundColor: `${domain.color}15`,
              color: domain.color,
            }}
          >
            {pillar.code}
          </span>

          {/* Pillar name */}
          <h3
            className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-normal leading-tight"
            style={{ color: '#2C2417' }}
          >
            {pillar.name}
          </h3>

          {/* English name */}
          <p
            className="font-[family-name:var(--font-heading)] text-xs sm:text-sm italic"
            style={{ color: '#8B7D6B' }}
          >
            {pillar.eng}
          </p>

          {/* Gold line */}
          <div className="h-px w-full max-w-[200px]" style={{ backgroundColor: '#C5A05940' }} />

          {/* Description */}
          <p
            className="font-[family-name:var(--font-body)] text-[13px] sm:text-sm leading-relaxed"
            style={{ color: '#3E2723' }}
          >
            {pillar.desc}
          </p>

          {/* Vision quote */}
          <div
            className="border-l-3 rounded-r p-3 sm:p-4"
            style={{
              backgroundColor: `${domain.color}06`,
              borderColor: `${domain.color}60`,
              borderLeftWidth: 3,
            }}
          >
            <p
              className="font-[family-name:var(--font-heading)] text-xs sm:text-[13px] leading-relaxed italic"
              style={{ color: '#3E2723' }}
            >
              {pillar.vision}
            </p>
          </div>

          {/* Dimensions */}
          {pillar.dimensions.length > 0 && (
            <div>
              <p
                className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-2"
                style={{ color: '#8B7D6B' }}
              >
                Dimensi
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {pillar.dimensions.map((dim, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span
                      className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs font-semibold flex-shrink-0"
                      style={{ color: '#6B5E50' }}
                    >
                      {dim.label}:
                    </span>
                    <span
                      className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs"
                      style={{ color: '#3E2723' }}
                    >
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
              <p
                className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-2"
                style={{ color: '#8B7D6B' }}
              >
                Prinsip Utama
              </p>
              <ul className="space-y-1.5">
                {pillar.principles.map((principle, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: '#C5A059' }}
                    />
                    <span
                      className="font-[family-name:var(--font-body)] text-[11px] sm:text-xs leading-relaxed"
                      style={{ color: '#3E2723' }}
                    >
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
              <p
                className="font-[family-name:var(--font-body)] text-[10px] tracking-[2px] uppercase font-semibold mb-1.5"
                style={{ color: '#8B7D6B' }}
              >
                Referensi Silang
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pillar.xref.map((refId) => (
                  <span
                    key={refId}
                    className="inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-[family-name:var(--font-body)] font-semibold"
                    style={{
                      backgroundColor: `${domain.color}10`,
                      color: domain.color,
                    }}
                  >
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
        <p
          className="font-[family-name:var(--font-body)] text-[8px] sm:text-[9px] text-center tracking-wider"
          style={{ color: '#B0A898' }}
        >
          {pillar.code} &middot; {pillar.id} / 72
        </p>
      </div>
    </div>
  )
}

function PhilosophyPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* Left gold border */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: '#C5A059' }} />

      {/* Phi watermark */}
      <div
        className="absolute top-8 right-6 sm:top-12 sm:right-10 font-[family-name:var(--font-heading)] pointer-events-none select-none"
        style={{
          fontSize: 'clamp(120px, 25vw, 250px)',
          color: '#C5A05910',
          lineHeight: 1,
        }}
      >
        φ
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 sm:py-14 relative z-10">
        <h2
          className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal leading-tight mb-2"
          style={{ color: '#2C2417' }}
        >
          Mengapa 72? Mengapa 9 Domain?
        </h2>

        <GoldDivider className="my-4" />

        <p
          className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed mb-4"
          style={{ color: '#3E2723' }}
        >
          Angka 72 bukan kebetulan. Ia adalah kelipatan dari Golden Ratio Fibonacci — 8 &times; 9 = 72. Delapan representasi arah mata angin dalam Nusantara, sembilan simbol kekuatan sembilan naga langit dalam filosofi Jawa kuno.
        </p>

        <p
          className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed"
          style={{ color: '#3E2723' }}
        >
          Arsitektur PGA-72 dibangun dengan prinsip bahwa setiap domain saling bergantung — tidak ada satu pilar pun yang berdiri sendiri. Ketika satu pilar goyah, seluruh ekosistem merasakan getarannya. Inilah desain peradaban: terhubung, tangguh, dan abadi.
        </p>
      </div>
    </div>
  )
}

function CovenantPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center px-8 sm:px-12 py-10 sm:py-14 overflow-y-auto">
      <div className="flex flex-col items-center max-w-md text-center">
        <h2
          className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal"
          style={{ color: '#2C2417' }}
        >
          Covenant of Civilization
        </h2>

        <p
          className="font-[family-name:var(--font-heading)] text-sm italic mt-1 mb-6"
          style={{ color: '#C5A059' }}
        >
          Perjanjian Suci
        </p>

        <GoldDivider />

        <blockquote
          className="font-[family-name:var(--font-heading)] text-sm sm:text-base leading-relaxed italic mt-6 mb-8"
          style={{ color: '#3E2723' }}
        >
          &ldquo;Kami berjanji — di hadapan sejarah, di hadapan 275 juta rakyat Indonesia, dan di hadapan generasi yang belum lahir — bahwa kedaulatan ekonomi rakyat bukanlah impian. Ia adalah tujuan yang kami pertaruhkan dengan segala daya dan upaya.&rdquo;
        </blockquote>

        <GoldDivider />

        <p
          className="font-[family-name:var(--font-body)] text-xs tracking-wider uppercase mt-6"
          style={{ color: '#A09385' }}
        >
          Grand Architect&apos;s Office &middot; KNBMP
        </p>
      </div>
    </div>
  )
}

function BackCoverPage() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* MERDEKA watermark */}
      <div
        className="absolute font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
        style={{
          fontSize: 'clamp(60px, 15vw, 140px)',
          color: '#C5A05908',
          letterSpacing: '0.1em',
          lineHeight: 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        MERDEKA
      </div>

      <div className="flex flex-col items-center gap-6 relative z-10">
        <GoldDivider />

        <p
          className="font-[family-name:var(--font-heading)] text-lg sm:text-xl italic"
          style={{ color: '#6B5E50' }}
        >
          Grand Architect&apos;s Office
        </p>

        <p
          className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase"
          style={{ color: '#A09385' }}
        >
          Klasifikasi: Absolute Source of Truth
        </p>

        <p
          className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
          style={{ color: '#C5A059' }}
        >
          2025
        </p>

        <GoldDivider />

        {/* Small decorative element */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C5A05940' }} />
          <div className="w-3 h-px" style={{ backgroundColor: '#C5A05940' }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: '#C5A05940' }} />
          <div className="w-3 h-px" style={{ backgroundColor: '#C5A05940' }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#C5A05940' }} />
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

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

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

  // ── Navigation functions ──
  const goNext = useCallback(() => {
    if (isAnimating || currentLeaf >= totalPages - 1) return
    setIsAnimating(true)
    setCurrentLeaf((prev) => prev + 1)
    setTimeout(() => setIsAnimating(false), 850)
  }, [isAnimating, currentLeaf, totalPages])

  const goPrev = useCallback(() => {
    if (isAnimating || currentLeaf <= 0) return
    setIsAnimating(true)
    setCurrentLeaf((prev) => prev - 1)
    setTimeout(() => setIsAnimating(false), 850)
  }, [isAnimating, currentLeaf])

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
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1814' }}>
      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 gap-6">
        {/* Left nav arrow */}
        <button
          onClick={goPrev}
          disabled={currentLeaf <= 0}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{
            backgroundColor: '#2A2520',
            color: '#C5A059',
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
                  transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
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
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{
            backgroundColor: '#2A2520',
            color: '#C5A059',
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
                  transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
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
          style={{ backgroundColor: '#1A1814' }}
        >
          <button
            onClick={goPrev}
            disabled={currentLeaf <= 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{
              backgroundColor: '#2A2520',
              color: '#C5A059',
              border: '1px solid #3A3530',
            }}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p
              className="font-[family-name:var(--font-body)] text-xs tracking-wider"
              style={{ color: '#A09385' }}
            >
              Halaman {displayPage} / {totalPages}
            </p>
          </div>

          <button
            onClick={goNext}
            disabled={currentLeaf >= totalPages - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{
              backgroundColor: '#2A2520',
              color: '#C5A059',
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
            backgroundColor: '#C5A059',
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── Desktop page indicator ── */}
      <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <p
          className="font-[family-name:var(--font-body)] text-xs tracking-wider px-4 py-1.5 rounded-full"
          style={{
            color: '#A09385',
            backgroundColor: '#1A1814CC',
          }}
        >
          Halaman {displayPage} / {totalPages}
        </p>
      </div>

      {/* ── Keyboard hint (fades after 5s) ── */}
      <div
        className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: showHint ? 1 : 0 }}
      >
        <p
          className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-wider"
          style={{ color: '#6B5E50' }}
        >
          ← → atau klik untuk berpindah halaman
        </p>
      </div>
    </main>
  )
}
