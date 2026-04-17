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
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}
@keyframes dotPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.4); }
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
  const [shaking, setShaking] = useState(false);
  const [typedCount, setTypedCount] = useState(0); // how many chars currently in buffer

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
     SOUND ENGINE — GONG AGENG KEHARYATIAN (Web Audio API)
     ═══════════════════════════════════════════════════════════
     Inspired by Javanese Keraton Gong Ageng — the great bronze gong
     that opens every sacred ceremony. Synthesized with harmonic
     overtones, beating (detune shimmer), and gamelan-like timbres.
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

  // ── DRONE: Deep gamelan hum (sitar-like) ──
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

  // ── CHIME: Pelog-inspired metallic tones (bronze saron) ──
  const playChime = useCallback((idx: number) => {
    const ctx = actxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    // Pelog-inspired scale: approximate Javanese 5-tone intervals
    const pelog = [261.6, 311.1, 370.0, 415.3, 523.3, 622.3, 740.0, 830.6, 1046.5];
    const freq = pelog[idx] || 523.3;

    // Main tone — sine for pure bronze fundamental
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    g1.gain.setValueAtTime(0.22, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc1.connect(g1).connect(master);
    osc1.start(t);
    osc1.stop(t + 0.9);

    // Overtone — 2nd harmonic slightly detuned (bronze beating)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.003; // slight detune = shimmer
    g2.gain.setValueAtTime(0.08, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.connect(g2).connect(master);
    osc2.start(t);
    osc2.stop(t + 0.6);

    // High overtone — triangle for metallic brightness
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.value = freq * 3;
    g3.gain.setValueAtTime(0.03, t);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc3.connect(g3).connect(master);
    osc3.start(t);
    osc3.stop(t + 0.35);
  }, []);

  // ── GONG AGENG: The Royal Opening ──
  // A synthesis of Javanese Gong Ageng (great gong) with:
  // 1. Bronze harmonic overtones with beating shimmer
  // 2. Kempul cascade (ascending kettle gongs)
  // 3. Golden zither sustain (high triangle overtones)
  // 4. Pendopo resonance tail (deep low rumble)
  const playBigBang = useCallback(() => {
    const ctx = actxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    // ═══ 1. GONG AGENG — Bronze hit with 12 harmonics ═══
    const FUNDAMENTAL = 62; // Deep bronze gong
    const harmonics = [
      1.0,   // 62 Hz  — fundamental (deep body)
      2.01,  // ~125 Hz — slight detune = beating (bronze character)
      2.99,  // ~185 Hz — 3rd harmonic
      4.02,  // ~249 Hz — detuned 4th
      5.5,   // ~341 Hz — inharmonic partial (real gongs have these)
      7.1,   // ~440 Hz — bell-like region
      9.3,   // ~577 Hz — upper bronze
      11.7,  // ~725 Hz — bright overtone
      14.2,  // ~880 Hz — metallic sheen
      18.0,  // ~1116 Hz — high shimmer
      22.5,  // ~1395 Hz — air
      27.0,  // ~1674 Hz — sizzle
    ];
    const gains = [
      0.55, 0.25, 0.18, 0.12, 0.08, 0.06, 0.04, 0.03, 0.02, 0.015, 0.008, 0.004,
    ];

    harmonics.forEach((h, i) => {
      // Main oscillator
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i < 4 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(FUNDAMENTAL * h, t);
      // Slight pitch bend down (real gong pitch drops after strike)
      osc.frequency.exponentialRampToValueAtTime(
        FUNDAMENTAL * h * 0.985,
        t + 4,
      );
      const vol = gains[i];
      g.gain.setValueAtTime(vol, t);
      // Fast attack, slow exponential decay (bronze sustain)
      g.gain.setValueAtTime(vol * 0.7, t + 0.03); // initial drop
      g.gain.exponentialRampToValueAtTime(0.0001, t + 5 + i * 0.3);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 5 + i * 0.3);

      // Beating oscillator (detuned copy for bronze shimmer)
      if (i < 8) {
        const beat = ctx.createOscillator();
        const bg = ctx.createGain();
        beat.type = 'sine';
        beat.frequency.setValueAtTime(FUNDAMENTAL * h * 1.002, t);
        beat.frequency.exponentialRampToValueAtTime(
          FUNDAMENTAL * h * 0.987 * 1.002,
          t + 4,
        );
        bg.gain.setValueAtTime(vol * 0.4, t);
        bg.gain.exponentialRampToValueAtTime(0.0001, t + 4 + i * 0.2);
        beat.connect(bg).connect(master);
        beat.start(t);
        beat.stop(t + 4 + i * 0.2);
      }
    });

    // ═══ 2. KEMPUL CASCADE — 5 ascending kettle gongs ═══
    const kempulNotes = [370, 440, 523, 622, 740]; // E4-G4-C5-D#5-F#5 (pelog-ish)
    kempulNotes.forEach((freq, i) => {
      const delay = 0.4 + i * 0.18; // staggered entry
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.99, t + delay + 2.5);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.15, t + delay + 0.01); // sharp attack
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.5);
      osc.connect(g).connect(master);
      osc.start(t + delay);
      osc.stop(t + delay + 2.5);

      // Beating overtone for each kempul
      const ov = ctx.createOscillator();
      const og = ctx.createGain();
      ov.type = 'sine';
      ov.frequency.setValueAtTime(freq * 2.004, t + delay);
      og.gain.setValueAtTime(0.001, t);
      og.gain.linearRampToValueAtTime(0.06, t + delay + 0.01);
      og.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.5);
      ov.connect(og).connect(master);
      ov.start(t + delay);
      ov.stop(t + delay + 1.5);
    });

    // ═══ 3. GOLDEN ZITHER SHIMMER — High overtones ═══
    const shimmerFreqs = [1200, 1580, 2100, 2800];
    shimmerFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 3);
      g.gain.setValueAtTime(0.015, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 3);
    });

    // ═══ 4. PENDOPO RESONANCE — Deep room rumble ═══
    const rumbleLen = ctx.sampleRate * 4;
    const rumbleBuf = ctx.createBuffer(1, rumbleLen, ctx.sampleRate);
    const rd = rumbleBuf.getChannelData(0);
    for (let i = 0; i < rumbleLen; i++) {
      const s = i / rumbleLen;
      rd[i] = (Math.random() * 2 - 1) * Math.exp(-s * 1.2) * 0.15;
    }
    const rsrc = ctx.createBufferSource();
    rsrc.buffer = rumbleBuf;
    const rlp = ctx.createBiquadFilter();
    rlp.type = 'lowpass';
    rlp.frequency.value = 120;
    rlp.Q.value = 1.5;
    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.25, t);
    rg.gain.exponentialRampToValueAtTime(0.001, t + 4);
    rsrc.connect(rlp).connect(rg).connect(master);
    rsrc.start(t);

    // ═══ FADE OUT DRONE ═══
    if (droneOscRef.current && droneGainRef.current) {
      droneGainRef.current.gain.linearRampToValueAtTime(0.001, t + 0.3);
      try { droneOscRef.current.stop(t + 0.4); } catch { /* already stopped */ }
      droneOscRef.current = null;
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════
     CHARACTER PROCESSOR (with backspace + wrong-char shake)
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
      setTypedCount(bufRef.current.length);

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
      } else if (match === 0 && buf.length > 0) {
        // Wrong character — shake!
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }

      // Password complete → Big Bang
      if (match === 9 && phaseRef.current !== 'IMPLODING') {
        playBigBang();
        setPhase('IMPLODING');
      }
    },
    [initAudio, startDrone, rampDrone, playChime, playBigBang, setPhase],
  );

  const processBackspace = useCallback(() => {
    const p = phaseRef.current;
    if (p !== 'SYNTHESIZING') return;
    if (bufRef.current.length === 0) return;

    // Remove last char
    bufRef.current = bufRef.current.slice(0, -1);
    setTypedCount(bufRef.current.length);

    // Recalculate match progress
    const buf = bufRef.current;
    let match = 0;
    for (let i = PASSWORD.length; i >= 1; i--) {
      if (buf.length >= i && buf.endsWith(PASSWORD.substring(0, i))) {
        match = i;
        break;
      }
    }
    matchRef.current = match;
    setMatchProgress(match);
    rampDrone(match);
  }, [rampDrone]);

  /* ═══════════════════════════════════════════════════════════
     EFFECTS
     ═══════════════════════════════════════════════════════════ */

  // Desktop keyboard listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        processBackspace();
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();
      processChar(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [processChar, processBackspace]);

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

  // Mobile: tap anywhere → focus visible input (also pre-init AudioContext)
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

  // Auto-focus input on mount
  useEffect(() => {
    // Delay focus to allow mobile keyboards to open
    const t = setTimeout(() => hiddenRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Visible input handler — supports typing + backspace
  const onMobileInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const v = input.value;
      if (v.length === 0) {
        // Backspace detected (input was cleared by user pressing delete)
        processBackspace();
        return;
      }
      const ch = v[v.length - 1].toLowerCase();
      if (ch >= 'a' && ch <= 'z') processChar(ch);
      input.value = '';
    },
    [processChar, processBackspace],
  );

  // Handle backspace key on the input itself (for mobile)
  const onMobileKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        // Let default happen — it clears input → onMobileInput handles it
      }
    },
    [],
  );

  /* ═══════════════════════════════════════════════════════════
     DERIVED
     ═══════════════════════════════════════════════════════════ */
  const imploding = phase === 'IMPLODING' || phase === 'EXPLODING';
  const showNodes =
    phase === 'LOCKED' || phase === 'SYNTHESIZING' || phase === 'IMPLODING';
  const nodeGlow = (idx: number) =>
    phase === 'SYNTHESIZING' && idx < matchProgress * 8;

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

      {/* ── VISIBLE PASSCODE INPUT (phone lock screen style) ── */}
      {(phase === 'LOCKED' || phase === 'SYNTHESIZING') && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 sm:pb-24 px-6 z-10">
          {/* Title */}
          <motion.p
            className="mb-8 sm:mb-12 text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              color: GOLD,
              fontSize: 'clamp(14px, 3.5vw, 20px)',
              fontWeight: 400,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(197,160,89,0.3)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === 'SYNTHESIZING' ? 0.6 : 0.85, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Masukkan Kata Kunci
          </motion.p>

          {/* Dot indicators */}
          <motion.div
            className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
            animate={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
            key={shaking ? 'shake' : 'still'}
          >
            {PASSWORD.split('').map((_, i) => {
              const filled = i < matchProgress;
              const typed = i < typedCount;
              return (
                <span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: 'clamp(12px, 3vw, 18px)',
                    height: 'clamp(12px, 3vw, 18px)',
                    backgroundColor: filled ? GOLD : typed ? 'rgba(197,160,89,0.2)' : 'rgba(197,160,89,0.08)',
                    boxShadow: filled
                      ? `0 0 10px rgba(197,160,89,0.6), 0 0 20px rgba(197,160,89,0.2)`
                      : 'none',
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                    animation: filled ? 'dotPulse 0.4s ease-out' : 'none',
                  }}
                />
              );
            })}
          </motion.div>

          {/* Visible input — always focused, shows cursor, triggers mobile keyboard */}
          <input
            ref={hiddenRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onInput={onMobileInput}
            onKeyDown={onMobileKeyDown}
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

          {/* Backspace button for mobile */}
          {typedCount > 0 && phase === 'SYNTHESIZING' && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                processBackspace();
                hiddenRef.current?.focus();
              }}
              className="mt-3 px-6 py-2.5 rounded-full cursor-pointer"
              style={{
                fontFamily: 'var(--font-body)',
                color: GOLD,
                fontSize: '12px',
                letterSpacing: '0.15em',
                border: '1px solid rgba(197,160,89,0.25)',
                background: 'rgba(197,160,89,0.05)',
                opacity: 0.5,
              }}
              whileHover={{ opacity: 0.8, backgroundColor: 'rgba(197,160,89,0.1)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              ← HAPUS
            </motion.button>
          )}

          {/* Hints (only in LOCKED phase, after delay) */}
          {phase === 'LOCKED' && showTextHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              style={{
                fontFamily: 'var(--font-body)',
                color: GOLD,
                fontSize: '11px',
                marginTop: '20px',
                animation: 'subtlePulse 3s ease-in-out infinite',
                lineHeight: 1.6,
              }}
              className="text-center px-8"
            >
              Warisan Sang Proklamator menunggu untuk diaktifkan&hellip;
            </motion.p>
          )}
          {phase === 'LOCKED' && showFullHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-1.5 mt-4"
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  color: GOLD,
                  fontSize: '10px',
                  opacity: 0.22,
                  letterSpacing: '0.06em',
                }}
                className="text-center px-8"
              >
                Ajaran Bung Karno yang sempat terpause&thinsp;—&thinsp;kini kita lanjutkan.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  color: GOLD,
                  fontSize: '12px',
                  opacity: 0.28,
                  letterSpacing: '0.18em',
                }}
              >
                b e r d i k a r i
              </p>
            </motion.div>
          )}

          {/* Tap to focus hint (mobile) */}
          {phase === 'LOCKED' && elapsed < 8 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                fontFamily: 'var(--font-body)',
                color: GOLD,
                fontSize: '11px',
                marginTop: '16px',
              }}
            >
              Ketuk di mana saja untuk mulai
            </motion.p>
          )}
        </div>
      )}

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
              &ldquo;Bung Karno menanam benih kemerdekaan ekonomi rakyat.
              <br />
              Kini, kita hidupkan kembali warisan yang tak pernah mati.&rdquo;
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
                        Meneruskan Doktrin Berdikari Sang Proklamator
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
                        Warisan Bung Karno yang kita aktifkan kembali
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
    </div>
  );
}
