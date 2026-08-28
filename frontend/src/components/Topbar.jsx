import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { api } from '../api.js'

export default function Topbar({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    api.getUsers().then((res) => {
      setUsers(Array.isArray(res) ? res : [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return users.filter((u) => u.username.toLowerCase().includes(q))
  }, [users, query])

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="logo">
          <span className="slash">&gt;_</span> GOPOST<span className="slash">_</span>
        </div>
        <nav className="navlinks">
          <NavLink to="/" end>home</NavLink>
          <NavLink to="/posts">posts</NavLink>
          <NavLink to="/settings">settings</NavLink>
        </nav>
        <div className="topsearch" ref={ref}>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
            placeholder="find user..."
            spellCheck="false"
          />
          {open && query && (
            <div className="topsearch-dropdown">
              {matched.length === 0 ? (
                <div className="topsearch-empty">// no match</div>
              ) : (
                matched.map((u) => (
                  <div className="topsearch-row" key={u.id}>
                    <span className="topsearch-icon">{u.username[0].toUpperCase()}</span>
                    <span className="topsearch-name">@ {u.username}</span>
                    {u.id === user.id && (
                      <span className="topsearch-role">{u.role}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="topuser">
          <span className="whoami">
            <b>{user.username}</b>
            <em>{user.role}</em>
          </span>
          <button className="btn-ghost" onClick={onLogout}>exit</button>
        </div>
      </div>
    </header>
  )
}
