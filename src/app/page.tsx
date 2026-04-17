'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, ChevronDown, Volume2, VolumeX, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Domain, type Pillar } from '@/lib/pillar-data'
import { useFlipbookData } from '@/hooks/use-flipbook-data'
import { AdminTrigger } from '@/components/admin/AdminTrigger'
import { AdminPanel } from '@/components/admin/AdminPanel'

// DigitalUnveiling uses random CSS positioning + border shorthands that expand
// differently on server vs client → dynamic import with ssr:false avoids hydration mismatch
const DigitalUnveiling = dynamic(
  () => import('@/components/DigitalUnveiling').then((m) => m.DigitalUnveiling),
  { ssr: false },
)

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
// PAGE FLIP SOUND — GOD MODE: Cinematic Paper Sound
// ═══════════════════════════════════════════════════════════════
function usePageFlipSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  return useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
        gainRef.current = audioCtxRef.current.createGain()
        gainRef.current.gain.value = 3.0
        gainRef.current.connect(audioCtxRef.current.destination)
      }
      const ctx = audioCtxRef.current
      const masterGain = gainRef.current!

      // ─── LAYER 1: Heavy paper crackle (low frequency body) ───
      const dur1 = 0.35
      const buf1 = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur1), ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = buf1.getChannelData(ch)
        for (let i = 0; i < d.length; i++) {
          const t = i / d.length
          // Sharp attack, slow decay — like thick parchment turning
          const env = Math.exp(-t * 6) * Math.min(t * 200, 1)
          // Low frequency rumble (paper fiber tearing)
          const rumble = Math.sin(t * Math.PI * 2 * 80 + ch * 0.3) * 0.3
          // Mid crunch texture
          const crunch = (Math.random() * 2 - 1) * 0.7
          d[i] = (rumble + crunch) * env * 1.4
        }
      }
      const src1 = ctx.createBufferSource()
      src1.buffer = buf1
      const lp1 = ctx.createBiquadFilter()
      lp1.type = 'lowpass'
      lp1.frequency.value = 1800 + Math.random() * 400
      lp1.Q.value = 0.8
      src1.connect(lp1).connect(masterGain)

      // ─── LAYER 2: Crisp paper snap (high frequency detail) ───
      const dur2 = 0.15
      const buf2 = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur2), ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = buf2.getChannelData(ch)
        for (let i = 0; i < d.length; i++) {
          const t = i / d.length
          // Very sharp attack — the snap of paper edge
          const env = Math.exp(-t * 18) * Math.min(t * 300, 1)
          const snap = (Math.random() * 2 - 1)
          // Add subtle pitch variation for natural feel
          const pitch = Math.sin(t * Math.PI * 2 * (3000 + ch * 500 + Math.random() * 1000)) * 0.15
          d[i] = (snap + pitch) * env * 1.6
        }
      }
      const src2 = ctx.createBufferSource()
      src2.buffer = buf2
      const hp2 = ctx.createBiquadFilter()
      hp2.type = 'highpass'
      hp2.frequency.value = 2000
      const bp2 = ctx.createBiquadFilter()
      bp2.type = 'bandpass'
      bp2.frequency.value = 4000 + Math.random() * 2000
      bp2.Q.value = 1.2
      src2.connect(hp2).connect(bp2).connect(masterGain)

      // ─── LAYER 3: Air whoosh (the sweep sound) ───
      const dur3 = 0.28
      const buf3 = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur3), ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = buf3.getChannelData(ch)
        for (let i = 0; i < d.length; i++) {
          const t = i / d.length
          // Smooth envelope — air displaced by turning page
          const env = Math.sin(t * Math.PI) * 0.6 * Math.exp(-t * 2)
          const noise = (Math.random() * 2 - 1)
          // Stereo offset for spatial feel (left ear hears slightly before right)
          const offset = ch === 0 ? 0 : 0.02
          const tShift = Math.max(0, Math.min(1, t - offset))
          const envShift = Math.sin(tShift * Math.PI) * 0.6 * Math.exp(-tShift * 2)
          d[i] = noise * envShift * 1.0
        }
      }
      const src3 = ctx.createBufferSource()
      src3.buffer = buf3
      const bp3 = ctx.createBiquadFilter()
      bp3.type = 'bandpass'
      bp3.frequency.value = 800 + Math.random() * 600
      bp3.Q.value = 0.5
      src3.connect(bp3).connect(masterGain)

      // ─── LAYER 4: Subtle resonance (the echo in a book) ───
      const dur4 = 0.5
      const buf4 = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur4), ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = buf4.getChannelData(ch)
        for (let i = 0; i < d.length; i++) {
          const t = i / d.length
          const env = Math.exp(-t * 8) * Math.sin(t * Math.PI) * 0.45
          d[i] = (Math.random() * 2 - 1) * env * 0.6
        }
      }
      const src4 = ctx.createBufferSource()
      src4.buffer = buf4
      const lp4 = ctx.createBiquadFilter()
      lp4.type = 'lowpass'
      lp4.frequency.value = 600
      lp4.Q.value = 2.0
      src4.connect(lp4).connect(masterGain)

      // Stagger the layers for realism
      src4.start(ctx.currentTime)          // Resonance first
      src1.start(ctx.currentTime + 0.005)  // Heavy body
      src2.start(ctx.currentTime + 0.01)   // Snap
      src3.start(ctx.currentTime + 0.008)  // Air whoosh

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
// GOD MODE: Enhanced Golden Particles — Luxurious & Dense
// ═══════════════════════════════════════════════════════════════
function GoldenParticlesGod() {
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

    // More particles, varied sizes, some with trails
    const particles: {
      x: number; y: number; size: number; speedY: number; speedX: number;
      opacity: number; fadeDir: number; glow: boolean; trail: boolean;
    }[] = []

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2.5 + 0.3,
        speedY: -(Math.random() * 0.4 + 0.05),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7 + 0.05,
        fadeDir: Math.random() > 0.5 ? 0.004 : -0.004,
        glow: Math.random() > 0.6, // 40% have glow
        trail: Math.random() > 0.8, // 20% leave trails
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        p.opacity += p.fadeDir
        if (p.opacity >= 0.8) p.fadeDir = -0.004
        if (p.opacity <= 0.02) {
          p.fadeDir = 0.004
          p.y = canvas.offsetHeight + 5
          p.x = Math.random() * canvas.offsetWidth
        }

        // Trail effect
        if (p.trail) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.speedX * 8, p.y - p.speedY * 8)
          ctx.strokeStyle = `rgba(197, 160, 89, ${p.opacity * 0.15})`
          ctx.lineWidth = p.size * 0.5
          ctx.stroke()
        }

        // Main particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`
        ctx.fill()

        // Enhanced glow for special particles
        if (p.glow) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity * 0.12})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity * 0.04})`
          ctx.fill()
        } else {
          // Standard soft glow
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity * 0.12})`
          ctx.fill()
        }
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

// ═══════════════════════════════════════════════════════════════
// GOD MODE: Enhanced Corner Ornament
// ═══════════════════════════════════════════════════════════════
function CornerOrnamentGod() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="opacity-80">
      {/* Main L-shape — thick gold */}
      <path d="M4 52V16C4 9.37 9.37 4 16 4H52" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      {/* Secondary inner line */}
      <path d="M8 44V18C8 12.48 12.48 8 18 8H44" stroke={GOLD} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      {/* Kawung diamond accent */}
      <path d="M16 4L20 8L16 12L12 8Z" fill={`${GOLD}30`} stroke={GOLD} strokeWidth="0.6" />
      {/* Tiny dots */}
      <circle cx="10" cy="10" r="1" fill={GOLD} opacity="0.6" />
      <circle cx="6" cy="18" r="0.8" fill={GOLD} opacity="0.4" />
      {/* Decorative swirl */}
      <path d="M52 16C48 12 44 10 40 12" stroke={GOLD} strokeWidth="0.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// GOD MODE: Gold Divider — Cinematic
// ═══════════════════════════════════════════════════════════════
function GoldDividerGod() {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-xs">
      {/* Left line — gradient fade */}
      <div className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD}60, ${GOLD}30)`,
        }} />
      {/* Center diamond */}
      <motion.div
        className="w-2.5 h-2.5 rotate-45 flex-shrink-0"
        style={{
          backgroundColor: GOLD,
          boxShadow: `0 0 8px ${GOLD}40, 0 0 16px ${GOLD}20`,
        }}
        animate={{
          boxShadow: [
            `0 0 8px ${GOLD}40, 0 0 16px ${GOLD}20`,
            `0 0 12px ${GOLD}60, 0 0 24px ${GOLD}30`,
            `0 0 8px ${GOLD}40, 0 0 16px ${GOLD}20`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      {/* Right line — gradient fade */}
      <div className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, ${GOLD}30, ${GOLD}60, transparent)`,
        }} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// GOD MODE: Cover Animations
// ═══════════════════════════════════════════════════════════════
const coverStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.6 } }
}

