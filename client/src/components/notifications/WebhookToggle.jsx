import { useState, useEffect } from 'react'
import { Zap, ZapOff, Loader } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { registerWebhook, unregisterWebhook, getWebhookStatus } from '../../api/webhooks'

export default function WebhookToggle({ owner, repo }) {
  const { user, token } = useAuthStore()
  const [active,  setActive]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && owner && repo) checkStatus()
  }, [owner, repo, user])

  async function checkStatus() {
    setLoading(true)
    try {
      const { active: isActive } = await getWebhookStatus(owner, repo, user.id)
      setActive(isActive)
    } catch {
      setActive(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    setLoading(true)
    try {
      if (active) {
        await unregisterWebhook(owner, repo, user.id, token)
        setActive(false)
      } else {
        await registerWebhook(owner, repo, user.id, token)
        setActive(true)
      }
    } catch (err) {
      console.error('Webhook toggle error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active
          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
          : 'bg-github-card border-github-border text-github-muted hover:text-white hover:border-gray-500'
        }
      `}
      title={active ? 'Disable real-time notifications' : 'Enable real-time notifications'}
    >
      {loading
        ? <Loader size={12} className="animate-spin" />
        : active
          ? <><Zap size={12} /> Live</>
          : <><ZapOff size={12} /> Enable live</>
      }
    </button>
  )
}