const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const TOKEN_KEY = 'gopost_token'
export const REFRESH_KEY = 'gopost_refresh'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefresh() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(t, r) {
  localStorage.setItem(TOKEN_KEY, t)
  if (r) localStorage.setItem(REFRESH_KEY, r)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

function authHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function doRefresh() {
  const r = getRefresh()
  if (!r) throw new Error('no refresh token')
  const res = await fetch(`${BASE}/refreshtoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: r }),
  })
  if (!res.ok) throw new Error('refresh failed')
  const data = await res.json()
  if (!data.token) throw new Error('refresh failed')
  localStorage.setItem(TOKEN_KEY, data.token)
  return data.token
}

async function request(method, path, body, _retried = false) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !_retried) {
    try {
      const newToken = await doRefresh()
      const retry = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const t = await retry.text()
        let d = null
        try { d = JSON.parse(t) } catch { d = t }
        throw new Error(typeof d === 'object' && d?.error ? d.error : retry.statusText)
      }
      const text = await retry.text()
      try { return JSON.parse(text) } catch { return text }
    } catch {
      clearTokens()
      throw new Error('session expired')
    }
  }

  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { data = text }

  if (!res.ok) {
    const msg = typeof data === 'object' && data?.error ? data.error : res.statusText
    throw new Error(msg)
  }

  return data
}

export const api = {
  register: (u) => request('POST', '/register', u),
  login: (u) => request('POST', '/login', u),
  getUsers: () => request('GET', '/users'),
  updateUser: (id, u) => request('PUT', `/update/${id}`, u),
  deleteUser: (id) => request('DELETE', `/delete/${id}`),
  getPosts: () => request('GET', '/posts'),
  createPost: (p) => request('POST', '/post', p),
  updatePost: (id, p) => request('PUT', `/postupdate/${id}`, p),
  deletePost: (id) => request('DELETE', `/postdelete/${id}`),
}