const coverFadeSlide = {
  hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }
  }
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
// PAGE NUMBER
// ═══════════════════════════════════════════════════════════════
function PageNumber({ index, total }: { index: number; total: number }) {
  return (
    <div className="absolute bottom-3 left-0 right-0 text-center z-30 pointer-events-none">
      <span className="font-[family-name:var(--font-heading)] text-xs tracking-widest"
        style={{ color: '#C5A05960' }}>
        — {index + 1} —
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SCROLL INDICATOR
// ═══════════════════════════════════════════════════════════════
function ScrollIndicator({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => {
      setShow(el.scrollHeight > el.clientHeight + 20)
      setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 30)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => { el.removeEventListener('scroll', check); observer.disconnect() }
  }, [containerRef])

  if (!show || atBottom) return null

  return (
    <div className="absolute bottom-2 right-3 z-30 flex flex-col items-center gap-0.5">
      <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
        <ChevronDown className="w-4 h-4" style={{ color: `${GOLD}60` }} />
      </motion.div>
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

// ═══════════════════════════════════════════════════════════════
// GOD MODE ULTIMATE: Cinematic Light Sweep
// ═══════════════════════════════════════════════════════════════
function CinematicLightSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[6] overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 w-[60%]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.06), rgba(197,160,89,0.12), rgba(197,160,89,0.06), transparent)',
          filter: 'blur(20px)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatDelay: 8,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// GOD MODE ULTIMATE: Royal Kawung Centerpiece
// ═══════════════════════════════════════════════════════════════
function RoyalKawungCenterpiece() {
  return (
    <motion.svg width="48" height="48" viewBox="0 0 48 48" fill="none"
      className="opacity-70"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
      {/* Outer kawung circle */}
      <circle cx="24" cy="24" r="18" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.4" />
      {/* Inner kawung */}
      <circle cx="24" cy="24" r="8" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
      {/* Diamond points — 4 directions */}
      <path d="M24 6L28 10L24 14L20 10Z" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="0.4" />
      <path d="M24 34L28 38L24 42L20 38Z" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="0.4" />
      <path d="M6 24L10 20L14 24L10 28Z" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="0.4" />
      <path d="M34 24L38 20L42 24L38 28Z" fill={`${GOLD}20`} stroke={GOLD} strokeWidth="0.4" />
      {/* Center dot */}
      <circle cx="24" cy="24" r="2.5" fill={GOLD} opacity="0.5" />
      {/* Connecting lines */}
      <line x1="24" y1="10" x2="24" y2="20" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />
      <line x1="24" y1="28" x2="24" y2="38" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />
      <line x1="10" y1="24" x2="20" y2="24" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />
      <line x1="28" y1="24" x2="38" y2="24" stroke={GOLD} strokeWidth="0.3" opacity="0.3" />
    </motion.svg>
  )
}

function CoverPage() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden cursor-default"
      style={{ backgroundColor: '#0A0806' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ═══════════════════════════════════════════════════════════
          LAYER 0: Deep Base Gradient — atmospheric depth
          ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, #1A100C 0%, #0D0906 40%, #050302 100%)',
        }} />

      {/* ═══════════════════════════════════════════════════════════
          LAYER 1: AI Masterpiece Background — Full bleed cinematic
          ═══════════════════════════════════════════════════════════ */}
      <motion.div className="absolute inset-0 z-[1]"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: hovered ? 1.03 : 1.08 }}
        transition={{ duration: 3, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <img src="/cover-bg-ultimate.png" alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.75, filter: 'contrast(1.2) saturate(1.15) brightness(0.9)' }} />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 2: Gold Ornament Frame Overlay
          ═══════════════════════════════════════════════════════════ */}
      <motion.div className="absolute inset-0 z-[2] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 0.35 : 0.2 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}>
        <img src="/cover-ornament-ultimate.png" alt=""
          className="w-full h-full object-contain"
          style={{ mixBlendMode: 'screen', filter: 'contrast(1.3)' }} />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 3: Multi-layer Vignette — cinematic depth
          ═══════════════════════════════════════════════════════════ */}
      {/* Radial vignette — draws all focus to center */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, transparent 15%, rgba(10,8,6,0.3) 40%, rgba(10,8,6,0.7) 65%, rgba(5,3,2,0.95) 100%)',
        }} />

      {/* Top gradient — darkens upper area for header text */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(10,8,6,0.8) 0%, rgba(10,8,6,0.3) 20%, transparent 35%)',
        }} />

      {/* Bottom gradient — darkens lower area for footer text */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, rgba(10,8,6,0.85) 0%, rgba(10,8,6,0.3) 20%, transparent 35%)',
        }} />

      {/* Left/right edge shadows — spine shadow feel */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(10,8,6,0.4) 0%, transparent 12%, transparent 88%, rgba(10,8,6,0.4) 100%)',
        }} />

      {/* ═══════════════════════════════════════════════════════════
          LAYER 4: Batik Kawung — ethereal gold watermark
          ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-[4]"
        style={{ opacity: hovered ? 0.055 : 0.025, transition: 'opacity 1.2s ease' }}>
        <BatikWatermark />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 5: Golden Particles — floating dust motes
          ═══════════════════════════════════════════════════════════ */}
      <GoldenParticlesGod />

      {/* ═══════════════════════════════════════════════════════════
          LAYER 6: Cinematic Light Sweep — periodic golden shimmer
          ═══════════════════════════════════════════════════════════ */}
      <CinematicLightSweep />

      {/* ═══════════════════════════════════════════════════════════
          LAYER 7: Elegant Gold Border Frames — triple depth
          ═══════════════════════════════════════════════════════════ */}
      {/* Outer frame — bold gold with subtle glow */}
      <motion.div className="absolute pointer-events-none z-[8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 2.0, ease: 'easeOut' }}
        style={{
          inset: '10px',
          border: '1.5px solid rgba(197,160,89,0.2)',
          borderRadius: 4,
          boxShadow: '0 0 60px rgba(197,160,89,0.06), inset 0 0 60px rgba(197,160,89,0.03)',
        }} />

      {/* Middle frame — thinner line */}
      <motion.div className="absolute pointer-events-none z-[8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1.8 }}
        style={{ inset: '18px', border: '0.5px solid rgba(197,160,89,0.12)', borderRadius: 2 }} />

      {/* Inner frame — delicate whisper */}
      <motion.div className="absolute pointer-events-none z-[8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.5 }}
        style={{ inset: '26px', border: '0.3px solid rgba(197,160,89,0.08)' }} />

      {/* ═══════════════════════════════════════════════════════════
          LAYER 8: Corner Ornaments — Royal Javanese
          ═══════════════════════════════════════════════════════════ */}
      <motion.div className="absolute top-3 left-3 z-[9]"
        initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, duration: 1.0, type: 'spring', stiffness: 120 }}>
        <CornerOrnamentGod />
      </motion.div>
      <motion.div className="absolute top-3 right-3 z-[9]"
        initial={{ opacity: 0, scale: 0.3, rotate: 15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, duration: 1.0, type: 'spring', stiffness: 120 }}
        style={{ transform: 'scaleX(-1)' }}>
        <CornerOrnamentGod />
      </motion.div>
      <motion.div className="absolute bottom-3 left-3 z-[9]"
        initial={{ opacity: 0, scale: 0.3, rotate: 15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, duration: 1.0, type: 'spring', stiffness: 120 }}
        style={{ transform: 'scaleY(-1)' }}>
        <CornerOrnamentGod />
      </motion.div>
      <motion.div className="absolute bottom-3 right-3 z-[9]"
        initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.9, duration: 1.0, type: 'spring', stiffness: 120 }}
        style={{ transform: 'scale(-1,-1)' }}>
        <CornerOrnamentGod />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 9: TOP SECTION — Bismillah & Classification
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute top-8 sm:top-12 left-0 right-0 flex flex-col items-center z-20 gap-2"
        variants={coverStagger}
        initial="hidden"
        animate="visible">

        {/* Bismillah — Arabic calligraphy feel */}
        <motion.p
          className="text-base sm:text-lg md:text-xl"
          style={{
            color: `${GOLD}70`,
            direction: 'rtl',
            fontFamily: "'Amiri', serif",
            textShadow: '0 0 20px rgba(197,160,89,0.15)',
          }}
          variants={coverFadeSlide}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </motion.p>

        {/* Classification line */}
        <motion.p
          className="font-[family-name:var(--font-body)] text-[7px] sm:text-[8px] tracking-[3px] uppercase"
          style={{ color: `${GOLD}60` }}
          variants={coverFadeSlide}>
          Dokumen Super-Master &nbsp;&bull;&nbsp; Klasifikasi: Absolut &nbsp;&bull;&nbsp; Horizon: 100 Tahun
        </motion.p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 10: MAIN CONTENT — Cinematic Typography Reveal
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex flex-col items-center gap-2.5 sm:gap-3 max-w-sm sm:max-w-md text-center relative z-20 px-6 sm:px-8"
        variants={coverStagger}
        initial="hidden"
        animate="visible">

        {/* Top ornamental divider */}
        <motion.div variants={coverFadeSlide}>
          <GoldDividerGod />
        </motion.div>

        {/* ═══ KNBMP — EPIC LETTER-BY-LETTER REVEAL ═══ */}
        <motion.div className="relative my-1 sm:my-2" variants={coverFadeSlide}>
          {/* Pulsing golden aura behind text */}
          <motion.div
            className="absolute -inset-8 sm:-inset-12 blur-2xl pointer-events-none"
            style={{ backgroundColor: `${GOLD}08` }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />

          {/* The Title: KNBMP */}
          <h1
            className="font-[family-name:var(--font-heading)] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none relative"
            style={{
              color: GOLD,
              textShadow: `
                0 0 40px rgba(197,160,89,0.35),
                0 0 80px rgba(197,160,89,0.15),
                0 0 120px rgba(197,160,89,0.08),
                0 3px 6px rgba(0,0,0,0.6)
              `,
            }}>
            <AnimatedLetters
              text="KNBMP"
              className="font-[family-name:var(--font-heading)] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none"
              delay={4}
              color={GOLD}
            />
          </h1>
        </motion.div>

        {/* PGA-72 — refined tracking */}
        <motion.div className="flex items-center gap-3" variants={coverFadeSlide}>
          <div className="h-px w-8 sm:w-12"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50)` }} />
          <motion.p
            className="font-[family-name:var(--font-heading)] text-base sm:text-xl md:text-2xl tracking-[6px] sm:tracking-[8px] font-normal"
            style={{ color: `${GOLD}BB` }}>
            PGA-72
          </motion.p>
          <div className="h-px w-8 sm:w-12"
            style={{ background: `linear-gradient(90deg, ${GOLD}50, transparent)` }} />
        </motion.div>

        {/* Center ornamental divider */}
        <motion.div variants={coverFadeSlide}>
          <GoldDividerGod />
        </motion.div>

        {/* Anatomi Peradaban — italic subtitle */}
        <motion.p
          className="font-[family-name:var(--font-serif)] text-[11px] sm:text-xs italic"
          style={{ color: `${GOLD}88`, letterSpacing: '0.05em' }}
          variants={coverFadeSlide}>
          Anatomi Peradaban:
        </motion.p>

        {/* ═══ MAIN TAGLINE — The Statement ═══ */}
        <motion.h2
          className="font-[family-name:var(--font-heading)] text-sm sm:text-base md:text-lg lg:text-xl leading-snug font-normal max-w-xs sm:max-w-sm"
          style={{
            color: '#FFF5E6',
            textShadow: '0 1px 4px rgba(0,0,0,0.6), 0 0 30px rgba(197,160,89,0.08)',
          }}
          variants={coverFadeSlide}>
          72 Pilar Kebangkitan
          <br />
          Ekonomi Rakyat Berdaulat
        </motion.h2>

        {/* Bottom ornamental divider */}
        <motion.div variants={coverFadeSlide}>
          <GoldDividerGod />
        </motion.div>

        {/* Full organization name */}
        <motion.p
          className="font-[family-name:var(--font-body)] text-[6px] sm:text-[7px] tracking-[2.5px] uppercase mt-0.5"
          style={{ color: `${GOLD}60` }}
          variants={coverFadeSlide}>
          Koperasi Korporasi Multipihak Nusa Berdikari Merah Putih
        </motion.p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 11: BOTTOM SECTION — Kawung & Credits
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex flex-col items-center gap-3 z-20"
        variants={coverStagger}
        initial="hidden"
        animate="visible">

        {/* Royal Kawung Centerpiece */}
        <motion.div variants={coverFadeSlide}>
          <RoyalKawungCenterpiece />
        </motion.div>

        {/* Credits line */}
        <motion.div
          className="flex items-center gap-2"
          variants={coverFadeSlide}>
          <div className="h-px w-5" style={{ backgroundColor: `${GOLD}30` }} />
          <span className="font-[family-name:var(--font-body)] text-[6px] sm:text-[7px] tracking-[2px] uppercase"
            style={{ color: `${GOLD}45` }}>
            Est. 2026 &nbsp;&bull;&nbsp; Indonesia &nbsp;&bull;&nbsp; Merdeka
          </span>
          <div className="h-px w-5" style={{ backgroundColor: `${GOLD}30` }} />
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          LAYER 12: Hover Effects — Interactive Golden Border
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {hovered && (
          <>
            <motion.div
              className="absolute inset-0 z-[7] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                border: '1px solid rgba(197,160,89,0.1)',
                borderRadius: 6,
              }} />
            <motion.div
              className="absolute inset-0 z-[7] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.1 }}
              style={{
                boxShadow: 'inset 0 0 80px rgba(197,160,89,0.04)',
              }} />
          </>
        )}
      </AnimatePresence>
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

function TocPage({ tocPage, domains }: { tocPage: number; domains: Domain[] }) {
  const domain = domains[tocPage]
  const scrollRef = useRef<HTMLDivElement>(null)
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

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8">
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
      <ScrollIndicator containerRef={scrollRef} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PGA-01 SPECIAL PAGE — Bintang Utara Peradaban / Vision Statement
// ═══════════════════════════════════════════════════════════════
const DOMAIN1_COLOR = '#C4952A'

const visionSentence = 'MEMBANGUN EKOSISTEM EKONOMI RAKYAT BERDAULAT YANG MENJADIKAN SETIAP MANUSIA BEBAS, MAKMUR, DAN BERDAYA — DARI DESA KE DUNIA.'

const visionParagraphs = [
  'KNBMP adalah gerakan membangun kembali kemandirian rakyat — bukan hanya dalam bicara, tetapi dalam kesaksian nyata.',
  'Kami bermimpi dunia di mana setiap manusia — mulai dari petani di desa terpencil sampai wiraswasta di kota besar — memiliki akses yang sama ke pasar, modal, teknologi, dan kebijakan. Di mana ketidakadilan bukan lagi menentukan nasib, tetapi kemandirian dan kerja keras yang menentukan keberhasilan.',
  'Di dunia ini, ekonomi berputar di sekitar manusia — bukan sebaliknya. Teknologi melayani rakyat — bukan menguasai mereka. Politik menjunjung kepentingan rakyat — bukan sekadar menggunakan mereka sebagai alat. Dan kekayaan didistribusikan dengan adil — bukan hanya menggumpal di tangan segelintir orang.',
  'Kami bangun KNBMP sebagai bukti nyata: bahwa ekonomi rakyat bisa bersaing dengan korporasi mana pun. Bahwa kerjasama bisa melebihi kompetisi. Bahwa kesejahteraan bisa dicapai tanpa mengorbankan kemanusiaan. Dan bahwa satu ekosistem — dibangun dengan cinta, kerja keras, dan visi yang jelas — bisa mengubah jutaan kehidupan.',
]

const dimensions = [
  { label: 'Ekonomi', desc: 'Material' },
  { label: 'Politik', desc: 'Kedaulatan' },
  { label: 'Sosial', desc: 'Kemanusiaan' },
  { label: 'Spiritual', desc: 'Makna' },
  { label: 'Geografis', desc: 'Cakupan' },
  { label: 'Generasi', desc: 'Waktu' },
]

const impactCategories = [
  {
    title: 'Dampak Ekonomi',
    icon: '◆',
    metrics: [
      '270M+ akses pasar digital',
      '97M+ unbanked terlayani',
      '64M+ UMKM naik kelas',
      '83.763 desa terintegrasi',
      'Rp25T+ total asset (2035)',
    ],
  },
  {
    title: 'Dampak Sosial',
    icon: '◇',
    metrics: [
      '5M+ keluarga terintegrasi',
      '10M+ pelatihan literasi digital',
      '100K+ agen perubahan',
      'Trust index naik 200%',
      '10.000+ desa nutrition security',
    ],
  },
  {
    title: 'Dampak Anggota',
    icon: '★',
    subItems: [
      { name: 'Dignitas', from: 'Ditinggalkan', to: 'Pebisnis & Pemimpin' },
      { name: 'Capability', from: 'Tidak bisa', to: 'Bisa & Mandiri' },
      { name: 'Opportunity', from: 'Terjebak', to: 'Bebas memilih' },
      { name: 'Meaning', from: 'Survive', to: 'Bermakna & Memberi' },
    ],
  },
  {
    title: 'Dampak Bangsa',
    icon: '▲',
    metrics: [
      'PDB naik $1,3T → $2T+',
      'Gini ratio turun ke <0,25',
      '38 provinsi terhubung',
      'Model dunia — studi kasus global',
    ],
  },
  {
    title: 'Dampak Peradaban',
    icon: '●',
    metrics: [
      'Case study global KNBMP',
      'Wisdom Indonesia go global',
      'Bukti sistem bisa diubah',
      'Warisan MODEL & WISDOM',
    ],
  },
  {
    title: 'Dampak Spiritual',
    icon: '✦',
    metrics: [
      'Setiap tindakan bermakna',
      'Amanah sebagai budaya',
      'Qalb memimpin — bukan akal',
      'Warisan untuk cucu nyata',
    ],
  },
]

const sevenPrinciples = [
  {
    num: 1,
    name: 'Rakyat Pertama, Selalu',
    eng: 'Rakyat First',
    desc: 'Dalam setiap keputusan, pertanyaan pertama adalah: "Apa yang terbaik untuk rakyat?" Bukan untuk profit, investor, atau manajemen.',
    impl: 'Setiap produk/keputusan/kebijakan diuji: Apakah ini menguntungkan rakyat?',
    redLine: 'Mengorbankan rakyat untuk profit',
  },
  {
    num: 2,
    name: 'Kedaulatan Ekonomi sebagai Hak Asasi',
    eng: 'Sovereign Independence',
    desc: 'KNBMP dibangun untuk BERDAULAT — tidak bergantung pada bank konvensional, investor asing, atau pemerintah. Kedaulatan bukan isolasionisme — tapi KEBEBASAN MEMILIH.',
    impl: 'Diversifikasi sumber pembiayaan, bangun infrastruktur sendiri, kembangkan talenta lokal.',
    redLine: 'Menggadaikan kedaulatan untuk pembiayaan murah',
  },
  {
    num: 3,
    name: 'Dari Desa — Bukan Dari Jakarta',
    eng: 'Village First',
    desc: 'Visi dimulai dari desa. Setiap model harus bekerja untuk petani di desa terpencil sebelum diskalakan ke kota.',
    impl: 'Desa sebagai prioritas investasi, desain produk dari bawah, akses desa = prioritas.',
    redLine: 'Jakarta-centric development',
  },
  {
    num: 4,
    name: 'Satu Anggota, Satu Suara',
    eng: 'One Member, One Vote',
    desc: 'KNBMP adalah DEMOKRASI dalam ekonomi. Setiap anggota memiliki suara yang sama — tidak peduli berapa banyak modal yang mereka investasikan.',
    impl: 'RAT sebagai otoritas tertinggi, suara mayoritas, transparansi voting.',
    redLine: 'Suara berdasarkan besarnya modal',
  },
  {
    num: 5,
    name: 'Keberlanjutan Lintas Generasi',
    eng: 'Intergenerational Responsibility',
    desc: 'Setiap keputusan harus bisa dipertanggungjawabkan kepada generasi mendatang. Apakah cucu kita akan bangga?',
    impl: 'Evaluasi dampak lingkungan, investasi berkelanjutan 100 tahun, cadangan untuk masa depan.',
    redLine: 'Menggadaikan masa depan untuk kesenangan sekarang',
  },
  {
    num: 6,
    name: 'Transparansi Total',
    eng: 'Radical Transparency',
    desc: 'Dalam KNBMP, tidak ada yang disembunyikan. Laporan keuangan terbuka. Gaji direksi terbuka. Transparansi adalah fondasi kepercayaan.',
    impl: 'Laporan keuangan publik, gaji manajemen disclosed, kontrak bisa di-review anggota.',
    redLine: 'Menyembunyikan informasi dari anggota',
  },
  {
    num: 7,
    name: 'Inovasi untuk Rakyat',
    eng: 'Purpose Over Profit',
    desc: 'Profit adalah ALAT, bukan TUJUAN. Tujuan KNBMP adalah kebahagiaan dan kesejahteraan anggota. Ketika fokus pada kebahagiaan, profit mengikuti.',
    impl: 'KPI utama: kebahagiaan anggota, SHU didistribusikan adil, pertumbuhan diukur dari lives changed.',
    redLine: 'Mengorbankan kesejahteraan untuk profit margin',
  },
]

function PillarDetailPage01() {
  const serif = 'font-[family-name:var(--font-serif)]'
  const heading = 'font-[family-name:var(--font-heading)]'
  const bodyFont = 'font-[family-name:var(--font-body)]'
  const scrollRef = useRef<HTMLDivElement>(null)

  const [visionRevealed, setVisionRevealed] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisionRevealed(true), 800); return () => clearTimeout(t) }, [])

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <GoldenParticles />
      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: DOMAIN1_COLOR }} />

      {/* Large "PGA-01" watermark */}
      <div className="absolute top-[15%] right-2 sm:right-6 pointer-events-none select-none z-0"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(80px, 20vw, 200px)',
          color: `${DOMAIN1_COLOR}05`,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}>
        PGA-01
      </div>

      <motion.div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-14 sm:pb-16 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">

        {/* ═══ SECTION A: Hero / Document Header ═══ */}
        <motion.div className="mb-5 sm:mb-6" variants={fadeSlideUp} custom={0}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[3px] uppercase font-bold`}
              style={{ color: DOMAIN1_COLOR }}>
              Domain 1 &middot; Identity &amp; Civilization
            </span>
          </div>
          <motion.div variants={fadeSlideUp} custom={1}>
            <GoldDivider className="my-2" color={DOMAIN1_COLOR} />
          </motion.div>
        </motion.div>

        {/* Classification Badge */}
        <motion.div className="mb-4 sm:mb-5" variants={scaleIn} custom={2}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm"
            style={{
              backgroundColor: `${BURGUNDY}08`,
              border: `1px solid ${BURGUNDY}25`,
            }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BURGUNDY }} />
            <span className={`${bodyFont} text-[10px] sm:text-xs tracking-[1.5px] uppercase font-bold`}
              style={{ color: BURGUNDY }}>
              Foundational Truth — Tidak Bisa Diubah Selama 100 Tahun
            </span>
          </div>
        </motion.div>

        {/* Document Title */}
        <motion.h1 className={`${heading} text-2xl sm:text-3xl lg:text-[2.5rem] font-bold leading-tight mb-1`}
          style={{ color: CHARCOAL }}
          variants={fadeSlideUp} custom={3}>
          Bintang Utara Peradaban
        </motion.h1>
        <motion.p className={`${heading} text-sm sm:text-base lg:text-lg italic mb-3`}
          style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={4}>
          Vision Statement
        </motion.p>

        {/* Metadata Grid */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-5" variants={fadeSlideUp} custom={5}>
          {[
            { label: 'Domain', value: 'Identity & Civilization' },
            { label: 'Tier', value: 'SOVEREIGN-72' },
            { label: 'Owner', value: 'Founder Office' },
            { label: 'Version', value: '1.0.0' },
          ].map((m, i) => (
            <div key={i} className="p-2 rounded-sm"
              style={{ backgroundColor: `${DOMAIN1_COLOR}05`, borderLeft: `2px solid ${DOMAIN1_COLOR}20` }}>
              <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[1px] uppercase font-semibold mb-0.5`}
                style={{ color: '#A09385' }}>{m.label}</p>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold`}
                style={{ color: '#3E2723' }}>{m.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Warning Block */}
        <motion.div className="mb-6 sm:mb-8 p-4 rounded-sm relative overflow-hidden"
          style={{
            backgroundColor: `${BURGUNDY}05`,
            border: `1px solid ${BURGUNDY}15`,
          }}
          variants={fadeSlideUp} custom={6}>
          <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: `${BURGUNDY}30` }} />
          <div className="flex items-start gap-2">
            <span className={`${bodyFont} text-base sm:text-lg leading-none mt-0.5`} style={{ color: BURGUNDY }}>⚠</span>
            <div>
              <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[1px] uppercase font-bold mb-1.5`}
                style={{ color: BURGUNDY }}>
                Peringatan
              </p>
              <p className={`${serif} text-[13px] sm:text-[15px] leading-[1.75] italic`}
                style={{ color: '#4A3F32' }}>
                Dokumen ini adalah{' '}
                <span className="font-semibold" style={{ color: BURGUNDY }}>FONDASI PERADABAN</span>. Setiap kata telah dipilih
                dengan sangat hati-hati. Setiap kalimat mengandung makna yang dalam.
                Dokumen ini akan dibaca oleh cucu kita. Dokumen ini akan
                <span className="font-semibold" style={{ color: BURGUNDY }}> MENGGERAKKAN DUNIA</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION B: Vision Statement Utama — The Core ═══ */}
        <motion.div className="mb-4 sm:mb-6" variants={fadeSlideUp} custom={7}>
          <motion.div className="text-center mb-5">
            <p className={`${heading} text-base sm:text-xl lg:text-2xl font-bold tracking-wide leading-tight`}
              style={{ color: BURGUNDY }}>
              VISION STATEMENT UTAMA
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-px w-12 sm:w-16" style={{ backgroundColor: `${DOMAIN1_COLOR}50` }} />
              <span className="block w-2.5 h-2.5 rotate-45" style={{ backgroundColor: `${DOMAIN1_COLOR}60` }} />
              <div className="h-px w-12 sm:w-16" style={{ backgroundColor: `${DOMAIN1_COLOR}50` }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Golden Vision Box with Glow */}
        <motion.div
          className="relative p-5 sm:p-7 lg:p-8 rounded-sm mb-4"
          style={{
            perspective: '1000px',
            background: `linear-gradient(135deg, ${DOMAIN1_COLOR}10 0%, ${BURGUNDY}06 50%, ${DOMAIN1_COLOR}10 100%)`,
            border: `2px solid ${DOMAIN1_COLOR}40`,
            boxShadow: `0 0 30px rgba(196,149,42,0.08), inset 0 0 30px rgba(196,149,42,0.05)`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={visionRevealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}>

          <CornerOrnament color={DOMAIN1_COLOR} size={28} />

          {/* Letter-by-letter vision statement */}
          <div className="relative z-10 text-center py-2" style={{ perspective: '800px' }}>
            <p className="text-[14px] sm:text-base lg:text-lg leading-[1.7] tracking-wide font-bold"
              style={{ color: CHARCOAL, fontFamily: "'Courier New', Courier, monospace" }}>
              {visionSentence.split('').map((char, i) => (
                <motion.span
                  key={i}
                  style={{
                    color: char === '—' ? DOMAIN1_COLOR : i < 9 ? BURGUNDY : CHARCOAL,
                    display: 'inline-block',
                  }}
                  variants={letterReveal}
                  custom={Math.floor(i / 3)}
                  initial="hidden"
                  animate={visionRevealed ? 'visible' : 'hidden'}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </p>
          </div>

          <div className="absolute bottom-2 right-2 rotate-180 opacity-40">
            <CornerOrnament color={DOMAIN1_COLOR} size={28} />
          </div>
        </motion.div>

        {/* Analysis: 17 words, 6 dimensions */}
        <motion.div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8"
          variants={fadeSlideUp} custom={8}>
          <span className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[1px] uppercase`}
            style={{ color: '#A09385' }}>
            17 kata &middot; 6 dimensi &middot; 1 visi
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {dimensions.map((d, i) => (
              <motion.span
                key={i}
                className={`${bodyFont} text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide`}
                style={{
                  backgroundColor: `${DOMAIN1_COLOR}10`,
                  color: DOMAIN1_COLOR,
                  border: `1px solid ${DOMAIN1_COLOR}20`,
                }}
                variants={scaleIn}
                custom={9 + i}>
                {d.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeSlideUp} custom={15}>
          <GoldDivider className="my-4" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* ═══ SECTION C: Vision in Paragraph ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={16}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-4`}
            style={{ color: DOMAIN1_COLOR }}>
            ◆ Visi Dalam Paragraf ◆
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto space-y-4 mb-6 sm:mb-8">
          {visionParagraphs.map((para, i) => (
            <motion.p
              key={i}
              className={`${serif} text-[13px] sm:text-[15px] leading-[1.85]`}
              style={{ color: '#3E2723' }}
              variants={inkBleed}
              custom={17 + i}>
              {para.split(/(ekonomi rakyat|kemandirian|kerjasama|kemanusiaan|cinta|BEBAS.*MAKMUR.*BERDAYA)/gi).map((part, j) => {
                const isHighlight = /ekonomi rakyat|kemandirian|kerjasama|kemanusiaan|cinta|BEBAS.*MAKMUR.*BERDAYA/i.test(part)
                return isHighlight
                  ? <span key={j} className="font-semibold" style={{ color: BURGUNDY }}>{part}</span>
                  : <span key={j}>{part}</span>
              })}
            </motion.p>
          ))}
          <motion.p
            className={`${serif} text-[14px] sm:text-[17px] leading-[1.85] font-semibold text-center mt-5`}
            style={{ color: BURGUNDY }}
            variants={glowPulse}
            custom={22}>
            Inilah visi kami: Dunia di mana setiap manusia bebas, makmur, dan berdaya.
          </motion.p>
        </div>

        <motion.div variants={fadeSlideUp} custom={23}>
          <GoldDivider className="my-4" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* ═══ SECTION D: Impact Analysis ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={24}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: DOMAIN1_COLOR }}>
            ◆ Dampak Jika Visi Tercapai ◆
          </p>
          <p className={`${serif} text-[13px] sm:text-sm text-center italic`}
            style={{ color: '#8B7D6B' }}>
            6 kategori dampak yang mengubah segalanya
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
          {impactCategories.map((cat, idx) => (
            <motion.div
              key={idx}
              className="p-3 sm:p-4 rounded-sm relative overflow-hidden"
              style={{
                backgroundColor: idx % 2 === 0 ? `${DOMAIN1_COLOR}04` : `${BURGUNDY}04`,
                border: `1px solid ${idx % 2 === 0 ? DOMAIN1_COLOR : BURGUNDY}15`,
              }}
              variants={fadeSlideUp}
              custom={25 + idx}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`${heading} text-lg sm:text-xl`} style={{ color: idx % 2 === 0 ? DOMAIN1_COLOR : BURGUNDY }}>
                  {cat.icon}
                </span>
                <h3 className={`${bodyFont} text-xs tracking-[1px] uppercase font-bold`}
                  style={{ color: idx % 2 === 0 ? DOMAIN1_COLOR : BURGUNDY }}>
                  {cat.title}
                </h3>
              </div>

              {/* Metrics */}
              {cat.metrics && (
                <ul className="space-y-1.5">
                  {cat.metrics.map((m, mi) => (
                    <li key={mi} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: idx % 2 === 0 ? DOMAIN1_COLOR : BURGUNDY, opacity: 0.6 }} />
                      <span className={`${bodyFont} text-xs leading-relaxed`}
                        style={{ color: '#4A3F32' }}>{m}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Sub-items for Anggota */}
              {cat.subItems && (
                <div className="space-y-2">
                  {cat.subItems.map((sub, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <span className={`${bodyFont} text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm`}
                        style={{ backgroundColor: `${DOMAIN1_COLOR}15`, color: DOMAIN1_COLOR }}>
                        {sub.name}
                      </span>
                      <span className={`${bodyFont} text-[10px] sm:text-xs`} style={{ color: '#8B7D6B' }}>
                        {sub.from}
                      </span>
                      <span style={{ color: DOMAIN1_COLOR }}>→</span>
                      <span className={`${bodyFont} text-[10px] sm:text-xs font-semibold`} style={{ color: '#3E2723' }}>
                        {sub.to}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeSlideUp} custom={32}>
          <GoldDivider className="my-4" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* ═══ SECTION E: 7 Principles ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={33}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: DOMAIN1_COLOR }}>
            ◆ 7 Prinsip Visi — Non-Negotiable ◆
          </p>
          <p className={`${serif} text-[13px] sm:text-sm text-center italic`}
            style={{ color: '#8B7D6B' }}>
            Tidak bisa diganggu gugat
          </p>
        </motion.div>

        <div className="space-y-3 mb-6 sm:mb-8">
          {sevenPrinciples.map((pr, idx) => (
            <motion.div
              key={idx}
              className="p-3 sm:p-4 rounded-sm"
              style={{
                backgroundColor: `${DOMAIN1_COLOR}${idx % 2 === 0 ? '04' : '02'}`,
                borderLeft: `3px solid ${DOMAIN1_COLOR}${idx % 2 === 0 ? '40' : '25'}`,
              }}
              variants={fadeSlideUp}
              custom={34 + idx}>
              {/* Principle Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`${heading} text-base sm:text-lg font-bold`}
                  style={{ color: DOMAIN1_COLOR }}>{pr.num}.</span>
                <div>
                  <h4 className={`${bodyFont} text-xs sm:text-sm font-bold leading-tight`}
                    style={{ color: CHARCOAL }}>{pr.name}</h4>
                  <p className={`${bodyFont} text-[9px] sm:text-[10px] italic`}
                    style={{ color: '#8B7D6B' }}>{pr.eng}</p>
                </div>
              </div>
              {/* Description */}
              <p className={`${bodyFont} text-xs leading-[1.75] mb-2`}
                style={{ color: '#4A3F32' }}>{pr.desc}</p>
              {/* Implementation */}
              <div className="flex items-start gap-1.5 mb-1.5">
                <span className={`${bodyFont} text-[9px] font-bold tracking-[0.5px] uppercase`}
                  style={{ color: DOMAIN1_COLOR }}>Implementasi:</span>
                <span className={`${bodyFont} text-[11px] sm:text-xs leading-relaxed`}
                  style={{ color: '#6B5E50' }}>{pr.impl}</span>
              </div>
              {/* Red Line */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`${bodyFont} text-[10px]`}>✕</span>
                <span className={`${bodyFont} text-[11px] sm:text-xs font-semibold`}
                  style={{ color: BURGUNDY }}>{pr.redLine}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══ Page Footer ═══ */}
        <motion.div className="text-center pt-4 pb-3" variants={fadeSlideUp} custom={42}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN1_COLOR}30` }} />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke={DOMAIN1_COLOR} strokeWidth="0.6" />
              <circle cx="8" cy="8" r="2" fill={DOMAIN1_COLOR} opacity="0.5" />
            </svg>
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN1_COLOR}30` }} />
          </div>
          <p className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[2px] uppercase`}
            style={{ color: '#B0A898' }}>
            PGA-01 &middot; 1/72 &middot; ◆ Identity &amp; Civilization
          </p>
          <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[1px] uppercase mt-0.5`}
            style={{ color: '#C0B8AA' }}>
            Foundational Truth &middot; Bintang Utara Peradaban
          </p>
        </motion.div>
      </motion.div>
      <ScrollIndicator containerRef={scrollRef} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PGA-02 SPECIAL PAGE — Mission Statement
// ═══════════════════════════════════════════════════════════════

const missionSentence = 'MENGORGANISIR, MENGUATKAN, DAN MENGHUBUNGKAN RAKYAT INDONESIA DALAM EKOSISTEM EKONOMI DIGITAL YANG BERKEADILAN — AGAR SETIAP ANGGOTA BISA BEBAS, MAKMUR, DAN BERDAYA.'

const threePillars = [
  {
    num: 1, title: 'MENGORGANISIR', eng: 'Organize', color: DOMAIN1_COLOR,
    desc: 'Mengumpulkan, menertibkan, dan menyatukan rakyat Indonesia ke dalam satu ekosistem yang terstruktur.',
    belief: 'Kekuatan terbesar bukan di tangan segelintir orang, tapi di tangan rakyat yang bersatu.',
    how: ['Keanggotaan terbuka — tanpa diskriminasi', 'Struktur 6 Tier: Desa → Internasional', '1 Anggota = 1 Suara (demokrasi internal)', 'Komunitas terstruktur dengan koordinator lokal'],
    target: { 2026: '10.000', 2030: '1.000.000', 2035: '5.000.000', 2050: '50.000.000' },
    targetLabel: 'Anggota',
  },
  {
    num: 2, title: 'MENGUATKAN', eng: 'Empower', color: BURGUNDY,
    desc: 'Meningkatkan kapasitas, kemampuan, dan kesejahteraan anggota agar mereka bisa berdiri sendiri.',
    belief: 'Yang terbaik yang bisa kami lakukan untuk mereka adalah membuat mereka tidak perlu kami lagi.',
    how: ['Akses modal — KUR, crowdfunding, alternative credit', 'Akses pengetahuan — Academy KNBMP, sertifikasi', 'Akses teknologi — platform digital user-friendly', 'Akses pasar — marketplace, cold chain, ekspor'],
    target: { 2026: '1.000', 2030: '100K', 2035: '1M', 2050: '10M+' },
    targetLabel: 'Training & Sertifikasi',
  },
  {
    num: 3, title: 'MENGHUBUNGKAN', eng: 'Connect', color: '#00695C',
    desc: 'Membangun jembatan yang menghubungkan anggota dengan pasar, modal, teknologi, dan orang lain.',
    belief: 'Konektivitas adalah kunci kemakmuran — menghapus walls yang memisahkan dari kesempatan.',
    how: ['Marketplace digital KNBMP', 'Portal pembiayaan terintegrasi', 'Jaringan bisnis & mentoring antar-anggota', 'Advocacy & kolaborasi dengan pemerintah'],
    target: { 2026: '5.000', 2030: '500K', 2035: '5M', 2050: '50M+' },
    targetLabel: 'Marketplace Users',
  },
]

const fiveBidang = [
  { icon: '💰', title: 'Ekonomi', desc: 'Ekosistem ekonomi yang memberdayakan rakyat — dari produksi hingga konsumsi', color: DOMAIN1_COLOR },
  { icon: '📚', title: 'Pendidikan', desc: 'Generasi rakyat yang literate — digital, finansial, dan manajerial', color: BURGUNDY },
  { icon: '⚙️', title: 'Teknologi', desc: 'Infrastruktur digital yang memungkinkan rakyat menikmati benefit teknologi', color: '#1565C0' },
  { icon: '🤝', title: 'Sosial', desc: 'Membangun masyarakat yang saling mendukung dan peduli satu sama lain', color: '#00695C' },
  { icon: '⚖️', title: 'Keadilan', desc: 'Sistem yang fair untuk semua — bukan hanya untuk yang sudah kaya', color: '#6A1B9A' },
]

function PillarDetailPage02() {
  const heading = 'font-[family-name:var(--font-heading)]'
  const bodyFont = 'font-[family-name:var(--font-body)]'
  const serif = 'font-[family-name:var(--font-serif)]'
  const scrollRef = useRef<HTMLDivElement>(null)

  const [missionRevealed, setMissionRevealed] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMissionRevealed(true), 600); return () => clearTimeout(t) }, [])

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <GoldenParticles />
      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: DOMAIN1_COLOR }} />

      {/* PGA-02 Watermark */}
      <div className="absolute top-[12%] right-2 sm:right-6 pointer-events-none select-none z-0"
        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px, 20vw, 200px)', color: `${DOMAIN1_COLOR}05`, lineHeight: 1, fontWeight: 700, letterSpacing: '0.05em' }}>
        PGA-02
      </div>

      <motion.div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-14 sm:pb-16 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">

        {/* ═══ HEADER ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={0}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[3px] uppercase font-bold`}
              style={{ color: DOMAIN1_COLOR }}>
              Domain 1 &middot; Identity &amp; Civilization
            </span>
          </div>
          <motion.div variants={fadeSlideUp} custom={1}>
            <GoldDivider className="my-2" color={DOMAIN1_COLOR} />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div className="mb-4" variants={scaleIn} custom={2}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm"
            style={{ backgroundColor: `${BURGUNDY}08`, border: `1px solid ${BURGUNDY}25` }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: BURGUNDY }} />
            <span className={`${bodyFont} text-[10px] sm:text-xs tracking-[1.5px] uppercase font-bold`}
              style={{ color: BURGUNDY }}>
              Mission Statement — Penjabaran Visi Menjadi Aksi
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 className={`${heading} text-2xl sm:text-3xl lg:text-[2.5rem] font-bold leading-tight mb-1`}
          style={{ color: CHARCOAL }}
          variants={fadeSlideUp} custom={3}>
          Mandat Transformasi Nyata
        </motion.h1>
        <motion.p className={`${heading} text-sm sm:text-base lg:text-lg italic mb-4`}
          style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={4}>
          Mission Statement
        </motion.p>

        {/* Visi → Misi connection */}
        <motion.div className="mb-5 p-3 rounded-sm flex items-center gap-3"
          style={{ backgroundColor: `${DOMAIN1_COLOR}05`, border: `1px solid ${DOMAIN1_COLOR}15` }}
          variants={fadeSlideUp} custom={5}>
          <span className={`${heading} text-lg font-bold`} style={{ color: DOMAIN1_COLOR }}>VISI</span>
          <span style={{ color: '#C0B8AA' }}>→</span>
          <span className={`${bodyFont} text-xs font-bold`} style={{ color: BURGUNDY }}>APA yang kita inginkan</span>
          <span className="mx-1" style={{ color: '#D0C8BA' }}>|</span>
          <span className={`${heading} text-lg font-bold`} style={{ color: BURGUNDY }}>MISI</span>
          <span style={{ color: '#C0B8BA' }}>→</span>
          <span className={`${bodyFont} text-xs font-bold`} style={{ color: BURGUNDY }}>BAGAIMANA kita mencapainya</span>
        </motion.div>

        {/* ═══ MISSION STATEMENT UTAMA ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={6}>
          <motion.div className="text-center mb-4">
            <p className={`${heading} text-base sm:text-xl lg:text-2xl font-bold tracking-wide leading-tight`}
              style={{ color: BURGUNDY }}>
              MISSION STATEMENT UTAMA
            </p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-px w-12 sm:w-16" style={{ backgroundColor: `${DOMAIN1_COLOR}50` }} />
              <span className="block w-2.5 h-2.5 rotate-45" style={{ backgroundColor: `${DOMAIN1_COLOR}60` }} />
              <div className="h-px w-12 sm:w-16" style={{ backgroundColor: `${DOMAIN1_COLOR}50` }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Golden Mission Box */}
        <motion.div
          className="relative p-5 sm:p-7 lg:p-8 rounded-sm mb-4"
          style={{
            perspective: '1000px',
            background: `linear-gradient(135deg, ${DOMAIN1_COLOR}10 0%, ${BURGUNDY}06 50%, ${DOMAIN1_COLOR}10 100%)`,
            border: `2px solid ${DOMAIN1_COLOR}40`,
            boxShadow: `0 0 30px rgba(196,149,42,0.08), inset 0 0 30px rgba(196,149,42,0.05)`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={missionRevealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}>

          <CornerOrnament color={DOMAIN1_COLOR} size={24} />

          <div className="relative z-10 text-center py-2" style={{ perspective: '800px' }}>
            <p className="text-[13px] sm:text-base lg:text-lg leading-[1.7] tracking-wide font-bold"
              style={{ color: CHARCOAL, fontFamily: "'Courier New', Courier, monospace" }}>
              {missionSentence.split('').map((char, i) => (
                <motion.span
                  key={i}
                  style={{
                    color: char === '—' ? DOMAIN1_COLOR : ['M', 'E', 'N', 'G'].includes(char) && i < 3 ? BURGUNDY : CHARCOAL,
                    display: 'inline-block',
                  }}
                  variants={letterReveal}
                  custom={Math.floor(i / 4)}
                  initial="hidden"
                  animate={missionRevealed ? 'visible' : 'hidden'}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </p>
          </div>

          <div className="absolute bottom-2 right-2 rotate-180 opacity-40">
            <CornerOrnament color={DOMAIN1_COLOR} size={24} />
          </div>
        </motion.div>

        {/* 18 kata badge */}
        <motion.div className="text-center mb-5" variants={fadeSlideUp} custom={7}>
          <span className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[1px] uppercase`}
            style={{ color: '#A09385' }}>
            18 kata &middot; 3 aksi &middot; 3 outcome &middot; 1 misi
          </span>
        </motion.div>

        <motion.div variants={fadeSlideUp} custom={8}>
          <GoldDivider className="my-3" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* ═══ TIGA PILLAR MISI ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={9}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: DOMAIN1_COLOR }}>
            ◆ Tiga Pilar Misi ◆
          </p>
          <p className={`${serif} text-[13px] sm:text-sm text-center italic`}
            style={{ color: '#8B7D6B' }}>
            Misi KNBMP adalah tiga aksi nyata yang saling terhubung
          </p>
        </motion.div>

        <div className="space-y-4 mb-5">
          {threePillars.map((p, idx) => (
            <motion.div key={idx} className="p-3 sm:p-4 rounded-sm"
              style={{
                backgroundColor: `${p.color}05`,
                border: `1px solid ${p.color}20`,
                borderLeft: `4px solid ${p.color}`,
              }}
              variants={fadeSlideUp} custom={10 + idx}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`${heading} text-xl sm:text-2xl font-bold`} style={{ color: p.color }}>{p.num}</span>
                <div>
                  <h3 className={`${heading} text-base sm:text-lg font-bold`} style={{ color: p.color }}>{p.title}</h3>
                  <p className={`${bodyFont} text-[9px] sm:text-[10px] italic`} style={{ color: '#8B7D6B' }}>{p.eng}</p>
                </div>
              </div>
              {/* Desc */}
              <p className={`${bodyFont} text-[11px] sm:text-xs leading-[1.7] mb-2`} style={{ color: '#4A3F32' }}>{p.desc}</p>
              {/* Belief */}
              <p className={`${serif} text-[11px] sm:text-xs italic mb-2`} style={{ color: p.color }}>
                &ldquo;{p.belief}&rdquo;
              </p>
              {/* How */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                {p.how.map((h, hi) => (
                  <div key={hi} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: p.color, opacity: 0.6 }} />
                    <span className={`${bodyFont} text-[10px] sm:text-[11px]`} style={{ color: '#6B5E50' }}>{h}</span>
                  </div>
                ))}
              </div>
              {/* Target mini table */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${bodyFont} text-[9px] font-bold tracking-wider uppercase`} style={{ color: p.color }}>{p.targetLabel}:</span>
                {Object.entries(p.target).map(([year, val]) => (
                  <span key={year} className={`${bodyFont} text-[9px] px-1.5 py-0.5 rounded-sm`}
                    style={{ backgroundColor: `${p.color}10`, color: p.color }}>
                    {year}: {val}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeSlideUp} custom={14}>
          <GoldDivider className="my-3" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* ═══ 5 BIDANG MISI ═══ */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={15}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-3`}
            style={{ color: DOMAIN1_COLOR }}>
            ◆ 5 Bidang Misi ◆
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
          {fiveBidang.map((b, i) => (
            <motion.div key={i} className="p-3 rounded-sm"
              style={{ backgroundColor: `${b.color}04`, border: `1px solid ${b.color}15` }}
              variants={scaleIn} custom={16 + i}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{b.icon}</span>
                <h4 className={`${bodyFont} text-xs sm:text-sm font-bold`} style={{ color: b.color }}>{b.title}</h4>
              </div>
              <p className={`${bodyFont} text-[10px] sm:text-[11px] leading-[1.6]`} style={{ color: '#6B5E50' }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Target 2050 summary */}
        <motion.div className="p-4 rounded-sm mb-5"
          style={{ backgroundColor: `${BURGUNDY}05`, border: `1px solid ${BURGUNDY}15` }}
          variants={fadeSlideUp} custom={22}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold text-center mb-3`}
            style={{ color: BURGUNDY }}>
            Target 2050 — Sumbbangsi Kepada Bangsa
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Anggota', value: '50M+' },
              { label: 'Total Asset', value: 'Rp200T+' },
              { label: 'SHU ke Anggota', value: 'Rp1T+/tahun' },
              { label: 'Desa Terintegrasi', value: '83.763' },
            ].map((t, i) => (
              <div key={i} className="text-center p-2 rounded-sm"
                style={{ backgroundColor: `${BURGUNDY}05` }}>
                <p className={`${heading} text-sm sm:text-base font-bold`} style={{ color: BURGUNDY }}>{t.value}</p>
                <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[0.5px] uppercase`} style={{ color: '#A09385' }}>{t.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeSlideUp} custom={23}>
          <GoldDivider className="my-3" color={DOMAIN1_COLOR} />
        </motion.div>

        {/* Closing quote */}
        <motion.div className="text-center mb-4" variants={fadeSlideUp} custom={24}>
          <p className={`${serif} text-[14px] sm:text-[16px] leading-[1.8] italic`}
            style={{ color: BURGUNDY }}>
            &ldquo;Inilah misi kami. Inilah cara kami mencapai visi. Inilah janji kami kepada rakyat Indonesia.&rdquo;
          </p>
        </motion.div>

        {/* ═══ PAGE FOOTER ═══ */}
        <motion.div className="text-center pt-3 pb-2" variants={fadeSlideUp} custom={25}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN1_COLOR}30` }} />
            <span className="block w-2 h-2 rotate-45" style={{ backgroundColor: `${DOMAIN1_COLOR}50` }} />
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN1_COLOR}30` }} />
          </div>
          <p className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[2px] uppercase`}
            style={{ color: '#B0A898' }}>
            PGA-02 &middot; 2/72 &middot; ◆ Identity &amp; Civilization
          </p>
          <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[1px] uppercase mt-0.5`}
            style={{ color: '#C0B8AA' }}>
            Mission Statement &middot; Mandat Transformasi Nyata
          </p>
        </motion.div>
      </motion.div>
      <ScrollIndicator containerRef={scrollRef} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PGA-13 SPECIAL PAGE — Dual-Track Integration Strategy
// ═══════════════════════════════════════════════════════════════
const DOMAIN2_COLOR = '#1565C0'

const dualTrackPrinciples = [
  { num: 1, text: 'Fleksibilitas Strategis', desc: 'Kami tidak menunggu izin untuk bertindak. Kami tidak bergantung pada persetujuan untuk bergerak.' },
  { num: 2, text: 'Kemandirian sebagai Kekuatan', desc: 'Kemandirian bukan kelemahan. Kemandirian adalah bukti bahwa kami percaya pada misi kami cukup kuat.' },
  { num: 3, text: 'Kolaborasi sebagai Akselerator', desc: 'Jika pemerintah mau bergabung, kami berjalan lebih cepat. Jika tidak, kami berjalan lebih jauh.' },
  { num: 4, text: 'People Power sebagai Fondasi', desc: 'Perubahan sejati datang dari rakyat, bukan dari pemerintah.' },
  { num: 5, text: 'Tidak Ada Plan B', desc: 'Kami memiliki SATU visi yang dicapai dengan DUA jalur. Keduanya adalah Plan A.' },
]

const trackAItems = [
  { icon: '🏛️', label: 'MOU dengan Kemendesa', desc: 'Integrasi langsung dengan sistem pemerintah' },
  { icon: '🔗', label: 'API SID & Prodeskel', desc: 'Akses data potensi desa real-time' },
  { icon: '📋', label: 'KDMP Alignment', desc: 'Selaras dengan data koperasi desa nasional' },
  { icon: '💰', label: 'Dana Desa Rp60,6T', desc: 'Injeksi dana program pemerintah' },
  { icon: '🏢', label: '16 Kementerian Support', desc: 'Dukungan lintas kementerian' },
]

const trackBItems = [
  { icon: '👥', label: 'People Power Mobilization', desc: 'Gerakan bawah dari rakyat untuk rakyat' },
  { icon: '🌱', label: 'Grassroots Movement', desc: 'Akar rumput kuat di setiap desa' },
  { icon: '💸', label: 'Independent Funding', desc: 'Pembiayaan mandiri tanpa ketergantungan' },
  { icon: '📱', label: 'Viral Growth', desc: 'Pertumbuhan organik melalui anggota' },
  { icon: '🌐', label: 'Network Effects', desc: 'Efek jaringan yang semakin kuat' },
]

const siloData = [
  { institution: 'PKK', count: '83.763', status: 'Manual', gap: 'Data terpisah' },
  { institution: 'BUMDes', count: '46.668', status: 'Sebagian digital', gap: 'Uang terpisah' },
  { institution: 'Posyandu', count: '300.000+', status: 'Sebagian digital', gap: 'Data kesehatan terpisah' },
  { institution: 'Gapoktan', count: '50.000+', status: 'Manual', gap: 'Produksi terpisah' },
  { institution: 'KUD', count: '~22.000', status: 'Banyak zombie', gap: 'Tidak terkoneksi' },
  { institution: 'RT/RW', count: '~1.500.000', status: 'Manual', gap: 'Pendataan manual' },
]

function PillarDetailPage13({ domain }: { domain: Domain }) {
  const bodyFont = 'font-[family-name:var(--font-body)]'
  const heading = 'font-[family-name:var(--font-heading)]'
  const serif = 'font-[family-name:var(--font-serif)]'
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: DOMAIN2_COLOR }} />

      {/* Large "PGA-13" watermark */}
      <div className="absolute top-[12%] right-2 sm:right-6 pointer-events-none select-none z-0"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(80px, 20vw, 200px)',
          color: `${DOMAIN2_COLOR}05`,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}>
        PGA-13
      </div>

      <motion.div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-14 sm:pb-16 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">

        {/* ═══ HEADER ═══ */}
        <motion.div className="mb-4 sm:mb-5" variants={fadeSlideUp} custom={0}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[3px] uppercase font-bold`}
              style={{ color: DOMAIN2_COLOR }}>
              Domain 2 &middot; Strategy &amp; Direction
            </span>
          </div>
          <motion.div variants={fadeSlideUp} custom={1}>
            <GoldDivider className="my-2" color={DOMAIN2_COLOR} />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div className="mb-4" variants={scaleIn} custom={2}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm"
            style={{ backgroundColor: `${DOMAIN2_COLOR}08`, border: `1px solid ${DOMAIN2_COLOR}25` }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DOMAIN2_COLOR }} />
            <span className={`${bodyFont} text-[10px] sm:text-xs tracking-[1.5px] uppercase font-bold`}
              style={{ color: DOMAIN2_COLOR }}>
              Master Integration Whitepaper — Dual-Track Strategy
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 className={`${heading} text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-1`}
          style={{ color: CHARCOAL }}
          variants={fadeSlideUp} custom={3}>
          Dual-Track: Orkestrasi Ekosistem Desa
        </motion.h1>
        <motion.p className={`${heading} text-xs sm:text-sm italic mb-4`}
          style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={4}>
          Dua Jalur, Satu Tujuan — Dengan atau Tanpa Pemerintah
        </motion.p>

        {/* Key Stats */}
        <motion.div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5" variants={fadeSlideUp} custom={5}>
          {[
            { label: 'Infrastruktur', value: '500K+', unit: 'unit' },
            { label: 'Desa', value: '83.763', unit: 'desa' },
            { label: 'Penduduk', value: '270M+', unit: 'jiwa' },
            { label: 'Dana Desa', value: 'Rp60,6T', unit: '/tahun' },
            { label: 'Platform', value: 'kopnusa', unit: '.com' },
          ].map((s, i) => (
            <div key={i} className="p-2 rounded-sm text-center"
              style={{ backgroundColor: `${DOMAIN2_COLOR}05`, borderLeft: `2px solid ${DOMAIN2_COLOR}20` }}>
              <p className={`${bodyFont} text-base sm:text-lg font-bold`} style={{ color: DOMAIN2_COLOR }}>{s.value}</p>
              <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[0.5px] uppercase`} style={{ color: '#A09385' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeSlideUp} custom={6}>
          <GoldDivider className="my-3" color={DOMAIN2_COLOR} />
        </motion.div>

        {/* ═══ DUAL-TRACK PHILOSOPHY ═══ */}
        <motion.div className="mb-5" variants={fadeSlideUp} custom={7}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-3`}
            style={{ color: DOMAIN2_COLOR }}>
            ◆ Dual-Track Philosophy ◆
          </p>
          <p className={`${serif} text-[13px] sm:text-[15px] leading-[1.8] text-center italic`}
            style={{ color: '#3E2723' }}>
            &ldquo;Kami bukan sekadar koperasi. Kami adalah{' '}
            <span className="font-semibold" style={{ color: DOMAIN2_COLOR }}>Digital Nervous System</span> yang menghubungkan seluruh infrastruktur desa menjadi satu ekosistem yang hidup —{' '}
            <span className="font-semibold" style={{ color: BURGUNDY }}>dengan dukungan pemerintah atau tanpa dukungan pemerintah, kami akan tetap maju.</span>&rdquo;
          </p>
        </motion.div>

        {/* ═══ TRACK A vs TRACK B ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Track A */}
          <motion.div className="p-4 rounded-sm"
            style={{ backgroundColor: `${DOMAIN2_COLOR}06`, border: `2px solid ${DOMAIN2_COLOR}30` }}
            variants={fadeSlideUp} custom={8}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${heading} text-xl`} style={{ color: DOMAIN2_COLOR }}>A</span>
              <div>
                <h3 className={`${bodyFont} text-xs sm:text-sm font-bold`} style={{ color: DOMAIN2_COLOR }}>TRACK A</h3>
                <p className={`${bodyFont} text-[9px] sm:text-[10px] italic`} style={{ color: '#8B7D6B' }}>With Government Partnership</p>
              </div>
            </div>
            <div className="space-y-2">
              {trackAItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{item.icon}</span>
                  <div>
                    <p className={`${bodyFont} text-[11px] sm:text-xs font-semibold`} style={{ color: '#3E2723' }}>{item.label}</p>
                    <p className={`${bodyFont} text-[9px] sm:text-[10px]`} style={{ color: '#8B7D6B' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Track B */}
          <motion.div className="p-4 rounded-sm"
            style={{ backgroundColor: `${BURGUNDY}06`, border: `2px solid ${BURGUNDY}30` }}
            variants={fadeSlideUp} custom={9}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${heading} text-xl`} style={{ color: BURGUNDY }}>B</span>
              <div>
                <h3 className={`${bodyFont} text-xs sm:text-sm font-bold`} style={{ color: BURGUNDY }}>TRACK B</h3>
                <p className={`${bodyFont} text-[9px] sm:text-[10px] italic`} style={{ color: '#8B7D6B' }}>With People Power (Independent)</p>
              </div>
            </div>
            <div className="space-y-2">
              {trackBItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{item.icon}</span>
                  <div>
                    <p className={`${bodyFont} text-[11px] sm:text-xs font-semibold`} style={{ color: '#3E2723' }}>{item.label}</p>
                    <p className={`${bodyFont} text-[9px] sm:text-[10px]`} style={{ color: '#8B7D6B' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Merger indicator */}
        <motion.div className="text-center mb-5" variants={fadeSlideUp} custom={10}>
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full"
            style={{ backgroundColor: `${DOMAIN2_COLOR}08`, border: `1px solid ${DOMAIN2_COLOR}20` }}>
            <span className={`${bodyFont} text-[10px] font-bold`} style={{ color: DOMAIN2_COLOR }}>TRACK A</span>
            <span style={{ color: DOMAIN2_COLOR }}>+</span>
            <span className={`${bodyFont} text-[10px] font-bold`} style={{ color: BURGUNDY }}>TRACK B</span>
            <span style={{ color: CHARCOAL }}>=</span>
            <span className={`${bodyFont} text-[10px] font-bold`} style={{ color: CHARCOAL }}>KEDAULATAN</span>
          </div>
        </motion.div>

        <motion.div variants={fadeSlideUp} custom={11}>
          <GoldDivider className="my-3" color={DOMAIN2_COLOR} />
        </motion.div>

        {/* ═══ SILO SYNDROME — THE PROBLEM ═══ */}
        <motion.div className="mb-5" variants={fadeSlideUp} custom={12}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: BURGUNDY }}>
            ◆ Masalah: Silo Syndrome ◆
          </p>
          <p className={`${serif} text-[12px] sm:text-sm text-center italic mb-3`}
            style={{ color: '#8B7D6B' }}>
            500.000+ unit kelembagaan desa berjalan dalam silo terputus
          </p>
        </motion.div>

        <div className="overflow-x-auto mb-5">
          <table className="w-full text-left" style={{ fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${DOMAIN2_COLOR}30` }}>
                <th className={`${bodyFont} py-2 pr-3 font-bold uppercase tracking-wider`} style={{ color: DOMAIN2_COLOR }}>Lembaga</th>
                <th className={`${bodyFont} py-2 pr-3 font-bold uppercase tracking-wider`} style={{ color: DOMAIN2_COLOR }}>Jumlah</th>
                <th className={`${bodyFont} py-2 pr-3 font-bold uppercase tracking-wider`} style={{ color: DOMAIN2_COLOR }}>Status</th>
                <th className={`${bodyFont} py-2 font-bold uppercase tracking-wider`} style={{ color: BURGUNDY }}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {siloData.map((row, i) => (
                <motion.tr key={i} variants={fadeSlideUp} custom={13 + i}
                  style={{ borderBottom: `1px solid #f0ece4` }}>
                  <td className={`${bodyFont} py-2 pr-3 font-semibold`} style={{ color: '#3E2723' }}>{row.institution}</td>
                  <td className={`${bodyFont} py-2 pr-3`} style={{ color: '#6B5E50' }}>{row.count}</td>
                  <td className={`${bodyFont} py-2 pr-3`} style={{ color: row.status === 'Manual' ? BURGUNDY : DOMAIN2_COLOR }}>{row.status}</td>
                  <td className={`${bodyFont} py-2 italic`} style={{ color: '#A09385' }}>{row.gap}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div variants={fadeSlideUp} custom={19}>
          <GoldDivider className="my-3" color={DOMAIN2_COLOR} />
        </motion.div>

        {/* ═══ 5 PRINSIP DUAL-TRACK ═══ */}
        <motion.div className="mb-5" variants={fadeSlideUp} custom={20}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: DOMAIN2_COLOR }}>
            ◆ 5 Prinsip Dual-Track — Non-Negotiable ◆
          </p>
        </motion.div>

        <div className="space-y-2.5 mb-5">
          {dualTrackPrinciples.map((pr, idx) => (
            <motion.div key={idx} className="p-3 rounded-sm"
              style={{
                backgroundColor: `${DOMAIN2_COLOR}${idx % 2 === 0 ? '04' : '02'}`,
                borderLeft: `3px solid ${DOMAIN2_COLOR}${idx % 2 === 0 ? '40' : '25'}`,
              }}
              variants={fadeSlideUp} custom={21 + idx}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`${heading} text-sm sm:text-base font-bold`} style={{ color: DOMAIN2_COLOR }}>{pr.num}.</span>
                <h4 className={`${bodyFont} text-xs sm:text-sm font-bold`} style={{ color: CHARCOAL }}>{pr.text}</h4>
              </div>
              <p className={`${bodyFont} text-[11px] sm:text-xs leading-[1.7]`} style={{ color: '#6B5E50' }}>{pr.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeSlideUp} custom={27}>
          <GoldDivider className="my-3" color={DOMAIN2_COLOR} />
        </motion.div>

        {/* ═══ kopnusa.com PLATFORM ═══ */}
        <motion.div className="mb-5" variants={fadeSlideUp} custom={28}>
          <p className={`${bodyFont} text-[10px] sm:text-xs tracking-[3px] uppercase font-bold text-center mb-1`}
            style={{ color: DOMAIN2_COLOR }}>
            ◆ kopnusa.com — Digital Nervous System ◆
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {[
            { icon: '📊', label: 'Village Dashboard', desc: 'Analitik terintegrasi' },
            { icon: '🏥', label: 'Health System', desc: 'Pencegahan stunting' },
            { icon: '🛒', label: 'Marketplace', desc: 'Petani ↔ Pembeli' },
            { icon: '💳', label: 'JP3 Pay', desc: 'Inklusi keuangan' },
            { icon: '🚛', label: 'Logistics', desc: 'Cold chain & ekspor' },
            { icon: '📚', label: 'Academy', desc: 'Capacity building' },
            { icon: '💧', label: 'Smart Resource', desc: 'Alokasi cerdas' },
            { icon: '🔗', label: 'API Hub', desc: 'SID, Prodeskel, KDMP' },
          ].map((mod, i) => (
            <motion.div key={i} className="p-2.5 rounded-sm text-center"
              style={{ backgroundColor: `${DOMAIN2_COLOR}05`, border: `1px solid ${DOMAIN2_COLOR}15` }}
              variants={scaleIn} custom={29 + i}>
              <span className="text-lg sm:text-xl">{mod.icon}</span>
              <p className={`${bodyFont} text-[10px] sm:text-xs font-bold mt-1`} style={{ color: '#3E2723' }}>{mod.label}</p>
              <p className={`${bodyFont} text-[8px] sm:text-[9px]`} style={{ color: '#A09385' }}>{mod.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ═══ PAGE FOOTER ═══ */}
        <motion.div className="text-center pt-3 pb-2" variants={fadeSlideUp} custom={38}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN2_COLOR}30` }} />
            <span className="block w-2 h-2 rotate-45" style={{ backgroundColor: `${DOMAIN2_COLOR}50` }} />
            <div className="h-px w-8" style={{ backgroundColor: `${DOMAIN2_COLOR}30` }} />
          </div>
          <p className={`${bodyFont} text-[9px] sm:text-[10px] tracking-[2px] uppercase`}
            style={{ color: '#B0A898' }}>
            PGA-13 &middot; 13/72 &middot; ◆ Strategy &amp; Direction
          </p>
          <p className={`${bodyFont} text-[8px] sm:text-[9px] tracking-[1px] uppercase mt-0.5`}
            style={{ color: '#C0B8AA' }}>
            Master Integration Whitepaper &middot; Dual-Track Strategy
          </p>
        </motion.div>
      </motion.div>
      <ScrollIndicator containerRef={scrollRef} />
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════
// SPECIAL DOCUMENT PAGE SYSTEM (PGA-03 through PGA-08)
// ═══════════════════════════════════════════════════════════════

interface SDSection {
  type: 'stats' | 'quote' | 'cards' | 'timeline' | 'table' | 'list' | 'text' | 'declamation' | 'comparison' | 'footer-quote'
  title?: string
  text?: string
  content?: string
  emphasis?: boolean
  cols?: number
  lines?: string[]
  statsItems?: { value: string; label: string }[]
  items?: { title: string; desc?: string; icon?: string; metric?: string; subtitle?: string; year?: string }[]
  headers?: string[]
  rows?: string[][]
  compHeaders?: string[]
  compRows?: { text: string; highlight?: boolean }[][]
}

interface SDData {
  pgaCode: string
  title: string
  subtitle: string
  badge: string
  badgeType?: 'warning' | 'info'
  footerLabel: string
  footerSub: string
  sections: SDSection[]
}

function SDGridClass(n: number) {
  if (n === 1) return 'grid-cols-1'
  if (n === 3) return 'grid-cols-1 sm:grid-cols-3'
  return 'grid-cols-1 sm:grid-cols-2'
}

function SpecialDocumentPage({ data }: { data: SDData }) {
  const bf = 'font-[family-name:var(--font-body)]'
  const hf = 'font-[family-name:var(--font-heading)]'
  const sf = 'font-[family-name:var(--font-serif)]'
  const scrollRef = useRef<HTMLDivElement>(null)
  const DC = DOMAIN1_COLOR

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden paper-grain page-fold-shadow">
      <BatikWatermark />
      <GoldenParticles />
      <div className="absolute left-0 top-0 bottom-0 w-2 z-20" style={{ backgroundColor: DC }} />
      <div className="absolute top-[12%] right-2 sm:right-6 pointer-events-none select-none z-0"
        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px, 20vw, 200px)', color: `${DC}05`, lineHeight: 1, fontWeight: 700, letterSpacing: '0.05em' }}>
        {data.pgaCode}
      </div>

      <motion.div ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-12 pt-5 sm:pt-7 pb-14 sm:pb-16 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">

        {/* Domain Header */}
        <motion.div className="mb-4" variants={fadeSlideUp} custom={0}>
          <span className={`${bf} text-[9px] sm:text-[10px] tracking-[3px] uppercase font-bold`} style={{ color: DC }}>
            Domain 1 &middot; Identity &amp; Civilization
          </span>
        </motion.div>
        <motion.div variants={fadeSlideUp} custom={1}><GoldDivider className="my-2" color={DC} /></motion.div>

        {/* Classification Badge */}
        <motion.div className="mb-4" variants={scaleIn} custom={2}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm"
            style={{ backgroundColor: `${data.badgeType === 'warning' ? BURGUNDY : DC}08`, border: `1px solid ${data.badgeType === 'warning' ? BURGUNDY : DC}25` }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: data.badgeType === 'warning' ? BURGUNDY : DC }} />
            <span className={`${bf} text-[10px] sm:text-xs tracking-[1.5px] uppercase font-bold`}
              style={{ color: data.badgeType === 'warning' ? BURGUNDY : DC }}>{data.badge}</span>
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.h1 className={`${hf} text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-1`}
          style={{ color: CHARCOAL }} variants={fadeSlideUp} custom={3}>{data.title}</motion.h1>
        <motion.p className={`${hf} text-xs sm:text-sm italic mb-4`} style={{ color: '#8B7D6B' }}
          variants={fadeSlideUp} custom={4}>{data.subtitle}</motion.p>

        {/* Sections */}
        {data.sections.map((sec, si) => {
          const bi = 6 + si * 4
          switch (sec.type) {
            case 'stats': {
              const sItems = sec.statsItems || []
              return (
                <div key={si} className="mb-4">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-3" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}30` }} />
                    </motion.div>
                  )}
                  <motion.div className={sItems.length <= 3 ? 'grid grid-cols-3 gap-2' : sItems.length <= 5 ? 'grid grid-cols-2 sm:grid-cols-5 gap-2' : 'grid grid-cols-2 sm:grid-cols-4 gap-2'}
                    variants={fadeSlideUp} custom={bi + 1}>
                    {sItems.map((s, i) => (
                      <div key={i} className="p-2 rounded-sm text-center"
                        style={{ backgroundColor: `${DC}05`, borderLeft: `2px solid ${DC}20` }}>
                        <p className={`${hf} text-sm sm:text-base font-bold`} style={{ color: DC }}>{s.value}</p>
                        <p className={`${bf} text-[8px] sm:text-[9px] tracking-[0.5px] uppercase`} style={{ color: '#A09385' }}>{s.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )
            }

            case 'quote':
              return (
                <EmotionalQuote key={si} className="mb-4">
                  &ldquo;{sec.text}&rdquo;
                </EmotionalQuote>
              )

            case 'cards': {
              const cItems = sec.items || []
              const cCols = sec.cols || 2
              return (
                <div key={si} className="mb-4">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-3" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px w-6" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}15` }} />
                    </motion.div>
                  )}
                  <motion.div className={`grid ${SDGridClass(cCols)} gap-2 sm:gap-3`}
                    variants={staggerContainer} initial="hidden" animate="visible">
                    {cItems.map((item, i) => (
                      <motion.div key={i} className="p-3 rounded-sm"
                        style={{ backgroundColor: `${DC}04`, border: `1px solid ${DC}12` }}
                        variants={fadeSlideUp} custom={bi + i + 1}>
                        {item.icon && <span className="text-base mb-1 block">{item.icon}</span>}
                        <p className={`${hf} text-xs sm:text-sm font-bold mb-0.5`} style={{ color: CHARCOAL }}>{item.title}</p>
                        {item.subtitle && (
                          <p className={`${bf} text-[9px] sm:text-[10px] uppercase tracking-wider mb-1`}
                            style={{ color: DC }}>{item.subtitle}</p>
                        )}
                        <p className={`${bf} text-[10px] sm:text-xs leading-relaxed`} style={{ color: '#5D4E37' }}>{item.desc}</p>
                        {item.metric && (
                          <p className={`${hf} text-[10px] sm:text-xs font-bold mt-1.5`} style={{ color: BURGUNDY }}>{item.metric}</p>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )
            }

            case 'timeline': {
              const tItems = sec.items || []
              return (
                <div key={si} className="mb-4">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-3" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px w-6" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}15` }} />
                    </motion.div>
                  )}
                  <div className="relative pl-6 sm:pl-8">
                    <div className="absolute left-2 sm:left-3 top-1 bottom-1 w-px" style={{ backgroundColor: `${DC}25` }} />
                    {tItems.map((item, i) => (
                      <motion.div key={i} className="relative mb-3 last:mb-0" variants={fadeSlideUp} custom={bi + i + 1}>
                        <div className="absolute -left-[14px] sm:-left-[17px] top-1 w-3 h-3 rounded-full border-2"
                          style={{ backgroundColor: 'white', borderColor: DC }} />
                        <p className={`${hf} text-[10px] sm:text-xs font-bold`} style={{ color: DC }}>{item.year}</p>
                        <p className={`${hf} text-xs sm:text-sm font-bold`} style={{ color: CHARCOAL }}>{item.title}</p>
                        {item.desc && (
                          <p className={`${bf} text-[10px] sm:text-xs leading-relaxed mt-0.5`} style={{ color: '#5D4E37' }}>{item.desc}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            }

            case 'table': {
              return (
                <div key={si} className="mb-4 overflow-x-auto">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-2" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px w-6" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}15` }} />
                    </motion.div>
                  )}
                  <motion.div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${DC}15` }}
                    variants={fadeSlideUp} custom={bi + 1}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${DC}30`, backgroundColor: `${DC}06` }}>
                          {(sec.headers || []).map((h, i) => (
                            <th key={i} className={`${bf} text-[9px] sm:text-[10px] tracking-[1px] uppercase font-bold p-2`}
                              style={{ color: DC }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.rows || []).map((row, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${DC}08` }}>
                            {row.map((cell, j) => (
                              <td key={j} className={`${bf} text-[10px] sm:text-xs p-2`} style={{ color: '#3E2723' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                </div>
              )
            }

            case 'list': {
              const lItems = sec.items || []
              return (
                <div key={si} className="mb-4">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-3" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px w-6" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}15` }} />
                    </motion.div>
                  )}
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                    {lItems.map((item, i) => (
                      <motion.div key={i} className="flex items-start gap-3 mb-2 last:mb-0 p-2 rounded-sm"
                        style={{ backgroundColor: `${DC}03` }} variants={fadeSlideUp} custom={bi + i + 1}>
                        <span className={`${hf} text-[10px] sm:text-xs font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full mt-0.5`}
                          style={{ backgroundColor: `${DC}15`, color: DC }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`${hf} text-xs sm:text-sm font-bold`} style={{ color: CHARCOAL }}>{item.title}</p>
                          {item.desc && (
                            <p className={`${bf} text-[10px] sm:text-xs leading-relaxed mt-0.5`} style={{ color: '#5D4E37' }}>{item.desc}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )
            }

            case 'text':
              return (
                <motion.div key={si} className="mb-4" variants={fadeSlideUp} custom={bi}>
                  <p className={`${sec.emphasis ? hf : bf} ${sec.emphasis ? 'text-xs sm:text-sm font-bold' : 'text-xs sm:text-sm'} leading-relaxed`}
                    style={{ color: sec.emphasis ? CHARCOAL : '#3E2723' }}>
                    {sec.content}
                  </p>
                </motion.div>
              )

            case 'declamation':
              return (
                <motion.div key={si} className="my-4 sm:my-5 p-5 sm:p-6 rounded-sm text-center"
                  style={{ backgroundColor: `${BURGUNDY}06`, border: `2px solid ${BURGUNDY}15` }}
                  variants={emotionalReveal} custom={bi}>
                  {(sec.lines || []).map((line, i) => (
                    <p key={i} className={`${hf} text-xs sm:text-sm font-bold leading-relaxed ${i > 0 ? 'mt-2' : ''}`}
                      style={{ color: BURGUNDY }}>
                      {line}
                    </p>
                  ))}
                </motion.div>
              )

            case 'comparison': {
              const cHeaders = sec.compHeaders || []
              return (
                <div key={si} className="mb-4 overflow-x-auto">
                  {sec.title && (
                    <motion.div className="flex items-center gap-3 mb-2" variants={fadeSlideUp} custom={bi}>
                      <div className="h-px w-6" style={{ backgroundColor: `${DC}30` }} />
                      <p className={`${bf} text-[10px] sm:text-xs tracking-[2px] uppercase font-bold`} style={{ color: DC }}>{sec.title}</p>
                      <div className="h-px flex-1" style={{ backgroundColor: `${DC}15` }} />
                    </motion.div>
                  )}
                  <motion.div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${DC}15` }}
                    variants={fadeSlideUp} custom={bi + 1}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${DC}30`, backgroundColor: `${DC}06` }}>
                          {cHeaders.map((h, i) => (
                            <th key={i} className={`${bf} text-[9px] sm:text-[10px] tracking-[1px] uppercase font-bold p-2 ${i === cHeaders.length - 1 ? 'text-center' : ''}`}
                              style={{ color: i === cHeaders.length - 1 ? BURGUNDY : DC }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.compRows || []).map((row, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${DC}08` }}>
                            {row.map((cell, j) => (
                              <td key={j} className={`${bf} text-[10px] sm:text-xs p-2 ${j === cHeaders.length - 1 ? 'text-center font-bold' : ''}`}
                                style={{
                                  color: cell.highlight ? BURGUNDY : '#3E2723',
                                  backgroundColor: cell.highlight ? `${BURGUNDY}08` : 'transparent'
                                }}>{cell.text}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                </div>
              )
            }

            case 'footer-quote':
              return (
                <motion.div key={si} className="mt-6 mb-2 text-center" variants={emotionalReveal} custom={bi}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-8" style={{ backgroundColor: `${DC}30` }} />
                    <span className="block w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${DC}50` }} />
                    <div className="h-px w-8" style={{ backgroundColor: `${DC}30` }} />
                  </div>
                  <p className={`${sf} text-sm sm:text-base italic leading-relaxed`} style={{ color: '#5D4E37' }}>
                    &ldquo;{sec.text}&rdquo;
                  </p>
                </motion.div>
              )

            default:
              return null
          }
        })}

        {/* Footer */}
        <motion.div className="mt-6 pt-4 text-center" style={{ borderTop: `1px solid ${DC}15` }}
          variants={fadeSlideUp} custom={50}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-px w-8" style={{ backgroundColor: `${DC}30` }} />
            <span className="block w-2 h-2 rotate-45" style={{ backgroundColor: `${DC}50` }} />
            <div className="h-px w-8" style={{ backgroundColor: `${DC}30` }} />
          </div>
          <p className={`${bf} text-[9px] sm:text-[10px] tracking-[2px] uppercase`} style={{ color: '#B0A898' }}>
            {data.footerLabel}
          </p>
          <p className={`${bf} text-[8px] sm:text-[9px] tracking-[1px] uppercase mt-0.5`} style={{ color: '#C0B8BA' }}>
            {data.footerSub}
          </p>
        </motion.div>
      </motion.div>
      <ScrollIndicator containerRef={scrollRef} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PGA-03: Akar Hikmah Para Pendiri (Founders Philosophy)
