import redis from '../../my-redis/index.js'

const LIMIT = 10
const WINDOW = 60 * 60 // 1 hour in seconds

export async function rateLimiter(req, res, next) {
  const key = `rate:${req.ip}`

  const count = redis.incr(key)

  if (count === 1) {
    redis.expire(key, WINDOW)
  }

  const remaining = LIMIT - count
  const resetIn = redis.ttl(key)

  res.setHeader('X-RateLimit-Limit', LIMIT)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining))
  res.setHeader('X-RateLimit-Reset', resetIn)

  if (count > LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      resetsIn: `${resetIn} seconds`
    })
  }

  next()
}