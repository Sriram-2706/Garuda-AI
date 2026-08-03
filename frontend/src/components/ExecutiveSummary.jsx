const SEVERITY_RANK = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  unknown: 1,
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSeverity(value) {
  const normalized = normalizeText(value).toLowerCase()

  if (normalized.includes('critical')) return 'critical'
  if (normalized.includes('high')) return 'high'
  if (normalized.includes('medium')) return 'medium'
  if (normalized.includes('low')) return 'low'

  return 'unknown'
}

function severityClasses(severity) {
  switch (normalizeSeverity(severity)) {
    case 'critical':
      return 'bg-red-500/15 text-red-200 border-red-500/30'
    case 'high':
      return 'bg-rose-500/15 text-rose-200 border-rose-500/30'
    case 'medium':
      return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
    case 'low':
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
    default:
      return 'bg-slate-700 text-slate-200 border-slate-600'
  }
}

function riskClasses(risk) {
  const normalized = normalizeText(risk).toLowerCase()

  if (normalized.includes('critical')) return 'bg-red-500/15 text-red-200 border-red-500/30'
  if (normalized.includes('high')) return 'bg-rose-500/15 text-rose-200 border-rose-500/30'
  if (normalized.includes('medium')) return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
  if (normalized.includes('low')) return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'

  return 'bg-slate-700 text-slate-200 border-slate-600'
}

