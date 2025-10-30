import { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { RadioStation, Config } from './types'
import StationList from './components/StationList'
import PlayerControls from './components/PlayerControls'
import VolumeControl from './components/VolumeControl'

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const soundRef = useRef<Howl | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    // Update Howler global volume when volume state changes
    if (soundRef.current) {
      soundRef.current.volume(volume)
    }
  }, [volume])

  const loadConfig = async () => {
    try {
      const data = await window.electronAPI.config.read()
      setConfig(data)
      setVolume(data.settings.volume)

      // Load last played station if available
      if (data.settings.lastStation) {
        const lastStation = data.stations.find(s => s.id === data.settings.lastStation)
        if (lastStation) {
          setCurrentStation(lastStation)
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      await window.electronAPI.dialog.showError('Error', 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (updates: Partial<Config['settings']>) => {
    if (!config) return

    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        ...updates
      }
    }

    try {
      await window.electronAPI.config.write(updatedConfig)
      setConfig(updatedConfig)
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const handleStationSelect = (station: RadioStation) => {
    // Stop current playback before switching
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }

    setCurrentStation(station)
    setIsPlaying(false)
    saveConfig({ lastStation: station.id })
  }

  const handlePlay = () => {
    if (!currentStation) return

    try {
      // Create new Howl instance for the stream
      soundRef.current = new Howl({
        src: [currentStation.url],
        html5: true, // Enable streaming mode
        format: ['mp3', 'aac'],
        volume: volume,
        onloaderror: (_id, error) => {
          console.error('Stream load error:', error)
          window.electronAPI.dialog.showError(
            'Playback Error',
            `Failed to load stream: ${currentStation.name}`
          )
          setIsPlaying(false)
        },
        onplayerror: (_id, error) => {
          console.error('Stream play error:', error)
          window.electronAPI.dialog.showError(
            'Playback Error',
            `Failed to play stream: ${currentStation.name}`
          )
          setIsPlaying(false)
        }
      })

      soundRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Failed to start playback:', error)
      window.electronAPI.dialog.showError('Error', 'Failed to start playback')
    }
  }

  const handleStop = () => {
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }
    setIsPlaying(false)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    saveConfig({ volume: newVolume })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Streamint</h1>
          <p className="text-gray-400">Web Radio Streaming</p>
        </header>

        <div className="space-y-4">
          <PlayerControls
            currentStation={currentStation}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={handleStop}
          />

          <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />

          <StationList
            stations={config?.stations || []}
            currentStation={currentStation}
            onStationSelect={handleStationSelect}
          />
        </div>
      </div>
    </div>
  )
}

export default App
