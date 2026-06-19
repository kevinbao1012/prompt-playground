const store = new Map()

function isExpired(entry) {
  if (!entry.expiresAt) return false
  return Date.now() > entry.expiresAt
}

function get(key) {
  const entry = store.get(key)
  if (!entry || isExpired(entry)) {
    store.delete(key)
    return null
  }
  return entry.value
}

function set(key, value) {
  store.set(key, { value, expiresAt: null })
}

function incr(key) {
  const current = get(key)
  const newValue = current === null ? 1 : current + 1
  const existing = store.get(key)
  store.set(key, { value: newValue, expiresAt: existing?.expiresAt ?? null })
  return newValue
}

function expire(key, seconds) {
  const entry = store.get(key)
  if (!entry) return
  entry.expiresAt = Date.now() + seconds * 1000
}

function ttl(key) {
  const entry = store.get(key)
  if (!entry || isExpired(entry)) return -1
  if (!entry.expiresAt) return -1
  return Math.ceil((entry.expiresAt - Date.now()) / 1000)
}

function lpush(key, value) {
  const entry = store.get(key)
  if (!entry || isExpired(entry)) {
    store.set(key, { value: [value], expiresAt: null })
  } else {
    entry.value.unshift(value) // add to the front of the list
  }
}

function lrange(key, start, end) {
  const entry = store.get(key)
  if (!entry || isExpired(entry)) return []
  // end === -1 means "to the end of the list" (Redis convention)
  const list = entry.value
  const sliceEnd = end === -1 ? list.length : end + 1
  return list.slice(start, sliceEnd)
}

export default { get, set, incr, expire, ttl, lpush, lrange }