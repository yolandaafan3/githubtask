const API_URL = import.meta.env.VITE_API_URL

export async function registerWebhook(owner, repo, userId, token) {
  const res = await fetch(`${API_URL}/webhook/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ owner, repo, userId, token }),
  })
  if (!res.ok) throw new Error('Failed to register webhook')
  return res.json()
}

export async function unregisterWebhook(owner, repo, userId, token) {
  const res = await fetch(`${API_URL}/webhook/unregister`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ owner, repo, userId, token }),
  })
  if (!res.ok) throw new Error('Failed to unregister webhook')
  return res.json()
}

export async function getWebhookStatus(owner, repo, userId) {
  const res = await fetch(`${API_URL}/webhook/status/${owner}/${repo}/${userId}`)
  if (!res.ok) return { active: false }
  return res.json()
}