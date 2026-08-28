import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { clearTokens, getToken, getRefresh, api, setTokens } from './api.js'
import { decodeToken } from './jwt.js'
import Topbar from './components/Topbar.jsx'
import Statusbar from './components/Statusbar.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import Posts from './pages/Posts.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [user, setUser] = useState(() => decodeToken(getToken()))
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!getToken()) {
      setUser(null)
    } else {
      setUser(decodeToken(getToken()))
    }
  }, [location.pathname])

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken()
      if (!token) { setUser(null); return }
      const decoded = decodeToken(token)
      if (!decoded?.exp) return
      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp - now < 120 && getRefresh()) {
        api.getPosts().catch(() => {
          clearTokens()
          setUser(null)
          navigate('/auth')
        })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [navigate])

  function logout() {
    clearTokens()
    setUser(null)
    navigate('/auth')
  }

  function onLogin(token, refreshToken) {
    setTokens(token, refreshToken)
    setUser(decodeToken(token))
    navigate('/')
  }

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/auth" element={<Auth onLogin={onLogin} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
        <div className="crt" />
      </>
    )
  }

  return (
    <div className="shell">
      <Topbar user={user} onLogout={logout} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/posts" element={<Posts user={user} />} />
          <Route path="/settings" element={<Settings user={user} onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Statusbar user={user} />
      <div className="crt" />
    </div>
  )
}
