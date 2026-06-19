import express from 'express'
import redis from '../../my-redis/index.js'
import { rateLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/prompt', rateLimiter, async (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await aiRes.json()

    if (!aiRes.ok) {
      console.error(data)
      return res.status(500).json({ error: 'AI request failed' })
    }

    const response = data.choices[0].message.content

    redis.lpush('history', { prompt, response, timestamp: Date.now() })

    res.json({ response })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/history', (req, res) => {
  const history = redis.lrange('history', 0, -1)
  res.json({ history })
})

export default router