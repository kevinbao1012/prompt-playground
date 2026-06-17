import express from 'express'

const router = express.Router()

router.post('/prompt', (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  res.json({ response: `You said: ${prompt}` })
})

export default router