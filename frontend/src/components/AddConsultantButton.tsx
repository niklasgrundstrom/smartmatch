import { useRef, useState } from 'react'
import { addConsultant } from '../api/client'

type Status = 'idle' | 'loading' | 'done' | 'error'

export function AddConsultantButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [addedName, setAddedName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setStatus('loading')
    try {
      const consultant = await addConsultant(file)
      setAddedName(consultant.name)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      <button
        className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors cursor-pointer disabled:cursor-not-allowed ${
          status === 'done'
            ? 'border-green-300 bg-green-50 text-green-700'
            : status === 'error'
            ? 'border-red-300 bg-red-50 text-red-700'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}
        onClick={() => fileRef.current?.click()}
        disabled={status === 'loading'}
      >
        {status === 'loading' && 'Extracting CV…'}
        {status === 'done' && `✓ ${addedName} added`}
        {status === 'error' && 'Upload failed — try again'}
        {status === 'idle' && '+ Add CV'}
      </button>
    </>
  )
}
