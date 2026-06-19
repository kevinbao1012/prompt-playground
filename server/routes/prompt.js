import express from 'express'
import redis from '../../my-redis/index.js'

const router = express.Router()

router.post('/prompt', (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const response = `You said: ${prompt}`

  // save this exchange into history
  redis.lpush('history', { prompt, response, timestamp: Date.now() })

  res.json({ response })
})

router.get('/history', (req, res) => {
  const history = redis.lrange('history', 0, -1)
  res.json({ history })
})

export default router