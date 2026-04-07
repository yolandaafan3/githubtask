import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, ExternalLink, Wifi, WifiOff } from 'lucide-react'
import { useNotificationsStore } from '../../store/notificationsStore'
import { timeAgo } from '../../utils/helpers'

const COLOR_STYLES = {
  green:  'bg-green-500/10  border-green-500/20  text-green-400',
  blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  red:    'bg-red-500/10    border-red-500/20    text-red-400',
}

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)

  const {
    notifications, connected,
    markRead, markAllRead,
    clearAll, getUnreadCount,
  } = useNotificationsStore()

  const unread = getUnreadCount()

  // Cierra al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={panelRef} className="relative">

      {/* Botón campana */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-github-muted hover:text-white hover:bg-github-border transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-github-card border border-github-border rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-github-border">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm font-semibold">Notifications</h3>
              {/* Indicador de conexión */}
              <span className={`flex items-center gap-1 text-xs ${connected ? 'text-green-400' : 'text-github-muted'}`}>
                {connected
                  ? <><Wifi size={10} /> Live</>
                  : <><WifiOff size={10} /> Offline</>
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-github-muted hover:text-white transition-colors px-2 py-1 rounded hover:bg-github-border"
                  title="Mark all as read"
                >
                  <Check size={12} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-github-muted hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                  title="Clear all"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-github-muted">
                <Bell size={28} className="mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1 opacity-60">
                  {connected ? 'Listening for events...' : 'Enable webhooks on a repo'}
                </p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`
                    flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-github-border last:border-0
                    ${notif.read ? 'opacity-60' : 'bg-github-blue/3'}
                    hover:bg-github-dark
                  `}
                >
                  {/* Icono */}
                  <span
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0 ${
                      COLOR_STYLES[notif.color] || COLOR_STYLES.blue
                    }`}
                  >
                    {notif.icon}
                  </span>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-white text-xs font-medium leading-snug">
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-github-blue shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-github-muted text-xs truncate mt-0.5">
                      {notif.body}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-github-muted text-xs opacity-60">
                        {notif.repoName} · {timeAgo(notif.timestamp)}
                      </span>
                      {notif.url && (
                        <a>
                          href={notif.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-github-blue hover:text-blue-300 transition-colors"
                        
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-github-border bg-github-dark/50">
              <p className="text-xs text-github-muted text-center">
                {unread > 0
                  ? `${unread} unread notification${unread !== 1 ? 's' : ''}`
                  : 'All caught up ✓'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}