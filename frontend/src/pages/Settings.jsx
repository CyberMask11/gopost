import { useState } from 'react'
import { api } from '../api.js'

export default function Settings({ user, onLogout }) {
  const [username, setUsername] = useState(user.username)
  const [newPass, setNewPass] = useState('')
  const [currentPass, setCurrentPass] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function updateAccount(e) {
    e.preventDefault()
    setError('')
    setOk('')

    if (!currentPass) {
      setError('Confirm your current password.')
      return
    }
    if (!username.trim()) {
      setError('Username cannot be empty.')
      return
    }

    setBusy(true)
    try {
      const password = newPass || currentPass
      await api.updateUser(user.id, { username: username.trim(), password, role: user.role })

      if (username.trim() !== user.username || newPass) {
        const res = await api.login({ username: username.trim(), password })
        localStorage.setItem('gopost_token', res.token)
        window.location.reload()
        return
      }

      setNewPass('')
      setCurrentPass('')
      setOk('Account details saved. You are still authenticated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        `WARNING: This will permanently delete @${user.username} from the network.\n\nThis cannot be undone. Continue?`
      )
    ) {
      return
    }
    setDeleting(true)
    setError('')
    setOk('')
    try {
      await api.deleteUser(user.id)
      onLogout()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="pagehead">
        <h1>
          <span className="glitch" data-text="SETTINGS">SETTINGS</span>
          <span className="tag">ACCOUNT_CFG</span>
        </h1>
        <p>Change your handle, rotate your passphrase, or burn your identity from the network.</p>
        <hr className="rule" />
      </div>

      {error && <div className="form-error">{error}</div>}
      {ok && <div className="form-ok">{ok}</div>}

      <div className="panel">
        <h2>update credentials</h2>
        <form onSubmit={updateAccount}>
          <div className="field">
            <label>username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              spellCheck="false"
              maxLength="50"
            />
          </div>
          <div className="field">
            <label>new password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="leave blank to keep current"
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label>current password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="required to commit changes"
              autoComplete="current-password"
            />
          </div>
          <button className="btn" disabled={busy}>
            {busy ? 'committing...' : '>> commit changes'}
          </button>
        </form>
      </div>

      <div className="panel" style={{ borderColor: 'var(--red-dark)' }}>
        <h2>danger zone</h2>
        <p style={{ color: 'var(--dim)', fontSize: 12.5, marginBottom: 16 }}>
          Removes your identity and all access. Posts you dropped remain on the
          network under your old handle.
        </p>
        <button className="btn danger" onClick={deleteAccount} disabled={deleting}>
          {deleting ? 'purging...' : '>> delete account'}
        </button>
      </div>
    </>
  )
}
