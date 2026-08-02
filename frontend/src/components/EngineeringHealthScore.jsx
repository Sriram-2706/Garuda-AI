function toneClasses(score) {
  if (score >= 90) {
    return {
      accent: '#34d399',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
      text: 'text-emerald-300',
    }
  }

  if (score >= 80) {
    return {
      accent: '#22c55e',
      badge: 'border-green-500/30 bg-green-500/10 text-green-200',
      text: 'text-green-300',
    }
  }

  if (score >= 70) {
    return {
      accent: '#f59e0b',
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
      text: 'text-amber-300',
    }
  }

  if (score >= 60) {
    return {
      accent: '#fb7185',
      badge: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
      text: 'text-rose-300',
    }
  }

  return {
    accent: '#ef4444',
    badge: 'border-red-500/30 bg-red-500/10 text-red-200',
    text: 'text-red-300',
  }
}

function categoryBarTone(score) {
  if (score >= 85) return 'bg-emerald-400'
  if (score >= 70) return 'bg-amber-400'
  if (score >= 55) return 'bg-orange-400'
  return 'bg-rose-400'
}

function EngineeringHealthScore({ health }) {
  if (!health || typeof health !== 'object') {
    return (
      <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
        <h3 className="text-xl font-semibold text-slate-100">Engineering Health Score</h3>
        <p className="mt-3 rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          Engineering health scoring is not available for this analysis.
        </p>
      </div>
    )
  }

  const score = Math.max(0, Math.min(100, Number(health.score) || 0))
  const grade = health.grade || 'N/A'
  const status = health.status || 'Unavailable'
  const explanation = health.explanation || 'Engineering health scoring is not available for this analysis.'
  const categories = health.categories || {}
  const tones = toneClasses(score)
  const orderedCategories = ['security', 'maintainability', 'performance']
    .map((key) => ({ key, ...(categories[key] || {}) }))
    .filter((category) => category.label)

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto lg:mx-0 lg:shrink-0">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full p-3 shadow-lg shadow-slate-950/40"
            style={{
              background: `conic-gradient(${tones.accent} 0 ${score}%, rgba(15, 23, 42, 0.45) ${score}% 100%)`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 text-center">
              <span className="text-4xl font-semibold text-white">{score}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Score</span>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-semibold text-white">Engineering Health Score</h3>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${tones.badge}`}>
              Grade {grade}
            </span>
            <span className={`text-sm font-semibold uppercase tracking-[0.25em] ${tones.text}`}>
              {status}
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{explanation}</p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {health.total_findings ?? 0} total findings
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1">
              Deterministic scoring
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {orderedCategories.map((category) => (
          <div key={category.key} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">{category.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                  Weight {category.weight ?? 0}%
                </p>
              </div>
              <span className="shrink-0 text-2xl font-semibold text-white">{category.score ?? 0}</span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${categoryBarTone(category.score ?? 0)}`}
                style={{ width: `${Math.max(0, Math.min(100, category.score ?? 0))}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700 px-2.5 py-1">
                {category.findings ?? 0} findings
              </span>
              <span className="rounded-full border border-slate-700 px-2.5 py-1">
                High {category.severity_counts?.high ?? 0}
              </span>
              <span className="rounded-full border border-slate-700 px-2.5 py-1">
                Medium {category.severity_counts?.medium ?? 0}
              </span>
              <span className="rounded-full border border-slate-700 px-2.5 py-1">
                Low {category.severity_counts?.low ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EngineeringHealthScore
