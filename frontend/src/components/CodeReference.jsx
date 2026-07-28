function CodeReference() {
  const codeSample = `// Example analysis request
async function analyzeRepository(githubUrl) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ github_url: githubUrl }),
  })

  if (!response.ok) {
    throw new Error('Analysis request failed')
  }

  return await response.json()
}

// Render findings
const result = await analyzeRepository('https://github.com/owner/repo')
console.log(result.security_findings)
console.log(result.quality_findings)
console.log(result.performance_findings)
console.log(result.advisor_report)`

  const errorSample = `// Last pushed error by developer "Sriram"
function processRepository(repoData) {
  if (!repoData) {
    throw new Error('NullReferenceException: repoData is undefined')
  }

  const analysis = repoData.analysis
  if (analysis.length > 0) {
    analyzeFindings(analysis)
  } else {
    throw new Error('OutOfMemoryError: analysis payload too large')
  }
}

// Pushed by: Sriram
// Note: This example shows how a pushed error case can be captured and reviewed.`

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Reference analysis code</h3>
          <p className="mt-1 text-sm text-slate-400">Use these sample snippets for integrating analysis and reviewing pushed error code.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">API request example</p>
          <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-200">
            {codeSample}
          </pre>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-200">Last pushed error sample</p>
          <pre className="mt-2 overflow-x-auto rounded-2xl bg-slate-950/80 p-4 text-sm text-slate-200">
            {errorSample}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default CodeReference
