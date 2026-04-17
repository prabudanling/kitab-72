'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { domains, type Domain, type Pillar } from '@/lib/pillar-data'

// ═══════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════
const BURGUNDY = '#5E2129'
const GOLD = '#C5A059'
const CHARCOAL = '#2C2417'
const PARCHMENT = '#FAF9F6'
const DARK_BG = '#1A1814'

// ═══════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════
const fadeSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
}

const letterReveal = {
  hidden: { opacity: 0, y: 30, rotateX: -90 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type BookPage =
  | { type: 'cover' }
  | { type: 'kata-pengantar'; part: number }
  | { type: 'mukadimah'; part: number }
  | { type: 'toc-page'; tocPage: number }
  | { type: 'pillar-detail'; pillar: Pillar; domain: Domain }
  | { type: 'philosophy' }
  | { type: 'covenant' }
  | { type: 'back-cover' }

// ═══════════════════════════════════════════════════════════════
// PAGE FLIP SOUND
// ═══════════════════════════════════════════════════════════════
function usePageFlipSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  return useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const duration = 0.18
      const bufferSize = Math.floor(ctx.sampleRate * duration)
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch)
        for (let i = 0; i < bufferSize; i++) {
          const t = i / bufferSize
          const env = Math.exp(-t * (14 + ch * 4)) * Math.min(t * (80 + ch * 20), 1)
          data[i] = (Math.random() * 2 - 1) * env * (ch === 0 ? 0.10 : 0.07)
        }
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const flt = ctx.createBiquadFilter()
      flt.type = 'bandpass'
      flt.frequency.value = 2500 + Math.random() * 1500
      flt.Q.value = 0.6
      src.connect(flt)
      flt.connect(ctx.destination)
      src.start(ctx.currentTime)
    } catch { /* silent */ }
  }, [])
}

// ═══════════════════════════════════════════════════════════════
// Z-INDEX
// ═══════════════════════════════════════════════════════════════
const getZIndex = (index: number, currentLeaf: number, total: number) => {
  if (index < currentLeaf) return index + 1
  if (index === currentLeaf) return total + 1
  return total - (index - currentLeaf)
}

// ═══════════════════════════════════════════════════════════════
// GOLDEN PARTICLES (Canvas-based for performance)
// ═══════════════════════════════════════════════════════════════
function GoldenParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      ctx.scale(2, 2)
    }
    resize()

    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number; fadeDir: number }[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.1,
        fadeDir: Math.random() > 0.5 ? 0.003 : -0.003,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        p.opacity += p.fadeDir
        if (p.opacity >= 0.7) p.fadeDir = -0.003
        if (p.opacity <= 0.05) { p.fadeDir = 0.003; p.y = canvas.offsetHeight + 5; p.x = Math.random() * canvas.offsetWidth }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`
        ctx.fill()

        // Soft glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity * 0.15})`
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
}

// ═══════════════════════════════════════════════════════════════
// BATIK WATERMARK
// ═══════════════════════════════════════════════════════════════
function BatikWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" style={{ opacity: 0.035 }}>
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
      <motion.div className="h-px flex-1 max-w-[120px]"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ backgroundColor: `${color}40`, transformOrigin: 'center' }} />
      <motion.div className="w-2 h-2 rotate-45 flex-shrink-0"
        initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 45 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ backgroundColor: `${color}60` }} />
      <motion.div className="h-px flex-1 max-w-[120px]"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        style={{ backgroundColor: `${color}40`, transformOrigin: 'center' }} />
    </div>
  )
}

