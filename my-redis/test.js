import redis from './index.js'

redis.set('foo', 0)
console.log(redis.incr('foo'))  // 1
console.log(redis.incr('foo'))  // 2
console.log(redis.incr('foo'))  // 3
redis.expire('foo', 2)
console.log(redis.ttl('foo'))   // ~2
setTimeout(() => {
  console.log(redis.get('foo')) // null
}, 3000)