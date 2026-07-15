import { useEffect, useState } from 'react'

export type GameLanguage = 'ru' | 'en' | 'kk'

const STORAGE_KEY = 'maze-language'
export const LANGUAGE_EVENT = 'maze-language-changed'

export function loadLanguage(): GameLanguage {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'kk' ? saved : 'ru'
}

export function saveLanguage(language: GameLanguage) {
  localStorage.setItem(STORAGE_KEY, language)
  document.documentElement.lang = language
  window.dispatchEvent(new CustomEvent<GameLanguage>(LANGUAGE_EVENT, { detail: language }))
}

export function useLanguage() {
  const [language, setLanguage] = useState<GameLanguage>(loadLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    const update = (event: Event) => setLanguage((event as CustomEvent<GameLanguage>).detail)
    window.addEventListener(LANGUAGE_EVENT, update)
    return () => window.removeEventListener(LANGUAGE_EVENT, update)
  }, [language])

  return language
}
