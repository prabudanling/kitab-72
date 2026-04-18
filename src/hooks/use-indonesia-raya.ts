'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// INDONESIA RAYA — Full Orchestral Background Music
// Web Audio API synthesis of the Indonesian National Anthem
// ═══════════════════════════════════════════════════════════════

// MIDI note → frequency
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// Note constants
const Bb3 = 58, C4 = 60, D4 = 62, Eb4 = 63, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70
const C5 = 72, D5 = 74, Eb5 = 75, F5 = 77, G5 = 79, A5 = 81, Bb5 = 82, C6 = 84, Eb6 = 87

// ═══ MELODY — Indonesia Raya ═══
// Each note: [midiNote, durationInBeats]
// Key: Bb Major | Time: 4/4 | Tempo: ~100 BPM (0.6s per beat)
const MELODY: [number, number][] = [
  // ═══ VERSE 1: "Indonesia tanah airku..." ═══
  [F4, 0.75],
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  [C5, 0.75], [D5, 0.5],
  [C5, 0.5], [Bb4, 0.5], [A4, 0.75],
  [G4, 0.5], [A4, 0.5],
  [Bb4, 1.5],
  [C5, 0.5], [D5, 0.5], [Eb5, 0.75],
  [D5, 0.5], [C5, 0.5], [Bb4, 0.5],
  [A4, 0.5], [C5, 0.5], [D5, 1.0],
  [Eb5, 0.75], [D5, 0.5], [C5, 1.25],

  // ═══ VERSE 2: "Indonesia tanah pusaka..." ═══
  [F4, 0.75],
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  [C5, 0.75], [D5, 0.5],
  [C5, 0.5], [Bb4, 0.5], [A4, 0.75],
  [G4, 0.5], [A4, 0.5],
  [Bb4, 1.5],
  [C5, 0.5], [D5, 0.5], [Eb5, 0.75],
  [D5, 0.5], [C5, 0.5], [Bb4, 0.5],
  [A4, 0.5], [Bb4, 0.5], [C5, 0.5], [D5, 0.5],
  [Eb5, 1.5],

  // ═══ VERSE 3: "Indonesia merdeka..." ═══
  [F4, 0.75],
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  [C5, 0.5], [D5, 0.5], [Eb5, 1.0],
  [D5, 0.5], [C5, 0.5],
  [Bb4, 0.75], [A4, 0.5],
  [Bb4, 0.5], [C5, 0.75], [D5, 0.5],
  [Eb5, 0.75], [D5, 0.5],
  [C5, 0.5], [Bb4, 0.75],
  [C5, 0.5], [D5, 0.75],
  [Eb5, 0.5], [F5, 0.75],
  [D5, 0.5], [C5, 0.5], [Bb4, 1.0],
  [A4, 1.5],

  // ═══ CHORUS: "Indonesia Raya..." ═══
  [Bb4, 0.75], [Bb4, 0.75],
  [C5, 0.5], [D5, 0.75],
  [Eb5, 0.75], [D5, 0.5], [C5, 0.75],
  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.75], [C5, 0.5], [D5, 1.0],
  [Eb5, 0.5], [D5, 0.5], [C5, 1.5],

  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.5], [C5, 0.5],
  [D5, 0.75],
  [Eb5, 0.75], [D5, 0.5], [C5, 0.75],
  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.5], [C5, 0.5], [D5, 1.0],
  [C5, 0.5], [Bb4, 0.5], [A4, 1.5],

  // ═══ FINAL ═══
  [Bb4, 1.0], [C5, 0.75], [D5, 1.0], [Eb5, 1.5],
  [D5, 4.0],
]

// ═══ CHORDS ═══
const CHORDS: [number, number, string][] = [
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [F4, 4, 'major'],
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [G4, 4, 'minor'], [C4, 4, 'minor'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Bb3, 4, 'major'], [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'],
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 8, 'major'],
]

const BPM = 100
const BEAT = 60 / BPM // 0.6s per beat

function buildTimeline(notes: [number, number][]) {
  const timeline: { freq: number; start: number; dur: number }[] = []
  let t = 0
  for (const [note, beats] of notes) {
    timeline.push({ freq: midi(note), start: t * BEAT, dur: beats * BEAT * 0.9 })
    t += beats
  }
  return timeline
}

function buildChordTimeline(chords: [number, number, string][]) {
  const timeline: { root: number; start: number; dur: number; type: string }[] = []
  let t = 0
  for (const [root, beats, type] of chords) {
    timeline.push({ root, start: t * BEAT, dur: beats * BEAT, type })
    t += beats
  }
  return timeline
}

// ═══ ORCHESTRAL SYNTHESIS ═══