function buildExecutiveIntelligence({ report, health, securityFindings, maintainabilityFindings, performanceFindings }) {
  const safeReport = report && typeof report === 'object' ? report : {}
  const safeHealth = health && typeof health === 'object' ? health : {}

  const categorizedFindings = [
    ...(Array.isArray(securityFindings) ? securityFindings : []).map((finding) => ({ ...finding, category: 'Security' })),
    ...(Array.isArray(maintainabilityFindings) ? maintainabilityFindings : []).map((finding) => ({ ...finding, category: 'Maintainability' })),
    ...(Array.isArray(performanceFindings) ? performanceFindings : []).map((finding) => ({ ...finding, category: 'Performance' })),
  ]

  const sortedRisks = [...categorizedFindings].sort((left, right) => {
    const severityDelta = SEVERITY_RANK[normalizeSeverity(right.severity)] - SEVERITY_RANK[normalizeSeverity(left.severity)]
    if (severityDelta !== 0) return severityDelta

    return normalizeText(left.issue).localeCompare(normalizeText(right.issue))
  })

  const topRisks = sortedRisks
    .filter((finding) => normalizeText(finding.issue))
    .slice(0, 5)

  const priorityActions = []
  const actionSet = new Set()

  for (const action of Array.isArray(safeReport.priority_actions) ? safeReport.priority_actions : []) {
    const normalized = normalizeText(action)
    if (normalized && !actionSet.has(normalized.toLowerCase())) {
      actionSet.add(normalized.toLowerCase())
      priorityActions.push(normalized)
    }
  }

  for (const finding of topRisks) {
    const recommendation = normalizeText(finding.recommendation)
    if (recommendation && !actionSet.has(recommendation.toLowerCase())) {
      actionSet.add(recommendation.toLowerCase())
      priorityActions.push(recommendation)
    }
  }

  const severityCounts = categorizedFindings.reduce(
    (counts, finding) => {
      counts[normalizeSeverity(finding.severity)] += 1
      return counts
    },
    { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
  )

  const score = Number(safeHealth.score)
  const repositoryHealth = {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null,
    grade: normalizeText(safeHealth.grade) || 'N/A',
    status: normalizeText(safeHealth.status) || 'Unavailable',
    risk: normalizeText(safeReport.overall_risk) || 'Unknown',
    findings: Number.isFinite(Number(safeHealth.total_findings))
      ? Number(safeHealth.total_findings)
      : categorizedFindings.length,
  }

  let releaseReadiness = {
    label: 'Readiness unavailable',
    summary: 'Release readiness could not be established from the current analysis payload.',
  }

  if (repositoryHealth.score != null) {
    if (severityCounts.critical > 0 || repositoryHealth.score < 55) {
      releaseReadiness = {
        label: 'Not ready',
        summary: 'Critical engineering risks should be addressed before approving a production release.',
      }
    } else if (severityCounts.high >= 2 || repositoryHealth.score < 70) {
      releaseReadiness = {
        label: 'Needs stabilization',
        summary: 'Release confidence is limited until the highest-priority issues are reduced.',
      }
    } else if (severityCounts.high > 0 || severityCounts.medium >= 3 || repositoryHealth.score < 85) {
      releaseReadiness = {
        label: 'Conditionally ready',
        summary: 'A release is feasible with targeted remediation and explicit follow-up controls.',
      }
    } else {
      releaseReadiness = {
        label: 'Ready with normal controls',
        summary: 'Current signals support release planning under standard engineering review controls.',
      }
    }
  }

  let businessImpact = 'Business impact could not be estimated from the available analysis.'
  if (severityCounts.critical > 0 || severityCounts.high > 0) {
    businessImpact = 'Elevated engineering risk could affect release timing, operational resilience, and stakeholder confidence if left unaddressed.'
  } else if ((safeHealth.categories?.maintainability?.findings ?? 0) >= (safeHealth.categories?.security?.findings ?? 0)
    && (safeHealth.categories?.maintainability?.findings ?? 0) >= (safeHealth.categories?.performance?.findings ?? 0)
    && categorizedFindings.length > 0) {
    businessImpact = 'Maintainability drag is likely to slow delivery throughput, increase review overhead, and reduce change confidence over time.'
  } else if ((safeHealth.categories?.performance?.findings ?? 0) > 0) {
    businessImpact = 'Performance issues may affect runtime efficiency, scalability, and the cost of supporting growth under production load.'
  } else if (categorizedFindings.length === 0) {
    businessImpact = 'No material engineering issues were identified in the current analysis, indicating limited near-term delivery disruption.'
  }

  const effortPoints = (
    severityCounts.critical * 8
    + severityCounts.high * 5
    + severityCounts.medium * 3
    + severityCounts.low * 1
    + severityCounts.unknown * 2
  )

  let estimatedEffort = {
    label: 'Low',
    summary: 'Likely addressable in 1-2 engineering days.',
  }

  if (effortPoints > 28) {
    estimatedEffort = {
      label: 'High',
      summary: 'Likely requires a coordinated effort spanning more than two engineering weeks.',
    }
  } else if (effortPoints > 14) {
    estimatedEffort = {
      label: 'Substantial',
      summary: 'Likely requires one to two engineering weeks of focused remediation.',
    }
  } else if (effortPoints > 6) {
    estimatedEffort = {
      label: 'Moderate',
      summary: 'Likely requires several engineering days of targeted follow-through.',
    }
  }

  return {
    repositoryHealth,
    executiveSummary: normalizeText(safeReport.executive_summary) || 'Executive summary is not available for this repository.',
    topRisks,
    prioritizedActions: priorityActions.slice(0, 6),
    releaseReadiness,
    businessImpact,
    estimatedEffort,
  }
}

function SummaryCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function ExecutiveSummary({ report, health, securityFindings, maintainabilityFindings, performanceFindings }) {
  const intelligence = buildExecutiveIntelligence({
    report,
    health,
    securityFindings,
    maintainabilityFindings,
    performanceFindings,
  })

  const repositoryHealth = intelligence.repositoryHealth
  const reportAvailable = report && typeof report === 'object'

  if (!reportAvailable && !health) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Executive Intelligence Report</h3>
        </div>
        <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          Executive intelligence is not available for this repository.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Executive Intelligence Report</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            Structured executive guidance synthesized from Oracle output, Engineering Health, and the current security, maintainability, and performance findings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${riskClasses(repositoryHealth.risk)}`}>
            {repositoryHealth.risk} risk
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
            Grade {repositoryHealth.grade}
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
            {repositoryHealth.status}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Repository Health">
          <p className="text-3xl font-semibold text-white">
            {repositoryHealth.score ?? '--'}
            <span className="ml-2 text-base font-medium text-slate-400">/100</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {repositoryHealth.findings} findings analyzed across security, maintainability, and performance.
          </p>
        </SummaryCard>

        <SummaryCard title="Release Readiness">
          <p className="text-lg font-semibold text-slate-100">{intelligence.releaseReadiness.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{intelligence.releaseReadiness.summary}</p>
        </SummaryCard>

        <SummaryCard title="Estimated Engineering Effort">
          <p className="text-lg font-semibold text-slate-100">{intelligence.estimatedEffort.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{intelligence.estimatedEffort.summary}</p>
        </SummaryCard>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SummaryCard title="Executive Summary">
          <p className="text-sm leading-7 text-slate-200">{intelligence.executiveSummary}</p>
        </SummaryCard>

        <SummaryCard title="Business Impact">
          <p className="text-sm leading-7 text-slate-200">{intelligence.businessImpact}</p>
        </SummaryCard>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <SummaryCard title="Top Risks">
          {intelligence.topRisks.length > 0 ? (
            <div className="space-y-3">
              {intelligence.topRisks.map((risk, index) => (
                <div key={`${risk.issue || 'risk'}-${risk.sourceFile || 'file'}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severityClasses(risk.severity)}`}>
                      {risk.severity || 'Unknown'}
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {risk.category}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-100">{risk.issue || 'Risk item'}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">File:</span> {risk.sourceFile || 'Unspecified file'}
                  </p>
                  {risk.evidence ? (
                    <p className="mt-2 text-sm text-slate-400">
                      <span className="font-medium text-slate-300">Evidence:</span> {risk.evidence}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-400">No top risks are available for this repository.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Prioritized Actions">
          {intelligence.prioritizedActions.length > 0 ? (
            <div className="space-y-3">
              {intelligence.prioritizedActions.map((action, index) => (
                <div key={`${action}-${index}`} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <span className="mt-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs font-semibold text-sky-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-200">{action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-400">No prioritized actions are available for this repository.</p>
          )}
        </SummaryCard>
      </div>
    </div>
  )
}

export default ExecutiveSummary
