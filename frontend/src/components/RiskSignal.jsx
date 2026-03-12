function RiskSignal({ riskSignal }) {
  if (!riskSignal) return null
  const level = String(riskSignal).toLowerCase()
  const styles = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  }
  const cls = styles[level] ?? 'bg-gray-100 text-gray-800 border-gray-300'
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Risk signal</h2>
      <p className="mt-2">
        <span className={`inline-block rounded border px-3 py-1 text-sm font-medium capitalize ${cls}`}>
          {level}
        </span>
      </p>
    </section>
  )
}

export default RiskSignal
