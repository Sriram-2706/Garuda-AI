import { useState } from 'react'
import { BookOpenText, Gauge, LayoutDashboard, Shield, Sparkles, Wrench } from 'lucide-react'
import AnalysisSummary from '../components/AnalysisSummary'
import CodeReference from '../components/CodeReference'
import EngineeringHealthScore from '../components/EngineeringHealthScore'
import ExecutiveSummary from '../components/ExecutiveSummary'
import FindingsSection from '../components/FindingsSection'
import SecurityFindings from '../components/SecurityFindings'
import TopFilesTable from '../components/TopFilesTable'

function hasReferenceContent(value) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasReferenceContent)
  if (typeof value === 'object') return Object.values(value).some(hasReferenceContent)
  return false
}

function normalizeFindingGroups(groups, fallbackFileLabel = 'Unspecified file') {
  if (!Array.isArray(groups)) return []

  return groups.flatMap((group) => {
    const groupFile = group?.file || fallbackFileLabel
    const findings = Array.isArray(group?.findings) ? group.findings : []

    return findings.map((finding, index) => ({
      ...finding,
      sourceFile: finding?.file || groupFile || fallbackFileLabel,
      sourceIndex: index,
    }))
  })
}

function ResultsPage({ result, onReset }) {
  const [activeView, setActiveView] = useState('overview')

  const securityFindings = normalizeFindingGroups(result.security_findings)
  const maintainabilityFindings = normalizeFindingGroups(result.quality_findings)
  const performanceFindings = normalizeFindingGroups(result.performance_findings)
  const referenceAnalysis = result.reference_analysis ?? result.referenceAnalysis

  const securityCount = securityFindings.length
  const qualityCount = maintainabilityFindings.length
  const performanceCount = performanceFindings.length
  const noFindings = securityCount === 0 && qualityCount === 0 && performanceCount === 0
  const referenceAvailable = hasReferenceContent(referenceAnalysis)
  const engineeringHealth = result.engineering_health

  const views = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Summary cards, repository context, and navigation into each intelligence area.',
      icon: LayoutDashboard,
      status: engineeringHealth?.score != null ? `${engineeringHealth.score}/100 score` : `${securityCount + qualityCount + performanceCount} findings`,
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Review repository security intelligence and remediation guidance.',
      icon: Shield,
      status: `${securityCount} findings`,
    },
    {
      id: 'maintainability',
      label: 'Maintainability',
      description: 'Inspect maintainability insights across the prioritized files.',
      icon: Wrench,
      status: `${qualityCount} findings`,
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'Explore performance intelligence and optimization opportunities.',
      icon: Gauge,
      status: `${performanceCount} findings`,
    },
    {
      id: 'executive',
      label: 'Executive Intelligence',
      description: 'Read the aggregated executive intelligence report for this repository.',
      icon: Sparkles,
      status: result.advisor_report ? 'Available' : 'Unavailable',
    },
    {
      id: 'reference',
      label: 'Reference Analysis',
      description: 'Access repository-specific reference material associated with the analysis.',
      icon: BookOpenText,
      status: referenceAvailable ? 'Available' : 'Unavailable',
    },
  ]

  const currentView = views.find((view) => view.id === activeView) ?? views[0]
  const CurrentViewIcon = currentView.icon

  function renderOverview() {
    return (
      <div className="space-y-6">
        <EngineeringHealthScore health={engineeringHealth} />
        <AnalysisSummary result={result} />

        {noFindings ? (
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-emerald-100 shadow-lg shadow-emerald-500/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">No findings identified</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100">
              No security intelligence, maintainability insights, or performance intelligence findings are available for this repository.
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <TopFilesTable files={result.top_files} />

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Workspace Views</h3>
                <p className="mt-1 text-sm text-slate-400">Open each intelligence area without losing the current analysis context.</p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                {views.length - 1} Views
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {views
                .filter((view) => view.id !== 'overview')
                .map((view) => {
                  const ViewIcon = view.icon

                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => setActiveView(view.id)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-left transition hover:border-sky-500/60 hover:bg-slate-950"
                    >
                      <div className="flex items-start gap-3">
                        <span className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-sky-300">
                          <ViewIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{view.label}</p>
                          <p className="mt-1 text-sm text-slate-400">{view.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {view.status}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderActiveView() {
    switch (activeView) {
      case 'overview':
        return renderOverview()
      case 'security':
        return <SecurityFindings findings={securityFindings} />
      case 'maintainability':
        return (
          <FindingsSection
            title="Maintainability Insights"
            findings={maintainabilityFindings}
            emptyMessage="No maintainability insights are available for this repository."
            emptyFilteredMessage="No maintainability findings match the current search and filter settings."
          />
        )
      case 'performance':
        return (
          <FindingsSection
            title="Performance Intelligence"
            findings={performanceFindings}
            emptyMessage="No performance intelligence is available for this repository."
            emptyFilteredMessage="No performance findings match the current search and filter settings."
          />
        )
      case 'executive':
        return (
          <ExecutiveSummary
            report={result.advisor_report}
            health={engineeringHealth}
            securityFindings={securityFindings}
            maintainabilityFindings={maintainabilityFindings}
            performanceFindings={performanceFindings}
          />
        )
      case 'reference':
        return <CodeReference referenceAnalysis={referenceAnalysis} />
      default:
        return renderOverview()
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Engineering intelligence ready</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{result.repository || 'Engineering Intelligence'}</h2>
            <p className="mt-3 max-w-3xl text-slate-400">
              Explore overview metrics first, then move through dedicated views for Security, Maintainability, Performance, Executive Intelligence, and Reference Analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
          >
            Analyze another repository
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
            <div className="mb-4 px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">Workspace</p>
              <p className="mt-2 text-sm text-slate-400">Switch between summary and dedicated intelligence views.</p>
            </div>

            <nav className="flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
              {views.map((view) => {
                const ViewIcon = view.icon
                const isActive = view.id === activeView

                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={`group flex min-w-[220px] shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition xl:min-w-0 ${
                      isActive
                        ? 'border-sky-500/70 bg-sky-500/10 text-white shadow-lg shadow-sky-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-2xl border p-2 ${
                        isActive
                          ? 'border-sky-400/50 bg-sky-500/20 text-sky-200'
                          : 'border-slate-700 bg-slate-900 text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <ViewIcon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{view.label}</p>
                        <p className={`mt-1 text-xs ${isActive ? 'text-sky-100/80' : 'text-slate-500'}`}>{view.status}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>

          <section className="min-w-0 space-y-6">
            <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-3 text-sky-300">
                    <CurrentViewIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">Current View</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{currentView.label}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{currentView.description}</p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                  {currentView.status}
                </span>
              </div>
            </div>

            {renderActiveView()}
          </section>
        </div>
      </div>
    </main>
  )
}

export default ResultsPage
