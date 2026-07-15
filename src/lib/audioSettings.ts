export type AudioSettings = { music: number; effects: number }

const STORAGE_KEY = 'maze-audio-settings'
export const AUDIO_SETTINGS_EVENT = 'maze-audio-settings-changed'
const defaults: AudioSettings = { music: .7, effects: .7 }

export function loadAudioSettings(): AudioSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<AudioSettings>
    return { music: clamp(saved.music ?? defaults.music), effects: clamp(saved.effects ?? defaults.effects) }
  } catch { return defaults }
}

export function saveAudioSettings(settings: AudioSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent<AudioSettings>(AUDIO_SETTINGS_EVENT, { detail: settings }))
}

function clamp(value: number) { return Math.max(0, Math.min(1, value)) }