// ═══════════════════════════════════════════════════════════════
const pga03Data: SDData = {
  pgaCode: 'PGA-03',
  title: 'Akar Hikmah Para Pendiri',
  subtitle: 'Founders Philosophy & Guiding Principles',
  badge: 'FONDASI FILOSOFIS — Tidak Bisa Diubah Tanpa Persetujuan RAT',
  badgeType: 'warning',
  footerLabel: 'PGA-03 · 3/72 · ◆ Identity & Civilization',
  footerSub: 'Founders Philosophy & Guiding Principles',
  sections: [
    {
      type: 'cards',
      title: '7 Luka Besar Indonesia',
      cols: 2,
      items: [
        { title: 'Fragmentasi Ekonomi Rakyat', metric: '64.2M UMKM, 80%+ gagal', desc: 'Puluhan juta UMKM terfragmentasi tanpa akses ke pasar dan modal yang memadai. Delapan puluh persen lebih gagal dalam lima tahun pertama.' },
        { title: 'Ketergantungan Kapital Asing', desc: 'Ekonomi rakyat terjebak dalam ketergantungan pada kebijakan, modal, dan teknologi asing yang tidak mengutamakan kepentingan lokal.' },
        { title: 'Kesenjangan Akses', metric: '97M+ unbanked, 2500+ blank spot', desc: 'Lebih dari 97 juta orang belum memiliki akses perbankan, ribuan desa masih menjadi blank spot digital.' },
        { title: 'Koperasi Zombie', metric: '22.000+ KUD tidak aktif', desc: 'Lebih dari 22.000 Koperasi Unit Desa tidak aktif. Sistem koperasi secara massal gagal memberdayakan anggotanya.' },
        { title: 'Bangkitan Desa Terpencil', metric: '17.500+ desa tertinggal', desc: 'Ribuan desa tertinggal tanpa infrastruktur memadai, terisolasi dari akses pasar, pendidikan, dan kesehatan.' },
        { title: 'Hilangnya Identitas Ekonomi Rakyat', desc: 'Akar budaya ekonomi rakyat — gotong royong, pasar tradisional, sistem bagi hasil — terkikis oleh modernisasi yang tidak inklusif.' },
        { title: 'Kosongnya Model Alternatif', desc: 'Tidak ada model ekonomi rakyat yang terbukti berhasil pada skala nasional. Setiap upaya hanya bersifat parsial dan tidak terintegrasi.' },
      ],
    },
    {
      type: 'cards',
      title: 'Wisdom dari 6 Peradaban',
      items: [
        { title: 'Indonesia', subtitle: 'Gotong Royong, Subak, Pasar Loak, Kongsi Laut', desc: 'Kekayaan lokal yang teruji berabad-abad — sistem irigasi Subak Bali, kongsi laut nusantara, dan tradisi gotong royong.' },
        { title: 'Islam', subtitle: 'Muamalah, Zakat, Waqf, Mudharabah', desc: 'Prinsip ekonomi syariah yang menekankan keadilan, kebersamaan, dan distribusi kekayaan secara adil.' },
        { title: 'Barat', subtitle: 'Mondragon (€11B+), Fonterra ($20B+), Rabobank ($70B+)', desc: 'Bukti nyata koperasi global: Mondragon Spanyol, Fonterra Selandia Baru, Rabobank Belanda.' },
        { title: 'Cina', subtitle: 'TVE, Gong Xiao He', desc: 'Township and Village Enterprises mendorong pertumbuhan ekonomi desa Tiongkok secara masif.' },
        { title: 'Afrika', subtitle: 'Ubuntu, Rotating Savings', desc: 'Filosofi Ubuntu dan sistem tabung bergilir menunjukkan kekuatan kebersamaan di komunitas Afrika.' },
        { title: 'India', subtitle: 'SHG, Amul Cooperativa', desc: 'Self-Help Groups dan koperasi Amul menjadi bukti kekuatan kolektif dalam mengubah ekonomi rakyat.' },
      ],
    },
    {
      type: 'list',
      title: '5 Prinsip Fundamental Pendiri',
      items: [
        { title: 'Rakyat Pertama, Selalu', desc: 'Setiap keputusan harus dimulai dari pertanyaan: "Apakah ini terbaik untuk rakyat?"' },
        { title: 'Kita Bangun Bersama, Bukan Untuk Kita', desc: 'KNBMP adalah milik bersama — bukan milik segelintir pendiri atau investor.' },
        { title: 'Sistem yang Membangun, Bukan Mengandungkan', desc: 'Infrastruktur harus memberdayakan, bukan memenjarakan rakyat dalam ketergantungan.' },
        { title: 'Kecil-kecil Dulu, Lalu Bangun Sambil Berjalan', desc: 'Mulai dari skala terkecil yang bisa ditangani, lalu berkembang secara organik.' },
        { title: 'Dunia Sudah Cukup Baik, Kita Cuma Perlu Menggabungkan', desc: 'Kebijaksanaan sudah tersebar di seluruh penjuru dunia — tugas kita adalah menggabungkannya.' },
      ],
    },
    {
      type: 'footer-quote',
      text: 'Kami tidak memulai dari nol — kami memulai dari akar yang telah tertanam selama berabad-abad.',
    },
  ],
}

