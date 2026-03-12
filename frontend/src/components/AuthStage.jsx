function AuthStage({ stages, currentStageIndex }) {
  if (!stages?.length) return null
  const idx = currentStageIndex ?? 0
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Authorization stage</h2>
      <div className="mt-3 flex items-center gap-1" role="progressbar" aria-valuenow={idx + 1} aria-valuemin={1} aria-valuemax={stages.length}>
        {stages.map((stage, i) => (
          <div
            key={i}
            className={`flex-1 rounded py-2 text-center text-xs font-medium ${
              i < idx ? 'bg-green-100 text-green-800' : i === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {i + 1}. {stage}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-600">Current: {stages[idx]} ({idx + 1} of {stages.length})</p>
    </section>
  )
}

export default AuthStage
