import { useMemo, useState } from 'react'
import LandingPage from './pages/LandingPage'
import ResultsPage from './pages/ResultsPage'
import { analyzeRepository } from './services/api'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (githubUrl) => {
    setLoading(true)
    setError('')

    try {
      const data = await analyzeRepository(githubUrl)
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err.message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const hasResults = useMemo(() => Boolean(result), [result])

  const resetAnalysis = () => {
    setResult(null)
    setError('')
  }

  return hasResults ? (
    <ResultsPage result={result} onReset={resetAnalysis} />
  ) : (
    <LandingPage onAnalyze={handleAnalyze} loading={loading} error={error} />
  )
}

export default App