function PillarDetailPage03() {
  return <SpecialDocumentPage data={pga03Data} />
}

// ═══════════════════════════════════════════════════════════════
// PGA-04: Sejarah & Luka yang Menyembuhkan (Story of Origin)
// ═══════════════════════════════════════════════════════════════
const pga04Data: SDData = {
  pgaCode: 'PGA-04',
  title: 'Sejarah & Luka yang Menyembuhkan',
  subtitle: 'Story of Origin / Narrative',
  badge: 'FOUNDATIONAL NARRATIVE — Akar Sejarah KNBMP',
  badgeType: 'warning',
  footerLabel: 'PGA-04 · 4/72 · ◆ Identity & Civilization',
  footerSub: 'Story of Origin / Narrative',
  sections: [
    {
      type: 'quote',
      text: 'Sistem yang tidak adil bisa diubah — bukan dengan menghancurkan, melainkan dengan membangun alternatif yang lebih baik.',
    },
    {
      type: 'cards',
      title: '3 Wajah yang Dikhianati Sistem',
      items: [
        { title: 'Pak Hasan', subtitle: '52 tahun, Petani Kopi Bromo', metric: 'Rp12.000/kg vs Rp250.000/kg', desc: 'Kopi yang ditanam dengan tangan di lereng Bromo dijual Rp12.000/kg, sementara di pasar internasional harganya Rp250.000/kg. Enam puluh persen nilai hilang di tangan perantara.' },
        { title: 'Pak Jusuf', subtitle: '45 tahun, Nelayan Takalar', metric: 'Rp1.5M/bulan, 40% untuk bahan bakar', desc: 'Penghasilan Rp1.5 juta per bulan, tidak ada cold chain, 40% habis untuk bahan bakar. Ikan hasil tangkapan harus dijual murah sebelum membusuk.' },
        { title: 'Bu Ratna', subtitle: '38 tahun, Wirausaha Kupang', metric: 'Pinjaman lintah darat 20%/bulan', desc: 'Terjebak utang pinjaman lintah darat dengan bunga 20% per bulan. Kemiri yang diproduksi tidak bisa mencapai pasar yang membayar harga adil.' },
      ],
    },
    {
      type: 'list',
      title: '6 Rantai Penindasan Struktural',
      items: [
        { title: 'Rantai Pasok Tidak Adil', desc: 'Perantara menguasai 40-60% nilai produk dari petani ke konsumen akhir.' },
        { title: 'Akses Pasar Terbatas', desc: 'UMKM tidak punya akses ke pasar modern, ekspor, dan distribusi nasional.' },
        { title: 'Eksploitasi Pembiayaan', desc: 'Pinjaman liar dengan bunga mencekik. Bank tidak melayani UMKM kecil.' },
        { title: 'Ketergantungan Impor', desc: 'Produk rakyat kalah bersaing dengan barang impor murah bersubsidi.' },
        { title: 'Digital Divide', desc: 'Teknologi digital tidak menjangkau desa — yang paling butuh justru terakhir dapat.' },
        { title: 'Birokrasi Mematikan', desc: 'Perizinan rumit, regulasi tidak ramah UMKM, korupsi di setiap level.' },
      ],
    },
    {
      type: 'timeline',
      title: 'Evolusi KNBMP',
      items: [
        { year: '2016', title: 'bisnisPPP didirikan', desc: 'Platform digital pertama untuk ekonomi rakyat mulai dikembangkan.' },
        { year: '2018', title: 'Pengamatan Lapangan', desc: 'Observasi langsung di Jawa Timur dan NTT — menyaksikan kondisi nyata petani dan nelayan.' },
        { year: '2020', title: 'JP3 Lahir', desc: 'Platform Jaringan Pangan & Pemberdayaan Petani lahir sebagai respons terhadap COVID-19.' },
        { year: '2022', title: 'Platform Digital Berkembang', desc: 'Ekosistem digital diperluas — marketplace, logistik, dan pembayaran terintegrasi.' },
        { year: '2024', title: 'AD/ART Super Final v7', desc: 'Dokumen konstitusi KNBMP disempurnakan ke versi final melalui proses deliberatif.' },
        { year: '21 Maret 2026', title: 'KNBMP Resmi Didirikan', desc: '17 pendiri menandatangani pendirian KNBMP — lahir dari rakyat, untuk rakyat.' },
      ],
    },
    {
      type: 'cards',
      title: '4 Identitas Pendiri',
      items: [
        { title: 'Gugun Gunara', subtitle: 'Bisnis-Negara', metric: 'Dominan', desc: 'Sang arsitek bisnis yang merancang model ekonomi KNBMP dengan presisi dan ambisi global.' },
        { title: 'Muhammad Lutfi Azmi', subtitle: 'Ruhani-Ilmiah', metric: 'Sekunder', desc: 'Jiwa spiritual dan intelektual yang memberikan fondasi nilai dan etika pada gerakan ini.' },
        { title: 'Prabu Danling', subtitle: 'Visi Peradaban', metric: 'Tersembunyi', desc: 'Visi besar yang melihat KNBMP bukan sekadar koperasi, tapi peradaban baru.' },
        { title: 'Santri Angon', subtitle: 'Kemanusiaan', metric: 'Tersembunyi', desc: 'Nurani kemanusiaan yang memastikan setiap langkah KNBMP menyentuh kehidupan nyata.' },
      ],
    },
    {
      type: 'text',
      emphasis: true,
      content: 'Dua inovasi kunci yang membedakan KNBMP: Pentagon Kedaulatan (5 KPA × 20% = 100% kepemilikan rakyat) dan Invisible Dues (pendapatan dari transaksi yang otomatis mengalir ke seluruh ekosistem tanpa membebani anggota).',
    },
    {
      type: 'cards',
      title: 'Visi 2045: Transformasi Nyata',
      items: [
        { title: 'Pak Hasan', subtitle: 'Petani Kopi Bromo', metric: 'Income 3x lipat', desc: 'Dari Rp12.000/kg menjadi direct-to-consumer dengan margin yang adil.' },
        { title: 'Pak Jusuf', subtitle: 'Nelayan Takalar', metric: 'Rp1.5M → Rp4.5M', desc: 'Cold chain terintegrasi, akses pasar luas, bahan bakar lebih efisien.' },
        { title: 'Bu Ratna', subtitle: 'Wirausaha Kupang', metric: 'Rp2M → Rp8M', desc: 'Terbebas dari lintah darat, akses pembiayaan adil, pasar jauh lebih luas.' },
      ],
    },
    {
      type: 'footer-quote',
      text: 'Dari luka yang sama, kami membangun obat yang sama — untuk rakyat.',
    },
  ],
}

