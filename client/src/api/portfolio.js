const API_URL = import.meta.env.VITE_API_URL

export async function fetchPublicProfile(username) {
  const res = await fetch(`${API_URL}/auth/public/${username}`)

  if (res.status === 404) {
    throw new Error('USER_NOT_FOUND')
  }

  if (!res.ok) {
    throw new Error('FETCH_FAILED')
  }

  return res.json()
}