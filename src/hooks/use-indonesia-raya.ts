'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// INDONESIA RAYA — Full Orchestral Background Music
// Web Audio API synthesis of the Indonesian National Anthem
// ═══════════════════════════════════════════════════════════════

// MIDI note → frequency
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// Bb Major scale reference
const Bb3 = 58, C4 = 60, D4 = 62, Eb4 = 63, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70
const C5 = 72, D5 = 74, Eb5 = 75, F5 = 77, G5 = 79, A5 = 81, Bb5 = 82, C6 = 84

// ═══ MELODY — Indonesia Raya (3 verses + chorus) ═══
// Each note: [midiNote, durationInBeats]
// Key: Bb Major | Time: 4/4 | Tempo: ~100 BPM (0.6s per beat)
const MELODY: [number, number][] = [
  // ═══ VERSE 1: "Indonesia tanah airku..." ═══
  // Pickup
  [F4, 0.75],
  // "Indonesia"
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  // "tanah air-"
  [C5, 0.75], [D5, 0.5],
  // "ku, tanah tum-"
  [C5, 0.5], [Bb4, 0.5], [A4, 0.75],
  // "pah da-"
  [G4, 0.5], [A4, 0.5],
  // "rah-ku"
  [Bb4, 1.5],
  // "Di sa-na-"
  [C5, 0.5], [D5, 0.5], [Eb5, 0.75],
  // "lah a-ku ber-"
  [D5, 0.5], [C5, 0.5], [Bb4, 0.5],
  // "di-ri, ja-di"
  [A4, 0.5], [C5, 0.5], [D5, 1.0],
  // "pan-du i-bu-ku"
  [Eb5, 0.75], [D5, 0.5], [C5, 1.25],

  // ═══ VERSE 2: "Indonesia tanah pusaka..." ═══
  // Pickup
  [F4, 0.75],
  // "Indonesia"
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  // "tanah pu-"
  [C5, 0.75], [D5, 0.5],
  // "sa-ka, tanah tol-"
  [C5, 0.5], [Bb4, 0.5], [A4, 0.75],
  // "long bang-"
  [G4, 0.5], [A4, 0.5],
  // "sa-ku"
  [Bb4, 1.5],
  // "Ma-ri-lah ki-"
  [C5, 0.5], [D5, 0.5], [Eb5, 0.75],
  // "ta ber-se-ru"
  [D5, 0.5], [C5, 0.5], [Bb4, 0.5],
  // "In-do-ne-si-a"
  [A4, 0.5], [Bb4, 0.5], [C5, 0.5], [D5, 0.5],
  // "ber-sa-tu"
  [Eb5, 1.5],

  // ═══ VERSE 3: "Indonesia merdeka..." ═══
  // Pickup
  [F4, 0.75],
  // "Indonesia"
  [G4, 0.75], [A4, 0.5], [Bb4, 1.0],
  // "mer-de-ka"
  [C5, 0.5], [D5, 0.5], [Eb5, 1.0],
  // "Hai bu-"
  [D5, 0.5], [C5, 0.5],
  // "la-tan da-"
  [Bb4, 0.75], [A4, 0.5],
  // "ri-ku, yang su-"
  [Bb4, 0.5], [C5, 0.75], [D5, 0.5],
  // "ka, yang da-"
  [Eb5, 0.75], [D5, 0.5],
  // "sa-kan"
  [C5, 0.5], [Bb4, 0.75],
  // "ja-ngan"
  [C5, 0.5], [D5, 0.75],
  // "lup-pa-kan"
  [Eb5, 0.5], [F5, 0.75],
  // "se-te-rik"
  [D5, 0.5], [C5, 0.5], [Bb4, 1.0],
  // "nya"
  [A4, 1.5],

  // ═══ CHORUS: "Indonesia Raya..." ═══
  // "Indonesia Ra-"
  [Bb4, 0.75], [Bb4, 0.75],
  // "ya, mer-de-ka"
  [C5, 0.5], [D5, 0.75],
  // "mer-de-ka"
  [Eb5, 0.75], [D5, 0.5], [C5, 0.75],
  // "Ta-nah-ku ne-ga-ra-ku"
  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.75], [C5, 0.5], [D5, 1.0],
  // "yang ku-cin-ta"
  [Eb5, 0.5], [D5, 0.5], [C5, 1.5],

  // "Indonesia Ra-"
  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.5], [C5, 0.5],
  // "ya, mer-de-ka"
  [D5, 0.75],
  // "mer-de-ka"
  [Eb5, 0.75], [D5, 0.5], [C5, 0.75],
  // "Hi-dup-lah slalu-lah"
  [Bb4, 0.5], [A4, 0.5], [Bb4, 0.5], [C5, 0.5], [D5, 1.0],
  // "ba-gi-ku ne-gri-ku"
  [C5, 0.5], [Bb4, 0.5], [A4, 1.5],

  // ═══ FINAL — Grand sustain ═══
  [Bb4, 1.0], [C5, 0.75], [D5, 1.0], [Eb5, 1.5],
  // Triumphant final chord — D5 sustained
  [D5, 4.0],
]

