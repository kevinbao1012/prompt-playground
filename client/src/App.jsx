import { useState } from 'react'
import './App.css'

function App() {
  const [myText, setMyText] = useState("")
  const [response, setResponse] = useState("")

  function handleChange(e) {
    setMyText(e.target.value)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const res = await fetch('http://localhost:3001/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: myText })
    })

    const data = await res.json()
    setResponse(data.response)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={myText}
          onChange={handleChange}
          placeholder="Type text here..."
        />
        <input type="submit" />
      </form>

      {response && <p>{response}</p>}
    </div>
  )
}

export default App
