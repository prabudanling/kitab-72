'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// INDONESIA RAYA — Real Orchestral Recording Background Music
//
// Uses actual MP3 file from Wikimedia Commons (4:30, full 3-verse
// orchestral + vocal recording) via HTML5 <audio> element.
//
// Two-phase approach for browser autoplay policy:
//   prepare()  — MUST be called inside user gesture (click/tap)
//   play()     — can be called anytime after prepare()
// ═══════════════════════════════════════════════════════════════

// Public audio file path
const AUDIO_SRC = '/indonesia-raya-full.mp3'

export function useIndonesiaRaya() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)

  // Refs — never stale
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preparedRef = useRef(false)
  const startedRef = useRef(false)
  const mutedRef = useRef(false)

  /**
   * PREPARE — MUST be called inside a user gesture (click/tap).
   * Creates Audio element and loads the source while we're still
   * in the gesture handler, so the browser allows playback.
   */
  const prepare = useCallback(() => {
    if (preparedRef.current) {
      console.log('[IndonesiaRaya] prepare() — already prepared, skipping')
      return
    }

    console.log('[IndonesiaRaya] prepare() — creating Audio element inside user gesture...')

    try {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.loop = false
      audio.volume = 0 // Start silent for fade-in

      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        console.log('[IndonesiaRaya] Audio ready to play')
      })

      audio.addEventListener('ended', () => {
        console.log('[IndonesiaRaya] Finished playing')
        setIsPlaying(false)
        setHasFinished(true)
        startedRef.current = false
        preparedRef.current = false
      })

      audio.addEventListener('error', (e) => {
        console.error('[IndonesiaRaya] Audio error:', audio.error)
        startedRef.current = false
        preparedRef.current = false
      })

      // Set source — this loads the file
      audio.src = AUDIO_SRC
      audioRef.current = audio
      preparedRef.current = true

      console.log('[IndonesiaRaya] prepare() — Audio element created. Loading:', AUDIO_SRC)
    } catch (err) {
      console.error('[IndonesiaRaya] prepare() failed:', err)
    }
  }, [])

  /**
   * PLAY — Start playback with fade-in.
   * Can be called anytime AFTER prepare() has been called.
   */
  const play = useCallback((fadeDelay: number = 0.5) => {
    if (startedRef.current) {
      console.log('[IndonesiaRaya] play() — already started, skipping')
      return
    }
    if (!preparedRef.current || !audioRef.current) {
      console.warn('[IndonesiaRaya] play() — not prepared yet! Call prepare() during user gesture first.')
      return
    }

    startedRef.current = true
    const audio = audioRef.current

    console.log('[IndonesiaRaya] play() — starting with', fadeDelay, 's fade-in')

    // Play and then fade in
    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('[IndonesiaRaya] Playback started successfully!')
        setHasStarted(true)
        setIsPlaying(true)

        // Fade in over 3 seconds
        const fadeInterval = setInterval(() => {
          if (audio.volume < 0.95) {
            audio.volume = Math.min(audio.volume + 0.05, 1.0)
          } else {
            audio.volume = 1.0
            clearInterval(fadeInterval)
          }
        }, 150) // 150ms × 20 steps = 3 seconds
      }).catch((err) => {
        console.error('[IndonesiaRaya] play() promise rejected:', err)
        startedRef.current = false
        preparedRef.current = false
      })
    }
  }, [])

  /**
   * TOGGLE MUTE — Mute/unmute the anthem
   */
  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !startedRef.current) return

    mutedRef.current = !mutedRef.current
    if (mutedRef.current) {
      audio.volume = 0
      setIsPlaying(false)
    } else {
      // Fade back in
      const fadeInterval = setInterval(() => {
        if (audio.volume < 0.95) {
          audio.volume = Math.min(audio.volume + 0.1, 1.0)
        } else {
          audio.volume = 1.0
          clearInterval(fadeInterval)
        }
      }, 100)
      setIsPlaying(true)
    }
  }, [])

  /**
   * STOP — Stop and clean up
   */
  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      // Fade out over 1 second
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(audio.volume - 0.1, 0)
        } else {
          audio.pause()
          audio.currentTime = 0
          clearInterval(fadeInterval)
        }
      }, 100)
    }
    audioRef.current = null
    preparedRef.current = false
    startedRef.current = false
    mutedRef.current = false
    setIsPlaying(false)
    setHasStarted(false)
  }, [])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return {
    isPlaying,
    hasStarted,
    hasFinished,
    prepare,  // ← Call during user gesture!
    play,     // ← Call after prepare(), anytime
    toggle,
    stop,
    totalDuration: 270, // 4:30 in seconds
  }
}
