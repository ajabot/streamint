import { useState, useEffect } from 'react'

interface RadioStation {
  id: string
  name: string
  url: string
  favorite: boolean
}

interface Config {
  version: string
  stations: RadioStation[]
  settings: {
    volume: number
    lastStation: string | null
  }
}

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await window.electronAPI.config.read()
      setConfig(data)
    } catch (error) {
      console.error('Failed to load config:', error)
      await window.electronAPI.dialog.showError('Error', 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Streamint</h1>
          <p className="text-gray-400">Web Radio Streaming</p>
        </header>

        <div className="space-y-4">
          {config && config.stations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400 mb-4">No radio stations configured yet.</p>
              <p className="text-sm text-gray-500">
                Add stations to ~/.streamint/config.json
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <p>Stations will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
