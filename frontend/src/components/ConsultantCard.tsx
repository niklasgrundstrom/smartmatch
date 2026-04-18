import type { ConsultantMatch } from '../api/client'
import { SkillBadge } from './SkillBadge'

interface Props {
  match: ConsultantMatch
  rank: number
  onClick?: (match: ConsultantMatch) => void
}

export function ConsultantCard({ match, rank, onClick }: Props) {
  const scoreColor =
    match.matchScore >= 80
      ? 'text-green-700 bg-green-50 border-green-300'
      : match.matchScore >= 60
      ? 'text-yellow-700 bg-yellow-50 border-yellow-300'
      : 'text-red-700 bg-red-50 border-red-300'

  const summary = match.profile_summary?.length > 80
    ? match.profile_summary.slice(0, 80) + '…'
    : match.profile_summary

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-shadow"
      onClick={() => onClick?.(match)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(match)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {rank}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{match.name}</h3>
            {summary && <p className="text-sm text-gray-500 truncate">{summary}</p>}
          </div>
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

      <div className="flex flex-col gap-2">
        {(match.matchedSkills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(match.matchedSkills ?? []).map(skill => (
              <SkillBadge key={skill} skill={skill} matched />
            ))}
          </div>
        )}
        {(match.missingSkills ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(match.missingSkills ?? []).map(skill => (
              <SkillBadge key={skill} skill={skill} matched={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
