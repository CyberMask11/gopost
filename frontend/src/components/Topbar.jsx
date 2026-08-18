import { NavLink } from 'react-router-dom'

export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="logo">
          <span className="slash">&gt;_</span> GOPOST<span className="slash">_</span>
        </div>
        <nav className="navlinks">
          <NavLink to="/" end>home</NavLink>
          <NavLink to="/posts">posts</NavLink>
          <NavLink to="/users">users</NavLink>
          <NavLink to="/settings">settings</NavLink>
        </nav>
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
