export default function PostCard({ post, author, canManage, onEdit, onDelete }) {
  return (
    <article className="card">
      <div className="meta">
        <span className="who">@ {author || post.username}</span>
        <span>ID: {post.id.slice(0, 6)}</span>
      </div>
      <h3>{post.title}</h3>
      <div className="body-text">{post.content}</div>
      {canManage && (
        <div className="actions">
          <button className="btn small" onClick={() => onEdit(post)}>edit</button>
          <button className="btn small danger" onClick={() => onDelete(post)}>delete</button>
        </div>
      )}
    </article>
  )
}
