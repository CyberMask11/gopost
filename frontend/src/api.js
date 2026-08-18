const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const TOKEN_KEY = 'gopost_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

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
