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

export default { get, set, incr, expire, ttl }