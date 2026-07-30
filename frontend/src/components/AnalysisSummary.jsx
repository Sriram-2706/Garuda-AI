function AnalysisSummary({ result }) {
  const securityCount = result.security_findings?.flatMap((item) => item.findings ?? []).length ?? 0
  const qualityCount = result.quality_findings?.flatMap((item) => item.findings ?? []).length ?? 0
  const performanceCount = result.performance_findings?.flatMap((item) => item.findings ?? []).length ?? 0

  const statCards = [
    { label: 'Files analyzed', value: result.top_files?.length ?? 0 },
    { label: 'Files skipped', value: result.skipped_files ?? 0 },
    { label: 'Security intelligence', value: securityCount },
    { label: 'Maintainability insights', value: qualityCount },
    { label: 'Performance intelligence', value: performanceCount },
    { label: 'Engineering health', value: result.advisor_report?.overall_risk ?? 'Unknown' },
    { label: 'AI confidence', value: result.advisor_report?.confidence ?? 'Unknown' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {statCards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-2 text-xl font-semibold text-slate-100">{card.value}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40">
        <p className="text-sm text-slate-400">Active Agents</p>
        <div className="mt-3 space-y-2 text-sm text-slate-200">
          <p className="flex items-center gap-2 text-sky-300"><span>&#10003;</span> Sentinel Agent</p>
          <p className="flex items-center gap-2 text-sky-300"><span>&#10003;</span> Architect Agent</p>
          <p className="flex items-center gap-2 text-sky-300"><span>&#10003;</span> Velocity Agent</p>
          <p className="flex items-center gap-2 text-sky-300"><span>&#10003;</span> Oracle Agent</p>
        </div>
      </div>
    </div>
  )
}

export default AnalysisSummary
