// Self-contained Web Audio API synthesizer for mission-control alerts and HUD sounds

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playAlertBeep() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'square'

    // Alternating high-urgency tone (880Hz to 660Hz)
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15)
    osc1.frequency.setValueAtTime(880, now + 0.18)
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.35)

    osc2.frequency.setValueAtTime(660, now)
    osc2.frequency.exponentialRampToValueAtTime(330, now + 0.15)
    osc2.frequency.setValueAtTime(660, now + 0.18)
    osc2.frequency.exponentialRampToValueAtTime(330, now + 0.35)

    gainNode.gain.setValueAtTime(0.2, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.45)
    osc2.stop(now + 0.45)
  } catch (e) {
    console.warn('Audio feedback failed:', e)
  }
}

export function playCountdownTick(critical = false) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(critical ? 1200 : 800, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05)

    gainNode.gain.setValueAtTime(critical ? 0.25 : 0.12, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  } catch (e) {
    console.warn('Audio tick failed:', e)
  }
}

export function playAcceptChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 ascending fanfare

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const noteTime = now + idx * 0.09

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, noteTime)

      gain.gain.setValueAtTime(0.18, noteTime)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(noteTime)
      osc.stop(noteTime + 0.25)
    })
  } catch (e) {
    console.warn('Audio chime failed:', e)
  }
}

export function playRadioSquelch() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Noise buffer for radio burst
    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2400
    filter.Q.value = 3.0

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.08)
  } catch (e) {
    console.warn('Radio static failed:', e)
  }
}

export function playButtonClick() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03)

    gainNode.gain.setValueAtTime(0.08, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.03)
  } catch (e) {
    console.warn('Button click audio failed:', e)
  }
}
