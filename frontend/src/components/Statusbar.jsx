import { useEffect, useState } from 'react'
import { getToken } from '../api.js'
import { decodeToken } from '../jwt.js'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function Statusbar() {
  const now = useNow()
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  const user = decodeToken(getToken())
  const stamp = now.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <footer className="statusbar">
      <span><span className="dot">■</span> GOPOST_BREACH v0.1</span>
      <span>LINK: {online ? 'UP' : 'DOWN'}</span>
      <span>SYS: <b>OK</b></span>
      <span className="right">
        <span>UID: <b>{user ? user.id.slice(0, 8) : '----'}</b></span>
        <span>T+ {stamp}</span>
      </span>
    </footer>
  )
}
