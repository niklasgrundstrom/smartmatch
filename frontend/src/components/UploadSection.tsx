import { useRef, useState } from 'react'

interface Props {
  onSubmit: (text: string, file?: File) => void
  loading: boolean
}

export function UploadSection({ onSubmit, loading }: Props) {
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    setPendingFile(file)
    setText('')
  }

  function handleSubmit() {
    if (pendingFile) {
      onSubmit('', pendingFile)
    } else if (text.trim()) {
      onSubmit(text.trim())
    }
  }

  const canSubmit = !loading && (!!text.trim() || !!pendingFile)

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full h-40 rounded-xl border border-gray-200 p-4 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:bg-gray-50"
        placeholder="Paste the consultant request here… e.g. 'Vi behöver en senior Python-utvecklare med erfarenhet av BI och energisektorn'"
        value={text}
        onChange={e => {
          setText(e.target.value)
          setFileName('')
          setPendingFile(undefined)
        }}
        disabled={loading}
      />

      <div className="flex items-center gap-3">
        <div
          className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          {fileName ? (
            <p className="text-sm text-blue-600 font-medium">{fileName}</p>
          ) : (
            <p className="text-sm text-gray-400">
              <span className="font-medium text-gray-500">Upload file</span> — PDF or Word (.docx)
            </p>
          )}
        </div>

        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {loading ? 'Finding matches…' : 'Find matches'}
        </button>
      </div>
    </div>
  )
}
