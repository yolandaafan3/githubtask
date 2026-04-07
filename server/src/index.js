import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import morgan       from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv       from 'dotenv'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import authRoutes   from './routes/auth.js'
import webhookRoutes from './routes/webhooks.js'

dotenv.config()

const app    = express()
const server = createServer(app)
const PORT   = process.env.PORT || 3001

// ── WebSocket Server ──────────────────────────────────────────
const wss = new WebSocketServer({ server })

// Guarda los clientes conectados con su userId
// { userId: Set<WebSocket> }
const clients = new Map()

export function broadcastToUser(userId, data) {
  const userClients = clients.get(String(userId))
  if (!userClients) return

  const message = JSON.stringify(data)
  userClients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message)
    }
  })
}

export function getClients() {
  return clients
}

wss.on('connection', (ws, req) => {
  let userId = null

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())

      // El cliente se identifica con su userId al conectar
      if (msg.type === 'auth' && msg.userId) {
        userId = String(msg.userId)

        if (!clients.has(userId)) {
          clients.set(userId, new Set())
        }
        clients.get(userId).add(ws)

        // Confirma la conexión
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Real-time notifications active',
        }))

        console.log(`WS: user ${userId} connected (${clients.get(userId).size} sessions)`)
      }
    } catch (err) {
      console.error('WS message error:', err.message)
    }
  })

  ws.on('close', () => {
    if (userId && clients.has(userId)) {
      clients.get(userId).delete(ws)
      if (clients.get(userId).size === 0) {
        clients.delete(userId)
      }
      console.log(`WS: user ${userId} disconnected`)
    }
  })

  ws.on('error', (err) => {
    console.error('WS error:', err.message)
  })

  // Ping cada 30s para mantener la conexión viva
  const ping = setInterval(() => {
    if (ws.readyState === ws.OPEN) ws.ping()
  }, 30000)

  ws.on('close', () => clearInterval(ping))
})

// ── Middlewares ───────────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// ── Rutas ─────────────────────────────────────────────────────
app.use('/auth',    authRoutes)
app.use('/webhook', webhookRoutes)

app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    message: 'GithubTask API running',
    ws_clients: clients.size,
  })
})

// ── Arranca ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${PORT}`)
})