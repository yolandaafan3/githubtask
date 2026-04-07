import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationsStore } from '../store/notificationsStore'

const WS_URL = import.meta.env.VITE_API_URL
  .replace('http://', 'ws://')
  .replace('https://', 'wss://')

const RECONNECT_DELAY = 3000
const MAX_RECONNECTS  = 10

export function useWebSocket() {
  const user   = useAuthStore(state => state.user)
  const token  = useAuthStore(state => state.token)
  const { addNotification, setConnected } = useNotificationsStore()

  const ws           = useRef(null)
  const reconnects   = useRef(0)
  const reconnectTimer = useRef(null)
  const shouldConnect  = useRef(false)

  const connect = useCallback(() => {
    if (!user?.id || !token) return
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      ws.current = new WebSocket(WS_URL)

      ws.current.onopen = () => {
        reconnects.current = 0
        // Se identifica con el servidor
        ws.current.send(JSON.stringify({
          type:   'auth',
          userId: user.id,
        }))
        console.log('WS: connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)

          if (msg.type === 'connected') {
            setConnected(true)
          }

          if (msg.type === 'notification') {
            addNotification(msg.notification)

            // Sonido sutil de notificación
            try {
              const ctx  = new AudioContext()
              const osc  = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain)
              gain.connect(ctx.destination)
              osc.frequency.value = 800
              gain.gain.setValueAtTime(0.1, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
              osc.start(ctx.currentTime)
              osc.stop(ctx.currentTime + 0.3)
            } catch {}
          }
        } catch (err) {
          console.error('WS parse error:', err)
        }
      }

      ws.current.onclose = () => {
        setConnected(false)
        console.log('WS: disconnected')

        // Reconexión automática
        if (shouldConnect.current && reconnects.current < MAX_RECONNECTS) {
          reconnects.current++
          const delay = RECONNECT_DELAY * Math.min(reconnects.current, 5)
          console.log(`WS: reconnecting in ${delay}ms (attempt ${reconnects.current})`)
          reconnectTimer.current = setTimeout(connect, delay)
        }
      }

      ws.current.onerror = () => {
        ws.current?.close()
      }
    } catch (err) {
      console.error('WS connect error:', err)
    }
  }, [user?.id, token])

  useEffect(() => {
    if (!user?.id || !token) return
    shouldConnect.current = true
    connect()

    return () => {
      shouldConnect.current = false
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
      setConnected(false)
    }
  }, [user?.id, token])
}