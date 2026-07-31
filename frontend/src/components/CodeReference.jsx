function hasRenderableContent(value) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.some(hasRenderableContent)
  if (typeof value === 'object') return Object.values(value).some(hasRenderableContent)
  return false
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function isCodeLikeField(key, value) {
  if (typeof value !== 'string') return false
  return /code|snippet|content|source|analysis|reference/i.test(key) || value.includes('\n')
}

function renderFieldValue(fieldKey, value) {
  if (!hasRenderableContent(value)) return null

  if (typeof value === 'string') {
    return isCodeLikeField(fieldKey, value) ? (
      <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-200 whitespace-pre-wrap">
        {value}
      </pre>
    ) : (
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    )
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <p className="mt-2 text-sm leading-6 text-slate-200">{String(value)}</p>
  }

  return (
    <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-200 whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function renderObjectCard(item, index) {
  const titleKey = ['title', 'label', 'name', 'path', 'file', 'file_path'].find((key) => hasRenderableContent(item[key]))
  const title = titleKey ? item[titleKey] : null
  const entries = Object.entries(item).filter(([key, value]) => key !== titleKey && hasRenderableContent(value))

  return (
    <div key={`${title || 'reference'}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20">
      {title ? <h4 className="text-sm font-semibold text-slate-100">{title}</h4> : null}
      <div className={title ? 'mt-3 space-y-3' : 'space-y-3'}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-sm font-medium text-slate-300">{formatLabel(key)}</p>
            {renderFieldValue(key, value)}
          </div>
        ))}
      </div>
    </div>
  )
}

function renderReferenceContent(referenceAnalysis) {
  if (!hasRenderableContent(referenceAnalysis)) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        No reference analysis is available.
      </p>
    )
  }

  if (typeof referenceAnalysis === 'string' || typeof referenceAnalysis === 'number' || typeof referenceAnalysis === 'boolean') {
    return renderFieldValue('reference_analysis', referenceAnalysis)
  }

  if (Array.isArray(referenceAnalysis)) {
    const items = referenceAnalysis.filter(hasRenderableContent)

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          typeof item === 'object' && item !== null
            ? renderObjectCard(item, index)
            : (
              <div key={`reference-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20">
                {renderFieldValue(`reference_item_${index}`, item)}
              </div>
            )
        ))}
      </div>
    )
  }

  if (typeof referenceAnalysis === 'object') {
    return renderObjectCard(referenceAnalysis, 0)
  }

  return (
    <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
      No reference analysis is available.
    </p>
  )
}

function CodeReference({ referenceAnalysis }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Reference Analysis</h3>
        <p className="mt-1 text-sm text-slate-400">Repository-specific reference material associated with this analysis.</p>
      </div>

      {renderReferenceContent(referenceAnalysis)}
    </div>
  )
}

export default CodeReference