function PillarDetailPage04() {
  return <SpecialDocumentPage data={pga04Data} />
}

// ═══════════════════════════════════════════════════════════════
// PGA-05: Sepuluh Pilar Etika Absolut (Core Values Charter)
// ═══════════════════════════════════════════════════════════════
const pga05Data: SDData = {
  pgaCode: 'PGA-05',
  title: 'Sepuluh Pilar Etika Absolut',
  subtitle: 'Core Values Charter',
  badge: 'ETIKA ABSOLUT — Tidak Bisa Dinegosiasi',
  badgeType: 'warning',
  footerLabel: 'PGA-05 · 5/72 · ◆ Identity & Civilization',
  footerSub: 'Core Values Charter',
  sections: [
    {
      type: 'cards',
      title: '10 Nilai Inti',
      cols: 2,
      items: [
        { title: '1. AMANAH', subtitle: 'Trust', desc: 'Kepercayaan yang harus dijaga di 4 dimensi: terhadap anggota, mitra, masyarakat, dan diri sendiri.', metric: '4 Dimensi' },
        { title: '2. KEADILAN', subtitle: 'Justice', desc: 'Keadilan distributif, prosedural, interaksional, dan retributif — menyeluruh dan tidak diskriminatif.', metric: '4 Dimensi' },
        { title: '3. TRANSPARANSI', subtitle: 'Transparency', desc: 'Imunitas terhadap korupsi. Setiap rupiah dan setiap keputusan harus bisa diakses oleh anggota.', metric: 'Anti-Korupsi' },
        { title: '4. KEMASLAHATAN', subtitle: 'Beneficence', desc: 'Filter tertinggi untuk setiap keputusan: "Apakah ini membawa kemaslahatan terbesar untuk semua?"', metric: 'Filter Tertinggi' },
        { title: '5. KESEDERHANAAN', subtitle: 'Simplicity', desc: 'Besar tanpa berlebihan. Kekayaan yang didistribusikan, bukan ditumpuk. Hidup sederhana, berkarya luar biasa.', metric: 'Zero Waste' },
        { title: '6. KEBERSAMAAN', subtitle: 'Collectivism', desc: 'Kebersamaan yang mengangkat — bukan yang menarik ke bawah. Satu untuk semua, semua untuk satu.', metric: '1 untuk Semua' },
        { title: '7. KELESTARIAN', subtitle: 'Sustainability', desc: 'Setiap keputusan harus mempertimbangkan dampak jangka panjang — untuk anak cucu kita.', metric: 'Generasi Mendatang' },
        { title: '8. KEBERANIAN', subtitle: 'Courage', desc: 'Keberanian yang membangun — berani mengambil keputusan sulit, berani berubah, berani bertanggung jawab.', metric: 'Prinsip Non-Kompromi' },
        { title: '9. KEJUJURAN', subtitle: 'Integrity', desc: 'Tidak ada kompromi dengan kejujuran. Satu kebohongan bisa meruntuhkan seluruh ekosistem kepercayaan.', metric: 'Zero Tolerance' },
        { title: '10. KEMANDIRIAN', subtitle: 'Independence', desc: 'Kemandirian berdaulat — tidak tergantung pada pihak manapun. Kekuatan dari dalam, bukan dari luar.', metric: 'Kedaulatan Penuh' },
      ],
    },
    {
      type: 'footer-quote',
      text: 'Nilai adalah apa yang tetap bertahan ketika segalanya berubah.',
    },
  ],
}

