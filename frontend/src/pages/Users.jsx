import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'

export default function Users({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await api.getUsers()
      setUsers(Array.isArray(res) ? res : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [users, query])

  const adminCount = users.filter((u) => u.role === 'admin').length

  return (
    <>
      <div className="pagehead">
        <h1>
          <span className="glitch" data-text="USERS">USERS</span>
          <span className="tag">{results.length} ON RECORD</span>
        </h1>
        <p>Registered identities on the network. {adminCount} hold admin clearance.</p>
        <hr className="rule" />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="searchbar">
        <span className="prompt">&gt;</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search users by handle or id..."
          spellCheck="false"
        />
        {query && (
          <button className="clear" onClick={() => setQuery('')} aria-label="clear">
            ✕
          </button>
        )}
      </div>

      <div className="ticker">
        <span className="t-red">[*]</span> NODES ACTIVE: {results.length}
      </div>

      {loading ? (
        <div className="loading">fetching</div>
      ) : results.length === 0 ? (
        <div className="empty">
          <span className="big">// nothing found</span>
          {query ? `No identity matches "${query}".` : 'No users have registered yet.'}
        </div>
      ) : (
        <div className="userlist">
          {results.map((u) => (
            <div className="userrow" key={u.id}>
              <div className="uicon">{u.username.slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div className="uname">
                  @ {u.username}
                  {u.role === 'admin' && <span className="badge-admin">admin</span>}
                </div>
                <div className="uinfo">
                  uid <b>{u.id.slice(0, 8)}</b>
                  {u.id === user.id && <span> &nbsp;// that's you</span>}
                </div>
              </div>
              <div className="uinfo">
                clearance: <b>{u.role}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
