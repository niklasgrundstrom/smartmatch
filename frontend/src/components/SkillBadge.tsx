interface Props {
  skill: string
  matched: boolean
}

export function SkillBadge({ skill, matched }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        matched
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {matched ? '✓' : '✗'} {skill}
    </span>
  )
}