function PillarDetailPage05() {
  return <SpecialDocumentPage data={pga05Data} />
}

// ═══════════════════════════════════════════════════════════════
// PGA-06: Antitesis Sistem Global (Identity & Positioning)
// ═══════════════════════════════════════════════════════════════
const pga06Data: SDData = {
  pgaCode: 'PGA-06',
  title: 'Antitesis Sistem Global',
  subtitle: 'Identity & Positioning Paper',
  badge: 'POSITIONING PAPER — Identitas & Diferensiasi',
  badgeType: 'info',
  footerLabel: 'PGA-06 · 6/72 · ◆ Identity & Civilization',
  footerSub: 'Identity & Positioning Paper',
  sections: [
    {
      type: 'text',
      emphasis: true,
      content: 'KNBMP bukan sekadar alternatif — ia adalah antitesis. Bukan kapitalisme, bukan sosialisme, tetapi kedaulatan koperatif — model ke-3 untuk Indonesia dan dunia.',
    },
    {
      type: 'comparison',
      title: '5 Axis Diferensiasi',
      compHeaders: ['Axis', 'Oligarki/Kapitalis', 'Sosialisme/Negara', 'KNBMP'],
      compRows: [
        [
          { text: 'Governance' },
          { text: 'Oligarki — kekuasaan segelintir' },
          { text: 'Sentralisasi negara' },
          { text: 'Pentagon — 5 KPA demokratis', highlight: true },
        ],
        [
          { text: 'Ownership' },
          { text: 'Pemegang saham & institusi' },
          { text: 'Negara/birokrasi' },
          { text: 'Multipihak — rakyat berdaulat', highlight: true },
        ],
        [
          { text: 'Purpose' },
          { text: 'Profit maksimum' },
          { text: 'Ideologi partai/negara' },
          { text: 'Kemaslahatan seluruh anggota', highlight: true },
        ],
        [
          { text: 'Technology' },
          { text: 'Eksploitasi data rakyat' },
          { text: 'Kontrol & pengawasan' },
          { text: 'Kedaulatan Digital — data rakyat', highlight: true },
        ],
        [
          { text: 'Scale' },
          { text: 'Monopoli & konsentrasi' },
          { text: 'Sentralisasi birokrasi' },
          { text: 'Desa-first — dari bawah ke atas', highlight: true },
        ],
      ],
    },
    {
      type: 'text',
      emphasis: true,
      content: 'KNBMP = Model Ke-3. Neither capitalism nor socialism, but cooperative sovereignty — kedaulatan yang lahir dari kerjasama, bukan kompetisi atau kontrol.',
    },
    {
      type: 'cards',
      title: '4 Identitas Terintegrasi',
      items: [
        { title: 'Gugun Gunara', subtitle: 'Bisnis-Negara', desc: 'Arsitek model bisnis yang memadukan logika korporat dengan naluri negara — memastikan setiap strategi menguntungkan rakyat.' },
        { title: 'Muhammad Lutfi Azmi', subtitle: 'Ruhani-Ilmiah', desc: 'Fondasi moral dan intelektual yang memastikan KNBMP selalu berpijak pada nilai-nilai etika absolut.' },
        { title: 'Prabu Danling', subtitle: 'Visi Peradaban', desc: 'Visi jangka panjang yang melihat KNBMP sebagai kontribusi Indonesia bagi peradaban dunia.' },
        { title: 'Santri Angon', subtitle: 'Kemanusiaan', desc: 'Jiwa kemanusiaan yang menjadi kompas — memastikan tidak ada satupun yang tertinggal.' },
      ],
    },
    {
      type: 'footer-quote',
      text: 'Kritik tanpa alternatif adalah keluhan; alternatif tanpa aksi adalah ilusi.',
    },
  ],
}