// ═══ CHORDS — Harmonic accompaniment ═══
// Each chord: [root, durationInBeats, type]
// Types: 'major', 'minor'
const CHORDS: [number, number, string][] = [
  // Verse 1
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [F4, 4, 'major'],
  // Verse 2
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  // Verse 3
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  [G4, 4, 'minor'], [C4, 4, 'minor'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  // Chorus
  [Bb3, 4, 'major'], [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'],
  [Bb3, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 4, 'major'],
  // Final
  [Eb4, 4, 'major'], [Bb3, 4, 'major'], [F4, 4, 'major'], [Bb3, 8, 'major'],
]

// BPM and beat duration
const BPM = 100
const BEAT = 60 / BPM // 0.6 seconds per beat

// Build absolute timeline from melody
function buildTimeline(notes: [number, number][]): { freq: number; start: number; dur: number }[] {
  const timeline: { freq: number; start: number; dur: number }[] = []
  let t = 0
  for (const [note, beats] of notes) {
    timeline.push({ freq: midi(note), start: t * BEAT, dur: beats * BEAT * 0.9 }) // 0.9 for legato gap
    t += beats
  }
  return timeline
}

// Build chord timeline
function buildChordTimeline(chords: [number, number, string][]): { root: number; start: number; dur: number; type: string }[] {
  const timeline: { root: number; start: number; dur: number; type: string }[] = []
  let t = 0
  for (const [root, beats, type] of chords) {
    timeline.push({ root, start: t * BEAT, dur: beats * BEAT, type })
    t += beats
  }
  return timeline
}

// ═══ ORCHESTRAL SYNTHESIS ENGINE ═══

function playBrassMelody(
  ctx: AudioContext,
  dest: GainNode,
  notes: { freq: number; start: number; dur: number }[],
  volume: number,
  delay: number = 0,
) {
  const t0 = ctx.currentTime + delay

  for (const note of notes) {
    const nt = t0 + note.start
    const end = nt + note.dur

    // Lead oscillator — sawtooth (brass body)
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(note.freq, nt)
    // Brass "wah" — slight pitch rise on attack
    osc1.frequency.linearRampToValueAtTime(note.freq * 1.012, nt + 0.05)
    osc1.frequency.linearRampToValueAtTime(note.freq, nt + 0.15)
    // Envelope: fast attack, sustain, release
    g1.gain.setValueAtTime(0.001, nt)
    g1.gain.linearRampToValueAtTime(volume, nt + 0.05)
    g1.gain.setValueAtTime(volume * 0.75, nt + note.dur * 0.5)
    g1.gain.exponentialRampToValueAtTime(0.001, end + 0.05)
    // Bandpass for brassy color
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = note.freq * 2.0
    bp.Q.value = 0.6
    osc1.connect(bp).connect(g1).connect(dest)
    osc1.start(nt)
    osc1.stop(end + 0.1)

    // Chorus — detuned sawtooth for richness
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(note.freq * 1.004, nt)
    g2.gain.setValueAtTime(0.001, nt)
    g2.gain.linearRampToValueAtTime(volume * 0.25, nt + 0.05)
    g2.gain.exponentialRampToValueAtTime(0.001, end)
    osc2.connect(bp).connect(g2).connect(dest)
    osc2.start(nt)
    osc2.stop(end + 0.1)

    // Triangle fundamental for warmth
    const osc3 = ctx.createOscillator()
    const g3 = ctx.createGain()
    osc3.type = 'triangle'
    osc3.frequency.setValueAtTime(note.freq, nt)
    g3.gain.setValueAtTime(0.001, nt)
    g3.gain.linearRampToValueAtTime(volume * 0.5, nt + 0.06)
    g3.gain.exponentialRampToValueAtTime(0.001, end)
    osc3.connect(g3).connect(dest)
    osc3.start(nt)
    osc3.stop(end + 0.1)
  }
}

function playStringPad(
  ctx: AudioContext,
  dest: GainNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number,
  delay: number = 0,
) {
  const t0 = ctx.currentTime + delay

  for (const chord of chords) {
    const nt = t0 + chord.start
    const end = nt + chord.dur
    const root = chord.root

    // Build triad: root, third, fifth
    const isMinor = chord.type === 'minor'
    const third = isMinor ? root + 3 : root + 4 // minor 3rd vs major 3rd
    const fifth = root + 7

    for (const interval of [0, 12, 24]) { // Root + octave + double octave
      for (const noteOffset of [0, third - root, fifth - root]) {
        const freq = midi(root + interval + noteOffset)

        // 3 detuned sine waves for lush string sound
        for (const detune of [-1.5, 0, 1.5]) {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq * (1 + detune * 0.001), nt)
          // Slow vibrato for warmth
          osc.frequency.linearRampToValueAtTime(freq * (1 + detune * 0.002), end)
          const vol = volume * (interval === 0 ? 0.3 : interval === 12 ? 0.15 : 0.05)
          g.gain.setValueAtTime(0.001, nt)
          g.gain.linearRampToValueAtTime(vol, nt + 1.5) // slow attack
          g.gain.setValueAtTime(vol * 0.9, end - 1.0)
          g.gain.exponentialRampToValueAtTime(0.001, end + 0.2)
          osc.connect(g).connect(dest)
          osc.start(nt)
          osc.stop(end + 0.3)
        }
      }
    }
  }
}

function playBass(
  ctx: AudioContext,
  dest: GainNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number,
  delay: number = 0,
) {
  const t0 = ctx.currentTime + delay

  for (const chord of chords) {
    const nt = t0 + chord.start
    const end = nt + chord.dur
    const freq = midi(chord.root - 12) // One octave below

    // Sine bass
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, nt)
    g.gain.setValueAtTime(0.001, nt)
    g.gain.linearRampToValueAtTime(volume, nt + 0.1)
    g.gain.setValueAtTime(volume * 0.8, end - 0.3)
    g.gain.exponentialRampToValueAtTime(0.001, end + 0.1)
    // Low pass for warmth
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 200
    osc.connect(lp).connect(g).connect(dest)
    osc.start(nt)
    osc.stop(end + 0.2)
  }
}

