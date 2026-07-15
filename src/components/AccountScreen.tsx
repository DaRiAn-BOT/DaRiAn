import { useEffect, useState } from 'react'
import { Auth } from './Auth'
import { supabase } from '../lib/supabase'
import { saveNickname as saveLocalNickname } from '../lib/playerProfile'

type Props = { email: string | null; nickname: string | null; onNicknameChange: (nickname: string) => void; onClose: () => void; onGuest: () => void }

export default function AccountScreen({ email, nickname, onNicknameChange, onClose, onGuest }: Props) {
  const [name, setName] = useState(nickname ?? '')
  const [message, setMessage] = useState('')
  useEffect(() => setName(nickname ?? ''), [nickname])
  const signOut = async () => { await supabase.auth.signOut() }
  const saveNickname = async () => {
    const cleanName = name.trim()
    if (cleanName.length < 2) { setMessage('Никнейм должен быть длиннее 1 символа.'); return }
    const { error } = await supabase.auth.updateUser({ data: { nickname: cleanName } })
    if (error) setMessage('Не удалось сохранить никнейм.')
    else { saveLocalNickname(cleanName); onNicknameChange(cleanName); setMessage('Никнейм сохранён!') }
  }

  return <div className="story-card account-card"><span>♙</span><p className="eyebrow">АККАУНТ</p>
    {email ? <><h2>{nickname ?? 'Создай никнейм'}</h2><p>{email}</p><div className="nickname-editor"><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={20} placeholder="Твой никнейм" /><button onClick={saveNickname}>Сохранить ник</button></div>{message && <p className="account-message">{message}</p>}<div className="account-actions"><button className="exit-button" onClick={signOut}>Выйти из аккаунта</button><button onClick={onClose}>Назад</button></div></>
      : <><Auth /><div className="guest-divider"><span>или</span></div><button className="guest-button" onClick={onGuest}>Играть как гость</button><button className="account-back exit-button" onClick={onClose}>Назад</button></>}
  </div>
}
