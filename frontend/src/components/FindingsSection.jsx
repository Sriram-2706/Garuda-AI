import { useEffect, useState } from 'react'

const FINDINGS_PER_PAGE = 5

const SEVERITY_RANK = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getSeverityRank(severity) {
  return SEVERITY_RANK[normalizeText(severity).toLowerCase()] ?? 0
}

function badgeColor(severity) {
  const normalized = normalizeText(severity).toLowerCase()

  if (normalized.includes('critical') || normalized.includes('high')) {
    return 'bg-rose-500/15 text-rose-300'
  }

  if (normalized.includes('medium')) {
    return 'bg-amber-500/15 text-amber-300'
  }

  if (normalized.includes('low')) {
    return 'bg-emerald-500/15 text-emerald-300'
  }

  return 'bg-slate-700 text-slate-200'
}

function FindingsSection({
  title,
  findings,
  emptyMessage,
  emptyFilteredMessage = 'No findings match the current search and filter settings.',
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [fileFilter, setFileFilter] = useState('all')
  const [sortOption, setSortOption] = useState('severity-desc')
  const [currentPage, setCurrentPage] = useState(1)

  const safeFindings = Array.isArray(findings) ? findings : []
  const severityOptions = Array.from(
    new Set(
      safeFindings
        .map((finding) => normalizeText(finding.severity) || 'Unknown')
        .filter(Boolean),
    ),
  ).sort((left, right) => getSeverityRank(right) - getSeverityRank(left) || left.localeCompare(right))

  const fileOptions = Array.from(
    new Set(
      safeFindings
        .map((finding) => normalizeText(finding.sourceFile) || 'Unspecified file')
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right))

  const filteredFindings = safeFindings.filter((finding) => {
    const searchableText = [
      finding.issue,
      finding.evidence,
      finding.recommendation,
      finding.description,
      finding.confidence,
      finding.owasp,
      finding.cwe,
      finding.sourceFile,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const normalizedSeverity = normalizeText(finding.severity) || 'Unknown'
    const normalizedFile = normalizeText(finding.sourceFile) || 'Unspecified file'
    const matchesSearch = searchQuery.trim().length === 0 || searchableText.includes(searchQuery.trim().toLowerCase())
    const matchesSeverity = severityFilter === 'all' || normalizedSeverity === severityFilter
    const matchesFile = fileFilter === 'all' || normalizedFile === fileFilter

    return matchesSearch && matchesSeverity && matchesFile
  })

  const sortedFindings = [...filteredFindings].sort((left, right) => {
    switch (sortOption) {
      case 'severity-asc':
        return getSeverityRank(left.severity) - getSeverityRank(right.severity)
      case 'issue-asc':
        return normalizeText(left.issue).localeCompare(normalizeText(right.issue))
      case 'issue-desc':
        return normalizeText(right.issue).localeCompare(normalizeText(left.issue))
      case 'file-asc':
        return (normalizeText(left.sourceFile) || 'Unspecified file').localeCompare(normalizeText(right.sourceFile) || 'Unspecified file')
      case 'file-desc':
        return (normalizeText(right.sourceFile) || 'Unspecified file').localeCompare(normalizeText(left.sourceFile) || 'Unspecified file')
      case 'severity-desc':
      default:
        return getSeverityRank(right.severity) - getSeverityRank(left.severity)
    }
  })

  const totalPages = Math.max(1, Math.ceil(sortedFindings.length / FINDINGS_PER_PAGE))
  const pageStart = (currentPage - 1) * FINDINGS_PER_PAGE
  const pageFindings = sortedFindings.slice(pageStart, pageStart + FINDINGS_PER_PAGE)
  const hasActiveFilters = searchQuery.trim().length > 0 || severityFilter !== 'all' || fileFilter !== 'all'

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, severityFilter, fileFilter, sortOption, title])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function clearFilters() {
    setSearchQuery('')
    setSeverityFilter('all')
    setFileFilter('all')
    setSortOption('severity-desc')
    setCurrentPage(1)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Search, filter, sort, and review the findings in a focused workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            {safeFindings.length} total
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            {sortedFindings.length} visible
          </span>
        </div>
      </div>

      {safeFindings.length > 0 ? (
        <>
          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search issue, evidence, recommendation, or file"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Severity</span>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              >
                <option value="all">All severities</option>
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">File</span>
              <select
                value={fileFilter}
                onChange={(event) => setFileFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              >
                <option value="all">All files</option>
                {fileOptions.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Sort</span>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
              >
                <option value="severity-desc">Severity: highest first</option>
                <option value="severity-asc">Severity: lowest first</option>
                <option value="issue-asc">Issue: A to Z</option>
                <option value="issue-desc">Issue: Z to A</option>
                <option value="file-asc">File: A to Z</option>
                <option value="file-desc">File: Z to A</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Showing <span className="font-medium text-slate-200">{sortedFindings.length === 0 ? 0 : pageStart + 1}</span>
              {' '}to{' '}
              <span className="font-medium text-slate-200">{Math.min(pageStart + FINDINGS_PER_PAGE, sortedFindings.length)}</span>
              {' '}of{' '}
              <span className="font-medium text-slate-200">{sortedFindings.length}</span> matching findings
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {sortedFindings.length > 0 ? (
            <>
              <div className="mt-4 space-y-3">
                {pageFindings.map((finding, index) => (
                  <div
                    key={`${finding.issue ?? 'finding'}-${finding.sourceFile ?? 'file'}-${pageStart + index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeColor(finding.severity)}`}>
                            {finding.severity ?? 'Unknown'}
                          </span>
                          {finding.issue ? (
                            <span className="text-sm font-semibold text-slate-100">{finding.issue}</span>
                          ) : (
                            <span className="text-sm font-semibold text-slate-100">Finding</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-full border border-slate-700 px-3 py-1">
                            File: {finding.sourceFile || 'Unspecified file'}
                          </span>
                          {finding.confidence ? (
                            <span className="rounded-full border border-slate-700 px-3 py-1">
                              Confidence: {finding.confidence}
                            </span>
                          ) : null}
                          {finding.owasp ? (
                            <span className="rounded-full border border-slate-700 px-3 py-1">
                              OWASP: {finding.owasp}
                            </span>
                          ) : null}
                          {finding.cwe ? (
                            <span className="rounded-full border border-slate-700 px-3 py-1">
                              CWE: {finding.cwe}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {finding.evidence ? (
                      <p className="mt-3 text-sm text-slate-400">
                        <span className="font-medium text-slate-300">Evidence:</span> {finding.evidence}
                      </p>
                    ) : null}

                    {finding.description ? (
                      <p className="mt-3 text-sm text-slate-400">
                        <span className="font-medium text-slate-300">Description:</span> {finding.description}
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

              {totalPages > 1 ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-400">
                    Page <span className="font-medium text-slate-200">{currentPage}</span> of{' '}
                    <span className="font-medium text-slate-200">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-400 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-sky-400 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-sm text-slate-400">
              <p className="font-semibold text-slate-200">No matching findings</p>
              <p className="mt-2 leading-6">{emptyFilteredMessage}</p>
              {hasActiveFilters ? (
                <p className="mt-2 leading-6">Adjust the search terms or filters to expand the results.</p>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-sm text-slate-400">
          <p className="font-semibold text-slate-200">No findings available</p>
          <p className="mt-2 leading-6">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

export default FindingsSection
