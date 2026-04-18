const API_URL = ''

export interface ExtractResponse {
  competences: string[]
  roles: string[]
  industries: string[]
  languages: string[]
}

export interface ConsultantMatch {
  consultantId: string
  name: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  explanation: string
  profile_summary: string
}

export interface MatchResponse {
  matches: ConsultantMatch[]
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('File upload failed')
  const data = await res.json()
  return data.text
}

export async function extractCompetences(text: string): Promise<ExtractResponse> {
  const res = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('Extraction failed')
  return res.json()
}

export async function matchConsultants(
  competences: string[],
  roles: string[]
): Promise<MatchResponse> {
  const res = await fetch(`${API_URL}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competences, roles }),
  })
  if (!res.ok) throw new Error('Matching failed')
  return res.json()
}
