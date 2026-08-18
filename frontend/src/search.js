// fuzzy search: query words don't need to match the title exactly
// score titles + content by token overlap, partial word matches count
export function fuzzySearch(posts, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return posts

  const tokens = q.split(/\s+/).filter(Boolean)

  return posts
    .map((post) => {
      const title = (post.title || '').toLowerCase()
      const content = (post.content || '').toLowerCase()
      let score = 0

      if (title === q) score += 100
      else if (title.includes(q)) score += 80
      else if (content.includes(q)) score += 40

      let hits = 0
      for (const tok of tokens) {
        if (title.includes(tok)) {
          hits += 1
          score += 12
        } else if (title.split(/\s+/).some((w) => w.startsWith(tok) || tok.startsWith(w))) {
          hits += 1
          score += 8
        } else if (content.includes(tok)) {
          hits += 1
          score += 6
        }
      }

      if (hits === tokens.length && hits > 1) score += 10

      return { post, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.post)
}
