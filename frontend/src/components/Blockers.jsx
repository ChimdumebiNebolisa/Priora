function Blockers({ blockers }) {
  if (!blockers?.length) return null
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">Active blockers</h2>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-red-800">
        {blockers.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </section>
  )
}

export default Blockers
