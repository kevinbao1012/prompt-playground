import redis from '../../my-redis/index.js'

const LIMIT = 10
const WINDOW = 10 // seconds to wait once limit is hit

export async function rateLimiter(req, res, next) {
  const key = `rate:${req.ip}`

  const count = redis.incr(key)
  const resetIn = redis.ttl(key)

  // only start the timer once the limit is exceeded
  if (count >= LIMIT && resetIn === -1) {
    redis.expire(key, WINDOW)
  }

  const remaining = LIMIT - count
  const finalResetIn = redis.ttl(key)

  res.setHeader('X-RateLimit-Limit', LIMIT)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining))
  res.setHeader('X-RateLimit-Reset', finalResetIn)

  if (count > LIMIT) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      resetsIn: `${finalResetIn} seconds`
    })
  }

  next()
}