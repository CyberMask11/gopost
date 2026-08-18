import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { fuzzySearch } from '../search.js'
import PostCard from '../components/PostCard.jsx'

export default function Posts({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [busy, setBusy] = useState(false)
  const [nameMap, setNameMap] = useState({})

  const load = useCallback(async () => {
    try {
      const [postsRes, usersRes] = await Promise.all([api.getPosts(), api.getUsers()])
      setPosts(postsRes?.posts || [])
      setNameMap(
        Object.fromEntries(
          (Array.isArray(usersRes) ? usersRes : []).map((u) => [u.id, u.username])
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const results = useMemo(() => fuzzySearch(posts, query), [posts, query])

  const authorOf = (p) => nameMap[p.userid] || p.username

  function startEdit(post) {
    setEditing(post)
    setForm({ title: post.title, content: post.content })
    setError('')
  }

  async function commitEdit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title required.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api.updatePost(editing.id, { title: form.title, content: form.content })
      setEditing(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(post) {
    if (!window.confirm(`DELETE post "${post.title}" by @${authorOf(post)}?`)) return
    try {
      await api.deletePost(post.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="pagehead">
        <h1>
          <span className="glitch" data-text="ALL POSTS">ALL POSTS</span>
          <span className="tag">{results.length} MATCH{results.length === 1 ? '' : 'ES'}</span>
        </h1>
        <p>
          Network-wide traffic. Search is fuzzy: partial words and loose phrases
          still surface the files you are hunting.
        </p>
        <hr className="rule" />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="searchbar">
        <span className="prompt">&gt;</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search posts... e.g. breach, exploit or 'memory leak'"
          spellCheck="false"
        />
        {query && (
          <button className="clear" onClick={() => setQuery('')} aria-label="clear">
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">fetching</div>
      ) : results.length === 0 ? (
        <div className="empty">
          <span className="big">// no hits</span>
          {query ? `Nothing matched "${query}". Loosen the terms.` : 'The network is silent. No posts yet.'}
        </div>
      ) : (
        <>
          {editing && (
            <div className="panel">
              <h2>edit file #{editing.id.slice(0, 6)}</h2>
              <form onSubmit={commitEdit}>
                <div className="field">
                  <label>title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    spellCheck="false"
                    maxLength="120"
                  />
                </div>
                <div className="field">
                  <label>contents</label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    spellCheck="false"
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" disabled={busy}>
                    {busy ? 'committing...' : '>> commit changes'}
                  </button>
                  <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
                    abort
                  </button>
                </div>
              </form>
            </div>
          )}
          <div className="cards">
            {results.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                author={authorOf(p)}
                canManage={user.role === 'admin' || p.userid === user.id}
                onEdit={startEdit}
                onDelete={remove}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
