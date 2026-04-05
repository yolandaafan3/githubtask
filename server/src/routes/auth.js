import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const CLIENT_URL = process.env.CLIENT_URL

// Paso 1: Redirige al usuario a GitHub para pedir autorización
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'read:user user:email repo',
    allow_signup: 'true',
  })

  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

// Paso 2: GitHub redirige aquí con un "code" temporal
router.get('/callback', async (req, res) => {
  const { code } = req.query

  if (!code) {
    return res.redirect(`${CLIENT_URL}/login?error=no_code`)
  }

  try {
    // Intercambia el code por un access token real
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    )

    const { access_token, error } = tokenResponse.data

    if (error || !access_token) {
      return res.redirect(`${CLIENT_URL}/login?error=token_failed`)
    }

    // Obtén los datos del usuario desde GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github+json',
      },
    })

    const user = userResponse.data

    // Redirige al frontend con el token y datos del usuario en la URL
    const params = new URLSearchParams({
      token: access_token,
      user: JSON.stringify({
        id: user.id,
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
      }),
    })

    res.redirect(`${CLIENT_URL}/auth/success?${params}`)

  } catch (err) {
    console.error('OAuth error:', err.message)
    res.redirect(`${CLIENT_URL}/login?error=server_error`)
  }
})

// Endpoint para verificar si un token sigue siendo válido
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false })
  }

  const token = authHeader.split(' ')[1]

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })

    res.json({ valid: true, user: response.data })
  } catch {
    res.status(401).json({ valid: false })
  }
})


// ── Perfil público ────────────────────────────────────────────
// No requiere autenticación — datos públicos de GitHub
router.get('/public/:username', async (req, res) => {
  const { username } = req.params

  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    // Si tienes un token de GitHub en el servidor lo usas para
    // aumentar el rate limit (opcional pero recomendado)
    if (process.env.GITHUB_PUBLIC_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PUBLIC_TOKEN}`
    }

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(`https://api.github.com/users/${username}/repos`, {
        headers,
        params: { per_page: 100, sort: 'updated', type: 'public' },
      }),
    ])

    const user  = userRes.data
    const repos = reposRes.data

    // Estadísticas calculadas
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
    const totalForks = repos.reduce((s, r) => s + r.forks_count,      0)
    const languages  = {}
    repos.forEach(r => {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + 1
    })
    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang, count]) => ({ lang, count }))

    res.json({
      user: {
        login:        user.login,
        name:         user.name || user.login,
        avatar_url:   user.avatar_url,
        bio:          user.bio,
        location:     user.location,
        blog:         user.blog,
        twitter_username: user.twitter_username,
        company:      user.company,
        public_repos: user.public_repos,
        followers:    user.followers,
        following:    user.following,
        created_at:   user.created_at,
        html_url:     user.html_url,
      },
      repos: repos
        .filter(r => !r.fork) // excluye forks por defecto
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 12)
        .map(r => ({
          id:               r.id,
          name:             r.name,
          description:      r.description,
          html_url:         r.html_url,
          language:         r.language,
          stargazers_count: r.stargazers_count,
          forks_count:      r.forks_count,
          open_issues_count: r.open_issues_count,
          updated_at:       r.updated_at,
          topics:           r.topics,
        })),
      stats: {
        totalStars,
        totalForks,
        totalRepos: user.public_repos,
        topLanguages,
      },
    })
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'User not found' })
    }
    console.error('Public profile error:', err.message)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})
export default router