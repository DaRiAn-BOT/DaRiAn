import { AUDIO_SETTINGS_EVENT, loadAudioSettings, type AudioSettings } from './audioSettings'

let context: AudioContext | null = null
let timer: number | null = null
let noteIndex = 0
let masterGain: GainNode | null = null
let filter: BiquadFilterNode | null = null
const activeNotes = new Set<OscillatorNode>()
const STOP_EVENT = 'maze-stop-all-music'
let sequenceId = 0

const defeatNotes = [220, 261.63, 293.66, 329.63, 246.94, 293.66, 349.23, 329.63]
const winterNotes = [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 523.25, 659.25, 783.99, 659.25, 523.25]

function startSequence(notes: number[], tempo: number, type: OscillatorType, volume: number, harmony = false) {
  window.dispatchEvent(new Event(STOP_EVENT))
  context = new AudioContext()
  const localContext = context
  const currentSequence = ++sequenceId
  masterGain = context.createGain()
  masterGain.gain.value = loadAudioSettings().music * .8
  filter = context.createBiquadFilter()
  filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .7
  masterGain.connect(filter).connect(context.destination)
  const playTone = (frequency: number, tone: OscillatorType, toneVolume: number, duration: number) => {
    if (!context || !masterGain) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = tone; oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(toneVolume, context.currentTime + .035)
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration)
    oscillator.connect(gain).connect(masterGain)
    activeNotes.add(oscillator); oscillator.onended = () => activeNotes.delete(oscillator)
    oscillator.start(); oscillator.stop(context.currentTime + duration + .03)
  }
  const playNote = () => {
    if (!context || !masterGain) return
    const frequency = notes[noteIndex % notes.length]
    playTone(frequency, type, volume, tempo / 1000 * .9)
    if (harmony && noteIndex % 4 === 0) playTone(frequency / 2, 'sine', volume * .55, tempo / 1000 * 3.5)
    noteIndex += 1
  }
  void localContext.resume().then(() => {
    if (context !== localContext || currentSequence !== sequenceId) return
    playNote()
    timer = window.setInterval(playNote, tempo)
  })
}

export function startMusic() {
  startSequence(defeatNotes, 250, 'triangle', .026, true)
}

export function startExplorationMusic() {
  startSequence(winterNotes, 310, 'sine', .032, true)
}

function stopLocalMusic() {
  sequenceId += 1
  if (timer !== null) window.clearInterval(timer)
  timer = null; noteIndex = 0
  if (masterGain && context) masterGain.gain.setValueAtTime(0, context.currentTime)
  activeNotes.forEach((note) => { try { note.stop() } catch { /* Нота уже завершилась */ } })
  activeNotes.clear()
  masterGain?.disconnect(); masterGain = null
  filter?.disconnect(); filter = null
  const oldContext = context; context = null
  if (oldContext) void oldContext.close()
}

export function stopMusic() {
  window.dispatchEvent(new Event(STOP_EVENT))
}

window.addEventListener(STOP_EVENT, stopLocalMusic)
const updateVolume = (event: Event) => {
  const settings = (event as CustomEvent<AudioSettings>).detail
  if (masterGain && context) masterGain.gain.setTargetAtTime(settings.music * .8, context.currentTime, .04)
}
window.addEventListener(AUDIO_SETTINGS_EVENT, updateVolume)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopLocalMusic()
    window.removeEventListener(STOP_EVENT, stopLocalMusic)
    window.removeEventListener(AUDIO_SETTINGS_EVENT, updateVolume)
  })
}