function CornerOrnament({ color = GOLD, size = 40 }: { color?: string; size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="opacity-40"
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.4, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}>
      <path d="M2 38V12C2 6.48 6.48 2 12 2H38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 28V16C2 8.26 8.26 2 16 2H28" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </motion.svg>
  )
}

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
// ANIMATED HELPER: Letter-by-letter text
// ═══════════════════════════════════════════════════════════════
function AnimatedLetters({ text, className, delay = 0, color }: { text: string; className: string; delay?: number; color?: string }) {
  return (
    <span className={className} style={{ color }} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span key={i} className="inline-block"
          custom={i + delay}
          variants={letterReveal}
          initial="hidden" animate="visible"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}>
          {char}
        </motion.span>
      ))}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + Math.random() * 15 + 5
      })
    }, 100)
    const timer = setTimeout(onComplete, 1500)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [onComplete])

  return (
    <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: DARK_BG }}
      exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
      <motion.div className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}>
        <span className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl" style={{ color: GOLD }}>
          KNBMP
        </span>
      </motion.div>
      <motion.div className="w-48 h-[2px] rounded-full overflow-hidden"
        style={{ backgroundColor: '#2A2520' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <motion.div className="h-full rounded-full"
          style={{ backgroundColor: GOLD }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }} />
      </motion.div>
      <motion.p className="font-[family-name:var(--font-body)] text-[10px] tracking-[3px] uppercase mt-4"
        style={{ color: '#6B5E50' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        Memuat Dokumen Peradaban
      </motion.p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════════════════════════════════

function CoverPage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden paper-grain"
      style={{ backgroundColor: PARCHMENT }}>
      {/* AI-generated background image */}
      <motion.div className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}>
        <img src="/cover-bg.png" alt="" className="w-full h-full object-cover"
          style={{ opacity: 0.12, mixBlendMode: 'multiply' }} />
      </motion.div>

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(180deg, rgba(250,249,246,0.4) 0%, rgba(250,249,246,0.85) 40%, rgba(250,249,246,0.95) 100%)' }} />

      {/* Golden particles */}
      <GoldenParticles />

      {/* Batik watermark */}
      <BatikWatermark />

      {/* Animated double gold border */}
      <motion.div className="absolute pointer-events-none z-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
        style={{ inset: '16px', border: '2px solid rgba(197,160,89,0.19)', borderRadius: 4 }} />
      <motion.div className="absolute pointer-events-none z-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 1 }}
        style={{ inset: '24px', border: '1px solid rgba(197,160,89,0.12)', borderRadius: 2 }} />

      {/* Corner ornaments */}
      <div className="absolute top-6 left-6 z-10"><CornerOrnament /></div>
      <div className="absolute top-6 right-6 z-10" style={{ transform: 'scaleX(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 left-6 z-10" style={{ transform: 'scaleY(-1)' }}><CornerOrnament /></div>
      <div className="absolute bottom-6 right-6 z-10" style={{ transform: 'scale(-1,-1)' }}><CornerOrnament /></div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-4 max-w-md text-center relative z-20 px-8 py-12"
        variants={staggerContainer}
        initial="hidden" animate="visible">

        {/* Classification */}
        <motion.p className="font-[family-name:var(--font-body)] text-[9px] sm:text-[10px] tracking-[2px] uppercase"
          style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={0}>
          Dokumen Super-Master &nbsp;|&nbsp; Klasifikasi: Absolut &nbsp;|&nbsp; Horizon: 100 Tahun
        </motion.p>

        <motion.div variants={fadeSlideUp} custom={1}><GoldDivider /></motion.div>

        {/* KNBMP — Letter by letter reveal */}
        <motion.h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-none"
          style={{ color: CHARCOAL }}
          variants={fadeSlideUp} custom={2}>
          <AnimatedLetters text="KNBMP" className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-none" delay={3} />
        </motion.h1>

        {/* PGA-72 with glow */}
        <motion.p className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl tracking-[6px] font-normal"
          style={{ color: BURGUNDY }}
          variants={fadeSlideUp} custom={6}>
          PGA-72
        </motion.p>

        <motion.div variants={fadeSlideUp} custom={7}><GoldDivider /></motion.div>

        {/* Anatomi Peradaban */}
        <motion.p className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic"
          style={{ color: '#6B5E50' }}
          variants={fadeSlideUp} custom={8}>
          Anatomi Peradaban:
        </motion.p>

        {/* Main subtitle */}
        <motion.h2 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl md:text-2xl leading-snug font-normal"
          style={{ color: BURGUNDY }}
          variants={fadeSlideUp} custom={9}>
          72 Pilar Kebangkitan Ekonomi Rakyat Berdaulat
        </motion.h2>

        <motion.div variants={fadeSlideUp} custom={10}><GoldDivider /></motion.div>

        {/* Bottom subtitle */}
        <motion.p className="font-[family-name:var(--font-body)] text-[8px] sm:text-[9px] tracking-[1.5px] uppercase mt-2"
          style={{ color: '#A09385' }}
          variants={fadeSlideUp} custom={11}>
          Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih
        </motion.p>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// INK-BLEED ANIMATION (emotional text reveal)
// ═══════════════════════════════════════════════════════════════
const inkBleed = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: (i: number = 0) => ({
    opacity: 1, filter: 'blur(0px)',
    transition: { delay: i * 0.15, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const emotionalReveal = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }
  })
}

const glowPulse = {
  hidden: { opacity: 0, textShadow: '0 0 0px transparent' },
  visible: (i: number = 0) => ({
    opacity: 1,
    textShadow: [`0 0 0px transparent`, `0 0 20px rgba(94,33,41,0.3)`, `0 0 0px transparent`],
    transition: { delay: i * 0.2, duration: 2.5, ease: 'easeInOut' }
  })
}

// ═══════════════════════════════════════════════════════════════
// EMOTIONAL GOLDEN QUOTE BLOCK
// ═══════════════════════════════════════════════════════════════
function EmotionalQuote({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative my-4 sm:my-5 py-4 sm:py-5 px-5 sm:px-6 rounded-sm ${className}`}
      style={{
        backgroundColor: 'rgba(94,33,41,0.04)',
        borderLeft: `3px solid ${BURGUNDY}40`,
      }}
      variants={emotionalReveal}
      custom={3}>
      {/* Soft inner glow */}
      <div className="absolute inset-0 rounded-sm pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px rgba(94,33,41,0.03)` }} />
      <p className="font-[family-name:var(--font-serif)] text-[14px] sm:text-[17px] leading-[1.9] italic relative z-10"
        style={{ color: '#3E2723' }}>
        {children}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// KATA PENGANTAR — 4 Emotional Parts
// ═══════════════════════════════════════════════════════════════
const KP_PARTS = 4

function KataPengantarPage({ part }: { part: number }) {
  const pageRef = useRef<HTMLDivElement>(null)

  const serif = 'font-[family-name:var(--font-serif)]'
  const bodyFont = 'font-[family-name:var(--font-body)]'
  const txtBase = `${serif} text-[14px] sm:text-[17px] leading-[1.9]`
  const txtSm = `${serif} text-[12px] sm:text-[15px] leading-[1.85]`

  const header = (
    <motion.div className="flex items-center gap-3 mb-2" variants={fadeSlideUp} custom={0}>
      <motion.p className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[3px] uppercase`}
        style={{ color: GOLD }}>
        Kata Pengantar
      </motion.p>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(n => (
          <motion.div key={n} className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: n === part ? GOLD : `${GOLD}30` }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3 + n * 0.08 }} />
        ))}
      </div>
    </motion.div>
  )

  const divider = (
    <motion.div variants={fadeSlideUp} custom={1}>
      <GoldDivider className="my-3" color={BURGUNDY} />
    </motion.div>
  )

  const pageFooter = (
    <motion.div className="flex-shrink-0 text-center pb-3 pt-2"
      variants={fadeSlideUp} custom={20}>
      <p className={`${bodyFont} text-[8px] tracking-[2px] uppercase`}
        style={{ color: '#B0A898' }}>
        Bagian {part} dari {KP_PARTS} &middot; Di Hadapan Sejarah
      </p>
    </motion.div>
  )

  // ═══ PART 1: Bismillah & Air Mata ═══
  if (part === 1) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: BURGUNDY }} />
        <BatikWatermark />
        {/* Large watermark */}
        <div className="absolute top-12 right-4 sm:top-16 sm:right-8 pointer-events-none select-none z-0"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(100px, 22vw, 220px)', color: `${BURGUNDY}06`, lineHeight: 1 }}>
          بسم
        </div>

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          {/* Bismillah — animated reveal */}
          <motion.p className={`${serif} text-lg sm:text-xl text-center my-4 sm:my-6`}
            style={{ color: BURGUNDY, direction: 'rtl', fontFamily: "'Amiri', serif" }}
            variants={glowPulse} custom={2}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </motion.p>

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* Segala puji */}
            <motion.p className={txtSm}
              style={{ color: '#6B5E50' }}
              variants={inkBleed} custom={3}>
              Segala puji bagi Tuhan Semesta Alam, Pemilik mutlak atas segala kedaulatan, yang mengajarkan manusia apa yang tidak diketahuinya.
            </motion.p>

            {/* Core statement */}
            <motion.p className={`${txtBase} drop-cap`}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={4}>
              Buku yang Anda pegang saat ini, atau layar yang sedang Anda baca,{' '}
              <span className="font-semibold" style={{ color: BURGUNDY }}>bukanlah sekadar kumpulan teks korporasi</span>. Ini bukanlah dokumen bisnis yang diracik oleh firma konsultan dengan bayaran jutaan dolar demi menyenangkan dewan direksi atau memaksimalkan dividen segelintir pemegang saham.
            </motion.p>

            <motion.p className={txtSm}
              style={{ color: '#6B5E50' }}
              variants={fadeSlideUp} custom={5}>
              Jika Anda mencari jargon-jargon kosong tentang &ldquo;sinergi korporat&rdquo;, &ldquo;efisiensi modal kapitalis&rdquo;, atau retorika pasar bebas yang menindas,{' '}
              <span className="font-semibold" style={{ color: '#999' }}>tutuplah dokumen ini sekarang</span>. Anda berada di tempat yang salah.
            </motion.p>

            {/* The killer line */}
            <EmotionalQuote custom={6}>
              Dokumen ini ditulis dengan{' '}
              <span className="font-semibold" style={{ color: BURGUNDY }}>air mata, keringat, doa, dan luka sejarah bangsa kita</span>.
            </EmotionalQuote>

            {/* Economic suffering */}
            <motion.p className={txtSm}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={7}>
              Selama puluhan tahun, ekonomi kita sering kali mengajarkan bahwa agar seseorang bisa menang, orang lain harus kalah. Agar yang di atas bisa makmur, yang di bawah harus rela diinjak. Praktik tersebut melahirkan deretan gedung pencakar langit di ibu kota, namun menyisakan{' '}
              <span className="font-semibold" style={{ color: '#999' }}>kegetiran di lumbung-lumbung padi di desa</span>. Koperasi yang seharusnya menjadi soko guru, sering kali hanya menjadi papan nama tanpa ruh, mati ditelan birokrasi atau dikerdilkan oleh sistem pasar yang buas.
            </motion.p>

            <motion.p className={txtSm}
              style={{ color: '#6B5E50' }}
              variants={fadeSlideUp} custom={8}>
              Namun, luka ini sebenarnya berakar jauh lebih dalam dari sekadar kebijakan modern&hellip;
            </motion.p>

            {/* Transition arrow */}
            <motion.div className="text-center pt-2"
              variants={fadeSlideUp} custom={9}>
              <motion.p className={`${bodyFont} text-[10px] tracking-[2px] uppercase`}
                style={{ color: `${GOLD}80` }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                Empat abad yang lalu&hellip;
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 2: Luka 400 Tahun VOC ═══
  if (part === 2) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: '#999' }} />
        <BatikWatermark />
        {/* VOC watermark */}
        <div className="absolute bottom-8 right-4 sm:bottom-12 sm:right-8 pointer-events-none select-none z-0"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px, 18vw, 180px)', color: `${GOLD}05`, lineHeight: 1, fontWeight: 700 }}>
          1602
        </div>

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* VOC arrives */}
            <motion.p className={`${txtBase} drop-cap`}
              style={{ color: '#3E2723' }}
              variants={inkBleed} custom={2}>
              <span className="font-semibold tracking-wide" style={{ color: '#999', letterSpacing: '0.03em' }}>Empat abad yang lalu</span>, sebuah mesin raksasa berwujud korporasi datang ke tanah Nusantara.{' '}
              <span className="font-semibold tracking-wide" style={{ color: '#999', letterSpacing: '0.03em' }}>Vereenigde Oostindische Compagnie (VOC)</span>{' '}
              bukanlah sekadar entitas dagang biasa; ia adalah korporasi multinasional pertama di dunia yang menggunakan instrumen modal, saham, dan monopoli sebagai senjata pemusnah massal kedaulatan kita.
            </motion.p>

            <motion.p className={txtSm}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={3}>
              Mereka datang mencari rempah, namun yang mereka wariskan adalah{' '}
              <span className="font-semibold" style={{ color: '#999' }}>darah, air mata, dan mentalitas keterjajahan</span>. VOC membuktikan kepada sejarah betapa mengerikannya instrumen perdagangan ketika ia dicabut dari akar moral, keadilan, dan kemanusiaan. Melalui taktik{' '}
              <span className="italic">devide et impera</span> (pecah belah dan kuasai), mereka memonopoli hasil bumi, memiskinkan leluhur kita di lumbungnya sendiri, dan memusatkan seluruh kekayaan nusantara ke satu titik kekuasaan di Eropa.
            </motion.p>

            {/* The devastating truth */}
            <EmotionalQuote custom={4}>
              Penjajahan sejatinya{' '}
              <span className="font-semibold" style={{ color: '#999' }}>tidak pernah dimulai oleh peluru atau meriam militer</span>; ia dimulai oleh{' '}
              <span className="font-semibold" style={{ color: BURGUNDY }}>manipulasi perdagangan korporasi</span>.
            </EmotionalQuote>

            {/* The pivot */}
            <motion.div className="my-5" variants={emotionalReveal} custom={5}>
              <GoldDivider className="my-4" />
              <motion.p className={`${serif} text-center text-lg sm:text-xl font-semibold`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={6}>
                Hari ini, di tahun 2026, sejarah itu kita putar balik.
              </motion.p>
              <GoldDivider className="my-4" />
            </motion.div>

            {/* KNBMP introduction */}
            <motion.p className={txtBase}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={7}>
              Jika VOC adalah instrumen segelintir elite untuk menjajah nusantara melalui korporasi, maka{' '}
              <motion.span className="font-bold inline-block" style={{ color: BURGUNDY }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, type: 'spring' }}>
                KNBMP
              </motion.span>{' '}
              — <span className="font-semibold" style={{ color: BURGUNDY }}>Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih</span> — lahir sebagai instrumen Nusantara untuk membebaskan dirinya sendiri melalui kekuatan yang sama. Kita mengambil kembali senjata korporasi itu, membersihkannya, dan memberinya ruh baru. Kita membangun sebuah Korporasi raksasa, namun dengan jiwa dan jantung sebuah Koperasi.
            </motion.p>

            {/* Transition */}
            <motion.div className="text-center pt-2"
              variants={fadeSlideUp} custom={8}>
              <motion.p className={`${bodyFont} text-[10px] tracking-[2px] uppercase`}
                style={{ color: `${GOLD}80` }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                Antitesis Absolut&hellip;
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 3: Antitesis Absolut — 3 Pilar Perbandingan ═══
  if (part === 3) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ background: `linear-gradient(180deg, ${BURGUNDY}, ${GOLD})` }} />
        <BatikWatermark />

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* Antitesis title */}
            <motion.p className={`${serif} text-lg sm:text-xl font-semibold`}
              style={{ color: BURGUNDY }}
              variants={glowPulse} custom={2}>
              KNBMP adalah <span className="italic">Antitesis Absolut</span> dari VOC dan segala bentuk neokolonialisme ekonomi modern:
            </motion.p>

            {/* Comparison 1 */}
            <motion.div className="relative p-3 sm:p-4 rounded-sm"
              style={{ backgroundColor: 'rgba(94,33,41,0.03)', borderLeft: `3px solid ${BURGUNDY}30` }}
              variants={emotionalReveal} custom={3}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1.5`}
                style={{ color: BURGUNDY }}>
                Tentang Sentralisasi
              </p>
              <p className={txtSm}>
                <span style={{ color: '#999' }}>Jika VOC memusatkan kekayaan ke tangan segelintir <em>shareholder</em> di negeri jauh</span>,{' '}
                <span style={{ color: BURGUNDY }}>KNBMP mendistribusikan kemakmuran ke <strong>83.763 desa</strong> di seluruh Nusantara</span>.
              </p>
            </motion.div>

            {/* Comparison 2 */}
            <motion.div className="relative p-3 sm:p-4 rounded-sm"
              style={{ backgroundColor: 'rgba(94,33,41,0.03)', borderLeft: `3px solid ${BURGUNDY}30` }}
              variants={emotionalReveal} custom={4}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1.5`}
                style={{ color: BURGUNDY }}>
                Tentang Kedaulatan
              </p>
              <p className={txtSm}>
                <span style={{ color: '#999' }}>Jika VOC merampas hak petani atas tanah dan hasil buminya</span>,{' '}
                <span style={{ color: BURGUNDY }}>KNBMP memberikan <strong>16 Hak Anggota</strong> — sebuah arsitektur yang memastikan setiap petani, nelayan, dan rakyat kecil memiliki &ldquo;saham&rdquo; mutlak atas keringatnya sendiri</span>.
              </p>
            </motion.div>

            {/* Comparison 3 */}
            <motion.div className="relative p-3 sm:p-4 rounded-sm"
              style={{ backgroundColor: 'rgba(94,33,41,0.03)', borderLeft: `3px solid ${BURGUNDY}30` }}
              variants={emotionalReveal} custom={5}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1.5`}
                style={{ color: BURGUNDY }}>
                Tentang Persatuan
              </p>
              <p className={txtSm}>
                <span style={{ color: '#999' }}>Jika VOC menggunakan taktik <em>devide et impera</em> untuk menghancurkan</span>,{' '}
                <span style={{ color: BURGUNDY }}>KNBMP menggunakan arsitektur <strong>multipihak</strong> (Koperasi Korporasi Multipihak) sebagai Digital Operating System untuk menyatukan, memberdayakan, dan mengangkat derajat manusia dari desa hingga ke panggung global</span>.
              </p>
            </motion.div>

            {/* The healing statement */}
            <motion.div className="my-5" variants={emotionalReveal} custom={6}>
              <GoldDivider className="my-4" color={BURGUNDY} />
            </motion.div>

            <EmotionalQuote custom={7}>
              Kita tidak sedang bernostalgia dalam luka, dan kita sama sekali tidak sedang membalas dendam pada sejarah.{' '}
              <span className="font-semibold" style={{ color: BURGUNDY }}>Kita sedang menyembuhkan luka peradaban</span>.
            </EmotionalQuote>

            {/* Transition */}
            <motion.div className="text-center pt-2"
              variants={fadeSlideUp} custom={8}>
              <motion.p className={`${bodyFont} text-[10px] tracking-[2px] uppercase`}
                style={{ color: `${GOLD}80` }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                Deklarasi Peradaban&hellip;
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 4: Bahtera Peradaban — Closing ═══
  if (part === 4) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ background: `linear-gradient(180deg, ${GOLD}, ${BURGUNDY})` }} />
        <BatikWatermark />
        <GoldenParticles />
        {/* Large watermark */}
        <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-8 pointer-events-none select-none z-0"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px, 16vw, 160px)', color: `${GOLD}05`, lineHeight: 1 }}>
          72
        </div>

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* PGA-72 Architecture */}
            <motion.p className={`${txtBase} drop-cap`}
              style={{ color: '#3E2723' }}
              variants={inkBleed} custom={2}>
              Melalui <span className="font-bold" style={{ color: BURGUNDY }}>PGA-72 (Polymath Grand Architecture)</span> ini, kami meletakkan cetak biru peradaban baru. Sebuah arsitektur kelembagaan yang sangat canggih secara teknologi (berbasis Blockchain dan AI), namun berakar sangat dalam pada nilai ketuhanan dan gotong royong.
            </motion.p>

            {/* 72 dokumen for 100 years */}
            <motion.p className={txtSm}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={3}>
              Kami telah merancang <span className="font-semibold" style={{ color: BURGUNDY }}>72 dokumen ini</span> agar mampu menghadapi ujian waktu selama <span className="font-semibold" style={{ color: GOLD }}>100 tahun ke depan</span>. Di dalamnya, Anda akan menemukan bagaimana kami menerjemahkan mimpi-mimpi terbesar ke dalam Standard Operating Procedure (SOP) yang terukur. Bagaimana kami mengawinkan demokrasi ekonomi nyata (<span className="font-semibold" style={{ color: BURGUNDY }}>1 Anggota = 1 Suara</span>) dengan kecepatan korporasi global. Bagaimana kami memastikan bahwa seorang petani rumput laut di Maluku memiliki martabat, kedaulatan, dan akses modal yang sama dengan seorang eksportir di Jakarta.
            </motion.p>

            {/* Written for you and grandchildren */}
            <EmotionalQuote custom={4}>
              Kami menulis ini untuk <span className="font-semibold" style={{ color: BURGUNDY }}>Anda</span>. Dan yang lebih penting, kami menulis ini untuk <span className="font-semibold" style={{ color: GOLD }}>cucu-cucu Anda</span>.
            </EmotionalQuote>

            {/* Declaration */}
            <motion.p className={txtSm}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={5}>
              Dokumen-dokumen dalam PGA-72 ini adalah{' '}
              <span className="font-semibold" style={{ color: BURGUNDY }}>deklarasi peradaban</span> bahwa bangsa ini telah selesai menangisi masa lalunya. Kita tidak akan lagi menjadi bangsa kuli di antara bangsa-bangsa, dan kuli di antara bangsa sendiri.{' '}
              <span className="font-semibold" style={{ color: GOLD }}>Mulai hari ini, perdagangan bukanlah alat untuk menindas, melainkan instrumen suci untuk memerdekakan</span>.
            </motion.p>

            {/* Generational promise — THE MOST EMOTIONAL PART */}
            <motion.div className="my-5 p-4 sm:p-5 rounded-sm relative overflow-hidden"
              style={{
                backgroundColor: `linear-gradient(135deg, rgba(94,33,41,0.06), rgba(197,160,89,0.06))`,
                border: `1px solid ${BURGUNDY}15`,
              }}
              variants={emotionalReveal} custom={6}>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${GOLD}10, transparent)` }} />
              <p className={`${serif} text-[14px] sm:text-[17px] leading-[1.9] italic relative z-10`}
                style={{ color: '#3E2723' }}>
                Kelak, ketika sejarah mencatat bagaimana Indonesia bertransformasi dari negara yang bergantung menjadi bangsa yang memimpin tatanan ekonomi dunia yang berkeadilan,{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>biarlah anak cucu kita melihat ke belakang</span> dan menemukan dokumen ini sebagai saksinya. Bahwa pada tahun 2026, ada sekelompok manusia yang berani menolak{' '}
                <em>status quo</em>, mengubur mentalitas VOC selamanya, dan memutuskan untuk{' '}
                <span className="font-semibold" style={{ color: GOLD }}>membangun bahtera peradaban</span>.
              </p>
            </motion.div>

            {/* Final call — big and bold */}
            <motion.div className="text-center my-6 sm:my-8" variants={emotionalReveal} custom={7}>
              <motion.div className="mb-4">
                <GoldDivider />
              </motion.div>
              <motion.p className={`${serif} text-xl sm:text-2xl md:text-3xl font-semibold leading-snug`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={8}>
                Selamat datang di ekosistem
                <br />ekonomi rakyat berdaulat.
              </motion.p>
              <motion.p className={`${serif} text-lg sm:text-xl mt-2`}
                style={{ color: GOLD }}
                variants={glowPulse} custom={9}>
                Mari kita mulai bekerja.
              </motion.p>
              <motion.div className="mt-4">
                <GoldDivider />
              </motion.div>
            </motion.div>

            {/* Signature */}
            <motion.div className="text-center mt-6"
              variants={fadeSlideUp} custom={10}>
              <p className={`${serif} text-sm font-semibold`} style={{ color: BURGUNDY }}>
                The Founder&apos;s Office
              </p>
              <p className={`${serif} text-xs italic`} style={{ color: '#999' }}>
                April 2026
              </p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════════
// MUKADIMAH — 4 Parts (Formal Constitutional Opening)
// ═══════════════════════════════════════════════════════════════
const MUKADIMAH_PARTS = 4

function MukadimahPage({ part }: { part: number }) {
  const pageRef = useRef<HTMLDivElement>(null)

  const serif = 'font-[family-name:var(--font-serif)]'
  const bodyFont = 'font-[family-name:var(--font-body)]'
  const txtBase = `${serif} text-[14px] sm:text-[17px] leading-[1.9]`
  const txtSm = `${serif} text-[12px] sm:text-[15px] leading-[1.85]`
  const txtXs = `${serif} text-[11px] sm:text-[13px] leading-[1.8]`

  const header = (
    <motion.div className="flex items-center gap-3 mb-2" variants={fadeSlideUp} custom={0}>
      <motion.p className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[3px] uppercase`}
        style={{ color: GOLD }}>
        Mukadimah
      </motion.p>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(n => (
          <motion.div key={n} className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: n === part ? BURGUNDY : `${BURGUNDY}25` }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3 + n * 0.08 }} />
        ))}
      </div>
    </motion.div>
  )

  const divider = (
    <motion.div variants={fadeSlideUp} custom={1}>
      <GoldDivider className="my-3" />
    </motion.div>
  )

  const pageFooter = (
    <motion.div className="flex-shrink-0 text-center pb-3 pt-2"
      variants={fadeSlideUp} custom={20}>
      <p className={`${bodyFont} text-[8px] tracking-[2px] uppercase`}
        style={{ color: '#B0A898' }}>
        Pembukaan Agung {part} dari {MUKADIMAH_PARTS} &middot; Koperasi Nusantara Merah Putih
      </p>
    </motion.div>
  )

  // ═══ PART 1: Bismillah + Declaration of Freedom ═══
  if (part === 1) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ background: `linear-gradient(180deg, ${GOLD}, ${BURGUNDY})` }} />
        <BatikWatermark />
        {/* Large watermark */}
        <div className="absolute top-12 right-4 sm:top-16 sm:right-8 pointer-events-none select-none z-0"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(100px, 22vw, 220px)', color: `${GOLD}06`, lineHeight: 1 }}>
          &#xFDFA;
        </div>

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          {/* Bismillah */}
          <motion.p className={`${serif} text-lg sm:text-xl text-center my-4 sm:my-6`}
            style={{ color: BURGUNDY, direction: 'rtl', fontFamily: "'Amiri', serif" }}
            variants={glowPulse} custom={2}>
            بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ
          </motion.p>

          <motion.p className={`${txtXs} text-center mb-4`}
            style={{ color: '#6B5E50' }}
            variants={inkBleed} custom={3}>
            Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang
          </motion.p>

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* Quran verse */}
            <motion.div className="relative p-3 sm:p-4 rounded-sm"
              style={{ backgroundColor: 'rgba(197,160,89,0.05)', borderLeft: `3px solid ${GOLD}50` }}
              variants={emotionalReveal} custom={4}>
              <p className={`${serif} text-[13px] sm:text-[16px] leading-[1.9] italic`}
                style={{ color: '#3E2723' }}>
                &ldquo;Sesungguhnya, Allah tidak mengubah keadaan suatu kaum hingga mereka mengubah keadaan yang ada pada diri mereka sendiri.&rdquo;
              </p>
              <p className={`${bodyFont} text-[10px] tracking-wider uppercase mt-2`}
                style={{ color: GOLD }}>
                QS. Ar-Ra&apos;d: 11
              </p>
            </motion.div>

            {/* Declaration of Economic Freedom */}
            <motion.p className={`${txtBase} drop-cap`}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={5}>
              <span className="font-bold tracking-wide" style={{ color: BURGUNDY }}>Bahwa sesungguhnya Kemerdekaan Ekonomi</span> adalah hak seluruh rakyat Indonesia — dari Sabang sampai Merauke, dari Miangas hingga Pulau Rote — dan oleh sebab itu maka segala bentuk kemiskinan struktural, kesenjangan digital, dan ketidakadilan rantai nilai yang telah memiskinkan{' '}
              <span className="font-bold" style={{ color: GOLD }}>83.763 desa dan kelurahan Indonesia</span> harus dihapuskan, bukan dengan janji-janji, melainkan dengan sistem yang bekerja.
            </motion.p>

            {/* Transition */}
            <motion.div className="text-center pt-2"
              variants={fadeSlideUp} custom={6}>
              <motion.p className={`${bodyFont} text-[10px] tracking-[2px] uppercase`}
                style={{ color: `${GOLD}80` }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                Lima Deklarasi Peradaban&hellip;
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 2: Three Declarations ═══
  if (part === 2) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ backgroundColor: GOLD }} />
        <BatikWatermark />

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* Declaration 1: Keadilan Ekonomi */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={2}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}>
                Pertama &mdash; Deklarasi Keadilan Ekonomi
              </p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={3}>
                Bahwa selama 79 tahun Indonesia merdeka, desa telah menjadi tulang punggung pangan bangsa namun tidak pernah menjadi pemilik rantai nilainya. Kopi dari Gayo dibeli dengan harga Rp 30.000 per kilogram dan dijual kembali seharga &euro;15 di Amsterdam. Beras dari Jawa Tengah melewati lima tangan perantara sebelum tiba di meja makan Jakarta. Ikan dari nelayan Bajo dipungut oleh pengepul dengan harga sepertiga nilai pasarnya.{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>Ini bukan nasib. Ini adalah konstruksi sistem yang salah.</span> Dan KNMP hadir untuk membangun sistem yang benar.
              </motion.p>
            </motion.div>

            <ChapterDivider />

            {/* Declaration 2: Persatuan Kelembagaan */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={4}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}>
                Kedua &mdash; Deklarasi Persatuan Kelembagaan
              </p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={5}>
                Bahwa setiap desa di Indonesia rata-rata memiliki 15 hingga 25 lembaga yang bekerja keras setiap hari — PKK, Posyandu, Karang Taruna, BUMDes, Gapoktan, P3A, Lumbung Pangan, BKAD, BUMDesMA, Linmas, LPM, dan puluhan lainnya — namun tidak satu pun dari mereka pernah saling terhubung secara digital. PKK mendata keluarga miskin tetapi datanya tidak terhubung ke BUMDes yang punya program modal usaha. Posyandu mencatat angka stunting tetapi datanya tidak terhubung ke Lumbung Pangan yang punya stok beras.{' '}
                <span className="font-semibold" style={{ color: GOLD }}>KNMP hadir sebagai sistem saraf digital</span> yang menyatukan semua organ desa yang sudah berdenyut — bukan menggantikan, melainkan menyempurnakan.
              </motion.p>
            </motion.div>

            <ChapterDivider />

            {/* Declaration 3: Kedaulatan Digital */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={6}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}>
                Ketiga &mdash; Deklarasi Kedaulatan Digital
              </p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={7}>
                Bahwa di era peradaban digital ini, <span className="font-semibold" style={{ color: GOLD }}>data adalah kekuasaan baru</span>. Bangsa yang mampu mengelola datanya sendiri adalah bangsa yang berdaulat. KNMP berkomitmen bahwa setiap data anggota adalah milik anggota dan koperasi — dilindungi sepenuhnya oleh UU Perlindungan Data Pribadi Nomor 27 Tahun 2022 — tidak pernah dan tidak akan pernah dijual kepada pihak ketiga manapun. Blockchain adalah notaris digital abadi kami: setiap keputusan RAT, setiap distribusi SHU, setiap transaksi anggota tercatat secara permanen dan dapat diaudit oleh siapapun, kapanpun.{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>Transparansi bukan pilihan bagi KNMP — transparansi adalah fondasi kepercayaan.</span>
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 3: Two More Declarations + Manifesto ═══
  if (part === 3) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ background: `linear-gradient(180deg, ${GOLD}, ${BURGUNDY})` }} />
        <BatikWatermark />

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* Declaration 4: Kemerdekaan Petani */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={2}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}>
                Keempat &mdash; Deklarasi Kemerdekaan Petani
              </p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={3}>
                Bahwa <span className="font-bold" style={{ color: GOLD }}>17 juta petani Indonesia</span> tidak memiliki akses ke sistem keuangan formal. Mereka meminjam dari rentenir dengan bunga 10 persen per minggu. Mereka menjual panen di titik harga terendah karena tidak memiliki gudang untuk menunggu harga naik. Mereka tidak bisa mengekspor karena tidak mengenal prosedur ekspor. Mereka tidak bisa mendapat KUR karena tidak memiliki agunan yang diakui bank.{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>KNMP memutus semua mata rantai penindasan ini sekaligus</span>: JP3 Pay memberikan akses keuangan digital pertama mereka; Resi Gudang Digital mengubah hasil panen menjadi agunan yang diakui; KNMP Commodity Exchange memberikan kepastian harga; KNMP Global Trade Desk membuka pintu ekspor yang selama ini tertutup. Kemerdekaan sejati petani adalah ketika ia bisa menentukan harga produknya sendiri — dan KNMP adalah jaminan kemerdekaan itu.
              </motion.p>
            </motion.div>

            <ChapterDivider />

            {/* Declaration 5: Gotong Royong 4.0 */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={4}>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}>
                Kelima &mdash; Deklarasi Peradaban Gotong Royong 4.0
              </p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={5}>
                Bahwa gotong royong bukan sekadar kata indah di dalam dasar negara — <span className="font-semibold" style={{ color: GOLD }}>gotong royong adalah teknologi sosial paling canggih</span> yang pernah diciptakan peradaban Indonesia. Koperasi adalah manifestasi tertinggi dari gotong royong: setiap anggota adalah pemilik, setiap pemilik adalah pelanggan, setiap pelanggan adalah pemasok, setiap pemasok adalah pemangku kepentingan. Dalam KNMP, tidak ada pemegang saham yang untung di atas kerugian anggota. Tidak ada direksi yang kaya di atas kemiskinan petani. Tidak ada data yang dijual demi keuntungan investor. Yang ada adalah Sisa Hasil Usaha yang adil, transparan, dan kembali sepenuhnya kepada mereka yang telah berpartisipasi menciptakannya.{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>Ini adalah Gotong Royong 4.0</span> — gotong royong yang terverifikasi blockchain, teraudit secara real-time, dan dapat dipertanggungjawabkan hingga 100 tahun ke depan.
              </motion.p>
            </motion.div>

            <ChapterDivider />

            {/* Manifesto Peradaban */}
            <motion.div className="my-3" variants={emotionalReveal} custom={6}>
              <motion.p className={`${serif} text-base sm:text-lg font-semibold text-center`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={7}>
                Manifesto Peradaban
              </motion.p>
            </motion.div>

            <motion.p className={txtXs}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={8}>
              <span className="font-semibold" style={{ color: BURGUNDY }}>KNMP bukan koperasi biasa. KNMP adalah proyek peradaban.</span> Upaya sadar untuk membalik 79 tahun ketidakadilan struktural yang membuat desa selalu menjadi pemasok — tidak pernah menjadi pemilik. Yang membuat petani selalu menjual — tidak pernah menentukan harga. Yang membuat desa selalu menerima program — tidak pernah memimpin perubahan.
            </motion.p>

            <motion.p className={txtXs}
              style={{ color: '#3E2723' }}
              variants={fadeSlideUp} custom={9}>
              Dengan AD/ART ini, kami meletakkan fondasi konstitusi koperasi yang:{' '}
              <span style={{ color: BURGUNDY }}>berpihak kepada anggota — bukan kepada modal</span>.{' '}
              <span style={{ color: BURGUNDY }}>Berpihak kepada desa — bukan kepada kota</span>.{' '}
              <span style={{ color: BURGUNDY }}>Berpihak kepada petani — bukan kepada tengkulak</span>.{' '}
              <span style={{ color: BURGUNDY }}>Berpihak kepada keadilan — bukan kepada kemudahan bagi yang berkuasa</span>.
            </motion.p>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  // ═══ PART 4: Inspiration + Covenant + Victor Hugo ═══
  if (part === 4) {
    return (
      <div ref={pageRef} className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20"
          style={{ background: `linear-gradient(180deg, ${BURGUNDY}, ${GOLD})` }} />
        <BatikWatermark />
        <GoldenParticles />

        <motion.div
          className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 relative z-10"
          variants={staggerContainer} initial="hidden" animate="visible">

          {header}
          {divider}

          <div className="max-w-lg mx-auto space-y-4 sm:space-y-5">
            {/* From silo to ecosystem */}
            <motion.div className="text-center my-3"
              variants={emotionalReveal} custom={2}>
              <p className={`${txtXs} font-semibold`} style={{ color: '#3E2723' }}>
                Dari <span style={{ color: GOLD }}>83.763 desa</span> dan kelurahan yang terpencar, kami bangun <span className="font-semibold" style={{ color: BURGUNDY }}>satu peradaban</span>.
              </p>
              <p className={`${txtXs} mt-1`} style={{ color: '#6B5E50' }}>
                Dari silo menuju ekosistem. Dari desa untuk Indonesia. Dari Indonesia untuk Dunia. Dari hari ini untuk 100 tahun ke depan.
              </p>
            </motion.div>

            <GoldDivider />

            {/* Inspirasi 10 Pemimpin */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={3}>
              <motion.p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={4}>
                Inspirasi 10 Pemimpin Peradaban Dunia
              </motion.p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={5}>
                KNMP dibangun di atas pundak para raksasa peradaban. Semangat <span className="font-semibold" style={{ color: GOLD }}>Gajah Mada</span> dalam menyatukan Nusantara via sistem yang menguntungkan semua pihak. Semangat <span className="font-semibold" style={{ color: GOLD }}>Umar bin Abdul Aziz</span> dalam membangun tata kelola tanpa korupsi hingga tidak ada satu pun warga yang mau menerima zakat karena semua sudah sejahtera. Semangat <span className="font-semibold" style={{ color: GOLD }}>Sheikh Zayed</span> dalam membangun peradaban dari nol dengan visi 100 tahun. Semangat <span className="font-semibold" style={{ color: GOLD }}>Lee Kuan Yew</span> dalam meritokrasi dan zero toleransi korupsi. Semangat <span className="font-semibold" style={{ color: GOLD }}>Friedrich Raiffeisen</span> dalam mendirikan koperasi modern kredit pertama di dunia yang membebaskan petani dari cengkeraman rentenir. Semangat <span className="font-semibold" style={{ color: GOLD }}>Mahatma Gandhi</span> dalam membangun Swadesi — ekonomi kemandirian rakyat. Semangat <span className="font-semibold" style={{ color: GOLD }}>Deng Xiaoping</span> dalam pragmatisme: pilot dulu, dokumentasikan, baru replikasi nasional. Dan semangat <span className="font-semibold" style={{ color: GOLD }}>Alexander Agung</span> dalam kecepatan eksekusi dan integrasi budaya — bukan menghancurkan yang berbeda, melainkan mengintegrasikannya.
              </motion.p>
            </motion.div>

            <GoldDivider />

            {/* Perjanjian Abadi */}
            <motion.div className="relative"
              variants={fadeSlideUp} custom={6}>
              <motion.p className={`${bodyFont} text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={7}>
                Perjanjian Abadi Para Pendiri
              </motion.p>
              <motion.p className={txtXs}
                style={{ color: '#3E2723' }}
                variants={inkBleed} custom={8}>
                Dengan memanjatkan doa dan puji syukur kepada Allah Subhanahu wa Ta&apos;ala, Tuhan Yang Maha Esa, atas segala rahmat dan hidayah-Nya; dengan mengingat cita-cita luhur para pendiri bangsa yang terpatri dalam Pancasila dan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945; dengan meyakini bahwa koperasi sebagaimana diamanatkan dalam Pasal 33 UUD NRI 1945 adalah soko guru perekonomian nasional dan pilar terkuat kedaulatan ekonomi rakyat;
              </motion.p>
              <motion.p className={txtXs} style={{ color: '#3E2723' }}
                variants={fadeSlideUp} custom={9}>
                Maka kami, para pendiri Koperasi Multipihak Nusantara Merah Putih, dengan penuh kesadaran, tanggung jawab, dan tekad yang bulat, pada hari ini menyepakati dan mengesahkan Anggaran Dasar, Anggaran Rumah Tangga, dan Kode Etik ini sebagai konstitusi tertinggi KNMP yang akan memandu setiap langkah perjalanan kami — dari hari pertama pendirian hingga satu abad ke depan — dalam mewujudkan <span className="font-bold" style={{ color: GOLD }}>Desa Berdikari</span>: desa yang mandiri pangan, mandiri energi, mandiri ekonomi, dan mandiri dalam menentukan nasibnya sendiri.
              </motion.p>
            </motion.div>

            {/* Victor Hugo quote */}
            <motion.div className="text-center my-5" variants={emotionalReveal} custom={10}>
              <GoldDivider className="mb-4" />
              <motion.p className={`${serif} text-base sm:text-lg italic`}
                style={{ color: '#3E2723' }}
                variants={glowPulse} custom={11}>
                &ldquo;Tidak ada yang lebih kuat dari sebuah ide yang waktunya telah tiba.&rdquo;
              </motion.p>
              <p className={`${bodyFont} text-[10px] tracking-wider uppercase mt-1`}
                style={{ color: GOLD }}>
                &mdash; Victor Hugo
              </p>
              <GoldDivider className="mt-4" />
            </motion.div>

            {/* Final declaration */}
            <motion.div className="text-center" variants={emotionalReveal} custom={12}>
              <motion.p className={`${serif} text-base sm:text-lg font-semibold leading-snug`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={13}>
                Waktu KNMP telah tiba.
              </motion.p>
              <motion.p className={`${serif} text-sm sm:text-base mt-1`}
                style={{ color: GOLD }}
                variants={glowPulse} custom={14}>
                Waktunya Desa Indonesia Berdikari.
              </motion.p>
              <motion.p className={`${serif} text-sm sm:text-base mt-1`}
                style={{ color: GOLD }}
                variants={glowPulse} custom={15}>
                Waktunya 83.763 desa terhubung dalam satu ekosistem peradaban.
              </motion.p>
              <motion.p className={`${serif} text-sm sm:text-base mt-1`}
                style={{ color: BURGUNDY }}
                variants={glowPulse} custom={16}>
                Waktunya gotong royong menjadi kekuatan ekonomi yang mengubah Indonesia.
              </motion.p>
            </motion.div>
          </div>

          {pageFooter}
        </motion.div>
      </div>
    )
  }

  return null
}

function TocPage({ tocPage }: { tocPage: number }) {
  const domain = domains[tocPage]
  if (!domain) return null

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden paper-grain"
      style={{ backgroundColor: '#FFFEFB' }}>
      <BatikWatermark />
      <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: BURGUNDY }} />

      {/* Large background domain number watermark */}
      <div className="absolute top-1/2 right-6 sm:right-10 pointer-events-none select-none z-0"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(120px, 28vw, 260px)',
          color: `${domain.color}06`,
          lineHeight: 1,
          fontWeight: 700,
          transform: 'translateY(-50%)',
        }}>
        D{domain.id}
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
        <motion.div
          variants={staggerContainer} initial="hidden" animate="visible">

          {/* Header */}
          <motion.div className="text-center mb-6 sm:mb-8" variants={fadeSlideUp} custom={0}>
            <motion.div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${GOLD}50` }} />
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: GOLD }} />
              <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${GOLD}50` }} />
            </motion.div>
            <motion.h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-normal tracking-wide"
              style={{ color: CHARCOAL }}>
              Master Index PGA-72
            </motion.h2>
            <motion.p className="font-[family-name:var(--font-heading)] text-[11px] sm:text-xs tracking-[2px] uppercase mt-1.5"
              style={{ color: '#8B7D6B' }}>
              Daftar Isi &middot; Halaman {tocPage + 1} dari {domains.length}
            </motion.p>
            <motion.div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${GOLD}50` }} />
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: GOLD }} />
              <div className="h-px flex-1 max-w-[100px]" style={{ backgroundColor: `${GOLD}50` }} />
            </motion.div>
          </motion.div>

          {/* Domain Header */}
          <motion.div className="text-center mb-4 sm:mb-6" variants={fadeSlideUp} custom={1}>
            <span className="text-4xl sm:text-5xl block mb-2">{domain.emoji}</span>
            <motion.h3 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl lg:text-2xl font-bold tracking-wider uppercase leading-tight"
              style={{ color: domain.color }}>
              Domain {domain.id}: {domain.name}
            </motion.h3>
            <motion.p className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold uppercase tracking-wide mt-1"
              style={{ color: '#6B5E50' }}>
              ({domain.nameId} — {domain.nameSubtitle})
            </motion.p>
            <motion.p className="font-[family-name:var(--font-body)] text-sm sm:text-base font-semibold mt-1.5"
              style={{ color: domain.color }}>
              {domain.range} &middot; {domain.pillars.length} Pilar
            </motion.p>
          </motion.div>

          {/* Domain Description */}
          <motion.div className="mx-auto max-w-lg mb-6 sm:mb-8"
            style={{
              backgroundColor: `${domain.color}06`,
              borderLeft: `3px solid ${domain.color}30`,
              borderRadius: 2,
              padding: '12px 16px',
            }}
            variants={fadeSlideUp} custom={2}>
            <p className="font-[family-name:var(--font-serif)] text-sm sm:text-base leading-[1.85]"
              style={{ color: '#3E2723' }}>
              {domain.description}
            </p>
          </motion.div>

          {/* Pillar Listings */}
          <div className="space-y-4 sm:space-y-5">
            {domain.pillars.map((pillar, idx) => (
              <motion.div key={pillar.id} className="relative"
                variants={fadeSlideUp} custom={3 + idx}
                initial="hidden" animate="visible">

                <div className="relative p-4 sm:p-5 rounded-sm"
                  style={{
                    backgroundColor: idx % 2 === 0 ? `${domain.color}04` : 'transparent',
                    borderLeft: `3px solid ${domain.color}50`,
                  }}>

                  {/* Code Badge — BIG */}
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-bold tracking-wider"
                      style={{ backgroundColor: `${domain.color}15`, color: domain.color }}>
                      {pillar.code}
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-xs sm:text-sm font-medium"
                      style={{ color: '#A09385' }}>
                      {pillar.badge === 'foundation' ? 'Fondasi' : pillar.badge === 'strategic' ? 'Strategis' : 'Operasional'}
                    </span>
                  </div>

                  {/* Pillar Name — BIG */}
                  <h4 className="font-[family-name:var(--font-heading)] text-base sm:text-lg lg:text-xl font-bold leading-snug mb-0.5"
                    style={{ color: CHARCOAL }}>
                    {pillar.name}
                  </h4>

                  {/* English Name */}
                  <p className="font-[family-name:var(--font-heading)] text-sm sm:text-base italic mb-2"
                    style={{ color: '#8B7D6B' }}>
                    {pillar.eng}
                  </p>

                  {/* Description — readable */}
                  <p className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed"
                    style={{ color: '#4A3F32' }}>
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div className="text-center pt-6 pb-4"
            variants={fadeSlideUp} custom={20}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke={GOLD} strokeWidth="0.6" />
                <circle cx="8" cy="8" r="2" fill={GOLD} opacity="0.5" />
              </svg>
              <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
            </div>
            <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[2px] uppercase"
              style={{ color: '#B0A898' }}>
              Daftar Isi ({tocPage + 1}/{domains.length}) &middot; {domain.pillars.length} Pilar
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function PillarDetailPage({ pillar, domain }: { pillar: Pillar; domain: Domain }) {
  const badgeLabel = pillar.badge === 'foundation' ? 'Fondasi' : pillar.badge === 'strategic' ? 'Strategis' : 'Operasional'

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: domain.color }} />

      {/* Large background pillar number watermark */}
      <div className="absolute top-1/3 right-4 sm:right-8 pointer-events-none select-none z-0"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(100px, 24vw, 240px)',
          color: `${domain.color}05`,
          lineHeight: 1,
          fontWeight: 700,
        }}>
        {pillar.code.replace('PGA-', '#')}
      </div>

      <motion.div
        className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">

        {/* Domain header (small, at top) */}
        <motion.div className="mb-3 sm:mb-4" variants={fadeSlideUp} custom={0}>
          <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[3px] uppercase font-bold"
            style={{ color: domain.color }}>
            Domain {domain.id} &middot; {domain.code}
          </p>
          <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm font-semibold"
            style={{ color: '#6B5E50' }}>
            {domain.emoji} {domain.nameId}
          </p>
        </motion.div>

        {/* Gold divider */}
        <motion.div variants={fadeSlideUp} custom={1}>
          <GoldDivider className="my-3" color={domain.color} />
        </motion.div>

        {/* Code badge + type + pillar count */}
        <motion.div className="flex items-center gap-3 mb-3 sm:mb-4" variants={fadeSlideUp} custom={2}>
          <span className="inline-block px-3.5 py-1.5 rounded-full text-base sm:text-lg font-[family-name:var(--font-body)] font-bold tracking-wider"
            style={{ backgroundColor: `${domain.color}15`, color: domain.color }}>
            {pillar.code}
          </span>
          <span className="font-[family-name:var(--font-body)] text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${domain.color}08`, color: domain.color }}>
            {badgeLabel}
          </span>
          <span className="font-[family-name:var(--font-body)] text-xs sm:text-sm"
            style={{ color: '#B0A898' }}>
            Pilar {pillar.id} dari 72
          </span>
        </motion.div>

        {/* Pillar name — VERY BIG */}
        <motion.h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug mb-1 sm:mb-2"
          style={{ color: CHARCOAL }}
          variants={fadeSlideUp} custom={3}>
          {pillar.name}
        </motion.h2>

        {/* English name — big italic */}
        <motion.p className="font-[family-name:var(--font-heading)] text-sm sm:text-base lg:text-lg italic mb-3 sm:mb-4"
          style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={4}>
          {pillar.eng}
        </motion.p>

        {/* Gold divider */}
        <motion.div variants={fadeSlideUp} custom={5}>
          <GoldDivider className="my-3" color={domain.color} />
        </motion.div>

        {/* Description — large readable text */}
        <motion.p className="font-[family-name:var(--font-body)] text-base sm:text-lg leading-[1.8] mb-4 sm:mb-5"
          style={{ color: '#3E2723' }}
          variants={fadeSlideUp} custom={6}>
          {pillar.desc}
        </motion.p>

        {/* Vision quote */}
        <motion.div
          variants={fadeSlideUp} custom={7}>
          <EmotionalQuote>
            {pillar.vision}
          </EmotionalQuote>
        </motion.div>

        {/* Dimensions section */}
        {pillar.dimensions.length > 0 && (
          <motion.div className="mt-4 sm:mt-5" variants={fadeSlideUp} custom={8}>
            <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[2px] uppercase font-bold mb-2.5"
              style={{ color: domain.color }}>
              Dimensi
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {pillar.dimensions.map((dim, i) => (
                <div key={i} className="p-3 rounded-sm"
                  style={{
                    backgroundColor: `${domain.color}05`,
                    borderLeft: `2px solid ${domain.color}30`,
                  }}>
                  <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-0.5"
                    style={{ color: '#6B5E50' }}>
                    {dim.label}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm sm:text-base font-semibold"
                    style={{ color: '#3E2723' }}>
                    {dim.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Principles section */}
        {pillar.principles.length > 0 && (
          <motion.div className="mt-4 sm:mt-5" variants={fadeSlideUp} custom={9}>
            <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[2px] uppercase font-bold mb-2.5"
              style={{ color: domain.color }}>
              Prinsip
            </p>
            <ul className="space-y-2">
              {pillar.principles.map((principle, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: GOLD }} />
                  <span className="font-[family-name:var(--font-body)] text-sm sm:text-base leading-relaxed"
                    style={{ color: '#4A3F32' }}>{principle}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Cross-references */}
        {pillar.xref.length > 0 && (
          <motion.div className="mt-4 sm:mt-5" variants={fadeSlideUp} custom={10}>
            <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[2px] uppercase font-bold mb-2"
              style={{ color: '#A09385' }}>
              Referensi Silang
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pillar.xref.map((refId) => (
                <span key={refId}
                  className="inline-block px-2 py-1 rounded text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold"
                  style={{ backgroundColor: `${domain.color}10`, color: domain.color }}>
                  PGA-{String(refId).padStart(2, '0')}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Page footer */}
        <motion.div className="text-center pt-6 pb-3"
          variants={fadeSlideUp} custom={20}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: `${domain.color}30` }} />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke={domain.color} strokeWidth="0.6" />
              <circle cx="8" cy="8" r="2" fill={domain.color} opacity="0.5" />
            </svg>
            <div className="h-px w-8" style={{ backgroundColor: `${domain.color}30` }} />
          </div>
          <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[2px] uppercase"
            style={{ color: '#B0A898' }}>
            {pillar.code} &middot; {pillar.id}/72 &middot; {domain.emoji} {domain.name}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function PhilosophyPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20" style={{ backgroundColor: BURGUNDY }} />
      <BatikWatermark />
      <div className="absolute top-8 right-6 sm:top-12 sm:right-10 font-[family-name:var(--font-heading)] pointer-events-none select-none z-0"
        style={{ fontSize: 'clamp(120px, 25vw, 250px)', color: `${BURGUNDY}08`, lineHeight: 1 }}>φ</div>

      <motion.div className="flex-1 flex flex-col justify-center px-10 sm:px-16 py-10 sm:py-14 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal leading-tight mb-2"
          style={{ color: CHARCOAL }} variants={fadeSlideUp} custom={0}>
          Mengapa 72? Mengapa 9 Domain?
        </motion.h2>
        <motion.div variants={fadeSlideUp} custom={1}><GoldDivider className="my-4" color={BURGUNDY} /></motion.div>
        <div className="max-w-lg mx-auto space-y-5">
          <motion.p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }} variants={fadeSlideUp} custom={2}>
            Angka 72 bukan kebetulan. Ia adalah kelipatan dari Golden Ratio Fibonacci —
            8 &times; 9 = 72. Delapan representasi arah mata angin dalam Nusantara, sembilan simbol
            kekuatan sembilan naga langit dalam filosofi Jawa kuno.
          </motion.p>
          <motion.p className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85]"
            style={{ color: '#3E2723' }} variants={fadeSlideUp} custom={3}>
            Arsitektur PGA-72 dibangun dengan prinsip bahwa setiap domain saling bergantung —
            tidak ada satu pilar pun yang berdiri sendiri. Ketika satu pilar goyah, seluruh
            ekosistem merasakan getarannya. Inilah desain peradaban:{' '}
            <span className="font-semibold" style={{ color: BURGUNDY }}>terhubung, tangguh, dan abadi</span>.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

function CovenantPage() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center px-8 sm:px-12 py-10 sm:py-14 overflow-hidden paper-grain">
      <BatikWatermark />
      <motion.div className="flex flex-col items-center max-w-md text-center relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div className="w-16 h-px mb-6" style={{ backgroundColor: BURGUNDY }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }} />
        <motion.h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-normal"
          style={{ color: BURGUNDY }} variants={fadeSlideUp} custom={0}>
          Covenant of Civilization
        </motion.h2>
        <motion.p className="font-[family-name:var(--font-heading)] text-sm italic mt-1 mb-6"
          style={{ color: GOLD }} variants={fadeSlideUp} custom={1}>
          Perjanjian Suci
        </motion.p>
        <motion.div variants={fadeSlideUp} custom={2}><GoldDivider /></motion.div>
        <motion.blockquote className="font-[family-name:var(--font-serif)] text-[15px] sm:text-[19px] leading-[1.85] italic mt-6 mb-8"
          style={{ color: '#3E2723' }} variants={fadeSlideUp} custom={3}>
          &ldquo;Kami berjanji — di hadapan sejarah, di hadapan 275 juta rakyat Indonesia, dan
          di hadapan generasi yang belum lahir — bahwa{' '}
          <span className="font-semibold" style={{ color: BURGUNDY }}>kedaulatan ekonomi rakyat</span>{' '}
          bukanlah impian. Ia adalah tujuan yang kami pertaruhkan dengan segala daya dan upaya.&rdquo;
        </motion.blockquote>
        <motion.div variants={fadeSlideUp} custom={4}><GoldDivider /></motion.div>
        <motion.p className="font-[family-name:var(--font-body)] text-xs tracking-wider uppercase mt-6"
          style={{ color: '#A09385' }} variants={fadeSlideUp} custom={5}>
          Grand Architect&apos;s Office &middot; KNBMP
        </motion.p>
        <motion.div className="w-16 h-px mt-6" style={{ backgroundColor: BURGUNDY }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }} />
      </motion.div>
    </div>
  )
}

function BackCoverPage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden paper-grain"
      style={{ backgroundColor: PARCHMENT }}>
      <BatikWatermark />
      <div className="absolute font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
        style={{ fontSize: 'clamp(60px, 15vw, 140px)', color: `${BURGUNDY}06`, letterSpacing: '0.1em', lineHeight: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        MERDEKA
      </div>
      <motion.div className="flex flex-col items-center gap-6 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeSlideUp} custom={0}><GoldDivider color={BURGUNDY} /></motion.div>
        <motion.p className="font-[family-name:var(--font-heading)] text-lg sm:text-xl italic"
          style={{ color: '#6B5E50' }} variants={fadeSlideUp} custom={1}>
          Grand Architect&apos;s Office
        </motion.p>
        <motion.p className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase"
          style={{ color: '#A09385' }} variants={fadeSlideUp} custom={2}>
          Klasifikasi: Absolute Source of Truth
        </motion.p>
        <motion.p className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-normal"
          style={{ color: GOLD }} variants={fadeSlideUp} custom={3}>
          2025
        </motion.p>
        <motion.div variants={fadeSlideUp} custom={4}><GoldDivider color={BURGUNDY} /></motion.div>
        <motion.div className="flex items-center gap-2 mt-2" variants={fadeSlideUp} custom={5}>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${GOLD}40` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${BURGUNDY}30` }} />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RENDER PAGE DISPATCHER
// ═══════════════════════════════════════════════════════════════
function renderPage(page: BookPage, index: number) {
  switch (page.type) {
    case 'cover': return <CoverPage key={`cover-${index}`} />
    case 'kata-pengantar': return <KataPengantarPage key={`kp-${page.part}`} part={page.part} />
    case 'mukadimah': return <MukadimahPage key={`muk-${page.part}`} part={page.part} />
    case 'toc-page': return <TocPage key={`toc-${page.tocPage}`} tocPage={page.tocPage} />
    case 'pillar-detail': return <PillarDetailPage key={`p-${page.pillar.id}`} pillar={page.pillar} domain={page.domain} />
    case 'philosophy': return <PhilosophyPage key={`phil-${index}`} />
    case 'covenant': return <CovenantPage key={`cov-${index}`} />
    case 'back-cover': return <BackCoverPage key={`bc-${index}`} />
    default: return null
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN FLIPBOOK
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const [currentLeaf, setCurrentLeaf] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const playFlipSound = usePageFlipSound()

  const bookPages = useMemo<BookPage[]>(() => [
    { type: 'cover' },
    { type: 'kata-pengantar' as const, part: 1 },
    { type: 'kata-pengantar' as const, part: 2 },
    { type: 'kata-pengantar' as const, part: 3 },
    { type: 'kata-pengantar' as const, part: 4 },
    { type: 'mukadimah' as const, part: 1 },
    { type: 'mukadimah' as const, part: 2 },
    { type: 'mukadimah' as const, part: 3 },
    { type: 'mukadimah' as const, part: 4 },
    ...domains.map((_, i) => ({ type: 'toc-page' as const, tocPage: i })),
    ...domains.flatMap(domain => domain.pillars.map(pillar => ({ type: 'pillar-detail' as const, pillar, domain }))),
    { type: 'philosophy' as const },
    { type: 'covenant' as const },
    { type: 'back-cover' as const },
  ], [])

  const totalPages = bookPages.length

  useEffect(() => { const t = setTimeout(() => setShowHint(false), 5000); return () => clearTimeout(t) }, [])

  const currentPageInfo = useMemo(() => {
    const page = bookPages[currentLeaf]
    if (!page) return { domainColor: GOLD, domainName: '', pillarCode: '' }
    switch (page.type) {
      case 'cover': return { domainColor: GOLD, domainName: 'Sampul', pillarCode: '' }
      case 'kata-pengantar': return { domainColor: BURGUNDY, domainName: `Kata Pengantar (${page.part}/${KP_PARTS})`, pillarCode: '' }
      case 'mukadimah': return { domainColor: GOLD, domainName: `Mukadimah (${page.part}/${MUKADIMAH_PARTS})`, pillarCode: '' }
      case 'toc-page': return { domainColor: BURGUNDY, domainName: `Daftar Isi (${page.tocPage + 1}/${domains.length})`, pillarCode: '' }
      case 'pillar-detail': return { domainColor: page.domain.color, domainName: `${page.domain.emoji} ${page.pillar.code}: ${page.pillar.name}`, pillarCode: `Pilar ${page.pillar.id}/72` }
      case 'philosophy': return { domainColor: BURGUNDY, domainName: 'Filosofi', pillarCode: '' }
      case 'covenant': return { domainColor: BURGUNDY, domainName: 'Covenant', pillarCode: '' }
      case 'back-cover': return { domainColor: GOLD, domainName: 'Sampul Belakang', pillarCode: '' }
      default: return { domainColor: GOLD, domainName: '', pillarCode: '' }
    }
  }, [currentLeaf, bookPages])

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  const handleBookClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if ((e.clientX - rect.left) < rect.width / 2) goPrev()
    else goNext()
  }, [goNext, goPrev])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext(); else goPrev()
    }
  }, [goNext, goPrev])

  const progress = ((currentLeaf + 1) / totalPages) * 100
  const displayPage = currentLeaf + 1

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: DARK_BG }}>
      {/* ═══ LOADING SCREEN ═══ */}
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* ═══ Desktop ═══ */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 gap-6">
        <motion.button onClick={goPrev} disabled={currentLeaf <= 0}
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{ backgroundColor: '#2A2520', color: GOLD, border: '1px solid #3A3530' }}
          whileHover={{ scale: 1.1, backgroundColor: '#352F28' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }} aria-label="Previous">
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        <div className="relative flex-shrink-0 rounded-sm overflow-hidden cursor-pointer select-none"
          style={{ width: 'min(780px, 80vw)', height: 'min(90vh, 780px * 4/3)', perspective: '2500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(197,160,89,0.3)' }}
          onClick={handleBookClick} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          role="book" aria-label={`Page ${displayPage} of ${totalPages}`}>
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div key={index} className="absolute inset-0 bg-white overflow-hidden"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped ? '-5px 0 20px rgba(0,0,0,0.15)' : isCurrent ? '8px 0 30px rgba(0,0,0,0.25)' : '3px 0 10px rgba(0,0,0,0.15)',
                }}>
                {renderPage(page, index)}
              </div>
            )
          })}
        </div>

        <motion.button onClick={goNext} disabled={currentLeaf >= totalPages - 1}
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default"
          style={{ backgroundColor: '#2A2520', color: GOLD, border: '1px solid #3A3530' }}
          whileHover={{ scale: 1.1, backgroundColor: '#352F28' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }} aria-label="Next">
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* ═══ Mobile ═══ */}
      <div className="flex md:hidden flex-1 flex-col">
        <div className="relative flex-1 overflow-hidden cursor-pointer select-none"
          style={{ perspective: '2500px' }}
          onClick={handleBookClick} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          role="book" aria-label={`Page ${displayPage} of ${totalPages}`}>
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div key={index} className="absolute inset-0 bg-white overflow-hidden"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped ? '-3px 0 10px rgba(0,0,0,0.15)' : isCurrent ? '4px 0 15px rgba(0,0,0,0.2)' : '2px 0 5px rgba(0,0,0,0.1)',
                }}>
                {renderPage(page, index)}
              </div>
            )
          })}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          style={{ backgroundColor: DARK_BG }}>
          <motion.button onClick={goPrev} disabled={currentLeaf <= 0}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ backgroundColor: '#2A2520', color: GOLD, border: '1px solid #3A3530' }}
            whileTap={{ scale: 0.9 }} aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <div className="text-center min-w-0 flex-1 mx-3">
            <AnimatePresence mode="wait">
              <motion.div key={displayPage}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}>
                {currentPageInfo.pillarCode && (
                  <p className="font-[family-name:var(--font-body)] text-[10px] tracking-wider truncate"
                    style={{ color: currentPageInfo.domainColor }}>{currentPageInfo.pillarCode}</p>
                )}
                <p className="font-[family-name:var(--font-body)] text-xs tracking-wider"
                  style={{ color: '#A09385' }}>{displayPage} / {totalPages}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.button onClick={goNext} disabled={currentLeaf >= totalPages - 1}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ backgroundColor: '#2A2520', color: GOLD, border: '1px solid #3A3530' }}
            whileTap={{ scale: 0.9 }} aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ═══ Progress bar ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 h-1 pointer-events-none">
        <motion.div className="h-full"
          style={{ backgroundColor: currentPageInfo.domainColor || GOLD, opacity: 0.6 }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }} />
      </div>

      {/* ═══ Desktop bottom bar ═══ */}
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-3">
        <motion.div className="flex items-center gap-3 px-5 py-2 rounded-full"
          style={{ color: '#A09385', backgroundColor: '#1A1814CC', border: '1px solid #2A2520' }}
          layout>
          <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
            animate={{ backgroundColor: currentPageInfo.domainColor || GOLD }}
            transition={{ duration: 0.5 }} />
          <AnimatePresence mode="wait">
            <motion.div key={displayPage} className="text-center min-w-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {currentPageInfo.pillarCode && (
                <p className="font-[family-name:var(--font-body)] text-[10px] tracking-wider"
                  style={{ color: currentPageInfo.domainColor }}>{currentPageInfo.pillarCode}</p>
              )}
              <p className="font-[family-name:var(--font-body)] text-sm tracking-wider">{displayPage} / {totalPages}</p>
            </motion.div>
          </AnimatePresence>
          <div className="w-px h-5" style={{ backgroundColor: '#3A3530' }} />
          <motion.button
            onClick={(e) => { e.stopPropagation(); setSoundEnabled((prev) => !prev) }}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ color: soundEnabled ? GOLD : '#6B5E50' }}
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </motion.button>
        </motion.div>
      </div>

      {/* ═══ Keyboard hint ═══ */}
      <motion.div className="fixed bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        animate={{ opacity: showHint ? 1 : 0 }} transition={{ duration: 1 }}>
        <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-wider"
          style={{ color: '#6B5E50' }}>
          ← → atau klik untuk berpindah halaman
        </p>
      </motion.div>
    </main>
  )
}
