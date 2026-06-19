import { useState } from 'react'
import './App.css'

function App() {
  const [myText, setMyText] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const [remaining, setRemaining] = useState(null)
  const [limit, setLimit] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setMyText(e.target.value)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse("")

    try {
      const res = await fetch('http://localhost:3001/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: myText })
      })

      setRemaining(res.headers.get('X-RateLimit-Remaining'))
      setLimit(res.headers.get('X-RateLimit-Limit'))

      const data = await res.json()

      if (res.status === 429) {
        setError(`Rate limit exceeded. Try again in ${data.resetsIn}`)
      } else {
        setResponse(data.response)
      }
    } catch (err) {
      setError("Failed to reach the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>AI Prompt Playground</h1>

      {remaining !== null && (
        <p className="counter">{remaining} of {limit} requests remaining</p>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={myText}
          onChange={handleChange}
          placeholder="Type text here..."
        />
        <input type="submit" disabled={loading} value={loading ? "Thinking..." : "Submit"} />
      </form>

      {error && <p className="error">{error}</p>}
      {response && <p className="response">{response}</p>}
    </div>
  )
}

export default App