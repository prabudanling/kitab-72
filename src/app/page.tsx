'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useMotionValue, animate } from 'framer-motion'
import {
  Search, X, ChevronRight, ChevronDown, BookOpen, ArrowUp,
  Shield, Target, Users, Zap, Globe, TrendingUp, Database, Award
} from 'lucide-react'
import {
  domains, allPillars, getPillarByNumber, getDomainForPillar,
  type Pillar, type Domain
} from '@/lib/pillar-data'

// ═══════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════
function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)

  useEffect(() => {
    if (!inView) return
    const unsubscribe = mv.on('change', v => setCount(Math.round(v)))
    animate(mv, target, { duration, ease: 'easeOut' })
    return () => unsubscribe()
  }, [inView, target, duration, mv])

  return <span ref={ref}>{count.toLocaleString('id-ID')}</span>
}

// ═══════════════════════════════════════════════════════════════
// ELEGANT DIVIDER
// ═══════════════════════════════════════════════════════════════
function ElegantDivider({ color = '#C5A059' }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${color}30` }} />
      <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${color}50` }} />
      <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${color}30` }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════════
function SectionHeader({
  label, title, subtitle
}: {
  label: string
  title: string
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <span
        className="inline-block text-xs font-sans tracking-[3px] uppercase mb-3"
        style={{ color: '#C5A059' }}
      >
        {label}
      </span>
      <h2
        className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-normal"
        style={{ color: '#3E2723' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="font-[family-name:var(--font-body)] text-base mt-3 max-w-2xl mx-auto" style={{ color: '#6B5E50' }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PILLAR DETAIL PANEL (Slide-in from right)
// ═══════════════════════════════════════════════════════════════
function PillarDetailPanel({
  pillar, onClose, onNavigate
}: {
  pillar: Pillar
  onClose: () => void
  onNavigate: (id: number) => void
}) {
  const domain = getDomainForPillar(pillar.id)!
  const badgeConfig: Record<string, { label: string; bg: string; text: string }> = {
    foundation: { label: 'Fondasi', bg: '#FFF8EB', text: '#92400E' },
    strategic: { label: 'Strategis', bg: '#EFF6FF', text: '#1E40AF' },
    operational: { label: 'Operasional', bg: '#ECFDF5', text: '#065F46' },
  }
  const badge = badgeConfig[pillar.badge]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="absolute top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 p-6 pb-5 border-b" style={{ borderColor: '#E0D8CC' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup panel"
          >
            <X className="w-5 h-5" style={{ color: '#6B5E50' }} />
          </button>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="text-xs font-sans tracking-[2px] uppercase"
              style={{ color: domain.color }}
            >
              {domain.code} &middot; {domain.emoji}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold tracking-wide"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          </div>

          <h2
            className="font-[family-name:var(--font-heading)] text-2xl font-normal leading-tight pr-10"
            style={{ color: '#3E2723' }}
          >
            {pillar.name}
          </h2>
          <p
            className="font-[family-name:var(--font-heading)] text-sm italic mt-1"
            style={{ color: '#6B5E50' }}
          >
            {pillar.eng}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Vision Quote */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-lg border-l-4"
            style={{
              backgroundColor: `${domain.color}08`,
              borderColor: domain.color,
            }}
          >
            <p
              className="font-[family-name:var(--font-heading)] text-sm leading-relaxed italic"
              style={{ color: '#3E2723' }}
            >
              {pillar.vision}
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h4
              className="text-xs font-sans tracking-[2px] uppercase mb-2"
              style={{ color: '#6B5E50' }}
            >
              Deskripsi
            </h4>
            <p className="font-[family-name:var(--font-body)] text-base leading-relaxed" style={{ color: '#2C2C2C' }}>
              {pillar.desc}
            </p>
          </motion.div>

          {/* Dimensions Table */}
          {pillar.dimensions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4
                className="text-xs font-sans tracking-[2px] uppercase mb-3"
                style={{ color: '#6B5E50' }}
              >
                Dimensi
              </h4>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E0D8CC' }}>
                {pillar.dimensions.map((dim, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-4 py-3"
                    style={{
                      backgroundColor: i % 2 === 0 ? '#FAF9F6' : '#FFFFFF',
                      borderBottom: i < pillar.dimensions.length - 1 ? '1px solid #E0D8CC' : 'none',
                    }}
                  >
                    <span className="font-[family-name:var(--font-body)] text-sm font-semibold min-w-[120px]" style={{ color: '#3E2723' }}>
                      {dim.label}
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-sm" style={{ color: '#2C2C2C' }}>
                      {dim.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Principles */}
          {pillar.principles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h4
                className="text-xs font-sans tracking-[2px] uppercase mb-3"
                style={{ color: '#6B5E50' }}
              >
                Prinsip Utama
              </h4>
              <ul className="space-y-3">
                {pillar.principles.map((principle, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: '#C5A059' }}
                    />
                    <span className="font-[family-name:var(--font-body)] text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                      {principle}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Cross References */}
          {pillar.xref.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4
                className="text-xs font-sans tracking-[2px] uppercase mb-3"
                style={{ color: '#6B5E50' }}
              >
                Referensi Silang
              </h4>
              <div className="flex flex-wrap gap-2">
                {pillar.xref.map(refId => {
                  const refPillar = getPillarByNumber(refId)
                  if (!refPillar) return null
                  const refDomain = getDomainForPillar(refId)!
                  return (
                    <button
                      key={refId}
                      onClick={() => onNavigate(refId)}
                      className="px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-200 hover:scale-105 cursor-pointer border"
                      style={{
                        backgroundColor: `${refDomain.color}10`,
                        color: refDomain.color,
                        borderColor: `${refDomain.color}30`,
                      }}
                    >
                      {refPillar.code}: {refPillar.name}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t" style={{ borderColor: '#E0D8CC', backgroundColor: '#FAF9F6' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domain.color }} />
              <span className="text-xs font-sans" style={{ color: '#6B5E50' }}>
                {domain.code} &middot; {domain.name}
              </span>
            </div>
            <span className="text-[10px] font-sans tracking-wider" style={{ color: '#A09385' }}>
              Grand Architect&apos;s Office
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN ICON MAP
// ═══════════════════════════════════════════════════════════════
const domainIconMap = [Shield, Target, BookOpen, Zap, TrendingUp, Database, Users, Award, Globe]

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null)
  const [activeDomain, setActiveDomain] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Refs for scroll targets
  const daftarIsiRef = useRef<HTMLDivElement>(null)
  const matrixRef = useRef<HTMLDivElement>(null)

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filtered pillars for matrix
  const filteredPillars = useMemo(() => {
    let result = allPillars
    if (activeDomain !== null) {
      result = result.filter(p => p.domain === activeDomain)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.eng.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      )
    }
    return result
  }, [activeDomain, searchQuery])

  const handlePillarClick = useCallback((pillar: Pillar) => {
    setSelectedPillar(pillar)
  }, [])

  const handleNavigate = useCallback((id: number) => {
    const pillar = getPillarByNumber(id)
    if (pillar) setSelectedPillar(pillar)
  }, [])

  const scrollToDaftarIsi = () => {
    daftarIsiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToMatrix = () => {
    matrixRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF9F6' }}>

      {/* ═══════════════════════════════════════════════════════
          1. HEADER / NAVIGATION BAR
          ═══════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 bg-white border-b"
        style={{ borderColor: '#E0D8CC' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center font-[family-name:var(--font-heading)] text-sm font-semibold text-white"
              style={{ backgroundColor: '#C5A059' }}
            >
              K
            </div>
            <span
              className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-wide"
              style={{ color: '#3E2723' }}
            >
              KNBMP &middot; PGA-72
            </span>
          </a>
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={scrollToDaftarIsi}
              className="text-sm font-sans cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: '#6B5E50' }}
            >
              Daftar Isi
            </button>
            <button
              onClick={scrollToMatrix}
              className="text-sm font-sans cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: '#6B5E50' }}
            >
              Matriks Pilar
            </button>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          2. HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section
        className="relative py-16 sm:py-24 lg:py-32"
        style={{ backgroundColor: '#FAF9F6' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Classification badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
            style={{ borderColor: '#C5A05940', backgroundColor: '#C5A05908' }}
          >
            <span className="text-xs font-sans tracking-[3px] uppercase" style={{ color: '#C5A059' }}>
              Dokumen Super-Master &nbsp;|&nbsp; Klasifikasi: Absolut &nbsp;|&nbsp; Horizon: 100 Tahun
            </span>
          </motion.div>

          {/* KNBMP Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-none"
              style={{ color: '#3E2723' }}
            >
              KNBMP
            </h1>
          </motion.div>

          <ElegantDivider />

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl lg:text-3xl font-normal leading-snug max-w-3xl mx-auto"
            style={{ color: '#3E2723' }}
          >
            Anatomi Peradaban:{' '}
            <em className="italic" style={{ color: '#C5A059' }}>
              72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat
            </em>
          </motion.h2>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="font-[family-name:var(--font-heading)] text-base sm:text-lg italic mt-6 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#6B5E50' }}
          >
            &ldquo;Dari desa-desa yang terlupakan, kami membangun kembali peradaban
            yang menghormati martabat setiap manusia Indonesia.&rdquo;
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="mt-10"
          >
            <button
              onClick={scrollToDaftarIsi}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg text-base font-sans font-semibold tracking-wide transition-all duration-200 hover:opacity-90 cursor-pointer min-h-[48px]"
              style={{
                backgroundColor: '#C5A059',
                color: '#FFFFFF',
              }}
            >
              Jelajahi Daftar Isi
              <ChevronDown className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="mt-16 sm:mt-20 border-t border-b"
          style={{ borderColor: '#E0D8CC', backgroundColor: '#FFFFFF' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div
                className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
                style={{ color: '#C5A059' }}
              >
                <AnimatedCounter target={72} />
              </div>
              <div
                className="text-xs font-sans tracking-[2px] uppercase mt-1"
                style={{ color: '#6B5E50' }}
              >
                Pilar
              </div>
            </div>
            <div>
              <div
                className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
                style={{ color: '#C5A059' }}
              >
                <AnimatedCounter target={9} />
              </div>
              <div
                className="text-xs font-sans tracking-[2px] uppercase mt-1"
                style={{ color: '#6B5E50' }}
              >
                Domain
              </div>
            </div>
            <div>
              <div
                className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
                style={{ color: '#C5A059' }}
              >
                <AnimatedCounter target={100} />
              </div>
              <div
                className="text-xs font-sans tracking-[2px] uppercase mt-1"
                style={{ color: '#6B5E50' }}
              >
                Tahun
              </div>
            </div>
            <div>
              <div
                className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
                style={{ color: '#C5A059' }}
              >
                <AnimatedCounter target={83763} duration={3} />
              </div>
              <div
                className="text-xs font-sans tracking-[2px] uppercase mt-1"
                style={{ color: '#6B5E50' }}
              >
                Desa
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════
            3. DAFTAR ISI (TABLE OF CONTENTS) — CRITICAL SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          ref={daftarIsiRef}
          className="py-16 sm:py-20 lg:py-24"
          style={{ backgroundColor: '#F5F1EB' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Daftar Isi Lengkap"
              title="Arsitektur 72 Pilar Fondasional"
              subtitle="Buku ini bukan sekadar manual korporasi. Ini adalah 72 anak tangga menuju kemerdekaan ekonomi. Setiap domain mewakili satu fungsi vital dari ekosistem kita."
            />

            <div className="space-y-10 sm:space-y-14">
              {domains.map((domain, dIdx) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: dIdx * 0.04 }}
                  className="bg-white rounded-lg border shadow-sm overflow-hidden"
                  style={{ borderColor: '#E0D8CC' }}
                >
                  {/* Domain Header */}
                  <div
                    className="p-5 sm:p-6 border-l-4"
                    style={{ borderColor: domain.color, backgroundColor: `${domain.color}06` }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl mt-0.5">{domain.emoji}</span>
                      <div>
                        <h3
                          className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-semibold leading-tight"
                          style={{ color: '#3E2723' }}
                        >
                          DOMAIN {domain.id}: {domain.name}
                        </h3>
                        <p
                          className="font-[family-name:var(--font-heading)] text-sm italic mt-0.5"
                          style={{ color: domain.color }}
                        >
                          ({domain.nameId} &mdash; {domain.nameSubtitle})
                        </p>
                      </div>
                    </div>
                    <p
                      className="font-[family-name:var(--font-body)] text-sm leading-relaxed"
                      style={{ color: '#6B5E50' }}
                    >
                      {domain.description}
                    </p>
                    <p
                      className="text-xs font-sans tracking-wider uppercase mt-2"
                      style={{ color: '#A09385' }}
                    >
                      {domain.range}
                    </p>
                  </div>

                  {/* Pillars List */}
                  <div className="divide-y" style={{ borderColor: '#E0D8CC' }}>
                    {domain.pillars.map((pillar, pIdx) => (
                      <button
                        key={pillar.id}
                        onClick={() => handlePillarClick(pillar)}
                        className="w-full text-left px-5 sm:px-6 py-4 flex items-start gap-3 sm:gap-4 transition-colors duration-150 cursor-pointer group hover:bg-[#FAF9F6]"
                        style={{
                          borderBottom: pIdx < domain.pillars.length - 1 ? '1px solid #E0D8CC' : 'none',
                        }}
                      >
                        {/* Pillar Number */}
                        <span
                          className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-sans font-bold text-white mt-0.5"
                          style={{ backgroundColor: domain.color }}
                        >
                          {pillar.id}
                        </span>

                        {/* Pillar Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-sans font-semibold tracking-wide"
                              style={{ color: domain.color }}
                            >
                              {pillar.code}
                            </span>
                            <span className="hidden sm:inline text-gray-300">&middot;</span>
                            <span
                              className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold leading-tight"
                              style={{ color: '#3E2723' }}
                            >
                              {pillar.name}
                            </span>
                            <span
                              className="hidden sm:inline font-[family-name:var(--font-heading)] text-sm italic"
                              style={{ color: '#6B5E50' }}
                            >
                              ({pillar.eng})
                            </span>
                          </div>
                          <p
                            className="font-[family-name:var(--font-body)] text-sm leading-relaxed mt-1"
                            style={{ color: '#6B5E50' }}
                          >
                            {pillar.desc}
                          </p>
                          {/* Mobile: show English name on second line */}
                          <span
                            className="sm:hidden font-[family-name:var(--font-heading)] text-xs italic mt-0.5 inline-block"
                            style={{ color: '#A09385' }}
                          >
                            ({pillar.eng})
                          </span>
                        </div>

                        {/* Chevron */}
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0 mt-1.5 opacity-30 group-hover:opacity-70 transition-opacity"
                          style={{ color: domain.color }}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. INTERACTIVE PILLAR MATRIX
            ═══════════════════════════════════════════════════════ */}
        <section
          ref={matrixRef}
          className="py-16 sm:py-20 lg:py-24"
          style={{ backgroundColor: '#FAF9F6' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Matriks Interaktif"
              title="Pilih Pilar"
              subtitle="Klik angka untuk menjelajahi detail setiap pilar fondasional"
            />

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A09385' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pilar... (PGA-01, Bintang Utara, dll)"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border text-base font-[family-name:var(--font-body)] placeholder:font-[family-name:var(--font-body)] focus:outline-none transition-colors"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0D8CC',
                    color: '#2C2C2C',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" style={{ color: '#A09385' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Domain Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveDomain(null)}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer border min-h-[44px]"
                style={
                  activeDomain === null
                    ? { backgroundColor: '#C5A059', color: '#FFFFFF', borderColor: '#C5A059' }
                    : { backgroundColor: '#FFFFFF', color: '#6B5E50', borderColor: '#E0D8CC' }
                }
              >
                Semua
              </button>
              {domains.map(domain => {
                const Icon = domainIconMap[domain.id - 1] || Shield
                return (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 cursor-pointer border min-h-[44px]"
                    style={
                      activeDomain === domain.id
                        ? {
                            backgroundColor: domain.color,
                            color: '#FFFFFF',
                            borderColor: domain.color,
                          }
                        : {
                            backgroundColor: '#FFFFFF',
                            color: '#6B5E50',
                            borderColor: '#E0D8CC',
                          }
                    }
                  >
                    <span className="text-base">{domain.emoji}</span>
                    <span className="hidden sm:inline">{domain.code}</span>
                  </button>
                )
              })}
            </div>

            {/* Filtered count */}
            {filteredPillars.length !== 72 && (
              <p className="text-sm font-sans text-center mb-6" style={{ color: '#6B5E50' }}>
                Menampilkan {filteredPillars.length} dari 72 pilar
              </p>
            )}

            {/* Number Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 lg:grid-cols-12 gap-2 sm:gap-3 max-w-4xl mx-auto">
              {filteredPillars.map((pillar, index) => {
                const domain = getDomainForPillar(pillar.id)!
                const isActive = selectedPillar?.id === pillar.id
                return (
                  <motion.button
                    key={pillar.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.015, 0.5), duration: 0.3 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePillarClick(pillar)}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer border-2 transition-all duration-200"
                    style={{
                      borderColor: isActive ? domain.color : `${domain.color}30`,
                      backgroundColor: isActive ? `${domain.color}15` : '#FFFFFF',
                    }}
                  >
                    <span
                      className="text-xl sm:text-2xl font-[family-name:var(--font-heading)] font-semibold"
                      style={{ color: domain.color }}
                    >
                      {pillar.id}
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: domain.color }}
                    />
                  </motion.button>
                )
              })}
            </div>

            {/* Empty state */}
            {filteredPillars.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 mx-auto mb-4" style={{ color: '#E0D8CC' }} />
                <p className="text-base font-sans" style={{ color: '#6B5E50' }}>
                  Tidak ada pilar yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveDomain(null) }}
                  className="mt-4 px-5 py-2.5 rounded-lg text-sm font-sans font-medium cursor-pointer border transition-colors hover:opacity-80 min-h-[44px]"
                  style={{ borderColor: '#C5A059', color: '#C5A059' }}
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. DOMAIN OVERVIEW CARDS
            ═══════════════════════════════════════════════════════ */}
        <section
          className="py-16 sm:py-20 lg:py-24"
          style={{ backgroundColor: '#F5F1EB' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="9 Domain Kebangkitan"
              title="Arsitektur Peradaban"
              subtitle="Setiap domain memiliki 8 pilar yang saling menguatkan, menciptakan fondasi yang kokoh untuk 100 tahun ke depan."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {domains.map((domain, i) => {
                const Icon = domainIconMap[domain.id - 1] || Shield
                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <button
                      onClick={() => { setActiveDomain(domain.id); scrollToMatrix() }}
                      className="w-full text-left p-5 sm:p-6 bg-white rounded-lg border border-[#E0D8CC] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${domain.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: domain.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{domain.emoji}</span>
                            <span
                              className="text-[10px] font-sans tracking-[2px] uppercase"
                              style={{ color: domain.color }}
                            >
                              {domain.code}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h3
                        className="font-[family-name:var(--font-heading)] text-base font-semibold leading-tight mb-1"
                        style={{ color: '#3E2723' }}
                      >
                        {domain.nameId}
                      </h3>
                      <p
                        className="font-[family-name:var(--font-heading)] text-xs italic mb-2"
                        style={{ color: domain.color }}
                      >
                        {domain.nameSubtitle}
                      </p>
                      <p
                        className="font-[family-name:var(--font-body)] text-sm leading-relaxed line-clamp-2"
                        style={{ color: '#6B5E50' }}
                      >
                        {domain.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-4">
                        <span
                          className="text-lg font-[family-name:var(--font-heading)] font-semibold"
                          style={{ color: domain.color }}
                        >
                          {domain.pillars.length}
                        </span>
                        <span
                          className="text-xs font-sans"
                          style={{ color: '#A09385' }}
                        >
                          Pilar &middot; {domain.range}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            6. PHILOSOPHY SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="py-16 sm:py-20 lg:py-24"
          style={{ backgroundColor: '#FAF9F6' }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative p-8 sm:p-10 lg:p-12 rounded-lg border-l-4 bg-white border border-[#E0D8CC] shadow-sm overflow-hidden"
              style={{ borderLeftColor: '#C5A059' }}
            >
              {/* Background watermark */}
              <span
                className="absolute -right-6 -top-6 font-[family-name:var(--font-heading)] text-[160px] font-light select-none pointer-events-none"
                style={{ color: '#C5A059', opacity: 0.04 }}
              >
                &phi;
              </span>

              <h2
                className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-normal leading-relaxed mb-6"
                style={{ color: '#3E2723' }}
              >
                Mengapa 72? Mengapa 9 Domain?
              </h2>

              <div className="space-y-4">
                <p
                  className="font-[family-name:var(--font-body)] text-base leading-relaxed"
                  style={{ color: '#2C2C2C' }}
                >
                  Angka 72 dalam PGA-72 bukan kebetulan &mdash; ia mencerminkan
                  kesempurnaan arsitektur peradaban. 9 domain &times; 8 pilar = 72
                  fondasi yang saling menguatkan, menciptakan resiliensi yang tak bisa
                  dihancurkan oleh serangan satu titik kelemahan.
                </p>
                <p
                  className="font-[family-name:var(--font-body)] text-base leading-relaxed"
                  style={{ color: '#2C2C2C' }}
                >
                  Setiap domain memiliki 8 pilar &mdash; angka yang dalam banyak tradisi
                  melambangkan keberlanjutan, kelengkapan, dan keseimbangan.
                  Bersama-sama, 72 pilar ini membentuk ekosistem yang mampu bertahan
                  100 tahun, menghubungkan 83.763 desa, dan melayani 275 juta jiwa.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════
          7. FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer
        className="mt-auto border-t"
        style={{ borderColor: '#E0D8CC', backgroundColor: '#FFFFFF' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <ElegantDivider />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="text-xs font-sans tracking-[3px] uppercase"
              style={{ color: '#C5A059' }}
            >
              Perjanjian Suci
            </span>
            <h2
              className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-normal mt-2"
              style={{ color: '#3E2723' }}
            >
              Covenant of Civilization
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-8 p-6 sm:p-8 rounded-lg border bg-[#FAF9F6]"
            style={{ borderColor: '#E0D8CC' }}
          >
            <p
              className="font-[family-name:var(--font-heading)] text-base sm:text-lg italic leading-relaxed"
              style={{ color: '#3E2723' }}
            >
              &ldquo;Kami berjanji &mdash; di hadapan sejarah, di hadapan 275 juta rakyat
              Indonesia, dan di hadapan generasi yang belum lahir &mdash; bahwa 72 pilar
              ini akan kami jaga, kami perjuangkan, dan kami wariskan. Bukan demi
              kekuasaan, bukan demi kekayaan, melainkan demi martabat setiap manusia
              Indonesia yang berhak atas kedaulatan ekonomi.&rdquo;
            </p>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 pt-8 border-t"
            style={{ borderColor: '#E0D8CC' }}
          >
            <span
              className="text-[10px] font-sans tracking-[3px] uppercase"
              style={{ color: '#C5A059' }}
            >
              Grand Architect&apos;s Office
            </span>
            <p
              className="font-[family-name:var(--font-heading)] text-xl mt-2"
              style={{ color: '#3E2723' }}
            >
              KNBMP
            </p>
            <p
              className="font-[family-name:var(--font-body)] text-xs mt-2"
              style={{ color: '#A09385' }}
            >
              Klasifikasi: Absolute Source of Truth &nbsp;&bull;&nbsp; Horizon: 100 Tahun &nbsp;&bull;&nbsp; Tahun Fondasi: 2025
            </p>
          </motion.div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          PILLAR DETAIL PANEL (AnimatePresence)
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPillar && (
          <PillarDetailPanel
            pillar={selectedPillar}
            onClose={() => setSelectedPillar(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          SCROLL TO TOP BUTTON
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white border shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            style={{ borderColor: '#E0D8CC' }}
            aria-label="Kembali ke atas"
          >
            <ArrowUp className="w-5 h-5" style={{ color: '#C5A059' }} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