function playBrassMelody(
  ctx: AudioContext, dest: AudioNode,
  notes: { freq: number; start: number; dur: number }[],
  volume: number, delay: number = 0,
) {
  const t0 = ctx.currentTime + delay
  for (const note of notes) {
    const nt = t0 + note.start
    const end = nt + note.dur

    // Lead — sawtooth brass body
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(note.freq, nt)
    osc1.frequency.linearRampToValueAtTime(note.freq * 1.012, nt + 0.05)
    osc1.frequency.linearRampToValueAtTime(note.freq, nt + 0.15)
    g1.gain.setValueAtTime(0.001, nt)
    g1.gain.linearRampToValueAtTime(volume, nt + 0.04)
    g1.gain.setValueAtTime(volume * 0.8, nt + note.dur * 0.5)
    g1.gain.exponentialRampToValueAtTime(0.001, end + 0.05)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = note.freq * 2.0
    bp.Q.value = 0.6
    osc1.connect(bp).connect(g1).connect(dest)
    osc1.start(nt); osc1.stop(end + 0.1)

    // Chorus — detuned sawtooth for richness
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(note.freq * 1.004, nt)
    g2.gain.setValueAtTime(0.001, nt)
    g2.gain.linearRampToValueAtTime(volume * 0.3, nt + 0.04)
    g2.gain.exponentialRampToValueAtTime(0.001, end)
    osc2.connect(bp).connect(g2).connect(dest)
    osc2.start(nt); osc2.stop(end + 0.1)

    // Triangle fundamental for warmth
    const osc3 = ctx.createOscillator()
    const g3 = ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(note.freq, nt)
    g3.gain.setValueAtTime(0.001, nt)
    g3.gain.linearRampToValueAtTime(volume * 0.6, nt + 0.06)
    g3.gain.exponentialRampToValueAtTime(0.001, end)
    osc3.connect(g3).connect(dest)
    osc3.start(nt); osc3.stop(end + 0.1)
  }
}

function playStringPad(
  ctx: AudioContext, dest: AudioNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number, delay: number = 0,
) {
  const t0 = ctx.currentTime + delay
  for (const chord of chords) {
    const nt = t0 + chord.start
    const end = nt + chord.dur
    const root = chord.root
    const third = chord.type === 'minor' ? root + 3 : root + 4
    const fifth = root + 7

    for (const interval of [0, 12, 24]) {
      for (const noteOffset of [0, third - root, fifth - root]) {
        const freq = midi(root + interval + noteOffset)
        for (const detune of [-1.5, 0, 1.5]) {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq * (1 + detune * 0.001), nt)
          osc.frequency.linearRampToValueAtTime(freq * (1 + detune * 0.002), end)
          const vol = volume * (interval === 0 ? 0.35 : interval === 12 ? 0.18 : 0.06)
          g.gain.setValueAtTime(0.001, nt)
          g.gain.linearRampToValueAtTime(vol, nt + 1.5)
          g.gain.setValueAtTime(vol * 0.9, end - 1.0)
          g.gain.exponentialRampToValueAtTime(0.001, end + 0.2)
          osc.connect(g).connect(dest)
          osc.start(nt); osc.stop(end + 0.3)
        }
      }
    }
  }
}

function playBass(
  ctx: AudioContext, dest: AudioNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number, delay: number = 0,
) {
  const t0 = ctx.currentTime + delay
  for (const chord of chords) {
    const nt = t0 + chord.start
    const end = nt + chord.dur
    const freq = midi(chord.root - 12)

    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, nt)
    g.gain.setValueAtTime(0.001, nt)
    g.gain.linearRampToValueAtTime(volume, nt + 0.1)
    g.gain.setValueAtTime(volume * 0.8, end - 0.3)
    g.gain.exponentialRampToValueAtTime(0.001, end + 0.1)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 200
    osc.connect(lp).connect(g).connect(dest)
    osc.start(nt); osc.stop(end + 0.2)
  }
}

function playTimpani(
  ctx: AudioContext, dest: AudioNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number, delay: number = 0,
) {
  const t0 = ctx.currentTime + delay
  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i]
    const nt = t0 + chord.start
    for (const beatOffset of [0, 2 * BEAT]) {
      const hitTime = nt + beatOffset
      if (hitTime >= nt + chord.dur) continue
      const freq = midi(chord.root - 5)
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq * 1.3, hitTime)
      osc.frequency.exponentialRampToValueAtTime(freq, hitTime + 0.15)
      g.gain.setValueAtTime(volume * 2.0, hitTime)
      g.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.8)
      osc.connect(g).connect(dest)
      osc.start(hitTime); osc.stop(hitTime + 1.0)
    }
  }
}

