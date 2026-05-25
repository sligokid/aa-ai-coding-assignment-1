import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function HealthCheck() {
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setError('API unavailable'))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SMR Scheduler</h1>
      <p className="text-gray-600">
        API health:{' '}
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : status ? (
          <span className="text-green-600">{status}</span>
        ) : (
          <span className="text-gray-400">checking...</span>
        )}
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthCheck />} />
      </Routes>
    </BrowserRouter>
  )
}
