import { useState, useEffect } from 'react'

function App() {
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/case')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        setCaseData(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen bg-gray-50 p-8">Loading...</div>
  if (error) return <div className="min-h-screen bg-gray-50 p-8 text-red-600">Error: {error}</div>
  if (!caseData) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800">Priora</h1>
      <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-sm text-gray-800">
        {JSON.stringify(caseData, null, 2)}
      </pre>
    </div>
  )
}

export default App
