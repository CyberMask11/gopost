import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import PostCard from '../components/PostCard.jsx'

const empty = { title: '', content: '' }

export default function Home({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const postsRes = await api.getPosts()
      setPosts((postsRes?.posts || []).filter((p) => p.userid === user.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { load() }, [load])

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function startEdit(post) {
    setEditing(post)
    setForm({ title: post.title, content: post.content })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(empty)
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title required.'); return }
    setBusy(true)
    setError('')
    try {
      if (editing) {
        await api.updatePost(editing.id, { title: form.title, content: form.content })
      } else {
        await api.createPost({ title: form.title, content: form.content })
      }
      setForm(empty)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(post) {
    if (!window.confirm(`DELETE post "${post.title}"? THIS CANNOT BE UNDONE.`)) return
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
          <span className="glitch" data-text="MY POSTS">MY POSTS</span>
          <span className="tag">{posts.length} FILE{posts.length === 1 ? '' : 'S'}</span>
        </h1>
        <p>Everything you dropped on the network, under your handle @ {user.username}.</p>
        <hr className="rule" />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="panel">
        <h2>{editing ? `edit file #${editing.id.slice(0, 6)}` : 'new post'}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label>title</label>
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder="untitled transmission"
              spellCheck="false"
              maxLength="120"
            />
          </div>
          <div className="field">
            <label>contents</label>
            <textarea
              name="content"
              value={form.content}
              onChange={change}
              placeholder="write your message here..."
              spellCheck="false"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" disabled={busy}>
              {busy ? 'sending...' : editing ? '>> commit changes' : '>> transmit'}
            </button>
            {editing && (
              <button type="button" className="btn ghost" onClick={cancelEdit}>abort</button>
            )}
          </div>
        </form>
      </div>

      <div className="ticker">
        <span className="t-red">[*]</span> QUERY: SELECT * FROM posts WHERE userid = '{user.id}'
      </div>

      {loading ? (
        <div className="loading">fetching</div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <span className="big">// no files on record</span>
          Drop your first post above.
        </div>
      ) : (
        <div className="cards">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              author={user.username}
              canManage
              onEdit={startEdit}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </>
  )
}