function playTimpani(
  ctx: AudioContext,
  dest: GainNode,
  chords: { root: number; start: number; dur: number; type: string }[],
  volume: number,
  delay: number = 0,
) {
  const t0 = ctx.currentTime + delay

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i]
    const nt = t0 + chord.start

    // Hit on beats 1 and 3 of each measure (every chord change)
    for (const beatOffset of [0, 2 * BEAT]) {
      const hitTime = nt + beatOffset
      if (hitTime >= nt + chord.dur) continue

      const freq = midi(chord.root - 5) // Low timpani pitch

      // Timpani body
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq * 1.3, hitTime) // Start sharp
      osc.frequency.exponentialRampToValueAtTime(freq, hitTime + 0.15) // Pitch settles
      g.gain.setValueAtTime(volume * 2.0, hitTime)
      g.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.8)
      osc.connect(g).connect(dest)
      osc.start(hitTime)
      osc.stop(hitTime + 1.0)
    }
  }
}

function playOrchestralShimmer(
  ctx: AudioContext,
  dest: GainNode,
  totalDuration: number,
  volume: number,
  delay: number = 0,
) {
  const t0 = ctx.currentTime + delay

  // Ethereal high-frequency shimmer — triangle waves at very low volume
  const shimmerFreqs = [midi(C6), midi(Eb6), midi(G5), midi(Bb5)]
  for (const freq of shimmerFreqs) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t0)

    // Pulsing volume (slow tremolo)
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.3 // Very slow
    lfoGain.gain.value = volume * 0.5
    lfo.connect(lfoGain).connect(g.gain)
    lfo.start(t0)
    lfo.stop(t0 + totalDuration + 1)

    g.gain.setValueAtTime(0.001, t0)
    g.gain.linearRampToValueAtTime(volume, t0 + 3)
    g.gain.setValueAtTime(volume * 0.8, t0 + totalDuration - 3)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + totalDuration + 0.5)
    osc.connect(g).connect(dest)
    osc.start(t0)
    osc.stop(t0 + totalDuration + 1)
  }
}

