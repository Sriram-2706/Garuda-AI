function TopFilesTable({ files }) {
  const safeFiles = Array.isArray(files) ? files : []

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/40">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-100">Top files</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Path</th>
              <th className="px-5 py-3 font-medium">Extension</th>
              <th className="px-5 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {safeFiles.length > 0 ? (
              safeFiles.map((file, index) => (
                <tr key={`${file.path || 'file'}-${index}`} className="text-slate-300 hover:bg-slate-950/70">
                  <td className="px-5 py-3">{file.path || 'Unknown path'}</td>
                  <td className="px-5 py-3">{file.extension || '—'}</td>
                  <td className="px-5 py-3">{file.score ?? '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-6 text-slate-400" colSpan="3">
                  No top files were returned by the backend.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopFilesTable
