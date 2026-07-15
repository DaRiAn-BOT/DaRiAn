import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveNickname } from '../lib/playerProfile';

// Вход и регистрация по email + паролю. Это пример — Codex поможет улучшить (Google-вход и т.д.).
export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const fn =
        mode === 'signup'
          ? supabase.auth.signUp({ email, password, options: { data: { nickname: nickname.trim() } } })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) setMessage(error.message);
      else if (mode === 'signup') { saveNickname(nickname.trim()); setMessage('Готово! Проверь почту, если нужна подтверждалка.'); }
    } catch {
      setMessage('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setMessage('Не удалось открыть вход через Google.'); setBusy(false); }
  }

  return (
    <section className="auth-form">
      <h2>{mode === 'signin' ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit} className="form">
        {mode === 'signup' && <input type="text" placeholder="никнейм" value={nickname} onChange={(e) => setNickname(e.target.value)} minLength={2} maxLength={20} required />}
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-field"><input
          type={showPassword ? 'text' : 'password'}
          placeholder="пароль (6+ символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? 'Скрыть' : 'Показать'}</button></div>
        <button type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      <div className="oauth-divider"><span>или</span></div>
      <button className="google-auth" onClick={signInWithGoogle} disabled={busy}><b>G</b> Продолжить с Google</button>
      {message && <p className="message">{message}</p>}
      <button
        className="ghost"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войти'}
      </button>
    </section>
  );
}
