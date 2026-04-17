'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FormEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const GOLD = '#C5A059';
const GOLD_LIGHT = '#E8D5A3';
const GOLD_DIM = 'rgba(197,160,89,0.15)';
const DEEP_BG = '#080604';
const PASSWORD = 'berdikari';

const WISDOM_VALUES: string[] = [
  'Amanah', 'Rahmah', 'Peradaban', 'Kedaulatan', 'Logistik', 'Akhlak', 'Adil', 'Mandiri', 'Sejahtera',
  'Bersatu', 'Gotong Royong', 'Koperasi', 'Ekonomi', 'Rakyat', 'BUMDes', 'Agraria', 'Pangan', 'Energi',
  'Maritim', 'Digital', 'Pendidikan', 'Kesehatan', 'Infrastruktur', 'Transportasi', 'Keuangan', 'Perbankan',
  'Pasar', 'Manufaktur', 'Inovasi', 'Teknologi', 'Budaya', 'Seni', 'Bahasa', 'Sejarah', 'Pancasila',
  'NKRI', 'Bhinneka', 'Nusantara', 'Merah Putih', 'Bangsa', 'Hukum', 'Keadilan', 'Demokrasi', 'Transparansi',
  'Integritas', 'Profesional', 'Kolaborasi', 'Sinergi', 'Ketahanan', 'Keteladanan', 'Keberlanjutan', 'Konservasi',
  'Investasi', 'Ekspor', 'Fiskal', 'Regulasi', 'Karya', 'Cipta', 'Rasa', 'Budi', 'Cerdas', 'Tangguh',
  'Berkarakter', 'Berdaya Saing', 'Inklusif', 'Berkeadilan', 'Transformasi', 'Revolusi', 'Evolusi', 'Ascension',
];

type Phase =
  | 'LOCKED'
  | 'SYNTHESIZING'
  | 'IMPLODING'
  | 'EXPLODING'
  | 'REVELATION'
  | 'REVEALED'
  | 'OPENING'
  | 'COMPLETE';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface NodePos {
  x: string;
  y: string;
  fx1: string; fy1: string;
  fx2: string; fy2: string;
  fx3: string; fy3: string;
  dur: number;
  del: number;
}

interface Particle {
  id: number;
  angle: number;
  dist: number;
  size: number;
  color: string;
  delay: number;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS — Seeded PRNG (mulberry32) for deterministic SSR/hydration
   ═══════════════════════════════════════════════════════════════ */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNodes(): NodePos[] {
  const out: NodePos[] = [];
  const cols = 9;
  const rows = 8;
  const cw = 100 / cols;
  const ch = 100 / rows;
  const rng = mulberry32(72);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({
        x: `${c * cw + cw * 0.15 + rng() * cw * 0.7}%`,
        y: `${r * ch + ch * 0.15 + rng() * ch * 0.7}%`,
        fx1: `${(rng() - 0.5) * 26}px`,
        fy1: `${(rng() - 0.5) * 26}px`,
        fx2: `${(rng() - 0.5) * 26}px`,
        fy2: `${(rng() - 0.5) * 26}px`,
        fx3: `${(rng() - 0.5) * 26}px`,
        fy3: `${(rng() - 0.5) * 26}px`,
        dur: 5 + rng() * 4,
        del: rng() * 5,
      });
    }
  }
  return out;
}

function buildParticles(): Particle[] {
  const rng = mulberry32(420);
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * Math.PI * 2 + (rng() - 0.5) * 0.4,
    dist: 220 + rng() * 380,
    size: 4 + rng() * 10,
    color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? GOLD : GOLD_LIGHT,
    delay: rng() * 0.25,
  }));
}

/* ═══════════════════════════════════════════════════════════════
   INJECTED CSS
   ═══════════════════════════════════════════════════════════════ */
