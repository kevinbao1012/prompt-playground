import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { rateLimiter } from './middleware/rateLimiter.js'
import promptRoute from './routes/prompt.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}))
app.use(express.json())

// apply rate limiter to all /api routes
app.use('/api', rateLimiter)

// routes
app.use('/api', promptRoute)

// health check
app.get('/', (req, res) => {
  res.json({ status: 'server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})