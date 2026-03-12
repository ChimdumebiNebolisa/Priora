function CaseSummary({ aiSummary }) {
  if (!aiSummary) return null
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Case summary</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{aiSummary}</p>
    </section>
  )
}

export default CaseSummary
