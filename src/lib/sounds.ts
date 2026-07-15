import { loadAudioSettings } from './audioSettings'

let audio: AudioContext | null = null

function tone(frequency: number, duration: number, type: OscillatorType, volume = .05, endFrequency?: number) {
  audio ??= new AudioContext()
  void audio.resume()
  const oscillator = audio.createOscillator(); const gain = audio.createGain()
  oscillator.type = type; oscillator.frequency.value = frequency
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audio.currentTime + duration)
  const effectsVolume = loadAudioSettings().effects
  gain.gain.setValueAtTime(effectsVolume === 0 ? .001 : volume * effectsVolume * 6.25, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration)
  oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration)
}

export const sounds = {
  step: () => tone(105, .07, 'sine', .025, 75),
  attack: () => tone(260, .13, 'sawtooth', .045, 95),
  shield: () => tone(180, .18, 'triangle', .055, 420),
  hit: () => tone(90, .16, 'square', .035, 55),
  pickup: () => { tone(440, .16, 'sine', .045, 660); window.setTimeout(() => tone(660, .2, 'sine', .04, 880), 100) },
  menu: () => tone(330, .09, 'sine', .035, 440),
  victory: () => [0, 120, 240].forEach((delay, index) => window.setTimeout(() => tone([523, 659, 784][index], .3, 'triangle', .05), delay)),
}
