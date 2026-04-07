import express  from 'express'
import crypto   from 'crypto'
import axios    from 'axios'
import dotenv   from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { broadcastToUser } from '../index.js'

dotenv.config()

const router   = express.Router()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ── Verificar firma del webhook ───────────────────────────────
function verifySignature(secret, payload, signature) {
  const hmac     = crypto.createHmac('sha256', secret)
  const digest   = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  )
}

// ── Registrar webhook en un repo ─────────────────────────────
router.post('/register', async (req, res) => {
  const { owner, repo, userId, token } = req.body

  if (!owner || !repo || !userId || !token) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    // Verifica si ya hay un webhook registrado
    const { data: existing } = await supabase
      .from('repo_webhooks')
      .select('*')
      .eq('user_github_id', userId)
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .single()

    if (existing) {
      return res.json({ ok: true, alreadyRegistered: true })
    }

    // Genera un secret único para este webhook
    const secret      = crypto.randomBytes(32).toString('hex')
    const callbackUrl = `${process.env.SERVER_PUBLIC_URL}/webhook/github`

    // Crea el webhook en GitHub
    const { data: hookData } = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/hooks`,
      {
        name:   'web',
        active: true,
        events: ['issues', 'issue_comment', 'pull_request'],
        config: {
          url:          callbackUrl,
          content_type: 'json',
          secret,
          insecure_ssl: '0',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        'application/vnd.github+json',
        },
      }
    )

    // Guarda en Supabase
    await supabase.from('repo_webhooks').insert({
      user_github_id: userId,
      repo_owner:     owner,
      repo_name:      repo,
      webhook_id:     hookData.id,
      secret,
    })

    res.json({ ok: true, webhookId: hookData.id })
  } catch (err) {
    console.error('Register webhook error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to register webhook' })
  }
})

// ── Eliminar webhook de un repo ──────────────────────────────
router.post('/unregister', async (req, res) => {
  const { owner, repo, userId, token } = req.body

  try {
    const { data: hook } = await supabase
      .from('repo_webhooks')
      .select('*')
      .eq('user_github_id', userId)
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .single()

    if (!hook) return res.json({ ok: true })

    // Elimina en GitHub
    await axios.delete(
      `https://api.github.com/repos/${owner}/${repo}/hooks/${hook.webhook_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {}) // Si ya no existe en GitHub, ignorar

    // Elimina en Supabase
    await supabase.from('repo_webhooks').delete()
      .eq('user_github_id', userId)
      .eq('repo_owner', owner)
      .eq('repo_name', repo)

    res.json({ ok: true })
  } catch (err) {
    console.error('Unregister error:', err.message)
    res.status(500).json({ error: 'Failed to unregister webhook' })
  }
})

// ── Verificar si un repo tiene webhook activo ────────────────
router.get('/status/:owner/:repo/:userId', async (req, res) => {
  const { owner, repo, userId } = req.params
  try {
    const { data } = await supabase
      .from('repo_webhooks')
      .select('id, created_at')
      .eq('user_github_id', userId)
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .single()

    res.json({ active: !!data, createdAt: data?.created_at })
  } catch {
    res.json({ active: false })
  }
})

// ── Recibir eventos de GitHub ────────────────────────────────
router.post('/github', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-hub-signature-256']
  const event     = req.headers['x-github-event']
  const payload   = req.body

  if (!signature || !event) {
    return res.status(400).json({ error: 'Missing headers' })
  }

  try {
    const body        = JSON.parse(payload.toString())
    const repoOwner   = body.repository?.owner?.login
    const repoName    = body.repository?.name

    if (!repoOwner || !repoName) {
      return res.status(200).json({ ok: true })
    }

    // Busca el webhook registrado para este repo
    const { data: hook } = await supabase
      .from('repo_webhooks')
      .select('*')
      .eq('repo_owner', repoOwner)
      .eq('repo_name', repoName)
      .single()

    if (!hook) return res.status(200).json({ ok: true })

    // Verifica la firma
    const valid = verifySignature(hook.secret, payload, signature)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Construye la notificación según el tipo de evento
    const notification = buildNotification(event, body, repoOwner, repoName)
    if (!notification) return res.status(200).json({ ok: true })

    // Empuja la notificación al usuario via WebSocket
    broadcastToUser(hook.user_github_id, {
      type:         'notification',
      notification,
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Webhook receive error:', err.message)
    res.status(500).json({ error: 'Processing failed' })
  }
})

// ── Construye el objeto de notificación ──────────────────────
function buildNotification(event, body, owner, repo) {
  const base = {
    id:        crypto.randomUUID(),
    repo:      `${owner}/${repo}`,
    repoOwner: owner,
    repoName:  repo,
    timestamp: new Date().toISOString(),
    read:      false,
  }

  if (event === 'issues') {
    const issue  = body.issue
    const actor  = body.sender?.login
    const action = body.action

    const actionLabels = {
      opened:    { title: 'Issue opened',    icon: '🟢', color: 'green'  },
      closed:    { title: 'Issue closed',    icon: '✅', color: 'purple' },
      reopened:  { title: 'Issue reopened',  icon: '🔄', color: 'blue'   },
      assigned:  { title: 'Issue assigned',  icon: '👤', color: 'blue'   },
      labeled:   { title: 'Label added',     icon: '🏷️', color: 'yellow' },
    }

    const config = actionLabels[action]
    if (!config) return null

    return {
      ...base,
      type:    'issue',
      icon:    config.icon,
      color:   config.color,
      title:   config.title,
      body:    `#${issue.number} ${issue.title}`,
      actor,
      url:     issue.html_url,
      issueNumber: issue.number,
    }
  }

  if (event === 'issue_comment') {
    const issue   = body.issue
    const comment = body.comment
    const actor   = body.sender?.login
    if (body.action !== 'created') return null

    return {
      ...base,
      type:  'comment',
      icon:  '💬',
      color: 'blue',
      title: 'New comment',
      body:  `${actor} commented on #${issue.number} ${issue.title}`,
      actor,
      url:   comment.html_url,
      issueNumber: issue.number,
    }
  }

  if (event === 'pull_request') {
    const pr     = body.pull_request
    const actor  = body.sender?.login
    const action = body.action

    const actionLabels = {
      opened:     { title: 'PR opened',   icon: '🔀', color: 'purple' },
      closed:     { title: pr?.merged ? 'PR merged' : 'PR closed', icon: pr?.merged ? '🎉' : '❌', color: pr?.merged ? 'green' : 'red' },
      review_requested: { title: 'Review requested', icon: '👀', color: 'yellow' },
    }

    const config = actionLabels[action]
    if (!config) return null

    return {
      ...base,
      type:  'pr',
      icon:  config.icon,
      color: config.color,
      title: config.title,
      body:  `#${pr.number} ${pr.title}`,
      actor,
      url:   pr.html_url,
    }
  }

  return null
}

export default router