import { useState, useEffect } from 'react'
import PatientSnapshot from './components/PatientSnapshot'
import AuthStage from './components/AuthStage'
import RequirementsChecklist from './components/RequirementsChecklist'
import Blockers from './components/Blockers'
import CaseSummary from './components/CaseSummary'
import NextAction from './components/NextAction'
import Timeline from './components/Timeline'
import RiskSignal from './components/RiskSignal'
import VoiceButton from './components/VoiceButton'

function App() {
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/case')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        setCaseData(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen bg-gray-50 p-8">Loading...</div>
  if (error) return <div className="min-h-screen bg-gray-50 p-8 text-red-600">Error: {error}</div>
  if (!caseData) return null

  const { patient, procedure, auth_episode, payer_requirements, blockers, next_action, ai_summary, timeline, risk_signal, stages } = caseData

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Priora</h1>
        <VoiceButton />
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <PatientSnapshot patient={patient} procedure={procedure} />
        <AuthStage stages={stages} currentStageIndex={auth_episode?.current_stage_index} />
        <RequirementsChecklist payerRequirements={payer_requirements} />
        <Blockers blockers={blockers} />
        <CaseSummary aiSummary={ai_summary} />
        <NextAction nextAction={next_action} />
        <Timeline timeline={timeline} />
        <RiskSignal riskSignal={risk_signal} />
      </div>
    </div>
  )
}

export default App
