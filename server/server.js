import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { demoUsers } from './demoUsers.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const attemptLog = new Map()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000

function tooManyAttempts(email) {
  const record = attemptLog.get(email)
  if (!record) return false
  if (Date.now() - record.firstAttempt > WINDOW_MS) {
    attemptLog.delete(email)
    return false
  }
  return record.count >= MAX_ATTEMPTS
}

function registerFailedAttempt(email) {
  const record = attemptLog.get(email)
  if (!record || Date.now() - record.firstAttempt > WINDOW_MS) {
    attemptLog.set(email, { count: 1, firstAttempt: Date.now() })
  } else {
    record.count += 1
  }
}

function clearAttempts(email) {
  attemptLog.delete(email)
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (tooManyAttempts(normalizedEmail)) {
    return res.status(429).json({ message: 'Too many failed attempts. Try again later.' })
  }

  const user = demoUsers.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (!user || user.password !== password) {
    registerFailedAttempt(normalizedEmail)
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  clearAttempts(normalizedEmail)

  const token = crypto.randomBytes(24).toString('hex')

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'frolicam-login-server' })
})

app.listen(PORT, () => {
  console.log(`FrolicAM auth server running at http://localhost:${PORT}`)
})