function PillarDetailPage06() {
  return <SpecialDocumentPage data={pga06Data} />
}

// ═══════════════════════════════════════════════════════════════
// PGA-07: Deklarasi Pembebasan Ekonomi (Manifesto)
// ═══════════════════════════════════════════════════════════════
const pga07Data: SDData = {
  pgaCode: 'PGA-07',
  title: 'Deklarasi Pembebasan Ekonomi',
  subtitle: 'Manifesto / Declaration of Purpose',
  badge: 'MANIFESTO — Deklarasi Resmi KNBMP',
  badgeType: 'warning',
  footerLabel: 'PGA-07 · 7/72 · ◆ Identity & Civilization',
  footerSub: 'Manifesto / Declaration of Purpose',
  sections: [
    {
      type: 'declamation',
      lines: [
        'DEKLARASI PEMBEBASAN EKONOMI RAKYAT',
        'Kami, 17 pendiri Koperasi Nusantara Bersatu Mandiri Prima,',
        'dengan ini menyatakan bahwa setiap manusia berhak atas',
        'kehidupan ekonomi yang berdaulat, adil, dan bermartabat.',
      ],
    },
    {
      type: 'list',
      title: '10 Keyakinan Kami',
      items: [
        { title: 'Tentang Rakyat', desc: 'Setiap manusia berhak hidup bermartabat — tanpa terkecuali.' },
        { title: 'Tentang Ekonomi', desc: 'Ekonomi harus berputar di sekitar manusia — bukan sebaliknya.' },
        { title: 'Tentang Demokrasi', desc: '1 Anggota = 1 Suara. Kedaulatan nyata, bukan sekadar simbol.' },
        { title: 'Tentang Teknologi', desc: 'Teknologi harus membebaskan — bukan menguasai atau mengeksploitasi.' },
        { title: 'Tentang Keadilan', desc: 'Keadilan adalah kesamaan kesempatan — bukan kesamaan hasil.' },
        { title: 'Tentang Kemandirian', desc: 'Kedaulatan digital = keamanan nasional. Data rakyat harus dimiliki rakyat.' },
        { title: 'Tentang Kebersamaan', desc: 'Gotong royong bukan warisan masa lalu — ia adalah model masa depan.' },
        { title: 'Tentang Kelestarian', desc: 'Generasi mendatang punya hak atas sumber daya yang kita warisi.' },
        { title: 'Tentang Peradaban', desc: 'Indonesia punya sesuatu yang sangat berharga untuk ditawarkan kepada dunia.' },
        { title: 'Tentang Masa Depan', desc: 'Kita tidak menunggu perubahan — kita membangunnya, mulai hari ini.' },
      ],
    },
    {
      type: 'cards',
      title: 'Komitmen Kami',
      items: [
        { title: 'Untuk Anggota', desc: 'Akses adil ke pasar, modal, teknologi, dan pendidikan. SHU yang didistribusikan secara transparan.' },
        { title: 'Untuk Masyarakat', desc: 'Membangun ekosistem yang mengangkat komunitas sekitar — bukan mengeksploitasinya.' },
        { title: 'Untuk Bangsa', desc: 'Mengurangi kesenjangan, memperkuat kedaulatan ekonomi, dan memajukan desa-desa Indonesia.' },
        { title: 'Untuk Peradaban', desc: 'Membuktikan bahwa model ke-3 — kedaulatan koperatif — bisa bekerja pada skala global.' },
      ],
    },
    {
      type: 'list',
      title: 'Yang Kami Tolak',
      items: [
        { title: 'Eksploitasi Rakyat', desc: 'Segala bentuk sistem yang mengambil keuntungan dari ketidakberdayaan rakyat.' },
        { title: 'Monopoli & Oligarki', desc: 'Konsentrasi kekuatan ekonomi di tangan segelintir pihak.' },
        { title: 'Korupsi & Opasitas', desc: 'Setiap bentuk ketidaktransparanan yang merugikan anggota dan masyarakat.' },
        { title: 'Ketergantungan Asing', desc: 'Ketergantungan berlebihan pada modal, teknologi, dan kebijakan asing.' },
        { title: 'Digital Divide', desc: 'Pengecualian rakyat dari manfaat revolusi digital.' },
        { title: 'Inertia & Keluhan Tanpa Aksi', desc: 'Mengeluh tanpa membangun alternatif adalah pengkhianatan terhadap rakyat.' },
      ],
    },
    {
      type: 'text',
      content: 'Ditandatangani oleh 17 Pendiri KNBMP pada 21 Maret 2026 di Indonesia.',
    },
    {
      type: 'stats',
      statsItems: [
        { value: '10M', label: 'Anggota Target' },
        { value: '83.763', label: 'Desa' },
        { value: 'Rp2.000T', label: 'Target Transaksi' },
      ],
    },
  ],
}

