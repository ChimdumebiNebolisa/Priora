function Timeline({ timeline }) {
  if (!timeline?.length) return null
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Timeline</h2>
      <ul className="mt-2 space-y-2">
        {timeline.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="shrink-0 font-medium text-gray-600">{item.date}</span>
            <span className="text-gray-800">{item.event}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Timeline
