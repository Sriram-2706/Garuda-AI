import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

function RepositoryInput({ onAnalyze, loading, error }) {
  const [githubUrl, setGithubUrl] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedUrl = githubUrl.trim()

    if (!trimmedUrl) {
      setValidationError('Please enter a GitHub repository URL.')
      return
    }

    setValidationError('')
    onAnalyze(trimmedUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur sm:p-8">
      <div className="mb-5 flex items-center gap-3 text-sm font-medium text-sky-400">
        <ShieldCheck className="h-5 w-5" />
        <span>Secure analysis for every repository</span>
      </div>

      <label className="mb-3 block text-sm font-medium text-slate-300" htmlFor="github-url">
        GitHub Repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="github-url"
          type="url"
          value={githubUrl}
          onChange={(event) => setGithubUrl(event.target.value)}
          placeholder="https://github.com/owner/repository"
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading ? 'Analyzing' : 'Analyze Repository'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {(validationError || error) && (
        <p className="mt-3 text-sm text-red-400">{validationError || error}</p>
      )}
    </form>
  )
}

export default RepositoryInput
