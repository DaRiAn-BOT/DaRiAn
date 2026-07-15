const NICKNAME_KEY = 'maze-player-nickname'
export const NICKNAME_EVENT = 'maze-nickname-changed'

export function loadNickname() { return localStorage.getItem(NICKNAME_KEY) }

export function saveNickname(nickname: string) {
  localStorage.setItem(NICKNAME_KEY, nickname)
  window.dispatchEvent(new CustomEvent<string>(NICKNAME_EVENT, { detail: nickname }))
}
