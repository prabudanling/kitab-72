'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════
// MERAH PUTIH SCREENSAVER — THE BEST SCREENSAVER EVER
// ═══════════════════════════════════════════════════════════════
// Indonesia's flag colors brought to life as a living, breathing
// cinematic experience. Red (FF0000) and White (FFFFFF) flow,
// dance, and pulse in perfect harmony — a tribute to Merdeka.
// ═══════════════════════════════════════════════════════════════

const MERAH = '#FF0000'
const MERAH_DARK = '#CC0000'
const MERAH_DEEP = '#8B0000'
const PUTIH = '#FFFFFF'
const PUTIH_WARM = '#FFF8F0'
const IDLE_TIMEOUT = 90 // seconds
const IDLE_TIMEOUT_MOBILE = 120 // seconds — mobile users interact more frequently

// ── Mobile Detection Hook ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ── Canvas Particle System ──
interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; opacity: number; fadeDir: number
  color: string; glow: boolean; trail: { x: number; y: number }[]
  life: number; maxLife: number
}

function MerahPutihCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mobile = isMobile
    const PARTICLE_COUNT = mobile ? 20 : 150
    const CONNECT_LIMIT = mobile ? 3 : 10

    let W = 0, H = 0
    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W * 2
      canvas.height = H * 2
      ctx.scale(2, 2)
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles — mix of red and white
    const createParticle = (randomY = true): Particle => {
      const isRed = Math.random() > 0.4
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : H + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.15),
        size: Math.random() * 2.8 + 0.4,
        opacity: Math.random() * 0.6 + 0.1,
        fadeDir: (Math.random() * 0.005 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        color: isRed ? MERAH : PUTIH,
        glow: mobile ? false : Math.random() > 0.5,
        trail: [],
        life: 0,
        maxLife: Math.random() * 600 + 200,
      }
    }

    // Initialize particles (20 on mobile, 150 on desktop)
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle(true))
    particlesRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, W, H)

      // Background: subtle flowing gradient that shifts over time (skip on mobile for performance)
      if (!mobile) {
        const time = Date.now() * 0.0003
        const grd = ctx.createRadialGradient(
          W / 2 + Math.sin(time) * W * 0.2,
          H / 2 + Math.cos(time * 0.7) * H * 0.2,
          0,
          W / 2, H / 2, W * 0.7
        )
        grd.addColorStop(0, 'rgba(139, 0, 0, 0.03)')
        grd.addColorStop(0.5, 'rgba(255, 0, 0, 0.01)')
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, W, H)
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.life++

        // Subtle attraction to mouse
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          p.vx += (dx / dist) * 0.003
          p.vy += (dy / dist) * 0.003
        }

        // Gentle sine wave movement
        p.vx += Math.sin(p.life * 0.01 + i) * 0.002
        p.vy -= 0.002 // gentle upward float

        // Damping
        p.vx *= 0.999
        p.vy *= 0.999

        p.x += p.vx
        p.y += p.vy

        // Trail (skip on mobile)
        if (!mobile) {
          p.trail.push({ x: p.x, y: p.y })
          if (p.trail.length > 8) p.trail.shift()
        }

        // Fade
        p.opacity += p.fadeDir
        if (p.opacity >= 0.75) p.fadeDir = -Math.abs(p.fadeDir)
        if (p.opacity <= 0.02 || p.life > p.maxLife) {
          particles[i] = createParticle(false)
          particles[i].x = Math.random() * W
          continue
        }

        // Draw trail
        if (p.trail.length > 1 && p.glow) {
          ctx.beginPath()
          ctx.moveTo(p.trail[0].x, p.trail[0].y)
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y)
          }
          const trailColor = p.color === MERAH ? `rgba(255, 0, 0, ${p.opacity * 0.1})` : `rgba(255, 255, 255, ${p.opacity * 0.08})`
          ctx.strokeStyle = trailColor
          ctx.lineWidth = p.size * 0.4
          ctx.stroke()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color === MERAH
          ? `rgba(255, 0, 0, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()

        // Glow (skipped on mobile — glow disabled above)
        if (p.glow && !mobile) {
          const glowR = p.size * 6
          const ggrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
          ggrd.addColorStop(0, p.color === MERAH
            ? `rgba(255, 0, 0, ${p.opacity * 0.15})`
            : `rgba(255, 255, 255, ${p.opacity * 0.1})`)
          ggrd.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2)
          ctx.fillStyle = ggrd
          ctx.fill()
        }
      }

      // Draw connecting lines between close red particles (reduced on mobile)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.02)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < Math.min(i + CONNECT_LIMIT, particles.length); j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = dx * dx + dy * dy
          if (d < 8000) {
            const alpha = (1 - d / 8000) * 0.04
            ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [isMobile])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// ── Flowing Silk Waves ──
function SilkWaves() {
  const mobile = useIsMobile()
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Wave 1 — Deep red flowing from left (desktop only) */}
      {!mobile && (
        <motion.div
          className="absolute -left-[20%] w-[140%] h-[40%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139,0,0,0.08) 40%, rgba(255,0,0,0.04) 100%)',
            borderRadius: '50% 50% 0 0',
            filter: 'blur(40px)',
          }}
          animate={{
            x: ['-5%', '5%', '-5%'],
            y: ['0%', '8%', '0%'],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Wave 2 — Bright red sweeping (desktop only) */}
      {!mobile && (
        <motion.div
          className="absolute -right-[10%] w-[120%] h-[35%] bottom-[20%]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,0,0,0.06) 0%, rgba(255,0,0,0.02) 60%, transparent 100%)',
            borderRadius: '0 0 50% 50%',
            filter: 'blur(50px)',
          }}
          animate={{
            x: ['5%', '-5%', '5%'],
            y: ['5%', '-3%', '5%'],
            scale: [1.02, 0.98, 1.02],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      )}

      {/* Wave 3 — White silk from bottom */}
      <motion.div
        className="absolute bottom-0 left-[-10%] w-[120%] h-[30%]"
        style={{
          background: 'linear-gradient(0deg, rgba(255,255,255,0.04) 0%, rgba(255,248,240,0.02) 50%, transparent 100%)',
          borderRadius: '50% 50% 0 0',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['-3%', '7%', '-3%'],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Wave 4 — Red pulse from center (desktop only) */}
      {!mobile && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}

// ── Flag Stripe Animation ──
function FlagStripes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.04 }}>
      {/* Animated red and white horizontal stripes — like a fabric blowing in wind */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0"
          style={{
            top: `${i * 5}%`,
            height: '1px',
            backgroundColor: i % 2 === 0 ? MERAH : PUTIH,
            transformOrigin: 'center',
          }}
          animate={{
            scaleX: [0.6, 1.2, 0.6],
            opacity: [0.3, 1, 0.3],
            x: ['-10%', '10%', '-10%'],
          }}
          transition={{
            duration: 8 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}

// ── Garuda Silhouette — SVG outline from particles concept ──
function GarudaSilhouette() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, delay: 1 }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-[45vw] h-[45vw] max-w-[350px] max-h-[350px]"
        style={{ opacity: 0.06 }}
        animate={{
          scale: [1, 1.02, 1],
          rotate: [0, 0.5, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Simplified Garuda silhouette — spread wings */}
        <defs>
          <radialGradient id="garuda-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={MERAH} stopOpacity="0.3" />
            <stop offset="100%" stopColor={MERAH_DEEP} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body */}
        <ellipse cx="100" cy="120" rx="12" ry="20" fill={MERAH} opacity="0.15" />

        {/* Head */}
        <circle cx="100" cy="90" r="10" fill={MERAH} opacity="0.2" />

        {/* Shield on chest */}
        <path d="M100 108 L108 115 L108 125 L100 130 L92 125 L92 115 Z" fill={MERAH} opacity="0.25" />

        {/* Left Wing */}
        <path
          d="M88 110 Q60 85 20 75 Q40 90 35 105 Q50 95 60 100 Q55 110 45 120 Q60 112 70 115 Q65 125 55 135 Q75 122 88 120 Z"
          fill={MERAH} opacity="0.12"
        />

        {/* Right Wing */}
        <path
          d="M112 110 Q140 85 180 75 Q160 90 165 105 Q150 95 140 100 Q145 110 155 120 Q140 112 130 115 Q135 125 145 135 Q125 122 112 120 Z"
          fill={MERAH} opacity="0.12"
        />

        {/* Tail feathers */}
        <path
          d="M95 140 Q85 170 70 185 Q90 175 100 180 Q110 175 130 185 Q115 170 105 140 Z"
          fill={MERAH} opacity="0.1"
        />
      </motion.svg>
    </motion.div>
  )
}

// ── Text Reveals ──
function MerahPutihText() {
  const phrases = [
    'MERDEKA',
    'INDONESIA',
    'MERAH PUTIH',
    'BHINNEKA TUNGGAL IKA',
    '17 AGUSTUS 1945',
    'SATU NUSANTARA',
  ]
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [phrases.length])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={phraseIndex}
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.02 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Main phrase */}
          <motion.h1
            className="text-center px-8"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(3rem, 12vw, 9rem)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.08em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FF0000 50%, #8B0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 4px 30px rgba(255, 0, 0, 0.3))',
            }}
            animate={{
              filter: [
                'drop-shadow(0 4px 30px rgba(255, 0, 0, 0.3))',
                'drop-shadow(0 4px 50px rgba(255, 0, 0, 0.5))',
                'drop-shadow(0 4px 30px rgba(255, 0, 0, 0.3))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {phrases[phraseIndex]}
          </motion.h1>

          {/* Subtitle line */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8, duration: 1.5 }}
          >
            <div className="h-px w-12 sm:w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.5))' }} />
            <span
              className="text-[10px] sm:text-xs tracking-[0.3em] uppercase"
              style={{
                fontFamily: 'var(--font-ui), "DM Sans", system-ui, sans-serif',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              NKRI · 1945 — ∞
            </span>
            <div className="h-px w-12 sm:w-20" style={{ background: 'linear-gradient(90deg, rgba(255,0,0,0.5), transparent)' }} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Pulsing Star (Bintang) ──
function PulsingStar() {
  return (
    <motion.div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" className="w-[60vw] max-w-[500px] opacity-20" fill={MERAH}>
        {/* 5-pointed star */}
        <polygon
          points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"
          fill="none"
          stroke={MERAH}
          strokeWidth="0.3"
          opacity="0.3"
        />
        {/* Inner star */}
        <polygon
          points="50,15 58,37 83,37 63,53 70,78 50,65 30,78 37,53 17,37 42,37"
          fill="none"
          stroke={MERAH}
          strokeWidth="0.2"
          opacity="0.15"
        />
      </svg>
    </motion.div>
  )
}

// ── Light Beams ──
function LightBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Diagonal red beam from top-left */}
      <motion.div
        className="absolute -top-[20%] -left-[20%] w-[60%] h-[200%] origin-top-left"
        style={{
          background: 'linear-gradient(180deg, rgba(255,0,0,0.03) 0%, transparent 60%)',
          transform: 'rotate(25deg)',
          filter: 'blur(30px)',
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Diagonal white beam from top-right */}
      <motion.div
        className="absolute -top-[20%] -right-[20%] w-[60%] h-[200%] origin-top-right"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 60%)',
          transform: 'rotate(-25deg)',
          filter: 'blur(40px)',
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Horizontal sweep */}
      <motion.div
        className="absolute top-0 bottom-0 w-[40%]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.04), rgba(255,255,255,0.02), transparent)',
          filter: 'blur(20px)',
        }}
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 8, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
      />
    </div>
  )
}

// ── Vignette Overlay ──
function Vignette() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Deep vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)',
        }}
      />
      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-[30%]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20%]"
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}

// ── Corner Decoration — Batik Parang inspired ──
function BatikCorner({ position }: { position: string }) {
  const isTop = position.includes('top')
  const isLeft = position.includes('left')
  const rotation = isTop && isLeft ? 0 : isTop ? 90 : isLeft ? -90 : 180

  return (
    <motion.svg
      viewBox="0 0 80 80"
      className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
      style={{
        top: position.includes('top') ? '16px' : 'auto',
        bottom: position.includes('bottom') ? '16px' : 'auto',
        left: position.includes('left') ? '16px' : 'auto',
        right: position.includes('right') ? '16px' : 'auto',
        opacity: 0.15,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ delay: 2, duration: 2 }}
    >
      <g transform={`rotate(${rotation} 40 40)`}>
        {/* Parang-inspired diagonal lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.line
            key={i}
            x1={5 + i * 12} y1="5"
            x2={15 + i * 12} y2="75"
            stroke={MERAH}
            strokeWidth="0.5"
            opacity={0.6 - i * 0.1}
            animate={{ opacity: [0.3 - i * 0.05, 0.6 - i * 0.1, 0.3 - i * 0.05] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* Diamond accent */}
        <path d="M40 25 L50 40 L40 55 L30 40 Z" fill="none" stroke={MERAH} strokeWidth="0.5" />
        <circle cx="40" cy="40" r="3" fill={MERAH} opacity="0.3" />
      </g>
    </motion.svg>
  )
}

function CornerDecorations() {
  return (
    <>
      <BatikCorner position="top-left" />
      <BatikCorner position="top-right" />
      <BatikCorner position="bottom-left" />
      <BatikCorner position="bottom-right" />
    </>
  )
}

// ── Clock Display ──
function ClockDisplay() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 2 }}
    >
      <motion.span
        className="text-2xl sm:text-3xl md:text-4xl tracking-[0.2em]"
        style={{
          fontFamily: 'var(--font-mono), "JetBrains Mono", monospace',
          color: 'rgba(255,255,255,0.2)',
          fontWeight: 300,
        }}
      >
        {time}
      </motion.span>
      <motion.span
        className="text-[9px] tracking-[0.4em] uppercase"
        style={{
          fontFamily: 'var(--font-ui), "DM Sans", system-ui, sans-serif',
          color: 'rgba(255,0,0,0.15)',
        }}
      >
        Screensaver Merah Putih · KNBMP
      </motion.span>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCREENSAVER EXPORT
// ═══════════════════════════════════════════════════════════════
export function MerahPutihScreensaver({
  active,
  onDismiss,
}: {
  active: boolean
  onDismiss: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const handleInteraction = useCallback(() => {
    if (active) onDismiss()
  }, [active, onDismiss])

  if (!active) return null

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[200] cursor-pointer overflow-hidden"
          style={{ backgroundColor: '#050000' }}
          onClick={handleInteraction}
          onMouseMove={handleInteraction}
          onTouchStart={handleInteraction}
          onKeyDown={handleInteraction}
          tabIndex={0}
          role="dialog"
          aria-label="Screensaver Merah Putih — klik atau tekan untuk kembali"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          {/* LAYER 0: Deep dark background with subtle red tint */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, #0A0000 0%, #050000 50%, #000000 100%)',
            }}
          />

          {/* LAYER 1: Canvas Particle System */}
          <MerahPutihCanvas />

          {/* LAYER 2: Flowing Silk Waves */}
          <SilkWaves />

          {/* LAYER 3: Flag Stripe Animation (desktop only) */}
          {!isMobile && <FlagStripes />}

          {/* LAYER 4: Garuda Silhouette (desktop only) */}
          {!isMobile && <GarudaSilhouette />}

          {/* LAYER 5: Pulsing Star (desktop only) */}
          {!isMobile && <PulsingStar />}

          {/* LAYER 6: Light Beams (desktop only) */}
          {!isMobile && <LightBeams />}

          {/* LAYER 7: Text Reveals */}
          <MerahPutihText />

          {/* LAYER 8: Vignette */}
          <Vignette />

          {/* LAYER 9: Corner Decorations (desktop only) */}
          {!isMobile && <CornerDecorations />}

          {/* LAYER 10: Clock */}
          <ClockDisplay />

          {/* Dismiss hint — appears briefly */}
          <motion.div
            className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 4, delay: 2, ease: 'easeInOut' }}
          >
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{
                fontFamily: 'var(--font-ui), "DM Sans", system-ui, sans-serif',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Klik atau sentuh untuk kembali
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useScreensaver — auto-activates after idle timeout
// ═══════════════════════════════════════════════════════════════
export function useScreensaver(timeoutMs: number = IDLE_TIMEOUT * 1000) {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobile = useIsMobile()
  // On mobile, use longer idle timeout (120s) since mobile users interact more frequently
  const effectiveTimeout = mobile ? IDLE_TIMEOUT_MOBILE * 1000 : timeoutMs

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (active) setActive(false) // dismiss immediately on activity
    timerRef.current = setTimeout(() => setActive(true), effectiveTimeout)
  }, [active, effectiveTimeout])

  useEffect(() => {
    // Only start timer after component mounts
    timerRef.current = setTimeout(() => setActive(true), effectiveTimeout)

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const
    const handlers = events.map(event => ({
      event,
      handler: () => resetTimer(),
    }))

    handlers.forEach(({ event, handler }) => {
      window.addEventListener(event, handler, { passive: true })
    })

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      handlers.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [])

  return { active, dismiss: () => setActive(false) }
}
