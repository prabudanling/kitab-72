'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { Search, X, ChevronRight, Eye, BookOpen, Shield, Target, Users, TrendingUp, Database, Award, ChevronDown, ArrowUp, Sparkles, Zap, Globe, Star } from 'lucide-react'
import { domains, allPillars, getPillarByNumber, getDomainForPillar, type Pillar, type Domain } from '@/lib/pillar-data'

// ─── Animated Counter ────────────────────────────
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

// ─── Particle Field ──────────────────────────────
function ParticleField() {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  , [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C4952A]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, 30, -20, 40],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// ─── Pillar Grid Number ──────────────────────────
function PillarCell({ pillar, index, onClick, isActive, isHighlighted }: { 
  pillar: Pillar; index: number; onClick: () => void; isActive: boolean; isHighlighted: boolean 
}) {
  const domain = getDomainForPillar(pillar.id)!
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0, rotate: -10 }}
      animate={{ 
        opacity: isHighlighted || isActive ? 1 : 0.85, 
        scale: isActive ? 1.15 : 1,
        rotate: 0,
      }}
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        delay: index * 0.025,
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
      onClick={onClick}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden
        aspect-square flex flex-col items-center justify-center gap-1
        border-2 transition-all duration-300 select-none
        ${isActive 
          ? 'shadow-2xl ring-2 ring-offset-2 ring-offset-[#060E1E] z-10' 
          : 'shadow-lg hover:shadow-xl'
        }
      `}
      style={{
        borderColor: isActive ? domain.color : `${domain.color}40`,
        backgroundColor: isActive ? `${domain.color}25` : `${domain.color}10`,
        ringColor: domain.color,
      }}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${domain.color}20 0%, transparent 70%)`,
        }}
      />
      
      {/* Number */}
      <span 
        className="relative z-10 font-mono text-2xl sm:text-3xl font-bold transition-colors duration-300"
        style={{ color: isActive ? domain.color : `${domain.color}cc` }}
      >
        {pillar.id}
      </span>
      
      {/* Domain indicator dot */}
      <div 
        className="relative z-10 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: domain.color }}
      />
      
      {/* Tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
        <div className="px-2 py-1 rounded-md text-[10px] font-sans text-white/90 shadow-xl"
          style={{ backgroundColor: `${domain.color}ee` }}>
          PGA-{String(pillar.id).padStart(2, '0')}
        </div>
      </div>
    </motion.button>
  )
}

// ─── Pillar Detail Panel ─────────────────────────
function PillarDetailPanel({ pillar, onClose, onNavigate }: { 
  pillar: Pillar; onClose: () => void; onNavigate: (id: number) => void 
}) {
  const domain = getDomainForPillar(pillar.id)!
  const badgeColors = {
    foundation: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Fondasi' },
    strategic: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Strategis' },
    operational: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Operasional' },
  }
  const badge = badgeColors[pillar.badge]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-full sm:w-[480px] bg-[#0A0F1C] border-l shadow-2xl flex flex-col"
        style={{ borderColor: `${domain.color}30` }}>
        {/* Header */}
        <div className="relative p-6 pb-4 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${domain.color}15, transparent)` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs tracking-widest text-white/50 uppercase">
              {domain.code} · {domain.emoji}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          
          <h2 className="font-serif text-2xl font-semibold text-white leading-tight">
            {pillar.name}
          </h2>
          <p className="font-serif text-sm text-white/50 italic mt-1">{pillar.eng}</p>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scrollbar">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-5 rounded-xl border-l-4"
            style={{ 
              backgroundColor: `${domain.color}08`,
              borderColor: domain.color,
            }}
          >
            <Sparkles className="absolute top-4 right-4 w-4 h-4 opacity-30" style={{ color: domain.color }} />
            <p className="font-serif text-sm leading-relaxed text-white/80 italic">
              {pillar.vision}
            </p>
          </motion.div>
          
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Deskripsi</h4>
            <p className="text-sm text-white/70 leading-relaxed">{pillar.desc}</p>
          </motion.div>
          
          {/* Dimensions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Dimensi</h4>
            <div className="space-y-2">
              {pillar.dimensions.map((dim, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="font-sans text-xs font-medium text-white/60 min-w-[100px]">{dim.label}</span>
                  <span className="font-sans text-xs text-white/90">{dim.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Prinsip Utama</h4>
            <div className="space-y-2">
              {pillar.principles.map((principle, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: domain.color }} />
                  <span className="text-xs text-white/70 leading-relaxed">{principle}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Cross References */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Referensi Silang</h4>
            <div className="flex flex-wrap gap-2">
              {pillar.xref.map(refId => {
                const refPillar = getPillarByNumber(refId)
                if (!refPillar) return null
                const refDomain = getDomainForPillar(refId)!
                return (
                  <button
                    key={refId}
                    onClick={() => onNavigate(refId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: `${refDomain.color}15`,
                      color: refDomain.color,
                      border: `1px solid ${refDomain.color}30`,
                    }}
                  >
                    PGA-{String(refId).padStart(2, '0')}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.06] bg-[#080C18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
              <span className="text-[10px] font-mono text-white/40">
                {domain.code} · {domain.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/30">
              Grand Architect&apos;s Office
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Domain Card ─────────────────────────────────
function DomainCard({ domain, onClick, pillarCount, isActive }: { 
  domain: Domain; onClick: () => void; pillarCount: number; isActive: boolean 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 sm:p-5 rounded-xl text-left transition-all duration-300 cursor-pointer
        border backdrop-blur-sm overflow-hidden group
        ${isActive 
          ? 'shadow-xl ring-1' 
          : 'shadow-md hover:shadow-lg'
        }
      `}
      style={{
        borderColor: isActive ? domain.color : `${domain.color}30`,
        backgroundColor: isActive ? `${domain.color}15` : `${domain.color}08`,
        ringColor: domain.color,
      }}
    >
      {/* Background glow */}
      <motion.div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, ${domain.color}15, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{domain.emoji}</span>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: `${domain.color}aa` }}>
            {domain.code}
          </span>
        </div>
        <h3 className="font-serif text-sm sm:text-base font-semibold text-white/90 leading-tight">
          {domain.nameId}
        </h3>
        <p className="font-sans text-[11px] text-white/40 italic mt-1">{domain.name}</p>
        <div className="flex items-center gap-1 mt-3">
          <span className="font-mono text-lg font-bold" style={{ color: domain.color }}>
            {pillarCount}
          </span>
          <span className="text-[10px] text-white/40 font-sans">Pilar</span>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Main Page ───────────────────────────────────
export default function Home() {
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null)
  const [activeDomain, setActiveDomain] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [gridVisible, setGridVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-100px' })
  const heroInView = useInView(heroRef, { once: true })

  useEffect(() => {
    setGridVisible(gridInView)
  }, [gridInView])

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filtered pillars
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

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const domainIcons = [Shield, Target, Eye, Zap, Globe, TrendingUp, Users, Award, Database]

  return (
    <div className="min-h-screen bg-[#060E1E] text-white">
      {/* Custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(196,149,42,0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(196,149,42,0.5); }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
      `}</style>

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060E1E] via-[#0B1428] to-[#060E1E]" />
          
          {/* Orbital rings */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full border border-[#C4952A]/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] rounded-full border border-[#C4952A]/[0.07]"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full border border-[#C4952A]/[0.05]"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C4952A]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C4952A]/[0.03] rounded-full blur-[100px]" />
          
          {/* Particles */}
          <ParticleField />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Classification badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C4952A]/20 bg-[#C4952A]/5 mb-8"
            >
              <Star className="w-3 h-3 text-[#C4952A]" />
              <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#C4952A]/80">
                Absolute Source of Truth
              </span>
            </motion.div>

            {/* Organization name */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-sans text-xs sm:text-sm tracking-[4px] uppercase text-[#C4952A]/60 mb-6"
            >
              Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih
            </motion.p>

            {/* Decorative divider */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={heroInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C4952A]/40" />
              <span className="text-[#C4952A]/60 text-xs">◆</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C4952A]/40" />
            </motion.div>

            {/* KNBMP Acronym */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4"
            >
              <h1 className="font-serif text-[72px] sm:text-[100px] lg:text-[140px] font-light tracking-[8px] sm:tracking-[12px] leading-none text-white/95">
                K<span className="text-[#C4952A]">N</span>BMP
              </h1>
            </motion.div>

            {/* Series */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <span className="font-mono text-[10px] sm:text-xs tracking-[3px] uppercase text-[#C4952A]/70">
                PGA-72 · Polymath Grand Architecture
              </span>
            </motion.div>

            {/* Decorative divider 2 */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={heroInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C4952A]/30" />
              <span className="text-[#C4952A]/40 text-[10px]">◆ ◆ ◆</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C4952A]/30" />
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white/80 leading-snug mb-6"
            >
              Anatomi Peradaban:
              <br />
              <em className="text-[#C4952A]/80">72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat</em>
            </motion.h2>

            {/* Tagline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="font-serif text-sm sm:text-base text-white/40 italic max-w-2xl mx-auto leading-relaxed mb-10"
            >
              &ldquo;Dari desa-desa yang terlupakan, kami membangun kembali peradaban yang menghormati martabat setiap manusia Indonesia.&rdquo;
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <button
                onClick={scrollToGrid}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #C4952A, #A87A1F)',
                  boxShadow: '0 0 40px rgba(196,149,42,0.3)',
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#C4952A] to-[#DEB96A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 font-sans text-sm font-semibold text-[#060E1E] tracking-wide">
                  JELAJAHI 72 Pilar
                </span>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="relative z-10 w-4 h-4 text-[#060E1E]" />
                </motion.div>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#C4952A]/10 bg-[#060E1E]/80 backdrop-blur-md"
        >
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            <div className="text-center">
              <div className="font-serif text-xl sm:text-2xl font-semibold text-[#C4952A]">
                <AnimatedCounter target={72} />
              </div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mt-1">Pilar</div>
            </div>
            <div className="w-px h-8 bg-[#C4952A]/15" />
            <div className="text-center">
              <div className="font-serif text-xl sm:text-2xl font-semibold text-[#C4952A]">
                <AnimatedCounter target={9} />
              </div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mt-1">Domain</div>
            </div>
            <div className="w-px h-8 bg-[#C4952A]/15" />
            <div className="text-center">
              <div className="font-serif text-xl sm:text-2xl font-semibold text-[#C4952A]">
                <AnimatedCounter target={100} />
              </div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mt-1">Tahun</div>
            </div>
            <div className="w-px h-8 bg-[#C4952A]/15" />
            <div className="text-center">
              <div className="font-serif text-xl sm:text-2xl font-semibold text-[#C4952A]">
                <AnimatedCounter target={83763} duration={3} />
              </div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-white/30 mt-1">Desa</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SEARCH & FILTER BAR
          ═══════════════════════════════════════════ */}
      <section ref={gridRef} className="relative z-10 sticky top-0 bg-[#060E1E]/90 backdrop-blur-xl border-b border-[#C4952A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pilar... (PGA-01, Bintang Utara, dll)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/90 placeholder:text-white/25 font-sans focus:outline-none focus:border-[#C4952A]/40 focus:bg-white/[0.06] transition-all duration-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            )}
          </div>

          {/* Domain filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setActiveDomain(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer border
                ${activeDomain === null 
                  ? 'bg-[#C4952A]/15 text-[#C4952A] border-[#C4952A]/30 shadow-lg shadow-[#C4952A]/10' 
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                }`}
            >
              Semua
            </button>
            {domains.map(domain => {
              const DomainIcon = domainIcons[domain.id - 1] || Shield
              return (
                <button
                  key={domain.id}
                  onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer border
                    ${activeDomain === domain.id 
                      ? 'shadow-lg' 
                      : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                    }`}
                  style={activeDomain === domain.id ? {
                    backgroundColor: `${domain.color}15`,
                    color: domain.color,
                    borderColor: `${domain.color}30`,
                    boxShadow: `0 4px 20px ${domain.color}20`,
                  } : {}}
                >
                  <span className="text-sm">{domain.emoji}</span>
                  <span className="hidden sm:inline">{domain.code}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DOMAIN CARDS
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#C4952A]/50">
              Arsitektur Peradaban
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white/90 mt-2">
              9 Domain <span className="text-[#C4952A]/70">Kebangkitan</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain, i) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <DomainCard
                  domain={domain}
                  pillarCount={domain.pillars.length}
                  isActive={activeDomain === domain.id}
                  onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          72 PILLAR MATRIX GRID
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A1225] to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#C4952A]/50">
              Master Index
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white/90 mt-2">
              Pilih <span className="text-[#C4952A]/70">Pilar</span>
            </h2>
            <p className="font-serif text-sm text-white/30 italic mt-2 max-w-md mx-auto">
              Klik angka untuk menjelajahi detail setiap pilar fondasional
            </p>
            {filteredPillars.length !== 72 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-xs text-[#C4952A]/60 mt-3"
              >
                Menampilkan {filteredPillars.length} dari 72 pilar
              </motion.p>
            )}
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 lg:grid-cols-12 gap-2 sm:gap-3 max-w-5xl mx-auto">
            {filteredPillars.map((pillar, index) => (
              <PillarCell
                key={pillar.id}
                pillar={pillar}
                index={index}
                onClick={() => handlePillarClick(pillar)}
                isActive={selectedPillar?.id === pillar.id}
                isHighlighted={searchQuery.trim() !== '' || activeDomain !== null}
              />
            ))}
          </div>

          {filteredPillars.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="font-sans text-sm text-white/30">
                Tidak ada pilar yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveDomain(null); }}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-mono text-[#C4952A]/70 border border-[#C4952A]/20 hover:bg-[#C4952A]/10 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PHI RATIO & PHILOSOPHY
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-2xl border-l-4 border-[#C4952A] bg-[#C4952A]/[0.04] overflow-hidden"
          >
            {/* Background watermark */}
            <span className="absolute -right-8 -top-8 font-serif text-[200px] font-light text-[#C4952A]/[0.03] select-none pointer-events-none">
              φ
            </span>
            
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#C4952A]/50">
              Golden Ratio Architecture
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white/90 mt-3 leading-relaxed">
              Mengapa 72? Mengapa 9 Domain?
            </h2>
            <div className="mt-6 space-y-4 text-sm text-white/60 leading-relaxed font-sans">
              <p>
                Angka 72 dalam PGA-72 bukan kebetulan — ia mencerminkan kesempurnaan arsitektur peradaban. 
                9 domain × 8 pilar = 72 fondasi yang saling menguatkan, menciptakan resiliensi yang tak bisa dihancurkan 
                oleh serangan satu titik kelemahan.
              </p>
              <p>
                Setiap domain memiliki 8 pilar — angka yang dalam banyak tradisi melambangkan keberlanjutan, kelengkapan, 
                dan keseimbangan. Bersama-sama, 72 pilar ini membentuk ekosistem yang mampu bertahan 100 tahun, 
                menghubungkan 83.763 desa, dan melayani 275 juta jiwa.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COVENANT / FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-[#C4952A]/10 bg-[#040A14]">
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
          {/* Ornament */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C4952A]/30" />
            <span className="text-[#C4952A]/40 text-xs">◆ ◆ ◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C4952A]/30" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] tracking-[3px] uppercase text-[#C4952A]/50">
              Perjanjian Suci
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white/80 mt-2">
              Covenant of Civilization
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 sm:p-8 rounded-xl border border-[#C4952A]/15 bg-[#C4952A]/[0.03]"
          >
            <p className="font-serif text-sm sm:text-base text-white/60 italic leading-relaxed">
              &ldquo;Kami berjanji — di hadapan sejarah, di hadapan 275 juta rakyat Indonesia, 
              dan di hadapan generasi yang belum lahir — bahwa 72 pilar ini akan kami jaga, 
              kami perjuangkan, dan kami wariskan. Bukan demi kekuasaan, bukan demi kekayaan, 
              melainkan demi martabat setiap manusia Indonesia yang berhak atas kedaulatan ekonomi.&rdquo;
            </p>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 pt-8 border-t border-[#C4952A]/10"
          >
            <span className="font-mono text-[9px] tracking-[3px] uppercase text-[#C4952A]/40">
              Grand Architect&apos;s Office
            </span>
            <p className="font-serif text-lg text-white/50 mt-2">KNBMP</p>
            <p className="font-sans text-[10px] text-white/20 mt-1">
              Klasifikasi: Absolute Source of Truth &nbsp;◆&nbsp; Horizon: 100 Tahun &nbsp;◆&nbsp; Tahun Fondasi: 2025
            </p>
          </motion.div>

          {/* Merdeka watermark */}
          <div className="mt-12 font-serif text-6xl sm:text-8xl font-light text-[#C4952A]/[0.04] tracking-[20px] select-none">
            MERDEKA
          </div>
        </div>
      </footer>

      {/* ─── Pillar Detail Panel ──────────────────── */}
      <AnimatePresence>
        {selectedPillar && (
          <PillarDetailPanel
            pillar={selectedPillar}
            onClose={() => setSelectedPillar(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      {/* ─── Scroll to Top ──────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0A1225] border border-[#C4952A]/20 shadow-xl hover:border-[#C4952A]/40 transition-all duration-300 cursor-pointer group"
          >
            <ArrowUp className="w-4 h-4 text-[#C4952A]/60 group-hover:text-[#C4952A] transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
