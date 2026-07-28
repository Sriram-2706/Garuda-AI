import { AlertCircle, Sparkles } from 'lucide-react'
import RepositoryInput from '../components/RepositoryInput'
import LoadingSpinner from '../components/LoadingSpinner'

function LandingPage({ onAnalyze, loading, error }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur sm:p-10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">
            <Sparkles className="h-4 w-4" />
            Agentic Engineering Quality Analyzer
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            CodeGuardian AI
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Analyze public GitHub repositories for quality signals, risky files, and security findings in seconds.
          </p>

          <div className="mt-8">
            <RepositoryInput onAnalyze={onAnalyze} loading={loading} error={error} />
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <LoadingSpinner />
            </div>
          )}

          {error && !loading && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default LandingPage
