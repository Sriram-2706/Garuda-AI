function SecurityFindings({ findings }) {
  const safeFindings = Array.isArray(findings) ? findings : []

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Security Intelligence</h3>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400">
          {safeFindings.length} found
        </span>
      </div>

      {safeFindings.length > 0 ? (
        <div className="space-y-3">
          {safeFindings.map((finding, index) => (
            <div key={`${finding.issue ?? 'finding'}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                  {finding.severity ?? 'Unknown'}
                </span>
                {finding.issue ? (
                  <span className="text-sm font-semibold text-slate-100">{finding.issue}</span>
                ) : null}
              </div>
              {finding.evidence ? (
                <p className="mt-3 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Evidence:</span> {finding.evidence}
                </p>
              ) : null}
              {finding.recommendation ? (
                <p className="mt-2 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Recommendation:</span> {finding.recommendation}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          No security intelligence was returned by the backend.
        </p>
      )}
    </div>
  )
}

export default SecurityFindings
