import { useState } from 'react'
import AnalysisSummary from '../components/AnalysisSummary'
import CodeReference from '../components/CodeReference'
import ExecutiveSummary from '../components/ExecutiveSummary'
import FindingsSection from '../components/FindingsSection'
import SecurityFindings from '../components/SecurityFindings'
import TopFilesTable from '../components/TopFilesTable'

function ResultsPage({ result, onReset }) {
  const [showWarning, setShowWarning] = useState(true)

  const securityCount = result.security_findings?.flatMap((item) => item.findings ?? []).length ?? 0
  const qualityCount = result.quality_findings?.flatMap((item) => item.findings ?? []).length ?? 0
  const performanceCount = result.performance_findings?.flatMap((item) => item.findings ?? []).length ?? 0
  const noFindings = securityCount === 0 && qualityCount === 0 && performanceCount === 0

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Analysis complete</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{result.repository || 'Repository analysis'}</h2>
            <p className="mt-3 text-slate-400">Review the repository snapshot, top-risk files, and security findings below.</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
          >
            Analyze another repository
          </button>
        </div>

        {showWarning ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 shadow-lg shadow-amber-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Warning</p>
                <p className="mt-2 text-sm text-amber-100">
                  Last push by <span className="font-semibold text-white">Sriram</span> included an error code.
                  Please review and close this issue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="rounded-full border border-amber-500/50 bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 transition hover:bg-amber-500/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <AnalysisSummary result={result} />

        {noFindings ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100 shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Success</p>
            <p className="mt-2 text-sm text-emerald-100">No issues were detected by the AI review across security, quality, and performance.</p>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TopFilesTable files={result.top_files} />
          <SecurityFindings
            findings={result.security_findings?.flatMap((item) => item.findings ?? []) ?? []}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <FindingsSection
            title="Quality Findings"
            findings={result.quality_findings?.flatMap((item) => item.findings ?? []) ?? []}
            emptyMessage="No quality findings."
          />
          <FindingsSection
            title="Performance Findings"
            findings={result.performance_findings?.flatMap((item) => item.findings ?? []) ?? []}
            emptyMessage="No performance findings."
          />
        </div>

        <ExecutiveSummary report={result.advisor_report} />

        <CodeReference />
      </div>
    </main>
  )
}

export default ResultsPage