function PillarDetailPage07() {
  return <SpecialDocumentPage data={pga07Data} />
}

// ═══════════════════════════════════════════════════════════════
// PGA-08: Arsitektur Konseptual Makro (Whitepaper)
// ═══════════════════════════════════════════════════════════════
const pga08Data: SDData = {
  pgaCode: 'PGA-08',
  title: 'Arsitektur Konseptual Makro',
  subtitle: 'Whitepaper — Concept Paper',
  badge: 'WHITEPAPER — Arsitektur Organisasi',
  badgeType: 'info',
  footerLabel: 'PGA-08 · 8/72 · ◆ Identity & Civilization',
  footerSub: 'Whitepaper — Concept Paper',
  sections: [
    {
      type: 'stats',
      statsItems: [
        { value: 'KSU', label: 'Legal Entity' },
        { value: 'ISO 27001', label: 'Security Standard' },
        { value: 'OJK', label: 'Regulatory Oversight' },
        { value: '17', label: 'Founders' },
      ],
    },
    {
      type: 'text',
      emphasis: true,
      content: 'Dual-Entity Model: JE-P3 (Jakarta Enterprise — Strategy & Policy) + KNMP (Koperasi Nusantara Mandiri Prima — Operations). Keduanya terhubung melalui Joint Strategic Committee yang memastikan sinergi strategis.',
    },
    {
      type: 'cards',
      title: '4 Inovasi Fundamental',
      items: [
        { title: 'Pentagon Kedaulatan', subtitle: '5 KPA × 20%', desc: '5 Kelompok Perwakilan Anggota yang mewakili seluruh spektrum ekonomi — masing-masing 20% suara, total 100% kepemilikan rakyat.', metric: 'Governance Revolution' },
        { title: '7-Tier Membership', subtitle: 'Petani GRATIS → KORNAS Rp200M', desc: 'Keanggotaan bertingkat dari gratis untuk petani/nelayan hingga Rp200M untuk korporasi nasional — inklusif namun bertanggung jawab.', metric: 'Inclusive by Design' },
        { title: '6 Unit Usaha Terintegrasi', subtitle: 'Ekosistem Lengkap', desc: 'Marketplace, Logistik, Pembayaran, Asuransi, Pendidikan, dan Investasi — terintegrasi dalam satu platform.', metric: 'Full Ecosystem' },
        { title: 'Doktrin Invisible Dues', subtitle: 'Pendapatan Otomatis', desc: 'Pendapatan dari transaksi yang otomatis mengalir ke seluruh ekosistem — tanpa membebani anggota dengan iuran langsung.', metric: 'Self-Sustaining' },
      ],
    },
    {
      type: 'table',
      title: 'KPA Table',
      headers: ['KPA', 'Segmen', 'Bobot', 'Iuran'],
      rows: [
        ['KPA-1', 'Produsen & Pekerja', '20%', 'Rp100.000'],
        ['KPA-2', 'Konsumen Umum', '20%', 'Rp100.000'],
        ['KPA-3', 'Abdi Negara', '20%', 'Rp250.000'],
        ['KPA-4', 'Entitas Bisnis', '20%', 'Rp5.000.000'],
        ['KPA-5', 'Pemodal & Investor', '20%', 'Rp50M — Rp250M'],
      ],
    },
    {
      type: 'table',
      title: '7-Tier Membership',
      headers: ['Tier', 'Segmen', 'Iuran', 'Hak Suara'],
      rows: [
        ['T1', 'Petani', 'GRATIS', '1 suara'],
        ['T2', 'Nelayan', 'GRATIS', '1 suara'],
        ['T3', 'UMKM', 'Rp50.000', '1 suara'],
        ['T4', 'Profesional', 'Rp200.000', '1 suara'],
        ['T5', 'KOPERASI', 'Rp1.000.000', '1 suara'],
        ['T6', 'KORWIL', 'Rp50.000.000', '1 suara'],
        ['T7', 'KORNAS', 'Rp200.000.000', '1 suara'],
      ],
    },
    {
      type: 'timeline',
      title: '3 Fase Implementasi',
      items: [
        { year: 'FONDASI (2026-2030)', title: '1M Anggota, 10K Desa', desc: 'Membangun fondasi teknologi, merekrut anggota pertama, membuktikan model di skala kecil.' },
        { year: 'SKALA (2030-2035)', title: '5M Anggota, 50K Desa, ASEAN', desc: 'Ekspansi regional, integrasi lintas sektor, masuk pasar ASEAN.' },
        { year: 'MATURASI (2035-2050)', title: '10M Anggota, 83.763 Desa', desc: 'Setara Mondragon — menjadi kekuatan ekonomi global yang berdaulat.' },
      ],
    },
    {
      type: 'list',
      title: '6 Sumber Pendapatan',
      items: [
        { title: 'Iuran Anggota', desc: 'Kontribusi bertingkat dari 7 tier keanggotaan — inklusif dan berkeadilan.' },
        { title: 'JP3 Pay', desc: 'Transaction fees dari pembayaran digital yang mengalir ke ekosistem.' },
        { title: 'Marketplace', desc: 'Komisi dari transaksi marketplace B2B dan B2C.' },
        { title: 'Logistik', desc: 'Service fees dari jaringan logistik terintegrasi.' },
        { title: 'Academy', desc: 'Pendapatan dari program pendidikan dan pelatihan anggota.' },
        { title: 'Investasi & Dana', desc: 'Pengelolaan dana anggota dan investasi strategis jangka panjang.' },
      ],
    },
    {
      type: 'footer-quote',
      text: 'Ekonomi yang berdaulat dimulai dari langkah Anda.',
    },
  ],
}

function PillarDetailPage08() {
  return <SpecialDocumentPage data={pga08Data} />
}

function PillarDetailPage({ pillar, domain }: { pillar: Pillar; domain: Domain }) {
  const badgeLabel = pillar.badge === 'foundation' ? 'Fondasi' : pillar.badge === 'strategic' ? 'Strategis' : 'Operasional'
  const scrollRef = useRef<HTMLDivElement>(null)

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
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8 pb-14 sm:pb-16 relative z-10"
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
      <ScrollIndicator containerRef={scrollRef} />
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
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 overflow-hidden"
      style={{ backgroundColor: DARK_BG }}>
      {/* AI-generated background */}
      <motion.div className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}>
        <img src="/backcover-bg.png" alt="" className="w-full h-full object-cover"
          style={{ opacity: 0.2, mixBlendMode: 'screen' }} />
      </motion.div>
      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: `linear-gradient(180deg, rgba(26,24,20,0.6) 0%, rgba(26,24,20,0.85) 50%, rgba(26,24,20,0.95) 100%)` }} />

      <GoldenParticles />
      <BatikWatermark />
      <div className="absolute font-[family-name:var(--font-heading)] font-bold pointer-events-none select-none"
        style={{ fontSize: 'clamp(60px, 15vw, 140px)', color: `${BURGUNDY}06`, letterSpacing: '0.1em', lineHeight: 1, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        MERDEKA
      </div>

      {/* Gold border */}
      <motion.div className="absolute pointer-events-none z-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
        style={{ inset: '20px', border: '1px solid rgba(197,160,89,0.15)', borderRadius: 4 }} />

      <motion.div className="flex flex-col items-center gap-6 relative z-10"
        variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeSlideUp} custom={0}><GoldDivider color={GOLD} /></motion.div>
        <motion.p className="font-[family-name:var(--font-heading)] text-lg sm:text-xl italic"
          style={{ color: `${GOLD}CC` }} variants={fadeSlideUp} custom={1}>
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
        <motion.div variants={fadeSlideUp} custom={4}><GoldDivider color={GOLD} /></motion.div>
        <motion.div className="flex items-center gap-2 mt-2" variants={fadeSlideUp} custom={5}>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${GOLD}30` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${GOLD}30` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: `${GOLD}40` }} />
          <div className="w-3 h-px" style={{ backgroundColor: `${GOLD}30` }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${GOLD}30` }} />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RENDER PAGE DISPATCHER
// ═══════════════════════════════════════════════════════════════
function renderPage(page: BookPage, index: number, total: number, domainsData: Domain[]) {
  const skipPageNumber = page.type === 'cover' || page.type === 'back-cover'

  const content = (() => {
    switch (page.type) {
      case 'cover': return <CoverPage key={`cover-${index}`} />
      case 'kata-pengantar': return <KataPengantarPage key={`kp-${page.part}`} part={page.part} />
      case 'mukadimah': return <MukadimahPage key={`muk-${page.part}`} part={page.part} />
      case 'toc-page': return <TocPage key={`toc-${page.tocPage}`} tocPage={page.tocPage} domains={domainsData} />
      case 'pillar-detail':
        return page.pillar.id === 1
          ? <PillarDetailPage01 key={`pga01`} />
          : page.pillar.id === 2
          ? <PillarDetailPage02 key={`pga02`} />
          : page.pillar.id === 3
          ? <PillarDetailPage03 key={`pga03`} />
          : page.pillar.id === 4
          ? <PillarDetailPage04 key={`pga04`} />
          : page.pillar.id === 5
          ? <PillarDetailPage05 key={`pga05`} />
          : page.pillar.id === 6
          ? <PillarDetailPage06 key={`pga06`} />
          : page.pillar.id === 7
          ? <PillarDetailPage07 key={`pga07`} />
          : page.pillar.id === 8
          ? <PillarDetailPage08 key={`pga08`} />
          : page.pillar.id === 13
          ? <PillarDetailPage13 key={`pga13`} domain={page.domain} />
          : <PillarDetailPage key={`p-${page.pillar.id}`} pillar={page.pillar} domain={page.domain} />
      case 'philosophy': return <PhilosophyPage key={`phil-${index}`} />
      case 'covenant': return <CovenantPage key={`cov-${index}`} />
      case 'back-cover': return <BackCoverPage key={`bc-${index}`} />
      default: return null
    }
  })()

  if (skipPageNumber) return content
  return <>{content}<PageNumber index={index} total={total} /></>
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
  // Always start false on both server & client to avoid hydration mismatch.
  // The DigitalUnveiling component itself checks sessionStorage and fires
  // onComplete immediately if the ritual was already completed, so the user
  // is never stuck re-doing the ritual after a page reload.
  const [ritualComplete, setRitualComplete] = useState(false)
  const { domains: liveDomains, isLive, lastFetched, refresh: refreshFlipbookData } = useFlipbookData()

  const handleRitualComplete = useCallback(() => {
    setRitualComplete(true)
    try { sessionStorage.setItem('knbmp-ritual-complete', 'true') } catch { /* quota */ }
  }, [])

  const handleLockKitab = useCallback(() => {
    setRitualComplete(false)
    setCurrentLeaf(0)
    try { sessionStorage.removeItem('knbmp-ritual-complete') } catch { /* quota */ }
  }, [])

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const playFlipSound = usePageFlipSound()

  const bookPages = useMemo<BookPage[]>(() => [
    { type: 'cover' },
    { type: 'kata-pengantar' as const, part: 1 },
    { type: 'kata-pengantar' as const, part: 2 },
    { type: 'kata-pengantar' as const, part: 3 },
    { type: 'mukadimah' as const, part: 1 },
    { type: 'mukadimah' as const, part: 2 },
    { type: 'mukadimah' as const, part: 3 },
    { type: 'mukadimah' as const, part: 4 },
    { type: 'kata-pengantar' as const, part: 4 },
    ...liveDomains.map((_, i) => ({ type: 'toc-page' as const, tocPage: i })),
    ...liveDomains.flatMap(domain => domain.pillars.map(pillar => ({ type: 'pillar-detail' as const, pillar, domain }))),
    { type: 'philosophy' as const },
    { type: 'covenant' as const },
    { type: 'back-cover' as const },
  ], [liveDomains])

  const totalPages = bookPages.length

  useEffect(() => { const t = setTimeout(() => setShowHint(false), 5000); return () => clearTimeout(t) }, [])

  const currentPageInfo = useMemo(() => {
    const page = bookPages[currentLeaf]
    if (!page) return { domainColor: GOLD, domainName: '', pillarCode: '' }
    switch (page.type) {
      case 'cover': return { domainColor: GOLD, domainName: 'Sampul', pillarCode: '' }
      case 'kata-pengantar': return { domainColor: BURGUNDY, domainName: `Kata Pengantar (${page.part}/${KP_PARTS})`, pillarCode: '' }
      case 'mukadimah': return { domainColor: GOLD, domainName: `Mukadimah (${page.part}/${MUKADIMAH_PARTS})`, pillarCode: '' }
      case 'toc-page': return { domainColor: BURGUNDY, domainName: `Daftar Isi (${page.tocPage + 1}/${liveDomains.length})`, pillarCode: '' }
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

  // ═══ Ritual: Digital Unveiling Experience ═══
  if (!ritualComplete) {
    return <DigitalUnveiling onComplete={handleRitualComplete} />
  }

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
          {/* Gold page edge effect */}
          <div className="absolute top-0 right-0 bottom-0 w-[3px] z-50 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(197,160,89,0.15) 20%, rgba(197,160,89,0.25) 50%, rgba(197,160,89,0.15) 80%, transparent)' }} />
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div key={index} className="absolute inset-0 bg-white overflow-hidden book-spine-shadow"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped ? '-5px 0 20px rgba(0,0,0,0.15)' : isCurrent ? '8px 0 30px rgba(0,0,0,0.25)' : '3px 0 10px rgba(0,0,0,0.15)',
                }}>
                {renderPage(page, index, totalPages, liveDomains)}
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
          {/* Gold page edge effect */}
          <div className="absolute top-0 right-0 bottom-0 w-[3px] z-50 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(197,160,89,0.15) 20%, rgba(197,160,89,0.25) 50%, rgba(197,160,89,0.15) 80%, transparent)' }} />
          {bookPages.map((page, index) => {
            const isFlipped = index <= currentLeaf
            const isCurrent = index === currentLeaf
            return (
              <div key={index} className="absolute inset-0 bg-white overflow-hidden book-spine-shadow"
                style={{
                  transformOrigin: 'left center',
                  transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.85s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.85s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  zIndex: getZIndex(index, currentLeaf, totalPages),
                  boxShadow: isFlipped ? '-3px 0 10px rgba(0,0,0,0.15)' : isCurrent ? '4px 0 15px rgba(0,0,0,0.2)' : '2px 0 5px rgba(0,0,0,0.1)',
                }}>
                {renderPage(page, index, totalPages, liveDomains)}
              </div>
            )
          })}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          style={{ backgroundColor: DARK_BG }}>
          {/* Subtle gold separator line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.2) 30%, rgba(197,160,89,0.2) 70%, transparent)' }} />
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
                <p className="font-[family-name:var(--font-heading)] text-xs tracking-[0.15em]"
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
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2">
        {/* Subtle gold separator line */}
        <div className="w-48 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.25) 30%, rgba(197,160,89,0.25) 70%, transparent)' }} />
        <motion.div className="flex items-center gap-3 px-6 py-2.5 rounded-full"
          style={{ color: '#A09385', backgroundColor: '#1A1814CC', border: '1px solid #2A2520' }}
          layout>
          <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
            animate={{ backgroundColor: currentPageInfo.domainColor || GOLD }}
            transition={{ duration: 0.5 }} />
          <AnimatePresence mode="wait">
            <motion.div key={displayPage} className="text-center min-w-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {currentPageInfo.pillarCode && (
                <p className="font-[family-name:var(--font-heading)] text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: currentPageInfo.domainColor }}>{currentPageInfo.pillarCode}</p>
              )}
              <p className="font-[family-name:var(--font-heading)] text-sm tracking-[0.15em]">{displayPage} / {totalPages}</p>
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
          <div className="w-px h-5" style={{ backgroundColor: '#3A3530' }} />
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleLockKitab() }}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ color: '#6B5E50' }}
            whileHover={{ scale: 1.15, color: '#C5A059' }} whileTap={{ scale: 0.9 }}
            aria-label="Kunci Kitab">
            <Lock className="w-3.5 h-3.5" />
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

      {/* ═══ Admin Panel ═══ */}
      <AdminTrigger />
      <AdminPanel />
    </main>
  )
}
