import express from 'express'
import cors from 'cors'
import stravaRouter from '../server/src/routes/strava.js'

const app = express()

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}))
app.use(express.json())

app.use('/api', stravaRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

export default app