function playShimmer(
  ctx: AudioContext, dest: AudioNode,
  totalDuration: number, volume: number, delay: number = 0,
) {
  const t0 = ctx.currentTime + delay
  const shimmerFreqs = [midi(C6), midi(Eb6), midi(G5), midi(Bb5)]
  for (const freq of shimmerFreqs) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t0)
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.3
    lfoGain.gain.value = volume * 0.5
    lfo.connect(lfoGain).connect(g.gain)
    lfo.start(t0); lfo.stop(t0 + totalDuration + 1)
    g.gain.setValueAtTime(0.001, t0)
    g.gain.linearRampToValueAtTime(volume, t0 + 3)
    g.gain.setValueAtTime(volume * 0.8, t0 + totalDuration - 3)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + totalDuration + 0.5)
    osc.connect(g).connect(dest)
    osc.start(t0); osc.stop(t0 + totalDuration + 1)
  }
}

// Build timelines
const melodyTimeline = buildTimeline(MELODY)
const chordTimeline = buildChordTimeline(CHORDS)
const TOTAL_DURATION = Math.max(
  melodyTimeline[melodyTimeline.length - 1].start + melodyTimeline[melodyTimeline.length - 1].dur,
  chordTimeline[chordTimeline.length - 1].start + chordTimeline[chordTimeline.length - 1].dur,
) + 2

// ═══════════════════════════════════════════════════════════════
// HOOK — Uses REF for guard (no stale closure issues)
// ═══════════════════════════════════════════════════════════════
export function useIndonesiaRaya() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)

  // Guard ref for preventing double-play (always accurate, never stale)
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const startedRef = useRef(false) // ← REF not state!
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const play = useCallback(async (fadeDelay: number = 2.0) => {
    // Guard with REF — always accurate, never stale
    if (startedRef.current) return
    startedRef.current = true

    console.log('[IndonesiaRaya] play() called, creating AudioContext...')

    try {
      const ctx = new AudioContext()
      ctxRef.current = ctx

      const master = ctx.createGain()
      master.gain.value = 0 // Start silent for fade-in
      master.connect(ctx.destination)
      masterRef.current = master

      // MUST resume from user gesture
      if (ctx.state === 'suspended') {
        console.log('[IndonesiaRaya] AudioContext suspended, resuming...')
        await ctx.resume()
      }

      if (ctx.state !== 'running') {
        console.warn('[IndonesiaRaya] AudioContext still not running after resume. State:', ctx.state)
        startedRef.current = false // Allow retry
        return
      }

      console.log('[IndonesiaRaya] AudioContext running! Scheduling orchestra...')

      const delay = fadeDelay

      // Layer 1: Brass melody — LOUD (was 0.08, now 0.25)
      playBrassMelody(ctx, master, melodyTimeline, 0.25, delay)

      // Layer 2: String pad (was 0.03, now 0.10)
      playStringPad(ctx, master, chordTimeline, 0.10, delay)

      // Layer 3: Bass (was 0.06, now 0.20)
      playBass(ctx, master, chordTimeline, 0.20, delay)

      // Layer 4: Timpani (was 0.04, now 0.15)
      playTimpani(ctx, master, chordTimeline, 0.15, delay)

      // Layer 5: Shimmer (was 0.012, now 0.04)
      playShimmer(ctx, master, TOTAL_DURATION, 0.04, delay)

      // Fade in to FULL volume (was 0.7, now 1.0)
      master.gain.setValueAtTime(0, ctx.currentTime + delay)
      master.gain.linearRampToValueAtTime(1.0, ctx.currentTime + delay + 3)

      // Fade out near end
      const fadeOutStart = delay + TOTAL_DURATION - 4
      master.gain.setValueAtTime(1.0, ctx.currentTime + fadeOutStart)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + TOTAL_DURATION)

      setHasStarted(true)
      setIsPlaying(true)
      console.log('[IndonesiaRaya] All 5 layers scheduled. Duration:', TOTAL_DURATION.toFixed(1), 's')

      // Mark finished
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      finishTimerRef.current = setTimeout(() => {
        setIsPlaying(false)
        setHasFinished(true)
        console.log('[IndonesiaRaya] Finished')
      }, (delay + TOTAL_DURATION) * 1000 + 500)

    } catch (err) {
      console.error('[IndonesiaRaya] Error:', err)
      startedRef.current = false // Allow retry
    }
  }, []) // ← NO dependencies — uses refs for everything

  const toggle = useCallback(() => {
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master || !startedRef.current) return
    if (isPlaying) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setIsPlaying(false)
    } else {
      master.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.5)
      setIsPlaying(true)
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      if (ctxRef.current) try { ctxRef.current.close() } catch { /* ok */ }
    }
  }, [])

  return {
    isPlaying,
    hasStarted,
    hasFinished,
    play,
    toggle,
    totalDuration: TOTAL_DURATION,
  }
}