const CSS = `
@keyframes wisdomFloat {
  0%, 100% { transform: translate(0, 0); }
  25%       { transform: translate(var(--fx1), var(--fy1)); }
  50%       { transform: translate(var(--fx2), var(--fy2)); }
  75%       { transform: translate(var(--fx3), var(--fy3)); }
}
@keyframes softBlink {
  0%, 100% { opacity: 0; }
  50%      { opacity: 0.6; }
}
@keyframes subtlePulse {
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 0.6; }
}
`;

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function DigitalUnveiling({ onComplete }: { onComplete: () => void }) {
  /* ── state ── */
  const [phase, _setPhase] = useState<Phase>('LOCKED');
  const [matchProgress, setMatchProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  /* ── refs ── */
  const phaseRef = useRef<Phase>('LOCKED');
  const matchRef = useRef(0);
  const bufRef = useRef('');

  // Audio
  const actxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // Mobile hidden input
  const hiddenRef = useRef<HTMLInputElement>(null);

  /* ── memoised data ── */
  const nodes = useMemo(() => buildNodes(), []);
  const particles = useMemo(() => buildParticles(), []);

  /* ── stable phase setter ── */
  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    _setPhase(p);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     SOUND ENGINE (Web Audio API)
     ═══════════════════════════════════════════════════════════ */
  const initAudio = useCallback(() => {
    if (actxRef.current) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 2.5;
    master.connect(ctx.destination);
    actxRef.current = ctx;
    masterRef.current = master;
  }, []);

  const startDrone = useCallback(() => {
    const ctx = actxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || droneOscRef.current) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    g.gain.value = 0;
    osc.connect(g);
    g.connect(master);
    osc.start();
    droneOscRef.current = osc;
    droneGainRef.current = g;
  }, []);

  const rampDrone = useCallback((progress: number) => {
    const g = droneGainRef.current;
    const ctx = actxRef.current;
    if (!g || !ctx) return;
    g.gain.linearRampToValueAtTime(
      (progress / 9) * 0.12,
      ctx.currentTime + 0.15,
    );
  }, []);

  const playChime = useCallback((idx: number) => {
    const ctx = actxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const freq = 440 + (idx / 8) * (988 - 440);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  }, []);

  const playBigBang = useCallback(() => {
    const ctx = actxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    // Deep bass hit (40 Hz)
    const bass = ctx.createOscillator();
    const bg = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(40, t);
    bg.gain.setValueAtTime(0.7, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    bass.connect(bg);
    bg.connect(master);
    bass.start(t);
    bass.stop(t + 2.5);

    // White noise burst
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
    }
    const ns = ctx.createBufferSource();
    ns.buffer = buf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    ns.connect(ng);
    ng.connect(master);
    ns.start(t);

    // Golden shimmer (triangle wave, descending)
    const sh = ctx.createOscillator();
    const sg = ctx.createGain();
    sh.type = 'triangle';
    sh.frequency.setValueAtTime(1200, t);
    sh.frequency.exponentialRampToValueAtTime(600, t + 3);
    sg.gain.setValueAtTime(0.12, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 3);
    sh.connect(sg);
    sg.connect(master);
    sh.start(t);
    sh.stop(t + 3);

    // Fade out drone
    if (droneOscRef.current && droneGainRef.current) {
      droneGainRef.current.gain.linearRampToValueAtTime(0.001, t + 0.3);
      try { droneOscRef.current.stop(t + 0.4); } catch { /* already stopped */ }
      droneOscRef.current = null;
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════
     CHARACTER PROCESSOR
     ═══════════════════════════════════════════════════════════ */
  const processChar = useCallback(
    (key: string) => {
      const p = phaseRef.current;
      if (p !== 'LOCKED' && p !== 'SYNTHESIZING') return;

      // First keypress → init audio & switch phase
      if (!actxRef.current) {
        initAudio();
        startDrone();
        setPhase('SYNTHESIZING');
      }

      // Append to rolling buffer (keep last 9)
      bufRef.current = (bufRef.current + key).slice(-9);
      const buf = bufRef.current;

      // Find longest prefix of PASSWORD that is a suffix of buffer
      let match = 0;
      for (let i = PASSWORD.length; i >= 1; i--) {
        if (buf.length >= i && buf.endsWith(PASSWORD.substring(0, i))) {
          match = i;
          break;
        }
      }

      if (match > matchRef.current) {
        matchRef.current = match;
        setMatchProgress(match);
        rampDrone(match);
        playChime(match - 1);
      }

      // Password complete → Big Bang
      if (match === 9 && phaseRef.current !== 'IMPLODING') {
        playBigBang();
        setPhase('IMPLODING');
      }
    },
    [initAudio, startDrone, rampDrone, playChime, playBigBang, setPhase],
  );

  /* ═══════════════════════════════════════════════════════════
     EFFECTS
     ═══════════════════════════════════════════════════════════ */

  // Desktop keyboard listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      processChar(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [processChar]);

  // Phase auto-transitions
  useEffect(() => {
    switch (phase) {
      case 'IMPLODING': {
        const id = setTimeout(() => setPhase('EXPLODING'), 1600);
        return () => clearTimeout(id);
      }
      case 'EXPLODING': {
        const id = setTimeout(() => setPhase('REVELATION'), 2200);
        return () => clearTimeout(id);
      }
      case 'REVELATION': {
        const id = setTimeout(() => setPhase('REVEALED'), 3000);
        return () => clearTimeout(id);
      }
      case 'OPENING': {
        const id = setTimeout(() => {
          try {
            sessionStorage.setItem('knbmp-ritual-complete', 'true');
          } catch {
            /* quota exceeded */
          }
          onComplete();
        }, 1200);
        return () => clearTimeout(id);
      }
    }
  }, [phase, onComplete, setPhase]);

  // Hint timer (LOCKED only)
  useEffect(() => {
    if (phase !== 'LOCKED') return;
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // Mobile: tap → focus hidden input (also pre-init AudioContext)
  useEffect(() => {
    if (phase !== 'LOCKED' && phase !== 'SYNTHESIZING') return;
    const handler = () => {
      if (!actxRef.current) initAudio();
      hiddenRef.current?.focus();
    };
    window.addEventListener('click', handler);
    window.addEventListener('touchstart', handler, { passive: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [phase, initAudio]);

  // Mobile hidden input handler
  const onMobileInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      if (v.length > 0) {
        const ch = v[v.length - 1].toLowerCase();
        if (ch >= 'a' && ch <= 'z') processChar(ch);
        e.currentTarget.value = '';
      }
    },
    [processChar],
  );

  /* ═══════════════════════════════════════════════════════════
     DERIVED
     ═══════════════════════════════════════════════════════════ */
  const imploding = phase === 'IMPLODING' || phase === 'EXPLODING';
  const showNodes =
    phase === 'LOCKED' || phase === 'SYNTHESIZING' || phase === 'IMPLODING';
  const nodeGlow = (idx: number) =>
    phase === 'SYNTHESIZING' && idx < matchProgress * 8;

  const showCursor = phase === 'LOCKED' && elapsed >= 8 && elapsed < 20;
  const showTextHint = phase === 'LOCKED' && elapsed >= 20 && elapsed < 40;
  const showFullHint = phase === 'LOCKED' && elapsed >= 40;

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: DEEP_BG }}
    >
      {/* ── Injected keyframes ── */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Hidden mobile input ── */}
      <input
        ref={hiddenRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-hidden="true"
        tabIndex={-1}
        onInput={onMobileInput}
        style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          opacity: 0,
          width: '1px',
          height: '1px',
          border: 'none',
          outline: 'none',
        }}
      />

      {/* ═══════════════════════════════════════════════════
          WISDOM NODES
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNodes &&
          nodes.map((n, i) => {
            const glow = nodeGlow(i);
            return (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{ left: n.x, top: n.y }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: imploding ? 0 : 1,
                  scale: imploding ? 0 : 1,
                  x: imploding ? 'calc(50vw - 100%)' : 0,
                  y: imploding ? 'calc(50vh - 100%)' : 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: {
                    duration: imploding ? 0.35 : 0.9,
                    delay: imploding ? i * 0.012 + 0.9 : i * 0.025,
                  },
                  scale: {
                    duration: imploding ? 0.35 : 0.9,
                    delay: imploding ? i * 0.012 + 0.9 : i * 0.025,
                  },
                  x: { duration: 1.4, delay: i * 0.012, ease: 'easeIn' },
                  y: { duration: 1.4, delay: i * 0.012, ease: 'easeIn' },
                }}
              >
                {/* Centreing wrapper — CSS translate doesn't conflict with framer-motion */}
                <div style={{ transform: 'translate(-50%, -50%)' }}>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={
                      {
                        fontSize: 'clamp(8px, 1.4vw, 12px)',
                        fontFamily: 'var(--font-body)',
                        color: glow ? GOLD : 'rgba(197,160,89,0.18)',
                        textShadow: glow
                          ? `0 0 8px ${GOLD}, 0 0 16px rgba(197,160,89,0.25)`
                          : 'none',
                        border: `1px solid ${
                          glow ? GOLD : 'rgba(197,160,89,0.06)'
                        }`,
                        background: glow
                          ? 'rgba(197,160,89,0.08)'
                          : 'rgba(197,160,89,0.01)',
                        '--fx1': n.fx1,
                        '--fy1': n.fy1,
                        '--fx2': n.fx2,
                        '--fy2': n.fy2,
                        '--fx3': n.fx3,
                        '--fy3': n.fy3,
                        animation: `wisdomFloat ${n.dur}s ease-in-out ${n.del}s infinite`,
                        animationPlayState: imploding ? 'paused' : 'running',
                        transition:
                          'color 0.4s, text-shadow 0.4s, border-color 0.4s, background 0.4s',
                      } as React.CSSProperties
                    }
                  >
                    {WISDOM_VALUES[i]}
                  </span>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          EXPLOSION (Big Bang)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'EXPLODING' && (
          <motion.div
            key="explosion"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.2 }}
          >
            {/* Gold/white particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.dist,
                  y: Math.sin(p.angle) * p.dist,
                  opacity: 0,
                  scale: 0.15,
                }}
                transition={{
                  duration: 1.8,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Shockwave ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${GOLD}`,
                boxShadow: `0 0 30px ${GOLD}, inset 0 0 20px rgba(197,160,89,0.08)`,
              }}
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: 1000, height: 1000, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Central white flash */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          REVELATION QUOTE
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'REVELATION' && (
          <motion.div
            key="revelation"
            className="absolute inset-0 flex items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <p
              className="text-center max-w-xl"
              style={{
                fontFamily: 'var(--font-serif)',
                color: GOLD,
                fontSize: 'clamp(18px, 4.5vw, 34px)',
                fontStyle: 'italic',
                lineHeight: 1.7,
                textShadow: `0 0 30px rgba(197,160,89,0.5), 0 0 60px rgba(197,160,89,0.2)`,
              }}
            >
              &ldquo;Kedaulatan dimulai dari pikiran yang merdeka&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          BOOK COVER (REVEALED)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'REVEALED' && (
          <motion.div
            key="bookcover"
            className="absolute inset-0 flex items-center justify-center px-4 py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <div className="relative w-full" style={{ maxWidth: 440 }}>
              {/* ── Outer gold frame ── */}
              <div
                className="p-[2px] rounded-sm"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DIM}, ${GOLD})`,
                }}
              >
                {/* ── Middle frame ── */}
                <div
                  className="p-[1px] rounded-sm"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_DIM}, transparent 40%, transparent 60%, ${GOLD_DIM})`,
                  }}
                >
                  {/* ── Inner matte ── */}
                  <div
                    className="relative overflow-hidden rounded-sm px-6 py-10 sm:px-12 sm:py-14"
                    style={{
                      background:
                        'linear-gradient(180deg, #0c0a07 0%, #0e0c09 50%, #0c0a07 100%)',
                      border: `1px solid ${GOLD_DIM}`,
                    }}
                  >
                    {/* AI background image */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: 'url(/cover-bg-ultimate.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'overlay',
                        opacity: 0.3,
                      }}
                    />

                    {/* ── Content ── */}
                    <div className="relative z-10 flex flex-col items-center gap-6">
                      {/* Top ornament */}
                      <div className="flex items-center gap-3 w-full">
                        <span
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to right, transparent, ${GOLD})`,
                          }}
                        />
                        <span
                          className="block w-2 h-2 rotate-45"
                          style={{ border: `1px solid ${GOLD}` }}
                        />
                        <span
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to left, transparent, ${GOLD})`,
                          }}
                        />
                      </div>

                      {/* Title */}
                      <h1
                        className="tracking-[0.15em]"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          color: GOLD,
                          fontSize: 'clamp(34px, 9vw, 58px)',
                          fontWeight: 400,
                          textShadow: `0 0 24px rgba(197,160,89,0.35), 0 0 48px rgba(197,160,89,0.12)`,
                        }}
                      >
                        KITAB 72
                      </h1>

                      {/* Subtitle */}
                      <p
                        className="text-center"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          color: GOLD_LIGHT,
                          fontSize: 'clamp(12px, 2.6vw, 16px)',
                          fontStyle: 'italic',
                          opacity: 0.85,
                        }}
                      >
                        Dokumen Strategis Dewan Pendiri
                      </p>

                      {/* Divider */}
                      <div className="flex items-center gap-3 w-full max-w-[200px]">
                        <span
                          className="flex-1 h-px"
                          style={{ background: GOLD_DIM }}
                        />
                        <span style={{ color: GOLD, opacity: 0.5, fontSize: 10 }}>
                          ✦
                        </span>
                        <span
                          className="flex-1 h-px"
                          style={{ background: GOLD_DIM }}
                        />
                      </div>

                      {/* Dedication */}
                      <p
                        className="tracking-[0.12em] text-center"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: GOLD,
                          fontSize: 'clamp(10px, 2.2vw, 13px)',
                          opacity: 0.45,
                        }}
                      >
                        Terukir khusus untuk: Dewan Pendiri
                      </p>

                      {/* Buka Kitab button */}
                      <motion.button
                        type="button"
                        onClick={() => setPhase('OPENING')}
                        className="mt-2 px-8 py-3 rounded-sm cursor-pointer"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: GOLD,
                          fontSize: '13px',
                          fontWeight: 500,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          border: `1px solid ${GOLD}`,
                          background: 'transparent',
                          transition: 'background 0.3s, box-shadow 0.3s',
                        }}
                        whileHover={{
                          boxShadow: `0 0 24px rgba(197,160,89,0.3), 0 0 48px rgba(197,160,89,0.1)`,
                          backgroundColor: 'rgba(197,160,89,0.07)',
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Buka Kitab
                      </motion.button>

                      {/* Bottom ornament */}
                      <div className="flex items-center gap-3 w-full">
                        <span
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to right, transparent, ${GOLD})`,
                          }}
                        />
                        <span
                          className="block w-2 h-2 rotate-45"
                          style={{ border: `1px solid ${GOLD}` }}
                        />
                        <span
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to left, transparent, ${GOLD})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          OPENING WHITE FLASH
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'OPENING' && (
          <motion.div
            key="flash"
            className="fixed inset-0 z-50"
            style={{ background: 'white' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          HINTS (LOCKED phase)
          ═══════════════════════════════════════════════════ */}
      {(phase === 'LOCKED' || phase === 'SYNTHESIZING') && (
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          {/* Faint blinking cursor — 8s */}
          {showCursor && (
            <span
              className="inline-block w-[2px] h-5 rounded-full"
              style={{
                background: GOLD,
                opacity: 0.25,
                animation: 'softBlink 2.2s ease-in-out infinite',
              }}
            />
          )}

          {/* Text hint — 20s */}
          {showTextHint && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: GOLD,
                fontSize: '13px',
                opacity: 0.2,
                animation: 'subtlePulse 3s ease-in-out infinite',
              }}
            >
              Coba ketik sesuatu...
            </p>
          )}

          {/* Full hint — 40s */}
          {showFullHint && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: GOLD,
                fontSize: '13px',
                opacity: 0.28,
                letterSpacing: '0.22em',
              }}
            >
              Kata kunci:&nbsp; b e r d i k a r i
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          PROGRESS INDICATOR (SYNTHESIZING)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'SYNTHESIZING' && matchProgress > 0 && (
          <motion.div
            key="progress"
            className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex gap-1.5">
              {PASSWORD.split('').map((_, i) => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i < matchProgress ? GOLD : 'rgba(197,160,89,0.12)',
                    boxShadow:
                      i < matchProgress
                        ? `0 0 6px ${GOLD}`
                        : 'none',
                    transition: 'background 0.3s, box-shadow 0.3s',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
