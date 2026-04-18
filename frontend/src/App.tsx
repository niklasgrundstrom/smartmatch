import { useState } from 'react'
import { UploadSection } from './components/UploadSection'
import { ConsultantCard } from './components/ConsultantCard'
import { ConsultantDetailView } from './components/ConsultantDetailView'
import { uploadFile, extractCompetences, matchConsultants, fetchDetail } from './api/client'
import type { ConsultantMatch, ExtractResponse, DetailResponse } from './api/client'

type Stage = 'idle' | 'loading' | 'results' | 'error' | 'detail'

export default function App() {
  const [stage, setStage] = useState<Stage>('idle')
  const [matches, setMatches] = useState<ConsultantMatch[]>([])
  const [extracted, setExtracted] = useState<ExtractResponse | null>(null)
  const [error, setError] = useState('')
  const [requestText, setRequestText] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<ConsultantMatch | null>(null)
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function handleSubmit(text: string, file?: File) {
    setStage('loading')
    setError('')
    try {
      let rawText = text
      if (file) {
        rawText = await uploadFile(file)
      }
      setRequestText(rawText)
      const ext = await extractCompetences(rawText)
      setExtracted(ext)
      const result = await matchConsultants(ext.competences, ext.roles)
      setMatches(result.matches)
      setStage('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStage('error')
    }
  }

  async function handleSelectConsultant(match: ConsultantMatch) {
    setSelectedMatch(match)
    setDetail(null)
    setStage('detail')
    setDetailLoading(true)
    try {
      const result = await fetchDetail(match, requestText)
      setDetail(result)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">SmartMatch</h1>
          <p className="mt-2 text-gray-500 text-lg">AI-powered consultant matching by Rejlers</p>
        </header>

        {stage !== 'detail' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Consultant Request
            </p>
            <UploadSection onSubmit={handleSubmit} loading={stage === 'loading'} />
          </div>
        )}

        {stage === 'loading' && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Analysing request and finding the best consultants…</p>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {stage === 'results' && (
          <div className="flex flex-col gap-4">
            {extracted && extracted.competences.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Extracted:
                </span>
                {extracted.competences.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {matches.length} match{matches.length !== 1 ? 'es' : ''} found
            </p>

            {matches.map((m, i) => (
              <ConsultantCard
                key={m.consultantId}
                match={m}
                rank={i + 1}
                onClick={handleSelectConsultant}
              />
            ))}

            <button
              className="mt-2 text-sm text-blue-600 hover:underline self-center cursor-pointer"
              onClick={() => { setStage('idle'); setMatches([]); setExtracted(null) }}
            >
              ← Start over
            </button>
          </div>
        )}

        {stage === 'detail' && selectedMatch && (
          <ConsultantDetailView
            match={selectedMatch}
            detail={detail}
            loading={detailLoading}
            onBack={() => setStage('results')}
          />
        )}
      </div>
    </div>
  )
}
