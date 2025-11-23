import { useState } from 'react'

interface AddStationFormProps {
  onSave: (name: string, url: string) => void
  onCancel: () => void
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function AddStationForm({ onSave, onCancel }: AddStationFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

  const validate = (): boolean => {
    const newErrors: { name?: string; url?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Station name is required'
    }

    if (!url.trim()) {
      newErrors.url = 'Stream URL is required'
    } else if (!isValidUrl(url.trim())) {
      newErrors.url = 'Please enter a valid URL (http:// or https://)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(name.trim(), url.trim())
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Station</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Station Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jazz FM"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Stream URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/stream.mp3"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                errors.url ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.url && (
              <p className="mt-1.5 text-sm text-red-400">{errors.url}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
            >
              Save Station
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
