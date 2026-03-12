function RequirementsChecklist({ payerRequirements }) {
  if (!payerRequirements?.length) return null
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Payer requirements</h2>
      <ul className="mt-2 space-y-2">
        {payerRequirements.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            {item.complete ? (
              <span className="text-green-600" aria-label="Complete">✓</span>
            ) : (
              <span className="text-red-600" aria-label="Missing">✗</span>
            )}
            <span className={item.complete ? 'text-gray-700' : 'text-gray-900 font-medium'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RequirementsChecklist
