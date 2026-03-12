function NextAction({ nextAction }) {
  if (!nextAction) return null
  return (
    <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Next action</h2>
      <p className="mt-2 text-base font-medium text-gray-900">{nextAction}</p>
    </section>
  )
}

export default NextAction
