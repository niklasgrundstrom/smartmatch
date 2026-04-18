import type { ConsultantMatch, DetailResponse, RequirementRating } from '../api/client'

interface Props {
  match: ConsultantMatch
  detail: DetailResponse | null
  loading: boolean
  onBack: () => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </span>
  )
}

function RequirementRow({ item }: { item: RequirementRating }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="flex-1 text-sm text-gray-700">{item.requirement}</span>
      <StarRating rating={item.rating} />
      <span className="text-xs text-gray-400 italic flex-[2] text-right">{item.rationale}</span>
    </div>
  )
}

export function ConsultantDetailView({ match, detail, loading, onBack }: Props) {
  const scoreColor =
    match.matchScore >= 80
      ? 'text-green-700 bg-green-50 border-green-300'
      : match.matchScore >= 60
      ? 'text-yellow-700 bg-yellow-50 border-yellow-300'
      : 'text-red-700 bg-red-50 border-red-300'

  return (
    <div className="flex flex-col gap-6">
      <button
        className="self-start text-sm text-blue-600 hover:underline cursor-pointer"
        onClick={onBack}
      >
        ← Back to results
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{match.name}</h2>
            {match.profile_summary && (
              <p className="text-sm text-gray-500 mt-1">{match.profile_summary}</p>
            )}
          </div>
          <div
            className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 font-bold text-xl ${scoreColor}`}
          >
            {match.matchScore}%
          </div>
        </div>

        {match.explanation && (
          <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
            {match.explanation}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Requirements Analysis
        </p>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Generating requirements analysis…</span>
          </div>
        )}

        {!loading && detail && (
          <div className="flex flex-col gap-6">
            {detail.must_haves.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Skall-krav
                </p>
                <div>
                  {detail.must_haves.map((item, i) => (
                    <RequirementRow key={i} item={item} />
                  ))}
                </div>
              </div>
            )}

            {detail.nice_to_haves.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Bör-krav
                </p>
                <div>
                  {detail.nice_to_haves.map((item, i) => (
                    <RequirementRow key={i} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
