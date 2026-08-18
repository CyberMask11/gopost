import { useState } from 'react'
import { api } from '../api.js'

const ASCII = String.raw`
  _______  ____  ____  ___  ____  _____ _______
 / ____/ / __ \/ __ \/   |/  _/ / __ \/ ____/
/ /_    / /_/ / /_/ / /| |/ /  / /_/ / / ___
/ __/   / ____/ ____/ ___ |/ /__/ ____/ /_/  _
/_/    /_/   /_/   /_/  |_/____/_/   \____/(_)
`

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setError('Passwords do not match.')
        return
      }
      if (!form.username || !form.password) {
        setError('Username and password are required.')
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const res = await api.login({ username: form.username, password: form.password })
        onLogin(res.token)
      } else {
        await api.register({ username: form.username, password: form.password })
        const res = await api.login({ username: form.username, password: form.password })
        onLogin(res.token)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <pre className="ascii">{ASCII}</pre>
        <h1>
          GOPOST<span className="underscore">_</span>
        </h1>
        <p>
          A message board running on a black site protocol. Authenticate to read
          the network, drop your posts, and leave a trace. Everything you type
          here stays in the system.
        </p>
        <div className="sysline">
          [ AUTH_01 ] [ TLS 1.3 ] [ NODE: {window.location.hostname} ] [ CLEARANCE REQUIRED ]
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError('') }}
            >
              login
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setError('') }}
            >
              register
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>username</label>
              <input
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={change}
                placeholder="root"
                spellCheck="false"
              />
            </div>
            <div className="field">
              <label>password</label>
              <input
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={change}
                placeholder="••••••••"
              />
            </div>
            {mode === 'register' && (
              <div className="field">
                <label>confirm password</label>
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={change}
                  placeholder="••••••••"
                />
              </div>
            )}
            <button className="btn full" disabled={busy}>
              {busy ? 'processing...' : mode === 'login' ? '>> authenticate' : '>> create identity'}
            </button>
          </form>

          <div className="hint">
            {mode === 'login'
              ? 'No account? Switch to REGISTER and claim a handle.'
              : 'Handle claimed. You will be logged in immediately.'}
          </div>
        </div>
      </div>
    </div>
  )
}
