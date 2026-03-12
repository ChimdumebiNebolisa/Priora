function PatientSnapshot({ patient, procedure }) {
  if (!patient) return null
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Patient snapshot</h2>
      <dl className="mt-2 grid gap-1 text-sm">
        <div><dt className="inline font-medium text-gray-700">Name:</dt><dd className="inline ml-1 text-gray-900">{patient.name}</dd></div>
        <div><dt className="inline font-medium text-gray-700">DOB:</dt><dd className="inline ml-1 text-gray-900">{patient.dob}</dd></div>
        <div><dt className="inline font-medium text-gray-700">MRN:</dt><dd className="inline ml-1 text-gray-900">{patient.mrn}</dd></div>
        <div><dt className="inline font-medium text-gray-700">Insurance:</dt><dd className="inline ml-1 text-gray-900">{patient.insurance}</dd></div>
        <div><dt className="inline font-medium text-gray-700">Ordering physician:</dt><dd className="inline ml-1 text-gray-900">{patient.ordering_physician}</dd></div>
        {procedure && (
          <div><dt className="inline font-medium text-gray-700">Procedure:</dt><dd className="inline ml-1 text-gray-900">{procedure.description} (CPT {procedure.cpt})</dd></div>
        )}
      </dl>
    </section>
  )
}

export default PatientSnapshot