// Calculate total duration
const melodyTimeline = buildTimeline(MELODY)
const chordTimeline = buildChordTimeline(CHORDS)
const TOTAL_DURATION = Math.max(
  melodyTimeline[melodyTimeline.length - 1].start + melodyTimeline[melodyTimeline.length - 1].dur,
  chordTimeline[chordTimeline.length - 1].start + chordTimeline[chordTimeline.length - 1].dur,
) + 2 // Extra 2s for final reverb tail

// ═══ HOOK ═══
export function useIndonesiaRaya() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const startRef = useRef<number>(0)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const play = useCallback((fadeDelay: number = 2.0) => {
    if (hasStarted) return // Play only once

    try {
      // Create or resume AudioContext
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext()
        masterRef.current = ctxRef.current.createGain()
        masterRef.current.gain.value = 0 // Start at 0 for fade-in
        masterRef.current.connect(ctxRef.current.destination)
      }

      const ctx = ctxRef.current
      const master = masterRef.current!

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const delay = fadeDelay
      startRef.current = ctx.currentTime + delay

      // Layer 1: Brass melody (main voice)
      playBrassMelody(ctx, master, melodyTimeline, 0.08, delay)

      // Layer 2: String pad (harmony)
      playStringPad(ctx, master, chordTimeline, 0.03, delay)

      // Layer 3: Bass (foundation)
      playBass(ctx, master, chordTimeline, 0.06, delay)

      // Layer 4: Timpani (rhythm)
      playTimpani(ctx, master, chordTimeline, 0.04, delay)

      // Layer 5: Orchestral shimmer (ethereal)
      playOrchestralShimmer(ctx, master, TOTAL_DURATION, 0.012, delay)

      // Fade in
      master.gain.setValueAtTime(0, ctx.currentTime + delay)
      master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + delay + 3)

      // Fade out near end
      const fadeOutStart = delay + TOTAL_DURATION - 4
      master.gain.setValueAtTime(0.7, ctx.currentTime + fadeOutStart)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + TOTAL_DURATION)

      setHasStarted(true)
      setIsPlaying(true)

      // Mark as finished after duration
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      finishTimerRef.current = setTimeout(() => {
        setIsPlaying(false)
        setHasFinished(true)
      }, (delay + TOTAL_DURATION) * 1000 + 500)

    } catch {
      // Audio context not available
    }
  }, [hasStarted])

  const toggle = useCallback(() => {
    if (!ctxRef.current || !masterRef.current) return
    if (isPlaying) {
      masterRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5)
      setIsPlaying(false)
    } else if (hasStarted && !hasFinished) {
      masterRef.current.gain.linearRampToValueAtTime(0.7, ctxRef.current.currentTime + 0.5)
      setIsPlaying(true)
    }
  }, [isPlaying, hasStarted, hasFinished])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      if (ctxRef.current) {
        try { ctxRef.current.close() } catch { /* already closed */ }
      }
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
