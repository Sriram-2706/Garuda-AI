function ExecutiveSummary({ report }) {
  if (!report || typeof report !== 'object') {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Executive Summary</h3>
        </div>
        <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No executive summary is available.
        </p>
      </div>
    )
  }

  const riskColor = report.overall_risk?.toString().toLowerCase().includes('high')
    ? 'bg-rose-500/15 text-rose-300'
    : report.overall_risk?.toString().toLowerCase().includes('medium')
    ? 'bg-amber-500/15 text-amber-300'
    : 'bg-slate-700 text-slate-200'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Executive Summary</h3>
          <p className="mt-1 text-sm text-slate-400">Key guidance for security, quality, and performance.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${riskColor}`}>
          {report.overall_risk || 'Unknown Risk'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Total Findings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{report.total_findings ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Recommended Actions</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{report.recommendation || 'No recommendation provided.'}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4 text-sm text-slate-400">
        <div>
          <p className="font-medium text-slate-300">Summary</p>
          <p className="mt-2 leading-6 text-slate-200">{report.executive_summary || 'No executive summary provided.'}</p>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveSummary
