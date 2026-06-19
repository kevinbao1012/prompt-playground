import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [myText, setMyText] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const [remaining, setRemaining] = useState(null)
  const [limit, setLimit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  function handleChange(e) {
    setMyText(e.target.value)
  }

  async function loadHistory(){
    const res = await fetch('/api/history')
    const data = await res.json()
    setHistory(Array.isArray(data.history) ? data.history : [])
  }

  useEffect(() => {
  loadHistory()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse("")

    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: myText })
      })

      setRemaining(res.headers.get('X-RateLimit-Remaining'))
      setLimit(res.headers.get('X-RateLimit-Limit'))

      const data = await res.json()

      if (res.status === 429) {
        setError(`Rate limit exceeded. Try again in ${data.resetsIn}`)
        return
      } else {
        setResponse(data.response)

      setHistory(prev => [
        {
          prompt: myText,
          response: data.response,
          timestamp: new Date().toISOString()
        },
        ...prev
      ])
      }
    } catch (err) {
      setError("Failed to reach the server")
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="container">
    <div className="header">
      <h1>prompt://playground</h1>
      <span className="tag">redis-backed</span>
    </div>

    {limit !== null && (
      <div className="gauge-wrap">
        <div className="gauge-label">
          <span>requests remaining</span>
          <span className="value">{remaining} / {limit}</span>
        </div>
        <div className="gauge">
          {Array.from({ length: Number(limit) }).map((_, i) => {
            const filled = i < Number(remaining)
            const danger = Number(remaining) <= 2
            return (
              <div
                key={i}
                className={`gauge-segment ${filled ? 'filled' : ''} ${filled && danger ? 'danger' : ''}`}
              />
            )
          })}
        </div>
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <textarea
        value={myText}
        onChange={handleChange}
        placeholder="Type a prompt..."
      />
      <div className="submit-row">
        <input type="submit" disabled={loading} value={loading ? "thinking..." : "run →"} />
      </div>
    </form>

    {error && <p className="error">{error}</p>}
    {response && <p className="response">{response}</p>}

    <button onClick={() => {
      setShowHistory(prev => !prev)
      if (!history.length) loadHistory()
    }}>
      {showHistory ? "Hide History" : "Show History"}
    </button>

    {showHistory && (
    <div className="history">
      <h2>history</h2>
      {Array.isArray(history) && history.map((item, i) => (
        <div key={i} className="history-item">
          <p><strong>you</strong>{item.prompt}</p>
          <p><strong>response</strong>{item.response}</p>
          <p className="timestamp">{new Date(item.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
    )}
  </div>
)
}

export default App